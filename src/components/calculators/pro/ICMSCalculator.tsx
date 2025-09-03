import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Calculator, Crown, Info, MapPin } from 'lucide-react';
import { BRAZILIAN_STATES } from '@/types/marketplaceTemplates';
import { calculateICMS, calculateTotalTax, type ICMSCalculation } from '@/utils/icmsCalculator';

interface ICMSCalculatorProps {
  onTaxCalculated: (totalTax: number, breakdown: Record<string, number>) => void;
  isPremium: boolean;
  productValue?: number;
}

export default function ICMSCalculator({ onTaxCalculated, isPremium, productValue = 0 }: ICMSCalculatorProps) {
  const [originState, setOriginState] = useState('SP');
  const [destinationState, setDestinationState] = useState('RJ');
  const [icmsCalculation, setIcmsCalculation] = useState<ICMSCalculation | null>(null);
  const [useManualRates, setUseManualRates] = useState(false);
  
  // Taxas manuais
  const [manualICMS, setManualICMS] = useState(0);
  const [ipiRate, setIpiRate] = useState(0);
  const [pisRate, setPisRate] = useState(1.65);
  const [cofinsRate, setCofinsRate] = useState(7.6);
  const [issqnRate, setIssqnRate] = useState(0);
  const [simplesRate, setSimplesRate] = useState(0);
  
  // Regime tributário
  const [taxRegime, setTaxRegime] = useState('simples');

  useEffect(() => {
    if (originState && destinationState) {
      const calculation = calculateICMS(originState, destinationState);
      setIcmsCalculation(calculation);
      
      if (!useManualRates) {
        setManualICMS(calculation.rate);
      }
    }
  }, [originState, destinationState, useManualRates]);

  useEffect(() => {
    if (icmsCalculation) {
      const icmsToUse = useManualRates ? manualICMS : icmsCalculation.rate;
      
      // Ajustar outras taxas baseado no regime
      let adjustedPis = pisRate;
      let adjustedCofins = cofinsRate;
      let adjustedSimples = simplesRate;
      
      if (taxRegime === 'simples') {
        adjustedPis = 0;
        adjustedCofins = 0;
        adjustedSimples = getSimplesRate(productValue);
      }
      
      const { totalRate, breakdown } = calculateTotalTax({
        icmsRate: icmsToUse,
        ipiRate,
        pisRate: adjustedPis,
        cofinsRate: adjustedCofins,
        issqnRate,
        simplesRate: adjustedSimples
      });
      
      onTaxCalculated(totalRate, breakdown);
    }
  }, [
    icmsCalculation, useManualRates, manualICMS, ipiRate, pisRate, 
    cofinsRate, issqnRate, simplesRate, taxRegime, productValue, onTaxCalculated
  ]);

  const getSimplesRate = (value: number): number => {
    // Alíquotas do Simples Nacional (Anexo I - Comércio)
    if (value <= 180000) {return 4.0;}
    if (value <= 360000) {return 7.3;}
    if (value <= 720000) {return 9.5;}
    if (value <= 1800000) {return 10.7;}
    if (value <= 3600000) {return 14.3;}
    return 19.0;
  };

  if (!isPremium) {
    return (
      <Card className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg opacity-50" />
        <CardHeader className="relative">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-amber-600" />
            <CardTitle className="text-lg">Calculadora de Impostos</CardTitle>
            <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
              Premium
            </Badge>
          </div>
          <CardDescription>
            Cálculo automático de ICMS interestadual e outros impostos
          </CardDescription>
        </CardHeader>
        <CardContent className="relative">
          <div className="text-center py-8">
            <Calculator className="h-12 w-12 text-amber-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Funcionalidade Premium</h3>
            <p className="text-muted-foreground mb-4">
              Calcule automaticamente ICMS interestadual, IPI, PIS/COFINS e Simples Nacional
            </p>
            <Button variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50">
              Fazer Upgrade para Premium
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          <CardTitle className="text-lg">Calculadora de Impostos</CardTitle>
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
            Premium
          </Badge>
        </div>
        <CardDescription>
          Cálculo automático de impostos interestaduais e regime tributário
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Seleção de Estados */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Estado de Origem
            </Label>
            <Select value={originState} onValueChange={setOriginState}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BRAZILIAN_STATES.map((state) => (
                  <SelectItem key={state.code} value={state.code}>
                    {state.name} ({state.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Estado de Destino
            </Label>
            <Select value={destinationState} onValueChange={setDestinationState}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BRAZILIAN_STATES.map((state) => (
                  <SelectItem key={state.code} value={state.code}>
                    {state.name} ({state.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Resultado do ICMS */}
        {icmsCalculation && (
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Info className="h-4 w-4 text-blue-600" />
              <span className="font-medium">Regra Aplicada</span>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              {icmsCalculation.ruleDescription}
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-background rounded-lg">
                <div className="text-sm font-medium">ICMS {icmsCalculation.isInterstate ? 'Interestadual' : 'Interno'}</div>
                <div className="text-xl font-bold text-primary">{icmsCalculation.rate}%</div>
              </div>
              {icmsCalculation.isInterstate && (
                <div className="text-center p-3 bg-background rounded-lg">
                  <div className="text-sm font-medium">ICMS Interno (Destino)</div>
                  <div className="text-xl font-bold text-secondary">{icmsCalculation.internalRate}%</div>
                </div>
              )}
            </div>
          </div>
        )}

        <Separator />

        {/* Regime Tributário */}
        <div className="space-y-4">
          <Label className="text-base font-medium">Regime Tributário</Label>
          <Select value={taxRegime} onValueChange={setTaxRegime}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="simples">Simples Nacional</SelectItem>
              <SelectItem value="presumido">Lucro Presumido</SelectItem>
              <SelectItem value="real">Lucro Real</SelectItem>
              <SelectItem value="mei">MEI</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Edição Manual de Taxas */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium">Edição Manual de Alíquotas</Label>
            <Switch
              checked={useManualRates}
              onCheckedChange={setUseManualRates}
            />
          </div>
          
          {useManualRates && (
            <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
              <div className="space-y-2">
                <Label>ICMS (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={manualICMS}
                  onChange={(e) => setManualICMS(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label>IPI (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={ipiRate}
                  onChange={(e) => setIpiRate(parseFloat(e.target.value) || 0)}
                />
              </div>
              {taxRegime !== 'simples' && (
                <>
                  <div className="space-y-2">
                    <Label>PIS (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={pisRate}
                      onChange={(e) => setPisRate(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>COFINS (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={cofinsRate}
                      onChange={(e) => setCofinsRate(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </>
              )}
              <div className="space-y-2">
                <Label>ISSQN (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={issqnRate}
                  onChange={(e) => setIssqnRate(parseFloat(e.target.value) || 0)}
                />
              </div>
              {taxRegime === 'simples' && (
                <div className="space-y-2">
                  <Label>Simples Nacional (%)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={simplesRate}
                    onChange={(e) => setSimplesRate(parseFloat(e.target.value) || 0)}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}