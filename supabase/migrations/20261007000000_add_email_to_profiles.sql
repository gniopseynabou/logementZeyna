-- Migration : Ajout de l'email aux profils pour affichage Admin
-- Date : 2026-10-07

-- 1. Ajouter la colonne email à la table profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- 2. Rétro-compatibilité : peupler l'email pour les utilisateurs existants
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.user_id = u.id;

-- 3. Mettre à jour le trigger pour insérer l'email lors de l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role public.app_role;
  v_requested_role TEXT;
BEGIN
  -- Lire le rôle demandé depuis les métadonnées
  v_requested_role := COALESCE(NEW.raw_user_meta_data ->> 'role', 'etudiant');

  -- SÉCURITÉ CRITIQUE : seuls etudiant et bailleur peuvent être auto-assignés
  IF v_requested_role IN ('etudiant', 'bailleur') THEN
    v_role := v_requested_role::public.app_role;
  ELSE
    v_role := 'etudiant'::public.app_role;
  END IF;

  -- Créer le profil utilisateur avec l'email
  INSERT INTO public.profiles (user_id, email, nom, prenom, telephone)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'nom', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'prenom', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'telephone', '')
  )
  ON CONFLICT (user_id) DO UPDATE 
  SET email = EXCLUDED.email;

  -- Attribuer le rôle sécurisé
  INSERT INTO public.user_roles (user_id, role, is_validated)
  VALUES (
    NEW.id,
    v_role,
    CASE WHEN v_role = 'etudiant' THEN true ELSE false END
  )
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;
