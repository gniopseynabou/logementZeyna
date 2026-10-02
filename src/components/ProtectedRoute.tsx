import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { AppRole, getDashboardPathByRole, isAllowedRole } from "@/lib/permissions";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: AppRole[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  // Attendre que le rôle soit chargé avant de rediriger
  if (!role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (allowedRoles && !isAllowedRole(role, allowedRoles)) {
    return <Navigate to={getDashboardPathByRole(role)} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
