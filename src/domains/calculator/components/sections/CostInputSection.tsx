/**
 * CostInputSection
 * 
 * Seção para custos operacionais (marketplace, frete, embalagem, marketing, outros)
 * Design limpo estilo Apple
 */

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CalculatorFormData } from "../AdvancedCalculatorPremium";
import { 
  CreditCard, 
  Package, 
  Receipt, 
  ShoppingCart, 
  TrendingUp,
  Truck
} from "lucide-react";

interface CostInputSectionProps {
  marketplaceFee: string;
  paymentFee: string;
  includePaymentFee: boolean;
  shipping: string;
  packaging: string;
  marketing: string;
  otherCosts: string;
  onInputChange: (field: keyof CalculatorFormData, value: string | boolean) => void;
}

export default function CostInputSection({
  marketplaceFee,
  paymentFee,
  includePaymentFee,
  shipping,
  packaging,
  marketing,
  otherCosts,
  onInputChange,
}: CostInputSectionProps) {
  return (
    <div className="space-y-4">
      {/* Marketplace and Payment Fees */}
      <Card className="border-l-4" style={{ borderLeftColor: '#148D8D' }}>
        <div className="p-4 sm:p-6">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md border" style={{ backgroundColor: '#148D8D15', borderColor: '#148D8D30' }}>
                <ShoppingCart className="h-4 w-4" style={{ color: '#148D8D' }} />
              </div>
              <div>
                <h3 className="text-sm font-medium text-foreground">Taxas e Comissões</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Taxas do marketplace e pagamento
                </p>
              </div>
            </div>

            {/* Marketplace Fee */}
            <div className="space-y-2">
              <Label htmlFor="marketplace-fee" className="text-sm font-medium text-foreground">
                Comissão do Marketplace (%)
              </Label>
              <Input
                id="marketplace-fee"
                type="text"
                inputMode="decimal"
                placeholder="0,00"
                value={marketplaceFee}
                onChange={(e) => onInputChange("marketplaceFee", e.target.value)}
                className="h-12 min-h-[44px] text-base border-border focus:ring-2 border-l-4 focus:ring-[#148D8D]/20"
                style={{ borderLeftColor: '#148D8D' }}
              />
            </div>

            {/* Payment Fee */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-card border-l-4" style={{ borderLeftColor: '#148D8D' }}>
                <div className="space-y-0.5">
                  <Label htmlFor="include-payment-fee" className="text-sm font-medium cursor-pointer text-foreground">
                    Taxa de pagamento incluída na comissão
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Se marcado, a taxa de pagamento já está incluída na comissão
                  </p>
                </div>
                <Switch
                  id="include-payment-fee"
                  checked={includePaymentFee}
                  onCheckedChange={(checked) => onInputChange("includePaymentFee", checked)}
                />
              </div>
              
              {!includePaymentFee && (
                <div className="space-y-2">
                  <Label htmlFor="payment-fee" className="text-sm font-medium text-foreground">
                    Taxa de Pagamento (%)
                  </Label>
                  <Input
                    id="payment-fee"
                    type="text"
                    inputMode="decimal"
                    placeholder="0,00"
                    value={paymentFee}
                    onChange={(e) => onInputChange("paymentFee", e.target.value)}
                    className="h-12 min-h-[44px] text-base border-border focus:ring-2 border-l-4 focus:ring-[#148D8D]/20"
                    style={{ borderLeftColor: '#148D8D' }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Operational Costs */}
      <Card className="border-l-4" style={{ borderLeftColor: '#895129' }}>
        <div className="p-4 sm:p-6">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md border" style={{ backgroundColor: '#89512915', borderColor: '#89512930' }}>
                <Receipt className="h-4 w-4" style={{ color: '#895129' }} />
              </div>
              <div>
                <h3 className="text-sm font-medium text-foreground">Custos Operacionais</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Frete, embalagem, marketing e outros custos
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Shipping */}
              <div className="space-y-2">
                <Label htmlFor="shipping" className="text-sm font-medium text-foreground flex items-center gap-1">
                  <Truck className="h-3 w-3" />
                  Frete (R$)
                </Label>
                <Input
                  id="shipping"
                  type="text"
                  inputMode="decimal"
                  placeholder="0,00"
                  value={shipping}
                  onChange={(e) => onInputChange("shipping", e.target.value)}
                  className="h-12 min-h-[44px] text-base border-border focus:ring-2 border-l-4 focus:ring-[#895129]/20"
                  style={{ borderLeftColor: '#895129' }}
                />
              </div>

              {/* Packaging */}
              <div className="space-y-2">
                <Label htmlFor="packaging" className="text-sm font-medium text-foreground flex items-center gap-1">
                  <Package className="h-3 w-3" />
                  Embalagem (R$)
                </Label>
                <Input
                  id="packaging"
                  type="text"
                  inputMode="decimal"
                  placeholder="0,00"
                  value={packaging}
                  onChange={(e) => onInputChange("packaging", e.target.value)}
                  className="h-12 min-h-[44px] text-base border-border focus:ring-2 border-l-4 focus:ring-[#895129]/20"
                  style={{ borderLeftColor: '#895129' }}
                />
              </div>

              {/* Marketing */}
              <div className="space-y-2">
                <Label htmlFor="marketing" className="text-sm font-medium text-foreground flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Marketing (R$)
                </Label>
                <Input
                  id="marketing"
                  type="text"
                  inputMode="decimal"
                  placeholder="0,00"
                  value={marketing}
                  onChange={(e) => onInputChange("marketing", e.target.value)}
                  className="h-12 min-h-[44px] text-base border-border focus:ring-2 border-l-4 focus:ring-[#895129]/20"
                  style={{ borderLeftColor: '#895129' }}
                />
              </div>

              {/* Other Costs */}
              <div className="space-y-2">
                <Label htmlFor="other-costs" className="text-sm font-medium text-foreground flex items-center gap-1">
                  <CreditCard className="h-3 w-3" />
                  Outros Custos (R$)
                </Label>
                <Input
                  id="other-costs"
                  type="text"
                  inputMode="decimal"
                  placeholder="0,00"
                  value={otherCosts}
                  onChange={(e) => onInputChange("otherCosts", e.target.value)}
                  className="h-12 min-h-[44px] text-base border-border focus:ring-2 border-l-4 focus:ring-[#895129]/20"
                  style={{ borderLeftColor: '#895129' }}
                />
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
