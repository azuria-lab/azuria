import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useBiddingCalculator } from '@/hooks/useBiddingCalculator';
import {
  BiddingMode,
  BiddingTaxRegime,
  BiddingType,
  GuaranteeType,
} from '@/types/bidding';
import {
  AlertCircle,
  Calculator,
  CheckCircle2,
  Info,
  Lightbulb,
  Save,
  TrendingUp,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  formatCurrency,
  getViabilityColor,
  getViabilityLabel,
} from '@/services/bidding/biddingCalculations';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function BiddingCalculator() {
  const {
    bidding,
    result,
    updateData,
    addItem,
    updateItem,
    updateTaxConfig,
    updateStrategy,
    updateGuarantee,
    calculate,
    save,
    isValid,
    errors,
  } = useBiddingCalculator();

  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    calculate();
    setShowResults(true);
  };

  const handleSave = async () => {
    await save();
    // Sucesso será tratado por toast notification no futuro
  };

  // Helper para obter cor de viabilidade
  const getViabilityColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      red: 'bg-red-500',
      orange: 'bg-orange-500',
      yellow: 'bg-yellow-500',
      green: 'bg-green-500',
      emerald: 'bg-emerald-500',
    };
    return colorMap[color] || 'bg-gray-500';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Coluna Esquerda - Formulário */}
      <div className="lg:col-span-2 space-y-6">
        {/* Dados da Licitação */}
        <motion.div variants={cardVariants} initial="hidden" animate="visible">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Dados da Licitação
              </CardTitle>
              <CardDescription>
                Informações básicas sobre o edital e a licitação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editalNumber">Número do Edital *</Label>
                  <Input
                    id="editalNumber"
                    placeholder="Ex: 001/2025"
                    value={bidding.data?.editalNumber || ''}
                    onChange={(e) => updateData({ editalNumber: e.target.value })}
                  />
                  {errors.editalNumber && (
                    <p className="text-sm text-red-500">{errors.editalNumber}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="organ">Órgão/Empresa *</Label>
                  <Input
                    id="organ"
                    placeholder="Ex: Prefeitura Municipal"
                    value={bidding.data?.organ || ''}
                    onChange={(e) => updateData({ organ: e.target.value })}
                  />
                  {errors.organ && <p className="text-sm text-red-500">{errors.organ}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Tipo de Licitação</Label>
                  <Select
                    value={bidding.data?.type}
                    onValueChange={(value) => updateData({ type: value as BiddingType })}
                  >
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={BiddingType.PREGAO_ELETRONICO}>
                        Pregão Eletrônico
                      </SelectItem>
                      <SelectItem value={BiddingType.PREGAO_PRESENCIAL}>
                        Pregão Presencial
                      </SelectItem>
                      <SelectItem value={BiddingType.CONCORRENCIA}>Concorrência</SelectItem>
                      <SelectItem value={BiddingType.TOMADA_PRECOS}>
                        Tomada de Preços
                      </SelectItem>
                      <SelectItem value={BiddingType.LICITACAO_PRIVADA}>
                        Licitação Privada
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mode">Modalidade</Label>
                  <Select
                    value={bidding.data?.mode}
                    onValueChange={(value) => updateData({ mode: value as BiddingMode })}
                  >
                    <SelectTrigger id="mode">
                      <SelectValue placeholder="Selecione a modalidade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={BiddingMode.MENOR_PRECO}>Menor Preço</SelectItem>
                      <SelectItem value={BiddingMode.MAIOR_DESCONTO}>
                        Maior Desconto
                      </SelectItem>
                      <SelectItem value={BiddingMode.MELHOR_TECNICA}>
                        Melhor Técnica
                      </SelectItem>
                      <SelectItem value={BiddingMode.TECNICA_E_PRECO}>
                        Técnica e Preço
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Item/Produto */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Item/Produto</CardTitle>
              <CardDescription>
                Custos e informações do item a ser licitado
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Descrição do Item *</Label>
                <Input
                  id="description"
                  placeholder="Ex: Fornecimento de materiais de escritório"
                  value={bidding.items?.[0]?.description || ''}
                  onChange={(e) => {
                    if (bidding.items && bidding.items.length > 0) {
                      updateItem(0, { description: e.target.value });
                    } else {
                      addItem({
                        itemNumber: 1,
                        description: e.target.value,
                        quantity: 1,
                        unit: 'UN',
                        unitCost: 0,
                      });
                    }
                  }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantidade *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    placeholder="1"
                    value={bidding.items?.[0]?.quantity || ''}
                    onChange={(e) => {
                      if (bidding.items && bidding.items.length > 0) {
                        updateItem(0, { quantity: Number(e.target.value) });
                      } else {
                        addItem({
                          itemNumber: 1,
                          description: '',
                          quantity: Number(e.target.value),
                          unit: 'UN',
                          unitCost: 0,
                        });
                      }
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit">Unidade</Label>
                  <Input
                    id="unit"
                    placeholder="UN"
                    value={bidding.items?.[0]?.unit || 'UN'}
                    onChange={(e) => {
                      if (bidding.items && bidding.items.length > 0) {
                        updateItem(0, { unit: e.target.value });
                      }
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unitCost">Custo Unitário (R$) *</Label>
                  <Input
                    id="unitCost"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={bidding.items?.[0]?.unitCost || ''}
                    onChange={(e) => {
                      if (bidding.items && bidding.items.length > 0) {
                        updateItem(0, { unitCost: Number(e.target.value) });
                      } else {
                        addItem({
                          itemNumber: 1,
                          description: '',
                          quantity: 1,
                          unit: 'UN',
                          unitCost: Number(e.target.value),
                        });
                      }
                    }}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium text-sm">Custos Adicionais (Opcional)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="logisticsCost">Logística (R$)</Label>
                    <Input
                      id="logisticsCost"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={bidding.items?.[0]?.logisticsCost || ''}
                      onChange={(e) =>
                        updateItem(0, { logisticsCost: Number(e.target.value) })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="transportCost">Transporte (R$)</Label>
                    <Input
                      id="transportCost"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={bidding.items?.[0]?.transportCost || ''}
                      onChange={(e) =>
                        updateItem(0, { transportCost: Number(e.target.value) })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="installationCost">Instalação (R$)</Label>
                    <Input
                      id="installationCost"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={bidding.items?.[0]?.installationCost || ''}
                      onChange={(e) =>
                        updateItem(0, { installationCost: Number(e.target.value) })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="otherCosts">Outros Custos (R$)</Label>
                    <Input
                      id="otherCosts"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={bidding.items?.[0]?.otherCosts || ''}
                      onChange={(e) =>
                        updateItem(0, { otherCosts: Number(e.target.value) })
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Impostos */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Impostos e Encargos</CardTitle>
              <CardDescription>Configuração tributária da sua empresa</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="regime">Regime Tributário</Label>
                <Select
                  value={bidding.taxConfig?.regime}
                  onValueChange={(value) =>
                    updateTaxConfig({ regime: value as BiddingTaxRegime })
                  }
                >
                  <SelectTrigger id="regime">
                    <SelectValue placeholder="Selecione o regime" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={BiddingTaxRegime.SIMPLES_NACIONAL}>
                      Simples Nacional
                    </SelectItem>
                    <SelectItem value={BiddingTaxRegime.LUCRO_PRESUMIDO}>
                      Lucro Presumido
                    </SelectItem>
                    <SelectItem value={BiddingTaxRegime.LUCRO_REAL}>Lucro Real</SelectItem>
                    <SelectItem value={BiddingTaxRegime.MEI}>MEI</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {bidding.taxConfig?.regime === BiddingTaxRegime.SIMPLES_NACIONAL && (
                <div className="space-y-2">
                  <Label htmlFor="simplesRate">Alíquota Simples Nacional (%)</Label>
                  <Input
                    id="simplesRate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    placeholder="6.00"
                    value={bidding.taxConfig?.simplesRate || ''}
                    onChange={(e) =>
                      updateTaxConfig({ simplesRate: Number(e.target.value) })
                    }
                  />
                </div>
              )}

              {(bidding.taxConfig?.regime === BiddingTaxRegime.LUCRO_PRESUMIDO ||
                bidding.taxConfig?.regime === BiddingTaxRegime.LUCRO_REAL) && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pis">PIS (%)</Label>
                    <Input
                      id="pis"
                      type="number"
                      min="0"
                      step="0.01"
                      value={bidding.taxConfig?.pis || ''}
                      onChange={(e) => updateTaxConfig({ pis: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cofins">COFINS (%)</Label>
                    <Input
                      id="cofins"
                      type="number"
                      min="0"
                      step="0.01"
                      value={bidding.taxConfig?.cofins || ''}
                      onChange={(e) => updateTaxConfig({ cofins: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="icms">ICMS (%)</Label>
                    <Input
                      id="icms"
                      type="number"
                      min="0"
                      step="0.01"
                      value={bidding.taxConfig?.icms || ''}
                      onChange={(e) => updateTaxConfig({ icms: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="irpj">IRPJ (%)</Label>
                    <Input
                      id="irpj"
                      type="number"
                      min="0"
                      step="0.01"
                      value={bidding.taxConfig?.irpj || ''}
                      onChange={(e) => updateTaxConfig({ irpj: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="csll">CSLL (%)</Label>
                    <Input
                      id="csll"
                      type="number"
                      min="0"
                      step="0.01"
                      value={bidding.taxConfig?.csll || ''}
                      onChange={(e) => updateTaxConfig({ csll: Number(e.target.value) })}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Estratégia de Lance */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Estratégia de Lance</CardTitle>
              <CardDescription>
                Defina sua margem de lucro e limites de negociação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="desiredMargin">Margem de Lucro Desejada</Label>
                  <span className="text-2xl font-bold text-primary">
                    {bidding.strategy?.desiredMargin || 0}%
                  </span>
                </div>
                <Slider
                  id="desiredMargin"
                  min={0}
                  max={50}
                  step={1}
                  value={[bidding.strategy?.desiredMargin || 10]}
                  onValueChange={(value) => updateStrategy({ desiredMargin: value[0] })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0%</span>
                  <span>25%</span>
                  <span>50%</span>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minimumMargin">Margem Mínima (%)</Label>
                  <Input
                    id="minimumMargin"
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    placeholder="5"
                    value={bidding.strategy?.minimumMargin || ''}
                    onChange={(e) =>
                      updateStrategy({ minimumMargin: Number(e.target.value) })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Margem mínima aceitável para viabilidade
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maximumDiscount">Desconto Máximo (%)</Label>
                  <Input
                    id="maximumDiscount"
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    placeholder="15"
                    value={bidding.strategy?.maximumDiscount || ''}
                    onChange={(e) =>
                      updateStrategy({ maximumDiscount: Number(e.target.value) })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Máximo de desconto que pode dar durante disputa
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="guaranteeType">Garantia</Label>
                <Select
                  value={bidding.guarantee?.type}
                  onValueChange={(value) =>
                    updateGuarantee({ type: value as GuaranteeType })
                  }
                >
                  <SelectTrigger id="guaranteeType">
                    <SelectValue placeholder="Selecione o tipo de garantia" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={GuaranteeType.NENHUMA}>Nenhuma</SelectItem>
                    <SelectItem value={GuaranteeType.SEGURO_GARANTIA}>
                      Seguro Garantia
                    </SelectItem>
                    <SelectItem value={GuaranteeType.CAUCAO_DINHEIRO}>
                      Caução em Dinheiro
                    </SelectItem>
                    <SelectItem value={GuaranteeType.FIANCA_BANCARIA}>
                      Fiança Bancária
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {bidding.guarantee?.type !== GuaranteeType.NENHUMA && (
                <div className="space-y-2">
                  <Label htmlFor="guaranteePercentage">Percentual da Garantia (%)</Label>
                  <Input
                    id="guaranteePercentage"
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    placeholder="5"
                    value={bidding.guarantee?.percentage || ''}
                    onChange={(e) =>
                      updateGuarantee({ percentage: Number(e.target.value) })
                    }
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Botões de Ação */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.4 }}
        >
          <div className="flex gap-4">
            <Button
              onClick={handleCalculate}
              disabled={!isValid}
              className="flex-1"
              size="lg"
            >
              <Calculator className="mr-2 h-5 w-5" />
              Calcular Licitação
            </Button>
            <Button
              onClick={handleSave}
              disabled={!result}
              variant="outline"
              size="lg"
            >
              <Save className="mr-2 h-5 w-5" />
              Salvar
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Coluna Direita - Resultados */}
      <div className="lg:col-span-1">
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.5 }}
          className="sticky top-4"
        >
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Resultado da Análise
              </CardTitle>
              <CardDescription>Cálculos e viabilidade do lance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!showResults || !result ? (
                <div className="text-center py-12">
                  <Info className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Preencha os dados e clique em "Calcular Licitação" para ver os resultados
                  </p>
                </div>
              ) : (
                <>
                  {/* Lance Sugerido */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-lg p-6 border-2 border-green-200 dark:border-green-800">
                    <div className="text-sm text-muted-foreground mb-2">
                      Lance Sugerido
                    </div>
                    <div className="text-4xl font-bold text-green-700 dark:text-green-400">
                      {formatCurrency(result.suggestedPrice)}
                    </div>
                  </div>

                  {/* Viabilidade */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Viabilidade</span>
                      <Badge
                        className={`${getViabilityColorClass(
                          getViabilityColor(result.viability)
                        )} text-white`}
                      >
                        {getViabilityLabel(result.viability)}
                      </Badge>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getViabilityColorClass(
                          getViabilityColor(result.viability)
                        )}`}
                        style={{ width: `${result.viabilityScore}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Score: {result.viabilityScore}/100
                    </p>
                  </div>

                  <Separator />

                  {/* Métricas */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Custo Total</span>
                      <span className="font-semibold">
                        {formatCurrency(result.totalCost)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total de Impostos</span>
                      <span className="font-semibold text-orange-600">
                        {formatCurrency(result.totalTaxes)}
                      </span>
                    </div>

                    {result.totalGuarantee > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Garantia</span>
                        <span className="font-semibold">
                          {formatCurrency(result.totalGuarantee)}
                        </span>
                      </div>
                    )}

                    <Separator />

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Lucro Líquido</span>
                      <span className="font-bold text-green-600">
                        {formatCurrency(result.netProfit)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Margem de Lucro</span>
                      <span className="font-bold text-blue-600">
                        {result.profitMargin.toFixed(2)}%
                      </span>
                    </div>

                    <Separator />

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Preço Mínimo</span>
                      <span className="font-semibold">
                        {formatCurrency(result.minimumPrice)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Ponto de Equilíbrio</span>
                      <span className="font-semibold">
                        {formatCurrency(result.breakEvenPrice)}
                      </span>
                    </div>
                  </div>

                  {/* Avisos */}
                  {result.warnings.length > 0 && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-red-500" />
                          Avisos
                        </h4>
                        {result.warnings.map((warning, index) => (
                          <Alert key={`warning-${index}-${warning.slice(0, 20)}`} variant="destructive">
                            <AlertDescription className="text-xs">
                              {warning}
                            </AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Sugestões */}
                  {result.suggestions.length > 0 && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm flex items-center gap-2">
                          <Lightbulb className="h-4 w-4 text-yellow-500" />
                          Sugestões
                        </h4>
                        {result.suggestions.map((suggestion, index) => (
                          <Alert key={`suggestion-${index}-${suggestion.slice(0, 20)}`}>
                            <AlertDescription className="text-xs">
                              {suggestion}
                            </AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Riscos */}
                  {result.risks.length > 0 && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-blue-500" />
                          Análise de Riscos
                        </h4>
                        {result.risks.map((risk, index) => (
                          <Alert key={`risk-${index}-${risk.slice(0, 20)}`}>
                            <AlertDescription className="text-xs">{risk}</AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
