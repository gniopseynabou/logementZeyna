import { invalidateGroup } from "@/lib/invalidate-helpers";
// Page : Admin - Clients / Étudiants
// Route : /admin/clients
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAdminUsers } from "@/services/admin-user-service";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  GraduationCap,
  Search,
  Eye,
  Phone,
  UserCheck,
  UserX,
  Download,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { AdminUser } from "@/services/admin-user-service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateAdminUserValidation } from "@/services/admin-user-service";
import { useToast } from "@/hooks/use-toast";

const AdminClients = () => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState<AdminUser | null>(null);

  const { data: users, isLoading, isError, error } = useQuery({
    queryKey: ["admin-all-users"],
    queryFn: getAdminUsers,
  });

  const toggleValidation = useMutation({
    mutationFn: ({ id, validated }: { id: string; validated: boolean }) =>
      updateAdminUserValidation(id, validated),
    onSuccess: async () => {
      await invalidateGroup(qc, "BAILLEUR_CHANGED");
      toast({ title: "Statut mis à jour" });
    },
    onError: (e) =>
      toast({ title: "Erreur", description: e.message, variant: "destructive" }),
  });

  const etudiants = (users || []).filter((u) => u.role === "etudiant");
  const filtered = etudiants.filter((u) => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return (
      u.profile?.nom?.toLowerCase().includes(s) ||
      u.profile?.prenom?.toLowerCase().includes(s) ||
      u.profile?.telephone?.toLowerCase().includes(s)
    );
  });

  const actifs = filtered.filter((u) => u.is_validated).length;
  const enAttente = filtered.filter((u) => !u.is_validated).length;

  return (
    <DashboardLayout>
      <SEOHead
        title="Clients & Étudiants"
        description="Gestion des clients et étudiants - espace administration Zeyna"
        noIndex
      />

      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl font-bold">
              Clients &amp; Étudiants
            </h1>
            <p className="text-muted-foreground text-sm">
              {isLoading || isError ? "-" : `${etudiants.length} client(s) enregistré(s)`}
            </p>
          </div>
          <Button variant="outline" className="w-full sm:w-auto">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>

        {/* Métriques */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total", value: isLoading ? "-" : etudiants.length, color: "text-primary" },
            { label: "Actifs", value: isLoading ? "-" : actifs, color: "text-green-600" },
            { label: "En attente", value: isLoading ? "-" : enAttente, color: "text-amber-600" },
          ].map((s) => (
            <Card key={s.label} className="border-0 shadow-premium">
              <CardContent className="p-4">
                <p className={`text-2xl font-bold font-ui ${s.color}`}>
                  {s.value}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recherche */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom, prénom, téléphone..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Tableau */}
        <Card className="border-0 shadow-premium">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-12 bg-muted animate-pulse rounded" />
                ))}
              </div>
            ) : isError ? (
              <div className="p-8 text-center" role="alert">
                <p>Impossible de charger les clients.</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {error instanceof Error ? error.message : "Erreur inattendue."}
                </p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <GraduationCap className="h-8 w-8 mx-auto mb-3 opacity-40" />
                <p>Aucun client trouvé</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead className="hidden sm:table-cell">Téléphone</TableHead>
                      <TableHead className="hidden md:table-cell">Inscription</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-700 shrink-0">
                              {u.profile?.prenom?.[0] || "?"}
                              {u.profile?.nom?.[0] || ""}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium truncate">
                                {u.profile?.prenom} {u.profile?.nom}
                              </p>
                              <p className="text-xs text-muted-foreground sm:hidden">
                                {u.profile?.telephone || "Pas de téléphone"}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {u.profile?.telephone || "-"}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                          {format(new Date(u.created_at), "dd MMM yyyy", { locale: fr })}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={u.is_validated ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {u.is_validated ? "Actif" : "En attente"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => setSelectedClient(u)}
                              title="Voir le détail"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {u.is_validated ? (
                              <Button
                                size="icon"
                                variant="ghost"
                                className="text-destructive"
                                disabled={toggleValidation.isPending}
                                onClick={() =>
                                  toggleValidation.mutate({ id: u.id, validated: false })
                                }
                                title="Désactiver"
                              >
                                <UserX className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button
                                size="icon"
                                variant="ghost"
                                className="text-green-600"
                                disabled={toggleValidation.isPending}
                                onClick={() =>
                                  toggleValidation.mutate({ id: u.id, validated: true })
                                }
                                title="Valider"
                              >
                                <UserCheck className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modale détail client */}
      <Dialog open={!!selectedClient} onOpenChange={() => setSelectedClient(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif">Fiche client</DialogTitle>
          </DialogHeader>
          {selectedClient && (
            <div className="space-y-5">
              {/* Identité */}
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center text-lg font-bold text-blue-700">
                  {selectedClient.profile?.prenom?.[0] || "?"}
                  {selectedClient.profile?.nom?.[0] || ""}
                </div>
                <div>
                  <p className="font-semibold text-lg">
                    {selectedClient.profile?.prenom} {selectedClient.profile?.nom}
                  </p>
                  <Badge
                    variant={selectedClient.is_validated ? "default" : "secondary"}
                    className="text-xs mt-1"
                  >
                    {selectedClient.is_validated ? "Actif" : "En attente de validation"}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Téléphone</span>
                  <span className="font-medium">
                    {selectedClient.profile?.telephone || "Non renseigné"}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Inscrit le</span>
                  <span className="font-medium">
                    {format(new Date(selectedClient.created_at), "dd MMMM yyyy", { locale: fr })}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Rôle</span>
                  <span className="font-medium">Étudiant / Client</span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
                Pour voir les réservations et paiements de ce client, rendez-vous dans le module Réservations ou Paiements en filtrant par client.
              </p>

              {selectedClient.role !== "admin" && (
                <div className="pt-2 border-t">
                  {selectedClient.is_validated ? (
                    <Button
                      variant="outline"
                      className="w-full text-destructive border-destructive/30 hover:bg-destructive/10"
                      onClick={() => {
                        toggleValidation.mutate({ id: selectedClient.id, validated: false });
                        setSelectedClient(null);
                      }}
                    >
                      <UserX className="h-4 w-4 mr-2" />
                      Désactiver ce compte
                    </Button>
                  ) : (
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => {
                        toggleValidation.mutate({ id: selectedClient.id, validated: true });
                        setSelectedClient(null);
                      }}
                    >
                      <UserCheck className="h-4 w-4 mr-2" />
                      Valider ce compte
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AdminClients;
