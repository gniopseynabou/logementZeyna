import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { getLandlordDashboardData } from "@/services/landlord-dashboard-service";
import { getBailleurReversements } from "@/services/reversement-service";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, CheckCircle, Clock, Wallet, Banknote, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const BailleurDashboard = () => {
  const { user, isValidated, profile } = useAuth();

  const { data: logementsData, isLoading: loadingLogements } = useQuery({
    queryKey: ["bailleur-logements", user?.id],
    queryFn: () => getLandlordDashboardData(user!.id),
    enabled: !!user && isValidated,
  });

  const { data: reversements, isLoading: loadingReversements } = useQuery({
    queryKey: ["bailleur-reversements", user?.id],
    queryFn: () => getBailleurReversements(user!.id),
    enabled: !!user && isValidated,
  });

  if (!isValidated) {
    return (
      <DashboardLayout>
        <Card className="border-0 shadow-premium max-w-lg mx-auto mt-12 overflow-hidden">
          <div className="h-2 bg-accent w-full" />
          <CardContent className="py-16 text-center">
            <Clock className="h-16 w-16 text-accent mx-auto mb-6" />
            <h2 className="font-serif text-2xl font-bold mb-3">Compte en cours de vérification</h2>
            <p className="text-muted-foreground leading-relaxed">
              Votre compte bailleur partenaire est en cours d'examen par l'équipe Zeyna. Nous vous contacterons prochainement.
            </p>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  const logements = logementsData?.logements || [];
  
  // Calculer reversements
  const reversementsEnAttente = reversements?.filter(r => r.statut === "en_attente") || [];
  const reversementsTraites = reversements?.filter(r => r.statut === "traite") || [];
  
  const totalEnAttente = reversementsEnAttente.reduce((sum, r) => sum + r.montant, 0);
  const totalRecu = reversementsTraites.reduce((sum, r) => sum + r.montant, 0);

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border/50 pb-6">
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground">
              Espace Bailleur Partenaire
            </h1>
            <p className="text-muted-foreground mt-2">
              Bienvenue {profile?.prenom}, gérez vos logements et suivez vos revenus.
            </p>
          </div>
          <Button asChild className="bg-accent hover:bg-accent/90 text-white rounded-sm h-11 px-6">
            <Link to="/bailleur/logements/nouveau">+ Ajouter un bien</Link>
          </Button>
        </div>

        {/* Métriques clés */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-0 shadow-premium">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Total Biens</p>
                  <p className="text-3xl font-bold font-ui">{loadingLogements ? "-" : logementsData?.totalLogements ?? 0}</p>
                </div>
                <div className="p-3 bg-muted rounded-xl"><Building className="h-5 w-5 text-primary" /></div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-premium">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Validés & Actifs</p>
                  <p className="text-3xl font-bold font-ui text-green-600">{loadingLogements ? "-" : logementsData?.logementsValides ?? 0}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-xl"><CheckCircle className="h-5 w-5 text-green-600" /></div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-premium bg-foreground text-background">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-background/60 mb-1">À reverser</p>
                  <p className="text-3xl font-bold font-ui text-accent">{loadingReversements ? "-" : totalEnAttente.toLocaleString()}</p>
                  <p className="text-xs text-background/50 mt-1">FCFA en attente</p>
                </div>
                <div className="p-3 bg-background/10 rounded-xl"><Wallet className="h-5 w-5 text-accent" /></div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-premium">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Déjà perçu</p>
                  <p className="text-3xl font-bold font-ui">{loadingReversements ? "-" : totalRecu.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-1">FCFA versés par Zeyna</p>
                </div>
                <div className="p-3 bg-muted rounded-xl"><Banknote className="h-5 w-5 text-foreground" /></div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Reversements Récents */}
          <Card className="border-0 shadow-premium flex flex-col">
            <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle className="font-serif text-lg">Suivi des reversements</CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1">
              {!reversements || reversements.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Wallet className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                  <p>Aucun reversement généré pour le moment.</p>
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {reversements.slice(0, 5).map(r => (
                    <div key={r.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-lg shrink-0 ${r.statut === "traite" ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"}`}>
                          <Banknote className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Reversement</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {new Date(r.created_at).toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold font-ui text-foreground">{r.montant.toLocaleString()} F</p>
                        <p className={`text-[10px] uppercase tracking-wider font-bold mt-1 ${r.statut === "traite" ? "text-green-600" : "text-amber-600"}`}>
                          {r.statut === "traite" ? "Versé" : "En attente"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Logements Partenaires */}
          <Card className="border-0 shadow-premium flex flex-col">
            <CardHeader className="border-b border-border/50 pb-4 flex flex-row items-center justify-between">
              <CardTitle className="font-serif text-lg">Vos biens immobiliers</CardTitle>
              <Button asChild variant="ghost" size="sm" className="text-accent hover:text-accent hover:bg-accent/10">
                <Link to="/bailleur/logements">Voir tout <ArrowRight className="h-3 w-3 ml-1" /></Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0 flex-1">
              {!logements || logements.length === 0 ? (
                <div className="p-8 text-center">
                  <Building className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground mb-4">Vous n'avez pas encore confié de logement à Zeyna.</p>
                  <Button asChild variant="outline" size="sm"><Link to="/bailleur/logements/nouveau">Confier un bien</Link></Button>
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {logements.slice(0, 5).map(l => (
                    <div key={l.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                      <div className="min-w-0 pr-4">
                        <p className="font-medium text-sm truncate">{l.nom}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{l.adresse}, {l.ville}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-sm ${
                          l.statut === "valide" ? "bg-green-100 text-green-700" :
                          l.statut === "rejete" ? "bg-red-100 text-red-700" :
                          "bg-muted text-muted-foreground"
                        }`}>
                          {l.statut}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BailleurDashboard;
