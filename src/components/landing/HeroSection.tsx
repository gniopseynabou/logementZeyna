import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, Shield, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getHeroStats } from "@/services/public-content-service";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  const { data: stats, isError } = useQuery({
    queryKey: ["hero-live-stats"],
    queryFn: getHeroStats,
  });

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background photo avec overlay sombre */}
      <div className="absolute inset-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover" fetchpriority="high" />
        <div className="absolute inset-0 bg-black/65" />
      </div>

      {/* Ligne décorative dorée verticale */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-accent to-transparent opacity-60" />

      {/* Contenu */}
      <div className="relative z-10 container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-2xl">

          {/* Supraheading */}
          <div className="flex items-center gap-2 mb-6">
            <MapPin className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium text-white/70 tracking-wide uppercase">Saint-Louis, Sénégal</span>
          </div>

          {/* Titre principal */}
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-[1.1]">
            Un logement<br />
            à la hauteur{" "}
            <span className="text-accent">de vos études</span>
          </h1>

          <p className="text-white/65 text-lg leading-relaxed mb-10 max-w-xl">
            Zeyna sélectionne, vérifie et gère des logements pour les étudiants de l'UGB et de Saint-Louis.
            Réservez en ligne, emménagez sereinement.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-white font-medium px-8 h-12 text-base rounded-sm">
              <Link to="/logements" className="flex items-center gap-2">
                Voir les logements
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/25 text-white hover:bg-white/10 hover:border-white/50 px-8 h-12 text-base rounded-sm">
              <Link to="/register">Créer un compte</Link>
            </Button>
          </div>

          {/* Gages de confiance */}
          <div className="flex flex-wrap items-center gap-5 mt-10 pt-10 border-t border-white/10">
            <div className="flex items-center gap-2 text-white/55 text-sm">
              <Shield className="h-4 w-4 text-accent shrink-0" />
              Logements vérifiés
            </div>
            <div className="flex items-center gap-2 text-white/55 text-sm">
              <Clock className="h-4 w-4 text-accent shrink-0" />
              Réponse rapide
            </div>
            <div className="flex items-center gap-2 text-white/55 text-sm">
              <span className="text-accent font-bold">✓</span>
              Contrat automatique
            </div>
          </div>

        </div>
      </div>

      {/* Stats flottantes en bas à droite - uniquement si données réelles */}
      {!isError && stats && stats.length > 0 && (
        <div className="absolute bottom-10 right-8 hidden lg:flex gap-6">
          {stats.map((stat) => (
            <div key={stat.id} className="text-right">
              <div className="text-2xl font-bold font-ui text-accent">{stat.valeur}</div>
              <div className="text-xs text-white/50 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default HeroSection;
