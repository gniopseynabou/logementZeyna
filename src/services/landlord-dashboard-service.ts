import { supabase } from "@/integrations/supabase/client";

export const getLandlordDashboardData = async (landlordId: string) => {
  const { data, error } = await supabase
    .from("logements")
    .select("*, chambres(*)")
    .eq("bailleur_id", landlordId);

  if (error) throw error;

  const logements = data ?? [];

  return {
    logements,
    totalLogements: logements.length,
    logementsValides: logements.filter((logement) => logement.statut === "valide").length,
    logementsEnAttente: logements.filter((logement) => logement.statut === "en_attente").length,
    totalChambres: logements.reduce((total, logement) => total + logement.chambres.length, 0),
  };
};