
import React from 'react';
import { SEOHead } from '@/components/seo/SEOHead';
import Layout from '@/components/layout/Layout';
import UnifiedDashboard from '@/components/dashboard/UnifiedDashboard';

export default function DashboardPage() {
  const canonical = typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : 'https://azuria.plus/dashboard';
  return (
    <>
      <SEOHead 
        title="Dashboard - Azuria"
        description="Dashboard principal com métricas, ações rápidas e atividades recentes."
        url={canonical}
        type="website"
      />
      
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <UnifiedDashboard />
        </div>
      </Layout>
    </>
  );
}
