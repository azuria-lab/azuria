
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Award,
  CheckCircle,
  Clock,
  FileText,
  MessageSquare,
  Target,
  TrendingUp,
  Video,
  Zap
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "@/components/ui/use-toast";

export default function ConsultingServices() {
  const [_selectedPlan, _setSelectedPlan] = useState("premium");

  const consultingPlans = [
    {
      id: "starter",
      name: "Starter",
      price: "R$ 497",
      duration: "1 sessão",
      description: "Consultoria pontual para resolver desafios específicos",
      features: [
        "1 sessão de 2 horas",
        "Análise de precificação atual",
        "Estratégia de posicionamento",
        "Material de apoio em PDF",
        "7 dias de suporte por email"
      ],
      popular: false,
      color: "border-gray-200"
    },
    {
      id: "premium",
      name: "Premium",
      price: "R$ 1.997",
      duration: "3 sessões",
      description: "Programa completo para transformar sua estratégia de precificação",
      features: [
        "3 sessões de 2 horas cada",
        "Auditoria completa de precificação",
        "Desenvolvimento de estratégia personalizada",
        "Templates exclusivos",
        "30 dias de suporte prioritário",
        "1 revisão após 30 dias",
        "Acesso ao grupo VIP"
      ],
      popular: true,
      color: "border-blue-500"
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: "R$ 4.997",
      duration: "3 meses",
      description: "Acompanhamento completo com implementação hands-on",
      features: [
        "6 sessões de consultoria",
        "Implementação assistida",
        "Treinamento da equipe",
        "Dashboard personalizado",
        "90 dias de suporte ilimitado",
        "Revisões mensais",
        "Acesso vitalício ao material",
        "Certificado de conclusão"
      ],
      popular: false,
      color: "border-purple-500"
    }
  ];

  const consultingProcess = [
    {
      step: 1,
      title: "Diagnóstico",
      description: "Análise completa da situação atual",
      icon: <Target className="h-6 w-6" />,
      duration: "1-2 dias"
    },
    {
      step: 2,
      title: "Estratégia",
      description: "Desenvolvimento do plano personalizado",
      icon: <TrendingUp className="h-6 w-6" />,
      duration: "3-5 dias"
    },
    {
      step: 3,
      title: "Implementação",
      description: "Execução assistida das mudanças",
      icon: <CheckCircle className="h-6 w-6" />,
      duration: "2-4 semanas"
    },
    {
      step: 4,
      title: "Acompanhamento",
      description: "Monitoramento e ajustes contínuos",
      icon: <Award className="h-6 w-6" />,
      duration: "Ongoing"
    }
  ];

  const testimonials = [
    {
      name: "Maria Fernanda",
      company: "E-commerce Fashion",
      text: "A consultoria aumentou nossa margem de lucro em 35% em apenas 2 meses. Investimento que se pagou rapidamente.",
      result: "+35% margem"
    },
    {
      name: "João Carlos",
      company: "Restaurante Gourmet",
      text: "Finalmente entendi como precificar corretamente meus pratos. O faturamento cresceu 28% no primeiro mês.",
      result: "+28% faturamento"
    },
    {
      name: "Ana Silva",
      company: "Consultoria Digital",
      text: "A estratégia de precificação por valor mudou completamente meu negócio. Agora cobro o que realmente valho.",
      result: "+150% ticket médio"
    }
  ];

  const upcomingAvailability = [
    {
      date: "15/01/2025",
      time: "14:00 - 16:00",
      available: true
    },
    {
      date: "18/01/2025",
      time: "09:00 - 11:00",
      available: true
    },
    {
      date: "22/01/2025",
      time: "15:00 - 17:00",
      available: false
    },
    {
      date: "25/01/2025",
      time: "10:00 - 12:00",
      available: true
    }
  ];

  const handleScheduleConsulting = (planId: string) => {
    toast.success(`Agendando consultoria ${planId}...`);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">Consultoria Especializada</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Consultoria personalizada com especialistas em precificação. 
          Transforme sua estratégia de preços e multiplique seus resultados.
        </p>
      </div>

      {/* Results Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-green-600 mb-2">+42%</div>
            <p className="text-gray-600">Aumento médio de margem</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-blue-600 mb-2">97%</div>
            <p className="text-gray-600">Satisfação dos clientes</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-purple-600 mb-2">180+</div>
            <p className="text-gray-600">Empresas transformadas</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="plans" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="plans">Planos</TabsTrigger>
          <TabsTrigger value="process">Processo</TabsTrigger>
          <TabsTrigger value="testimonials">Resultados</TabsTrigger>
          <TabsTrigger value="schedule">Agendar</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {consultingPlans.map((plan) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className={`relative ${plan.color} ${plan.popular ? 'border-2' : 'border'}`}>
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600">
                      Mais Popular
                    </Badge>
                  )}
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <div className="text-3xl font-bold text-blue-600">{plan.price}</div>
                    <CardDescription>{plan.duration}</CardDescription>
                    <p className="text-sm text-gray-600">{plan.description}</p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className={`w-full ${plan.popular ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                      onClick={() => handleScheduleConsulting(plan.id)}
                    >
                      Escolher Plano
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="process" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Nosso Processo Comprovado</CardTitle>
              <CardDescription>
                Metodologia estruturada para garantir resultados consistentes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {consultingProcess.map((step, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                        {step.icon}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">Etapa {step.step}</Badge>
                        <span className="text-sm text-gray-500">{step.duration}</span>
                      </div>
                      <h4 className="font-semibold mb-1">{step.title}</h4>
                      <p className="text-gray-600">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ferramentas Utilizadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <Video className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Sessões por Videoconferência</p>
                    <p className="text-sm text-gray-600">Zoom com gravação incluída</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <FileText className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">Relatórios Personalizados</p>
                    <p className="text-sm text-gray-600">Análises detalhadas em PDF</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <MessageSquare className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="font-medium">Suporte via WhatsApp</p>
                    <p className="text-sm text-gray-600">Acesso direto ao consultor</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <Zap className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="font-medium">Templates Exclusivos</p>
                    <p className="text-sm text-gray-600">Planilhas e calculadoras</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testimonials" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Badge className="bg-green-100 text-green-800">
                        {testimonial.result}
                      </Badge>
                    </div>
                    <blockquote className="text-gray-600 mb-4">
                      "{testimonial.text}"
                    </blockquote>
                    <div>
                      <p className="font-medium">{testimonial.name}</p>
                      <p className="text-sm text-gray-500">{testimonial.company}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Resultados Comprovados</CardTitle>
              <CardDescription>
                Métricas reais dos nossos clientes após a consultoria
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Aumento de Margem de Lucro</span>
                    <span>42% em média</span>
                  </div>
                  <Progress value={84} />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Redução de Custos</span>
                    <span>28% em média</span>
                  </div>
                  <Progress value={70} />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Aumento de Faturamento</span>
                    <span>35% em média</span>
                  </div>
                  <Progress value={78} />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Satisfação do Cliente</span>
                    <span>97% positiva</span>
                  </div>
                  <Progress value={97} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Agendar Consultoria</CardTitle>
              <CardDescription>
                Escolha o melhor horário para sua sessão de consultoria
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-4">Horários Disponíveis</h4>
                  <div className="space-y-3">
                    {upcomingAvailability.map((slot, index) => (
                      <div
                        key={index}
                        className={`p-3 border rounded-lg flex items-center justify-between ${
                          slot.available 
                            ? 'border-green-200 bg-green-50' 
                            : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div>
                          <p className="font-medium">{slot.date}</p>
                          <p className="text-sm text-gray-600">{slot.time}</p>
                        </div>
                        {slot.available ? (
                          <Button size="sm">Agendar</Button>
                        ) : (
                          <Badge variant="outline">Ocupado</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-4">Informações da Sessão</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">Duração: 2 horas</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Video className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">Formato: Videoconferência</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">Material incluído</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">Suporte pós-sessão</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h5 className="font-medium text-blue-800 mb-2">
                      Preparação Recomendada
                    </h5>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Dados financeiros dos últimos 3 meses</li>
                      <li>• Lista de produtos/serviços principais</li>
                      <li>• Informações sobre concorrentes</li>
                      <li>• Objetivos específicos a alcançar</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
