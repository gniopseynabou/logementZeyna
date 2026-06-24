import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Smartphone, Shield } from "lucide-react";

const PaiementPage = () => {
  const { reservationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [methode, setMethode] = useState<string>("orange_money");
  const [phone, setPhone] = useState("");
  const [processing, setProcessing] = useState(false);

  const { data: reservation } = useQuery({
    queryKey: ["reservation-paiement", reservationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reservations")
        .select("*, logements(nom), chambres(nom, prix_zeyna, caution)")
        .eq("id", reservationId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!reservationId,
  });

  const handlePay = async () => {
    if (!user || !reservation) return;
    if ((methode === "orange_money" || methode === "mtn_money" || methode === "moov_money") && !phone) {
      toast({ title: "Erreur", description: "Entrez votre numéro de téléphone", variant: "destructive" });
      return;
    }

    setProcessing(true);

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    const ref = `ZYN-${Date.now().toString(36).toUpperCase()}`;

    // Create payment
    const { error: payError } = await supabase.from("paiements").insert({
      etudiant_id: user.id,
      reservation_id: reservation.id,
      montant: reservation.montant_total,
      methode: methode as any,
      reference: ref,
      est_confirme: true,
    });

    if (payError) {
      toast({ title: "Erreur de paiement", description: payError.message, variant: "destructive" });
      setProcessing(false);
      return;
    }

    // Update reservation status
    await supabase.from("reservations").update({ statut: "confirmee" }).eq("id", reservation.id);

    // Block chambre
    await supabase.from("chambres").update({ est_disponible: false }).eq("id", reservation.chambre_id);

    // Create contract
    await supabase.from("contrats").insert({
      etudiant_id: user.id,
      reservation_id: reservation.id,
      contenu: {
        logement: (reservation as any).logements?.nom,
        chambre: (reservation as any).chambres?.nom,
        montant: reservation.montant_total,
        reference: ref,
        date: new Date().toISOString(),
      },
    });

    toast({ title: "Paiement confirmé ! ✅", description: `Référence : ${ref}. Votre réservation est confirmée.` });
    navigate("/etudiant/reservations");
    setProcessing(false);
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
            <CardTitle className="font-serif text-lg">Mode de paiement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <RadioGroup value={methode} onValueChange={setMethode} className="space-y-3">
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

            {methode !== "carte_bancaire" && (
              <div className="space-y-2">
                <Label>Numéro de téléphone</Label>
                <Input placeholder="+221 77 000 00 00" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
            )}

            {methode === "carte_bancaire" && (
              <div className="space-y-3">
                <div className="space-y-2"><Label>Numéro de carte</Label><Input placeholder="4242 4242 4242 4242" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>Expiration</Label><Input placeholder="MM/AA" /></div>
                  <div className="space-y-2"><Label>CVV</Label><Input placeholder="123" /></div>
                </div>
              </div>
            )}

            <Button className="w-full bg-gradient-gold text-accent-foreground shadow-gold" disabled={processing} onClick={handlePay}>
              {processing ? "Traitement en cours..." : `Payer ${montant.toLocaleString()} FCFA`}
            </Button>

            <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
              <Shield className="h-3 w-3" /> Paiement sécurisé — Simulation
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PaiementPage;
