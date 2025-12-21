import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ArrowRight,
  BookOpen,
  Calculator,
  CreditCard,
  FileText,
  HelpCircle,
  Mail,
  MessageCircle,
  Rocket,
  Search,
  Settings,
  Shield,
  Video
} from "lucide-react";
import { Link } from "react-router-dom";

const faqCategories = [
  {
    title: "Primeiros Passos",
    icon: Rocket,
    questions: [
      {
        question: "Como começar a usar o Azuria?",
        answer: "Para começar, faça seu cadastro gratuito e acesse o Dashboard. Lá você encontrará a Calculadora Rápida, que é a forma mais simples de calcular preços. Basta inserir o custo do produto, margem desejada e impostos, e o Azuria calculará o preço ideal automaticamente."
      },
      {
        question: "Preciso de cartão de crédito para começar?",
        answer: "Não! Você pode começar gratuitamente sem precisar informar dados de pagamento. O plano gratuito permite 5 cálculos por dia na Calculadora Rápida, o suficiente para testar todas as funcionalidades."
      },
      {
        question: "Qual a diferença entre Calculadora Rápida e Avançada?",
        answer: "A Calculadora Rápida é ideal para cálculos simples e rápidos, perfeita para uso diário. A Calculadora Avançada oferece mais opções de configuração, análise de cenários, múltiplos produtos e integração com dados históricos."
      }
    ]
  },
  {
    title: "Calculadoras",
    icon: Calculator,
    questions: [
      {
        question: "Como funciona o cálculo de preços?",
        answer: "O Azuria considera custos do produto, custos operacionais, impostos aplicáveis e a margem desejada para calcular o preço final. Todos os cálculos são adaptados à realidade fiscal brasileira."
      },
      {
        question: "Posso calcular preços em lote?",
        answer: "Sim! Com o plano PRO ou superior, você pode usar a Calculadora em Lote para processar múltiplos produtos de uma vez, economizando tempo e garantindo consistência nos preços."
      },
      {
        question: "Como o Azuria calcula impostos?",
        answer: "O sistema considera automaticamente impostos como ICMS, PIS, COFINS e outros, baseado no regime tributário e nas configurações da sua empresa. Você pode personalizar essas configurações nas Configurações da Empresa."
      }
    ]
  },
  {
    title: "Planos e Pagamentos",
    icon: CreditCard,
    questions: [
      {
        question: "Quais são os planos disponíveis?",
        answer: "Oferecemos três planos: Gratuito (5 cálculos/dia), PRO (ilimitado + recursos avançados) e Executivo (recursos premium + suporte prioritário). Veja todos os detalhes na página de Planos."
      },
      {
        question: "Posso cancelar minha assinatura a qualquer momento?",
        answer: "Sim, você pode cancelar sua assinatura a qualquer momento sem multas ou taxas. Você continuará tendo acesso aos recursos até o final do período pago."
      },
      {
        question: "Como funciona o período de teste?",
        answer: "O plano PRO oferece 7 dias grátis para você testar todos os recursos. Não é necessário cartão de crédito para começar o teste."
      }
    ]
  },
  {
    title: "Segurança e Privacidade",
    icon: Shield,
    questions: [
      {
        question: "Meus dados estão seguros?",
        answer: "Sim. Utilizamos criptografia de ponta a ponta, servidores seguros e seguimos todas as normas da LGPD. Seus dados são protegidos e nunca compartilhados com terceiros sem sua autorização."
      },
      {
        question: "O Azuria armazena informações de pagamento?",
        answer: "Não armazenamos dados de cartão de crédito. Todo processamento de pagamento é feito através de provedores seguros e certificados (PCI-DSS)."
      },
      {
        question: "Posso exportar meus dados?",
        answer: "Sim, você pode exportar todos os seus dados a qualquer momento através das configurações da conta. Respeitamos seu direito à portabilidade de dados conforme a LGPD."
      }
    ]
  },
  {
    title: "Integrações",
    icon: Settings,
    questions: [
      {
        question: "O Azuria se integra com marketplaces?",
        answer: "Sim! Oferecemos integração com os principais marketplaces brasileiros, permitindo sincronização automática de preços e análise comparativa de taxas."
      },
      {
        question: "Há API disponível?",
        answer: "Sim, oferecemos API completa para integração com seus sistemas. Consulte a documentação da API na área logada ou entre em contato para mais informações."
      },
      {
        question: "Posso integrar com meu ERP?",
        answer: "Estamos trabalhando em integrações com os principais ERPs do mercado. Entre em contato para saber mais sobre disponibilidade e roadmap."
      }
    ]
  }
];

const quickLinks = [
  {
    title: "Documentação",
    description: "Guias completos e detalhados",
    icon: BookOpen,
    href: "#"
  },
  {
    title: "Tutoriais",
    description: "Vídeos explicativos passo a passo",
    icon: Video,
    href: "#"
  },
  {
    title: "Suporte",
    description: "Fale diretamente com nossa equipe",
    icon: MessageCircle,
    href: "/ajuda"
  },
  {
    title: "Status",
    description: "Status do sistema em tempo real",
    icon: FileText,
    href: "#"
  }
];

export default function HelpCenterPage() {
  const shouldReduceMotion = useReducedMotion();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFAQs = faqCategories.map(category => ({
    ...category,
    questions: category.questions.filter(q => 
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <>
      <Helmet>
        <title>Central de Ajuda | Azuria</title>
        <meta name="description" content="Encontre respostas para suas dúvidas sobre o Azuria. Guias, tutoriais e FAQ completo." />
      </Helmet>

      <div className="flex flex-col min-h-screen bg-background">
        <Header />

        <main className="flex-1">
          {/* Hero Section */}
          <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 max-w-4xl">
            <motion.div
              initial={shouldReduceMotion ? undefined : { opacity: 0, y: 20 }}
              animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-center space-y-6"
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground">
                Central de Ajuda
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Encontre respostas rápidas para suas dúvidas ou entre em contato com nosso suporte.
              </p>
              
              {/* Search Bar */}
              <div className="max-w-2xl mx-auto pt-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar ajuda..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-14 text-base border-2 focus:border-primary/50"
                  />
                </div>
              </div>
            </motion.div>
          </section>

          {/* Quick Links Section */}
          <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 max-w-7xl">
            <motion.div
              initial={shouldReduceMotion ? undefined : { opacity: 0, y: 20 }}
              whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="space-y-8"
            >
              <div className="text-center space-y-4 max-w-3xl mx-auto">
                <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
                  Recursos de ajuda disponíveis.
                </h2>
                <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                  Acesse documentação, tutoriais e suporte quando precisar.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickLinks.map((link, index) => {
                  const Icon = link.icon;
                  return (
                    <motion.div
                      key={link.title}
                      initial={shouldReduceMotion ? undefined : { opacity: 0, y: 20 }}
                      whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Link to={link.href}>
                        <div className="group relative text-left p-6 rounded-xl border transition-all duration-200 bg-background hover:shadow-md border-border hover:border-foreground/20 cursor-pointer h-full">
                          <div className="flex flex-col space-y-4">
                            <div className="p-3 rounded-lg bg-muted/50 w-fit transition-colors group-hover:bg-primary/10">
                              <Icon className="h-6 w-6 text-foreground/70 transition-colors group-hover:text-primary" />
                            </div>
                            <div className="space-y-1">
                              <h3 className="font-semibold text-foreground transition-colors">
                                {link.title}
                              </h3>
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {link.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </section>

          {/* FAQ Sections */}
          <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 max-w-6xl">
            <motion.div
              initial={shouldReduceMotion ? undefined : { opacity: 0, y: 20 }}
              whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="space-y-12"
            >
              <div className="text-center space-y-4 max-w-3xl mx-auto">
                <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
                  Perguntas frequentes.
                </h2>
                <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                  Encontre respostas para as dúvidas mais comuns sobre o Azuria.
                </p>
              </div>

              <div className="space-y-12">
                {filteredFAQs.map((category, categoryIndex) => {
                  const Icon = category.icon;
                  return (
                    <motion.div
                      key={category.title}
                      initial={shouldReduceMotion ? undefined : { opacity: 0, y: 20 }}
                      whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
                      className="space-y-6"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-muted/50">
                          <Icon className="h-6 w-6 text-foreground/70" />
                        </div>
                        <h3 className="text-2xl font-semibold text-foreground">
                          {category.title}
                        </h3>
                      </div>
                      
                      <Accordion type="single" collapsible className="space-y-3">
                        {category.questions.map((faq, index) => (
                          <AccordionItem
                            key={index}
                            value={`item-${categoryIndex}-${index}`}
                            className="border rounded-lg px-6 py-2 border-border hover:border-foreground/20 transition-colors"
                          >
                            <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline py-4">
                              {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground leading-relaxed pb-4">
                              {faq.answer}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </section>

          {/* Contact Section */}
          <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 max-w-4xl">
            <motion.div
              initial={shouldReduceMotion ? undefined : { opacity: 0, y: 20 }}
              whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-center space-y-8"
            >
              <div className="space-y-4">
                <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
                  Ainda precisa de ajuda?
                </h2>
                <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                  Nossa equipe está pronta para ajudar você a encontrar a solução que precisa.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="min-h-[48px] px-8 text-base"
                >
                  <Link to="/ajuda">
                    Acessar Suporte Completo
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  className="min-h-[48px] px-8 text-base"
                >
                  <a href="mailto:contato@azuria.com.br">
                    <Mail className="mr-2 h-4 w-4" />
                    Enviar Email
                  </a>
                </Button>
              </div>
            </motion.div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}
