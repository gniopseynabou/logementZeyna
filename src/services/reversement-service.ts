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
  // Protection du secret d'affaires ZEYNA (SEC-007) :
  // Le bailleur a accès à son montant reversé (reversements.montant) et aux détails de la chambre,
  // mais la somme totale payée par l'étudiant à ZEYNA (paiements.montant) est masquée.
  const { data, error } = await supabase
    .from("reversements")
    .select(`
      *,
      paiement:paiements!reversements_paiement_id_fkey(
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
  return (data || []) as Reversement[];
};

export const updateReversementStatut = async (
  id: string,
  statut: ReversementStatut,
  referenceTransaction?: string,
  modePaiement: string = "Wave"
): Promise<void> => {
  const updates: Record<string, unknown> = { statut };
  if (statut === "traite") {
    updates.date_reversement = new Date().toISOString();
    if (referenceTransaction) updates.reference_transaction = referenceTransaction;
  }

  const { data: rev, error } = await supabase
    .from("reversements")
    .update(updates)
    .eq("id", id)
    .select(`*, bailleur:profiles!reversements_bailleur_id_fkey(prenom, nom)`)
    .single();

  if (error) throw error;

  // Enregistrer dans le registre des opérations traçable
  if (statut === "traite" && rev) {
    try {
      const bailleurNom = rev.bailleur ? `${(rev.bailleur as any).prenom} ${(rev.bailleur as any).nom}` : "Bailleur";
      const seq = Math.floor(10000 + Math.random() * 90000);
      const refOp = `OP-REV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}-${seq}`;

      await supabase.from("registre_operations").insert({
        reference_operation: refOp,
        type_operation: "reversement_bailleur",
        montant: rev.montant,
        statut: "valide",
        mode_reglement: modePaiement,
        reference_externe: referenceTransaction || null,
        description: `Reversement loyer exécuté au profit de ${bailleurNom}`,
        entite_type: "reversements",
        entite_id: rev.id,
      });
    } catch (e) {
      console.warn("Échec enregistrement registre opération:", e);
    }
  }
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

export const processPaymentReversement = async (input: {
  paiementId: string;
  bailleurId: string;
  montant: number;
  modeReglement: string;
  referenceTransaction: string;
}) => {
  const { data: existing } = await supabase
    .from("reversements")
    .select("id")
    .eq("paiement_id", input.paiementId)
    .maybeSingle();

  if (existing?.id) {
    await updateReversementStatut(existing.id, "traite", input.referenceTransaction, input.modeReglement);
    return existing.id;
  }

  const { data: newRev, error } = await supabase
    .from("reversements")
    .insert({
      paiement_id: input.paiementId,
      bailleur_id: input.bailleurId,
      montant: input.montant,
      statut: "traite",
      date_reversement: new Date().toISOString(),
      reference_transaction: input.referenceTransaction,
    })
    .select("id")
    .single();

  if (error) throw error;

  // Enregistrer également dans le registre des opérations
  try {
    const seq = Math.floor(10000 + Math.random() * 90000);
    const refOp = `OP-REV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}-${seq}`;
    await supabase.from("registre_operations").insert({
      reference_operation: refOp,
      type_operation: "reversement_bailleur",
      montant: input.montant,
      statut: "valide",
      mode_reglement: input.modeReglement,
      reference_externe: input.referenceTransaction,
      description: `Reversement loyer pour le paiement ${input.paiementId.slice(0, 8)}`,
      entite_type: "reversements",
      entite_id: newRev.id,
    });
  } catch (err) {
    console.warn("Erreur registre opération:", err);
  }

  return newRev.id;
};

export const generateBordereauReversementHTML = (data: {
  reference: string;
  date: string;
  bailleur: { prenom: string; nom: string; telephone?: string };
  logement: { nom: string; adresse?: string; chambre?: string };
  montant: number;
  modeReglement: string;
  referenceTransaction: string;
}) => {
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/>
  <style>
    body { font-family: 'Times New Roman', serif; padding: 40px; color: #111; line-height: 1.5; font-size: 11pt; }
    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
    .title { text-align: center; font-size: 14pt; font-weight: bold; margin: 20px 0 5px; text-transform: uppercase; }
    .subtitle { text-align: center; font-style: italic; font-size: 10pt; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    th, td { border: 1px solid #000; padding: 8px 10px; text-align: left; }
    th { background: #f0f0f0; }
    .sig { display: flex; justify-content: space-between; margin-top: 50px; }
    .sig-box { flex: 1; border-top: 1.5px solid #000; padding-top: 8px; margin-right: 20px; }
  </style></head><body>
  <div class="header">
    <div><strong>LES LOGEMENTS DE ZEYNA</strong><br/>Gestion Locative & Reversements Bailleurs</div>
    <div style="text-align:right;">Réf : ${data.reference}<br/>Date : ${data.date}</div>
  </div>
  <div class="title">BORDEREAU DE REVERSEMENT BAILLEUR</div>
  <div class="subtitle">Justificatif officiel de virement / décompte de reversement de loyer</div>
  <table>
    <tr><th style="width:30%;">Bailleur bénéficiaire</th><td><strong>${data.bailleur.prenom} ${data.bailleur.nom}</strong> (${data.bailleur.telephone || "-"})</td></tr>
    <tr><th>Logement</th><td>${data.logement.nom} - ${data.logement.adresse || "Saint-Louis"}</td></tr>
    <tr><th>Chambre concernée</th><td>${data.logement.chambre || "-"}</td></tr>
    <tr><th>Montant reversé</th><td><strong style="font-size:13pt;">${data.montant.toLocaleString("fr-FR")} FCFA</strong></td></tr>
    <tr><th>Mode de règlement</th><td>${data.modeReglement}</td></tr>
    <tr><th>Référence de transaction</th><td><code style="font-weight:bold;">${data.referenceTransaction}</code></td></tr>
  </table>
  <p style="font-size:9.5pt;margin-top:20px;">Le présent bordereau atteste de la réalisation effective du reversement mentionné ci-dessus conformément à la convention de partenariat liant Les Logements de ZEYNA et le Bailleur.</p>
  <div class="sig">
    <div class="sig-box"><strong>Pour le Bailleur</strong><br/>Pour accusé de réception :</div>
    <div class="sig-box" style="margin-right:0;"><strong>Pour Les Logements de ZEYNA</strong><br/>Direction Financière & Comptable :</div>
  </div>
  </body></html>`;
};

