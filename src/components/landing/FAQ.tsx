import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useQuery } from "@tanstack/react-query";
import { getVisibleFaqs } from "@/services/public-content-service";
import { HelpCircle, Phone, Mail, ShieldCheck, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const ESSENTIAL_FAQS = [
  {
    id: "faq-1",
    question: "Dois-je verser des mois de loyer d'avance pour bloquer une chambre ?",
    reponse:
      "Non. C'est l'un des piliers de notre charte : seule la caution de garantie est exigée pour bloquer formellement l'attribution de votre chambre. Votre premier loyer ne court et n'est exigible qu'à compter de la date effective de remise des clés sur place.",
  },
  {
    id: "faq-2",
    question: "Comment se déroule la restitution de ma caution en fin d'année ?",
    reponse:
      "Votre caution est conservée sur un compte séquestre dédié distinct de la trésorerie courante. Lors de votre départ, un état des lieux contradictoire de sortie est réalisé. En l'absence de dégradations ou de dettes de sous-compteur Woyofal, votre caution vous est restituée sous 72 heures par virement Mobile Money.",
  },
  {
    id: "faq-3",
    question: "Comment accéder à l'Université Gaston Berger depuis les résidences ?",
    reponse:
      "Toutes les résidences de notre répertoire sont situées à Sanar (accessibles à pied des amphis), à Bango ou à Khor (directement connectées aux lignes de bus universitaires et aux taxis collectifs circulant sur la Route Nationale 2).",
  },
  {
    id: "faq-4",
    question: "Comment s'effectue le règlement de la caution et des loyers ?",
    reponse:
      "Le règlement s'effectue par transfert direct Wave ou Orange Money sur les coordonnées officielles de Zeyna. Après votre transfert, vous saisissez simplement votre numéro de transaction (référence) dans votre espace résident. Dès vérification par notre administration, votre paiement est validé et votre quittance officielle est mise à disposition.",
  },
  {
    id: "faq-5",
    question: "Que se passe-t-il en cas de panne technique ou de fuite d'eau ?",
    reponse:
      "Chaque résident bénéficie d'un canal direct d'intendance dans son espace utilisateur pour déclarer tout incident technique. Notre équipe locale intervient en liaison directe avec le propriétaire pour coordonner les réparations sans frais indus pour le locataire.",
  },
];

const FAQ = () => {
  const { data: dbFaqs } = useQuery({
    queryKey: ["faqs"],
    queryFn: getVisibleFaqs,
  });

  const faqsToDisplay = dbFaqs && dbFaqs.length > 0 ? dbFaqs : ESSENTIAL_FAQS;

  return (
    <section className="py-24 lg:py-32 bg-mineral-gradient border-b border-border/60 relative overflow-hidden">
      {/* ── Motif cadastral très subtil ── */}
      <div className="absolute inset-0 bg-dots-cadastre opacity-15 pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Colonne Gauche (4 col) : Intendance & Contact direct */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-32">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/10 border border-accent/20 rounded-sm">
              <HelpCircle className="h-3.5 w-3.5 text-accent" />
              <span className="text-xs font-ui font-semibold uppercase tracking-widest text-accent">
                Renseignements & Droits
              </span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-foreground tracking-tight leading-tight">
              Questions fondamentales sur votre location.
            </h2>

            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed font-light">
              La clarté contractuelle est notre premier devoir envers les étudiants et les familles.
            </p>

            {/* Cartouche d'assistance permanente */}
            <div className="p-6 rounded-md bg-card border border-border shadow-premium space-y-4">
              <div className="flex items-center gap-2 text-foreground font-semibold font-serif text-sm">
                <ShieldCheck className="h-4 w-4 text-malachite" />
                <span>Une question spécifique sur un contrat ?</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Notre bureau d'intendance à Saint-Louis vous répond du lundi au samedi.
              </p>
              <div className="pt-2 flex flex-col gap-2">
                <a
                  href="tel:+221784326486"
                  className="flex items-center gap-2 text-xs font-ui text-foreground hover:text-accent transition-premium font-medium"
                >
                  <Phone className="h-3.5 w-3.5 text-accent" />
                  <span>+221 78 432 64 86 / +221 77 602 38 70</span>
                </a>
                <a
                  href="mailto:contact@logements-zeyna.site"
                  className="flex items-center gap-2 text-xs font-ui text-foreground hover:text-accent transition-premium font-medium"
                >
                  <Mail className="h-3.5 w-3.5 text-accent" />
                  <span>contact@logements-zeyna.site</span>
                </a>
              </div>
            </div>
          </div>

          {/* Colonne Droite (8 col) : Accordéons documentaires */}
          <div className="lg:col-span-8">
            <div className="rounded-md border border-border bg-card shadow-elevated p-6 sm:p-8">
              <Accordion type="single" collapsible className="w-full divide-y divide-border/60">
                {faqsToDisplay.map((faq) => (
                  <AccordionItem key={faq.id} value={faq.id} className="border-0 py-2 first:pt-0 last:pb-0">
                    <AccordionTrigger className="text-left font-serif font-semibold text-base sm:text-lg text-foreground hover:text-accent hover:no-underline py-4">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed text-sm pt-1 pb-4 font-light">
                      {faq.reponse}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default FAQ;
