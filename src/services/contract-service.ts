import { supabase } from "@/integrations/supabase/client";

export const getStudentContracts = async (studentId: string) => {
  const { data, error } = await supabase
    .from("contrats")
    .select("*, reservations(logements(nom, adresse, ville), chambres(nom, prix_zeyna, caution, nombre_personnes))")
    .eq("etudiant_id", studentId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
};

export const getLandlordContracts = async (landlordId: string) => {
  const { data: logements, error: logError } = await supabase
    .from("logements")
    .select("id")
    .eq("bailleur_id", landlordId);
    
  if (logError) throw logError;
  const logementIds = logements.map(l => l.id);
  if (logementIds.length === 0) return [];

  const { data: reservations, error: resError } = await supabase
    .from("reservations")
    .select("id")
    .in("logement_id", logementIds);
    
  if (resError) throw resError;
  const resIds = reservations.map(r => r.id);
  if (resIds.length === 0) return [];

  const { data, error } = await supabase
    .from("contrats")
    .select("*, reservations(logements(nom, adresse, ville), chambres(nom, prix_zeyna, caution, nombre_personnes))")
    .in("reservation_id", resIds)
    .order("created_at", { ascending: false });

  if (error) throw error;
  
  // Protection stricte de confidentialité (SEC-007) :
  // Le bailleur ne reçoit JAMAIS les coordonnées personnelles de l'étudiant.
  // ZEYNA assure la relation exclusive avec le locataire.
  return data;
};