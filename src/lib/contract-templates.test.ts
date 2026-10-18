import { describe, it, expect } from "vitest";
import {
  escapeHtml,
  generateContratClientHTML,
  generateConventionBailleurHTML,
  generateBonAffectationHTML,
} from "./contract-templates";

describe("SEC-001 : Protection XSS sur les Contrats", () => {
  it("escapeHtml neutralise les balises script et les gestionnaires d'événements", () => {
    const malicious = '<script>alert("xss")</script>';
    expect(escapeHtml(malicious)).toBe(
      "&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;"
    );
  });

  it("escapeHtml neutralise les attributs HTML dangereux avec guillemets", () => {
    const payload = `<img src=x onerror='alert("hacked")'>`;
    expect(escapeHtml(payload)).toBe(
      "&lt;img src=x onerror=&#039;alert(&quot;hacked&quot;)&#039;&gt;"
    );
  });

  it("escapeHtml gère proprement null, undefined et les nombres", () => {
    expect(escapeHtml(null)).toBe("");
    expect(escapeHtml(undefined)).toBe("");
    expect(escapeHtml(42)).toBe("42");
  });

  it("generateContratClientHTML n'injecte aucun script brut dans le HTML généré", () => {
    const html = generateContratClientHTML({
      refContrat: "ZEYNA-TEST-001",
      dateEmission: "14/10/2026",
      client: {
        prenom: '<img src=x onerror="alert(1)">',
        nom: "Hacker<script>steal()</script>",
        telephone: "+221 77 000 00 00",
      },
      logement: {
        nom: "Logement <script>alert(2)</script>",
        adresse: "123 Rue <b onmouseover=evil()>Test</b>",
        ville: "Saint-Louis",
        type: "Appartement",
      },
      chambre: {
        nom: "Chambre <b>1</b>",
        nombre_personnes: 1,
        prix_zeyna: 85000,
      },
      caution: 85000,
      dateDebut: "01/11/2026",
    });

    // Aucune balise <script> ou <img executable ne doit apparaître dans le document
    expect(html).not.toContain("<script>steal()</script>");
    expect(html).not.toContain('<img src=x onerror="alert(1)">');
    expect(html).not.toContain("<b onmouseover=evil()>");

    // Les entités doivent être correctement échappées
    expect(html).toContain("&lt;script&gt;steal()&lt;/script&gt;");
    expect(html).toContain("&lt;img src=x onerror=&quot;alert(1)&quot;&gt;");
  });

  it("generateRecuPaiementHTML génère un reçu conforme avec protection XSS et quittance libératoire", async () => {
    const { generateRecuPaiementHTML } = await import("./contract-templates");
    const html = generateRecuPaiementHTML({
      reference: "REC-2026-TEST",
      dateEmission: "18/10/2026",
      payeur: {
        prenom: '<script>alert("payeur")</script>',
        nom: "Fall",
        telephone: "+221 78 123 45 67",
      },
      logement: {
        nom: "Résidence Zeyna",
        chambre: "Chambre 2",
      },
      typeRecu: "caution",
      typeGeneration: "automatique",
      montant: 50000,
      methodePaiement: "Wave",
      referencePaiement: "TX-WV-1029",
      motif: "Paiement caution test",
    });

    expect(html).toContain("REÇU DE PAIEMENT OFFICIEL");
    expect(html).toContain((50000).toLocaleString("fr-FR"));
    expect(html).toContain("FCFA");
    expect(html).toContain("REC-2026-TEST");
    expect(html).toContain("TX-WV-1029");
    expect(html).not.toContain('<script>alert("payeur")</script>');
    expect(html).toContain("&lt;script&gt;alert(&quot;payeur&quot;)&lt;/script&gt;");
  });

  it("generatePolitiqueCautionHTML contient les règles de séquestre, délais de 15/30j et conformité COCC", async () => {
    const { generatePolitiqueCautionHTML } = await import("./contract-templates");
    const html = generatePolitiqueCautionHTML();

    expect(html).toContain("POLITIQUE DE CAUTION ET DE DÉPÔT DE GARANTIE");
    expect(html).toContain("15 jours");
    expect(html).toContain("30 jours");
    expect(html).toContain("séquestrés");
    expect(html).toContain("COCC");
  });
});
