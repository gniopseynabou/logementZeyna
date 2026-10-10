import { LegalDocument, LegalPart } from "@/components/legal/LegalDocument";

const Confidentialite = () => {
  const parts: LegalPart[] = [
    {
      sections: [
        {
          id: "engagement",
          title: "1. Notre engagement",
          content: (
            <>
              <p>Les Logements de ZEYNA traite les données personnelles nécessaires au fonctionnement de sa plateforme, à la gestion des demandes de logement et au suivi de ses relations avec les utilisateurs.</p>
              <p>Cette politique explique quelles informations sont collectées, pourquoi elles sont utilisées, avec qui elles peuvent être partagées et comment les personnes concernées peuvent exercer leurs droits.</p>
            </>
          )
        },
        {
          id: "responsable",
          title: "2. Responsable du traitement",
          content: (
            <>
              <p>Le responsable du traitement est :</p>
              <ul className="list-disc pl-5 space-y-2 mt-4 mb-4">
                <li><strong>Nom ou raison sociale :</strong> Les Logements de ZEYNA</li>
                <li><strong>Adresse :</strong> Saint-Louis, Sénégal</li>
                <li><strong>E-mail :</strong> dpo@logements-zeyna.sn</li>
                <li><strong>Téléphone :</strong> +221 77 000 00 00</li>
              </ul>
            </>
          )
        },
        {
          id: "donnees",
          title: "3. Données collectées",
          content: (
            <>
              <p>Selon les fonctionnalités utilisées, ZEYNA peut collecter les catégories d’informations suivantes :</p>
              <ul className="list-disc pl-5 space-y-2 mt-4 mb-4">
                <li><strong>Données d’identité et de contact :</strong> Nom, prénom, numéro de téléphone, adresse électronique et autres coordonnées nécessaires à la demande ou au contrat.</li>
                <li><strong>Données de compte :</strong> Identifiant du compte, rôle, paramètres du compte et informations nécessaires à la sécurité de l’authentification.</li>
                <li><strong>Données relatives au logement :</strong> Critères de recherche, demandes, logement attribué, durée d’occupation, incidents signalés et informations nécessaires à la gestion du contrat.</li>
                <li><strong>Données financières et contractuelles :</strong> Loyers dus, paiements enregistrés, références de transaction, cautions, remboursements et documents contractuels. Les informations complètes de paiement qui ne sont pas nécessaires à ZEYNA ne doivent pas être stockées dans ses systèmes.</li>
                <li><strong>Données techniques :</strong> Selon les services effectivement utilisés, ZEYNA peut traiter des informations techniques comme les journaux de connexion, l’adresse IP, le type de navigateur et les événements utiles à la sécurité ou au diagnostic.</li>
              </ul>
            </>
          )
        },
        {
          id: "finalites",
          title: "4. Pourquoi utilisons-nous ces données ?",
          content: (
            <>
              <p>Les données sont utilisées pour :</p>
              <ul className="list-disc pl-5 space-y-2 mt-4 mb-4">
                <li>créer et gérer les comptes ;</li>
                <li>traiter les demandes de logement ;</li>
                <li>préparer et exécuter les contrats ;</li>
                <li>suivre les loyers, cautions et remboursements ;</li>
                <li>traiter les réclamations et incidents ;</li>
                <li>sécuriser la plateforme et prévenir les utilisations frauduleuses ;</li>
                <li>respecter les obligations légales applicables.</li>
              </ul>
              <p>ZEYNA ne doit pas utiliser les données pour des finalités incompatibles avec celles annoncées.</p>
            </>
          )
        },
        {
          id: "facultatif",
          title: "5. Informations obligatoires et facultatives",
          content: (
            <>
              <p>Les formulaires indiquent les informations nécessaires au traitement d’une demande ou à la conclusion d’un contrat.</p>
              <p>Les champs facultatifs sont identifiés comme tels. L’absence d’une information indispensable peut empêcher ZEYNA de traiter la demande concernée ; cette conséquence est expliquée au moment de la collecte.</p>
            </>
          )
        },
        {
          id: "destinataires",
          title: "6. Qui peut accéder aux données ?",
          content: (
            <>
              <p>L’accès est limité aux personnes et prestataires qui en ont besoin pour leurs fonctions. Les destinataires peuvent inclure les personnes habilitées au sein de ZEYNA et les prestataires techniques (hébergement, paiement).</p>
              <p>ZEYNA ne vend pas les données personnelles à des tiers à des fins commerciales.</p>
              <p><strong>Les informations communiquées au bailleur sont strictement limitées</strong> à celles qui sont nécessaires à la gestion de sa relation professionnelle avec ZEYNA. L'identité et le contact de l'étudiant locataire ne sont jamais transmis au bailleur, garantissant ainsi l'intermédiation exclusive de ZEYNA.</p>
            </>
          )
        },
        {
          id: "hebergement",
          title: "7. Hébergement et transferts de données",
          content: (
            <>
              <p>Les données sont hébergées et traitées au moyen des services suivants :</p>
              <ul className="list-disc pl-5 space-y-2 mt-4 mb-4">
                <li><strong>Hébergement et Base de données :</strong> Supabase (Architecture sécurisée via Row Level Security).</li>
                <li><strong>Paiement :</strong> Opérateurs de Mobile Money ou bancaires locaux.</li>
              </ul>
              <p>Lorsque des données sont transférées ou accessibles depuis un autre pays, ZEYNA vérifie les conditions légales applicables et accomplit les formalités nécessaires.</p>
            </>
          )
        },
        {
          id: "duree",
          title: "8. Durée de conservation",
          content: (
            <>
              <p>ZEYNA conserve les données pendant la durée nécessaire à leur finalité, sous réserve des obligations légales et de la gestion d’éventuels litiges.</p>
              <p>À l’issue des durées prévues, les données sont supprimées ou traitées selon une méthode conforme aux règles applicables, sauf obligation légale de conservation.</p>
            </>
          )
        },
        {
          id: "securite",
          title: "9. Sécurité des données",
          content: (
            <>
              <p>ZEYNA met en place des mesures adaptées pour protéger les données contre les accès non autorisés, la perte, l’altération et la divulgation.</p>
              <p>Ces mesures comprennent notamment la gestion des permissions, la sécurisation de l’authentification, la limitation des accès, la sauvegarde et la journalisation des actions sensibles. Les personnes autorisées à traiter les données sont tenues à la confidentialité.</p>
            </>
          )
        },
        {
          id: "droits",
          title: "10. Vos droits",
          content: (
            <>
              <p>Conformément à la réglementation applicable, les personnes concernées peuvent exercer les droits qui leur sont reconnus, notamment demander l’accès à leurs données, leur rectification, s’opposer à certains traitements ou demander la suppression de données.</p>
              <p>Pour exercer vos droits, adressez votre demande à :</p>
              <ul className="list-disc pl-5 space-y-2 mt-4 mb-4">
                <li><strong>E-mail :</strong> dpo@logements-zeyna.sn</li>
                <li><strong>Adresse :</strong> Saint-Louis, Sénégal</li>
              </ul>
              <p>ZEYNA peut demander des éléments raisonnables permettant de vérifier l’identité du demandeur afin d’éviter toute divulgation non autorisée.</p>
            </>
          )
        },
        {
          id: "cookies",
          title: "11. Cookies et technologies similaires",
          content: (
            <>
              <p>La plateforme utilise des cookies pour assurer son fonctionnement et la sécurité de vos sessions d'authentification.</p>
              <p>Les préférences de l’utilisateur sont respectées conformément aux règles applicables. Les cookies non indispensables ne sont pas déclenchés avant le choix requis.</p>
            </>
          )
        },
        {
          id: "reclamation",
          title: "12. Réclamation auprès de l’autorité compétente",
          content: (
            <>
              <p>Si vous estimez que vos droits relatifs aux données personnelles ne sont pas respectés, vous pouvez contacter ZEYNA ou, lorsque les conditions sont réunies, saisir la <strong>Commission de Protection des Données Personnelles (CDP) du Sénégal</strong>.</p>
              <p>Site officiel : <a href="https://www.cdp.sn" target="_blank" rel="noopener noreferrer" className="text-accent underline">https://www.cdp.sn</a></p>
            </>
          )
        }
      ]
    }
  ];

  return (
    <LegalDocument 
      title="Politique de Confidentialité" 
      lastUpdated="Octobre 2026"
      parts={parts}
    />
  );
};

export default Confidentialite;
