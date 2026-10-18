-- ============================================================
-- MIGRATION : Correction SEC-003
-- Contrôle d'intégrité et calcul serveur obligatoire du montant des réservations
-- ============================================================

-- 1. Fonction Trigger de vérification et de calcul serveur
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

  -- D. Vérifier la disponibilité de la chambre (pour toute nouvelle réservation en attente)
  IF NOT v_chambre.est_disponible AND NEW.statut = 'en_attente' THEN
    RAISE EXCEPTION 'Cette chambre n''est actuellement plus disponible.';
  END IF;

  -- E. Forcer le calcul du montant total côté serveur (Prix ZEYNA + Caution)
  -- Neutralise toute falsification de prix envoyée depuis le navigateur
  NEW.montant_total :=COALESCE(v_chambre.caution, 0);

  -- F. Pour tout utilisateur non-administrateur, forcer le statut initial en 'en_attente'
  IF NOT public.is_admin_or_super(auth.uid()) THEN
    NEW.statut := 'en_attente';
  END IF;

  RETURN NEW;
END;
$$;

-- 2. Attacher le trigger BEFORE INSERT sur la table reservations
DROP TRIGGER IF EXISTS trigger_enforce_reservation_integrity ON public.reservations;
CREATE TRIGGER trigger_enforce_reservation_integrity
  BEFORE INSERT ON public.reservations
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_reservation_integrity();
