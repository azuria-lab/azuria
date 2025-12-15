import { lazy, Suspense, useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useAuthContext } from "@/domains/auth";
import Layout from "@/components/layout/Layout";
import { AdvancedLoadingSpinner } from "@/components/ui/advanced-loading-spinner";
import { DashboardSkeleton } from "@/components/ui/skeleton-loader";
import { SEOHead } from "@/components/seo/SEOHead";
import { StructuredData } from "@/components/seo/StructuredData";
import { LazySection } from "@/components/performance/LazySection";

// Lazy load de componentes não-críticos
const UnifiedDashboard = lazy(() => import("@/components/dashboard/UnifiedDashboard"));

// Lazy load de todas as seções da Home para melhor performance
const HeroSectionBling = lazy(() => import("@/components/home/HeroSectionBling"));
const BenefitsSectionBling = lazy(() => import("@/components/home/BenefitsSectionBling"));
const HowItWorksSection = lazy(() => import("@/components/home/HowItWorksSection"));
const FeaturesSectionBling = lazy(() => import("@/components/home/FeaturesSectionBling"));
const MarketplaceCarouselPremium = lazy(() => import("@/components/home/MarketplaceCarouselPremium"));
const TestimonialsSectionBling = lazy(() => import("@/components/home/TestimonialsSectionBling"));
const ComparisonSectionBling = lazy(() => import("@/components/home/ComparisonSectionBling"));
const FinalCTASection = lazy(() => import("@/components/home/FinalCTASection"));
const PlansOverviewSection = lazy(() => import("@/components/home/PlansOverviewSection"));

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
  
  // Nova landing page estilo Bling ERP para usuários não logados
  return (
      <Layout>
        <SEOHead 
          title="Azuria — Precificação Inteligente para Vender com Mais Lucro"
          description="Precificação inteligente com IA especializada para produtos brasileiros. Aumente seus lucros em até 47% com cálculos automáticos de impostos e análise de concorrência. Teste grátis 7 dias."
          type="website"
          url={typeof window !== "undefined" ? window.location.href : "https://azuria.app/"}
          image="/og-image.png"
          author="Azuria"
        />
        <StructuredData 
          type="product" 
          data={{ name: "Azuria", description: "Plataforma de precificação inteligente com IA, analytics e automação para o mercado brasileiro.", price: "0", rating: { value: "4.8", count: "120" } }} 
        />
        <StructuredData 
          type="faq" 
          data={[
            { question: "Quanto custa o Azuria?", answer: "Planos Free, Pro e Premium com teste grátis de 7 dias. Sem cartão de crédito." },
            { question: "A calculadora usa IA?", answer: "Sim, IA especializada para produtos brasileiros com análise de custos, concorrentes e tributos." },
            { question: "Quais marketplaces são integrados?", answer: "Mercado Livre, Shopee, Amazon, Magalu, Temu, Shein e Americanas." }
          ]} 
        />
        <motion.div
          variants={reduceMotion ? undefined : containerVariants}
          initial={reduceMotion ? false : "hidden"}
          animate={reduceMotion ? undefined : "visible"}
          className="min-h-screen w-full"
        >
          {/* A. Hero Section - Carregamento prioritário */}
          <Suspense fallback={<div className="h-screen flex items-center justify-center w-full"><AdvancedLoadingSpinner variant="default" size="md" /></div>}>
            <HeroSectionBling />
          </Suspense>
          
          {/* B. Seção de Benefícios Principais */}
          <LazySection>
            <Suspense fallback={<div className="h-96 w-full" />}>
              <BenefitsSectionBling />
            </Suspense>
          </LazySection>
          
          {/* C. Como funciona o Azuria */}
          <LazySection>
            <Suspense fallback={<div className="h-96 w-full" />}>
              <HowItWorksSection />
            </Suspense>
          </LazySection>
          
          {/* D. Seção de Recursos */}
          <LazySection>
            <Suspense fallback={<div className="h-96 w-full" />}>
              <FeaturesSectionBling />
            </Suspense>
          </LazySection>
          
          {/* E. Integrações com marketplaces - Carrossel Premium */}
          <LazySection rootMargin="150px">
            <Suspense fallback={<div className="h-96 w-full" />}>
              <MarketplaceCarouselPremium />
            </Suspense>
          </LazySection>
          
          {/* F. Depoimentos reais */}
          <LazySection rootMargin="150px">
            <Suspense fallback={<div className="h-96 w-full" />}>
              <TestimonialsSectionBling />
            </Suspense>
          </LazySection>
          
          {/* G. Comparativo */}
          <LazySection>
            <Suspense fallback={<div className="h-96 w-full" />}>
              <ComparisonSectionBling />
            </Suspense>
          </LazySection>
          
          {/* Planos e Preços */}
          <LazySection>
            <Suspense fallback={<div className="h-96 w-full" />}>
              <PlansOverviewSection />
            </Suspense>
          </LazySection>
          
          {/* H. CTA Final */}
          <LazySection>
            <Suspense fallback={<div className="h-96 w-full" />}>
              <FinalCTASection />
            </Suspense>
          </LazySection>
        </motion.div>
      </Layout>
  );
}
