import { supabase } from "@/integrations/supabase/client";

export interface ProfileUpdateInput {
  nom: string;
  prenom: string;
  telephone: string;
}

export const updateUserProfile = async (userId: string, profile: ProfileUpdateInput) => {
  const { error } = await supabase
    .from("profiles")
    .update(profile)
    .eq("user_id", userId);

  if (error) throw error;
};

export const uploadUserAvatar = async (userId: string, file: File): Promise<string> => {
  const extension = file.name.split(".").pop() || "jpg";
  const path = `${userId}/avatar.${extension}`;
  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  const avatarUrl = data.publicUrl;
  const { error: profileError } = await supabase
    .from("profiles")
    .update({ avatar_url: avatarUrl })
    .eq("user_id", userId);

  if (profileError) throw profileError;
  return avatarUrl;
};

export const updateUserPassword = async (password: string) => {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
};