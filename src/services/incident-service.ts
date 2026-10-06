import { supabase } from "@/integrations/supabase/client";

export type IncidentStatut = "nouveau" | "en_cours" | "en_attente" | "resolu" | "cloture";
export type IncidentPriorite = "basse" | "normale" | "haute" | "urgente";
export type IncidentCategorie = "maintenance" | "paiement" | "comportement" | "securite" | "autre";

export interface Incident {
  id: string;
  etudiant_id: string;
  logement_id: string;
  chambre_id: string | null;
  titre: string;
  description: string;
  categorie: IncidentCategorie;
  priorite: IncidentPriorite;
  statut: IncidentStatut;
  photos: string[];
  created_at: string;
  updated_at: string;
  etudiant?: { prenom: string; nom: string; telephone: string };
  logement?: { nom: string; adresse: string };
  chambre?: { nom: string };
}

export const getAdminIncidents = async (): Promise<Incident[]> => {
  // Étape 1 : récupérer les incidents avec les jointures logement et chambre (FK directes valides)
  const { data: incidents, error } = await supabase
    .from("incidents")
    .select(`
      *,
      logement:logements(nom, adresse),
      chambre:chambres(nom)
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;
  if (!incidents?.length) return [];

  // Étape 2 : récupérer les profils des étudiants séparément (etudiant_id → auth.users, pas profiles directement)
  const etudiantIds = [...new Set(incidents.map(i => i.etudiant_id).filter(Boolean))];
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("user_id, prenom, nom, telephone")
    .in("user_id", etudiantIds);

  if (profilesError) throw profilesError;

  // Étape 3 : assembler
  return incidents.map(inc => ({
    ...inc,
    etudiant: profiles?.find(p => p.user_id === inc.etudiant_id),
  })) as Incident[];
};

export const getEtudiantIncidents = async (etudiantId: string): Promise<Incident[]> => {
  const { data, error } = await supabase
    .from("incidents")
    .select(`
      *,
      logement:logements(nom, adresse),
      chambre:chambres(nom)
    `)
    .eq("etudiant_id", etudiantId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
};

export const updateIncidentStatut = async (id: string, statut: IncidentStatut): Promise<void> => {
  const { error } = await supabase
    .from("incidents")
    .update({ statut, updated_at: new Date().toISOString() })
    .eq("id", id);
    
  if (error) throw error;
};

export const createIncident = async (incident: Omit<Incident, "id" | "created_at" | "updated_at">): Promise<Incident> => {
  const { data, error } = await supabase
    .from("incidents")
    .insert(incident)
    .select()
    .single();

  if (error) throw error;
  return data;
};
