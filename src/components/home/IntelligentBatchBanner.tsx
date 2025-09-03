
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Brain, Package2, TrendingUp, Zap } from "lucide-react";

export default function IntelligentBatchBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="my-12"
    >
      <Card className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 border-purple-200">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-blue-600/5" />
        
        <div className="relative p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <Package2 className="h-6 w-6 text-brand-600" />
              <Brain className="h-6 w-6 text-purple-600" />
            </div>
            <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
              Novidade
            </Badge>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Calculadora em Lote + IA
              </h3>
              
              <p className="text-foreground mb-6 text-lg">
                Revolucione sua estratégia de precificação com nossa nova ferramenta que combina 
                cálculos em lote, inteligência artificial e análise competitiva em tempo real.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <Brain className="h-4 w-4 text-purple-600" />
                  <span>Sugestões de IA</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span>Análise Competitiva</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Package2 className="h-4 w-4 text-blue-600" />
                  <span>Múltiplos Lotes</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="h-4 w-4 text-yellow-600" />
                  <span>Cenários Inteligentes</span>
                </div>
              </div>

              <Link to="/calculadora-lotes-inteligente">
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  Experimentar Agora
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>

            <div className="relative">
              <div className="bg-white rounded-lg shadow-lg p-6 border">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Lote 1 (50 unidades)</span>
                    <Badge className="bg-purple-100 text-purple-700">IA: R$ 85,90</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Lote 2 (100 unidades)</span>
                    <Badge className="bg-green-100 text-green-700">Competitivo</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Lote 3 (200 unidades)</span>
                    <Badge className="bg-blue-100 text-blue-700">Otimizado</Badge>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between text-sm font-medium">
                      <span>Receita Total:</span>
                      <span className="text-green-600">R$ 28.450,00</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="absolute -top-2 -right-2">
                <div className="p-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-lg">
                  <Zap className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
