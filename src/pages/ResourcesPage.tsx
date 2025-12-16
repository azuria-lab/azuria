import { useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";
import ResourceFlow from "@/components/resources/ResourceFlow";
import ResourceSelector from "@/components/resources/ResourceSelector";
import { FLOW_CONFIGS, RESOURCES } from "@/config/resources";
import { ResourceId } from "@/types/resources";
import { Link } from "react-router-dom";

const FLOW_DESCRIPTIONS: Record<ResourceId, { title: string; description: string }> = {
  'rapid-calculator': {
    title: 'Veja como o preço é construído.',
    description: 'A calculadora rápida organiza custos, impostos e margem para transformar números em decisões seguras.',
  },
  'advanced-calculator': {
    title: 'Cenários complexos, resultados claros.',
    description: 'A calculadora avançada permite simular múltiplos cenários com precisão profissional.',
  },
  'tax-calculator': {
    title: 'Entenda o impacto tributário.',
    description: 'A calculadora tributária simula impostos de forma precisa, evitando surpresas na rentabilidade.',
  },
  'bidding-calculator': {
    title: 'Precifique licitações com segurança.',
    description: 'A calculadora de licitações ajuda a definir lances competitivos mantendo sua margem.',
  },
  'analytics': {
    title: 'Dados transformados em decisões.',
    description: 'Os dashboards e analytics oferecem visão clara de métricas e desempenho do seu negócio.',
  },
  'marketplaces': {
    title: 'Compare e otimize seus canais.',
    description: 'Gerencie e compare marketplaces para encontrar as melhores oportunidades de venda.',
  },
  'automation': {
    title: 'Automações que trabalham por você.',
    description: 'Crie fluxos inteligentes que ajustam preços e acionam ações automaticamente.',
  },
  'ai': {
    title: 'Inteligência artificial aplicada.',
    description: 'A Azuria IA oferece recomendações estratégicas baseadas em inteligência artificial.',
  },
};

export default function ResourcesPage() {
  const shouldReduceMotion = useReducedMotion();
  const flowSectionRef = useRef<HTMLDivElement>(null);
  const [selectedResource, setSelectedResource] = useState<ResourceId | null>(null);

  const scrollToFlow = () => {
    flowSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleResourceSelect = (id: string) => {
    setSelectedResource(id as ResourceId);
    setTimeout(() => {
      scrollToFlow();
    }, 100);
  };

  const handleBackToSelection = () => {
    setSelectedResource(null);
  };

  const selectedFlowConfig = selectedResource ? FLOW_CONFIGS[selectedResource] : null;
  const selectedFlowDescription = selectedResource ? FLOW_DESCRIPTIONS[selectedResource] : null;

  return (
    <>
      <Helmet>
        <title>Recursos | Azuria</title>
        <meta name="description" content="Entenda como a Azuria transforma dados simples em preços confiáveis através de suas funcionalidades." />
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
                Recursos pensados para decisões melhores.
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Entenda como a Azuria transforma dados simples em preços confiáveis.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Button
                  onClick={scrollToFlow}
                  variant="outline"
                  size="lg"
                  className="min-h-[48px] px-8 text-base"
                >
                  Explorar recursos
                  <ArrowDown className="ml-2 h-4 w-4" />
                </Button>
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
              </div>
            </motion.div>
          </section>

          {/* Resource Selection Section */}
          <section
            ref={flowSectionRef}
            className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 max-w-7xl"
          >
            <AnimatePresence mode="wait">
              {!selectedResource ? (
                <motion.div
                  key="selection"
                  initial={shouldReduceMotion ? undefined : { opacity: 0, y: 20 }}
                  animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                  exit={shouldReduceMotion ? undefined : { opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="space-y-8"
                >
                  <div className="text-center space-y-4 max-w-3xl mx-auto">
                    <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
                      Escolha um recurso para explorar.
                    </h2>
                    <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                      Clique em qualquer recurso abaixo para ver como ele funciona passo a passo.
                    </p>
                  </div>

                  <ResourceSelector
                    resources={RESOURCES}
                    selectedId={selectedResource}
                    onSelect={handleResourceSelect}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="flow"
                  initial={shouldReduceMotion ? undefined : { opacity: 0, y: 20 }}
                  animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                  exit={shouldReduceMotion ? undefined : { opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="space-y-6"
                >
                  <Button
                    onClick={handleBackToSelection}
                    variant="ghost"
                    size="sm"
                    className="mb-4"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar para recursos
                  </Button>

                  {selectedFlowConfig && selectedFlowDescription && (
                    <ResourceFlow
                      blocks={selectedFlowConfig}
                      title={selectedFlowDescription.title}
                      description={selectedFlowDescription.description}
                      headerContent={
                        selectedResource === 'ai' ? (
                          <div className="relative w-48 h-48 sm:w-60 sm:h-60 rounded-full shadow-xl overflow-hidden">
                            <img 
                              src="/images/azuria-ai-avatar.jpg" 
                              alt="Azuria AI Avatar" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : undefined
                      }
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* Final CTA Section */}
          <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 max-w-4xl">
            <motion.div
              initial={shouldReduceMotion ? undefined : { opacity: 0, y: 20 }}
              whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-center space-y-8"
            >
              <div className="space-y-4">
                <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
                  Decisão tranquila começa com clareza.
                </h2>
                <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                  Quando você entende o preço, confia nele. Quando confia, vende melhor.
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
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}
