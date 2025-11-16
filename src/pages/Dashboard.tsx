import { lazy, Suspense } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import { DashboardSkeleton } from "@/components/ui/skeleton-loader";
import { SEOHead } from "@/components/seo/SEOHead";

// Lazy load do dashboard principal
const UnifiedDashboard = lazy(() => import("@/components/dashboard/UnifiedDashboard"));

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

export default function Dashboard() {
  const reduceMotion = useReducedMotion();

  return (
    <>
      <SEOHead 
        title="Dashboard - Azuria+"
        description="Dashboard principal com resumo de atividades, métricas e ações rápidas"
        url="/dashboard"
        type="website"
      />
      
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
    </>
  );
}
