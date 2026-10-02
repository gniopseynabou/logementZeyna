import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { getLandlordPaymentReport } from "@/services/payment-service";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, CreditCard } from "lucide-react";
import { METHODE_LABELS } from "@/lib/supabase-utils";

const BailleurPaiements = () => {
  const { user } = useAuth();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["bailleur-paiements-detail", user?.id],
    queryFn: () => getLandlordPaymentReport(user!.id),
    enabled: !!user,
  });

  const confirmes = data?.paiements.filter((p) => p.est_confirme) || [];
  const enAttente = data?.paiements.filter((p) => !p.est_confirme) || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl font-bold">Paiements reçus</h1>
            <p className="text-muted-foreground text-sm">
              Suivi des paiements sur vos logements
            </p>
          </div>
          <Card className="border-0 shadow-premium">
            <CardContent className="p-4 flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-xs text-muted-foreground">Total encaissé</p>
                <p className="text-xl font-bold text-accent font-ui">
                  {isError ? "Indisponible" : `${(data?.total ?? 0).toLocaleString()} FCFA`}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        ) : isError ? (
          <Card className="border-0 shadow-premium" role="alert">
            <CardContent className="py-12 text-center">
              <p>Impossible de charger les paiements.</p>
              <p className="text-sm text-muted-foreground mt-1">
                {error instanceof Error ? error.message : "Une erreur inattendue est survenue."}
              </p>
            </CardContent>
          </Card>
        ) : !data?.paiements.length ? (
          <Card className="border-0 shadow-premium">
            <CardContent className="py-12 text-center text-muted-foreground">
              <CreditCard className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>Aucun paiement reçu pour le moment.</p>
              <p className="text-xs mt-1">Les paiements apparaîtront ici une fois les réservations confirmées.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {confirmes.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  Confirmés ({confirmes.length})
                </h2>
                <div className="space-y-3">
                  {confirmes.map((p: any) => (
                    <Card key={p.id} className="border-0 shadow-premium">
                      <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <p className="font-medium">{p.reservations?.logements?.nom || "Logement"}</p>
                          <p className="text-sm text-muted-foreground">{p.reservations?.chambres?.nom}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {METHODE_LABELS[p.methode] || p.methode} · Réf: {p.reference || "—"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(p.created_at).toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-accent font-ui">
                            {p.montant.toLocaleString()} FCFA
                          </p>
                          <Badge>Confirmé ✓</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {enAttente.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  En attente de confirmation ({enAttente.length})
                </h2>
                <div className="space-y-3">
                  {enAttente.map((p: any) => (
                    <Card key={p.id} className="border-0 shadow-premium opacity-70">
                      <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <p className="font-medium">{p.reservations?.logements?.nom || "Logement"}</p>
                          <p className="text-sm text-muted-foreground">{p.reservations?.chambres?.nom}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {METHODE_LABELS[p.methode] || p.methode} · Réf: {p.reference || "—"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold font-ui">{p.montant.toLocaleString()} FCFA</p>
                          <Badge variant="secondary">En attente</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default BailleurPaiements;
