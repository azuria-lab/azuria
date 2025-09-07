import { lazy, Suspense, useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useAuthContext } from "@/domains/auth";
import Layout from "@/components/layout/Layout";
import HeroSectionModern from "@/components/home/HeroSectionModern";
import PlansOverviewSection from "@/components/home/PlansOverviewSection";
import BenefitsShowcaseSection from "@/components/home/BenefitsShowcaseSection";
import IntelligentBatchBanner from "@/components/home/IntelligentBatchBanner";
import { AdvancedLoadingSpinner } from "@/components/ui/advanced-loading-spinner";
import { DashboardSkeleton, FeatureGridSkeleton } from "@/components/ui/skeleton-loader";
import { SEOHead } from "@/components/seo/SEOHead";
import { StructuredData } from "@/components/seo/StructuredData";

// Lazy load de componentes não-críticos
const FeaturesGrid = lazy(() => import("@/components/home/FeaturesGrid"));
const MarketplaceIntegrations = lazy(() => import("@/components/home/MarketplaceIntegrations"));
const CompetitiveDifferentials = lazy(() => import("@/components/home/CompetitiveDifferentials"));
const SocialProof = lazy(() => import("@/components/home/SocialProof"));
const UnifiedDashboard = lazy(() => import("@/components/dashboard/UnifiedDashboard"));

import { features } from "@/data/features";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.05,
      staggerChildren: 0.05
    }
  }
};

export default function Index() {
  const [mounted, setMounted] = useState(false);
  const reduceMotion = useReducedMotion();
  const authContext = useAuthContext();
  const isAuthenticated = Boolean(authContext?.isAuthenticated);

  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Show loading only briefly - prevent infinite loading
  if (!mounted) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <AdvancedLoadingSpinner 
            variant="dashboard" 
            size="lg" 
            message="Carregando aplicativo..." 
          />
        </div>
      </Layout>
    );
  }
  
  // Se o usuário estiver autenticado, mostrar o dashboard
  if (isAuthenticated) {
    return (
      <Layout>
        <motion.div
          variants={reduceMotion ? undefined : containerVariants}
          initial={reduceMotion ? false : "hidden"}
          animate={reduceMotion ? undefined : "visible"}
          className="min-h-screen"
        >
          <div className="container mx-auto py-8 px-4">
            <Suspense fallback={<DashboardSkeleton />}>
              <UnifiedDashboard />
            </Suspense>
          </div>
        </motion.div>
      </Layout>
    );
  }
  
  // Nova landing page modernizada para usuários não logados
  return (
      <Layout>
        <SEOHead 
          title="Azuria+ — Precificação inteligente com IA e automação"
          description="Precificação inteligente com IA, analytics em tempo real e automação para lojistas. Teste grátis 7 dias."
          type="website"
          url={typeof window !== "undefined" ? window.location.href : "https://azuria.app/"}
          image="/og-image.png"
          author="Azuria+"
        />
        <StructuredData 
          type="product" 
          data={{ name: "Azuria+", description: "Plataforma de precificação inteligente com IA, analytics e automação.", price: "0", rating: { value: "4.8", count: "120" } }} 
        />
        <StructuredData 
          type="faq" 
          data={[
            { question: "Quanto custa o Azuria+?", answer: "Planos Free, Pro (R$ 29,90/mês) e Premium (R$ 79,90/mês) com teste grátis de 7 dias." },
            { question: "A calculadora usa IA?", answer: "Sim, insights de mercado e recomendações automáticas via IA." }
          ]} 
        />
        <motion.div
          variants={reduceMotion ? undefined : containerVariants}
          initial={reduceMotion ? false : "hidden"}
          animate={reduceMotion ? undefined : "visible"}
          className="min-h-screen"
        >
          {/* Hero Section Modernizado */}
          <HeroSectionModern />
          
          {/* Seção de Benefícios */}
          <BenefitsShowcaseSection />
          
          {/* Inteligent Batch Banner */}
          <div className="container mx-auto py-8 px-4">
            <IntelligentBatchBanner />
          </div>
          
          {/* Planos e Preços - Agora modernizado */}
          <PlansOverviewSection />
          
          {/* Lazy loaded components */}
          <Suspense fallback={
            <div className="container mx-auto px-4 py-16">
              <AdvancedLoadingSpinner variant="default" size="md" message="Carregando integrações..." />
            </div>
          }>
            <MarketplaceIntegrations />
          </Suspense>
          
          <Suspense fallback={
            <div className="container mx-auto px-4 py-16">
              <AdvancedLoadingSpinner variant="minimal" size="md" />
            </div>
          }>
            <SocialProof />
          </Suspense>
          
          {/* Features Grid */}
          <div className="container mx-auto px-4 py-16" data-feature="calculator">
            <Suspense fallback={<FeatureGridSkeleton />}>
              <FeaturesGrid features={features} />
            </Suspense>
          </div>
          
          {/* Diferenciais Competitivos */}
          <Suspense fallback={
            <div className="container mx-auto px-4 py-16">
              <AdvancedLoadingSpinner variant="default" size="md" message="Carregando diferenciais..." />
            </div>
          }>
            <CompetitiveDifferentials />
          </Suspense>
        </motion.div>
      </Layout>
  );
}
