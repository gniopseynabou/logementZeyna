import { useState } from "react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  CreditCard,
  Lock,
  Clock,
  FileText,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  Building,
  UserCheck,
  ArrowRight,
  Printer,
  Smartphone,
} from "lucide-react";
import { generatePolitiqueCautionHTML, printDocument } from "@/lib/contract-templates";

const FAQ_ITEMS = [
  {
    q: "Quels sont les moyens de paiement acceptés sur Zeyna ?",
    a: "Nous acceptons les solutions de paiement mobile leaders au Sénégal (Wave, Orange Money), ainsi que les virements bancaires et règlements directs en agence avec reçu officiel immédiat.",
  },
  {
    q: "Dans quel délai ma caution est-elle restituée à mon départ ?",
    a: "Si l'état des lieux de sortie est conforme à celui d'entrée et qu'aucun impayé n'est constaté, votre caution est restituée intégralement sous 15 jours calendaires. En cas de retenue justifiée par devis, le solde restant est restitué sous 30 jours maximum après la remise des clés.",
  },
  {
    q: "Puis-je utiliser ma caution pour régler mon dernier mois de loyer ?",
    a: "Non. Conformément au Code des Obligations Civiles et Commerciales (COCC) et aux règles de la plateforme, le dépôt de garantie ne constitue pas une avance sur loyer. Il garantit exclusivement la remise en état des lieux et le mobilier.",
  },
  {
    q: "Comment sont protégés les fonds de la caution pendant mon séjour ?",
    a: "Toutes les cautions sont séquestrées sur un compte bancaire dédié et sécurisé géré par Les Logements de Zeyna. Elles ne sont jamais mélangées aux fonds d'exploitation et restent protégées jusqu'à la clôture contradictoire du bail.",
  },
  {
    q: "Que se passe-t-il si je conteste une retenue sur ma caution ?",
    a: "Toute retenue doit être justifiée par un devis ou une facture d'artisan professionnelle. Si vous n'êtes pas d'accord, vous bénéficiez d'une procédure de médiation contradictoire sous 7 jours ouvrés avec la Direction de Zeyna.",
  },
  {
    q: "Comment sont assurés les reversements aux propriétaires ?",
    a: "Dès validation de chaque encaissement, le montant convenu est reversé au bailleur par Wave ou virement bancaire, avec émission d'un bordereau officiel de reversement et inscription au registre comptable.",
  },
];

const PaiementEtGaranties = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SEOHead
        title="Paiement & Garanties"
        description="Découvrez notre politique de paiement sécurisé, de séquestre de caution transparente et les garanties offertes aux étudiants et propriétaires par Les Logements de Zeyna."
        keywords="paiement loyer étudiant Sénégal, Wave Orange Money loyer, caution logement étudiant Saint-Louis, garanties locatives Sénégal, séquestre caution étudiant, restitution caution logement, paiement mobile loyer, contrat location étudiant COCC"
        canonical="/paiement-et-garanties"
      />
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background border-b border-border/40">
          <div className="container mx-auto px-4 max-w-5xl text-center space-y-6">
            <Badge
              variant="outline"
              className="bg-primary/10 text-primary border-primary/20 px-3 py-1 text-xs uppercase tracking-wider font-semibold"
            >
              Sécurité & Transparence Certifiées
            </Badge>

            <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-foreground">
              Paiements Sécurisés & <span className="text-primary">Garanties Locatives</span>
            </h1>

            <p className="text-muted-foreground text-base sm:text-lg max-w-3xl mx-auto leading-relaxed">
              Chez <strong>Les Logements de Zeyna</strong>, la confiance repose sur des règles claires :
              fonds de caution séquestrés, quittances libératoires instantanées, contrats conformes au COCC
              et reversements traçables pour les bailleurs.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              <Button
                size="lg"
                onClick={() => printDocument(generatePolitiqueCautionHTML())}
                className="bg-primary text-white hover:bg-primary/95 shadow-md"
              >
                <Printer className="h-4 w-4 mr-2" /> Télécharger la Politique de Caution (PDF)
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/logements">Explorer les logements</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* 3 Grands Piliers */}
        <section className="py-16 container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold">Nos 3 piliers de confiance</h2>
            <p className="text-muted-foreground text-sm mt-2">
              Un écosystème conçu pour protéger locataires étudiants et propriétaires partenaires.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pilier 1 */}
            <Card className="border-0 shadow-premium hover:shadow-lg transition-shadow">
              <CardContent className="p-6 space-y-4">
                <div className="p-3.5 bg-primary/10 text-primary rounded-2xl w-fit">
                  <Smartphone className="h-6 w-6" />
                </div>
                <h3 className="font-serif font-bold text-lg">Paiement Mobile & Reçus Immédiats</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Réglez votre caution et vos loyers facilement par <strong>Wave</strong> ou <strong>Orange Money</strong>.
                  Chaque transaction génère automatiquement une quittance libératoire infalsifiable téléchargeable.
                </p>
                <ul className="text-xs space-y-2 text-foreground/80 pt-2 border-t border-border">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    Zéro frais cachés ou commissions dissimulées
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    Reçu officiel horodaté avec référence unique
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Pilier 2 */}
            <Card className="border-0 shadow-premium hover:shadow-lg transition-shadow">
              <CardContent className="p-6 space-y-4">
                <div className="p-3.5 bg-emerald-100 text-emerald-800 rounded-2xl w-fit">
                  <Lock className="h-6 w-6" />
                </div>
                <h3 className="font-serif font-bold text-lg">Caution Séquestrée & Protégée</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Votre dépôt de garantie n'est pas bloqué arbitrairement : il est conservé sur un compte séquestre dédié
                  et restitué sous <strong>15 jours</strong> (ou 30 jours max) sur base d'un état des lieux contradictoire.
                </p>
                <ul className="text-xs space-y-2 text-foreground/80 pt-2 border-t border-border">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    L'usure normale ne fait jamais l'objet de retenue
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    Factures ou devis d'artisans obligatoires si dégradation
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Pilier 3 */}
            <Card className="border-0 shadow-premium hover:shadow-lg transition-shadow">
              <CardContent className="p-6 space-y-4">
                <div className="p-3.5 bg-amber-100 text-amber-800 rounded-2xl w-fit">
                  <Building className="h-6 w-6" />
                </div>
                <h3 className="font-serif font-bold text-lg">Reversements Bailleurs Traçables</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Les propriétaires partenaires bénéficient d'un circuit de reversement ponctuel et transparent,
                  avec émission systématique d'un bordereau officiel pour chaque chambre occupée.
                </p>
                <ul className="text-xs space-y-2 text-foreground/80 pt-2 border-t border-border">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    Convention écrite de gestion conforme au COCC
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    Inscription au registre financier centralisé
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Tableau comparatif des garanties */}
        <section className="py-16 bg-muted/30 border-y border-border/50">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="text-center mb-10">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold">
                Nos engagements réciproques
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                La transparence entre locataires étudiants, propriétaires et Zeyna
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Locataires */}
              <div className="bg-card p-6 rounded-2xl shadow-premium space-y-4">
                <div className="flex items-center gap-2.5 text-primary font-bold">
                  <UserCheck className="h-5 w-5" />
                  <h3 className="text-base font-serif">Garanties pour les étudiants</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Logement réservé et garanti :</strong> Dès validation de la réservation et caution, la chambre vous est réservée sans risque de doublon.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Contrat légal écrit :</strong> Contrat de sous-location complet incluant inventaire et description exacte des lieux.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Interlocuteur unique :</strong> L'équipe Zeyna gère vos incidents techniques, vos demandes et votre médiation.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Restitution de caution encadrée :</strong> Délais et barèmes stricts, sans retenues abusives.</span>
                  </div>
                </div>
              </div>

              {/* Bailleurs */}
              <div className="bg-card p-6 rounded-2xl shadow-premium space-y-4">
                <div className="flex items-center gap-2.5 text-amber-700 font-bold">
                  <Building className="h-5 w-5" />
                  <h3 className="text-base font-serif">Garanties pour les bailleurs</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Accord écrit formalisé :</strong> Mandat de gestion clair précisant le prix bailleur garanti et la durée.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Reversements ponctuels :</strong> Paiements des loyers directement versés par Wave ou virement bancaire.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Sélection et suivi :</strong> Vérification de l'identité des étudiants et état des lieux contradictoire rigoureux.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Bordereau comptable :</strong> Chaque reversement dispose d'un justificatif comptable officiel.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ interactive */}
        <section className="py-16 container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-10">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold flex items-center justify-center gap-2">
              <HelpCircle className="h-6 w-6 text-primary" /> Questions fréquentes
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              Tout ce que vous devez savoir sur le paiement, la caution et la gestion locative.
            </p>
          </div>

          <div className="space-y-3">
            {FAQ_ITEMS.map((item, idx) => (
              <div
                key={idx}
                className="bg-card border border-border/60 rounded-xl overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-4 sm:p-5 text-left font-medium text-sm sm:text-base flex items-center justify-between gap-4 hover:bg-muted/40 transition-colors"
                >
                  <span>{item.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200 ${
                      openFaq === idx ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/40 pt-3">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* CTA final */}
        <section className="py-16 bg-gradient-to-r from-primary/10 via-primary/5 to-background border-t border-border/60 text-center">
          <div className="container mx-auto px-4 max-w-3xl space-y-5">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold">
              Besoin d'un renseignement ou d'un accompagnement personnalisé ?
            </h2>
            <p className="text-muted-foreground text-sm max-w-xl mx-auto">
              Notre équipe d'assistance à Saint-Louis est disponible 7j/7 pour vous guider dans vos démarches de location.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Button asChild size="lg" className="bg-primary text-white">
                <Link to="/logements">Trouver un logement garanti</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/devenir-bailleur">Rejoindre comme bailleur partenaire</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default PaiementEtGaranties;
