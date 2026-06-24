import { Shield, MapPin, Wallet, HeadphonesIcon, CheckCircle, Zap } from "lucide-react";

const advantages = [
  {
    icon: Shield,
    title: "Logements vérifiés",
    description: "Chaque logement est inspecté et validé par notre équipe avant d'être proposé aux étudiants.",
  },
  {
    icon: Wallet,
    title: "Prix justes & transparents",
    description: "Pas de frais cachés. Le prix affiché est le prix final, tout compris.",
  },
  {
    icon: MapPin,
    title: "Bien situés",
    description: "Proches de l'UGB et des commodités, dans les meilleurs quartiers de Saint-Louis et Sanar.",
  },
  {
    icon: Zap,
    title: "Réservation rapide",
    description: "Réservez en quelques clics avec Mobile Money ou carte bancaire. Simple et instantané.",
  },
  {
    icon: CheckCircle,
    title: "Contrat automatique",
    description: "Un contrat de bail est généré automatiquement après confirmation de votre paiement.",
  },
  {
    icon: HeadphonesIcon,
    title: "Support dédié",
    description: "Notre équipe est disponible pour vous accompagner avant, pendant et après votre location.",
  },
];

const Advantages = () => {
  return (
    <section className="py-20 md:py-28 bg-gradient-navy text-primary-foreground relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <span className="text-sm font-semibold text-accent uppercase tracking-wider">Pourquoi nous choisir</span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold mt-3">
            Vos avantages avec Zeyna
          </h2>
          <p className="text-primary-foreground/70 mt-4 max-w-xl mx-auto">
            Nous simplifions la recherche de logement étudiant à Saint-Louis du Sénégal.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {advantages.map((adv) => (
            <div key={adv.title} className="bg-primary-foreground/5 backdrop-blur-sm border border-primary-foreground/10 rounded-2xl p-6 hover:bg-primary-foreground/10 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center mb-4 group-hover:bg-accent/30 transition-colors">
                <adv.icon className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-serif text-lg font-bold mb-2">{adv.title}</h3>
              <p className="text-primary-foreground/70 text-sm leading-relaxed">{adv.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Advantages;
