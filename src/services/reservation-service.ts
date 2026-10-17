import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type ReservationStatus = Database["public"]["Enums"]["reservation_statut"];

export const STATUT_RESERVATION_CONFIG: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
    colorClass: string;
    description: string;
  }
> = {
  en_attente_confirmation: {
    label: "En attente de confirmation",
    variant: "secondary",
    colorClass: "bg-amber-500/10 text-amber-700 border-amber-300 dark:text-amber-400",
    description: "Vérification en cours auprès du propriétaire. Paiement indisponible à cette étape.",
  },
  en_attente: {
    label: "En attente de confirmation",
    variant: "secondary",
    colorClass: "bg-amber-500/10 text-amber-700 border-amber-300 dark:text-amber-400",
    description: "Vérification en cours auprès du propriétaire. Paiement indisponible à cette étape.",
  },
  confirmee_paiement_en_attente: {
    label: "Confirmée — paiement en attente",
    variant: "default",
    colorClass: "bg-blue-500/10 text-blue-700 border-blue-300 dark:text-blue-400",
    description: "Réservation validée ! Délai strict de 24 heures pour effectuer le paiement.",
  },
  payee: {
    label: "Payée",
    variant: "default",
    colorClass: "bg-emerald-500/10 text-emerald-700 border-emerald-300 dark:text-emerald-400",
    description: "Paiement validé avec succès. Votre contrat de location est actif.",
  },
  confirmee: {
    label: "Confirmée / Payée",
    variant: "default",
    colorClass: "bg-emerald-500/10 text-emerald-700 border-emerald-300 dark:text-emerald-400",
    description: "Réservation confirmée.",
  },
  refusee: {
    label: "Refusée",
    variant: "destructive",
    colorClass: "bg-rose-500/10 text-rose-700 border-rose-300 dark:text-rose-400",
    description: "Réservation refusée après vérification auprès du propriétaire.",
  },
  annulee_utilisateur: {
    label: "Annulée par l'utilisateur",
    variant: "outline",
    colorClass: "bg-muted text-muted-foreground border-border",
    description: "Réservation annulée à votre demande.",
  },
  annulee: {
    label: "Annulée",
    variant: "outline",
    colorClass: "bg-muted text-muted-foreground border-border",
    description: "Réservation annulée.",
  },
  expiree: {
    label: "Expirée — délai dépassé",
    variant: "destructive",
    colorClass: "bg-red-500/10 text-red-700 border-red-300 dark:text-red-400",
    description: "Le délai de paiement de 24h a été dépassé. Le logement a été remis à disposition.",
  },
};

export const getStatusConfig = (statut: string) => {
  return (
    STATUT_RESERVATION_CONFIG[statut] || {
      label: statut,
      variant: "secondary" as const,
      colorClass: "bg-muted text-muted-foreground",
      description: "",
    }
  );
};

export const verifierEtExpirerReservations = async () => {
  try {
    await supabase.rpc("verifier_et_expirer_reservations" as any);
  } catch (err) {
    // Si la RPC n'est pas encore migrée, expiration côté client si applicable
  }
};

export const getStudentReservations = async (studentId: string) => {
  const { data, error } = await supabase
    .from("reservations")
    .select("*, logements(nom, adresse), chambres(nom, prix_zeyna, caution)")
    .eq("etudiant_id", studentId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
};

export const getStudentDashboardReservations = async (studentId: string) => {
  const { data, error } = await supabase
    .from("reservations")
    .select("*, logements(nom), chambres(nom)")
    .eq("etudiant_id", studentId);

  if (error) throw error;
  return data ?? [];
};

export const cancelStudentReservation = async (reservationId: string) => {
  // Tenter d'abord la RPC sécurisée pour annuler
  try {
    const { error: rpcError } = await supabase.rpc("annuler_reservation_etudiant" as any, {
      p_reservation_id: reservationId,
    });
    if (!rpcError) return;
  } catch {
    // fallback séquentiel
  }

  const { error } = await supabase
    .from("reservations")
    .update({ statut: "annulee" })
    .eq("id", reservationId);

  if (error) throw error;
};

import type { PaginatedResponse } from "./admin-user-service";

export interface GetReservationsParams {
  page?: number;
  pageSize?: number;
  statusFilter?: string; // 'all' | 'en_attente_confirmation' | 'confirmee_paiement_en_attente' | 'payee' | 'refusee' | 'annulee_utilisateur' | 'expiree' | 'en_attente' | 'confirmee' | 'annulee'
}

export const getAdminReservations = async ({
  page = 1,
  pageSize = 20,
  statusFilter = "all",
}: GetReservationsParams = {}): Promise<PaginatedResponse<any>> => {
  // Lancer l'expiration automatique en tâche de fond avant de récupérer la liste
  verifierEtExpirerReservations().catch(() => {});

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("reservations")
    .select("*, logements(nom), chambres(nom)", { count: "exact" });

  if (statusFilter !== "all") {
    // Support des filtres groupés pour compatibilité
    if (statusFilter === "en_attente") {
      query = query.in("statut", ["en_attente", "en_attente_confirmation"]);
    } else if (statusFilter === "confirmee") {
      query = query.in("statut", ["confirmee", "confirmee_paiement_en_attente", "payee"]);
    } else if (statusFilter === "annulee") {
      query = query.in("statut", ["annulee", "annulee_utilisateur", "refusee", "expiree"]);
    } else {
      query = query.eq("statut", statusFilter as any);
    }
  }

  const { data, count, error } = await query
    .range(from, to)
    .order("created_at", { ascending: false });

  if (error) throw error;

  // Récupérer les coordonnées propriétaires associées à chaque logement pour les administrateurs
  const rows = data || [];
  const logementIds = Array.from(new Set(rows.map((r: any) => r.logement_id).filter(Boolean)));

  let enrichedData = rows;
  if (logementIds.length > 0) {
    try {
      const { data: proprietaires } = await supabase
        .from("logement_proprietaires")
        .select("*")
        .in("logement_id", logementIds);

      if (proprietaires && proprietaires.length > 0) {
        const proprietaireMap: Record<string, any> = {};
        proprietaires.forEach((p: any) => {
          proprietaireMap[p.logement_id] = p;
        });
        enrichedData = rows.map((r: any) => ({
          ...r,
          proprietaire: proprietaireMap[r.logement_id] || null,
        }));
      }
    } catch {
      // Ignorer si la table n'est pas encore migrée
    }
  }

  const total = count || 0;
  const totalPages = Math.ceil(total / pageSize);

  return {
    data: enrichedData,
    pagination: { page, pageSize, total, totalPages },
  };
};

export const getAdminReservationStats = async () => {
  const { data, error } = await supabase.from("reservations").select("statut");
  if (error) throw error;

  const enAttente = data.filter(
    (d) => d.statut === "en_attente" || d.statut === "en_attente_confirmation"
  ).length;

  const paiementEnAttente = data.filter(
    (d) => d.statut === "confirmee_paiement_en_attente"
  ).length;

  const payee = data.filter(
    (d) => d.statut === "payee" || (d.statut === "confirmee" && !paiementEnAttente)
  ).length;

  const confirmee = data.filter(
    (d) =>
      d.statut === "confirmee" ||
      d.statut === "confirmee_paiement_en_attente" ||
      d.statut === "payee"
  ).length;

  const refusee = data.filter((d) => d.statut === "refusee").length;
  const expiree = data.filter((d) => d.statut === "expiree").length;
  const annuleeUtilisateur = data.filter(
    (d) => d.statut === "annulee_utilisateur" || d.statut === "annulee"
  ).length;

  const annuleeTotal = data.filter(
    (d) =>
      d.statut === "annulee" ||
      d.statut === "annulee_utilisateur" ||
      d.statut === "refusee" ||
      d.statut === "expiree"
  ).length;

  return {
    all: data.length,
    en_attente: enAttente,
    en_attente_confirmation: enAttente,
    confirmee_paiement_en_attente: paiementEnAttente,
    payee: payee,
    confirmee: confirmee,
    refusee: refusee,
    expiree: expiree,
    annulee_utilisateur: annuleeUtilisateur,
    annulee: annuleeTotal,
  };
};

export const validerReservationAdmin = async (reservationId: string) => {
  try {
    const { data, error: rpcError } = await supabase.rpc(
      "valider_reservation_admin" as any,
      { p_reservation_id: reservationId }
    );
    if (!rpcError) return data;
  } catch {
    // fallback si RPC non disponible
  }

  const expireAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const { error } = await supabase
    .from("reservations")
    .update({
      statut: "confirmee_paiement_en_attente",
      date_validation: new Date().toISOString(),
      date_expiration: expireAt,
    })
    .eq("id", reservationId);

  if (error) throw error;
};

export const refuserReservationAdmin = async (reservationId: string, motif: string) => {
  if (!motif || !motif.trim()) {
    throw new Error("Le motif du refus est obligatoire.");
  }

  try {
    const { data, error: rpcError } = await supabase.rpc(
      "refuser_reservation_admin" as any,
      {
        p_reservation_id: reservationId,
        p_motif: motif.trim(),
      }
    );
    if (!rpcError) return data;
  } catch {
    // fallback
  }

  const { error } = await supabase
    .from("reservations")
    .update({
      statut: "refusee",
      motif_refus: motif.trim(),
    })
    .eq("id", reservationId);

  if (error) throw error;
};

export const updateAdminReservationStatus = async (
  reservationId: string,
  status: ReservationStatus,
  roomId?: string
) => {
  const { error } = await supabase
    .from("reservations")
    .update({ statut: status })
    .eq("id", reservationId);

  if (error) throw error;

  if (
    (status === "annulee" || status === "annulee_utilisateur" || status === "refusee" || status === "expiree") &&
    roomId
  ) {
    await supabase.from("chambres").update({ est_disponible: true }).eq("id", roomId);
  }
};