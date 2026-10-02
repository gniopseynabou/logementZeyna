import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { confirmAdminPayment, getAdminPayments } from "@/services/payment-service";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdminPaiements = () => {
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: paiements } = useQuery({
    queryKey: ["admin-paiements"],
    queryFn: getAdminPayments,
  });

  const confirmPaiement = useMutation({
    mutationFn: async (id: string) => {
      const paiement = paiements?.find(p => p.id === id);
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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-paiements"] });
      toast({ title: "Paiement confirmé ✅", description: "Réservation confirmée et chambre bloquée." });
    },
    onError: (error) => {
      toast({ title: "Erreur de confirmation", description: error.message, variant: "destructive" });
    },
  });

  const confirmes = paiements?.filter(p => p.est_confirme) || [];
  const enAttente = paiements?.filter(p => !p.est_confirme) || [];
  const totalConfirme = confirmes.reduce((s, p) => s + p.montant, 0);

  const renderList = (list: any[], showConfirmBtn: boolean) => (
    list.length === 0 ? (
      <p className="text-center py-8 text-muted-foreground">Aucun paiement</p>
    ) : (
      <div className="space-y-4">
        {list.map((p) => (
          <Card key={p.id} className="border-0 shadow-premium">
            <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="font-medium">{(p as any).reservations?.logements?.nom || "Logement"}</p>
                <p className="text-sm text-muted-foreground">{(p as any).reservations?.chambres?.nom}</p>
                <p className="text-xs text-muted-foreground">Réf: {p.reference} · {p.methode.replace("_", " ")}</p>
                <p className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString("fr-FR")}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-lg font-bold text-accent font-ui">{p.montant.toLocaleString()} F</p>
                  <Badge variant={p.est_confirme ? "default" : "secondary"}>{p.est_confirme ? "Confirmé" : "En attente"}</Badge>
                </div>
                {showConfirmBtn && (
                  <Button size="sm" className="bg-gradient-gold text-accent-foreground" disabled={confirmPaiement.isPending} onClick={() => confirmPaiement.mutate(p.id)}>
                    Confirmer
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-serif text-2xl font-bold">Paiements</h1>
          <Card className="border-0 shadow-premium">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total encaissé</p>
              <p className="text-2xl font-bold text-accent font-ui">{totalConfirme.toLocaleString()} FCFA</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="en_attente">
          <TabsList>
            <TabsTrigger value="en_attente">En attente ({enAttente.length})</TabsTrigger>
            <TabsTrigger value="confirmes">Confirmés ({confirmes.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="en_attente" className="mt-4">{renderList(enAttente, true)}</TabsContent>
          <TabsContent value="confirmes" className="mt-4">{renderList(confirmes, false)}</TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdminPaiements;
