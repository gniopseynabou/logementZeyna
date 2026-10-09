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
  
  // Remplir le nom de l'étudiant
  const enrichedData = await Promise.all(data.map(async (c) => {
    const { data: profile } = await supabase
      .from("profiles")
      .select("nom, prenom, telephone")
      .eq("user_id", c.etudiant_id)
      .single();
    return { ...c, etudiant: profile };
  }));

  return enrichedData;
};