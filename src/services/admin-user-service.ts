import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type AdminUserRole = Database["public"]["Enums"]["app_role"];
type UserRoleRow = Database["public"]["Tables"]["user_roles"]["Row"];
type UserProfile = Database["public"]["Tables"]["profiles"]["Row"];

export interface AdminUser extends UserRoleRow {
  profile: UserProfile | undefined;
}

export const getAdminUsers = async (): Promise<AdminUser[]> => {
  const { data: roles, error: rolesError } = await supabase
    .from("user_roles")
    .select("*");
  if (rolesError) throw rolesError;
  if (!roles?.length) return [];

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("*")
    .in("user_id", roles.map((role) => role.user_id));
  if (profilesError) throw profilesError;

  return roles.map((role) => ({
    ...role,
    profile: profiles?.find((profile) => profile.user_id === role.user_id),
  }));
};

export const updateAdminUserValidation = async (roleId: string, validated: boolean) => {
  const { error } = await supabase
    .from("user_roles")
    .update({ is_validated: validated })
    .eq("id", roleId);

  if (error) throw error;
};

export const inviteUser = async (email: string, role: string) => {
  const { data, error } = await supabase.functions.invoke('invite-user', {
    body: { email, role, redirectTo: `${window.location.origin}/reset-password` }
  });

  if (error) throw error;
  if (data?.error) throw new Error(data.error);

  return data;
};