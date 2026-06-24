
-- Performance indexes for critical queries
CREATE INDEX IF NOT EXISTS idx_reservations_etudiant_id ON public.reservations(etudiant_id);
CREATE INDEX IF NOT EXISTS idx_reservations_chambre_id ON public.reservations(chambre_id);
CREATE INDEX IF NOT EXISTS idx_reservations_logement_id ON public.reservations(logement_id);
CREATE INDEX IF NOT EXISTS idx_reservations_statut ON public.reservations(statut);
CREATE INDEX IF NOT EXISTS idx_reservations_created_at ON public.reservations(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_paiements_reservation_id ON public.paiements(reservation_id);
CREATE INDEX IF NOT EXISTS idx_paiements_etudiant_id ON public.paiements(etudiant_id);
CREATE INDEX IF NOT EXISTS idx_paiements_est_confirme ON public.paiements(est_confirme);

CREATE INDEX IF NOT EXISTS idx_chambres_logement_id ON public.chambres(logement_id);
CREATE INDEX IF NOT EXISTS idx_chambres_est_disponible ON public.chambres(est_disponible);

CREATE INDEX IF NOT EXISTS idx_logements_statut ON public.logements(statut);
CREATE INDEX IF NOT EXISTS idx_logements_bailleur_id ON public.logements(bailleur_id);
CREATE INDEX IF NOT EXISTS idx_logements_ville ON public.logements(ville);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);

CREATE INDEX IF NOT EXISTS idx_contrats_etudiant_id ON public.contrats(etudiant_id);
CREATE INDEX IF NOT EXISTS idx_contrats_reservation_id ON public.contrats(reservation_id);

CREATE INDEX IF NOT EXISTS idx_faqs_est_visible_ordre ON public.faqs(est_visible, ordre);
CREATE INDEX IF NOT EXISTS idx_temoignages_est_visible ON public.temoignages(est_visible);
