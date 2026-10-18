// Page : Admin - Reversements
// Route : /admin/reversements
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getReversementsEstimes,
  processPaymentReversement,
  generateBordereauReversementHTML,
} from "@/services/reversement-service";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  ArrowLeftRight,
  Search,
  Download,
  TrendingDown,
  CheckCircle,
  Clock,
  Printer,
  Send,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { printDocument } from "@/lib/contract-templates";

const AdminReversements = () => {
  const [search, setSearch] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Dialogue de traitement de reversement
  const [reversementModal, setReversementModal] = useState<{
    open: boolean;
    item: any | null;
  }>({ open: false, item: null });

  const [modeReglement, setModeReglement] = useState("Wave");
  const [refTransaction, setRefTransaction] = useState("");

  // 1. Liste des paiements confirmés éligibles
  const {
    data: paiements,
    isLoading: loadingPaiements,
    isError,
    error,
  } = useQuery({
    queryKey: ["reversements-estimes"],
    queryFn: getReversementsEstimes,
  });

  // 2. Table des reversements réels enregistrés en base
  const { data: realReversements, isLoading: loadingReal } = useQuery({
    queryKey: ["admin-reversements-table"],
    queryFn: async () => {
      const { data, error: err } = await supabase.from("reversements").select("*");
      if (err) return [];
      return data || [];
    },
  });

  const reversementsMap = new Map<string, any>();
  (realReversements || []).forEach((r) => {
    if (r.paiement_id) reversementsMap.set(r.paiement_id, r);
  });

  const confirmes = paiements || [];

  // Calcul des métriques
  const totalEncaisse = confirmes.reduce((s, p) => s + (p.montant || 0), 0);
  const totalAReverser = confirmes.reduce((s, p) => {
    const prixBailleur = (p as any).reservations?.chambres?.prix_bailleur || 0;
    return s + prixBailleur;
  }, 0);
  const totalReversé = confirmes.reduce((s, p) => {
    const rev = reversementsMap.get(p.id);
    if (rev && rev.statut === "traite") {
      return s + (rev.montant || (p as any).reservations?.chambres?.prix_bailleur || 0);
    }
    return s;
  }, 0);
  const totalEnAttente = totalAReverser - totalReversé;
  const margeZeyna = totalEncaisse - totalAReverser;

  // Filtrage
  const filtered = confirmes.filter((p) => {
    if (!search) return true;
    const logNom = (p as any).reservations?.logements?.nom?.toLowerCase() || "";
    const chambreNom = (p as any).reservations?.chambres?.nom?.toLowerCase() || "";
    const bailleurNom = (p as any).reservations?.logements?.bailleur?.nom?.toLowerCase() || "";
    const q = search.toLowerCase();
    return logNom.includes(q) || chambreNom.includes(q) || bailleurNom.includes(q);
  });

  // Mutation pour valider et exécuter un reversement
  const processMutation = useMutation({
    mutationFn: async () => {
      const p = reversementModal.item;
      if (!p) return;
      const res = p.reservations;
      const bailleurId = res?.logements?.bailleur_id;
      const montant = res?.chambres?.prix_bailleur || 0;

      if (!bailleurId) {
        throw new Error("Identifiant du bailleur introuvable pour ce logement.");
      }
      if (!refTransaction || !refTransaction.trim()) {
        throw new Error("Veuillez renseigner la référence de transaction.");
      }

      await processPaymentReversement({
        paiementId: p.id,
        bailleurId,
        montant,
        modeReglement,
        referenceTransaction: refTransaction.trim(),
      });
    },
    onSuccess: () => {
      toast({
        title: "Reversement validé",
        description: "Le reversement a été enregistré avec succès dans le registre des opérations.",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-reversements-table"] });
      queryClient.invalidateQueries({ queryKey: ["reversements-estimes"] });
      setReversementModal({ open: false, item: null });
      setRefTransaction("");
    },
    onError: (err: any) => {
      toast({
        title: "Erreur",
        description: err.message || "Impossible de valider le reversement.",
        variant: "destructive",
      });
    },
  });

  const handlePrintBordereau = (p: any, rev: any) => {
    const res = p.reservations;
    const prixBailleur = rev?.montant || res?.chambres?.prix_bailleur || 0;
    const html = generateBordereauReversementHTML({
      reference: rev?.reference_transaction || `BORD-${p.id.slice(0, 8).toUpperCase()}`,
      date: rev?.date_reversement
        ? format(new Date(rev.date_reversement), "dd/MM/yyyy", { locale: fr })
        : format(new Date(), "dd/MM/yyyy", { locale: fr }),
      bailleur: {
        prenom: res?.logements?.bailleur?.prenom || "Bailleur",
        nom: res?.logements?.bailleur?.nom || "Partenaire",
        telephone: res?.logements?.bailleur?.telephone,
      },
      logement: {
        nom: res?.logements?.nom || "-",
        adresse: res?.logements?.adresse,
        chambre: res?.chambres?.nom,
      },
      montant: prixBailleur,
      modeReglement: rev?.reference_transaction?.includes("OM") ? "Orange Money" : "Wave / Mobile Money",
      referenceTransaction: rev?.reference_transaction || "N/A",
    });
    printDocument(html);
  };

  const handleExport = () => {
    const rows = [
      ["Logement", "Unité", "Bailleur", "Montant client", "Montant bailleur", "Marge Zeyna", "Statut", "Réf Virement", "Date"],
      ...filtered.map((p) => {
        const res = (p as any).reservations;
        const prixBailleur = res?.chambres?.prix_bailleur || 0;
        const rev = reversementsMap.get(p.id);
        const statut = rev && rev.statut === "traite" ? "Reversé" : "En attente";
        const refTx = rev?.reference_transaction || "-";
        return [
          res?.logements?.nom || "-",
          res?.chambres?.nom || "-",
          `${res?.logements?.bailleur?.prenom || ""} ${res?.logements?.bailleur?.nom || ""}`.trim() || "-",
          `${p.montant} FCFA`,
          `${prixBailleur} FCFA`,
          `${p.montant - prixBailleur} FCFA`,
          statut,
          refTx,
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
            <h1 className="font-serif text-2xl font-bold">Circuit de reversements bailleurs</h1>
            <p className="text-muted-foreground text-sm">
              Suivi et exécution traçable des montants dus aux bailleurs partenaires
            </p>
          </div>
          <Button variant="outline" className="w-full sm:w-auto" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" /> Exporter CSV
          </Button>
        </div>

        {/* Métriques */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card className="border-0 shadow-premium">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-muted text-primary"><ArrowLeftRight className="h-4 w-4" /></div>
                <span className="text-sm text-muted-foreground">Total encaissé</span>
              </div>
              <p className="text-xl font-bold font-ui">
                {loadingPaiements ? "-" : `${totalEncaisse.toLocaleString()} FCFA`}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-premium">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700"><CheckCircle className="h-4 w-4" /></div>
                <span className="text-sm text-muted-foreground">Déjà reversé</span>
              </div>
              <p className="text-xl font-bold font-ui text-emerald-700">
                {loadingPaiements ? "-" : `${totalReversé.toLocaleString()} FCFA`}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-premium">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-amber-100 text-amber-700"><Clock className="h-4 w-4" /></div>
                <span className="text-sm text-muted-foreground">En attente de versement</span>
              </div>
              <p className="text-xl font-bold font-ui text-amber-700">
                {loadingPaiements ? "-" : `${totalEnAttente.toLocaleString()} FCFA`}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-premium">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-700"><TrendingDown className="h-4 w-4" /></div>
                <span className="text-sm text-muted-foreground">Marge ZEYNA</span>
              </div>
              <p className="text-xl font-bold font-ui text-blue-700">
                {loadingPaiements ? "-" : `${margeZeyna.toLocaleString()} FCFA`}
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
            {loadingPaiements || loadingReal ? (
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
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((p) => {
                      const res = (p as any).reservations;
                      const prixBailleur = res?.chambres?.prix_bailleur || 0;
                      const marge = p.montant - prixBailleur;
                      const rev = reversementsMap.get(p.id);
                      const isProcessed = rev && rev.statut === "traite";

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
                          <TableCell className="hidden md:table-cell text-amber-700 font-ui font-semibold">
                            {prixBailleur.toLocaleString()} FCFA
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-green-700 font-ui">
                            {marge.toLocaleString()} FCFA
                          </TableCell>
                          <TableCell>
                            {isProcessed ? (
                              <div>
                                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-xs flex items-center gap-1 w-fit">
                                  <CheckCircle2 className="h-3 w-3" /> Reversé
                                </Badge>
                                {rev.reference_transaction && (
                                  <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                                    Réf : {rev.reference_transaction}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-xs">
                                En attente
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {isProcessed ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePrintBordereau(p, rev)}
                              >
                                <Printer className="h-3.5 w-3.5 mr-1" /> Bordereau
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                className="bg-primary text-white"
                                onClick={() => {
                                  setModeReglement("Wave");
                                  setRefTransaction("");
                                  setReversementModal({ open: true, item: p });
                                }}
                              >
                                <Send className="h-3.5 w-3.5 mr-1" /> Reverser
                              </Button>
                            )}
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

      {/* Dialogue d'exécution du reversement */}
      <Dialog
        open={reversementModal.open}
        onOpenChange={(open) => {
          if (!open) setReversementModal({ open: false, item: null });
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg">
              Exécuter le reversement bailleur
            </DialogTitle>
            <DialogDescription>
              Enregistrez le virement ou transfert effectué au bailleur. Cette opération sera tracée dans le registre comptable officiel.
            </DialogDescription>
          </DialogHeader>

          {reversementModal.item && (
            <div className="space-y-4 py-2 text-sm">
              <div className="p-3 bg-muted/40 rounded-xl space-y-1">
                <p className="font-medium text-foreground">
                  Bailleur :{" "}
                  <span className="font-bold">
                    {reversementModal.item.reservations?.logements?.bailleur?.prenom}{" "}
                    {reversementModal.item.reservations?.logements?.bailleur?.nom}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Logement : {reversementModal.item.reservations?.logements?.nom} ({reversementModal.item.reservations?.chambres?.nom})
                </p>
                <div className="pt-2 border-t border-border flex justify-between items-center">
                  <span className="text-xs font-medium">Montant net à reverser :</span>
                  <span className="font-bold text-base text-primary">
                    {(reversementModal.item.reservations?.chambres?.prix_bailleur || 0).toLocaleString()} FCFA
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="mode_reglement" className="text-xs font-semibold">
                  Mode de règlement
                </Label>
                <Select value={modeReglement} onValueChange={setModeReglement}>
                  <SelectTrigger id="mode_reglement">
                    <SelectValue placeholder="Sélectionner le mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Wave">Wave</SelectItem>
                    <SelectItem value="Orange Money">Orange Money</SelectItem>
                    <SelectItem value="Virement Bancaire">Virement Bancaire</SelectItem>
                    <SelectItem value="Chèque">Chèque</SelectItem>
                    <SelectItem value="Espèces">Espèces (Reçu de caisse)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ref_trans" className="text-xs font-semibold">
                  Référence de transaction / Virement <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="ref_trans"
                  placeholder="Ex : TX-WV-94820129 ou VIR-2026-004"
                  value={refTransaction}
                  onChange={(e) => setRefTransaction(e.target.value)}
                />
                <p className="text-[11px] text-muted-foreground">
                  Indiquez le numéro de transaction fourni par Wave, Orange Money ou la banque pour assurer la traçabilité.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              disabled={processMutation.isPending}
              onClick={() => setReversementModal({ open: false, item: null })}
            >
              Annuler
            </Button>
            <Button
              disabled={processMutation.isPending || !refTransaction}
              onClick={() => processMutation.mutate()}
            >
              {processMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Valider et enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AdminReversements;
