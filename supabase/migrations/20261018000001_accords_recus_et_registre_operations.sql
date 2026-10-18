-- Migration: Accords propriétaires, Reçus de paiement et Registre des opérations traçable
-- Date: 2026-10-18

-- 1. Table des accords écrits avec les propriétaires (conventions de bail principal & gestion)
CREATE TABLE IF NOT EXISTS public.accords_proprietaires (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    logement_id UUID NOT NULL REFERENCES public.logements(id) ON DELETE CASCADE,
    bailleur_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reference_accord TEXT UNIQUE NOT NULL,
    type_accord TEXT NOT NULL DEFAULT 'convention_partenariat_gestion',
    statut TEXT NOT NULL DEFAULT 'signe' CHECK (statut IN ('en_attente_signature', 'signe', 'actif', 'renouvele', 'resilie')),
    date_effet DATE NOT NULL DEFAULT CURRENT_DATE,
    date_fin DATE,
    date_signature TIMESTAMPTZ DEFAULT now(),
    conditions_particulieres TEXT,
    representant_zeyna TEXT DEFAULT 'Direction Générale Zeyna',
    commission_pourcentage NUMERIC(5, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_accords_logement ON public.accords_proprietaires(logement_id);
CREATE INDEX IF NOT EXISTS idx_accords_bailleur ON public.accords_proprietaires(bailleur_id);
CREATE INDEX IF NOT EXISTS idx_accords_statut ON public.accords_proprietaires(statut);

-- RLS Accords propriétaires
ALTER TABLE public.accords_proprietaires ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin gère tous les accords propriétaires"
ON public.accords_proprietaires
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'super_admin')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'super_admin')
    )
);

CREATE POLICY "Bailleur consulte ses propres accords"
ON public.accords_proprietaires
FOR SELECT
TO authenticated
USING (
    bailleur_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.logements l
        WHERE l.id = accords_proprietaires.logement_id AND l.bailleur_id = auth.uid()
    )
);

-- 2. Table des reçus de paiement (automatiques et manuels avec traçabilité)
CREATE TABLE IF NOT EXISTS public.recus_paiements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference TEXT UNIQUE NOT NULL,
    paiement_id UUID REFERENCES public.paiements(id) ON DELETE SET NULL,
    etudiant_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    logement_id UUID REFERENCES public.logements(id) ON DELETE SET NULL,
    chambre_id UUID REFERENCES public.chambres(id) ON DELETE SET NULL,
    type_recu TEXT NOT NULL CHECK (type_recu IN ('caution', 'loyer', 'frais_dossier', 'manuel', 'autre')),
    type_generation TEXT NOT NULL CHECK (type_generation IN ('automatique', 'manuel')),
    montant NUMERIC(12, 2) NOT NULL CHECK (montant > 0),
    methode_paiement TEXT NOT NULL DEFAULT 'Wave',
    reference_paiement TEXT,
    payeur_nom_complet TEXT NOT NULL,
    payeur_telephone TEXT,
    payeur_email TEXT,
    motif TEXT NOT NULL,
    date_emission TIMESTAMPTZ DEFAULT now(),
    emetteur_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    details_json JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index pour reçus
CREATE INDEX IF NOT EXISTS idx_recus_paiement ON public.recus_paiements(paiement_id);
CREATE INDEX IF NOT EXISTS idx_recus_etudiant ON public.recus_paiements(etudiant_id);
CREATE INDEX IF NOT EXISTS idx_recus_reference ON public.recus_paiements(reference);
CREATE INDEX IF NOT EXISTS idx_recus_date_emission ON public.recus_paiements(date_emission);

-- RLS Reçus
ALTER TABLE public.recus_paiements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin gère tous les reçus"
ON public.recus_paiements
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'super_admin')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'super_admin')
    )
);

CREATE POLICY "Étudiant consulte ses propres reçus"
ON public.recus_paiements
FOR SELECT
TO authenticated
USING (
    etudiant_id = auth.uid()
);

-- 3. Table du registre des opérations financières (Journal comptable traçable)
CREATE TABLE IF NOT EXISTS public.registre_operations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_operation TEXT UNIQUE NOT NULL,
    type_operation TEXT NOT NULL CHECK (type_operation IN ('encaissement_etudiant', 'reversement_bailleur', 'remboursement_caution', 'recu_manuel', 'ajustement')),
    montant NUMERIC(12, 2) NOT NULL,
    devise TEXT NOT NULL DEFAULT 'FCFA',
    statut TEXT NOT NULL DEFAULT 'valide' CHECK (statut IN ('en_attente', 'valide', 'rejete', 'annule')),
    mode_reglement TEXT NOT NULL DEFAULT 'Wave',
    reference_externe TEXT,
    acteur_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    entite_type TEXT, -- 'paiement', 'reversement', 'recu', 'caution'
    entite_id UUID,
    description TEXT NOT NULL,
    date_operation TIMESTAMPTZ DEFAULT now(),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index registre des opérations
CREATE INDEX IF NOT EXISTS idx_operations_type ON public.registre_operations(type_operation);
CREATE INDEX IF NOT EXISTS idx_operations_statut ON public.registre_operations(statut);
CREATE INDEX IF NOT EXISTS idx_operations_date ON public.registre_operations(date_operation);
CREATE INDEX IF NOT EXISTS idx_operations_ref ON public.registre_operations(reference_operation);

-- RLS Registre des opérations
ALTER TABLE public.registre_operations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin consulte et administre le registre des opérations"
ON public.registre_operations
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'super_admin')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'super_admin')
    )
);

-- 4. Procédure stockée pour enregistrer une opération au registre de manière atomique
CREATE OR REPLACE FUNCTION public.enregistrer_operation_registre(
    p_type_operation TEXT,
    p_montant NUMERIC,
    p_mode_reglement TEXT,
    p_description TEXT,
    p_reference_externe TEXT DEFAULT NULL,
    p_entite_type TEXT DEFAULT NULL,
    p_entite_id UUID DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_ref TEXT;
    v_op_id UUID;
    v_seq_num BIGINT;
BEGIN
    -- Génération de référence unique : OP-YYYYMM-XXXX
    v_seq_num := floor(extract(epoch from now()))::bigint % 100000;
    v_ref := 'OP-' || to_char(now(), 'YYYYMM') || '-' || lpad(v_seq_num::text, 5, '0') || '-' || floor(random() * 900 + 100)::text;

    INSERT INTO public.registre_operations (
        reference_operation,
        type_operation,
        montant,
        statut,
        mode_reglement,
        reference_externe,
        acteur_id,
        entite_type,
        entite_id,
        description,
        metadata
    ) VALUES (
        v_ref,
        p_type_operation,
        p_montant,
        'valide',
        p_mode_reglement,
        p_reference_externe,
        auth.uid(),
        p_entite_type,
        p_entite_id,
        p_description,
        p_metadata
    )
    RETURNING id INTO v_op_id;

    RETURN v_op_id;
END;
$$;
