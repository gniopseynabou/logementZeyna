import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, LogOut, User, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/logo-zeyna.png";
import { getDashboardPathByRole } from "@/lib/permissions";
import { AnimatePresence, motion } from "framer-motion";

const NAV_LINKS = [
  { to: "/", label: "Accueil", exact: true },
  { to: "/logements", label: "Logements", exact: false },
  { to: "/devenir-bailleur", label: "Devenir Bailleur", exact: false, accent: true },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, role, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const dashboardPath = getDashboardPathByRole(role);

  // Détection scroll pour changer le style de la navbar
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fermer le menu mobile sur changement de route
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

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

  const isActive = (to: string, exact: boolean) =>
    exact ? location.pathname === to : location.pathname.startsWith(to) && to !== "/";

  return (
    <nav
      className={`
        fixed top-0 left-0 right-0 z-50 transition-premium bg-card/95 backdrop-blur-md border-b border-border text-foreground
        ${scrolled ? "shadow-md" : "shadow-sm"}
      `}
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 md:h-18">

          {/* ── Brand ─────────────────────────────────────────────────── */}
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src={logo}
              alt="Les Logements de Zeyna"
              className="h-9 w-9 md:h-10 md:w-10 object-contain group-hover:scale-105 transition-premium"
            />
            {/* Traitement typographique du nom de marque */}
            <div className="flex flex-col leading-none hidden sm:flex">
              <span className="font-ui text-[9px] font-bold tracking-[0.22em] uppercase text-accent mb-0.5">
                Les Logements de
              </span>
              <span className="font-serif text-xl font-bold text-foreground tracking-tight group-hover:text-accent transition-premium">
                Zeyna
              </span>
            </div>
          </Link>

          {/* ── Nav Desktop ──────────────────────────────────────────── */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`
                  relative px-3.5 py-2 text-sm font-medium rounded-md transition-premium
                  ${isActive(link.to, link.exact ?? false)
                    ? "text-foreground font-semibold"
                    : link.accent
                    ? "text-accent hover:text-accent/80 font-medium"
                    : "text-foreground/85 hover:text-foreground hover:bg-muted/80"
                  }
                `}
              >
                {/* Indicateur de page active */}
                {isActive(link.to, link.exact ?? false) && (
                  <motion.span
                    layoutId="nav-active-indicator"
                    className="absolute inset-0 bg-muted rounded-md -z-10"
                    transition={{ type: "spring", duration: 0.4, bounce: 0.2 }}
                  />
                )}
                {link.label}
              </Link>
            ))}
          </div>

          {/* ── Actions Desktop ──────────────────────────────────────── */}
          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />

            {user ? (
              <>
                <Link
                  to={dashboardPath}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-foreground hover:bg-muted transition-premium"
                >
                  <div className="h-6 w-6 rounded-md bg-accent flex items-center justify-center text-white text-[10px] font-bold font-ui overflow-hidden">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt={profile.prenom} className="w-full h-full object-cover" />
                    ) : (
                      `${profile?.prenom?.[0] || ""}${profile?.nom?.[0] || ""}`.toUpperCase() || "U"
                    )}
                  </div>
                  <span>{profile?.prenom || "Mon espace"}</span>
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="gap-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-premium"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden lg:inline">Déconnexion</span>
                </Button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-sm font-medium text-foreground/85 hover:text-foreground transition-premium rounded-md hover:bg-muted/80"
                >
                  Connexion
                </Link>
                <Button
                  asChild
                  size="sm"
                  className="bg-accent hover:bg-accent/90 text-white rounded-md font-ui text-xs uppercase tracking-wider font-semibold px-4 h-9 shadow-gold hover:shadow-none transition-premium"
                >
                  <Link to="/register">Créer un compte</Link>
                </Button>
              </>
            )}
          </div>

          {/* ── Hamburger Mobile ─────────────────────────────────────── */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              className="p-2 rounded-md text-foreground hover:bg-muted transition-premium border border-border/60"
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Menu ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden overflow-hidden border-t border-border bg-card/98 backdrop-blur-md"
          >
            <div className="container mx-auto px-4 py-3 flex flex-col gap-0.5">

              {NAV_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`
                    flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-premium
                    ${isActive(link.to, link.exact ?? false)
                      ? "bg-muted text-foreground"
                      : link.accent
                      ? "text-accent hover:bg-accent/8"
                      : "text-foreground/70 hover:text-foreground hover:bg-muted/60"
                    }
                  `}
                >
                  {link.label}
                </Link>
              ))}

              <div className="border-t border-border/60 my-2" />

              {user ? (
                <>
                  <Link
                    to={dashboardPath}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-muted/60 transition-premium"
                  >
                    <User className="h-4 w-4" />
                    {profile?.prenom || "Mon espace"}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm font-medium text-destructive hover:bg-destructive/8 text-left transition-premium"
                  >
                    <LogOut className="h-4 w-4" />
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="flex items-center px-3 py-2.5 rounded-md text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-muted/60 transition-premium"
                  >
                    Connexion
                  </Link>
                  <div className="pt-1 pb-2">
                    <Button
                      asChild
                      className="w-full bg-accent hover:bg-accent/90 text-white rounded-md font-ui text-xs uppercase tracking-wider font-semibold h-10"
                    >
                      <Link to="/register">Créer un compte</Link>
                    </Button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
