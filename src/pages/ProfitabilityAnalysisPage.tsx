
import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import ProfitabilityDashboard from "@/components/analysis/ProfitabilityDashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ChartBar, Filter } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.3,
      staggerChildren: 0.2
    }
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.5 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

export default function ProfitabilityAnalysisPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === "export") {
      toast({
        title: "Exportando dados",
        description: "Seus dados estão sendo preparados para exportação.",
      });
      
      // Simula download após delay
      setTimeout(() => {
        toast({
          title: "Exportação concluída",
          description: "Os dados foram exportados com sucesso.",
        });
      }, 1500);
    }
  };

  return (
    <motion.div 
      className="flex flex-col min-h-screen"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <Header />
      
      <main className="flex-grow py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div variants={itemVariants} className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 flex items-center justify-center gap-3">
              <ChartBar className="h-8 w-8 text-brand-600" />
              Análise de Rentabilidade
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Visualize, compare e analise a rentabilidade dos seus produtos e categorias
              para tomar decisões estratégicas baseadas em dados.
            </p>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <div className="flex justify-between items-center mb-6">
                <TabsList className="bg-brand-50">
                  <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                  <TabsTrigger value="products">Por Produto</TabsTrigger>
                  <TabsTrigger value="categories">Por Categoria</TabsTrigger>
                  <TabsTrigger value="trends">Tendências</TabsTrigger>
                  <TabsTrigger value="export">Exportar</TabsTrigger>
                </TabsList>
                
                <button className="flex items-center gap-2 px-3 py-1.5 text-sm border rounded-md text-gray-600 hover:bg-gray-50">
                  <Filter className="h-4 w-4" />
                  Filtros
                </button>
              </div>
              
              <TabsContent value="overview">
                <ProfitabilityDashboard type="overview" />
              </TabsContent>
              
              <TabsContent value="products">
                <ProfitabilityDashboard type="products" />
              </TabsContent>
              
              <TabsContent value="categories">
                <ProfitabilityDashboard type="categories" />
              </TabsContent>
              
              <TabsContent value="trends">
                <ProfitabilityDashboard type="trends" />
              </TabsContent>
              
              <TabsContent value="export">
                <div className="text-center py-12">
                  <p>Seus dados estão sendo preparados para exportação...</p>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </motion.div>
  );
}
