import { Check, X, ShieldAlert, ShieldCheck, Scale, Award } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const COMPARISONS = [
  {
    criterion: "Visites & Réservation",
    informal: "Frais de visite exigés par des démarcheurs sans mandat préalable.",
    zeyna: "Inventaire vérifié en ligne avec photos certifiées et visites libres sans frais.",
  },
  {
    criterion: "Caution & Sommes Exigées",
    informal: "Exigence de 2 à 3 mois de loyers d'avance en cash sans reçu officiel.",
    zeyna: "Seule la caution est demandée pour bloquer l'attribution de la chambre.",
  },
  {
    criterion: "Sécurité Juridique",
    informal: "Accord verbal précaire : risque d'expulsion arbitraire ou de réattribution.",
    zeyna: "Bail de location numérique formel avec signature électronique et reçu opposable.",
  },
  {
    criterion: "État Technique & Électricité",
    informal: "Dettes Woyofal antérieures et réparations laissées à la charge de l'étudiant.",
    zeyna: "Relevé contradictoire des compteurs à l'entrée et contrôle de la salubrité.",
  },
  {
    criterion: "Restitution en Fin d'Année",
    informal: "Caution quasi-systématiquement retenue sous des prétextes contestables.",
    zeyna: "Caution cantonnée sur compte séquestre, restituée selon l'état des lieux de sortie.",
  },
];

export const ManifestoComparison = () => {
  return (
    <section className="py-24 lg:py-32 bg-mineral-gradient border-b border-border/60 relative overflow-hidden">
      {/* ── Trame d'arpentage très subtile en fond ── */}
      <div className="absolute inset-0 bg-grid-cadastre opacity-30 pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* ── En-tête de section ── */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 bg-accent/10 border border-accent/20 rounded-sm">
            <Scale className="h-3.5 w-3.5 text-accent" />
            <span className="text-xs font-ui font-semibold uppercase tracking-widest text-accent">
              Régulation & Salubrité
            </span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-foreground tracking-tight leading-[1.15]">
            Pourquoi l’habitat étudiant informel <br />
            <span className="italic text-accent">fragilise les études à l'UGB.</span>
          </h2>
          <p className="text-muted-foreground mt-4 text-base sm:text-lg leading-relaxed font-light">
            Chaque rentrée universitaire à Saint-Louis donne lieu à des litiges récurrents : intermédiaires non identifiés, cautions non restituées et logements dégradés. Zeyna applique une méthode claire et opposable.
          </p>
        </div>

        {/* ── Tableau Comparatif Architectural ── */}
        <div className="rounded-md border border-border bg-card shadow-elevated overflow-hidden">
          
          {/* Header du tableau */}
          <div className="grid grid-cols-1 md:grid-cols-12 border-b border-border text-xs font-ui uppercase tracking-wider font-semibold">
            <div className="md:col-span-4 p-4 sm:p-5 bg-muted/40 text-muted-foreground flex items-center gap-2">
              <span>Points de vigilance</span>
            </div>
            <div className="md:col-span-4 p-4 sm:p-5 bg-destructive/5 text-destructive border-t md:border-t-0 md:border-l border-border flex items-center gap-2">
              <ShieldAlert className="h-4 w-4" />
              <span>Pratique informelle classique</span>
            </div>
            <div className="md:col-span-4 p-4 sm:p-5 bg-malachite/10 text-malachite border-t md:border-t-0 md:border-l border-border flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              <span>Standard appliqué par Zeyna</span>
            </div>
          </div>

          {/* Lignes du tableau */}
          <div className="divide-y divide-border/60">
            {COMPARISONS.map((row, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 md:grid-cols-12 hover:bg-muted/20 transition-premium text-xs sm:text-sm"
              >
                {/* Critère */}
                <div className="md:col-span-4 p-4 sm:p-5 font-serif font-medium text-foreground bg-muted/15 flex items-center">
                  {row.criterion}
                </div>

                {/* Marché informel */}
                <div className="md:col-span-4 p-4 sm:p-5 border-t md:border-t-0 md:border-l border-border/60 text-muted-foreground flex items-start gap-2.5">
                  <X className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{row.informal}</span>
                </div>

                {/* Standard Zeyna */}
                <div className="md:col-span-4 p-4 sm:p-5 border-t md:border-t-0 md:border-l border-border/60 text-foreground bg-malachite/[0.02] flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-malachite shrink-0 mt-0.5" />
                  <span className="leading-relaxed font-medium">{row.zeyna}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Pied de tableau : engagement factuel vérifiable */}
          <div className="p-6 bg-muted/30 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Award className="h-5 w-5 text-accent shrink-0" />
              <p className="text-xs text-muted-foreground">
                Chaque réservation confirmée donne lieu à un <strong className="text-foreground font-ui">contrat de bail écrit</strong> et un <strong className="text-foreground font-ui">reçu de paiement traçable</strong>, consultables à tout moment dans votre espace personnel.
              </p>
            </div>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="rounded-sm font-ui text-xs uppercase tracking-wider font-semibold border-foreground hover:bg-foreground hover:text-background shrink-0"
            >
              <Link to="/paiement-et-garanties">
                Lire nos conditions de fonctionnement
              </Link>
            </Button>
          </div>

        </div>

      </div>
    </section>
  );
};

export default ManifestoComparison;
