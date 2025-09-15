
import React from 'react';
import { Helmet } from 'react-helmet-async';
import Layout from '@/components/layout/Layout';
import TemplateMarketplace from '@/components/templates/TemplateMarketplace';

export default function TemplatesPage() {
  return (
    <>
      <Helmet>
        <title>Templates de Precificação - Azuria+</title>
        <meta name="description" content="Marketplace de templates de precificação para diferentes setores. Acelere seus cálculos com configurações otimizadas." />
      </Helmet>
      
      <Layout>
        <TemplateMarketplace />
      </Layout>
    </>
  );
}
