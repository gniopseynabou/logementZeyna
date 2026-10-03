import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, ArrowRight } from "lucide-react";
import logo from "@/assets/logo-zeyna.png";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background pt-20 pb-10">
      <div className="container mx-auto px-4">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          
          {/* Brand */}
          <div className="lg:col-span-1">
            <img src={logo} alt="Zeyna" className="h-12 w-auto mb-6 brightness-0 invert opacity-90" />
            <p className="text-background/60 text-sm leading-relaxed mb-6">
              L'excellence dans la gestion et la location de logements étudiants à Saint-Louis du Sénégal.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-8 h-8 rounded-full border border-background/20 flex items-center justify-center text-background/60 hover:text-accent hover:border-accent transition-colors">
                <span className="sr-only">Facebook</span>
                {/* SVG placeholder for social */}
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"></path></svg>
              </a>
              <a href="#" className="w-8 h-8 rounded-full border border-background/20 flex items-center justify-center text-background/60 hover:text-accent hover:border-accent transition-colors">
                <span className="sr-only">Instagram</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
            </div>
          </div>

          {/* Nav */}
          <div>
            <h4 className="font-serif font-bold mb-6 text-background tracking-wide">Navigation</h4>
            <ul className="space-y-3">
              {[
                { to: "/", label: "Accueil" },
                { to: "/logements", label: "Voir les logements" },
                { to: "/register", label: "Créer un compte" },
                { to: "/login", label: "Espace client" },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-background/60 hover:text-accent transition-colors flex items-center gap-2 group">
                    <ArrowRight className="h-3 w-3 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-serif font-bold mb-6 text-background tracking-wide">Services</h4>
            <ul className="space-y-3 text-sm text-background/60">
              <li>Location étudiante sécurisée</li>
              <li>Gestion pour bailleurs</li>
              <li>Paiement digital (Mobile Money)</li>
              <li>Assistance 24/7</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-serif font-bold mb-6 text-background tracking-wide">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-background/60">
                <MapPin className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                <span>Saint-Louis<br />Sénégal</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-background/60">
                <Phone className="h-5 w-5 text-accent shrink-0" />
                <span>+221 77 000 00 00</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-background/60">
                <Mail className="h-5 w-5 text-accent shrink-0" />
                <a href="mailto:contact@zeyna-logements.com" className="hover:text-accent">contact@zeyna-logements.com</a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-background/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-background/40">
          <p>
            &copy; {new Date().getFullYear()} Les Logements de Zeyna. Tous droits réservés.
          </p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-background transition-colors">Mentions légales</a>
            <a href="#" className="hover:text-background transition-colors">CGV / CGU</a>
            <a href="#" className="hover:text-background transition-colors">Confidentialité</a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
