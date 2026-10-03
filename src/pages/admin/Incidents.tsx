// Page : Admin - Incidents
// Route : /admin/incidents
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertTriangle, Search, Plus, Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAdminIncidents, updateIncidentStatut, IncidentStatut, IncidentPriorite } from "@/services/incident-service";
import { useToast } from "@/hooks/use-toast";

const statutConfig: Record<IncidentStatut, { label: string; color: string; icon: React.ReactNode }> = {
  nouveau: { label: "Nouveau", color: "bg-blue-100 text-blue-800 border-blue-200", icon: <AlertTriangle className="h-3 w-3" /> },
  en_cours: { label: "En cours", color: "bg-amber-100 text-amber-800 border-amber-200", icon: <Loader2 className="h-3 w-3" /> },
  en_attente: { label: "En attente", color: "bg-orange-100 text-orange-800 border-orange-200", icon: <Clock className="h-3 w-3" /> },
  resolu: { label: "Résolu", color: "bg-green-100 text-green-800 border-green-200", icon: <CheckCircle2 className="h-3 w-3" /> },
  cloture: { label: "Clôturé", color: "bg-gray-100 text-gray-600 border-gray-200", icon: <XCircle className="h-3 w-3" /> },
};

const prioriteConfig: Record<IncidentPriorite, { label: string; color: string }> = {
  basse: { label: "Basse", color: "text-gray-500" },
  normale: { label: "Normale", color: "text-blue-600" },
  haute: { label: "Haute", color: "text-orange-600" },
  urgente: { label: "Urgente", color: "text-red-600" },
};

const AdminIncidents = () => {
  const [search, setSearch] = useState("");
  const [filtreStatut, setFiltreStatut] = useState("tous");
  const [filtrePriorite, setFiltrePriorite] = useState("tous");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: incidents, isLoading } = useQuery({
    queryKey: ["admin-incidents"],
    queryFn: getAdminIncidents,
  });

  const mutationStatut = useMutation({
    mutationFn: ({ id, statut }: { id: string; statut: IncidentStatut }) => updateIncidentStatut(id, statut),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-incidents"] });
      toast({ title: "Statut mis à jour", description: "L'incident a été mis à jour avec succès." });
    },
    onError: (error) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
  });

  const filteredIncidents = incidents?.filter(inc => {
    const matchSearch = inc.titre.toLowerCase().includes(search.toLowerCase()) || 
                        inc.logement?.nom.toLowerCase().includes(search.toLowerCase()) ||
                        inc.etudiant?.nom.toLowerCase().includes(search.toLowerCase());
    const matchStatut = filtreStatut === "tous" || inc.statut === filtreStatut;
    const matchPriorite = filtrePriorite === "tous" || inc.priorite === filtrePriorite;
    return matchSearch && matchStatut && matchPriorite;
  }) || [];

  const stats = {
    nouveau: incidents?.filter(i => i.statut === "nouveau").length || 0,
    en_cours: incidents?.filter(i => i.statut === "en_cours").length || 0,
    en_attente: incidents?.filter(i => i.statut === "en_attente").length || 0,
    resolu: incidents?.filter(i => i.statut === "resolu").length || 0,
  };

  return (
    <DashboardLayout>
      <SEOHead title="Gestion des incidents" description="Suivi et gestion des incidents et réclamations" noIndex />
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl font-bold">Incidents</h1>
            <p className="text-muted-foreground text-sm">Suivi des problèmes et réclamations liés aux logements</p>
          </div>
          <Button className="bg-gradient-gold text-accent-foreground w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" /> Signaler un incident
          </Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Nouveaux", value: stats.nouveau, color: "text-blue-600" },
            { label: "En cours", value: stats.en_cours, color: "text-amber-600" },
            { label: "En attente", value: stats.en_attente, color: "text-orange-600" },
            { label: "Résolus", value: stats.resolu, color: "text-green-600" },
          ].map((s) => (
            <Card key={s.label} className="border-0 shadow-premium">
              <CardContent className="p-4">
                <p className={`text-2xl font-bold font-ui ${s.color}`}>{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Rechercher par titre, logement, client..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={filtreStatut} onValueChange={setFiltreStatut}>
            <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="Statut" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="tous">Tous les statuts</SelectItem>
              <SelectItem value="nouveau">Nouveau</SelectItem>
              <SelectItem value="en_cours">En cours</SelectItem>
              <SelectItem value="en_attente">En attente</SelectItem>
              <SelectItem value="resolu">Résolu</SelectItem>
              <SelectItem value="cloture">Clôturé</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filtrePriorite} onValueChange={setFiltrePriorite}>
            <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="Priorité" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="tous">Toutes priorités</SelectItem>
              <SelectItem value="urgente">Urgente</SelectItem>
              <SelectItem value="haute">Haute</SelectItem>
              <SelectItem value="normale">Normale</SelectItem>
              <SelectItem value="basse">Basse</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card className="border-0 shadow-premium overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-muted-foreground flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Chargement...</div>
          ) : filteredIncidents.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">Aucun incident trouvé.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Incident</TableHead>
                    <TableHead>Logement / Unité</TableHead>
                    <TableHead>Étudiant</TableHead>
                    <TableHead>Priorité</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredIncidents.map((inc) => (
                    <TableRow key={inc.id}>
                      <TableCell>
                        <p className="font-medium">{inc.titre}</p>
                        <p className="text-xs text-muted-foreground capitalize">{inc.categorie}</p>
                        <p className="text-xs text-muted-foreground">{new Date(inc.created_at).toLocaleDateString("fr-FR")}</p>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{inc.logement?.nom || "N/A"}</p>
                        <p className="text-xs text-muted-foreground">{inc.chambre?.nom || "Global"}</p>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{inc.etudiant?.prenom} {inc.etudiant?.nom}</p>
                        <p className="text-xs text-muted-foreground">{inc.etudiant?.telephone}</p>
                      </TableCell>
                      <TableCell>
                        <span className={`text-xs font-semibold ${prioriteConfig[inc.priorite]?.color}`}>{prioriteConfig[inc.priorite]?.label}</span>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={inc.statut}
                          onValueChange={(val: IncidentStatut) => mutationStatut.mutate({ id: inc.id, statut: val })}
                        >
                          <SelectTrigger className={`h-8 text-xs border-0 ${statutConfig[inc.statut].color}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="nouveau">Nouveau</SelectItem>
                            <SelectItem value="en_cours">En cours</SelectItem>
                            <SelectItem value="en_attente">En attente</SelectItem>
                            <SelectItem value="resolu">Résolu</SelectItem>
                            <SelectItem value="cloture">Clôturé</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminIncidents;
