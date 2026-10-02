import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { getLandlordDashboardData } from "@/services/landlord-dashboard-service";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, CheckCircle, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const BailleurDashboard = () => {
  const { user, isValidated } = useAuth();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["bailleur-logements", user?.id],
    queryFn: () => getLandlordDashboardData(user!.id),
    enabled: !!user && isValidated,
  });

  if (!isValidated) {
    return (
      <DashboardLayout>
        <Card className="border-0 shadow-premium max-w-lg mx-auto mt-12">
          <CardContent className="py-12 text-center">
            <Clock className="h-12 w-12 text-accent mx-auto mb-4" />
            <h2 className="font-serif text-xl font-bold">Compte en attente de validation</h2>
            <p className="text-muted-foreground mt-2">Votre compte bailleur est en cours de vérification par l'équipe Zeyna. Vous serez notifié une fois validé.</p>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  const logements = data?.logements;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="font-serif text-2xl font-bold">Espace Bailleur</h1>
            <p className="text-muted-foreground">Gérez vos logements partenaires</p>
          </div>
          <Button asChild className="bg-gradient-gold text-accent-foreground w-full sm:w-auto"><Link to="/bailleur/logements/nouveau">+ Ajouter un logement</Link></Button>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <Card className="border-0 shadow-premium"><CardContent className="p-6 flex items-center gap-4"><div className="p-3 rounded-xl bg-muted text-primary"><Building className="h-5 w-5" /></div><div><p className="text-2xl font-bold font-ui">{isLoading || isError ? "—" : data?.totalLogements ?? 0}</p><p className="text-sm text-muted-foreground">Logements</p></div></CardContent></Card>
          <Card className="border-0 shadow-premium"><CardContent className="p-6 flex items-center gap-4"><div className="p-3 rounded-xl bg-muted text-green-600"><CheckCircle className="h-5 w-5" /></div><div><p className="text-2xl font-bold font-ui">{isLoading || isError ? "—" : data?.logementsValides ?? 0}</p><p className="text-sm text-muted-foreground">Validés</p></div></CardContent></Card>
          <Card className="border-0 shadow-premium"><CardContent className="p-6 flex items-center gap-4"><div className="p-3 rounded-xl bg-muted text-accent"><Clock className="h-5 w-5" /></div><div><p className="text-2xl font-bold font-ui">{isLoading || isError ? "—" : data?.logementsEnAttente ?? 0}</p><p className="text-sm text-muted-foreground">En attente</p></div></CardContent></Card>
        </div>

        <Card className="border-0 shadow-premium">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-serif">Mes logements</CardTitle>
            <Button asChild variant="outline" size="sm"><Link to="/bailleur/logements">Voir tout</Link></Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">{[1, 2, 3].map((item) => <div key={item} className="h-14 bg-muted animate-pulse rounded-lg" />)}</div>
            ) : isError ? (
              <div className="py-8 text-center" role="alert">
                <p>Impossible de charger vos logements.</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {error instanceof Error ? error.message : "Une erreur inattendue est survenue."}
                </p>
              </div>
            ) : !logements || logements.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Aucun logement ajouté</p>
                <Button asChild className="mt-4 bg-gradient-gold text-accent-foreground"><Link to="/bailleur/logements/nouveau">Ajouter un logement</Link></Button>
              </div>
            ) : (
              <div className="space-y-3">
                {logements.slice(0, 5).map(l => (
                  <div key={l.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">{l.nom}</p>
                      <p className="text-sm text-muted-foreground">{l.adresse}, {l.ville}</p>
                    </div>
                    <Badge variant={l.statut === "valide" ? "default" : l.statut === "rejete" ? "destructive" : "secondary"}>
                      {l.statut === "valide" ? "Validé" : l.statut === "rejete" ? "Rejeté" : "En attente"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default BailleurDashboard;
