import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminLogements,
  LogementStatus,
  updateAdminLogementStatus,
  toggleLogementDisponibilite,
  toggleChambreDisponibilite,
} from "@/services/logement-service";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { invalidateGroup } from "@/lib/invalidate-helpers";
import {
  EditLogementDialog,
  EditableLogement,
} from "@/components/admin/EditLogementDialog";
import { DeleteLogementDialog } from "@/components/admin/DeleteLogementDialog";
import {
  MapPin,
  Plus,
  Search,
  SlidersHorizontal,
  Home,
  CheckCircle2,
  XCircle,
  PauseCircle,
  Pencil,
  Trash2,
  ChevronDown,
  BedDouble,
  Image as ImageIcon,
  Check,
  AlertCircle,
} from "lucide-react";

const AdminLogements = () => {
  const { toast } = useToast();
  const qc = useQueryClient();

  // Search & Filter state
  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedDispo, setSelectedDispo] = useState("all");
  const [expandedLogements, setExpandedLogements] = useState<Record<string, boolean>>({});

  // Dialog states
  const [editingLogement, setEditingLogement] = useState<EditableLogement | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deletingLogement, setDeletingLogement] = useState<{
    id: string;
    nom: string;
    chambres?: any[];
  } | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data: logements, isLoading, isError, error } = useQuery({
    queryKey: ["admin-all-logements"],
    queryFn: getAdminLogements,
  });

  // Mutation: Change status (Valider, Suspendre, Rejeter)
  const updateStatut = useMutation({
    mutationFn: ({ id, statut }: { id: string; statut: LogementStatus }) =>
      updateAdminLogementStatus(id, statut),
    onSuccess: async (_, variables) => {
      await invalidateGroup(qc, "LOGEMENT_CHANGED");
      const label =
        variables.statut === "valide"
          ? "Logement validé et publié ✅"
          : variables.statut === "rejete"
          ? "Logement rejeté 🚫"
          : "Logement suspendu ⏸️";
      toast({ title: label });
    },
    onError: (err) => {
      toast({
        title: "Erreur lors du changement de statut",
        description: err instanceof Error ? err.message : "Erreur inattendue",
        variant: "destructive",
      });
    },
  });

  // Mutation: Toggle entire logement availability
  const toggleGlobalDispo = useMutation({
    mutationFn: ({ id, estDisponible }: { id: string; estDisponible: boolean }) =>
      toggleLogementDisponibilite(id, estDisponible),
    onSuccess: async (_, variables) => {
      await invalidateGroup(qc, "LOGEMENT_CHANGED");
      toast({
        title: variables.estDisponible
          ? "Toutes les chambres marquées disponibles ✅"
          : "Toutes les chambres marquées indisponibles / complètes 🔒",
      });
    },
    onError: (err) => {
      toast({
        title: "Erreur de disponibilité",
        description: err instanceof Error ? err.message : "Erreur inattendue",
        variant: "destructive",
      });
    },
  });

  // Mutation: Toggle single room availability
  const toggleChambreDispo = useMutation({
    mutationFn: ({ id, estDisponible }: { id: string; estDisponible: boolean }) =>
      toggleChambreDisponibilite(id, estDisponible),
    onSuccess: async () => {
      await invalidateGroup(qc, "LOGEMENT_CHANGED");
      toast({ title: "Disponibilité de la chambre mise à jour ✅" });
    },
    onError: (err) => {
      toast({
        title: "Erreur de chambre",
        description: err instanceof Error ? err.message : "Erreur inattendue",
        variant: "destructive",
      });
    },
  });

  const toggleExpand = (id: string) => {
    setExpandedLogements((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Filtered dataset
  const filteredLogements = useMemo(() => {
    if (!logements) return [];
    return logements.filter((l) => {
      // Search
      const searchMatch =
        !search.trim() ||
        l.nom.toLowerCase().includes(search.toLowerCase()) ||
        l.adresse.toLowerCase().includes(search.toLowerCase()) ||
        l.ville.toLowerCase().includes(search.toLowerCase());

      // City
      const cityMatch = selectedCity === "all" || l.ville.toLowerCase() === selectedCity.toLowerCase();

      // Availability (at least one room available)
      const hasAvailableRoom = (l.chambres || []).some((c: any) => c.est_disponible);
      const dispoMatch =
        selectedDispo === "all" ||
        (selectedDispo === "disponible" && hasAvailableRoom) ||
        (selectedDispo === "indisponible" && !hasAvailableRoom);

      return searchMatch && cityMatch && dispoMatch;
    });
  }, [logements, search, selectedCity, selectedDispo]);

  const enAttente = useMemo(() => filteredLogements.filter((l) => l.statut === "en_attente"), [filteredLogements]);
  const valides = useMemo(() => filteredLogements.filter((l) => l.statut === "valide"), [filteredLogements]);
  const rejetes = useMemo(() => filteredLogements.filter((l) => l.statut === "rejete"), [filteredLogements]);

  const renderLogementCard = (l: any) => {
    const totalChambres = l.chambres?.length || 0;
    const disponiblesCount = (l.chambres || []).filter((c: any) => c.est_disponible).length;
    const isGloballyAvailable = disponiblesCount > 0;
    const isExpanded = !!expandedLogements[l.id];
    const firstImage = l.images && l.images.length > 0 ? l.images[0] : null;

    return (
      <Card key={l.id} className="border-0 shadow-premium overflow-hidden transition-all hover:shadow-lg">
        <CardContent className="p-0">
          <div className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Visual thumbnail & primary info */}
            <div className="flex items-start gap-3 sm:gap-4 min-w-0">
              <div className="relative w-16 h-16 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-muted flex-shrink-0 border">
                {firstImage ? (
                  <img
                    src={firstImage}
                    alt={l.nom}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/60">
                    <Home className="h-6 w-6 sm:h-7 sm:w-7" />
                  </div>
                )}
                {l.images && l.images.length > 0 && (
                  <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1">
                    <ImageIcon className="h-2.5 w-2.5" />
                    {l.images.length}
                  </span>
                )}
              </div>

              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-serif font-bold text-base sm:text-lg text-foreground hover:text-accent transition truncate max-w-[220px] sm:max-w-none">
                    <Link to={`/logements/${l.id}`} target="_blank" rel="noopener noreferrer">
                      {l.nom}
                    </Link>
                  </h3>
                  <Badge variant="outline" className="text-[10px] sm:text-xs uppercase font-medium">
                    {l.type}
                  </Badge>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 text-accent shrink-0" />
                  <span className="truncate">{l.adresse}, {l.ville}</span>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2 pt-1 flex-wrap text-xs">
                  {/* Status Badge */}
                  <Badge
                    variant={
                      l.statut === "valide"
                        ? "default"
                        : l.statut === "rejete"
                        ? "destructive"
                        : "secondary"
                    }
                    className="font-medium text-[11px]"
                  >
                    {l.statut === "valide" ? "Validé" : l.statut === "rejete" ? "Rejeté" : "En attente"}
                  </Badge>

                  {/* Availability Badge */}
                  <Badge
                    variant="outline"
                    className={`text-[11px] ${
                      isGloballyAvailable
                        ? "border-emerald-500/30 text-emerald-600 bg-emerald-50/50"
                        : "border-destructive/30 text-destructive bg-destructive/10"
                    }`}
                  >
                    <span
                      className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${
                        isGloballyAvailable ? "bg-emerald-500" : "bg-destructive"
                      }`}
                    />
                    {isGloballyAvailable
                      ? `${disponiblesCount}/${totalChambres} dispo`
                      : "Complet / Indisponible"}
                  </Badge>

                  {l.conditions_electricite && (
                    <span className="text-muted-foreground hidden sm:inline truncate max-w-xs text-[11px]">
                      • {l.conditions_electricite}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Action controls */}
            <div className="flex flex-col sm:flex-row lg:flex-row items-stretch sm:items-center flex-wrap gap-2 pt-3 lg:pt-0 border-t lg:border-t-0 justify-between lg:justify-end">
              {/* Global Availability Switch */}
              <div className="flex items-center justify-between sm:justify-start gap-2 bg-muted/30 px-3 py-1.5 rounded-lg border text-xs">
                <span className="text-muted-foreground font-medium">Disponibilité :</span>
                <span
                  className={
                    isGloballyAvailable
                      ? "text-emerald-600 font-semibold"
                      : "text-muted-foreground font-semibold"
                  }
                >
                  {isGloballyAvailable ? "Disponible" : "Indisponible"}
                </span>
                <Switch
                  checked={isGloballyAvailable}
                  disabled={toggleGlobalDispo.isPending || totalChambres === 0}
                  onCheckedChange={(checked) =>
                    toggleGlobalDispo.mutate({ id: l.id, estDisponible: checked })
                  }
                  title="Activer ou désactiver la disponibilité de toutes les chambres du logement"
                />
              </div>

              {/* Status Action Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap justify-end">
                {l.statut === "en_attente" && (
                  <>
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1 h-8 text-xs"
                      disabled={updateStatut.isPending}
                      onClick={() => updateStatut.mutate({ id: l.id, statut: "valide" })}
                    >
                      <Check className="h-3.5 w-3.5" /> Valider
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive border-destructive/30 hover:bg-destructive/10 h-8 text-xs"
                      disabled={updateStatut.isPending}
                      onClick={() => updateStatut.mutate({ id: l.id, statut: "rejete" })}
                    >
                      <XCircle className="h-3.5 w-3.5" /> Rejeter
                    </Button>
                  </>
                )}

                {l.statut === "valide" && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-amber-600 border-amber-500/30 hover:bg-amber-50 h-8 text-xs gap-1"
                      disabled={updateStatut.isPending}
                      onClick={() => updateStatut.mutate({ id: l.id, statut: "en_attente" })}
                      title="Suspendre la visibilité du logement dans le catalogue"
                    >
                      <PauseCircle className="h-3.5 w-3.5" /> Suspendre
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive border-destructive/30 hover:bg-destructive/10 h-8 text-xs"
                      disabled={updateStatut.isPending}
                      onClick={() => updateStatut.mutate({ id: l.id, statut: "rejete" })}
                    >
                      Rejeter
                    </Button>
                  </>
                )}

                {l.statut === "rejete" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-emerald-600 border-emerald-500/30 hover:bg-emerald-50 h-8 text-xs gap-1"
                    disabled={updateStatut.isPending}
                    onClick={() => updateStatut.mutate({ id: l.id, statut: "valide" })}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> Réactiver
                  </Button>
                )}

                {/* Modifier */}
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 h-8 text-xs font-medium"
                  onClick={() => {
                    setEditingLogement(l);
                    setIsEditDialogOpen(true);
                  }}
                  title="Modifier les détails, prix et chambres du logement"
                >
                  <Pencil className="h-3.5 w-3.5 text-accent" /> Modifier
                </Button>

                {/* Supprimer */}
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    setDeletingLogement({
                      id: l.id,
                      nom: l.nom,
                      chambres: l.chambres,
                    });
                    setIsDeleteDialogOpen(true);
                  }}
                  title="Supprimer définitivement ce logement"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Collapsible Room Details */}
          {totalChambres > 0 && (
            <Collapsible open={isExpanded} onOpenChange={() => toggleExpand(l.id)}>
              <div className="bg-muted/10 border-t px-5 py-2 flex items-center justify-between text-xs">
                <CollapsibleTrigger asChild>
                  <button className="flex items-center gap-1.5 font-medium text-muted-foreground hover:text-foreground transition">
                    <BedDouble className="h-3.5 w-3.5" />
                    <span>Détail des {totalChambres} chambre(s)</span>
                    <ChevronDown
                      className={`h-3.5 w-3.5 transition-transform duration-200 ${
                        isExpanded ? "transform rotate-180" : ""
                      }`}
                    />
                  </button>
                </CollapsibleTrigger>
                <span className="text-muted-foreground">
                  {disponiblesCount} disponible(s) sur {totalChambres}
                </span>
              </div>

              <CollapsibleContent>
                <div className="px-5 py-3 bg-muted/5 border-t space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {l.chambres.map((chambre: any) => (
                      <div
                        key={chambre.id}
                        className="bg-card border rounded-lg p-3 flex items-center justify-between gap-3 text-xs shadow-sm"
                      >
                        <div className="space-y-0.5 min-w-0">
                          <p className="font-semibold text-foreground truncate">{chambre.nom}</p>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <span>Loyer : <strong className="text-accent">{Number(chambre.prix_zeyna || 0).toLocaleString()} F</strong></span>
                            <span>(Bailleur: {Number(chambre.prix_bailleur || 0).toLocaleString()} F)</span>
                          </div>
                          <p className="text-[11px] text-muted-foreground">
                            Marge : {(Number(chambre.prix_zeyna || 0) - Number(chambre.prix_bailleur || 0)).toLocaleString()} F • Caution: {Number(chambre.caution || 0).toLocaleString()} F
                          </p>
                        </div>

                        {/* Room Individual Switch */}
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <Switch
                            checked={chambre.est_disponible}
                            disabled={toggleChambreDispo.isPending}
                            onCheckedChange={(checked) =>
                              toggleChambreDispo.mutate({
                                id: chambre.id,
                                estDisponible: checked,
                              })
                            }
                            title={chambre.est_disponible ? "Marquer occupé" : "Marquer disponible"}
                          />
                          <span
                            className={`text-[10px] font-semibold ${
                              chambre.est_disponible ? "text-emerald-600" : "text-destructive"
                            }`}
                          >
                            {chambre.est_disponible ? "Dispo" : "Occupé"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderList = (list: any[]) => {
    if (list.length === 0) {
      return (
        <Card className="border-0 shadow-premium">
          <CardContent className="py-12 text-center space-y-3">
            <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground font-medium">Aucun logement trouvé.</p>
            {(search || selectedCity !== "all" || selectedDispo !== "all") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch("");
                  setSelectedCity("all");
                  setSelectedDispo("all");
                }}
              >
                Réinitialiser les filtres
              </Button>
            )}
          </CardContent>
        </Card>
      );
    }

    return <div className="space-y-4">{list.map(renderLogementCard)}</div>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="font-serif text-2xl font-bold">Gestion des logements</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Supervisez, modifiez, suspendez et gérez les disponibilités de l'ensemble du parc.
            </p>
          </div>
          <Button asChild className="bg-accent hover:bg-accent/90 text-white gap-2 shadow-sm">
            <Link to="/admin/logements/nouveau">
              <Plus className="h-4 w-4" /> Ajouter un logement
            </Link>
          </Button>
        </div>

        {/* Filter and Search Bar */}
        <Card className="border-0 shadow-premium">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Search input */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom, ville, adresse..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 text-sm"
                />
              </div>

              {/* City filter */}
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Toutes les villes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les villes</SelectItem>
                  <SelectItem value="Saint-Louis">Saint-Louis</SelectItem>
                  <SelectItem value="Dakar">Dakar</SelectItem>
                  <SelectItem value="Thiès">Thiès</SelectItem>
                  <SelectItem value="Mbour">Mbour</SelectItem>
                  <SelectItem value="Ziguinchor">Ziguinchor</SelectItem>
                </SelectContent>
              </Select>

              {/* Availability filter */}
              <Select value={selectedDispo} onValueChange={setSelectedDispo}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Disponibilité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes disponibilités</SelectItem>
                  <SelectItem value="disponible">🟢 Uniquement disponibles</SelectItem>
                  <SelectItem value="indisponible">🔴 Uniquement complets / indispos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Area */}
        {isError ? (
          <Card className="border-0 shadow-premium" role="alert">
            <CardContent className="py-12 text-center space-y-2">
              <AlertCircle className="h-8 w-8 text-destructive mx-auto" />
              <p className="font-semibold">Impossible de charger les logements.</p>
              <p className="text-sm text-muted-foreground">
                {error instanceof Error ? error.message : "Une erreur inattendue est survenue."}
              </p>
            </CardContent>
          </Card>
        ) : isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-28 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        ) : (
          <Tabs defaultValue="tous" className="w-full">
            <TabsList className="w-full sm:w-auto grid grid-cols-2 sm:grid-cols-4 h-auto p-1 gap-1 max-w-xl">
              <TabsTrigger value="tous" className="text-xs sm:text-sm py-1.5">
                Tous ({filteredLogements.length})
              </TabsTrigger>
              <TabsTrigger value="valides" className="text-xs sm:text-sm py-1.5">
                Validés ({valides.length})
              </TabsTrigger>
              <TabsTrigger value="en_attente" className="text-xs sm:text-sm py-1.5">
                En attente ({enAttente.length})
              </TabsTrigger>
              <TabsTrigger value="rejetes" className="text-xs sm:text-sm py-1.5">
                Rejetés ({rejetes.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tous" className="mt-4">
              {renderList(filteredLogements)}
            </TabsContent>
            <TabsContent value="valides" className="mt-4">
              {renderList(valides)}
            </TabsContent>
            <TabsContent value="en_attente" className="mt-4">
              {renderList(enAttente)}
            </TabsContent>
            <TabsContent value="rejetes" className="mt-4">
              {renderList(rejetes)}
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Edit Logement Dialog */}
      <EditLogementDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        logement={editingLogement}
        onSaved={() => setEditingLogement(null)}
      />

      {/* Delete Logement Dialog */}
      <DeleteLogementDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        logement={deletingLogement}
        onDeleted={() => setDeletingLogement(null)}
      />
    </DashboardLayout>
  );
};

export default AdminLogements;
