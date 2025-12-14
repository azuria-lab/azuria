import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Calculator, CreditCard, DollarSign, Package, Receipt } from "lucide-react";

interface InputFieldsProps {
  readonly cost: string;
  readonly setCost: (value: string) => void;
  readonly otherCosts: string;
  readonly setOtherCosts: (value: string) => void;
  readonly shipping: string;
  readonly setShipping: (value: string) => void;
  readonly includeShipping: boolean;
  readonly setIncludeShipping: (value: boolean) => void;
  readonly tax: string;
  readonly setTax: (value: string) => void;
  readonly cardFee: string;
  readonly setCardFee: (value: string) => void;
  readonly onOpenMaquininhaModal?: () => void;
  readonly onOpenImpostosModal?: () => void;
}

export default function InputFields({
  cost,
  setCost,
  otherCosts,
  setOtherCosts,
  shipping,
  setShipping,
  includeShipping,
  setIncludeShipping,
  tax,
  setTax,
  cardFee,
  setCardFee,
  onOpenMaquininhaModal,
  onOpenImpostosModal
}: InputFieldsProps) {
  return (
    <div className="space-y-6">
      {/* Seção Principal - Custo do Produto */}
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
          onChange={(e) => setCost(e.target.value)}
          className="h-12 min-h-[44px] text-base sm:text-lg font-medium border-border focus:ring-2 border-l-4 focus:ring-[#148D8D]/20"
          style={{ borderLeftColor: '#148D8D' }}
        />
      </div>

      {/* Seção de Custos Adicionais */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md border" style={{ backgroundColor: '#89512915', borderColor: '#89512930' }}>
            <Package className="h-4 w-4" style={{ color: '#895129' }} />
          </div>
          <h3 className="text-sm font-medium text-foreground">Custos Adicionais</h3>
        </div>

        {/* Outros Custos */}
        <div className="space-y-2">
          <Label htmlFor="other-costs" className="text-sm font-medium text-foreground">
            Outros Custos
          </Label>
          <p className="text-xs text-muted-foreground">
            Embalagem, etiquetas, mão de obra e demais custos variáveis
          </p>
          <Input
            id="other-costs"
            type="text"
            inputMode="decimal"
            placeholder="0,00"
            value={otherCosts}
            onChange={(e) => setOtherCosts(e.target.value)}
            className="h-12 min-h-[44px] text-base border-border focus:ring-2 border-l-4 focus:ring-[#895129]/20"
            style={{ borderLeftColor: '#895129' }}
          />
        </div>

        {/* Frete */}
        <div className="space-y-3">
          <div 
            className="flex items-center justify-between p-4 rounded-lg border border-border bg-card border-l-4"
            style={{ borderLeftColor: '#895129' }}
          >
            <div className="space-y-0.5">
              <Label htmlFor="include-shipping" className="text-sm font-medium cursor-pointer text-foreground">
                Incluir frete no custo
              </Label>
              <p className="text-xs text-muted-foreground">
                Adicionar o valor do frete como parte dos custos do produto
              </p>
            </div>
            <Switch
              id="include-shipping"
              checked={includeShipping}
              onCheckedChange={setIncludeShipping}
            />
          </div>
          {includeShipping && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">Valor do Frete</Label>
              <Input
                type="text"
                inputMode="decimal"
                placeholder="0,00"
                value={shipping}
                onChange={(e) => setShipping(e.target.value)}
                className="h-12 min-h-[44px] text-base border-border focus:ring-2 border-l-4 focus:ring-[#895129]/20"
                style={{ borderLeftColor: '#895129' }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Seção de Impostos e Taxas */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-slate-50 border border-slate-200">
            <Receipt className="h-4 w-4 text-slate-600" />
          </div>
          <h3 className="text-sm font-medium text-foreground">Impostos e Taxas</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="tax" className="text-sm font-medium text-foreground">
                  Impostos
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Percentual de impostos sobre a venda
                </p>
              </div>
              {onOpenImpostosModal && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onOpenImpostosModal}
                  className="h-10 w-10 min-h-[44px] min-w-[44px] p-0"
                  title="Abrir calculadora de impostos"
                >
                  <Calculator className="h-4 w-4 text-slate-600 hover:text-slate-700 transition-colors" />
                </Button>
              )}
            </div>
            <Input
              id="tax"
              type="text"
              inputMode="decimal"
              placeholder="0"
              value={tax}
              onChange={(e) => setTax(e.target.value)}
              className="h-12 min-h-[44px] text-base border-border focus:ring-2 focus:ring-slate-500/20 border-l-4 border-l-slate-500"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="card-fee" className="text-sm font-medium text-foreground">
                  Taxa de Cartão
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Percentual cobrado pela maquininha
                </p>
              </div>
              {onOpenMaquininhaModal && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onOpenMaquininhaModal}
                  className="h-10 w-10 min-h-[44px] min-w-[44px] p-0"
                  title="Abrir calculadora de taxas de cartão"
                >
                  <CreditCard className="h-4 w-4 text-slate-600 hover:text-slate-700 transition-colors" />
                </Button>
              )}
            </div>
            <Input
              id="card-fee"
              type="text"
              inputMode="decimal"
              placeholder="0"
              value={cardFee}
              onChange={(e) => setCardFee(e.target.value)}
              className="h-12 min-h-[44px] text-base border-border focus:ring-2 focus:ring-slate-500/20 border-l-4 border-l-slate-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
