import { lazy, Suspense, memo } from "react";
import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import ErrorBoundary from "@/components/ErrorBoundary";

const ManifestoComparison = lazy(() => import("@/components/landing/ManifestoComparison"));
const HowItWorks = lazy(() => import("@/components/landing/HowItWorks"));
const PopularLogements = lazy(() => import("@/components/landing/PopularLogements"));
const Testimonials = lazy(() => import("@/components/landing/Testimonials"));
const FAQ = lazy(() => import("@/components/landing/FAQ"));
const FinalCTA = lazy(() => import("@/components/landing/FinalCTA"));
const Footer = lazy(() => import("@/components/landing/Footer"));

import SEOHead from "@/components/SEOHead";

const SectionLoader = () => (
  <div className="py-20 flex items-center justify-center">
    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent" />
  </div>
);

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: "Les Logements de Zeyna",
    description:
      "L'autorité de gestion et de régulation du logement étudiant à Saint-Louis du Sénégal. Chambres et studios proches de l'UGB, campus Sanar, Bango et Khor. Caution protégée sur compte séquestre et baux opposables.",
    url: "https://logements-zeyna.site",
    areaServed: [
      { "@type": "City", name: "Saint-Louis", containedInPlace: { "@type": "Country", name: "Sénégal" } },
      { "@type": "Place", name: "Sanar" },
      { "@type": "Place", name: "Université Gaston Berger (UGB)" },
      { "@type": "Place", name: "Bango" },
      { "@type": "Place", name: "Khor" },
    ],
    serviceType: "Logement étudiant certifié",
    knowsAbout: [
      "logement étudiant Saint-Louis Sénégal",
      "chambre étudiant UGB",
      "logement étudiant Sanar",
      "chambre à louer près de l'UGB",
      "logement hors campus Saint-Louis",
      "séquestre caution Sénégal",
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Les Logements de Zeyna",
    url: "https://logements-zeyna.site",
    description: "Trouvez votre chambre ou studio étudiant à Saint-Louis du Sénégal, près de l'UGB et du campus Sanar.",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://logements-zeyna.site/logements?search={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  },
];

const Index = memo(() => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Logement Étudiant Saint-Louis Sénégal | Chambres & Studios certifiés près de l'UGB"
        description="Le logement étudiant sécurisé à Saint-Louis du Sénégal. Chambres individuelles et partagées près de l'UGB (Sanar, Bango, Khor). Caution seule exigée, baux formalisés et compte séquestre."
        keywords="logement étudiant Saint-Louis Sénégal, chambre étudiant UGB, logement étudiant Sanar, chambre à louer près de l'UGB, logement hors campus Saint-Louis, résidence étudiante Saint-Louis, studio étudiant Sénégal, Les Logements de Zeyna, Université Gaston Berger logement, chambre étudiant Bango"
        canonical="/"
        jsonLd={jsonLd}
      />
      
      {/* ── 1. Navigation Principale ── */}
      <Navbar />

      {/* ── 2. Hero Section : Le Registre Opposable ── */}
      <HeroSection />

      {/* ── 3. Répertoire des Résidences & Chambres Vérifiées ── */}
      <ErrorBoundary>
        <Suspense fallback={<SectionLoader />}>
          <PopularLogements />
        </Suspense>
      </ErrorBoundary>

      {/* ── 4. Le Protocole en Trois Actes ── */}
      <ErrorBoundary>
        <Suspense fallback={<SectionLoader />}>
          <HowItWorks />
        </Suspense>
      </ErrorBoundary>

      {/* ── 5. Le Manifeste du Tiers de Confiance : Pratique Informelle vs Standard Zeyna ── */}
      <ErrorBoundary>
        <Suspense fallback={<SectionLoader />}>
          <ManifestoComparison />
        </Suspense>
      </ErrorBoundary>

      {/* ── 6. Preuves de Rigueur : Retours d'Expérience Consignés ── */}
      <ErrorBoundary>
        <Suspense fallback={<SectionLoader />}>
          <Testimonials />
        </Suspense>
      </ErrorBoundary>

      {/* ── 7. Renseignements & Droits : FAQ Cadastrale ── */}
      <ErrorBoundary>
        <Suspense fallback={<SectionLoader />}>
          <FAQ />
        </Suspense>
      </ErrorBoundary>

      {/* ── 8. Appel à l'Action Final : Étudiants & Propriétaires Bailleurs ── */}
      <ErrorBoundary>
        <Suspense fallback={<SectionLoader />}>
          <FinalCTA />
        </Suspense>
      </ErrorBoundary>

      {/* ── 9. Pied de Page Institutionnel ── */}
      <ErrorBoundary>
        <Suspense fallback={<SectionLoader />}>
          <Footer />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
});

Index.displayName = "Index";

export default Index;
