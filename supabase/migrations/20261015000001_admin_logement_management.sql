-- ============================================================
-- MIGRATION : Actions Administrateur sur Logements & Chambres
-- Permettre aux administrateurs (et super_admins) de :
-- 1. Supprimer un logement (DELETE)
-- 2. Insérer, modifier, supprimer des chambres (INSERT, UPDATE, DELETE)
-- 3. Gérer les images dans le bucket de stockage logements
-- ============================================================

-- 1. Politiques RLS DELETE sur public.logements
DROP POLICY IF EXISTS "Admins can delete all logements" ON public.logements;
CREATE POLICY "Admins can delete all logements" ON public.logements
  FOR DELETE USING (public.is_admin_or_super(auth.uid()));

-- 2. Politiques RLS sur public.chambres
DROP POLICY IF EXISTS "Admins can insert any chambre" ON public.chambres;
CREATE POLICY "Admins can insert any chambre" ON public.chambres
  FOR INSERT WITH CHECK (public.is_admin_or_super(auth.uid()));

DROP POLICY IF EXISTS "Admins can update all chambres" ON public.chambres;
CREATE POLICY "Admins can update all chambres" ON public.chambres
  FOR UPDATE USING (public.is_admin_or_super(auth.uid()));

DROP POLICY IF EXISTS "Admins can delete any chambre" ON public.chambres;
CREATE POLICY "Admins can delete any chambre" ON public.chambres
  FOR DELETE USING (public.is_admin_or_super(auth.uid()));

-- 3. Politiques de stockage dans bucket 'logements'
DROP POLICY IF EXISTS "Admins can delete any logement images" ON storage.objects;
CREATE POLICY "Admins can delete any logement images" ON storage.objects
  FOR DELETE USING (bucket_id = 'logements' AND public.is_admin_or_super(auth.uid()));

DROP POLICY IF EXISTS "Admins can upload any logement images" ON storage.objects;
CREATE POLICY "Admins can upload any logement images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'logements' AND public.is_admin_or_super(auth.uid()));
