// Page : Admin - Documents
// Route : /admin/documents
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Search, Download, Eye, Plus, FileLock, FileCheck, Loader2 } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getStudentContracts } from "@/services/contract-service";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// ─────────────────────────────────────────────────────────────────────────────
// GÉNÉRATEUR HTML - CONTRAT ZEYNA ↔ ÉTUDIANT
// ─────────────────────────────────────────────────────────────────────────────

export const generateContratClientHTML = (data: {
  refContrat: string;
  dateEmission: string;
  client: { prenom: string; nom: string; telephone?: string };
  logement: { nom: string; adresse: string; ville: string; type: string };
  chambre: { nom: string; nombre_personnes?: number; prix_zeyna?: number };
  caution: number;
  dateDebut: string;
}) => `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; color: #111; background: #fff; padding: 48px; font-size: 13.5px; line-height: 1.6; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 36px; padding-bottom: 20px; border-bottom: 2px solid #c6a25b; }
    .brand-name { font-size: 18px; font-weight: 700; color: #111; letter-spacing: -0.5px; }
    .brand-sub { font-size: 11px; color: #777; margin-top: 3px; }
    .doc-ref { text-align: right; font-size: 11.5px; color: #555; }
    .doc-ref strong { color: #111; }
    .doc-title { text-align: center; font-size: 19px; font-weight: 700; color: #111; margin: 32px 0 6px; text-transform: uppercase; letter-spacing: 1px; }
    .doc-subtitle { text-align: center; color: #c6a25b; font-size: 12px; font-weight: 600; letter-spacing: 0.5px; margin-bottom: 32px; text-transform: uppercase; }
    .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 28px; }
    .partie { background: #f8f7f5; border-left: 3px solid #c6a25b; padding: 14px 18px; }
    .partie-title { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #c6a25b; margin-bottom: 8px; }
    .partie-info { font-size: 13px; }
    .section { margin: 24px 0; }
    .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: #c6a25b; border-bottom: 1px solid #e8e4dd; padding-bottom: 6px; margin-bottom: 14px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 4px; }
    th { background: #111; color: #fff; padding: 7px 12px; text-align: left; font-size: 11.5px; font-weight: 600; }
    td { padding: 8px 12px; border-bottom: 1px solid #eee; font-size: 13px; }
    tr:nth-child(even) td { background: #fafaf9; }
    .article { margin: 9px 0; font-size: 13px; }
    .article-num { font-weight: 700; color: #c6a25b; }
    .note-juridique { border: 1px solid #e4d8b8; background: #fefbf2; border-radius: 4px; padding: 10px 14px; font-size: 11px; color: #7a6520; margin: 24px 0; }
    .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; margin-top: 52px; }
    .sig-box { border-top: 2px solid #111; padding-top: 12px; }
    .sig-label { font-size: 12px; font-weight: 700; color: #111; }
    .sig-zone { height: 64px; border: 1px dashed #ccc; border-radius: 3px; margin-top: 10px; }
    .sig-hint { font-size: 10.5px; color: #999; margin-top: 6px; }
    .footer { margin-top: 48px; border-top: 1px solid #e5e5e5; padding-top: 12px; display: flex; justify-content: space-between; font-size: 10.5px; color: #999; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand-name">Les Logements de Zeyna</div>
      <div class="brand-sub">Plateforme de gestion immobilière · Saint-Louis, Sénégal</div>
    </div>
    <div class="doc-ref">
      <strong>Réf :</strong> ${data.refContrat}<br/>
      <strong>Date :</strong> ${data.dateEmission}
    </div>
  </div>

  <div class="doc-title">Convention d'occupation</div>
  <div class="doc-subtitle">Zeyna &nbsp;↔&nbsp; Locataire</div>

  <div class="parties">
    <div class="partie">
      <div class="partie-title">Le Gestionnaire</div>
      <div class="partie-info">
        <strong>Les Logements de Zeyna</strong><br/>
        Gestion &amp; commercialisation immobilière<br/>
        Saint-Louis, Sénégal
      </div>
    </div>
    <div class="partie">
      <div class="partie-title">Le Locataire</div>
      <div class="partie-info">
        <strong>${data.client.prenom} ${data.client.nom}</strong><br/>
        ${data.client.telephone ? `Tél : ${data.client.telephone}<br/>` : ""}
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Logement concerné</div>
    <table>
      <tr><th>Élément</th><th>Détail</th></tr>
      <tr><td>Nom</td><td>${data.logement.nom}</td></tr>
      <tr><td>Adresse</td><td>${data.logement.adresse}, ${data.logement.ville}</td></tr>
      <tr><td>Type</td><td>${data.logement.type}</td></tr>
      <tr><td>Unité</td><td>${data.chambre.nom}</td></tr>
      ${data.chambre.nombre_personnes ? `<tr><td>Capacité</td><td>${data.chambre.nombre_personnes} personne(s)</td></tr>` : ""}
      <tr><td>Entrée prévue</td><td>${data.dateDebut}</td></tr>
    </table>
  </div>

  <div class="section">
    <div class="section-title">Conditions financières</div>
    <table>
      <tr><th>Élément</th><th>Montant</th></tr>
      ${data.chambre.prix_zeyna ? `<tr><td>Loyer mensuel</td><td><strong>${data.chambre.prix_zeyna.toLocaleString("fr-FR")} FCFA</strong></td></tr>` : ""}
      <tr><td>Caution versée</td><td><strong>${data.caution.toLocaleString("fr-FR")} FCFA</strong></td></tr>
    </table>
  </div>

  <div class="section">
    <div class="section-title">Clauses générales</div>
    <div class="article"><span class="article-num">Art. 1 -</span> Le locataire occupe le logement à des fins d'habitation principale uniquement.</div>
    <div class="article"><span class="article-num">Art. 2 -</span> Toute sous-location est interdite sans accord écrit préalable de Zeyna.</div>
    <div class="article"><span class="article-num">Art. 3 -</span> La caution est restituée en fin d'occupation, sous réserve du bon état des lieux.</div>
    <div class="article"><span class="article-num">Art. 4 -</span> Le locataire s'engage à respecter le règlement intérieur du logement.</div>
    <div class="article"><span class="article-num">Art. 5 -</span> Tout incident ou problème doit être signalé à Zeyna dans les meilleurs délais.</div>
    <div class="article"><span class="article-num">Art. 6 -</span> Le loyer est payable mensuellement à la date d'entrée convenue.</div>
  </div>

  <div class="note-juridique">
    <strong>Note :</strong> Ce document constitue un cadre de référence. Les clauses doivent être validées par un professionnel du droit avant de produire tout effet contractuel opposable.
  </div>

  <div class="signatures">
    <div class="sig-box">
      <div class="sig-label">Pour Les Logements de Zeyna</div>
      <div class="sig-zone"></div>
      <div class="sig-hint">Nom, fonction, date &amp; cachet</div>
    </div>
    <div class="sig-box">
      <div class="sig-label">Le Locataire - ${data.client.prenom} ${data.client.nom}</div>
      <div class="sig-zone"></div>
      <div class="sig-hint">Signature précédée de « Lu et approuvé »</div>
    </div>
  </div>

  <div class="footer">
    <span>Les Logements de Zeyna · Saint-Louis, Sénégal</span>
    <span>Réf : ${data.refContrat} · ${data.dateEmission}</span>
  </div>
</body>
</html>`;


// ─────────────────────────────────────────────────────────────────────────────
// GÉNÉRATEUR HTML - CONVENTION ZEYNA ↔ BAILLEUR
// ─────────────────────────────────────────────────────────────────────────────

export const generateConventionBailleurHTML = (data: {
  refConvention: string;
  dateEmission: string;
  bailleur: { prenom: string; nom: string; telephone?: string; adresse?: string };
  logement: { nom: string; adresse: string; ville: string; type: string };
  chambres: { nom: string; prix_bailleur?: number; prix_zeyna?: number; marge?: number }[];
  dateDebut: string;
}) => `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; color: #111; background: #fff; padding: 48px; font-size: 13.5px; line-height: 1.6; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 36px; padding-bottom: 20px; border-bottom: 2px solid #c6a25b; }
    .brand-name { font-size: 18px; font-weight: 700; color: #111; }
    .brand-sub { font-size: 11px; color: #777; margin-top: 3px; }
    .doc-ref { text-align: right; font-size: 11.5px; color: #555; }
    .doc-ref strong { color: #111; }
    .doc-title { text-align: center; font-size: 19px; font-weight: 700; color: #111; margin: 32px 0 6px; text-transform: uppercase; letter-spacing: 1px; }
    .doc-subtitle { text-align: center; color: #c6a25b; font-size: 12px; font-weight: 600; letter-spacing: 0.5px; margin-bottom: 32px; text-transform: uppercase; }
    .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 28px; }
    .partie { background: #f8f7f5; border-left: 3px solid #c6a25b; padding: 14px 18px; }
    .partie-title { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #c6a25b; margin-bottom: 8px; }
    .section { margin: 24px 0; }
    .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: #c6a25b; border-bottom: 1px solid #e8e4dd; padding-bottom: 6px; margin-bottom: 14px; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #111; color: #fff; padding: 7px 12px; text-align: left; font-size: 11.5px; }
    td { padding: 8px 12px; border-bottom: 1px solid #eee; font-size: 13px; }
    tr:nth-child(even) td { background: #fafaf9; }
    .article { margin: 9px 0; font-size: 13px; }
    .article-num { font-weight: 700; color: #c6a25b; }
    .note { border: 1px solid #e4d8b8; background: #fefbf2; border-radius: 4px; padding: 10px 14px; font-size: 11px; color: #7a6520; margin: 24px 0; }
    .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; margin-top: 52px; }
    .sig-box { border-top: 2px solid #111; padding-top: 12px; }
    .sig-label { font-size: 12px; font-weight: 700; }
    .sig-zone { height: 64px; border: 1px dashed #ccc; border-radius: 3px; margin-top: 10px; }
    .sig-hint { font-size: 10.5px; color: #999; margin-top: 6px; }
    .footer { margin-top: 48px; border-top: 1px solid #e5e5e5; padding-top: 12px; display: flex; justify-content: space-between; font-size: 10.5px; color: #999; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand-name">Les Logements de Zeyna</div>
      <div class="brand-sub">Plateforme de gestion immobilière · Saint-Louis, Sénégal</div>
    </div>
    <div class="doc-ref">
      <strong>Réf :</strong> ${data.refConvention}<br/>
      <strong>Date :</strong> ${data.dateEmission}
    </div>
  </div>

  <div class="doc-title">Convention de gestion</div>
  <div class="doc-subtitle">Zeyna &nbsp;↔&nbsp; Bailleur partenaire</div>

  <div class="parties">
    <div class="partie">
      <div class="partie-title">Le Gestionnaire</div>
      <div class="partie-info">
        <strong>Les Logements de Zeyna</strong><br/>
        Gestion &amp; commercialisation immobilière<br/>
        Saint-Louis, Sénégal
      </div>
    </div>
    <div class="partie">
      <div class="partie-title">Le Bailleur</div>
      <div class="partie-info">
        <strong>${data.bailleur.prenom} ${data.bailleur.nom}</strong><br/>
        ${data.bailleur.telephone ? `Tél : ${data.bailleur.telephone}<br/>` : ""}
        ${data.bailleur.adresse ? `${data.bailleur.adresse}` : ""}
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Logement mis en gestion</div>
    <table>
      <tr><th>Élément</th><th>Détail</th></tr>
      <tr><td>Nom / Référence</td><td>${data.logement.nom}</td></tr>
      <tr><td>Adresse</td><td>${data.logement.adresse}, ${data.logement.ville}</td></tr>
      <tr><td>Type</td><td>${data.logement.type}</td></tr>
      <tr><td>Date de prise en gestion</td><td>${data.dateDebut}</td></tr>
    </table>
  </div>

  ${data.chambres.length > 0 ? `
  <div class="section">
    <div class="section-title">Détail des unités et conditions financières</div>
    <table>
      <tr>
        <th>Unité</th>
        <th>Prix bailleur</th>
        <th>Prix client</th>
        <th>Marge Zeyna</th>
      </tr>
      ${data.chambres.map(ch => `
      <tr>
        <td>${ch.nom}</td>
        <td>${ch.prix_bailleur ? ch.prix_bailleur.toLocaleString("fr-FR") + " FCFA" : "-"}</td>
        <td>${ch.prix_zeyna ? ch.prix_zeyna.toLocaleString("fr-FR") + " FCFA" : "-"}</td>
        <td>${ch.marge ? ch.marge.toLocaleString("fr-FR") + " FCFA" : "-"}</td>
      </tr>`).join("")}
    </table>
  </div>` : ""}

  <div class="section">
    <div class="section-title">Conditions de la convention</div>
    <div class="article"><span class="article-num">Art. 1 -</span> Le bailleur confie à Zeyna la gestion locative du logement référencé ci-dessus.</div>
    <div class="article"><span class="article-num">Art. 2 -</span> Zeyna assure la commercialisation, l'encaissement et le suivi des locataires.</div>
    <div class="article"><span class="article-num">Art. 3 -</span> Le bailleur percevra le montant défini dans le tableau ci-dessus (prix bailleur) par unité occupée.</div>
    <div class="article"><span class="article-num">Art. 4 -</span> Zeyna retient sa marge de gestion sur chaque encaissement client.</div>
    <div class="article"><span class="article-num">Art. 5 -</span> Les reversements sont effectués selon les modalités convenues entre les deux parties.</div>
    <div class="article"><span class="article-num">Art. 6 -</span> Les incidents graves dans le logement sont gérés en concertation entre Zeyna et le bailleur.</div>
    <div class="article"><span class="article-num">Art. 7 -</span> La présente convention est résiliable par chacune des parties avec un préavis de 30 jours.</div>
  </div>

  <div class="note">
    <strong>Note :</strong> Ce document est un cadre indicatif soumis à validation juridique préalable avant tout usage contractuel.
  </div>

  <div class="signatures">
    <div class="sig-box">
      <div class="sig-label">Pour Les Logements de Zeyna</div>
      <div class="sig-zone"></div>
      <div class="sig-hint">Nom, fonction, date &amp; cachet</div>
    </div>
    <div class="sig-box">
      <div class="sig-label">Le Bailleur - ${data.bailleur.prenom} ${data.bailleur.nom}</div>
      <div class="sig-zone"></div>
      <div class="sig-hint">Signature précédée de « Lu et approuvé »</div>
    </div>
  </div>

  <div class="footer">
    <span>Les Logements de Zeyna · Saint-Louis, Sénégal</span>
    <span>Réf : ${data.refConvention} · ${data.dateEmission}</span>
  </div>
</body>
</html>`;


// ─────────────────────────────────────────────────────────────────────────────
// Utilitaire : ouvrir le document dans un nouvel onglet et déclencher l'impression
// ─────────────────────────────────────────────────────────────────────────────

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

  // Contrats clients
  const { data: contrats, isLoading: loadingContrats } = useQuery({
    queryKey: ["admin-all-contrats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contrats")
        .select(`*, reservations(*, chambres(*), logements(*), profiles(*))`)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  // Logements bailleurs (pour générer conventions)
  const { data: logements, isLoading: loadingLogements } = useQuery({
    queryKey: ["admin-logements-bailleurs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("logements")
        .select(`*, bailleur:profiles!logements_bailleur_id_fkey(prenom, nom, telephone), chambres(nom, prix_bailleur, prix_zeyna, marge)`)
        .eq("statut", "valide")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
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
            <h1 className="font-serif text-2xl font-bold">Documents</h1>
            <p className="text-muted-foreground text-sm">Contrats clients et conventions bailleurs</p>
          </div>
        </div>

        {/* Compteurs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="border-0 shadow-premium">
            <CardContent className="p-5 flex items-start gap-4">
              <div className="p-3 rounded-xl bg-primary/10 text-primary shrink-0"><FileCheck className="h-5 w-5" /></div>
              <div>
                <h3 className="font-serif font-semibold">Contrats clients</h3>
                <p className="text-sm text-muted-foreground mt-0.5">Convention Zeyna - Locataire</p>
                <p className="text-xs text-muted-foreground mt-1 font-ui font-bold">
                  {loadingContrats ? "-" : `${contrats?.length || 0} document(s)`}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-premium">
            <CardContent className="p-5 flex items-start gap-4">
              <div className="p-3 rounded-xl bg-amber-100 text-amber-700 shrink-0"><FileLock className="h-5 w-5" /></div>
              <div>
                <h3 className="font-serif font-semibold">Conventions bailleurs</h3>
                <p className="text-sm text-muted-foreground mt-0.5">Convention Zeyna - Bailleur partenaire</p>
                <p className="text-xs text-muted-foreground mt-1 font-ui font-bold">
                  {loadingLogements ? "-" : `${logements?.length || 0} logement(s) éligible(s)`}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Onglets */}
        <Tabs defaultValue="contrats-clients">
          <TabsList>
            <TabsTrigger value="contrats-clients">Contrats clients</TabsTrigger>
            <TabsTrigger value="conventions-bailleurs">Conventions bailleurs</TabsTrigger>
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
                {filteredLogements.map((l: any) => (
                  <Card key={l.id} className="border-0 shadow-premium">
                    <CardContent className="p-5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-100 rounded-xl shrink-0"><FileLock className="h-5 w-5 text-amber-700" /></div>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{l.nom}</p>
                          <p className="text-sm text-muted-foreground capitalize">{l.type}</p>
                          <p className="text-xs text-muted-foreground">
                            Bailleur : {l.bailleur?.prenom} {l.bailleur?.nom} · {l.chambres?.length || 0} unité(s)
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handlePreviewConvention(l)}>
                        <Eye className="h-4 w-4 mr-1" /> Générer / PDF
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

export default AdminDocuments;
