/**
 * BreakdownSection
 * 
 * Seção para detalhamento completo de custos
 * Design limpo estilo Apple
 */

import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Receipt } from "lucide-react";

interface BreakdownSectionProps {
  breakdown: {
    cost: number;
    shipping: number;
    packaging: number;
    marketing: number;
    otherCosts: number;
    marketplaceFee: number;
    paymentFee: number;
  };
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export default function BreakdownSection({ breakdown }: BreakdownSectionProps) {
  const totalCosts = breakdown.cost + breakdown.shipping + breakdown.packaging + breakdown.marketing + breakdown.otherCosts;
  const totalFees = breakdown.marketplaceFee + breakdown.paymentFee;
  const total = totalCosts + totalFees;

  const items = [
    { label: 'Custo do Produto', value: breakdown.cost, show: breakdown.cost > 0 },
    { label: 'Frete', value: breakdown.shipping, show: breakdown.shipping > 0 },
    { label: 'Embalagem', value: breakdown.packaging, show: breakdown.packaging > 0 },
    { label: 'Marketing', value: breakdown.marketing, show: breakdown.marketing > 0 },
    { label: 'Outros Custos', value: breakdown.otherCosts, show: breakdown.otherCosts > 0 },
  ].filter(item => item.show);

  const fees = [
    { label: 'Comissão do Marketplace', value: breakdown.marketplaceFee, show: breakdown.marketplaceFee > 0 },
    { label: 'Taxa de Pagamento', value: breakdown.paymentFee, show: breakdown.paymentFee > 0 },
  ].filter(item => item.show);

  return (
    <Card className="border-l-4" style={{ borderLeftColor: '#895129' }}>
      <div className="p-4 sm:p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md border" style={{ backgroundColor: '#89512915', borderColor: '#89512930' }}>
              <Receipt className="h-4 w-4" style={{ color: '#895129' }} />
            </div>
            <div>
              <h3 className="text-sm font-medium text-foreground">Detalhamento de Custos</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Breakdown completo dos custos e taxas
              </p>
            </div>
          </div>

          {/* Cost Items */}
          {items.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Custos Operacionais
              </h4>
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-2">
                    <span className="text-sm text-foreground">{item.label}</span>
                    <span className="text-sm font-medium text-foreground">
                      {formatCurrency(item.value)}
                    </span>
                  </div>
                ))}
                <Separator />
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm font-medium text-foreground">Subtotal Custos</span>
                  <span className="text-sm font-semibold text-foreground">
                    {formatCurrency(totalCosts)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Fee Items */}
          {fees.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Taxas e Comissões
              </h4>
              <div className="space-y-2">
                {fees.map((fee, index) => (
                  <div key={index} className="flex items-center justify-between py-2">
                    <span className="text-sm text-foreground">{fee.label}</span>
                    <span className="text-sm font-medium text-foreground">
                      {formatCurrency(fee.value)}
                    </span>
                  </div>
                ))}
                <Separator />
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm font-medium text-foreground">Subtotal Taxas</span>
                  <span className="text-sm font-semibold text-foreground">
                    {formatCurrency(totalFees)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Total */}
          <div className="pt-3 border-t-2 border-border">
            <div className="flex items-center justify-between py-2">
              <span className="text-base font-semibold text-foreground">Total de Custos</span>
              <span className="text-base font-bold text-foreground">
                {formatCurrency(total)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
