import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import MobileNavigationBar from "@/components/mobile/MobileNavigationBar";
import { LazyComponentLoader } from "@/components/performance/LazyComponentLoader";
const LazyCompetitivePricingCalculator = () => (
  <LazyComponentLoader importFunc={() => import("@/components/analysis/CompetitivePricingCalculator")} />
);

const CompetitionAnalysisPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/50 to-primary/5">
      <Header />
      
      <div className="container mx-auto px-4 pt-24 pb-20">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Análise de Competitividade
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Compare seu preço com a concorrência e descubra o melhor posicionamento no mercado.
            Analise se você está precificando de forma competitiva, premium ou econômica.
          </p>
        </motion.div>

        {/* Benefits Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="bg-white/60 backdrop-blur-sm border rounded-lg p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-blue-600 text-xl">📊</span>
            </div>
            <h3 className="font-semibold mb-2">Posicionamento Inteligente</h3>
            <p className="text-sm text-muted-foreground">
              Descubra se seu produto está posicionado como premium, competitivo ou econômico
            </p>
          </div>
          
          <div className="bg-white/60 backdrop-blur-sm border rounded-lg p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-green-600 text-xl">🎯</span>
            </div>
            <h3 className="font-semibold mb-2">Recomendações Estratégicas</h3>
            <p className="text-sm text-muted-foreground">
              Receba sugestões baseadas na análise do mercado e concorrência
            </p>
          </div>
          
          <div className="bg-white/60 backdrop-blur-sm border rounded-lg p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-purple-600 text-xl">💡</span>
            </div>
            <h3 className="font-semibold mb-2">Oportunidades de Mercado</h3>
            <p className="text-sm text-muted-foreground">
              Identifique gaps de preço e oportunidades para otimizar sua margem
            </p>
          </div>
        </motion.div>

        {/* Calculator Component */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <LazyCompetitivePricingCalculator />
        </motion.div>

        {/* How it Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12 bg-white/60 backdrop-blur-sm border rounded-lg p-8"
        >
          <h2 className="text-2xl font-bold mb-6 text-center">Como Funciona?</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold">
                1
              </div>
              <h3 className="font-semibold mb-2">Informe seu preço</h3>
              <p className="text-sm text-muted-foreground">
                Digite o preço atual do seu produto ou serviço
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold">
                2
              </div>
              <h3 className="font-semibold mb-2">Adicione concorrentes</h3>
              <p className="text-sm text-muted-foreground">
                Liste os principais concorrentes e seus preços
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold">
                3
              </div>
              <h3 className="font-semibold mb-2">Analise os resultados</h3>
              <p className="text-sm text-muted-foreground">
                Veja seu posicionamento e métricas detalhadas
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold">
                4
              </div>
              <h3 className="font-semibold mb-2">Aplique as dicas</h3>
              <p className="text-sm text-muted-foreground">
                Implemente as recomendações estratégicas
              </p>
            </div>
          </div>
        </motion.div>

        {/* Pro Features Teaser */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-200 rounded-lg p-6"
        >
          <div className="text-center">
            <h3 className="text-xl font-bold mb-3">🚀 Recursos PRO em breve!</h3>
            <p className="text-muted-foreground mb-4">
              Em desenvolvimento: Monitoramento automático de preços, alertas de mudanças, 
              integração com APIs de marketplace e análises avançadas de elasticidade de preço.
            </p>
            <div className="flex justify-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                Monitoramento automatizado
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                Alertas inteligentes
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Elasticidade de preço
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      <MobileNavigationBar />
    </div>
  );
};

export default CompetitionAnalysisPage;