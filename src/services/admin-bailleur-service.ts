import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type BailleurRole = Database["public"]["Tables"]["user_roles"]["Row"];
type BailleurProfile = Database["public"]["Tables"]["profiles"]["Row"];

export interface AdminBailleur extends BailleurRole {
  profile: BailleurProfile | undefined;
}

export const getAdminBailleurs = async (): Promise<AdminBailleur[]> => {
  const { data: roles, error: rolesError } = await supabase
    .from("user_roles")
    .select("*")
    .eq("role", "bailleur");

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

export const updateBailleurValidation = async (roleId: string, validated: boolean) => {
  const { error } = await supabase
    .from("user_roles")
    .update({ is_validated: validated })
    .eq("id", roleId);

  if (error) throw error;
};