/**
 * Azuria AI Page
 * 
 * Página dedicada para a assistente inteligente Azuria
 */

import MainLayout from '@/components/layout/Layout';
import { AzuriaChat } from '@/components/ai/AzuriaChat';
import { AzuriaAvatarWithStatus } from '@/components/ai/AzuriaAvatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Brain,
  Calculator,
  DollarSign,
  Info,
  Lightbulb,
  LineChart,
  MessageSquare,
  PieChart,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AzuriaPage() {
  const features = [
    {
      icon: <TrendingUp className="w-5 h-5" />,
      title: 'Precificação Inteligente',
      description: 'Sugestões de preços baseadas em custos, margem e concorrência',
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
    },
    {
      icon: <Calculator className="w-5 h-5" />,
      title: 'Análise Tributária',
      description: 'Simulações por regime (Simples, Presumido, Real)',
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      icon: <Target className="w-5 h-5" />,
      title: 'Monitoramento de Concorrência',
      description: 'Alertas de mudanças de preços no mercado',
      color: 'text-orange-500',
      bg: 'bg-orange-500/10',
    },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      title: 'Análise de Margem',
      description: 'Identifica oportunidades de otimização',
      color: 'text-violet-500',
      bg: 'bg-violet-500/10',
    },
  ];

  const capabilities = [
    { icon: <MessageSquare className="w-4 h-4" />, text: 'Respostas em linguagem natural' },
    { icon: <Brain className="w-4 h-4" />, text: 'Contextualização inteligente' },
    { icon: <PieChart className="w-4 h-4" />, text: 'Visualização de análises' },
    { icon: <Zap className="w-4 h-4" />, text: 'Ações rápidas sugeridas' },
    { icon: <Lightbulb className="w-4 h-4" />, text: 'Dicas de otimização' },
    { icon: <Target className="w-4 h-4" />, text: 'Recomendações personalizadas' },
  ];

  const examples = [
    {
      icon: <DollarSign className="w-4 h-4 text-emerald-500" />,
      text: "Qual o melhor preço para meu produto que custa R$ 50 e quero 20% de margem?",
    },
    {
      icon: <Calculator className="w-4 h-4 text-blue-500" />,
      text: "Compare Simples Nacional vs Lucro Presumido para meu negócio",
    },
    {
      icon: <Search className="w-4 h-4 text-orange-500" />,
      text: "Analise a competitividade do meu preço no mercado",
    },
    {
      icon: <TrendingUp className="w-4 h-4 text-violet-500" />,
      text: "Como posso aumentar minha margem de lucro?",
    },
    {
      icon: <Lightbulb className="w-4 h-4 text-yellow-500" />,
      text: "Sugira otimizações tributárias para reduzir custos",
    },
    {
      icon: <LineChart className="w-4 h-4 text-cyan-500" />,
      text: "Calcule o impacto de um desconto de 10% na minha margem",
    },
  ];

  return (
    <MainLayout>
      <div className="container mx-auto py-8 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <div className="p-3 bg-gradient-to-br from-blue-600 to-violet-600 rounded-xl shadow-lg shadow-blue-500/20">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                    Azuria AI
                    <Badge variant="secondary" className="text-xs font-medium px-2 py-0.5 border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Beta
                    </Badge>
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Assistente inteligente de precificação e análise tributária
                  </p>
                </div>
              </div>
            </div>
            <AzuriaAvatarWithStatus size="large" emotion="happy" status="Online" />
          </div>
        </motion.div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chat - 2 colunas */}
          <motion.div
            className="lg:col-span-2 h-full"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="h-full border rounded-xl shadow-sm bg-background/50 backdrop-blur-sm overflow-hidden">
              <AzuriaChat />
            </div>
          </motion.div>

          {/* Sidebar - 1 coluna */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Funcionalidades */}
            <Card className="border-none shadow-md bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-500" />
                  Funcionalidades
                </CardTitle>
                <CardDescription>O que a Azuria pode fazer por você</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {features.map((feature) => (
                  <motion.div
                    key={feature.title}
                    className="flex gap-4 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors group"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                  >
                    <div className={`mt-1 p-2 rounded-md ${feature.bg} ${feature.color} group-hover:scale-110 transition-transform`}>
                      {feature.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-foreground/90">{feature.title}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            {/* Capacidades */}
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-violet-500" />
                  Capacidades
                </CardTitle>
                <CardDescription>Tecnologia de ponta em IA</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {capabilities.map((capability, index) => (
                    <motion.li
                      key={capability.text}
                      className="text-sm flex items-center gap-3 text-muted-foreground"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.5 + index * 0.05 }}
                    >
                      <div className="p-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                        {capability.icon}
                      </div>
                      <span className="text-xs font-medium">{capability.text}</span>
                    </motion.li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Informações Técnicas */}
            <Card className="bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800">
              <CardHeader className="py-4">
                <CardTitle className="text-sm flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <Info className="w-4 h-4" />
                  Detalhes do Modelo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs pb-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Provedor</span>
                  <Badge variant="outline" className="font-semibold bg-white dark:bg-slate-950">Google Gemini</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Versão</span>
                  <span className="font-medium">1.5 Pro</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Latência</span>
                  <span className="font-medium text-emerald-600 flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    ~2-3s
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Aviso de Beta */}
            <Alert className="bg-amber-50/50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/50">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
              <AlertTitle className="text-amber-800 dark:text-amber-400 font-semibold text-xs mb-1">Versão Beta</AlertTitle>
              <AlertDescription className="text-xs text-amber-700 dark:text-amber-500/90 leading-relaxed">
                A Azuria AI está em desenvolvimento ativo. Algumas funcionalidades podem sofrer alterações.
              </AlertDescription>
            </Alert>
          </motion.div>
        </div>

        {/* Examples Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              <h3 className="text-lg font-semibold">Exemplos de Perguntas</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {examples.map((example) => (
                <Card 
                  key={example.text}
                  className="group hover:shadow-md transition-all duration-300 cursor-pointer border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 bg-white dark:bg-slate-950"
                >
                  <CardContent className="p-4 flex items-start gap-3">
                    <div className="mt-0.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-900 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
                      {example.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-600 dark:text-slate-300 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors leading-relaxed">
                        "{example.text}"
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-400 group-hover:translate-x-1 transition-all opacity-0 group-hover:opacity-100" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
}
