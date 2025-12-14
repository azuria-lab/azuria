
import React from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const FinalCTASection: React.FC = () => {
  const reduceMotion = useReducedMotion();

  return (
    <section className="py-20 md:py-32 bg-primary relative overflow-hidden w-full">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#148D8D]/10 rounded-full blur-3xl opacity-30" />
      </div>

      <div className="relative container mx-auto px-6 md:px-8 lg:px-12 w-full">
        <motion.div
          initial={reduceMotion ? undefined : { opacity: 0, y: 30 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={reduceMotion ? undefined : { duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-primary-foreground mb-6 tracking-tight">
            Pronto para Otimizar sua Precificação?
          </h2>

          <p className="text-lg md:text-xl text-primary-foreground/90 mb-10 leading-relaxed font-light">
            Inicie seu período de teste gratuito de 30 dias. Sem necessidade de cartão de crédito e sem compromisso.
          </p>

          <Link to="/cadastro">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                size="lg"
                className="h-14 px-10 text-lg font-medium bg-background text-foreground hover:bg-background/90 rounded-lg shadow-2xl hover:shadow-3xl transition-all duration-200"
              >
                Iniciar teste gratuito
                <ArrowRight className="ml-2 h-6 w-6" />
              </Button>
            </motion.div>
          </Link>

          <p className="text-primary-foreground/80 mt-6 text-sm">
            ✓ Teste gratuito de 30 dias • ✓ Sem necessidade de cartão de crédito • ✓ Cancele a qualquer momento
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default FinalCTASection;

