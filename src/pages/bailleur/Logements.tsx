import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { getLandlordLogements } from "@/services/logement-service";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";

const BailleurLogements = () => {
  const { user } = useAuth();

  const { data: logements, isLoading, isError, error } = useQuery({
    queryKey: ["bailleur-logements-list", user?.id],
    queryFn: () => getLandlordLogements(user!.id),
    enabled: !!user,
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h1 className="font-serif text-2xl font-bold">Mes logements</h1>
          <Button asChild className="bg-gradient-gold text-accent-foreground w-full sm:w-auto"><Link to="/bailleur/logements/nouveau">+ Ajouter</Link></Button>
        </div>

        {isLoading ? (
          <div className="space-y-4">{[1,2].map(i => <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />)}</div>
        ) : isError ? (
          <Card className="border-0 shadow-premium" role="alert">
            <CardContent className="py-12 text-center">
              <p>Impossible de charger vos logements.</p>
              <p className="text-sm text-muted-foreground mt-1">
                {error instanceof Error ? error.message : "Une erreur inattendue est survenue."}
              </p>
            </CardContent>
          </Card>
        ) : !logements || logements.length === 0 ? (
          <Card className="border-0 shadow-premium"><CardContent className="py-12 text-center text-muted-foreground">Aucun logement. <Button asChild variant="link" className="text-accent"><Link to="/bailleur/logements/nouveau">Ajouter un logement</Link></Button></CardContent></Card>
        ) : (
          <div className="space-y-4">
            {logements.map(l => (
              <Card key={l.id} className="border-0 shadow-premium">
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="font-serif font-bold text-lg">{l.nom}</h3>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-3.5 w-3.5" /> {l.adresse}, {l.ville}</div>
                      <p className="text-sm text-muted-foreground mt-1">{(l as any).chambres?.length || 0} chambre(s) • {l.type}</p>
                    </div>
                    <Badge variant={l.statut === "valide" ? "default" : l.statut === "rejete" ? "destructive" : "secondary"}>
                      {l.statut === "valide" ? "Validé" : l.statut === "rejete" ? "Rejeté" : "En attente"}
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

export default BailleurLogements;
