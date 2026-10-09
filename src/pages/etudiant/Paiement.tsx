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
    return <DashboardLayout><div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div></DashboardLayout>;
  }

  const montant = reservation.montant_total;
  const logement = (reservation as any).logements;
  const chambre = (reservation as any).chambres;
  const bailleur = (reservation as any).bailleur;

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
                    <span className="font-medium text-primary">Le Bailleur (ou son mandataire ZEYNA) :</span><br />
                    {bailleur ? `${bailleur.prenom} ${bailleur.nom}` : "Les Logements de Zeyna"}<br />
                    <em>(ci-après dénommé "Le Bailleur")</em>
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
                    <strong>Article 1 - Objet de la location :</strong> Le Bailleur loue au Locataire la chambre <strong>"{chambre?.nom}"</strong> située dans le logement <strong>"{logement?.nom}"</strong> à l'adresse : {logement?.adresse}, {logement?.ville}.
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
                    <strong>Article 4 - Engagement de la plateforme :</strong> La plateforme <em>Les Logements de Zeyna</em> agit en tant que tiers de confiance. Le présent contrat prend effet dès la validation du paiement de la caution par l'administrateur.
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
                { value: "mtn_money", label: "MTN Money", icon: <Smartphone className="h-4 w-4 text-yellow-500" /> },
                { value: "moov_money", label: "Moov Money", icon: <Smartphone className="h-4 w-4 text-blue-500" /> },
                { value: "carte_bancaire", label: "Virement Bancaire", icon: <CreditCard className="h-4 w-4 text-primary" /> },
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
