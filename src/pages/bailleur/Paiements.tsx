import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const BailleurPaiements = () => {
  const { user } = useAuth();

  const { data: logements } = useQuery({
    queryKey: ["bailleur-paiements-logements", user?.id],
    queryFn: async () => {
      const { data: loge } = await supabase.from("logements").select("id, nom").eq("bailleur_id", user!.id);
      if (!loge || loge.length === 0) return [];
      const ids = loge.map(l => l.id);
      const { data: reservations } = await supabase.from("reservations").select("id, logement_id, montant_total, statut, logements(nom), chambres(nom)").in("logement_id", ids).eq("statut", "confirmee");
      return reservations || [];
    },
    enabled: !!user,
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="font-serif text-2xl font-bold">Paiements reçus</h1>
        {!logements || logements.length === 0 ? (
          <Card className="border-0 shadow-premium"><CardContent className="py-12 text-center text-muted-foreground">Aucun paiement reçu</CardContent></Card>
        ) : (
          <div className="space-y-4">
            {logements.map((r: any) => (
              <Card key={r.id} className="border-0 shadow-premium">
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{r.logements?.nom}</p>
                    <p className="text-sm text-muted-foreground">{r.chambres?.nom}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-accent font-ui">{r.montant_total?.toLocaleString()} F</p>
                    <Badge>Confirmé</Badge>
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

export default BailleurPaiements;
