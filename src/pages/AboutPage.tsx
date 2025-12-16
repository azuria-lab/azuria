import { motion, useReducedMotion } from "framer-motion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { SEOHead } from "@/components/seo/SEOHead";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  Building2, 
  CheckCircle2, 
  Eye, 
  Globe, 
  Heart, 
  Lightbulb, 
  Rocket, 
  Shield,
  Target,
  TrendingUp,
  Users,
  Zap
} from "lucide-react";
import { Link } from "react-router-dom";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.2,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 }
  }
};

export default function AboutPage() {
  const reduceMotion = useReducedMotion();

  const values = [
    {
      icon: Target,
      title: "Foco no Cliente",
      description: "Colocamos nossos clientes no centro de tudo que fazemos, sempre priorizando suas necessidades e resultados."
    },
    {
      icon: Zap,
      title: "Inovação Constante",
      description: "Buscamos continuamente novas tecnologias e soluções para entregar o melhor produto possível."
    },
    {
      icon: Shield,
      title: "Transparência",
      description: "Acreditamos em comunicação clara, honesta e transparente em todos os nossos relacionamentos."
    },
    {
      icon: Heart,
      title: "Paixão pelo que Fazemos",
      description: "Amamos resolver problemas complexos e ajudar empresas a alcançarem seus objetivos de crescimento."
    }
  ];

  const milestones = [
    {
      year: "2024",
      title: "Lançamento da Plataforma",
      description: "Azuria nasce com a missão de democratizar a precificação inteligente no Brasil."
    },
    {
      year: "2024",
      title: "Primeiros Clientes",
      description: "Conquistamos nossos primeiros clientes e começamos a transformar a forma como empresas calculam preços."
    },
    {
      year: "2024",
      title: "Expansão de Funcionalidades",
      description: "Lançamos integrações com marketplaces, IA avançada e analytics em tempo real."
    }
  ];

  const team = [
    {
      name: "Equipe Azuria",
      role: "Desenvolvimento e Inovação",
      description: "Nossa equipe é composta por especialistas em tecnologia, precificação, IA e experiência do usuário, todos dedicados a criar a melhor solução para você."
    }
  ];

  return (
    <>
      <SEOHead 
        title="Sobre Nós | Azuria - Precificação Inteligente"
        description="Conheça a Azuria, nossa missão, visão e valores. Somos uma plataforma de precificação inteligente dedicada a ajudar empresas brasileiras a maximizarem seus lucros."
        url={typeof window !== "undefined" ? `${window.location.origin}/sobre` : "https://azuria.app/sobre"}
        type="website"
      />
      
      <motion.div 
        className="flex flex-col min-h-screen bg-background"
        variants={reduceMotion ? undefined : containerVariants}
        initial={reduceMotion ? false : "hidden"}
        animate={reduceMotion ? undefined : "visible"}
      >
        <Header />
      
        <main className="flex-grow">
          {/* Hero Section */}
          <section className="py-12 md:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-primary/5 to-background">
            <div className="container mx-auto max-w-4xl text-center">
              <motion.div
                variants={reduceMotion ? undefined : itemVariants}
                className="space-y-6"
              >
                <motion.h1 
                  className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground"
                  variants={reduceMotion ? undefined : itemVariants}
                >
                  Sobre a <span className="text-primary">Azuria</span>
                </motion.h1>
                <motion.p 
                  className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
                  variants={reduceMotion ? undefined : itemVariants}
                >
                  Somos uma plataforma de precificação inteligente dedicada a ajudar empresas brasileiras a calcularem o preço ideal de seus produtos, maximizando lucros e competitividade no mercado.
                </motion.p>
              </motion.div>
            </div>
          </section>

          {/* Missão, Visão e Valores */}
          <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8">
            <div className="container mx-auto max-w-6xl">
              <div className="grid md:grid-cols-3 gap-8 md:gap-12">
                {/* Missão */}
                <motion.div
                  variants={reduceMotion ? undefined : itemVariants}
                  className="text-center space-y-4"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                    <Target className="h-8 w-8" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">Nossa Missão</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Democratizar o acesso à precificação inteligente, fornecendo ferramentas avançadas que permitam empresas de todos os tamanhos calcularem preços ideais e maximizarem seus lucros.
                  </p>
                </motion.div>

                {/* Visão */}
                <motion.div
                  variants={reduceMotion ? undefined : itemVariants}
                  className="text-center space-y-4"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                    <Eye className="h-8 w-8" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">Nossa Visão</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Ser a plataforma de precificação mais completa e confiável do Brasil, reconhecida por transformar a forma como empresas calculam preços e tomam decisões estratégicas.
                  </p>
                </motion.div>

                {/* Valores */}
                <motion.div
                  variants={reduceMotion ? undefined : itemVariants}
                  className="text-center space-y-4"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                    <Heart className="h-8 w-8" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">Nossos Valores</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Foco no cliente, inovação constante, transparência e paixão pelo que fazemos. Esses valores guiam cada decisão e desenvolvimento da nossa plataforma.
                  </p>
                </motion.div>
              </div>
            </div>
          </section>

          {/* Valores Detalhados */}
          <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
            <div className="container mx-auto max-w-6xl">
              <motion.div
                variants={reduceMotion ? undefined : itemVariants}
                className="text-center mb-12"
              >
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  O que nos Move
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Nossos valores fundamentais que orientam cada aspecto do nosso trabalho
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                {values.map((value, index) => {
                  const Icon = value.icon;
                  return (
                    <motion.div
                      key={value.title}
                      variants={reduceMotion ? undefined : itemVariants}
                      whileHover={reduceMotion ? undefined : { y: -5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card className="h-full border-2 border-border hover:border-primary/30 transition-all duration-200">
                        <CardContent className="p-6 text-center space-y-4">
                          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary">
                            <Icon className="h-6 w-6" />
                          </div>
                          <h3 className="text-xl font-semibold text-foreground">
                            {value.title}
                          </h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {value.description}
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Por que Azuria */}
          <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8">
            <div className="container mx-auto max-w-6xl">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <motion.div
                  variants={reduceMotion ? undefined : itemVariants}
                  className="space-y-6"
                >
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                    Por que escolher a Azuria?
                  </h2>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Criamos a Azuria porque acreditamos que toda empresa, independente do tamanho, merece ter acesso a ferramentas de precificação profissionais e inteligentes.
                  </p>
                  <div className="space-y-4">
                    {[
                      "Cálculos precisos com IA especializada para o mercado brasileiro",
                      "Integração com principais marketplaces e ERPs",
                      "Interface intuitiva e fácil de usar",
                      "Suporte dedicado e atualizações constantes",
                      "Preços acessíveis para empresas de todos os portes"
                    ].map((feature, index) => (
                      <motion.div
                        key={index}
                        variants={reduceMotion ? undefined : itemVariants}
                        className="flex items-start gap-3"
                      >
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <p className="text-foreground">{feature}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  variants={reduceMotion ? undefined : itemVariants}
                  className="relative"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="p-6 border-2 border-primary/20 bg-primary/5">
                      <div className="flex items-center gap-3 mb-2">
                        <TrendingUp className="h-6 w-6 text-primary" />
                        <h3 className="font-semibold text-foreground">Precisão</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Cálculos baseados em dados reais do mercado brasileiro
                      </p>
                    </Card>
                    <Card className="p-6 border-2 border-primary/20 bg-primary/5">
                      <div className="flex items-center gap-3 mb-2">
                        <Zap className="h-6 w-6 text-primary" />
                        <h3 className="font-semibold text-foreground">Velocidade</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Resultados em segundos, não em horas
                      </p>
                    </Card>
                    <Card className="p-6 border-2 border-primary/20 bg-primary/5">
                      <div className="flex items-center gap-3 mb-2">
                        <Globe className="h-6 w-6 text-primary" />
                        <h3 className="font-semibold text-foreground">Integração</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Conecte-se com suas ferramentas favoritas
                      </p>
                    </Card>
                    <Card className="p-6 border-2 border-primary/20 bg-primary/5">
                      <div className="flex items-center gap-3 mb-2">
                        <Shield className="h-6 w-6 text-primary" />
                        <h3 className="font-semibold text-foreground">Confiável</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Segurança e privacidade garantidas
                      </p>
                    </Card>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* Nossa História */}
          <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
            <div className="container mx-auto max-w-4xl">
              <motion.div
                variants={reduceMotion ? undefined : itemVariants}
                className="text-center mb-12"
              >
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Nossa Jornada
                </h2>
                <p className="text-lg text-muted-foreground">
                  Uma breve história de como chegamos até aqui
                </p>
              </motion.div>

              <div className="space-y-8">
                {milestones.map((milestone, index) => (
                  <motion.div
                    key={index}
                    variants={reduceMotion ? undefined : itemVariants}
                    className="flex gap-6"
                  >
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                        {milestone.year.slice(-2)}
                      </div>
                      {index < milestones.length - 1 && (
                        <div className="w-0.5 h-full bg-border mt-2" />
                      )}
                    </div>
                    <div className="flex-1 pb-8">
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        {milestone.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {milestone.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Final */}
          <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8">
            <div className="container mx-auto max-w-4xl">
              <motion.div
                variants={reduceMotion ? undefined : itemVariants}
                className="text-center space-y-8 p-12 rounded-2xl bg-primary/10 border-2 border-primary/20"
              >
                <div className="space-y-4">
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                    Pronto para transformar sua precificação?
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Junte-se a centenas de empresas que já estão usando a Azuria para calcular preços ideais e maximizar seus lucros.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/cadastro">
                    <Button 
                      size="lg" 
                      className="h-12 px-8 text-base font-medium bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      Começar grátis
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link to="/planos">
                    <Button 
                      size="lg" 
                      variant="outline"
                      className="h-12 px-8 text-base font-medium border-2 border-primary/20 text-primary hover:bg-accent hover:border-primary/30"
                    >
                      Ver planos
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </section>
        </main>

        <Footer />
      </motion.div>
    </>
  );
}

