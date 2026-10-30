import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Search,
  Lock,
  Building2,
  FileText,
  BadgeCheck,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getHeroStats } from "@/services/public-content-service";
import heroBg from "@/assets/hero-bg.jpg";

const CAMPUS_DISTRICTS = [
  { label: "Sanar (Campus UGB)", query: "Sanar", sub: "À 5 min à pied des amphis" },
  { label: "Bango", query: "Bango", sub: "Quartier calme & résidentiel" },
  { label: "Khor", query: "Khor", sub: "Sur la ligne de bus universitaire" },
  { label: "Balacoss", query: "Balacoss", sub: "Centre-ville & commodités" },
  { label: "Île Nord / Sud", query: "Île", sub: "Cadre historique du fleuve" },
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
    <section className="relative min-h-[94vh] flex items-center bg-basalt text-white overflow-hidden pt-28 pb-16 lg:pt-32 lg:pb-24 border-b border-white/10">
      {/* ── Toile photographique d'ancrage avec double filtre minéral et quadrillage cadastral ── */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroBg}
          alt="Campus Université Gaston Berger et résidences étudiantes à Sanar, Saint-Louis du Sénégal"
          className="w-full h-full object-cover object-center opacity-35 filter contrast-110 saturate-75"
          fetchpriority="high"
        />
        {/* Voiles de contraste et filtres minéraux */}
        <div className="absolute inset-0 bg-gradient-to-t from-basalt via-basalt/80 to-basalt/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-basalt via-basalt/70 to-transparent" />
        
        {/* Trame cadastrale géométrique d'arpentage */}
        <div className="absolute inset-0 bg-grid-cadastre-dark opacity-40 pointer-events-none" />
      </div>

      {/* ── Ligne d'accent architecturale signature Zeyna ── */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-accent" />

      {/* ── Contenu Principal ── */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          
          {/* Colonne Gauche (7 col) : Manifeste Éditorial & Moteur de Secteur */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-7">

            {/* Titre Monumental */}
            <div className="space-y-2">
              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-white leading-[1.12]">
                Le logement étudiant à Saint-Louis. <br />
                <span className="italic font-normal text-accent">Garanti par contrat, protégé par séquestre.</span>
              </h1>
            </div>

            {/* Chapeau descriptif sans complaisance */}
            <p className="text-white/75 text-base sm:text-lg leading-relaxed max-w-2xl font-light">
              Finies les cautions détournées et les visites informelles sans garantie. Zeyna audite chaque chambre hors campus entre Sanar, Bango et Khor, bloque votre place avec la <strong>caution seule</strong> et sécurise votre bail pour toute l'année universitaire à l'UGB.
            </p>

            {/* Barre de Recherche Cadastrale */}
            <form onSubmit={handleQuickSearch} className="max-w-2xl pt-2">
              <div className="bg-white/10 p-1.5 rounded-md border border-white/20 backdrop-blur-md flex flex-col sm:flex-row gap-2 shadow-2xl focus-within:border-accent transition-premium">
                <div className="relative flex-1 flex items-center">
                  <Search className="absolute left-3.5 h-4 w-4 text-white/40" />
                  <input
                    type="text"
                    placeholder="Quartier recherché (Sanar, Bango, Khor, Île...) ou mot-clé..."
                    value={quickQuery}
                    onChange={(e) => setQuickQuery(e.target.value)}
                    className="w-full bg-transparent text-white placeholder-white/40 text-sm pl-10 pr-4 py-2.5 focus:outline-none font-ui"
                  />
                </div>
                <Button
                  type="submit"
                  className="bg-accent hover:bg-accent/90 text-white rounded-sm px-7 h-11 font-ui text-xs uppercase tracking-wider font-semibold shrink-0 shadow-gold hover:shadow-none transition-premium"
                >
                  Vérifier les disponibilités
                </Button>
              </div>
            </form>

            {/* Sélecteurs de Secteurs Stratégiques avec distance UGB */}
            <div className="space-y-2.5 pt-1">
              <p className="text-[11px] uppercase tracking-widest text-white/50 font-ui font-semibold">
                Secteurs audités à proximité de l'Université Gaston Berger :
              </p>
              <div className="flex flex-wrap gap-2">
                {CAMPUS_DISTRICTS.map((district) => (
                  <Link
                    key={district.query}
                    to={`/logements?quartier=${encodeURIComponent(district.query)}`}
                    className="group px-3 py-1.5 bg-white/[0.04] hover:bg-accent/15 border border-white/10 hover:border-accent text-white/80 hover:text-white rounded-sm transition-premium flex items-center gap-1.5 font-ui text-xs"
                    title={district.sub}
                  >
                    <MapPin className="h-3 w-3 text-accent group-hover:scale-110 transition-premium" />
                    <span>{district.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* 3 Règles Fondamentales d'Équité */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-white/10 max-w-2xl">
              <div className="flex items-start gap-2.5">
                <Lock className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-semibold text-white font-ui">Caution seule exigée</div>
                  <div className="text-white/50">Pour bloquer fermement la chambre</div>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <FileText className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-semibold text-white font-ui">Bail numérique opposable</div>
                  <div className="text-white/50">Quittance certifiée à chaque versement</div>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-semibold text-white font-ui">Logements inspectés</div>
                  <div className="text-white/50">Eau, Woyofal et serrurerie vérifiés</div>
                </div>
              </div>
            </div>

          </div>

          {/* Colonne Droite (5 col) : Le Cartouche de Caution Séquestre & Métriques en Direct */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="relative rounded-md border border-white/20 bg-white/[0.05] backdrop-blur-xl p-6 sm:p-8 space-y-6 shadow-2xl accent-line-top">
              
              {/* En-tête du cartouche */}
              <div className="border-b border-white/10 pb-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-ui tracking-widest uppercase text-accent font-bold">
                    Garantie d'Intendance
                  </span>
                  <span className="text-[10px] font-mono text-white/50">REF-SN-SL-2026</span>
                </div>
                <h3 className="font-serif text-xl font-normal text-white mt-1">
                  Le Protocole Séquestre Zeyna
                </h3>
              </div>

              {/* Arguments clés */}
              <div className="space-y-3.5 text-xs text-white/70 leading-relaxed font-light">
                <div className="flex items-start gap-3 bg-white/[0.03] p-3 rounded-sm border border-white/10">
                  <ShieldCheck className="h-4 w-4 text-malachite shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white font-medium block">Zéro avance de loyer avant l'entrée</strong>
                    <span>Votre loyer ne commence qu'à la date effective de remise des clés.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white/[0.03] p-3 rounded-sm border border-white/10">
                  <Lock className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white font-medium block">Caution protégée et tracée</strong>
                    <span>Consignée sur un compte séquestre dédié, intégralement restituable selon l'état des lieux de sortie.</span>
                  </div>
                </div>
              </div>

              {/* Métriques réelles du parc (en JetBrains Mono) */}
              {!isError && stats && stats.length > 0 && (
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                  {stats.slice(0, 4).map((stat) => (
                    <div key={stat.id} className="space-y-0.5">
                      <div className="text-2xl font-bold font-mono text-accent tracking-tight">
                        {stat.valeur}
                      </div>
                      <div className="text-[11px] text-white/60 font-medium font-ui leading-tight">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Bouton d'action directe vers l'inventaire */}
              <div className="pt-2">
                <Button
                  asChild
                  className="w-full bg-accent hover:bg-accent/90 text-white rounded-sm h-12 font-ui text-xs uppercase tracking-wider font-semibold shadow-gold hover:shadow-none transition-premium"
                >
                  <Link to="/logements" className="flex items-center justify-center gap-2">
                    Consulter le répertoire des chambres
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <p className="text-[10px] text-center text-white/40 mt-2.5 font-ui">
                  Réservations ouvertes pour l'année universitaire en cours à l'UGB
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;
