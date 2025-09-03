
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, PlayCircle, Star, TrendingUp, Users } from "lucide-react";

export default function HeroLandingSection() {
  return (
    <section className="bg-gradient-to-br from-brand-600 to-brand-800 text-white py-20 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge className="bg-white/20 text-white border-white/30 w-fit">
              <Star className="h-4 w-4 mr-1 fill-yellow-400 text-yellow-400" />
              Mais de 1.000 lojistas confiam
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Pare de vender no
              <span className="block text-yellow-300">prejuízo</span>
            </h1>
            
            <p className="text-xl text-brand-100 leading-relaxed">
              Descubra o preço ideal para seus produtos em segundos. 
              Considere impostos, taxas e concorrência automaticamente.
            </p>
            
            <div className="grid grid-cols-3 gap-4 py-4">
              <div className="text-center">
                <div className="text-2xl font-bold">+35%</div>
                <div className="text-sm text-brand-200">Aumento médio no lucro</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">15h</div>
                <div className="text-sm text-brand-200">Economizadas por semana</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">1.000+</div>
                <div className="text-sm text-brand-200">Lojistas ativos</div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/calculadora-simples">
                <Button 
                  size="lg" 
                  className="bg-white text-brand-700 hover:bg-brand-50 shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] px-8 py-6 text-lg"
                >
                  Começar Grátis Agora
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white/10 px-8 py-6 text-lg"
              >
                <PlayCircle className="mr-2 h-5 w-5" />
                Ver Como Funciona
              </Button>
            </div>
            
            <div className="flex items-center gap-4 text-brand-100">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span className="text-sm">Sem cartão de crédito</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm">Resultados em 5 minutos</span>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            className="relative"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="absolute -top-6 -left-6 w-72 h-72 bg-brand-500 rounded-lg opacity-20 blur-3xl"></div>
            <div className="relative bg-white rounded-xl shadow-2xl p-6 border border-white/20">
              <div className="flex justify-between mb-4 items-center">
                <h3 className="text-lg font-medium text-gray-800">Resultado Calculado</h3>
                <Badge className="bg-green-100 text-green-800">Lucrativo</Badge>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Custo do Produto</p>
                    <p className="text-lg font-medium text-gray-800">R$ 45,00</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Margem Desejada</p>
                    <p className="text-lg font-medium text-gray-800">25%</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Marketplace</p>
                    <p className="text-lg font-medium text-gray-800">Mercado Livre</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Impostos</p>
                    <p className="text-lg font-medium text-gray-800">Simples Nacional</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-brand-50 to-green-50 p-4 rounded-lg border border-brand-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-700">Preço de Venda Ideal:</span>
                  <span className="font-bold text-2xl text-brand-700">R$ 89,90</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Lucro Líquido:</span>
                  <span className="text-green-600 font-medium">R$ 22,45 (25%)</span>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 text-blue-700 text-sm">
                  <TrendingUp className="h-4 w-4" />
                  <span className="font-medium">Posição competitiva: Ótima</span>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  Seu preço está 8% abaixo da média dos concorrentes
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
