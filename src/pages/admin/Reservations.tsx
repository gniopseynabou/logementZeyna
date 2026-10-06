import { useState } from "react";
import { invalidateGroups } from "@/lib/invalidate-helpers";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAdminReservations, getAdminReservationStats, ReservationStatus, updateAdminReservationStatus } from "@/services/reservation-service";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PaginationControls } from "@/components/ui/PaginationControls";
import { AlertCircle } from "lucide-react";

const STATUS_TABS = [
  { value: "en_attente", label: "En attente", stat: "en_attente" },
  { value: "confirmee",  label: "Confirmées",  stat: "confirmee" },
  { value: "annulee",   label: "Annulées",    stat: "annulee" },
] as const;

const AdminReservations = () => {
  const { toast } = useToast();
  const qc = useQueryClient();

  const [tab, setTab] = useState<string>("en_attente");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const { data: reservationsData, isLoading, isError, error } = useQuery({
    queryKey: ["admin-reservations", page, pageSize, tab],
    queryFn: () => getAdminReservations({ page, pageSize, statusFilter: tab }),
  });

  const { data: stats } = useQuery({
    queryKey: ["admin-reservations-stats"],
    queryFn: getAdminReservationStats,
  });

  const reservations = reservationsData?.data || [];

  const updateStatut = useMutation({
    mutationFn: ({ id, statut }: { id: string; statut: ReservationStatus }) => {
      const r = reservations.find(r => r.id === id);
      return updateAdminReservationStatus(id, statut, r?.chambre_id);
    },
    onSuccess: async () => {
      await invalidateGroups(qc, ["RESERVATION_CHANGED"]);
      qc.invalidateQueries({ queryKey: ["admin-reservations"] });
      qc.invalidateQueries({ queryKey: ["admin-reservations-stats"] });
      toast({ title: "Statut mis à jour ✅" });
    },
    onError: (err) =>
      toast({ title: "Erreur", description: err.message, variant: "destructive" }),
  });

  const handleTabChange = (value: string) => {
    setTab(value);
    setPage(1);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-3 p-1">
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
          <p className="font-medium">Impossible de charger les réservations.</p>
          <p className="text-sm text-muted-foreground mt-1">
            {error instanceof Error ? error.message : "Erreur inattendue."}
          </p>
        </div>
      );
    }

    if (reservations.length === 0) {
      return <p className="text-center py-10 text-muted-foreground">Aucune réservation dans cet onglet</p>;
    }

    return (
      <>
        <div className="space-y-4">
          {reservations.map((r) => (
            <Card key={r.id} className="border-0 shadow-premium">
              <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{r.logements?.nom}</p>
                  <p className="text-sm text-muted-foreground">{r.chambres?.nom}</p>
                  <p className="text-xs text-muted-foreground">
                    Du {new Date(r.date_debut).toLocaleDateString("fr-FR")}
                    {r.date_fin ? ` au ${new Date(r.date_fin).toLocaleDateString("fr-FR")}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap justify-end">
                  <p className="font-bold text-accent font-ui">{r.montant_total?.toLocaleString()} FCFA</p>
                  {r.statut === "en_attente" && (
                    <>
                      <Button
                        size="sm"
                        className="bg-gradient-gold text-accent-foreground"
                        disabled={updateStatut.isPending}
                        onClick={() => updateStatut.mutate({ id: r.id, statut: "confirmee" })}
                      >
                        Confirmer
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive"
                        disabled={updateStatut.isPending}
                        onClick={() => updateStatut.mutate({ id: r.id, statut: "annulee" })}
                      >
                        Annuler
                      </Button>
                    </>
                  )}
                  {r.statut === "confirmee" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive"
                      disabled={updateStatut.isPending}
                      onClick={() => updateStatut.mutate({ id: r.id, statut: "annulee" })}
                    >
                      Annuler
                    </Button>
                  )}
                  <Badge
                    variant={
                      r.statut === "confirmee" ? "default" :
                      r.statut === "annulee" ? "destructive" :
                      "secondary"
                    }
                  >
                    {r.statut === "confirmee" ? "Confirmée" : r.statut === "annulee" ? "Annulée" : "En attente"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {reservationsData && reservationsData.pagination.totalPages > 1 && (
          <div className="border-t mt-4">
            <PaginationControls
              currentPage={reservationsData.pagination.page}
              totalPages={reservationsData.pagination.totalPages}
              pageSize={reservationsData.pagination.pageSize}
              totalItems={reservationsData.pagination.total}
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
        <div>
          <h1 className="font-serif text-2xl font-bold">Gestion des réservations</h1>
          <p className="text-muted-foreground text-sm">
            {stats?.all ?? "-"} réservation(s) au total
          </p>
        </div>

        <Tabs value={tab} onValueChange={handleTabChange}>
          <TabsList>
            {STATUS_TABS.map((t) => (
              <TabsTrigger key={t.value} value={t.value}>
                {t.label} ({stats?.[t.stat as keyof typeof stats] ?? "…"})
              </TabsTrigger>
            ))}
          </TabsList>

          {STATUS_TABS.map((t) => (
            <TabsContent key={t.value} value={t.value} className="mt-4">
              {renderContent()}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdminReservations;
