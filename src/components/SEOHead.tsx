import { Helmet } from "react-helmet-async";

interface SEOHeadProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: "website" | "article";
  noIndex?: boolean;
  jsonLd?: object | object[];
}

const SITE_NAME = "Les Logements de Zeyna";
const SITE_URL = "https://leslogementsdezeyna.com";
const DEFAULT_DESCRIPTION =
  "Trouvez votre logement étudiant à Saint-Louis du Sénégal. Chambres, studios et appartements vérifiés, sécurisés et à prix juste - avec Les Logements de Zeyna.";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`;

const SEOHead = ({
  title,
  description = DEFAULT_DESCRIPTION,
  canonical,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = "website",
  noIndex = false,
  jsonLd,
}: SEOHeadProps) => {
  const fullTitle = title ? `${title} - ${SITE_NAME}` : SITE_NAME;
  const canonicalUrl = canonical
    ? `${SITE_URL}${canonical}`
    : typeof window !== "undefined"
    ? window.location.href
    : SITE_URL;

  return (
    <Helmet>
      {/* Titre */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />

      {/* Canonique */}
      <link rel="canonical" href={canonicalUrl} />

      {/* Robots */}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="fr_SN" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* JSON-LD structuré */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(Array.isArray(jsonLd) ? jsonLd : jsonLd)}
        </script>
      )}
    </Helmet>
  );
};

export default SEOHead;
