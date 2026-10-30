import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, ArrowRight, ShieldCheck, Lock } from "lucide-react";
import logo from "@/assets/logo-zeyna.png";

const Footer = () => {
  return (
    <footer className="bg-basalt text-white pt-20 pb-12 border-t border-white/10 relative overflow-hidden">
      {/* ── Trame d'arpentage très discrète ── */}
      <div className="absolute inset-0 bg-grid-cadastre-dark opacity-15 pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
          
          {/* Identité de Marque & Sceau (4 col) */}
          <div className="lg:col-span-4 space-y-5">
            <Link to="/" className="flex items-center gap-3">
              <img src={logo} alt="Zeyna" className="h-10 w-auto object-contain" />
              <div className="flex flex-col leading-none">
                <span className="font-ui text-[9px] font-bold tracking-[0.2em] uppercase text-accent/80 mb-0.5">
                  Les Logements de
                </span>
                <span className="font-serif text-2xl font-bold text-white tracking-tight">
                  Zeyna
                </span>
              </div>
            </Link>

            <p className="text-white/60 text-xs sm:text-sm leading-relaxed font-light max-w-sm">
              L'autorité de gestion et de régulation du logement étudiant à Saint-Louis du Sénégal. Baux formalisés, caution séquestre et accompagnement de proximité pour la communauté de l'Université Gaston Berger.
            </p>

            <div className="pt-2 flex items-center gap-2 text-xs text-white/50 font-ui">
              <span className="w-2 h-2 rounded-full bg-malachite" />
              <span>Système d'intendance actif · Saint-Louis & UGB</span>
            </div>
          </div>

          {/* Navigation Rapide (2 col) */}
          <div className="lg:col-span-2">
            <h4 className="overline text-white/40 mb-4 block">Navigation</h4>
            <ul className="space-y-2.5 text-xs font-ui">
              {[
                { to: "/", label: "Accueil Général" },
                { to: "/logements", label: "Répertoire des Chambres" },
                { to: "/devenir-bailleur", label: "Devenir Bailleur" },
                { to: "/paiement-et-garanties", label: "Paiement & Séquestre" },
                { to: "/login", label: "Espace Résident / Propriétaire" },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-white/70 hover:text-accent transition-premium inline-flex items-center gap-1.5"
                  >
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Secteurs Résidentiels UGB (3 col) */}
          <div className="lg:col-span-3">
            <h4 className="overline text-white/40 mb-4 block">Pôles Résidentiels Audités</h4>
            <ul className="space-y-2.5 text-xs text-white/70 font-ui">
              <li className="flex items-center justify-between border-b border-white/5 pb-1.5">
                <span>Sanar (Campus UGB)</span>
                <span className="text-white/40 text-[10px]">À pied</span>
              </li>
              <li className="flex items-center justify-between border-b border-white/5 pb-1.5">
                <span>Bango Résidentiel</span>
                <span className="text-white/40 text-[10px]">5 min en bus</span>
              </li>
              <li className="flex items-center justify-between border-b border-white/5 pb-1.5">
                <span>Khor & Boudiouck</span>
                <span className="text-white/40 text-[10px]">Lignes directes</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Île de Saint-Louis & Balacoss</span>
                <span className="text-white/40 text-[10px]">Centre-ville</span>
              </li>
            </ul>
          </div>

          {/* Bureau d'Intendance & Contact (3 col) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="overline text-white/40 mb-4 block">Bureau d'Intendance</h4>
            <ul className="space-y-3 text-xs text-white/70">
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                <span>Saint-Louis, Région de Saint-Louis, République du Sénégal</span>
              </li>
              <li className="flex items-center gap-2.5 font-mono text-[11px]">
                <Phone className="h-4 w-4 text-accent shrink-0" />
                <span>+221 78 432 64 86 / +221 77 602 38 70</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-accent shrink-0" />
                <a href="mailto:contact@logements-zeyna.site" className="hover:text-accent transition-premium">
                  contact@logements-zeyna.site
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* ── Bandeau Inférieur de Légalité & Droits ── */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-white/40 font-ui">
          <p>
            &copy; {new Date().getFullYear()} Les Logements de Zeyna. Tous droits d'intendance réservés.
          </p>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            <Link to="/paiement-et-garanties" className="hover:text-white transition-premium text-accent/80">
              Charte Séquestre & Caution
            </Link>
            <Link to="/mentions-legales" className="hover:text-white transition-premium">
              Mentions Légales
            </Link>
            <Link to="/cgu" className="hover:text-white transition-premium">
              CGU
            </Link>
            <Link to="/cgv" className="hover:text-white transition-premium">
              CGV
            </Link>
            <Link to="/confidentialite" className="hover:text-white transition-premium">
              Confidentialité
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
