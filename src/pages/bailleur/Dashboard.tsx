import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { getLandlordDashboardData } from "@/services/landlord-dashboard-service";
import { getBailleurReversements } from "@/services/reversement-service";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { SectionHeader } from "@/components/ui/section-header";
import { DataCard, DataCardHeader, DataCardTitle, DataCardOverline } from "@/components/ui/data-card";
import { MetricDisplay } from "@/components/ui/metric-display";
import { StatusBadge } from "@/components/ui/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Building,
  CheckCircle,
  Clock,
  Wallet,
  Banknote,
  ArrowRight,
  ShieldCheck,
  Plus,
  MapPin,
  FileText,
} from "lucide-react";
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

  // Écran d'attente d'agrément
  if (!isValidated) {
    return (
      <DashboardLayout>
        <div className="max-w-xl mx-auto mt-12">
          <DataCard accentTop className="p-8 sm:p-10 text-center shadow-elevated">
            <div className="w-16 h-16 rounded-full bg-accent/10 text-accent flex items-center justify-center mx-auto mb-5">
              <Clock className="h-8 w-8" />
            </div>
            <DataCardOverline className="text-accent mb-2">Agrément Partenaire en cours</DataCardOverline>
            <h2 className="font-serif text-2xl font-semibold text-foreground mb-3">
              Vérification de votre compte propriétaire
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              L'intendance Zeyna étudie vos coordonnées et documents de propriété pour garantir la transparence des baux étudiants. Vous recevrez une notification dès validation.
            </p>
            <div className="p-4 rounded-sm bg-muted/40 border border-border text-xs text-muted-foreground text-left space-y-1.5">
              <div className="flex items-center gap-2 text-foreground font-medium">
                <ShieldCheck className="h-4 w-4 text-malachite" />
                <span>Protocoles de sécurité Zeyna</span>
              </div>
              <p>Visite physique des locaux et signature de l'accord-cadre de gestion locative.</p>
            </div>
          </DataCard>
        </div>
      </DashboardLayout>
    );
  }

  const logements = logementsData?.logements || [];
  const reversementsEnAttente = reversements?.filter((r) => r.statut === "en_attente") || [];
  const reversementsTraites = reversements?.filter((r) => r.statut === "traite") || [];

  const totalEnAttente = reversementsEnAttente.reduce((sum, r) => sum + r.montant, 0);
  const totalRecu = reversementsTraites.reduce((sum, r) => sum + r.montant, 0);

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-6xl mx-auto">
        {/* ── En-tête architectural ── */}
        <SectionHeader
          overline="Gestion Locative Partenaire · Saint-Louis"
          title={
            <span>
              Portefeuille de <span className="font-normal italic text-accent">{profile?.prenom || "Propriétaire"}</span>
            </span>
          }
          subtitle="Suivez les reversements de loyers encaissés par Zeyna et l'occupation de vos résidences."
          actions={
            <Button asChild className="bg-accent hover:bg-accent/90 text-white rounded-sm font-ui text-xs uppercase tracking-wider font-semibold h-10 px-5 shadow-gold hover:shadow-none transition-premium">
              <Link to="/bailleur/logements/nouveau">
                <Plus className="h-4 w-4 mr-1.5" /> Confier un bien
              </Link>
            </Button>
          }
        />

        {/* ── Bloc Financier Maître : Trésorerie & Reversements ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Carte 1 : Fonds à reverser */}
          <DataCard accentTop className="p-6">
            <div className="flex items-center justify-between mb-4">
              <DataCardOverline>Prochaine Échéance de Virement</DataCardOverline>
              <div className="p-1.5 rounded-sm bg-accent/10 text-accent">
                <Wallet className="h-4 w-4" />
              </div>
            </div>
            <MetricDisplay
              label=""
              value={loadingReversements ? "..." : totalEnAttente.toLocaleString("fr-FR")}
              unit="FCFA"
              size="xl"
              highlighted
              description="Montants des loyers collectés auprès des étudiants, en préparation de reversement."
            />
            <div className="mt-5 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground font-ui">
              <span>{reversementsEnAttente.length} virement(s) programmé(s)</span>
              <StatusBadge status="en_attente" label="Compensé sous 48h" size="xs" />
            </div>
          </DataCard>

          {/* Carte 2 : Total déjà reversé */}
          <DataCard accentLeft className="p-6">
            <div className="flex items-center justify-between mb-4">
              <DataCardOverline>Historique de Versement</DataCardOverline>
              <div className="p-1.5 rounded-sm bg-malachite/10 text-malachite">
                <Banknote className="h-4 w-4" />
              </div>
            </div>
            <MetricDisplay
              label=""
              value={loadingReversements ? "..." : totalRecu.toLocaleString("fr-FR")}
              unit="FCFA"
              size="xl"
              description="Sommes nettes effectivement créditées sur votre compte bailleur."
            />
            <div className="mt-5 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground font-ui">
              <span>{reversementsTraites.length} reversement(s) acquitté(s)</span>
              <span className="text-malachite font-semibold flex items-center gap-1">
                <CheckCircle className="h-3 w-3" /> Traçabilité 100%
              </span>
            </div>
          </DataCard>
        </div>

        {/* ── Deux colonnes : Registre des Biens & Journal des Règlements ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Colonne gauche (7 col) : Biens Immobiliers Confiés */}
          <div className="lg:col-span-7">
            <DataCard noPadding>
              <div className="p-5 border-b border-border/60 flex items-center justify-between">
                <div>
                  <DataCardOverline>Patrimoine Déposé</DataCardOverline>
                  <DataCardTitle>Résidences & Chambres en Gestion</DataCardTitle>
                </div>
                <Button asChild variant="ghost" size="sm" className="text-accent hover:text-accent font-ui text-xs">
                  <Link to="/bailleur/logements">Voir l'inventaire ({logements.length})</Link>
                </Button>
              </div>

              {loadingLogements ? (
                <div className="p-5 space-y-3">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : logements.length === 0 ? (
                <div className="p-10 text-center">
                  <Building className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm mb-4">
                    Vous n'avez pas encore confié de logement à la gestion Zeyna.
                  </p>
                  <Button asChild size="sm" variant="outline" className="rounded-sm font-ui text-xs uppercase tracking-wider">
                    <Link to="/bailleur/logements/nouveau">Ajouter votre premier bien</Link>
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {logements.slice(0, 5).map((l) => (
                    <div key={l.id} className="p-4 sm:p-5 flex items-center justify-between hover:bg-muted/30 transition-premium">
                      <div className="min-w-0 pr-4">
                        <p className="font-serif text-sm font-semibold text-foreground truncate">
                          {l.nom}
                        </p>
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5 truncate">
                          <MapPin className="h-3 w-3 text-accent shrink-0" />
                          <span>{l.adresse}, {l.ville}</span>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <StatusBadge status={l.statut} size="xs" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </DataCard>
          </div>

          {/* Colonne droite (5 col) : Journal des Reversements */}
          <div className="lg:col-span-5">
            <DataCard noPadding>
              <div className="p-5 border-b border-border/60 flex items-center justify-between">
                <div>
                  <DataCardOverline>Registre Comptable</DataCardOverline>
                  <DataCardTitle>Journal des Virements</DataCardTitle>
                </div>
                <Button asChild variant="ghost" size="sm" className="text-accent hover:text-accent font-ui text-xs">
                  <Link to="/bailleur/paiements">Grand livre</Link>
                </Button>
              </div>

              {loadingReversements ? (
                <div className="p-5 space-y-3">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : !reversements || reversements.length === 0 ? (
                <div className="p-10 text-center text-muted-foreground text-xs">
                  Aucun mouvement de virement à ce jour.
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {reversements.slice(0, 5).map((r) => (
                    <div key={r.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-premium">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-sm bg-muted flex items-center justify-center text-foreground shrink-0">
                          <Banknote className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-mono text-xs font-semibold text-foreground">
                            {r.montant.toLocaleString("fr-FR")} FCFA
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {new Date(r.created_at).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "short",
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="shrink-0">
                        <StatusBadge status={r.statut} size="xs" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </DataCard>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BailleurDashboard;
