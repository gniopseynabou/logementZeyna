// Page : Admin - Documents
// Route : /admin/documents
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Search, Download, Eye, Plus, FileLock, FileCheck, Loader2, Clock, ShieldCheck, Receipt, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getStudentContracts } from "@/services/contract-service";
import { ContractRenewalManager } from "@/components/admin/ContractRenewalManager";
import { OperationsAndReceiptsManager } from "@/components/admin/OperationsAndReceiptsManager";
import { createOrUpdateAccord, getAdminAccords } from "@/services/accord-proprietaire-service";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

import {
  generateContratClientHTML,
  generateConventionBailleurHTML,
  generateBonAffectationHTML,
  generatePolitiqueCautionHTML,
} from "@/lib/contract-templates";

export const printDocument = (htmlContent: string) => {
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(htmlContent);
  win.document.close();
  win.onload = () => { win.focus(); win.print(); };
};


// ─────────────────────────────────────────────────────────────────────────────
// PAGE PRINCIPALE
// ─────────────────────────────────────────────────────────────────────────────

const AdminDocuments = () => {
  const [search, setSearch] = useState("");
  const [searchBailleur, setSearchBailleur] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Accords écrits propriétaires
  const { data: accordsBailleurs } = useQuery({
    queryKey: ["admin-accords-bailleurs"],
    queryFn: getAdminAccords,
  });

  const accordsMap = new Map<string, any>();
  (accordsBailleurs || []).forEach((a) => {
    accordsMap.set(a.logement_id, a);
  });

  const signAccordMutation = useMutation({
    mutationFn: async ({ logementId, bailleurId }: { logementId: string; bailleurId: string }) => {
      return await createOrUpdateAccord({
        logement_id: logementId,
        bailleur_id: bailleurId,
        statut: "signe",
      });
    },
    onSuccess: () => {
      toast({
        title: "Accord formalisé",
        description: "L'accord écrit de gestion et de sous-location a été validé et archivé.",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-accords-bailleurs"] });
    },
    onError: (err: any) => {
      toast({
        title: "Erreur",
        description: err.message || "Impossible de formaliser l'accord.",
        variant: "destructive",
      });
    },
  });

  // Contrats clients
  const { data: contrats, isLoading: loadingContrats } = useQuery({
    queryKey: ["admin-all-contrats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contrats")
        .select(`*, reservations(*, chambres(*), logements(*))`)
        .order("created_at", { ascending: false });
      if (error) throw error;
      if (!data || data.length === 0) return [];

      // Récupérer les profils des étudiants séparément (résolution FK auth.users)
      const studentIds = [...new Set(data.map((c: any) => c.etudiant_id).filter(Boolean))];
      const profilesMap = new Map<string, any>();
      if (studentIds.length > 0) {
        const { data: profiles, error: profError } = await supabase
          .from("profiles")
          .select("user_id, prenom, nom, telephone")
          .in("user_id", studentIds);
        if (!profError && profiles) {
          profiles.forEach((p) => profilesMap.set(p.user_id, p));
        }
      }

      return data.map((c: any) => ({
        ...c,
        reservations: c.reservations
          ? { ...c.reservations, profiles: profilesMap.get(c.etudiant_id) || null }
          : null,
      }));
    },
  });

  // Logements bailleurs (pour générer conventions)
  const { data: logements, isLoading: loadingLogements } = useQuery({
    queryKey: ["admin-logements-bailleurs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("logements")
        .select(`*, chambres(nom, prix_bailleur, prix_zeyna, marge)`)
        .eq("statut", "valide")
        .order("created_at", { ascending: false });
      if (error) throw error;
      if (!data || data.length === 0) return [];

      // Récupérer les profils des bailleurs séparément (résolution FK auth.users)
      const bailleurIds = [...new Set(data.map((l: any) => l.bailleur_id).filter(Boolean))];
      const bailleursMap = new Map<string, any>();
      if (bailleurIds.length > 0) {
        const { data: profiles, error: profError } = await supabase
          .from("profiles")
          .select("user_id, prenom, nom, telephone")
          .in("user_id", bailleurIds);
        if (!profError && profiles) {
          profiles.forEach((p) => bailleursMap.set(p.user_id, p));
        }
      }

      return data.map((l: any) => ({
        ...l,
        bailleur: bailleursMap.get(l.bailleur_id) || null,
      }));
    },
  });

  const filteredContrats = (contrats || []).filter((c: any) => {
    const nom = c.reservations?.logements?.nom?.toLowerCase() || "";
    const chambre = c.reservations?.chambres?.nom?.toLowerCase() || "";
    const ref = ((c.contenu as any)?.reference || "").toLowerCase();
    const q = search.toLowerCase();
    return !q || nom.includes(q) || chambre.includes(q) || ref.includes(q);
  });

  const filteredLogements = (logements || []).filter((l: any) => {
    const nom = l.nom?.toLowerCase() || "";
    const bailleur = `${l.bailleur?.prenom || ""} ${l.bailleur?.nom || ""}`.toLowerCase();
    const q = searchBailleur.toLowerCase();
    return !q || nom.includes(q) || bailleur.includes(q);
  });

  const handlePreviewContrat = (c: any) => {
    const content = c.contenu as any;
    const res = c.reservations;
    const html = generateContratClientHTML({
      refContrat: content?.reference || c.id.slice(0, 8).toUpperCase(),
      dateEmission: format(new Date(c.created_at), "dd/MM/yyyy", { locale: fr }),
      client: {
        prenom: res?.profiles?.prenom || "",
        nom: res?.profiles?.nom || "",
        telephone: res?.profiles?.telephone,
      },
      logement: {
        nom: res?.logements?.nom || "-",
        adresse: res?.logements?.adresse || "-",
        ville: res?.logements?.ville || "Saint-Louis",
        type: res?.logements?.type || "-",
      },
      chambre: {
        nom: res?.chambres?.nom || "-",
        nombre_personnes: res?.chambres?.nombre_personnes,
        prix_zeyna: res?.chambres?.prix_zeyna,
      },
      caution: content?.montant || 0,
      dateDebut: res?.date_debut ? format(new Date(res.date_debut), "dd/MM/yyyy", { locale: fr }) : "-",
    });
    printDocument(html);
  };

  const handlePreviewConvention = (logement: any) => {
    const html = generateConventionBailleurHTML({
      refConvention: `CONV-${logement.id.slice(0, 8).toUpperCase()}`,
      dateEmission: format(new Date(), "dd/MM/yyyy", { locale: fr }),
      bailleur: {
        prenom: logement.bailleur?.prenom || "",
        nom: logement.bailleur?.nom || "",
        telephone: logement.bailleur?.telephone,
      },
      logement: {
        nom: logement.nom,
        adresse: logement.adresse || "-",
        ville: logement.ville || "Saint-Louis",
        type: logement.type || "-",
      },
      chambres: (logement.chambres || []).map((ch: any) => ({
        nom: ch.nom,
        prix_bailleur: ch.prix_bailleur,
        prix_zeyna: ch.prix_zeyna,
        marge: ch.marge || (ch.prix_zeyna && ch.prix_bailleur ? ch.prix_zeyna - ch.prix_bailleur : undefined),
      })),
      dateDebut: logement.created_at ? format(new Date(logement.created_at), "dd/MM/yyyy", { locale: fr }) : "-",
    });
    printDocument(html);
  };

  return (
    <DashboardLayout>
      <SEOHead title="Documents" description="Gestion des contrats et conventions - espace administration Zeyna" noIndex />
      <div className="space-y-6">

        {/* En-tête */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl font-bold">Documents & Registres</h1>
            <p className="text-muted-foreground text-sm">
              Contrats de location, accords écrits propriétaires, reçus et registre des opérations
            </p>
          </div>
          <Button
            variant="outline"
            className="w-full sm:w-auto border-primary/30 text-primary hover:bg-primary/5"
            onClick={() => printDocument(generatePolitiqueCautionHTML())}
          >
            <ShieldCheck className="h-4 w-4 mr-2 text-primary" /> Politique de caution (PDF)
          </Button>
        </div>

        {/* Compteurs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-0 shadow-premium">
            <CardContent className="p-5 flex items-start gap-4">
              <div className="p-3 rounded-xl bg-primary/10 text-primary shrink-0"><FileCheck className="h-5 w-5" /></div>
              <div>
                <h3 className="font-serif font-semibold">Contrats locataires</h3>
                <p className="text-sm text-muted-foreground mt-0.5">Sous-locations étudiantes</p>
                <p className="text-xs text-muted-foreground mt-1 font-ui font-bold">
                  {loadingContrats ? "-" : `${contrats?.length || 0} contrat(s)`}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-premium">
            <CardContent className="p-5 flex items-start gap-4">
              <div className="p-3 rounded-xl bg-amber-100 text-amber-700 shrink-0"><FileLock className="h-5 w-5" /></div>
              <div>
                <h3 className="font-serif font-semibold">Accords propriétaires</h3>
                <p className="text-sm text-muted-foreground mt-0.5">Conventions de gestion</p>
                <p className="text-xs text-muted-foreground mt-1 font-ui font-bold">
                  {loadingLogements ? "-" : `${logements?.length || 0} logement(s) partenaires`}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-premium">
            <CardContent className="p-5 flex items-start gap-4">
              <div className="p-3 rounded-xl bg-purple-100 text-purple-700 shrink-0"><Receipt className="h-5 w-5" /></div>
              <div>
                <h3 className="font-serif font-semibold">Reçus & Registre</h3>
                <p className="text-sm text-muted-foreground mt-0.5">Quittances & journal des flux</p>
                <p className="text-xs text-muted-foreground mt-1 font-ui font-bold text-purple-700">
                  Traçabilité financière 100%
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Onglets */}
        <Tabs defaultValue="contrats-clients">
          <TabsList className="grid grid-cols-2 lg:grid-cols-4 w-full">
            <TabsTrigger value="contrats-clients">Contrats locataires</TabsTrigger>
            <TabsTrigger value="conventions-bailleurs">Accords propriétaires</TabsTrigger>
            <TabsTrigger value="recus-registre" className="flex items-center gap-1.5">
              <Receipt className="h-4 w-4" />
              <span>Reçus & Registre</span>
            </TabsTrigger>
            <TabsTrigger value="echeances-renouvellements" className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>Échéances & Renouv.</span>
            </TabsTrigger>
          </TabsList>

          {/* ── CONTRATS CLIENTS ── */}
          <TabsContent value="contrats-clients" className="mt-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher par logement, chambre ou référence..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>

            {loadingContrats ? (
              <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />)}</div>
            ) : filteredContrats.length === 0 ? (
              <Card className="border-0 shadow-premium">
                <CardContent className="py-12 text-center">
                  <FileText className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
                  <p className="text-muted-foreground">Aucun contrat pour le moment.</p>
                  <p className="text-sm text-muted-foreground mt-1">Les contrats sont générés automatiquement après confirmation de la caution.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredContrats.map((c: any) => {
                  const content = c.contenu as any;
                  const res = c.reservations;
                  const logNom = res?.logements?.nom || content?.logement || "-";
                  const chambreNom = res?.chambres?.nom || content?.chambre || "-";
                  const ref = content?.reference || c.id.slice(0, 8).toUpperCase();
                  const date = format(new Date(c.created_at), "dd MMM yyyy", { locale: fr });
                  return (
                    <Card key={c.id} className="border-0 shadow-premium">
                      <CardContent className="p-5 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-muted rounded-xl shrink-0"><FileText className="h-5 w-5 text-primary" /></div>
                          <div className="min-w-0">
                            <p className="font-medium truncate">{logNom}</p>
                            <p className="text-sm text-muted-foreground">{chambreNom}</p>
                            <p className="text-xs text-muted-foreground">Réf : {ref} · {date}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <Button variant="outline" size="sm" onClick={() => handlePreviewContrat(c)}>
                            <Eye className="h-4 w-4 mr-1" /> Aperçu / PDF
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* ── CONVENTIONS BAILLEURS ── */}
          <TabsContent value="conventions-bailleurs" className="mt-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher par logement ou bailleur..." className="pl-10" value={searchBailleur} onChange={(e) => setSearchBailleur(e.target.value)} />
            </div>

            {loadingLogements ? (
              <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />)}</div>
            ) : filteredLogements.length === 0 ? (
              <Card className="border-0 shadow-premium">
                <CardContent className="py-12 text-center">
                  <FileLock className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
                  <p className="text-muted-foreground">Aucun logement validé trouvé.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredLogements.map((l: any) => {
                  const accord = accordsMap.get(l.id);
                  const isSigned = accord && (accord.statut === "signe" || accord.statut === "actif");

                  return (
                    <Card key={l.id} className="border-0 shadow-premium">
                      <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-amber-100 rounded-xl shrink-0"><FileLock className="h-5 w-5 text-amber-700" /></div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-medium truncate">{l.nom}</p>
                              {isSigned ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                  <CheckCircle2 className="h-3 w-3" /> Accord signé (Réf: {accord.reference_accord})
                                </span>
                              ) : (
                                <span className="inline-flex items-center text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                                  Accord à formaliser
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground capitalize">{l.type}</p>
                            <p className="text-xs text-muted-foreground">
                              Bailleur : {l.bailleur?.prenom} {l.bailleur?.nom} · {l.chambres?.length || 0} unité(s)
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                          {!isSigned && l.bailleur_id && (
                            <Button
                              size="sm"
                              className="bg-emerald-600 text-white hover:bg-emerald-700"
                              disabled={signAccordMutation.isPending}
                              onClick={() => signAccordMutation.mutate({ logementId: l.id, bailleurId: l.bailleur_id })}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Formaliser l'accord
                            </Button>
                          )}
                          <Button variant="outline" size="sm" onClick={() => handlePreviewConvention(l)}>
                            <Eye className="h-4 w-4 mr-1" /> Convention (PDF)
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* ── REÇUS & REGISTRE DES OPÉRATIONS ── */}
          <TabsContent value="recus-registre" className="mt-4">
            <OperationsAndReceiptsManager />
          </TabsContent>

          {/* ── ÉCHÉANCES & RENOUVELLEMENTS ── */}
          <TabsContent value="echeances-renouvellements" className="mt-4">
            <ContractRenewalManager />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdminDocuments;
