import { motion } from 'framer-motion';
import { AppIcon } from '@/components/ui/app-icon';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import { BiddingCalculator } from '@/components/bidding/BiddingCalculator';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.3,
      staggerChildren: 0.2,
    },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.5 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

export default function BiddingCalculatorPage() {
  return (
    <motion.div
      className="flex flex-col min-h-screen"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <Header />

      <main className="flex-grow py-12 px-4 bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto max-w-7xl">
          <motion.div variants={itemVariants} className="text-center mb-12">
            <div className="inline-flex items-center justify-center mb-6">
              <AppIcon size={80} withShadow />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-brand-600 to-brand-700 bg-clip-text text-transparent">
              🏛️ Calculadora de Licitação
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Calcule preços competitivos para licitações públicas e privadas com análise
              completa de custos, impostos e viabilidade. Tome decisões estratégicas com
              confiança.
            </p>
          </motion.div>

          <motion.div variants={itemVariants}>
            <BiddingCalculator />
          </motion.div>
        </div>
      </main>

      <Footer />
    </motion.div>
  );
}
