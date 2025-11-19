import { Helmet } from 'react-helmet-async';
import PropTypes from 'prop-types';

/**
 * Componente SEO para gestión de metadatos dinámicos
 * Incluye Open Graph, Twitter Cards y datos estructurados JSON-LD
 */
const SEO = ({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  structuredData,
  canonicalUrl,
  noindex = false,
  nofollow = false,
  author = 'Fincas Trimar'
}) => {
  // Configuración base del sitio
  const siteConfig = {
    name: 'Fincas Trimar',
    defaultTitle: 'Fincas Trimar - La mejor forma de encontrar tu vivienda',
    defaultDescription: 'Ofrecemos el servicio completo de venta, compra o alquiler de tu vivienda. Encuentra tu hogar ideal en Igualada y alrededores.',
    siteUrl: window.location.origin,
    defaultImage: `${window.location.origin}/img/og-default.jpg`,
    twitterHandle: '@FincasTrimar',
    fbAppId: '', // Si tienes Facebook App ID
  };

  // Construir valores finales
  const finalTitle = title 
    ? `${title} | ${siteConfig.name}` 
    : siteConfig.defaultTitle;
  
  const finalDescription = description || siteConfig.defaultDescription;
  const finalImage = image || siteConfig.defaultImage;
  const finalUrl = url || window.location.href;
  const finalCanonical = canonicalUrl || finalUrl;

  // Robots meta tag
  const robotsContent = `${noindex ? 'noindex' : 'index'},${nofollow ? 'nofollow' : 'follow'}`;

  return (
    <Helmet>
      {/* Metadatos básicos */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="author" content={author} />
      <meta name="robots" content={robotsContent} />
      <link rel="canonical" href={finalCanonical} />

      {/* Open Graph - Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={finalImage} />
      <meta property="og:url" content={finalUrl} />
      <meta property="og:site_name" content={siteConfig.name} />
      <meta property="og:locale" content="es_ES" />
      {siteConfig.fbAppId && <meta property="fb:app_id" content={siteConfig.fbAppId} />}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={siteConfig.twitterHandle} />
      <meta name="twitter:creator" content={siteConfig.twitterHandle} />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalImage} />

      {/* Datos estructurados JSON-LD */}
      {structuredData && (
        <>
          {Array.isArray(structuredData) ? (
            structuredData.map((schema, index) => (
              <script key={index} type="application/ld+json">
                {JSON.stringify(schema)}
              </script>
            ))
          ) : (
            <script type="application/ld+json">
              {JSON.stringify(structuredData)}
            </script>
          )}
        </>
      )}

      {/* Metadatos adicionales */}
      <meta name="language" content="Spanish" />
      <meta name="revisit-after" content="7 days" />
      <meta name="distribution" content="global" />
      <meta httpEquiv="content-language" content="es" />
    </Helmet>
  );
};

SEO.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  keywords: PropTypes.string,
  image: PropTypes.string,
  url: PropTypes.string,
  type: PropTypes.oneOf(['website', 'article', 'product', 'profile']),
  structuredData: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.arrayOf(PropTypes.object)
  ]),
  canonicalUrl: PropTypes.string,
  noindex: PropTypes.bool,
  nofollow: PropTypes.bool,
  author: PropTypes.string
};

export default SEO;
