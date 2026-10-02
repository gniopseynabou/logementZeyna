import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { getReservationForPayment, PaymentMethod } from "@/services/payment-service";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Smartphone, Shield } from "lucide-react";

const PaiementPage = () => {
  const { reservationId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [methode, setMethode] = useState<PaymentMethod>("orange_money");
  const [processing, setProcessing] = useState(false);

  const { data: reservation } = useQuery({
    queryKey: ["reservation-paiement", reservationId],
    queryFn: () => getReservationForPayment(reservationId!),
    enabled: !!reservationId,
  });

  const handlePay = async () => {
    if (!user || !reservation) return;
    setProcessing(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: "Simulation terminée",
        description: "Aucun paiement n’a été effectué. Votre réservation reste en attente.",
      });
    } finally {
      setProcessing(false);
    }
  };

  if (!reservation) {
    return <DashboardLayout><div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div></DashboardLayout>;
  }

  const montant = reservation.montant_total;

  return (
    <DashboardLayout>
      <div className="max-w-lg mx-auto space-y-6">
        <h1 className="font-serif text-2xl font-bold">Paiement de la caution</h1>

        <Card className="border-0 shadow-premium">
          <CardHeader>
            <CardTitle className="font-serif text-lg">Récapitulatif</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between"><span className="text-muted-foreground">Logement</span><span className="font-medium">{(reservation as any).logements?.nom}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Chambre</span><span className="font-medium">{(reservation as any).chambres?.nom}</span></div>
            <div className="flex justify-between border-t pt-3 mt-3"><span className="font-semibold">Caution à payer</span><span className="text-xl font-bold text-accent font-ui">{montant.toLocaleString()} FCFA</span></div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-premium">
          <CardHeader>
            <CardTitle className="font-serif text-lg">Mode de paiement simulé</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p role="note" className="text-sm text-muted-foreground">
              Mode démo : aucune transaction ne sera effectuée. Ne saisissez aucune donnée bancaire.
            </p>
            <RadioGroup value={methode} onValueChange={(value) => setMethode(value as PaymentMethod)} className="space-y-3">
              {[
                { value: "orange_money", label: "Orange Money", icon: <Smartphone className="h-4 w-4 text-orange-500" /> },
                { value: "mtn_money", label: "MTN Money", icon: <Smartphone className="h-4 w-4 text-yellow-500" /> },
                { value: "moov_money", label: "Moov Money", icon: <Smartphone className="h-4 w-4 text-blue-500" /> },
                { value: "carte_bancaire", label: "Carte bancaire", icon: <CreditCard className="h-4 w-4 text-primary" /> },
              ].map((m) => (
                <Label key={m.value} htmlFor={m.value} className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${methode === m.value ? "border-accent bg-accent/5" : "border-border"}`}>
                  <RadioGroupItem value={m.value} id={m.value} />
                  {m.icon}
                  <span className="font-medium">{m.label}</span>
                </Label>
              ))}
            </RadioGroup>

            <Button className="w-full bg-gradient-gold text-accent-foreground shadow-gold" disabled={processing} onClick={handlePay}>
              {processing ? "Simulation en cours..." : "Lancer la simulation"}
            </Button>

            <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
              <Shield className="h-3 w-3" /> La réservation ne sera pas confirmée
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PaiementPage;
