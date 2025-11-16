/**
 * Componente de Checkout do Mercado Pago
 * 
 * Fornece interface visual para iniciar processo de pagamento via Mercado Pago
 * 
 * @module MercadoPagoCheckout
 */

import { useState } from 'react';
import { CreditCard, Loader2, Shield } from 'lucide-react';
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
import { useMercadoPago } from '@/hooks/useMercadoPago';
import type { PlanId } from '@/types/subscription';

interface MercadoPagoCheckoutProps {
  /**
   * ID do plano selecionado
   */
  planId: Exclude<PlanId, 'free' | 'enterprise'>;
  
  /**
   * Nome do plano
   */
  planName: string;
  
  /**
   * Preço mensal
   */
  price: number;
  
  /**
   * Se true, cria assinatura recorrente
   * Se false, cria pagamento único
   * @default true
   */
  recurring?: boolean;
  
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
 * Componente de checkout do Mercado Pago
 * 
 * Exibe informações do plano selecionado e botão para iniciar pagamento
 * 
 * @example
 * ```tsx
 * <MercadoPagoCheckout
 *   planId="essencial"
 *   planName="Plano Essencial"
 *   price={59.00}
 *   recurring={true}
 * />
 * ```
 */
export function MercadoPagoCheckout({
  planId,
  planName,
  price,
  recurring = true,
  onCheckoutStarted,
  onError,
}: MercadoPagoCheckoutProps) {
  const { startCheckout, checkoutData, isProcessing } = useMercadoPago();
  const [accepted, setAccepted] = useState(false);

  const handleCheckout = () => {
    if (!accepted) {
      onError?.('Você precisa aceitar os termos antes de continuar');
      return;
    }

    try {
      startCheckout(planId, recurring);
      onCheckoutStarted?.();
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Erro ao iniciar checkout');
    }
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Finalizar Assinatura
        </CardTitle>
        <CardDescription>
          Você será redirecionado para o Mercado Pago para concluir o pagamento
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
            <span className="text-lg font-bold">{formatPrice(price)}/mês</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="font-medium">Tipo:</span>
            <span>
              {recurring ? 'Assinatura Recorrente' : 'Pagamento Único'}
            </span>
          </div>
        </div>

        {/* Segurança */}
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Pagamento 100% seguro processado pelo Mercado Pago
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
        {checkoutData.status === 'error' && (
          <Alert variant="destructive">
            <AlertDescription>
              {checkoutData.error || 'Erro ao processar pagamento'}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-2">
        <Button
          onClick={handleCheckout}
          disabled={!accepted || isProcessing}
          className="w-full"
          size="lg"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processando...
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              Ir para Pagamento
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          {recurring
            ? 'A cobrança será realizada mensalmente de forma automática'
            : 'Você será cobrado apenas uma vez'}
        </p>
      </CardFooter>
    </Card>
  );
}
