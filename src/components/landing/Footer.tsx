import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";
import logo from "@/assets/logo.jpeg";

const Footer = () => {
  return (
    <footer className="bg-gradient-navy text-primary-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <img src={logo} alt="Zeyna" className="h-10 w-auto rounded" />
              <span className="font-serif text-lg font-bold">Les logements de Zeyna</span>
            </div>
            <p className="text-primary-foreground/60 text-sm leading-relaxed">
              Votre partenaire de confiance pour le logement étudiant à Saint-Louis du Sénégal.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-serif font-bold mb-4 text-accent">Navigation</h4>
            <ul className="space-y-2">
              {[
                { to: "/", label: "Accueil" },
                { to: "/logements", label: "Logements" },
                { to: "/register", label: "Inscription" },
                { to: "/login", label: "Connexion" },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-primary-foreground/60 hover:text-accent transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-serif font-bold mb-4 text-accent">Services</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/60">
              <li>Location étudiante</li>
              <li>Paiement Mobile Money</li>
              <li>Contrat automatique</li>
              <li>Support dédié</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-serif font-bold mb-4 text-accent">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-primary-foreground/60">
                <Mail className="h-4 w-4 text-accent" />
                contact@zeyna-logements.com
              </li>
              <li className="flex items-center gap-2 text-sm text-primary-foreground/60">
                <Phone className="h-4 w-4 text-accent" />
                +221 77 000 00 00
              </li>
              <li className="flex items-center gap-2 text-sm text-primary-foreground/60">
                <MapPin className="h-4 w-4 text-accent" />
                Saint-Louis, Sénégal
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-primary-foreground/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-primary-foreground/40">
            © {new Date().getFullYear()} Les logements de Zeyna. Tous droits réservés.
          </p>
          <div className="flex gap-6">
            <span className="text-xs text-primary-foreground/40 hover:text-accent cursor-pointer transition-colors">
              Mentions légales
            </span>
            <span className="text-xs text-primary-foreground/40 hover:text-accent cursor-pointer transition-colors">
              Politique de confidentialité
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
