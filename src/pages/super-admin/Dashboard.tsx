import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMaintenance, useToggleMaintenance } from "@/hooks/useMaintenance";
import { AlertTriangle, Wrench, ShieldAlert } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

const SuperAdminDashboard = () => {
  const { data: maintenance, isLoading } = useMaintenance();
  const toggleMaintenance = useToggleMaintenance();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState("Maintenance en cours");
  const [message, setMessage] = useState("La plateforme est temporairement indisponible pour une opération de maintenance.");

  const handleToggle = () => {
    if (maintenance?.is_active) {
      // Désactiver (pas besoin de confirmation stricte pour la désactivation)
      toggleMaintenance.mutate(
        { is_active: false },
        {
          onSuccess: () => toast({ title: "Maintenance désactivée", description: "La plateforme est de nouveau accessible." }),
          onError: (err) => toast({ title: "Erreur", description: err.message, variant: "destructive" })
        }
      );
    } else {
      // Activer (ouvrir dialogue de configuration)
      setTitle("Maintenance en cours");
      setMessage("La plateforme est temporairement indisponible pour une opération de maintenance.");
      setIsDialogOpen(true);
    }
  };

  const confirmActivation = () => {
    toggleMaintenance.mutate(
      { is_active: true, title, message },
      {
        onSuccess: () => {
          setIsDialogOpen(false);
          toast({ title: "Maintenance activée", description: "La plateforme est désormais inaccessible aux utilisateurs standards." });
        },
        onError: (err) => {
          toast({ title: "Erreur", description: err.message, variant: "destructive" });
        }
      }
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-serif text-2xl font-bold">Super-Administration</h1>
          <p className="text-muted-foreground text-sm">Gestion technique et configuration critique de la plateforme.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card Maintenance */}
          <Card className={`border-l-4 shadow-premium ${maintenance?.is_active ? 'border-l-amber-500' : 'border-l-green-500'}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" /> Mode Maintenance
              </CardTitle>
              <CardDescription>
                Bloque l'accès à l'application pour les utilisateurs standards et administrateurs métier.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg border">
                <div className="space-y-0.5">
                  <Label htmlFor="maintenance-mode" className="text-base font-medium flex items-center gap-2">
                    Statut actuel
                    {maintenance?.is_active ? (
                      <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">Activé</span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">Désactivé</span>
                    )}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {maintenance?.is_active 
                      ? "Seuls les Super-Admins peuvent accéder à la plateforme." 
                      : "La plateforme est accessible à tous."}
                  </p>
                </div>
                <Switch 
                  id="maintenance-mode"
                  checked={maintenance?.is_active || false}
                  onCheckedChange={handleToggle}
                  disabled={isLoading || toggleMaintenance.isPending}
                />
              </div>
            </CardContent>
          </Card>

          {/* Placeholder Audit Logs */}
          <Card className="shadow-premium opacity-70">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5" /> Journal d'audit (bientôt)
              </CardTitle>
              <CardDescription>
                Traçabilité des actions critiques.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Cette fonctionnalité sera implémentée lors de la Phase 5.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
              Activer la maintenance ?
            </DialogTitle>
            <DialogDescription>
              Cette action va bloquer l'accès à la plateforme pour TOUS les utilisateurs, 
              y compris les administrateurs métier. Les opérations en cours pourraient être interrompues.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Titre (affiché aux utilisateurs)</Label>
              <Input 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="Ex: Maintenance programmée" 
              />
            </div>
            <div className="space-y-2">
              <Label>Message d'explication</Label>
              <Textarea 
                value={message} 
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ex: Nous effectuons une mise à jour de la base de données..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={toggleMaintenance.isPending}>
              Annuler
            </Button>
            <Button className="bg-amber-600 hover:bg-amber-700 text-white" onClick={confirmActivation} disabled={toggleMaintenance.isPending}>
              Confirmer l'activation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default SuperAdminDashboard;
