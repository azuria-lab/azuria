
// Corrigido o conteúdo do banner de recursos bloqueados para deixar só "Histórico de cálculos" e "Exportação em PDF e compartilhamento".

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Lock } from "lucide-react";

interface ProPlanBannerProps {
  isPro: boolean;
}

export default function ProPlanBanner({ isPro }: ProPlanBannerProps) {
  if (isPro) {return null;}
  
  return (
    <div className="mt-6 pt-6 border-t border-gray-200">
      <div className="bg-brand-50 border border-brand-100 rounded-lg p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-2 text-brand-700">
          <Lock className="h-4 w-4" />
          <h3 className="font-semibold">Recursos bloqueados na versão gratuita</h3>
        </div>
        
        <p className="text-sm text-gray-600 mb-4">
          Desbloqueie recursos avançados de precificação para seu negócio:
        </p>
        
        <ul className="text-sm text-gray-600 mb-4 space-y-1">
          <li className="flex items-start gap-2">
            <span className="text-brand-500">✓</span>
            <span>Histórico de cálculos</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-brand-500">✓</span>
            <span>Exportação em PDF e compartilhamento</span>
          </li>
        </ul>
        
        <div className="flex justify-end">
          <Link to="/planos">
            <Button 
              className="bg-brand-600 hover:bg-brand-700 transition-all transform hover:scale-[1.02]"
            >
              Assinar PRO <ArrowUpRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
