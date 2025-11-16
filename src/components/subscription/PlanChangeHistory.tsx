/**
 * Componente para exibir histórico de mudanças de plano
 */

import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowDown, ArrowUp, CheckCircle, History, RotateCcw, XCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PlanChange {
  id: string;
  fromPlanId: string;
  toPlanId: string;
  changeType: 'upgrade' | 'downgrade' | 'reactivation' | 'cancellation';
  reason?: string;
  effectiveDate: Date;
  createdAt: Date;
}

const planNames: Record<string, string> = {
  free: 'Free',
  essencial: 'Essencial',
  pro: 'Pro',
  enterprise: 'Enterprise',
};

const changeTypeLabels: Record<string, { label: string; icon: React.ReactNode; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  upgrade: {
    label: 'Upgrade',
    icon: <ArrowUp className="h-3 w-3" />,
    variant: 'default',
  },
  downgrade: {
    label: 'Downgrade',
    icon: <ArrowDown className="h-3 w-3" />,
    variant: 'secondary',
  },
  reactivation: {
    label: 'Reativação',
    icon: <CheckCircle className="h-3 w-3" />,
    variant: 'outline',
  },
  cancellation: {
    label: 'Cancelamento',
    icon: <XCircle className="h-3 w-3" />,
    variant: 'destructive',
  },
};

export const PlanChangeHistory = () => {
  const [changes, setChanges] = useState<PlanChange[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlanHistory();
  }, []);

  const fetchPlanHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('plan_change_history')
        .select('*')
        .eq('user_id', user.id)
        .order('effective_date', { ascending: false })
        .limit(10);

      if (error) {
        throw error;
      }

      const formatted = (data || []).map((item) => ({
        id: item.id,
        fromPlanId: item.from_plan_id,
        toPlanId: item.to_plan_id,
        changeType: item.change_type as PlanChange['changeType'],
        reason: item.reason,
        effectiveDate: new Date(item.effective_date),
        createdAt: new Date(item.created_at),
      }));

      setChanges(formatted);
    } catch {
      // Error handled silently
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <History className="h-5 w-5" />
            <CardTitle>Histórico de Mudanças</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (changes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <History className="h-5 w-5" />
            <CardTitle>Histórico de Mudanças</CardTitle>
          </div>
          <CardDescription>
            Acompanhe todas as alterações em seu plano
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <RotateCcw className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">
              Nenhuma mudança de plano registrada ainda
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <History className="h-5 w-5" />
          <CardTitle>Histórico de Mudanças</CardTitle>
        </div>
        <CardDescription>
          Últimas {changes.length} alterações em seu plano
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {changes.map((change) => {
            const changeInfo = changeTypeLabels[change.changeType];
            
            return (
              <div
                key={change.id}
                className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant={changeInfo.variant} className="gap-1">
                      {changeInfo.icon}
                      {changeInfo.label}
                    </Badge>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">{planNames[change.fromPlanId]}</span>
                      <span className="text-muted-foreground">→</span>
                      <span className="font-medium">{planNames[change.toPlanId]}</span>
                    </div>
                  </div>
                  
                  {change.reason && (
                    <p className="text-sm text-muted-foreground mb-2">
                      {change.reason}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>
                      {formatDistanceToNow(change.effectiveDate, { 
                        addSuffix: true, 
                        locale: ptBR 
                      })}
                    </span>
                    <span>•</span>
                    <span>
                      {change.effectiveDate.toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
