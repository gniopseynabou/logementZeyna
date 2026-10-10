import { LegalDocument, LegalPart } from "@/components/legal/LegalDocument";

const CGU = () => {
  const parts: LegalPart[] = [
    {
      title: "PARTIE I — ACCÈS ET SERVICES",
      sections: [
        {
          id: "objet",
          title: "Article 1 — Objet",
          content: (
            <>
              <p>Les présentes conditions générales d’utilisation définissent les règles d’accès et d’utilisation de la plateforme Les Logements de ZEYNA, accessible à l’adresse www.logements-zeyna.sn.</p>
              <p>Elles s’appliquent aux visiteurs, aux étudiants, aux bailleurs et aux autres utilisateurs autorisés à accéder aux fonctionnalités de la plateforme.</p>
              <p>Elles complètent les contrats spécifiques conclus avec ZEYNA, sans les remplacer.</p>
            </>
          )
        },
        {
          id: "services",
          title: "Article 2 — Services proposés",
          content: (
            <>
              <p>Les Logements de ZEYNA permet notamment, selon les fonctionnalités disponibles :</p>
              <ul className="list-disc pl-5 space-y-2 mt-4 mb-4">
                <li>de consulter des offres de logements ;</li>
                <li>de rechercher un logement selon différents critères ;</li>
                <li>d’effectuer une demande de logement ou de renseignements ;</li>
                <li>de créer et gérer un compte utilisateur ;</li>
                <li>de consulter des informations relatives à une occupation ;</li>
                <li>de suivre les paiements et les documents associés, lorsque ces fonctions sont disponibles ;</li>
                <li>de signaler un problème et de contacter ZEYNA.</li>
              </ul>
              <p>Les fonctionnalités proposées peuvent évoluer. Seules celles effectivement disponibles sur la plateforme peuvent être utilisées.</p>
            </>
          )
        },
        {
          id: "role-zeyna",
          title: "Article 3 — Rôle de ZEYNA",
          content: (
            <>
              <p>ZEYNA assure <strong>exclusivement</strong> la relation avec l’étudiant dans le cadre des services et contrats qu’elle conclut avec lui. Aucun contact n'est établi entre l'étudiant et le bailleur propriétaire.</p>
              <p>Lorsqu’elle intervient comme sous-bailleur, ZEYNA met le logement à disposition de l’étudiant dans le cadre du contrat de sous-location applicable, sous réserve des autorisations nécessaires.</p>
              <p>L’étudiant s’adresse à ZEYNA pour les paiements, les demandes liées au logement et le suivi des incidents, selon les conditions convenues.</p>
              <p>Le présent document ne remplace pas le contrat de sous-location et ne modifie pas les droits que la loi reconnaît aux parties concernées.</p>
            </>
          )
        }
      ]
    },
    {
      title: "PARTIE II — COMPTES ET UTILISATION",
      sections: [
        {
          id: "compte",
          title: "Article 4 — Création et utilisation d’un compte",
          content: (
            <>
              <p>Certaines fonctionnalités nécessitent la création d’un compte.</p>
              <p>L’utilisateur s’engage à fournir des informations exactes et à les actualiser lorsqu’elles changent. Il ne doit pas créer un compte sous une fausse identité ni utiliser les coordonnées d’une autre personne sans autorisation.</p>
              <p>Les identifiants de connexion sont personnels. L’utilisateur doit préserver leur confidentialité et informer ZEYNA s’il constate une utilisation suspecte de son compte.</p>
              <p>Lorsqu’un utilisateur n’a pas la capacité juridique nécessaire pour conclure un contrat, les autorisations ou mécanismes de représentation requis doivent être respectés.</p>
            </>
          )
        },
        {
          id: "utilisation-correcte",
          title: "Article 5 — Utilisation correcte de la plateforme",
          content: (
            <>
              <p>L’utilisateur s’engage à utiliser la plateforme de manière loyale et conformément à sa destination.</p>
              <p>Il est notamment interdit de :</p>
              <ul className="list-disc pl-5 space-y-2 mt-4 mb-4">
                <li>tenter d’accéder à un compte ou à des données sans autorisation ;</li>
                <li>contourner les mesures de sécurité ;</li>
                <li>perturber le fonctionnement de la plateforme ;</li>
                <li>transmettre volontairement de fausses informations ;</li>
                <li>utiliser le service pour commettre une fraude ;</li>
                <li>publier des contenus illicites ou portant atteinte aux droits de tiers ;</li>
                <li>collecter les données d’autres utilisateurs sans autorisation.</li>
              </ul>
              <p>En cas de manquement, ZEYNA peut prendre des mesures proportionnées, notamment limiter ou suspendre un compte. Sauf urgence ou obligation contraire, l’utilisateur est informé du motif de la mesure.</p>
            </>
          )
        }
      ]
    },
    {
      title: "PARTIE III — LOGEMENTS ET RÉSERVATIONS",
      sections: [
        {
          id: "infos-logements",
          title: "Article 6 — Informations sur les logements",
          content: (
            <>
              <p>Les offres présentent les caractéristiques des logements selon les informations disponibles : type, localisation, capacité, équipements, prix et conditions d’occupation.</p>
              <p>Une offre affichée ne signifie pas nécessairement que le logement est définitivement attribué. La disponibilité et les conditions de l’occupation doivent être confirmées avant la conclusion du contrat.</p>
              <p>L’utilisateur doit consulter les caractéristiques du logement et le document contractuel qui lui est présenté avant de s’engager.</p>
            </>
          )
        },
        {
          id: "demandes",
          title: "Article 7 — Demandes et réservations",
          content: (
            <>
              <p>Une demande de renseignements ou une manifestation d’intérêt ne constitue pas automatiquement une réservation définitive.</p>
              <p>Lorsqu’une procédure de réservation est disponible, la plateforme indique les étapes nécessaires à sa validation.</p>
              <p>Les modalités de paiement, les conditions d’entrée dans les lieux et la prise d’effet du contrat sont précisées dans le document applicable.</p>
            </>
          )
        }
      ]
    },
    {
      title: "PARTIE IV — RESPONSABILITÉS ET LITIGES",
      sections: [
        {
          id: "disponibilite",
          title: "Article 8 — Disponibilité et maintenance",
          content: (
            <>
              <p>ZEYNA s’efforce d’assurer le bon fonctionnement de la plateforme. Toutefois, l’accès peut être temporairement interrompu pour maintenance, mise à jour, sécurité ou résolution d’un incident.</p>
              <p>Ces interruptions ne suppriment pas automatiquement les obligations nées des contrats en cours.</p>
            </>
          )
        },
        {
          id: "propriete-intellectuelle",
          title: "Article 9 — Propriété intellectuelle",
          content: (
            <>
              <p>Les éléments de la plateforme appartenant à ZEYNA ne peuvent pas être reproduits, modifiés ou exploités sans autorisation, sauf dans les cas autorisés par la loi.</p>
              <p>Les utilisateurs restent responsables des contenus qu’ils transmettent et doivent disposer des droits nécessaires pour leur utilisation.</p>
            </>
          )
        },
        {
          id: "donnees-personnelles",
          title: "Article 10 — Données personnelles",
          content: (
            <>
              <p>Les données personnelles sont traitées conformément à la politique de confidentialité de ZEYNA, accessible depuis la plateforme.</p>
              <p>Cette politique décrit les données collectées, les finalités de leur utilisation, les destinataires éventuels, les durées de conservation et les modalités d’exercice des droits des personnes concernées.</p>
            </>
          )
        },
        {
          id: "reclamations",
          title: "Article 11 — Réclamations",
          content: (
            <>
              <p>Pour toute difficulté liée à l’utilisation de la plateforme, l’utilisateur peut contacter ZEYNA :</p>
              <ul className="list-disc pl-5 space-y-2 mt-4 mb-4">
                <li><strong>E-mail :</strong> contact@logements-zeyna.sn</li>
                <li><strong>Téléphone :</strong> +221 77 000 00 00</li>
              </ul>
              <p>ZEYNA examine les demandes et assure leur suivi dans la mesure de ses obligations et des informations nécessaires à leur traitement.</p>
            </>
          )
        },
        {
          id: "modification",
          title: "Article 12 — Modification des CGU",
          content: (
            <>
              <p>Les présentes conditions peuvent être mises à jour pour tenir compte de l’évolution de la plateforme, de ses fonctionnalités ou de la réglementation.</p>
              <p>La version applicable et sa date de mise à jour sont indiquées sur la plateforme. Lorsqu’un changement nécessite une information ou un accord spécifique, la procédure correspondante est appliquée.</p>
            </>
          )
        },
        {
          id: "litiges",
          title: "Article 13 — Droit applicable et litiges",
          content: (
            <>
              <p>Les présentes CGU sont soumises au droit applicable au Sénégal.</p>
              <p>En cas de difficulté, l’utilisateur peut contacter ZEYNA afin de rechercher une solution amiable. Cette démarche ne prive aucune partie des recours auxquels elle peut prétendre devant les autorités ou juridictions compétentes.</p>
            </>
          )
        }
      ]
    }
  ];

  return (
    <LegalDocument 
      title="Conditions Générales d'Utilisation" 
      lastUpdated="Octobre 2026"
      parts={parts}
    />
  );
};

export default CGU;
