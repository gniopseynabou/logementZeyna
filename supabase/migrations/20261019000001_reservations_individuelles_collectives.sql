-- ==============================================================================
-- MIGRATION : Réservations individuelles et collectives pour logements partagés
-- Prise en charge des prix par personne, calculs de capacité et concurrence
-- ==============================================================================

-- 1. Mode de réservation autorisé au niveau de la chambre / unité :
-- 'individuel' : chaque utilisateur peut réserver 1 à N places disponibles
-- 'collectif'  : un utilisateur réserve obligatoirement la totalité des places du groupe
ALTER TABLE public.chambres 
  ADD COLUMN IF NOT EXISTS mode_reservation TEXT NOT NULL DEFAULT 'individuel' 
  CHECK (mode_reservation IN ('individuel', 'collectif'));

-- Indique si la tarification est par personne ou pour la chambre entière (prix fixe rétrocompatible)
ALTER TABLE public.chambres 
  ADD COLUMN IF NOT EXISTS tarification_par_personne BOOLEAN NOT NULL DEFAULT false;

-- 2. Nombre de places demandées / réservées et type de réservation sur la table reservations
ALTER TABLE public.reservations 
  ADD COLUMN IF NOT EXISTS nombre_places INTEGER NOT NULL DEFAULT 1 CHECK (nombre_places >= 1);

ALTER TABLE public.reservations 
  ADD COLUMN IF NOT EXISTS type_reservation TEXT NOT NULL DEFAULT 'individuel' 
  CHECK (type_reservation IN ('individuel', 'collectif'));

-- Index pour optimiser les requêtes de chevauchement temporel et calcul de capacité
CREATE INDEX IF NOT EXISTS idx_reservations_chambre_dates 
  ON public.reservations(chambre_id, date_debut, date_fin, statut);

-- 3. Fonction sécurisée pour calculer les places actuellement occupées ou réservées pour une période donnée
-- Remarque : Les réservations 'en_attente' et 'en_attente_confirmation' NE bloquent PAS les places
-- Seules les réservations validées ('confirmee_paiement_en_attente', 'confirmee', 'payee') bloquent des places.
CREATE OR REPLACE FUNCTION public.calculer_places_occupees(
  p_chambre_id UUID,
  p_date_debut DATE,
  p_date_fin DATE,
  p_exclude_reservation_id UUID DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_places INTEGER := 0;
BEGIN
  -- Nettoyage automatique des réservations 24h expirées avant calcul
  -- (sera exécuté de manière transparente si possible)
  SELECT COALESCE(SUM(r.nombre_places), 0)
  INTO v_places
  FROM public.reservations r
  WHERE r.chambre_id = p_chambre_id
    AND (p_exclude_reservation_id IS NULL OR r.id <> p_exclude_reservation_id)
    AND r.statut IN ('confirmee_paiement_en_attente', 'confirmee', 'payee')
    AND (
      -- Chevauchement temporel si dates spécifiées
      (p_date_debut IS NULL OR p_date_fin IS NULL)
      OR
      (
        r.date_debut <= p_date_fin 
        AND COALESCE(r.date_fin, '9999-12-31'::date) >= p_date_debut
      )
    );

  RETURN v_places;
END;
$$;

-- 4. Fonction pour obtenir la capacité restante disponible d'une chambre sur une période
CREATE OR REPLACE FUNCTION public.get_chambre_disponibilite_places(
  p_chambre_id UUID,
  p_date_debut DATE DEFAULT CURRENT_DATE,
  p_date_fin DATE DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_chambre RECORD;
  v_places_occupees INTEGER;
  v_places_disponibles INTEGER;
  v_effective_fin DATE;
BEGIN
  SELECT id, nom, nombre_personnes, prix_zeyna, prix_bailleur, caution, 
         mode_reservation, tarification_par_personne, est_disponible
  INTO v_chambre
  FROM public.chambres
  WHERE id = p_chambre_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Chambre introuvable');
  END IF;

  IF NOT v_chambre.est_disponible THEN
    RETURN jsonb_build_object(
      'chambre_id', p_chambre_id,
      'est_disponible', false,
      'capacite_totale', v_chambre.nombre_personnes,
      'places_occupees', v_chambre.nombre_personnes,
      'places_disponibles', 0,
      'mode_reservation', v_chambre.mode_reservation,
      'tarification_par_personne', v_chambre.tarification_par_personne
    );
  END IF;

  v_effective_fin := COALESCE(p_date_fin, p_date_debut + INTERVAL '30 days');
  v_places_occupees := public.calculer_places_occupees(p_chambre_id, p_date_debut, v_effective_fin);
  v_places_disponibles := GREATEST(0, v_chambre.nombre_personnes - v_places_occupees);

  RETURN jsonb_build_object(
    'chambre_id', p_chambre_id,
    'est_disponible', (v_places_disponibles > 0),
    'capacite_totale', v_chambre.nombre_personnes,
    'places_occupees', v_places_occupees,
    'places_disponibles', v_places_disponibles,
    'mode_reservation', v_chambre.mode_reservation,
    'tarification_par_personne', v_chambre.tarification_par_personne
  );
END;
$$;

-- 5. Trigger d'intégrité de réservation amélioré pour supporter places & modes
CREATE OR REPLACE FUNCTION public.enforce_reservation_integrity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_chambre RECORD;
  v_logement RECORD;
  v_places_occupees INTEGER;
  v_places_demandees INTEGER;
  v_prix_unitaire NUMERIC;
  v_caution_unitaire NUMERIC;
BEGIN
  -- A. Récupérer la chambre ciblée
  SELECT id, logement_id, prix_zeyna, prix_bailleur, caution, est_disponible,
         nombre_personnes, mode_reservation, tarification_par_personne
  INTO v_chambre
  FROM public.chambres
  WHERE id = NEW.chambre_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Chambre introuvable (id: %)', NEW.chambre_id;
  END IF;

  -- B. Vérifier que la chambre appartient bien au logement spécifié
  IF v_chambre.logement_id <> NEW.logement_id THEN
    RAISE EXCEPTION 'Incohérence : la chambre % n''appartient pas au logement %', NEW.chambre_id, NEW.logement_id;
  END IF;

  -- C. Vérifier que le logement est validé et actif
  SELECT id, statut INTO v_logement
  FROM public.logements
  WHERE id = NEW.logement_id;

  IF NOT FOUND OR v_logement.statut <> 'valide' THEN
    RAISE EXCEPTION 'Ce logement n''est pas disponible à la location.';
  END IF;

  -- D. Forcer le type de réservation selon la configuration de la chambre
  NEW.type_reservation := COALESCE(v_chambre.mode_reservation, 'individuel');

  -- E. Ajuster et valider le nombre de places demandées
  IF v_chambre.mode_reservation = 'collectif' THEN
    -- En mode collectif, la réservation porte obligatoirement sur l'intégralité des places
    NEW.nombre_places := v_chambre.nombre_personnes;
  ELSE
    -- En mode individuel, s'assurer que nombre_places est entre 1 et la capacité max
    IF NEW.nombre_places IS NULL OR NEW.nombre_places < 1 THEN
      NEW.nombre_places := 1;
    END IF;
    IF NEW.nombre_places > v_chambre.nombre_personnes THEN
      RAISE EXCEPTION 'Le nombre de places demandées (%) dépasse la capacité totale du logement (%).', 
        NEW.nombre_places, v_chambre.nombre_personnes;
    END IF;
  END IF;

  -- F. Calcul du montant total côté serveur (Caution / Dépôt de garantie)
  -- RÈGLE MÉTIER STRICTE : Le montant total à régler immédiatement après validation de la réservation
  -- est UNIQUEMENT la caution (dépôt de garantie). Le loyer mensuel sera réglé ultérieurement à l'entrée.
  -- Si tarification_par_personne = true : Caution/pers * nombre_places
  -- Si tarification_par_personne = false : Caution totale de la chambre
  v_caution_unitaire := COALESCE(v_chambre.caution, 0);

  IF v_chambre.tarification_par_personne THEN
    NEW.montant_total := v_caution_unitaire * NEW.nombre_places;
  ELSE
    NEW.montant_total := v_caution_unitaire;
  END IF;

  -- G. Statut initial pour tout non-administrateur
  IF NOT public.is_admin_or_super(auth.uid()) THEN
    NEW.statut := 'en_attente_confirmation';
  END IF;

  RETURN NEW;
END;
$$;

-- 6. Procédure atomique pour la validation d'une réservation avec verrouillage sécurisé
CREATE OR REPLACE FUNCTION public.valider_reservation_admin(p_reservation_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_res RECORD;
  v_chambre RECORD;
  v_expire_at TIMESTAMPTZ;
  v_places_occupees INTEGER;
  v_places_restantes INTEGER;
  v_places_demandees INTEGER;
BEGIN
  -- A. Contrôle d'accès administrateur
  IF NOT public.is_admin_or_super(auth.uid()) THEN
    RAISE EXCEPTION 'Action non autorisée : droits administrateur requis.';
  END IF;

  -- B. Nettoyer les réservations dont le délai 24h a expiré
  PERFORM public.verifier_et_expirer_reservations();

  -- C. Verrouiller la réservation à valider
  SELECT id, chambre_id, logement_id, statut, nombre_places, type_reservation,
         date_debut, date_fin
  INTO v_res
  FROM public.reservations
  WHERE id = p_reservation_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Réservation introuvable.';
  END IF;

  IF v_res.statut IN ('payee', 'refusee', 'annulee_utilisateur', 'expiree', 'annulee') THEN
    RAISE EXCEPTION 'Impossible de valider une réservation qui est déjà dans le statut : %', v_res.statut;
  END IF;

  -- D. Verrouiller la chambre correspondante pour éviter toute validation concurrente
  SELECT id, nom, nombre_personnes, mode_reservation, est_disponible
  INTO v_chambre
  FROM public.chambres
  WHERE id = v_res.chambre_id
  FOR UPDATE;

  IF NOT FOUND OR NOT v_chambre.est_disponible THEN
    RAISE EXCEPTION 'Ce logement ou cette chambre n''est plus disponible.';
  END IF;

  v_places_demandees := COALESCE(v_res.nombre_places, 1);

  -- E. Contrôle de capacité sur la période avec exclusion de la réservation courante
  v_places_occupees := public.calculer_places_occupees(
    v_res.chambre_id,
    v_res.date_debut,
    COALESCE(v_res.date_fin, v_res.date_debut + INTERVAL '30 days'),
    p_reservation_id
  );
  v_places_restantes := v_chambre.nombre_personnes - v_places_occupees;

  -- En mode collectif : toutes les places doivent être libres (aucune place déjà occupée)
  IF v_res.type_reservation = 'collectif' OR v_chambre.mode_reservation = 'collectif' THEN
    IF v_places_occupees > 0 THEN
      RAISE EXCEPTION 'Impossible de valider la réservation collective : % place(s) sont déjà réservées sur cette période.', v_places_occupees;
    END IF;
  ELSE
    -- En mode individuel : les places restantes doivent suffire
    IF v_places_demandees > v_places_restantes THEN
      RAISE EXCEPTION 'Capacité insuffisante : % place(s) demandée(s) mais seulement % restante(s) disponible(s).',
        v_places_demandees, GREATEST(0, v_places_restantes);
    END IF;
  END IF;

  -- F. Définir le délai strict de 24 heures
  v_expire_at := now() + INTERVAL '24 hours';

  UPDATE public.reservations
  SET
    statut = 'confirmee_paiement_en_attente',
    date_validation = now(),
    date_expiration = v_expire_at,
    updated_at = now()
  WHERE id = p_reservation_id;

  -- Si après cette validation toutes les places sont occupées, on marque temporairement est_disponible = false
  IF (v_places_occupees + v_places_demandees) >= v_chambre.nombre_personnes THEN
    UPDATE public.chambres
    SET est_disponible = false, updated_at = now()
    WHERE id = v_res.chambre_id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'reservation_id', p_reservation_id,
    'statut', 'confirmee_paiement_en_attente',
    'date_validation', now(),
    'date_expiration', v_expire_at,
    'places_reservees', v_places_demandees,
    'places_restantes', GREATEST(0, v_places_restantes - v_places_demandees)
  );
END;
$$;

-- 7. Libération automatique d'une chambre quand une réservation est annulée / refusée / expirée
CREATE OR REPLACE FUNCTION public.liberer_disponibilite_chambre()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_chambre RECORD;
  v_places_occupees INTEGER;
BEGIN
  IF NEW.statut IN ('annulee', 'annulee_utilisateur', 'refusee', 'expiree') 
     AND OLD.statut NOT IN ('annulee', 'annulee_utilisateur', 'refusee', 'expiree') THEN
    
    SELECT id, nombre_personnes INTO v_chambre
    FROM public.chambres
    WHERE id = NEW.chambre_id;

    IF FOUND THEN
      v_places_occupees := public.calculer_places_occupees(
        NEW.chambre_id,
        NEW.date_debut,
        COALESCE(NEW.date_fin, NEW.date_debut + INTERVAL '30 days'),
        NEW.id
      );

      -- S'il reste des places libres, réactiver la disponibilité
      IF v_places_occupees < v_chambre.nombre_personnes THEN
        UPDATE public.chambres
        SET est_disponible = true, updated_at = now()
        WHERE id = NEW.chambre_id;
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_liberer_chambre ON public.reservations;
CREATE TRIGGER trigger_liberer_chambre
  AFTER UPDATE OF statut ON public.reservations
  FOR EACH ROW
  EXECUTE FUNCTION public.liberer_disponibilite_chambre();

-- 8. Mise à jour de confirm_payment_and_assign_room pour gérer les places
CREATE OR REPLACE FUNCTION public.confirm_payment_and_assign_room(
  p_payment_id UUID,
  p_reservation_id UUID,
  p_student_id UUID,
  p_amount NUMERIC,
  p_reference TEXT,
  p_logement_name TEXT,
  p_room_name TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_res RECORD;
  v_chambre RECORD;
  v_contrat_id UUID;
  v_places_occupees INTEGER;
BEGIN
  -- 1. Contrôle administrateur
  IF NOT public.is_admin_or_super(auth.uid()) THEN
    RAISE EXCEPTION 'Action non autorisée : droits administrateur requis.';
  END IF;

  -- 2. Expirer d'abord toute réservation dont le délai est passé
  PERFORM public.verifier_et_expirer_reservations();

  -- 3. Verrouiller la réservation
  SELECT id, chambre_id, etudiant_id, statut, date_expiration, nombre_places, type_reservation,
         date_debut, date_fin
  INTO v_res
  FROM public.reservations
  WHERE id = p_reservation_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Réservation introuvable (id: %)', p_reservation_id;
  END IF;

  IF v_res.statut = 'payee' THEN
    RAISE EXCEPTION 'Cette réservation est déjà confirmée et payée.';
  END IF;

  IF v_res.statut = 'expiree' THEN
    RAISE EXCEPTION 'Cette réservation a expiré (délai de 24h dépassé). Paiement impossible.';
  END IF;

  IF v_res.statut IN ('refusee', 'annulee_utilisateur', 'annulee') THEN
    RAISE EXCEPTION 'Paiement impossible : la réservation est dans le statut %', v_res.statut;
  END IF;

  -- 4. Verrouiller la chambre correspondante
  SELECT id, nombre_personnes, mode_reservation, est_disponible
  INTO v_chambre
  FROM public.chambres
  WHERE id = v_res.chambre_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Chambre introuvable (id: %)', v_res.chambre_id;
  END IF;

  -- 5. Confirmer le paiement
  UPDATE public.paiements
  SET est_confirme = true
  WHERE id = p_payment_id;

  -- 6. Passer la réservation au statut 'payee'
  UPDATE public.reservations
  SET statut = 'payee', updated_at = now()
  WHERE id = p_reservation_id;

  -- 7. Calculer les places occupées définitives
  v_places_occupees := public.calculer_places_occupees(
    v_res.chambre_id,
    v_res.date_debut,
    COALESCE(v_res.date_fin, v_res.date_debut + INTERVAL '30 days')
  );

  -- Si toutes les places sont occupées, marquer la chambre comme non disponible
  IF v_places_occupees >= v_chambre.nombre_personnes THEN
    UPDATE public.chambres
    SET est_disponible = false, updated_at = now()
    WHERE id = v_res.chambre_id;
  END IF;

  -- 8. Créer le contrat officiel
  INSERT INTO public.contrats (etudiant_id, reservation_id, contenu)
  VALUES (
    p_student_id,
    p_reservation_id,
    jsonb_build_object(
      'montant', p_amount,
      'reference', p_reference,
      'date', to_char(now(), 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
      'logement', p_logement_name,
      'chambre', p_room_name,
      'places', v_res.nombre_places,
      'type_reservation', v_res.type_reservation
    )
  )
  RETURNING id INTO v_contrat_id;

  RETURN jsonb_build_object(
    'success', true,
    'payment_id', p_payment_id,
    'reservation_id', p_reservation_id,
    'chambre_id', v_res.chambre_id,
    'contrat_id', v_contrat_id,
    'nombre_places', v_res.nombre_places,
    'places_restantes', GREATEST(0, v_chambre.nombre_personnes - v_places_occupees)
  );
END;
$$;
