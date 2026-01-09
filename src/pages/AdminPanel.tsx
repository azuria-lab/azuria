import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthContext } from "@/domains/auth";
import { useIsAdminOrOwner } from "@/hooks/useUserRoles";
import Layout from "@/components/layout/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Database } from "@/types/supabase";
import { 
  BarChart3, 
  Bell,
  Brain,
  CreditCard, 
  Crown, 
  DollarSign, 
  Settings,
  Shield,
  TrendingUp,
  Users,
  Video
} from "lucide-react";

// Componentes do Sistema Cognitivo (Modo Deus)
import { 
  AlertsPanel, 
  CognitiveDashboard, 
  EventReplayPanel, 
  MetricsDashboard 
} from '@/components/ai/consciousness';
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Navigate, useSearchParams } from "react-router-dom";
import { logger } from "@/services/logger";

export default function AdminPanel() {
  const { user: _user, userProfile: _userProfile } = useAuthContext();
  const { data: isAdmin, isLoading } = useIsAdminOrOwner();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'users';
  const [searchEmail, setSearchEmail] = useState("");
  type AdminUser = { id: string; email: string | null; name?: string | null; is_pro: boolean; created_at: string };
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Verificar se é admin
  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-600">Verificando permissões...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const searchUsers = async () => {
    if (!searchEmail.trim()) {
      toast({
        title: "Email obrigatório",
        description: "Digite um email para buscar",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .ilike('email', `%${searchEmail}%`)
        .limit(10);

      if (error) {throw error;}
      const mapped: AdminUser[] = (data || []).map((u) => ({
        id: u.id,
        email: (u as { email: string | null }).email ?? "",
        name: (u as { name?: string | null }).name ?? null,
        is_pro: Boolean((u as { is_pro: boolean | null }).is_pro),
        created_at: (u as { created_at: string }).created_at,
      }));
      setUsers(mapped);
      
      if (data?.length === 0) {
        toast({
          title: "Nenhum usuário encontrado",
          description: "Tente outro email",
        });
      }
    } catch (error) {
      logger.error("Erro ao buscar usuários:", error);
      toast({
        title: "Erro na busca",
        description: "Erro ao buscar usuários",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const toggleProStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ is_pro: !currentStatus } satisfies Database['public']['Tables']['user_profiles']['Update'])
        .eq('id', userId);

      if (error) {throw error;}

      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, is_pro: !currentStatus }
          : user
      ));

      toast({
        title: "Status atualizado",
        description: `Usuário ${currentStatus ? 'rebaixado para FREE' : 'promovido para PRO'}`,
      });
    } catch (error) {
      logger.error("Erro ao atualizar status:", error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar status do usuário",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
                Painel Administrativo
              </h1>
              <p className="text-gray-600">
                Controle total do sistema Azuria
              </p>
            </div>
            <Badge variant="secondary" className="ml-auto">
              <Crown className="h-4 w-4 mr-1" />
              Administrador
            </Badge>
          </div>

          {/* Métricas rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span className="text-sm text-gray-600">Total Usuários</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">1,234</p>
                <p className="text-xs text-green-600">+12% este mês</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5 text-purple-600" />
                  <span className="text-sm text-gray-600">Assinantes PRO</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">89</p>
                <p className="text-xs text-green-600">+5% este mês</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <span className="text-sm text-gray-600">Receita Mensal</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">R$ 2.670</p>
                <p className="text-xs text-green-600">+8% este mês</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                  <span className="text-sm text-gray-600">Conversão</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">7.2%</p>
                <p className="text-xs text-green-600">+0.5% este mês</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs principais */}
          <Tabs defaultValue={defaultTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="users">
                <Users className="h-4 w-4 mr-2" />
                Usuários
              </TabsTrigger>
              <TabsTrigger value="subscriptions">
                <CreditCard className="h-4 w-4 mr-2" />
                Assinaturas
              </TabsTrigger>
              <TabsTrigger value="cognitive">
                <Brain className="h-4 w-4 mr-2" />
                IA Cognitiva
              </TabsTrigger>
              <TabsTrigger value="analytics">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Settings className="h-4 w-4 mr-2" />
                Configurações
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Gerenciar Usuários</CardTitle>
                  <CardDescription>
                    Busque e gerencie usuários do sistema
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-2">
                    <div className="flex-1">
                      <Label htmlFor="search-email">Email do usuário</Label>
                      <Input
                        id="search-email"
                        type="email"
                        placeholder="Digite o email para buscar..."
                        value={searchEmail}
                        onChange={(e) => setSearchEmail(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && searchUsers()}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button 
                        onClick={searchUsers}
                        disabled={isSearching}
                      >
                        {isSearching ? "Buscando..." : "Buscar"}
                      </Button>
                    </div>
                  </div>

                  {users.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Resultados:</h4>
                      {users.map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{user.name || 'Sem nome'}</p>
                            <p className="text-sm text-gray-600">{user.email}</p>
                            <p className="text-xs text-gray-500">
                              Criado em: {new Date(user.created_at).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={user.is_pro ? "default" : "secondary"}>
                              {user.is_pro ? "PRO" : "FREE"}
                            </Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleProStatus(user.id, user.is_pro)}
                            >
                              {user.is_pro ? "Remover PRO" : "Promover PRO"}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="subscriptions" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Assinaturas Ativas</CardTitle>
                  <CardDescription>
                    Gerencie assinaturas e pagamentos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Funcionalidade em desenvolvimento. Em breve você poderá:
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-gray-600">
                    <li>Visualizar todas as assinaturas ativas</li>
                    <li>Cancelar assinaturas manualmente</li>
                    <li>Aplicar desconto em assinaturas</li>
                    <li>Gerar relatórios de faturamento</li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ═══════════════════════════════════════════════════════════════════
                SISTEMA COGNITIVO - MODO DEUS (Admin Only)
                ═══════════════════════════════════════════════════════════════════ */}
            <TabsContent value="cognitive" className="space-y-6">
              {/* Info Card */}
              <Card className="border-purple-200 bg-purple-50/50">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-purple-800">
                    <Brain className="h-5 w-5" />
                    Sistema Cognitivo - Modo Deus
                  </CardTitle>
                  <CardDescription className="text-purple-600">
                    Monitoramento e controle do núcleo de consciência, engines e governança da IA
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Sub-tabs do Sistema Cognitivo */}
              <Tabs defaultValue="dashboard" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="dashboard" className="flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </TabsTrigger>
                  <TabsTrigger value="metrics" className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    <span className="hidden sm:inline">Métricas</span>
                  </TabsTrigger>
                  <TabsTrigger value="alerts" className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    <span className="hidden sm:inline">Alertas</span>
                  </TabsTrigger>
                  <TabsTrigger value="replay" className="flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    <span className="hidden sm:inline">Replay</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="dashboard" className="space-y-6 mt-4">
                  <CognitiveDashboard />
                  
                  {/* Cards Informativos */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">CentralNucleus</CardTitle>
                        <CardDescription>Núcleo de Consciência</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-muted-foreground">
                          Coordena todos os engines, processa eventos e mantém o estado 
                          global do sistema de IA.
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">EngineGovernance</CardTitle>
                        <CardDescription>Sistema de Permissões</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-muted-foreground">
                          Controla quais engines podem emitir eventos e executar ações,
                          baseado em privilégios e categorias.
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">UnifiedMemory</CardTitle>
                        <CardDescription>Sistema de Memória</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-muted-foreground">
                          Gerencia memória de curto prazo (STM), trabalho (WM) e longo prazo
                          (LTM) com sync Supabase.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="metrics" className="mt-4">
                  <MetricsDashboard />
                </TabsContent>

                <TabsContent value="alerts" className="mt-4">
                  <AlertsPanel />
                </TabsContent>

                <TabsContent value="replay" className="mt-4">
                  <EventReplayPanel />
                </TabsContent>
              </Tabs>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Analytics Avançados</CardTitle>
                  <CardDescription>
                    Métricas detalhadas do sistema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Dashboard de analytics em desenvolvimento. Em breve você terá:
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-gray-600">
                    <li>Métricas de engajamento dos usuários</li>
                    <li>Taxa de conversão detalhada</li>
                    <li>Relatórios de uso das calculadoras</li>
                    <li>Análise de churn e retenção</li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações do Sistema</CardTitle>
                  <CardDescription>
                    Configurações gerais da plataforma
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Crown className="h-5 w-5 text-green-600" />
                        <span className="font-medium text-green-800">Status do Admin</span>
                      </div>
                      <p className="text-sm text-green-700 mt-1">
                        Você tem acesso completo a todas as funcionalidades premium e administrativas.
                      </p>
                    </div>
                    
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Shield className="h-5 w-5 text-blue-600" />
                        <span className="font-medium text-blue-800">Suas Permissões</span>
                      </div>
                      <ul className="text-sm text-blue-700 mt-1 space-y-1">
                        <li>• Gerenciar usuários e assinaturas</li>
                        <li>• Acesso a todos os relatórios</li>
                        <li>• Configurações do sistema</li>
                        <li>• Funcionalidades premium ilimitadas</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </Layout>
  );
}