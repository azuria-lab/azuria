
import React from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";

const HeroSectionBling: React.FC = () => {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-background w-full">
      {/* Background Elements - Suaves e Premium */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#148D8D]/3 rounded-full blur-3xl opacity-20" />
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-12 sm:py-16 md:py-20 lg:py-32 w-full">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
            {/* Left Column - Text Content */}
            <motion.div
              initial={reduceMotion ? undefined : { opacity: 0, y: 30 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={reduceMotion ? undefined : { duration: 0.6 }}
              className="space-y-6 sm:space-y-8"
            >
              {/* Headline */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight text-foreground tracking-tight">
                Precificação Inteligente que{" "}
                <span className="text-primary">Maximiza Lucros</span> e Otimiza Operações
              </h1>

              {/* Subheadline */}
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl font-light">
                Plataforma de precificação com inteligência artificial especializada no mercado brasileiro. Calcule preços ideais considerando custos, impostos, concorrência e margem de lucro desejada.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
                <Link to="/cadastro" className="w-full sm:w-auto">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      size="lg"
                      className="w-full sm:w-auto h-12 min-h-[44px] px-6 sm:px-8 text-base font-medium bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      Iniciar teste gratuito
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </motion.div>
                </Link>
                <Link to="/planos" className="w-full sm:w-auto">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full sm:w-auto h-12 min-h-[44px] px-6 sm:px-8 text-base font-medium border-2 border-primary/20 text-primary hover:bg-accent hover:border-primary/30 rounded-lg transition-all duration-200"
                    >
                      Ver planos e preços
                    </Button>
                  </motion.div>
                </Link>
              </div>

              {/* Prova Social */}
              <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-4 sm:gap-6 pt-2">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-5 h-5 rounded-full bg-green-500/10 flex-shrink-0">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-sm sm:text-base text-muted-foreground font-medium">Teste gratuito de 30 dias</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-5 h-5 rounded-full bg-green-500/10 flex-shrink-0">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-sm sm:text-base text-muted-foreground font-medium">Sem necessidade de cartão de crédito</span>
                </div>
              </div>

              {/* Social Proof */}
              <div className="pt-2">
                <p className="text-sm sm:text-base md:text-lg text-muted-foreground">
                  <span className="font-semibold text-foreground">Mais de 10.000 empresas</span> confiam no Azuria para otimizar sua precificação
                </p>
              </div>
            </motion.div>

            {/* Right Column - Image/Illustration */}
            <motion.div
              initial={reduceMotion ? undefined : { opacity: 0, x: 30 }}
              animate={reduceMotion ? undefined : { opacity: 1, x: 0 }}
              transition={reduceMotion ? undefined : { duration: 0.6, delay: 0.2 }}
              className="relative flex justify-center items-center"
            >
              <div className="relative w-full max-w-lg">
                {/* Personagem Azuria AI - Melhorado */}
                <div className="relative z-10">
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border/50 bg-card/50 backdrop-blur-sm">
                    <picture>
                      <source 
                        type="image/png" 
                        srcSet="/images/azuria/avatar-optimized.png" 
                      />
                      <img
                        src="/images/azuria/avatar.jpg"
                        alt="Azuria AI - Assistente de Precificação Inteligente"
                        className="w-full h-auto object-cover rounded-2xl"
                        width={600}
                        height={600}
                        loading="eager"
                        decoding="async"
                        style={{ imageRendering: 'auto' }}
                      />
                    </picture>
                    
                    {/* Overlay sutil para melhor integração */}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/20 via-transparent to-transparent pointer-events-none rounded-2xl" />
                  </div>
                </div>
                
                {/* Decorative Elements - Premium */}
                <div className="absolute -top-6 -right-6 w-32 h-32 bg-primary/10 rounded-full blur-2xl opacity-60 animate-pulse" />
                <div className="absolute -bottom-6 -left-6 w-40 h-40 bg-[#148D8D]/10 rounded-full blur-3xl opacity-40" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/5 rounded-full blur-3xl -z-10" />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSectionBling;

