import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  const { data: stats } = useQuery({
    queryKey: ["hero-live-stats"],
    queryFn: async () => {
      const [logRes, chambreRes, villeRes] = await Promise.all([
        supabase.from("logements").select("id", { count: "exact", head: true }).eq("statut", "valide"),
        supabase.from("chambres").select("id", { count: "exact", head: true }),
        supabase.from("logements").select("ville").eq("statut", "valide"),
      ]);
      const quartiers = new Set(villeRes.data?.map(l => l.ville) || []);
      return [
        { id: "1", valeur: `${logRes.count || 0}`, label: "Logements" },
        { id: "2", valeur: `${chambreRes.count || 0}`, label: "Chambres" },
        { id: "3", valeur: `${quartiers.size}`, label: "Quartiers" },
      ];
    },
  });

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-teal-dark/90 via-teal/80 to-teal-dark/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 pt-20">
        <div className="max-w-3xl mx-auto text-center">

          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-6 leading-tight">
            Trouvez votre{" "}
            <span className="text-gradient-gold">logement idéal</span>
          </h1>

          <p className="text-lg md:text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto leading-relaxed">
            Des chambres étudiantes sécurisées, vérifiées et à prix juste à Saint-Louis, Sanar et ses environs.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="bg-gradient-gold hover:opacity-90 text-accent-foreground shadow-gold text-base px-8 h-13">
              <Link to="/logements" className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Voir les logements
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 text-base px-8 h-13">
              <Link to="/register" className="flex items-center gap-2">
                Créer un compte
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>

          {/* Stats from DB */}
          {stats && stats.length > 0 && (
            <div className="mt-12 sm:mt-16 grid grid-cols-3 gap-3 sm:gap-6 max-w-lg mx-auto">
              {stats.map((stat) => (
                <div key={stat.id} className="text-center">
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-accent">{stat.valeur}</div>
                  <div className="text-xs sm:text-sm text-primary-foreground/60 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
