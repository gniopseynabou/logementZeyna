import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { getStudentContracts } from "@/services/contract-service";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";
import { generateContratClientHTML } from "@/pages/admin/Documents";

const EtudiantContrats = () => {
  const { user, profile } = useAuth();

  const { data: contrats, isLoading, isError, error } = useQuery({
    queryKey: ["etudiant-contrats", user?.id],
    queryFn: () => getStudentContracts(user!.id),
  });

  const downloadContract = (contrat: any) => {
    const content = contrat.contenu as any;
    const res = (contrat as any).reservations;
    const logNom = res?.logements?.nom || content?.logement || "N/A";
    const chNom = res?.chambres?.nom || content?.chambre || "N/A";
    const montant = content?.montant || 0;
    const ref = content?.reference || "N/A";
    const date = content?.date ? new Date(content.date).toLocaleDateString("fr-FR") : new Date(contrat.created_at).toLocaleDateString("fr-FR");

    const htmlContent = generateContratClientHTML({
      refContrat: ref,
      dateEmission: date,
      client: { prenom: profile?.prenom || "", nom: profile?.nom || "", telephone: profile?.telephone },
      logement: {
        nom: logNom,
        adresse: res?.logements?.adresse || "N/A",
        ville: res?.logements?.ville || "Saint-Louis",
        type: res?.logements?.type || "Non spécifié"
      },
      chambre: {
        nom: chNom,
        nombre_personnes: res?.chambres?.nombre_personnes,
        prix_zeyna: res?.chambres?.prix_zeyna
      },
      caution: montant,
      dateDebut: res?.date_debut ? new Date(res.date_debut).toLocaleDateString("fr-FR") : date
    });

    // Ouvrir dans une nouvelle fenêtre pour imprimer / sauvegarder en PDF
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Auto-print une fois chargé
      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
      };
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="font-serif text-2xl font-bold">Mes contrats</h1>

        {isLoading ? (
          <div className="space-y-4">{[1, 2, 3].map((item) => <div key={item} className="h-24 bg-muted animate-pulse rounded-xl" />)}</div>
        ) : isError ? (
          <Card className="border-0 shadow-premium" role="alert">
            <CardContent className="py-12 text-center">
              <p>Impossible de charger vos contrats.</p>
              <p className="text-sm text-muted-foreground mt-1">
                {error instanceof Error ? error.message : "Une erreur inattendue est survenue."}
              </p>
            </CardContent>
          </Card>
        ) : !contrats || contrats.length === 0 ? (
          <Card className="border-0 shadow-premium"><CardContent className="py-12 text-center text-muted-foreground">Aucun contrat disponible. Un contrat est généré automatiquement après paiement de la caution.</CardContent></Card>
        ) : (
          <div className="space-y-4">
            {contrats.map((c) => (
              <Card key={c.id} className="border-0 shadow-premium">
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-muted rounded-xl"><FileText className="h-5 w-5 text-primary" /></div>
                    <div>
                      <p className="font-medium">{(c as any).reservations?.logements?.nom || "Logement"}</p>
                      <p className="text-sm text-muted-foreground">{(c as any).reservations?.chambres?.nom}</p>
                      <p className="text-xs text-muted-foreground">Réf: {(c.contenu as any)?.reference || "-"} · {new Date(c.created_at).toLocaleDateString("fr-FR")}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => downloadContract(c)}>
                    <Download className="h-4 w-4 mr-2" /> Télécharger
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default EtudiantContrats;
