import { useState } from "react";
import { invalidateGroups } from "@/lib/invalidate-helpers";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminReservations,
  getAdminReservationStats,
  getStatusConfig,
  validerReservationAdmin,
  refuserReservationAdmin,
  updateAdminReservationStatus,
} from "@/services/reservation-service";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PaginationControls } from "@/components/ui/PaginationControls";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  Phone,
  Mail,
  User,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { fr } from "date-fns/locale";

const STATUS_TABS = [
  { value: "en_attente", label: "En attente", stat: "en_attente" },
  { value: "confirmee_paiement_en_attente", label: "Paiement 24h", stat: "confirmee_paiement_en_attente" },
  { value: "payee", label: "Payées", stat: "payee" },
  { value: "refusee", label: "Refusées", stat: "refusee" },
  { value: "expiree", label: "Expirées", stat: "expiree" },
  { value: "annulee", label: "Annulées", stat: "annulee" },
] as const;

const AdminReservations = () => {
  const { toast } = useToast();
  const qc = useQueryClient();

  const [tab, setTab] = useState<string>("en_attente");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Modale de refus avec motif obligatoire
  const [refusalDialog, setRefusalDialog] = useState<{ open: boolean; reservationId: string | null }>({
    open: false,
    reservationId: null,
  });
  const [motifRefus, setMotifRefus] = useState("");

  const { data: reservationsData, isLoading, isError, error } = useQuery({
    queryKey: ["admin-reservations", page, pageSize, tab],
    queryFn: () => getAdminReservations({ page, pageSize, statusFilter: tab }),
  });

  const { data: stats } = useQuery({
    queryKey: ["admin-reservations-stats"],
    queryFn: getAdminReservationStats,
  });

  const reservations = reservationsData?.data || [];

  // Mutation pour valider la réservation et ouvrir la fenêtre de 24h
  const validerMutation = useMutation({
    mutationFn: (id: string) => validerReservationAdmin(id),
    onSuccess: async () => {
      await invalidateGroups(qc, ["RESERVATION_CHANGED"]);
      qc.invalidateQueries({ queryKey: ["admin-reservations"] });
      qc.invalidateQueries({ queryKey: ["admin-reservations-stats"] });
      toast({
        title: "Réservation validée ✅",
        description: "Le délai de paiement de 24h a démarré. L'utilisateur a été notifié.",
      });
    },
    onError: (err: any) =>
      toast({ title: "Erreur de validation", description: err.message, variant: "destructive" }),
  });

  // Mutation pour refuser la réservation avec un motif
  const refuserMutation = useMutation({
    mutationFn: ({ id, motif }: { id: string; motif: string }) => refuserReservationAdmin(id, motif),
    onSuccess: async () => {
      await invalidateGroups(qc, ["RESERVATION_CHANGED"]);
      qc.invalidateQueries({ queryKey: ["admin-reservations"] });
      qc.invalidateQueries({ queryKey: ["admin-reservations-stats"] });
      toast({
        title: "Réservation refusée",
        description: "Le motif a été enregistré et notifié à l'utilisateur.",
      });
      setRefusalDialog({ open: false, reservationId: null });
      setMotifRefus("");
    },
    onError: (err: any) =>
      toast({ title: "Erreur lors du refus", description: err.message, variant: "destructive" }),
  });

  // Mutation pour annulation simple
  const annulerMutation = useMutation({
    mutationFn: (id: string) => {
      const r = reservations.find((item) => item.id === id);
      return updateAdminReservationStatus(id, "annulee", r?.chambre_id);
    },
    onSuccess: async () => {
      await invalidateGroups(qc, ["RESERVATION_CHANGED"]);
      qc.invalidateQueries({ queryKey: ["admin-reservations"] });
      qc.invalidateQueries({ queryKey: ["admin-reservations-stats"] });
      toast({ title: "Réservation annulée ✅" });
    },
    onError: (err: any) =>
      toast({ title: "Erreur", description: err.message, variant: "destructive" }),
  });

  const handleTabChange = (value: string) => {
    setTab(value);
    setPage(1);
  };

  const handleOpenRefusal = (id: string) => {
    setRefusalDialog({ open: true, reservationId: id });
    setMotifRefus("");
  };

  const handleConfirmRefusal = () => {
    if (!motifRefus.trim()) {
      toast({
        title: "Motif obligatoire",
        description: "Veuillez préciser la raison du refus (ex: logement complet auprès du propriétaire).",
        variant: "destructive",
      });
      return;
    }
    if (refusalDialog.reservationId) {
      refuserMutation.mutate({
        id: refusalDialog.reservationId,
        motif: motifRefus.trim(),
      });
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-3 p-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      );
    }

    if (isError) {
      return (
        <div className="p-8 text-center" role="alert">
          <AlertCircle className="h-8 w-8 mx-auto mb-3 text-destructive opacity-60" />
          <p className="font-medium">Impossible de charger les réservations.</p>
          <p className="text-sm text-muted-foreground mt-1">
            {error instanceof Error ? error.message : "Erreur inattendue."}
          </p>
        </div>
      );
    }

    if (reservations.length === 0) {
      return <p className="text-center py-12 text-muted-foreground">Aucune réservation dans cet onglet</p>;
    }

    return (
      <>
        <div className="space-y-4">
          {reservations.map((r) => {
            const statusConfig = getStatusConfig(r.statut);
            const isPendingValidation =
              r.statut === "en_attente" || r.statut === "en_attente_confirmation";
            const isPaymentPending = r.statut === "confirmee_paiement_en_attente";
            const isExpired = r.statut === "expiree";
            const isRefused = r.statut === "refusee";
            const isPaid = r.statut === "payee" || r.statut === "confirmee";

            // Calcul du temps restant pour paiement
            let tempsRestant = null;
            if (isPaymentPending && r.date_expiration) {
              const expDate = new Date(r.date_expiration);
              if (expDate > new Date()) {
                tempsRestant = formatDistanceToNow(expDate, { locale: fr, addSuffix: true });
              } else {
                tempsRestant = "Expiré il y a peu";
              }
            }

            return (
              <Card key={r.id} className="border-0 shadow-premium overflow-hidden">
                <CardContent className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-serif font-bold text-base md:text-lg">{r.logements?.nom}</p>
                      <Badge className={statusConfig.colorClass} variant={statusConfig.variant}>
                        {statusConfig.label}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={
                          r.type_reservation === "collectif" || r.chambres?.mode_reservation === "collectif"
                            ? "border-purple-300 text-purple-700 bg-purple-50 dark:text-purple-400"
                            : "border-blue-300 text-blue-700 bg-blue-50 dark:text-blue-400"
                        }
                      >
                        {r.type_reservation === "collectif" || r.chambres?.mode_reservation === "collectif"
                          ? "Groupe (Collectif)"
                          : "Individuel"}
                      </Badge>
                      <Badge variant="secondary" className="font-semibold">
                        {r.nombre_places || 1} place(s){r.chambres?.nombre_personnes ? ` / ${r.chambres.nombre_personnes}` : ""}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      Unité : <strong>{r.chambres?.nom}</strong>
                      {r.chambres?.tarification_par_personne && (
                        <span className="text-xs text-accent font-medium ml-2">
                          (Tarif par personne)
                        </span>
                      )}
                    </p>

                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      Du {new Date(r.date_debut).toLocaleDateString("fr-FR")}
                      {r.date_fin ? ` au ${new Date(r.date_fin).toLocaleDateString("fr-FR")}` : ""}
                    </p>

                    {/* Bloc Coordonnées Propriétaire (Exclusif Admin pour vérifier la disponibilité) */}
                    {r.proprietaire ? (
                      <div className="mt-3 p-3 rounded-lg bg-accent/5 border border-accent/20 text-xs space-y-1">
                        <div className="flex items-center gap-1.5 font-semibold text-accent">
                          <User className="h-3.5 w-3.5" /> Propriétaire : {r.proprietaire.prenom} {r.proprietaire.nom}
                        </div>
                        <div className="flex items-center gap-4 flex-wrap text-muted-foreground pt-0.5">
                          <a
                            href={`tel:${r.proprietaire.telephone}`}
                            className="inline-flex items-center gap-1 text-foreground hover:text-accent font-medium underline"
                          >
                            <Phone className="h-3 w-3 text-accent" /> {r.proprietaire.telephone}
                          </a>
                          {r.proprietaire.email && (
                            <a
                              href={`mailto:${r.proprietaire.email}`}
                              className="inline-flex items-center gap-1 hover:text-accent"
                            >
                              <Mail className="h-3 w-3" /> {r.proprietaire.email}
                            </a>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2 text-xs text-muted-foreground italic">
                        Propriétaire : Informations non renseignées
                      </div>
                    )}

                    {/* Bloc Délai de paiement ou motif de refus */}
                    {isPaymentPending && (
                      <div className="flex items-center gap-2 text-xs font-medium text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400 p-2 rounded-md">
                        <Clock className="h-3.5 w-3.5 shrink-0" />
                        <span>
                          Délai de paiement (24h) : Expire {tempsRestant}{" "}
                          {r.date_expiration && `(${format(new Date(r.date_expiration), "dd/MM/yyyy HH:mm")})`}
                        </span>
                      </div>
                    )}

                    {isRefused && r.motif_refus && (
                      <div className="flex items-start gap-2 text-xs font-medium text-destructive bg-destructive/10 p-2.5 rounded-md">
                        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                        <div>
                          <strong>Motif du refus transmis à l'étudiant :</strong>
                          <p className="mt-0.5 text-foreground">{r.motif_refus}</p>
                        </div>
                      </div>
                    )}

                    {isExpired && (
                      <div className="text-xs text-muted-foreground italic">
                        Délai de paiement de 24h dépassé. Chambre remise à disposition.
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-3 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0">
                    <p className="font-bold text-accent font-ui text-lg">
                      {r.montant_total?.toLocaleString()} FCFA
                    </p>

                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Actions pour réservation en attente */}
                      {isPendingValidation && (
                        <>
                          <Button
                            size="sm"
                            className="bg-gradient-gold text-accent-foreground gap-1.5 shadow-sm"
                            disabled={validerMutation.isPending}
                            onClick={() => validerMutation.mutate(r.id)}
                          >
                            <CheckCircle className="h-3.5 w-3.5" />
                            Valider (Ouvre 24h)
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive border-destructive/30 hover:bg-destructive/10 gap-1.5"
                            disabled={refuserMutation.isPending}
                            onClick={() => handleOpenRefusal(r.id)}
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            Refuser
                          </Button>
                        </>
                      )}

                      {/* Pour réservation confirmée paiement en attente */}
                      {isPaymentPending && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive"
                          disabled={annulerMutation.isPending}
                          onClick={() => annulerMutation.mutate(r.id)}
                        >
                          Annuler
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {reservationsData && reservationsData.pagination.totalPages > 1 && (
          <div className="border-t mt-4">
            <PaginationControls
              currentPage={reservationsData.pagination.page}
              totalPages={reservationsData.pagination.totalPages}
              pageSize={reservationsData.pagination.pageSize}
              totalItems={reservationsData.pagination.total}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
              isLoading={isLoading}
            />
          </div>
        )}
      </>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-serif text-2xl font-bold">Gestion des réservations</h1>
          <p className="text-muted-foreground text-sm">
            {stats?.all ?? "-"} réservation(s) au total • Vérifiez auprès du propriétaire avant de valider
          </p>
        </div>

        <Tabs value={tab} onValueChange={handleTabChange}>
          <div className="overflow-x-auto pb-1">
            <TabsList className="w-full sm:w-auto inline-flex">
              {STATUS_TABS.map((t) => (
                <TabsTrigger key={t.value} value={t.value} className="text-xs sm:text-sm">
                  {t.label} ({stats?.[t.stat as keyof typeof stats] ?? "…"})
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {STATUS_TABS.map((t) => (
            <TabsContent key={t.value} value={t.value} className="mt-4">
              {renderContent()}
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* DIALOG DE REFUS AVEC MOTIF OBLIGATOIRE */}
      <Dialog
        open={refusalDialog.open}
        onOpenChange={(open) => !open && setRefusalDialog({ open: false, reservationId: null })}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg flex items-center gap-2 text-destructive">
              <XCircle className="h-5 w-5" /> Refuser la réservation
            </DialogTitle>
            <DialogDescription>
              Veuillez indiquer un motif clair. Ce motif sera directement communiqué à l'étudiant pour expliquer pourquoi sa réservation ne peut être acceptée.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <Label htmlFor="motif-refus">Motif du refus *</Label>
            <Textarea
              id="motif-refus"
              placeholder="Ex: Logement déjà attribué par le propriétaire, dates non disponibles, ou conditions non remplies..."
              value={motifRefus}
              onChange={(e) => setMotifRefus(e.target.value)}
              rows={4}
              required
            />
            <p className="text-xs text-muted-foreground">
              Le paiement restera inaccessible pour cette réservation.
            </p>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setRefusalDialog({ open: false, reservationId: null })}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmRefusal}
              disabled={!motifRefus.trim() || refuserMutation.isPending}
            >
              {refuserMutation.isPending ? "Enregistrement..." : "Confirmer le refus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AdminReservations;
