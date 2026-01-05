/**
 * ProductInputSection
 * 
 * Seção para informações do produto (nome e custo)
 * Design limpo estilo Apple
 */

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign, Tag } from "lucide-react";

interface ProductInputSectionProps {
  productName: string;
  cost: string;
  onProductNameChange: (value: string) => void;
  onCostChange: (value: string) => void;
}

export default function ProductInputSection({
  productName,
  cost,
  onProductNameChange,
  onCostChange,
}: ProductInputSectionProps) {
  return (
    <div className="space-y-4">
      {/* Product Name */}
      <Card className="border-l-4" style={{ borderLeftColor: '#895129' }}>
        <div className="p-4 sm:p-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md border" style={{ backgroundColor: '#89512915', borderColor: '#89512930' }}>
                <Tag className="h-4 w-4" style={{ color: '#895129' }} />
              </div>
              <div>
                <Label htmlFor="product-name" className="text-sm font-medium text-foreground">
                  Nome do Produto (opcional)
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Identifique o produto para facilitar o histórico
                </p>
              </div>
            </div>
            <Input
              id="product-name"
              type="text"
              placeholder="Ex: Tênis Nike Air Max..."
              value={productName}
              onChange={(e) => onProductNameChange(e.target.value)}
              className="h-12 min-h-[44px] text-base border-border focus:ring-2 border-l-4 focus:ring-[#895129]/20"
              style={{ borderLeftColor: '#895129' }}
            />
          </div>
        </div>
      </Card>

      {/* Product Cost */}
      <Card className="border-l-4" style={{ borderLeftColor: '#148D8D' }}>
        <div className="p-4 sm:p-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md border" style={{ backgroundColor: '#148D8D15', borderColor: '#148D8D30' }}>
                <DollarSign className="h-4 w-4" style={{ color: '#148D8D' }} />
              </div>
              <div>
                <Label htmlFor="cost" className="text-sm font-medium text-foreground">
                  Custo do Produto
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Valor de aquisição ou produção do item
                </p>
              </div>
            </div>
            <Input
              id="cost"
              type="text"
              inputMode="decimal"
              placeholder="0,00"
              value={cost}
              onChange={(e) => onCostChange(e.target.value)}
              className="h-12 min-h-[44px] text-base sm:text-lg font-medium border-border focus:ring-2 border-l-4 focus:ring-[#148D8D]/20"
              style={{ borderLeftColor: '#148D8D' }}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
