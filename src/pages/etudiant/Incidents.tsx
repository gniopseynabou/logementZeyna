import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { invalidateEtudiantData, invalidateGroup } from "@/lib/invalidate-helpers";
import { getEtudiantIncidents, createIncident, IncidentCategorie, IncidentPriorite } from "@/services/incident-service";
import { getStudentDashboardReservations } from "@/services/reservation-service";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Wrench, MessageSquare, Plus, Clock, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const EtudiantIncidents = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form state
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [categorie, setCategorie] = useState<IncidentCategorie>("maintenance");
  const [priorite, setPriorite] = useState<IncidentPriorite>("normale");

  const { data: incidents, isLoading: loadingIncidents } = useQuery({
    queryKey: ["etudiant-incidents", user?.id],
    queryFn: () => getEtudiantIncidents(user!.id),
    enabled: !!user,
  });

  const { data: reservations } = useQuery({
    queryKey: ["etudiant-reservations", user?.id],
    queryFn: () => getStudentDashboardReservations(user!.id),
    enabled: !!user,
  });

  const activeReservation = reservations?.find(r => r.statut === "confirmee");

  const createMutation = useMutation({
    mutationFn: (data: any) => createIncident(data),
    onSuccess: async () => {
      if (user?.id) await invalidateEtudiantData(queryClient, user.id);
      await invalidateGroup(queryClient, "INCIDENT_CHANGED");
      toast({ title: "Incident signalé", description: "Votre signalement a été envoyé avec succès." });
      setIsDialogOpen(false);
      setTitre("");
      setDescription("");
    },
    onError: (error) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReservation) {
      toast({ title: "Impossible", description: "Vous devez avoir une réservation active pour signaler un incident.", variant: "destructive" });
      return;
    }
    
    createMutation.mutate({
      etudiant_id: user!.id,
      logement_id: activeReservation.logement_id,
      chambre_id: activeReservation.chambre_id,
      titre,
      description,
      categorie,
      priorite,
      statut: "nouveau",
      photos: []
    });
  };

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case "nouveau": return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold uppercase">Nouveau</span>;
      case "en_cours": return <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-bold uppercase">En cours</span>;
      case "en_attente": return <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-bold uppercase">En attente</span>;
      case "resolu": return <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold uppercase flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Résolu</span>;
      case "cloture": return <span className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs font-bold uppercase">Clôturé</span>;
      default: return null;
    }
  };

  const getCategorieIcon = (cat: string) => {
    switch (cat) {
      case "maintenance": return <Wrench className="h-5 w-5 text-blue-500" />;
      case "securite": return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default: return <MessageSquare className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-6">
          <div>
            <h1 className="font-serif text-2xl font-bold">Signalements & Incidents</h1>
            <p className="text-muted-foreground mt-1">Déclarez un problème dans votre logement et suivez sa résolution.</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-accent hover:bg-accent/90 text-white" disabled={!activeReservation}>
                <Plus className="h-4 w-4 mr-2" /> Signaler un incident
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="font-serif text-xl">Signaler un incident</DialogTitle>
                <DialogDescription>
                  Décrivez le problème rencontré dans votre logement. Notre équipe interviendra dans les meilleurs délais.
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Titre</label>
                  <Input required placeholder="Ex: Fuite d'eau dans la salle de bain" value={titre} onChange={e => setTitre(e.target.value)} />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Catégorie</label>
                    <Select value={categorie} onValueChange={(v: any) => setCategorie(v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="securite">Sécurité</SelectItem>
                        <SelectItem value="paiement">Paiement</SelectItem>
                        <SelectItem value="comportement">Comportement</SelectItem>
                        <SelectItem value="autre">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Priorité</label>
                    <Select value={priorite} onValueChange={(v: any) => setPriorite(v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basse">Basse</SelectItem>
                        <SelectItem value="normale">Normale</SelectItem>
                        <SelectItem value="haute">Haute</SelectItem>
                        <SelectItem value="urgente">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Description détaillée</label>
                  <Textarea required rows={4} placeholder="Merci de donner le maximum de détails..." value={description} onChange={e => setDescription(e.target.value)} />
                </div>

                <DialogFooter className="mt-6">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
                  <Button type="submit" disabled={createMutation.isPending} className="bg-accent hover:bg-accent/90 text-white">
                    {createMutation.isPending ? "Envoi..." : "Envoyer le signalement"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {!activeReservation && (
          <div className="bg-muted/50 p-4 rounded-lg flex gap-3 text-muted-foreground border border-border">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <p className="text-sm">Vous ne pouvez pas signaler d'incident car vous n'avez pas de logement actif actuellement.</p>
          </div>
        )}

        {loadingIncidents ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />)}
          </div>
        ) : !incidents || incidents.length === 0 ? (
          <Card className="border-0 shadow-premium">
            <CardContent className="py-12 text-center">
              <CheckCircle className="h-12 w-12 text-green-500/50 mx-auto mb-4" />
              <h3 className="font-serif text-lg font-bold">Aucun incident</h3>
              <p className="text-muted-foreground mt-1">Tout semble bien se passer dans votre logement !</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {incidents.map((incident) => (
              <Card key={incident.id} className="border-0 shadow-premium overflow-hidden">
                <div className={`h-1 w-full ${incident.statut === 'resolu' || incident.statut === 'cloture' ? 'bg-green-500' : 'bg-amber-500'}`} />
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex gap-4">
                      <div className="p-3 bg-muted rounded-xl shrink-0 h-fit">
                        {getCategorieIcon(incident.categorie)}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg mb-1">{incident.titre}</h3>
                        <p className="text-muted-foreground text-sm mb-3">{incident.description}</p>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Signalé le {format(new Date(incident.created_at), "dd MMM yyyy", { locale: fr })}</span>
                          <span>•</span>
                          <span className="capitalize">Priorité : <strong className={incident.priorite === 'urgente' || incident.priorite === 'haute' ? 'text-red-500' : ''}>{incident.priorite}</strong></span>
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0 md:text-right mt-2 md:mt-0">
                      {getStatutBadge(incident.statut)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default EtudiantIncidents;
