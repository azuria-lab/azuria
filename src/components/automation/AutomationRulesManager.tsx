
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAdvancedAutomation } from '@/hooks/useAdvancedAutomation';
import { RuleBuilder } from './RuleBuilder';
import {
  Bot,
  Clock,
  Edit,
  MoreHorizontal,
  Play,
  Plus,
  Target,
  Trash2,
  Zap,
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { AutomationRule } from '@/types/automation';
// merged above
import { RuleDetails } from './RuleDetails';

export function AutomationRulesManager() {
  const [showRuleBuilder, setShowRuleBuilder] = useState(false);
  const [showRuleDetails, setShowRuleDetails] = useState(false);
  const [editingRule, setEditingRule] = useState<AutomationRule | null>(null);
  const { 
    rules, 
    updateRule, 
    deleteRule, 
    executeRule,
    isLoading,
    prefetchRule,
    prefetchAlertsByRule,
  } = useAdvancedAutomation();

  const handleToggleRule = (ruleId: string, isActive: boolean) => {
    updateRule({ id: ruleId, updates: { is_active: !isActive } });
  };

  const handleEditRule = (rule: AutomationRule) => {
    setEditingRule(rule);
    setShowRuleBuilder(true);
  };

  const handleDeleteRule = (ruleId: string) => {
    if (confirm('Tem certeza que deseja excluir esta regra?')) {
      deleteRule(ruleId);
    }
  };

  const getRuleTypeIcon = (type: string) => {
    switch (type) {
      case 'pricing': return <Target className="h-4 w-4" />;
      case 'alert': return <Zap className="h-4 w-4" />;
      case 'workflow': return <Bot className="h-4 w-4" />;
      default: return <Bot className="h-4 w-4" />;
    }
  };

  const getRuleTypeLabel = (type: string) => {
    switch (type) {
      case 'pricing': return 'Precificação';
      case 'alert': return 'Alerta';
      case 'workflow': return 'Workflow';
      case 'notification': return 'Notificação';
      default: return type;
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 5: return 'bg-red-100 text-red-800';
      case 4: return 'bg-orange-100 text-orange-800';
      case 3: return 'bg-yellow-100 text-yellow-800';
      case 2: return 'bg-blue-100 text-blue-800';
      case 1: return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Regras de Automação</h2>
          <p className="text-gray-600">
            Configure regras personalizadas para automatizar ações no sistema
          </p>
        </div>
        
        <Dialog open={showRuleBuilder} onOpenChange={setShowRuleBuilder}>
          <DialogTrigger asChild>
            <Button onClick={() => {setEditingRule(null); setShowRuleBuilder(true)}}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Regra
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingRule ? 'Editar Regra' : 'Nova Regra de Automação'}
              </DialogTitle>
              <DialogDescription>
                Configure as condições e ações para sua regra de automação
              </DialogDescription>
            </DialogHeader>
            <RuleBuilder 
              rule={editingRule} 
              onClose={() => setShowRuleBuilder(false)} 
            />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
        </div>
      ) : rules.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhuma regra configurada</h3>
            <p className="text-gray-600 mb-4">
              Comece criando sua primeira regra de automação
            </p>
            <Button onClick={() => setShowRuleBuilder(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeira Regra
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {rules.map((rule) => (
            <Card
              key={rule.id}
              className={`transition-all hover:shadow-md ${rule.is_active ? 'border-brand-200' : 'border-gray-200'}`}
              onMouseEnter={() => {
                prefetchRule(rule.id);
                prefetchAlertsByRule(rule.id);
              }}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${rule.is_active ? 'bg-brand-100' : 'bg-gray-100'}`}>
                      {getRuleTypeIcon(rule.rule_type)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{rule.name}</CardTitle>
                      <CardDescription>{rule.description}</CardDescription>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {getRuleTypeLabel(rule.rule_type)}
                    </Badge>
                    <Badge className={getPriorityColor(rule.priority)}>
                      Prioridade {rule.priority}
                    </Badge>
                    <Switch
                      checked={rule.is_active}
                      onCheckedChange={() => handleToggleRule(rule.id, rule.is_active)}
                    />
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => executeRule(rule.id)}>
                          <Play className="h-4 w-4 mr-2" />
                          Executar Agora
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { setEditingRule(rule); setShowRuleDetails(true); }}>
                          <MoreHorizontal className="h-4 w-4 mr-2" />
                          Ver Detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditRule(rule)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteRule(rule.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-700 mb-1">Condições</p>
                    <p className="text-gray-600">
                      {rule.conditions?.length || 0} condição(ões) configurada(s)
                    </p>
                  </div>
                  
                  <div>
                    <p className="font-medium text-gray-700 mb-1">Ações</p>
                    <p className="text-gray-600">
                      {rule.actions?.length || 0} ação(ões) configurada(s)
                    </p>
                  </div>
                  
                  <div>
                    <p className="font-medium text-gray-700 mb-1">Execuções</p>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">
                        {rule.execution_count} vez(es)
                      </span>
                      {rule.last_executed_at && (
                        <span className="text-xs text-gray-400">
                          • Última: {new Date(rule.last_executed_at).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {rule.tags && rule.tags.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 flex-wrap">
                      {rule.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showRuleDetails} onOpenChange={setShowRuleDetails}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Regra</DialogTitle>
          </DialogHeader>
          {editingRule && (
            <RuleDetails ruleId={editingRule.id} onClose={() => setShowRuleDetails(false)} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
