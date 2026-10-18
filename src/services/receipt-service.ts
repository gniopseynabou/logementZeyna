import { supabase } from "@/integrations/supabase/client";

export interface RecuPaiement {
  id: string;
  reference: string;
  paiement_id: string | null;
  etudiant_id: string | null;
  logement_id: string | null;
  chambre_id: string | null;
  type_recu: "caution" | "loyer" | "frais_dossier" | "manuel" | "autre";
  type_generation: "automatique" | "manuel";
  montant: number;
  methode_paiement: string;
  reference_paiement: string | null;
  payeur_nom_complet: string;
  payeur_telephone: string | null;
  payeur_email: string | null;
  motif: string;
  date_emission: string;
  emetteur_id: string | null;
  details_json: any;
  created_at: string;
  logements?: { nom: string; adresse: string } | null;
  chambres?: { nom: string } | null;
}

export interface OperationRegistre {
  id: string;
  reference_operation: string;
  type_operation:
    | "encaissement_etudiant"
    | "reversement_bailleur"
    | "remboursement_caution"
    | "recu_manuel"
    | "ajustement";
  montant: number;
  devise: string;
  statut: "en_attente" | "valide" | "rejete" | "annule";
  mode_reglement: string;
  reference_externe: string | null;
  acteur_id: string | null;
  entite_type: string | null;
  entite_id: string | null;
  description: string;
  date_operation: string;
  metadata: any;
  created_at: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// REÇUS
// ─────────────────────────────────────────────────────────────────────────────

export const getReceipts = async (filters?: {
  etudiantId?: string;
  typeGeneration?: "automatique" | "manuel";
}): Promise<RecuPaiement[]> => {
  let query = supabase
    .from("recus_paiements")
    .select(`
      *,
      logements (nom, adresse),
      chambres (nom)
    `)
    .order("date_emission", { ascending: false });

  if (filters?.etudiantId) {
    query = query.eq("etudiant_id", filters.etudiantId);
  }
  if (filters?.typeGeneration) {
    query = query.eq("type_generation", filters.typeGeneration);
  }

  const { data, error } = await query;
  if (error) {
    console.warn("Table recus_paiements non accessible ou vide:", error.message);
    return [];
  }
  return (data || []) as unknown as RecuPaiement[];
};

export const createManualReceipt = async (input: {
  payeurNomComplet: string;
  payeurTelephone?: string;
  payeurEmail?: string;
  montant: number;
  motif: string;
  methodePaiement: string;
  referencePaiement?: string;
  typeRecu?: "caution" | "loyer" | "frais_dossier" | "manuel" | "autre";
  logementId?: string;
  chambreId?: string;
  observations?: string;
}): Promise<RecuPaiement> => {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const ref = `REC-MAN-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}-${randomSuffix}`;

  const { data, error } = await supabase
    .from("recus_paiements")
    .insert({
      reference: ref,
      type_generation: "manuel",
      type_recu: input.typeRecu || "manuel",
      montant: input.montant,
      methode_paiement: input.methodePaiement,
      reference_paiement: input.referencePaiement || null,
      payeur_nom_complet: input.payeurNomComplet,
      payeur_telephone: input.payeurTelephone || null,
      payeur_email: input.payeurEmail || null,
      motif: input.motif,
      logement_id: input.logementId || null,
      chambre_id: input.chambreId || null,
      details_json: input.observations ? { observations: input.observations } : {},
    })
    .select(`*, logements(nom, adresse), chambres(nom)`)
    .single();

  if (error) throw error;

  // Enregistrer également dans le registre des opérations
  try {
    await registerOperation({
      typeOperation: "recu_manuel",
      montant: input.montant,
      modeReglement: input.methodePaiement,
      referenceExterne: input.referencePaiement || ref,
      description: `Reçu manuel émis pour ${input.payeurNomComplet} : ${input.motif}`,
      entiteType: "recus_paiements",
      entiteId: data.id,
      metadata: { observations: input.observations },
    });
  } catch (opErr) {
    console.warn("Impossible d'enregistrer dans le registre:", opErr);
  }

  return data as unknown as RecuPaiement;
};

export const generateOrGetReceiptForPayment = async (
  paiementId: string
): Promise<RecuPaiement | null> => {
  // 1. Vérifier si un reçu existe déjà pour ce paiement
  const { data: existing } = await supabase
    .from("recus_paiements")
    .select(`*, logements(nom, adresse), chambres(nom)`)
    .eq("paiement_id", paiementId)
    .maybeSingle();

  if (existing) {
    return existing as unknown as RecuPaiement;
  }

  // 2. Récupérer les détails complets du paiement
  const { data: paiement, error: pError } = await supabase
    .from("paiements")
    .select(`
      *,
      reservations (
        etudiant_id,
        logement_id,
        chambre_id,
        logements (nom, adresse),
        chambres (nom)
      )
    `)
    .eq("id", paiementId)
    .single();

  if (pError || !paiement) return null;

  const res = (paiement as any).reservations;
  const etudiantId = res?.etudiant_id || (paiement as any).etudiant_id;

  // Récupérer le profil étudiant
  let profil: any = null;
  if (etudiantId) {
    const { data: pData } = await supabase
      .from("profiles")
      .select("prenom, nom, telephone, email")
      .eq("user_id", etudiantId)
      .maybeSingle();
    profil = pData;
  }

  const payeurNom = profil
    ? `${profil.prenom} ${profil.nom}`.trim()
    : "Locataire Étudiant";
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const ref = `REC-AUT-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}-${randomSuffix}`;

  const { data: newReceipt, error: insError } = await supabase
    .from("recus_paiements")
    .insert({
      reference: ref,
      paiement_id: paiementId,
      etudiant_id: etudiantId,
      logement_id: res?.logement_id || null,
      chambre_id: res?.chambre_id || null,
      type_recu: "caution",
      type_generation: "automatique",
      montant: paiement.montant,
      methode_paiement: (paiement as any).methode || "Wave",
      reference_paiement: (paiement as any).reference_transaction || null,
      payeur_nom_complet: payeurNom,
      payeur_telephone: profil?.telephone || null,
      payeur_email: profil?.email || null,
      motif: "Règlement du dépôt de garantie (caution locative) et réservation",
    })
    .select(`*, logements(nom, adresse), chambres(nom)`)
    .single();

  if (insError) {
    console.warn("Erreur création auto-reçu:", insError.message);
    return null;
  }

  return newReceipt as unknown as RecuPaiement;
};

// ─────────────────────────────────────────────────────────────────────────────
// REGISTRE DES OPÉRATIONS
// ─────────────────────────────────────────────────────────────────────────────

export const registerOperation = async (input: {
  typeOperation:
    | "encaissement_etudiant"
    | "reversement_bailleur"
    | "remboursement_caution"
    | "recu_manuel"
    | "ajustement";
  montant: number;
  modeReglement: string;
  description: string;
  referenceExterne?: string;
  entiteType?: string;
  entiteId?: string;
  metadata?: any;
}) => {
  const seq = Math.floor(10000 + Math.random() * 90000);
  const ref = `OP-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}-${seq}`;

  const { data, error } = await supabase
    .from("registre_operations")
    .insert({
      reference_operation: ref,
      type_operation: input.typeOperation,
      montant: input.montant,
      statut: "valide",
      mode_reglement: input.modeReglement,
      reference_externe: input.referenceExterne || null,
      description: input.description,
      entite_type: input.entiteType || null,
      entite_id: input.entiteId || null,
      metadata: input.metadata || {},
    })
    .select()
    .single();

  if (error) {
    console.warn("Erreur insertion registre opérations:", error.message);
  }
  return data;
};

export const getOperationsRegister = async (): Promise<OperationRegistre[]> => {
  const { data, error } = await supabase
    .from("registre_operations")
    .select("*")
    .order("date_operation", { ascending: false });

  if (error) {
    console.warn("Erreur lecture registre opérations:", error.message);
    return [];
  }
  return (data || []) as OperationRegistre[];
};
