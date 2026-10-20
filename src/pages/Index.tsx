import { lazy, Suspense, memo } from "react";
import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import ErrorBoundary from "@/components/ErrorBoundary";

const HowItWorks = lazy(() => import("@/components/landing/HowItWorks"));
const PopularLogements = lazy(() => import("@/components/landing/PopularLogements"));
const Advantages = lazy(() => import("@/components/landing/Advantages"));
const Testimonials = lazy(() => import("@/components/landing/Testimonials"));
const FAQ = lazy(() => import("@/components/landing/FAQ"));
const Footer = lazy(() => import("@/components/landing/Footer"));

import SEOHead from "@/components/SEOHead";

const SectionLoader = () => (
  <div className="py-20 flex items-center justify-center">
    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
  </div>
);

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: "Les Logements de Zeyna",
    description:
      "Plateforme N°1 du logement étudiant à Saint-Louis du Sénégal. Chambres et studios proches de l'UGB, campus Sanar, Bango et Khor.",
    url: "https://logements-zeyna.site",
    areaServed: [
      { "@type": "City", name: "Saint-Louis", containedInPlace: { "@type": "Country", name: "Sénégal" } },
      { "@type": "Place", name: "Sanar" },
      { "@type": "Place", name: "Université Gaston Berger (UGB)" },
    ],
    serviceType: "Logement étudiant",
    knowsAbout: [
      "logement étudiant Saint-Louis Sénégal",
      "chambre étudiant UGB",
      "logement étudiant Sanar",
      "chambre à louer près de l'UGB",
      "logement hors campus Saint-Louis",
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
    <div className="min-h-screen">
      <SEOHead
        title="Logement Étudiant Saint-Louis Sénégal | Chambres & Studios près de l'UGB"
        description="Trouvez votre logement étudiant à Saint-Louis du Sénégal. Chambres individuelles et collectives près de l'UGB, campus Sanar, Bango, Khor — vérifiés, sécurisés et à prix transparent."
        keywords="logement étudiant Saint-Louis Sénégal, chambre étudiant UGB, logement étudiant Sanar, chambre à louer près de l'UGB, logement hors campus Saint-Louis, résidence étudiante Saint-Louis, studio étudiant Sénégal, Les Logements de Zeyna, Université Gaston Berger logement, chambre étudiant Bango"
        canonical="/"
        jsonLd={jsonLd}
      />
      <Navbar />
      <HeroSection />
      <ErrorBoundary>
        <Suspense fallback={<SectionLoader />}>
          <HowItWorks />
        </Suspense>
      </ErrorBoundary>
      <ErrorBoundary>
        <Suspense fallback={<SectionLoader />}>
          <PopularLogements />
        </Suspense>
      </ErrorBoundary>
      <ErrorBoundary>
        <Suspense fallback={<SectionLoader />}>
          <Advantages />
        </Suspense>
      </ErrorBoundary>
      <ErrorBoundary>
        <Suspense fallback={<SectionLoader />}>
          <Testimonials />
        </Suspense>
      </ErrorBoundary>
      <ErrorBoundary>
        <Suspense fallback={<SectionLoader />}>
          <FAQ />
        </Suspense>
      </ErrorBoundary>
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