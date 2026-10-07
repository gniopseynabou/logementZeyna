-- Migration : Table des demandes de partenariat (Bailleurs)
-- Date : 2026-10-07

-- 1. Création du type énuméré pour le statut
DO $$ BEGIN
    CREATE TYPE public.statut_demande AS ENUM ('en_attente', 'contacte', 'acceptee', 'rejetee');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Création de la table
CREATE TABLE IF NOT EXISTS public.demandes_partenariat (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nom TEXT NOT NULL,
    prenom TEXT NOT NULL,
    email TEXT NOT NULL,
    telephone TEXT NOT NULL,
    ville TEXT,
    nombre_logements INTEGER DEFAULT 1,
    message TEXT,
    statut public.statut_demande DEFAULT 'en_attente',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Sécurité (RLS)
ALTER TABLE public.demandes_partenariat ENABLE ROW LEVEL SECURITY;

-- Les visiteurs publics peuvent soumettre une demande
DROP POLICY IF EXISTS "Public can insert demandes" ON public.demandes_partenariat;
CREATE POLICY "Public can insert demandes" 
    ON public.demandes_partenariat 
    FOR INSERT 
    WITH CHECK (true);

-- Seuls les admins et super_admins peuvent voir et gérer les demandes
DROP POLICY IF EXISTS "Admins can view demandes" ON public.demandes_partenariat;
CREATE POLICY "Admins can view demandes" 
    ON public.demandes_partenariat 
    FOR SELECT 
    USING (public.is_admin_or_super(auth.uid()));

DROP POLICY IF EXISTS "Admins can update demandes" ON public.demandes_partenariat;
CREATE POLICY "Admins can update demandes" 
    ON public.demandes_partenariat 
    FOR UPDATE 
    USING (public.is_admin_or_super(auth.uid()));
