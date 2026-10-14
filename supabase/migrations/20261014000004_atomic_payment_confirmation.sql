-- ============================================================
-- MIGRATION : Correction SEC-006
-- Sécurisation transactionnelle atomique de la confirmation de paiement
-- Empêche les surréservations (race conditions) et garantit l'intégrité ACID
-- ============================================================

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
  -- 1. Contrôle d'accès strict : seuls admin et super_admin peuvent exécuter cette opération
  IF NOT public.is_admin_or_super(auth.uid()) THEN
    RAISE EXCEPTION 'Action non autorisée : droits administrateur requis.';
  END IF;

  -- 2. Verrouiller la réservation pour éviter les doubles validations concurrentes
  SELECT id, chambre_id, etudiant_id, statut
  INTO v_res
  FROM public.reservations
  WHERE id = p_reservation_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Réservation introuvable (id: %)', p_reservation_id;
  END IF;

  IF v_res.statut = 'confirmee' THEN
    RAISE EXCEPTION 'Cette réservation est déjà confirmée.';
  END IF;

  -- 3. Verrouiller la chambre correspondante
  SELECT id, est_disponible
  INTO v_chambre
  FROM public.chambres
  WHERE id = v_res.chambre_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Chambre introuvable (id: %)', v_res.chambre_id;
  END IF;

  -- Sécurité anti-surréservation (Race condition neutralisée par FOR UPDATE)
  IF NOT v_chambre.est_disponible THEN
    RAISE EXCEPTION 'Cette chambre n''est plus disponible (déjà attribuée à un autre locataire).';
  END IF;

  -- 4. Confirmer le paiement
  UPDATE public.paiements
  SET est_confirme = true
  WHERE id = p_payment_id;

  -- 5. Confirmer la réservation
  UPDATE public.reservations
  SET statut = 'confirmee', updated_at = now()
  WHERE id = p_reservation_id;

  -- 6. Marquer immédiatement la chambre comme occupée
  UPDATE public.chambres
  SET est_disponible = false, updated_at = now()
  WHERE id = v_res.chambre_id;

  -- 7. Créer le contrat officiel
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
