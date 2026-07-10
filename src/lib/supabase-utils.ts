/**
 * Utilitaires Supabase pour le projet Les logements de Zeyna
 */

import { supabase } from "@/integrations/supabase/client";

/**
 * Obtient l'URL publique d'un fichier dans le storage Supabase
 */
export function getStorageUrl(bucket: string, path: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Upload un fichier vers le storage Supabase
 * Retourne l'URL publique ou null en cas d'erreur
 */
export async function uploadFile(
  bucket: string,
  path: string,
  file: File,
  options?: { upsert?: boolean }
): Promise<string | null> {
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: options?.upsert ?? false });

  if (error) {
    console.error(`Erreur upload vers ${bucket}/${path}:`, error.message);
    return null;
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Supprime un fichier du storage Supabase
 */
export async function deleteFile(bucket: string, path: string): Promise<boolean> {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) {
    console.error(`Erreur suppression ${bucket}/${path}:`, error.message);
    return false;
  }
  return true;
}

/**
 * Formate un montant en FCFA
 */
export function formatMontant(montant: number): string {
  return `${montant.toLocaleString("fr-FR")} FCFA`;
}

/**
 * Formate une date en français
 */
export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Labels pour les statuts
 */
export const STATUT_LABELS = {
  reservation: {
    en_attente: "En attente",
    confirmee: "Confirmée",
    annulee: "Annulée",
  },
  logement: {
    en_attente: "En attente",
    valide: "Validé",
    rejete: "Rejeté",
  },
} as const;

/**
 * Labels pour les méthodes de paiement
 */
export const METHODE_LABELS: Record<string, string> = {
  orange_money: "Orange Money",
  mtn_money: "MTN Money",
  moov_money: "Moov Money",
  carte_bancaire: "Carte bancaire",
};
