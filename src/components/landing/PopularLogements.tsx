import { Link } from "react-router-dom";
import { MapPin, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import logement1 from "@/assets/logement-1.jpg";
import logement2 from "@/assets/logement-2.jpg";
import logement3 from "@/assets/logement-3.jpg";
import logement4 from "@/assets/logement-4.jpg";
import logement5 from "@/assets/logement-5.jpg";
import logement6 from "@/assets/logement-6.jpg";

const fallbackImages = [logement1, logement2, logement3, logement4, logement5, logement6];

const PopularLogements = () => {
  const { data: logements, isLoading } = useQuery({
    queryKey: ["popular-logements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("logements")
        .select("*, chambres(*)")
        .eq("statut", "valide")
        .limit(6);
      if (error) throw error;
      return data;
    },
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
      <section className="py-20 md:py-28 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3].map(i => <div key={i} className="h-72 bg-muted animate-pulse rounded-xl" />)}
          </div>
        </div>
      </section>
    );
  }

  if (displayLogements.length === 0) {
    return (
      <section className="py-20 md:py-28 bg-secondary/50">
        <div className="container mx-auto px-4 text-center">
          <span className="text-sm font-semibold text-accent uppercase tracking-wider">Nos offres</span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mt-3">Logements populaires</h2>
          <p className="text-muted-foreground mt-4">Les logements seront disponibles prochainement. Revenez bientôt !</p>
          <Button asChild className="mt-6 bg-gradient-gold text-accent-foreground">
            <Link to="/register">Créer un compte</Link>
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 md:py-28 bg-secondary/50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12">
          <div>
            <span className="text-sm font-semibold text-accent uppercase tracking-wider">Nos offres</span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mt-3">Logements populaires</h2>
            <p className="text-muted-foreground mt-3 max-w-lg">Découvrez nos résidences les plus demandées à Saint-Louis et ses environs.</p>
          </div>
          <Button asChild variant="outline" className="mt-4 md:mt-0 border-accent text-accent hover:bg-accent hover:text-accent-foreground">
            <Link to="/logements" className="flex items-center gap-2">Voir tout <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayLogements.map((logement) => (
            <Link to={`/logements/${logement.id}`} key={logement.id}>
              <Card className="group overflow-hidden border-0 shadow-premium hover:shadow-gold transition-all duration-300 hover:-translate-y-1">
                <div className="h-48 relative overflow-hidden bg-muted">
                  <img src={logement.images[0]} alt={logement.nom} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <Badge className={`absolute top-3 right-3 border-0 ${logement.available ? "bg-accent text-accent-foreground" : "bg-muted-foreground text-card"}`}>
                    {logement.available ? "Disponible" : "Complet"}
                  </Badge>
                </div>
                <CardContent className="p-5">
                  <h3 className="font-serif text-lg font-bold text-foreground group-hover:text-accent transition-colors">{logement.nom}</h3>
                  <div className="flex items-center gap-1 text-muted-foreground text-sm mt-2">
                    <MapPin className="h-3.5 w-3.5" /> {logement.adresse}, {logement.ville}
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="h-3.5 w-3.5" /> {logement.capacity} pers.
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-accent">{logement.minPrice > 0 ? `${logement.minPrice.toLocaleString()} F` : "Sur demande"}</span>
                      <span className="text-xs text-muted-foreground block">/mois</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularLogements;
