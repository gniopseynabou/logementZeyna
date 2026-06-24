
-- Table témoignages
CREATE TABLE public.temoignages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text NOT NULL,
  role text NOT NULL,
  contenu text NOT NULL,
  note integer NOT NULL DEFAULT 5,
  est_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.temoignages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view visible temoignages" ON public.temoignages
  FOR SELECT USING (est_visible = true);

CREATE POLICY "Admins can manage temoignages" ON public.temoignages
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Table FAQs
CREATE TABLE public.faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  reponse text NOT NULL,
  ordre integer NOT NULL DEFAULT 0,
  est_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view visible faqs" ON public.faqs
  FOR SELECT USING (est_visible = true);

CREATE POLICY "Admins can manage faqs" ON public.faqs
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Table stats_site pour les KPIs hero
CREATE TABLE public.stats_site (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cle text NOT NULL UNIQUE,
  valeur text NOT NULL,
  label text NOT NULL,
  ordre integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.stats_site ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view stats" ON public.stats_site
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage stats" ON public.stats_site
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
