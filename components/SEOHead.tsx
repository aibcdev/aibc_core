import React from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  noindex?: boolean;
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title = 'AIBC - AI Brand Content Platform | Content as a Service',
  description = 'Transform your digital footprint into scalable content. AI-powered content creation that matches your brand voice. Automated, authentic, always on brand.',
  keywords = 'AI content creation, brand voice, content automation, social media content, AI marketing, content as a service, brand DNA, digital footprint analysis',
  image = '/og-image.jpg',
  url = 'https://aibcmedia.com',
  type = 'website',
  noindex = false
}) => {
  const fullTitle = title.includes('AIBC') ? title : `${title} | AIBC`;
  const fullUrl = url.startsWith('http') ? url : `https://aibcmedia.com${url}`;
  const fullImage = image.startsWith('http') ? image : `https://aibcmedia.com${image}`;

  return (
    <>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="AIBC" />
      <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow'} />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:site_name" content="AIBC" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />
      <meta name="twitter:creator" content="@aibc" />
      <meta name="twitter:site" content="@aibc" />
      
      {/* Additional SEO */}
      <meta name="theme-color" content="#050505" />
      <link rel="canonical" href={fullUrl} />
      
      {/* Structured Data - Organization */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "AIBC",
          "url": "https://aibcmedia.com",
          "logo": "https://aibcmedia.com/logo.png",
          "description": description,
          "sameAs": [
            "https://twitter.com/aibc",
            "https://linkedin.com/company/aibc",
            "https://github.com/aibc"
          ],
          "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "Customer Service",
            "email": "support@aibcmedia.com"
          }
        })}
      </script>
      
      {/* Structured Data - SoftwareApplication */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "AIBC",
          "applicationCategory": "BusinessApplication",
          "operatingSystem": "Web",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "ratingCount": "250"
          },
          "description": description
        })}
      </script>
    </>
  );
};

export default SEOHead;
