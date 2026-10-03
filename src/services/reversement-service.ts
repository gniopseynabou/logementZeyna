import { supabase } from "@/integrations/supabase/client";

export type ReversementStatut = "en_attente" | "traite" | "annule";

export interface Reversement {
  id: string;
  bailleur_id: string;
  paiement_id: string;
  montant: number;
  statut: ReversementStatut;
  date_reversement: string | null;
  reference_transaction: string | null;
  created_at: string;
  bailleur?: { prenom: string; nom: string; telephone: string };
  paiement?: {
    montant: number;
    created_at: string;
    reservations: {
      chambres: { nom: string; prix_bailleur: number };
      logements: { nom: string };
    };
  };
}

export const getAdminReversements = async (): Promise<Reversement[]> => {
  const { data, error } = await supabase
    .from("reversements")
    .select(`
      *,
      bailleur:profiles!reversements_bailleur_id_fkey(prenom, nom, telephone),
      paiement:paiements!reversements_paiement_id_fkey(
        montant,
        created_at,
        reservations(
          chambres(nom, prix_bailleur),
          logements(nom)
        )
      )
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
};

export const getBailleurReversements = async (bailleurId: string): Promise<Reversement[]> => {
  const { data, error } = await supabase
    .from("reversements")
    .select(`
      *,
      paiement:paiements!reversements_paiement_id_fkey(
        montant,
        created_at,
        reservations(
          chambres(nom, prix_bailleur),
          logements(nom)
        )
      )
    `)
    .eq("bailleur_id", bailleurId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
};

export const updateReversementStatut = async (
  id: string,
  statut: ReversementStatut,
  referenceTransaction?: string
): Promise<void> => {
  const updates: Record<string, unknown> = { statut };
  if (statut === "traite") {
    updates.date_reversement = new Date().toISOString();
    if (referenceTransaction) updates.reference_transaction = referenceTransaction;
  }

  const { error } = await supabase
    .from("reversements")
    .update(updates)
    .eq("id", id);

  if (error) throw error;
};

export const createReversement = async (
  baileurId: string,
  paiementId: string,
  montant: number
): Promise<Reversement> => {
  const { data, error } = await supabase
    .from("reversements")
    .insert({ bailleur_id: baileurId, paiement_id: paiementId, montant, statut: "en_attente" })
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Calcule les reversements estimés pour les bailleurs
 * basé sur les paiements confirmés et le prix bailleur des chambres.
 * Utilisé en fallback si la table reversements n'est pas encore peuplée.
 */
export const getReversementsEstimes = async () => {
  const { data, error } = await supabase
    .from("paiements")
    .select(`
      id,
      montant,
      statut,
      created_at,
      reservations(
        etudiant_id,
        logement_id,
        chambres(nom, prix_bailleur, prix_zeyna),
        logements(nom, bailleur_id, bailleur:profiles!logements_bailleur_id_fkey(prenom, nom))
      )
    `)
    .eq("statut", "confirme")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
};
