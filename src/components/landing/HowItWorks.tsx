import { Search, CreditCard, Home } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Recherchez",
    description: "Parcourez nos logements vérifiés à Saint-Louis et Sanar, filtrés selon vos critères : quartier, budget, capacité.",
    step: "01",
  },
  {
    icon: CreditCard,
    title: "Réservez & Payez",
    description: "Réservez en ligne et payez facilement via Mobile Money ou carte bancaire. C'est sécurisé.",
    step: "02",
  },
  {
    icon: Home,
    title: "Emménagez",
    description: "Recevez votre contrat, récupérez vos clés et profitez de votre nouveau logement étudiant.",
    step: "03",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-sm font-semibold text-accent uppercase tracking-wider">Simple & rapide</span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mt-3">
            Comment ça marche ?
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            Trois étapes simples pour trouver et réserver votre logement étudiant.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div key={step.title} className="relative group">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-accent/40 to-transparent" />
              )}
              
              <div className="bg-card rounded-2xl p-8 shadow-premium hover:shadow-gold transition-all duration-300 hover:-translate-y-1 text-center relative">
                <div className="absolute -top-4 -right-2 text-5xl font-serif font-bold text-accent/10">
                  {step.step}
                </div>
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-gold flex items-center justify-center shadow-gold">
                  <step.icon className="h-7 w-7 text-accent-foreground" />
                </div>
                <h3 className="font-serif text-xl font-bold text-foreground mb-3">{step.title}</h3>
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
