import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { getStudentContracts } from "@/services/contract-service";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";

const EtudiantContrats = () => {
  const { user, profile } = useAuth();

  const { data: contrats, isLoading, isError, error } = useQuery({
    queryKey: ["etudiant-contrats", user?.id],
    queryFn: () => getStudentContracts(user!.id),
    enabled: !!user,
  });

  const downloadContract = (contrat: any) => {
    const content = contrat.contenu as any;
    const res = (contrat as any).reservations;
    const logNom = res?.logements?.nom || content?.logement || "N/A";
    const chNom = res?.chambres?.nom || content?.chambre || "N/A";
    const montant = content?.montant || 0;
    const ref = content?.reference || "N/A";
    const date = content?.date ? new Date(content.date).toLocaleDateString("fr-FR") : new Date(contrat.created_at).toLocaleDateString("fr-FR");

    const text = `
══════════════════════════════════════════════════
      CONTRAT DE LOCATION
      Les logements de Zeyna - Saint-Louis, Sénégal
══════════════════════════════════════════════════

LOCATAIRE :
  Nom complet : ${profile?.prenom || ""} ${profile?.nom || ""}
  Téléphone   : ${profile?.telephone || "N/A"}

LOGEMENT :
  Nom         : ${logNom}
  Adresse     : ${res?.logements?.adresse || "N/A"}, ${res?.logements?.ville || "Saint-Louis"}
  Chambre     : ${chNom}
  Capacité    : ${res?.chambres?.nombre_personnes || "N/A"} personne(s)
  Loyer       : ${res?.chambres?.prix_zeyna?.toLocaleString() || "N/A"} FCFA / mois

PAIEMENT :
  Caution payée : ${montant.toLocaleString()} FCFA
  Référence     : ${ref}
  Date paiement : ${date}

CONDITIONS GÉNÉRALES :
  1. L'électricité pour l'éclairage et le chauffe-eau est incluse.
  2. Les équipements supplémentaires (ventilateur, réfrigérateur, etc.)
     sont à la charge du propriétaire.
  3. La caution est remboursable sous conditions de bon état des lieux.
  4. Le locataire s'engage à respecter le règlement intérieur.
  5. Toute sous-location est interdite sans accord de Zeyna.

══════════════════════════════════════════════════
  Plateforme : Les logements de Zeyna
  Contact    : +221 33 961 00 00
  Email      : contact@logementsdezeyna.sn
══════════════════════════════════════════════════
    `.trim();

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `contrat-zeyna-${ref}.txt`;
    a.click();
    URL.revokeObjectURL(url);
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
