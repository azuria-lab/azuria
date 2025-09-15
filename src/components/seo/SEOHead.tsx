
import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  author?: string;
  publishDate?: string;
  modifiedDate?: string;
  noIndex?: boolean;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title = 'Azuria+ - Precificação Inteligente',
  description = 'Precificação inteligente com IA, analytics em tempo real e automação para lojistas.',
  keywords = 'precificação, preços, calculadora, lucro, margem, vendas, marketplace, brasil, azuria+',
  image = '/og-image.png',
  url = 'https://azuria.app',
  type = 'website',
  author = 'Azuria+',
  publishDate,
  modifiedDate,
  noIndex = false
}) => {
  const fullTitle = title.includes('Azuria+') ? title : `${title} | Azuria+`;
  
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      
      {/* Robots */}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="Azuria+" />
      <meta property="og:locale" content="pt_BR" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@azuria_app" />
      <meta name="twitter:creator" content="@azuria_app" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Article specific */}
      {type === 'article' && publishDate && (
        <meta property="article:published_time" content={publishDate} />
      )}
      {type === 'article' && modifiedDate && (
        <meta property="article:modified_time" content={modifiedDate} />
      )}
      {type === 'article' && (
        <meta property="article:author" content={author} />
      )}
      
      {/* Schema.org structured data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": type === 'article' ? 'Article' : 'WebApplication',
          "name": fullTitle,
          "description": description,
          "url": url,
          "image": image,
          "author": {
            "@type": "Organization",
            "name": author
          },
        "publisher": {
          "@type": "Organization",
          "name": "Azuria+",
          "logo": {
            "@type": "ImageObject",
            "url": "/logo.png"
          }
        },
          "applicationCategory": "BusinessApplication",
          "operatingSystem": "Web",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "BRL"
          }
        })}
      </script>
      
      {/* Additional performance hints */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={url} />
    </Helmet>
  );
};
