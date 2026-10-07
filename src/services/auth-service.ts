import { supabase } from "@/integrations/supabase/client";
import type { AppRole, RegistrationRole } from "@/lib/permissions";
import type { Database } from "@/integrations/supabase/types";


export type UserProfile = Database["public"]["Tables"]["profiles"]["Row"];

export const getCurrentSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
};

export const signOutUser = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export interface UserAuthData {
  profile: UserProfile | null;
  role: AppRole | null;
  isValidated: boolean;
}

export const getUserAuthData = async (userId: string): Promise<UserAuthData> => {
  const [profileResult, roleResult] = await Promise.all([
    supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("user_roles").select("*").eq("user_id", userId).maybeSingle(),
  ]);

  if (profileResult.error) throw profileResult.error;
  if (roleResult.error) throw roleResult.error;

  return {
    profile: profileResult.data,
    role: roleResult.data?.role ?? null,
    isValidated: roleResult.data?.is_validated ?? false,
  };
};

export interface SignInResult {
  error: Error | null;
  role: AppRole | null;
}



export const requestPasswordReset = async (email: string, redirectTo: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  return { error };
};

export const resetUserPassword = async (password: string) => {
  const { error } = await supabase.auth.updateUser({ password });
  return { error };
};

/**
 * Supabase envoie les tokens soit dans le hash (#type=recovery&access_token=...)
 * soit dans les query params (?token=...&type=invite) selon le type d'email.
 * On accepte les deux formats et les deux types : recovery + invite.
 */
export const isPasswordRecoveryLink = (hash: string): boolean => {
  // Vérifier dans le hash fragment
  const hashParams = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
  const hashType = hashParams.get("type");
  if (hashType === "recovery" || hashType === "invite") return true;

  // Vérifier dans les query params (cas invite via lien magique)
  const queryParams = new URLSearchParams(window.location.search);
  const queryType = queryParams.get("type");
  if (queryType === "recovery" || queryType === "invite") return true;

  return false;
};

export const getInviteLinkType = (hash: string): "recovery" | "invite" | null => {
  const hashParams = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
  const hashType = hashParams.get("type");
  if (hashType === "recovery") return "recovery";
  if (hashType === "invite") return "invite";

  const queryParams = new URLSearchParams(window.location.search);
  const queryType = queryParams.get("type");
  if (queryType === "recovery") return "recovery";
  if (queryType === "invite") return "invite";

  return null;
};

interface RegisterUserInput {
  email: string;
  password: string;
  nom: string;
  prenom: string;
  telephone: string;
  role: RegistrationRole;
  redirectTo: string;
}

export const registerUser = async ({
  email,
  password,
  nom,
  prenom,
  telephone,
  role,
  redirectTo,
}: RegisterUserInput) => {
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { nom, prenom, telephone, role },
      emailRedirectTo: redirectTo,
    },
  });

  return { error };
};

export const signInWithRole = async (email: string, password: string): Promise<SignInResult> => {
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { error, role: null };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: null, role: "etudiant" };

  const { data: roleData } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  return { error: null, role: roleData?.role ?? "etudiant" };
};