/**
 * Componente de comparação detalhada de planos
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Sparkles, X } from 'lucide-react';
import { PLANS_ARRAY } from '@/config/plans';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '@/hooks/useSubscription';

interface Feature {
  label: string;
  free: boolean | string | number;
  essencial: boolean | string | number;
  pro: boolean | string | number;
  enterprise: boolean | string | number;
}

const features: Feature[] = [
  {
    label: 'Cálculos por dia',
    free: '10',
    essencial: '100',
    pro: 'Ilimitado',
    enterprise: 'Ilimitado',
  },
  {
    label: 'Consultas IA por mês',
    free: '0',
    essencial: '0',
    pro: '500',
    enterprise: 'Ilimitado',
  },
  {
    label: 'Requisições API por mês',
    free: '0',
    essencial: '0',
    pro: '5.000',
    enterprise: 'Ilimitado',
  },
  {
    label: 'Histórico de cálculos',
    free: false,
    essencial: true,
    pro: true,
    enterprise: true,
  },
  {
    label: 'Exportação de relatórios',
    free: false,
    essencial: 'PDF',
    pro: 'PDF, Excel, CSV',
    enterprise: 'PDF, Excel, CSV',
  },
  {
    label: 'Analytics básico',
    free: false,
    essencial: true,
    pro: true,
    enterprise: true,
  },
  {
    label: 'Analytics avançado',
    free: false,
    essencial: false,
    pro: true,
    enterprise: true,
  },
  {
    label: 'Análise de concorrência',
    free: false,
    essencial: false,
    pro: true,
    enterprise: true,
  },
  {
    label: 'Integrações marketplace',
    free: false,
    essencial: '1 loja',
    pro: '3 lojas',
    enterprise: 'Ilimitado',
  },
  {
    label: 'Membros da equipe',
    free: '1',
    essencial: '1',
    pro: '5',
    enterprise: 'Ilimitado',
  },
  {
    label: 'Suporte prioritário',
    free: false,
    essencial: false,
    pro: true,
    enterprise: true,
  },
  {
    label: 'Gerente de conta dedicado',
    free: false,
    essencial: false,
    pro: false,
    enterprise: true,
  },
];

const renderValue = (value: boolean | string | number) => {
  if (typeof value === 'boolean') {
    return value ? (
      <Check className="h-5 w-5 text-green-500 mx-auto" />
    ) : (
      <X className="h-5 w-5 text-gray-300 mx-auto" />
    );
  }
  
  return <span className="text-sm font-medium">{value}</span>;
};

export const PlanComparison = () => {
  const navigate = useNavigate();
  const { subscription } = useSubscription();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          <CardTitle>Comparação de Planos</CardTitle>
        </div>
        <CardDescription>
          Compare recursos e escolha o melhor plano para você
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-4 px-2 font-medium">Recurso</th>
                {PLANS_ARRAY.map((plan) => (
                  <th key={plan.id} className="text-center py-4 px-4 min-w-[150px]">
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex items-center gap-2">
                        {plan.id === 'enterprise' && (
                          <Crown className="h-4 w-4 text-amber-500" />
                        )}
                        <span className="font-bold">{plan.name}</span>
                      </div>
                      
                      {subscription?.planId === plan.id && (
                        <Badge variant="outline" className="text-xs">
                          Plano Atual
                        </Badge>
                      )}
                      
                      <div className="text-2xl font-bold">
                        {plan.pricing.monthly === 0 ? (
                          'Grátis'
                        ) : (
                          <>
                            <span className="text-sm font-normal text-muted-foreground">R$</span>
                            {plan.pricing.monthly}
                            <span className="text-sm font-normal text-muted-foreground">/mês</span>
                          </>
                        )}
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            
            <tbody>
              {features.map((feature, idx) => (
                <tr key={idx} className="border-b hover:bg-accent/50 transition-colors">
                  <td className="py-4 px-2 text-sm font-medium text-muted-foreground">
                    {feature.label}
                  </td>
                  <td className="py-4 px-4 text-center">
                    {renderValue(feature.free)}
                  </td>
                  <td className="py-4 px-4 text-center">
                    {renderValue(feature.essencial)}
                  </td>
                  <td className="py-4 px-4 text-center">
                    {renderValue(feature.pro)}
                  </td>
                  <td className="py-4 px-4 text-center">
                    {renderValue(feature.enterprise)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-8 flex justify-center">
          <Button size="lg" onClick={() => navigate('/pricing')}>
            Ver Detalhes dos Planos
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
