import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { LazyComponentLoader } from "@/components/performance/LazyComponentLoader";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.1,
      staggerChildren: 0.1
    }
  }
};

export default function AnalyticsDashboardPage() {
  const canonical =
    typeof window !== "undefined" ? `${window.location.origin}/analytics` : "https://azuria.plus/analytics";

  return (
    <>
      <Helmet>
        <title>Analytics em Tempo Real - Azuria+</title>
        <meta
          name="description"
          content="Visualize KPIs e métricas em tempo real para otimizar sua precificação com IA e insights acionáveis."
        />
        <link rel="canonical" href={canonical} />
      </Helmet>

      <h1 className="sr-only">Analytics em Tempo Real da Azuria+</h1>
      <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="container mx-auto py-8 px-4"
        >
          <LazyComponentLoader importFunc={() => import("@/components/analytics/AnalyticsDashboard")} />
        </motion.div>
    </>
  );
}
