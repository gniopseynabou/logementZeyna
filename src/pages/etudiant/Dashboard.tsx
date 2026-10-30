import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { getStudentDashboardReservations } from "@/services/reservation-service";
import { getStudentDashboardPayments } from "@/services/payment-service";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { SectionHeader } from "@/components/ui/section-header";
import { DataCard, DataCardHeader, DataCardTitle, DataCardOverline } from "@/components/ui/data-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen,
  CreditCard,
  Home,
  MapPin,
  AlertCircle,
  ArrowRight,
  FileText,
  ShieldCheck,
  Calendar,
  Clock,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const EtudiantDashboard = () => {
  const { user, profile } = useAuth();

  const {
    data: reservations,
    isLoading: loadingReservations,
    isError: reservationsFailed,
  } = useQuery({
    queryKey: ["etudiant-reservations", user?.id],
    queryFn: () => getStudentDashboardReservations(user!.id),
    enabled: !!user,
  });

  const {
    data: paiements,
    isLoading: loadingPaiements,
    isError: paiementsFailed,
  } = useQuery({
    queryKey: ["etudiant-paiements", user?.id],
    queryFn: () => getStudentDashboardPayments(user!.id),
    enabled: !!user,
  });

  const reservationActive = reservations?.find((r) => r.statut === "confirmee");
  const reservationsEnAttente = reservations?.filter((r) => r.statut === "en_attente") || [];

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-6xl mx-auto">
        {/* ── En-tête personnel ── */}
        <SectionHeader
          overline="Résidence Universitaire Gaston Berger"
          title={
            <span>
              Bienvenue, <span className="font-normal italic text-accent">{profile?.prenom || "Étudiant"}</span>
            </span>
          }
          subtitle="Suivez votre hébergement, vos quittances officielles et vos baux étudiants à Saint-Louis."
          actions={
            <Button asChild variant="outline" size="sm" className="rounded-sm font-ui text-xs uppercase tracking-wider border-border hover:border-accent">
              <Link to="/logements">Explorer le répertoire</Link>
            </Button>
          }
        />

        {/* ── Alerte Prioritaire : Réservations en attente de règlement ── */}
        {reservationsEnAttente.length > 0 && (
          <div className="rounded-md border border-warning/40 bg-warning/5 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-sm bg-warning/15 text-warning shrink-0 mt-0.5">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-ui text-xs uppercase font-bold tracking-wider text-warning">
                  Caution requise pour garantir votre chambre
                </h4>
                <p className="text-xs text-foreground/85 mt-0.5">
                  Vous avez {reservationsEnAttente.length} réservation(s) en attente. Réglez la caution pour bloquer définitivement votre place avant réattribution.
                </p>
              </div>
            </div>
            <Button asChild size="sm" className="bg-warning hover:bg-warning/90 text-white rounded-sm shrink-0 font-ui text-xs uppercase tracking-wider font-semibold">
              <Link to={`/etudiant/paiement/${reservationsEnAttente[0].id}`}>
                Régler la caution <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Link>
            </Button>
          </div>
        )}

        {/* ── Situation Résidentielle Centrale ── */}
        {loadingReservations ? (
          <div className="h-72 rounded-md border border-border bg-card p-6 shadow-premium">
            <Skeleton className="h-4 w-32 mb-4" />
            <Skeleton className="h-8 w-72 mb-2" />
            <Skeleton className="h-4 w-48 mb-8" />
            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-border">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        ) : reservationActive ? (
          /* Carte d'excellence : Logement sous contrat actif */
          <div className="relative overflow-hidden rounded-md border border-border bg-card shadow-elevated accent-line-left">
            <div className="grid grid-cols-1 lg:grid-cols-12">
              {/* Corps informatif (8 col) */}
              <div className="lg:col-span-8 p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="overline text-accent">Votre Foyer Actuel</span>
                    <StatusBadge status="confirmee" label="Bail Actif & Sécurisé" size="xs" />
                  </div>

                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
                    {(reservationActive as any).logements?.nom || "Résidence Universitaire Zeyna"}
                  </h2>

                  <div className="flex items-center gap-1.5 text-muted-foreground text-xs sm:text-sm mt-2">
                    <MapPin className="h-4 w-4 text-accent shrink-0" />
                    <span>
                      {(reservationActive as any).logements?.adresse}, {(reservationActive as any).logements?.ville}
                    </span>
                  </div>
                </div>

                {/* Métadonnées de l'unité */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 pt-6 mt-6 border-t border-border/60">
                  <div>
                    <span className="overline text-[10px] block">Unité Attribuée</span>
                    <span className="font-serif text-base font-semibold text-foreground">
                      {(reservationActive as any).chambres?.nom || "Chambre"}
                    </span>
                  </div>
                  <div>
                    <span className="overline text-[10px] block">Loyer Mensuel</span>
                    <div className="flex items-baseline gap-1">
                      <span className="font-mono text-lg font-bold text-accent">
                        {((reservationActive as any).chambres?.prix_zeyna || 0).toLocaleString("fr-FR")}
                      </span>
                      <span className="font-ui text-xs text-muted-foreground">FCFA</span>
                    </div>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <span className="overline text-[10px] block">Caution Gardée</span>
                    <div className="flex items-baseline gap-1">
                      <span className="font-mono text-sm font-semibold text-foreground">
                        {((reservationActive as any).chambres?.caution || 0).toLocaleString("fr-FR")}
                      </span>
                      <span className="font-ui text-xs text-muted-foreground">FCFA</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Panneau d'action rapide & intendance (4 col) */}
              <div className="lg:col-span-4 bg-muted/25 p-6 sm:p-8 border-t lg:border-t-0 lg:border-l border-border/60 flex flex-col justify-between">
                <div>
                  <h3 className="overline text-foreground mb-3">Intendance & Droits</h3>
                  <div className="space-y-2">
                    <Button
                      asChild
                      variant="outline"
                      className="w-full justify-between h-10 rounded-sm bg-card border-border hover:border-accent text-xs font-ui uppercase tracking-wider font-semibold"
                    >
                      <Link to="/etudiant/contrats">
                        <span className="flex items-center gap-2">
                          <FileText className="h-3.5 w-3.5 text-accent" />
                          Contrat de bail
                        </span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      </Link>
                    </Button>

                    <Button
                      asChild
                      variant="outline"
                      className="w-full justify-between h-10 rounded-sm bg-card border-border hover:border-accent text-xs font-ui uppercase tracking-wider font-semibold"
                    >
                      <Link to="/etudiant/incidents">
                        <span className="flex items-center gap-2">
                          <AlertCircle className="h-3.5 w-3.5 text-warning" />
                          Signaler un incident
                        </span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      </Link>
                    </Button>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-border/50 text-[11px] text-muted-foreground leading-relaxed flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-malachite shrink-0" />
                  <span>Votre caution est déposée sur compte séquestre certifié Zeyna.</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Carte d'accueil si pas de logement actif */
          <div className="rounded-md border border-border bg-card p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-premium accent-line-top">
            <div className="w-14 h-14 rounded-full bg-accent/10 text-accent flex items-center justify-center mx-auto mb-4">
              <Home className="h-7 w-7" />
            </div>
            <h2 className="font-serif text-2xl font-semibold text-foreground mb-2">
              Trouvez votre résidence pour l'année universitaire
            </h2>
            <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6 leading-relaxed">
              Zeyna certifie chaque logement à Sanar, Bango et Saint-Louis. Seule la caution bloque votre chambre, sans aucun intermédiaire informel.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-white rounded-sm font-ui text-xs uppercase tracking-wider font-semibold px-6">
                <Link to="/logements">
                  Explorer les chambres disponibles <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        )}

        {/* ── Deux colonnes asymétriques : Historique Baux & Quittances ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Colonne 1 : Registre des Réservations */}
          <DataCard noPadding>
            <div className="p-5 border-b border-border/60 flex items-center justify-between">
              <div>
                <DataCardOverline>Dossiers de Location</DataCardOverline>
                <DataCardTitle>Historique des Réservations</DataCardTitle>
              </div>
              <Button asChild variant="ghost" size="sm" className="text-accent hover:text-accent font-ui text-xs">
                <Link to="/etudiant/reservations">Tout voir</Link>
              </Button>
            </div>

            {loadingReservations ? (
              <div className="p-5 space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : !reservations || reservations.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-xs">
                Aucune réservation enregistrée à ce jour.
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {reservations.slice(0, 4).map((r) => (
                  <div key={r.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-premium">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-sm bg-muted flex items-center justify-center text-primary shrink-0">
                        <BookOpen className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-serif text-sm font-medium text-foreground truncate">
                          {(r as any).logements?.nom || "Résidence"}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                          {(r as any).chambres?.nom || "Chambre"}
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0 text-right ml-3">
                      <StatusBadge status={r.statut} size="xs" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DataCard>

          {/* Colonne 2 : Quittances & Paiements validés */}
          <DataCard noPadding>
            <div className="p-5 border-b border-border/60 flex items-center justify-between">
              <div>
                <DataCardOverline>Comptabilité Étudiante</DataCardOverline>
                <DataCardTitle>Dernières Quittances & Paiements</DataCardTitle>
              </div>
              <Button asChild variant="ghost" size="sm" className="text-accent hover:text-accent font-ui text-xs">
                <Link to="/etudiant/paiements">Historique</Link>
              </Button>
            </div>

            {loadingPaiements ? (
              <div className="p-5 space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : !paiements || paiements.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-xs">
                Aucun versement enregistré sur votre compte.
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {paiements.slice(0, 4).map((p) => (
                  <div key={p.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-premium">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-sm bg-malachite/10 text-malachite flex items-center justify-center shrink-0">
                        <CreditCard className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-serif text-sm font-medium text-foreground capitalize">
                          {p.methode.replace(/_/g, " ")}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {new Date(p.created_at).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="font-mono text-sm font-bold text-foreground">
                        {p.montant.toLocaleString("fr-FR")} F
                      </span>
                      <div className="mt-0.5">
                        <StatusBadge status="valide" label="Quittance émise" size="xs" showDot={false} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DataCard>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EtudiantDashboard;
