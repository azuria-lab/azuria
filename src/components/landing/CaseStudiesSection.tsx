
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, Users } from "lucide-react";

const caseStudies = [
  {
    id: 1,
    title: "Loja de Roupas Femininas",
    industry: "Moda",
    challenge: "Dificuldade para precificar considerando frete grátis e comissões",
    solution: "Calculadora PRO com análise de marketplaces",
    results: [
      { metric: "Aumento no lucro", value: "42%", icon: TrendingUp },
      { metric: "Tempo economizado", value: "15h/semana", icon: Users },
      { metric: "Receita adicional", value: "R$ 12.500/mês", icon: DollarSign }
    ],
    description: "Com a calculadora PRO, conseguiu otimizar preços para Mercado Livre, Shopee e loja própria, mantendo margens saudáveis em todos os canais."
  },
  {
    id: 2,
    title: "Distribuidora de Eletrônicos",
    industry: "Eletrônicos",
    challenge: "Concorrência acirrada e necessidade de preços competitivos",
    solution: "Análise de concorrência automática + calculadora avançada",
    results: [
      { metric: "Posicionamento", value: "Top 3", icon: TrendingUp },
      { metric: "Conversão", value: "+28%", icon: Users },
      { metric: "Margem média", value: "22%", icon: DollarSign }
    ],
    description: "A análise automática de concorrentes permitiu posicionar preços de forma estratégica, mantendo competitividade sem sacrificar margem."
  },
  {
    id: 3,
    title: "Pequeno Varejista Online",
    industry: "Varejo",
    challenge: "Gestão manual de preços e custos desorganizados",
    solution: "Calculadora básica + organização de custos",
    results: [
      { metric: "Organização", value: "100%", icon: TrendingUp },
      { metric: "Erros reduzidos", value: "90%", icon: Users },
      { metric: "Lucro real", value: "+18%", icon: DollarSign }
    ],
    description: "Organizou completamente a estrutura de custos e descobriu oportunidades de melhoria que estavam ocultas na gestão manual."
  }
];

export default function CaseStudiesSection() {
  return (
    <section className="py-16 px-6">
      <div className="container mx-auto max-w-6xl">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold mb-4">Cases de Sucesso Reais</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Descubra como diferentes tipos de negócio estão usando o Precifica+ 
            para resolver seus desafios específicos de precificação.
          </p>
        </motion.div>
        
        <div className="space-y-8">
          {caseStudies.map((caseStudy, index) => (
            <motion.div
              key={caseStudy.id}
              initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
            >
              <Card className="border-brand-100 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{caseStudy.title}</CardTitle>
                      <Badge variant="secondary" className="mt-2">
                        {caseStudy.industry}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-red-700 mb-2">❌ Desafio:</h4>
                        <p className="text-gray-600">{caseStudy.challenge}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-blue-700 mb-2">💡 Solução:</h4>
                        <p className="text-gray-600">{caseStudy.solution}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-green-700 mb-2">📊 Resultado:</h4>
                        <p className="text-gray-600">{caseStudy.description}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4">
                      {caseStudy.results.map((result, idx) => (
                        <div key={idx} className="bg-gray-50 p-4 rounded-lg flex items-center gap-3">
                          <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center">
                            <result.icon className="h-5 w-5 text-brand-600" />
                          </div>
                          <div>
                            <p className="font-bold text-lg text-brand-700">{result.value}</p>
                            <p className="text-sm text-gray-600">{result.metric}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
