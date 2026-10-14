-- ============================================================
-- MIGRATION : Correction SEC-002
-- Protection contre l'auto-validation des logements par les bailleurs
-- ============================================================

-- 1. Fonction Trigger de sécurité : seul un administrateur peut valider un logement
CREATE OR REPLACE FUNCTION public.prevent_unauthorized_logement_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Si le statut est modifié et que l'utilisateur n'est ni admin ni super_admin
  IF NEW.statut IS DISTINCT FROM OLD.statut AND NOT public.is_admin_or_super(auth.uid()) THEN
    -- Tentative de passer en 'valide' interdite formellement
    IF NEW.statut = 'valide' THEN
      RAISE EXCEPTION 'Action non autorisée : seul un administrateur ZEYNA peut valider un logement (statut actuel: %).', OLD.statut;
    END IF;

    -- Sécurité : toute autre modification non autorisée conserve le statut précédent
    NEW.statut := OLD.statut;
  END IF;

  RETURN NEW;
END;
$$;

-- 2. Attacher le trigger BEFORE UPDATE sur la table logements
DROP TRIGGER IF EXISTS trigger_prevent_logement_status_change ON public.logements;
CREATE TRIGGER trigger_prevent_logement_status_change
  BEFORE UPDATE ON public.logements
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_unauthorized_logement_status_change();

-- 3. Renforcer la politique RLS existante pour interdire l'injection directe de statut 'valide'
DROP POLICY IF EXISTS "Bailleurs can update own logements" ON public.logements;
CREATE POLICY "Bailleurs can update own logements" 
ON public.logements 
FOR UPDATE 
USING (auth.uid() = bailleur_id)
WITH CHECK (
  auth.uid() = bailleur_id 
  AND (
    statut <> 'valide' 
    OR public.is_admin_or_super(auth.uid())
  )
);
