import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, ShieldCheck, CheckCircle2, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getHeroStats } from "@/services/public-content-service";
import heroBg from "@/assets/hero-bg.jpg";

const CAMPUS_DISTRICTS = [
  { label: "Sanar (Campus UGB)", query: "Sanar" },
  { label: "Bango", query: "Bango" },
  { label: "Khor", query: "Khor" },
  { label: "Balacoss", query: "Balacoss" },
  { label: "Île Nord / Sud", query: "Île" },
];

const HeroSection = () => {
  const navigate = useNavigate();
  const [quickQuery, setQuickQuery] = useState("");

  const { data: stats, isError } = useQuery({
    queryKey: ["hero-live-stats"],
    queryFn: getHeroStats,
  });

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickQuery.trim()) {
      navigate(`/logements?search=${encodeURIComponent(quickQuery.trim())}`);
    } else {
      navigate("/logements");
    }
  };

  return (
    <section className="relative min-h-[92vh] flex items-center bg-basalt text-white overflow-hidden pt-24 pb-16">
      {/* Background photo avec traitement architectural sombre */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroBg}
          alt="Résidence étudiante à Saint-Louis"
          className="w-full h-full object-cover object-center opacity-100 filter contrast-100 saturate-100"
          fetchpriority="high"
        />
        {/* Voiles et filtres de lumière minérale */}
        <div className="absolute inset-0 bg-gradient-to-t from-basalt via-basalt/10 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-basalt via-basalt/10 to-transparent" />
      </div>

      {/* Ligne d'accent architecturale */}
      <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-accent/70" />

      {/* Conteneur principal */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Colonne éditoriale principale */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            
            {/* Surtitre institutionnel */}
            <div className="inline-flex items-center gap-2.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <MapPin className="h-3.5 w-3.5 text-accent" />
              <span className="font-ui text-xs font-semibold tracking-widest uppercase text-white/80">
                Saint-Louis du Sénégal & UGB
              </span>
            </div>

            {/* Titre monumental */}
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-normal tracking-tight text-white leading-[1.1]">
              L’habitat étudiant, <br />
              <span className="font-semibold italic text-accent">maîtrisé avec rigueur.</span>
            </h1>

            {/* Chapeau explicatif */}
            <p className="text-white/70 text-base sm:text-lg leading-relaxed max-w-2xl font-light">
              Zeyna sélectionne, normalise et administre des logements pour les étudiants de l'Université Gaston Berger et les jeunes actifs. Réservation transparente et gestion directe de la caution.
            </p>

            {/* Moteur de recherche rapide intégré */}
            <form onSubmit={handleQuickSearch} className="max-w-xl flex flex-col sm:flex-row gap-2 pt-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <input
                  type="text"
                  placeholder="Quartier (Sanar, Bango, Khor...), ou nom..."
                  value={quickQuery}
                  onChange={(e) => setQuickQuery(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm pl-10 pr-4 py-3 rounded-sm focus:outline-none focus:border-accent transition-colors"
                />
              </div>
              <Button type="submit" className="bg-accent hover:bg-accent/90 text-white rounded-sm px-6 h-12 font-ui text-xs uppercase tracking-wider font-semibold">
                Explorer
              </Button>
            </form>

            {/* Pastilles directes vers les pôles de l'UGB */}
            <div className="pt-2">
              <p className="text-xs uppercase tracking-widest text-white/40 font-ui mb-2 font-medium">Secteurs clés :</p>
              <div className="flex flex-wrap gap-2">
                {CAMPUS_DISTRICTS.map((district) => (
                  <Link
                    key={district.query}
                    to={`/logements?quartier=${encodeURIComponent(district.query)}`}
                    className="text-xs px-3 py-1 bg-white/5 hover:bg-accent/20 border border-white/10 hover:border-accent text-white/80 hover:text-white rounded-sm transition-all font-ui"
                  >
                    {district.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Piliers de confiance & règles fondamentales */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-white/10 max-w-2xl">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-semibold text-white">Caution seule exigée</div>
                  <div className="text-white/50">Pour bloquer la réservation</div>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-semibold text-white">Modes vérifiés</div>
                  <div className="text-white/50">Place seule ou chambre entière</div>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-semibold text-white">Bail & Reçu traçable</div>
                  <div className="text-white/50">Délivrés dès validation</div>
                </div>
              </div>
            </div>

          </div>

          {/* Colonne latérale : Cartouche architectural & Stats réelles */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="border border-white/15 bg-white/[0.04] backdrop-blur-md p-6 sm:p-8 rounded-sm space-y-6">
              
              <div className="border-b border-white/10 pb-4">
                <span className="text-[11px] font-ui tracking-widest uppercase text-accent font-semibold block mb-1">
                  Intendance & Médiation
                </span>
                <h3 className="font-serif text-xl font-normal text-white">
                  Pourquoi passer par Zeyna ?
                </h3>
              </div>

              <div className="space-y-4 text-xs text-white/70 leading-relaxed">
                <p>
                  Finies les visites fantômes et les cautions non remboursées. Chaque bailleur signe un accord formel et chaque locataire dispose d'un contrat clair avec reçu opposable.
                </p>
                <div className="bg-white/5 p-3 rounded-sm border border-white/10 text-white/80">
                  <span className="text-accent font-semibold block mb-0.5">Étudiants de l'UGB :</span>
                  Accédez à des logements proches des lignes de bus et du campus Sanar, équipés et sécurisés.
                </div>
              </div>

              {/* Stats en direct si disponibles */}
              {!isError && stats && stats.length > 0 && (
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                  {stats.slice(0, 4).map((stat) => (
                    <div key={stat.id} className="space-y-0.5">
                      <div className="text-2xl font-bold font-ui text-accent tracking-tight">
                        {stat.valeur}
                      </div>
                      <div className="text-[11px] text-white/60 font-medium leading-tight">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-2">
                <Button asChild className="w-full bg-accent hover:bg-accent/90 text-white rounded-sm h-11 font-ui text-xs uppercase tracking-wider font-semibold">
                  <Link to="/logements" className="flex items-center justify-center gap-2">
                    Consulter les disponibilités
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;

