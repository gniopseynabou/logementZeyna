-- Correction : Accorder les permissions INSERT à anon et authenticated
-- sur la table demandes_partenariat
-- La politique RLS "Public can insert" existait déjà, mais sans le GRANT,
-- le rôle anon était bloqué au niveau des permissions de table (avant même RLS).

GRANT INSERT ON public.demandes_partenariat TO anon;
GRANT INSERT ON public.demandes_partenariat TO authenticated;

-- Accorder aussi SELECT/UPDATE pour les admins authentifiés (via RLS)
GRANT SELECT, UPDATE ON public.demandes_partenariat TO authenticated;
