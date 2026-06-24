import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import logo from "@/assets/logo.jpeg";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, role, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const dashboardPath = role === "admin" ? "/admin" : role === "bailleur" ? "/bailleur" : "/etudiant";

  const handleLogout = async () => {
    await signOut();
    navigate("/");
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="Les logements de Zeyna" className="h-10 md:h-12 w-auto" />
            <span className="font-serif text-lg md:text-xl font-bold text-primary hidden sm:block">
              Les logements de Zeyna
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm font-medium text-foreground hover:text-accent transition-colors">Accueil</Link>
            <Link to="/logements" className="text-sm font-medium text-foreground hover:text-accent transition-colors">Logements</Link>

            {user ? (
              <>
                <Link to={dashboardPath} className="text-sm font-medium text-foreground hover:text-accent transition-colors flex items-center gap-1">
                  <User className="h-4 w-4" /> {profile?.prenom || "Mon espace"}
                </Link>
                <Button variant="outline" size="sm" onClick={handleLogout} className="gap-1">
                  <LogOut className="h-4 w-4" /> Déconnexion
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-foreground hover:text-accent transition-colors">Connexion</Link>
                <Button asChild className="bg-gradient-gold hover:opacity-90 text-accent-foreground shadow-gold">
                  <Link to="/register">Créer un compte</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden p-2" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden pb-4 animate-fade-in">
            <div className="flex flex-col gap-3">
              <Link to="/" className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-md" onClick={() => setIsOpen(false)}>Accueil</Link>
              <Link to="/logements" className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-md" onClick={() => setIsOpen(false)}>Logements</Link>

              {user ? (
                <>
                  <Link to={dashboardPath} className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-md" onClick={() => setIsOpen(false)}>Mon espace</Link>
                  <button className="px-4 py-2 text-sm font-medium text-left hover:bg-muted rounded-md text-destructive" onClick={handleLogout}>Déconnexion</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-md" onClick={() => setIsOpen(false)}>Connexion</Link>
                  <Button asChild className="bg-gradient-gold text-accent-foreground mx-4">
                    <Link to="/register" onClick={() => setIsOpen(false)}>Créer un compte</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
