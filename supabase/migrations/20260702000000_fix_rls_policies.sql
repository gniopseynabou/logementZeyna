-- ============================================================
-- MIGRATION : Corrections et améliorations des RLS policies
-- À exécuter dans l'éditeur SQL de Supabase Dashboard
-- ============================================================

-- 1. CORRIGER la policy INSERT des contrats
-- (Actuellement seuls les admins peuvent insérer, 
--  mais les étudiants aussi doivent pouvoir créer un contrat après paiement)
DROP POLICY IF EXISTS "Admins can insert contrats" ON public.contrats;

CREATE POLICY "Etudiants can insert own contrats" ON public.contrats
  FOR INSERT WITH CHECK (auth.uid() = etudiant_id);

CREATE POLICY "Admins can insert any contrat" ON public.contrats
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 2. CORRIGER le trigger handle_new_user pour inclure le téléphone
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, nom, prenom, telephone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'nom', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'prenom', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'telephone', '')
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  INSERT INTO public.user_roles (user_id, role, is_validated)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data ->> 'role')::app_role, 'etudiant'),
    CASE 
      WHEN COALESCE(NEW.raw_user_meta_data ->> 'role', 'etudiant') = 'etudiant' THEN true 
      ELSE false 
    END
  )
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- 3. Ajouter policy pour permettre aux bailleurs de voir leurs propres réservations
-- (via leurs logements)
CREATE POLICY "Bailleurs can view reservations for their logements" ON public.reservations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.logements 
      WHERE id = reservations.logement_id 
      AND bailleur_id = auth.uid()
    )
  );

-- 4. Ajouter policy pour permettre aux bailleurs de mettre à jour les reservations 
-- sur leurs logements (par exemple confirmer/annuler)
CREATE POLICY "Bailleurs can update reservations for their logements" ON public.reservations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.logements 
      WHERE id = reservations.logement_id 
      AND bailleur_id = auth.uid()
    )
  );

-- 5. S'assurer que les buckets de stockage existent
INSERT INTO storage.buckets (id, name, public) 
VALUES ('logements', 'logements', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 6. Policies pour le stockage des avatars
CREATE POLICY "Users can view own avatar" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload own avatar" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own avatar" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- 7. Corriger les policies de stockage des logements (si pas déjà appliquées)
CREATE POLICY "Bailleurs can delete own logement images" ON storage.objects
  FOR DELETE USING (bucket_id = 'logements' AND auth.uid()::text = (storage.foldername(name))[1]);
