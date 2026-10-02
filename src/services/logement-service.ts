import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type LogementStatus = Database["public"]["Enums"]["logement_statut"];

interface NewLogementInput {
  nom: string;
  adresse: string;
  ville: string;
  type: string;
  description: string;
  conditionsElectricite: string;
  latitude: number | null;
  longitude: number | null;
  landlordId: string;
  chambres: Array<{
    nom: string;
    nombre_personnes: number;
    prix_bailleur: number;
    caution: number;
    description: string;
  }>;
  images: File[];
  onUploadingImages?: (uploading: boolean) => void;
}

export const createLandlordLogement = async ({
  nom,
  adresse,
  ville,
  type,
  description,
  conditionsElectricite,
  latitude,
  longitude,
  landlordId,
  chambres,
  images,
  onUploadingImages,
}: NewLogementInput) => {
  const { data: logement, error: logementError } = await supabase
    .from("logements")
    .insert({
      nom,
      adresse,
      ville,
      type,
      description,
      conditions_electricite: conditionsElectricite,
      latitude,
      longitude,
      bailleur_id: landlordId,
      pays: "Sénégal",
    })
    .select()
    .single();

  if (logementError) throw logementError;
  if (!logement) throw new Error("Le logement créé est introuvable.");

  if (images.length > 0) {
    onUploadingImages?.(true);
    try {
      const imageUrls: string[] = [];
      for (const file of images) {
        const extension = file.name.split(".").pop();
        const path = `${logement.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
        const { error } = await supabase.storage.from("logements").upload(path, file);
        if (error) throw error;

        const { data: urlData } = supabase.storage.from("logements").getPublicUrl(path);
        imageUrls.push(urlData.publicUrl);
      }

      const { error: imageUpdateError } = await supabase
        .from("logements")
        .update({ images: imageUrls })
        .eq("id", logement.id);
      if (imageUpdateError) throw imageUpdateError;
    } finally {
      onUploadingImages?.(false);
    }
  }

  const { error: chambresError } = await supabase.from("chambres").insert(
    chambres.map((chambre) => ({
      logement_id: logement.id,
      nom: chambre.nom,
      nombre_personnes: chambre.nombre_personnes,
      prix_bailleur: chambre.prix_bailleur,
      caution: chambre.caution,
      description: chambre.description,
    }))
  );
  if (chambresError) throw chambresError;

  return logement;
};

export const getPublicLogements = async () => {
  const { data, error } = await supabase
    .from("logements")
    .select("*, chambres(*)")
    .eq("statut", "valide")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
};

export const getPopularLogements = async () => {
  const { data, error } = await supabase
    .from("logements")
    .select("*, chambres(*)")
    .eq("statut", "valide")
    .limit(6);

  if (error) throw error;
  return data ?? [];
};

export const getLandlordLogements = async (landlordId: string) => {
  const { data, error } = await supabase
    .from("logements")
    .select("*, chambres(*)")
    .eq("bailleur_id", landlordId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
};

export const getAdminLogements = async () => {
  const { data, error } = await supabase
    .from("logements")
    .select("*, chambres(*)")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
};

export const getValidatedLogementsForTariffs = async () => {
  const { data, error } = await supabase
    .from("logements")
    .select("id, nom, chambres(*)")
    .eq("statut", "valide");

  if (error) throw error;
  return data ?? [];
};

export const updateRoomTariff = async (
  roomId: string,
  priceZeyna: number,
  margin: number
) => {
  const { error } = await supabase
    .from("chambres")
    .update({ prix_zeyna: priceZeyna, marge: margin })
    .eq("id", roomId);

  if (error) throw error;
};

export const updateAdminLogementStatus = async (logementId: string, status: LogementStatus) => {
  const { error } = await supabase
    .from("logements")
    .update({ statut: status })
    .eq("id", logementId);

  if (error) throw error;
};

export const getLogementDetail = async (id: string) => {
  const { data, error } = await supabase
    .from("logements")
    .select("*, chambres(*)")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
};

interface CreateReservationInput {
  studentId: string;
  roomId: string;
  logementId: string;
  amount: number;
}

export const createReservation = async ({
  studentId,
  roomId,
  logementId,
  amount,
}: CreateReservationInput) => {
  const { error } = await supabase.from("reservations").insert({
    etudiant_id: studentId,
    chambre_id: roomId,
    logement_id: logementId,
    montant_total: amount,
    date_debut: new Date().toISOString().split("T")[0],
    statut: "en_attente",
  });

  return { error };
};