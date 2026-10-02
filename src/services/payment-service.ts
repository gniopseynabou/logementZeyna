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

export const getAdminPayments = async () => {
  const { data, error } = await supabase
    .from("paiements")
    .select("*, reservations(logements(nom), chambres(nom))")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
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
  const { data, error } = await supabase
    .from("reservations")
    .select("*, logements(nom), chambres(nom, prix_zeyna, caution)")
    .eq("id", reservationId)
    .single();

  if (error) throw error;
  return data;
};

