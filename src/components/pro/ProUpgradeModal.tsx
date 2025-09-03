
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Crown, 
  Shield, 
  Star,
  TrendingUp,
  X,
  Zap
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface ProUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  trigger?: 'calculator' | 'export' | 'history' | 'analytics' | 'general';
  feature?: string;
}

const modalContent = {
  calculator: {
    title: "Desbloqueie Cálculos Avançados",
    subtitle: "Marketplaces, impostos e análise de concorrência",
    icon: Crown,
    color: "from-purple-600 to-blue-600"
  },
  export: {
    title: "Exporte seus Resultados",
    subtitle: "PDF, Excel e compartilhamento profissional",
    icon: TrendingUp,
    color: "from-green-600 to-blue-600"
  },
  history: {
    title: "Histórico Completo",
    subtitle: "Acesse todos os seus cálculos salvos",
    icon: Clock,
    color: "from-blue-600 to-purple-600"
  },
  analytics: {
    title: "Analytics Avançado",
    subtitle: "Métricas detalhadas e insights exclusivos",
    icon: TrendingUp,
    color: "from-orange-600 to-red-600"
  },
  general: {
    title: "Acelere seus Resultados",
    subtitle: "Recursos profissionais para seu negócio",
    icon: Zap,
    color: "from-brand-600 to-purple-600"
  }
};

const proFeatures = [
  { text: "Calculadora avançada para marketplaces", icon: CheckCircle2 },
  { text: "Análise de concorrência em tempo real", icon: Shield },
  { text: "Exportação PDF, Excel e CSV", icon: TrendingUp },
  { text: "Histórico ilimitado de cálculos", icon: Clock },
  { text: "Notificações push inteligentes", icon: Zap },
  { text: "Suporte prioritário por email", icon: Star }
];

export default function ProUpgradeModal({ 
  isOpen, 
  onClose, 
  trigger = 'general',
  feature 
}: ProUpgradeModalProps) {
  const [isClosing, setIsClosing] = useState(false);
  const content = modalContent[trigger];

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 150);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden border-0">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              {/* Header com gradiente */}
              <div className={`bg-gradient-to-r ${content.color} text-white p-8 relative overflow-hidden`}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="absolute top-4 right-4 text-white hover:bg-white/20"
                >
                  <X className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-white/20 rounded-full">
                    <content.icon className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{content.title}</h2>
                    <p className="text-white/90">{content.subtitle}</p>
                  </div>
                </div>

                {feature && (
                  <Badge className="bg-white/20 text-white border-white/30">
                    Recurso: {feature}
                  </Badge>
                )}

                {/* Elementos decorativos */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full" />
                <div className="absolute -bottom-5 -left-5 w-20 h-20 bg-white/10 rounded-full" />
              </div>

              {/* Conteúdo */}
              <div className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-xl font-semibold mb-2">
                    Desbloqueie o Poder PRO do Precifica+
                  </h3>
                  <p className="text-muted-foreground">
                    Transforme sua estratégia de preços com recursos exclusivos
                  </p>
                </div>

                {/* Features List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {proFeatures.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <feature.icon className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span className="text-sm">{feature.text}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Pricing Card */}
                <Card className="bg-gradient-to-br from-gray-50 to-white border-2 border-brand-200 mb-6">
                  <CardContent className="p-6 text-center">
                    <div className="mb-4">
                      <div className="text-3xl font-bold text-brand-600">R$ 39,90</div>
                      <div className="text-sm text-muted-foreground">por mês</div>
                    </div>
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                      <div className="text-sm font-medium text-green-700">
                        🎉 Trial Grátis de 7 dias
                      </div>
                      <div className="text-xs text-green-600">
                        Teste todos os recursos sem compromisso
                      </div>
                    </div>

                    <Link to="/planos">
                      <Button 
                        className="w-full bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]"
                        onClick={handleClose}
                      >
                        Começar Trial Gratuito
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                    
                    <p className="text-xs text-muted-foreground mt-3">
                      Cancele quando quiser • Sem taxas ocultas
                    </p>
                  </CardContent>
                </Card>

                {/* Social Proof */}
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    +1.000 lojistas já aumentaram seus lucros com o Precifica+ PRO
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
