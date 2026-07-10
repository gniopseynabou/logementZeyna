import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Smartphone } from "lucide-react";
import { METHODE_LABELS } from "@/lib/supabase-utils";

const METHODE_ICONS: Record<string, React.ReactNode> = {
  orange_money: <Smartphone className="h-4 w-4 text-orange-500" />,
  mtn_money: <Smartphone className="h-4 w-4 text-yellow-500" />,
  moov_money: <Smartphone className="h-4 w-4 text-blue-500" />,
  carte_bancaire: <CreditCard className="h-4 w-4 text-primary" />,
};

const EtudiantPaiements = () => {
  const { user } = useAuth();

  const { data: paiements, isLoading } = useQuery({
    queryKey: ["etudiant-paiements-full", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("paiements")
        .select("*, reservations(logements(nom), chambres(nom))")
        .eq("etudiant_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const totalPaye = (paiements || [])
    .filter((p) => p.est_confirme)
    .reduce((s, p) => s + p.montant, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="font-serif text-2xl font-bold">Mes paiements</h1>
          {totalPaye > 0 && (
            <div className="text-sm text-muted-foreground">
              Total payé :{" "}
              <span className="font-bold text-accent font-ui">
                {totalPaye.toLocaleString()} FCFA
              </span>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        ) : !paiements || paiements.length === 0 ? (
          <Card className="border-0 shadow-premium">
            <CardContent className="py-12 text-center text-muted-foreground">
              <CreditCard className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>Aucun paiement effectué.</p>
              <p className="text-xs mt-1">
                Vos paiements apparaîtront ici après avoir confirmé une réservation.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {paiements.map((p) => (
              <Card key={p.id} className="border-0 shadow-premium">
                <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 p-2 bg-muted rounded-lg">
                      {METHODE_ICONS[p.methode] || <CreditCard className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="font-medium">
                        {(p as any).reservations?.logements?.nom || "Logement"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {(p as any).reservations?.chambres?.nom}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {METHODE_LABELS[p.methode] || p.methode}
                        {p.reference && ` · Réf: ${p.reference}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(p.created_at).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xl font-bold text-accent font-ui">
                      {p.montant.toLocaleString()} FCFA
                    </p>
                    <Badge
                      variant={p.est_confirme ? "default" : "secondary"}
                      className="mt-1"
                    >
                      {p.est_confirme ? "✓ Confirmé" : "En attente"}
                    </Badge>
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

export default EtudiantPaiements;
