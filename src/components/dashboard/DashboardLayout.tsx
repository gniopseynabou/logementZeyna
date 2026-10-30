import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/logo-zeyna.png";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, Building, Users, CreditCard, FileText, LogOut,
  Menu, X, BarChart3, CheckCircle, UserCheck, BookOpen,
  GraduationCap, TrendingUp, ArrowLeftRight, AlertTriangle,
  ShieldAlert, ChevronRight, Settings,
} from "lucide-react";
import { getRoleLabel } from "@/lib/permissions";

interface NavItem {
  label: string;
  href?: string;
  icon?: ReactNode;
  isSection?: boolean;
}

// Sidebar overlay animation
const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const sidebarVariants = {
  hidden: { x: "-100%" },
  visible: { x: 0 },
};

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  const { profile, role, signOut } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fermer la sidebar mobile lors d'un changement de route
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Bloquer le scroll body quand sidebar ouverte sur mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

  const navItems: NavItem[] = role === "super_admin"
    ? [
        { label: "Tableau de bord", href: "/super-admin", icon: <BarChart3 className="h-4 w-4" /> },
        { label: "Journal d'audit", href: "/super-admin/audit-logs", icon: <ShieldAlert className="h-4 w-4" /> },
      ]
    : role === "admin"
    ? [
        { label: "Vue d'ensemble", href: "/admin", icon: <BarChart3 className="h-4 w-4" /> },
        { label: "Logements", href: "/admin/logements", icon: <Building className="h-4 w-4" /> },
        { label: "Bailleurs", href: "/admin/bailleurs", icon: <UserCheck className="h-4 w-4" /> },
        { label: "Clients", href: "/admin/clients", icon: <GraduationCap className="h-4 w-4" /> },
        { label: "FINANCIER", isSection: true },
        { label: "Réservations", href: "/admin/reservations", icon: <BookOpen className="h-4 w-4" /> },
        { label: "Paiements & Reçus", href: "/admin/paiements", icon: <CreditCard className="h-4 w-4" /> },
        { label: "Prix & Marges", href: "/admin/tarifs", icon: <TrendingUp className="h-4 w-4" /> },
        { label: "Reversements", href: "/admin/reversements", icon: <ArrowLeftRight className="h-4 w-4" /> },
        { label: "OPÉRATIONNEL", isSection: true },
        { label: "Incidents", href: "/admin/incidents", icon: <AlertTriangle className="h-4 w-4" /> },
        { label: "Documents & Registre", href: "/admin/documents", icon: <FileText className="h-4 w-4" /> },
        { label: "SYSTÈME", isSection: true },
        { label: "Utilisateurs", href: "/admin/utilisateurs", icon: <Users className="h-4 w-4" /> },
      ]
    : role === "bailleur"
    ? [
        { label: "Tableau de bord", href: "/bailleur", icon: <Home className="h-4 w-4" /> },
        { label: "Mes logements", href: "/bailleur/logements", icon: <Building className="h-4 w-4" /> },
        { label: "Ajouter un bien", href: "/bailleur/logements/nouveau", icon: <CheckCircle className="h-4 w-4" /> },
        { label: "Paiements", href: "/bailleur/paiements", icon: <CreditCard className="h-4 w-4" /> },
        { label: "Contrats", href: "/bailleur/contrats", icon: <FileText className="h-4 w-4" /> },
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
  const currentPage = navItems.find(n => n.href === location.pathname)?.label || "Dashboard";

  const initials = `${profile?.prenom?.[0] || ""}${profile?.nom?.[0] || ""}`.toUpperCase() || "U";

  // ── Sidebar Content ────────────────────────────────────────────────────────

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">

      {/* Logo & Brand */}
      <div className="px-4 py-5 border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative shrink-0">
            <img src={logo} alt="Zeyna" className="h-9 w-9 object-contain" />
            {/* Halo or au hover */}
            <div className="absolute inset-0 rounded-full bg-accent/0 group-hover:bg-accent/10 transition-premium" />
          </div>
          <div className="min-w-0">
            <span className="font-ui text-[11px] font-bold tracking-[0.15em] uppercase text-sidebar-primary block truncate">
              Les Logements de Zeyna
            </span>
            <span className="font-ui text-[10px] text-sidebar-foreground/40 tracking-wider uppercase mt-0.5 block">
              {roleLabel}
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item, i) =>
          item.isSection ? (
            <div key={`section-${i}`} className="pt-5 pb-2 px-2">
              <p className="text-[9px] font-ui font-bold uppercase tracking-[0.18em] text-sidebar-foreground/30">
                {item.label}
              </p>
            </div>
          ) : (
            <Link
              key={item.href}
              to={item.href!}
              className={`
                group relative flex items-center gap-3 px-3 py-2.5 rounded-md text-sm
                font-medium transition-premium
                ${location.pathname === item.href
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground/60 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                }
              `}
            >
              {/* Ligne or active */}
              {location.pathname === item.href && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-sidebar-primary rounded-r-full" />
              )}
              <span className={`shrink-0 transition-premium ${
                location.pathname === item.href
                  ? "text-sidebar-primary"
                  : "text-sidebar-foreground/40 group-hover:text-sidebar-foreground/70"
              }`}>
                {item.icon}
              </span>
              <span className="truncate">{item.label}</span>
              {location.pathname === item.href && (
                <ChevronRight className="ml-auto h-3 w-3 text-sidebar-primary/60 shrink-0" />
              )}
            </Link>
          )
        )}
      </nav>

      {/* User footer */}
      <div className="px-3 py-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-2 py-2.5 rounded-md mb-1 hover:bg-sidebar-accent/40 transition-premium group">
          {/* Avatar */}
          <div className="h-8 w-8 rounded-md bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground text-xs font-bold font-ui shrink-0 overflow-hidden">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.prenom} className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate text-sidebar-foreground">
              {profile?.prenom} {profile?.nom}
            </p>
            <p className="text-[10px] text-sidebar-foreground/40 font-ui uppercase tracking-wider truncate">
              {roleLabel}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-2 py-2 rounded-md text-sm text-sidebar-foreground/40 hover:text-red-400 hover:bg-red-500/10 transition-premium font-medium"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>Déconnexion</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-background">

      {/* ── Sidebar Desktop (fixe) ─────────────────────────────────────── */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-60 z-40 flex-col border-r border-sidebar-border shadow-md">
        <SidebarContent />
      </aside>

      {/* ── Sidebar Mobile (drawer animé) ─────────────────────────────── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              transition={{ duration: 0.2 }}
              onClick={() => setSidebarOpen(false)}
            />
            {/* Drawer */}
            <motion.aside
              className="fixed inset-y-0 left-0 w-72 z-50 lg:hidden shadow-2xl"
              variants={sidebarVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Bouton fermeture */}
              <button
                onClick={() => setSidebarOpen(false)}
                className="absolute top-4 right-3 z-10 p-1.5 rounded-md text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-premium"
                aria-label="Fermer le menu"
              >
                <X className="h-4 w-4" />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main Content ──────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-60 min-w-0">

        {/* ── Header ────────────────────────────────────────────────── */}
        <header className="h-14 border-b border-border bg-card/95 backdrop-blur-md flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30 gap-4 text-foreground shadow-sm">

          {/* Gauche : Hamburger + Breadcrumb */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              className="lg:hidden p-1.5 -ml-1 rounded-md text-foreground/85 hover:text-foreground hover:bg-muted border border-border/60 transition-premium"
              onClick={() => setSidebarOpen(true)}
              aria-label="Ouvrir le menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Page title */}
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-ui text-[11px] text-muted-foreground uppercase tracking-wider hidden sm:block font-medium">
                {roleLabel}
              </span>
              <span className="text-muted-foreground/60 hidden sm:block font-mono">/</span>
              <h2 className="font-serif text-base font-semibold text-foreground truncate">
                {currentPage}
              </h2>
            </div>
          </div>

          {/* Droite : Utilitaires */}
          <div className="flex items-center gap-1.5 shrink-0">
            <ThemeToggle />

            {/* Avatar compact */}
            <div className="h-7 w-7 rounded-md bg-sidebar text-sidebar-foreground flex items-center justify-center text-[11px] font-bold font-ui overflow-hidden ml-1">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.prenom} className="w-full h-full object-cover" />
              ) : (
                initials
              )}
            </div>
          </div>
        </header>

        {/* ── Page Content ──────────────────────────────────────────── */}
        <main className="flex-1 p-4 sm:p-5 lg:p-6 min-w-0 overflow-x-hidden">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
