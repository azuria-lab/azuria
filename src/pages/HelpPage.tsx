import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  BarChart3,
  BookOpen,
  Calculator,
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  FileText,
  Globe,
  HelpCircle,
  Mail,
  MessageCircle,
  MessageSquare,
  Plus,
  Rocket,
  Search,
  Send,
  Settings,
  Shield,
  Video,
  XCircle,
  Zap
} from "lucide-react";
import { useAuthContext } from "@/domains/auth";
import { toast } from "@/components/ui/use-toast";

type TicketStatus = "aberto" | "em_andamento" | "resolvido" | "fechado";
type TicketPriority = "baixa" | "media" | "alta" | "urgente";
type TicketCategory = "tecnico" | "billing" | "funcionalidade" | "duvida" | "bug" | "outro";

interface Ticket {
  id: string;
  title: string;
  description: string;
  category: TicketCategory;
  status: TicketStatus;
  priority: TicketPriority;
  created_at: string;
  updated_at: string;
}

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
        question: "Quais são os planos disponíveis?",
        answer: "Oferecemos 4 planos: Iniciante (R$ 25/mês) com calculadora ilimitada, Essencial (R$ 99/mês) com recursos básicos, Pro (R$ 299/mês) com recursos avançados e IA, e Enterprise (sob consulta) com recursos completos e suporte dedicado."
      }
    ]
  },
  {
    title: "Calculadoras",
    icon: Calculator,
    questions: [
      {
        question: "Qual a diferença entre Calculadora Rápida e Avançada?",
        answer: "A Calculadora Rápida é ideal para cálculos simples e rápidos, perfeita para uso diário. A Calculadora Avançada oferece mais opções de configuração, análise de cenários, múltiplos produtos e integração com dados históricos."
      },
      {
        question: "Como funciona o cálculo automático de impostos?",
        answer: "O Azuria calcula automaticamente os impostos brasileiros (ICMS, PIS, COFINS, etc.) com base no tipo de produto e estado de origem/destino. Você pode configurar as alíquotas nas configurações ou usar os valores padrão do sistema."
      },
      {
        question: "Posso salvar meus cálculos?",
        answer: "Sim! Todos os cálculos são salvos automaticamente no seu histórico. Você pode acessá-los a qualquer momento na página de Histórico, exportar em PDF ou duplicar para fazer novos cálculos baseados em valores anteriores."
      }
    ]
  },
  {
    title: "Planos e Pagamento",
    icon: CreditCard,
    questions: [
      {
        question: "Como faço upgrade do meu plano?",
        answer: "Acesse a página de Planos, escolha o plano desejado e clique em 'Assinar'. Você será redirecionado para o pagamento via PIX ou cartão de crédito. O upgrade é imediato após a confirmação do pagamento."
      },
      {
        question: "Posso cancelar minha assinatura a qualquer momento?",
        answer: "Sim, você pode cancelar sua assinatura a qualquer momento nas Configurações > Assinatura. O acesso será mantido até o final do período pago, sem cobranças adicionais."
      },
      {
        question: "O que acontece se eu exceder o limite do meu plano?",
        answer: "Se você exceder o limite de cálculos do plano gratuito, receberá uma notificação sugerindo o upgrade. Para planos pagos, você pode continuar usando normalmente ou fazer upgrade para um plano superior."
      }
    ]
  },
  {
    title: "Integrações",
    icon: Globe,
    questions: [
      {
        question: "Quais marketplaces são integrados?",
        answer: "Integramos com Mercado Livre, Shopee, Amazon, Magalu, Americanas, Temu e Shein. Você pode comparar preços, analisar concorrência e sincronizar produtos automaticamente."
      },
      {
        question: "Como conectar meu ERP?",
        answer: "Acesse a página de Integrações e escolha seu ERP. Siga o processo de autenticação OAuth para conectar sua conta. Suportamos integração com os principais ERPs do mercado brasileiro."
      },
      {
        question: "Os dados são seguros?",
        answer: "Sim! Utilizamos criptografia de ponta a ponta, servidores no Brasil e seguimos todas as normas de segurança (LGPD). Seus dados nunca são compartilhados com terceiros."
      }
    ]
  },
  {
    title: "Azuria AI",
    icon: Zap,
    questions: [
      {
        question: "O que é o Azuria AI?",
        answer: "O Azuria AI é um assistente inteligente que ajuda você a tomar decisões de precificação. Ele analisa seus dados históricos, mercado e concorrência para sugerir preços ideais e estratégias de precificação."
      },
      {
        question: "Como ativar o Azuria AI?",
        answer: "O Azuria AI está disponível nos planos Pro e Enterprise. Acesse a página 'Azuria AI' no menu principal e comece a conversar com o assistente. Ele aprende com seus padrões de uso e melhora continuamente."
      },
      {
        question: "O Azuria AI substitui minha análise?",
        answer: "Não, o Azuria AI é uma ferramenta de apoio à decisão. Ele fornece sugestões e insights baseados em dados, mas a decisão final sempre é sua. Use-o como um consultor especializado em precificação."
      }
    ]
  },
  {
    title: "Problemas Técnicos",
    icon: Settings,
    questions: [
      {
        question: "A página está lenta ou travando, o que fazer?",
        answer: "Primeiro, tente recarregar a página (F5). Se persistir, limpe o cache do navegador. Se o problema continuar, entre em contato conosco através de um ticket de suporte informando seu navegador e sistema operacional."
      },
      {
        question: "Não consigo fazer login, o que fazer?",
        answer: "Verifique se está usando o email correto. Se esqueceu a senha, use a opção 'Esqueci minha senha' na tela de login. Se o problema persistir, entre em contato com o suporte."
      },
      {
        question: "Meus dados não estão salvando, é normal?",
        answer: "Não, todos os dados devem ser salvos automaticamente. Verifique sua conexão com a internet. Se estiver online e o problema persistir, entre em contato conosco imediatamente através de um ticket."
      }
    ]
  }
];

const helpArticles = [
  {
    title: "Guia Completo de Precificação",
    description: "Aprenda tudo sobre precificação de produtos",
    icon: BookOpen,
    category: "Tutoriais"
  },
  {
    title: "Como Usar a Calculadora Avançada",
    description: "Domine todos os recursos da calculadora",
    icon: Calculator,
    category: "Tutoriais"
  },
  {
    title: "Integração com Marketplaces",
    description: "Conecte seus produtos aos principais marketplaces",
    icon: Globe,
    category: "Integrações"
  },
  {
    title: "Configurando Impostos",
    description: "Configure corretamente os impostos brasileiros",
    icon: Settings,
    category: "Configuração"
  },
  {
    title: "Usando o Azuria AI",
    description: "Aproveite ao máximo o assistente inteligente",
    icon: Zap,
    category: "IA"
  },
  {
    title: "Analytics e Relatórios",
    description: "Entenda seus dados e métricas",
    icon: BarChart3,
    category: "Analytics"
  }
];

export default function HelpPage() {
  const { userProfile } = useAuthContext();
  const shouldReduceMotion = useReducedMotion();
  const [activeTab, setActiveTab] = useState("faq");
  const [searchQuery, setSearchQuery] = useState("");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state
  const [ticketForm, setTicketForm] = useState({
    title: "",
    description: "",
    category: "duvida" as TicketCategory,
    priority: "media" as TicketPriority
  });

  const handleCreateTicket = async () => {
    if (!ticketForm.title || !ticketForm.description) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha título e descrição do ticket",
        variant: "destructive"
      });
      return;
    }

    if (!userProfile?.id) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para criar um ticket",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const newTicket: Ticket = {
        id: `ticket_${Date.now()}`,
        title: ticketForm.title,
        description: ticketForm.description,
        category: ticketForm.category,
        status: "aberto",
        priority: ticketForm.priority,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setTickets([newTicket, ...tickets]);
      
      toast({
        title: "Ticket criado!",
        description: "Seu ticket foi criado com sucesso. Nossa equipe entrará em contato em breve.",
      });

      // Reset form
      setTicketForm({
        title: "",
        description: "",
        category: "duvida",
        priority: "media"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível criar o ticket. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: TicketStatus) => {
    const variants = {
      aberto: { variant: "default" as const, icon: Clock, label: "Aberto" },
      em_andamento: { variant: "secondary" as const, icon: AlertCircle, label: "Em Andamento" },
      resolvido: { variant: "default" as const, icon: CheckCircle2, label: "Resolvido" },
      fechado: { variant: "outline" as const, icon: XCircle, label: "Fechado" }
    };
    const config = variants[status];
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: TicketPriority) => {
    const variants = {
      baixa: { variant: "outline" as const, label: "Baixa" },
      media: { variant: "secondary" as const, label: "Média" },
      alta: { variant: "default" as const, label: "Alta" },
      urgente: { variant: "destructive" as const, label: "Urgente" }
    };
    const config = variants[priority];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filteredFAQ = faqCategories.map(category => ({
    ...category,
    questions: category.questions.filter(q =>
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 max-w-7xl">
      <motion.div
        initial={shouldReduceMotion ? undefined : { opacity: 0, y: 20 }}
        animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="space-y-12"
      >
        {/* Header */}
        <div className="space-y-6">
          <motion.div
            initial={shouldReduceMotion ? undefined : { opacity: 0, y: 20 }}
            animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-4"
          >
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-foreground">
              Central de Ajuda
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl leading-relaxed">
              Encontre respostas rápidas ou entre em contato com nosso suporte.
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={shouldReduceMotion ? undefined : { opacity: 0, y: 20 }}
            animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Pesquisar na central de ajuda..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 text-base border-2 focus:border-primary/50"
              />
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-flex h-12">
            <TabsTrigger value="faq" className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Perguntas Frequentes</span>
              <span className="sm:hidden">FAQ</span>
            </TabsTrigger>
            <TabsTrigger value="tickets" className="flex items-center gap-2 text-base">
              <MessageSquare className="h-4 w-4" />
              Meus Tickets
            </TabsTrigger>
            <TabsTrigger value="articles" className="flex items-center gap-2 text-base">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Artigos</span>
              <span className="sm:hidden">Guias</span>
            </TabsTrigger>
          </TabsList>

          {/* FAQ Tab */}
          <TabsContent value="faq" className="space-y-12 mt-8">
            {filteredFAQ.length === 0 ? (
              <Card className="border-2">
                <CardContent className="py-16 text-center">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-semibold text-foreground mb-2">
                    Nenhum resultado encontrado
                  </p>
                  <p className="text-muted-foreground">
                    Tente pesquisar com outras palavras-chave
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredFAQ.map((category, categoryIndex) => {
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
                      <h2 className="text-2xl font-semibold text-foreground">
                        {category.title}
                      </h2>
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
              })
            )}
          </TabsContent>

          {/* Tickets Tab */}
          <TabsContent value="tickets" className="space-y-8 mt-8">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Create Ticket Form */}
              <motion.div
                initial={shouldReduceMotion ? undefined : { opacity: 0, y: 20 }}
                animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="lg:col-span-1"
              >
                <Card className="border-2">
                  <CardHeader className="space-y-2">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Plus className="h-5 w-5" />
                      Novo Ticket
                    </CardTitle>
                    <CardDescription>
                      Crie um ticket de suporte e nossa equipe te ajudará
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-sm font-medium">Título *</Label>
                      <Input
                        id="title"
                        placeholder="Descreva brevemente o problema"
                        value={ticketForm.title}
                        onChange={(e) => setTicketForm({ ...ticketForm, title: e.target.value })}
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category" className="text-sm font-medium">Categoria</Label>
                      <Select
                        value={ticketForm.category}
                        onValueChange={(value) => setTicketForm({ ...ticketForm, category: value as TicketCategory })}
                      >
                        <SelectTrigger id="category" className="h-11">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="duvida">Dúvida</SelectItem>
                          <SelectItem value="tecnico">Problema Técnico</SelectItem>
                          <SelectItem value="billing">Cobrança/Pagamento</SelectItem>
                          <SelectItem value="funcionalidade">Solicitação de Funcionalidade</SelectItem>
                          <SelectItem value="bug">Reportar Bug</SelectItem>
                          <SelectItem value="outro">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priority" className="text-sm font-medium">Prioridade</Label>
                      <Select
                        value={ticketForm.priority}
                        onValueChange={(value) => setTicketForm({ ...ticketForm, priority: value as TicketPriority })}
                      >
                        <SelectTrigger id="priority" className="h-11">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="baixa">Baixa</SelectItem>
                          <SelectItem value="media">Média</SelectItem>
                          <SelectItem value="alta">Alta</SelectItem>
                          <SelectItem value="urgente">Urgente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-sm font-medium">Descrição *</Label>
                      <Textarea
                        id="description"
                        placeholder="Descreva seu problema ou dúvida em detalhes..."
                        value={ticketForm.description}
                        onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                        className="min-h-[140px] resize-none"
                      />
                    </div>
                    <Button
                      onClick={handleCreateTicket}
                      disabled={isLoading}
                      className="w-full h-11 text-base"
                    >
                      <Send className="mr-2 h-4 w-4" />
                      {isLoading ? "Enviando..." : "Criar Ticket"}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Tickets List */}
              <motion.div
                initial={shouldReduceMotion ? undefined : { opacity: 0, y: 20 }}
                animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="lg:col-span-2"
              >
                <Card className="border-2">
                  <CardHeader className="space-y-2">
                    <CardTitle className="text-xl">Meus Tickets</CardTitle>
                    <CardDescription>
                      Acompanhe o status dos seus tickets de suporte
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {tickets.length === 0 ? (
                      <div className="py-16 text-center">
                        <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-lg font-semibold text-foreground mb-2">
                          Nenhum ticket criado
                        </p>
                        <p className="text-muted-foreground">
                          Crie seu primeiro ticket usando o formulário ao lado
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {tickets.map((ticket) => (
                          <Card key={ticket.id} className="border-2 hover:border-foreground/20 transition-colors">
                            <CardContent className="p-6">
                              <div className="flex items-start justify-between gap-4 mb-4">
                                <div className="flex-1 space-y-2">
                                  <h3 className="font-semibold text-foreground text-lg">
                                    {ticket.title}
                                  </h3>
                                  <p className="text-sm text-muted-foreground leading-relaxed">
                                    {ticket.description}
                                  </p>
                                </div>
                                {getStatusBadge(ticket.status)}
                              </div>
                              <div className="flex items-center justify-between flex-wrap gap-3 pt-4 border-t border-border">
                                <div className="flex items-center gap-2 flex-wrap">
                                  {getPriorityBadge(ticket.priority)}
                                  <Badge variant="outline" className="text-xs">
                                    {ticket.category}
                                  </Badge>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(ticket.created_at).toLocaleDateString("pt-BR")}
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          {/* Articles Tab */}
          <TabsContent value="articles" className="space-y-8 mt-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {helpArticles.map((article, index) => {
                const Icon = article.icon;
                return (
                  <motion.div
                    key={index}
                    initial={shouldReduceMotion ? undefined : { opacity: 0, y: 20 }}
                    whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="h-full border-2 hover:border-foreground/20 hover:shadow-md transition-all cursor-pointer group">
                      <CardHeader className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="p-3 rounded-lg bg-muted/50 group-hover:bg-primary/10 transition-colors">
                            <Icon className="h-6 w-6 text-foreground/70 group-hover:text-primary transition-colors" />
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {article.category}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <CardTitle className="text-lg">{article.title}</CardTitle>
                          <CardDescription className="leading-relaxed">{article.description}</CardDescription>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Button variant="ghost" className="w-full justify-between group/btn">
                          Ler artigo
                          <ChevronRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        {/* Contact Options */}
        <motion.div
          initial={shouldReduceMotion ? undefined : { opacity: 0, y: 20 }}
          whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="pt-8 border-t border-border"
        >
          <Card className="bg-muted/30 border-2">
            <CardHeader className="space-y-2">
              <CardTitle className="text-xl">Outras formas de contato</CardTitle>
              <CardDescription>
                Escolha a forma de contato que preferir
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-auto py-6 flex-col gap-3 border-2 hover:border-foreground/20">
                  <Mail className="h-6 w-6" />
                  <span className="font-semibold text-base">Email</span>
                  <span className="text-sm text-muted-foreground">suporte@azuria.app</span>
                </Button>
                <Button variant="outline" className="h-auto py-6 flex-col gap-3 border-2 hover:border-foreground/20">
                  <MessageCircle className="h-6 w-6" />
                  <span className="font-semibold text-base">Chat Online</span>
                  <span className="text-sm text-muted-foreground">Disponível 24/7</span>
                </Button>
                <Button variant="outline" className="h-auto py-6 flex-col gap-3 border-2 hover:border-foreground/20">
                  <Video className="h-6 w-6" />
                  <span className="font-semibold text-base">Agendar Reunião</span>
                  <span className="text-sm text-muted-foreground">Para clientes Enterprise</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
