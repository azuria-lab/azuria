
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle, Clock, Star } from "lucide-react";

export default function TrialBanner() {
  return (
    <section className="py-16 px-6 bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center text-white"
        >
          <Badge className="bg-white/20 text-white border-white/30 mb-6">
            <Star className="h-4 w-4 mr-1 fill-yellow-400 text-yellow-400" />
            Oferta Especial
          </Badge>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Teste GRÁTIS por 7 dias
          </h2>
          
          <p className="text-xl text-brand-100 mb-8 max-w-3xl mx-auto">
            Experimente todos os recursos PRO sem compromisso. 
            Cancele quando quiser, sem taxas ou burocracias.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Acesso Completo</h3>
              <p className="text-brand-100 text-sm">
                Todas as calculadoras, análises e recursos PRO desbloqueados
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <Clock className="h-8 w-8 text-blue-400 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">7 Dias Completos</h3>
              <p className="text-brand-100 text-sm">
                Tempo suficiente para testar em seus produtos reais
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Sem Compromisso</h3>
              <p className="text-brand-100 text-sm">
                Cancele quando quiser, direto na sua conta
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/planos">
              <Button 
                size="lg" 
                className="bg-white text-brand-700 hover:bg-brand-50 shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] px-8 py-6 text-lg"
              >
                Começar Trial Gratuito
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            
            <div className="flex items-center gap-2 text-brand-100">
              <Clock className="h-4 w-4" />
              <span className="text-sm">Ativação instantânea</span>
            </div>
          </div>
          
          <p className="text-xs text-brand-200 mt-6">
            * Após o período de teste, a cobrança será de R$ 29,90/mês. 
            Cancele antes do 7º dia para não ser cobrado.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
