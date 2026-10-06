import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/logo-zeyna.png";
import {
  Home, Building, Users, CreditCard, FileText, Settings, LogOut,
  Menu, X, BarChart3, CheckCircle, UserCheck, BookOpen, GraduationCap,
  TrendingUp, ArrowLeftRight, AlertTriangle, ShieldAlert
} from "lucide-react";
import { getRoleLabel } from "@/lib/permissions";

interface NavItem {
  label: string;
  href?: string;
  icon?: ReactNode;
  isSection?: boolean;
}

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  const { profile, role, signOut } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems: NavItem[] = role === "super_admin"
    ? [
        { label: "Tableau de bord", href: "/super-admin", icon: <BarChart3 className="h-4 w-4" /> },
        { label: "Journal d'audit", href: "/super-admin/audit-logs", icon: <ShieldAlert className="h-4 w-4" /> },
      ]
    : role === "admin"
    ? [
        { label: "Tableau de bord", href: "/admin", icon: <BarChart3 className="h-4 w-4" /> },
        { label: "Logements", href: "/admin/logements", icon: <Building className="h-4 w-4" /> },
        { label: "Bailleurs", href: "/admin/bailleurs", icon: <UserCheck className="h-4 w-4" /> },
        { label: "Clients", href: "/admin/clients", icon: <GraduationCap className="h-4 w-4" /> },
        { label: "FINANCIER", isSection: true },
        { label: "Réservations", href: "/admin/reservations", icon: <BookOpen className="h-4 w-4" /> },
        { label: "Paiements & Cautions", href: "/admin/paiements", icon: <CreditCard className="h-4 w-4" /> },
        { label: "Prix & Marges", href: "/admin/tarifs", icon: <TrendingUp className="h-4 w-4" /> },
        { label: "Reversements", href: "/admin/reversements", icon: <ArrowLeftRight className="h-4 w-4" /> },
        { label: "OPÉRATIONNEL", isSection: true },
        { label: "Incidents", href: "/admin/incidents", icon: <AlertTriangle className="h-4 w-4" /> },
        { label: "Documents", href: "/admin/documents", icon: <FileText className="h-4 w-4" /> },
        { label: "SYSTÈME", isSection: true },
        { label: "Utilisateurs", href: "/admin/utilisateurs", icon: <Users className="h-4 w-4" /> },
      ]
    : role === "bailleur"
    ? [
        { label: "Tableau de bord", href: "/bailleur", icon: <Home className="h-4 w-4" /> },
        { label: "Mes logements", href: "/bailleur/logements", icon: <Building className="h-4 w-4" /> },
        { label: "Ajouter logement", href: "/bailleur/logements/nouveau", icon: <CheckCircle className="h-4 w-4" /> },
        { label: "Paiements", href: "/bailleur/paiements", icon: <CreditCard className="h-4 w-4" /> },
        { label: "Profil", href: "/bailleur/profil", icon: <Settings className="h-4 w-4" /> },
      ]
    : [
        { label: "Tableau de bord", href: "/etudiant", icon: <Home className="h-4 w-4" /> },
        { label: "Mes réservations", href: "/etudiant/reservations", icon: <BookOpen className="h-4 w-4" /> },
        { label: "Paiements", href: "/etudiant/paiements", icon: <CreditCard className="h-4 w-4" /> },
        { label: "Contrats", href: "/etudiant/contrats", icon: <FileText className="h-4 w-4" /> },
        { label: "Incidents", href: "/etudiant/incidents", icon: <AlertTriangle className="h-4 w-4" /> },
        { label: "Profil", href: "/etudiant/profil", icon: <Settings className="h-4 w-4" /> },
      ];

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      toast({
        title: "Erreur de déconnexion",
        description: error instanceof Error ? error.message : "Une erreur inattendue est survenue.",
        variant: "destructive",
      });
    }
  };

  const roleLabel = getRoleLabel(role);

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar - fixed on all screen sizes */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar text-sidebar-foreground flex flex-col transform transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
        <div className="p-4 border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="Zeyna" className="h-10 w-10 object-contain drop-shadow-md" />
            <div>
              <span className="font-serif text-sm font-bold text-sidebar-foreground block">Les Logements de Zeyna</span>
              <span className="text-xs text-sidebar-accent-foreground/60">{roleLabel}</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item, i) => (
            item.isSection ? (
              <div key={`section-${i}`} className="pt-4 pb-1">
                <p className="px-3 text-xs uppercase tracking-widest font-semibold text-sidebar-foreground/40">
                  {item.label}
                </p>
              </div>
            ) : (
              <Link
                key={item.href}
                to={item.href!}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === item.href
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            )
          ))}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-9 w-9 rounded-full bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground text-sm font-bold overflow-hidden shrink-0">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.prenom}
                  className="w-full h-full object-cover"
                />
              ) : (
                `${profile?.prenom?.[0] || ""}${profile?.nom?.[0] || ""}`.toUpperCase() || "U"
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{profile?.prenom} {profile?.nom}</p>
              <p className="text-xs text-sidebar-foreground/50 truncate">{roleLabel}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start text-sidebar-foreground/60 hover:text-destructive" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" /> Déconnexion
          </Button>
        </div>
      </aside>

      {/* Overlay mobile */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main content - offset by sidebar width on lg */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-64">
        <header className="h-14 border-b border-border bg-card flex items-center px-4 lg:px-6 sticky top-0 z-30">
          <button className="lg:hidden mr-4" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <h2 className="font-serif text-lg font-semibold">
            {navItems.find(n => n.href === location.pathname)?.label || "Dashboard"}
          </h2>
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
