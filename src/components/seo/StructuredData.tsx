
import React from 'react';
import { Helmet } from 'react-helmet-async';

type OrganizationData = Partial<{
  name: string;
  url: string;
  logo: string;
  description: string;
  contactPoint: unknown;
  sameAs: string[];
}>;

type BreadcrumbItem = { name: string; url: string };
type FAQItem = { question: string; answer: string };
type ProductData = {
  name: string;
  description: string;
  price?: string | number;
  rating?: { value: number | string; count: number | string };
};
type ReviewData = { author: string; rating: number | string; body: string; date: string };

type StructuredDataProps =
  | { type: 'organization'; data: OrganizationData }
  | { type: 'breadcrumb'; data: BreadcrumbItem[] }
  | { type: 'faq'; data: FAQItem[] }
  | { type: 'product'; data: ProductData }
  | { type: 'review'; data: ReviewData };

export const StructuredData: React.FC<StructuredDataProps> = ({ type, data }) => {
  const generateSchema = () => {
    switch (type) {
      case 'organization':
        return {
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Azuria+",
          "url": "https://azuria.app",
          "logo": "https://azuria.app/logo.png",
          "description": "Plataforma completa de precificação para empreendedores brasileiros",
          "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "customer service",
            "availableLanguage": "Portuguese"
          },
          "sameAs": [
            "https://facebook.com/precifica",
            "https://twitter.com/precifica_app",
            "https://instagram.com/precifica"
          ],
          ...data
        };

    case 'breadcrumb':
        return {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
      "itemListElement": data.map((item, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.name,
            "item": item.url
          }))
        };

    case 'faq':
        return {
          "@context": "https://schema.org",
          "@type": "FAQPage",
      "mainEntity": data.map((faq) => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": faq.answer
            }
          }))
        };

  case 'product':
        return {
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": data.name,
          "applicationCategory": "BusinessApplication",
          "operatingSystem": "Web",
          "description": data.description,
          "offers": {
            "@type": "Offer",
            "price": data.price || "0",
            "priceCurrency": "BRL",
            "availability": "https://schema.org/InStock"
          },
          "aggregateRating": data.rating && {
            "@type": "AggregateRating",
    "ratingValue": data.rating.value,
    "reviewCount": data.rating.count
          }
        };

  case 'review':
        return {
          "@context": "https://schema.org",
          "@type": "Review",
          "itemReviewed": {
            "@type": "SoftwareApplication",
            "name": "Azuria+"
          },
          "author": {
            "@type": "Person",
            "name": data.author
          },
          "reviewRating": {
            "@type": "Rating",
            "ratingValue": data.rating,
            "bestRating": "5"
          },
          "reviewBody": data.body,
          "datePublished": data.date
        };

      default:
        return data as unknown as Record<string, unknown>;
    }
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(generateSchema())}
      </script>
    </Helmet>
  );
};
