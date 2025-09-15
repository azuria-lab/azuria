
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Download, RefreshCw, Save, Share2, TrendingUp, Zap } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState } from "react";
import { motion } from "framer-motion";

interface ImprovedActionButtonsProps {
  onCalculate: () => void;
  onReset: () => void;
  isPro: boolean;
  hasResult: boolean;
  isLoading?: boolean;
}

export default function ImprovedActionButtons({
  onCalculate,
  onReset,
  isPro,
  hasResult,
  isLoading
}: ImprovedActionButtonsProps) {
  const [isCalculating, setIsCalculating] = useState(false);

  const handleCalculateClick = () => {
    setIsCalculating(true);
    onCalculate();
    setTimeout(() => setIsCalculating(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Botão Principal Melhorado */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button 
          onClick={handleCalculateClick}
          className={`w-full h-16 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 shadow-xl hover:shadow-2xl transition-all duration-300 text-white font-bold text-lg relative overflow-hidden
          ${isLoading || isCalculating ? "opacity-80 cursor-wait" : ""}`}
          disabled={isLoading || isCalculating}
          aria-label="Calcular preço de venda otimizado"
        >
          {isLoading || isCalculating ? (
            <div className="flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="mr-3"
              >
                <Zap className="h-6 w-6" />
              </motion.div>
              <span>Calculando com IA...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <TrendingUp className="h-6 w-6 mr-3" />
              <span>Descobrir Preço Ideal</span>
              <ArrowRight className="h-6 w-6 ml-3" />
            </div>
          )}
          
          {/* Efeito de brilho animado */}
          {!isLoading && !isCalculating && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            />
          )}
        </Button>
      </motion.div>

      {/* Benefícios do Cálculo */}
      <div className="flex justify-center gap-2 flex-wrap">
        <Badge variant="secondary" className="bg-green-100 text-green-700">
          <TrendingUp className="h-3 w-3 mr-1" />
          +47% lucro médio
        </Badge>
        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
          <Zap className="h-3 w-3 mr-1" />
          Resultado em 30s
        </Badge>
        {isPro && (
          <Badge variant="secondary" className="bg-purple-100 text-purple-700">
            IA Avançada
          </Badge>
        )}
      </div>
      
      {/* Botões Secundários */}
      <div className="flex gap-3">
        <Button 
          onClick={onReset}
          variant="outline"
          className="flex-1 border-brand-200 hover:bg-brand-50 transition-all focus-visible:ring-2 focus-visible:ring-brand-200 h-12"
          aria-label="Limpar campos e começar novo cálculo"
        >
          <RefreshCw className="h-4 w-4 mr-2" /> 
          Novo Cálculo
        </Button>
        
        {isPro && hasResult && (
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline"
                className="border-brand-200 hover:bg-brand-50 transition-all focus-visible:ring-2 focus-visible:ring-brand-200 h-12 px-4"
                aria-label="Abrir opções de exportação e compartilhamento"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 z-40 bg-white dark:bg-gray-800 border shadow-lg">
              <div className="space-y-2">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => alert("Funcionalidade em desenvolvimento")}
                  aria-label="Salvar cálculo no histórico"
                >
                  <Save className="h-4 w-4 mr-2" /> Salvar no Histórico
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => alert("Funcionalidade em desenvolvimento")}
                  aria-label="Exportar relatório em PDF"
                >
                  <Download className="h-4 w-4 mr-2" /> Exportar PDF
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => alert("Funcionalidade em desenvolvimento")}
                  aria-label="Compartilhar cálculo"
                >
                  <Share2 className="h-4 w-4 mr-2" /> Compartilhar
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>

      {/* Indicador de Confiança */}
      <div className="text-center">
        <p className="text-xs text-gray-500">
          🔒 Cálculo seguro e privado • ⚡ Tecnologia IA avançada • 📈 Resultados comprovados
        </p>
      </div>
    </div>
  );
}
