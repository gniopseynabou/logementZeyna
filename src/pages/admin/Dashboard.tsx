import { useQuery } from "@tanstack/react-query";
import { getAdminDashboardStats } from "@/services/admin-dashboard-service";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { SectionHeader } from "@/components/ui/section-header";
import { DataCard, DataCardHeader, DataCardTitle, DataCardOverline, DataCardContent } from "@/components/ui/data-card";
import { MetricDisplay } from "@/components/ui/metric-display";
import { StatusBadge } from "@/components/ui/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Building,
  Users,
  BookOpen,
  TrendingUp,
  Percent,
  Home,
  CreditCard,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FileCheck2,
  SlidersHorizontal,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const AdminDashboard = () => {
  const { data: stats, isLoading, isError, error } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: getAdminDashboardStats,
  });

  const totalEnAttente =
    (stats?.logEnAttente || 0) +
    (stats?.bailleursEnAttente || 0) +
    (stats?.resEnAttente || 0);

  return (
    <DashboardLayout>
      <div className="space-y-7 max-w-7xl mx-auto">
        {/* ── En-tête architectural ── */}
        <SectionHeader
          overline="Supervision Opérationnelle · Saint-Louis & UGB"
          title="Registre de Pilotage Général"
          subtitle="Suivi des agréments bailleurs, occupation des résidences et flux de trésorerie Zeyna."
          actions={
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-muted text-[11px] font-ui font-medium text-muted-foreground border border-border">
                <span className="w-1.5 h-1.5 rounded-full bg-malachite animate-pulse-or" />
                Système synchro
              </span>
              <Button asChild size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm font-ui text-xs uppercase tracking-wider font-semibold">
                <Link to="/admin/logements/nouveau">
                  + Nouveau Logement
                </Link>
              </Button>
            </div>
          }
        />

        {isLoading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-44 rounded-md border border-border bg-card p-5 shadow-premium">
                  <Skeleton className="h-3.5 w-24 mb-4" />
                  <Skeleton className="h-10 w-44 mb-3" />
                  <Skeleton className="h-3 w-56" />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-64 rounded-md border border-border bg-card p-6 shadow-premium">
                <Skeleton className="h-5 w-40 mb-4" />
                <Skeleton className="h-20 w-full mb-4" />
                <Skeleton className="h-12 w-full" />
              </div>
              <div className="h-64 rounded-md border border-border bg-card p-6 shadow-premium">
                <Skeleton className="h-5 w-40 mb-4" />
                <Skeleton className="h-10 w-full mb-3" />
                <Skeleton className="h-10 w-full mb-3" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </div>
        ) : isError ? (
          <DataCard accentLeft className="p-8 text-center border-destructive/30">
            <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-3" />
            <h3 className="font-serif text-lg font-semibold text-foreground mb-1">
              Interruption de synchronisation des données
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {error instanceof Error ? error.message : "Impossible de charger les métriques du registre administratif."}
            </p>
          </DataCard>
        ) : (
          <>
            {/* ── Bandeau d'actions urgentes (si dossiers en attente) ── */}
            {totalEnAttente > 0 && (
              <div className="relative overflow-hidden rounded-md border border-warning/30 bg-warning/5 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-sm bg-warning/15 text-warning shrink-0 mt-0.5">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-ui text-xs uppercase font-bold tracking-wider text-warning">
                      Dossiers nécessitant un arbitrage immédiat ({totalEnAttente})
                    </h4>
                    <p className="text-xs text-foreground/80 mt-0.5">
                      {stats?.logEnAttente || 0} logement(s) à vérifier · {stats?.bailleursEnAttente || 0} bailleur(s) en attente de conformité · {stats?.resEnAttente || 0} réservation(s) à valider.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {(stats?.logEnAttente || 0) > 0 && (
                    <Button asChild size="sm" variant="outline" className="h-8 rounded-sm text-xs font-ui uppercase tracking-wider border-warning/40 text-foreground hover:bg-warning/10">
                      <Link to="/admin/logements">Auditer Logements</Link>
                    </Button>
                  )}
                  {(stats?.bailleursEnAttente || 0) > 0 && (
                    <Button asChild size="sm" variant="outline" className="h-8 rounded-sm text-xs font-ui uppercase tracking-wider border-warning/40 text-foreground hover:bg-warning/10">
                      <Link to="/admin/bailleurs">Vérifier Bailleurs</Link>
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* ── Triptyque des métriques maîtresses ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Carte 1 : Recettes & Encaissés */}
              <Link to="/admin/paiements" className="block group">
                <DataCard accentTop interactive className="h-full">
                  <div className="flex items-center justify-between mb-3">
                    <DataCardOverline>Trésorerie Encaissée</DataCardOverline>
                    <div className="p-1.5 rounded-sm bg-accent/10 text-accent group-hover:scale-105 transition-premium">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                  </div>
                  <MetricDisplay
                    label=""
                    value={(stats?.revenus || 0).toLocaleString("fr-FR")}
                    unit="FCFA"
                    size="xl"
                    highlighted
                    description="Total des encaissements (cautions, loyers, commissions) tracés."
                  />
                  <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground font-ui">
                    <span>Voir registre financier</span>
                    <ArrowRight className="h-3 w-3 text-accent group-hover:translate-x-1 transition-premium" />
                  </div>
                </DataCard>
              </Link>

              {/* Carte 2 : Jauge d'Occupation Résidentielle */}
              <DataCard accentLeft className="h-full">
                <div className="flex items-center justify-between mb-2">
                  <DataCardOverline>Tension Résidentielle</DataCardOverline>
                  <StatusBadge
                    status={((stats?.tauxOccupation || 0) > 80 ? "valide" : "en_attente")}
                    label={`${stats?.tauxOccupation || 0}% occupé`}
                    size="xs"
                  />
                </div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="font-mono text-3xl font-bold text-foreground">
                    {stats?.chambresOccupees || 0}
                  </span>
                  <span className="font-ui text-xs text-muted-foreground uppercase tracking-wider">
                    / {stats?.totalChambres || 0} unités sous contrat
                  </span>
                </div>

                {/* Jauge bicolore sur-mesure */}
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden my-3">
                  <div
                    className="bg-accent h-full rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${Math.min(100, Math.max(0, stats?.tauxOccupation || 0))}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-muted-foreground font-ui">
                  <span>Unités libres : <strong className="text-malachite font-mono">{(stats?.totalChambres || 0) - (stats?.chambresOccupees || 0)}</strong></span>
                  <span>Baux actifs : <strong className="text-foreground font-mono">{stats?.resConfirmees || 0}</strong></span>
                </div>
              </DataCard>

              {/* Carte 3 : Acteurs & Résidences Actives */}
              <Link to="/admin/logements" className="block group">
                <DataCard interactive className="h-full">
                  <div className="flex items-center justify-between mb-3">
                    <DataCardOverline>Parc & Partenaires</DataCardOverline>
                    <div className="p-1.5 rounded-sm bg-muted text-foreground group-hover:scale-105 transition-premium">
                      <Building className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 my-2">
                    <div>
                      <span className="text-[10px] font-ui uppercase tracking-wider text-muted-foreground block">
                        Résidences
                      </span>
                      <span className="font-mono text-2xl font-bold text-foreground">
                        {stats?.logValides || 0}
                      </span>
                      <span className="text-[10px] text-muted-foreground block mt-0.5">
                        +{stats?.logEnAttente || 0} en revue
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-ui uppercase tracking-wider text-muted-foreground block">
                        Bailleurs agréés
                      </span>
                      <span className="font-mono text-2xl font-bold text-foreground">
                        {stats?.bailleursValides || 0}
                      </span>
                      <span className="text-[10px] text-muted-foreground block mt-0.5">
                        +{stats?.bailleursEnAttente || 0} dossiers
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground font-ui">
                    <span>Parcourir l'inventaire</span>
                    <ArrowRight className="h-3 w-3 text-accent group-hover:translate-x-1 transition-premium" />
                  </div>
                </DataCard>
              </Link>
            </div>

            {/* ── Deuxième rangée : Flux de pilotage & Hub d'arbitrage ── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Colonne gauche (7 col) : Pilotage des flux opérationnels */}
              <div className="lg:col-span-7 space-y-4">
                <DataCard noPadding>
                  <div className="p-5 border-b border-border/60 flex items-center justify-between">
                    <div>
                      <DataCardOverline>Opérations en temps réel</DataCardOverline>
                      <DataCardTitle>Ventilation des Entités Zeyna</DataCardTitle>
                    </div>
                    <span className="text-xs text-muted-foreground font-ui">
                      Dernier audit : aujourd'hui
                    </span>
                  </div>

                  <div className="divide-y divide-border/50">
                    {/* Ligne Logements */}
                    <div className="p-4 sm:p-5 flex items-center justify-between hover:bg-muted/30 transition-premium">
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-sm bg-muted flex items-center justify-center text-primary shrink-0">
                          <Building className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-serif text-sm font-semibold text-foreground">
                            Patrimoine Immobilier
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {stats?.totalLogements || 0} résidences répertoriées ({stats?.logValides || 0} certifiées conformes)
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {(stats?.logEnAttente || 0) > 0 ? (
                          <StatusBadge status="en_attente" label={`${stats?.logEnAttente} en attente`} size="xs" />
                        ) : (
                          <StatusBadge status="valide" label="À jour" size="xs" />
                        )}
                        <Button asChild variant="ghost" size="sm" className="h-8 px-2 text-xs font-ui text-accent hover:text-accent">
                          <Link to="/admin/logements">Gérer</Link>
                        </Button>
                      </div>
                    </div>

                    {/* Ligne Réservations */}
                    <div className="p-4 sm:p-5 flex items-center justify-between hover:bg-muted/30 transition-premium">
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-sm bg-accent/10 flex items-center justify-center text-accent shrink-0">
                          <BookOpen className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-serif text-sm font-semibold text-foreground">
                            Baux & Réservations Étudiantes
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {stats?.totalReservations || 0} dossiers traités au total
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {(stats?.resEnAttente || 0) > 0 ? (
                          <StatusBadge status="en_attente" label={`${stats?.resEnAttente} à bloquer`} size="xs" />
                        ) : (
                          <StatusBadge status="confirmee" label="Flot régulé" size="xs" />
                        )}
                        <Button asChild variant="ghost" size="sm" className="h-8 px-2 text-xs font-ui text-accent hover:text-accent">
                          <Link to="/admin/reservations">Gérer</Link>
                        </Button>
                      </div>
                    </div>

                    {/* Ligne Bailleurs */}
                    <div className="p-4 sm:p-5 flex items-center justify-between hover:bg-muted/30 transition-premium">
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-sm bg-muted flex items-center justify-center text-primary shrink-0">
                          <Users className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-serif text-sm font-semibold text-foreground">
                            Réseau des Propriétaires Bailleurs
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {stats?.totalBailleurs || 0} bailleurs enregistrés à Saint-Louis
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {(stats?.bailleursEnAttente || 0) > 0 ? (
                          <StatusBadge status="en_attente" label={`${stats?.bailleursEnAttente} à certifier`} size="xs" />
                        ) : (
                          <StatusBadge status="valide" label="Conforme" size="xs" />
                        )}
                        <Button asChild variant="ghost" size="sm" className="h-8 px-2 text-xs font-ui text-accent hover:text-accent">
                          <Link to="/admin/bailleurs">Gérer</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </DataCard>
              </div>

              {/* Colonne droite (5 col) : Centre de Décision & Raccourcis Stratégiques */}
              <div className="lg:col-span-5 space-y-4">
                <DataCard accentTop>
                  <DataCardHeader separator>
                    <div>
                      <DataCardOverline>Raccourcis Réglementaires</DataCardOverline>
                      <DataCardTitle>Modules de Gestion Dédiés</DataCardTitle>
                    </div>
                  </DataCardHeader>

                  <div className="space-y-2">
                    <Button
                      asChild
                      variant="outline"
                      className="w-full justify-between h-11 rounded-sm border-border hover:border-accent hover:bg-muted/50 transition-premium text-xs font-ui uppercase tracking-wider font-semibold"
                    >
                      <Link to="/admin/tarifs">
                        <span className="flex items-center gap-2">
                          <SlidersHorizontal className="h-4 w-4 text-accent" />
                          Politique Tarifaire & Marges
                        </span>
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                      </Link>
                    </Button>

                    <Button
                      asChild
                      variant="outline"
                      className="w-full justify-between h-11 rounded-sm border-border hover:border-accent hover:bg-muted/50 transition-premium text-xs font-ui uppercase tracking-wider font-semibold"
                    >
                      <Link to="/admin/reversements">
                        <span className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-malachite" />
                          Reversements Bailleurs
                        </span>
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                      </Link>
                    </Button>

                    <Button
                      asChild
                      variant="outline"
                      className="w-full justify-between h-11 rounded-sm border-border hover:border-accent hover:bg-muted/50 transition-premium text-xs font-ui uppercase tracking-wider font-semibold"
                    >
                      <Link to="/admin/documents">
                        <span className="flex items-center gap-2">
                          <FileCheck2 className="h-4 w-4 text-primary" />
                          Registre & Documents Légaux
                        </span>
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                      </Link>
                    </Button>

                    <Button
                      asChild
                      variant="outline"
                      className="w-full justify-between h-11 rounded-sm border-border hover:border-accent hover:bg-muted/50 transition-premium text-xs font-ui uppercase tracking-wider font-semibold"
                    >
                      <Link to="/admin/incidents">
                        <span className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-destructive" />
                          Registre des Incidents & Réclamations
                        </span>
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                      </Link>
                    </Button>
                  </div>

                  <div className="mt-5 p-3.5 rounded-sm bg-muted/40 border border-border/70 text-xs text-muted-foreground flex items-center gap-2.5">
                    <ShieldCheck className="h-4 w-4 text-accent shrink-0" />
                    <span>
                      Toute modification sur les prix ou les cautions génère une écriture d'audit inaltérable.
                    </span>
                  </div>
                </DataCard>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
