import { invalidateGroup } from "@/lib/invalidate-helpers";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAdminUsers, getAdminUserStats, updateAdminUserProfile, updateAdminUserValidation, type AdminUser } from "@/services/admin-user-service";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  GraduationCap, Search, Eye, Phone, UserCheck, UserX, Download, Pencil, AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { PaginationControls } from "@/components/ui/PaginationControls";
import { useDebounce } from "@/hooks/use-debounce";

/* ─── Composants de Dialog ─── */
const EditClientProfileDialog = ({
  client,
  onClose,
}: {
  client: AdminUser;
  onClose: () => void;
}) => {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [nom, setNom] = useState(client.profile?.nom ?? "");
  const [prenom, setPrenom] = useState(client.profile?.prenom ?? "");
  const [telephone, setTelephone] = useState(client.profile?.telephone ?? "");

  const update = useMutation({
    mutationFn: () =>
      updateAdminUserProfile(client.user_id, { nom, prenom, telephone }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      toast({ title: "Profil mis à jour ✅" });
      onClose();
    },
    onError: (e) =>
      toast({ title: "Erreur", description: e.message, variant: "destructive" }),
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        update.mutate();
      }}
      className="space-y-4 mt-2"
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Prénom</Label>
          <Input value={prenom} onChange={(e) => setPrenom(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label>Nom</Label>
          <Input value={nom} onChange={(e) => setNom(e.target.value)} required />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Téléphone</Label>
        <Input value={telephone} onChange={(e) => setTelephone(e.target.value)} placeholder="+221 77 000 00 00" />
      </div>
      <div className="flex gap-2 pt-1">
        <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
          Annuler
        </Button>
        <Button type="submit" className="flex-1 bg-accent hover:bg-accent/90 text-white" disabled={update.isPending}>
          {update.isPending ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </div>
    </form>
  );
};

const ClientDetailDialog = ({
  client,
  open,
  onClose,
}: {
  client: AdminUser | null;
  open: boolean;
  onClose: () => void;
}) => {
  const [editing, setEditing] = useState(false);
  const [confirmRevoke, setConfirmRevoke] = useState(false);
  const qc = useQueryClient();
  const { toast } = useToast();

  const toggleValidation = useMutation({
    mutationFn: ({ id, validated }: { id: string; validated: boolean }) =>
      updateAdminUserValidation(id, validated),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      toast({ title: "Statut mis à jour" });
      onClose();
    },
    onError: (e) =>
      toast({ title: "Erreur", description: e.message, variant: "destructive" }),
  });

  if (!client) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={(o) => { if (!o) { onClose(); setEditing(false); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif">
              {editing ? "Modifier le profil" : "Fiche client"}
            </DialogTitle>
          </DialogHeader>

          {editing ? (
            <EditClientProfileDialog client={client} onClose={() => setEditing(false)} />
          ) : (
            <div className="space-y-4">
              {/* Identité */}
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center text-lg font-bold text-blue-700 shrink-0">
                  {client.profile?.prenom?.[0] ?? "?"}{client.profile?.nom?.[0] ?? ""}
                </div>
                <div>
                  <p className="font-semibold text-lg">
                    {client.profile?.prenom} {client.profile?.nom}
                  </p>
                  <Badge variant={client.is_validated ? "default" : "secondary"} className="text-xs mt-0.5">
                    {client.is_validated ? "Validé" : "En attente"}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Téléphone</span>
                  <span className="font-medium flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {client.profile?.telephone || "Non renseigné"}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Inscrit le</span>
                  <span className="font-medium">
                    {format(new Date(client.created_at), "dd MMMM yyyy", { locale: fr })}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Rôle</span>
                  <span className="font-medium">Étudiant / Client</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 pt-2 border-t">
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => setEditing(true)}
                >
                  <Pencil className="h-4 w-4" /> Modifier le profil
                </Button>
                {client.is_validated ? (
                  <Button
                    variant="outline"
                    className="w-full gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
                    onClick={() => setConfirmRevoke(true)}
                  >
                    <UserX className="h-4 w-4" /> Révoquer l'accès
                  </Button>
                ) : (
                  <Button
                    className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => toggleValidation.mutate({ id: client.id, validated: true })}
                  >
                    <UserCheck className="h-4 w-4" /> Valider le compte
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmRevoke} onOpenChange={setConfirmRevoke}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Révoquer l'accès ?</AlertDialogTitle>
            <AlertDialogDescription>
              Le compte de {client.profile?.prenom} {client.profile?.nom} sera désactivé.
              Il ne pourra plus se connecter jusqu'à réactivation manuelle.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => {
                toggleValidation.mutate({ id: client.id, validated: false });
                setConfirmRevoke(false);
              }}
            >
              Révoquer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

/* ─── Page Principale ─── */
const AdminClients = () => {
  const { toast } = useToast();
  const qc = useQueryClient();
  
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  
  const [selectedClient, setSelectedClient] = useState<AdminUser | null>(null);

  const { data: usersData, isLoading, isError, error } = useQuery({
    queryKey: ["admin-users", page, pageSize, debouncedSearch, "etudiant"],
    queryFn: () => getAdminUsers({
      page,
      pageSize,
      search: debouncedSearch,
      roleFilter: "etudiant" // On ne récupère que les étudiants (clients)
    }),
  });

  const { data: stats } = useQuery({
    queryKey: ["admin-users-stats"],
    queryFn: getAdminUserStats,
  });

  const toggleValidation = useMutation({
    mutationFn: ({ id, validated }: { id: string; validated: boolean }) =>
      updateAdminUserValidation(id, validated),
    onSuccess: async () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      toast({ title: "Statut mis à jour" });
    },
    onError: (e) =>
      toast({ title: "Erreur", description: e.message, variant: "destructive" }),
  });

  const clients = usersData?.data || [];

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
              {stats?.etudiant ?? "-"} client(s) enregistré(s)
            </p>
          </div>
          <Button variant="outline" className="w-full sm:w-auto">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>

        {/* Métriques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-0 shadow-premium">
            <CardContent className="p-4">
              <p className="text-2xl font-bold font-ui text-primary">
                {stats?.etudiant ?? "-"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Total Étudiants</p>
            </CardContent>
          </Card>
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
            ) : clients.length === 0 ? (
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
                    {clients.map((u) => (
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
            
            {/* Pagination Controls */}
            {usersData && usersData.pagination.totalPages > 0 && (
              <div className="border-t">
                <PaginationControls
                  currentPage={usersData.pagination.page}
                  totalPages={usersData.pagination.totalPages}
                  pageSize={usersData.pagination.pageSize}
                  totalItems={usersData.pagination.total}
                  onPageChange={setPage}
                  onPageSizeChange={(size) => {
                    setPageSize(size);
                    setPage(1);
                  }}
                  isLoading={isLoading}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ClientDetailDialog
        client={selectedClient}
        open={!!selectedClient}
        onClose={() => setSelectedClient(null)}
      />
    </DashboardLayout>
  );
};

export default AdminClients;
