
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuthContext } from '@/domains/auth';
import { getFirstName, getTimeBasedGreeting } from '@/utils/greetings';
import { supabase } from '@/integrations/supabase/client';
import { UpdateNameButton } from '@/components/settings/UpdateNameButton';
//
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  BarChart3, 
  Brain, 
  Calculator, 
  CheckCircle2, 
  Clock, 
  Target,
  TrendingUp,
  Trophy,
  Zap
} from 'lucide-react';

interface DashboardStats {
  totalCalculations: number;
  aiAnalysis: number;
  profitOptimized: number;
  timesSaved: number;
  weeklyGrowth: number;
}

export default function UnifiedDashboard() {
  const authContext = useAuthContext();
  const userProfile = authContext?.userProfile;
  // Tratar string vazia como nome não definido
  const userName = userProfile?.name && userProfile.name.trim() !== '' ? userProfile.name : null;
  const firstName = getFirstName(userName);
  const greeting = getTimeBasedGreeting();
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Atualizar nome automaticamente quando o componente carregar
  useEffect(() => {
    const updateProfileName = async () => {
      // Se já está atualizando ou já tem nome, não fazer nada
      if (isUpdating || userName) {
        return;
      }
      
      // Se não tem usuário autenticado, não fazer nada
      if (!authContext?.user?.id) {
        return;
      }
      
      setIsUpdating(true);
      
      try {
        // Tentar pegar o nome de diferentes fontes
        const user = authContext.user;
        let nameToSet = '';
        
        // 1. Tentar pegar do user_metadata
        if (user.user_metadata?.name) {
          nameToSet = user.user_metadata.name;
        } 
        // 2. Tentar pegar do user_metadata.full_name
        else if (user.user_metadata?.full_name) {
          nameToSet = user.user_metadata.full_name;
        }
        // 3. Tentar pegar da parte antes do @ do email
        else if (user.email) {
          const emailName = user.email.split('@')[0];
          // Capitalizar primeira letra e remover números/caracteres especiais
          nameToSet = emailName
            .replace(/[0-9._-]/g, ' ')
            .trim()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ') || 'Usuário';
        }
        // 4. Fallback final
        else {
          nameToSet = 'Usuário';
        }
        
        // Atualizar o nome no banco de dados
        const { error } = await supabase
          .from('user_profiles')
          .update({ name: nameToSet })
          .eq('id', user.id);
        
        if (!error) {
          // Aguardar 1 segundo e recarregar para pegar o novo nome
          setTimeout(() => {
            globalThis.location.reload();
          }, 1000);
        }
      } catch (_err) {
        // Silenciar erros para não quebrar a UI
        setIsUpdating(false);
      }
    };
    
    // Executar após 500ms para garantir que o contexto foi carregado
    const timer = setTimeout(() => {
      updateProfileName();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [authContext?.user?.id, userName, isUpdating, authContext]);
  
  const [stats] = useState<DashboardStats>({
    totalCalculations: 127,
    aiAnalysis: 23,
    profitOptimized: 15.5, // percentual
    timesSaved: 8.5, // horas
    weeklyGrowth: 12.3 // percentual
  });

  const recentActivity = [
    {
      type: 'calculation',
      title: 'Calculadora Simples',
      description: 'Produto: Smartphone XYZ - Margem: 25%',
      time: '2 min atrás',
      icon: Calculator
    },
    {
      type: 'ai',
      title: 'Análise de IA',
      description: 'Sugestão de preço otimizada aplicada',
      time: '15 min atrás',
      icon: Brain
    },
    {
      type: 'batch',
      title: 'Lote Inteligente',
      description: '3 lotes analisados com IA',
      time: '1 hora atrás',
      icon: Zap
    }
  ];

  const quickActions = [
    {
      title: 'Calculadora Simples',
      description: 'Cálculo rápido de preços',
      link: '/calculadora-simples',
      icon: Calculator,
      color: 'bg-blue-500',
      badge: null
    },
    {
      title: 'Lote Inteligente + IA',
      description: 'Precificação em massa com IA',
      link: '/calculadora-lotes-inteligente',
      icon: Zap,
      color: 'bg-purple-500',
      badge: 'Novo'
    },
    {
      title: 'IA para Preços',
      description: 'Otimização inteligente',
      link: '/ia',
      icon: Brain,
      color: 'bg-green-500',
      badge: 'PRO'
    },
    {
      title: 'Analytics',
      description: 'Métricas e relatórios',
      link: '/analytics',
      icon: BarChart3,
      color: 'bg-orange-500',
      badge: null
    }
  ];

  const achievements = [
    { title: 'Primeiro Cálculo', completed: true, icon: Target },
    { title: 'IA Expert', completed: true, icon: Brain },
    { title: 'Analista PRO', completed: false, icon: BarChart3 },
    { title: 'Mestre dos Lotes', completed: false, icon: Zap }
  ];

  return (
    <div className="space-y-6">
      {/* Botão para atualizar nome - TEMPORÁRIO */}
      {!firstName || firstName === 'Usuário' ? (
        <UpdateNameButton />
      ) : null}
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {greeting}, {firstName || 'Usuário'}! 👋
          </h1>
          {import.meta.env.DEV && (
            <p className="text-xs text-slate-500 mt-1">
              Perfil atual: {JSON.stringify({ name: userProfile?.name, email: userProfile?.email })}
            </p>
          )}
          <p className="text-muted-foreground">
            Pronto para maximizar seus lucros hoje?
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-green-600 border-green-200">
            <TrendingUp className="h-3 w-3 mr-1" />
            +{stats.weeklyGrowth}% esta semana
          </Badge>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Cálculos</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCalculations}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12</span> desde ontem
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Análises de IA</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.aiAnalysis}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+5</span> esta semana
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lucro Otimizado</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{stats.profitOptimized}%</div>
            <p className="text-xs text-muted-foreground">
              Margem média melhorada
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Economizado</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.timesSaved}h</div>
            <p className="text-xs text-muted-foreground">
              Vs. cálculo manual
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ações Rápidas */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>
              Acesse suas ferramentas mais utilizadas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {quickActions.map((action, index) => (
              <Link key={index} to={action.link}>
                <div className="flex items-center gap-4 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                  <div className={`p-2 rounded-lg ${action.color}`}>
                    <action.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{action.title}</h4>
                      {action.badge && (
                        <Badge variant={action.badge === 'PRO' ? 'default' : 'secondary'} className="text-xs">
                          {action.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Atividade Recente */}
        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
            <CardDescription>
              Suas últimas ações na plataforma
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-gray-100">
                  <activity.icon className="h-4 w-4 text-gray-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{activity.title}</h4>
                  <p className="text-xs text-muted-foreground">{activity.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
            
            <Button variant="outline" className="w-full mt-4">
              <Link to="/historico" className="flex items-center gap-2">
                Ver Todo Histórico
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Conquistas e Progresso */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Conquistas
          </CardTitle>
          <CardDescription>
            Acompanhe seu progresso na plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {achievements.map((achievement, index) => (
              <div 
                key={index} 
                className={`p-4 rounded-lg border ${
                  achievement.completed 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {achievement.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <achievement.icon className="h-5 w-5 text-gray-400" />
                  )}
                  <span className={`font-medium text-sm ${
                    achievement.completed ? 'text-green-700' : 'text-gray-600'
                  }`}>
                    {achievement.title}
                  </span>
                </div>
                <Progress 
                  value={achievement.completed ? 100 : 60} 
                  className="h-2"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Banner de Upgrade PRO */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">
                Desbloqueie todo o potencial com PRO
              </h3>
              <p className="text-muted-foreground mb-4">
                IA avançada, análise de concorrência e recursos exclusivos
              </p>
              <ul className="text-sm space-y-1 mb-4">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Análise de IA ilimitada
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Monitoramento de concorrência
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Relatórios avançados
                </li>
              </ul>
            </div>
            <div className="text-center">
              <Link to="/planos">
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  Upgrade para PRO
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
