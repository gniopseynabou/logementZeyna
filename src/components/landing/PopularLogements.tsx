import { Link } from "react-router-dom";
import { MapPin, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
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

  const displayLogements = (logements || []).map((l, i) => ({
    id: l.id,
    nom: l.nom,
    ville: l.ville,
    adresse: l.adresse,
    images: l.images && l.images.length > 0 ? l.images : [fallbackImages[i % fallbackImages.length]],
    minPrice: l.chambres?.length ? Math.min(...l.chambres.filter((c: any) => c.prix_zeyna).map((c: any) => c.prix_zeyna)) : 0,
    capacity: l.chambres?.length ? Math.max(...l.chambres.map((c: any) => c.nombre_personnes)) : 0,
    available: l.chambres?.some((c: any) => c.est_disponible) ?? false,
  }));

  if (isLoading) {
    return (
      <section className="py-24 md:py-32 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1,2,3].map(i => <div key={i} className="h-80 bg-muted animate-pulse rounded-sm" />)}
          </div>
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="py-24 md:py-32 bg-secondary/30" role="alert">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">Logements populaires</h2>
          <p className="text-muted-foreground mt-4">Impossible de charger les logements pour le moment.</p>
          <Button variant="outline" className="mt-6 border-accent text-accent hover:bg-accent/10" onClick={() => refetch()}>
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
    <section className="py-24 md:py-32 bg-secondary/30">
      <div className="container mx-auto px-4">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-16 border-b border-border/50 pb-8">
          <div className="max-w-xl">
            <p className="text-xs font-bold text-accent uppercase tracking-widest mb-3">Nos offres</p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
              Les résidences en vue
            </h2>
            <p className="text-muted-foreground mt-4 leading-relaxed">
              Découvrez nos logements les plus demandés à Saint-Louis et ses environs, sélectionnés pour leur qualité et leur emplacement.
            </p>
          </div>
          <Button asChild variant="outline" className="mt-6 md:mt-0 rounded-sm border-foreground text-foreground hover:bg-foreground hover:text-background">
            <Link to="/logements" className="flex items-center gap-2">
              Voir tout le catalogue <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayLogements.map((logement) => (
            <Link to={`/logements/${logement.id}`} key={logement.id} className="group flex flex-col">
              
              {/* Image Container */}
              <div className="relative h-64 overflow-hidden mb-4 bg-muted">
                <img 
                  src={logement.images[0]} 
                  alt={logement.nom} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" 
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300" />
                
                <div className={`absolute top-4 left-4 px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-sm ${logement.available ? "bg-white/90 text-foreground" : "bg-black/70 text-white"}`}>
                  {logement.available ? "Disponible" : "Complet"}
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-col flex-grow">
                <h3 className="font-serif text-xl font-bold text-foreground group-hover:text-accent transition-colors">
                  {logement.nom}
                </h3>
                
                <div className="flex items-center gap-1.5 text-muted-foreground text-sm mt-2 mb-4">
                  <MapPin className="h-3.5 w-3.5 text-accent" /> 
                  <span className="truncate">{logement.adresse}, {logement.ville}</span>
                </div>

                <div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                    <Users className="h-4 w-4 text-muted-foreground" /> {logement.capacity} max
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground mr-1">À partir de</span>
                    <span className="text-lg font-bold font-ui text-accent">
                      {logement.minPrice > 0 ? `${logement.minPrice.toLocaleString()} F` : "Sur demande"}
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
