
import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Clock, 
  Shield, 
  Smartphone, 
  Target,
  TrendingUp,
  Users,
  Zap
} from "lucide-react";

const BenefitsShowcaseSection: React.FC = () => {
  const benefits = [
    {
      icon: TrendingUp,
      title: "Aumento Real no Lucro",
      description: "Nossos usuários reportam aumento médio de 47% na margem de lucro após otimizar preços.",
      stats: "+47% lucro médio",
      color: "from-green-500 to-emerald-600"
    },
    {
      icon: Clock,
      title: "Economia de Tempo",
      description: "Automatize cálculos complexos que levariam horas para fazer manualmente.",
      stats: "15h economizadas/semana",
      color: "from-blue-500 to-cyan-600"
    },
    {
      icon: Brain,
      title: "IA Especializada",
      description: "Inteligência artificial treinada especificamente para precificação de produtos brasileiros.",
      stats: "99% precisão",
      color: "from-purple-500 to-violet-600"
    },
    {
      icon: Target,
      title: "Análise de Mercado",
      description: "Compare automaticamente com concorrentes e encontre o ponto ideal de preço.",
      stats: "Análise em tempo real",
      color: "from-orange-500 to-red-600"
    },
    {
      icon: Shield,
      title: "Cálculos Confiáveis",
      description: "Considere todos os impostos, taxas e custos específicos do seu negócio.",
      stats: "100% dos impostos",
      color: "from-indigo-500 to-blue-600"
    },
    {
      icon: Smartphone,
      title: "Acesso Móvel",
      description: "Use em qualquer dispositivo, a qualquer hora, onde estiver.",
      stats: "Disponível 24/7",
      color: "from-pink-500 to-rose-600"
    }
  ];

  return (
    <section className="py-16 px-4 bg-white dark:bg-gray-900">
      <div className="container mx-auto max-w-7xl">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Badge className="bg-blue-100 text-blue-800 border-blue-200 mb-4">
            Por que escolher o Azuria?
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Resultados comprovados por milhares de lojistas
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Não é apenas uma calculadora. É uma solução completa que transforma como você precifica seus produtos.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => {
            const IconComponent = benefit.icon;
            return (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 group">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${benefit.color} flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2 text-foreground">
                          {benefit.title}
                        </h3>
                        <p className="text-muted-foreground mb-3 leading-relaxed">
                          {benefit.description}
                        </p>
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${benefit.color} text-white`}>
                          {benefit.stats}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* CTA Section */}
        <motion.div 
          className="text-center mt-16 p-8 bg-gradient-to-r from-brand-500 to-brand-600 rounded-2xl text-white"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center justify-center mb-4">
            <Zap className="h-8 w-8 mr-3" />
            <h3 className="text-2xl font-bold">
              Pronto para aumentar seus lucros?
            </h3>
          </div>
          <p className="text-xl mb-6 text-brand-100">
            Junte-se a mais de 10.000 lojistas que já transformaram seus resultados.
          </p>
          <div className="flex items-center justify-center gap-6 text-brand-100">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <span>Sem compromisso</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <span>Resultado em 30 segundos</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <span>100% seguro</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default BenefitsShowcaseSection;
