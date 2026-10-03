import { Star, Quote } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getVisibleTestimonials } from "@/services/public-content-service";

const Testimonials = () => {
  const { data: testimonials, isLoading, isError } = useQuery({
    queryKey: ["temoignages"],
    queryFn: getVisibleTestimonials,
  });

  if (isLoading || isError || !testimonials || testimonials.length === 0) {
    return null; // On cache silencieusement si pas prêt, au lieu de montrer des loaders moches
  }

  return (
    <section className="py-24 md:py-32 bg-background border-y border-border/40">
      <div className="container mx-auto px-4">
        
        <div className="max-w-2xl mx-auto text-center mb-16">
          <p className="text-xs font-bold text-accent uppercase tracking-widest mb-3">Témoignages</p>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
            L'expérience Zeyna
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((t) => (
            <div key={t.id} className="relative p-8 border border-border/50 bg-secondary/20 hover:bg-secondary/40 transition-colors">
              <Quote className="absolute top-6 right-6 h-6 w-6 text-accent/20" />
              
              <div className="flex gap-1 mb-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < t.note ? "text-accent fill-accent" : "text-muted"}`} />
                ))}
              </div>
              
              <p className="text-foreground/80 leading-relaxed mb-8 italic">
                "{t.contenu}"
              </p>
              
              <div className="mt-auto">
                <div className="font-bold text-foreground font-ui uppercase tracking-wider text-sm">{t.nom}</div>
                <div className="text-xs text-muted-foreground mt-1">{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
