import { ReactNode } from "react";
import { useMaintenance } from "@/hooks/useMaintenance";
import { useAuth } from "@/hooks/useAuth";
import { isSuperAdmin } from "@/lib/permissions";
import MaintenancePage from "@/pages/Maintenance";

interface MaintenanceGuardProps {
  children: ReactNode;
}

const MaintenanceGuard = ({ children }: MaintenanceGuardProps) => {
  const { role, loading: authLoading } = useAuth();
  const { data: maintenance, isLoading: maintenanceLoading } = useMaintenance();

  if (authLoading || maintenanceLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // Si la maintenance est active et que l'utilisateur N'EST PAS super_admin,
  // on affiche la page de maintenance
  if (maintenance?.is_active && !isSuperAdmin(role)) {
    return <MaintenancePage />;
  }

  // Sinon, on affiche l'application normalement
  return <>{children}</>;
};

export default MaintenanceGuard;
