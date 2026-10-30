import { ArrowRight, GraduationCap, Building2, ShieldCheck, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const FinalCTA = () => {
  return (
    <section className="py-24 lg:py-32 bg-basalt text-white relative overflow-hidden border-b border-white/10">
      {/* ── Trame d'ingénierie cadastrale nocturne ── */}
      <div className="absolute inset-0 bg-grid-cadastre-dark opacity-30 pointer-events-none" />

      {/* ── Ligne or d'accent architectural ── */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-accent" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* En-tête monumental */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 bg-white/[0.06] border border-white/15 rounded-sm">
            <ShieldCheck className="h-3.5 w-3.5 text-accent" />
            <span className="text-xs font-ui font-semibold uppercase tracking-widest text-white/90">
              Engagement & Disponibilité
            </span>
          </div>
          <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-white leading-[1.15]">
            Étudier sereinement à l'UGB, <br />
            <span className="italic text-accent">ou rentabiliser vos biens sans litige.</span>
          </h2>
          <p className="text-white/70 mt-3 sm:mt-4 text-sm sm:text-base leading-relaxed font-light">
            Rejoignez le premier écosystème locatif formalisé de Saint-Louis du Sénégal.
          </p>
        </div>

        {/* Diptyque d'Action Spécifique */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl">
          
          {/* Option 1 : Pour les Étudiants */}
          <div className="rounded-md border border-white/15 bg-white/[0.04] backdrop-blur-md p-6 sm:p-10 flex flex-col justify-between hover:border-accent transition-premium">
            <div>
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-sm bg-accent/20 text-accent flex items-center justify-center mb-5 sm:mb-6">
                <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <span className="overline text-accent mb-2 block">Futurs & Actuels Étudiants</span>
              <h3 className="font-serif text-xl sm:text-2xl font-normal text-white mb-2.5 sm:mb-3">
                Trouver & réserver ma chambre
              </h3>
              <p className="text-white/70 text-xs sm:text-sm leading-relaxed font-light mb-6 sm:mb-8">
                Parcourez les logements audités à Sanar, Bango et Khor. Bloquez votre attribution dès aujourd'hui avec votre caution seule.
              </p>
            </div>

            <Button
              asChild
              className="w-full bg-accent hover:bg-accent/90 text-white rounded-sm h-12 font-ui text-xs uppercase tracking-wider font-semibold shadow-gold hover:shadow-none transition-premium"
            >
              <Link to="/logements" className="flex items-center justify-center gap-2">
                Explorer le répertoire complet
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Option 2 : Pour les Propriétaires Bailleurs */}
          <div className="rounded-md border border-white/15 bg-white/[0.04] backdrop-blur-md p-6 sm:p-10 flex flex-col justify-between hover:border-accent transition-premium">
            <div>
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-sm bg-white/10 text-white flex items-center justify-center mb-5 sm:mb-6">
                <Building2 className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <span className="overline text-white/50 mb-2 block">Propriétaires Bailleurs</span>
              <h3 className="font-serif text-xl sm:text-2xl font-normal text-white mb-2.5 sm:mb-3">
                Confier mes logements à Zeyna
              </h3>
              <p className="text-white/70 text-xs sm:text-sm leading-relaxed font-light mb-6 sm:mb-8">
                Sécurisez vos revenus locatifs, déléguez la gestion des baux et bénéficiez de reversements ponctuels garantis par contrat-cadre.
              </p>
            </div>

            <Button
              asChild
              variant="outline"
              className="w-full border-white/30 text-white hover:bg-white hover:text-basalt rounded-sm h-12 font-ui text-xs uppercase tracking-wider font-semibold transition-premium"
            >
              <Link to="/devenir-bailleur" className="flex items-center justify-center gap-2">
                Devenir bailleur partenaire
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

        </div>

      </div>
    </section>
  );
};

export default FinalCTA;
