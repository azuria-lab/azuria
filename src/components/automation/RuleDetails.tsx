import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Bot, CheckCircle2, Clock, Power, Tag, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAlertsByRule, useAutomationRule, useExecutionsByRule } from '@/shared/hooks';
import { useAdvancedAutomation } from '@/hooks/useAdvancedAutomation';

interface RuleDetailsProps {
  ruleId: string;
  onClose?: () => void;
}

export function RuleDetails({ ruleId, onClose }: RuleDetailsProps) {
  const { data: rule, isLoading: ruleLoading } = useAutomationRule(ruleId);
  const { data: alerts = [], isLoading: alertsLoading } = useAlertsByRule(ruleId);
  const { data: executions = [] } = useExecutionsByRule(ruleId, 10);
  const { updateRule, executeRule } = useAdvancedAutomation();
  const navigate = useNavigate();

  if (ruleLoading) {
    return (
      <div className="py-8 text-center text-gray-500">Carregando detalhes…</div>
    );
  }

  if (!rule) {
    return (
      <div className="py-8 text-center text-gray-500">Regra não encontrada.</div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Detalhes da Regra</h3>
          <p className="text-gray-600">Informações e alertas relacionados</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={rule?.is_active ? 'secondary' : 'default'}
            onClick={() => rule && updateRule({ id: rule.id, updates: { is_active: !rule.is_active } })}
          >
            <Power className="h-4 w-4 mr-2" />
            {rule?.is_active ? 'Desativar' : 'Ativar'}
          </Button>
          <Button onClick={() => executeRule(ruleId)}>
            <CheckCircle2 className="h-4 w-4 mr-2" /> Executar Agora
          </Button>
          <Button variant="outline" onClick={() => navigate(`/automacoes/regra/${ruleId}`)}>
            Ver na página
          </Button>
          {onClose && (
            <Button variant="outline" onClick={onClose}>Fechar</Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            {rule.name}
          </CardTitle>
          <CardDescription>{rule.description || 'Sem descrição'}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3 text-sm">
            <Badge variant="outline">Tipo: {rule.rule_type}</Badge>
            <Badge variant="secondary">Prioridade {rule.priority}</Badge>
            <Badge className={rule.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
              {rule.is_active ? 'Ativa' : 'Inativa'}
            </Badge>
            <div className="flex items-center gap-1 text-gray-600">
              <Clock className="h-4 w-4" />
              Execuções: {rule.execution_count}
            </div>
          </div>

          {rule.tags && rule.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <Tag className="h-4 w-4 text-gray-400" />
              {rule.tags.map((t, i) => (
                <Badge key={i} variant="secondary">{t}</Badge>
              ))}
            </div>
          )}

          <Separator />
          <div>
            <p className="font-medium text-gray-700 mb-2">Condições</p>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              {(rule.conditions ?? []).map((c) => (
                <li key={c.id}>{c.field} {c.operator} {String(c.value)}</li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-medium text-gray-700 mb-2">Ações</p>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              {(rule.actions ?? []).map((a) => (
                <li key={a.id}>{a.type}</li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" /> Alertas Recentes
          </CardTitle>
          <CardDescription>Eventos gerados por esta regra</CardDescription>
        </CardHeader>
        <CardContent>
          {alertsLoading ? (
            <div className="py-8 text-center text-gray-500">Carregando alertas…</div>
          ) : alerts.length === 0 ? (
            <div className="py-8 text-center text-gray-500">Nenhum alerta recente</div>
          ) : (
            <div className="space-y-3">
              {alerts.map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-md border p-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <div>
                      <div className="text-sm font-medium">{a.message}</div>
                      <div className="text-xs text-gray-500">Severidade: {a.severity}</div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">{new Date(a.created_at).toLocaleString('pt-BR')}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" /> Execuções Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {executions.length === 0 ? (
            <div className="py-8 text-center text-gray-500">Nenhuma execução recente</div>
          ) : (
            <div className="space-y-3">
              {executions.map((ex) => (
                <div key={ex.id} className="flex items-center justify-between rounded-md border p-3">
                  <div className="text-sm">
                    <div className="font-medium">Status: {ex.status}</div>
                    <div className="text-xs text-gray-500">Início: {new Date(ex.started_at).toLocaleString('pt-BR')}</div>
                  </div>
                  {ex.completed_at && (
                    <div className="text-xs text-gray-500">Fim: {new Date(ex.completed_at).toLocaleString('pt-BR')}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
