import React, { useEffect } from 'react';

interface SEOMetaProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  structuredData?: Array<{ type: string; data: object }>;
}

const SEOMeta: React.FC<SEOMetaProps> = ({
  title,
  description,
  image,
  url,
  type = 'website',
  structuredData,
}) => {
  useEffect(() => {
    // Update document title
    if (title) {
      document.title = title;
    }

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, attribute: string = 'name') => {
      let element = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Meta description
    if (description) {
      updateMetaTag('description', description);
    }

    // Open Graph tags
    if (title) updateMetaTag('og:title', title, 'property');
    if (description) updateMetaTag('og:description', description, 'property');
    if (type) updateMetaTag('og:type', type, 'property');
    if (url) updateMetaTag('og:url', url, 'property');
    if (image) updateMetaTag('og:image', image, 'property');

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    if (title) updateMetaTag('twitter:title', title);
    if (description) updateMetaTag('twitter:description', description);
    if (image) updateMetaTag('twitter:image', image);

    // Add structured data
    if (structuredData && structuredData.length > 0) {
      // Remove existing structured data scripts
      const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
      existingScripts.forEach(script => script.remove());

      // Add new structured data
      structuredData.forEach((item, index) => {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.id = `structured-data-${index}`;
        script.textContent = JSON.stringify(item.data);
        document.head.appendChild(script);
      });
    }
  }, [title, description, image, url, type, structuredData]);

  return null;
};

export default SEOMeta;

