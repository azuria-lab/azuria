import React from 'react';
import { SEOHead } from '@/components/seo/SEOHead';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useBiddingCenter } from '@/hooks/useBiddingCenter';
import { BiddingLifecycleStatus, ViabilityLevel } from '@/types/bidding';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  Award,
  BarChart3,
  Calculator,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  Target,
  TrendingUp,
  Users
} from 'lucide-react';

type BadgeVariant = 'default' | 'secondary' | 'destructive';

export default function BiddingDashboardPage() {
  const canonical = 'https://azuria.app.br/dashboard-licitacoes';
  
  const {
    projects = [],
    statistics = {
      total: 0,
      won: 0,
      lost: 0,
      inProgress: 0,
      drafts: 0,
      totalValue: 0,
      averageMargin: 0,
      winRate: 0,
      byType: {} as Record<string, number>,
      byMonth: []
    },
    lifecycleCards = [],
    error
  } = useBiddingCenter();

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-red-600">
            Erro ao carregar dados: {error}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <SEOHead 
        title="Licitações - Azuria"
        description="Gerencie seus projetos de licitação, acompanhe análises e otimize suas propostas."
        url={canonical}
        type="website"
      />
      
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            {/* Cabeçalho */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  Licitações
                </h1>
                <p className="text-muted-foreground">
                  Gerencie seus projetos de licitação e acompanhe suas análises
                </p>
              </div>
              <Link to="/calculadora-licitacao">
                <Button size="lg" className="gap-2">
                  <Calculator className="h-4 w-4" />
                  Nova Análise
                </Button>
              </Link>
            </div>

            {/* Estatísticas Principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Projetos</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{statistics.total}</div>
                  <p className="text-xs text-muted-foreground">
                    {statistics.won} vencedores
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Taxa de Viabilidade</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(statistics.winRate * 100).toFixed(1)}%
                  </div>
                  <Progress value={statistics.winRate * 100} className="h-2 mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Margem Média</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statistics.averageMargin.toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Margem líquida projetada
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    R$ {(statistics.totalValue / 1000).toFixed(0)}k
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Em propostas analisadas
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Ciclo de Vida dos Projetos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Ciclo de Vida dos Projetos
                </CardTitle>
                <CardDescription>
                  Distribuição dos projetos por fase de análise
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {lifecycleCards.map((card) => {
                    const statusConfig: Record<BiddingLifecycleStatus, { label: string; color: string; variant: BadgeVariant }> = {
                      [BiddingLifecycleStatus.OPEN]: { label: 'Em Aberto', color: 'bg-blue-50 border-blue-200', variant: 'default' },
                      [BiddingLifecycleStatus.WON]: { label: 'Vencedor', color: 'bg-green-50 border-green-200', variant: 'default' },
                      [BiddingLifecycleStatus.LOST]: { label: 'Perdedor', color: 'bg-red-50 border-red-200', variant: 'destructive' },
                      [BiddingLifecycleStatus.ARCHIVED]: { label: 'Arquivado', color: 'bg-gray-50 border-gray-200', variant: 'secondary' },
                    };
                    
                    const config = statusConfig[card.status] || { label: card.status, color: 'bg-gray-50 border-gray-200', variant: 'secondary' };
                    
                    return (
                      <div 
                        key={card.status} 
                        className={`p-4 rounded-lg border ${config.color}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            {config.label}
                          </span>
                          <Badge variant={config.variant}>
                            {card.count}
                          </Badge>
                        </div>
                        <Progress 
                          value={statistics.total ? (card.count / statistics.total) * 100 : 0} 
                          className="h-2"
                        />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Projetos Recentes */}
              <Card>
                <CardHeader>
                  <CardTitle>Projetos Recentes</CardTitle>
                  <CardDescription>
                    Suas últimas análises de licitação
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {projects.slice(0, 5).map((project) => {
                    const viability = project.bidding.result?.viability;
                    const viabilityLevel = typeof viability === 'string' ? viability : ViabilityLevel.INVIAVEL;
                    
                    const statusConfig: Record<string, { color: string; icon: typeof CheckCircle2 | typeof AlertCircle; iconColor: string; badge: BadgeVariant; badgeLabel: string }> = {
                      [ViabilityLevel.EXCELENTE]: { color: 'bg-green-100', icon: CheckCircle2, iconColor: 'text-green-600', badge: 'default', badgeLabel: 'Excelente' },
                      [ViabilityLevel.BOM]: { color: 'bg-green-100', icon: CheckCircle2, iconColor: 'text-green-600', badge: 'default', badgeLabel: 'Viável' },
                      [ViabilityLevel.MODERADO]: { color: 'bg-yellow-100', icon: AlertCircle, iconColor: 'text-yellow-600', badge: 'secondary', badgeLabel: 'Atenção' },
                      [ViabilityLevel.CRITICO]: { color: 'bg-yellow-100', icon: AlertCircle, iconColor: 'text-yellow-600', badge: 'secondary', badgeLabel: 'Crítico' },
                      [ViabilityLevel.INVIAVEL]: { color: 'bg-red-100', icon: AlertCircle, iconColor: 'text-red-600', badge: 'destructive', badgeLabel: 'Inviável' }
                    };
                    
                    const config = statusConfig[viabilityLevel] || statusConfig[ViabilityLevel.INVIAVEL];
                    const IconComponent = config.icon;
                    
                    return (
                      <Link 
                        key={project.summary.id}
                        to={`/calculadora-licitacao?id=${project.summary.id}`}
                        className="flex items-start gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                      >
                        <div className={`p-2 rounded-lg ${config.color}`}>
                          <IconComponent className={`h-4 w-4 ${config.iconColor}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm">{project.summary.title}</h4>
                            <Badge variant={config.badge} className="text-xs">
                              {config.badgeLabel}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-1">
                            {project.summary.organ} • {project.bidding.data.type}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              Margem: {(project.bidding.result?.profitMargin || 0).toFixed(1)}%
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {project.summary.deadline ? new Date(project.summary.deadline).toLocaleDateString('pt-BR') : 'Sem prazo'}
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </Link>
                    );
                  })}
                  
                  {projects.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhum projeto ainda</p>
                      <p className="text-sm mt-2">
                        Crie sua primeira análise de licitação
                      </p>
                    </div>
                  )}
                  
                  {projects.length > 5 && (
                    <Button variant="outline" className="w-full mt-4">
                      Ver Todos os Projetos
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Ações Rápidas */}
              <Card>
                <CardHeader>
                  <CardTitle>Ações Rápidas</CardTitle>
                  <CardDescription>
                    Recursos e ferramentas para licitações
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Link to="/calculadora-licitacao">
                    <div className="flex items-center gap-4 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                      <div className="p-2 rounded-lg bg-blue-500">
                        <Calculator className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">Nova Análise</h4>
                        <p className="text-sm text-muted-foreground">
                          Calcular viabilidade de proposta
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </Link>

                  <div className="flex items-center gap-4 p-3 rounded-lg border bg-gray-50">
                    <div className="p-2 rounded-lg bg-green-500">
                      <Target className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">Simulador de Cenários</h4>
                      <p className="text-sm text-muted-foreground">
                        Compare diferentes estratégias
                      </p>
                    </div>
                    <Badge variant="outline">Em breve</Badge>
                  </div>

                  <div className="flex items-center gap-4 p-3 rounded-lg border bg-gray-50">
                    <div className="p-2 rounded-lg bg-purple-500">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">Análise de Concorrência</h4>
                      <p className="text-sm text-muted-foreground">
                        Benchmark de propostas
                      </p>
                    </div>
                    <Badge variant="outline">Em breve</Badge>
                  </div>

                  <div className="flex items-center gap-4 p-3 rounded-lg border bg-gray-50">
                    <div className="p-2 rounded-lg bg-orange-500">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">Histórico de Editais</h4>
                      <p className="text-sm text-muted-foreground">
                        Consultar editais anteriores
                      </p>
                    </div>
                    <Badge variant="outline">Em breve</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Banner Informativo */}
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-blue-500">
                    <Award className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">
                      Otimize suas propostas com IA
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Use inteligência artificial para analisar editais, calcular custos e criar propostas competitivas
                    </p>
                    <ul className="text-sm space-y-2 mb-4">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        Cálculo automático de impostos e taxas
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        Análise de viabilidade em tempo real
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        Sugestões inteligentes de estratégia
                      </li>
                    </ul>
                    <Button variant="default" asChild>
                      <Link to="/ia">
                        Conhecer IA para Preços
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    </>
  );
}
