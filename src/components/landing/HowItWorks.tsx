import { Search, CreditCard, Home, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: Search,
    num: "01",
    title: "Recherchez",
    description: "Parcourez les logements vérifiés à Saint-Louis et Sanar. Filtrez par quartier, budget ou capacité.",
  },
  {
    icon: CreditCard,
    num: "02",
    title: "Réservez & payez",
    description: "Réservez en ligne et payez via Mobile Money ou carte. Votre caution est sécurisée.",
  },
  {
    icon: Home,
    num: "03",
    title: "Emménagez",
    description: "Recevez votre contrat, récupérez vos clés et profitez de votre logement.",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-4">

        {/* En-tête */}
        <div className="max-w-xl mb-16">
          <p className="text-xs font-bold text-accent uppercase tracking-widest mb-3">Simple & rapide</p>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
            Comment ça marche ?
          </h2>
          <p className="text-muted-foreground mt-4 leading-relaxed">
            Trois étapes suffisent pour trouver et sécuriser votre logement étudiant.
          </p>
        </div>

        {/* Étapes */}
        <div className="grid md:grid-cols-3 gap-0 max-w-5xl">
          {steps.map((step, i) => (
            <div key={step.num} className="flex md:flex-col items-start gap-6 md:gap-0 relative pr-8 md:pr-0 pb-8 md:pb-0">

              {/* Connecteur horizontal (desktop) */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-6 left-[calc(50%+28px)] right-0 h-px bg-border" />
              )}
              {/* Connecteur vertical (mobile) */}
              {i < steps.length - 1 && (
                <div className="md:hidden absolute top-12 left-6 bottom-0 w-px bg-border" />
              )}

              {/* Icône + numéro */}
              <div className="relative shrink-0 md:mb-6">
                <div className="w-12 h-12 rounded-sm bg-accent flex items-center justify-center text-white relative z-10">
                  <step.icon className="h-5 w-5" />
                </div>
                <span className="absolute -top-2 -right-3 text-xs font-bold font-ui text-muted-foreground/40">{step.num}</span>
              </div>

              {/* Texte */}
              <div className="md:mt-4">
                <h3 className="font-serif text-lg font-bold text-foreground mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
