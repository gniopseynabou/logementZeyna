import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getAdminUsers, 
  updateAdminUserValidation, 
  getAdminUserStats,
  type AdminUser 
} from "@/services/admin-user-service";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Search, Eye, UserCheck, UserX, Users, GraduationCap, Building, ShieldCheck } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { PaginationControls } from "@/components/ui/PaginationControls";
import { useDebounce } from "@/hooks/use-debounce";

const AdminUtilisateurs = () => {
  const { toast } = useToast();
  const qc = useQueryClient();
  
  // États pour la pagination et filtres
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  
  const debouncedSearch = useDebounce(search, 500);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  // Requête pour les utilisateurs (paginée, gérée côté serveur)
  const { data: usersData, isLoading, isError, error } = useQuery({
    queryKey: ["admin-users", page, pageSize, debouncedSearch, roleFilter],
    queryFn: () => getAdminUsers({
      page,
      pageSize,
      search: debouncedSearch,
      roleFilter
    }),
  });

  // Requête pour les compteurs (légère, juste un count par rôle)
  const { data: stats } = useQuery({
    queryKey: ["admin-users-stats"],
    queryFn: getAdminUserStats,
  });

  const toggleValidation = useMutation({
    mutationFn: ({ id, validated }: { id: string; validated: boolean }) =>
      updateAdminUserValidation(id, validated),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      toast({ title: "Statut mis à jour ✅" });
    },
    onError: (mutationError) => {
      toast({
        title: "Erreur de mise à jour",
        description: mutationError.message,
        variant: "destructive",
      });
    },
  });

  const handleTabChange = (value: string) => {
    setRoleFilter(value);
    setPage(1); // Reset page on filter change
  };

  const roleConfig: Record<string, { label: string; color: string; icon: JSX.Element }> = {
    etudiant: { label: "Étudiant", color: "bg-blue-100 text-blue-800", icon: <GraduationCap className="h-4 w-4" /> },
    bailleur: { label: "Bailleur", color: "bg-amber-100 text-amber-800", icon: <Building className="h-4 w-4" /> },
    admin: { label: "Admin", color: "bg-purple-100 text-purple-800", icon: <ShieldCheck className="h-4 w-4" /> },
    super_admin: { label: "Super Admin", color: "bg-red-100 text-red-800", icon: <ShieldCheck className="h-4 w-4" /> },
  };

  const renderTable = (list: AdminUser[]) => (
    list.length === 0 ? (
      <p className="text-center py-8 text-muted-foreground">Aucun utilisateur trouvé</p>
    ) : (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Utilisateur</TableHead>
              <TableHead className="hidden sm:table-cell">Rôle</TableHead>
              <TableHead className="hidden md:table-cell">Téléphone</TableHead>
              <TableHead className="hidden md:table-cell">Inscription</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((u) => {
              const rc = roleConfig[u.role] || roleConfig.etudiant;
              return (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-primary shrink-0">
                        {u.profile?.prenom?.[0] || "?"}{u.profile?.nom?.[0] || ""}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{u.profile?.prenom} {u.profile?.nom}</p>
                        <p className="text-xs text-muted-foreground sm:hidden">{rc.label}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${rc.color}`}>
                      {rc.icon} {rc.label}
                    </span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                    {u.profile?.telephone || "-"}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                    {format(new Date(u.created_at), "dd MMM yyyy", { locale: fr })}
                  </TableCell>
                  <TableCell>
                    <Badge variant={u.is_validated ? "default" : "secondary"} className="text-xs">
                      {u.is_validated ? "Actif" : "En attente"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => setSelectedUser(u)} title="Détails">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {(u.role !== "admin" && u.role !== "super_admin") && (
                        u.is_validated ? (
                          <Button size="icon" variant="ghost" className="text-destructive" disabled={toggleValidation.isPending} onClick={() => toggleValidation.mutate({ id: u.id, validated: false })} title="Désactiver">
                            <UserX className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button size="icon" variant="ghost" className="text-green-600" disabled={toggleValidation.isPending} onClick={() => toggleValidation.mutate({ id: u.id, validated: true })} title="Valider">
                            <UserCheck className="h-4 w-4" />
                          </Button>
                        )
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    )
  );

  const renderContent = () => {
    if (isLoading) return <p className="p-8 text-center text-muted-foreground">Chargement...</p>;
    if (isError) {
      return (
        <div className="p-8 text-center" role="alert">
          <p>Impossible de charger les utilisateurs.</p>
          <p className="text-sm text-muted-foreground mt-1">
            {error instanceof Error ? error.message : "Une erreur inattendue est survenue."}
          </p>
        </div>
      );
    }
    
    return (
      <>
        {renderTable(usersData?.data || [])}
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
      </>
    );
  };

  const countLabel = (count?: number) => count !== undefined ? count : "-";

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl font-bold">Gestion des utilisateurs</h1>
            <p className="text-muted-foreground text-sm">{countLabel(stats?.all)} utilisateurs au total</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom, prénom..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total", count: countLabel(stats?.all), icon: <Users className="h-5 w-5" />, color: "text-primary" },
            { label: "Étudiants", count: countLabel(stats?.etudiant), icon: <GraduationCap className="h-5 w-5" />, color: "text-blue-600" },
            { label: "Bailleurs", count: countLabel(stats?.bailleur), icon: <Building className="h-5 w-5" />, color: "text-amber-600" },
            { label: "Admins", count: countLabel(stats?.admin), icon: <ShieldCheck className="h-5 w-5" />, color: "text-purple-600" },
          ].map((s) => (
            <Card key={s.label} className="border-0 shadow-premium">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-muted ${s.color}`}>{s.icon}</div>
                <div>
                  <p className="text-xl font-bold font-ui">{s.count}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs value={roleFilter} onValueChange={handleTabChange}>
          <TabsList className="flex-wrap">
            <TabsTrigger value="all">Tous ({countLabel(stats?.all)})</TabsTrigger>
            <TabsTrigger value="etudiant">Étudiants ({countLabel(stats?.etudiant)})</TabsTrigger>
            <TabsTrigger value="bailleur">Bailleurs ({countLabel(stats?.bailleur)})</TabsTrigger>
            <TabsTrigger value="admin">Admins ({countLabel(stats?.admin)})</TabsTrigger>
          </TabsList>

          <div className="mt-4">
            <Card className="border-0 shadow-premium">
              <CardContent className="p-0 sm:p-2">{renderContent()}</CardContent>
            </Card>
          </div>
        </Tabs>
      </div>

      {/* User detail dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif">Détails utilisateur</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center text-lg font-bold text-primary">
                  {selectedUser.profile?.prenom?.[0] || "?"}{selectedUser.profile?.nom?.[0] || ""}
                </div>
                <div>
                  <p className="font-semibold text-lg">{selectedUser.profile?.prenom} {selectedUser.profile?.nom}</p>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${roleConfig[selectedUser.role]?.color}`}>
                    {roleConfig[selectedUser.role]?.icon} {roleConfig[selectedUser.role]?.label}
                  </span>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Téléphone</span>
                  <span className="font-medium">{selectedUser.profile?.telephone || "Non renseigné"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Statut</span>
                  <Badge variant={selectedUser.is_validated ? "default" : "secondary"}>
                    {selectedUser.is_validated ? "Actif" : "En attente"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Inscrit le</span>
                  <span className="font-medium">{format(new Date(selectedUser.created_at), "dd MMMM yyyy", { locale: fr })}</span>
                </div>
              </div>

              {(selectedUser.role !== "admin" && selectedUser.role !== "super_admin") && (
                <div className="pt-2 border-t">
                  {selectedUser.is_validated ? (
                    <Button
                      variant="outline"
                      className="w-full text-destructive border-destructive/30 hover:bg-destructive/10"
                      onClick={() => {
                        toggleValidation.mutate({ id: selectedUser.id, validated: false });
                        setSelectedUser(null);
                      }}
                    >
                      <UserX className="h-4 w-4 mr-2" /> Désactiver cet utilisateur
                    </Button>
                  ) : (
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => {
                        toggleValidation.mutate({ id: selectedUser.id, validated: true });
                        setSelectedUser(null);
                      }}
                    >
                      <UserCheck className="h-4 w-4 mr-2" /> Valider cet utilisateur
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

export default AdminUtilisateurs;
