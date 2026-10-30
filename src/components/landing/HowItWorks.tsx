import { Search, ShieldCheck, KeyRound, ArrowRight, CheckCircle2, QrCode, FileCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const PROTOCOL_ACTS = [
  {
    act: "Acte I",
    num: "01",
    tag: "Audit Préalable",
    title: "Choix de l'Unité sur Inventaire Certifié",
    description:
      "Chaque chambre et studio répertorié fait l'objet d'un audit physique rigoureux : vérification du réseau d'eau, du sous-compteur Woyofal, de la distance de marche ou de bus jusqu'au campus Sanar.",
    deliverable: "Rapport d'audit & photos non retouchées",
    icon: Search,
  },
  {
    act: "Acte II",
    num: "02",
    tag: "Séquestre Bancaire",
    title: "Verrouillage Immédiat par la Caution Seule",
    description:
      "Aucune avance de loyer n'est réclamée avant l'entrée dans les lieux. Vous effectuez le transfert de votre caution via Wave ou Orange Money sur le numéro officiel Zeyna, puis transmettez votre référence de transaction dans votre espace. Notre intendance valide la réception sous 24h.",
    deliverable: "Confirmation de blocage et attestation officielle de caution",
    icon: ShieldCheck,
  },
  {
    act: "Acte III",
    num: "03",
    tag: "Prise de Possession",
    title: "Signature du Bail & Remise des Clés",
    description:
      "Votre contrat officiel est généré avec les clauses protectrices de Zeyna. L'état des lieux contradictoire est dressé lors de la remise physique des clés sur place à Saint-Louis. Le loyer ne court qu'à partir de cette date.",
    deliverable: "Bail de colocation ou d'unité individuelle certifié",
    icon: KeyRound,
  },
];

const HowItWorks = () => {
  return (
    <section className="py-24 lg:py-32 bg-sand-gradient border-b border-border/60 relative overflow-hidden">
      {/* ── Motif cadastral très léger ── */}
      <div className="absolute inset-0 bg-dots-cadastre opacity-20 pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* ── En-tête de section ── */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 bg-accent/10 border border-accent/20 rounded-sm">
              <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
              <span className="text-xs font-ui font-semibold uppercase tracking-widest text-accent">
                Procédure Réglementaire
              </span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-foreground tracking-tight leading-[1.15]">
              Le Protocole en Trois Actes : <br />
              <span className="italic text-accent">de la sélection à la remise des clés.</span>
            </h2>
            <p className="text-muted-foreground mt-4 text-base sm:text-lg leading-relaxed font-light">
              Une chaîne de responsabilité ininterrompue, conçue pour éliminer tout risque de double location, d'annulation arbitraire ou de perte financière.
            </p>
          </div>

          <Button
            asChild
            variant="outline"
            className="rounded-sm font-ui text-xs uppercase tracking-wider font-semibold border-foreground hover:bg-foreground hover:text-background h-11 px-6 shrink-0"
          >
            <Link to="/logements" className="flex items-center gap-2">
              Découvrir les chambres vérifiées
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* ── Déroulé des Trois Actes ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {PROTOCOL_ACTS.map((item, idx) => (
            <div
              key={item.num}
              className="relative rounded-md border border-border bg-card p-6 sm:p-8 flex flex-col justify-between shadow-premium hover:shadow-elevated transition-premium accent-line-top group"
            >
              <div>
                {/* En-tête de carte */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="font-serif text-3xl font-light text-accent/80">
                      {item.num}
                    </span>
                    <span className="overline text-[10px] text-muted-foreground font-ui">
                      {item.act}
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-sm bg-muted text-[10px] font-ui uppercase font-semibold tracking-wider text-foreground/80">
                    {item.tag}
                  </span>
                </div>

                {/* Icône & Titre */}
                <div className="w-12 h-12 rounded-sm bg-accent/10 border border-accent/20 flex items-center justify-center text-accent mb-5 group-hover:scale-105 transition-premium">
                  <item.icon className="h-6 w-6" />
                </div>

                <h3 className="font-serif text-xl font-semibold text-foreground mb-3 leading-snug">
                  {item.title}
                </h3>

                <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed font-light mb-6">
                  {item.description}
                </p>
              </div>

              {/* Livrable officiel remis */}
              <div className="pt-4 border-t border-border/60">
                <span className="text-[10px] uppercase font-ui tracking-wider text-accent font-semibold block mb-1">
                  Document délivré :
                </span>
                <div className="flex items-start gap-2 text-xs text-foreground/90 font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5 text-malachite shrink-0 mt-0.5" />
                  <span>{item.deliverable}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default HowItWorks;
