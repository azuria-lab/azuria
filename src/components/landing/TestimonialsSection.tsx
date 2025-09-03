
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Marina Silva",
    role: "Proprietária da Loja Flor & Arte",
    avatar: "MS",
    rating: 5,
    content: "Desde que comecei a usar o Precifica+, meus lucros aumentaram 35%. A calculadora PRO me ajuda a precificar considerando todos os custos dos marketplaces.",
    results: "Aumento de 35% no lucro"
  },
  {
    id: 2,
    name: "Carlos Mendes",
    role: "E-commerce de Eletrônicos",
    avatar: "CM",
    rating: 5,
    content: "A análise de concorrência automática é incrível! Agora sei exatamente como posicionar meus preços no mercado e ainda manter margem saudável.",
    results: "Preços 12% mais competitivos"
  },
  {
    id: 3,
    name: "Ana Beatriz",
    role: "Revendedora no Instagram",
    avatar: "AB",
    rating: 5,
    content: "Consegui organizar minha precificação e agora tenho clareza total dos meus custos. O app é muito fácil de usar, até no celular!",
    results: "Organização total da precificação"
  }
];

export default function TestimonialsSection() {
  return (
    <section className="py-16 px-6 bg-gray-50">
      <div className="container mx-auto max-w-6xl">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold mb-4">
            Mais de 1.000 lojistas já aumentaram seus lucros
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Veja como empreendedores como você estão transformando seus negócios 
            com precificação inteligente.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
            >
              <Card className="h-full border-brand-100 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-brand-100 text-brand-700">
                        {testimonial.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-4">
                      <h4 className="font-semibold">{testimonial.name}</h4>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                    </div>
                  </div>
                  
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  
                  <blockquote className="text-gray-700 mb-4 italic">
                    "{testimonial.content}"
                  </blockquote>
                  
                  <div className="bg-brand-50 p-3 rounded-lg">
                    <p className="text-brand-700 font-medium text-sm">
                      📈 {testimonial.results}
                    </p>
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
