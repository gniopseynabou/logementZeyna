import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cancelStudentReservation, getStudentReservations } from "@/services/reservation-service";
import { invalidateEtudiantData, invalidateGroup } from "@/lib/invalidate-helpers";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const EtudiantReservations = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: reservations, isLoading } = useQuery({
    queryKey: ["etudiant-reservations-full", user?.id],
    queryFn: () => getStudentReservations(user!.id),
    enabled: !!user,
  });

  const cancelMutation = useMutation({
    mutationFn: cancelStudentReservation,
    onSuccess: async () => {
      if (user?.id) await invalidateEtudiantData(qc, user.id);
      await invalidateGroup(qc, "RESERVATION_CHANGED");
      toast({ title: "Réservation annulée" });
    },
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h1 className="font-serif text-2xl font-bold">Mes réservations</h1>
          <Button asChild className="bg-gradient-gold text-accent-foreground w-full sm:w-auto"><Link to="/logements">Trouver un logement</Link></Button>
        </div>

        {isLoading ? (
          <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />)}</div>
        ) : !reservations || reservations.length === 0 ? (
          <Card className="border-0 shadow-premium">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Vous n'avez pas encore de réservation</p>
              <Button asChild className="mt-4 bg-gradient-gold text-accent-foreground"><Link to="/logements">Explorer les logements</Link></Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {reservations.map((r) => (
              <Card key={r.id} className="border-0 shadow-premium">
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-serif font-bold text-lg">{(r as any).logements?.nom}</h3>
                      <p className="text-sm text-muted-foreground">{(r as any).chambres?.nom} - {(r as any).logements?.adresse}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Du {new Date(r.date_debut).toLocaleDateString("fr-FR")}
                        {r.date_fin && ` au ${new Date(r.date_fin).toLocaleDateString("fr-FR")}`}
                      </p>
                    </div>
                     <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      <div className="text-left sm:text-right">
                        <Badge variant={r.statut === "confirmee" ? "default" : r.statut === "annulee" ? "destructive" : "secondary"}>
                          {r.statut === "confirmee" ? "Confirmée" : r.statut === "annulee" ? "Annulée" : "En attente"}
                        </Badge>
                        <p className="text-lg font-bold text-accent font-ui mt-1">{r.montant_total.toLocaleString()} F</p>
                      </div>
                      {r.statut === "en_attente" && (
                        <div className="flex gap-2 w-full sm:w-auto">
                          <Button asChild size="sm" className="bg-gradient-gold text-accent-foreground flex-1 sm:flex-initial">
                            <Link to={`/etudiant/paiement/${r.id}`}>Payer</Link>
                          </Button>
                          <Button size="sm" variant="outline" className="text-destructive flex-1 sm:flex-initial" onClick={() => cancelMutation.mutate(r.id)}>
                            Annuler
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default EtudiantReservations;
