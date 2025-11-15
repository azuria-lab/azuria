import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Building2,
  Calculator,
  CheckCircle2,
  ChevronRight,
  DollarSign,
  Info,
  TrendingUp,
} from 'lucide-react';
import { BUSINESS_TYPES } from '@/data/taxRegimes';
import { TaxCalculationResult, useTaxCalculator } from '@/hooks/useTaxCalculator';
import { cn } from '@/lib/utils';

export default function TaxCalculator() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [businessType, setBusinessType] = useState('');
  const [monthlyRevenue, setMonthlyRevenue] = useState('');
  const [annualRevenue, setAnnualRevenue] = useState('');
  const [monthlyRevenueDisplay, setMonthlyRevenueDisplay] = useState('');
  const [annualRevenueDisplay, setAnnualRevenueDisplay] = useState('');
  const [results, setResults] = useState<TaxCalculationResult[]>([]);

  const { calculateAllRegimes, isCalculating } = useTaxCalculator();

  // Formata valor para exibição (50000 → 50.000,00)
  const formatCurrency = (value: string): string => {
    // Remove tudo que não é número
    const numbers = value.split('').filter(c => /\d/.test(c)).join('');
    
    if (!numbers) {
      return '';
    }

    // Converte para número e formata
    const amount = Number.parseFloat(numbers) / 100;
    return amount.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Remove formatação para cálculo (50.000,00 → 50000)
  const unformatCurrency = (value: string): string => {
    return value.split('').filter(c => /\d/.test(c)).join('');
  };

  // Handler para faturamento mensal
  const handleMonthlyRevenueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const unformatted = unformatCurrency(inputValue);
    const formatted = formatCurrency(unformatted);
    
    setMonthlyRevenueDisplay(formatted);
    setMonthlyRevenue((Number.parseFloat(unformatted) / 100).toString());
  };

  // Handler para faturamento anual
  const handleAnnualRevenueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const unformatted = unformatCurrency(inputValue);
    const formatted = formatCurrency(unformatted);
    
    setAnnualRevenueDisplay(formatted);
    setAnnualRevenue((Number.parseFloat(unformatted) / 100).toString());
  };

  // Navigation
  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Calculate
  const handleCalculate = () => {
    const calculationResults = calculateAllRegimes({
      businessType,
      monthlyRevenue: Number.parseFloat(monthlyRevenue) || 0,
      annualRevenue: Number.parseFloat(annualRevenue) || 0,
    });

    setResults(calculationResults);
    nextStep();
  };

  // Validation
  const canProceedStep1 = businessType !== '';
  const canProceedStep2 = monthlyRevenue !== '' && annualRevenue !== '';

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-6"
      >
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <Calculator className="h-12 w-12 text-blue-600" />
          <h1 className="text-4xl font-bold">Calculadora Tributária</h1>
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Descubra qual regime tributário é mais vantajoso para seu negócio
        </p>
      </motion.div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8 gap-4">
        {[1, 2, 3].map(step => (
          <React.Fragment key={step}>
            <div
              className={cn(
                'flex items-center justify-center w-12 h-12 rounded-full font-bold transition-all',
                currentStep >= step
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-500'
              )}
            >
              {step}
            </div>
            {step < 3 && (
              <div
                className={cn(
                  'h-1 w-16 transition-all',
                  currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
                )}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Steps Content */}
      <AnimatePresence mode="wait">
        {currentStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <Card className="max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-6 w-6 text-blue-600" />
                  Passo 1: Tipo de Negócio
                </CardTitle>
                <CardDescription>
                  Selecione o tipo de atividade principal da sua empresa
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {BUSINESS_TYPES.map(type => (
                    <motion.button
                      key={type.id}
                      onClick={() => setBusinessType(type.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        'p-6 border-2 rounded-lg text-left transition-all',
                        businessType === type.id
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      )}
                    >
                      <div className="flex items-start gap-4">
                        <span className="text-4xl">{type.icon}</span>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg mb-1">{type.name}</h3>
                          <p className="text-sm text-gray-600">{type.description}</p>
                          {businessType === type.id && (
                            <Badge className="mt-2" variant="default">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Selecionado
                            </Badge>
                          )}
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    size="lg"
                    onClick={nextStep}
                    disabled={!canProceedStep1}
                    className="gap-2"
                  >
                    Próximo
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {currentStep === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <Card className="max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-6 w-6 text-green-600" />
                  Passo 2: Faturamento
                </CardTitle>
                <CardDescription>
                  Informe o faturamento da sua empresa
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="monthly-revenue" className="text-base font-semibold">
                      Faturamento Mensal Médio
                    </Label>
                    <div className="relative mt-2">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        R$
                      </span>
                      <Input
                        id="monthly-revenue"
                        type="text"
                        placeholder="0,00"
                        value={monthlyRevenueDisplay}
                        onChange={handleMonthlyRevenueChange}
                        className="pl-10 h-14 text-lg"
                      />
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      💡 Média dos últimos 3 meses
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="annual-revenue" className="text-base font-semibold">
                      Faturamento Anual (Últimos 12 Meses)
                    </Label>
                    <div className="relative mt-2">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        R$
                      </span>
                      <Input
                        id="annual-revenue"
                        type="text"
                        placeholder="0,00"
                        value={annualRevenueDisplay}
                        onChange={handleAnnualRevenueChange}
                        className="pl-10 h-14 text-lg"
                      />
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      📊 Soma dos últimos 12 meses de faturamento
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-900">
                      <p className="font-semibold mb-1">Dica Importante:</p>
                      <p>
                        O faturamento anual dos últimos 12 meses é essencial para calcular
                        corretamente a faixa do Simples Nacional e a alíquota efetiva.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={prevStep}
                    className="gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Voltar
                  </Button>
                  <Button
                    size="lg"
                    onClick={handleCalculate}
                    disabled={!canProceedStep2 || isCalculating}
                    className="gap-2"
                  >
                    {isCalculating ? 'Calculando...' : 'Calcular'}
                    <TrendingUp className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {currentStep === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <div className="max-w-6xl mx-auto space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                    Resultados da Análise Tributária
                  </CardTitle>
                  <CardDescription>
                    Comparação dos regimes tributários disponíveis para seu negócio
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Results List */}
              <div className="space-y-4">
                {results.map((result, index) => (
                  <motion.div
                    key={`${result.regime}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className={cn(
                      'border-2',
                      index === 0 ? 'border-green-500 shadow-lg' : 'border-gray-200'
                    )}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <span className="text-4xl">{result.icon}</span>
                            <div>
                              <h3 className="text-xl font-bold">{result.regimeName}</h3>
                              {index === 0 && (
                                <Badge className="mt-1" variant="default">
                                  💡 Mais Vantajoso
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Alíquota Efetiva</p>
                            <p className="text-3xl font-bold text-blue-600">
                              {result.effectiveRate}%
                            </p>
                          </div>
                        </div>

                        <Separator className="my-4" />

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Imposto Mensal</p>
                            <p className="text-2xl font-bold">
                              R$ {result.monthlyTax.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Imposto Anual</p>
                            <p className="text-2xl font-bold">
                              R$ {result.annualTax.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                          {result.faixa && (
                            <div>
                              <p className="text-sm text-gray-600">Faixa</p>
                              <p className="text-2xl font-bold">
                                {result.faixa} de 6
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Alerts */}
                        {result.alerts && result.alerts.length > 0 && (
                          <div className="mt-4 space-y-2">
                            {result.alerts.map((alert) => (
                              <div
                                key={`${result.regime}-${alert.type}-${alert.message.slice(0, 20)}`}
                                className={cn(
                                  'p-3 rounded-lg flex items-start gap-2 text-sm',
                                  alert.type === 'warning' && 'bg-yellow-50 border border-yellow-200',
                                  alert.type === 'info' && 'bg-blue-50 border border-blue-200',
                                  alert.type === 'success' && 'bg-green-50 border border-green-200'
                                )}
                              >
                                <AlertTriangle
                                  className={cn(
                                    'h-4 w-4 mt-0.5',
                                    alert.type === 'warning' && 'text-yellow-600',
                                    alert.type === 'info' && 'text-blue-600',
                                    alert.type === 'success' && 'text-green-600'
                                  )}
                                />
                                <p>{alert.message}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex justify-center gap-4">
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => {
                    setCurrentStep(1);
                    setResults([]);
                  }}
                >
                  Nova Consulta
                </Button>
                <Button size="lg" className="gap-2">
                  Gerar Relatório PDF
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
