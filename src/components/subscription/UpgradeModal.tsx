/**
 * Modal de upgrade para usuários FREE que atingiram o limite
 */

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatPrice } from '@/config/plans';

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentLimit: number;
  used: number;
}

export function UpgradeModal({ open, onOpenChange, currentLimit, used }: UpgradeModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-semibold text-foreground">
            Limite diário atingido
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base text-muted-foreground pt-2">
            Você atingiu o limite de {currentLimit} cálculos diários no modo gratuito.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">
                  Assine o Plano Iniciante para uso ilimitado
                </h3>
                <p className="text-sm text-muted-foreground">
                  Ideal para quem calcula preços todos os dias
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-primary" />
              <span className="text-foreground">Calculadora Rápida ilimitada</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-primary" />
              <span className="text-foreground">Templates completos</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-primary" />
              <span className="text-foreground">Histórico ilimitado</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-primary" />
              <span className="text-foreground">Exportação em PDF</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-primary" />
              <span className="text-foreground">Presets salvos</span>
            </div>
          </div>

          <div className="pt-2 border-t border-border">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">
                {formatPrice(25)}<span className="text-base font-normal text-muted-foreground">/mês</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                7 dias de teste grátis
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto h-12 min-h-[44px]"
          >
            Continuar no modo gratuito
          </Button>
          <Link to="/planos" className="w-full sm:w-auto" onClick={() => onOpenChange(false)}>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                className="w-full sm:w-auto h-12 min-h-[44px] bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Liberar uso ilimitado
              </Button>
            </motion.div>
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

