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