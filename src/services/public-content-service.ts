import { supabase } from "@/integrations/supabase/client";

export const getHeroStats = async () => {
  const [logements, chambres, villes] = await Promise.all([
    supabase.from("logements").select("id", { count: "exact", head: true }).eq("statut", "valide"),
    supabase.from("chambres").select("id", { count: "exact", head: true }),
    supabase.from("logements").select("ville").eq("statut", "valide"),
  ]);

  const queryError = logements.error ?? chambres.error ?? villes.error;
  if (queryError) throw queryError;

  const quartierCount = new Set(villes.data?.map((logement) => logement.ville) ?? []).size;

  return [
    { id: "1", valeur: `${logements.count ?? 0}`, label: "Logements" },
    { id: "2", valeur: `${chambres.count ?? 0}`, label: "Chambres" },
    { id: "3", valeur: `${quartierCount}`, label: "Quartiers" },
  ];
};

export const getVisibleFaqs = async () => {
  const { data, error } = await supabase
    .from("faqs")
    .select("*")
    .eq("est_visible", true)
    .order("ordre");

  if (error) throw error;
  return data ?? [];
};

export const getVisibleTestimonials = async () => {
  const { data, error } = await supabase
    .from("temoignages")
    .select("*")
    .eq("est_visible", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
};