
import { Button } from "@/components/ui/button";
import { ArrowRight, Download, RefreshCw, Save, Share2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip } from "@/components/ui/TutorialTooltip";
import { useState } from "react";

interface ActionButtonsProps {
  onCalculate: () => void;
  onReset: () => void;
  isPro: boolean;
  hasResult: boolean;
  isLoading?: boolean;
}

export default function ActionButtons({
  onCalculate,
  onReset,
  isPro,
  hasResult,
  isLoading
}: ActionButtonsProps) {
  const [clicked, setClicked] = useState(false);

  // Exemplo de feedback visual: animação enquanto calcula
  const handleCalculateClick = () => {
    setClicked(true);
    onCalculate();
    setTimeout(() => setClicked(false), 1000); // Diminui visual após cálculo
  };

  return (
    <div className="space-y-3">
      <Button 
        onClick={handleCalculateClick}
        className={`w-full bg-brand-600 hover:bg-brand-700 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 scale-105 focus-visible:ring-4 focus-visible:ring-brand-300 ring-offset-2 flex items-center justify-center gap-2 text-lg font-bold
        ${isLoading ? "opacity-60 cursor-wait animate-pulse" : ""}`}
        size="lg"
        disabled={isLoading}
        aria-label="Calcular preço de venda"
      >
        {isLoading ? (
          <>
            <span className="mr-2">Calculando...</span>
            <ArrowRight className="h-5 w-5 animate-spin" />
          </>
        ) : (
          <>
            Calcular Preço de Venda
            <ArrowRight className={`h-5 w-5 ${clicked ? 'animate-bounce' : ''}`} />
          </>
        )}
      </Button>
      
      <div className="flex gap-2">
        <Button 
          onClick={onReset}
          variant="outline"
          className="flex-1 border-brand-200 hover:bg-brand-50 transition-all focus-visible:ring-2 focus-visible:ring-brand-200"
          size="sm"
          aria-label="Limpar e começar novo cálculo"
        >
          <RefreshCw className="h-4 w-4 mr-2" /> Novo Cálculo
        </Button>
        
        {isPro && hasResult && (
          <Popover>
            <Tooltip 
              title="Opções de Exportação"
              content="Salve ou compartilhe seu cálculo"
            >
              <PopoverTrigger asChild>
                <Button 
                  variant="outline"
                  className="border-brand-200 hover:bg-brand-50 transition-all focus-visible:ring-2 focus-visible:ring-brand-200"
                  size="sm"
                  aria-label="Abrir opções de exportação"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
            </Tooltip>
            <PopoverContent className="w-52 z-40">
              <div className="space-y-2">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-sm"
                  onClick={() => alert("Funcionalidade em desenvolvimento")}
                  aria-label="Salvar cálculo"
                >
                  <Save className="h-4 w-4 mr-2" /> Salvar Cálculo
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-sm"
                  onClick={() => alert("Funcionalidade em desenvolvimento")}
                  aria-label="Exportar PDF"
                >
                  <Download className="h-4 w-4 mr-2" /> Exportar PDF
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  );
}

