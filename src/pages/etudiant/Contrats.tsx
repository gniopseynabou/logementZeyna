import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { getStudentContracts } from "@/services/contract-service";
import {
  getStudentRenewals,
  requestContractRenewal,
  studentRespondToTariff,
} from "@/services/contract-renewal-service";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FileText,
  Download,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Bell,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { generateContratClientHTML } from "@/lib/contract-templates";
import { format, differenceInDays, addMonths, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

const EtudiantContrats = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Dialogue de demande de renouvellement
  const [renewalDialog, setRenewalDialog] = useState<{
    open: boolean;
    contract: any | null;
  }>({ open: false, contract: null });

  const [dateFinSouhaitee, setDateFinSouhaitee] = useState("");
  const [commentaireEtudiant, setCommentaireEtudiant] = useState("");

  // 1. Contrats de l'étudiant
  const {
    data: contrats,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["etudiant-contrats", user?.id],
    queryFn: () => getStudentContracts(user!.id),
    enabled: !!user?.id,
  });

  // 2. Demandes de renouvellement de l'étudiant
  const { data: renewals } = useQuery({
    queryKey: ["etudiant-renouvellements", user?.id],
    queryFn: () => getStudentRenewals(user!.id),
    enabled: !!user?.id,
  });

  // 3. Rappels reçus par l'étudiant
  const { data: rappels } = useQuery({
    queryKey: ["etudiant-contrat-rappels", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error: err } = await supabase
        .from("contrat_rappels")
        .select("*")
        .eq("etudiant_id", user.id)
        .order("created_at", { ascending: false });
      if (err) return [];
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Mutation pour créer une demande de renouvellement
  const createRenewalMutation = useMutation({
    mutationFn: async () => {
      if (!renewalDialog.contract || !user?.id) return;
      if (!dateFinSouhaitee) {
        throw new Error("Veuillez sélectionner la nouvelle date de fin souhaitée.");
      }
      return await requestContractRenewal({
        contrat_id: renewalDialog.contract.id,
        etudiant_id: user.id,
        date_fin_souhaitee: dateFinSouhaitee,
        commentaire_etudiant: commentaireEtudiant.trim() || undefined,
      });
    },
    onSuccess: () => {
      toast({
        title: "Demande envoyée",
        description:
          "Votre demande de renouvellement a été transmise à l'administration Zeyna. Nous vérifions la disponibilité auprès du propriétaire.",
      });
      queryClient.invalidateQueries({ queryKey: ["etudiant-renouvellements"] });
      queryClient.invalidateQueries({ queryKey: ["etudiant-contrats"] });
      setRenewalDialog({ open: false, contract: null });
      setDateFinSouhaitee("");
      setCommentaireEtudiant("");
    },
    onError: (err: any) => {
      toast({
        title: "Erreur",
        description: err.message || "Impossible de soumettre la demande.",
        variant: "destructive",
      });
    },
  });

  // Mutation pour répondre à une proposition de tarif
  const respondTariffMutation = useMutation({
    mutationFn: async ({ renewalId, accept }: { renewalId: string; accept: boolean }) => {
      return await studentRespondToTariff({ renewalId, accept });
    },
    onSuccess: (_, variables) => {
      toast({
        title: variables.accept ? "Proposition acceptée" : "Proposition déclinée",
        description: variables.accept
          ? "Vous avez accepté le tarif ajusté. L'administration va finaliser votre renouvellement."
          : "Vous avez décliné le tarif proposé.",
      });
      queryClient.invalidateQueries({ queryKey: ["etudiant-renouvellements"] });
      queryClient.invalidateQueries({ queryKey: ["etudiant-contrats"] });
    },
    onError: (err: any) => {
      toast({
        title: "Erreur",
        description: err.message || "Impossible d'enregistrer votre réponse.",
        variant: "destructive",
      });
    },
  });

  const downloadContract = (contrat: any) => {
    const content = contrat.contenu as any;
    const res = (contrat as any).reservations;
    const logNom = res?.logements?.nom || content?.logement || "N/A";
    const chNom = res?.chambres?.nom || content?.chambre || "N/A";
    const montant = content?.montant || 0;
    const ref = content?.reference || "N/A";
    const date = content?.date
      ? new Date(content.date).toLocaleDateString("fr-FR")
      : new Date(contrat.created_at).toLocaleDateString("fr-FR");

    const htmlContent = generateContratClientHTML({
      refContrat: ref,
      dateEmission: date,
      client: {
        prenom: profile?.prenom || "",
        nom: profile?.nom || "",
        telephone: profile?.telephone,
      },
      logement: {
        nom: logNom,
        adresse: res?.logements?.adresse || "N/A",
        ville: res?.logements?.ville || "Saint-Louis",
        type: res?.logements?.type || "Non spécifié",
      },
      chambre: {
        nom: chNom,
        nombre_personnes: res?.chambres?.nombre_personnes,
        prix_zeyna: res?.chambres?.prix_zeyna,
      },
      caution: montant,
      dateDebut: res?.date_debut ? new Date(res.date_debut).toLocaleDateString("fr-FR") : date,
    });

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
      };
    }
  };

  const openRenewalModal = (c: any) => {
    // Proposer par défaut une date à +10 mois après l'échéance actuelle
    const currentEnd = c.date_fin ? new Date(c.date_fin) : new Date();
    const defaultNewEnd = addMonths(currentEnd, 10);
    setDateFinSouhaitee(format(defaultNewEnd, "yyyy-MM-dd"));
    setCommentaireEtudiant("");
    setRenewalDialog({ open: true, contract: c });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-serif text-2xl font-bold">Mes contrats</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Consultez vos contrats de location, téléchargez vos documents et gérez vos renouvellements de bail.
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-32 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        ) : isError ? (
          <Card className="border-0 shadow-premium" role="alert">
            <CardContent className="py-12 text-center">
              <p>Impossible de charger vos contrats.</p>
              <p className="text-sm text-muted-foreground mt-1">
                {error instanceof Error ? error.message : "Une erreur inattendue est survenue."}
              </p>
            </CardContent>
          </Card>
        ) : !contrats || contrats.length === 0 ? (
          <Card className="border-0 shadow-premium">
            <CardContent className="py-12 text-center text-muted-foreground">
              <FileText className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
              <p>Aucun contrat disponible pour le moment.</p>
              <p className="text-xs text-muted-foreground mt-1">
                Un contrat est généré automatiquement dès confirmation de la réservation et de la caution.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-5">
            {contrats.map((c: any) => {
              const res = c.reservations;
              const content = c.contenu as any;
              const logNom = res?.logements?.nom || content?.logement || "Logement";
              const chNom = res?.chambres?.nom || content?.chambre || "Chambre";
              const ref = content?.reference || c.id.slice(0, 8).toUpperCase();
              const dateDebut = c.date_debut
                ? format(new Date(c.date_debut), "dd MMM yyyy", { locale: fr })
                : null;
              const dateFin = c.date_fin
                ? format(new Date(c.date_fin), "dd MMM yyyy", { locale: fr })
                : null;

              const daysRemaining = c.date_fin
                ? differenceInDays(new Date(c.date_fin), new Date())
                : null;

              // Statut visuel de l'échéance
              let statusBadge = (
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                  Contrat actif
                </Badge>
              );
              if (c.statut_contrat === "renouvele") {
                statusBadge = (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    Renouvelé
                  </Badge>
                );
              } else if (daysRemaining !== null && daysRemaining < 0) {
                statusBadge = (
                  <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-300">
                    Échu ({Math.abs(daysRemaining)} j)
                  </Badge>
                );
              } else if (daysRemaining !== null && daysRemaining <= 30) {
                statusBadge = (
                  <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-300 font-medium">
                    <Clock className="h-3 w-3 mr-1 text-amber-600 inline" />
                    Échéance dans {daysRemaining} j
                  </Badge>
                );
              }

              // Chercher les renouvellements liés
              const contractRenewals = (renewals || []).filter((r: any) => r.contrat_id === c.id);
              const latestRenewal = contractRenewals[0];

              // Chercher les rappels reçus pour ce contrat
              const contractRappels = (rappels || []).filter((rp: any) => rp.contrat_id === c.id);
              const latestRappel = contractRappels[0];

              const hasPendingRenewal =
                latestRenewal &&
                ["en_attente", "propose_tarif_modifie", "accepte_par_etudiant"].includes(
                  latestRenewal.statut
                );

              return (
                <Card key={c.id} className="border-0 shadow-premium overflow-hidden">
                  <CardContent className="p-5 sm:p-6 space-y-4">
                    {/* En-tête de la carte */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-border/60">
                      <div className="flex items-start gap-3.5 min-w-0">
                        <div className="p-3 bg-primary/10 rounded-xl shrink-0 mt-0.5">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-serif font-bold text-base truncate">{logNom}</h3>
                            {statusBadge}
                          </div>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {chNom} {res?.logements?.ville ? `· ${res.logements.ville}` : ""}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Réf : <span className="font-mono font-medium">{ref}</span> · Émis le{" "}
                            {format(new Date(c.created_at), "dd/MM/yyyy", { locale: fr })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadContract(c)}
                        >
                          <Download className="h-4 w-4 mr-1.5" /> Télécharger (PDF)
                        </Button>

                        {!hasPendingRenewal && (
                          <Button
                            size="sm"
                            className="bg-primary text-white hover:bg-primary/95"
                            onClick={() => openRenewalModal(c)}
                          >
                            <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Renouveler
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Détails de la période et tarif */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm bg-muted/30 p-3.5 rounded-xl">
                      <div>
                        <span className="text-xs text-muted-foreground block">Période du bail</span>
                        <div className="font-medium flex items-center gap-1.5 mt-0.5">
                          <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span>
                            {dateDebut || "Début non spécifié"} → {dateFin || "Fin non spécifiée"}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground block">Loyer mensuel</span>
                        <span className="font-semibold text-primary mt-0.5 block">
                          {(c.loyer_mensuel || res?.chambres?.prix_zeyna || 0).toLocaleString()} FCFA / mois
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground block">Caution enregistrée</span>
                        <span className="font-medium text-foreground mt-0.5 block">
                          {(content?.montant || res?.chambres?.caution || 0).toLocaleString()} FCFA
                        </span>
                      </div>
                    </div>

                    {/* Rappel récent envoyé par l'administrateur */}
                    {latestRappel && (
                      <div className="p-3.5 bg-amber-50 border border-amber-200/80 rounded-xl text-amber-950 text-sm flex items-start gap-3">
                        <Bell className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                        <div className="space-y-1">
                          <p className="font-semibold text-xs text-amber-900">
                            Rappel reçu de l'équipe Zeyna :
                          </p>
                          <p className="text-xs text-amber-900 whitespace-pre-line">
                            {latestRappel.message}
                          </p>
                          <p className="text-[11px] text-amber-700">
                            Reçu le{" "}
                            {format(new Date(latestRappel.created_at), "dd/MM/yyyy à HH:mm", {
                              locale: fr,
                            })}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Suivi des demandes de renouvellement */}
                    {latestRenewal && (
                      <div className="space-y-3 pt-1">
                        {/* 1. En attente de vérification admin */}
                        {latestRenewal.statut === "en_attente" && (
                          <div className="p-3.5 bg-sky-50 border border-sky-200 rounded-xl text-sky-900 text-sm flex items-start gap-3">
                            <Clock className="h-4 w-4 text-sky-600 mt-0.5 shrink-0" />
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-semibold text-xs text-sky-950 uppercase tracking-wider">
                                  Demande de renouvellement en attente
                                </span>
                                <Badge variant="outline" className="bg-sky-100 text-sky-800 border-sky-300">
                                  En cours d'examen
                                </Badge>
                              </div>
                              <p className="text-xs text-sky-900">
                                Prolongation souhaitée jusqu'au{" "}
                                <span className="font-bold">
                                  {latestRenewal.nouvelle_date_fin
                                    ? format(new Date(latestRenewal.nouvelle_date_fin), "dd MMMM yyyy", {
                                        locale: fr,
                                      })
                                    : "-"}
                                </span>
                                . L'équipe Zeyna vérifie actuellement la disponibilité auprès du propriétaire.
                              </p>
                            </div>
                          </div>
                        )}

                        {/* 2. Proposition de tarif modifié par l'admin (soumis à validation) */}
                        {latestRenewal.statut === "propose_tarif_modifie" && (
                          <div className="p-4 bg-amber-50/70 border-2 border-amber-300 rounded-xl text-amber-950 space-y-3">
                            <div className="flex items-start gap-2.5">
                              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <h4 className="font-serif font-bold text-sm text-amber-950">
                                  Proposition de renouvellement avec tarif ajusté
                                </h4>
                                <p className="text-xs text-amber-900 mt-0.5">
                                  L'administrateur a validé la disponibilité du logement sous réserve d'une révision du tarif.
                                  Votre accord explicite est nécessaire pour finaliser le renouvellement.
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-white/70 p-3 rounded-lg border border-amber-200">
                              <div>
                                <span className="text-muted-foreground block">Tarif précédent</span>
                                <span className="font-semibold line-through text-muted-foreground">
                                  {(latestRenewal.tarif_precedent || 0).toLocaleString()} FCFA / mois
                                </span>
                              </div>
                              <div>
                                <span className="text-amber-800 block font-medium">Nouveau tarif proposé</span>
                                <span className="font-bold text-base text-amber-700">
                                  {(latestRenewal.nouveau_tarif_propose || 0).toLocaleString()} FCFA / mois
                                </span>
                              </div>
                              {latestRenewal.motif_modification_tarif && (
                                <div className="sm:col-span-2 pt-2 border-t border-amber-100">
                                  <span className="text-muted-foreground block font-medium">
                                    Motif communiqué par l'administration :
                                  </span>
                                  <p className="mt-0.5 text-foreground italic">
                                    « {latestRenewal.motif_modification_tarif} »
                                  </p>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-1">
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                                disabled={respondTariffMutation.isPending}
                                onClick={() =>
                                  respondTariffMutation.mutate({
                                    renewalId: latestRenewal.id,
                                    accept: false,
                                  })
                                }
                              >
                                <X className="h-4 w-4 mr-1" /> Refuser ce tarif
                              </Button>
                              <Button
                                size="sm"
                                className="bg-emerald-600 text-white hover:bg-emerald-700"
                                disabled={respondTariffMutation.isPending}
                                onClick={() =>
                                  respondTariffMutation.mutate({
                                    renewalId: latestRenewal.id,
                                    accept: true,
                                  })
                                }
                              >
                                <Check className="h-4 w-4 mr-1" /> Accepter le nouveau tarif
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* 3. Accepté par l'étudiant, en attente de finalisation admin */}
                        {latestRenewal.statut === "accepte_par_etudiant" && (
                          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-sm flex items-center gap-3">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                            <div className="flex-1 text-xs">
                              <span className="font-semibold block">Vous avez accepté le nouveau tarif</span>
                              <span>
                                ({latestRenewal.nouveau_tarif_propose?.toLocaleString()} FCFA / mois). L'administration
                                Zeyna finalise actuellement le dossier.
                              </span>
                            </div>
                          </div>
                        )}

                        {/* 4. Refusé par l'étudiant */}
                        {latestRenewal.statut === "refuse_par_etudiant" && (
                          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs flex items-center gap-2.5">
                            <XCircle className="h-4 w-4 text-slate-500 shrink-0" />
                            <span>
                              Vous avez décliné la proposition de tarif ajusté. Le bail prendra fin à sa date d'échéance initiale.
                            </span>
                          </div>
                        )}

                        {/* 5. Refusé par l'admin */}
                        {latestRenewal.statut === "refuse" && (
                          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-900 text-sm space-y-1">
                            <div className="flex items-center gap-2">
                              <XCircle className="h-4 w-4 text-red-600 shrink-0" />
                              <span className="font-semibold text-xs uppercase tracking-wider text-red-950">
                                Demande de renouvellement non retenue
                              </span>
                            </div>
                            {latestRenewal.motif_refus && (
                              <p className="text-xs text-red-800 pl-6">
                                Motif : <span className="italic">{latestRenewal.motif_refus}</span>
                              </p>
                            )}
                          </div>
                        )}

                        {/* 6. Renouvellement validé */}
                        {latestRenewal.statut === "valide" && (
                          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs flex items-center gap-2.5">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                            <span>
                              Renouvellement validé jusqu'au{" "}
                              <span className="font-bold">
                                {latestRenewal.nouvelle_date_fin
                                  ? format(new Date(latestRenewal.nouvelle_date_fin), "dd MMMM yyyy", {
                                      locale: fr,
                                    })
                                  : "-"}
                              </span>
                              . Loyer appliqué : {(latestRenewal.nouveau_tarif_propose || latestRenewal.tarif_precedent || 0).toLocaleString()} FCFA/mois.
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Dialogue de demande de renouvellement */}
      <Dialog
        open={renewalDialog.open}
        onOpenChange={(open) => {
          if (!open) setRenewalDialog({ open: false, contract: null });
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-primary" /> Demander un renouvellement
            </DialogTitle>
            <DialogDescription>
              Indiquez la nouvelle date de fin souhaitée pour votre bail. Notre équipe contactera le propriétaire pour
              confirmer la disponibilité du logement.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="p-3 bg-muted/40 rounded-xl text-xs space-y-1">
              <p className="font-medium text-foreground">
                {renewalDialog.contract?.reservations?.logements?.nom || "Logement"}
              </p>
              <p className="text-muted-foreground">
                Échéance actuelle :{" "}
                <span className="font-medium text-foreground">
                  {renewalDialog.contract?.date_fin
                    ? format(new Date(renewalDialog.contract.date_fin), "dd MMMM yyyy", { locale: fr })
                    : "Non spécifiée"}
                </span>
              </p>
              <p className="text-muted-foreground">
                Loyer actuel :{" "}
                <span className="font-semibold text-primary">
                  {(
                    renewalDialog.contract?.loyer_mensuel ||
                    renewalDialog.contract?.reservations?.chambres?.prix_zeyna ||
                    0
                  ).toLocaleString()}{" "}
                  FCFA / mois
                </span>
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="date_fin" className="text-xs font-semibold">
                Nouvelle date de fin souhaitée <span className="text-red-500">*</span>
              </Label>
              <Input
                id="date_fin"
                type="date"
                value={dateFinSouhaitee}
                onChange={(e) => setDateFinSouhaitee(e.target.value)}
                min={
                  renewalDialog.contract?.date_fin
                    ? format(new Date(renewalDialog.contract.date_fin), "yyyy-MM-dd")
                    : format(new Date(), "yyyy-MM-dd")
                }
              />
              <p className="text-[11px] text-muted-foreground">
                Généralement calculée pour une année universitaire supplémentaire (+10 à +12 mois).
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="commentaire" className="text-xs">
                Remarque ou précision particulière (facultatif)
              </Label>
              <Textarea
                id="commentaire"
                rows={3}
                placeholder="Ex : Je poursuis mon Master 2 à l'UGB l'année prochaine..."
                value={commentaireEtudiant}
                onChange={(e) => setCommentaireEtudiant(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              disabled={createRenewalMutation.isPending}
              onClick={() => setRenewalDialog({ open: false, contract: null })}
            >
              Annuler
            </Button>
            <Button
              disabled={createRenewalMutation.isPending || !dateFinSouhaitee}
              onClick={() => createRenewalMutation.mutate()}
            >
              {createRenewalMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Envoyer la demande
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default EtudiantContrats;
