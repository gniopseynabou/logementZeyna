import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getExpiringContracts,
  getAdminRenewals,
  sendContractReminder,
  adminRespondToRenewal,
  getContractFullHistory,
  ExpiringContract,
} from "@/services/contract-renewal-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useToast } from "@/hooks/use-toast";
import {
  Clock,
  Calendar,
  Phone,
  Mail,
  User,
  Send,
  AlertTriangle,
  CheckCircle,
  XCircle,
  History,
  RefreshCw,
  Bell,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { fr } from "date-fns/locale";

export const ContractRenewalManager = () => {
  const { toast } = useToast();
  const qc = useQueryClient();

  // Dialogue de rappel
  const [reminderDialog, setReminderDialog] = useState<{
    open: boolean;
    contract: ExpiringContract | null;
  }>({ open: false, contract: null });

  const [reminderMessage, setReminderMessage] = useState("");
  const [reminderCanal, setReminderCanal] = useState<"plateforme" | "whatsapp">("plateforme");

  // Dialogue de proposition de nouveau tarif
  const [tariffDialog, setTariffDialog] = useState<{
    open: boolean;
    renewal: any | null;
  }>({ open: false, renewal: null });
  const [nouveauTarif, setNouveauTarif] = useState<number>(0);
  const [motifTarif, setMotifTarif] = useState("");

  // Dialogue de refus de renouvellement
  const [refusalDialog, setRefusalDialog] = useState<{
    open: boolean;
    renewal: any | null;
  }>({ open: false, renewal: null });
  const [motifRefus, setMotifRefus] = useState("");

  // Dialogue d'historique de contrat
  const [historyDialog, setHistoryDialog] = useState<{
    open: boolean;
    contractId: string | null;
  }>({ open: false, contractId: null });

  // 1. Requête des contrats arrivant à échéance
  const { data: expiringContracts, isLoading: loadingExpiring } = useQuery({
    queryKey: ["admin-expiring-contracts"],
    queryFn: () => getExpiringContracts(30),
  });

  // 2. Requête des demandes de renouvellement
  const { data: renewals, isLoading: loadingRenewals } = useQuery({
    queryKey: ["admin-renewals"],
    queryFn: getAdminRenewals,
  });

  // 3. Requête d'historique complet
  const { data: fullHistory, isLoading: loadingHistory } = useQuery({
    queryKey: ["admin-contract-history", historyDialog.contractId],
    queryFn: () => getContractFullHistory(historyDialog.contractId!),
    enabled: !!historyDialog.contractId,
  });

  // Mutation d'envoi de rappel
  const sendReminderMutation = useMutation({
    mutationFn: sendContractReminder,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-expiring-contracts"] });
      toast({
        title: "Rappel enregistré ✅",
        description: "Le rappel a été enregistré dans l'historique et envoyé au locataire.",
      });
      setReminderDialog({ open: false, contract: null });
    },
    onError: (err: any) => {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    },
  });

  // Mutation de décision de renouvellement
  const renewalDecisionMutation = useMutation({
    mutationFn: adminRespondToRenewal,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-renewals"] });
      qc.invalidateQueries({ queryKey: ["admin-expiring-contracts"] });
      qc.invalidateQueries({ queryKey: ["admin-all-contrats"] });
      toast({ title: "Décision enregistrée avec succès ✅" });
      setTariffDialog({ open: false, renewal: null });
      setRefusalDialog({ open: false, renewal: null });
    },
    onError: (err: any) => {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    },
  });

  const handleOpenReminder = (contract: ExpiringContract) => {
    const studentName = contract.reservations?.profiles?.prenom || "Locataire";
    const logNom = contract.reservations?.logements?.nom || "votre logement";
    const dateFinStr = contract.date_fin
      ? format(new Date(contract.date_fin), "dd MMMM yyyy", { locale: fr })
      : "bientôt";

    const defaultMsg = `Bonjour ${studentName}, votre contrat de location pour ${logNom} arrive à échéance le ${dateFinStr}. Souhaitez-vous renouveler votre contrat pour l'année universitaire prochaine ? Merci de nous faire part de votre réponse sur la plateforme Les Logements de Zeyna.`;

    setReminderMessage(defaultMsg);
    setReminderDialog({ open: true, contract });
  };

  const handleConfirmSendReminder = () => {
    if (!reminderDialog.contract || !reminderMessage.trim()) return;

    sendReminderMutation.mutate({
      contratId: reminderDialog.contract.id,
      typeCanal: reminderCanal,
      message: reminderMessage.trim(),
    });

    // Si canal WhatsApp, ouvrir également le lien WhatsApp Web / app direct
    if (reminderCanal === "whatsapp") {
      const tel = reminderDialog.contract.reservations?.profiles?.telephone?.replace(/\s+/g, "");
      if (tel) {
        const url = `https://wa.me/${tel.replace("+", "")}?text=${encodeURIComponent(reminderMessage)}`;
        window.open(url, "_blank");
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* ── SECTION 1 : CONTRATS ARRIVANT À ÉCHÉANCE (≤ 30 JOURS) ── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-serif text-xl font-bold flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" />
              Contrats arrivant à échéance (30 jours)
            </h2>
            <p className="text-sm text-muted-foreground">
              Vérifiez la disponibilité auprès du propriétaire et envoyez un rappel manuel au locataire.
            </p>
          </div>
          <Badge variant="outline" className="self-start sm:self-auto bg-amber-50 text-amber-800 border-amber-300">
            {expiringContracts?.length || 0} contrat(s) concerné(s)
          </Badge>
        </div>

        {loadingExpiring ? (
          <div className="space-y-3">{[1, 2].map((i) => <div key={i} className="h-28 bg-muted animate-pulse rounded-xl" />)}</div>
        ) : !expiringContracts || expiringContracts.length === 0 ? (
          <Card className="border-0 shadow-premium">
            <CardContent className="py-8 text-center text-muted-foreground">
              <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
              <p>Aucun contrat n'arrive à échéance dans les 30 prochains jours.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {expiringContracts.map((c) => {
              const profile = c.reservations?.profiles;
              const proprio = c.proprietaire;
              const dateFin = c.date_fin ? new Date(c.date_fin) : null;
              const daysLeft = dateFin ? differenceInDays(dateFin, new Date()) : null;
              const hasReminder = (c.rappels && c.rappels.length > 0);
              const lastReminder = hasReminder ? c.rappels![0] : null;

              return (
                <Card key={c.id} className="border-0 shadow-premium overflow-hidden">
                  <CardContent className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-serif font-bold text-base md:text-lg">
                          {c.reservations?.logements?.nom || "Logement"}
                        </p>
                        <Badge variant="secondary">
                          Unité : {c.reservations?.chambres?.nom}
                        </Badge>
                        {daysLeft !== null && (
                          <Badge
                            className={
                              daysLeft < 0
                                ? "bg-red-500/10 text-red-700 border-red-300"
                                : daysLeft <= 15
                                ? "bg-amber-500/10 text-amber-700 border-amber-300"
                                : "bg-blue-500/10 text-blue-700 border-blue-300"
                            }
                          >
                            {daysLeft < 0 ? `Échéance dépassée (${Math.abs(daysLeft)}j)` : `Échéance dans ${daysLeft} jour(s)`}
                          </Badge>
                        )}
                      </div>

                      {/* Info locataire */}
                      <p className="text-sm text-foreground flex items-center gap-2">
                        <User className="h-4 w-4 text-accent" />
                        Locataire : <strong>{profile ? `${profile.prenom} ${profile.nom}` : "Non renseigné"}</strong>
                        {profile?.telephone && (
                          <a href={`tel:${profile.telephone}`} className="text-muted-foreground hover:text-accent ml-1 text-xs underline">
                            ({profile.telephone})
                          </a>
                        )}
                      </p>

                      {/* Période & loyer */}
                      <p className="text-xs text-muted-foreground flex items-center gap-3">
                        <span>
                          <Calendar className="h-3.5 w-3.5 inline mr-1" />
                          Période : Du {c.date_debut ? new Date(c.date_debut).toLocaleDateString("fr-FR") : "-"} au <strong>{dateFin ? dateFin.toLocaleDateString("fr-FR") : "-"}</strong>
                        </span>
                        <span>• Loyer : {c.loyer_mensuel?.toLocaleString() || "-"} FCFA/mois</span>
                      </p>

                      {/* Contact Propriétaire (Usage interne admin pour vérifier la disponibilité) */}
                      {proprio && (
                        <div className="mt-2 p-2.5 bg-accent/5 rounded-lg border border-accent/20 text-xs flex items-center gap-3 flex-wrap">
                          <span className="font-semibold text-accent">Contact Propriétaire :</span>
                          <span>{proprio.prenom} {proprio.nom}</span>
                          <a href={`tel:${proprio.telephone}`} className="inline-flex items-center gap-1 text-foreground hover:text-accent font-medium underline">
                            <Phone className="h-3 w-3 text-accent" /> {proprio.telephone}
                          </a>
                        </div>
                      )}

                      {/* Indicateur de rappel existant pour éviter les doublons (Section 6.1) */}
                      <div className="pt-1">
                        {hasReminder ? (
                          <div className="inline-flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 p-1.5 rounded border border-emerald-200">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                            <span>
                              Rappel envoyé le {format(new Date(lastReminder!.date_rappel), "dd/MM/yyyy à HH:mm")} ({c.rappels!.length} rappel(s) au total)
                            </span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 dark:bg-amber-950/40 p-1.5 rounded border border-amber-200">
                            <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                            <span>Aucun rappel envoyé pour le moment</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions d'envoi et historique */}
                    <div className="flex sm:flex-col gap-2 shrink-0 justify-end">
                      <Button
                        size="sm"
                        className="bg-gradient-gold text-accent-foreground gap-1.5 shadow-sm"
                        onClick={() => handleOpenReminder(c)}
                      >
                        <Send className="h-3.5 w-3.5" />
                        {hasReminder ? "Envoyer un nouveau rappel" : "Envoyer un rappel"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5"
                        onClick={() => setHistoryDialog({ open: true, contractId: c.id })}
                      >
                        <History className="h-3.5 w-3.5 text-muted-foreground" />
                        Historique complet
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* ── SECTION 2 : DEMANDES DE RENOUVELLEMENT DE CONTRAT ── */}
      <div className="space-y-4 pt-4 border-t">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-serif text-xl font-bold flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-accent" />
              Demandes de renouvellement reçues
            </h2>
            <p className="text-sm text-muted-foreground">
              Les étudiants demandent à prolonger leur séjour. Vérifiez auprès du propriétaire avant de décider.
            </p>
          </div>
          <Badge variant="outline" className="self-start sm:self-auto bg-blue-50 text-blue-800 border-blue-300">
            {renewals?.length || 0} demande(s)
          </Badge>
        </div>

        {loadingRenewals ? (
          <div className="space-y-3">{[1, 2].map((i) => <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />)}</div>
        ) : !renewals || renewals.length === 0 ? (
          <Card className="border-0 shadow-premium">
            <CardContent className="py-8 text-center text-muted-foreground">
              <RefreshCw className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
              <p>Aucune demande de renouvellement en cours.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {renewals.map((r: any) => {
              const etu = r.etudiant;
              const logNom = r.contrats?.reservations?.logements?.nom || "Logement";
              const chNom = r.contrats?.reservations?.chambres?.nom || "Unité";
              const proprio = r.proprietaire;

              return (
                <Card key={r.id} className="border-0 shadow-premium">
                  <CardContent className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-serif font-bold text-base md:text-lg">{logNom} - {chNom}</p>
                        <Badge
                          variant={
                            r.statut === "valide"
                              ? "default"
                              : r.statut === "refuse" || r.statut === "refuse_par_etudiant"
                              ? "destructive"
                              : r.statut === "propose_tarif_modifie"
                              ? "outline"
                              : "secondary"
                          }
                        >
                          {r.statut === "en_attente" && "En attente décision admin"}
                          {r.statut === "propose_tarif_modifie" && "Tarif ajusté proposé à l'étudiant"}
                          {r.statut === "accepte_par_etudiant" && "Nouveau tarif accepté par l'étudiant ✅"}
                          {r.statut === "refuse_par_etudiant" && "Refusé par l'étudiant"}
                          {r.statut === "valide" && "Renouvellement validé"}
                          {r.statut === "refuse" && "Refusé par l'administrateur"}
                        </Badge>
                      </div>

                      <p className="text-sm">
                        Locataire : <strong>{etu ? `${etu.prenom} ${etu.nom}` : "Étudiant"}</strong>
                        {etu?.telephone && ` (${etu.telephone})`}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        Nouvelle période souhaitée : Du {new Date(r.nouvelle_date_debut).toLocaleDateString("fr-FR")} au <strong>{new Date(r.nouvelle_date_fin).toLocaleDateString("fr-FR")}</strong>
                      </p>

                      <div className="text-xs space-y-1">
                        <p>
                          Tarif actuel : <strong>{r.tarif_precedent?.toLocaleString()} FCFA/mois</strong>
                          {r.nouveau_tarif_propose && (
                            <span className="text-accent font-semibold ml-2">
                              → Nouveau tarif proposé : {r.nouveau_tarif_propose.toLocaleString()} FCFA/mois
                            </span>
                          )}
                        </p>
                        {r.motif_modification_tarif && (
                          <p className="text-muted-foreground italic">
                            Motif ajustement tarif : "{r.motif_modification_tarif}"
                          </p>
                        )}
                        {r.motif_refus && (
                          <p className="text-destructive font-medium">
                            Motif du refus : "{r.motif_refus}"
                          </p>
                        )}
                      </div>

                      {/* Coordonnées propriétaire pour l'admin */}
                      {proprio && (
                        <div className="p-2 bg-muted/40 rounded text-xs flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-3 w-3 text-accent" />
                          <span>Propriétaire : {proprio.prenom} {proprio.nom} ({proprio.telephone})</span>
                        </div>
                      )}
                    </div>

                    {/* Actions de l'administrateur */}
                    <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                      {/* Si en attente initiale */}
                      {r.statut === "en_attente" && (
                        <>
                          <Button
                            size="sm"
                            className="bg-gradient-gold text-accent-foreground"
                            disabled={renewalDecisionMutation.isPending}
                            onClick={() =>
                              renewalDecisionMutation.mutate({
                                renewalId: r.id,
                                decision: "valider_meme_tarif",
                              })
                            }
                          >
                            <CheckCircle className="h-3.5 w-3.5 mr-1" />
                            Valider (Même tarif : {r.tarif_precedent?.toLocaleString()} F)
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setNouveauTarif(r.tarif_precedent);
                              setMotifTarif("");
                              setTariffDialog({ open: true, renewal: r });
                            }}
                          >
                            Ajuster le tarif
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive border-destructive/30"
                            onClick={() => {
                              setMotifRefus("");
                              setRefusalDialog({ open: true, renewal: r });
                            }}
                          >
                            Refuser
                          </Button>
                        </>
                      )}

                      {/* Si l'étudiant a accepté le nouveau tarif proposé */}
                      {r.statut === "accepte_par_etudiant" && (
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                          disabled={renewalDecisionMutation.isPending}
                          onClick={() =>
                            renewalDecisionMutation.mutate({
                              renewalId: r.id,
                              decision: "valider_apres_accord",
                            })
                          }
                        >
                          <CheckCircle className="h-3.5 w-3.5 mr-1" />
                          Finaliser et appliquer le renouvellement
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setHistoryDialog({ open: true, contractId: r.contrat_id })}
                      >
                        <History className="h-3.5 w-3.5 mr-1" /> Historique
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* ── DIALOG DE PRÉPARATION & ENVOI DU RAPPEL (SECTION 6.1) ── */}
      <Dialog
        open={reminderDialog.open}
        onOpenChange={(open) => !open && setReminderDialog({ open: false, contract: null })}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg flex items-center gap-2">
              <Bell className="h-5 w-5 text-accent" />
              Préparer et envoyer un rappel d'échéance
            </DialogTitle>
            <DialogDescription>
              Ce message sera transmis au locataire pour lui rappeler l'échéance de son bail et l'inviter à renouveler.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Canal de transmission</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={reminderCanal === "plateforme" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setReminderCanal("plateforme")}
                >
                  Plateforme Zeyna
                </Button>
                <Button
                  type="button"
                  variant={reminderCanal === "whatsapp" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setReminderCanal("whatsapp")}
                >
                  WhatsApp & Plateforme
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reminder-msg">Message de rappel</Label>
              <Textarea
                id="reminder-msg"
                rows={5}
                value={reminderMessage}
                onChange={(e) => setReminderMessage(e.target.value)}
              />
            </div>

            {reminderDialog.contract?.rappels && reminderDialog.contract.rappels.length > 0 && (
              <div className="p-3 bg-muted/40 rounded-lg text-xs space-y-1">
                <p className="font-semibold">Historique des rappels précédents :</p>
                {reminderDialog.contract.rappels.map((rap, i) => (
                  <p key={i} className="text-muted-foreground">
                    • Le {format(new Date(rap.date_rappel), "dd/MM/yyyy HH:mm")} ({rap.type_canal})
                  </p>
                ))}
              </div>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setReminderDialog({ open: false, contract: null })}>
              Annuler
            </Button>
            <Button
              className="bg-gradient-gold text-accent-foreground"
              disabled={!reminderMessage.trim() || sendReminderMutation.isPending}
              onClick={handleConfirmSendReminder}
            >
              {sendReminderMutation.isPending ? "Envoi..." : "Enregistrer et envoyer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── DIALOG DE PROPOSITION DE NOUVEAU TARIF (SECTION 6.3) ── */}
      <Dialog
        open={tariffDialog.open}
        onOpenChange={(open) => !open && setTariffDialog({ open: false, renewal: null })}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg">Proposer un ajustement de tarif</DialogTitle>
            <DialogDescription>
              Le nouveau tarif et son motif seront soumis à l'étudiant pour acceptation avant d'être appliqués.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="nouveau-loyer">Nouveau loyer mensuel proposé (FCFA) *</Label>
              <Input
                id="nouveau-loyer"
                type="number"
                value={nouveauTarif}
                onChange={(e) => setNouveauTarif(Number(e.target.value))}
                min={1}
                required
              />
              <p className="text-xs text-muted-foreground">
                Tarif du contrat initial : {tariffDialog.renewal?.tarif_precedent?.toLocaleString()} FCFA
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="motif-loyer">Motif de la modification de tarif *</Label>
              <Textarea
                id="motif-loyer"
                placeholder="Ex: Évolution du coût de l'électricité et charges de la résidence..."
                value={motifTarif}
                onChange={(e) => setMotifTarif(e.target.value)}
                rows={3}
                required
              />
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setTariffDialog({ open: false, renewal: null })}>
              Annuler
            </Button>
            <Button
              className="bg-accent text-white"
              disabled={!motifTarif.trim() || nouveauTarif <= 0 || renewalDecisionMutation.isPending}
              onClick={() =>
                renewalDecisionMutation.mutate({
                  renewalId: tariffDialog.renewal.id,
                  decision: "proposer_nouveau_tarif",
                  nouveauTarif,
                  motifModification: motifTarif.trim(),
                })
              }
            >
              Envoyer la proposition
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── DIALOG DE REFUS DE RENOUVELLEMENT ── */}
      <Dialog
        open={refusalDialog.open}
        onOpenChange={(open) => !open && setRefusalDialog({ open: false, renewal: null })}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg text-destructive">Refuser le renouvellement</DialogTitle>
            <DialogDescription>
              Veuillez préciser le motif du refus qui sera transmis à l'étudiant.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <Label htmlFor="motif-refus-renouvellement">Motif du refus *</Label>
            <Textarea
              id="motif-refus-renouvellement"
              placeholder="Ex: Logement repris par le propriétaire pour travaux ou indisponible..."
              value={motifRefus}
              onChange={(e) => setMotifRefus(e.target.value)}
              rows={3}
              required
            />
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setRefusalDialog({ open: false, renewal: null })}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              disabled={!motifRefus.trim() || renewalDecisionMutation.isPending}
              onClick={() =>
                renewalDecisionMutation.mutate({
                  renewalId: refusalDialog.renewal.id,
                  decision: "refuser",
                  motifRefus: motifRefus.trim(),
                })
              }
            >
              Confirmer le refus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── DIALOG HISTORIQUE COMPLET DU CONTRAT (SECTION 6.4) ── */}
      <Dialog
        open={historyDialog.open}
        onOpenChange={(open) => !open && setHistoryDialog({ open: false, contractId: null })}
      >
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg flex items-center gap-2">
              <History className="h-5 w-5 text-accent" />
              Historique et Traçabilité du Contrat
            </DialogTitle>
            <DialogDescription>
              Détail chronologique des périodes de location, évolutions de tarif, rappels et renouvellements.
            </DialogDescription>
          </DialogHeader>

          {loadingHistory ? (
            <div className="py-8 text-center text-muted-foreground">Chargement de l'historique...</div>
          ) : (
            <div className="space-y-6 py-2">
              {/* Périodes & Tarifs successifs */}
              <div className="space-y-2">
                <h4 className="font-serif font-bold text-sm text-foreground">
                  Périodes de location & Tarifs appliqués
                </h4>
                {fullHistory?.periodes && fullHistory.periodes.length > 0 ? (
                  <div className="space-y-2">
                    {fullHistory.periodes.map((p: any, idx: number) => (
                      <div key={idx} className="p-3 bg-muted/40 rounded-lg text-xs flex justify-between items-center">
                        <div>
                          <p className="font-semibold">Période {p.numero_periode} : Du {new Date(p.date_debut).toLocaleDateString("fr-FR")} au {new Date(p.date_fin).toLocaleDateString("fr-FR")}</p>
                          {p.motif_modification && (
                            <p className="text-muted-foreground mt-0.5">Motif : {p.motif_modification}</p>
                          )}
                        </div>
                        <Badge variant="outline" className="font-bold text-accent">
                          {p.loyer_mensuel?.toLocaleString()} FCFA/mois
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Période initiale : {fullHistory?.contrat?.date_debut} au {fullHistory?.contrat?.date_fin}</p>
                )}
              </div>

              {/* Rappels d'échéance envoyés */}
              <div className="space-y-2">
                <h4 className="font-serif font-bold text-sm text-foreground">
                  Rappels d'échéance envoyés
                </h4>
                {fullHistory?.rappels && fullHistory.rappels.length > 0 ? (
                  <div className="space-y-2">
                    {fullHistory.rappels.map((rap: any, idx: number) => (
                      <div key={idx} className="p-3 bg-accent/5 border border-accent/20 rounded-lg text-xs space-y-1">
                        <div className="flex justify-between font-semibold">
                          <span>Envoyé le {format(new Date(rap.date_rappel), "dd/MM/yyyy à HH:mm")}</span>
                          <span className="capitalize text-accent">{rap.type_canal}</span>
                        </div>
                        <p className="text-muted-foreground">{rap.message}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Aucun rappel envoyé pour ce contrat.</p>
                )}
              </div>

              {/* Demandes de renouvellement */}
              <div className="space-y-2">
                <h4 className="font-serif font-bold text-sm text-foreground">
                  Demandes de renouvellement
                </h4>
                {fullHistory?.renouvellements && fullHistory.renouvellements.length > 0 ? (
                  <div className="space-y-2">
                    {fullHistory.renouvellements.map((ren: any, idx: number) => (
                      <div key={idx} className="p-3 bg-muted/40 rounded-lg text-xs space-y-1">
                        <div className="flex justify-between font-semibold">
                          <span>Demande du {format(new Date(ren.created_at), "dd/MM/yyyy")}</span>
                          <Badge variant="outline">{ren.statut}</Badge>
                        </div>
                        <p className="text-muted-foreground">
                          Nouvelle fin demandée : {new Date(ren.nouvelle_date_fin).toLocaleDateString("fr-FR")}
                        </p>
                        {ren.nouveau_tarif_propose && (
                          <p className="text-accent font-medium">
                            Nouveau tarif : {ren.nouveau_tarif_propose.toLocaleString()} FCFA ({ren.motif_modification_tarif})
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Aucune demande de renouvellement enregistrée.</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
