-- ============================================================
-- MIGRATION : Système de maintenance
-- Phase 3 : Table maintenance_config + RLS + Journal d'audit
-- ============================================================

-- ============================================================
-- 1. TABLE : maintenance_config
-- Une seule ligne active à la fois (configuration singleton).
-- ============================================================
CREATE TABLE IF NOT EXISTS public.maintenance_config (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_active    BOOLEAN NOT NULL DEFAULT false,
  title        TEXT NOT NULL DEFAULT 'Maintenance en cours',
  message      TEXT NOT NULL DEFAULT 'La plateforme est temporairement indisponible pour une opération de maintenance. Nous serons de retour très prochainement.',
  scheduled_start TIMESTAMPTZ,
  scheduled_end   TIMESTAMPTZ,
  activated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  activated_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger updated_at
CREATE TRIGGER update_maintenance_config_updated_at
  BEFORE UPDATE ON public.maintenance_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Ligne initiale : maintenance désactivée
INSERT INTO public.maintenance_config (is_active, title, message)
VALUES (false, 'Maintenance en cours', 'La plateforme est temporairement indisponible.')
ON CONFLICT DO NOTHING;

-- RLS
ALTER TABLE public.maintenance_config ENABLE ROW LEVEL SECURITY;

-- Tout le monde peut LIRE le statut de maintenance (pour afficher la page)
CREATE POLICY "Anyone can read maintenance status"
  ON public.maintenance_config FOR SELECT
  USING (true);

-- Seul le super_admin peut modifier la configuration de maintenance
CREATE POLICY "Super-admins can update maintenance"
  ON public.maintenance_config FOR UPDATE
  USING (public.is_super_admin(auth.uid()));

-- ============================================================
-- 2. TABLE : audit_logs
-- Journal des actions techniques sensibles (super_admin).
-- ============================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  action        TEXT NOT NULL,
  resource_type TEXT,
  resource_id   TEXT,
  details       JSONB NOT NULL DEFAULT '{}',
  ip_address    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index sur user_id et created_at pour les requêtes de consultation
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id
  ON public.audit_logs(user_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at
  ON public.audit_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_action
  ON public.audit_logs(action);

-- RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Seul le super_admin peut consulter les logs d'audit
CREATE POLICY "Super-admins can read audit logs"
  ON public.audit_logs FOR SELECT
  USING (public.is_super_admin(auth.uid()));

-- Personne ne peut modifier ou supprimer les logs (immuabilité)
-- Les insertions se font uniquement via une fonction SECURITY DEFINER

-- ============================================================
-- 3. FONCTION : Insérer un log d'audit (SECURITY DEFINER)
-- Appelée depuis les Edge Functions ou triggers.
-- Ne peut pas être désactivée par les RLS.
-- ============================================================
CREATE OR REPLACE FUNCTION public.insert_audit_log(
  p_user_id       UUID,
  p_action        TEXT,
  p_resource_type TEXT DEFAULT NULL,
  p_resource_id   TEXT DEFAULT NULL,
  p_details       JSONB DEFAULT '{}',
  p_ip_address    TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.audit_logs (user_id, action, resource_type, resource_id, details, ip_address)
  VALUES (p_user_id, p_action, p_resource_type, p_resource_id, p_details, p_ip_address);
END;
$$;

-- ============================================================
-- 4. CORRECTION : Incohérence FK dans incidents et reversements
-- Les migrations récentes référencent profiles(id) au lieu de
-- auth.users(id), ce qui crée une incompatibilité avec les RLS
-- qui utilisent auth.uid() = auth.users.id.
--
-- Note : Cette correction supprime les FK incorrectes et les
-- remplace par des références correctes à auth.users(id).
-- Elle ne modifie PAS les données existantes.
-- ============================================================

-- Correction table incidents
ALTER TABLE incidents
  DROP CONSTRAINT IF EXISTS incidents_etudiant_id_fkey;

ALTER TABLE incidents
  ADD CONSTRAINT incidents_etudiant_id_fkey
  FOREIGN KEY (etudiant_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Correction table reversements
ALTER TABLE reversements
  DROP CONSTRAINT IF EXISTS reversements_bailleur_id_fkey;

ALTER TABLE reversements
  ADD CONSTRAINT reversements_bailleur_id_fkey
  FOREIGN KEY (bailleur_id) REFERENCES auth.users(id) ON DELETE CASCADE;
