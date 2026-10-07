import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import AuthLayout from "./components/auth/AuthLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";

// Lazy-loaded pages for code splitting
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Logements = lazy(() => import("./pages/Logements"));
const LogementDetail = lazy(() => import("./pages/LogementDetail"));
const EtudiantDashboard = lazy(() => import("./pages/etudiant/Dashboard"));
const EtudiantReservations = lazy(() => import("./pages/etudiant/Reservations"));
const PaiementPage = lazy(() => import("./pages/etudiant/Paiement"));
const EtudiantPaiements = lazy(() => import("./pages/etudiant/Paiements"));
const EtudiantContrats = lazy(() => import("./pages/etudiant/Contrats"));
const EtudiantIncidents = lazy(() => import("./pages/etudiant/Incidents"));
const BailleurDashboard = lazy(() => import("./pages/bailleur/Dashboard"));
const BailleurLogements = lazy(() => import("./pages/bailleur/Logements"));
const NouveauLogement = lazy(() => import("./pages/bailleur/NouveauLogement"));
const BailleurPaiements = lazy(() => import("./pages/bailleur/Paiements"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminLogements = lazy(() => import("./pages/admin/Logements"));
const AdminNouveauLogement = lazy(() => import("./pages/admin/NouveauLogement"));
const AdminBailleurs = lazy(() => import("./pages/admin/Bailleurs"));
const AdminReservations = lazy(() => import("./pages/admin/Reservations"));
const AdminPaiements = lazy(() => import("./pages/admin/Paiements"));
const AdminTarifs = lazy(() => import("./pages/admin/Tarifs"));
const AdminUtilisateurs = lazy(() => import("./pages/admin/Utilisateurs"));
const AdminIncidents = lazy(() => import("./pages/admin/Incidents"));
const AdminReversements = lazy(() => import("./pages/admin/Reversements"));
const AdminDocuments = lazy(() => import("./pages/admin/Documents"));
const AdminClients = lazy(() => import("./pages/admin/Clients"));
const SuperAdminDashboard = lazy(() => import("./pages/super-admin/Dashboard"));
const SuperAdminAuditLogs = lazy(() => import("./pages/super-admin/AuditLogs"));
const ProfilePage = lazy(() => import("./pages/shared/Profile"));
const NotFound = lazy(() => import("./pages/NotFound"));
const DevenirBailleur = lazy(() => import("./pages/DevenirBailleur"));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 min cache
      gcTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

import MaintenanceGuard from "./components/MaintenanceGuard";
import { HelmetProvider } from "react-helmet-async";

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <MaintenanceGuard>
              <Suspense fallback={<PageLoader />}>
                <Routes>
              {/* Public */}
              <Route path="/" element={<Index />} />
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
              </Route>
              <Route path="/logements" element={<Logements />} />
              <Route path="/logements/:id" element={<LogementDetail />} />
              <Route path="/devenir-bailleur" element={<DevenirBailleur />} />

              {/* Étudiant */}
              <Route path="/etudiant" element={<ProtectedRoute allowedRoles={["etudiant"]}><EtudiantDashboard /></ProtectedRoute>} />
              <Route path="/etudiant/reservations" element={<ProtectedRoute allowedRoles={["etudiant"]}><EtudiantReservations /></ProtectedRoute>} />
              <Route path="/etudiant/paiement/:reservationId" element={<ProtectedRoute allowedRoles={["etudiant"]}><PaiementPage /></ProtectedRoute>} />
              <Route path="/etudiant/paiements" element={<ProtectedRoute allowedRoles={["etudiant"]}><EtudiantPaiements /></ProtectedRoute>} />
              <Route path="/etudiant/contrats" element={<ProtectedRoute allowedRoles={["etudiant"]}><EtudiantContrats /></ProtectedRoute>} />
              <Route path="/etudiant/incidents" element={<ProtectedRoute allowedRoles={["etudiant"]}><EtudiantIncidents /></ProtectedRoute>} />
              <Route path="/etudiant/profil" element={<ProtectedRoute allowedRoles={["etudiant"]}><ProfilePage /></ProtectedRoute>} />

              {/* Bailleur */}
              <Route path="/bailleur" element={<ProtectedRoute allowedRoles={["bailleur"]}><BailleurDashboard /></ProtectedRoute>} />
              <Route path="/bailleur/logements" element={<ProtectedRoute allowedRoles={["bailleur"]}><BailleurLogements /></ProtectedRoute>} />
              <Route path="/bailleur/logements/nouveau" element={<ProtectedRoute allowedRoles={["bailleur"]}><NouveauLogement /></ProtectedRoute>} />
              <Route path="/bailleur/paiements" element={<ProtectedRoute allowedRoles={["bailleur"]}><BailleurPaiements /></ProtectedRoute>} />
              <Route path="/bailleur/profil" element={<ProtectedRoute allowedRoles={["bailleur"]}><ProfilePage /></ProtectedRoute>} />

              {/* Admin */}
              <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/logements" element={<ProtectedRoute allowedRoles={["admin"]}><AdminLogements /></ProtectedRoute>} />
              <Route path="/admin/logements/nouveau" element={<ProtectedRoute allowedRoles={["admin"]}><AdminNouveauLogement /></ProtectedRoute>} />
              <Route path="/admin/bailleurs" element={<ProtectedRoute allowedRoles={["admin"]}><AdminBailleurs /></ProtectedRoute>} />
              <Route path="/admin/reservations" element={<ProtectedRoute allowedRoles={["admin"]}><AdminReservations /></ProtectedRoute>} />
              <Route path="/admin/paiements" element={<ProtectedRoute allowedRoles={["admin"]}><AdminPaiements /></ProtectedRoute>} />
              <Route path="/admin/tarifs" element={<ProtectedRoute allowedRoles={["admin"]}><AdminTarifs /></ProtectedRoute>} />
              <Route path="/admin/utilisateurs" element={<ProtectedRoute allowedRoles={["admin"]}><AdminUtilisateurs /></ProtectedRoute>} />
              <Route path="/admin/incidents" element={<ProtectedRoute allowedRoles={["admin"]}><AdminIncidents /></ProtectedRoute>} />
              <Route path="/admin/reversements" element={<ProtectedRoute allowedRoles={["admin"]}><AdminReversements /></ProtectedRoute>} />
              <Route path="/admin/documents" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDocuments /></ProtectedRoute>} />
              <Route path="/admin/clients" element={<ProtectedRoute allowedRoles={["admin"]}><AdminClients /></ProtectedRoute>} />

              {/* Super-Admin */}
              <Route path="/super-admin" element={<ProtectedRoute allowedRoles={["super_admin"]}><SuperAdminDashboard /></ProtectedRoute>} />
              <Route path="/super-admin/audit-logs" element={<ProtectedRoute allowedRoles={["super_admin"]}><SuperAdminAuditLogs /></ProtectedRoute>} />

              <Route path="*" element={<NotFound />} />
            </Routes>
              </Suspense>
            </MaintenanceGuard>
          </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
  </HelmetProvider>
);

export default App;
