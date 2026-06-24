
-- Create 5 test users
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, aud, role, raw_user_meta_data)
VALUES
  ('b1000001-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'admin@zeyna.sn', crypt('admin123', gen_salt('bf')), now(), now(), now(), 'authenticated', 'authenticated', '{"nom":"Zeyna","prenom":"Admin","role":"admin"}'::jsonb),
  ('b1000001-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'bailleur1@zeyna.sn', crypt('bailleur123', gen_salt('bf')), now(), now(), now(), 'authenticated', 'authenticated', '{"nom":"Diallo","prenom":"Moussa","role":"bailleur"}'::jsonb),
  ('b1000001-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'bailleur2@zeyna.sn', crypt('bailleur123', gen_salt('bf')), now(), now(), now(), 'authenticated', 'authenticated', '{"nom":"Sow","prenom":"Ibrahima","role":"bailleur"}'::jsonb),
  ('b1000001-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000000', 'etudiant1@zeyna.sn', crypt('etudiant123', gen_salt('bf')), now(), now(), now(), 'authenticated', 'authenticated', '{"nom":"Ndiaye","prenom":"Aminata","role":"etudiant"}'::jsonb),
  ('b1000001-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000000', 'etudiant2@zeyna.sn', crypt('etudiant123', gen_salt('bf')), now(), now(), now(), 'authenticated', 'authenticated', '{"nom":"Ba","prenom":"Fatou","role":"etudiant"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, created_at, updated_at, last_sign_in_at)
VALUES
  ('b1000001-0000-0000-0000-000000000001', 'b1000001-0000-0000-0000-000000000001', '{"sub":"b1000001-0000-0000-0000-000000000001","email":"admin@zeyna.sn"}'::jsonb, 'email', 'b1000001-0000-0000-0000-000000000001', now(), now(), now()),
  ('b1000001-0000-0000-0000-000000000002', 'b1000001-0000-0000-0000-000000000002', '{"sub":"b1000001-0000-0000-0000-000000000002","email":"bailleur1@zeyna.sn"}'::jsonb, 'email', 'b1000001-0000-0000-0000-000000000002', now(), now(), now()),
  ('b1000001-0000-0000-0000-000000000003', 'b1000001-0000-0000-0000-000000000003', '{"sub":"b1000001-0000-0000-0000-000000000003","email":"bailleur2@zeyna.sn"}'::jsonb, 'email', 'b1000001-0000-0000-0000-000000000003', now(), now(), now()),
  ('b1000001-0000-0000-0000-000000000004', 'b1000001-0000-0000-0000-000000000004', '{"sub":"b1000001-0000-0000-0000-000000000004","email":"etudiant1@zeyna.sn"}'::jsonb, 'email', 'b1000001-0000-0000-0000-000000000004', now(), now(), now()),
  ('b1000001-0000-0000-0000-000000000005', 'b1000001-0000-0000-0000-000000000005', '{"sub":"b1000001-0000-0000-0000-000000000005","email":"etudiant2@zeyna.sn"}'::jsonb, 'email', 'b1000001-0000-0000-0000-000000000005', now(), now(), now())
ON CONFLICT DO NOTHING;

-- Profiles
INSERT INTO public.profiles (user_id, nom, prenom, telephone) VALUES
  ('b1000001-0000-0000-0000-000000000001', 'Zeyna', 'Admin', '+221 33 961 00 00'),
  ('b1000001-0000-0000-0000-000000000002', 'Diallo', 'Moussa', '+221 77 234 56 78'),
  ('b1000001-0000-0000-0000-000000000003', 'Sow', 'Ibrahima', '+221 76 345 67 89'),
  ('b1000001-0000-0000-0000-000000000004', 'Ndiaye', 'Aminata', '+221 77 456 78 90'),
  ('b1000001-0000-0000-0000-000000000005', 'Ba', 'Fatou', '+221 78 567 89 01')
ON CONFLICT DO NOTHING;

-- User roles
INSERT INTO public.user_roles (user_id, role, is_validated) VALUES
  ('b1000001-0000-0000-0000-000000000001', 'admin', true),
  ('b1000001-0000-0000-0000-000000000002', 'bailleur', true),
  ('b1000001-0000-0000-0000-000000000003', 'bailleur', false),
  ('b1000001-0000-0000-0000-000000000004', 'etudiant', true),
  ('b1000001-0000-0000-0000-000000000005', 'etudiant', true)
ON CONFLICT DO NOTHING;

-- Logements
INSERT INTO public.logements (id, bailleur_id, nom, adresse, ville, pays, type, description, conditions_electricite, latitude, longitude, statut) VALUES
  ('c1000001-0000-0000-0000-000000000001', 'b1000001-0000-0000-0000-000000000002', 'Résidence Sanar Elite', 'Sanar, à 200m de l''UGB', 'Saint-Louis', 'Sénégal', 'résidence', 'Résidence étudiante moderne à proximité de l''UGB. Chambres avec Wi-Fi. Gardien 24h/24.', 'Éclairage et chauffe-eau inclus. Équipements supplémentaires à charge du propriétaire.', 16.0617, -16.4350, 'valide'),
  ('c1000001-0000-0000-0000-000000000002', 'b1000001-0000-0000-0000-000000000002', 'Studio Diaminar', 'Diaminar, rue 10', 'Saint-Louis', 'Sénégal', 'studio', 'Studio indépendant meublé au cœur de Diaminar. Cuisine équipée, salle de bain privée.', 'Éclairage et chauffe-eau inclus. Équipements supplémentaires à charge du propriétaire.', 16.0203, -16.4895, 'valide'),
  ('c1000001-0000-0000-0000-000000000003', 'b1000001-0000-0000-0000-000000000003', 'Villa Étudiante Bango', 'Bango, route nationale', 'Saint-Louis', 'Sénégal', 'villa', 'Grande villa partagée à Bango avec jardin. Cadre verdoyant à 15 min de l''université.', 'Éclairage et chauffe-eau inclus. Équipements supplémentaires à charge du propriétaire.', 16.0812, -16.4128, 'valide'),
  ('c1000001-0000-0000-0000-000000000004', 'b1000001-0000-0000-0000-000000000002', 'Chambre Ngallèle', 'Ngallèle, quartier résidentiel', 'Saint-Louis', 'Sénégal', 'chambre', 'Chambre meublée dans maison familiale à Ngallèle. Ambiance conviviale.', 'Éclairage et chauffe-eau inclus. Équipements supplémentaires à charge du propriétaire.', 16.0345, -16.4567, 'en_attente'),
  ('c1000001-0000-0000-0000-000000000005', 'b1000001-0000-0000-0000-000000000003', 'Résidence Pikine SL', 'Pikine Saint-Louis, avenue principale', 'Saint-Louis', 'Sénégal', 'résidence', 'Résidence récente à Pikine Saint-Louis. Chambres spacieuses avec balcon.', 'Éclairage et chauffe-eau inclus. Équipements supplémentaires à charge du propriétaire.', 16.0489, -16.4712, 'valide')
ON CONFLICT (id) DO NOTHING;

-- Chambres
INSERT INTO public.chambres (id, logement_id, nom, nombre_personnes, prix_bailleur, prix_zeyna, marge, caution, description, est_disponible) VALUES
  ('d1000001-0000-0000-0000-000000000001', 'c1000001-0000-0000-0000-000000000001', 'Chambre Simple A', 1, 15000, 20000, 5000, 20000, 'Chambre individuelle avec lit, bureau et armoire', true),
  ('d1000001-0000-0000-0000-000000000002', 'c1000001-0000-0000-0000-000000000001', 'Chambre Double B', 2, 25000, 32000, 7000, 32000, 'Chambre pour 2 personnes avec lits superposés', true),
  ('d1000001-0000-0000-0000-000000000003', 'c1000001-0000-0000-0000-000000000002', 'Studio Meublé', 1, 30000, 40000, 10000, 40000, 'Studio complet avec cuisine et salle de bain privée', true),
  ('d1000001-0000-0000-0000-000000000004', 'c1000001-0000-0000-0000-000000000003', 'Chambre Jardin 1', 1, 12000, 18000, 6000, 18000, 'Chambre avec vue sur le jardin', true),
  ('d1000001-0000-0000-0000-000000000005', 'c1000001-0000-0000-0000-000000000003', 'Chambre Jardin 2', 2, 20000, 28000, 8000, 28000, 'Grande chambre pour 2 avec terrasse', true),
  ('d1000001-0000-0000-0000-000000000006', 'c1000001-0000-0000-0000-000000000003', 'Suite Familiale', 3, 35000, 45000, 10000, 45000, 'Suite spacieuse pour 3 personnes', false),
  ('d1000001-0000-0000-0000-000000000007', 'c1000001-0000-0000-0000-000000000004', 'Chambre Meublée', 1, 10000, NULL, NULL, 10000, 'Chambre simple dans maison familiale', true),
  ('d1000001-0000-0000-0000-000000000008', 'c1000001-0000-0000-0000-000000000005', 'Chambre Standard', 1, 18000, 25000, 7000, 25000, 'Chambre avec balcon', true),
  ('d1000001-0000-0000-0000-000000000009', 'c1000001-0000-0000-0000-000000000005', 'Chambre Premium', 2, 28000, 38000, 10000, 38000, 'Chambre premium avec climatisation', true),
  ('d1000001-0000-0000-0000-000000000010', 'c1000001-0000-0000-0000-000000000001', 'Chambre Triple C', 3, 35000, 45000, 10000, 45000, 'Grande chambre pour 3 étudiants', true)
ON CONFLICT (id) DO NOTHING;

-- Reservations
INSERT INTO public.reservations (id, etudiant_id, chambre_id, logement_id, montant_total, date_debut, date_fin, statut) VALUES
  ('e1000001-0000-0000-0000-000000000001', 'b1000001-0000-0000-0000-000000000004', 'd1000001-0000-0000-0000-000000000001', 'c1000001-0000-0000-0000-000000000001', 20000, '2026-03-15', '2026-09-15', 'confirmee'),
  ('e1000001-0000-0000-0000-000000000002', 'b1000001-0000-0000-0000-000000000004', 'd1000001-0000-0000-0000-000000000003', 'c1000001-0000-0000-0000-000000000002', 40000, '2026-04-01', '2026-10-01', 'en_attente'),
  ('e1000001-0000-0000-0000-000000000003', 'b1000001-0000-0000-0000-000000000005', 'd1000001-0000-0000-0000-000000000004', 'c1000001-0000-0000-0000-000000000003', 18000, '2026-03-20', '2026-08-20', 'confirmee'),
  ('e1000001-0000-0000-0000-000000000004', 'b1000001-0000-0000-0000-000000000005', 'd1000001-0000-0000-0000-000000000005', 'c1000001-0000-0000-0000-000000000003', 28000, '2026-05-01', NULL, 'en_attente'),
  ('e1000001-0000-0000-0000-000000000005', 'b1000001-0000-0000-0000-000000000004', 'd1000001-0000-0000-0000-000000000006', 'c1000001-0000-0000-0000-000000000003', 45000, '2026-02-01', '2026-07-01', 'annulee')
ON CONFLICT (id) DO NOTHING;

-- Paiements
INSERT INTO public.paiements (id, etudiant_id, reservation_id, montant, methode, reference, est_confirme) VALUES
  ('f1000001-0000-0000-0000-000000000001', 'b1000001-0000-0000-0000-000000000004', 'e1000001-0000-0000-0000-000000000001', 20000, 'orange_money', 'ZYN-PAY001', true),
  ('f1000001-0000-0000-0000-000000000002', 'b1000001-0000-0000-0000-000000000005', 'e1000001-0000-0000-0000-000000000003', 18000, 'mtn_money', 'ZYN-PAY002', true),
  ('f1000001-0000-0000-0000-000000000003', 'b1000001-0000-0000-0000-000000000004', 'e1000001-0000-0000-0000-000000000002', 40000, 'carte_bancaire', 'ZYN-PAY003', false),
  ('f1000001-0000-0000-0000-000000000004', 'b1000001-0000-0000-0000-000000000005', 'e1000001-0000-0000-0000-000000000004', 28000, 'moov_money', 'ZYN-PAY004', false),
  ('f1000001-0000-0000-0000-000000000005', 'b1000001-0000-0000-0000-000000000004', 'e1000001-0000-0000-0000-000000000005', 45000, 'orange_money', 'ZYN-PAY005', false)
ON CONFLICT (id) DO NOTHING;

-- Contrats
INSERT INTO public.contrats (id, etudiant_id, reservation_id, contenu) VALUES
  ('a0000001-0000-0000-0000-000000000001', 'b1000001-0000-0000-0000-000000000004', 'e1000001-0000-0000-0000-000000000001', '{"logement":"Résidence Sanar Elite","chambre":"Chambre Simple A","montant":20000,"reference":"ZYN-PAY001","date":"2026-03-15T00:00:00Z"}'::jsonb),
  ('a0000001-0000-0000-0000-000000000002', 'b1000001-0000-0000-0000-000000000005', 'e1000001-0000-0000-0000-000000000003', '{"logement":"Villa Étudiante Bango","chambre":"Chambre Jardin 1","montant":18000,"reference":"ZYN-PAY002","date":"2026-03-20T00:00:00Z"}'::jsonb)
ON CONFLICT (id) DO NOTHING;
