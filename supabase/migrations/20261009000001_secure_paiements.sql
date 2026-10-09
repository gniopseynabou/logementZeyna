-- SÉCURITÉ RENFORCÉE POUR LES PAIEMENTS
-- Objectif : Empêcher un étudiant d'insérer un paiement avec est_confirme = true.

-- 1. Supprimer l'ancienne politique
DROP POLICY IF EXISTS "Etudiants can insert paiements" ON public.paiements;

-- 2. Créer une nouvelle politique stricte
CREATE POLICY "Etudiants can insert paiements" 
ON public.paiements 
FOR INSERT 
WITH CHECK (
  auth.uid() = etudiant_id 
  AND est_confirme = false
);

-- Pour les mises à jour, s'assurer que seuls les admins peuvent confirmer
DROP POLICY IF EXISTS "Etudiants can update own paiements" ON public.paiements;
-- (S'il n'y en a pas, c'est bon. Par défaut, RLS refuse tout ce qui n'est pas permis).

-- SÉCURITÉ POUR LES CONTRATS (CÔTÉ BAILLEUR)
-- Objectif : Permettre aux bailleurs de voir les contrats liés à leurs propres logements.

CREATE POLICY "Bailleurs can view own property contrats" 
ON public.contrats 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.reservations r
    JOIN public.logements l ON r.logement_id = l.id
    WHERE r.id = contrats.reservation_id 
    AND l.bailleur_id = auth.uid()
  )
);
