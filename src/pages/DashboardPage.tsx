
import React from 'react';
import { SEOHead } from '@/components/seo/SEOHead';
import Layout from '@/components/layout/Layout';
import PersonalizedDashboard from '@/components/dashboard/PersonalizedDashboard';

export default function DashboardPage() {
  const canonical = typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : 'https://azuria.plus/dashboard';
  return (
    <>
      <SEOHead 
        title="Dashboard Personalizado - Precifica+"
        description="Dashboard personalizado com widgets arrastar e soltar, métricas personalizáveis e múltiplos dashboards."
        url={canonical}
        type="website"
      />
      
      <Layout>
        <div className="container mx-auto py-8 px-4">
          <h1 className="sr-only">Dashboard Personalizado - Precifica+</h1>
          <PersonalizedDashboard />
        </div>
      </Layout>
    </>
  );
}
