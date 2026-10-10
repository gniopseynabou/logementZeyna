import { LegalDocument, LegalPart } from "@/components/legal/LegalDocument";

const CGV = () => {
  const parts: LegalPart[] = [
    {
      title: "PARTIE I — GÉNÉRALITÉS",
      sections: [
        {
          id: "identification",
          title: "Article 1 — Identification de ZEYNA",
          content: (
            <>
              <p>Les services sont proposés par :</p>
              <ul className="list-disc pl-5 space-y-2 mt-4">
                <li><strong>Nom officiel ou raison sociale :</strong> Les Logements de ZEYNA</li>
                <li><strong>Nom commercial :</strong> Les Logements de ZEYNA</li>
                <li><strong>Adresse :</strong> Saint-Louis, Sénégal</li>
                <li><strong>Téléphone :</strong> +221 77 000 00 00</li>
                <li><strong>E-mail :</strong> contact@logements-zeyna.sn</li>
              </ul>
            </>
          )
        },
        {
          id: "objet",
          title: "Article 2 — Objet",
          content: (
            <>
              <p>Les présentes conditions définissent les règles commerciales applicables aux logements proposés par ZEYNA.</p>
              <p>Lorsqu’un logement est mis à disposition sous la forme d’une sous-location, les présentes conditions complètent le contrat de sous-location conclu entre ZEYNA et l’étudiant.</p>
              <p>Le contrat individuel précise les caractéristiques du logement, le prix convenu, la durée, la caution, les charges et les autres conditions particulières.</p>
            </>
          )
        },
        {
          id: "presentation",
          title: "Article 3 — Présentation du logement",
          content: (
            <>
              <p>Chaque offre précise, selon les informations disponibles :</p>
              <ul className="list-disc pl-5 space-y-2 mt-4 mb-4">
                <li>le type de logement ;</li>
                <li>son adresse ou sa localisation ;</li>
                <li>la chambre, le studio, l’appartement ou l’unité concernée ;</li>
                <li>la capacité d’accueil ;</li>
                <li>les équipements et la nature des sanitaires ;</li>
                <li>les charges incluses ou exclues ;</li>
                <li>le montant du loyer et de la caution ;</li>
                <li>la disponibilité et les conditions particulières.</li>
              </ul>
              <p>Les caractéristiques importantes sont confirmées avant la signature du contrat.</p>
            </>
          )
        }
      ]
    },
    {
      title: "PARTIE II — CONDITIONS FINANCIÈRES",
      sections: [
        {
          id: "prix",
          title: "Article 4 — Prix et transparence",
          content: (
            <>
              <p>Les prix sont indiqués en francs CFA (FCFA), sauf mention contraire.</p>
              <p>Avant de conclure un contrat, l’étudiant est informé du montant du loyer, de la caution, des charges supplémentaires éventuelles et des autres sommes exigibles. Les sommes à payer doivent être présentées clairement et sans frais cachés.</p>
              <p>Le montant facturé au titre de la sous-location doit respecter les règles légales applicables. Les modalités de rémunération de ZEYNA et toute éventuelle prestation distincte doivent être structurées conformément au régime juridique retenu et validées avant leur application.</p>
            </>
          )
        },
        {
          id: "demande",
          title: "Article 5 — Demande et conclusion du contrat",
          content: (
            <>
              <p>Une demande de logement ne vaut pas, à elle seule, conclusion d’un contrat.</p>
              <p>Avant la validation définitive, l’étudiant peut vérifier les informations fournies, le logement concerné, les montants à payer et les conditions d’occupation.</p>
              <p>Le contrat est conclu selon la procédure effectivement proposée par ZEYNA. Une copie du document contractuel est remise ou rendue accessible à l’étudiant.</p>
              <p>La date d’entrée dans les lieux et les conditions préalables à cette entrée sont précisées dans le contrat.</p>
            </>
          )
        },
        {
          id: "paiement",
          title: "Article 6 — Paiement du loyer",
          content: (
            <>
              <p>L’étudiant règle le loyer à ZEYNA selon le montant et l’échéancier figurant dans son contrat.</p>
              <p>Les paiements reçus sont enregistrés et donnent lieu à un justificatif. Une opération en attente de confirmation ne doit pas être présentée comme définitivement encaissée.</p>
              <p>Les modalités applicables en cas de retard de paiement sont celles du contrat et de la réglementation applicable. Aucun frais ou pénalité non prévu par une clause valable ou par la loi ne peut être ajouté arbitrairement.</p>
            </>
          )
        },
        {
          id: "caution",
          title: "Article 7 — Caution ou dépôt de garantie",
          content: (
            <>
              <p>Le montant de la caution est précisé dans le contrat de sous-location.</p>
              <p>La caution est enregistrée séparément des loyers. Elle n’est pas automatiquement acquise à ZEYNA.</p>
              <p>À la fin de l’occupation, son traitement dépend du contrat, de l’état du logement, des éventuelles sommes restant dues et des règles applicables. Toute retenue doit reposer sur un motif valable et être justifiée auprès de l’étudiant.</p>
              <p>Les modalités de restitution et le délai applicable sont précisés dans le contrat, conformément aux règles en vigueur.</p>
            </>
          )
        },
        {
          id: "charges",
          title: "Article 8 — Charges et équipements",
          content: (
            <>
              <p>Le contrat précise les conditions relatives à l’eau, à l’électricité, aux équipements inclus et aux éventuelles consommations supplémentaires.</p>
              <p>Lorsqu’une charge n’est pas comprise dans le loyer, son mode de calcul ou de répartition est communiqué à l’étudiant avant qu’il s’engage.</p>
              <p>Aucun frais supplémentaire ne peut être imposé sans fondement contractuel ou légal.</p>
            </>
          )
        }
      ]
    },
    {
      title: "PARTIE III — ENGAGEMENTS ET GESTION",
      sections: [
        {
          id: "engagements-zeyna",
          title: "Article 9 — Engagements de ZEYNA",
          content: (
            <>
              <p>Dans le cadre du contrat conclu, ZEYNA s’engage notamment à :</p>
              <ul className="list-disc pl-5 space-y-2 mt-4 mb-4">
                <li>communiquer les informations convenues sur le logement ;</li>
                <li>confirmer les conditions financières applicables ;</li>
                <li>assurer le suivi des paiements et délivrer les justificatifs correspondants ;</li>
                <li>recevoir et traiter les demandes de l’étudiant ;</li>
                <li>assurer le suivi des incidents liés au logement ;</li>
                <li>informer l’étudiant des événements importants concernant son occupation.</li>
              </ul>
              <p>Les modalités précises de prise en charge des problèmes sont définies dans le contrat de sous-location et ses annexes.</p>
            </>
          )
        },
        {
          id: "engagements-etudiant",
          title: "Article 10 — Engagements de l’étudiant",
          content: (
            <>
              <p>L’étudiant s’engage notamment à :</p>
              <ul className="list-disc pl-5 space-y-2 mt-4 mb-4">
                <li>fournir des informations exactes ;</li>
                <li>payer les sommes convenues aux échéances prévues ;</li>
                <li>respecter la capacité et les conditions d’occupation du logement ;</li>
                <li>préserver les locaux et les équipements ;</li>
                <li>respecter les règles d’utilisation des espaces communs ;</li>
                <li>signaler rapidement les incidents ou dégradations constatés ;</li>
                <li>respecter les modalités de départ et de remise des clés.</li>
              </ul>
              <p>Il ne peut céder ou sous-louer le logement sans les autorisations requises.</p>
            </>
          )
        },
        {
          id: "fin-occupation",
          title: "Article 11 — Annulation, départ et fin d’occupation",
          content: (
            <>
              <p>Les conditions d’annulation, de départ anticipé, de préavis et de restitution des sommes sont précisées dans le contrat individuel.</p>
              <p>Les éventuelles retenues ou indemnités doivent avoir un fondement valable et respecter les dispositions impératives applicables.</p>
              <p>Lorsqu’un droit de rétractation ou une autre protection particulière est applicable à l’opération, ZEYNA en informe l’étudiant avant la conclusion du contrat et précise les modalités nécessaires à son exercice.</p>
            </>
          )
        },
        {
          id: "problemes",
          title: "Article 12 — Problèmes liés au logement",
          content: (
            <>
              <p>L’étudiant doit signaler à ZEYNA tout problème affectant le logement au moyen des coordonnées ou fonctionnalités mises à sa disposition.</p>
              <p>ZEYNA enregistre la demande, examine les informations transmises et en assure le suivi selon les responsabilités et engagements applicables.</p>
              <p>Lorsque l’intervention d’un tiers est nécessaire, ZEYNA informe l’étudiant des démarches entreprises et des suites utiles, dans la mesure où ces informations peuvent être communiquées.</p>
            </>
          )
        },
        {
          id: "indisponibilite",
          title: "Article 13 — Indisponibilité ou changement",
          content: (
            <>
              <p>Si le logement devient indisponible ou si une caractéristique essentielle ne correspond pas aux conditions convenues, ZEYNA examine la situation et informe l’étudiant des solutions possibles.</p>
              <p>Aucun changement substantiel du logement ou du prix ne doit être imposé en dehors des conditions autorisées par le contrat et la loi. Les remboursements éventuels sont traités selon les circonstances et les règles applicables.</p>
            </>
          )
        }
      ]
    },
    {
      title: "PARTIE IV — DISPOSITIONS FINALES",
      sections: [
        {
          id: "reclamations",
          title: "Article 14 — Réclamations",
          content: (
            <>
              <p>Toute réclamation peut être adressée à :</p>
              <ul className="list-disc pl-5 space-y-2 mt-4 mb-4">
                <li><strong>E-mail :</strong> contact@logements-zeyna.sn</li>
                <li><strong>Téléphone :</strong> +221 77 000 00 00</li>
              </ul>
              <p>L’étudiant est invité à préciser la référence de son contrat, la nature du problème et les informations utiles à son traitement. ZEYNA assure le suivi de la demande et cherche, lorsque cela est possible, une solution adaptée.</p>
            </>
          )
        },
        {
          id: "documents",
          title: "Article 15 — Documents contractuels",
          content: (
            <>
              <p>Le contrat individuel de sous-location et ses annexes précisent les conditions propres à chaque occupation.</p>
              <p>En cas de contradiction, les dispositions impératives de la loi prévalent. Les conditions particulières valablement convenues dans le contrat individuel complètent les présentes conditions générales.</p>
            </>
          )
        },
        {
          id: "modification",
          title: "Article 16 — Modification des conditions",
          content: (
            <>
              <p>ZEYNA peut mettre à jour les présentes conditions pour tenir compte de l’évolution de ses services ou de la réglementation.</p>
              <p>La version et la date de mise à jour sont affichées sur la plateforme. Les modifications ne s’appliquent pas rétroactivement aux contrats en cours, sauf lorsque la loi ou un accord valable le permet.</p>
            </>
          )
        },
        {
          id: "litiges",
          title: "Article 17 — Droit applicable et litiges",
          content: (
            <>
              <p>Les présentes conditions sont soumises au droit applicable au Sénégal.</p>
              <p>En cas de désaccord, l’étudiant peut contacter ZEYNA pour rechercher une solution amiable. Cette démarche ne prive aucune partie des recours prévus par la loi.</p>
            </>
          )
        }
      ]
    }
  ];

  return (
    <LegalDocument 
      title="Conditions Générales de Vente et de Sous-location" 
      lastUpdated="Octobre 2026"
      parts={parts}
    />
  );
};

export default CGV;
