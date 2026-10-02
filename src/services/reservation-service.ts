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

export const getAdminReservations = async () => {
  const { data, error } = await supabase
    .from("reservations")
    .select("*, logements(nom), chambres(nom)")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
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