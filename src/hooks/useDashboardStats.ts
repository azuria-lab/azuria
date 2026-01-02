import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/domains/auth";
import { logger } from "@/services/logger";
import type { Json } from "@/integrations/supabase/types";

/**
 * Estatísticas diárias do dashboard
 * 
 * Métricas de uso do usuário para o dia atual com comparação ao dia anterior.
 * 
 * @interface DailyStats
 * 
 * @property {number} calculationsCount - Total de cálculos realizados hoje
 * @property {number} totalSavings - Economia total gerada (R$)
 * @property {number} productsAnalyzed - Produtos analisados hoje
 * @property {number} timeSavedMinutes - Tempo economizado em minutos
 * @property {object} change - Mudanças percentuais vs ontem
 * @property {number} change.calculations - % mudança em cálculos
 * @property {number} change.savings - % mudança em economia
 * @property {number} change.products - % mudança em produtos
 * @property {number} change.time - % mudança em tempo
 * 
 * @example
 * ```typescript
 * const stats: DailyStats = {
 *   calculationsCount: 15,
 *   totalSavings: 1250.50,
 *   productsAnalyzed: 23,
 *   timeSavedMinutes: 45,
 *   change: {
 *     calculations: 25,  // +25% vs ontem
 *     savings: -10,      // -10% vs ontem
 *     products: 50,      // +50% vs ontem
 *     time: 20           // +20% vs ontem
 *   }
 * };
 * ```
 */
export interface DailyStats {
  calculationsCount: number;
  totalSavings: number;
  productsAnalyzed: number;
  timeSavedMinutes: number;
  change: {
    calculations: number;
    savings: number;
    products: number;
    time: number;
  };
}

/**
 * Atividade do usuário no dashboard
 * 
 * Representa uma ação realizada pelo usuário (cálculo, análise, etc).
 * 
 * @interface Activity
 * 
 * @property {string} id - Identificador único da atividade
 * @property {string} type - Tipo de atividade (calculation, analysis, etc)
 * @property {string} title - Título resumido da atividade
 * @property {string} description - Descrição detalhada
 * @property {string} time - Timestamp da atividade (ISO 8601)
 * @property {string} icon - Nome do ícone Lucide (ex: 'calculator', 'chart')
 * @property {string} color - Cor do ícone (ex: 'blue', 'green')
 * @property {Json | null} [metadata] - Dados adicionais da atividade
 * 
 * @example
 * ```typescript
 * const activity: Activity = {
 *   id: 'act_abc123',
 *   type: 'calculation',
 *   title: 'Cálculo de Preço',
 *   description: 'iPhone 15 Pro - Margem 30%',
 *   time: '2025-10-19T14:30:00Z',
 *   icon: 'calculator',
 *   color: 'blue',
 *   metadata: { productId: 'prod_xyz', margin: 0.3 }
 * };
 * ```
 */
export interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  time: string;
  icon: string;
  color: string;
  metadata?: Json | null;
}

/**
 * Notificação do dashboard
 * 
 * Mensagem informativa, alerta ou dica para o usuário.
 * 
 * @interface Notification
 * 
 * @property {string} id - Identificador único da notificação
 * @property {'info' | 'success' | 'warning' | 'error' | 'tip'} type - Tipo/severidade
 * @property {string} title - Título da notificação
 * @property {string} message - Mensagem completa
 * @property {string | null} [icon] - Ícone personalizado (opcional)
 * @property {boolean} isRead - Se a notificação foi lida
 * @property {string | null} [actionUrl] - URL para ação (opcional)
 * @property {string | null} [actionLabel] - Label do botão de ação (opcional)
 * @property {string} createdAt - Data de criação (ISO 8601)
 * 
 * @example
 * ```typescript
 * const notification: Notification = {
 *   id: 'notif_xyz789',
 *   type: 'warning',
 *   title: 'Margem Baixa Detectada',
 *   message: 'Produto "Notebook Dell" com margem de apenas 5%',
 *   icon: 'alert-triangle',
 *   isRead: false,
 *   actionUrl: '/products/notebook-dell',
 *   actionLabel: 'Ver Produto',
 *   createdAt: '2025-10-19T14:30:00Z'
 * };
 * ```
 */
export interface Notification {
  id: string;
  type: "info" | "success" | "warning" | "error" | "tip";
  title: string;
  message: string;
  icon?: string | null;
  isRead: boolean;
  actionUrl?: string | null;
  actionLabel?: string | null;
  createdAt: string;
}

/**
 * Dica contextual do dashboard
 * 
 * Sugestão ou recomendação para melhorar uso da plataforma.
 * 
 * @interface DashboardTip
 * 
 * @property {string} id - Identificador único da dica
 * @property {string} title - Título da dica
 * @property {string} message - Conteúdo da dica
 * @property {string | null} category - Categoria da dica (pricing, tax, etc)
 * @property {string} [actionUrl] - URL para saber mais (opcional)
 * @property {string} [actionLabel] - Label do link (opcional)
 * 
 * @example
 * ```typescript
 * const tip: DashboardTip = {
 *   id: 'tip_001',
 *   title: 'Otimize Suas Margens',
 *   message: 'Use análise competitiva para ajustar preços dinamicamente',
 *   category: 'pricing',
 *   actionUrl: '/ai/pricing',
 *   actionLabel: 'Experimentar IA'
 * };
 * ```
 */
export interface DashboardTip {
  id: string;
  title: string;
  message: string;
  category: string | null;
  actionUrl?: string | null;
  actionLabel?: string | null;
}

/**
 * Perfil de uso do usuário
 * 
 * Dados agregados de uso da plataforma pelo usuário.
 * 
 * @interface UserProfile
 * 
 * @property {string} userId - ID do usuário
 * @property {string} experienceLevel - Nível de experiência (beginner, intermediate, advanced)
 * @property {number} totalCalculations - Total de cálculos já realizados
 * @property {number} totalSavingsGenerated - Economia total gerada (R$)
 * @property {number} daysActive - Dias desde primeiro uso
 * @property {string | null} lastActivityAt - Última atividade (ISO 8601)
 * 
 * @example
 * ```typescript
 * const profile: UserProfile = {
 *   userId: 'user_123',
 *   experienceLevel: 'intermediate',
 *   totalCalculations: 342,
 *   totalSavingsGenerated: 25680.75,
 *   daysActive: 45,
 *   lastActivityAt: '2025-10-19T14:30:00Z'
 * };
 * ```
 */
export interface UserProfile {
  userId: string;
  experienceLevel: string;
  totalCalculations: number;
  totalSavingsGenerated: number;
  daysActive: number;
  lastActivityAt: string | null;
}

/**
 * Hook para estatísticas e dados do dashboard
 * 
 * Gerencia estado completo do dashboard: stats diárias, atividades, notificações,
 * dicas contextuais e perfil do usuário. Atualiza dados em tempo real via Supabase.
 * 
 * @returns Objeto com dados e funções do dashboard
 * 
 * @example
 * ```typescript
 * function Dashboard() {
 *   const {
 *     stats,
 *     activities,
 *     notifications,
 *     tip,
 *     userProfile,
 *     isLoading,
 *     markNotificationAsRead,
 *     dismissTip,
 *     refreshStats
 *   } = useDashboardStats();
 * 
 *   if (isLoading) return <Skeleton />;
 * 
 *   return (
 *     <div>
 *       <h1>Cálculos Hoje: {stats.calculationsCount}</h1>
 *       <h2>Economia: R$ {stats.totalSavings.toFixed(2)}</h2>
 *       <ActivityList activities={activities} />
 *       <NotificationCenter notifications={notifications} />
 *       {tip && <TipCard tip={tip} onDismiss={() => dismissTip(tip.id)} />}
 *     </div>
 *   );
 * }
 * ```
 * 
 * @remarks
 * **Atualização automática**: Re-fetch a cada 5 minutos e quando usuário muda
 * 
 * **Realtime subscriptions**: Escuta mudanças em atividades e notificações
 * 
 * **Cache**: Dados ficam em memória até componente desmontar
 * 
 * **Fallback**: Retorna dados vazios se usuário não autenticado
 */
export function useDashboardStats() {
  const { user } = useAuthContext();
  const [stats, setStats] = useState<DailyStats>({
    calculationsCount: 0,
    totalSavings: 0,
    productsAnalyzed: 0,
    timeSavedMinutes: 0,
    change: {
      calculations: 0,
      savings: 0,
      products: 0,
      time: 0,
    },
  });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [tip, setTip] = useState<DashboardTip | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    if (!user?.id) {return;}

    try {
      // TODO: Tabela user_daily_stats foi removida do schema
      // Retornando valores padrão temporários até implementar alternativa
      // ou recriar a tabela user_daily_stats
      
      const calculateChange = (_today: number, _yesterday: number) => {
        return 0;
      };

      setStats({
        calculationsCount: 0,
        totalSavings: 0,
        productsAnalyzed: 0,
        timeSavedMinutes: 0,
        change: {
          calculations: 0,
          savings: 0,
          products: 0,
          time: 0,
        },
      });

      logger.info("📊 Estatísticas do dashboard carregadas (valores padrão)");
    } catch (error) {
      logger.error("❌ Erro ao buscar estatísticas:", error);
    }
  }, [user?.id]);

  const fetchActivities = useCallback(async () => {
    if (!user?.id) {return;}

    try {
      // TODO: Tabela user_activities foi removida do schema
      // Retornando array vazio temporariamente até implementar alternativa
      // ou recriar a tabela user_activities
      
      setActivities([]);
      logger.info("📜 Atividades carregadas (vazio - tabela não existe)");
    } catch (error) {
      logger.error("❌ Erro ao buscar atividades:", error);
    }
  }, [user?.id]);

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) {return;}

    try {
      // TODO: Tabela user_notifications foi removida do schema
      // Retornando array vazio temporariamente até implementar alternativa
      // ou recriar a tabela user_notifications
      
      setNotifications([]);
      logger.info("🔔 Notificações carregadas (vazio - tabela não existe)");
    } catch (error) {
      logger.error("❌ Erro ao buscar notificações:", error);
    }
  }, [user?.id]);

  const fetchTip = useCallback(async () => {
    if (!user?.id) {
      return;
    }

    try {
      // TODO: Tabela dashboard_tips e função get_next_personalized_tip foram removidas do schema
      // Função desabilitada temporariamente até implementar alternativa
      // ou recriar a tabela dashboard_tips
      
      setTip(null);
      logger.info("💡 Dica carregada (desabilitado - tabela não existe)");
    } catch (error) {
      logger.error("❌ Erro ao buscar dica:", error);
    }
  }, [user?.id]);

  const fetchUserProfile = useCallback(async () => {
    if (!user?.id) {
      return;
    }

    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        // Se não existe, calcular
        await supabase.rpc("calculate_user_experience_level", {
          p_user_id: user.id,
        });
        
        // Buscar novamente
        const { data: newData } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (newData) {
          setUserProfile({
            userId: newData.id,
            experienceLevel: newData.experience_level,
            totalCalculations: newData.total_calculations,
            totalSavingsGenerated: newData.total_savings_generated,
            daysActive: newData.days_active,
            lastActivityAt: newData.last_activity_at ?? null,
          });
        }
        return;
      }

      if (data) {
        setUserProfile({
          userId: data.id,
          experienceLevel: data.experience_level,
          totalCalculations: data.total_calculations,
          totalSavingsGenerated: data.total_savings_generated,
          daysActive: data.days_active,
          lastActivityAt: data.last_activity_at ?? null,
        });
      }
    } catch (error) {
      logger.error("❌ Erro ao buscar perfil do usuário:", error);
    }
  }, [user?.id]);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([
      fetchStats(),
      fetchActivities(),
      fetchNotifications(),
      fetchUserProfile(),
      fetchTip(),
    ]);
    setIsLoading(false);
  }, [fetchStats, fetchActivities, fetchNotifications, fetchUserProfile, fetchTip]);

  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    fetchDashboardData();

    // TODO: Tabelas user_daily_stats, user_activities e user_notifications foram removidas
    // Realtime subscriptions desabilitadas temporariamente
    // const statsChannel = supabase
    //   .channel("dashboard-stats")
    //   .subscribe();

    return () => {
      // statsChannel.unsubscribe();
    };
  }, [user?.id, fetchDashboardData, fetchStats, fetchActivities, fetchNotifications]);

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      // TODO: Tabela user_notifications foi removida do schema
      // Função desabilitada temporariamente até implementar alternativa
      
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      );

      logger.info("✅ Notificação marcada como lida (desabilitado - tabela não existe)", { notificationId });
    } catch (error) {
      logger.error("❌ Erro ao marcar notificação como lida:", error);
    }
  };

  const incrementStat = async (
    statType: "calculations" | "savings" | "products" | "time",
    value: number = 1
  ) => {
    if (!user?.id) {return;}

    try {
      const { error } = await supabase.rpc("increment_daily_stat", {
        p_user_id: user.id,
        p_stat_type: statType,
        p_value: value,
      });

      if (error) {throw error;}

      logger.info("📈 Estatística incrementada", { statType, value });
    } catch (error) {
      logger.error("❌ Erro ao incrementar estatística:", error);
    }
  };

  const addActivity = async (
    type: string,
    title: string,
    description?: string,
    metadata?: Json | null
  ) => {
    if (!user?.id) {
      return;
    }

    try {
      // TODO: Tabela user_activities foi removida do schema
      // Função desabilitada temporariamente até implementar alternativa
      // ou recriar a tabela user_activities
      
      logger.info("✅ Atividade registrada (desabilitado - tabela não existe)", { type, title });
    } catch (error) {
      logger.error("❌ Erro ao registrar atividade:", error);
    }
  };

  const trackTipActionClick = async (tipId: string) => {
    try {
      // TODO: Função track_tip_action_click foi removida do schema
      // Função desabilitada temporariamente até implementar alternativa
      
      logger.info("🎯 Clique na ação da dica rastreado (desabilitado - função não existe)", { tipId });
    } catch (error) {
      logger.error("❌ Erro ao rastrear clique na dica:", error);
    }
  };

  return {
    stats,
    activities,
    notifications,
    tip,
    userProfile,
    isLoading,
    markNotificationAsRead,
    incrementStat,
    addActivity,
    trackTipActionClick,
    refresh: fetchDashboardData,
  };
}

// Funções auxiliares
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) {return "Agora";}
  if (diffMins < 60) {return `${diffMins}min atrás`;}
  if (diffHours < 24) {return `${diffHours}h atrás`;}
  if (diffDays === 1) {return "Ontem";}
  if (diffDays < 7) {return `${diffDays} dias atrás`;}
  return date.toLocaleDateString("pt-BR");
}

function getActivityIcon(type: string): string {
  const icons: Record<string, string> = {
    calculation: "Calculator",
    template_created: "LayoutTemplate",
    export: "Download",
    import: "Upload",
    analysis: "BarChart3",
    integration: "Plug",
    default: "CheckCircle2",
  };
  return icons[type] || icons.default;
}

function getActivityColor(type: string): string {
  const colors: Record<string, string> = {
    calculation: "text-blue-500",
    template_created: "text-purple-500",
    export: "text-green-500",
    import: "text-orange-500",
    analysis: "text-pink-500",
    integration: "text-indigo-500",
    default: "text-gray-500",
  };
  return colors[type] || colors.default;
}
