import React, { useState, useEffect } from "react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

export interface LegalSection {
  id: string;
  title: string;
  content: React.ReactNode;
}

export interface LegalPart {
  title?: string;
  sections: LegalSection[];
}

interface LegalDocumentProps {
  title: string;
  lastUpdated: string;
  intro?: React.ReactNode;
  parts: LegalPart[];
}

export const LegalDocument = ({ title, lastUpdated, intro, parts }: LegalDocumentProps) => {
  const [activeSection, setActiveSection] = useState<string>("");

  useEffect(() => {
    const handleScroll = () => {
      let current = "";
      for (const part of parts) {
        for (const section of part.sections) {
          const el = document.getElementById(section.id);
          if (el && el.getBoundingClientRect().top < 150) {
            current = section.id;
          }
        }
      }
      if (current) setActiveSection(current);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [parts]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] flex flex-col font-sans text-gray-900">
      <div className="print:hidden">
        <Navbar />
      </div>

      <main className="flex-grow pt-28 pb-20 print:pt-0 print:pb-0">
        <div className="container mx-auto px-4 max-w-6xl">
          
          {/* En-tête du document */}
          <header className="mb-12 border-b-2 border-accent/30 pb-8 print:border-b-2 print:border-black">
            <p className="text-accent font-bold tracking-widest text-xs uppercase mb-3 print:text-black">Documents Juridiques ZEYNA</p>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 leading-tight mb-4">{title}</h1>
            <p className="text-sm text-gray-500 font-medium">Dernière mise à jour : {lastUpdated}</p>
          </header>

          <div className="flex flex-col lg:flex-row gap-12 items-start">
            
            {/* Sommaire (Sidebar) - Hidden on print */}
            <aside className="w-full lg:w-1/4 lg:sticky lg:top-28 hidden md:block print:hidden bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <h3 className="font-serif font-bold text-lg mb-4 text-gray-900 border-b pb-2">Sommaire</h3>
              <nav className="space-y-1 overflow-y-auto max-h-[60vh] pr-2 custom-scrollbar">
                {parts.map((part, pIdx) => (
                  <div key={pIdx} className="mb-4 last:mb-0">
                    {part.title && (
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 mt-4">{part.title}</h4>
                    )}
                    <ul className="space-y-1.5">
                      {part.sections.map((sec) => (
                        <li key={sec.id}>
                          <button
                            onClick={() => scrollTo(sec.id)}
                            className={`text-left text-sm transition-colors w-full ${activeSection === sec.id ? "text-accent font-semibold" : "text-gray-600 hover:text-gray-900"}`}
                          >
                            {sec.title}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </nav>
            </aside>

            {/* Contenu principal */}
            <div className="w-full lg:w-3/4 bg-white p-6 md:p-12 rounded-none md:rounded-xl md:border md:border-gray-100 md:shadow-sm print:shadow-none print:border-0 print:p-0">
              
              {intro && (
                <div className="mb-12 text-lg leading-relaxed text-gray-700 bg-gray-50 p-6 md:p-8 border-l-4 border-accent print:border-black print:bg-white print:p-0 print:mb-8">
                  {intro}
                </div>
              )}

              <div className="space-y-16 print:space-y-8">
                {parts.map((part, pIdx) => (
                  <div key={pIdx}>
                    {part.title && (
                      <h2 className="text-2xl font-serif font-bold text-gray-900 mb-8 pb-3 border-b-2 border-gray-100 print:text-xl uppercase tracking-wide mt-12 first:mt-0">
                        {part.title}
                      </h2>
                    )}
                    
                    <div className="space-y-12 print:space-y-6">
                      {part.sections.map((sec) => (
                        <article key={sec.id} id={sec.id} className="scroll-mt-32 relative group">
                          <h3 className="text-xl font-bold text-gray-900 mb-4 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
                            <span className="text-accent font-serif print:text-black">{sec.title.split("—")[0]}</span>
                            {sec.title.includes("—") && (
                              <>
                                <span className="hidden sm:inline text-gray-300 print:hidden">—</span>
                                <span>{sec.title.split("—").slice(1).join("—").trim()}</span>
                              </>
                            )}
                          </h3>
                          <div className="text-gray-700 leading-relaxed space-y-4 text-[15px] print:text-[12px] print:leading-normal">
                            {sec.content}
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>
      </main>

      <div className="print:hidden">
        <Footer />
      </div>
      
      {/* Print Footer */}
      <div className="hidden print:block fixed bottom-0 w-full text-center text-[10px] text-gray-500 border-t border-gray-300 pt-2">
        Les Logements de ZEYNA — {title} — Généré le {new Date().toLocaleDateString("fr-FR")}
      </div>
    </div>
  );
};
