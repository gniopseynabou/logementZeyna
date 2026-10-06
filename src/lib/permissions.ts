export type AppRole = "super_admin" | "admin" | "bailleur" | "etudiant";

// Rôles autorisés à s'inscrire via le formulaire public
export type RegistrationRole = Extract<AppRole, "etudiant" | "bailleur">;

// Rôles avec privilèges techniques
export const TECHNICAL_ROLES: AppRole[] = ["super_admin"];

// Rôles avec privilèges métier
export const BUSINESS_ROLES: AppRole[] = ["admin", "bailleur", "etudiant"];

export const DASHBOARD_PATHS: Record<AppRole, string> = {
  super_admin: "/super-admin",
  admin: "/admin",
  bailleur: "/bailleur",
  etudiant: "/etudiant",
};

export const ROLE_LABELS: Record<AppRole, string> = {
  super_admin: "Super-Administrateur",
  admin: "Administrateur",
  bailleur: "Bailleur",
  etudiant: "Étudiant",
};

export const getDashboardPathByRole = (role: AppRole | null | undefined): string => {
  if (!role) return "/login";
  return DASHBOARD_PATHS[role] ?? "/etudiant";
};

export const getRoleLabel = (role: AppRole | null | undefined): string => {
  if (!role) return "Utilisateur";
  return ROLE_LABELS[role] ?? "Utilisateur";
};

export const isAllowedRole = (
  role: AppRole | null | undefined,
  allowedRoles?: AppRole[]
): boolean => {
  if (!role) return false;
  if (!allowedRoles || allowedRoles.length === 0) return true;
  return allowedRoles.includes(role);
};

export const isSuperAdmin = (role: AppRole | null | undefined): boolean =>
  role === "super_admin";

export const isAdminOrSuperAdmin = (role: AppRole | null | undefined): boolean =>
  role === "admin" || role === "super_admin";
