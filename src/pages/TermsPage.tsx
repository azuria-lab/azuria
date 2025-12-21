import { motion, useReducedMotion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { FileText } from "lucide-react";

export default function TermsPage() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <>
      <Helmet>
        <title>Termos de Uso | Azuria</title>
        <meta name="description" content="Termos de Uso da plataforma Azuria. Leia nossos termos e condições de uso." />
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
                  <FileText className="h-8 w-8" />
                </div>
                <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-foreground">
                  Termos de Uso
                </h1>
                <p className="text-muted-foreground">
                  Última atualização: Janeiro de 2025
                </p>
              </div>

              {/* Content */}
              <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
                <section className="space-y-4">
                  <h2 className="text-2xl font-semibold text-foreground">1. Aceitação dos Termos</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Ao acessar e usar a plataforma Azuria, você concorda em cumprir e estar vinculado a estes Termos de Uso. 
                    Se você não concorda com qualquer parte destes termos, não deve usar nossos serviços.
                  </p>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-semibold text-foreground">2. Descrição do Serviço</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    A Azuria é uma plataforma de precificação que oferece ferramentas para cálculo de preços, 
                    análise de custos, gestão de marketplaces e funcionalidades relacionadas à precificação de produtos e serviços.
                  </p>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-semibold text-foreground">3. Conta de Usuário</h2>
                  <div className="space-y-3 text-muted-foreground leading-relaxed">
                    <p>Para usar nossos serviços, você precisa criar uma conta. Você é responsável por:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Manter a confidencialidade de suas credenciais de acesso</li>
                      <li>Fornecer informações precisas e atualizadas</li>
                      <li>Notificar-nos imediatamente sobre qualquer uso não autorizado</li>
                      <li>Ser responsável por todas as atividades que ocorrem em sua conta</li>
                    </ul>
                  </div>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-semibold text-foreground">4. Uso Aceitável</h2>
                  <div className="space-y-3 text-muted-foreground leading-relaxed">
                    <p>Você concorda em não:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Usar o serviço para qualquer propósito ilegal ou não autorizado</li>
                      <li>Tentar acessar áreas restritas do sistema</li>
                      <li>Interferir ou interromper o funcionamento do serviço</li>
                      <li>Reproduzir, duplicar ou copiar qualquer parte do serviço sem autorização</li>
                      <li>Usar o serviço para transmitir vírus ou código malicioso</li>
                    </ul>
                  </div>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-semibold text-foreground">5. Propriedade Intelectual</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Todo o conteúdo da plataforma Azuria, incluindo textos, gráficos, logos, ícones, imagens, 
                    compilações de dados e software, é propriedade da Azuria ou de seus fornecedores de conteúdo 
                    e está protegido por leis de direitos autorais e outras leis de propriedade intelectual.
                  </p>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-semibold text-foreground">6. Assinaturas e Pagamentos</h2>
                  <div className="space-y-3 text-muted-foreground leading-relaxed">
                    <p>Para planos pagos:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Os pagamentos são processados de forma segura através de provedores terceirizados</li>
                      <li>As assinaturas são renovadas automaticamente, a menos que canceladas</li>
                      <li>Você pode cancelar sua assinatura a qualquer momento</li>
                      <li>Reembolsos são avaliados caso a caso, conforme nossa política de reembolso</li>
                    </ul>
                  </div>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-semibold text-foreground">7. Limitação de Responsabilidade</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    A Azuria fornece o serviço "como está" e "conforme disponível". Não garantimos que o serviço 
                    será ininterrupto, livre de erros ou atenderá a todas as suas necessidades. 
                    Não seremos responsáveis por quaisquer danos diretos, indiretos, incidentais ou consequenciais 
                    resultantes do uso ou incapacidade de usar o serviço.
                  </p>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-semibold text-foreground">8. Modificações dos Termos</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Reservamo-nos o direito de modificar estes termos a qualquer momento. 
                    Notificaremos os usuários sobre mudanças significativas através do email cadastrado ou 
                    através de avisos na plataforma. O uso continuado do serviço após tais modificações constitui 
                    sua aceitação dos novos termos.
                  </p>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-semibold text-foreground">9. Lei Aplicável</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Estes Termos de Uso são regidos pelas leis brasileiras. 
                    Qualquer disputa relacionada a estes termos será resolvida nos tribunais competentes do Brasil.
                  </p>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-semibold text-foreground">10. Contato</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Se você tiver dúvidas sobre estes Termos de Uso, entre em contato conosco através do email: 
                    <a href="mailto:contato@azuria.com.br" className="text-primary hover:underline ml-1">
                      contato@azuria.com.br
                    </a>
                  </p>
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

