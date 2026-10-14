-- ============================================================
-- MIGRATION : Correction SEC-004
-- Verrouillage strict du lien Étudiant ↔ Réservation lors du paiement
-- ============================================================

-- Supprimer l'ancienne politique permissive
DROP POLICY IF EXISTS "Etudiants can insert paiements" ON public.paiements;

-- Créer la politique renforcée garantissant que l'étudiant ne peut payer
-- que pour sa propre réservation en attente, et jamais insérer un paiement déjà confirmé
CREATE POLICY "Etudiants can insert paiements" 
ON public.paiements 
FOR INSERT 
WITH CHECK (
  auth.uid() = etudiant_id 
  AND est_confirme = false
  AND EXISTS (
    SELECT 1 FROM public.reservations r
    WHERE r.id = paiements.reservation_id
      AND r.etudiant_id = auth.uid()
      AND r.statut = 'en_attente'
  )
);
