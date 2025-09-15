import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useAdvancedAutomation } from '@/hooks/useAdvancedAutomation';
import type { AutomationRule, RuleAction, RuleCondition } from '@/types/automation';
import { Plus, Settings, Trash2, Zap } from 'lucide-react';
import { randomUUID } from '@/utils/crypto';

interface RuleBuilderProps {
  rule?: AutomationRule | null;
  onClose: () => void;
}

export function RuleBuilder({ rule, onClose }: RuleBuilderProps) {
  const { createRule, updateRule } = useAdvancedAutomation();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    rule_type: 'pricing' as 'pricing' | 'alert' | 'workflow' | 'notification',
    priority: 3 as 1 | 2 | 3 | 4 | 5,
    is_active: true,
    conditions: [] as RuleCondition[],
    actions: [] as RuleAction[],
    tags: [] as string[],
  });

  useEffect(() => {
    if (rule) {
      setFormData({
        name: rule.name,
        description: rule.description || '',
        rule_type: rule.rule_type,
        priority: rule.priority,
        is_active: rule.is_active,
        conditions: rule.conditions || [],
        actions: rule.actions || [],
        tags: rule.tags || [],
      });
    }
  }, [rule]);

  const addCondition = () => {
    const newCondition: RuleCondition = {
      id: randomUUID(),
      type: 'product',
      field: 'cost',
      operator: 'greater_than',
      value: '',
      logic: 'and',
    };
    setFormData(prev => ({
      ...prev,
      conditions: [...prev.conditions, newCondition],
    }));
  };

  const updateCondition = (index: number, updates: Partial<RuleCondition>) => {
    setFormData(prev => ({
      ...prev,
      conditions: prev.conditions.map((condition, i) => 
        i === index ? { ...condition, ...updates } : condition
      ),
    }));
  };

  const removeCondition = (index: number) => {
    setFormData(prev => ({
      ...prev,
      conditions: prev.conditions.filter((_, i) => i !== index),
    }));
  };

  const addAction = () => {
    const newAction: RuleAction = {
      id: randomUUID(),
      type: 'price_adjustment',
      config: {},
    };
    setFormData(prev => ({
      ...prev,
      actions: [...prev.actions, newAction],
    }));
  };

  const updateAction = (index: number, updates: Partial<RuleAction>) => {
    setFormData(prev => ({
      ...prev,
      actions: prev.actions.map((action, i) => 
        i === index ? { ...action, ...updates } : action
      ),
    }));
  };

  const removeAction = (index: number) => {
    setFormData(prev => ({
      ...prev,
      actions: prev.actions.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      return;
    }

    const ruleData = {
      ...formData,
      conditions: formData.conditions,
      actions: formData.actions,
    };

    if (rule) {
      updateRule({ id: rule.id, updates: ruleData });
    } else {
      createRule(ruleData);
    }
    
    onClose();
  };

  const conditionTypes = [
    { value: 'product', label: 'Produto' },
    { value: 'market', label: 'Mercado' },
    { value: 'time', label: 'Tempo' },
    { value: 'calculation', label: 'Cálculo' },
  ];

  const operators = [
    { value: 'equals', label: 'Igual a' },
    { value: 'not_equals', label: 'Diferente de' },
    { value: 'greater_than', label: 'Maior que' },
    { value: 'less_than', label: 'Menor que' },
    { value: 'contains', label: 'Contém' },
    { value: 'between', label: 'Entre' },
  ];

  const actionTypes = [
    { value: 'price_adjustment', label: 'Ajuste de Preço' },
    { value: 'alert', label: 'Criar Alerta' },
    { value: 'notification', label: 'Enviar Notificação' },
    { value: 'webhook', label: 'Chamar Webhook' },
    { value: 'api_call', label: 'Chamada de API' },
  ];

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Informações Básicas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Regra</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Alerta de Margem Baixa"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Tipo da Regra</Label>
              <Select 
                value={formData.rule_type} 
                onValueChange={(value: 'pricing' | 'alert' | 'workflow' | 'notification') => setFormData(prev => ({ ...prev, rule_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pricing">Precificação</SelectItem>
                  <SelectItem value="alert">Alerta</SelectItem>
                  <SelectItem value="workflow">Workflow</SelectItem>
                  <SelectItem value="notification">Notificação</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva o que esta regra faz..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Prioridade</Label>
              <Select 
                value={formData.priority.toString()} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, priority: parseInt(value) as 1 | 2 | 3 | 4 | 5 }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Baixa</SelectItem>
                  <SelectItem value="2">2 - Normal</SelectItem>
                  <SelectItem value="3">3 - Média</SelectItem>
                  <SelectItem value="4">4 - Alta</SelectItem>
                  <SelectItem value="5">5 - Crítica</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2 pt-6">
              <Switch
                id="active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
              <Label htmlFor="active">Regra ativa</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conditions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Condições
            </CardTitle>
            <Button size="sm" onClick={addCondition}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Condição
            </Button>
          </div>
          <CardDescription>
            Configure quando esta regra deve ser executada
          </CardDescription>
        </CardHeader>
        <CardContent>
          {formData.conditions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Nenhuma condição configurada</p>
              <Button variant="outline" size="sm" onClick={addCondition} className="mt-2">
                Adicionar Primeira Condição
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {formData.conditions.map((condition, index) => (
                <div key={condition.id} className="border rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="space-y-2">
                      <Label>Tipo</Label>
                      <Select 
                        value={condition.type} 
                        onValueChange={(value: 'product' | 'market' | 'time' | 'calculation') => updateCondition(index, { type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {conditionTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Campo</Label>
                      <Input
                        value={condition.field}
                        onChange={(e) => updateCondition(index, { field: e.target.value })}
                        placeholder="Ex: cost, margin"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Operador</Label>
                      <Select 
                        value={condition.operator} 
                        onValueChange={(value: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'between') => updateCondition(index, { operator: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {operators.map(op => (
                            <SelectItem key={op.value} value={op.value}>
                              {op.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Valor</Label>
                      <div className="flex gap-2">
                        <Input
                          value={String(condition.value ?? "")}
                          onChange={(e) => updateCondition(index, { value: e.target.value })}
                          placeholder="Valor"
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeCondition(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Ações</CardTitle>
            <Button size="sm" onClick={addAction}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Ação
            </Button>
          </div>
          <CardDescription>
            Configure o que acontece quando as condições são atendidas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {formData.actions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Nenhuma ação configurada</p>
              <Button variant="outline" size="sm" onClick={addAction} className="mt-2">
                Adicionar Primeira Ação
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {formData.actions.map((action, index) => (
                <div key={action.id} className="border rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div className="space-y-2">
                      <Label>Tipo de Ação</Label>
                      <Select 
                        value={action.type} 
                        onValueChange={(value: 'price_adjustment' | 'alert' | 'notification' | 'webhook' | 'api_call') => updateAction(index, { type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {actionTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Configuração</Label>
                      <Input
                        value={JSON.stringify(action.config)}
                        onChange={(e) => {
                          try {
                            const config = JSON.parse(e.target.value);
                            updateAction(index, { config });
                          } catch {
                            // Ignore invalid JSON
                          }
                        }}
                        placeholder='{"key": "value"}'
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeAction(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Actions */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit}>
          {rule ? 'Atualizar Regra' : 'Criar Regra'}
        </Button>
      </div>
    </div>
  );
}
