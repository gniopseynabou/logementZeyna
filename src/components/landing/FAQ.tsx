import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useQuery } from "@tanstack/react-query";
import { getVisibleFaqs } from "@/services/public-content-service";

const FAQ = () => {
  const { data: faqs, isLoading, isError } = useQuery({
    queryKey: ["faqs"],
    queryFn: getVisibleFaqs,
  });

  if (isLoading) {
    return (
      <section className="py-20 md:py-28 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="py-12 bg-secondary/50" role="alert">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          La FAQ est temporairement indisponible.
        </div>
      </section>
    );
  }

  if (!faqs || faqs.length === 0) return null;

  return (
    <section className="py-20 md:py-28 bg-secondary/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="text-sm font-semibold text-accent uppercase tracking-wider">FAQ</span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mt-3">
            Questions fréquentes
          </h2>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq) => (
              <AccordionItem key={faq.id} value={faq.id} className="bg-card rounded-xl border-0 shadow-sm px-6 data-[state=open]:shadow-premium transition-shadow">
                <AccordionTrigger className="text-left font-semibold text-foreground hover:text-accent hover:no-underline py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                  {faq.reponse}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
