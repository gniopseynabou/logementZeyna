import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { getLandlordContracts } from "@/services/contract-service";
import { getBailleurAccords } from "@/services/accord-proprietaire-service";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Download,
  FileCheck,
  FileLock,
  Printer,
  ShieldCheck,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import {
  generateBonAffectationHTML,
  generateConventionBailleurHTML,
  generatePolitiqueCautionHTML,
  printDocument,
} from "@/lib/contract-templates";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const BailleurContrats = () => {
  const { user, profile } = useAuth();

  // 1. Bons d'affectation
  const { data: contrats, isLoading, isError, error } = useQuery({
    queryKey: ["bailleur-contrats", user?.id],
    queryFn: () => getLandlordContracts(user!.id),
    enabled: !!user?.id,
  });

  // 2. Logements du bailleur
  const { data: logementsBailleur, isLoading: loadingLogements } = useQuery({
    queryKey: ["bailleur-logements-accords", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error: err } = await supabase
        .from("logements")
        .select(`*, chambres(nom, prix_bailleur, prix_zeyna, marge)`)
        .eq("bailleur_id", user.id)
        .order("created_at", { ascending: false });
      if (err) throw err;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // 3. Accords écrits officiels enregistrés
  const { data: accords } = useQuery({
    queryKey: ["bailleur-accords-list", user?.id],
    queryFn: () => getBailleurAccords(user!.id),
    enabled: !!user?.id,
  });

  const accordsMap = new Map<string, any>();
  (accords || []).forEach((a) => accordsMap.set(a.logement_id, a));

  const downloadBon = (contrat: any) => {
    const content = contrat.contenu as any;
    const res = (contrat as any).reservations;
    const logNom = res?.logements?.nom || content?.logement || "N/A";
    const chNom = res?.chambres?.nom || content?.chambre || "N/A";
    const ref = content?.reference || "N/A";
    const date = content?.date
      ? new Date(content.date).toLocaleDateString("fr-FR")
      : new Date(contrat.created_at).toLocaleDateString("fr-FR");

    const htmlContent = generateBonAffectationHTML({
      refAffectation: ref,
      dateEmission: date,
      bailleur: {
        prenom: profile?.prenom || "",
        nom: profile?.nom || "",
        telephone: profile?.telephone,
      },
      logement: {
        nom: logNom,
        adresse: res?.logements?.adresse || "N/A",
        ville: res?.logements?.ville || "Saint-Louis",
        type: res?.logements?.type || "Non spécifié",
      },
      chambre: {
        nom: chNom,
        prix_bailleur: res?.chambres?.prix_bailleur,
      },
      dateDebut: res?.date_debut
        ? new Date(res.date_debut).toLocaleDateString("fr-FR")
        : date,
    });

    printDocument(htmlContent);
  };

  const downloadConvention = (logement: any) => {
    const accord = accordsMap.get(logement.id);
    const ref = accord?.reference_accord || `CONV-${logement.id.slice(0, 8).toUpperCase()}`;

    const htmlContent = generateConventionBailleurHTML({
      refConvention: ref,
      dateEmission: accord?.date_signature
        ? format(new Date(accord.date_signature), "dd/MM/yyyy", { locale: fr })
        : format(new Date(), "dd/MM/yyyy", { locale: fr }),
      bailleur: {
        prenom: profile?.prenom || "",
        nom: profile?.nom || "",
        telephone: profile?.telephone,
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
        marge: ch.marge,
      })),
      dateDebut: logement.created_at
        ? format(new Date(logement.created_at), "dd/MM/yyyy", { locale: fr })
        : "-",
    });

    printDocument(htmlContent);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl font-bold">Documents & Conventions</h1>
            <p className="text-muted-foreground text-sm">
              Accords de gestion écrits et preuves d'occupation de vos logements
            </p>
          </div>
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => printDocument(generatePolitiqueCautionHTML())}
          >
            <ShieldCheck className="h-4 w-4 mr-2 text-primary" /> Politique de caution (PDF)
          </Button>
        </div>

        <Tabs defaultValue="accords-gestion">
          <TabsList className="grid grid-cols-1 sm:grid-cols-2 w-full max-w-md">
            <TabsTrigger value="accords-gestion" className="flex items-center gap-1.5">
              <FileLock className="h-4 w-4" />
              <span>Accords écrits de gestion</span>
            </TabsTrigger>
            <TabsTrigger value="bons-affectation" className="flex items-center gap-1.5">
              <FileCheck className="h-4 w-4" />
              <span>Bons d'affectation</span>
            </TabsTrigger>
          </TabsList>

          {/* ── ONGLET 1 : ACCORDS ÉCRITS DE GESTION ── */}
          <TabsContent value="accords-gestion" className="mt-4 space-y-4">
            {loadingLogements ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />
                ))}
              </div>
            ) : !logementsBailleur || logementsBailleur.length === 0 ? (
              <Card className="border-0 shadow-premium">
                <CardContent className="py-12 text-center text-muted-foreground">
                  <FileLock className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p>Aucun logement enregistré pour le moment.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {logementsBailleur.map((l: any) => {
                  const accord = accordsMap.get(l.id);
                  const isSigned = accord && (accord.statut === "signe" || accord.statut === "actif");
                  const refAccord = accord?.reference_accord || `CONV-${l.id.slice(0, 8).toUpperCase()}`;

                  return (
                    <Card key={l.id} className="border-0 shadow-premium">
                      <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3.5">
                          <div className="p-3 bg-amber-100 rounded-xl shrink-0 mt-0.5">
                            <FileLock className="h-5 w-5 text-amber-700" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-medium text-base">{l.nom}</h3>
                              {isSigned ? (
                                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-xs flex items-center gap-1">
                                  <CheckCircle2 className="h-3 w-3" /> Accord écrit en vigueur
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-amber-700 border-amber-300 text-xs">
                                  Accord en cours de finalisation
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Réf Accord : <span className="font-mono font-medium">{refAccord}</span> · {l.chambres?.length || 0} unité(s)
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Mandat de gestion & convention conforme au COCC (art. 577-578)
                            </p>
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full sm:w-auto"
                          onClick={() => downloadConvention(l)}
                        >
                          <Printer className="h-4 w-4 mr-2" /> Convention (PDF)
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* ── ONGLET 2 : BONS D'AFFECTATION ── */}
          <TabsContent value="bons-affectation" className="mt-4 space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="h-24 bg-muted animate-pulse rounded-xl" />
                ))}
              </div>
            ) : isError ? (
              <Card className="border-0 shadow-premium" role="alert">
                <CardContent className="py-12 text-center">
                  <p>Impossible de charger vos bons.</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {error instanceof Error ? error.message : "Une erreur inattendue est survenue."}
                  </p>
                </CardContent>
              </Card>
            ) : !contrats || contrats.length === 0 ? (
              <Card className="border-0 shadow-premium">
                <CardContent className="py-12 text-center text-muted-foreground">
                  <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  Aucune occupation active pour le moment.
                  <br />
                  ZEYNA vous notifiera dès qu'une chambre sera affectée.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {contrats.map((c) => (
                  <Card key={c.id} className="border-0 shadow-premium">
                    <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-muted rounded-xl">
                          <FileText className="h-5 w-5 text-accent" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {(c as any).reservations?.logements?.nom || "Logement"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Chambre affectée : {(c as any).reservations?.chambres?.nom}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Locataire géré par Zeyna • Réf: {(c.contenu as any)?.reference || "-"}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadBon(c)}
                        className="w-full sm:w-auto"
                      >
                        <Download className="h-4 w-4 mr-2" /> Télécharger / Imprimer
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default BailleurContrats;
