export type AppRole = "admin" | "bailleur" | "etudiant";

export const DASHBOARD_PATHS: Record<AppRole, string> = {
  admin: "/admin",
  bailleur: "/bailleur",
  etudiant: "/etudiant",
};

export const ROLE_LABELS: Record<AppRole, string> = {
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
