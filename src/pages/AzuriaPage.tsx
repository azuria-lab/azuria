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
import {
  BarChart3,
  Brain,
  Calculator,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AzuriaPage() {
  const features = [
    {
      icon: <TrendingUp className="w-5 h-5" />,
      title: 'Precificação Inteligente',
      description: 'Sugestões de preços baseadas em custos, margem e concorrência',
      color: 'text-green-500',
    },
    {
      icon: <Calculator className="w-5 h-5" />,
      title: 'Análise Tributária',
      description: 'Simulações por regime (Simples, Presumido, Real)',
      color: 'text-blue-500',
    },
    {
      icon: <Target className="w-5 h-5" />,
      title: 'Monitoramento de Concorrência',
      description: 'Alertas de mudanças de preços no mercado',
      color: 'text-orange-500',
    },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      title: 'Análise de Margem',
      description: 'Identifica oportunidades de otimização',
      color: 'text-purple-500',
    },
  ];

  const capabilities = [
    '✨ Respostas em linguagem natural',
    '🧠 Contextualização inteligente',
    '📊 Visualização de análises',
    '⚡ Ações rápidas sugeridas',
    '💡 Dicas de otimização',
    '🎯 Recomendações personalizadas',
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
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    Azuria AI
                    <Badge variant="secondary" className="text-xs">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Beta
                    </Badge>
                  </h1>
                  <p className="text-muted-foreground">
                    Assistente inteligente de precificação e análise tributária
                  </p>
                </div>
              </div>
            </div>
            <AzuriaAvatarWithStatus size="large" emotion="happy" status="Online" />
          </div>
        </motion.div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chat - 2 colunas */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <AzuriaChat />
          </motion.div>

          {/* Sidebar - 1 coluna */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Funcionalidades */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  Funcionalidades
                </CardTitle>
                <CardDescription>O que a Azuria pode fazer por você</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    className="flex gap-3"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                  >
                    <div className={`mt-1 ${feature.color}`}>{feature.icon}</div>
                    <div>
                      <h4 className="font-semibold text-sm">{feature.title}</h4>
                      <p className="text-xs text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            {/* Capacidades */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  Capacidades
                </CardTitle>
                <CardDescription>Tecnologia de ponta em IA</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {capabilities.map((capability, index) => (
                    <motion.li
                      key={index}
                      className="text-sm flex items-center gap-2"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.5 + index * 0.05 }}
                    >
                      <span className="text-xs">{capability}</span>
                    </motion.li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Informações Técnicas */}
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-blue-200 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  Modelo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Provedor:</span>
                  <span className="font-semibold">Google Gemini</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Versão:</span>
                  <span className="font-semibold">1.5 Pro (Free Tier)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Latência:</span>
                  <span className="font-semibold text-green-600">~2-3s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Custo:</span>
                  <span className="font-semibold text-green-600">R$ 0 (Gratuito)</span>
                </div>
              </CardContent>
            </Card>

            {/* Aviso de Beta */}
            <Card className="bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
              <CardContent className="pt-6">
                <p className="text-xs text-yellow-800 dark:text-yellow-200">
                  ⚠️ <strong>Versão Beta:</strong> A Azuria AI está em desenvolvimento
                  ativo. Algumas funcionalidades ainda estão sendo refinadas. Suas
                  sugestões são bem-vindas!
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Examples Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Exemplos de Perguntas</CardTitle>
              <CardDescription>
                Veja alguns exemplos do que você pode perguntar à Azuria
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  '💰 "Qual o melhor preço para meu produto que custa R$ 50 e quero 20% de margem?"',
                  '📊 "Compare Simples Nacional vs Lucro Presumido para meu negócio"',
                  '🎯 "Analise a competitividade do meu preço no mercado"',
                  '📈 "Como posso aumentar minha margem de lucro?"',
                  '💡 "Sugira otimizações tributárias para reduzir custos"',
                  '⚡ "Calcule o impacto de um desconto de 10% na minha margem"',
                ].map((example, index) => (
                  <div
                    key={index}
                    className="p-3 bg-muted rounded-lg text-sm hover:bg-muted/80 transition-colors cursor-pointer"
                  >
                    {example}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </MainLayout>
  );
}

