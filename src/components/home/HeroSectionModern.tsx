
import React from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, BarChart3, Star, Target, TrendingUp, Trophy, Users, Zap } from "lucide-react";

const HeroSectionModern: React.FC = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02]" />
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-12">
        <div className="h-64 w-64 rounded-full bg-gradient-to-br from-brand-200/30 to-blue-200/30 blur-3xl" />
      </div>
      <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12">
        <div className="h-48 w-48 rounded-full bg-gradient-to-tr from-green-200/30 to-brand-200/30 blur-3xl" />
      </div>
      
      <div className="relative container mx-auto px-4 py-16 md:py-24">
        <motion.div 
          className="text-center max-w-5xl mx-auto"
          initial={useReducedMotion() ? undefined : { opacity: 0, y: 20 }}
          animate={useReducedMotion() ? undefined : { opacity: 1, y: 0 }}
          transition={useReducedMotion() ? undefined : { duration: 0.6 }}
        >
          {/* Badge */}
          <motion.div 
            className="flex justify-center mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200 px-4 py-2 text-sm font-medium">
              <Trophy className="h-4 w-4 mr-2 text-green-600" />
              Mais de 10.000 lojistas aumentaram seus lucros em 47%
            </Badge>
          </motion.div>
          
          {/* Main Headline */}
          <motion.h1 
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <span className="text-foreground">Pare de vender no</span>
            <br />
            <span className="bg-gradient-to-r from-brand-600 via-brand-500 to-blue-600 bg-clip-text text-transparent">
              prejuízo agora
            </span>
          </motion.h1>
          
          {/* Subtitle */}
          <motion.p 
            className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto mb-8 leading-relaxed"
            initial={useReducedMotion() ? undefined : { opacity: 0, y: 20 }}
            animate={useReducedMotion() ? undefined : { opacity: 1, y: 0 }}
            transition={useReducedMotion() ? undefined : { duration: 0.6, delay: 0.3 }}
          >
            Descubra o preço exato que <strong className="text-brand-700 dark:text-brand-400">maximiza seus lucros</strong> em 30 segundos. 
            <br className="hidden md:block" />
            Com IA avançada que considera impostos, concorrência e seu mercado automaticamente.
          </motion.p>
          
          {/* Stats Grid */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-10"
            initial={useReducedMotion() ? undefined : { opacity: 0, y: 20 }}
            animate={useReducedMotion() ? undefined : { opacity: 1, y: 0 }}
            transition={useReducedMotion() ? undefined : { duration: 0.6, delay: 0.4 }}
          >
            <div className="text-center p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20 dark:border-gray-700/20">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="h-6 w-6 text-green-600 mr-2" />
                <div className="text-3xl font-bold text-green-600">+47%</div>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Aumento médio no lucro</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20 dark:border-gray-700/20">
              <div className="flex items-center justify-center mb-2">
                <Target className="h-6 w-6 text-brand-600 mr-2" />
                <div className="text-3xl font-bold text-brand-600">30 seg</div>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Para calcular preço ideal</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20 dark:border-gray-700/20">
              <div className="flex items-center justify-center mb-2">
                <Users className="h-6 w-6 text-blue-600 mr-2" />
                <div className="text-3xl font-bold text-blue-600">10.000+</div>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Lojistas ativos</div>
            </div>
          </motion.div>
          
          {/* CTA Buttons */}
          <motion.div 
            className="flex justify-center gap-4 flex-wrap mb-8"
            initial={useReducedMotion() ? undefined : { opacity: 0, y: 20 }}
            animate={useReducedMotion() ? undefined : { opacity: 1, y: 0 }}
            transition={useReducedMotion() ? undefined : { duration: 0.6, delay: 0.5 }}
          >
            <Link to="/calculadora-rapida">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] px-8 py-6 text-lg font-bold group"
              >
                <Zap className="mr-2 h-5 w-5 group-hover:animate-pulse" />
                Calcular Agora GRÁTIS
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/planos">
              <Button 
                size="lg" 
                variant="outline"
                className="border-2 border-brand-600 text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950 px-8 py-6 text-lg font-medium group"
              >
                <BarChart3 className="mr-2 h-5 w-5" />
                Ver Planos PRO
                <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">7 dias grátis</span>
              </Button>
            </Link>
          </motion.div>
          
          {/* Trust Indicators */}
          <motion.div 
            className="flex items-center justify-center gap-6 text-muted-foreground text-sm flex-wrap"
            initial={useReducedMotion() ? undefined : { opacity: 0 }}
            animate={useReducedMotion() ? undefined : { opacity: 1 }}
            transition={useReducedMotion() ? undefined : { duration: 0.6, delay: 0.6 }}
          >
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Sem cartão de crédito</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span>Resultados em 30 segundos</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>Suporte especializado</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default HeroSectionModern;
