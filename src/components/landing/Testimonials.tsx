import { Star, Quote, MapPin, GraduationCap, Building } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getVisibleTestimonials } from "@/services/public-content-service";

const Testimonials = () => {
  const { data: testimonials, isLoading, isError } = useQuery({
    queryKey: ["temoignages"],
    queryFn: getVisibleTestimonials,
  });

  // RÈGLE STRICTE D'AUTHENTICITÉ :
  // Si aucun témoignage réel n'est présent en base de données, la section ne s'affiche absolument pas.
  // Aucun faux témoignage, aucun nom d'étudiant inventé, aucune fausse note.
  if (isLoading || isError || !testimonials || testimonials.length === 0) {
    return null;
  }

  return (
    <section className="py-24 lg:py-32 bg-background border-b border-border/60 relative overflow-hidden bg-dots-cadastre">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* ── En-tête de section ── */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 bg-accent/10 border border-accent/20 rounded-sm">
            <Quote className="h-3.5 w-3.5 text-accent" />
            <span className="text-xs font-ui font-semibold uppercase tracking-widest text-accent">
              Avis Enregistrés
            </span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-foreground tracking-tight leading-[1.15]">
            Retours d'expérience consignés sur la plateforme
          </h2>
          <p className="text-muted-foreground mt-4 text-base sm:text-lg leading-relaxed font-light">
            Avis vérifiés déposés par les utilisateurs de la plateforme Zeyna.
          </p>
        </div>

        {/* ── Grille des témoignages réels ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((item) => (
            <div
              key={item.id}
              className="relative rounded-md border border-border bg-card p-6 sm:p-8 flex flex-col justify-between shadow-premium hover:shadow-elevated transition-premium"
            >
              <div>
                {/* Note */}
                <div className="flex items-center gap-1 mb-4 text-accent">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < (item.note || 5) ? "fill-accent text-accent" : "text-muted"}`}
                    />
                  ))}
                </div>

                {/* Corps de l'avis */}
                <p className="text-foreground/85 text-xs sm:text-sm leading-relaxed italic mb-6 font-serif">
                  « {item.contenu} »
                </p>
              </div>

              {/* Auteur */}
              <div className="pt-4 border-t border-border/60 flex items-center gap-3">
                <div className="w-9 h-9 rounded-sm bg-muted flex items-center justify-center text-primary shrink-0">
                  <GraduationCap className="h-4 w-4 text-accent" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-serif text-sm font-semibold text-foreground truncate">
                    {item.nom}
                  </h4>
                  <p className="text-[11px] text-muted-foreground truncate leading-tight mt-0.5">
                    {item.role || "Résident"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Testimonials;
