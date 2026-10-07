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
  // Étape 1 : paiements confirmés avec jointure vers logements/chambres
  const { data: paiements, error } = await supabase
    .from("paiements")
    .select(`
      id,
      montant,
      est_confirme,
      created_at,
      reservations(
        etudiant_id,
        logement_id,
        chambres(nom, prix_bailleur, prix_zeyna),
        logements(nom, bailleur_id)
      )
    `)
    .eq("est_confirme", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  if (!paiements?.length) return [];

  // Étape 2 : récupérer les profils des bailleurs séparément
  const bailleurIds = [...new Set(
    paiements
      .map(p => (p as any).reservations?.logement_id ? (p as any).reservations?.logements?.bailleur_id : null)
      .filter(Boolean)
  )];

  let bailleurProfiles: { user_id: string; prenom: string; nom: string }[] = [];
  if (bailleurIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, prenom, nom")
      .in("user_id", bailleurIds);
    bailleurProfiles = profiles || [];
  }

  // Étape 3 : assembler - injecter le profil bailleur dans logements
  return paiements.map(p => {
    const res = (p as any).reservations;
    const bailleurId = res?.logements?.bailleur_id;
    const bailleur = bailleurProfiles.find(b => b.user_id === bailleurId);
    return {
      ...p,
      reservations: res
        ? {
            ...res,
            logements: res.logements
              ? { ...res.logements, bailleur }
              : res.logements,
          }
        : res,
    };
  });
};
