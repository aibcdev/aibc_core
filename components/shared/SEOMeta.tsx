import React, { useEffect } from 'react';

interface SEOMetaProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  structuredData?: Array<{ type: string; data: object }>;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  locale?: string;
  siteName?: string;
  keywords?: string[];
}

const SEOMeta: React.FC<SEOMetaProps> = ({
  title,
  description,
  image,
  url,
  type = 'website',
  structuredData,
  author,
  publishedTime,
  modifiedTime,
  locale = 'en_US',
  siteName = 'AIBC',
  keywords,
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
    if (siteName) updateMetaTag('og:site_name', siteName, 'property');
    if (locale) updateMetaTag('og:locale', locale, 'property');

    // Article-specific Open Graph tags
    if (type === 'article') {
      if (author) updateMetaTag('article:author', author, 'property');
      if (publishedTime) updateMetaTag('article:published_time', publishedTime, 'property');
      if (modifiedTime) updateMetaTag('article:modified_time', modifiedTime, 'property');
      if (keywords && keywords.length > 0) {
        keywords.forEach((keyword, index) => {
          updateMetaTag(`article:tag`, keyword, 'property');
        });
      }
    }

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    if (title) updateMetaTag('twitter:title', title);
    if (description) updateMetaTag('twitter:description', description);
    if (image) updateMetaTag('twitter:image', image);
    if (siteName) updateMetaTag('twitter:site', `@${siteName}`, 'name');

    // Language and locale
    updateMetaTag('language', locale.split('_')[0] || 'en');
    updateMetaTag('locale', locale);

    // Canonical URL
    if (url) {
      let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      canonical.setAttribute('href', url);
    }

    // Keywords meta tag
    if (keywords && keywords.length > 0) {
      updateMetaTag('keywords', keywords.join(', '));
    }

    // Additional SEO meta tags
    updateMetaTag('robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    updateMetaTag('googlebot', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    
    // Viewport and mobile optimization
    let viewport = document.querySelector('meta[name="viewport"]') as HTMLMetaElement;
    if (!viewport) {
      viewport = document.createElement('meta');
      viewport.setAttribute('name', 'viewport');
      document.head.appendChild(viewport);
    }
    viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=5.0');

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
  }, [title, description, image, url, type, structuredData, author, publishedTime, modifiedTime, locale, siteName, keywords]);

  return null;
};

export default SEOMeta;

