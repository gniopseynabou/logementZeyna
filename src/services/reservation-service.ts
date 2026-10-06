import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type ReservationStatus = Database["public"]["Enums"]["reservation_statut"];

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
  statusFilter?: string; // 'all' | 'en_attente' | 'confirmee' | 'annulee'
}

export const getAdminReservations = async ({
  page = 1,
  pageSize = 20,
  statusFilter = "all",
}: GetReservationsParams = {}): Promise<PaginatedResponse<any>> => {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("reservations")
    .select("*, logements(nom), chambres(nom)", { count: "exact" });

  if (statusFilter !== "all") {
    query = query.eq("statut", statusFilter);
  }

  const { data, count, error } = await query
    .range(from, to)
    .order("created_at", { ascending: false });

  if (error) throw error;

  const total = count || 0;
  const totalPages = Math.ceil(total / pageSize);

  return {
    data: data || [],
    pagination: { page, pageSize, total, totalPages },
  };
};

export const getAdminReservationStats = async () => {
  const { data, error } = await supabase.from("reservations").select("statut");
  if (error) throw error;
  return {
    all: data.length,
    en_attente: data.filter((d) => d.statut === "en_attente").length,
    confirmee: data.filter((d) => d.statut === "confirmee").length,
    annulee: data.filter((d) => d.statut === "annulee").length,
  };
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

  if (status === "annulee" && roomId) {
    await supabase.from("chambres").update({ est_disponible: true }).eq("id", roomId);
  }
};