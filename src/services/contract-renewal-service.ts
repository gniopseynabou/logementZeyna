import { supabase } from "@/integrations/supabase/client";

export interface ExpiringContract {
  id: string;
  reservation_id: string;
  etudiant_id: string;
  date_debut: string | null;
  date_fin: string | null;
  loyer_mensuel: number | null;
  statut_contrat: string;
  created_at: string;
  contenu: any;
  reservations?: {
    logements?: {
      id: string;
      nom: string;
      adresse: string;
      ville: string;
      type: string;
    } | null;
    chambres?: {
      id: string;
      nom: string;
      prix_zeyna: number | null;
      caution: number | null;
    } | null;
    profiles?: {
      prenom: string;
      nom: string;
      telephone: string | null;
      email: string | null;
    } | null;
  } | null;
  proprietaire?: {
    prenom: string;
    nom: string;
    telephone: string;
    email: string | null;
  } | null;
  rappels?: Array<{
    id: string;
    date_rappel: string;
    type_canal: string;
    statut_envoi: string;
    message: string;
  }>;
}

export const getExpiringContracts = async (daysThreshold: number = 30): Promise<ExpiringContract[]> => {
  const thresholdDate = new Date();
  thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);
  const thresholdStr = thresholdDate.toISOString().split("T")[0];

  const { data: contratsData, error } = await supabase
    .from("contrats")
    .select(`
      *,
      reservations (
        id,
        date_debut,
        date_fin,
        logements (id, nom, adresse, ville, type),
        chambres (id, nom, prix_zeyna, caution)
      )
    `)
    .order("date_fin", { ascending: true });

  if (error) throw error;
  if (!contratsData || contratsData.length === 0) return [];

  // Récupérer les profils étudiants
  const studentIds = Array.from(new Set(contratsData.map((c) => c.etudiant_id).filter(Boolean)));
  const studentMap = new Map<string, any>();
  if (studentIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, prenom, nom, telephone, email")
      .in("user_id", studentIds);
    if (profiles) {
      profiles.forEach((p) => studentMap.set(p.user_id, p));
    }
  }

  // Récupérer les propriétaires
  const logementIds = Array.from(
    new Set(contratsData.map((c: any) => c.reservations?.logements?.id).filter(Boolean))
  );
  const proprietaireMap = new Map<string, any>();
  if (logementIds.length > 0) {
    try {
      const { data: props } = await supabase
        .from("logement_proprietaires")
        .select("*")
        .in("logement_id", logementIds);
      if (props) {
        props.forEach((p) => proprietaireMap.set(p.logement_id, p));
      }
    } catch {
      // Table optionnelle
    }
  }

  // Récupérer les rappels envoyés pour chaque contrat
  const contratIds = contratsData.map((c) => c.id);
  const rappelsMap = new Map<string, any[]>();
  if (contratIds.length > 0) {
    try {
      const { data: rappels } = await supabase
        .from("contrat_rappels")
        .select("*")
        .in("contrat_id", contratIds)
        .order("date_rappel", { ascending: false });
      if (rappels) {
        rappels.forEach((r) => {
          const list = rappelsMap.get(r.contrat_id) || [];
          list.push(r);
          rappelsMap.set(r.contrat_id, list);
        });
      }
    } catch {
      // Table optionnelle
    }
  }

  const enriched: ExpiringContract[] = contratsData.map((c: any) => {
    const logId = c.reservations?.logements?.id;
    return {
      ...c,
      reservations: c.reservations
        ? {
            ...c.reservations,
            profiles: studentMap.get(c.etudiant_id) || null,
          }
        : null,
      proprietaire: logId ? proprietaireMap.get(logId) || null : null,
      rappels: rappelsMap.get(c.id) || [],
    };
  });

  // Filtrer les contrats arrivant à échéance (date_fin <= now + 30 days) ou dont date_fin est passée
  return enriched.filter((c) => {
    if (!c.date_fin) return false;
    return c.date_fin <= thresholdStr;
  });
};

export const sendContractReminder = async ({
  contratId,
  typeCanal = "plateforme",
  message,
  notes,
}: {
  contratId: string;
  typeCanal?: string;
  message: string;
  notes?: string;
}) => {
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("contrat_rappels")
    .insert({
      contrat_id: contratId,
      administrateur_id: user?.id || null,
      type_canal: typeCanal,
      message,
      notes: notes || null,
      statut_envoi: "envoye",
      date_rappel: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const requestContractRenewal = async ({
  contratId,
  etudiantId,
  nouvelleDateDebut,
  nouvelleDateFin,
  tarifActuel,
}: {
  contratId: string;
  etudiantId: string;
  nouvelleDateDebut: string;
  nouvelleDateFin: string;
  tarifActuel: number;
}) => {
  const { data: contrat } = await supabase
    .from("contrats")
    .select("date_debut, date_fin, loyer_mensuel")
    .eq("id", contratId)
    .single();

  const { data, error } = await supabase
    .from("contrat_renouvellements")
    .insert({
      contrat_id: contratId,
      etudiant_id: etudiantId,
      periode_precedente_debut: contrat?.date_debut || null,
      periode_precedente_fin: contrat?.date_fin || null,
      tarif_precedent: tarifActuel,
      nouvelle_date_debut: nouvelleDateDebut,
      nouvelle_date_fin: nouvelleDateFin,
      statut: "en_attente",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getStudentRenewals = async (studentId: string) => {
  const { data, error } = await supabase
    .from("contrat_renouvellements")
    .select(`
      *,
      contrats (
        id,
        date_debut,
        date_fin,
        loyer_mensuel,
        reservations (
          logements (nom, adresse, ville),
          chambres (nom)
        )
      )
    `)
    .eq("etudiant_id", studentId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
};

export const getAdminRenewals = async () => {
  const { data, error } = await supabase
    .from("contrat_renouvellements")
    .select(`
      *,
      contrats (
        id,
        date_debut,
        date_fin,
        loyer_mensuel,
        reservations (
          logements (id, nom, adresse, ville),
          chambres (nom)
        )
      )
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;
  const list = data || [];

  // Récupérer les profils et les propriétaires
  const studentIds = Array.from(new Set(list.map((r) => r.etudiant_id).filter(Boolean)));
  const studentMap = new Map<string, any>();
  if (studentIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, prenom, nom, telephone, email")
      .in("user_id", studentIds);
    if (profiles) {
      profiles.forEach((p) => studentMap.set(p.user_id, p));
    }
  }

  const logementIds = Array.from(
    new Set(list.map((r: any) => r.contrats?.reservations?.logements?.id).filter(Boolean))
  );
  const proprietaireMap = new Map<string, any>();
  if (logementIds.length > 0) {
    try {
      const { data: props } = await supabase
        .from("logement_proprietaires")
        .select("*")
        .in("logement_id", logementIds);
      if (props) {
        props.forEach((p) => proprietaireMap.set(p.logement_id, p));
      }
    } catch {
      // Table optionnelle
    }
  }

  return list.map((item: any) => ({
    ...item,
    etudiant: studentMap.get(item.etudiant_id) || null,
    proprietaire: proprietaireMap.get(item.contrats?.reservations?.logements?.id) || null,
  }));
};

export const adminRespondToRenewal = async ({
  renewalId,
  decision,
  nouveauTarif,
  motifModification,
  motifRefus,
}: {
  renewalId: string;
  decision: "valider_meme_tarif" | "proposer_nouveau_tarif" | "valider_apres_accord" | "refuser";
  nouveauTarif?: number;
  motifModification?: string;
  motifRefus?: string;
}) => {
  if (decision === "valider_meme_tarif" || decision === "valider_apres_accord") {
    // Tenter la procédure stockée atomique
    try {
      const { data, error: rpcError } = await supabase.rpc(
        "finaliser_renouvellement_contrat" as any,
        { p_renouvellement_id: renewalId }
      );
      if (!rpcError) return data;
    } catch {
      // fallback séquentiel
    }

    // Récupérer le renouvellement pour mettre à jour le contrat
    const { data: ren } = await supabase
      .from("contrat_renouvellements")
      .select("*")
      .eq("id", renewalId)
      .single();

    if (!ren) throw new Error("Renouvellement introuvable");

    const finalTarif = ren.nouveau_tarif_propose || ren.tarif_precedent;

    // 1. Mettre à jour le contrat
    await supabase
      .from("contrats")
      .update({
        date_fin: ren.nouvelle_date_fin,
        loyer_mensuel: finalTarif,
      })
      .eq("id", ren.contrat_id);

    // 2. Mettre à jour le renouvellement
    const { error: renError } = await supabase
      .from("contrat_renouvellements")
      .update({
        statut: "valide",
        date_decision: new Date().toISOString(),
      })
      .eq("id", renewalId);

    if (renError) throw renError;

    // 3. Ajouter à l'historique des périodes
    await supabase.from("contrat_periodes_historique").insert({
      contrat_id: ren.contrat_id,
      numero_periode: 2,
      date_debut: ren.nouvelle_date_debut,
      date_fin: ren.nouvelle_date_fin,
      loyer_mensuel: finalTarif,
      motif_modification: ren.motif_modification_tarif || null,
      renouvellement_id: renewalId,
    });

    return { success: true };
  }

  if (decision === "proposer_nouveau_tarif") {
    if (!nouveauTarif) throw new Error("Veuillez renseigner le nouveau tarif proposé.");
    if (!motifModification || !motifModification.trim()) {
      throw new Error("Le motif de la modification de tarif est obligatoire.");
    }

    const { error } = await supabase
      .from("contrat_renouvellements")
      .update({
        statut: "propose_tarif_modifie",
        nouveau_tarif_propose: nouveauTarif,
        motif_modification_tarif: motifModification.trim(),
        date_decision: new Date().toISOString(),
      })
      .eq("id", renewalId);

    if (error) throw error;
    return { success: true };
  }

  if (decision === "refuser") {
    if (!motifRefus || !motifRefus.trim()) {
      throw new Error("Le motif du refus est obligatoire.");
    }

    const { error } = await supabase
      .from("contrat_renouvellements")
      .update({
        statut: "refuse",
        motif_refus: motifRefus.trim(),
        date_decision: new Date().toISOString(),
      })
      .eq("id", renewalId);

    if (error) throw error;
    return { success: true };
  }
};

export const studentRespondToTariff = async ({
  renewalId,
  accept,
}: {
  renewalId: string;
  accept: boolean;
}) => {
  const { error } = await supabase
    .from("contrat_renouvellements")
    .update({
      statut: accept ? "accepte_par_etudiant" : "refuse_par_etudiant",
      date_acceptation_etudiant: accept ? new Date().toISOString() : null,
    })
    .eq("id", renewalId);

  if (error) throw error;
  return { success: true };
};

export const getContractFullHistory = async (contratId: string) => {
  const [contratRes, periodesRes, rappelsRes, renouvellementsRes] = await Promise.all([
    supabase.from("contrats").select("*, reservations(*, logements(*), chambres(*))").eq("id", contratId).single(),
    supabase.from("contrat_periodes_historique").select("*").eq("contrat_id", contratId).order("numero_periode", { ascending: true }),
    supabase.from("contrat_rappels").select("*").eq("contrat_id", contratId).order("date_rappel", { ascending: false }),
    supabase.from("contrat_renouvellements").select("*").eq("contrat_id", contratId).order("created_at", { ascending: false }),
  ]);

  return {
    contrat: contratRes.data,
    periodes: periodesRes.data || [],
    rappels: rappelsRes.data || [],
    renouvellements: renouvellementsRes.data || [],
  };
};
