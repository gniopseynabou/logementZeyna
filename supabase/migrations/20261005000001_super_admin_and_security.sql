-- ============================================================
-- MIGRATION : Super-Admin + Sécurité critique
-- Phase 1 : Correction trigger handle_new_user (vulnérabilité auto-admin)
-- Phase 2 : Rôle SUPER_ADMIN + fonctions helpers + RLS + index
-- ============================================================

-- ============================================================
-- 1. AJOUT DU RÔLE SUPER_ADMIN DANS L'ENUM
-- ============================================================
-- Note : ALTER TYPE ADD VALUE ne peut pas être exécuté dans une transaction.
-- PostgreSQL >= 12 : IF NOT EXISTS supporté.
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'super_admin';

-- ============================================================
-- 2. CORRECTION CRITIQUE DU TRIGGER handle_new_user
-- Vulnérabilité : le trigger acceptait n'importe quel rôle
-- venant de raw_user_meta_data, y compris 'admin' et 'super_admin'.
-- Fix : seuls 'etudiant' et 'bailleur' peuvent être auto-assignés.
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role public.app_role;
  v_requested_role TEXT;
BEGIN
  -- Lire le rôle demandé depuis les métadonnées
  v_requested_role := COALESCE(NEW.raw_user_meta_data ->> 'role', 'etudiant');

  -- SÉCURITÉ CRITIQUE : seuls etudiant et bailleur peuvent être
  -- auto-assignés via l'inscription publique.
  -- Tout autre rôle (admin, super_admin) est ignoré → etudiant par défaut.
  IF v_requested_role IN ('etudiant', 'bailleur') THEN
    v_role := v_requested_role::public.app_role;
  ELSE
    v_role := 'etudiant'::public.app_role;
  END IF;

  -- Créer le profil utilisateur
  INSERT INTO public.profiles (user_id, nom, prenom, telephone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'nom', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'prenom', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'telephone', '')
  )
  ON CONFLICT (user_id) DO NOTHING;

  -- Attribuer le rôle sécurisé
  INSERT INTO public.user_roles (user_id, role, is_validated)
  VALUES (
    NEW.id,
    v_role,
    CASE WHEN v_role = 'etudiant' THEN true ELSE false END
  )
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;

-- ============================================================
-- 3. FONCTION : Vérifier si un utilisateur est super_admin
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'super_admin'
      AND is_validated = true
  )
$$;

-- ============================================================
-- 4. FONCTION : Vérifier si un utilisateur a un rôle privilégié
-- (admin OU super_admin)
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin_or_super(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'super_admin')
      AND is_validated = true
  )
$$;

-- ============================================================
-- 5. INDEX DE PERFORMANCE
-- Les colonnes de filtrage fréquentes dans les RLS et requêtes
-- nécessitent des index pour éviter des seq scans coûteux.
-- ============================================================

-- user_roles : lookup critique pour chaque appel RLS has_role()
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id
  ON public.user_roles(user_id);

CREATE INDEX IF NOT EXISTS idx_user_roles_role
  ON public.user_roles(role);

-- paiements : filtrage par étudiant et par réservation
CREATE INDEX IF NOT EXISTS idx_paiements_etudiant_id
  ON public.paiements(etudiant_id);

CREATE INDEX IF NOT EXISTS idx_paiements_reservation_id
  ON public.paiements(reservation_id);

-- reservations : filtrage par étudiant et par logement (pour bailleurs)
CREATE INDEX IF NOT EXISTS idx_reservations_etudiant_id
  ON public.reservations(etudiant_id);

CREATE INDEX IF NOT EXISTS idx_reservations_logement_id
  ON public.reservations(logement_id);

-- logements : filtrage par statut (landing page, admin)
CREATE INDEX IF NOT EXISTS idx_logements_statut
  ON public.logements(statut);

-- logements : filtrage par bailleur
CREATE INDEX IF NOT EXISTS idx_logements_bailleur_id
  ON public.logements(bailleur_id);

-- incidents : filtrage par logement (accès bailleur)
CREATE INDEX IF NOT EXISTS idx_incidents_logement_id
  ON incidents(logement_id);

-- ============================================================
-- 6. MISE À JOUR DES RLS EXISTANTES POUR INCLURE super_admin
-- Les admins existants ont accès métier. Les super_admins ont
-- accès en lecture à tout pour supervision.
-- ============================================================

-- PROFILES : super_admin peut voir tous les profils (supervision)
DROP POLICY IF EXISTS "Super-admins can view all profiles" ON public.profiles;
CREATE POLICY "Super-admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_super_admin(auth.uid()));

-- USER_ROLES : super_admin peut voir tous les rôles
DROP POLICY IF EXISTS "Super-admins can view all roles" ON public.user_roles;
CREATE POLICY "Super-admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.is_super_admin(auth.uid()));

-- USER_ROLES : super_admin peut attribuer/modifier les rôles (gestion technique)
DROP POLICY IF EXISTS "Super-admins can manage roles" ON public.user_roles;
CREATE POLICY "Super-admins can manage roles"
  ON public.user_roles FOR UPDATE
  USING (public.is_super_admin(auth.uid()));

-- USER_ROLES : super_admin peut insérer des rôles (ex: promouvoir super_admin)
DROP POLICY IF EXISTS "Super-admins can insert roles" ON public.user_roles;
CREATE POLICY "Super-admins can insert roles"
  ON public.user_roles FOR INSERT
  WITH CHECK (public.is_super_admin(auth.uid()));

-- LOGEMENTS : super_admin peut voir tous les logements (supervision)
DROP POLICY IF EXISTS "Super-admins can view all logements" ON public.logements;
CREATE POLICY "Super-admins can view all logements"
  ON public.logements FOR SELECT
  USING (public.is_super_admin(auth.uid()));

-- PAIEMENTS : super_admin peut voir tous les paiements (supervision)
DROP POLICY IF EXISTS "Super-admins can view all paiements" ON public.paiements;
CREATE POLICY "Super-admins can view all paiements"
  ON public.paiements FOR SELECT
  USING (public.is_super_admin(auth.uid()));

-- RESERVATIONS : super_admin peut voir toutes les réservations (supervision)
DROP POLICY IF EXISTS "Super-admins can view all reservations" ON public.reservations;
CREATE POLICY "Super-admins can view all reservations"
  ON public.reservations FOR SELECT
  USING (public.is_super_admin(auth.uid()));

-- CONTRATS : super_admin peut voir tous les contrats (supervision)
DROP POLICY IF EXISTS "Super-admins can view all contrats" ON public.contrats;
CREATE POLICY "Super-admins can view all contrats"
  ON public.contrats FOR SELECT
  USING (public.is_super_admin(auth.uid()));

-- INCIDENTS : super_admin peut voir tous les incidents (supervision)
DROP POLICY IF EXISTS "Super-admins can view all incidents" ON incidents;
CREATE POLICY "Super-admins can view all incidents"
  ON incidents FOR SELECT
  USING (public.is_super_admin(auth.uid()));

-- REVERSEMENTS : super_admin peut voir tous les reversements (supervision)
DROP POLICY IF EXISTS "Super-admins can view all reversements" ON reversements;
CREATE POLICY "Super-admins can view all reversements"
  ON reversements FOR SELECT
  USING (public.is_super_admin(auth.uid()));

-- ============================================================
-- 7. NOTE : Procédure de création du premier Super-Admin
--
-- À exécuter MANUELLEMENT dans le SQL Editor de Supabase
-- après déploiement de cette migration, en remplaçant l'UUID :
--
-- INSERT INTO public.user_roles (user_id, role, is_validated)
-- VALUES ('<uuid-du-membre-technique>', 'super_admin', true)
-- ON CONFLICT (user_id, role) DO UPDATE SET is_validated = true;
--
-- Ne jamais exposer cette opération via une interface publique.
-- ============================================================
