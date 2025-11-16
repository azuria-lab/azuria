/**
 * Página de Retorno do Pagamento
 * 
 * Processa o retorno do Mercado Pago após checkout
 * 
 * @module PaymentReturnPage
 */

import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Clock, Loader2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useMercadoPago } from '@/hooks/useMercadoPago';

/**
 * Página que processa o retorno do Mercado Pago
 * 
 * URL esperada: /pagamento/retorno?status=success&payment_id=123456789
 * 
 * Parâmetros aceitos:
 * - status: success | failure | pending
 * - payment_id: ID do pagamento no Mercado Pago
 * - collection_status: approved | pending | rejected
 * - external_reference: Referência externa (user_id)
 */
export default function PaymentReturnPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handlePaymentReturn, checkoutData } = useMercadoPago();

  useEffect(() => {
    // Ler parâmetros da URL
    const status = searchParams.get('status');
    const collectionStatus = searchParams.get('collection_status');
    const paymentId = searchParams.get('payment_id');

    // Determinar status final
    let finalStatus: 'success' | 'failure' | 'pending' = 'pending';

    if (status === 'approved' || collectionStatus === 'approved') {
      finalStatus = 'success';
    } else if (status === 'rejected' || collectionStatus === 'rejected') {
      finalStatus = 'failure';
    } else if (status === 'pending' || collectionStatus === 'pending') {
      finalStatus = 'pending';
    }

    // Processar retorno
    handlePaymentReturn(finalStatus, paymentId || undefined);
  }, [searchParams, handlePaymentReturn]);

  const renderContent = () => {
    switch (checkoutData.status) {
      case 'success':
        return (
          <>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Pagamento Aprovado!</CardTitle>
              <CardDescription>
                Sua assinatura foi ativada com sucesso
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <p className="text-muted-foreground">
                Obrigado por assinar! Você já pode aproveitar todos os recursos do seu plano.
              </p>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button onClick={() => navigate('/assinatura')} className="w-full">
                Ver Minha Assinatura
              </Button>
              <Button onClick={() => navigate('/calculadora')} variant="outline" className="w-full">
                Ir para Calculadora
              </Button>
            </CardFooter>
          </>
        );

      case 'error':
        return (
          <>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-2xl">Pagamento Recusado</CardTitle>
              <CardDescription>
                Não foi possível processar seu pagamento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <p className="text-muted-foreground">
                {checkoutData.error || 'Ocorreu um erro ao processar seu pagamento. Por favor, tente novamente.'}
              </p>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button onClick={() => navigate('/pricing')} className="w-full">
                Tentar Novamente
              </Button>
              <Button onClick={() => navigate('/')} variant="outline" className="w-full">
                Voltar ao Início
              </Button>
            </CardFooter>
          </>
        );

      case 'processing':
        return (
          <>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <CardTitle className="text-2xl">Pagamento Pendente</CardTitle>
              <CardDescription>
                Estamos processando seu pagamento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <p className="text-muted-foreground">
                Seu pagamento está sendo processado. Você receberá uma confirmação assim que for aprovado.
              </p>
              <p className="text-sm text-muted-foreground">
                Isso pode levar alguns minutos. Você será notificado por email quando o pagamento for confirmado.
              </p>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button onClick={() => navigate('/assinatura')} className="w-full">
                Ver Status da Assinatura
              </Button>
              <Button onClick={() => navigate('/')} variant="outline" className="w-full">
                Voltar ao Início
              </Button>
            </CardFooter>
          </>
        );

      default:
        return (
          <>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                <Loader2 className="h-6 w-6 text-gray-600 animate-spin" />
              </div>
              <CardTitle className="text-2xl">Processando...</CardTitle>
              <CardDescription>
                Aguarde enquanto verificamos seu pagamento
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground">
                Estamos verificando o status do seu pagamento. Isso pode levar alguns instantes.
              </p>
            </CardContent>
          </>
        );
    }
  };

  return (
    <div className="container max-w-2xl mx-auto py-12 px-4">
      <Card>{renderContent()}</Card>
      
      {/* Informações de suporte */}
      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground">
          Problemas com seu pagamento?{' '}
          <a href="/suporte" className="text-primary hover:underline">
            Entre em contato
          </a>
        </p>
      </div>
    </div>
  );
}
