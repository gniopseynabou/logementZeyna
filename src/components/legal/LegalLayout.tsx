import React from "react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

export const LegalLayout = ({ children, title, lastUpdated }: { children: React.ReactNode, title: string, lastUpdated: string }) => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-grow pt-28 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-4">{title}</h1>
            <p className="text-muted-foreground">Dernière mise à jour : {lastUpdated}</p>
          </div>
          <div className="prose prose-stone max-w-none prose-headings:font-serif prose-headings:text-primary prose-a:text-accent hover:prose-a:text-accent/80 bg-white p-8 md:p-12 rounded-2xl shadow-premium">
            {children}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
