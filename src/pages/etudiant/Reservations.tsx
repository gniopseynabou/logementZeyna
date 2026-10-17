import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  cancelStudentReservation,
  getStudentReservations,
  getStatusConfig,
  verifierEtExpirerReservations,
} from "@/services/reservation-service";
import { invalidateEtudiantData, invalidateGroup } from "@/lib/invalidate-helpers";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import {
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  FileText,
  CreditCard,
  Ban,
  Hourglass,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { fr } from "date-fns/locale";

const EtudiantReservations = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: reservations, isLoading } = useQuery({
    queryKey: ["etudiant-reservations-full", user?.id],
    queryFn: async () => {
      // Expirer automatiquement si besoin
      await verifierEtExpirerReservations();
      return getStudentReservations(user!.id);
    },
    enabled: !!user,
  });

  const cancelMutation = useMutation({
    mutationFn: cancelStudentReservation,
    onSuccess: async () => {
      if (user?.id) await invalidateEtudiantData(qc, user.id);
      await invalidateGroup(qc, "RESERVATION_CHANGED");
      toast({
        title: "Réservation annulée ✅",
        description: "Votre réservation a été annulée.",
      });
    },
    onError: (err: any) => {
      toast({
        title: "Erreur lors de l'annulation",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="font-serif text-2xl font-bold">Mes réservations</h1>
            <p className="text-muted-foreground text-sm">
              Suivez l'état de validation et le paiement de vos demandes de logement
            </p>
          </div>
          <Button asChild className="bg-gradient-gold text-accent-foreground w-full sm:w-auto">
            <Link to="/logements">Trouver un logement</Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        ) : !reservations || reservations.length === 0 ? (
          <Card className="border-0 shadow-premium">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Vous n'avez pas encore de réservation</p>
              <Button asChild className="mt-4 bg-gradient-gold text-accent-foreground">
                <Link to="/logements">Explorer les logements</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {reservations.map((r: any) => {
              const statusConfig = getStatusConfig(r.statut);
              const isPendingConfirmation =
                r.statut === "en_attente_confirmation" || r.statut === "en_attente";
              const isPaymentPending = r.statut === "confirmee_paiement_en_attente";
              const isPaid = r.statut === "payee" || (r.statut === "confirmee" && !r.date_expiration);
              const isRefused = r.statut === "refusee";
              const isExpired = r.statut === "expiree";
              const isCancelled =
                r.statut === "annulee_utilisateur" || r.statut === "annulee";

              // Calcul du temps restant pour paiement
              let tempsRestant = null;
              let estExpireClient = false;
              if (isPaymentPending && r.date_expiration) {
                const expDate = new Date(r.date_expiration);
                if (expDate > new Date()) {
                  tempsRestant = formatDistanceToNow(expDate, { locale: fr, addSuffix: true });
                } else {
                  estExpireClient = true;
                }
              }

              return (
                <Card key={r.id} className="border-0 shadow-premium overflow-hidden">
                  <CardContent className="p-5">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Détails du logement */}
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-serif font-bold text-lg">{r.logements?.nom}</h3>
                          <Badge className={statusConfig.colorClass} variant={statusConfig.variant}>
                            {statusConfig.label}
                          </Badge>
                        </div>

                        <p className="text-sm text-muted-foreground">
                          {r.chambres?.nom} • {r.logements?.adresse}
                        </p>

                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          Du {new Date(r.date_debut).toLocaleDateString("fr-FR")}
                          {r.date_fin && ` au ${new Date(r.date_fin).toLocaleDateString("fr-FR")}`}
                        </p>

                        {/* ÉTAT 1 : En attente de confirmation */}
                        {isPendingConfirmation && (
                          <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-800 dark:text-amber-300">
                            <Hourglass className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
                            <div>
                              <strong>Vérification en cours auprès du propriétaire</strong>
                              <p className="mt-0.5 text-muted-foreground">
                                Notre équipe contacte actuellement le propriétaire pour confirmer la disponibilité réelle du bien. Le paiement sera débloqué dès validation.
                              </p>
                            </div>
                          </div>
                        )}

                        {/* ÉTAT 2 : Confirmée — paiement en attente (délai 24h) */}
                        {isPaymentPending && !estExpireClient && (
                          <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs text-blue-800 dark:text-blue-300">
                            <Clock className="h-4 w-4 shrink-0 mt-0.5 text-blue-600 animate-pulse" />
                            <div>
                              <strong>Logement validé ! Délai de paiement : 24 heures</strong>
                              <p className="mt-0.5 text-muted-foreground">
                                Veuillez régler la caution pour sécuriser définitivement votre chambre (principe du premier arrivé, premier servi).
                                {r.date_expiration && (
                                  <span className="block font-semibold text-blue-700 dark:text-blue-300 mt-1">
                                    Expire {tempsRestant} (avant le {format(new Date(r.date_expiration), "dd MMMM yyyy à HH:mm", { locale: fr })})
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* ÉTAT 3 : Payée */}
                        {isPaid && (
                          <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs text-emerald-800 dark:text-emerald-300">
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                            <div>
                              <strong>Paiement confirmé ! Votre logement est réservé.</strong>
                              <p className="mt-0.5 text-muted-foreground">
                                Votre contrat de bail est prêt et accessible dans votre espace.
                              </p>
                            </div>
                          </div>
                        )}

                        {/* ÉTAT 4 : Refusée avec motif */}
                        {isRefused && (
                          <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-xs text-destructive">
                            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                            <div>
                              <strong>Réservation refusée</strong>
                              {r.motif_refus ? (
                                <p className="mt-1 text-foreground font-medium">
                                  Motif : {r.motif_refus}
                                </p>
                              ) : (
                                <p className="mt-0.5 text-muted-foreground">
                                  Le logement n'est plus disponible auprès du propriétaire.
                                </p>
                              )}
                              <p className="mt-1 text-xs text-muted-foreground">
                                Aucun paiement n'est possible pour cette réservation.
                              </p>
                            </div>
                          </div>
                        )}

                        {/* ÉTAT 5 : Expirée */}
                        {(isExpired || (isPaymentPending && estExpireClient)) && (
                          <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-800 dark:text-red-300">
                            <Ban className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
                            <div>
                              <strong>Délai de paiement de 24 heures dépassé</strong>
                              <p className="mt-0.5 text-muted-foreground">
                                Le paiement n'a pas été confirmé dans les 24h imparties. Le logement a été libéré pour d'autres locataires.
                              </p>
                            </div>
                          </div>
                        )}

                        {/* ÉTAT 6 : Annulée par l'utilisateur */}
                        {isCancelled && (
                          <p className="text-xs text-muted-foreground italic">
                            Cette réservation a été annulée.
                          </p>
                        )}
                      </div>

                      {/* Montant et Actions contextuelles */}
                      <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-3 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0">
                        <div className="text-left sm:text-right">
                          <span className="text-xs text-muted-foreground">Total à régler</span>
                          <p className="text-xl font-bold text-accent font-ui">
                            {r.montant_total.toLocaleString()} FCFA
                          </p>
                        </div>

                        <div className="flex gap-2 w-full sm:w-auto flex-wrap">
                          {/* Si confirmée et dans le délai de 24h : BOUTON PAYER DISPONIBLE */}
                          {isPaymentPending && !estExpireClient && (
                            <>
                              <Button
                                asChild
                                size="sm"
                                className="bg-gradient-gold text-accent-foreground flex-1 sm:flex-initial gap-1.5 shadow-sm"
                              >
                                <Link to={`/etudiant/paiement/${r.id}`}>
                                  <CreditCard className="h-4 w-4" /> Payer maintenant
                                </Link>
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-destructive flex-1 sm:flex-initial"
                                disabled={cancelMutation.isPending}
                                onClick={() => cancelMutation.mutate(r.id)}
                              >
                                Annuler
                              </Button>
                            </>
                          )}

                          {/* Si en attente de confirmation : PAS DE PAIEMENT, MAIS ANNULATION POSSIBLE */}
                          {isPendingConfirmation && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive flex-1 sm:flex-initial"
                              disabled={cancelMutation.isPending}
                              onClick={() => cancelMutation.mutate(r.id)}
                            >
                              Annuler ma demande
                            </Button>
                          )}

                          {/* Si payée : accès au contrat */}
                          {isPaid && (
                            <Button asChild size="sm" variant="outline" className="gap-1.5">
                              <Link to="/etudiant/contrats">
                                <FileText className="h-4 w-4 text-accent" /> Voir mon contrat
                              </Link>
                            </Button>
                          )}

                          {/* Si refusée ou expirée : lien vers catalogue */}
                          {(isRefused || isExpired || estExpireClient) && (
                            <Button asChild size="sm" variant="outline">
                              <Link to="/logements">Voir d'autres logements</Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default EtudiantReservations;
