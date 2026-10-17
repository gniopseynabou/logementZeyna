import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { invalidateEtudiantData, invalidateGroup } from "@/lib/invalidate-helpers";
import { getReservationForPayment, PaymentMethod, submitPaymentProof } from "@/services/payment-service";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Smartphone, Shield, FileText, CheckCircle2, Loader2, Send } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const PaiementPage = () => {
  const { reservationId } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  
  const [methode, setMethode] = useState<PaymentMethod>("orange_money");
  const [contractAccepted, setContractAccepted] = useState(false);
  const [showProofDialog, setShowProofDialog] = useState(false);
  const [reference, setReference] = useState("");

  const { data: reservation, isLoading } = useQuery({
    queryKey: ["reservation-paiement", reservationId],
    queryFn: () => getReservationForPayment(reservationId!),
    enabled: !!reservationId,
  });

  const submitProof = useMutation({
    mutationFn: () => {
      if (!user || !reservation) throw new Error("Données manquantes");
      return submitPaymentProof({
        etudiant_id: user.id,
        reservation_id: reservation.id,
        montant: reservation.montant_total,
        methode,
        reference,
      });
    },
    onSuccess: async () => {
      if (user?.id) await invalidateEtudiantData(qc, user.id);
      await invalidateGroup(qc, "PAIEMENT_CHANGED");
      toast({
        title: "Preuve envoyée ✅",
        description: "Votre paiement est en cours de vérification par l'administrateur.",
      });
      setShowProofDialog(false);
      navigate("/etudiant/reservations");
    },
    onError: (err: any) => {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    }
  });

  const handlePayClick = () => {
    if (!contractAccepted) return;
    setShowProofDialog(true);
  };

  if (isLoading || !reservation) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const montant = reservation.montant_total;
  const logement = (reservation as any).logements;
  const chambre = (reservation as any).chambres;

  const isPendingConfirmation =
    reservation.statut === "en_attente_confirmation" ||
    (reservation.statut === "en_attente" && !reservation.date_expiration);
  const isRefused = reservation.statut === "refusee";
  const isCancelled =
    reservation.statut === "annulee_utilisateur" || reservation.statut === "annulee";
  const isPaid = reservation.statut === "payee";
  const isExpired =
    reservation.statut === "expiree" ||
    (reservation.date_expiration && new Date(reservation.date_expiration) < new Date());
  const isRoomOccupied = chambre?.est_disponible === false;

  // Si la réservation n'est pas éligible au paiement
  if (isPendingConfirmation || isRefused || isCancelled || isPaid || isExpired || isRoomOccupied) {
    return (
      <DashboardLayout>
        <div className="max-w-xl mx-auto space-y-6 py-6">
          <Card className="border-0 shadow-premium">
            <CardContent className="p-6 text-center space-y-4">
              {isPendingConfirmation && (
                <>
                  <div className="w-14 h-14 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
                    <Shield className="h-7 w-7" />
                  </div>
                  <h2 className="font-serif text-xl font-bold text-foreground">
                    Réservation en cours de vérification
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Votre demande de réservation pour <strong>{logement?.nom} ({chambre?.nom})</strong> a bien été enregistrée. Notre équipe contacte actuellement le propriétaire pour vérifier sa disponibilité réelle.
                  </p>
                  <p className="text-xs font-semibold text-amber-700 bg-amber-500/10 p-2.5 rounded-lg">
                    Le paiement n'est pas accessible tant que l'administrateur n'a pas validé la disponibilité.
                  </p>
                </>
              )}

              {isRefused && (
                <>
                  <div className="w-14 h-14 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-7 w-7 rotate-45" />
                  </div>
                  <h2 className="font-serif text-xl font-bold text-destructive">
                    Réservation non acceptée
                  </h2>
                  {reservation.motif_refus && (
                    <div className="p-3 bg-destructive/10 rounded-lg text-sm text-foreground text-left">
                      <strong>Motif communiqué :</strong> {reservation.motif_refus}
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Cette réservation est clôturée et le paiement n'est pas autorisé.
                  </p>
                </>
              )}

              {isExpired && (
                <>
                  <div className="w-14 h-14 rounded-full bg-red-500/10 text-red-600 flex items-center justify-center mx-auto">
                    <Shield className="h-7 w-7" />
                  </div>
                  <h2 className="font-serif text-xl font-bold text-destructive">
                    Délai de paiement expiré (24h)
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Le délai strict de 24 heures pour régler la caution a été dépassé. Conformément à nos règles de premier arrivé premier servi, le logement a été remis à disposition.
                  </p>
                </>
              )}

              {isRoomOccupied && !isPaid && (
                <>
                  <div className="w-14 h-14 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
                    <Shield className="h-7 w-7" />
                  </div>
                  <h2 className="font-serif text-xl font-bold text-foreground">
                    Logement déjà attribué
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Ce logement a été confirmé et payé par un autre locataire (règle du premier arrivé, premier servi). Le paiement n'est plus possible.
                  </p>
                </>
              )}

              {isPaid && (
                <>
                  <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-7 w-7" />
                  </div>
                  <h2 className="font-serif text-xl font-bold text-emerald-600">
                    Paiement déjà effectué !
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Votre paiement a déjà été validé et votre contrat de location est disponible.
                  </p>
                </>
              )}

              {isCancelled && (
                <>
                  <h2 className="font-serif text-xl font-bold text-foreground">
                    Réservation annulée
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Cette réservation a été annulée. Aucun paiement ne peut être effectué.
                  </p>
                </>
              )}

              <div className="pt-3 flex gap-2 justify-center flex-wrap">
                <Button asChild variant="outline">
                  <a href="/etudiant/reservations">Mes réservations</a>
                </Button>
                <Button asChild className="bg-gradient-gold text-accent-foreground">
                  <a href="/logements">Explorer les logements</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // Calcul du temps restant pour paiement
  const expDate = reservation.date_expiration ? new Date(reservation.date_expiration) : null;
  const tempsRestant = expDate
    ? formatDistanceToNow(expDate, { locale: fr, addSuffix: true })
    : "24h";

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="font-serif text-2xl font-bold flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-green-500" /> Validation et Paiement
          </h1>
          <p className="text-muted-foreground mt-1">
            Dernière étape ! Veuillez consulter et accepter le contrat de location avant de régler la caution.
          </p>
        </div>

        {/* Alerte décompte 24 heures */}
        <div className="flex items-center gap-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-900 dark:text-blue-200">
          <Clock className="h-5 w-5 text-blue-600 shrink-0 animate-pulse" />
          <div className="text-sm">
            <strong>Délai de paiement : 24 heures</strong>
            <p className="text-xs text-muted-foreground mt-0.5">
              Votre réservation a été validée par l'administrateur. Elle expirera <strong>{tempsRestant}</strong>
              {expDate && ` (le ${format(expDate, "dd MMMM yyyy à HH:mm", { locale: fr })})`}.
            </p>
          </div>
        </div>

        <Card className="border-0 shadow-premium">
          <CardHeader>
            <CardTitle className="font-serif text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-accent" /> Aperçu du Contrat de Location
            </CardTitle>
            <CardDescription>Ceci est un projet de contrat. Il deviendra définitif après validation de votre paiement.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ScrollArea className="h-[250px] w-full rounded-md border p-4 bg-muted/30 text-sm">
              <div className="space-y-4">
                <div className="text-center mb-4 border-b pb-2">
                  <h3 className="font-bold text-base uppercase">Contrat de Bail Numérique</h3>
                  <p className="text-muted-foreground text-xs">Généré le {format(new Date(), "dd MMMM yyyy", { locale: fr })}</p>
                </div>

                <div className="space-y-2">
                  <p><strong>ENTRE LES SOUSSIGNÉS :</strong></p>
                  <p>
                    <span className="font-medium text-primary">Le Gestionnaire / Bailleur :</span><br />
                    <strong>Les Logements de ZEYNA</strong><br />
                    <em>(ci-après dénommé "ZEYNA")</em>
                  </p>
                  <p>
                    <span className="font-medium text-primary">Et Le Preneur (Locataire) :</span><br />
                    {profile?.prenom} {profile?.nom} ({profile?.telephone || "Téléphone non renseigné"})<br />
                    <em>(ci-après dénommé "Le Locataire")</em>
                  </p>
                </div>

                <div className="space-y-2 mt-4">
                  <p><strong>IL A ÉTÉ CONVENU CE QUI SUIT :</strong></p>
                  <p>
                    <strong>Article 1 - Objet de la location :</strong> ZEYNA met à la disposition du Locataire la chambre <strong>"{chambre?.nom}"</strong> située dans le logement <strong>"{logement?.nom}"</strong> à l'adresse : {logement?.adresse}, {logement?.ville}.
                  </p>
                  <p>
                    <strong>Article 2 - Loyer et Caution :</strong> Le locataire s'engage à payer une caution initiale de <strong>{montant.toLocaleString()} FCFA</strong>. Le loyer mensuel fixé est de <strong>{chambre?.prix_zeyna?.toLocaleString()} FCFA</strong>.
                  </p>
                  
                  {logement?.conditions_electricite && (
                    <p>
                      <strong>Article 3 - Conditions d'électricité :</strong> {logement.conditions_electricite}
                    </p>
                  )}

                  <p>
                    <strong>Article 4 - Engagement :</strong> La plateforme <em>Les Logements de ZEYNA</em> agit en tant qu'interlocuteur exclusif du locataire. Le présent contrat prend effet dès la validation du paiement de la caution par nos services.
                  </p>
                </div>
              </div>
            </ScrollArea>

            <div className="flex items-start space-x-3 pt-2 bg-accent/5 p-4 rounded-lg border border-accent/20">
              <Checkbox 
                id="terms" 
                checked={contractAccepted}
                onCheckedChange={(checked) => setContractAccepted(checked === true)}
                className="mt-1 data-[state=checked]:bg-accent data-[state=checked]:border-accent"
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="terms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  J'ai lu et j'accepte les conditions de ce contrat de location
                </label>
                <p className="text-xs text-muted-foreground">
                  En cochant cette case, vous signez numériquement cet accord.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-premium">
          <CardHeader>
            <CardTitle className="font-serif text-lg">Envoyer le paiement ({montant.toLocaleString()} FCFA)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p role="note" className="text-sm text-muted-foreground">
              Sélectionnez votre méthode de transfert et cliquez pour fournir votre référence.
            </p>
            <RadioGroup 
              value={methode} 
              onValueChange={(value) => setMethode(value as PaymentMethod)} 
              className={`space-y-3 transition-opacity ${!contractAccepted ? 'opacity-50 pointer-events-none' : ''}`}
            >
              {[
                { value: "orange_money", label: "Orange Money", icon: <Smartphone className="h-4 w-4 text-orange-500" /> },
                { value: "mtn_money", label: "Wave", icon: <Smartphone className="h-4 w-4 text-yellow-500" /> },
              ].map((m) => (
                <Label key={m.value} htmlFor={m.value} className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${methode === m.value ? "border-accent bg-accent/5" : "border-border"}`}>
                  <RadioGroupItem value={m.value} id={m.value} />
                  {m.icon}
                  <span className="font-medium">{m.label}</span>
                </Label>
              ))}
            </RadioGroup>

            <Button 
              className="w-full bg-gradient-gold text-accent-foreground shadow-gold text-lg h-12" 
              disabled={!contractAccepted} 
              onClick={handlePayClick}
            >
              {!contractAccepted 
                ? "Acceptez le contrat pour continuer" 
                : "Confirmer et fournir la preuve"
              }
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* DIALOG DE PREUVE DE PAIEMENT */}
      <Dialog open={showProofDialog} onOpenChange={setShowProofDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Preuve de paiement</DialogTitle>
            <DialogDescription>
              Veuillez effectuer le transfert de <strong>{montant.toLocaleString()} FCFA</strong> via {methode.replace("_", " ").toUpperCase()} sur le numéro ZEYNA. Puis, saisissez la référence de transaction ci-dessous.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reference">Numéro de transaction (Référence)</Label>
              <Input 
                id="reference" 
                placeholder="Ex: MP2409... ou ID de transfert" 
                value={reference}
                onChange={(e) => setReference(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <Shield className="h-3 w-3" /> Cette référence sera vérifiée par notre équipe.
              </p>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowProofDialog(false)} className="w-full sm:w-auto">
              Annuler
            </Button>
            <Button 
              className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-white gap-2" 
              onClick={() => submitProof.mutate()}
              disabled={!reference.trim() || submitProof.isPending}
            >
              {submitProof.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Envoyer la preuve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default PaiementPage;
