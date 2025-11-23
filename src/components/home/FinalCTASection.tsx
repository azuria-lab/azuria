
import React from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const FinalCTASection: React.FC = () => {
  const reduceMotion = useReducedMotion();

  return (
    <section className="py-20 md:py-32 bg-gradient-to-br from-[#005BFF] to-[#0048CC] relative overflow-hidden w-full">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00C2FF] rounded-full blur-3xl opacity-20" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#00C2FF] rounded-full blur-3xl opacity-20" />
      </div>

      <div className="relative container mx-auto px-4 w-full">
        <motion.div
          initial={reduceMotion ? undefined : { opacity: 0, y: 30 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={reduceMotion ? undefined : { duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            Pronto para vender com mais lucro e menos esforço?
          </h2>

          <p className="text-xl md:text-2xl text-white/90 mb-10 leading-relaxed">
            Comece seu teste grátis de 30 dias agora mesmo. Sem cartão de crédito, sem compromisso.
          </p>

          <Link to="/cadastro">
            <Button
              size="lg"
              className="bg-white text-[#005BFF] hover:bg-gray-100 px-10 py-7 text-lg font-bold rounded-lg shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105"
            >
              Comece grátis agora
              <ArrowRight className="ml-2 h-6 w-6" />
            </Button>
          </Link>

          <p className="text-white/80 mt-6 text-sm">
            ✓ Teste grátis 30 dias • ✓ Sem cartão de crédito • ✓ Cancele quando quiser
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default FinalCTASection;

