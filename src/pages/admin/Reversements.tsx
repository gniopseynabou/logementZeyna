// Page : Admin - Reversements
// Route : /admin/reversements
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getReversementsEstimes, updateReversementStatut } from "@/services/reversement-service";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ArrowLeftRight, Search, Download, TrendingDown, CheckCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

const AdminReversements = () => {
  const [search, setSearch] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Utilise les paiements confirmés comme base de calcul (avant peuplement de la table reversements)
  const { data: paiements, isLoading, isError, error } = useQuery({
    queryKey: ["reversements-estimes"],
    queryFn: getReversementsEstimes,
  });

  const confirmes = paiements || [];

  // Calcul des métriques
  const totalEncaisse = confirmes.reduce((s, p) => s + (p.montant || 0), 0);
  const totalAReverser = confirmes.reduce((s, p) => {
    const prixBailleur = (p as any).reservations?.chambres?.prix_bailleur || 0;
    return s + prixBailleur;
  }, 0);
  const margeZeyna = totalEncaisse - totalAReverser;

  const filtered = confirmes.filter((p) => {
    if (!search) return true;
    const logNom = (p as any).reservations?.logements?.nom?.toLowerCase() || "";
    const chambreNom = (p as any).reservations?.chambres?.nom?.toLowerCase() || "";
    const bailleurNom = (p as any).reservations?.logements?.bailleur?.nom?.toLowerCase() || "";
    const q = search.toLowerCase();
    return logNom.includes(q) || chambreNom.includes(q) || bailleurNom.includes(q);
  });

  const handleExport = () => {
    const rows = [
      ["Logement", "Unité", "Bailleur", "Montant client", "Montant bailleur", "Marge Zeyna", "Date"],
      ...filtered.map((p) => {
        const res = (p as any).reservations;
        const prixBailleur = res?.chambres?.prix_bailleur || 0;
        return [
          res?.logements?.nom || "-",
          res?.chambres?.nom || "-",
          `${res?.logements?.bailleur?.prenom || ""} ${res?.logements?.bailleur?.nom || ""}`.trim() || "-",
          `${p.montant} FCFA`,
          `${prixBailleur} FCFA`,
          `${p.montant - prixBailleur} FCFA`,
          format(new Date(p.created_at), "dd/MM/yyyy", { locale: fr }),
        ];
      }),
    ];
    const csv = rows.map((r) => r.join(";")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reversements-zeyna-${format(new Date(), "yyyyMMdd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Export réussi", description: "Le fichier CSV a été téléchargé." });
  };

  return (
    <DashboardLayout>
      <SEOHead
        title="Reversements bailleurs"
        description="Gestion des reversements aux bailleurs - espace administration Zeyna"
        noIndex
      />
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl font-bold">Reversements</h1>
            <p className="text-muted-foreground text-sm">Suivi des montants à reverser aux bailleurs partenaires</p>
          </div>
          <Button variant="outline" className="w-full sm:w-auto" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" /> Exporter CSV
          </Button>
        </div>

        {/* Métriques */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-0 shadow-premium">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-muted text-primary"><ArrowLeftRight className="h-4 w-4" /></div>
                <span className="text-sm text-muted-foreground">Total encaissé</span>
              </div>
              <p className="text-2xl font-bold font-ui">
                {isLoading ? "-" : `${totalEncaisse.toLocaleString()} FCFA`}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-premium">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-amber-100 text-amber-700"><TrendingDown className="h-4 w-4" /></div>
                <span className="text-sm text-muted-foreground">À reverser aux bailleurs</span>
              </div>
              <p className="text-2xl font-bold font-ui text-amber-700">
                {isLoading ? "-" : `${totalAReverser.toLocaleString()} FCFA`}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-premium">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-green-100 text-green-700"><CheckCircle className="h-4 w-4" /></div>
                <span className="text-sm text-muted-foreground">Marge ZEYNA</span>
              </div>
              <p className="text-2xl font-bold font-ui text-green-700">
                {isLoading ? "-" : `${margeZeyna.toLocaleString()} FCFA`}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recherche */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par logement, unité ou bailleur..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Tableau */}
        <Card className="border-0 shadow-premium">
          <CardHeader>
            <CardTitle className="font-serif text-lg">Détail des reversements</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-12 bg-muted animate-pulse rounded" />
                ))}
              </div>
            ) : isError ? (
              <div className="p-12 text-center" role="alert">
                <ArrowLeftRight className="h-8 w-8 mx-auto mb-3 text-destructive opacity-60" />
                <p className="font-medium">Impossible de charger les reversements.</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {error instanceof Error ? error.message : "Une erreur inattendue est survenue."}
                </p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <ArrowLeftRight className="h-8 w-8 mx-auto mb-3 opacity-40" />
                <p>Aucun paiement confirmé trouvé.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Logement / Unité</TableHead>
                      <TableHead className="hidden sm:table-cell">Bailleur</TableHead>
                      <TableHead>Montant client</TableHead>
                      <TableHead className="hidden md:table-cell">Prix bailleur</TableHead>
                      <TableHead className="hidden md:table-cell">Marge</TableHead>
                      <TableHead className="hidden md:table-cell">Date</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((p) => {
                      const res = (p as any).reservations;
                      const prixBailleur = res?.chambres?.prix_bailleur || 0;
                      const marge = p.montant - prixBailleur;
                      return (
                        <TableRow key={p.id}>
                          <TableCell>
                            <p className="font-medium">{res?.logements?.nom || "-"}</p>
                            <p className="text-xs text-muted-foreground">{res?.chambres?.nom || "-"}</p>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-muted-foreground">
                            {res?.logements?.bailleur
                              ? `${res.logements.bailleur.prenom || ""} ${res.logements.bailleur.nom || ""}`.trim()
                              : "-"}
                          </TableCell>
                          <TableCell className="font-ui font-bold">
                            {p.montant.toLocaleString()} FCFA
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-amber-700 font-ui">
                            {prixBailleur.toLocaleString()} FCFA
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-green-700 font-ui">
                            {marge.toLocaleString()} FCFA
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                            {format(new Date(p.created_at), "dd MMM yyyy", { locale: fr })}
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-xs">
                              En attente
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminReversements;
