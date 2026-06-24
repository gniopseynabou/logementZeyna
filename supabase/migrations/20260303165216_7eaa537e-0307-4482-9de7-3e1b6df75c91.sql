
-- Enum for roles
CREATE TYPE public.app_role AS ENUM ('admin', 'bailleur', 'etudiant');

-- Enum for reservation status
CREATE TYPE public.reservation_statut AS ENUM ('en_attente', 'confirmee', 'annulee');

-- Enum for logement status
CREATE TYPE public.logement_statut AS ENUM ('en_attente', 'valide', 'rejete');

-- Enum for paiement method
CREATE TYPE public.paiement_methode AS ENUM ('orange_money', 'mtn_money', 'moov_money', 'carte_bancaire');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  nom TEXT NOT NULL DEFAULT '',
  prenom TEXT NOT NULL DEFAULT '',
  telephone TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  is_validated BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Logements table
CREATE TABLE public.logements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bailleur_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nom TEXT NOT NULL,
  description TEXT DEFAULT '',
  adresse TEXT NOT NULL,
  ville TEXT NOT NULL,
  pays TEXT NOT NULL DEFAULT 'Niger',
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  type TEXT NOT NULL DEFAULT 'résidence',
  images TEXT[] DEFAULT '{}',
  conditions_electricite TEXT DEFAULT 'Éclairage et chauffe-eau inclus. Équipements supplémentaires à charge du propriétaire.',
  statut logement_statut NOT NULL DEFAULT 'en_attente',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Chambres table
CREATE TABLE public.chambres (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  logement_id UUID REFERENCES public.logements(id) ON DELETE CASCADE NOT NULL,
  nom TEXT NOT NULL,
  description TEXT DEFAULT '',
  prix_bailleur INTEGER NOT NULL,
  prix_zeyna INTEGER,
  marge INTEGER,
  nombre_personnes INTEGER NOT NULL DEFAULT 1,
  caution INTEGER DEFAULT 0,
  est_disponible BOOLEAN NOT NULL DEFAULT true,
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Reservations table
CREATE TABLE public.reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  etudiant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  chambre_id UUID REFERENCES public.chambres(id) ON DELETE CASCADE NOT NULL,
  logement_id UUID REFERENCES public.logements(id) ON DELETE CASCADE NOT NULL,
  date_debut DATE NOT NULL,
  date_fin DATE,
  statut reservation_statut NOT NULL DEFAULT 'en_attente',
  montant_total INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Paiements table
CREATE TABLE public.paiements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID REFERENCES public.reservations(id) ON DELETE CASCADE NOT NULL,
  etudiant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  montant INTEGER NOT NULL,
  methode paiement_methode NOT NULL,
  reference TEXT,
  est_confirme BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Contrats table
CREATE TABLE public.contrats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID REFERENCES public.reservations(id) ON DELETE CASCADE NOT NULL,
  etudiant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  contenu JSONB DEFAULT '{}',
  url_pdf TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chambres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paiements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contrats ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Check if user is validated bailleur
CREATE OR REPLACE FUNCTION public.is_validated_bailleur(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'bailleur' AND is_validated = true
  )
$$;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, nom, prenom)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'nom', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'prenom', '')
  );
  
  INSERT INTO public.user_roles (user_id, role, is_validated)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data ->> 'role')::app_role, 'etudiant'),
    CASE WHEN COALESCE(NEW.raw_user_meta_data ->> 'role', 'etudiant') = 'etudiant' THEN true ELSE false END
  );
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_logements_updated_at BEFORE UPDATE ON public.logements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_chambres_updated_at BEFORE UPDATE ON public.chambres FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON public.reservations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===== RLS POLICIES =====

-- PROFILES
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- USER_ROLES
CREATE POLICY "Users can view own role" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update roles" ON public.user_roles FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- LOGEMENTS
CREATE POLICY "Anyone can view validated logements" ON public.logements FOR SELECT USING (statut = 'valide');
CREATE POLICY "Bailleurs can view own logements" ON public.logements FOR SELECT USING (auth.uid() = bailleur_id);
CREATE POLICY "Bailleurs can insert logements" ON public.logements FOR INSERT WITH CHECK (auth.uid() = bailleur_id);
CREATE POLICY "Bailleurs can update own logements" ON public.logements FOR UPDATE USING (auth.uid() = bailleur_id);
CREATE POLICY "Admins can view all logements" ON public.logements FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update all logements" ON public.logements FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- CHAMBRES
CREATE POLICY "Anyone can view chambres of validated logements" ON public.chambres FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.logements WHERE id = logement_id AND statut = 'valide')
);
CREATE POLICY "Bailleurs can manage own chambres" ON public.chambres FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.logements WHERE id = logement_id AND bailleur_id = auth.uid())
);
CREATE POLICY "Bailleurs can update own chambres" ON public.chambres FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.logements WHERE id = logement_id AND bailleur_id = auth.uid())
);
CREATE POLICY "Bailleurs can view own chambres" ON public.chambres FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.logements WHERE id = logement_id AND bailleur_id = auth.uid())
);
CREATE POLICY "Admins can view all chambres" ON public.chambres FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update all chambres" ON public.chambres FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- RESERVATIONS
CREATE POLICY "Etudiants can view own reservations" ON public.reservations FOR SELECT USING (auth.uid() = etudiant_id);
CREATE POLICY "Etudiants can insert reservations" ON public.reservations FOR INSERT WITH CHECK (auth.uid() = etudiant_id);
CREATE POLICY "Etudiants can update own reservations" ON public.reservations FOR UPDATE USING (auth.uid() = etudiant_id AND statut = 'en_attente');
CREATE POLICY "Admins can view all reservations" ON public.reservations FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update all reservations" ON public.reservations FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- PAIEMENTS
CREATE POLICY "Etudiants can view own paiements" ON public.paiements FOR SELECT USING (auth.uid() = etudiant_id);
CREATE POLICY "Etudiants can insert paiements" ON public.paiements FOR INSERT WITH CHECK (auth.uid() = etudiant_id);
CREATE POLICY "Admins can view all paiements" ON public.paiements FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update paiements" ON public.paiements FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- CONTRATS
CREATE POLICY "Etudiants can view own contrats" ON public.contrats FOR SELECT USING (auth.uid() = etudiant_id);
CREATE POLICY "Admins can view all contrats" ON public.contrats FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert contrats" ON public.contrats FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Storage bucket for logement images
INSERT INTO storage.buckets (id, name, public) VALUES ('logements', 'logements', true);

CREATE POLICY "Anyone can view logement images" ON storage.objects FOR SELECT USING (bucket_id = 'logements');
CREATE POLICY "Authenticated users can upload logement images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'logements' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update own logement images" ON storage.objects FOR UPDATE USING (bucket_id = 'logements' AND auth.uid()::text = (storage.foldername(name))[1]);
