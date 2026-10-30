import { Link } from "react-router-dom";
import { MapPin, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { SkeletonLogementCard } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { getPopularLogements } from "@/services/logement-service";
import logement1 from "@/assets/logement-1.jpg";
import logement2 from "@/assets/logement-2.jpg";
import logement3 from "@/assets/logement-3.jpg";
import logement4 from "@/assets/logement-4.jpg";
import logement5 from "@/assets/logement-5.jpg";
import logement6 from "@/assets/logement-6.jpg";

const fallbackImages = [logement1, logement2, logement3, logement4, logement5, logement6];

const PopularLogements = () => {
  const { data: logements, isLoading, isError, refetch } = useQuery({
    queryKey: ["popular-logements"],
    queryFn: getPopularLogements,
  });

  const displayLogements = (logements || []).map((l, i) => {
    const validChambres = (l.chambres || []).filter((c: any) => c.prix_zeyna || c.prix_bailleur);
    const minPrice = validChambres.length ? Math.min(...validChambres.map((c: any) => c.prix_zeyna || c.prix_bailleur)) : 0;
    const minCaution = validChambres.length ? Math.min(...validChambres.map((c: any) => c.caution || 0)) : 0;
    const capacity = l.chambres?.length ? Math.max(...l.chambres.map((c: any) => c.nombre_personnes)) : 0;
    const available = l.chambres?.some((c: any) => c.est_disponible) ?? false;
    const hasIndividuel = l.chambres?.some((c: any) => c.mode_reservation === "individuel" || !c.mode_reservation);
    const hasCollectif = l.chambres?.some((c: any) => c.mode_reservation === "collectif");

    return {
      id: l.id,
      nom: l.nom,
      ville: l.ville,
      adresse: l.adresse,
      type: l.type,
      images: l.images && l.images.length > 0 ? l.images : [fallbackImages[i % fallbackImages.length]],
      minPrice,
      minCaution,
      capacity,
      available,
      hasIndividuel,
      hasCollectif,
    };
  });

  if (isLoading) {
    return (
      <section className="py-24 bg-sand-50/60 border-b border-border/40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <SkeletonLogementCard key={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="py-24 bg-sand-50/60 border-b border-border/40" role="alert">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-serif text-3xl font-normal text-foreground">Résidences sélectionnées</h2>
          <p className="text-muted-foreground mt-3 text-sm">Impossible de charger les résidences pour le moment.</p>
          <Button variant="outline" className="mt-6 border-accent text-accent hover:bg-accent/10 rounded-sm font-ui" onClick={() => refetch()}>
            Réessayer
          </Button>
        </div>
      </section>
    );
  }

  if (displayLogements.length === 0) {
    return null;
  }

  return (
    <section className="py-24 lg:py-32 bg-background border-b border-border/60 relative overflow-hidden">
      {/* ── Trame d'arpentage très discrète en arrière-plan ── */}
      <div className="absolute inset-0 bg-grid-cadastre opacity-20 pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* En-tête architectural */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-14 border-b border-border pb-8 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 bg-accent rounded-full" />
              <p className="text-xs font-semibold font-ui text-accent uppercase tracking-widest">
                Sélection Résidentielle
              </p>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-foreground tracking-tight">
              Nos adresses les plus demandées
            </h2>
          </div>
          <Button asChild variant="outline" className="rounded-sm border-foreground text-foreground hover:bg-foreground hover:text-background font-ui text-xs uppercase tracking-wider font-semibold h-11 px-6 shrink-0">
            <Link to="/logements" className="flex items-center gap-2">
              Consulter tout le catalogue <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Grille de cartes architecturales */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayLogements.map((logement) => (
            <Link
              to={`/logements/${logement.id}`}
              key={logement.id}
              className="group flex flex-col bg-card border border-border hover:border-accent/40 transition-premium rounded-md overflow-hidden shadow-premium hover:shadow-elevated"
            >
              {/* Cadre Visuel */}
              <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                <img
                  src={logement.images[0]}
                  alt={logement.nom}
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-premium" />

                {/* État de disponibilité */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <StatusBadge
                    status={logement.available ? "disponible" : "complet"}
                    size="xs"
                  />
                  <span className="px-2 py-0.5 text-[10px] font-ui uppercase tracking-wider bg-black/60 text-white backdrop-blur-md rounded-sm border border-white/10 font-semibold">
                    {logement.type}
                  </span>
                </div>

                {/* Badges de mode de réservation */}
                <div className="absolute bottom-2.5 left-3 right-3 flex flex-wrap gap-1.5">
                  {logement.hasIndividuel && (
                    <span className="px-2 py-0.5 text-[10px] font-ui font-medium bg-black/75 text-white/95 backdrop-blur-sm rounded-sm">
                      Place individuelle
                    </span>
                  )}
                  {logement.hasCollectif && (
                    <span className="px-2 py-0.5 text-[10px] font-ui font-medium bg-accent/90 text-white backdrop-blur-sm rounded-sm">
                      Chambre partagée
                    </span>
                  )}
                </div>
              </div>

              {/* Détails & Typographie */}
              <div className="p-5 flex flex-col flex-grow justify-between">
                <div>
                  <h3 className="font-serif text-lg font-semibold text-foreground group-hover:text-accent transition-premium leading-snug">
                    {logement.nom}
                  </h3>

                  <div className="flex items-center gap-1.5 text-muted-foreground text-xs mt-1.5">
                    <MapPin className="h-3.5 w-3.5 text-accent shrink-0" />
                    <span className="truncate">{logement.adresse}, {logement.ville}</span>
                  </div>
                </div>

                {/* Séparation et données financières */}
                <div className="mt-5 pt-3.5 border-t border-border/70 flex items-end justify-between">
                  <div className="text-xs text-muted-foreground">
                    <div className="flex items-center gap-1 font-ui font-medium text-foreground">
                      <Users className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{logement.capacity} pers. max</span>
                    </div>
                    {logement.minCaution > 0 && (
                      <div className="text-[11px] text-muted-foreground mt-1">
                        Caution : <span className="font-mono font-semibold text-foreground">{logement.minCaution.toLocaleString("fr-FR")} F</span>
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="overline text-[9px] block">
                      Loyer mensuel
                    </span>
                    <span className="text-base font-bold font-mono text-accent">
                      {logement.minPrice > 0 ? `${logement.minPrice.toLocaleString("fr-FR")} F` : "Sur demande"}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
};

export default PopularLogements;
