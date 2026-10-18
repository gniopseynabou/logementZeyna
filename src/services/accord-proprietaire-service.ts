import { supabase } from "@/integrations/supabase/client";

export interface AccordProprietaire {
  id: string;
  logement_id: string;
  bailleur_id: string | null;
  reference_accord: string;
  type_accord: string;
  statut: "en_attente_signature" | "signe" | "actif" | "renouvele" | "resilie";
  date_effet: string;
  date_fin: string | null;
  date_signature: string | null;
  conditions_particulieres: string | null;
  representant_zeyna: string | null;
  commission_pourcentage: number | null;
  created_at: string;
  updated_at: string;
  logement?: {
    id: string;
    nom: string;
    adresse: string;
    ville: string;
    type: string;
    chambres?: Array<{
      id: string;
      nom: string;
      prix_bailleur: number;
      prix_zeyna: number | null;
    }>;
  };
  bailleur?: {
    user_id: string;
    prenom: string;
    nom: string;
    telephone: string | null;
    email: string | null;
  };
}

export const getAdminAccords = async (): Promise<AccordProprietaire[]> => {
  const { data: accords, error } = await supabase
    .from("accords_proprietaires")
    .select(`
      *,
      logement:logements(
        id,
        nom,
        adresse,
        ville,
        type,
        chambres(id, nom, prix_bailleur, prix_zeyna)
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.warn("Table accords_proprietaires non trouvée ou erreur:", error.message);
    return [];
  }

  const list = (accords || []) as any[];
  const bailleurIds = Array.from(new Set(list.map((a) => a.bailleur_id).filter(Boolean)));

  const profileMap = new Map<string, any>();
  if (bailleurIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, prenom, nom, telephone, email")
      .in("user_id", bailleurIds);

    if (profiles) {
      profiles.forEach((p) => profileMap.set(p.user_id, p));
    }
  }

  return list.map((a) => ({
    ...a,
    bailleur: profileMap.get(a.bailleur_id) || null,
  })) as AccordProprietaire[];
};

export const getBailleurAccords = async (bailleurId: string): Promise<AccordProprietaire[]> => {
  const { data: accords, error } = await supabase
    .from("accords_proprietaires")
    .select(`
      *,
      logement:logements(
        id,
        nom,
        adresse,
        ville,
        type,
        chambres(id, nom, prix_bailleur, prix_zeyna)
      )
    `)
    .eq("bailleur_id", bailleurId)
    .order("created_at", { ascending: false });

  if (error) {
    console.warn("Erreur chargement accords bailleur:", error.message);
    return [];
  }

  return (accords || []) as any[];
};

export const createOrUpdateAccord = async (input: {
  logement_id: string;
  bailleur_id: string;
  reference_accord?: string;
  date_effet?: string;
  date_fin?: string;
  statut?: "en_attente_signature" | "signe" | "actif";
  conditions_particulieres?: string;
  commission_pourcentage?: number;
}) => {
  const ref =
    input.reference_accord ||
    `CONV-${input.logement_id.slice(0, 8).toUpperCase()}-${new Date().getFullYear()}`;

  const { data: existing } = await supabase
    .from("accords_proprietaires")
    .select("id")
    .eq("logement_id", input.logement_id)
    .maybeSingle();

  if (existing) {
    const { data, error } = await supabase
      .from("accords_proprietaires")
      .update({
        statut: input.statut || "signe",
        date_signature: new Date().toISOString(),
        conditions_particulieres: input.conditions_particulieres,
        commission_pourcentage: input.commission_pourcentage ?? 0,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  const { data, error } = await supabase
    .from("accords_proprietaires")
    .insert({
      logement_id: input.logement_id,
      bailleur_id: input.bailleur_id,
      reference_accord: ref,
      statut: input.statut || "signe",
      date_effet: input.date_effet || new Date().toISOString().split("T")[0],
      date_fin: input.date_fin || null,
      date_signature: new Date().toISOString(),
      conditions_particulieres: input.conditions_particulieres || null,
      commission_pourcentage: input.commission_pourcentage ?? 0,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};
