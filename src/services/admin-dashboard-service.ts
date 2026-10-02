import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type LogementRow = Pick<Database["public"]["Tables"]["logements"]["Row"], "statut">;
type ReservationRow = Pick<Database["public"]["Tables"]["reservations"]["Row"], "statut">;
type PaymentRow = Pick<Database["public"]["Tables"]["paiements"]["Row"], "montant" | "est_confirme">;
type LandlordRoleRow = Pick<Database["public"]["Tables"]["user_roles"]["Row"], "is_validated">;
type RoomRow = Pick<Database["public"]["Tables"]["chambres"]["Row"], "est_disponible">;

export const calculateAdminDashboardStats = ({
  logements,
  reservations,
  paiements,
  bailleurs,
  chambres,
}: {
  logements: LogementRow[];
  reservations: ReservationRow[];
  paiements: PaymentRow[];
  bailleurs: LandlordRoleRow[];
  chambres: RoomRow[];
}) => {
  const totalChambres = chambres.length;
  const chambresOccupees = chambres.filter((chambre) => !chambre.est_disponible).length;

  return {
    totalLogements: logements.length,
    logValides: logements.filter((logement) => logement.statut === "valide").length,
    logEnAttente: logements.filter((logement) => logement.statut === "en_attente").length,
    totalReservations: reservations.length,
    resConfirmees: reservations.filter((reservation) => reservation.statut === "confirmee").length,
    resEnAttente: reservations.filter((reservation) => reservation.statut === "en_attente").length,
    revenus: paiements
      .filter((paiement) => paiement.est_confirme)
      .reduce((sum, paiement) => sum + paiement.montant, 0),
    totalBailleurs: bailleurs.length,
    bailleursValides: bailleurs.filter((bailleur) => bailleur.is_validated).length,
    bailleursEnAttente: bailleurs.filter((bailleur) => !bailleur.is_validated).length,
    tauxOccupation: totalChambres > 0 ? Math.round((chambresOccupees / totalChambres) * 100) : 0,
    totalChambres,
    chambresOccupees,
  };
};

export const getAdminDashboardStats = async () => {
  const [logements, reservations, paiements, bailleurs, chambres] = await Promise.all([
    supabase.from("logements").select("id, statut"),
    supabase.from("reservations").select("id, statut, montant_total"),
    supabase.from("paiements").select("id, montant, est_confirme"),
    supabase.from("user_roles").select("id, role, is_validated").eq("role", "bailleur"),
    supabase.from("chambres").select("id, est_disponible"),
  ]);

  const queryError = logements.error ?? reservations.error ?? paiements.error ?? bailleurs.error ?? chambres.error;
  if (queryError) throw queryError;

  return calculateAdminDashboardStats({
    logements: logements.data ?? [],
    reservations: reservations.data ?? [],
    paiements: paiements.data ?? [],
    bailleurs: bailleurs.data ?? [],
    chambres: chambres.data ?? [],
  });
};