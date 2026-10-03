import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useQuery } from "@tanstack/react-query";
import { getVisibleFaqs } from "@/services/public-content-service";

const FAQ = () => {
  const { data: faqs, isLoading, isError } = useQuery({
    queryKey: ["faqs"],
    queryFn: getVisibleFaqs,
  });

  if (isLoading || isError || !faqs || faqs.length === 0) return null;

  return (
    <section className="py-24 md:py-32 bg-secondary/30">
      <div className="container mx-auto px-4">
        
        <div className="flex flex-col md:flex-row gap-16 max-w-6xl mx-auto">
          {/* Header left */}
          <div className="md:w-1/3">
            <div className="sticky top-32">
              <p className="text-xs font-bold text-accent uppercase tracking-widest mb-3">Support</p>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
                Questions fréquentes
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Retrouvez les réponses aux questions les plus posées par nos locataires.
              </p>
            </div>
          </div>

          {/* Accordion right */}
          <div className="md:w-2/3">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq) => (
                <AccordionItem key={faq.id} value={faq.id} className="border-b border-border/60 mb-2">
                  <AccordionTrigger className="text-left font-serif font-bold text-lg hover:text-accent hover:no-underline py-6">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pb-6 text-base">
                    {faq.reponse}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>

      </div>
    </section>
  );
};

export default FAQ;
