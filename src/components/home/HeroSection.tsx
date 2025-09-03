
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Calculator, Star, TrendingUp, Users, Zap } from "lucide-react";

const HeroSection: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [routerReady, setRouterReady] = useState(false);

  // Safely check router context
  let location = null;
  try {
    location = useLocation();
    if (!routerReady) {
      setRouterReady(true);
    }
  } catch (error) {
    console.log('Router context not ready yet');
  }

  useEffect(() => {
    setMounted(true);
  }, []);

  // Render basic version without any Link components until router is ready
  if (!mounted || !routerReady) {
    return (
      <div className="text-center mb-16">
        <div className="flex justify-center mb-4">
          <Badge className="bg-green-100 text-green-800 border-green-200 mb-4">
            <Star className="h-4 w-4 mr-1 fill-green-500 text-green-500" />
            Mais de 10.000 lojistas já aumentaram seus lucros
          </Badge>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-800 dark:text-white leading-tight">
          Pare de vender no 
          <span className="block text-brand-600">prejuízo agora</span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto mb-8 leading-relaxed">
          Descubra o preço exato que <strong>maximiza seus lucros</strong> em segundos. 
          Com IA avançada que considera impostos, concorrência e seu mercado automaticamente.
        </p>
        
        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-brand-600">+47%</div>
            <div className="text-sm text-gray-600">Aumento médio no lucro</div>
          </div>
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-brand-600">30 seg</div>
            <div className="text-sm text-gray-600">Para calcular preço ideal</div>
          </div>
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-brand-600">10.000+</div>
            <div className="text-sm text-gray-600">Lojistas ativos</div>
          </div>
        </div>
        
        <div className="flex justify-center gap-4 flex-wrap">
          <Button 
            size="lg" 
            className="bg-brand-600 hover:bg-brand-700 shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] px-8 py-6 text-lg font-bold"
            data-onboarding="calculator-button"
            disabled
          >
            Carregando... <Calculator className="ml-2 h-5 w-5" />
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            className="border-brand-600 text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950 px-8 py-6 text-lg"
            data-onboarding="pricing-button"
            disabled
          >
            Carregando...
          </Button>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="text-center mb-16"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex justify-center mb-4">
        <Badge className="bg-green-100 text-green-800 border-green-200 mb-4 px-4 py-2">
          <Star className="h-4 w-4 mr-1 fill-green-500 text-green-500" />
          Mais de 10.000 lojistas já aumentaram seus lucros
        </Badge>
      </div>
      
      <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-800 dark:text-white leading-tight">
        Pare de vender no 
        <span className="block text-brand-600">prejuízo agora</span>
      </h1>
      
      <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto mb-8 leading-relaxed">
        Descubra o preço exato que <strong>maximiza seus lucros</strong> em segundos. 
        Com IA avançada que considera impostos, concorrência e seu mercado automaticamente.
      </p>
      
      <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
        <div className="text-center">
          <div className="text-2xl md:text-3xl font-bold text-brand-600">+47%</div>
          <div className="text-sm text-gray-600">Aumento médio no lucro</div>
        </div>
        <div className="text-center">
          <div className="text-2xl md:text-3xl font-bold text-brand-600">30 seg</div>
          <div className="text-sm text-gray-600">Para calcular preço ideal</div>
        </div>
        <div className="text-center">
          <div className="text-2xl md:text-3xl font-bold text-brand-600">10.000+</div>
          <div className="text-sm text-gray-600">Lojistas ativos</div>
        </div>
      </div>
      
      <div className="flex justify-center gap-4 flex-wrap mb-6">
        <Link to="/calculadora-simples">
          <Button 
            size="lg" 
            className="bg-brand-600 hover:bg-brand-700 shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] px-8 py-6 text-lg font-bold"
            data-onboarding="calculator-button"
          >
            <Zap className="mr-2 h-5 w-5" />
            Calcular Agora GRÁTIS
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
        <Link to="/planos">
          <Button 
            size="lg" 
            variant="outline"
            className="border-brand-600 text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950 px-8 py-6 text-lg"
            data-onboarding="pricing-button"
          >
            Ver Trial PRO (7 dias grátis)
          </Button>
        </Link>
      </div>
      
      <div className="flex items-center justify-center gap-6 text-gray-500 text-sm">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span>Sem cartão de crédito</span>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          <span>Resultados em 30 segundos</span>
        </div>
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4" />
          <span>Suporte especializado</span>
        </div>
      </div>
    </motion.div>
  );
};

export default HeroSection;
