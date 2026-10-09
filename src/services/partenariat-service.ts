import { supabase } from "@/integrations/supabase/client";

export type StatutDemande = "en_attente" | "contacte" | "acceptee" | "rejetee";

export interface DemandePartenariat {
  id?: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  ville?: string;
  nombre_logements?: number;
  message?: string;
  statut?: StatutDemande;
  created_at?: string;
}

export const submitDemandePartenariat = async (demande: Omit<DemandePartenariat, "id" | "statut" | "created_at">) => {
  const { error } = await supabase
    .from("demandes_partenariat")
    .insert([demande]);

  if (error) throw error;
};

export const getDemandesPartenariat = async () => {
  const { data, error } = await supabase
    .from("demandes_partenariat")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    // Si la table n'existe pas encore (migration non passée), on renvoie un tableau vide
    // Le code d'erreur PostgREST pour "relation does not exist" est 42P01
    if (error.code === '42P01') {
      return [];
    }
    throw error;
  }
  return data as DemandePartenariat[];
};

export const updateDemandeStatut = async (id: string, statut: StatutDemande) => {
  const { error } = await supabase
    .from("demandes_partenariat")
    .update({ statut })
    .eq("id", id);

  if (error) throw error;
};
