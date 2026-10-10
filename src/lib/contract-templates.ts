export const commonCSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Times New Roman', Times, serif; color: #000; background: #fff; padding: 40px; font-size: 11pt; line-height: 1.4; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid #000; }
  .brand-name { font-size: 16pt; font-weight: bold; text-transform: uppercase; }
  .doc-ref { text-align: right; font-size: 9pt; }
  .doc-title { text-align: center; font-size: 14pt; font-weight: bold; margin: 20px 0 10px; text-transform: uppercase; }
  .doc-subtitle { text-align: center; font-size: 11pt; font-style: italic; margin-bottom: 20px; }
  .important-box { border: 1px solid #000; padding: 10px; margin-bottom: 20px; font-size: 9pt; font-weight: bold; }
  .important-box ul { margin-left: 20px; margin-top: 5px; }
  h2 { font-size: 12pt; font-weight: bold; text-transform: uppercase; margin: 20px 0 10px; text-align: center; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
  h3 { font-size: 11pt; font-weight: bold; margin: 15px 0 5px; text-decoration: underline; }
  p { margin-bottom: 10px; text-align: justify; }
  ul { margin-left: 20px; margin-bottom: 10px; }
  li { margin-bottom: 4px; text-align: justify; }
  table { width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 10pt; }
  th, td { border: 1px solid #000; padding: 6px; text-align: left; }
  th { background-color: #f0f0f0; font-weight: bold; }
  .signatures { display: flex; justify-content: space-between; margin-top: 40px; gap: 40px; }
  .sig-box { flex: 1; border-top: 1px solid #000; padding-top: 10px; }
  .sig-label { font-weight: bold; margin-bottom: 40px; }
  .sig-hint { font-size: 9pt; color: #555; }
  .page-break { page-break-before: always; }
  .checkbox { display: inline-block; width: 12px; height: 12px; border: 1px solid #000; margin-right: 5px; vertical-align: middle; }
  .checked::after { content: 'X'; display: block; text-align: center; line-height: 12px; font-size: 10px; }
`;

export const getCompanyInfo = () => ({
  nom: "Les Logements de ZEYNA",
  forme: "SAS",
  rccm: "SN-STL-2026-B-XXXX",
  ninea: "000000000",
  adresse: "Saint-Louis, Sénégal",
  representant: "Direction Générale"
});

export const generateConventionBailleurHTML = (data: {
  refConvention: string;
  dateEmission: string;
  bailleur: { prenom: string; nom: string; telephone?: string; adresse?: string };
  logement: { nom: string; adresse: string; ville: string; type: string };
  chambres: { nom: string; prix_bailleur?: number; prix_zeyna?: number; marge?: number }[];
  dateDebut: string;
}) => {
  const c = getCompanyInfo();
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <style>${commonCSS}</style>
</head>
<body>
  <div class="header">
    <div class="brand-name">LES LOGEMENTS DE ZEYNA</div>
    <div class="doc-ref">
      Réf : ${data.refConvention}<br/>
      Date : ${data.dateEmission}
    </div>
  </div>

  <div class="doc-title">CONTRAT DE BAIL PRINCIPAL À USAGE D'HABITATION</div>
  <div class="doc-subtitle">Avec autorisation expresse et écrite de sous-location au profit de Les Logements de ZEYNA</div>

  <div class="important-box">
    IMPORTANT — PROJET DE TRAVAIL
    <ul>
      <li>Compléter toutes les mentions entre crochets et supprimer les options non retenues avant signature.</li>
      <li>Vérifier la forme juridique et l'identité exacte de ZEYNA, ainsi que le pouvoir du signataire.</li>
      <li>Le régime de durée du bail et la possibilité de sous-location doivent être validés selon le COCC et la situation réelle.</li>
      <li>Le prix de chaque sous-location doit respecter le plafond légal applicable. L'autorisation doit être documentée pour chaque sous-locataire.</li>
    </ul>
  </div>

  <h2>ENTRE LES SOUSSIGNÉS</h2>
  <p><strong>1. Le Bailleur :</strong> ${data.bailleur.prenom} ${data.bailleur.nom}, demeurant à ${data.bailleur.adresse || '[adresse à compléter]'}, téléphone ${data.bailleur.telephone || '[téléphone à compléter]'}, ci-après désigné « le Bailleur ».</p>
  <p><strong>2. Le Preneur principal :</strong> ${c.nom}, ${c.forme}, immatriculée sous le numéro ${c.rccm} et NINEA ${c.ninea}, dont le siège est situé à ${c.adresse}, représentée par ${c.representant}, dûment habilité(e), exploitant le service sous l'appellation « Les Logements de ZEYNA », ci-après désigné « ZEYNA » ou « le Preneur principal ».</p>
  <p>Le Bailleur et ZEYNA sont ci-après individuellement une « Partie » et ensemble les « Parties ».</p>

  <h2>PRÉAMBULE</h2>
  <p>Le Bailleur déclare disposer des droits nécessaires pour donner à bail les locaux décrits au présent contrat. Les Parties souhaitent organiser leur location à ZEYNA pour un usage d'habitation, avec autorisation expresse de sous-louer les unités identifiées dans les annexes, conformément aux dispositions impératives applicables au Sénégal.</p>
  <p>Le préambule et les annexes expressément visées font partie intégrante du présent contrat.</p>

  <h3>ARTICLE 1 — OBJET ET DÉSIGNATION DES LOCAUX</h3>
  <p>Le Bailleur donne à bail à ZEYNA, qui accepte, les locaux sis à ${data.logement.adresse}, ${data.logement.ville}, comprenant : ${data.logement.type} - ${data.logement.nom}.</p>
  <p>La description détaillée des locaux, des chambres/studios/appartements, des espaces privatifs et des espaces partagés figure à l'Annexe 1. Seules les unités expressément listées comme pouvant être sous-louées sont couvertes par l'autorisation prévue à l'article 5.</p>
  <p>Les caractéristiques, équipements, meubles, sanitaires, accès, compteurs et clés remis doivent être constatés dans un état des lieux contradictoire annexé au contrat.</p>

  <h3>ARTICLE 2 — DESTINATION ET USAGE AUTORISÉ</h3>
  <p>Les locaux sont destinés à l'habitation. Le Bailleur autorise leur exploitation par ZEYNA en vue de l'hébergement résidentiel d'étudiants et d'autres occupants correspondant à la destination convenue, sous réserve du respect du présent contrat et de la réglementation applicable.</p>
  <p>Toute activité différente, transformation matérielle des locaux ou changement de destination exige l'accord préalable et écrit du Bailleur et, lorsque nécessaire, les autorisations administratives applicables.</p>

  <h3>ARTICLE 3 — DURÉE ET RÉGIME DU BAIL</h3>
  <p>Le régime et la durée doivent être choisis avant signature en fonction de la nature réelle de la location et des dispositions impératives du COCC. Cocher une seule option après vérification juridique :</p>
  <ul>
    <li><span class="checkbox"></span> Bail d'habitation de droit commun à durée de trois (3) ans, renouvelable dans les conditions légales ;</li>
    <li><span class="checkbox"></span> Bail d'habitation à durée indéterminée ;</li>
    <li><span class="checkbox"></span> Autre régime légal applicable, expressément validé par écrit par un conseil juridique : [à préciser].</li>
  </ul>
  <p>Date de prise d'effet : ${data.dateDebut}. Date/terme, lorsque le régime retenu le prévoit : [date ou mention appropriée].</p>
  <p>Ne pas retenir une durée courte ou qualifier le contrat de location saisonnière uniquement pour écarter le régime ordinaire. Le choix doit correspondre aux faits et au régime légal applicable.</p>

  <h3>ARTICLE 4 — LOYER PRINCIPAL, DÉPÔT DE GARANTIE ET PAIEMENT</h3>
  <p>Le loyer principal convenu pour l'ensemble des locaux est fixé à <strong>[montant en chiffres] FCFA</strong> ([montant en lettres] francs CFA) par mois. Il est payable au plus tard le [jour] de chaque période, par [mode et coordonnées de paiement], contre quittance ou reçu conforme.</p>
  <p>Dépôt de garantie éventuellement convenu : [montant] FCFA. Sa nature, son utilisation et ses conditions de restitution sont définies ici : [conditions à compléter conformément au droit applicable].</p>
  <p>Aucun paiement en espèces ou par voie électronique ne dispense la Partie qui reçoit les fonds d'enregistrer l'opération et de remettre un justificatif mentionnant la date, le montant et l'imputation du paiement.</p>
  <p>Le loyer principal et les charges éventuellement dues sont distingués. Les charges récupérables ne sont exigibles que sur justification, conformément aux règles applicables.</p>

  <h3>ARTICLE 5 — AUTORISATION EXPRESSE ET ÉCRITE DE SOUS-LOCATION</h3>
  <p>Le Bailleur autorise expressément et par écrit ZEYNA à sous-louer à usage d'habitation les unités détaillées à l'Annexe 1, exclusivement dans les limites de la destination, de la capacité d'occupation, des conditions financières et des règles prévues au présent contrat.</p>
  <p>Pour chaque sous-location, ZEYNA notifiera au Bailleur le nom du sous-locataire et le taux du sous-loyer, ainsi que l'unité concernée et la date envisagée de prise d'effet. Les Parties utiliseront la fiche de notification et de consentement de l'Annexe 2. La fiche devra être complétée avant l'entrée dans les lieux et signée ou autrement acceptée par écrit de manière probante conformément au régime applicable.</p>
  <p>Toute sous-location d'une unité non listée, toute cession du bail principal ou tout changement substantiel de destination nécessite un accord écrit préalable du Bailleur.</p>
  <p>Cette autorisation n'a pas pour effet de libérer ZEYNA de ses obligations de locataire principal envers le Bailleur.</p>

  <h3>ARTICLE 6 — PRIX DES SOUS-LOCATIONS ET RESPECT DU PLAFOND LÉGAL</h3>
  <p>Les Parties s'engagent à fixer les loyers de sous-location et toute somme liée à l'occupation en respectant les dispositions impératives applicables, notamment les articles 577 et 578 du Code des obligations civiles et commerciales du Sénégal.</p>
  <p>Selon l'article 578 du COCC, le prix de sous-location ne peut en principe dépasser le loyer dû au Bailleur principal. Lorsque les locaux sous-loués sont garnis par le Preneur principal de meubles en bon état et en quantité suffisante, le plafond légal peut, dans les conditions prévues par cet article, atteindre 150 % du loyer principal. Cette exception ne s'applique pas automatiquement : la présence, l'état et la suffisance du mobilier ainsi que le périmètre exact de la sous-location doivent être établis et vérifiés.</p>
  <p>Le taux du sous-loyer est précisé dans la fiche individuelle de notification de l'Annexe 2. Le caractère meublé ou non meublé du local, l'inventaire du mobilier et les éléments nécessaires à la vérification du plafond applicable sont documentés dans les annexes. Une grille de contrôle de la répartition est jointe à l'Annexe 5 ; sa méthode doit être validée juridiquement lorsqu'un bail principal couvre plusieurs unités.</p>
  <p>Aucune ventilation artificielle en frais, prestations ou suppléments ne peut avoir pour objet de contourner un plafond légal. Toute prestation réellement distincte éventuellement facturée doit être identifiée, décrite, justifiée et validée au regard des règles applicables.</p>
  <p>Avant toute commercialisation à un prix étudiant supérieur au loyer principal ou à la part de loyer applicable à l'unité, faire vérifier par un juriste la qualification de la prestation, le plafond applicable au local et, le cas échéant, la méthode de répartition du loyer principal entre les unités sous-louées.</p>

  <div class="page-break"></div>

  <h3>ARTICLE 7 — OBLIGATIONS DU BAILLEUR</h3>
  <p>Le Bailleur s'engage, dans les limites prévues par le droit applicable, à :</p>
  <ul>
    <li>délivrer les locaux dans un état compatible avec l'usage convenu et remettre les clés selon l'état des lieux contradictoire ;</li>
    <li>assurer les réparations et interventions qui lui incombent légalement ou contractuellement, notamment les réparations urgentes autres que l'entretien courant ;</li>
    <li>garantir ZEYNA contre les troubles de jouissance et les défauts relevant de ses obligations ;</li>
    <li>ne pas entraver sans motif légitime l'usage convenu des locaux ;</li>
    <li>communiquer à ZEYNA toute information importante sur la sécurité, les travaux, les charges, les équipements et la disponibilité du logement ;</li>
    <li>confirmer par écrit toute autorisation, modification ou décision pour laquelle un écrit est requis.</li>
  </ul>

  <h3>ARTICLE 8 — OBLIGATIONS DE ZEYNA COMME PRENEUR PRINCIPAL</h3>
  <p>ZEYNA s'engage à :</p>
  <ul>
    <li>payer le loyer principal et les sommes contractuellement dues aux échéances convenues ;</li>
    <li>utiliser les locaux conformément à leur destination et faire respecter cette destination par les occupants ;</li>
    <li>assurer l'entretien courant mis légalement à sa charge et signaler rapidement au Bailleur les défauts, réparations et incidents qui relèvent de celui-ci ;</li>
    <li>ne réaliser aucune transformation des locaux ou équipements sans l'accord exprès et écrit requis ;</li>
    <li>tenir un registre des unités proposées, des sous-locations, des loyers, des notifications et des autorisations écrites ;</li>
    <li>notifier les sous-locations et les taux correspondants selon les modalités prévues à l'article 5 ;</li>
    <li>faire respecter les règles d'occupation et prévenir les occupations dépassant les capacités convenues ;</li>
    <li>remettre les locaux en fin de bail selon les obligations légales, sous réserve de l'usure normale.</li>
  </ul>

  <h3>ARTICLE 9 — CHARGES, EAU, ÉLECTRICITÉ ET AUTRES CONSOMMATIONS</h3>
  <p>Les Parties cochent et précisent les modalités applicables : eau [incluse / facturée séparément / selon relevé / autre : ____] ; électricité [incluse / facturée séparément / selon relevé / autre : ____] ; autres charges [détail].</p>
  <p>Les règles de calcul, de répartition, les compteurs disponibles, les justificatifs et la périodicité de règlement sont décrits à l'Annexe 3. Toute charge récupérable doit être justifiable et les sommes ne doivent pas être facturées deux fois.</p>
  <p>Toute modification de la répartition convenue doit être communiquée par écrit et respecter le droit applicable.</p>

  <h3>ARTICLE 10 — ÉTAT DES LIEUX, CLÉS ET MOBILIER</h3>
  <p>Un état des lieux contradictoire est établi à l'entrée et à la sortie de ZEYNA. L'inventaire du mobilier et des équipements, le nombre de clés et les anomalies constatées sont consignés par écrit et, si utile, accompagnés de photographies datées acceptées par les Parties.</p>
  <p>Les Parties signent l'état des lieux et en conservent chacune une copie. La remise ou la restitution des clés est enregistrée par un reçu ou dans le procès-verbal correspondant.</p>

  <h3>ARTICLE 11 — ENTRETIEN, TRAVAUX ET INCIDENTS</h3>
  <p>ZEYNA signale sans délai au Bailleur les désordres susceptibles d'affecter la sécurité, la salubrité, l'usage normal des locaux ou la continuité du service. Les Parties conviennent d'un canal de signalement : [téléphone / courriel / autre] et d'un contact d'urgence : [coordonnées].</p>
  <p>Les travaux, accès aux locaux et réparations sont organisés dans le respect du droit applicable et de la jouissance des occupants. En cas d'urgence, les Parties se préviennent dès que raisonnablement possible. Les coûts sont supportés par la Partie à laquelle ils incombent légalement ou contractuellement.</p>

  <h3>ARTICLE 12 — ASSURANCE ET SÉCURITÉ</h3>
  <p>Les exigences d'assurance applicables à chaque Partie et les justificatifs à remettre sont les suivants : [à compléter après vérification]. Aucune assurance n'est réputée souscrite du seul fait de la signature du présent contrat.</p>
  <p>Les Parties communiquent les informations de sécurité utiles : accès, installations électriques, dispositif anti-incendie, consignes d'urgence et restrictions d'usage. Les équipements réellement présents sont inscrits à l'Annexe 1.</p>

  <h3>ARTICLE 13 — SOUS-LOCATIONS EN COURS ET FIN DU BAIL PRINCIPAL</h3>
  <p>ZEYNA informe le Bailleur de toute difficulté susceptible d'affecter la continuité du bail principal ou les droits des sous-locataires. Elle tient à jour les notifications individuelles visées à l'Annexe 2.</p>
  <p>Les Parties reconnaissent que la sous-location est liée aux droits que ZEYNA détient sur les locaux principaux. Les demandes de renouvellement d'une sous-location sont traitées conformément à l'article 577 du COCC et aux dispositions impératives applicables, jusqu'au terme du bail principal. En cas d'expiration, de résiliation, de perte du droit de jouissance ou d'indisponibilité des locaux, les Parties doivent agir sans délai afin de limiter le préjudice des occupants et respecter les droits et procédures imposés par la loi. Aucune clause du présent contrat ne peut écarter les protections légales d'un sous-locataire.</p>
  <p>La gestion des remboursements, relogements éventuels, loyers versés d'avance et cautions doit être effectuée conformément au droit applicable et aux obligations contractuelles de chaque Partie.</p>

  <h3>ARTICLE 14 — INEXÉCUTION, RÉSILIATION ET FIN DU CONTRAT</h3>
  <p>En cas d'inexécution, la Partie concernée adresse à l'autre une notification ou mise en demeure suivant les formes, délais et modalités imposés par les dispositions applicables. Les procédures judiciaires ou extrajudiciaires légalement requises doivent être respectées.</p>
  <p>Les Parties ne peuvent stipuler une résiliation immédiate, une expulsion ou une confiscation automatique de sommes en dehors des conditions autorisées par la loi.</p>
  <p>À la fin du contrat, les Parties organisent l'état des lieux de sortie, la restitution des clés, la clôture des charges justifiées, le règlement des sommes non contestées et la restitution du dépôt de garantie selon les règles applicables.</p>

  <h3>ARTICLE 15 — NOTIFICATIONS ET PREUVE</h3>
  <p>Les coordonnées de notification des Parties sont celles mentionnées en tête du contrat, sauf changement communiqué par écrit. Les messages électroniques peuvent servir au suivi opérationnel et à la preuve des échanges dans les limites admises par la loi ; ils ne remplacent pas un acte extrajudiciaire lorsqu'un tel acte est requis.</p>
  <p>Les documents, autorisations, états des lieux, quittances et fiches de notification liés au présent contrat sont conservés par les Parties.</p>

  <h3>ARTICLE 16 — RÈGLEMENT DES DIFFÉRENDS ET DROIT APPLICABLE</h3>
  <p>Le présent contrat est régi par le droit sénégalais. En cas de difficulté, les Parties recherchent d'abord une solution amiable documentée, sans renoncer aux procédures ou délais légaux. À défaut d'accord, le litige est soumis à la juridiction compétente conformément aux règles applicables.</p>

  <h3>ARTICLE 17 — INTÉGRALITÉ, MODIFICATIONS ET ANNEXES</h3>
  <p>Le présent contrat et ses annexes constituent l'accord écrit des Parties sur son objet. Toute modification doit être consignée par écrit et signée ou acceptée par les Parties selon une forme permettant d'en rapporter la preuve.</p>
  <p>Annexes faisant partie du contrat : Annexe 1 — Désignation des locaux et unités ; Annexe 2 — Notification et autorisation individuelle de sous-location ; Annexe 3 — Charges et modalités de calcul ; Annexe 4 — État des lieux et inventaire ; Annexe 5 — Grille de contrôle des loyers de sous-location.</p>

  <div class="signatures">
    <div class="sig-box">
      <div class="sig-label">LE BAILLEUR<br/>Nom : ${data.bailleur.prenom} ${data.bailleur.nom}</div>
      <div class="sig-hint">Mention manuscrite : « Lu et approuvé »<br/>Date :<br/><br/>Signature :</div>
    </div>
    <div class="sig-box">
      <div class="sig-label">ZEYNA — PRENEUR PRINCIPAL<br/>Représentant : ${c.representant}</div>
      <div class="sig-hint">Mention manuscrite : « Lu et approuvé »<br/>Date :<br/><br/>Signature :</div>
    </div>
  </div>

  <div class="page-break"></div>

  <h2>ANNEXE 1 — DÉSIGNATION DES LOCAUX ET UNITÉS</h2>
  <table>
    <tr><th>Champ</th><th>Description / valeur à compléter</th></tr>
    <tr><td>Adresse complète</td><td>${data.logement.adresse}, ${data.logement.ville}</td></tr>
    <tr><td>Référence du logement</td><td>${data.logement.nom}</td></tr>
    <tr><td>Type</td><td>${data.logement.type}</td></tr>
    <tr><td>Périmètre loué à ZEYNA</td><td>[Bâtiment entier / étage / chambres / unités précises]</td></tr>
    <tr><td>Unités autorisées à la sous-location</td><td>${data.chambres.map(c => c.nom).join(', ')}</td></tr>
    <tr><td>Capacité autorisée par unité</td><td>[Nombre de personnes — à vérifier]</td></tr>
    <tr><td>Salle de bain / sanitaires</td><td>[Privatifs ou communs, préciser]</td></tr>
    <tr><td>État meublé</td><td>[Meublé / non meublé]</td></tr>
    <tr><td>Mobilier fourni par ZEYNA</td><td>[Liste et état, si applicable]</td></tr>
    <tr><td>Espaces communs autorisés</td><td>[Cuisine, cour, salon, couloir, douche, etc.]</td></tr>
    <tr><td>Compteurs et équipements</td><td>[Numéros/relevés et description]</td></tr>
    <tr><td>Restrictions convenues</td><td>[Aucune autre que celles valablement convenues / préciser]</td></tr>
  </table>

  <div class="page-break"></div>

  <h2>ANNEXE 5 — GRILLE DE CONTRÔLE DES LOYERS DE SOUS-LOCATION</h2>
  <table>
    <tr>
      <th>Unité</th>
      <th>Part de loyer principal retenue*</th>
      <th>Meublée par ZEYNA ?</th>
      <th>Sous-loyer envisagé</th>
      <th>Plafond / validation</th>
    </tr>
    ${data.chambres.map(ch => `
    <tr>
      <td>${ch.nom}</td>
      <td>${ch.prix_bailleur ? ch.prix_bailleur.toLocaleString("fr-FR") + " FCFA" : "..."} / mois</td>
      <td>[Oui / non]</td>
      <td>${ch.prix_zeyna ? ch.prix_zeyna.toLocaleString("fr-FR") + " FCFA" : "..."} / mois</td>
      <td>[À vérifier]</td>
    </tr>`).join("")}
  </table>
</body>
</html>`;
};

export const generateContratClientHTML = (data: {
  refContrat: string;
  dateEmission: string;
  client: { prenom: string; nom: string; telephone?: string };
  logement: { nom: string; adresse: string; ville: string; type: string };
  chambre: { nom: string; nombre_personnes?: number; prix_zeyna?: number };
  caution: number;
  dateDebut: string;
}) => {
  const c = getCompanyInfo();
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <style>${commonCSS}</style>
</head>
<body>
  <div class="header">
    <div class="brand-name">LES LOGEMENTS DE ZEYNA</div>
    <div class="doc-ref">
      Réf : ${data.refContrat}<br/>
      Date : ${data.dateEmission}
    </div>
  </div>

  <div class="doc-title">CONTRAT DE SOUS-LOCATION À USAGE D'HABITATION</div>
  <div class="doc-subtitle">Entre Les Logements de ZEYNA, sous-bailleur, et l'étudiant sous-locataire</div>

  <div class="important-box">
    IMPORTANT — PROJET DE TRAVAIL
    <ul>
      <li>Projet à personnaliser pour chaque étudiant ; aucun contrat ne doit être signé avec des champs obligatoires non renseignés.</li>
      <li>Joindre la fiche d'autorisation écrite de sous-location relative à cet étudiant et à cette unité.</li>
      <li>Avant signature, choisir le régime juridique et la durée applicables ; vérifier le plafond légal du sous-loyer.</li>
      <li>Le présent modèle doit être relu par un juriste sénégalais, notamment quant à la durée, au loyer, à la caution et à la sous-location.</li>
    </ul>
  </div>

  <h2>ENTRE LES SOUSSIGNÉS</h2>
  <p><strong>1. Le Sous-bailleur :</strong> ${c.nom}, ${c.forme}, immatriculée sous le numéro ${c.rccm} et NINEA ${c.ninea}, dont le siège est situé à ${c.adresse}, représentée par ${c.representant}, dûment habilité(e), ci-après désignée « ZEYNA » ou « le Sous-bailleur ».</p>
  <p><strong>2. Le Sous-locataire :</strong> ${data.client.prenom} ${data.client.nom}, téléphone ${data.client.telephone || '[téléphone]'}, ci-après désigné « l'Étudiant » ou « le Sous-locataire ».</p>
  <p>Les Parties déclarent avoir la capacité nécessaire pour conclure le présent contrat.</p>

  <h2>PRÉAMBULE</h2>
  <p>ZEYNA déclare détenir un droit de jouissance principal sur le logement visé et une autorisation écrite de sous-location couvrant l'unité désignée, le sous-locataire et le taux de sous-loyer, selon la fiche jointe en Annexe 1. Le Bailleur principal n'est pas signataire du présent contrat et n'est pas le cocontractant de l'Étudiant, sans préjudice des droits que la loi peut lui reconnaître, notamment ceux prévus par l'article 578 du COCC.</p>
  <p>Le préambule et les annexes visées font partie intégrante du contrat.</p>

  <h3>ARTICLE 1 — OBJET ET DÉSIGNATION DU LOGEMENT</h3>
  <p>ZEYNA, agissant en qualité de locataire principal dûment autorisé à sous-louer, donne en sous-location au Sous-locataire, pour l'usage d'habitation convenu, l'unité décrite ci-dessous :</p>
  <ul>
    <li>Adresse complète : ${data.logement.adresse}, ${data.logement.ville} ;</li>
    <li>Logement / résidence : ${data.logement.nom} ;</li>
    <li>Type de logement : ${data.logement.type} ;</li>
    <li>Unité louée : ${data.chambre.nom} ;</li>
    <li>Capacité maximale : ${data.chambre.nombre_personnes || '[à compléter]'} personne(s) ;</li>
    <li>Sanitaires : [salle de bain privée / douche commune / autres précisions] ;</li>
    <li>Espaces partagés autorisés : [liste] ;</li>
    <li>État meublé et équipements : [description exacte, inventaire en annexe].</li>
  </ul>
  <p>La présente sous-location porte uniquement sur l'unité et les accès expressément indiqués. Elle ne confère aucun droit d'usage exclusif sur les espaces communs.</p>

  <h3>ARTICLE 2 — AUTORISATION DE SOUS-LOCATION</h3>
  <p>ZEYNA déclare avoir obtenu l'accord exprès et écrit requis pour sous-louer l'unité au Sous-locataire. La fiche d'autorisation individualisée et de notification au Bailleur principal est annexée au présent contrat.</p>
  <p>Le contrat principal, l'autorisation écrite et le présent contrat ne peuvent être interprétés de manière à supprimer les droits ou obligations découlant des dispositions impératives applicables. Toute modification de l'unité, du taux du sous-loyer ou de l'identité du sous-locataire nécessitant une nouvelle notification ou autorisation doit être régularisée par écrit avant sa mise en œuvre.</p>

  <h3>ARTICLE 3 — DURÉE, PRISE D'EFFET ET REMISE DES CLÉS</h3>
  <p>Le régime de durée retenu doit être sélectionné avant signature après vérification de la situation réelle et du régime légal applicable :</p>
  <ul>
    <li><span class="checkbox"></span> Bail d'habitation de droit commun : [durée/régime à compléter conformément au COCC] ;</li>
    <li><span class="checkbox"></span> Location saisonnière au sens du régime légal applicable : du [date] au [date] ;</li>
    <li><span class="checkbox"></span> Autre régime expressément validé par un conseil juridique : [préciser].</li>
  </ul>
  <p>Date de prise d'effet juridique : ${data.dateDebut}.</p>
  <p>La validation d'un paiement et la prise d'effet du contrat sont des événements distincts. Le contrat ne peut avoir pour effet d'écarter les règles légales relatives à la durée, au renouvellement ou à la résiliation.</p>

  <h3>ARTICLE 4 — LOYER ET MODALITÉS DE PAIEMENT</h3>
  <p>Le loyer mensuel de sous-location convenu est de <strong>${data.chambre.prix_zeyna ? data.chambre.prix_zeyna.toLocaleString("fr-FR") : "[montant]"} FCFA</strong>, payable à ZEYNA au plus tard le [jour] de chaque période.</p>
  <p>Le sous-loyer doit respecter le plafond applicable prévu par le droit sénégalais, notamment l'article 578 du COCC. En principe, le prix de sous-location ne peut dépasser le loyer dû au Bailleur principal.</p>
  <p>Tout paiement donne lieu à un reçu ou à une quittance mentionnant la date, le montant, la période concernée et l'imputation des sommes versées. Le paiement à une personne ou sur un compte non expressément autorisé par ZEYNA ne libère pas automatiquement le Sous-locataire de son obligation.</p>

  <h3>ARTICLE 5 — DÉPÔT DE GARANTIE (CAUTION)</h3>
  <p>Le dépôt de garantie convenu est fixé à <strong>${data.caution.toLocaleString("fr-FR")} FCFA</strong>. Il est encaissé par ZEYNA et enregistré séparément du loyer.</p>
  <p>Le dépôt de garantie n'est pas un loyer et ne peut être imputé sur les loyers courants sans accord écrit ou base légale. Il garantit uniquement les obligations pour lesquelles une retenue est licite et justifiée.</p>
  <p>À la fin de la sous-location, après restitution des clés et état des lieux de sortie, ZEYNA procède au décompte des sommes restant dues et des éventuelles retenues justifiées. Elle communique au Sous-locataire un décompte écrit et restitue le solde.</p>

  <div class="page-break"></div>

  <h3>ARTICLE 6 — CHARGES, EAU, ÉLECTRICITÉ ET SERVICES</h3>
  <p>Les conditions applicables à l'unité sont indiquées ci-dessous et détaillées à l'Annexe 2 :</p>
  <ul>
    <li>Eau : [incluse / distincte / répartition et justificatifs] ;</li>
    <li>Électricité : [incluse / distincte / répartition et justificatifs] ;</li>
    <li>Équipements/consommations inclus : [description précise] ;</li>
    <li>Autres charges autorisées : [nature, montant ou calcul, échéance et justificatif].</li>
  </ul>
  <p>Les charges ne sont dues que selon les modalités convenues, justifiées lorsque cela est requis, et sans double facturation.</p>

  <h3>ARTICLE 7 — ENGAGEMENTS DE ZEYNA</h3>
  <p>ZEYNA s'engage, dans les limites du contrat et du droit applicable, à :</p>
  <ul>
    <li>mettre l'unité à disposition à la date convenue et remettre les clés contre constat écrit ;</li>
    <li>fournir des informations exactes sur le type de logement, la capacité, les sanitaires, les espaces communs, les charges et les équipements annoncés ;</li>
    <li>recevoir et enregistrer les loyers, cautions et autres paiements autorisés, puis remettre les justificatifs correspondants ;</li>
    <li>rester l'interlocuteur contractuel de l'Étudiant pour les demandes et réclamations relatives au logement ;</li>
    <li>organiser le suivi des incidents, coordonner les interventions nécessaires et informer l'Étudiant de leur traitement ;</li>
    <li>protéger les données personnelles de l'Étudiant et les utiliser uniquement pour des finalités liées à la gestion de la relation.</li>
  </ul>

  <h3>ARTICLE 8 — ENGAGEMENTS DU SOUS-LOCATAIRE</h3>
  <p>Le Sous-locataire s'engage à :</p>
  <ul>
    <li>payer le loyer et les charges licitement dus aux échéances convenues ;</li>
    <li>utiliser les lieux paisiblement, exclusivement pour la destination convenue, et respecter la capacité maximale indiquée ;</li>
    <li>maintenir l'unité propre, assurer l'entretien courant qui lui incombe et signaler rapidement les défauts ou incidents ;</li>
    <li>respecter les espaces communs et les droits des autres occupants ;</li>
    <li>ne pas céder ni sous-louer l'unité à un tiers sans autorisation écrite préalable et conformément au droit applicable ;</li>
    <li>restituer les lieux, équipements et clés à la fin du contrat, sous réserve de l'usure normale.</li>
  </ul>

  <h3>ARTICLE 9 — ÉTAT DES LIEUX, INVENTAIRE ET CLÉS</h3>
  <p>Un état des lieux contradictoire est établi lors de la remise et de la restitution des clés. Il décrit notamment les murs, sols, portes, fenêtres, serrures, installations électriques, sanitaires, meubles et équipements.</p>

  <h3>ARTICLE 10 — SIGNALEMENT ET GESTION DES INCIDENTS</h3>
  <p>Toute anomalie, panne, fuite, problème électrique, problème de sécurité ou difficulté d'occupation doit être signalé à ZEYNA par les canaux officiels de la plateforme.</p>

  <h3>ARTICLE 11 — ACCÈS AUX LIEUX ET TRAVAUX</h3>
  <p>ZEYNA ou les intervenants mandatés peuvent accéder aux lieux pour une réparation, un contrôle nécessaire ou une intervention convenue, sous réserve d'une information préalable raisonnable et du respect de la vie privée du Sous-locataire.</p>

  <h3>ARTICLE 12 — RÈGLES D'OCCUPATION ET VIE COLLECTIVE</h3>
  <p>Le Sous-locataire respecte les règles de sécurité, de tranquillité, d'hygiène et d'usage des espaces communs communiquées en Annexe 3.</p>

  <h3>ARTICLE 13 — DÉFAUT, RÉSILIATION ET DÉPART</h3>
  <p>En cas de manquement, la Partie concernée met l'autre en demeure selon les formes et délais applicables. La résiliation, l'expulsion ou la récupération forcée des lieux ne peut intervenir que conformément aux procédures légales applicables.</p>
  <p>À la sortie, les Parties établissent l'état des lieux, enregistrent la restitution des clés, arrêtent les charges justifiées et établissent le décompte du dépôt de garantie.</p>

  <h3>ARTICLE 14 — DONNÉES PERSONNELLES ET COMMUNICATIONS</h3>
  <p>Les coordonnées et données nécessaires au contrat sont utilisées pour l'identification des Parties, la gestion des paiements, la sécurité, le traitement des demandes et le respect des obligations légales.</p>

  <h3>ARTICLE 15 — DROIT APPLICABLE ET DIFFÉRENDS</h3>
  <p>Le présent contrat est régi par le droit sénégalais. Les Parties recherchent de bonne foi une solution amiable et documentée en cas de difficulté, sans suspendre les obligations ou délais légaux. À défaut d'accord, le différend est porté devant la juridiction compétente.</p>

  <h3>ARTICLE 16 — DOCUMENTS CONTRACTUELS ET SIGNATURE</h3>
  <p>Le présent contrat est établi à Saint-Louis, le ${data.dateEmission}, en deux exemplaires ou signé par un procédé électronique dont la validité et la conservation ont été vérifiées. Chaque Partie reconnaît recevoir un exemplaire complet avec ses annexes.</p>

  <div class="signatures">
    <div class="sig-box">
      <div class="sig-label">ZEYNA — SOUS-BAILLEUR<br/>Représentant : ${c.representant}</div>
      <div class="sig-hint">Mention manuscrite : « Lu et approuvé »<br/>Date :<br/><br/>Signature :</div>
    </div>
    <div class="sig-box">
      <div class="sig-label">L'ÉTUDIANT — SOUS-LOCATAIRE<br/>Nom : ${data.client.prenom} ${data.client.nom}</div>
      <div class="sig-hint">Mention manuscrite : « Lu et approuvé »<br/>Date :<br/><br/>Signature :</div>
    </div>
  </div>

  <div class="page-break"></div>

  <h2>ANNEXE 2 — FICHE DESCRIPTIVE, LOYER ET CHARGES</h2>
  <table>
    <tr><th>Élément</th><th>Description / valeur contractuelle</th></tr>
    <tr><td>Type</td><td>${data.logement.type} - ${data.chambre.nom}</td></tr>
    <tr><td>Capacité maximale</td><td>${data.chambre.nombre_personnes || '[à compléter]'} personne(s)</td></tr>
    <tr><td>Loyer</td><td>${data.chambre.prix_zeyna ? data.chambre.prix_zeyna.toLocaleString("fr-FR") : "[montant]"} FCFA / mois</td></tr>
    <tr><td>Caution</td><td>${data.caution.toLocaleString("fr-FR")} FCFA</td></tr>
    <tr><td>Date d'entrée</td><td>${data.dateDebut}</td></tr>
  </table>
</body>
</html>`;
};

export const generateBonAffectationHTML = (data: {
  refAffectation: string;
  dateEmission: string;
  bailleur: { prenom: string; nom: string; telephone?: string };
  logement: { nom: string; adresse: string; ville: string; type: string };
  chambre: { nom: string; prix_bailleur?: number };
  dateDebut: string;
}) => {
  const c = getCompanyInfo();
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <style>${commonCSS}</style>
</head>
<body>
  <div class="header">
    <div class="brand-name">LES LOGEMENTS DE ZEYNA</div>
    <div class="doc-ref">
      Réf : ${data.refAffectation}<br/>
      Date : ${data.dateEmission}
    </div>
  </div>

  <div class="doc-title">BON D'AFFECTATION</div>
  <div class="doc-subtitle">Notification d'occupation de chambre</div>

  <p>Bonjour <strong>${data.bailleur.prenom} ${data.bailleur.nom}</strong>,</p>
  <p>L'équipe ${c.nom} a le plaisir de vous informer que la chambre <strong>${data.chambre.nom}</strong> de votre logement <strong>${data.logement.nom}</strong> a été affectée à un locataire géré par nos soins.</p>

  <h2>Détails de l'Affectation</h2>
  <table>
    <tr><td><strong>Logement</strong></td><td>${data.logement.nom} (${data.logement.adresse}, ${data.logement.ville})</td></tr>
    <tr><td><strong>Chambre</strong></td><td>${data.chambre.nom}</td></tr>
    <tr><td><strong>Date de prise d'effet</strong></td><td>${data.dateDebut}</td></tr>
    <tr><td><strong>Loyer reversé (Part Bailleur)</strong></td><td>${data.chambre.prix_bailleur ? data.chambre.prix_bailleur.toLocaleString('fr-FR') + ' FCFA' : 'Selon convention'}</td></tr>
  </table>
  
  <p style="margin-top: 30px; font-size: 10pt; color: #666; font-style: italic;">
    Ce document confirme la prise en charge de l'occupation par ZEYNA. Pour des raisons de confidentialité et conformément à nos conditions générales, l'identité du locataire étudiant reste exclusivement gérée par nos services. ZEYNA demeure votre unique interlocuteur (Locataire Principal).
  </p>
</body>
</html>`;
};
