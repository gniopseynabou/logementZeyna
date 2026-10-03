import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { getStudentDashboardReservations } from "@/services/reservation-service";
import { getStudentDashboardPayments } from "@/services/payment-service";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, CreditCard, Home, MapPin, AlertCircle, ArrowRight, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const EtudiantDashboard = () => {
  const { user, profile } = useAuth();

  const {
    data: reservations,
    isError: reservationsFailed,
  } = useQuery({
    queryKey: ["etudiant-reservations", user?.id],
    queryFn: () => getStudentDashboardReservations(user!.id),
    enabled: !!user,
  });

  const { data: paiements, isError: paiementsFailed } = useQuery({
    queryKey: ["etudiant-paiements", user?.id],
    queryFn: () => getStudentDashboardPayments(user!.id),
    enabled: !!user,
  });

  const reservationActive = reservations?.find(r => r.statut === "confirmee");
  const reservationsEnAttente = reservations?.filter(r => r.statut === "en_attente") || [];

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl">
        {/* En-tête */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground">
              Bonjour, {profile?.prenom || "Étudiant"}
            </h1>
            <p className="text-muted-foreground mt-1">Bienvenue dans votre espace résident.</p>
          </div>
          {reservationsEnAttente.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2 rounded-md flex items-center gap-2 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>Vous avez {reservationsEnAttente.length} réservation(s) en attente de paiement.</span>
            </div>
          )}
        </div>

        {/* Mon logement actuel (Si actif) */}
        {reservationActive ? (
          <Card className="border-0 shadow-premium overflow-hidden relative">
            <div className="absolute top-0 left-0 w-1 h-full bg-accent" />
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row">
                <div className="p-8 md:w-2/3 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold text-accent uppercase tracking-widest mb-2 block">Logement actuel</span>
                    <h2 className="font-serif text-2xl font-bold text-foreground mb-2">
                      {(reservationActive as any).logements?.nom || "Résidence Zeyna"}
                    </h2>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm mb-6">
                      <MapPin className="h-4 w-4 text-accent" />
                      {(reservationActive as any).logements?.adresse}, {(reservationActive as any).logements?.ville}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-6 border-t border-border/50">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Votre unité</p>
                      <p className="font-medium">{(reservationActive as any).chambres?.nom}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Loyer mensuel</p>
                      <p className="font-medium font-ui">{(reservationActive as any).chambres?.prix_zeyna?.toLocaleString() || "-"} F</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-muted/30 p-8 md:w-1/3 border-t md:border-t-0 md:border-l border-border/50 flex flex-col justify-center">
                  <div className="mb-6">
                    <p className="text-sm text-muted-foreground mb-2">Actions rapides</p>
                    <div className="space-y-2">
                      <Button asChild variant="outline" className="w-full justify-start text-foreground bg-background">
                        <Link to="/etudiant/contrats"><FileText className="h-4 w-4 mr-2 text-primary" /> Voir mon contrat</Link>
                      </Button>
                      <Button variant="outline" className="w-full justify-start text-foreground bg-background" disabled>
                        <AlertCircle className="h-4 w-4 mr-2 text-amber-500" /> Signaler un incident
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-0 shadow-premium bg-foreground text-background">
            <CardContent className="p-8 md:p-12 text-center">
              <Home className="h-12 w-12 text-accent mx-auto mb-6" />
              <h2 className="font-serif text-2xl font-bold mb-3">Vous n'avez pas encore de logement</h2>
              <p className="text-background/70 mb-8 max-w-md mx-auto">
                Explorez notre catalogue de logements vérifiés et trouvez la chambre idéale pour vos études à Saint-Louis.
              </p>
              <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-white border-0">
                <Link to="/logements">Trouver mon logement <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Dernières réservations */}
          <Card className="border-0 shadow-premium">
            <CardHeader className="border-b border-border/50 pb-4 flex flex-row items-center justify-between">
              <CardTitle className="font-serif text-lg">Vos réservations</CardTitle>
              <Button asChild variant="ghost" size="sm" className="text-accent hover:text-accent hover:bg-accent/10">
                <Link to="/etudiant/reservations">Voir tout</Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {!reservations || reservations.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  Aucune réservation effectuée.
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {reservations.slice(0, 4).map((r) => (
                    <div key={r.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center shrink-0">
                          <BookOpen className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{(r as any).logements?.nom || "Logement"}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{(r as any).chambres?.nom || "Chambre"}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-sm ${
                          r.statut === "confirmee" ? "bg-green-100 text-green-700" :
                          r.statut === "annulee" ? "bg-red-100 text-red-700" :
                          "bg-amber-100 text-amber-700"
                        }`}>
                          {r.statut}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Derniers paiements */}
          <Card className="border-0 shadow-premium">
            <CardHeader className="border-b border-border/50 pb-4 flex flex-row items-center justify-between">
              <CardTitle className="font-serif text-lg">Derniers paiements</CardTitle>
              <Button asChild variant="ghost" size="sm" className="text-accent hover:text-accent hover:bg-accent/10">
                <Link to="/etudiant/paiements">Historique</Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {!paiements || paiements.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  Aucun paiement récent.
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {paiements.slice(0, 4).map((p) => (
                    <div key={p.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center shrink-0">
                          <CreditCard className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm capitalize">{p.methode.replace(/_/g, " ")}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {new Date(p.created_at).toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold font-ui text-foreground">{p.montant.toLocaleString()} F</p>
                        <p className="text-[10px] uppercase tracking-wider font-bold text-green-600 mt-1">Confirmé</p>
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

export default EtudiantDashboard;
