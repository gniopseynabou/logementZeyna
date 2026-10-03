import { Shield, MapPin, Wallet, HeadphonesIcon, CheckCircle, Zap } from "lucide-react";

const advantages = [
  {
    icon: Shield,
    title: "Logements vérifiés",
    description: "Chaque bien est inspecté et validé par notre équipe avant d'être proposé.",
  },
  {
    icon: Wallet,
    title: "Prix transparents",
    description: "Pas de frais cachés. Le prix affiché est le prix final, tout compris.",
  },
  {
    icon: MapPin,
    title: "Bien situés",
    description: "Proches de l'UGB, dans les meilleurs quartiers de Saint-Louis et Sanar.",
  },
  {
    icon: Zap,
    title: "Réservation rapide",
    description: "Réservez en ligne via Mobile Money ou carte. Simple, sécurisé, instantané.",
  },
  {
    icon: CheckCircle,
    title: "Contrat automatique",
    description: "Un contrat est généré et signable dès confirmation de votre paiement.",
  },
  {
    icon: HeadphonesIcon,
    title: "Support dédié",
    description: "Notre équipe vous accompagne avant, pendant et après votre installation.",
  },
];

const Advantages = () => {
  return (
    <section className="py-24 md:py-32 bg-foreground text-background">
      <div className="container mx-auto px-4">

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Texte gauche */}
          <div className="lg:sticky lg:top-32">
            <p className="text-xs font-bold text-accent uppercase tracking-widest mb-3">Pourquoi nous</p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-6">
              Ce que Zeyna vous apporte
            </h2>
            <p className="text-background/60 leading-relaxed max-w-sm">
              Nous simplifions la recherche de logement étudiant à Saint-Louis en combinant rigueur de sélection, clarté financière et accompagnement humain.
            </p>
            <div className="mt-8 pt-8 border-t border-background/10">
              <p className="text-4xl font-bold font-ui text-accent">100%</p>
              <p className="text-sm text-background/50 mt-1">des logements inspectés avant mise en ligne</p>
            </div>
          </div>

          {/* Grille avantages droite */}
          <div className="grid sm:grid-cols-2 gap-px bg-background/10 border border-background/10">
            {advantages.map((adv) => (
              <div key={adv.title} className="bg-foreground p-6 hover:bg-background/5 transition-colors">
                <adv.icon className="h-5 w-5 text-accent mb-4" />
                <h3 className="font-serif font-bold text-background mb-2">{adv.title}</h3>
                <p className="text-background/55 text-sm leading-relaxed">{adv.description}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default Advantages;
