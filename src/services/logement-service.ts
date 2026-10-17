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
    prix_zeyna: number;
    caution: number;
    description: string;
  }>;
  images: File[];
  onUploadingImages?: (uploading: boolean) => void;
  proprietaire?: {
    prenom: string;
    nom: string;
    telephone: string;
    email?: string;
  };
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
  proprietaire,
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

  if (proprietaire && proprietaire.nom && proprietaire.prenom && proprietaire.telephone) {
    const { error: proprietaireError } = await supabase
      .from("logement_proprietaires")
      .insert({
        logement_id: logement.id,
        nom: proprietaire.nom.trim(),
        prenom: proprietaire.prenom.trim(),
        telephone: proprietaire.telephone.trim(),
        email: proprietaire.email?.trim() || null,
      });
    if (proprietaireError) {
      console.error("Erreur lors de l'enregistrement du propriétaire:", proprietaireError);
    }
  }

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
      prix_zeyna: chambre.prix_zeyna,
      caution: chambre.caution,
      description: chambre.description,
    }))
  );
  if (chambresError) throw chambresError;

  return logement;
};

export const getLogementProprietaire = async (logementId: string) => {
  const { data, error } = await supabase
    .from("logement_proprietaires")
    .select("*")
    .eq("logement_id", logementId)
    .maybeSingle();

  if (error) {
    console.error("Erreur lecture proprietaire:", error);
    return null;
  }
  return data;
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

export interface UpdateAdminLogementInput {
  nom?: string;
  adresse?: string;
  ville?: string;
  type?: string;
  description?: string;
  conditions_electricite?: string;
  latitude?: number | null;
  longitude?: number | null;
  images?: string[];
  statut?: LogementStatus;
}

export const updateAdminLogement = async (id: string, updates: UpdateAdminLogementInput) => {
  const { data, error } = await supabase
    .from("logements")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteAdminLogement = async (id: string) => {
  const { error } = await supabase
    .from("logements")
    .delete()
    .eq("id", id);

  if (error) throw error;
};

export const toggleLogementDisponibilite = async (logementId: string, estDisponible: boolean) => {
  const { error } = await supabase
    .from("chambres")
    .update({ est_disponible: estDisponible })
    .eq("logement_id", logementId);

  if (error) throw error;
};

export const toggleChambreDisponibilite = async (chambreId: string, estDisponible: boolean) => {
  const { error } = await supabase
    .from("chambres")
    .update({ est_disponible: estDisponible })
    .eq("id", chambreId);

  if (error) throw error;
};

export interface AdminChambrePayload {
  id?: string;
  logement_id: string;
  nom: string;
  nombre_personnes: number;
  prix_bailleur: number;
  prix_zeyna: number;
  marge?: number;
  caution: number;
  description?: string;
  est_disponible?: boolean;
}

export const saveAdminChambre = async (chambre: AdminChambrePayload) => {
  const marge = chambre.marge !== undefined ? chambre.marge : (chambre.prix_zeyna - chambre.prix_bailleur);

  if (chambre.id) {
    const { data, error } = await supabase
      .from("chambres")
      .update({
        nom: chambre.nom,
        nombre_personnes: chambre.nombre_personnes,
        prix_bailleur: chambre.prix_bailleur,
        prix_zeyna: chambre.prix_zeyna,
        marge,
        caution: chambre.caution,
        description: chambre.description ?? "",
        est_disponible: chambre.est_disponible ?? true,
      })
      .eq("id", chambre.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase
      .from("chambres")
      .insert({
        logement_id: chambre.logement_id,
        nom: chambre.nom,
        nombre_personnes: chambre.nombre_personnes,
        prix_bailleur: chambre.prix_bailleur,
        prix_zeyna: chambre.prix_zeyna,
        marge,
        caution: chambre.caution,
        description: chambre.description ?? "",
        est_disponible: chambre.est_disponible ?? true,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

export const deleteAdminChambre = async (chambreId: string) => {
  const { error } = await supabase
    .from("chambres")
    .delete()
    .eq("id", chambreId);

  if (error) throw error;
};

export const uploadAdminLogementImages = async (logementId: string, files: File[]) => {
  const imageUrls: string[] = [];
  for (const file of files) {
    const extension = file.name.split(".").pop();
    const path = `${logementId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
    const { error } = await supabase.storage.from("logements").upload(path, file);
    if (error) throw error;

    const { data: urlData } = supabase.storage.from("logements").getPublicUrl(path);
    imageUrls.push(urlData.publicUrl);
  }
  return imageUrls;
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