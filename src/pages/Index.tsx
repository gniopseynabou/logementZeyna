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

const SectionLoader = () => (
  <div className="py-20 flex items-center justify-center">
    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
  </div>
);

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  name: "Les logements de Zeyna",
  description: "Plateforme N°1 du logement étudiant à Saint-Louis du Sénégal",
  url: "https://leslogementsdezeyna.com",
  areaServed: {
    "@type": "City",
    name: "Saint-Louis",
    containedInPlace: { "@type": "Country", name: "Sénégal" },
  },
  serviceType: "Logement étudiant",
};

const Index = memo(() => {
  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
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
