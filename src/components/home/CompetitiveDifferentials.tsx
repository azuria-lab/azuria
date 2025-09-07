
import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  ArrowRight, 
  BarChart, 
  Brain, 
  Calculator, 
  CheckCircle, 
  Crown, 
  TrendingUp,
  Zap
} from "lucide-react";

export default function CompetitiveDifferentials() {
  const differentials = [
    {
      icon: <Brain className="h-8 w-8 text-brand-600" />,
      title: "IA de Precificação Avançada",
      description: "Algoritmos que analisam 50+ variáveis do mercado em tempo real",
      highlight: "Exclusivo do Azuria",
      details: ["Análise de concorrência automática", "Previsão de demanda", "Otimização de margem dinâmica"]
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-green-600" />,
      title: "Aumento Comprovado de 47%",
      description: "Média de aumento de lucro dos nossos usuários nos primeiros 30 dias",
      highlight: "Resultado Garantido",
      details: ["Baseado em 10.000+ cálculos", "Monitoramento contínuo", "Suporte especializado"]
    },
    {
      icon: <Zap className="h-8 w-8 text-yellow-600" />,
      title: "Cálculo em 30 Segundos",
      description: "O que levaria horas de planilha, resolvemos instantaneamente",
      highlight: "Mais Rápido do Mercado",
      details: ["Interface intuitiva", "Sem curva de aprendizado", "Resultados imediatos"]
    }
  ];

  const competitors = [
    { name: "Planilhas Excel", price: "Grátis", ia: false, tempo: "2-3 horas", precisao: "60%", suporte: false },
    { name: "Outros Apps", price: "R$ 99/mês", ia: false, tempo: "15 min", precisao: "75%", suporte: "Básico" },
    { name: "Azuria PRO", price: "R$ 47/mês", ia: true, tempo: "30 seg", precisao: "95%", suporte: "Especializado", highlight: true }
  ];

  return (
    <section className="py-16 px-6 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="bg-brand-100 text-brand-800 mb-4">
            Por que escolher Azuria?
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            O único com IA que <span className="text-brand-600">realmente funciona</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Enquanto outros cobram mais e entregam menos, nós revolucionamos a precificação com tecnologia de ponta.
          </p>
        </div>

        {/* Diferenciais Competitivos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {differentials.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full border-2 hover:border-brand-300 transition-all hover:shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    {item.icon}
                    <Badge variant="secondary" className="text-xs">
                      {item.highlight}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{item.description}</p>
                  <ul className="space-y-2">
                    {item.details.map((detail, i) => (
                      <li key={i} className="flex items-center text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Tabela Comparativa */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-12">
          <h3 className="text-2xl font-bold text-center mb-8">
            Compare e veja a diferença
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-4 px-4">Solução</th>
                  <th className="text-center py-4 px-4">Preço</th>
                  <th className="text-center py-4 px-4">IA Avançada</th>
                  <th className="text-center py-4 px-4">Tempo</th>
                  <th className="text-center py-4 px-4">Precisão</th>
                  <th className="text-center py-4 px-4">Suporte</th>
                </tr>
              </thead>
              <tbody>
                {competitors.map((comp, index) => (
                  <tr 
                    key={index} 
                    className={`border-b ${comp.highlight ? 'bg-brand-50 dark:bg-brand-950' : ''}`}
                  >
                    <td className="py-4 px-4 font-medium">
                      {comp.highlight && <Crown className="h-4 w-4 text-brand-600 inline mr-2" />}
                      {comp.name}
                    </td>
                    <td className="text-center py-4 px-4">
                      <span className={comp.highlight ? 'text-brand-600 font-bold' : ''}>
                        {comp.price}
                      </span>
                    </td>
                    <td className="text-center py-4 px-4">
                      {comp.ia ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                      ) : (
                        <span className="text-red-500">✗</span>
                      )}
                    </td>
                    <td className="text-center py-4 px-4">{comp.tempo}</td>
                    <td className="text-center py-4 px-4">
                      <span className={comp.highlight ? 'text-green-600 font-bold' : ''}>
                        {comp.precisao}
                      </span>
                    </td>
                    <td className="text-center py-4 px-4">{comp.suporte}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* CTA Final */}
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-4">
            Pronto para ter a precificação mais inteligente do mercado?
          </h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Junte-se aos milhares de lojistas que já descobriram como vender mais e lucrar melhor.
          </p>
          
          <div className="flex justify-center gap-4 flex-wrap">
            <Link to="/calculadora-simples">
              <Button size="lg" className="bg-brand-600 hover:bg-brand-700 px-8 py-6">
                <Calculator className="mr-2 h-5 w-5" />
                Começar Grátis Agora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/planos">
              <Button size="lg" variant="outline" className="px-8 py-6">
                <BarChart className="mr-2 h-5 w-5" />
                Ver Planos PRO
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
