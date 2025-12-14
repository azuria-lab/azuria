
import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Briefcase, Building2, Quote, ShoppingBag, User, UserCircle } from "lucide-react";

const testimonials = [
  {
    name: "Renan Silva",
    role: "Lojista E-commerce",
    niche: "Eletrônicos",
    testimonial: "O Azuria transformou completamente nossa estratégia de precificação. Registramos aumento de 47% na lucratividade em apenas três meses de utilização.",
    result: "+47% lucratividade",
    icon: ShoppingBag
  },
  {
    name: "Mariana Costa",
    role: "Fundadora",
    niche: "Moda Feminina",
    testimonial: "Reduzimos em mais de 15 horas semanais o tempo dedicado a cálculos manuais de precificação. A inteligência artificial superou nossas expectativas.",
    result: "15h/sem economizadas",
    icon: UserCircle
  },
  {
    name: "Bruno Oliveira",
    role: "Empresário",
    niche: "Casa e Decoração",
    testimonial: "A análise competitiva nos permitiu identificar o posicionamento de preço ideal. Nossas vendas aumentaram 35% após a implementação da plataforma.",
    result: "+35% vendas",
    icon: Building2
  },
  {
    name: "Patrícia Santos",
    role: "CEO",
    niche: "Beleza e Cosméticos",
    testimonial: "O cálculo automático de impostos é extremamente preciso. Eliminamos completamente problemas relacionados à conformidade fiscal na precificação.",
    result: "100% preciso",
    icon: UserCircle
  },
  {
    name: "Fábio Lima",
    role: "Fundador",
    niche: "Esportes",
    testimonial: "A integração com marketplaces é excepcional. Atualizamos preços de centenas de produtos em minutos, processo que anteriormente demandava horas.",
    result: "90% mais rápido",
    icon: UserCircle
  },
  {
    name: "Carla Mendes",
    role: "Diretora Comercial",
    niche: "Alimentação",
    testimonial: "A plataforma oferece interface intuitiva e resultados imediatos. Recomendamos para empresas que buscam crescimento sustentável.",
    result: "+28% margem",
    icon: Briefcase
  },
  {
    name: "Roberto Alves",
    role: "Empreendedor",
    niche: "Tecnologia",
    testimonial: "O suporte técnico é excepcional e a plataforma entrega consistentemente os resultados prometidos. Excelente retorno sobre investimento.",
    result: "+42% ROI",
    icon: User
  }
];

// Componente para cada card de depoimento
const TestimonialCard: React.FC<{ testimonial: typeof testimonials[0] }> = ({ testimonial }) => {
  const Icon = testimonial.icon;
  return (
    <div className="flex-shrink-0 w-full md:w-[calc(50%-16px)] lg:w-[calc(33.333%-20px)] px-4">
      <div className="bg-card rounded-lg p-8 shadow-sm border border-border hover:shadow-lg transition-all h-full">
        {/* Quote Icon */}
        <div className="mb-4">
          <Quote className="h-8 w-8 text-primary opacity-50" />
        </div>

        {/* Testimonial */}
        <p className="text-muted-foreground mb-6 leading-relaxed text-base">
          "{testimonial.testimonial}"
        </p>

        {/* Author */}
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-foreground truncate">{testimonial.name}</p>
            <p className="text-sm text-muted-foreground truncate">{testimonial.role}</p>
            <p className="text-xs text-muted-foreground/70 truncate">{testimonial.niche}</p>
          </div>
        </div>

        {/* Result Badge */}
        <div className="inline-block px-4 py-2 bg-green-500 text-white rounded-full text-sm font-semibold">
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

  return (
    <section className="py-20 md:py-32 bg-background w-full">
      <div className="container mx-auto px-6 md:px-8 lg:px-12 w-full">
        <motion.div
          initial={reduceMotion ? undefined : { opacity: 0, y: 20 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={reduceMotion ? undefined : { duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mb-4 tracking-tight">
            Resultados Comprovados por Milhares de Empresas
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto font-light">
            Conheça os resultados obtidos por empresas que utilizam o Azuria
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
