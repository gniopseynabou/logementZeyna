import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getReceipts,
  createManualReceipt,
  getOperationsRegister,
  RecuPaiement,
  OperationRegistre,
} from "@/services/receipt-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Receipt,
  Plus,
  Printer,
  Download,
  Search,
  BookOpen,
  ArrowDownLeft,
  ArrowUpRight,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { generateRecuPaiementHTML, printDocument } from "@/lib/contract-templates";

export const OperationsAndReceiptsManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeSubTab, setActiveSubTab] = useState<"recus" | "registre">("recus");
  const [search, setSearch] = useState("");

  // Modal d'émission de reçu manuel
  const [manualReceiptOpen, setManualReceiptOpen] = useState(false);
  const [payeurNom, setPayeurNom] = useState("");
  const [payeurTel, setPayeurTel] = useState("");
  const [payeurEmail, setPayeurEmail] = useState("");
  const [montant, setMontant] = useState<number>(0);
  const [motif, setMotif] = useState("");
  const [methodePaiement, setMethodePaiement] = useState("Wave");
  const [refPaiement, setRefPaiement] = useState("");
  const [typeRecu, setTypeRecu] = useState<"caution" | "loyer" | "frais_dossier" | "manuel" | "autre">("loyer");
  const [observations, setObservations] = useState("");

  // 1. Requête des reçus
  const { data: receipts, isLoading: loadingReceipts } = useQuery({
    queryKey: ["admin-all-receipts"],
    queryFn: () => getReceipts(),
  });

  // 2. Requête du registre des opérations
  const { data: operations, isLoading: loadingOperations } = useQuery({
    queryKey: ["admin-operations-register"],
    queryFn: () => getOperationsRegister(),
  });

  // Mutation d'émission de reçu manuel
  const createReceiptMutation = useMutation({
    mutationFn: async () => {
      if (!payeurNom || !motif || !montant) {
        throw new Error("Nom du payeur, motif et montant sont requis.");
      }
      return await createManualReceipt({
        payeurNomComplet: payeurNom.trim(),
        payeurTelephone: payeurTel.trim() || undefined,
        payeurEmail: payeurEmail.trim() || undefined,
        montant,
        motif: motif.trim(),
        methodePaiement,
        referencePaiement: refPaiement.trim() || undefined,
        typeRecu,
        observations: observations.trim() || undefined,
      });
    },
    onSuccess: (newRecu) => {
      toast({
        title: "Reçu émis avec succès",
        description: `Le reçu ${newRecu.reference} a été enregistré dans le registre des opérations.`,
      });
      queryClient.invalidateQueries({ queryKey: ["admin-all-receipts"] });
      queryClient.invalidateQueries({ queryKey: ["admin-operations-register"] });
      setManualReceiptOpen(false);
      resetManualForm();

      // Proposer immédiatement l'impression
      handlePrintReceipt(newRecu);
    },
    onError: (err: any) => {
      toast({
        title: "Erreur",
        description: err.message || "Impossible de créer le reçu.",
        variant: "destructive",
      });
    },
  });

  const resetManualForm = () => {
    setPayeurNom("");
    setPayeurTel("");
    setPayeurEmail("");
    setMontant(0);
    setMotif("");
    setMethodePaiement("Wave");
    setRefPaiement("");
    setTypeRecu("loyer");
    setObservations("");
  };

  const handlePrintReceipt = (r: RecuPaiement) => {
    const html = generateRecuPaiementHTML({
      reference: r.reference,
      dateEmission: format(new Date(r.date_emission), "dd/MM/yyyy", { locale: fr }),
      payeur: {
        prenom: "",
        nom: r.payeur_nom_complet,
        telephone: r.payeur_telephone || undefined,
        email: r.payeur_email || undefined,
        qualite: "Bénéficiaire / Payeur",
      },
      logement: {
        nom: r.logements?.nom || "Non spécifié",
        adresse: r.logements?.adresse,
        chambre: r.chambres?.nom,
      },
      typeRecu: r.type_recu,
      typeGeneration: r.type_generation,
      montant: r.montant,
      methodePaiement: r.methode_paiement,
      referencePaiement: r.reference_paiement || undefined,
      motif: r.motif,
      observations: r.details_json?.observations,
    });
    printDocument(html);
  };

  const handleExportJournalCSV = () => {
    const rows = [
      ["Date", "Réf Opération", "Type", "Montant (FCFA)", "Mode Règlement", "Réf Externe", "Description", "Statut"],
      ...(operations || []).map((op) => [
        format(new Date(op.date_operation), "dd/MM/yyyy HH:mm", { locale: fr }),
        op.reference_operation,
        op.type_operation,
        op.montant.toString(),
        op.mode_reglement,
        op.reference_externe || "-",
        `"${op.description.replace(/"/g, '""')}"`,
        op.statut,
      ]),
    ];

    const csv = rows.map((r) => r.join(";")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `registre-operations-zeyna-${format(new Date(), "yyyyMMdd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Journal exporté", description: "Le registre des opérations a été exporté en CSV." });
  };

  const filteredReceipts = (receipts || []).filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.reference.toLowerCase().includes(q) ||
      r.payeur_nom_complet.toLowerCase().includes(q) ||
      r.motif.toLowerCase().includes(q) ||
      (r.logements?.nom || "").toLowerCase().includes(q)
    );
  });

  const filteredOperations = (operations || []).filter((op) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      op.reference_operation.toLowerCase().includes(q) ||
      op.description.toLowerCase().includes(q) ||
      op.type_operation.toLowerCase().includes(q) ||
      (op.reference_externe || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Barre d'actions et sous-onglets */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-muted p-1 rounded-xl">
          <Button
            variant={activeSubTab === "recus" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveSubTab("recus")}
            className="flex items-center gap-1.5"
          >
            <Receipt className="h-4 w-4" />
            <span>Reçus de paiement ({receipts?.length || 0})</span>
          </Button>
          <Button
            variant={activeSubTab === "registre" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveSubTab("registre")}
            className="flex items-center gap-1.5"
          >
            <BookOpen className="h-4 w-4" />
            <span>Registre des opérations ({operations?.length || 0})</span>
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {activeSubTab === "registre" && (
            <Button variant="outline" size="sm" onClick={handleExportJournalCSV}>
              <Download className="h-4 w-4 mr-1.5" /> Exporter le Registre (CSV)
            </Button>
          )}
          <Button size="sm" onClick={() => setManualReceiptOpen(true)}>
            <Plus className="h-4 w-4 mr-1.5" /> Émettre un reçu manuel
          </Button>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={
            activeSubTab === "recus"
              ? "Rechercher un reçu par réf, payeur, logement ou motif..."
              : "Rechercher dans le journal par réf, type, description..."
          }
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* ── SOUS-ONGLET 1 : REÇUS DE PAIEMENT ── */}
      {activeSubTab === "recus" && (
        <Card className="border-0 shadow-premium">
          <CardHeader>
            <CardTitle className="font-serif text-lg flex items-center justify-between">
              <span>Reçus officiels émis</span>
              <span className="text-xs font-normal text-muted-foreground font-ui">
                Modèles conformes et quittances libératoires
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loadingReceipts ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />
                ))}
              </div>
            ) : filteredReceipts.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <Receipt className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p>Aucun reçu enregistré pour le moment.</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Les reçus sont émis automatiquement lors de la validation des paiements ou manuellement via le bouton ci-dessus.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Réf Reçu</TableHead>
                      <TableHead>Bénéficiaire / Payeur</TableHead>
                      <TableHead>Nature & Motif</TableHead>
                      <TableHead>Mode & Date</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReceipts.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-mono text-xs font-bold text-primary">
                          {r.reference}
                        </TableCell>
                        <TableCell>
                          <p className="font-medium text-sm">{r.payeur_nom_complet}</p>
                          {r.payeur_telephone && (
                            <p className="text-xs text-muted-foreground">{r.payeur_telephone}</p>
                          )}
                        </TableCell>
                        <TableCell>
                          <p className="text-xs font-medium truncate max-w-[200px]">{r.motif}</p>
                          {r.logements?.nom && (
                            <p className="text-[11px] text-muted-foreground">
                              {r.logements.nom} {r.chambres?.nom ? `· ${r.chambres.nom}` : ""}
                            </p>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-xs block font-medium">{r.methode_paiement}</span>
                          <span className="text-[11px] text-muted-foreground">
                            {format(new Date(r.date_emission), "dd/MM/yyyy", { locale: fr })}
                          </span>
                        </TableCell>
                        <TableCell className="font-ui font-bold text-sm">
                          {r.montant.toLocaleString()} FCFA
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              r.type_generation === "automatique"
                                ? "bg-blue-50 text-blue-700 border-blue-200 text-[10px]"
                                : "bg-purple-50 text-purple-700 border-purple-200 text-[10px]"
                            }
                          >
                            {r.type_generation === "automatique" ? "Automatique" : "Manuel"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePrintReceipt(r)}
                          >
                            <Printer className="h-3.5 w-3.5 mr-1" /> Imprimer
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── SOUS-ONGLET 2 : REGISTRE DES OPÉRATIONS (JOURNAL COMPTABLE) ── */}
      {activeSubTab === "registre" && (
        <Card className="border-0 shadow-premium">
          <CardHeader>
            <CardTitle className="font-serif text-lg flex items-center justify-between">
              <span>Journal centralisé des flux financiers</span>
              <span className="text-xs font-normal text-muted-foreground font-ui">
                Traçabilité intégrale des encaissements et reversements
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loadingOperations ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 bg-muted animate-pulse rounded" />
                ))}
              </div>
            ) : filteredOperations.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p>Aucune écriture dans le registre des opérations pour l'instant.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Heure</TableHead>
                      <TableHead>Réf Opération</TableHead>
                      <TableHead>Type de flux</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Mode / Réf Externe</TableHead>
                      <TableHead className="text-right">Montant</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOperations.map((op) => {
                      const isCredit =
                        op.type_operation === "encaissement_etudiant" ||
                        op.type_operation === "recu_manuel";
                      return (
                        <TableRow key={op.id}>
                          <TableCell className="text-xs text-muted-foreground">
                            {format(new Date(op.date_operation), "dd/MM/yyyy HH:mm", { locale: fr })}
                          </TableCell>
                          <TableCell className="font-mono text-xs font-bold">
                            {op.reference_operation}
                          </TableCell>
                          <TableCell>
                            {isCredit ? (
                              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px] flex items-center gap-1 w-fit">
                                <ArrowDownLeft className="h-3 w-3" /> Encaissement
                              </Badge>
                            ) : (
                              <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-[10px] flex items-center gap-1 w-fit">
                                <ArrowUpRight className="h-3 w-3" /> Reversement
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-xs max-w-[280px]">
                            <p className="font-medium text-foreground">{op.description}</p>
                          </TableCell>
                          <TableCell className="text-xs">
                            <span className="font-medium">{op.mode_reglement}</span>
                            {op.reference_externe && (
                              <span className="block text-[11px] text-muted-foreground font-mono">
                                Réf : {op.reference_externe}
                              </span>
                            )}
                          </TableCell>
                          <TableCell
                            className={`text-right font-ui font-bold text-sm ${
                              isCredit ? "text-emerald-700" : "text-amber-700"
                            }`}
                          >
                            {isCredit ? "+" : "-"} {op.montant.toLocaleString()} FCFA
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
      )}

      {/* Dialogue d'émission de reçu manuel */}
      <Dialog open={manualReceiptOpen} onOpenChange={setManualReceiptOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" /> Émettre un reçu de paiement manuel
            </DialogTitle>
            <DialogDescription>
              Générez une quittance officielle imprimable pour tout règlement physique, avance, charge ou régularisation.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="payeur" className="text-xs font-semibold">
                  Nom complet du payeur / bénéficiaire <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="payeur"
                  placeholder="Ex : Mouhamed Diallo"
                  value={payeurNom}
                  onChange={(e) => setPayeurNom(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="payeur_tel" className="text-xs">
                  Téléphone
                </Label>
                <Input
                  id="payeur_tel"
                  placeholder="+221 77 000 00 00"
                  value={payeurTel}
                  onChange={(e) => setPayeurTel(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="payeur_email" className="text-xs">
                  Email
                </Label>
                <Input
                  id="payeur_email"
                  type="email"
                  placeholder="email@domaine.com"
                  value={payeurEmail}
                  onChange={(e) => setPayeurEmail(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="montant_recu" className="text-xs font-semibold">
                  Montant (FCFA) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="montant_recu"
                  type="number"
                  min="0"
                  step="500"
                  value={montant || ""}
                  onChange={(e) => setMontant(Number(e.target.value))}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="type_recu" className="text-xs font-semibold">
                  Type de reçu
                </Label>
                <Select value={typeRecu} onValueChange={(v: any) => setTypeRecu(v)}>
                  <SelectTrigger id="type_recu">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="loyer">Loyer mensuel</SelectItem>
                    <SelectItem value="caution">Dépôt de garantie (Caution)</SelectItem>
                    <SelectItem value="frais_dossier">Frais de dossier</SelectItem>
                    <SelectItem value="manuel">Règlement direct / Divers</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="mode_pay" className="text-xs font-semibold">
                  Mode de paiement
                </Label>
                <Select value={methodePaiement} onValueChange={setMethodePaiement}>
                  <SelectTrigger id="mode_pay">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Wave">Wave</SelectItem>
                    <SelectItem value="Orange Money">Orange Money</SelectItem>
                    <SelectItem value="Espèces">Espèces (En caisse)</SelectItem>
                    <SelectItem value="Virement Bancaire">Virement Bancaire</SelectItem>
                    <SelectItem value="Chèque">Chèque</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ref_paiement" className="text-xs">
                  Référence de transaction
                </Label>
                <Input
                  id="ref_paiement"
                  placeholder="Ex : TX-WV-89102"
                  value={refPaiement}
                  onChange={(e) => setRefPaiement(e.target.value)}
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="motif_recu" className="text-xs font-semibold">
                  Motif / Objet du versement <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="motif_recu"
                  placeholder="Ex : Règlement loyer Octobre 2026 - Résidence Al-Nour Ch. 3"
                  value={motif}
                  onChange={(e) => setMotif(e.target.value)}
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="obs_recu" className="text-xs">
                  Observations / Remarques complémentaires
                </Label>
                <Textarea
                  id="obs_recu"
                  rows={2}
                  placeholder="Ex : Versement partiel, solde restant dû : 10 000 FCFA..."
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              disabled={createReceiptMutation.isPending}
              onClick={() => setManualReceiptOpen(false)}
            >
              Annuler
            </Button>
            <Button
              disabled={createReceiptMutation.isPending || !payeurNom || !motif || !montant}
              onClick={() => createReceiptMutation.mutate()}
            >
              {createReceiptMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Émettre et imprimer le reçu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
