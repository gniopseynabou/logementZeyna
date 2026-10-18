import { useState } from "react";
import { invalidateGroups } from "@/lib/invalidate-helpers";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { confirmAdminPayment, getAdminPayments, getAdminPaymentStats } from "@/services/payment-service";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PaginationControls } from "@/components/ui/PaginationControls";
import { AlertCircle, Printer, Receipt, Plus } from "lucide-react";
import { generateRecuPaiementHTML, printDocument } from "@/lib/contract-templates";
import { ManualReceiptDialog } from "@/components/admin/ManualReceiptDialog";
import { OperationsAndReceiptsManager } from "@/components/admin/OperationsAndReceiptsManager";

const AdminPaiements = () => {
  const { toast } = useToast();
  const qc = useQueryClient();

  const [tab, setTab] = useState<"en_attente" | "confirmes" | "recus_registre">("en_attente");
  const [manualReceiptOpen, setManualReceiptOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Filtre mapped: onglet → statusFilter pour l'API
  const statusFilter = tab === "confirmes" ? "true" : "false";

  const { data: paiementsData, isLoading, isError, error } = useQuery({
    queryKey: ["admin-paiements", page, pageSize, statusFilter],
    queryFn: () => getAdminPayments({ page, pageSize, statusFilter }),
    enabled: tab !== "recus_registre",
  });

  const { data: stats } = useQuery({
    queryKey: ["admin-paiements-stats"],
    queryFn: getAdminPaymentStats,
  });

  const paiements = paiementsData?.data || [];

  const confirmPaiement = useMutation({
    mutationFn: async (id: string) => {
      const paiement = paiements.find(p => p.id === id);
      if (!paiement) throw new Error("Paiement introuvable");

      const details = (paiement as any).reservations;
      await confirmAdminPayment({
        paymentId: paiement.id,
        reservationId: paiement.reservation_id,
        studentId: paiement.etudiant_id,
        amount: paiement.montant,
        reference: paiement.reference,
        logementName: details?.logements?.nom ?? null,
        roomName: details?.chambres?.nom ?? null,
      });
    },
    onSuccess: async () => {
      await invalidateGroups(qc, ["PAIEMENT_CHANGED"]);
      qc.invalidateQueries({ queryKey: ["admin-paiements"] });
      qc.invalidateQueries({ queryKey: ["admin-paiements-stats"] });
      qc.invalidateQueries({ queryKey: ["admin-all-receipts"] });
      qc.invalidateQueries({ queryKey: ["admin-operations-register"] });
      toast({ title: "Paiement confirmé ✅", description: "Réservation confirmée, chambre bloquée et reçu généré." });
    },
    onError: (err) => {
      toast({ title: "Erreur de confirmation", description: err.message, variant: "destructive" });
    },
  });

  const handleTabChange = (value: string) => {
    setTab(value as "en_attente" | "confirmes" | "recus_registre");
    setPage(1);
  };

  const renderContent = (showConfirmBtn: boolean) => {
    if (isLoading) {
      return (
        <div className="space-y-3 p-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      );
    }

    if (isError) {
      return (
        <div className="p-8 text-center" role="alert">
          <AlertCircle className="h-8 w-8 mx-auto mb-3 text-destructive opacity-60" />
          <p className="font-medium">Impossible de charger les paiements.</p>
          <p className="text-sm text-muted-foreground mt-1">
            {error instanceof Error ? error.message : "Erreur inattendue."}
          </p>
        </div>
      );
    }

    if (paiements.length === 0) {
      return <p className="text-center py-10 text-muted-foreground">Aucun paiement dans cet onglet</p>;
    }

    return (
      <>
        <div className="space-y-4 p-1">
          {paiements.map((p) => (
            <Card key={p.id} className="border-0 shadow-premium">
              <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{(p as any).reservations?.logements?.nom || "Logement"}</p>
                  <p className="text-sm text-muted-foreground">{(p as any).reservations?.chambres?.nom}</p>
                  <p className="text-xs text-muted-foreground">Réf: {p.reference} · {p.methode?.replace("_", " ")}</p>
                  <p className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString("fr-FR")}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-lg font-bold text-accent font-ui">{p.montant.toLocaleString()} FCFA</p>
                    <Badge variant={p.est_confirme ? "default" : "secondary"}>
                      {p.est_confirme ? "Confirmé" : "En attente"}
                    </Badge>
                  </div>
                  {p.est_confirme && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const res = (p as any).reservations;
                        const html = generateRecuPaiementHTML({
                          reference: p.reference || `REC-${p.id.slice(0, 8).toUpperCase()}`,
                          dateEmission: new Date(p.created_at).toLocaleDateString("fr-FR"),
                          payeur: {
                            prenom: "",
                            nom: "Locataire Étudiant",
                            qualite: "Locataire Étudiant",
                          },
                          logement: {
                            nom: res?.logements?.nom || "Logement",
                            chambre: res?.chambres?.nom,
                          },
                          typeRecu: "caution",
                          typeGeneration: "automatique",
                          montant: p.montant,
                          methodePaiement: p.methode?.replace("_", " ") || "Wave",
                          referencePaiement: p.reference,
                          motif: "Paiement de la caution et confirmation de réservation",
                        });
                        printDocument(html);
                      }}
                    >
                      <Printer className="h-3.5 w-3.5 mr-1" /> Reçu (PDF)
                    </Button>
                  )}
                  {showConfirmBtn && (
                    <Button
                      size="sm"
                      className="bg-gradient-gold text-accent-foreground"
                      disabled={confirmPaiement.isPending}
                      onClick={() => confirmPaiement.mutate(p.id)}
                    >
                      Confirmer
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {paiementsData && paiementsData.pagination.totalPages > 1 && (
          <div className="border-t mt-4">
            <PaginationControls
              currentPage={paiementsData.pagination.page}
              totalPages={paiementsData.pagination.totalPages}
              pageSize={paiementsData.pagination.pageSize}
              totalItems={paiementsData.pagination.total}
              onPageChange={setPage}
              onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
              isLoading={isLoading}
            />
          </div>
        )}
      </>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* En-tête avec stats et bouton d'action principal */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl font-bold">Paiements & Reçus</h1>
            <p className="text-muted-foreground text-sm">
              {stats?.all ?? "-"} paiement(s) enregistrés · Gestion des encaissements et quittances libératoires
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => setManualReceiptOpen(true)}
              className="bg-primary text-white hover:bg-primary/95 flex items-center gap-2 shadow-sm font-medium"
            >
              <Plus className="h-4 w-4" />
              <Receipt className="h-4 w-4" />
              <span>Émettre un reçu manuel</span>
            </Button>

            <div className="flex gap-2">
              <Card className="border-0 shadow-premium">
                <CardContent className="p-3 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold">En attente</p>
                  <p className="text-lg font-bold text-amber-600 font-ui">{stats?.en_attente ?? "-"}</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-premium">
                <CardContent className="p-3 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold">Confirmés</p>
                  <p className="text-lg font-bold text-green-600 font-ui">{stats?.confirme ?? "-"}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <Tabs value={tab} onValueChange={handleTabChange}>
          <TabsList className="grid grid-cols-1 sm:grid-cols-3 w-full max-w-xl">
            <TabsTrigger value="en_attente">
              En attente ({stats?.en_attente ?? "…"})
            </TabsTrigger>
            <TabsTrigger value="confirmes">
              Confirmés ({stats?.confirme ?? "…"})
            </TabsTrigger>
            <TabsTrigger value="recus_registre" className="flex items-center gap-1.5">
              <Receipt className="h-4 w-4" />
              <span>Reçus & Registre</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="en_attente" className="mt-4">
            {renderContent(true)}
          </TabsContent>
          <TabsContent value="confirmes" className="mt-4">
            {renderContent(false)}
          </TabsContent>
          <TabsContent value="recus_registre" className="mt-4">
            <OperationsAndReceiptsManager />
          </TabsContent>
        </Tabs>

        {/* Dialogue d'émission de reçu manuel */}
        <ManualReceiptDialog
          open={manualReceiptOpen}
          onOpenChange={setManualReceiptOpen}
        />
      </div>
    </DashboardLayout>
  );
};

export default AdminPaiements;
