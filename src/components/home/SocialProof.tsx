
import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DollarSign, Star, TrendingUp, Users } from "lucide-react";

export default function SocialProof() {
  const testimonials = [
    {
      name: "Carlos Silva",
      business: "Loja de Eletrônicos",
      avatar: "CS",
      rating: 5,
      text: "Aumentei 52% do lucro no primeiro mês. O Azuria+ mostrou que eu estava vendendo 30% abaixo do preço ideal!",
      result: "+52% lucro"
    },
    {
      name: "Ana Costa",
      business: "E-commerce de Moda",
      avatar: "AC",
      rating: 5,
      text: "A IA de precificação é impressionante. Analisa a concorrência automaticamente e sugere preços que realmente vendem.",
      result: "+R$ 15k/mês"
    },
    {
      name: "Roberto Lima",
      business: "Marketplace",
      avatar: "RL",
      rating: 5,
      text: "Economizo 10 horas por semana que gastava com planilhas. Agora foco em vender, não em calcular preços.",
      result: "10h economizadas"
    }
  ];

  const stats = [
    {
      icon: <Users className="h-8 w-8 text-brand-600" />,
      number: "10.247",
      label: "Lojistas ativos",
      detail: "Crescendo 25% ao mês"
    },
    {
      icon: <DollarSign className="h-8 w-8 text-green-600" />,
      number: "R$ 2,3M",
      label: "Em vendas processadas",
      detail: "Só neste mês"
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-blue-600" />,
      number: "47%",
      label: "Aumento médio de lucro",
      detail: "Nos primeiros 30 dias"
    },
    {
      icon: <Star className="h-8 w-8 text-yellow-500" />,
      number: "4.9",
      label: "Avaliação média",
      detail: "Baseado em 1.200+ reviews"
    }
  ];

  return (
    <section className="py-16 px-6">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="bg-green-100 text-green-800 mb-4">
            Resultados Comprovados
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Mais de <span className="text-brand-600">10.000 lojistas</span> já transformaram seus negócios
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Veja os resultados reais de quem decidiu parar de vender no prejuízo e começou a precificar com inteligência.
          </p>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <Card className="p-6 border-2 hover:border-brand-300 transition-all">
                <CardContent className="p-0">
                  <div className="flex justify-center mb-3">
                    {stat.icon}
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-foreground mb-1">
                    {stat.number}
                  </div>
                  <div className="font-medium text-foreground mb-1">
                    {stat.label}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.detail}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Depoimentos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full border-2 hover:border-brand-300 transition-all hover:shadow-lg">
                <CardContent className="p-6">
                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  
                  {/* Texto */}
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    "{testimonial.text}"
                  </p>
                  
                  {/* Resultado */}
                  <Badge className="bg-green-100 text-green-800 mb-4">
                    {testimonial.result}
                  </Badge>
                  
                  {/* Perfil */}
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src="" alt={testimonial.name} />
                      <AvatarFallback className="bg-brand-100 text-brand-800">
                        {testimonial.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-foreground">
                        {testimonial.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {testimonial.business}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Selo de Confiança */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-4 bg-gray-100 dark:bg-gray-800 rounded-full px-6 py-3">
            <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-medium">
              Avaliado como #1 em Precificação Inteligente no Brasil
            </span>
            <Badge variant="secondary">Reclame Aqui: 9.8/10</Badge>
          </div>
        </div>
      </div>
    </section>
  );
}
