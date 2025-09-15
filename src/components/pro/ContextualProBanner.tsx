
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Star, TrendingUp, X, Zap } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import ProUpgradeModal from './ProUpgradeModal';

interface ContextualProBannerProps {
  trigger: 'calculator' | 'export' | 'history' | 'analytics' | 'general';
  feature?: string;
  onDismiss?: () => void;
  compact?: boolean;
}

const bannerConfig = {
  calculator: {
    title: "🔓 Desbloqueie Cálculos Avançados",
    description: "Marketplaces, impostos e análise de concorrência",
    icon: Crown,
    color: "from-purple-100 to-blue-100",
    borderColor: "border-purple-200"
  },
  export: {
    title: "📊 Exporte seus Resultados",
    description: "PDF profissional e compartilhamento",
    icon: TrendingUp,
    color: "from-green-100 to-blue-100",
    borderColor: "border-green-200"
  },
  history: {
    title: "📈 Histórico Completo",
    description: "Acesse todos os seus cálculos salvos",
    icon: Star,
    color: "from-blue-100 to-purple-100",
    borderColor: "border-blue-200"
  },
  analytics: {
    title: "🚀 Analytics Avançado",
    description: "Métricas e insights exclusivos",
    icon: TrendingUp,
    color: "from-orange-100 to-red-100",
    borderColor: "border-orange-200"
  },
  general: {
    title: "⚡ Acelere seus Resultados",
    description: "Recursos profissionais para seu negócio",
    icon: Zap,
    color: "from-brand-100 to-purple-100",
    borderColor: "border-brand-200"
  }
};

export default function ContextualProBanner({ 
  trigger, 
  feature, 
  onDismiss,
  compact = false 
}: ContextualProBannerProps) {
  const [showModal, setShowModal] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const config = bannerConfig[trigger];

  const handleDismiss = () => {
    setIsDismissed(true);
    if (onDismiss) {
      setTimeout(onDismiss, 300);
    }
  };

  if (isDismissed) {return null;}

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className={`${config.borderColor} bg-gradient-to-r ${config.color} border-2 shadow-md hover:shadow-lg transition-all`}>
            <CardContent className={`${compact ? 'p-3' : 'p-4'} relative`}>
              {onDismiss && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismiss}
                  className="absolute top-2 right-2 h-6 w-6 p-0 hover:bg-white/20"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}

              <div className={`flex items-center gap-3 ${compact ? 'pr-8' : 'pr-12'}`}>
                <div className="p-2 bg-white/70 rounded-lg">
                  <config.icon className="h-5 w-5 text-brand-600" />
                </div>
                
                <div className="flex-1">
                  <h4 className={`font-semibold text-gray-800 ${compact ? 'text-sm' : 'text-base'}`}>
                    {config.title}
                  </h4>
                  <p className={`text-gray-600 ${compact ? 'text-xs' : 'text-sm'}`}>
                    {config.description}
                  </p>
                  {feature && (
                    <Badge variant="outline" className="mt-1 text-xs">
                      {feature}
                    </Badge>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <Button
                    size={compact ? "sm" : "default"}
                    onClick={() => setShowModal(true)}
                    className="bg-brand-600 hover:bg-brand-700 text-white shadow-md hover:shadow-lg transition-all transform hover:scale-[1.02]"
                  >
                    {compact ? "Upgrade" : "Ver PRO"}
                  </Button>
                  
                  {!compact && (
                    <div className="text-center">
                      <Badge className="bg-green-600 text-white text-xs">
                        7 dias grátis
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              {!compact && (
                <div className="mt-3 pt-3 border-t border-white/30">
                  <div className="flex items-center justify-center gap-1 text-xs text-gray-600">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span>+1.000 usuários já aumentaram lucros</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      <ProUpgradeModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        trigger={trigger}
        feature={feature}
      />
    </>
  );
}
