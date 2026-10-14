-- ============================================================
-- MIGRATION : Correction SEC-010
-- Ajout de la colonne success sur la table audit_logs
-- et mise à jour de la fonction SECURITY DEFINER insert_audit_log
-- ============================================================

-- 1. Ajouter la colonne success si elle n'existe pas
ALTER TABLE public.audit_logs 
  ADD COLUMN IF NOT EXISTS success BOOLEAN NOT NULL DEFAULT true;

-- 2. Créer un index pour accélérer les filtrages par statut dans le dashboard Super-Admin
CREATE INDEX IF NOT EXISTS idx_audit_logs_success 
  ON public.audit_logs(success);

-- 3. Mettre à jour la fonction insert_audit_log pour accepter le paramètre p_success
CREATE OR REPLACE FUNCTION public.insert_audit_log(
  p_user_id       UUID,
  p_action        TEXT,
  p_resource_type TEXT DEFAULT NULL,
  p_resource_id   TEXT DEFAULT NULL,
  p_details       JSONB DEFAULT '{}',
  p_ip_address    TEXT DEFAULT NULL,
  p_success       BOOLEAN DEFAULT true
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.audit_logs (user_id, action, resource_type, resource_id, details, ip_address, success)
  VALUES (p_user_id, p_action, p_resource_type, p_resource_id, p_details, p_ip_address, p_success);
END;
$$;
