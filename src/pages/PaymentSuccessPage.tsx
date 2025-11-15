/**
 * Página de sucesso após pagamento no Stripe
 * Exibida quando o usuário conclui o checkout com sucesso
 */

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { SEOHead } from '@/components/seo/SEOHead';

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Simular verificação da sessão
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <>
        <SEOHead 
          title="Processando Pagamento | Azuria"
          description="Processando seu pagamento..."
        />
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary mb-4" />
              <p className="text-lg text-muted-foreground">Processando seu pagamento...</p>
            </div>
          </main>
          <Footer />
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead 
        title="Pagamento Realizado | Azuria"
        description="Seu pagamento foi processado com sucesso!"
      />
      
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <Header />
        
        <main className="flex-grow flex items-center justify-center py-12 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-2xl"
          >
            <Card className="border-green-200 bg-gradient-to-b from-white to-green-50/30">
              <CardHeader className="text-center pb-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="mx-auto mb-4"
                >
                  <CheckCircle2 className="h-20 w-20 text-green-500" />
                </motion.div>
                
                <CardTitle className="text-3xl font-bold text-green-700">
                  Pagamento Realizado com Sucesso!
                </CardTitle>
                <CardDescription className="text-lg mt-2">
                  Sua assinatura foi ativada e você já pode aproveitar todos os recursos.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 space-y-4">
                  <h3 className="font-semibold text-lg">O que acontece agora?</h3>
                  
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Acesso Imediato</p>
                        <p className="text-sm text-muted-foreground">
                          Todos os recursos do seu plano já estão disponíveis
                        </p>
                      </div>
                    </li>
                    
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Email de Confirmação</p>
                        <p className="text-sm text-muted-foreground">
                          Enviamos um recibo e detalhes da sua assinatura para seu email
                        </p>
                      </div>
                    </li>
                    
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Gerenciamento Fácil</p>
                        <p className="text-sm text-muted-foreground">
                          Você pode gerenciar sua assinatura a qualquer momento nas configurações
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>

                {sessionId && (
                  <div className="text-xs text-muted-foreground text-center">
                    ID da Sessão: {sessionId}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <Button
                    size="lg"
                    onClick={() => navigate('/calculadora-simples')}
                    className="w-full sm:w-auto"
                  >
                    Começar a Usar
                  </Button>
                  
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => navigate('/settings/subscription')}
                    className="w-full sm:w-auto"
                  >
                    Ver Minha Assinatura
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </main>
        
        <Footer />
      </div>
    </>
  );
}
