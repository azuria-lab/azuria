/**
 * Componente de Checkout do Abacatepay
 * 
 * Fornece interface visual para iniciar processo de pagamento via Abacatepay
 * 
 * @module components/payment/AbacatePayCheckout
 */

import { useState } from 'react';
import { CreditCard, Loader2, QrCode, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useAbacatePay } from '@/hooks/useAbacatePay';
import { formatCentsToReais, getAbacatePayProduct } from '@/config/abacatepay';
import type { AbacatePayMethod } from '@/types/abacatepay';

interface AbacatePayCheckoutProps {
  /**
   * ID do plano selecionado
   */
  planId: 'essencial' | 'pro' | 'enterprise';
  
  /**
   * Nome do plano
   */
  planName: string;
  
  /**
   * Intervalo de cobrança
   */
  billingInterval: 'monthly' | 'annual';
  
  /**
   * Callback chamado quando o checkout for iniciado com sucesso
   */
  onCheckoutStarted?: () => void;
  
  /**
   * Callback chamado em caso de erro
   */
  onError?: (error: string) => void;
}

/**
 * Componente de checkout do Abacatepay
 * 
 * Exibe informações do plano selecionado e botão para iniciar pagamento
 * 
 * @example
 * ```tsx
 * <AbacatePayCheckout
 *   planId="essencial"
 *   planName="Plano Essencial"
 *   billingInterval="monthly"
 * />
 * ```
 */
export function AbacatePayCheckout({
  planId,
  planName,
  billingInterval,
  onCheckoutStarted,
  onError,
}: AbacatePayCheckoutProps) {
  const { createBilling, isLoading, error } = useAbacatePay();
  const [accepted, setAccepted] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<AbacatePayMethod>('PIX');

  // Obter informações do produto
  const product = getAbacatePayProduct(planId, billingInterval);
  const formattedPrice = formatCentsToReais(product.price);
  const intervalLabel = billingInterval === 'monthly' ? 'mês' : 'ano';

  const handleCheckout = async () => {
    if (!accepted) {
      const errorMsg = 'Você precisa aceitar os termos antes de continuar';
      onError?.(errorMsg);
      return;
    }

    try {
      await createBilling({
        planId,
        billingInterval,
        methods: [selectedMethod],
      });
      onCheckoutStarted?.();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao iniciar checkout';
      onError?.(errorMsg);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Finalizar Assinatura
        </CardTitle>
        <CardDescription>
          Você será redirecionado para o Abacatepay para concluir o pagamento
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Detalhes do plano */}
        <div className="rounded-lg border p-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-medium">Plano:</span>
            <span>{planName}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="font-medium">Valor:</span>
            <span className="text-lg font-bold">{formattedPrice}/{intervalLabel}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="font-medium">Tipo:</span>
            <span>
              {billingInterval === 'monthly' ? 'Assinatura Mensal' : 'Assinatura Anual'}
            </span>
          </div>
        </div>

        {/* Seleção de método de pagamento */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Método de Pagamento</Label>
          <RadioGroup 
            value={selectedMethod} 
            onValueChange={(value) => setSelectedMethod(value as AbacatePayMethod)}
            className="space-y-2"
          >
            <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-muted/50 transition-colors cursor-pointer">
              <RadioGroupItem value="PIX" id="pix" />
              <Label htmlFor="pix" className="flex items-center gap-2 cursor-pointer flex-1">
                <QrCode className="h-4 w-4" />
                <div>
                  <div className="font-medium">PIX</div>
                  <div className="text-xs text-muted-foreground">Pagamento instantâneo</div>
                </div>
              </Label>
            </div>
            
            <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-muted/50 transition-colors cursor-pointer">
              <RadioGroupItem value="CARD" id="card" />
              <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer flex-1">
                <CreditCard className="h-4 w-4" />
                <div>
                  <div className="font-medium">Cartão de Crédito</div>
                  <div className="text-xs text-muted-foreground">Parcelamento disponível</div>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Segurança */}
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Pagamento 100% seguro processado pelo Abacatepay
          </AlertDescription>
        </Alert>

        {/* Termos */}
        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            id="terms"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="mt-1"
          />
          <label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer">
            Aceito os{' '}
            <a href="/termos" className="text-primary hover:underline" target="_blank">
              Termos de Uso
            </a>
            {' '}e{' '}
            <a href="/privacidade" className="text-primary hover:underline" target="_blank">
              Política de Privacidade
            </a>
          </label>
        </div>

        {/* Erro */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-2">
        <Button
          onClick={handleCheckout}
          disabled={!accepted || isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processando...
            </>
          ) : (
            <>
              {selectedMethod === 'PIX' ? (
                <QrCode className="mr-2 h-4 w-4" />
              ) : (
                <CreditCard className="mr-2 h-4 w-4" />
              )}
              Ir para Pagamento
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          {billingInterval === 'monthly'
            ? 'A cobrança será realizada mensalmente de forma automática'
            : 'Você será cobrado anualmente de forma automática'}
        </p>
      </CardFooter>
    </Card>
  );
}
