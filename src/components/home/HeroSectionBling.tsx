
import React from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";
import { OptimizedImage } from "@/components/performance/OptimizedImage";

const HeroSectionBling: React.FC = () => {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-[#F8FBFF] w-full">
      {/* Background Elements - Suaves */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#EAF6FF] rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#EAF6FF] rounded-full blur-3xl opacity-30" />
      </div>

      <div className="relative container mx-auto px-4 py-20 md:py-32 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <motion.div
            initial={reduceMotion ? undefined : { opacity: 0, y: 30 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={reduceMotion ? undefined : { duration: 0.6 }}
            className="space-y-8"
          >
            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-[#0A1930]">
              Precificação Inteligente para{" "}
              <span className="text-[#005BFF]">Vender com Mais Lucro</span> e Menos Esforço.
            </h1>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-gray-600 leading-relaxed max-w-2xl">
              Nossa IA especializada analisa custos, concorrentes e tributos brasileiros para calcular o preço ideal que maximiza seus lucros automaticamente.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/cadastro">
                <Button
                  size="lg"
                  className="bg-[#005BFF] hover:bg-[#0048CC] text-white px-8 py-6 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
                >
                  Comece grátis agora
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/planos">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-[#005BFF] text-[#005BFF] hover:bg-[#EAF6FF] px-8 py-6 text-lg font-semibold rounded-lg"
                >
                  Ver planos e preços
                </Button>
              </Link>
            </div>

            {/* Prova Social */}
            <div className="flex items-center gap-6 pt-4">
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-[#0BA360]" />
                <span className="text-gray-700 font-medium">Teste grátis 30 dias</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-[#0BA360]" />
                <span className="text-gray-700 font-medium">Sem cartão de crédito</span>
              </div>
            </div>

            {/* Social Proof */}
            <div className="pt-4">
              <p className="text-gray-600 text-lg">
                <span className="font-bold text-[#0A1930]">+10.000 lojistas</span> usam o Azuria todos os dias
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
            <div className="relative">
              {/* Personagem Azuria AI */}
              <div className="relative z-10">
                <OptimizedImage
                  src="/images/azuria/avatar.jpg"
                  alt="Azuria AI - Assistente de Precificação Inteligente"
                  className="w-full max-w-md h-auto rounded-2xl shadow-2xl"
                  width={500}
                  height={500}
                  lazy={false}
                />
              </div>
              
              {/* Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-[#00C2FF] rounded-full opacity-20 blur-xl" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-[#005BFF] rounded-full opacity-10 blur-2xl" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSectionBling;

