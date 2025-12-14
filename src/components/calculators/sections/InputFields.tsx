
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Calculator } from "lucide-react";

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
    <div className="space-y-8">
      {/* Seção Principal - Custo do Produto */}
      <div className="relative">
        <div className="p-6 bg-gradient-to-r from-primary/5 to-brand-500/5 rounded-xl border border-primary/10">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <span className="text-sm font-semibold text-primary">💰</span>
              </div>
              <div>
                <Label htmlFor="cost" className="text-base font-semibold text-foreground">
                  Custo do Produto
                </Label>
                <p className="text-xs text-muted-foreground">Valor base para calcular o preço</p>
              </div>
            </div>
            <Input
              id="cost"
              type="text"
              placeholder="0,00"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              className="text-xl font-bold border-0 bg-white/60 backdrop-blur-sm shadow-lg h-14 focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      </div>

      {/* Seção de Custos Adicionais */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 bg-accent/10 rounded-md flex items-center justify-center">
            <span className="text-xs font-bold text-accent">📊</span>
          </div>
          <h3 className="text-lg font-semibold text-foreground">Custos Adicionais</h3>
        </div>

        {/* Outros Custos */}
        <div className="space-y-3">
          <Label htmlFor="other-costs" className="text-sm font-medium text-foreground">
            Outros Custos (R$)
          </Label>
          <Input
            id="other-costs"
            type="text"
            placeholder="0,00"
            value={otherCosts}
            onChange={(e) => setOtherCosts(e.target.value)}
            className="h-12 border-border/50 bg-white/80 focus:bg-white transition-colors"
          />
        </div>

        {/* Frete */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/50">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
                <span className="text-sm">🚚</span>
              </div>
              <div>
                <Label htmlFor="include-shipping" className="text-sm font-medium cursor-pointer">
                  Incluir frete no custo
                </Label>
                <p className="text-xs text-muted-foreground">Adicionar valor do frete aos custos</p>
              </div>
            </div>
            <Switch
              id="include-shipping"
              checked={includeShipping}
              onCheckedChange={setIncludeShipping}
            />
          </div>
          {includeShipping && (
            <div className="ml-11 space-y-2">
              <Label className="text-sm font-medium text-foreground">Valor do Frete (R$)</Label>
              <Input
                type="text"
                placeholder="0,00"
                value={shipping}
                onChange={(e) => setShipping(e.target.value)}
                className="h-11 border-border/50 bg-white/80"
              />
            </div>
          )}
        </div>
      </div>

      {/* Seção de Impostos e Taxas */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 bg-destructive/10 rounded-md flex items-center justify-center">
            <span className="text-xs font-bold text-destructive">📋</span>
          </div>
          <h3 className="text-lg font-semibold text-foreground">Impostos e Taxas</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm">🏛️</span>
              <Label htmlFor="tax" className="text-sm font-medium text-foreground">
                Impostos (%)
              </Label>
              {onOpenImpostosModal && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onOpenImpostosModal}
                  className="h-6 w-6 p-0 ml-auto"
                  title="Calculadora de Impostos"
                >
                  <Calculator className="h-4 w-4 text-muted-foreground hover:text-primary" />
                </Button>
              )}
            </div>
            <Input
              id="tax"
              type="text"
              placeholder="0"
              value={tax}
              onChange={(e) => setTax(e.target.value)}
              className="h-12 border-border/50 bg-white/80 focus:bg-white transition-colors"
            />
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm">💳</span>
              <Label htmlFor="card-fee" className="text-sm font-medium text-foreground">
                Taxa da Maquininha (%)
              </Label>
              {onOpenMaquininhaModal && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onOpenMaquininhaModal}
                  className="h-6 w-6 p-0 ml-auto"
                  title="Calculadora de Maquininha"
                >
                  <Calculator className="h-4 w-4 text-muted-foreground hover:text-primary" />
                </Button>
              )}
            </div>
            <Input
              id="card-fee"
              type="text"
              placeholder="0"
              value={cardFee}
              onChange={(e) => setCardFee(e.target.value)}
              className="h-12 border-border/50 bg-white/80 focus:bg-white transition-colors"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
