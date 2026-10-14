-- ============================================================
-- MIGRATION : Correction SEC-005
-- Sécurisation du bucket de stockage 'logements'
-- Restreint les téléversements aux bailleurs validés et administrateurs
-- et n'autorise que les extensions d'images légitimes (.jpg, .jpeg, .png, .webp)
-- ============================================================

-- 1. Supprimer l'ancienne politique permissive
DROP POLICY IF EXISTS "Authenticated users can upload logement images" ON storage.objects;
DROP POLICY IF EXISTS "Bailleurs and admins can upload logement images" ON storage.objects;

-- 2. Créer la politique stricte de téléversement
CREATE POLICY "Bailleurs and admins can upload logement images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'logements'
  AND (
    public.is_admin_or_super(auth.uid())
    OR public.is_validated_bailleur(auth.uid())
  )
  AND lower(storage.extension(name)) IN ('jpg', 'jpeg', 'png', 'webp')
);

-- 3. Renforcer la politique de mise à jour des images
DROP POLICY IF EXISTS "Users can update own logement images" ON storage.objects;
CREATE POLICY "Bailleurs and admins can update logement images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'logements'
  AND (
    public.is_admin_or_super(auth.uid())
    OR auth.uid()::text = (storage.foldername(name))[1]
  )
);
