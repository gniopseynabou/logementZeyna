/* eslint-disable */
// Générateurs de documents HTML pour Les Logements de ZEYNA
// Fichier de référence : contrats, conventions et bons d'affectation

export const commonCSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Times New Roman', Times, serif; color: #000; background: #fff; padding: 40px; font-size: 11pt; line-height: 1.5; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid #000; }
  .brand-name { font-size: 14pt; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; }
  .doc-ref { text-align: right; font-size: 9pt; line-height: 1.8; }
  .doc-title { text-align: center; font-size: 14pt; font-weight: bold; margin: 20px 0 8px; text-transform: uppercase; letter-spacing: 0.03em; }
  .doc-subtitle { text-align: center; font-size: 10pt; font-style: italic; margin-bottom: 20px; }
  .important-box { border: 1.5px solid #000; padding: 10px 14px; margin-bottom: 20px; font-size: 9pt; }
  .important-box p { font-weight: bold; margin-bottom: 5px; }
  .important-box ul { margin-left: 18px; margin-top: 5px; }
  .important-box li { margin-bottom: 3px; font-weight: normal; }
  .section-title { font-size: 10pt; font-weight: bold; text-transform: uppercase; margin: 22px 0 8px; letter-spacing: 0.05em; }
  h2.partie-title { font-size: 11pt; font-weight: bold; text-transform: uppercase; margin: 24px 0 8px; padding: 6px 0; border-bottom: 1.5px solid #000; text-align: center; }
  h3.article-title { font-size: 10.5pt; font-weight: bold; margin: 16px 0 6px; }
  p { margin-bottom: 8px; text-align: justify; }
  ul { margin-left: 20px; margin-bottom: 8px; }
  li { margin-bottom: 3px; text-align: justify; }
  table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 10pt; }
  th, td { border: 1px solid #000; padding: 5px 8px; text-align: left; vertical-align: top; }
  th { background-color: #e8e8e8; font-weight: bold; font-size: 9.5pt; }
  .signatures { display: flex; justify-content: space-between; margin-top: 50px; gap: 40px; }
  .sig-box { flex: 1; border-top: 1.5px solid #000; padding-top: 8px; }
  .sig-label { font-weight: bold; font-size: 10pt; margin-bottom: 50px; }
  .sig-hint { font-size: 9pt; }
  .page-break { page-break-before: always; padding-top: 30px; }
  .checkbox { display: inline-block; width: 12px; height: 12px; border: 1px solid #000; margin-right: 5px; vertical-align: middle; }
  .doc-footer { margin-top: 40px; border-top: 1px solid #ccc; padding-top: 8px; display: flex; justify-content: space-between; font-size: 9pt; color: #555; }
  @media print { body { padding: 20px; } .page-break { page-break-before: always; } }
`;

export const getCompanyInfo = () => ({
  nom: "Les Logements de ZEYNA",
  forme: "SAS",
  rccm: "SN-STL-2026-B-XXXX",
  ninea: "000 000 000 0X0 X2",
  adresse: "Saint-Louis, Sénégal",
  representant: "Direction Générale",
  email: "contact@logements-zeyna.sn",
  telephone: "+221 77 000 00 00",
});


export function escapeHtml(value?: string | number | null): string {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function fmt(n?: number): string {
  if (!n) return "[montant à compléter]";
  return n.toLocaleString("fr-FR") + " FCFA";
}

function wrap(html: string): string {
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/><style>${commonCSS}</style></head><body>${html}</body></html>`;
}

function header(ref: string, date: string): string {
  return `<div class="header">
    <div class="brand-name">Les Logements de Zeyna</div>
    <div class="doc-ref">Réf : ${escapeHtml(ref)}<br/>Date : ${escapeHtml(date)}</div>
  </div>`;
}

function sigBlock(labelLeft: string, labelRight: string, hintLeft = "Mention : « Lu et approuvé »- Date : _____________", hintRight = "Mention : « Lu et approuvé »- Date : _____________"): string {
  return `<div class="signatures">
    <div class="sig-box">
      <div class="sig-label">${labelLeft}</div>
      <div class="sig-hint">${hintLeft}<br/><br/>Signature :</div>
    </div>
    <div class="sig-box">
      <div class="sig-label">${labelRight}</div>
      <div class="sig-hint">${hintRight}<br/><br/>Signature :</div>
    </div>
  </div>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. CONTRAT DE BAIL PRINCIPAL- ZEYNA ↔ BAILLEUR
// ─────────────────────────────────────────────────────────────────────────────

export const generateConventionBailleurHTML = (data: {
  refConvention: string;
  dateEmission: string;
  bailleur: { prenom: string; nom: string; telephone?: string; adresse?: string };
  logement: { nom: string; adresse: string; ville: string; type: string };
  chambres: { nom: string; prix_bailleur?: number; prix_zeyna?: number; marge?: number }[];
  dateDebut: string;
}): string => {
  const c = getCompanyInfo();
  const refConvention = escapeHtml(data.refConvention);
  const dateEmission = escapeHtml(data.dateEmission);
  const dateDebut = escapeHtml(data.dateDebut);
  const bPrenom = escapeHtml(data.bailleur.prenom);
  const bNom = escapeHtml(data.bailleur.nom);
  const bNomComplet = `${bPrenom} ${bNom}`.trim();
  const bAdresse = escapeHtml(data.bailleur.adresse || "[adresse à compléter]");
  const bTel = escapeHtml(data.bailleur.telephone || "[téléphone à compléter]");
  const logNom = escapeHtml(data.logement.nom);
  const logAdresse = escapeHtml(data.logement.adresse);
  const logVille = escapeHtml(data.logement.ville);
  const logType = escapeHtml(data.logement.type);
  const chambresRows = data.chambres.map(ch =>
    `<tr><td>${escapeHtml(ch.nom)}</td><td>${fmt(ch.prix_bailleur)}</td><td>[Oui / Non]</td><td>${fmt(ch.prix_zeyna)}</td><td>[À vérifier]</td></tr>`
  ).join("");
  const chambresList = data.chambres.map(ch => escapeHtml(ch.nom)).join(", ");

  const body = `
  ${header(data.refConvention, data.dateEmission)}

  <div class="doc-title">CONTRAT DE BAIL PRINCIPAL À USAGE D'HABITATION</div>
  <div class="doc-subtitle">Avec autorisation expresse et écrite de sous-location au profit de Les Logements de ZEYNA</div>

  <div class="important-box">
    <p>IMPORTANT- PROJET DE TRAVAIL</p>
    <ul>
      <li>Compléter toutes les mentions entre crochets et supprimer les options non retenues avant signature.</li>
      <li>Vérifier la forme juridique et l'identité exacte de ZEYNA, ainsi que le pouvoir du signataire.</li>
      <li>Le régime de durée du bail et la possibilité de sous-location doivent être validés selon le COCC et la situation réelle.</li>
      <li>Le prix de chaque sous-location doit respecter le plafond légal applicable. L'autorisation doit être documentée pour chaque sous-locataire.</li>
    </ul>
  </div>

  <h2 class="partie-title">ENTRE LES SOUSSIGNÉS</h2>
  <p><strong>1. Le Bailleur :</strong> ${bNomComplet}, demeurant à ${bAdresse}, téléphone ${bTel}, ci-après désigné « le Bailleur ».</p>
  <p><strong>2. Le Preneur principal :</strong> ${c.nom}, ${c.forme}, immatriculée sous le numéro ${c.rccm} et NINEA ${c.ninea}, dont le siège est situé à ${c.adresse}, représentée par ${c.representant}, dûment habilité(e), exploitant le service sous l'appellation « Les Logements de ZEYNA », ci-après désignée « ZEYNA » ou « le Preneur principal ».</p>
  <p>Le Bailleur et ZEYNA sont ci-après individuellement une « Partie » et ensemble les « Parties ».</p>

  <h2 class="partie-title">PRÉAMBULE</h2>
  <p>Le Bailleur déclare disposer des droits nécessaires pour donner à bail les locaux décrits au présent contrat. Les Parties souhaitent organiser leur location à ZEYNA pour un usage d'habitation, avec autorisation expresse de sous-louer les unités identifiées dans les annexes, conformément aux dispositions impératives applicables au Sénégal.</p>
  <p>Le préambule et les annexes expressément visées font partie intégrante du présent contrat.</p>

  <h3 class="article-title">ARTICLE 1- OBJET ET DÉSIGNATION DES LOCAUX</h3>
  <p>Le Bailleur donne à bail à ZEYNA, qui accepte, les locaux sis à <strong>${logAdresse}, ${logVille}</strong>, comprenant : ${logType} – <strong>${logNom}</strong>.</p>
  <p>La description détaillée des locaux, des chambres/studios/appartements, des espaces privatifs et des espaces partagés figure à l'<strong>Annexe 1</strong>. Seules les unités expressément listées comme pouvant être sous-louées sont couvertes par l'autorisation prévue à l'article 5.</p>
  <p>Les caractéristiques, équipements, meubles, sanitaires, accès, compteurs et clés remis doivent être constatés dans un état des lieux contradictoire annexé au contrat.</p>

  <h3 class="article-title">ARTICLE 2- DESTINATION ET USAGE AUTORISÉ</h3>
  <p>Les locaux sont destinés à l'habitation. Le Bailleur autorise leur exploitation par ZEYNA en vue de l'hébergement résidentiel d'étudiants et d'autres occupants correspondant à la destination convenue, sous réserve du respect du présent contrat et de la réglementation applicable.</p>
  <p>Toute activité différente, transformation matérielle des locaux ou changement de destination exige l'accord préalable et écrit du Bailleur et, lorsque nécessaire, les autorisations administratives applicables.</p>

  <h3 class="article-title">ARTICLE 3- DURÉE ET RÉGIME DU BAIL</h3>
  <p>Le régime et la durée doivent être choisis avant signature en fonction de la nature réelle de la location et des dispositions impératives du COCC. Cocher une seule option après vérification juridique :</p>
  <ul>
    <li><span class="checkbox"></span> Bail d'habitation de droit commun à durée de trois (3) ans, renouvelable dans les conditions légales ;</li>
    <li><span class="checkbox"></span> Bail d'habitation à durée indéterminée ;</li>
    <li><span class="checkbox"></span> Autre régime légal applicable, expressément validé par écrit par un conseil juridique : [à préciser].</li>
  </ul>
  <p>Date de prise d'effet : <strong>${dateDebut}</strong>. Date/terme, lorsque le régime retenu le prévoit : [date ou mention appropriée].</p>

  <h3 class="article-title">ARTICLE 4- LOYER PRINCIPAL, DÉPÔT DE GARANTIE ET PAIEMENT</h3>
  <p>Le loyer principal convenu pour l'ensemble des locaux est fixé à <strong>[montant en chiffres] FCFA</strong> ([montant en lettres] francs CFA) par mois. Il est payable au plus tard le [jour] de chaque période, par [mode et coordonnées de paiement], contre quittance ou reçu conforme.</p>
  <p>Dépôt de garantie éventuellement convenu : [montant] FCFA. Sa nature, son utilisation et ses conditions de restitution sont définies conformément au droit applicable.</p>
  <p>Aucun paiement en espèces ou par voie électronique ne dispense la Partie qui reçoit les fonds d'enregistrer l'opération et de remettre un justificatif mentionnant la date, le montant et l'imputation du paiement.</p>

  <h3 class="article-title">ARTICLE 5- AUTORISATION EXPRESSE ET ÉCRITE DE SOUS-LOCATION</h3>
  <p>Le Bailleur autorise expressément et par écrit ZEYNA à sous-louer à usage d'habitation les unités détaillées à l'Annexe 1, exclusivement dans les limites de la destination, de la capacité d'occupation, des conditions financières et des règles prévues au présent contrat.</p>
  <p>Pour chaque sous-location, ZEYNA notifiera au Bailleur le nom du sous-locataire et le taux du sous-loyer, ainsi que l'unité concernée et la date envisagée de prise d'effet. Les Parties utiliseront la fiche de notification et de consentement de l'<strong>Annexe 2</strong>. La fiche devra être complétée avant l'entrée dans les lieux.</p>
  <p>Toute sous-location d'une unité non listée, toute cession du bail principal ou tout changement substantiel de destination nécessite un accord écrit préalable du Bailleur.</p>
  <p>Cette autorisation n'a pas pour effet de libérer ZEYNA de ses obligations de locataire principal envers le Bailleur.</p>

  <h3 class="article-title">ARTICLE 6- PRIX DES SOUS-LOCATIONS ET RESPECT DU PLAFOND LÉGAL</h3>
  <p>Les Parties s'engagent à fixer les loyers de sous-location et toute somme liée à l'occupation en respectant les dispositions impératives applicables, notamment les <strong>articles 577 et 578 du Code des obligations civiles et commerciales du Sénégal (COCC)</strong>.</p>
  <p>Selon l'article 578 du COCC, le prix de sous-location ne peut en principe dépasser le loyer dû au Bailleur principal. Lorsque les locaux sous-loués sont garnis par le Preneur principal de meubles en bon état et en quantité suffisante, le plafond légal peut, dans les conditions prévues par cet article, atteindre 150 % du loyer principal. Cette exception ne s'applique pas automatiquement.</p>
  <p>Le taux du sous-loyer est précisé dans la fiche individuelle de notification de l'Annexe 2. Le caractère meublé ou non meublé du local, l'inventaire du mobilier et les éléments nécessaires à la vérification du plafond applicable sont documentés dans les annexes. Une grille de contrôle figure à l'<strong>Annexe 5</strong>.</p>
  <p>Aucune ventilation artificielle en frais, prestations ou suppléments ne peut avoir pour objet de contourner un plafond légal.</p>

  <h3 class="article-title">ARTICLE 7- OBLIGATIONS DU BAILLEUR</h3>
  <p>Le Bailleur s'engage, dans les limites prévues par le droit applicable, à :</p>
  <ul>
    <li>délivrer les locaux dans un état compatible avec l'usage convenu et remettre les clés selon l'état des lieux contradictoire ;</li>
    <li>assurer les réparations et interventions qui lui incombent légalement ou contractuellement ;</li>
    <li>garantir ZEYNA contre les troubles de jouissance et les défauts relevant de ses obligations ;</li>
    <li>ne pas entraver sans motif légitime l'usage convenu des locaux ;</li>
    <li>communiquer à ZEYNA toute information importante sur la sécurité, les travaux, les charges et les équipements ;</li>
    <li>confirmer par écrit toute autorisation, modification ou décision pour laquelle un écrit est requis.</li>
  </ul>

  <h3 class="article-title">ARTICLE 8- OBLIGATIONS DE ZEYNA COMME PRENEUR PRINCIPAL</h3>
  <p>ZEYNA s'engage à :</p>
  <ul>
    <li>payer le loyer principal et les sommes contractuellement dues aux échéances convenues ;</li>
    <li>utiliser les locaux conformément à leur destination et faire respecter cette destination par les occupants ;</li>
    <li>assurer l'entretien courant mis légalement à sa charge et signaler rapidement au Bailleur les défauts et incidents ;</li>
    <li>tenir un registre des unités proposées, des sous-locations, des loyers, des notifications et des autorisations écrites ;</li>
    <li>notifier les sous-locations et les taux correspondants selon les modalités prévues à l'article 5 ;</li>
    <li>remettre les locaux en fin de bail selon les obligations légales, sous réserve de l'usure normale.</li>
  </ul>

  <h3 class="article-title">ARTICLE 9- CHARGES, EAU, ÉLECTRICITÉ ET AUTRES CONSOMMATIONS</h3>
  <p>Les Parties cochent et précisent les modalités applicables : eau [incluse / facturée séparément / selon relevé / autre] ; électricité [incluse / facturée séparément / selon relevé / autre] ; autres charges [détail].</p>
  <p>Les règles de calcul, de répartition, les compteurs disponibles, les justificatifs et la périodicité de règlement sont décrits à l'<strong>Annexe 3</strong>. Toute charge récupérable doit être justifiable.</p>

  <h3 class="article-title">ARTICLE 10- ÉTAT DES LIEUX, CLÉS ET MOBILIER</h3>
  <p>Un état des lieux contradictoire est établi à l'entrée et à la sortie de ZEYNA. L'inventaire du mobilier et des équipements, le nombre de clés et les anomalies constatées sont consignés par écrit. Les Parties signent l'état des lieux et en conservent chacune une copie.</p>

  <h3 class="article-title">ARTICLE 11- ENTRETIEN, TRAVAUX ET INCIDENTS</h3>
  <p>ZEYNA signale sans délai au Bailleur les désordres susceptibles d'affecter la sécurité, la salubrité ou l'usage normal des locaux. Les Parties conviennent d'un canal de signalement : [téléphone / courriel / autre] et d'un contact d'urgence : [coordonnées]. Les coûts sont supportés par la Partie à laquelle ils incombent légalement ou contractuellement.</p>

  <h3 class="article-title">ARTICLE 12- ASSURANCE ET SÉCURITÉ</h3>
  <p>Les exigences d'assurance applicables à chaque Partie et les justificatifs à remettre sont les suivants : [à compléter après vérification]. Aucune assurance n'est réputée souscrite du seul fait de la signature du présent contrat.</p>

  <h3 class="article-title">ARTICLE 13- SOUS-LOCATIONS EN COURS ET FIN DU BAIL PRINCIPAL</h3>
  <p>ZEYNA informe le Bailleur de toute difficulté susceptible d'affecter la continuité du bail principal ou les droits des sous-locataires. Elle tient à jour les notifications individuelles visées à l'Annexe 2.</p>
  <p>En cas d'expiration, de résiliation, de perte du droit de jouissance ou d'indisponibilité des locaux, les Parties doivent agir sans délai afin de limiter le préjudice des occupants et respecter les droits et procédures imposés par la loi. Aucune clause du présent contrat ne peut écarter les protections légales d'un sous-locataire.</p>

  <h3 class="article-title">ARTICLE 14- INEXÉCUTION, RÉSILIATION ET FIN DU CONTRAT</h3>
  <p>En cas d'inexécution, la Partie concernée adresse à l'autre une notification ou mise en demeure suivant les formes, délais et modalités imposés par les dispositions applicables. Les procédures judiciaires ou extrajudiciaires légalement requises doivent être respectées.</p>
  <p>À la fin du contrat, les Parties organisent l'état des lieux de sortie, la restitution des clés, la clôture des charges justifiées et la restitution du dépôt de garantie selon les règles applicables.</p>

  <h3 class="article-title">ARTICLE 15- NOTIFICATIONS ET PREUVE</h3>
  <p>Les coordonnées de notification des Parties sont celles mentionnées en tête du contrat, sauf changement communiqué par écrit. Les messages électroniques peuvent servir au suivi opérationnel dans les limites admises par la loi ; ils ne remplacent pas un acte extrajudiciaire lorsqu'un tel acte est requis.</p>

  <h3 class="article-title">ARTICLE 16- RÈGLEMENT DES DIFFÉRENDS ET DROIT APPLICABLE</h3>
  <p>Le présent contrat est régi par le droit sénégalais. En cas de difficulté, les Parties recherchent d'abord une solution amiable documentée. À défaut d'accord, le litige est soumis à la juridiction compétente conformément aux règles applicables.</p>

  <h3 class="article-title">ARTICLE 17- INTÉGRALITÉ, MODIFICATIONS ET ANNEXES</h3>
  <p>Le présent contrat et ses annexes constituent l'accord écrit des Parties sur son objet. Toute modification doit être consignée par écrit et signée par les Parties.</p>
  <p><strong>Annexes :</strong> Annexe 1- Désignation des locaux et unités ; Annexe 2- Notification et autorisation individuelle de sous-location ; Annexe 3- Charges et modalités de calcul ; Annexe 4- État des lieux et inventaire ; Annexe 5- Grille de contrôle des loyers de sous-location.</p>

  <p>Fait à [lieu], le ${dateEmission}, en deux exemplaires.</p>

  ${sigBlock(
    `LE BAILLEUR<br/>${bNomComplet}`,
    `ZEYNA- PRENEUR PRINCIPAL<br/>Représentant : ${c.representant}`
  )}

  <div class="page-break"></div>
  <h2 class="partie-title">ANNEXE 1- DÉSIGNATION DES LOCAUX ET UNITÉS</h2>
  <table>
    <tr><th>Champ</th><th>Description / valeur à compléter</th></tr>
    <tr><td>Adresse complète</td><td>${logAdresse}, ${logVille}</td></tr>
    <tr><td>Référence du logement</td><td>${logNom}</td></tr>
    <tr><td>Type</td><td>${logType}</td></tr>
    <tr><td>Unités autorisées à la sous-location</td><td>${chambresList}</td></tr>
    <tr><td>Capacité autorisée par unité</td><td>[Nombre de personnes- à vérifier par unité]</td></tr>
    <tr><td>Salle de bain / sanitaires</td><td>[Privatifs ou communs- préciser]</td></tr>
    <tr><td>État meublé</td><td>[Meublé / non meublé]</td></tr>
    <tr><td>Mobilier fourni par ZEYNA</td><td>[Liste et état, si applicable]</td></tr>
    <tr><td>Espaces communs autorisés</td><td>[Cuisine, cour, salon, couloir, douche, etc.]</td></tr>
    <tr><td>Compteurs et équipements</td><td>[Numéros/relevés et description]</td></tr>
    <tr><td>Restrictions convenues</td><td>[Aucune autre que celles valablement convenues / préciser]</td></tr>
  </table>

  <div class="page-break"></div>
  <h2 class="partie-title">ANNEXE 2- FICHE DE NOTIFICATION ET D'AUTORISATION INDIVIDUELLE DE SOUS-LOCATION</h2>
  <table>
    <tr><th>Champ</th><th>Informations à compléter</th></tr>
    <tr><td>Référence du bail principal</td><td>${refConvention}</td></tr>
    <tr><td>Logement / adresse</td><td>${logAdresse}, ${logVille}</td></tr>
    <tr><td>Unité sous-louée</td><td>[Chambre / studio / appartement- référence à compléter]</td></tr>
    <tr><td>Nom complet du sous-locataire</td><td>[Nom et prénoms]</td></tr>
    <tr><td>Téléphone / courriel</td><td>[Coordonnées]</td></tr>
    <tr><td>Date envisagée de prise d'effet</td><td>[Date]</td></tr>
    <tr><td>Durée / régime validé</td><td>[À compléter après vérification juridique]</td></tr>
    <tr><td>Taux du sous-loyer</td><td>[Montant, périodicité, devise]</td></tr>
    <tr><td>État du local</td><td>[Meublé / non meublé- inventaire joint si meublé]</td></tr>
    <tr><td>Vérification du plafond légal</td><td>[Référence ou fiche de calcul à conserver]</td></tr>
    <tr><td>Date de notification au Bailleur</td><td>[Date et mode de transmission]</td></tr>
  </table>
  <p><strong>ACCORD EXPRESS DU BAILLEUR :</strong> Je soussigné(e) ${bNomComplet}, Bailleur principal, donne mon accord exprès et écrit à la sous-location de l'unité désignée ci-dessus au sous-locataire identifié, au taux de sous-loyer mentionné, sous réserve du respect du contrat principal et des dispositions impératives applicables.</p>
  ${sigBlock(`LE BAILLEUR<br/>${bNomComplet}`, `ZEYNA- PRENEUR PRINCIPAL<br/>Représentant : ${c.representant}`)}

  <div class="page-break"></div>
  <h2 class="partie-title">ANNEXE 3- CHARGES ET MODALITÉS DE CALCUL</h2>
  <table>
    <tr><th>Charge / poste</th><th>Mode de calcul / prise en charge</th><th>Justificatif / échéance</th></tr>
    <tr><td>Eau</td><td>[Incluse / compteur / quote-part / autre]</td><td>[Facture / période]</td></tr>
    <tr><td>Électricité</td><td>[Incluse / compteur / quote-part / autre]</td><td>[Facture / période]</td></tr>
    <tr><td>Internet</td><td>[Applicable / non applicable / conditions]</td><td>[Préciser]</td></tr>
    <tr><td>Entretien espaces communs</td><td>[À préciser]</td><td>[À préciser]</td></tr>
    <tr><td>Autres charges</td><td>[À préciser]</td><td>[À préciser]</td></tr>
  </table>

  <div class="page-break"></div>
  <h2 class="partie-title">ANNEXE 4- ÉTAT DES LIEUX ET INVENTAIRE</h2>
  <table>
    <tr><th>Élément</th><th>État à l'entrée</th><th>État à la sortie / observations</th></tr>
    <tr><td>Murs / peinture</td><td>[Neuf / bon / usagé / dégradé]</td><td>[À compléter]</td></tr>
    <tr><td>Sol / plafond</td><td>[À compléter]</td><td>[À compléter]</td></tr>
    <tr><td>Portes / fenêtres / serrures</td><td>[À compléter]</td><td>[À compléter]</td></tr>
    <tr><td>Électricité / éclairage</td><td>[À compléter]</td><td>[À compléter]</td></tr>
    <tr><td>Plomberie / sanitaires</td><td>[À compléter]</td><td>[À compléter]</td></tr>
    <tr><td>Mobilier / équipements</td><td>[Inventaire détaillé à joindre]</td><td>[À compléter]</td></tr>
    <tr><td>Clés remises</td><td>[Nombre et identification]</td><td>[Nombre restitué]</td></tr>
    <tr><td>Relevés de compteurs</td><td>[Index / date]</td><td>[Index / date]</td></tr>
    <tr><td>Réserves / photos jointes</td><td>[À préciser]</td><td>[À préciser]</td></tr>
  </table>
  ${sigBlock(`BAILLEUR<br/>${bNomComplet}`, `ZEYNA<br/>Représentant : ${c.representant}`)}

  <div class="page-break"></div>
  <h2 class="partie-title">ANNEXE 5- GRILLE DE CONTRÔLE DES LOYERS DE SOUS-LOCATION</h2>
  <p>À compléter avant chaque mise en location et à conserver au dossier. La répartition d'un loyer global entre plusieurs unités doit être juridiquement vérifiée.</p>
  <table>
    <tr>
      <th>Unité</th>
      <th>Part de loyer principal retenue*</th>
      <th>Meublée par ZEYNA ?</th>
      <th>Sous-loyer envisagé</th>
      <th>Plafond / validation</th>
    </tr>
    ${chambresRows}
    <tr><td><strong>TOTAL</strong></td><td></td><td>—</td><td></td><td>[Vérification globale]</td></tr>
  </table>
  <p style="font-size:9pt">* La « part de loyer principal retenue » est une clé de suivi à justifier et à faire valider ; elle ne constitue pas, à elle seule, une interprétation officielle du plafond prévu à l'article 578 du COCC.</p>
  <table>
    <tr><th>Élément de contrôle</th><th>À compléter</th></tr>
    <tr><td>Référence du conseil / contrôle juridique</td><td>[Nom ou référence de note]</td></tr>
    <tr><td>Inventaire du mobilier joint</td><td>[Oui / non / référence]</td></tr>
    <tr><td>Méthode de répartition utilisée</td><td>[Description et justification]</td></tr>
    <tr><td>Date du contrôle</td><td>[Date]</td></tr>
    <tr><td>Personne ayant effectué le contrôle</td><td>[Nom / fonction]</td></tr>
  </table>

  <div class="doc-footer"><span>${c.nom} · ${c.adresse}</span><span>Réf : ${refConvention} · ${dateEmission}</span></div>`;

  return wrap(body);
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. CONTRAT DE SOUS-LOCATION- ZEYNA ↔ ÉTUDIANT
// ─────────────────────────────────────────────────────────────────────────────

export const generateContratClientHTML = (data: {
  refContrat: string;
  dateEmission: string;
  client: { prenom: string; nom: string; telephone?: string };
  logement: { nom: string; adresse: string; ville: string; type: string };
  chambre: { nom: string; nombre_personnes?: number; prix_zeyna?: number };
  caution: number;
  dateDebut: string;
}): string => {
  const c = getCompanyInfo();
  const refContrat = escapeHtml(data.refContrat);
  const dateEmission = escapeHtml(data.dateEmission);
  const dateDebut = escapeHtml(data.dateDebut);
  const cliPrenom = escapeHtml(data.client.prenom);
  const cliNom = escapeHtml(data.client.nom);
  const cliNomComplet = `${cliPrenom} ${cliNom}`.trim();
  const cliTel = escapeHtml(data.client.telephone || "[téléphone]");
  const logNom = escapeHtml(data.logement.nom);
  const logAdresse = escapeHtml(data.logement.adresse);
  const logVille = escapeHtml(data.logement.ville);
  const logType = escapeHtml(data.logement.type);
  const chNom = escapeHtml(data.chambre.nom);
  const chCapacite = escapeHtml(data.chambre.nombre_personnes ?? "[à compléter]");

  const body = `
  ${header(data.refContrat, data.dateEmission)}

  <div class="doc-title">CONTRAT DE SOUS-LOCATION À USAGE D'HABITATION</div>
  <div class="doc-subtitle">Entre Les Logements de ZEYNA, sous-bailleur, et l'étudiant sous-locataire</div>

  <div class="important-box">
    <p>IMPORTANT- PROJET DE TRAVAIL</p>
    <ul>
      <li>Projet à personnaliser pour chaque étudiant ; aucun contrat ne doit être signé avec des champs obligatoires non renseignés.</li>
      <li>Joindre la fiche d'autorisation écrite de sous-location relative à cet étudiant et à cette unité.</li>
      <li>Avant signature, choisir le régime juridique et la durée applicables ; vérifier le plafond légal du sous-loyer.</li>
      <li>Le présent modèle doit être relu par un juriste sénégalais, notamment quant à la durée, au loyer, à la caution et à la sous-location.</li>
    </ul>
  </div>

  <h2 class="partie-title">ENTRE LES SOUSSIGNÉS</h2>
  <p><strong>1. Le Sous-bailleur :</strong> ${c.nom}, ${c.forme}, immatriculée sous le numéro ${c.rccm} et NINEA ${c.ninea}, dont le siège est situé à ${c.adresse}, représentée par ${c.representant}, dûment habilité(e), ci-après désignée « ZEYNA » ou « le Sous-bailleur ».</p>
  <p><strong>2. Le Sous-locataire :</strong> ${cliNomComplet}, téléphone ${cliTel}, ci-après désigné « l'Étudiant » ou « le Sous-locataire ».</p>
  <p>Les Parties déclarent avoir la capacité nécessaire pour conclure le présent contrat.</p>

  <h2 class="partie-title">PRÉAMBULE</h2>
  <p>ZEYNA déclare détenir un droit de jouissance principal sur le logement visé et une autorisation écrite de sous-location couvrant l'unité désignée, le sous-locataire et le taux de sous-loyer, selon la fiche jointe en <strong>Annexe 1</strong>. Le Bailleur principal n'est pas signataire du présent contrat et n'est pas le cocontractant de l'Étudiant, sans préjudice des droits que la loi peut lui reconnaître, notamment ceux prévus par l'article 578 du COCC.</p>
  <p>Le préambule et les annexes visées font partie intégrante du contrat.</p>

  <h3 class="article-title">ARTICLE 1- OBJET ET DÉSIGNATION DU LOGEMENT</h3>
  <p>ZEYNA, agissant en qualité de locataire principal dûment autorisé à sous-louer, donne en sous-location au Sous-locataire, pour l'usage d'habitation convenu, l'unité décrite ci-dessous :</p>
  <ul>
    <li>Adresse complète : <strong>${logAdresse}, ${logVille}</strong> ;</li>
    <li>Logement / résidence : <strong>${logNom}</strong> ;</li>
    <li>Type de logement : ${logType} ;</li>
    <li>Unité louée : <strong>${chNom}</strong> ;</li>
    <li>Capacité maximale : ${chCapacite} personne(s) ;</li>
    <li>Sanitaires : [salle de bain privée / douche commune / autres précisions] ;</li>
    <li>Espaces partagés autorisés : [liste] ;</li>
    <li>État meublé et équipements : [description exacte- inventaire en Annexe 4].</li>
  </ul>

  <h3 class="article-title">ARTICLE 2- AUTORISATION DE SOUS-LOCATION</h3>
  <p>ZEYNA déclare avoir obtenu l'accord exprès et écrit requis pour sous-louer l'unité au Sous-locataire. La fiche d'autorisation individualisée et de notification au Bailleur principal est annexée au présent contrat (Annexe 1). Toute modification de l'unité, du taux du sous-loyer ou de l'identité du sous-locataire nécessitant une nouvelle notification ou autorisation doit être régularisée par écrit avant sa mise en œuvre.</p>

  <h3 class="article-title">ARTICLE 3- DURÉE, PRISE D'EFFET ET REMISE DES CLÉS</h3>
  <p>Le régime de durée retenu doit être sélectionné avant signature après vérification de la situation réelle et du régime légal applicable :</p>
  <ul>
    <li><span class="checkbox"></span> Bail d'habitation de droit commun : [durée/régime à compléter conformément au COCC] ;</li>
    <li><span class="checkbox"></span> Location saisonnière au sens du régime légal applicable : du [date] au [date] ;</li>
    <li><span class="checkbox"></span> Autre régime expressément validé par un conseil juridique : [préciser].</li>
  </ul>
  <p>Date de prise d'effet juridique : <strong>${dateDebut}</strong>. Date prévue d'entrée dans les lieux : [date]. Remise effective des clés : [date et heure, constatées par écrit].</p>
  <p>La validation d'un paiement et la prise d'effet du contrat sont des événements distincts. Le contrat ne peut avoir pour effet d'écarter les règles légales relatives à la durée, au renouvellement ou à la résiliation.</p>

  <h3 class="article-title">ARTICLE 4- LOYER ET MODALITÉS DE PAIEMENT</h3>
  <p>Le loyer mensuel de sous-location convenu est de <strong>${fmt(data.chambre.prix_zeyna)}</strong>, payable à ZEYNA au plus tard le [jour] de chaque période, par [moyen de paiement et coordonnées officiellement communiquées].</p>
  <p>Le sous-loyer doit respecter le plafond applicable prévu par le droit sénégalais, notamment l'article 578 du COCC. En principe, le prix de sous-location ne peut dépasser le loyer dû au Bailleur principal. Avant signature, ZEYNA vérifie et conserve les éléments permettant d'établir la conformité du taux du sous-loyer.</p>
  <p>Tout paiement donne lieu à un reçu ou à une quittance mentionnant la date, le montant, la période concernée et l'imputation des sommes versées.</p>

  <h3 class="article-title">ARTICLE 5- DÉPÔT DE GARANTIE (CAUTION)</h3>
  <p>Le dépôt de garantie convenu est fixé à <strong>${fmt(data.caution)}</strong>. Il est encaissé par ZEYNA et enregistré séparément du loyer.</p>
  <p>Le dépôt de garantie n'est pas un loyer et ne peut être imputé sur les loyers courants sans accord écrit ou base légale. Il garantit uniquement les obligations pour lesquelles une retenue est licite et justifiée.</p>
  <p>À la fin de la sous-location, après restitution des clés et état des lieux de sortie, ZEYNA procède au décompte des sommes restant dues et des éventuelles retenues justifiées. Elle communique au Sous-locataire un décompte écrit. Aucune retenue ne peut être opérée sur la seule base d'une usure normale.</p>

  <h3 class="article-title">ARTICLE 6- CHARGES, EAU, ÉLECTRICITÉ ET SERVICES</h3>
  <p>Les conditions applicables à l'unité sont indiquées ci-dessous et détaillées à l'<strong>Annexe 2</strong> : eau [incluse / distincte] ; électricité [incluse / distincte] ; équipements/consommations inclus [description précise] ; autres charges autorisées [nature, montant ou calcul, échéance et justificatif]. Les charges ne sont dues que selon les modalités convenues, justifiées lorsque cela est requis, et sans double facturation.</p>

  <h3 class="article-title">ARTICLE 7- ENGAGEMENTS DE ZEYNA</h3>
  <p>ZEYNA s'engage, dans les limites du contrat et du droit applicable, à :</p>
  <ul>
    <li>mettre l'unité à disposition à la date convenue et remettre les clés contre constat écrit ;</li>
    <li>fournir des informations exactes sur le type de logement, la capacité, les sanitaires, les espaces communs, les charges et les équipements annoncés ;</li>
    <li>recevoir et enregistrer les loyers, cautions et autres paiements autorisés, puis remettre les justificatifs correspondants ;</li>
    <li>rester l'interlocuteur contractuel exclusif de l'Étudiant pour les demandes et réclamations relatives au logement ;</li>
    <li>organiser le suivi des incidents, coordonner les interventions nécessaires et informer l'Étudiant de leur traitement ;</li>
    <li>protéger les données personnelles de l'Étudiant conformément à la politique de confidentialité.</li>
  </ul>

  <h3 class="article-title">ARTICLE 8- ENGAGEMENTS DU SOUS-LOCATAIRE</h3>
  <p>Le Sous-locataire s'engage à :</p>
  <ul>
    <li>payer le loyer et les charges licitement dus aux échéances convenues ;</li>
    <li>utiliser les lieux paisiblement, exclusivement pour la destination convenue, et respecter la capacité maximale indiquée ;</li>
    <li>maintenir l'unité propre, assurer l'entretien courant qui lui incombe et signaler rapidement les défauts ou incidents ;</li>
    <li>respecter les espaces communs et les droits des autres occupants ;</li>
    <li>ne pas transformer les lieux ou réaliser des travaux sans accord écrit requis ;</li>
    <li>ne pas céder ni sous-louer l'unité à un tiers sans autorisation écrite préalable et conformément au droit applicable ;</li>
    <li>restituer les lieux, équipements et clés à la fin du contrat, sous réserve de l'usure normale.</li>
  </ul>

  <h3 class="article-title">ARTICLE 9- ÉTAT DES LIEUX, INVENTAIRE ET CLÉS</h3>
  <p>Un état des lieux contradictoire est établi lors de la remise et de la restitution des clés. Le nombre et l'identification des clés remises sont consignés par écrit. Le Sous-locataire reçoit une copie de l'état des lieux et de l'inventaire.</p>

  <h3 class="article-title">ARTICLE 10- SIGNALEMENT ET GESTION DES INCIDENTS</h3>
  <p>Toute anomalie, panne, fuite, problème électrique ou de sécurité doit être signalé à ZEYNA via les canaux officiels de la plateforme. ZEYNA accuse réception de la demande et informe l'Étudiant des suites utiles. Le Sous-locataire coopère à l'accès nécessaire aux réparations, dans le respect de sa jouissance.</p>

  <h3 class="article-title">ARTICLE 11- ACCÈS AUX LIEUX ET TRAVAUX</h3>
  <p>ZEYNA ou les intervenants mandatés peuvent accéder aux lieux pour une réparation, un contrôle nécessaire ou une intervention convenue, sous réserve d'une information préalable raisonnable et du respect de la vie privée du Sous-locataire. En cas de danger imminent ou d'urgence réelle, l'intervention est organisée dans les limites autorisées par la loi.</p>

  <h3 class="article-title">ARTICLE 12- RÈGLES D'OCCUPATION ET VIE COLLECTIVE</h3>
  <p>Le Sous-locataire respecte les règles de sécurité, de tranquillité, d'hygiène et d'usage des espaces communs communiquées en <strong>Annexe 3</strong>. Ces règles doivent être raisonnables, non discriminatoires et compatibles avec le contrat et la loi.</p>

  <h3 class="article-title">ARTICLE 13- DÉFAUT, RÉSILIATION ET DÉPART</h3>
  <p>En cas de manquement, la Partie concernée met l'autre en demeure selon les formes et délais applicables. La résiliation, l'expulsion ou la récupération forcée des lieux ne peut intervenir que conformément aux procédures légales applicables. Le présent contrat ne crée aucun droit à une expulsion immédiate ou à une confiscation automatique de sommes.</p>
  <p>Les conditions de congé, renouvellement, départ anticipé et fin de la sous-location doivent être interprétées conformément au régime de durée sélectionné à l'article 3 et aux dispositions impératives du COCC. À la sortie, les Parties établissent l'état des lieux, enregistrent la restitution des clés, arrêtent les charges justifiées et établissent le décompte du dépôt de garantie.</p>

  <h3 class="article-title">ARTICLE 14- DONNÉES PERSONNELLES ET COMMUNICATIONS</h3>
  <p>Les coordonnées et données nécessaires au contrat sont utilisées pour l'identification des Parties, la gestion des paiements, la sécurité, le traitement des demandes et le respect des obligations légales. ZEYNA limite les accès aux personnes autorisées.</p>

  <h3 class="article-title">ARTICLE 15- DROIT APPLICABLE ET DIFFÉRENDS</h3>
  <p>Le présent contrat est régi par le droit sénégalais. Les Parties recherchent de bonne foi une solution amiable et documentée en cas de difficulté. À défaut d'accord, le différend est porté devant la juridiction compétente selon les règles applicables.</p>

  <h3 class="article-title">ARTICLE 16- DOCUMENTS CONTRACTUELS ET SIGNATURE</h3>
  <p>Le présent contrat est établi à Saint-Louis, le ${dateEmission}, en deux exemplaires ou signé par un procédé électronique dont la validité et la conservation ont été vérifiées. Chaque Partie reconnaît recevoir un exemplaire complet avec ses annexes.</p>
  <ul>
    <li><span class="checkbox"></span> Annexe 1- Autorisation écrite de sous-location et notification individuelle ;</li>
    <li><span class="checkbox"></span> Annexe 2- Fiche descriptive, loyer et charges ;</li>
    <li><span class="checkbox"></span> Annexe 3- Règles d'occupation des lieux ;</li>
    <li><span class="checkbox"></span> Annexe 4- État des lieux et inventaire ;</li>
    <li><span class="checkbox"></span> Annexe 5- Échéancier / reçu du dépôt de garantie.</li>
  </ul>

  ${sigBlock(
    `ZEYNA- SOUS-BAILLEUR<br/>Représentant : ${c.representant}`,
    `L'ÉTUDIANT- SOUS-LOCATAIRE<br/>${cliNomComplet}`
  )}

  <div class="page-break"></div>
  <h2 class="partie-title">ANNEXE 1- AUTORISATION ÉCRITE DE SOUS-LOCATION</h2>
  <table>
    <tr><th>Champ</th><th>Donnée</th></tr>
    <tr><td>Référence du bail principal</td><td>[ZEYNA-BAIL-____]</td></tr>
    <tr><td>ZEYNA, preneur principal</td><td>${c.nom}- ${c.forme}</td></tr>
    <tr><td>Étudiant concerné</td><td>${cliNomComplet}</td></tr>
    <tr><td>Adresse et unité sous-louée</td><td>${logAdresse}, ${logVille}- ${chNom}</td></tr>
    <tr><td>Taux du sous-loyer</td><td>${fmt(data.chambre.prix_zeyna)} / mois</td></tr>
    <tr><td>Date de prise d'effet prévue</td><td>${dateDebut}</td></tr>
    <tr><td>Caractère meublé</td><td>[Oui / non- inventaire joint]</td></tr>
    <tr><td>Date de notification</td><td>[Date / moyen de transmission]</td></tr>
  </table>
  <p><strong>Accord exprès du Bailleur principal :</strong> Je soussigné(e), Bailleur principal, donne mon accord exprès et écrit à la sous-location de l'unité ci-dessus à la personne identifiée au taux indiqué, sous réserve du respect du bail principal et des dispositions impératives applicables.</p>
  ${sigBlock(
    `BAILLEUR PRINCIPAL- CONSENTEMENT<br/>[Nom du Bailleur]`,
    `ZEYNA- PRENEUR PRINCIPAL<br/>Représentant : ${c.representant}`
  )}

  <div class="page-break"></div>
  <h2 class="partie-title">ANNEXE 2- FICHE DESCRIPTIVE, LOYER ET CHARGES</h2>
  <table>
    <tr><th>Élément</th><th>Description / valeur contractuelle</th></tr>
    <tr><td>Type</td><td>${logType}- ${chNom}</td></tr>
    <tr><td>Capacité maximale</td><td>${chCapacite} personne(s)</td></tr>
    <tr><td>Sanitaires</td><td>[Privés / communs / description]</td></tr>
    <tr><td>Espaces communs accessibles</td><td>[Cuisine, cour, douche commune, etc.]</td></tr>
    <tr><td>Mobilier et équipements</td><td>[Liste ou « non meublé »]</td></tr>
    <tr><td>Loyer</td><td>${fmt(data.chambre.prix_zeyna)}</td></tr>
    <tr><td>Caution</td><td>${fmt(data.caution)}</td></tr>
    <tr><td>Eau</td><td>[Incluse / distincte / mode de calcul]</td></tr>
    <tr><td>Électricité</td><td>[Incluse / distincte / mode de calcul]</td></tr>
    <tr><td>Autres charges</td><td>[Détail et justification]</td></tr>
    <tr><td>Date d'entrée / remise des clés</td><td>${dateDebut}</td></tr>
  </table>

  <div class="page-break"></div>
  <h2 class="partie-title">ANNEXE 3- RÈGLES D'OCCUPATION DES LIEUX</h2>
  <table>
    <tr><th>Sujet</th><th>Règle convenue</th></tr>
    <tr><td>Capacité / occupants</td><td>[Capacité et conditions]</td></tr>
    <tr><td>Visiteurs</td><td>[Règles précises]</td></tr>
    <tr><td>Tranquillité / nuisances</td><td>[Règles précises]</td></tr>
    <tr><td>Espaces communs</td><td>[Utilisation et entretien]</td></tr>
    <tr><td>Déchets / propreté</td><td>[Règles précises]</td></tr>
    <tr><td>Sécurité / urgences</td><td>[Consignes et contact]</td></tr>
    <tr><td>Équipements</td><td>[Conditions d'usage]</td></tr>
    <tr><td>Signalement des problèmes</td><td>Canal officiel ZEYNA · ${c.telephone}</td></tr>
  </table>

  <div class="page-break"></div>
  <h2 class="partie-title">ANNEXE 4- ÉTAT DES LIEUX ET INVENTAIRE</h2>
  <table>
    <tr><th>Élément</th><th>État à l'entrée</th><th>État à la sortie / observations</th></tr>
    <tr><td>Murs / peinture</td><td>[À compléter]</td><td>[À compléter]</td></tr>
    <tr><td>Sol / plafond</td><td>[À compléter]</td><td>[À compléter]</td></tr>
    <tr><td>Portes / fenêtres / serrure</td><td>[À compléter]</td><td>[À compléter]</td></tr>
    <tr><td>Installation électrique / éclairage</td><td>[À compléter]</td><td>[À compléter]</td></tr>
    <tr><td>Sanitaires / plomberie</td><td>[À compléter]</td><td>[À compléter]</td></tr>
    <tr><td>Mobilier / équipement</td><td>[Inventaire détaillé]</td><td>[À compléter]</td></tr>
    <tr><td>Clés</td><td>[Nombre/identification]</td><td>[Nombre restitué]</td></tr>
    <tr><td>Compteurs/relevés</td><td>[Index/date]</td><td>[Index/date]</td></tr>
    <tr><td>Réserves / photos</td><td>[À préciser]</td><td>[À préciser]</td></tr>
  </table>
  ${sigBlock(`ZEYNA<br/>Représentant : ${c.representant}`, `L'ÉTUDIANT<br/>${cliNomComplet}`)}

  <div class="page-break"></div>
  <h2 class="partie-title">ANNEXE 5- ÉCHÉANCIER ET REÇU DU DÉPÔT DE GARANTIE</h2>
  <table>
    <tr><th>Opération</th><th>Montant</th><th>Date prévue</th><th>Date reçue / référence</th></tr>
    <tr><td>Premier loyer / prorata</td><td>${fmt(data.chambre.prix_zeyna)}</td><td>${dateDebut}</td><td>[À compléter]</td></tr>
    <tr><td>Dépôt de garantie</td><td>${fmt(data.caution)}</td><td>${dateDebut}</td><td>[À compléter]</td></tr>
    <tr><td>Loyers périodiques</td><td>${fmt(data.chambre.prix_zeyna)}</td><td>[Échéance mensuelle]</td><td>[Référence du reçu]</td></tr>
    <tr><td>Charges justifiées</td><td>[Mode de calcul]</td><td>[Échéance]</td><td>[Justificatif]</td></tr>
  </table>
  <p><strong>Reçu du dépôt de garantie</strong> (à remplir uniquement après encaissement effectif) : Je soussigné(e), représentant(e) habilité(e) de ZEYNA, reconnais avoir reçu de <strong>${cliNomComplet}</strong> la somme de <strong>${fmt(data.caution)}</strong> au titre du dépôt de garantie du contrat référencé <strong>${refContrat}</strong>, le [date], par [moyen de paiement], référence de transaction [référence].</p>
  ${sigBlock(
    `ZEYNA- REÇU<br/>Représentant : ${c.representant}`,
    `L'ÉTUDIANT- PRISE DE CONNAISSANCE<br/>${cliNomComplet}`
  )}

  <div class="doc-footer"><span>${c.nom} · ${c.adresse}</span><span>Réf : ${refContrat} · ${dateEmission}</span></div>`;

  return wrap(body);
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. BON D'AFFECTATION- ZEYNA ↔ BAILLEUR (Aucune info étudiant)
// ─────────────────────────────────────────────────────────────────────────────

export const generateBonAffectationHTML = (data: {
  refAffectation: string;
  dateEmission: string;
  bailleur: { prenom: string; nom: string; telephone?: string };
  logement: { nom: string; adresse: string; ville: string; type: string };
  chambre: { nom: string; prix_bailleur?: number };
  dateDebut: string;
}): string => {
  const c = getCompanyInfo();
  const refAffectation = escapeHtml(data.refAffectation);
  const dateEmission = escapeHtml(data.dateEmission);
  const dateDebut = escapeHtml(data.dateDebut);
  const bPrenom = escapeHtml(data.bailleur.prenom);
  const bNom = escapeHtml(data.bailleur.nom);
  const bNomComplet = `${bPrenom} ${bNom}`.trim();
  const logNom = escapeHtml(data.logement.nom);
  const logAdresse = escapeHtml(data.logement.adresse);
  const logVille = escapeHtml(data.logement.ville);
  const chNom = escapeHtml(data.chambre.nom);

  const body = `
  ${header(refAffectation, dateEmission)}

  <div class="doc-title">BON D'AFFECTATION</div>
  <div class="doc-subtitle">Notification d'occupation- Document confidentiel</div>

  <p>Bonjour <strong>${bNomComplet}</strong>,</p>
  <p>L'équipe <strong>${c.nom}</strong> vous informe que la chambre <strong>${chNom}</strong> de votre logement <strong>${logNom}</strong> a été affectée à un locataire pris en charge par nos soins, conformément à la convention de gestion qui nous lie.</p>

  <h2 class="partie-title">Détails de l'affectation</h2>
  <table>
    <tr><th>Élément</th><th>Détail</th></tr>
    <tr><td>Logement</td><td>${logNom}- ${logAdresse}, ${logVille}</td></tr>
    <tr><td>Unité affectée</td><td>${chNom}</td></tr>
    <tr><td>Date de prise d'effet</td><td>${dateDebut}</td></tr>
    <tr><td>Loyer reversé au Bailleur</td><td>${data.chambre.prix_bailleur ? fmt(data.chambre.prix_bailleur) : "Selon convention"} / mois</td></tr>
    <tr><td>Référence</td><td>${refAffectation}</td></tr>
  </table>

  <p style="font-size:9pt;font-style:italic;margin-top:20px;">Ce document confirme la prise en charge de l'occupation par ${c.nom}. Conformément à nos conditions générales et à la convention de gestion, l'identité du locataire étudiant reste exclusivement gérée par nos services. ${c.nom} demeure votre unique interlocuteur (Locataire Principal) pour toute question relative à cet hébergement.</p>

  <div class="doc-footer"><span>${c.nom} · ${c.adresse}</span><span>Réf : ${refAffectation} · ${dateEmission}</span></div>`;

  return wrap(body);
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. REÇU DE PAIEMENT OFFICIEL (AUTOMATIQUE OU MANUEL)
// ─────────────────────────────────────────────────────────────────────────────

export interface RecuPaiementData {
  reference: string;
  dateEmission: string;
  payeur: {
    prenom: string;
    nom: string;
    telephone?: string;
    email?: string;
    qualite?: string;
  };
  logement?: {
    nom: string;
    adresse?: string;
    chambre?: string;
  };
  typeRecu: "caution" | "loyer" | "frais_dossier" | "manuel" | "autre";
  typeGeneration?: "automatique" | "manuel";
  montant: number;
  methodePaiement: string;
  referencePaiement?: string;
  motif: string;
  observations?: string;
}

export const generateRecuPaiementHTML = (data: RecuPaiementData): string => {
  const c = getCompanyInfo();
  const ref = escapeHtml(data.reference);
  const date = escapeHtml(data.dateEmission);
  const payeurNom = `${escapeHtml(data.payeur.prenom)} ${escapeHtml(data.payeur.nom)}`.trim();
  const payeurTel = escapeHtml(data.payeur.telephone || "-");
  const payeurEmail = escapeHtml(data.payeur.email || "-");
  const logNom = escapeHtml(data.logement?.nom || "Non spécifié");
  const chambreNom = escapeHtml(data.logement?.chambre || "Non spécifiée");
  const mode = escapeHtml(data.methodePaiement);
  const refPaiement = escapeHtml(data.referencePaiement || "Non spécifiée");
  const motif = escapeHtml(data.motif);
  const typeLabel =
    data.typeRecu === "caution"
      ? "Dépôt de garantie (Caution)"
      : data.typeRecu === "loyer"
      ? "Loyer mensuel d'habitation"
      : data.typeRecu === "frais_dossier"
      ? "Frais de dossier / service"
      : "Règlement / Régularisation";

  const body = `
  ${header(ref, date)}

  <div class="doc-title">REÇU DE PAIEMENT OFFICIEL</div>
  <div class="doc-subtitle">Quittance libératoire d'encaissement · ${escapeHtml(data.typeGeneration === "manuel" ? "Émission administrative manuelle" : "Génération automatique sécurisée")}</div>

  <div style="background:#f9f9f9;border:1px solid #ddd;border-radius:6px;padding:15px;margin:20px 0;display:flex;justify-content:space-between;align-items:center;">
    <div>
      <span style="font-size:10pt;color:#666;text-transform:uppercase;letter-spacing:0.05em;display:block;">Montant total encaissé</span>
      <span style="font-size:20pt;font-weight:bold;color:#111;">${data.montant.toLocaleString("fr-FR")} FCFA</span>
    </div>
    <div style="text-align:right;">
      <span style="display:inline-block;padding:4px 10px;background:#e2f7e5;color:#1e7e34;border:1px solid #c3e6cb;border-radius:4px;font-size:9pt;font-weight:bold;">PAIEMENT CONFIRMÉ</span>
      <p style="font-size:8.5pt;color:#666;margin-top:4px;">Date d'encaissement : ${date}</p>
    </div>
  </div>

  <h2 class="partie-title">1. INFORMATIONS DU BÉNÉFICIAIRE / PAYEUR</h2>
  <table>
    <tr><th style="width:30%;">Nom et Prénom</th><td><strong>${payeurNom}</strong></td></tr>
    <tr><th>Qualité</th><td>${escapeHtml(data.payeur.qualite || "Locataire")}</td></tr>
    <tr><th>Téléphone</th><td>${payeurTel}</td></tr>
    <tr><th>Email</th><td>${payeurEmail}</td></tr>
  </table>

  <h2 class="partie-title">2. DÉTAILS DE L'OPÉRATION & DU LOGEMENT</h2>
  <table>
    <tr><th style="width:30%;">Logement concerné</th><td><strong>${logNom}</strong></td></tr>
    <tr><th>Chambre / Unité</th><td>${chambreNom}</td></tr>
    <tr><th>Nature du versement</th><td><strong>${typeLabel}</strong></td></tr>
    <tr><th>Motif / Objet</th><td>${motif}</td></tr>
    <tr><th>Mode de règlement</th><td>${mode}</td></tr>
    <tr><th>Référence de transaction</th><td><span style="font-family:monospace;font-weight:bold;">${refPaiement}</span></td></tr>
  </table>

  ${data.observations ? `
  <div style="margin-top:15px;padding:10px;border-left:3px solid #666;background:#f5f5f5;font-size:9.5pt;">
    <strong>Observations particulières :</strong> ${escapeHtml(data.observations)}
  </div>` : ""}

  <div style="margin-top:25px;font-size:9pt;color:#444;line-height:1.6;border-top:1px solid #eee;padding-top:12px;">
    <p><strong>Note légale :</strong> Le présent reçu atteste de la réception effective de la somme mentionnée ci-dessus par <em>${c.nom}</em> pour le compte désigné. Il tient lieu de quittance libératoire pour le montant et le motif exclusivement indiqués.</p>
    <p style="margin-top:4px;">En cas de contestation ou de vérification comptable, veuillez vous adresser au service gestion : ${c.email} / ${c.telephone}.</p>
  </div>

  <div class="signatures" style="margin-top:35px;">
    <div class="sig-box">
      <div class="sig-label">Pour le Payeur / Locataire</div>
      <div class="sig-hint">Nom : ${payeurNom}<br/>Signature pour acquit :</div>
    </div>
    <div class="sig-box">
      <div class="sig-label">Pour la Direction ZEYNA</div>
      <div class="sig-hint">Cachet et signature habilitée<br/><br/>
        <div style="border:2px dashed #999;padding:6px;width:180px;text-align:center;font-size:8pt;color:#555;border-radius:4px;">
          LES LOGEMENTS DE ZEYNA<br/>
          SERVICE COMPTABILITÉ<br/>
          VALIDE ET ENREGISTRÉ
        </div>
      </div>
    </div>
  </div>

  <div class="doc-footer">
    <span>${c.nom} · ${c.forme} · RCCM ${c.rccm} · NINEA ${c.ninea}</span>
    <span>Réf : ${ref} · Édité le ${date}</span>
  </div>`;

  return wrap(body);
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. POLITIQUE DE CAUTION ET DÉPÔT DE GARANTIE
// ─────────────────────────────────────────────────────────────────────────────

export const generatePolitiqueCautionHTML = (): string => {
  const c = getCompanyInfo();
  const date = new Date().toLocaleDateString("fr-FR");

  const body = `
  ${header("POL-CAUTION-2026", date)}

  <div class="doc-title">POLITIQUE DE CAUTION ET DE DÉPÔT DE GARANTIE</div>
  <div class="doc-subtitle">Cadre de gestion, de sécurisation et de restitution de la caution locative</div>

  <div class="important-box">
    <p>ENGAGEMENT DE TRANSPARENCE ZEYNA</p>
    <p>Cette politique régit l'encaissement, la conservation et la restitution des dépôts de garantie pour tous les logements loués via la plateforme <strong>Les Logements de ZEYNA</strong>, dans le strict respect du Code des Obligations Civiles et Commerciales (COCC) du Sénégal.</p>
  </div>

  <h3 class="article-title">ARTICLE 1 – NATURE ET DESTINATION DU DÉPÔT DE GARANTIE</h3>
  <p>Le dépôt de garantie (communément désigné « caution ») a pour objet exclusif de garantir la bonne exécution des obligations du locataire, notamment :</p>
  <ul>
    <li>La réparation des dégradations anormales causées aux locaux, meubles ou équipements mis à disposition ;</li>
    <li>Le paiement des éventuels arriérés de loyers, charges ou consommations d'eau et d'électricité convenues ;</li>
    <li>La remise intégrale des clés et accessoires à la fin du séjour.</li>
  </ul>
  <p><strong>Règle fondamentale :</strong> Le dépôt de garantie <em>ne constitue en aucun cas une avance sur loyer</em>. L'étudiant ne peut en aucun cas s'abstenir de régler son dernier mois de loyer sous prétexte qu'une caution a été versée.</p>

  <h3 class="article-title">ARTICLE 2 – SÉQUESTRATION ET SÉCURISATION DES FONDS</h3>
  <p>Les fonds reçus au titre du dépôt de garantie sont séquestrés sur un compte dédié géré par <strong>${c.nom}</strong>. Ils demeurent indisponibles jusqu'à la clôture contradictoire du bail et l'établissement de l'état des lieux de sortie.</p>

  <h3 class="article-title">ARTICLE 3 – ÉTAT DES LIEUX CONTRADICTOIRE</h3>
  <p>La restitution ou toute retenue sur caution repose impérativement sur la comparaison entre deux états des lieux contradictoires :</p>
  <ul>
    <li><strong>L'état des lieux d'entrée :</strong> Réalisé conjointement lors de la remise des clés, avec inventaire détaillé du mobilier et des équipements.</li>
    <li><strong>L'état des lieux de sortie :</strong> Établi au moment du départ définitif de l'étudiant et de la restitution de l'ensemble des clés.</li>
  </ul>

  <h3 class="article-title">ARTICLE 4 – DÉLAIS ET CONDITIONS DE RESTITUTION</h3>
  <p>La restitution de la caution s'effectue selon le calendrier suivant :</p>
  <ul>
    <li><strong>Sous 15 jours calendaires :</strong> Lorsque l'état des lieux de sortie est rigoureusement conforme à l'entrée et qu'aucun impayé n'est constaté, la caution est restituée intégralement sous 15 jours via le moyen de paiement convenu (Wave, Orange Money ou virement bancaire).</li>
    <li><strong>Sous 30 jours calendaires au maximum :</strong> Si des retenues doivent être opérées, un décompte contradictoire détaillé accompagné des justificatifs (devis, factures d'artisans, relevés de consommation) est communiqué à l'étudiant, et le solde restant est restitué dans un délai ne pouvant excéder 30 jours à compter de la restitution des clés.</li>
  </ul>

  <h3 class="article-title">ARTICLE 5 – DISTINCTION ENTRE USURE NORMALE ET DÉGRADATION</h3>
  <p>Aucune retenue ne peut être appliquée au titre de la vétusté ou de l'usure normale résultant d'un usage paisible des lieux (ex : légère altération de la peinture par le temps, usure naturelle des joints ou serrures). Seules les dégradations manifestes, casses, disparitions de mobilier ou manquements manifestes d'entretien imputables à l'occupant font l'objet d'une retenue.</p>

  <h3 class="article-title">ARTICLE 6 – COMMISSION DE GARANTIE ET CAUTION BAILLEUR</h3>
  <p>Dans les cas où une commission de gestion de garantie Zeyna est appliquée à la caution, celle-ci est clairement ventilée et détaillée dès l'initialisation de la réservation. Le montant de la caution versé au bailleur et la garantie Zeyna sont consignés de manière transparente dans le contrat de location.</p>

  <h3 class="article-title">ARTICLE 7 – RECOURS ET MÉDIATION</h3>
  <p>En cas de désaccord sur le montant des retenues, l'étudiant dispose d'un droit de saisine directe de la Direction Générale de <strong>${c.nom}</strong> via la section Support / Incidents de la plateforme ou par courriel à <em>${c.email}</em>. Une médiation contradictoire est engagée sous 7 jours ouvrés.</p>

  <div class="doc-footer">
    <span>${c.nom} · Document de référence conforme COCC</span>
    <span>Date d'application : ${date}</span>
  </div>`;

  return wrap(body);
};

// ─────────────────────────────────────────────────────────────────────────────
// 6. Utilitaire d'impression
// ─────────────────────────────────────────────────────────────────────────────

export const printDocument = (htmlContent: string): void => {
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(htmlContent);
  win.document.close();
  win.onload = () => { win.focus(); win.print(); };
};