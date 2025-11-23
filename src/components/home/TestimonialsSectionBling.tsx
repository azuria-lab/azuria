
import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Quote } from "lucide-react";

const testimonials = [
  {
    name: "Renan Silva",
    role: "Lojista E-commerce",
    niche: "Eletrônicos",
    testimonial: "O Azuria transformou completamente minha estratégia de precificação. Aumentei meus lucros em 47% em apenas 3 meses!",
    result: "+47% lucro",
    avatar: "👤"
  },
  {
    name: "Mariana Costa",
    role: "Fundadora",
    niche: "Moda Feminina",
    testimonial: "Economizo mais de 15 horas por semana que antes gastava calculando preços manualmente. A IA é incrível!",
    result: "15h/sem economizadas",
    avatar: "👩"
  },
  {
    name: "Bruno Oliveira",
    role: "Empresário",
    niche: "Casa e Decoração",
    testimonial: "A análise de concorrência me ajudou a encontrar o preço ideal. Minhas vendas aumentaram 35% desde que comecei a usar.",
    result: "+35% vendas",
    avatar: "👨"
  },
  {
    name: "Patrícia Santos",
    role: "CEO",
    niche: "Beleza e Cosméticos",
    testimonial: "O cálculo automático de impostos é perfeito. Nunca mais tive problemas com questões fiscais na precificação.",
    result: "100% preciso",
    avatar: "👩‍💼"
  },
  {
    name: "Fábio Lima",
    role: "Fundador",
    niche: "Esportes",
    testimonial: "A integração com marketplaces é fantástica. Atualizo preços de centenas de produtos em minutos, não mais em horas.",
    result: "90% mais rápido",
    avatar: "👨‍💼"
  },
  {
    name: "Carla Mendes",
    role: "Diretora Comercial",
    niche: "Alimentação",
    testimonial: "A plataforma é intuitiva e os resultados são imediatos. Recomendo para qualquer lojista que quer crescer.",
    result: "+28% margem",
    avatar: "👩‍💼"
  },
  {
    name: "Roberto Alves",
    role: "Empreendedor",
    niche: "Tecnologia",
    testimonial: "O suporte é excepcional e a plataforma realmente entrega o que promete. Vale cada centavo investido!",
    result: "+42% ROI",
    avatar: "👨"
  }
];

// Componente para cada card de depoimento
const TestimonialCard: React.FC<{ testimonial: typeof testimonials[0] }> = ({ testimonial }) => {
  return (
    <div className="flex-shrink-0 w-full md:w-[calc(50%-16px)] lg:w-[calc(33.333%-20px)] px-4">
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow h-full">
        {/* Quote Icon */}
        <div className="mb-4">
          <Quote className="h-8 w-8 text-[#005BFF] opacity-50" />
        </div>

        {/* Testimonial */}
        <p className="text-gray-700 mb-6 leading-relaxed text-lg">
          "{testimonial.testimonial}"
        </p>

        {/* Author */}
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-[#EAF6FF] flex items-center justify-center text-2xl flex-shrink-0">
            {testimonial.avatar}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-[#0A1930] truncate">{testimonial.name}</p>
            <p className="text-sm text-gray-600 truncate">{testimonial.role}</p>
            <p className="text-xs text-gray-500 truncate">{testimonial.niche}</p>
          </div>
        </div>

        {/* Result Badge */}
        <div className="inline-block px-4 py-2 bg-[#0BA360] text-white rounded-full text-sm font-semibold">
          {testimonial.result}
        </div>
      </div>
    </div>
  );
};

const TestimonialsSectionBling: React.FC = () => {
  const reduceMotion = useReducedMotion();

  // Duplicar depoimentos várias vezes para criar loop infinito perfeito
  // A chave é ter múltiplas cópias idênticas para que quando a animação reinicia,
  // a posição visual seja exatamente a mesma, criando um loop perfeito sem salto
  // Usamos 3 cópias para garantir que sempre haja conteúdo visível durante a transição
  const duplicatedTestimonials = [
    ...testimonials, 
    ...testimonials, 
    ...testimonials
  ];

  // Calcular a porcentagem exata baseada no número de testimonials
  // Como temos 3 cópias, mover 1/3 (33.333%) faz o loop perfeito
  const animationPercentage = 100 / 3; // 33.333%

  return (
    <section className="py-20 md:py-32 bg-white w-full">
      <div className="container mx-auto px-4 w-full">
        <motion.div
          initial={reduceMotion ? undefined : { opacity: 0, y: 20 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={reduceMotion ? undefined : { duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#0A1930] mb-4">
            Ajudamos milhares de empreendedores a simplificar seus negócios
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Veja o que estão falando sobre o Azuria
          </p>
        </motion.div>

        <div className="max-w-7xl mx-auto">
          {/* Carrossel Container com movimento contínuo infinito */}
          <div className="relative overflow-hidden">
            <div
              className="flex"
              style={{
                animation: reduceMotion 
                  ? 'none' 
                  : 'scroll-testimonials-infinite 60s linear infinite',
                willChange: reduceMotion ? 'auto' : 'transform',
              }}
            >
              {duplicatedTestimonials.map((testimonial, index) => (
                <TestimonialCard
                  key={`${testimonial.name}-${index}`}
                  testimonial={testimonial}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CSS para animação contínua infinita - loop perfeito sem salto */}
      <style>{`
        @keyframes scroll-testimonials-infinite {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            /* Move exatamente 1/3 do conteúdo total (uma cópia completa dos testimonials) */
            /* Como temos 3 cópias idênticas, quando a animação reinicia em 0%,
               a posição visual é exatamente a mesma, criando um loop perfeito */
            transform: translate3d(-33.333%, 0, 0);
          }
        }
      `}</style>
    </section>
  );
};

export default TestimonialsSectionBling;
