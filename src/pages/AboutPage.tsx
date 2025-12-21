import { motion, useReducedMotion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  CheckCircle2
} from "lucide-react";
import { Link } from "react-router-dom";

export default function AboutPage() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <>
      <Helmet>
        <title>Sobre a Azuria | Precificação Inteligente</title>
        <meta name="description" content="A inteligência por trás de preços bem definidos. A Azuria é uma plataforma de precificação criada para ajudar empresas brasileiras a definirem preços com clareza, segurança e consistência." />
      </Helmet>

      <div className="flex flex-col min-h-screen bg-background">
        <Header />

        <main className="flex-1">
          {/* Hero Section */}
          <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 max-w-4xl">
            <motion.div
              initial={shouldReduceMotion ? undefined : { opacity: 0, y: 20 }}
              animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-center space-y-6"
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground">
                Sobre a Azuria
              </h1>
              <p className="text-2xl sm:text-3xl text-muted-foreground font-light max-w-3xl mx-auto leading-relaxed">
                A inteligência por trás de preços bem definidos.
              </p>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed pt-4">
                A Azuria é uma plataforma de precificação criada para ajudar empresas brasileiras a definirem preços com clareza, segurança e consistência.
                <br />
                <br />
                Ela considera custos reais, impostos e margens de forma automática — para que cada preço faça sentido antes de ir ao ar.
              </p>
              <div className="flex flex-wrap justify-center gap-4 pt-6 text-sm text-muted-foreground">
                <span>Sem achismo.</span>
                <span>•</span>
                <span>Sem planilhas confusas.</span>
                <span>•</span>
                <span>Sem prejuízo invisível.</span>
              </div>
            </motion.div>
          </section>

          {/* Missão, Visão e Valores */}
          <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 max-w-6xl">
            <div className="grid md:grid-cols-3 gap-12 md:gap-16">
              {/* Missão */}
              <motion.div
                initial={shouldReduceMotion ? undefined : { opacity: 0, y: 20 }}
                whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5 }}
                className="space-y-4"
              >
                <h2 className="text-2xl font-semibold text-foreground">
                  Nossa missão
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Tornar a precificação simples e confiável.
                </p>
                <p className="text-base text-muted-foreground leading-relaxed">
                  Remover a complexidade dos cálculos e devolver ao empreendedor o controle sobre seus preços e seus resultados.
                </p>
              </motion.div>

              {/* Visão */}
              <motion.div
                initial={shouldReduceMotion ? undefined : { opacity: 0, y: 20 }}
                whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="space-y-4"
              >
                <h2 className="text-2xl font-semibold text-foreground">
                  Nossa visão
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Ser o sistema de precificação mais confiável do Brasil.
                </p>
                <p className="text-base text-muted-foreground leading-relaxed">
                  Aquele que o vendedor consulta antes de qualquer decisão de preço.
                </p>
              </motion.div>

              {/* Valores */}
              <motion.div
                initial={shouldReduceMotion ? undefined : { opacity: 0, y: 20 }}
                whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="space-y-4"
              >
                <h2 className="text-2xl font-semibold text-foreground">
                  Nossos valores
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-foreground mb-1">Clareza</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Se o usuário não entende o cálculo, o sistema falhou.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground mb-1">Simplicidade</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Interface direta. Decisão rápida. Resultado consistente.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground mb-1">Responsabilidade</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Cada preço influencia o negócio. Levamos isso a sério.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* O que nos move */}
          <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 max-w-6xl">
            <motion.div
              initial={shouldReduceMotion ? undefined : { opacity: 0, y: 20 }}
              whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="space-y-12"
            >
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
                O que nos move
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8 md:gap-12">
                <div className="space-y-2">
                  <h3 className="text-xl font-medium text-foreground">Foco no cliente</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Criamos a Azuria para resolver problemas reais de quem vende.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xl font-medium text-foreground">Evolução contínua</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    A plataforma melhora constantemente, guiada por dados e uso real.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xl font-medium text-foreground">Transparência</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Mostramos exatamente como cada valor é calculado.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xl font-medium text-foreground">Confiança</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Um preço bem definido elimina dúvidas e protege o lucro.
                  </p>
                </div>
              </div>
            </motion.div>
          </section>

          {/* Por que escolher a Azuria */}
          <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 max-w-6xl">
            <motion.div
              initial={shouldReduceMotion ? undefined : { opacity: 0, y: 20 }}
              whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="space-y-12"
            >
              <div className="space-y-4">
                <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
                  Por que escolher a Azuria
                </h2>
                <p className="text-xl text-muted-foreground font-light">
                  Não é apenas uma calculadora. É um sistema de decisão.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                <div className="space-y-2">
                  <CheckCircle2 className="h-5 w-5 text-foreground/70" />
                  <p className="text-muted-foreground leading-relaxed">
                    Cálculos adaptados à realidade fiscal brasileira
                  </p>
                </div>
                
                <div className="space-y-2">
                  <CheckCircle2 className="h-5 w-5 text-foreground/70" />
                  <p className="text-muted-foreground leading-relaxed">
                    Consideração automática de impostos, taxas e custos
                  </p>
                </div>
                
                <div className="space-y-2">
                  <CheckCircle2 className="h-5 w-5 text-foreground/70" />
                  <p className="text-muted-foreground leading-relaxed">
                    Integração com marketplaces e sistemas de venda
                  </p>
                </div>
                
                <div className="space-y-2">
                  <CheckCircle2 className="h-5 w-5 text-foreground/70" />
                  <p className="text-muted-foreground leading-relaxed">
                    Simples para começar. Profunda para escalar.
                  </p>
                </div>
              </div>

              <p className="text-lg text-muted-foreground leading-relaxed pt-4">
                Estrutura pensada para acompanhar o crescimento do negócio
              </p>
            </motion.div>
          </section>

          {/* Nossa jornada */}
          <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 max-w-4xl">
            <motion.div
              initial={shouldReduceMotion ? undefined : { opacity: 0, y: 20 }}
              whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="space-y-12"
            >
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
                Nossa jornada
              </h2>

              <div className="space-y-12">
                <div className="space-y-3">
                  <h3 className="text-xl font-medium text-foreground">O início</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    A Azuria nasceu de um problema comum: vender bem e ainda assim perder dinheiro sem perceber.
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xl font-medium text-foreground">Os primeiros usuários</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Com os primeiros clientes, ficou claro que o erro não estava no preço — estava no cálculo.
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xl font-medium text-foreground">A evolução</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Hoje, a Azuria evolui para ser um copiloto completo de precificação, unindo dados, lógica e confiança.
                  </p>
                </div>
              </div>
            </motion.div>
          </section>

          {/* CTA Final */}
          <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 max-w-4xl">
            <motion.div
              initial={shouldReduceMotion ? undefined : { opacity: 0, y: 20 }}
              whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="text-center space-y-8"
            >
              <div className="space-y-4">
                <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
                  Pronto para precificar com clareza?
                </h2>
                <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                  Pare de adivinhar preços.
                  <br />
                  Comece a decidir com segurança.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Button
                  asChild
                  size="lg"
                  className="min-h-[48px] px-8 text-base"
                >
                  <Link to="/calculadora-rapida">
                    Começar grátis
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="min-h-[48px] px-8 text-base"
                >
                  <Link to="/planos">
                    Ver planos
                  </Link>
                </Button>
              </div>
            </motion.div>
          </section>

          {/* Frase de marca */}
          <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-4xl border-t border-border">
            <motion.div
              initial={shouldReduceMotion ? undefined : { opacity: 0 }}
              whileInView={shouldReduceMotion ? undefined : { opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <p className="text-xl sm:text-2xl text-muted-foreground font-light leading-relaxed">
                Preço certo. Lucro protegido. Decisão tranquila.
              </p>
            </motion.div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}
