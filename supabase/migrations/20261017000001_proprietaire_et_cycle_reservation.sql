-- ============================================================
-- MIGRATION : Gestion des Propriétaires et du Cycle de Réservation
-- 1. Informations de contact propriétaire confidentielles (réservées admin)
-- 2. Statuts de réservation complets et délai de paiement 24h
-- 3. Procédures stockées sécurisées (Validation, Refus avec motif, Annulation, Expiration)
-- ============================================================

-- 1. Table confidentielle pour les coordonnées des propriétaires
CREATE TABLE IF NOT EXISTS public.logement_proprietaires (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  logement_id UUID REFERENCES public.logements(id) ON DELETE CASCADE NOT NULL UNIQUE,
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  telephone TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Sécurité RLS stricte : réservé exclusivement aux administrateurs
ALTER TABLE public.logement_proprietaires ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins only read logement_proprietaires" ON public.logement_proprietaires;
CREATE POLICY "Admins only read logement_proprietaires" ON public.logement_proprietaires
  FOR SELECT USING (public.is_admin_or_super(auth.uid()));

DROP POLICY IF EXISTS "Admins only insert logement_proprietaires" ON public.logement_proprietaires;
CREATE POLICY "Admins only insert logement_proprietaires" ON public.logement_proprietaires
  FOR INSERT WITH CHECK (public.is_admin_or_super(auth.uid()));

DROP POLICY IF EXISTS "Admins only update logement_proprietaires" ON public.logement_proprietaires;
CREATE POLICY "Admins only update logement_proprietaires" ON public.logement_proprietaires
  FOR UPDATE USING (public.is_admin_or_super(auth.uid()));

DROP POLICY IF EXISTS "Admins only delete logement_proprietaires" ON public.logement_proprietaires;
CREATE POLICY "Admins only delete logement_proprietaires" ON public.logement_proprietaires
  FOR DELETE USING (public.is_admin_or_super(auth.uid()));

-- 2. Évolution du type ENUM reservation_statut
ALTER TYPE public.reservation_statut ADD VALUE IF NOT EXISTS 'en_attente_confirmation';
ALTER TYPE public.reservation_statut ADD VALUE IF NOT EXISTS 'confirmee_paiement_en_attente';
ALTER TYPE public.reservation_statut ADD VALUE IF NOT EXISTS 'payee';
ALTER TYPE public.reservation_statut ADD VALUE IF NOT EXISTS 'refusee';
ALTER TYPE public.reservation_statut ADD VALUE IF NOT EXISTS 'annulee_utilisateur';
ALTER TYPE public.reservation_statut ADD VALUE IF NOT EXISTS 'expiree';

-- 3. Nouvelles colonnes sur la table reservations
ALTER TABLE public.reservations ADD COLUMN IF NOT EXISTS date_validation TIMESTAMPTZ;
ALTER TABLE public.reservations ADD COLUMN IF NOT EXISTS date_expiration TIMESTAMPTZ;
ALTER TABLE public.reservations ADD COLUMN IF NOT EXISTS motif_refus TEXT;

-- 4. Fonction trigger d'intégrité de réservation mise à jour
CREATE OR REPLACE FUNCTION public.enforce_reservation_integrity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_chambre RECORD;
  v_logement RECORD;
BEGIN
  -- A. Récupérer la chambre ciblée
  SELECT id, logement_id, prix_zeyna, prix_bailleur, caution, est_disponible
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

  -- D. Vérifier la disponibilité de la chambre
  IF NOT v_chambre.est_disponible AND (NEW.statut = 'en_attente' OR NEW.statut = 'en_attente_confirmation') THEN
    RAISE EXCEPTION 'Cette chambre n''est actuellement plus disponible.';
  END IF;

  -- E. Forcer le calcul du montant total côté serveur (Prix ZEYNA + Caution)
  NEW.montant_total := COALESCE(v_chambre.prix_zeyna, v_chambre.prix_bailleur, 0) + COALESCE(v_chambre.caution, 0);

  -- F. Pour tout utilisateur non-administrateur, forcer le statut initial en 'en_attente_confirmation'
  IF NOT public.is_admin_or_super(auth.uid()) THEN
    NEW.statut := 'en_attente_confirmation';
  END IF;

  RETURN NEW;
END;
$$;

-- 5. Procédure pour expirer automatiquement les réservations dont le délai de 24h est dépassé
CREATE OR REPLACE FUNCTION public.verifier_et_expirer_reservations()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE public.reservations
  SET statut = 'expiree', updated_at = now()
  WHERE (statut = 'confirmee_paiement_en_attente' OR (statut = 'confirmee' AND date_expiration IS NOT NULL))
    AND date_expiration < now();

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- 6. Validation d'une réservation par l'administrateur avec démarrage du délai 24h
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
BEGIN
  -- A. Contrôle administrateur
  IF NOT public.is_admin_or_super(auth.uid()) THEN
    RAISE EXCEPTION 'Action non autorisée : droits administrateur requis.';
  END IF;

  -- B. Verrouiller la réservation
  SELECT id, chambre_id, statut INTO v_res
  FROM public.reservations
  WHERE id = p_reservation_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Réservation introuvable.';
  END IF;

  IF v_res.statut IN ('payee', 'refusee', 'annulee_utilisateur', 'expiree', 'annulee') THEN
    RAISE EXCEPTION 'Impossible de valider une réservation qui est déjà dans le statut : %', v_res.statut;
  END IF;

  -- C. Vérifier que la chambre est toujours disponible
  SELECT id, est_disponible INTO v_chambre
  FROM public.chambres
  WHERE id = v_res.chambre_id;

  IF NOT FOUND OR NOT v_chambre.est_disponible THEN
    RAISE EXCEPTION 'Cette chambre n''est plus disponible.';
  END IF;

  -- D. Définir le délai de 24 heures strict
  v_expire_at := now() + INTERVAL '24 hours';

  UPDATE public.reservations
  SET
    statut = 'confirmee_paiement_en_attente',
    date_validation = now(),
    date_expiration = v_expire_at,
    updated_at = now()
  WHERE id = p_reservation_id;

  RETURN jsonb_build_object(
    'success', true,
    'reservation_id', p_reservation_id,
    'statut', 'confirmee_paiement_en_attente',
    'date_validation', now(),
    'date_expiration', v_expire_at
  );
END;
$$;

-- 7. Refus d'une réservation par l'administrateur avec motif obligatoire
CREATE OR REPLACE FUNCTION public.refuser_reservation_admin(
  p_reservation_id UUID,
  p_motif TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_res RECORD;
BEGIN
  -- A. Contrôle administrateur
  IF NOT public.is_admin_or_super(auth.uid()) THEN
    RAISE EXCEPTION 'Action non autorisée : droits administrateur requis.';
  END IF;

  -- B. Contrôle du motif
  IF p_motif IS NULL OR trim(p_motif) = '' THEN
    RAISE EXCEPTION 'Le motif du refus est obligatoire.';
  END IF;

  -- C. Verrouiller la réservation
  SELECT id, statut INTO v_res
  FROM public.reservations
  WHERE id = p_reservation_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Réservation introuvable.';
  END IF;

  IF v_res.statut = 'payee' THEN
    RAISE EXCEPTION 'Impossible de refuser une réservation déjà payée.';
  END IF;

  UPDATE public.reservations
  SET
    statut = 'refusee',
    motif_refus = trim(p_motif),
    updated_at = now()
  WHERE id = p_reservation_id;

  RETURN jsonb_build_object(
    'success', true,
    'reservation_id', p_reservation_id,
    'statut', 'refusee',
    'motif_refus', trim(p_motif)
  );
END;
$$;

-- 8. Annulation d'une réservation par l'utilisateur
CREATE OR REPLACE FUNCTION public.annuler_reservation_etudiant(p_reservation_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_res RECORD;
BEGIN
  -- A. Récupérer la réservation
  SELECT id, etudiant_id, statut INTO v_res
  FROM public.reservations
  WHERE id = p_reservation_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Réservation introuvable.';
  END IF;

  -- B. Contrôle d'accès : seul l'étudiant propriétaire ou un admin peut annuler
  IF v_res.etudiant_id <> auth.uid() AND NOT public.is_admin_or_super(auth.uid()) THEN
    RAISE EXCEPTION 'Action non autorisée : vous ne pouvez annuler que vos propres réservations.';
  END IF;

  IF v_res.statut = 'payee' THEN
    RAISE EXCEPTION 'Cette réservation est déjà payée et ne peut pas être annulée directement.';
  END IF;

  IF v_res.statut IN ('annulee_utilisateur', 'refusee', 'expiree', 'annulee') THEN
    RAISE EXCEPTION 'Cette réservation est déjà clôturée (%s).', v_res.statut;
  END IF;

  UPDATE public.reservations
  SET
    statut = 'annulee_utilisateur',
    updated_at = now()
  WHERE id = p_reservation_id;

  RETURN jsonb_build_object(
    'success', true,
    'reservation_id', p_reservation_id,
    'statut', 'annulee_utilisateur'
  );
END;
$$;

-- 9. Mise à jour de confirm_payment_and_assign_room pour gérer le cycle complet et la concurrence
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
BEGIN
  -- 1. Contrôle administrateur
  IF NOT public.is_admin_or_super(auth.uid()) THEN
    RAISE EXCEPTION 'Action non autorisée : droits administrateur requis.';
  END IF;

  -- 2. Expirer d'abord toute réservation dont le délai est passé
  PERFORM public.verifier_et_expirer_reservations();

  -- 3. Verrouiller la réservation
  SELECT id, chambre_id, etudiant_id, statut, date_expiration
  INTO v_res
  FROM public.reservations
  WHERE id = p_reservation_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Réservation introuvable (id: %)', p_reservation_id;
  END IF;

  IF v_res.statut = 'payee' OR v_res.statut = 'confirmee' THEN
    RAISE EXCEPTION 'Cette réservation est déjà confirmée et payée.';
  END IF;

  IF v_res.statut = 'expiree' THEN
    RAISE EXCEPTION 'Cette réservation a expiré (délai de 24h dépassé). Paiement impossible.';
  END IF;

  IF v_res.statut IN ('refusee', 'annulee_utilisateur', 'annulee') THEN
    RAISE EXCEPTION 'Paiement impossible : la réservation est dans le statut %', v_res.statut;
  END IF;

  -- 4. Verrouiller la chambre correspondante
  SELECT id, est_disponible
  INTO v_chambre
  FROM public.chambres
  WHERE id = v_res.chambre_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Chambre introuvable (id: %)', v_res.chambre_id;
  END IF;

  -- Règle stricte du Premier Arrivé, Premier Servi
  IF NOT v_chambre.est_disponible THEN
    RAISE EXCEPTION 'Cette chambre n''est plus disponible (déjà attribuée à un autre locataire).';
  END IF;

  -- 5. Confirmer le paiement
  UPDATE public.paiements
  SET est_confirme = true
  WHERE id = p_payment_id;

  -- 6. Passer la réservation au statut 'payee' (ou 'confirmee' pour rétrocompatibilité)
  UPDATE public.reservations
  SET statut = 'payee', updated_at = now()
  WHERE id = p_reservation_id;

  -- 7. Marquer immédiatement la chambre comme occupée
  UPDATE public.chambres
  SET est_disponible = false, updated_at = now()
  WHERE id = v_res.chambre_id;

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
      'chambre', p_room_name
    )
  )
  RETURNING id INTO v_contrat_id;

  RETURN jsonb_build_object(
    'success', true,
    'payment_id', p_payment_id,
    'reservation_id', p_reservation_id,
    'chambre_id', v_res.chambre_id,
    'contrat_id', v_contrat_id
  );
END;
$$;
