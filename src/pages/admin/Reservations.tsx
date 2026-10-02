import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAdminReservations, ReservationStatus, updateAdminReservationStatus } from "@/services/reservation-service";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdminReservations = () => {
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: reservations } = useQuery({
    queryKey: ["admin-reservations"],
    queryFn: getAdminReservations,
  });

  const updateStatut = useMutation({
    mutationFn: ({ id, statut }: { id: string; statut: ReservationStatus }) =>
      updateAdminReservationStatus(id, statut, reservations?.find(r => r.id === id)?.chambre_id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-reservations"] });
      toast({ title: "Statut mis à jour ✅" });
    },
  });

  const enAttente = reservations?.filter(r => r.statut === "en_attente") || [];
  const confirmees = reservations?.filter(r => r.statut === "confirmee") || [];
  const annulees = reservations?.filter(r => r.statut === "annulee") || [];

  const renderList = (list: any[]) => (
    list.length === 0 ? (
      <p className="text-center py-8 text-muted-foreground">Aucune réservation</p>
    ) : (
      <div className="space-y-4">
        {list.map((r) => (
          <Card key={r.id} className="border-0 shadow-premium">
            <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="font-medium">{r.logements?.nom}</p>
                <p className="text-sm text-muted-foreground">{r.chambres?.nom}</p>
                <p className="text-xs text-muted-foreground">Du {new Date(r.date_debut).toLocaleDateString("fr-FR")} {r.date_fin ? `au ${new Date(r.date_fin).toLocaleDateString("fr-FR")}` : ""}</p>
              </div>
              <div className="flex items-center gap-2">
                <p className="font-bold text-accent font-ui">{r.montant_total.toLocaleString()} F</p>
                {r.statut === "en_attente" && (
                  <>
                    <Button size="sm" className="bg-gradient-gold text-accent-foreground" onClick={() => updateStatut.mutate({ id: r.id, statut: "confirmee" })}>Confirmer</Button>
                    <Button size="sm" variant="outline" className="text-destructive" onClick={() => updateStatut.mutate({ id: r.id, statut: "annulee" })}>Annuler</Button>
                  </>
                )}
                {r.statut === "confirmee" && (
                  <Button size="sm" variant="outline" className="text-destructive" onClick={() => updateStatut.mutate({ id: r.id, statut: "annulee" })}>Annuler</Button>
                )}
                <Badge variant={r.statut === "confirmee" ? "default" : r.statut === "annulee" ? "destructive" : "secondary"}>
                  {r.statut === "confirmee" ? "Confirmée" : r.statut === "annulee" ? "Annulée" : "En attente"}
                </Badge>
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
        <h1 className="font-serif text-2xl font-bold">Gestion des réservations</h1>
        <Tabs defaultValue="en_attente">
          <TabsList>
            <TabsTrigger value="en_attente">En attente ({enAttente.length})</TabsTrigger>
            <TabsTrigger value="confirmees">Confirmées ({confirmees.length})</TabsTrigger>
            <TabsTrigger value="annulees">Annulées ({annulees.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="en_attente" className="mt-4">{renderList(enAttente)}</TabsContent>
          <TabsContent value="confirmees" className="mt-4">{renderList(confirmees)}</TabsContent>
          <TabsContent value="annulees" className="mt-4">{renderList(annulees)}</TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdminReservations;
