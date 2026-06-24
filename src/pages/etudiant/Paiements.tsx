import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const EtudiantPaiements = () => {
  const { user } = useAuth();

  const { data: paiements } = useQuery({
    queryKey: ["etudiant-paiements-full", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("paiements")
        .select("*, reservations(logements(nom), chambres(nom))")
        .eq("etudiant_id", user!.id)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="font-serif text-2xl font-bold">Historique des paiements</h1>

        {!paiements || paiements.length === 0 ? (
          <Card className="border-0 shadow-premium"><CardContent className="py-12 text-center text-muted-foreground">Aucun paiement effectué</CardContent></Card>
        ) : (
          <div className="space-y-4">
            {paiements.map((p) => (
              <Card key={p.id} className="border-0 shadow-premium">
                <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{(p as any).reservations?.logements?.nom || "Logement"}</p>
                    <p className="text-sm text-muted-foreground">{(p as any).reservations?.chambres?.nom}</p>
                    <p className="text-xs text-muted-foreground mt-1">Réf: {p.reference || "—"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-accent font-ui">{p.montant.toLocaleString()} F</p>
                    <p className="text-xs text-muted-foreground capitalize">{p.methode.replace("_", " ")}</p>
                    <Badge variant={p.est_confirme ? "default" : "secondary"} className="mt-1">
                      {p.est_confirme ? "Confirmé" : "En attente"}
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
