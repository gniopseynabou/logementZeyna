import { LegalDocument, LegalPart } from "@/components/legal/LegalDocument";

const MentionsLegales = () => {
  const parts: LegalPart[] = [
    {
      sections: [
        {
          id: "editeur",
          title: "1. Éditeur de la plateforme",
          content: (
            <>
              <p>La plateforme Les Logements de ZEYNA est éditée par :</p>
              <ul className="list-disc pl-5 space-y-2 mt-4">
                <li><strong>Nom officiel ou raison sociale :</strong> Les Logements de ZEYNA</li>
                <li><strong>Nom commercial :</strong> Les Logements de ZEYNA</li>
                <li><strong>Forme juridique :</strong> SAS</li>
                <li><strong>Adresse :</strong> Saint-Louis, Sénégal</li>
                <li><strong>Téléphone :</strong> +221 77 000 00 00</li>
                <li><strong>Adresse e-mail :</strong> contact@logements-zeyna.sn</li>
                <li><strong>Site Internet :</strong> www.logements-zeyna.sn</li>
              </ul>
              <p className="mt-4">Ces informations identifient l’entité ou la personne qui exploite effectivement la plateforme.</p>
            </>
          ),
        },
        {
          id: "responsable",
          title: "2. Responsable de la publication",
          content: (
            <>
              <p>Le responsable de la publication est :</p>
              <ul className="list-disc pl-5 space-y-2 mt-4">
                <li><strong>Nom et prénom :</strong> Équipe ZEYNA</li>
                <li><strong>Fonction :</strong> Direction de la publication</li>
                <li><strong>Adresse e-mail :</strong> direction@logements-zeyna.sn</li>
              </ul>
            </>
          ),
        },
        {
          id: "hebergement",
          title: "3. Hébergement",
          content: (
            <>
              <p>La plateforme est hébergée par :</p>
              <ul className="list-disc pl-5 space-y-2 mt-4">
                <li><strong>Prestataire :</strong> Supabase Inc. / Vercel</li>
                <li><strong>Adresse :</strong> 970 3rd St, San Francisco, CA 94107, USA</li>
                <li><strong>Site Internet :</strong> supabase.com / vercel.com</li>
              </ul>
            </>
          ),
        },
        {
          id: "presentation",
          title: "4. Présentation de ZEYNA",
          content: (
            <>
              <p>Les Logements de ZEYNA accompagne les personnes à la recherche d’un logement et assure des services liés à la gestion locative. La plateforme peut notamment présenter des chambres, des studios, des appartements et d’autres types de logements selon les offres disponibles.</p>
              <p>Selon le montage contractuel retenu, ZEYNA intervient en qualité de <strong>locataire principal et de sous-bailleur</strong>. Les conditions applicables à chaque occupation sont précisées dans le contrat correspondant.</p>
              <p>ZEYNA constitue <strong>l’interlocuteur exclusif</strong> de l’étudiant pour les paiements, les demandes et le suivi des problèmes liés au logement, conformément aux engagements contractuels applicables. Aucun contact n'a lieu directement entre le locataire occupant et le bailleur propriétaire.</p>
            </>
          ),
        },
        {
          id: "propriete-intellectuelle",
          title: "5. Propriété intellectuelle",
          content: (
            <>
              <p>Les contenus, textes, éléments graphiques, logos, interfaces et autres éléments appartenant à ZEYNA sont protégés par les règles applicables à la propriété intellectuelle.</p>
              <p>Toute reproduction ou utilisation non autorisée de ces éléments est interdite, sauf dans les cas autorisés par la loi ou avec l’accord du titulaire des droits.</p>
              <p>Les contenus appartenant à des tiers restent soumis aux droits de leurs propriétaires respectifs.</p>
            </>
          ),
        },
        {
          id: "informations-disponibilite",
          title: "6. Informations et disponibilité des logements",
          content: (
            <>
              <p>ZEYNA s’efforce de fournir des informations exactes et actualisées sur les logements présentés sur la plateforme.</p>
              <p>La disponibilité, le prix et les conditions d’occupation doivent être confirmés avant la conclusion du contrat correspondant. Les caractéristiques retenues contractuellement sont celles indiquées dans les documents applicables à la location.</p>
            </>
          ),
        },
        {
          id: "disponibilite-plateforme",
          title: "7. Disponibilité de la plateforme",
          content: (
            <>
              <p>ZEYNA met en œuvre des moyens raisonnables pour maintenir la plateforme accessible. Toutefois, des interruptions temporaires peuvent survenir en raison d’opérations de maintenance, de mises à jour ou d’incidents techniques.</p>
              <p>Lorsque cela est possible, les utilisateurs sont informés des interruptions planifiées.</p>
            </>
          ),
        },
        {
          id: "contact",
          title: "8. Contact",
          content: (
            <>
              <p>Pour toute question concernant la plateforme ou les présentes mentions légales :</p>
              <ul className="list-disc pl-5 space-y-2 mt-4">
                <li><strong>E-mail :</strong> contact@logements-zeyna.sn</li>
                <li><strong>Téléphone :</strong> +221 77 000 00 00</li>
                <li><strong>Adresse :</strong> Saint-Louis, Sénégal</li>
              </ul>
            </>
          ),
        },
        {
          id: "droit-applicable",
          title: "9. Droit applicable",
          content: (
            <>
              <p>Les présentes mentions légales sont soumises au droit applicable au Sénégal, sous réserve des dispositions impératives applicables à la situation concernée.</p>
            </>
          ),
        }
      ]
    }
  ];

  return (
    <LegalDocument 
      title="Mentions Légales" 
      lastUpdated="Octobre 2026"
      intro={
        <p>Bienvenue sur <strong>Les Logements de ZEYNA</strong>, une plateforme dédiée à la recherche et à la gestion de logements, notamment pour les étudiants.<br/><br/>Les présentes mentions légales permettent aux utilisateurs d’identifier l’éditeur de la plateforme, son responsable et les prestataires techniques concernés.</p>
      }
      parts={parts}
    />
  );
};

export default MentionsLegales;
