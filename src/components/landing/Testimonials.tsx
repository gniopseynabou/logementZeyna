import { Star, Quote } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Testimonials = () => {
  const { data: testimonials, isLoading } = useQuery({
    queryKey: ["temoignages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("temoignages")
        .select("*")
        .eq("est_visible", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <section className="py-20 md:py-28 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-52 bg-muted animate-pulse rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!testimonials || testimonials.length === 0) return null;

  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-sm font-semibold text-accent uppercase tracking-wider">Témoignages</span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mt-3">
            Ce que disent nos étudiants
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {testimonials.map((t) => (
            <div key={t.id} className="bg-card rounded-2xl p-8 shadow-premium hover:shadow-gold transition-all duration-300 relative">
              <Quote className="absolute top-6 right-6 h-8 w-8 text-accent/15" />
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < t.note ? "text-accent fill-accent" : "text-muted"}`} />
                ))}
              </div>
              <p className="text-foreground/80 text-sm leading-relaxed mb-6 italic">"{t.contenu}"</p>
              <div>
                <div className="font-semibold text-foreground">{t.nom}</div>
                <div className="text-xs text-muted-foreground">{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
