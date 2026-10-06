import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type AdminUserRole = Database["public"]["Enums"]["app_role"];
type UserRoleRow = Database["public"]["Tables"]["user_roles"]["Row"];
type UserProfile = Database["public"]["Tables"]["profiles"]["Row"];

export interface AdminUser extends UserRoleRow {
  profile: UserProfile | undefined;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface GetUsersParams {
  page?: number;
  pageSize?: number;
  search?: string;
  roleFilter?: string;
  validatedFilter?: string;
}

export const getAdminUsers = async ({
  page = 1,
  pageSize = 20,
  search = "",
  roleFilter = "all",
  validatedFilter = "all",
}: GetUsersParams = {}): Promise<PaginatedResponse<AdminUser>> => {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let matchingUserIds: string[] = [];

  // ÉTAPE 1 : Si on a une recherche, on récupère d'abord les IDs des profils correspondants
  if (search) {
    const { data: profilesMatch, error: searchError } = await supabase
      .from("profiles")
      .select("user_id")
      .or(`nom.ilike.%${search}%,prenom.ilike.%${search}%,telephone.ilike.%${search}%`);
      
    if (searchError) throw searchError;
    
    matchingUserIds = profilesMatch.map(p => p.user_id);
    
    // Si la recherche ne donne rien, on retourne un résultat vide tout de suite
    if (matchingUserIds.length === 0) {
      return {
        data: [],
        pagination: { page, pageSize, total: 0, totalPages: 0 }
      };
    }
  }

  // ÉTAPE 2 : On filtre et on pagine sur user_roles
  let query = supabase
    .from("user_roles")
    .select("*", { count: "exact" });

  if (roleFilter !== "all") {
    query = query.eq("role", roleFilter);
  }

  if (validatedFilter !== "all") {
    query = query.eq("is_validated", validatedFilter === "true");
  }

  if (search && matchingUserIds.length > 0) {
    query = query.in("user_id", matchingUserIds);
  }

  const { data: rolesData, count, error: rolesError } = await query
    .range(from, to)
    .order("created_at", { ascending: false });

  if (rolesError) throw rolesError;

  const total = count || 0;
  const totalPages = Math.ceil(total / pageSize);

  if (!rolesData || rolesData.length === 0) {
    return { data: [], pagination: { page, pageSize, total, totalPages } };
  }

  // ÉTAPE 3 : On récupère les profils des 20 rôles de cette page
  const pageUserIds = rolesData.map(r => r.user_id);
  const { data: profilesData, error: profilesError } = await supabase
    .from("profiles")
    .select("*")
    .in("user_id", pageUserIds);

  if (profilesError) throw profilesError;

  // ÉTAPE 4 : Assemblage des données
  const mappedData: AdminUser[] = rolesData.map((role) => ({
    ...role,
    profile: profilesData?.find((p) => p.user_id === role.user_id),
  }));

  return {
    data: mappedData,
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
    },
  };
};

export const updateAdminUserValidation = async (roleId: string, validated: boolean) => {
  const { error } = await supabase
    .from("user_roles")
    .update({ is_validated: validated })
    .eq("id", roleId);

  if (error) throw error;
};

export const inviteUser = async (email: string, role: string) => {
  const { data, error } = await supabase.functions.invoke("invite-user", {
    body: { email, role, redirectTo: `${window.location.origin}/reset-password` }
  });

  if (error) {
    let customMessage = error.message;
    if ("context" in error && error.context && typeof (error.context as Response).clone === "function") {
      try {
        const body = await (error.context as Response).clone().json();
        if (body?.error) customMessage = body.error;
      } catch {
        // Fallback to error.message if context parsing fails
      }
    }
    throw new Error(customMessage);
  }

  if (data?.error) throw new Error(data.error);

  return data;
};

export const getAdminUserStats = async () => {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role");
    
  if (error) throw error;
  
  const stats = {
    all: data.length,
    etudiant: data.filter((d) => d.role === "etudiant").length,
    bailleur: data.filter((d) => d.role === "bailleur").length,
    admin: data.filter((d) => d.role === "admin" || d.role === "super_admin").length,
  };
  
  return stats;
};