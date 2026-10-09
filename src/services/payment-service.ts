import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type PaymentMethod = Database["public"]["Enums"]["paiement_methode"];

export const getStudentDashboardPayments = async (studentId: string) => {
  const { data, error } = await supabase
    .from("paiements")
    .select("*")
    .eq("etudiant_id", studentId);

  if (error) throw error;
  return data ?? [];
};

export const getStudentPaymentHistory = async (studentId: string) => {
  const { data, error } = await supabase
    .from("paiements")
    .select("*, reservations(logements(nom), chambres(nom))")
    .eq("etudiant_id", studentId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
};

export const getLandlordPaymentReport = async (landlordId: string) => {
  const { data: logements, error: logementError } = await supabase
    .from("logements")
    .select("id, nom")
    .eq("bailleur_id", landlordId);
  if (logementError) throw logementError;
  if (!logements?.length) return { paiements: [], total: 0 };

  const { data: reservations, error: reservationError } = await supabase
    .from("reservations")
    .select("id")
    .in("logement_id", logements.map((logement) => logement.id))
    .eq("statut", "confirmee");
  if (reservationError) throw reservationError;
  if (!reservations?.length) return { paiements: [], total: 0 };

  const { data: paiements, error: paiementError } = await supabase
    .from("paiements")
    .select("*, reservations(logement_id, logements(nom), chambres(nom))")
    .in("reservation_id", reservations.map((reservation) => reservation.id))
    .order("created_at", { ascending: false });
  if (paiementError) throw paiementError;

  const paymentRows = paiements ?? [];
  const total = paymentRows
    .filter((paiement) => paiement.est_confirme)
    .reduce((sum, paiement) => sum + paiement.montant, 0);

  return { paiements: paymentRows, total };
};

import type { PaginatedResponse } from "./admin-user-service";

export interface GetPaymentsParams {
  page?: number;
  pageSize?: number;
  statusFilter?: string; // 'all' | 'true' | 'false'
}

export const getAdminPayments = async ({
  page = 1,
  pageSize = 20,
  statusFilter = "all",
}: GetPaymentsParams = {}): Promise<PaginatedResponse<any>> => {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("paiements")
    .select("*, reservations(logements(nom), chambres(nom))", { count: "exact" });

  if (statusFilter !== "all") {
    query = query.eq("est_confirme", statusFilter === "true");
  }

  const { data, count, error } = await query
    .range(from, to)
    .order("created_at", { ascending: false });

  if (error) throw error;

  const total = count || 0;
  const totalPages = Math.ceil(total / pageSize);

  return {
    data: data || [],
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
    },
  };
};

export const getAdminPaymentStats = async () => {
  const { data, error } = await supabase.from("paiements").select("est_confirme");
  if (error) throw error;

  return {
    all: data.length,
    confirme: data.filter((d) => d.est_confirme).length,
    en_attente: data.filter((d) => !d.est_confirme).length,
  };
};

interface ConfirmAdminPaymentInput {
  paymentId: string;
  reservationId: string;
  studentId: string;
  amount: number;
  reference: string | null;
  logementName: string | null;
  roomName: string | null;
}

export const confirmAdminPayment = async ({
  paymentId,
  reservationId,
  studentId,
  amount,
  reference,
  logementName,
  roomName,
}: ConfirmAdminPaymentInput) => {
  const { error: paymentError } = await supabase
    .from("paiements")
    .update({ est_confirme: true })
    .eq("id", paymentId);
  if (paymentError) throw paymentError;

  const { error: reservationError } = await supabase
    .from("reservations")
    .update({ statut: "confirmee" })
    .eq("id", reservationId);
  if (reservationError) throw reservationError;

  const { data: reservation, error: lookupError } = await supabase
    .from("reservations")
    .select("chambre_id")
    .eq("id", reservationId)
    .single();
  if (lookupError) throw lookupError;

  const { error: roomError } = await supabase
    .from("chambres")
    .update({ est_disponible: false })
    .eq("id", reservation.chambre_id);
  if (roomError) throw roomError;

  const { error: contractError } = await supabase.from("contrats").insert({
    etudiant_id: studentId,
    reservation_id: reservationId,
    contenu: {
      montant: amount,
      reference,
      date: new Date().toISOString(),
      logement: logementName,
      chambre: roomName,
    },
  });
  if (contractError) throw contractError;
};

export const getReservationForPayment = async (reservationId: string) => {
  // 1. Fetch de base
  const { data: reservation, error } = await supabase
    .from("reservations")
    .select(`
      *,
      logements (
        nom,
        adresse,
        ville,
        conditions_electricite,
        bailleur_id
      ),
      chambres (
        nom,
        prix_zeyna,
        caution
      )
    `)
    .eq("id", reservationId)
    .single();

  if (error) throw error;
  if (!reservation) throw new Error("Réservation non trouvée");

  // 2. Récupérer le profil du bailleur (car la FK pointe sur auth.users)
  const bailleurId = (reservation.logements as any)?.bailleur_id;
  let bailleurProfile = null;
  
  if (bailleurId) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("nom, prenom, telephone")
      .eq("user_id", bailleurId)
      .single();
    bailleurProfile = profile;
  }

  return {
    ...reservation,
    bailleur: bailleurProfile
  };
};


export const submitPaymentProof = async (data: {
  etudiant_id: string;
  reservation_id: string;
  montant: number;
  methode: PaymentMethod;
  reference: string;
}) => {
  const { error } = await supabase.from("paiements").insert({
    etudiant_id: data.etudiant_id,
    reservation_id: data.reservation_id,
    montant: data.montant,
    methode: data.methode,
    reference: data.reference,
    est_confirme: false,
  });

  if (error) throw error;
};
