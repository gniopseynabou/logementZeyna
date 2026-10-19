import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createManualReceipt, RecuPaiement } from "@/services/receipt-service";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Receipt, Loader2, Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateRecuPaiementHTML, printDocument } from "@/lib/contract-templates";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ManualReceiptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (recu: RecuPaiement) => void;
}

export const ManualReceiptDialog = ({
  open,
  onOpenChange,
  onSuccess,
}: ManualReceiptDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [payeurNom, setPayeurNom] = useState("");
  const [payeurTel, setPayeurTel] = useState("");
  const [payeurEmail, setPayeurEmail] = useState("");
  const [montant, setMontant] = useState<number>(0);
  const [motif, setMotif] = useState("");
  const [methodePaiement, setMethodePaiement] = useState("Wave");
  const [refPaiement, setRefPaiement] = useState("");
  const [typeRecu, setTypeRecu] = useState<
    "caution" | "loyer" | "frais_dossier" | "manuel" | "autre"
  >("loyer");
  const [logementId, setLogementId] = useState<string>("aucun");
  const [observations, setObservations] = useState("");

  // Récupérer la liste des logements pour rattachement facultatif
  const { data: logements } = useQuery({
    queryKey: ["logements-list-for-receipts"],
    queryFn: async () => {
      const { data } = await supabase.from("logements").select("id, nom, adresse").order("nom");
      return data || [];
    },
    enabled: open,
  });

  const resetForm = () => {
    setPayeurNom("");
    setPayeurTel("");
    setPayeurEmail("");
    setMontant(0);
    setMotif("");
    setMethodePaiement("Wave");
    setRefPaiement("");
    setTypeRecu("loyer");
    setLogementId("aucun");
    setObservations("");
  };

  const createReceiptMutation = useMutation({
    mutationFn: async () => {
      if (!payeurNom || !payeurNom.trim()) {
        throw new Error("Le nom complet du payeur est obligatoire.");
      }
      if (!motif || !motif.trim()) {
        throw new Error("Le motif du versement est obligatoire.");
      }
      if (!montant || montant <= 0) {
        throw new Error("Veuillez indiquer un montant valide supérieur à 0 FCFA.");
      }

      return await createManualReceipt({
        payeurNomComplet: payeurNom.trim(),
        payeurTelephone: payeurTel.trim() || undefined,
        payeurEmail: payeurEmail.trim() || undefined,
        montant,
        motif: motif.trim(),
        methodePaiement,
        referencePaiement: refPaiement.trim() || undefined,
        typeRecu,
        logementId: logementId !== "aucun" ? logementId : undefined,
        observations: observations.trim() || undefined,
      });
    },
    onSuccess: (newRecu) => {
      toast({
        title: "Reçu émis avec succès",
        description: `Le reçu ${newRecu.reference} a été enregistré dans le registre comptable.`,
      });

      queryClient.invalidateQueries({ queryKey: ["admin-all-receipts"] });
      queryClient.invalidateQueries({ queryKey: ["admin-operations-register"] });
      queryClient.invalidateQueries({ queryKey: ["admin-paiements"] });

      // Lancer immédiatement l'impression du reçu
      const selLogement = logements?.find((l) => l.id === logementId);
      const html = generateRecuPaiementHTML({
        reference: newRecu.reference,
        dateEmission: format(new Date(), "dd/MM/yyyy", { locale: fr }),
        payeur: {
          prenom: "",
          nom: newRecu.payeur_nom_complet,
          telephone: newRecu.payeur_telephone || undefined,
          email: newRecu.payeur_email || undefined,
          qualite: "Bénéficiaire / Payeur",
        },
        logement: {
          nom: selLogement?.nom || "Non spécifié",
          adresse: selLogement?.adresse,
        },
        typeRecu: newRecu.type_recu,
        typeGeneration: "manuel",
        montant: newRecu.montant,
        methodePaiement: newRecu.methode_paiement,
        referencePaiement: newRecu.reference_paiement || undefined,
        motif: newRecu.motif,
        observations: observations.trim() || undefined,
      });
      printDocument(html);

      if (onSuccess) onSuccess(newRecu);
      resetForm();
      onOpenChange(false);
    },
    onError: (err: any) => {
      toast({
        title: "Erreur",
        description: err.message || "Impossible de générer le reçu.",
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" /> Émettre un reçu de paiement manuel
          </DialogTitle>
          <DialogDescription>
            Générez une quittance officielle imprimable (quittance libératoire) pour un règlement direct,
            en espèces, avance de loyer ou régularisation de caution.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="payeur_nom" className="text-xs font-semibold">
                Nom complet du payeur / locataire <span className="text-red-500">*</span>
              </Label>
              <Input
                id="payeur_nom"
                placeholder="Ex : Mouhamed Diallo"
                value={payeurNom}
                onChange={(e) => setPayeurNom(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="payeur_tel_dlg" className="text-xs">
                Téléphone
              </Label>
              <Input
                id="payeur_tel_dlg"
                placeholder="+221 77 432 64 86"
                value={payeurTel}
                onChange={(e) => setPayeurTel(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="payeur_email_dlg" className="text-xs">
                Adresse e-mail
              </Label>
              <Input
                id="payeur_email_dlg"
                type="email"
                placeholder="client@domaine.com"
                value={payeurEmail}
                onChange={(e) => setPayeurEmail(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="montant_dlg" className="text-xs font-semibold">
                Montant total reçu (FCFA) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="montant_dlg"
                type="number"
                min="0"
                step="500"
                placeholder="50 000"
                value={montant || ""}
                onChange={(e) => setMontant(Number(e.target.value))}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="type_recu_dlg" className="text-xs font-semibold">
                Nature du versement
              </Label>
              <Select value={typeRecu} onValueChange={(v: any) => setTypeRecu(v)}>
                <SelectTrigger id="type_recu_dlg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="loyer">Loyer mensuel</SelectItem>
                  <SelectItem value="caution">Dépôt de garantie (Caution)</SelectItem>
                  <SelectItem value="frais_dossier">Frais de dossier / service</SelectItem>
                  <SelectItem value="manuel">Règlement direct / Régularisation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="mode_pay_dlg" className="text-xs font-semibold">
                Mode de règlement
              </Label>
              <Select value={methodePaiement} onValueChange={setMethodePaiement}>
                <SelectTrigger id="mode_pay_dlg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Wave">Wave</SelectItem>
                  <SelectItem value="Orange Money">Orange Money</SelectItem>
                  <SelectItem value="Espèces">Espèces (Reçu de caisse)</SelectItem>
                  <SelectItem value="Virement Bancaire">Virement Bancaire</SelectItem>
                  <SelectItem value="Chèque">Chèque</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ref_pay_dlg" className="text-xs">
                Réf. transaction / N° Chèque
              </Label>
              <Input
                id="ref_pay_dlg"
                placeholder="Ex : TX-WV-9482012"
                value={refPaiement}
                onChange={(e) => setRefPaiement(e.target.value)}
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="logement_dlg" className="text-xs">
                Logement rattaché (facultatif)
              </Label>
              <Select value={logementId} onValueChange={setLogementId}>
                <SelectTrigger id="logement_dlg">
                  <SelectValue placeholder="Sélectionner un logement..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aucun">Aucun logement spécifique</SelectItem>
                  {logements?.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.nom} {l.adresse ? `(${l.adresse})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="motif_dlg" className="text-xs font-semibold">
                Motif / Objet du paiement <span className="text-red-500">*</span>
              </Label>
              <Input
                id="motif_dlg"
                placeholder="Ex : Règlement loyer Octobre 2026 - Résidence Al-Nour"
                value={motif}
                onChange={(e) => setMotif(e.target.value)}
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="obs_dlg" className="text-xs">
                Observations éventuelles (mentionnées sur le reçu)
              </Label>
              <Textarea
                id="obs_dlg"
                rows={2}
                placeholder="Ex : Acompte de 30 000 FCFA, reliquat attendu le 25 du mois..."
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            disabled={createReceiptMutation.isPending}
            onClick={() => onOpenChange(false)}
          >
            Annuler
          </Button>
          <Button
            disabled={createReceiptMutation.isPending || !payeurNom || !motif || !montant}
            onClick={() => createReceiptMutation.mutate()}
            className="bg-primary text-white hover:bg-primary/95"
          >
            {createReceiptMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Printer className="h-4 w-4 mr-2" />
            )}
            Émettre et imprimer le reçu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
