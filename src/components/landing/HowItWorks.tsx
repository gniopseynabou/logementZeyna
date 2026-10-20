import { Search, ShieldCheck, KeyRound } from "lucide-react";

const steps = [
  {
    icon: Search,
    num: "01",
    tag: "Audit & Choix",
    title: "Explorez les résidences",
    description: "Consultez les photos réelles de chaque chambre étudiant à Saint-Louis : logements hors campus à Sanar, Bango ou Khor, avec la distance exacte de l'UGB.",
  },
  {
    icon: ShieldCheck,
    num: "02",
    tag: "Caution uniquement",
    title: "Bloquez votre place",
    description: "Une fois votre demande validée par l'administration, réglez la caution sous 24h par Mobile Money ou carte pour sécuriser l'attribution.",
  },
  {
    icon: KeyRound,
    num: "03",
    tag: "Bail & Reçu",
    title: "Emménagez sereinement",
    description: "Recevez votre contrat numérique certifié avec reçu officiel. Votre loyer ne commence qu'à la date d'entrée convenue.",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-24 lg:py-32 bg-background border-b border-border/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">

        {/* En-tête architectural */}
        <div className="max-w-2xl mb-16">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="w-1.5 h-1.5 bg-accent rounded-full" />
            <p className="text-xs font-semibold font-ui text-accent uppercase tracking-widest">
              Protocole Résidentiel
            </p>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-normal text-foreground tracking-tight">
            Comment trouver votre logement étudiant à Saint-Louis ?
          </h2>
          <p className="text-muted-foreground mt-3 text-sm sm:text-base leading-relaxed">
            Un processus transparent en 3 étapes pour louer votre chambre près de l'UGB (Sanar, Bango, Khor) — sans commissions occultes et avec une traçabilité intégrale.
          </p>
        </div>

        {/* Triptyque architectural */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl">
          {steps.map((step) => (
            <div
              key={step.num}
              className="bg-card border border-border p-8 rounded-sm flex flex-col justify-between hover:border-accent/60 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-2xl font-bold font-ui text-accent/80 tracking-tight">
                    {step.num}
                  </span>
                  <span className="text-[10px] font-ui uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded-sm">
                    {step.tag}
                  </span>
                </div>

                <div className="w-10 h-10 rounded-sm bg-accent/10 border border-accent/20 flex items-center justify-center text-accent mb-6 group-hover:bg-accent group-hover:text-white transition-colors">
                  <step.icon className="h-5 w-5" />
                </div>

                <h3 className="font-serif text-xl font-normal text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-border/40 text-[11px] font-ui text-muted-foreground uppercase tracking-wider">
                Garantie de service Zeyna
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;

