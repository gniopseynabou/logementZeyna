import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { getStudentDashboardReservations } from "@/services/reservation-service";
import { getStudentDashboardPayments } from "@/services/payment-service";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, CreditCard, FileText, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const EtudiantDashboard = () => {
  const { user } = useAuth();

  const {
    data: reservations,
    isError: reservationsFailed,
    error: reservationsError,
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

  const stats = [
    { label: "Réservations", value: reservationsFailed ? "-" : reservations?.length || 0, icon: <BookOpen className="h-5 w-5" />, color: "text-primary" },
    { label: "Confirmées", value: reservationsFailed ? "-" : reservations?.filter(r => r.statut === "confirmee").length || 0, icon: <Home className="h-5 w-5" />, color: "text-green-600" },
    { label: "Paiements", value: paiementsFailed ? "-" : paiements?.length || 0, icon: <CreditCard className="h-5 w-5" />, color: "text-accent" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-serif text-2xl font-bold">Bienvenue dans votre espace</h1>
          <p className="text-muted-foreground">Gérez vos réservations et paiements</p>
          {(reservationsFailed || paiementsFailed) && (
            <p role="alert" className="text-sm text-destructive mt-2">
              {reservationsFailed && reservationsError instanceof Error
                ? `Erreur de chargement des réservations : ${reservationsError.message}`
                : "Certaines données du tableau de bord n’ont pas pu être chargées."}
            </p>
          )}
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          {stats.map((s) => (
            <Card key={s.label} className="border-0 shadow-premium">
              <CardContent className="p-6 flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-muted ${s.color}`}>{s.icon}</div>
                <div>
                  <p className="text-2xl font-bold font-ui">{s.value}</p>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent reservations */}
        <Card className="border-0 shadow-premium">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-serif">Dernières réservations</CardTitle>
            <Button asChild variant="outline" size="sm"><Link to="/etudiant/reservations">Voir tout</Link></Button>
          </CardHeader>
          <CardContent>
            {reservationsFailed ? (
              <div role="alert" className="text-center py-8 text-destructive">
                Impossible de charger vos réservations.
              </div>
            ) : !reservations || reservations.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Aucune réservation</p>
                <Button asChild className="mt-4 bg-gradient-gold text-accent-foreground"><Link to="/logements">Trouver un logement</Link></Button>
              </div>
            ) : (
              <div className="space-y-3">
                {reservations.slice(0, 5).map((r) => (
                  <div key={r.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">{(r as any).logements?.nom || "Logement"}</p>
                      <p className="text-sm text-muted-foreground">{(r as any).chambres?.nom || "Chambre"}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        r.statut === "confirmee" ? "bg-green-100 text-green-700" :
                        r.statut === "annulee" ? "bg-red-100 text-red-700" :
                        "bg-yellow-100 text-yellow-700"
                      }`}>
                        {r.statut === "confirmee" ? "Confirmée" : r.statut === "annulee" ? "Annulée" : "En attente"}
                      </span>
                      <p className="text-sm font-bold text-accent mt-1 font-ui">{r.montant_total.toLocaleString()} F</p>
                    </div>
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

export default EtudiantDashboard;
