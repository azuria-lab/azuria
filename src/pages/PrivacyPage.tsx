import { motion, useReducedMotion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Shield } from "lucide-react";

export default function PrivacyPage() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <>
      <Helmet>
        <title>Política de Privacidade | Azuria</title>
        <meta name="description" content="Política de Privacidade da Azuria. Saiba como protegemos e tratamos seus dados pessoais em conformidade com a LGPD." />
      </Helmet>

      <div className="flex flex-col min-h-screen bg-background">
        <Header />

        <main className="flex-1">
          <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 max-w-4xl">
            <motion.div
              initial={shouldReduceMotion ? undefined : { opacity: 0, y: 20 }}
              animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              {/* Header */}
              <div className="text-center space-y-4 pb-8 border-b border-border">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                  <Shield className="h-8 w-8" />
                </div>
                <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-foreground">
                  Política de Privacidade
                </h1>
                <p className="text-muted-foreground">
                  Última atualização: Janeiro de 2025
                </p>
              </div>

              {/* Content */}
              <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
                <section className="space-y-4">
                  <h2 className="text-2xl font-semibold text-foreground">1. Introdução</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    A Azuria está comprometida em proteger sua privacidade e seus dados pessoais. 
                    Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos 
                    suas informações pessoais em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018).
                  </p>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-semibold text-foreground">2. Dados que Coletamos</h2>
                  <div className="space-y-3 text-muted-foreground leading-relaxed">
                    <p>Coletamos os seguintes tipos de dados:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li><strong>Dados de identificação:</strong> Nome, email, telefone</li>
                      <li><strong>Dados de conta:</strong> Credenciais de acesso, preferências de uso</li>
                      <li><strong>Dados de uso:</strong> Cálculos realizados, histórico de navegação, interações com a plataforma</li>
                      <li><strong>Dados técnicos:</strong> Endereço IP, tipo de navegador, dispositivo utilizado</li>
                      <li><strong>Dados de pagamento:</strong> Processados por provedores terceirizados seguros (não armazenamos dados de cartão)</li>
                    </ul>
                  </div>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-semibold text-foreground">3. Como Usamos Seus Dados</h2>
                  <div className="space-y-3 text-muted-foreground leading-relaxed">
                    <p>Utilizamos seus dados para:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Fornecer e melhorar nossos serviços</li>
                      <li>Processar seus cálculos e armazenar seu histórico</li>
                      <li>Enviar comunicações importantes sobre sua conta</li>
                      <li>Personalizar sua experiência na plataforma</li>
                      <li>Garantir a segurança e prevenir fraudes</li>
                      <li>Cumprir obrigações legais</li>
                    </ul>
                  </div>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-semibold text-foreground">4. Compartilhamento de Dados</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Não vendemos, alugamos ou compartilhamos seus dados pessoais com terceiros, exceto:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4 text-muted-foreground">
                    <li>Com seu consentimento explícito</li>
                    <li>Para cumprir obrigações legais</li>
                    <li>Com provedores de serviços que nos auxiliam na operação (sob acordos de confidencialidade)</li>
                    <li>Em caso de fusão, aquisição ou venda de ativos (com notificação prévia)</li>
                  </ul>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-semibold text-foreground">5. Segurança dos Dados</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Implementamos medidas de segurança técnicas e organizacionais para proteger seus dados, incluindo:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4 text-muted-foreground">
                    <li>Criptografia de dados em trânsito e em repouso</li>
                    <li>Controles de acesso rigorosos</li>
                    <li>Monitoramento contínuo de segurança</li>
                    <li>Backups regulares e planos de recuperação</li>
                    <li>Conformidade com padrões de segurança reconhecidos</li>
                  </ul>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-semibold text-foreground">6. Seus Direitos (LGPD)</h2>
                  <div className="space-y-3 text-muted-foreground leading-relaxed">
                    <p>Você tem os seguintes direitos sobre seus dados pessoais:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li><strong>Acesso:</strong> Solicitar informações sobre quais dados temos sobre você</li>
                      <li><strong>Correção:</strong> Solicitar correção de dados incompletos ou desatualizados</li>
                      <li><strong>Exclusão:</strong> Solicitar a exclusão de dados desnecessários ou tratados em desconformidade</li>
                      <li><strong>Portabilidade:</strong> Solicitar a transferência de seus dados para outro fornecedor</li>
                      <li><strong>Revogação de consentimento:</strong> Retirar seu consentimento a qualquer momento</li>
                      <li><strong>Oposição:</strong> Opor-se ao tratamento de dados em certas circunstâncias</li>
                    </ul>
                    <p className="pt-2">
                      Para exercer seus direitos, entre em contato através do email: 
                      <a href="mailto:privacidade@azuria.com.br" className="text-primary hover:underline ml-1">
                        privacidade@azuria.com.br
                      </a>
                    </p>
                  </div>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-semibold text-foreground">7. Retenção de Dados</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Mantemos seus dados pessoais apenas pelo tempo necessário para cumprir as finalidades descritas nesta política, 
                    ou conforme exigido por lei. Dados de conta são mantidos enquanto sua conta estiver ativa. 
                    Após o cancelamento, podemos reter certos dados por períodos legais obrigatórios.
                  </p>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-semibold text-foreground">8. Cookies e Tecnologias Similares</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Utilizamos cookies e tecnologias similares para melhorar sua experiência, analisar o uso da plataforma 
                    e personalizar conteúdo. Você pode gerenciar suas preferências de cookies através das configurações do navegador.
                  </p>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-semibold text-foreground">9. Alterações nesta Política</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos sobre mudanças significativas 
                    através do email cadastrado ou através de avisos na plataforma. A data da última atualização está indicada no topo desta página.
                  </p>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-semibold text-foreground">10. Contato</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Para questões sobre privacidade ou para exercer seus direitos, entre em contato:
                  </p>
                  <div className="bg-muted/30 rounded-lg p-4 space-y-2 text-muted-foreground">
                    <p><strong className="text-foreground">Email:</strong> privacidade@azuria.com.br</p>
                    <p><strong className="text-foreground">Encarregado de Dados (DPO):</strong> disponível através do email acima</p>
                  </div>
                </section>
              </div>
            </motion.div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}

