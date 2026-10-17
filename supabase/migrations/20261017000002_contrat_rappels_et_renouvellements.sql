-- ============================================================
-- MIGRATION : Gestion des rappels d'échéance et renouvellements de contrat
-- 1. Enrichissement de la table contrats (dates d'échéance et loyer)
-- 2. Table contrat_rappels (traçabilité des rappels manuels)
-- 3. Table contrat_renouvellements (demandes, négociations de tarif, décisions)
-- 4. Table contrat_periodes_historique (traçabilité intégrale des périodes et tarifs)
-- ============================================================

-- 1. Colonnes sur la table contrats
ALTER TABLE public.contrats ADD COLUMN IF NOT EXISTS date_debut DATE;
ALTER TABLE public.contrats ADD COLUMN IF NOT EXISTS date_fin DATE;
ALTER TABLE public.contrats ADD COLUMN IF NOT EXISTS loyer_mensuel INTEGER;
ALTER TABLE public.contrats ADD COLUMN IF NOT EXISTS statut_contrat TEXT NOT NULL DEFAULT 'actif';

-- Initialiser les dates et loyers existants à partir des réservations / contenu JSON
UPDATE public.contrats c
SET
  date_debut = COALESCE(c.date_debut, (SELECT r.date_debut FROM public.reservations r WHERE r.id = c.reservation_id), CURRENT_DATE),
  date_fin = COALESCE(
    c.date_fin,
    (SELECT r.date_fin FROM public.reservations r WHERE r.id = c.reservation_id),
    -- Par défaut, bail d'un an (10 mois universitaires ou 12 mois)
    ((SELECT r.date_debut FROM public.reservations r WHERE r.id = c.reservation_id) + INTERVAL '10 months')::DATE,
    (CURRENT_DATE + INTERVAL '10 months')::DATE
  ),
  loyer_mensuel = COALESCE(
    c.loyer_mensuel,
    (SELECT ch.prix_zeyna FROM public.reservations r JOIN public.chambres ch ON ch.id = r.chambre_id WHERE r.id = c.reservation_id),
    ((c.contenu->>'montant')::INTEGER),
    0
  )
WHERE c.date_debut IS NULL OR c.date_fin IS NULL OR c.loyer_mensuel IS NULL;

-- 2. Table des rappels d'échéance manuels (Section 6.1)
CREATE TABLE IF NOT EXISTS public.contrat_rappels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contrat_id UUID REFERENCES public.contrats(id) ON DELETE CASCADE NOT NULL,
  administrateur_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  date_rappel TIMESTAMPTZ NOT NULL DEFAULT now(),
  type_canal TEXT NOT NULL DEFAULT 'plateforme', -- 'plateforme', 'whatsapp', 'sms', 'email'
  statut_envoi TEXT NOT NULL DEFAULT 'envoye',   -- 'prepare', 'envoye'
  message TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.contrat_rappels ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins full access on contrat_rappels" ON public.contrat_rappels;
CREATE POLICY "Admins full access on contrat_rappels" ON public.contrat_rappels
  FOR ALL USING (public.is_admin_or_super(auth.uid()))
  WITH CHECK (public.is_admin_or_super(auth.uid()));

DROP POLICY IF EXISTS "Students can view their reminders" ON public.contrat_rappels;
CREATE POLICY "Students can view their reminders" ON public.contrat_rappels
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.contrats c
      WHERE c.id = contrat_rappels.contrat_id AND c.etudiant_id = auth.uid()
    )
  );

-- 3. Table des demandes de renouvellement de contrat (Sections 6.2 & 6.3)
CREATE TABLE IF NOT EXISTS public.contrat_renouvellements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contrat_id UUID REFERENCES public.contrats(id) ON DELETE CASCADE NOT NULL,
  etudiant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  periode_precedente_debut DATE,
  periode_precedente_fin DATE,
  tarif_precedent INTEGER NOT NULL,
  nouvelle_date_debut DATE NOT NULL,
  nouvelle_date_fin DATE NOT NULL,
  nouveau_tarif_propose INTEGER,
  motif_modification_tarif TEXT,
  statut TEXT NOT NULL DEFAULT 'en_attente',
  -- Valeurs de statut :
  -- 'en_attente' : initié par l'étudiant
  -- 'propose_tarif_modifie' : l'admin propose un nouveau tarif avec motif
  -- 'accepte_par_etudiant' : l'étudiant a accepté le nouveau tarif proposé
  -- 'refuse_par_etudiant' : l'étudiant a décliné le tarif
  -- 'valide' : validé définitivement par l'administrateur
  -- 'refuse' : refusé par l'administrateur
  motif_refus TEXT,
  date_decision TIMESTAMPTZ,
  date_acceptation_etudiant TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.contrat_renouvellements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins full access on contrat_renouvellements" ON public.contrat_renouvellements;
CREATE POLICY "Admins full access on contrat_renouvellements" ON public.contrat_renouvellements
  FOR ALL USING (public.is_admin_or_super(auth.uid()))
  WITH CHECK (public.is_admin_or_super(auth.uid()));

DROP POLICY IF EXISTS "Students manage their renewals" ON public.contrat_renouvellements;
CREATE POLICY "Students manage their renewals" ON public.contrat_renouvellements
  FOR ALL USING (etudiant_id = auth.uid())
  WITH CHECK (etudiant_id = auth.uid());

-- 4. Table d'historique des périodes et tarifs (Section 6.4)
CREATE TABLE IF NOT EXISTS public.contrat_periodes_historique (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contrat_id UUID REFERENCES public.contrats(id) ON DELETE CASCADE NOT NULL,
  numero_periode INTEGER NOT NULL DEFAULT 1,
  date_debut DATE NOT NULL,
  date_fin DATE NOT NULL,
  loyer_mensuel INTEGER NOT NULL,
  motif_modification TEXT,
  renouvellement_id UUID REFERENCES public.contrat_renouvellements(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.contrat_periodes_historique ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins read contrat_periodes_historique" ON public.contrat_periodes_historique;
CREATE POLICY "Admins read contrat_periodes_historique" ON public.contrat_periodes_historique
  FOR SELECT USING (public.is_admin_or_super(auth.uid()));

DROP POLICY IF EXISTS "Admins insert contrat_periodes_historique" ON public.contrat_periodes_historique;
CREATE POLICY "Admins insert contrat_periodes_historique" ON public.contrat_periodes_historique
  FOR INSERT WITH CHECK (public.is_admin_or_super(auth.uid()));

DROP POLICY IF EXISTS "Students read their periods" ON public.contrat_periodes_historique;
CREATE POLICY "Students read their periods" ON public.contrat_periodes_historique
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.contrats c
      WHERE c.id = contrat_periodes_historique.contrat_id AND c.etudiant_id = auth.uid()
    )
  );

-- Initialiser la première période d'historique pour les contrats existants
INSERT INTO public.contrat_periodes_historique (contrat_id, numero_periode, date_debut, date_fin, loyer_mensuel)
SELECT c.id, 1, c.date_debut, c.date_fin, COALESCE(c.loyer_mensuel, 0)
FROM public.contrats c
WHERE NOT EXISTS (
  SELECT 1 FROM public.contrat_periodes_historique h WHERE h.contrat_id = c.id
);

-- 5. Procédure stockée : Finaliser un renouvellement de contrat
CREATE OR REPLACE FUNCTION public.finaliser_renouvellement_contrat(p_renouvellement_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ren RECORD;
  v_contrat RECORD;
  v_nouveau_loyer INTEGER;
  v_num_periode INTEGER;
BEGIN
  -- A. Contrôle administrateur
  IF NOT public.is_admin_or_super(auth.uid()) THEN
    RAISE EXCEPTION 'Action non autorisée : droits administrateur requis.';
  END IF;

  -- B. Verrouiller le renouvellement
  SELECT * INTO v_ren
  FROM public.contrat_renouvellements
  WHERE id = p_renouvellement_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Demande de renouvellement introuvable.';
  END IF;

  -- C. Verrouiller le contrat initial
  SELECT * INTO v_contrat
  FROM public.contrats
  WHERE id = v_ren.contrat_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Contrat d''origine introuvable.';
  END IF;

  v_nouveau_loyer := COALESCE(v_ren.nouveau_tarif_propose, v_ren.tarif_precedent);

  -- D. Déterminer le numéro de la période suivante
  SELECT COALESCE(MAX(numero_periode), 1) + 1 INTO v_num_periode
  FROM public.contrat_periodes_historique
  WHERE contrat_id = v_ren.contrat_id;

  -- E. Enregistrer dans l'historique des périodes sans écraser les anciennes
  INSERT INTO public.contrat_periodes_historique (
    contrat_id,
    numero_periode,
    date_debut,
    date_fin,
    loyer_mensuel,
    motif_modification,
    renouvellement_id
  ) VALUES (
    v_ren.contrat_id,
    v_num_periode,
    v_ren.nouvelle_date_debut,
    v_ren.nouvelle_date_fin,
    v_nouveau_loyer,
    v_ren.motif_modification_tarif,
    v_ren.id
  );

  -- F. Mettre à jour le statut du renouvellement
  UPDATE public.contrat_renouvellements
  SET
    statut = 'valide',
    date_decision = now(),
    updated_at = now()
  WHERE id = p_renouvellement_id;

  -- G. Mettre à jour la date de fin courante et le loyer courant du contrat
  UPDATE public.contrats
  SET
    date_fin = v_ren.nouvelle_date_fin,
    loyer_mensuel = v_nouveau_loyer,
    statut_contrat = 'actif'
  WHERE id = v_ren.contrat_id;

  RETURN jsonb_build_object(
    'success', true,
    'contrat_id', v_ren.contrat_id,
    'renouvellement_id', v_ren.id,
    'nouvelle_date_fin', v_ren.nouvelle_date_fin,
    'loyer_mensuel', v_nouveau_loyer,
    'numero_periode', v_num_periode
  );
END;
$$;
