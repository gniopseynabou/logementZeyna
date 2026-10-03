-- Migration: Ajout des tables pour les Incidents et Reversements
-- Ne modifie pas les tables existantes

CREATE TYPE incident_statut AS ENUM ('nouveau', 'en_cours', 'en_attente', 'resolu', 'cloture');
CREATE TYPE incident_priorite AS ENUM ('basse', 'normale', 'haute', 'urgente');
CREATE TYPE incident_categorie AS ENUM ('maintenance', 'paiement', 'comportement', 'securite', 'autre');

-- Table: incidents
CREATE TABLE IF NOT EXISTS incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    etudiant_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    logement_id UUID NOT NULL REFERENCES logements(id) ON DELETE CASCADE,
    chambre_id UUID REFERENCES chambres(id) ON DELETE SET NULL,
    titre TEXT NOT NULL,
    description TEXT NOT NULL,
    categorie incident_categorie NOT NULL DEFAULT 'autre',
    priorite incident_priorite NOT NULL DEFAULT 'normale',
    statut incident_statut NOT NULL DEFAULT 'nouveau',
    photos TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Row Level Security pour incidents
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Les étudiants peuvent voir leurs propres incidents" 
ON incidents FOR SELECT 
USING (auth.uid() = etudiant_id);

CREATE POLICY "Les étudiants peuvent créer des incidents" 
ON incidents FOR INSERT 
WITH CHECK (auth.uid() = etudiant_id);

CREATE POLICY "Les bailleurs peuvent voir les incidents de leurs logements" 
ON incidents FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM logements 
        WHERE logements.id = incidents.logement_id 
        AND logements.bailleur_id = auth.uid()
    )
);

CREATE POLICY "Les admins peuvent tout voir sur les incidents" 
ON incidents FOR ALL 
USING (public.has_role('admin', auth.uid()));


CREATE TYPE reversement_statut AS ENUM ('en_attente', 'traite', 'annule');

-- Table: reversements
CREATE TABLE IF NOT EXISTS reversements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bailleur_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    paiement_id UUID NOT NULL REFERENCES paiements(id) ON DELETE CASCADE,
    montant NUMERIC NOT NULL,
    statut reversement_statut NOT NULL DEFAULT 'en_attente',
    date_reversement TIMESTAMP WITH TIME ZONE,
    reference_transaction TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Row Level Security pour reversements
ALTER TABLE reversements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Les bailleurs peuvent voir leurs propres reversements" 
ON reversements FOR SELECT 
USING (auth.uid() = bailleur_id);

CREATE POLICY "Les admins peuvent tout faire sur les reversements" 
ON reversements FOR ALL 
USING (public.has_role('admin', auth.uid()));

-- Ajouter un trigger pour updated_at sur incidents
CREATE OR REPLACE FUNCTION update_incidents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_incidents_updated_at
BEFORE UPDATE ON incidents
FOR EACH ROW
EXECUTE FUNCTION update_incidents_updated_at();
