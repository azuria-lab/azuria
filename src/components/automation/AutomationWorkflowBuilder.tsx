
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAdvancedAutomation } from '@/hooks/useAdvancedAutomation';
import { 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Pause, 
  Play,
  Plus,
  Settings,
  Workflow
} from 'lucide-react';

export function AutomationWorkflowBuilder() {
  const { workflows, isLoading } = useAdvancedAutomation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Workflows Automatizados</h2>
          <p className="text-gray-600">
            Configure sequências automatizadas de ações e aprovações
          </p>
        </div>
        
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Workflow
        </Button>
      </div>

      {workflows.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Workflow className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum workflow configurado</h3>
            <p className="text-gray-600 mb-4">
              Crie workflows para automatizar sequências complexas de ações
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Workflow
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {workflows.map((workflow) => (
            <Card key={workflow.id} className="transition-all hover:shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${workflow.is_active ? 'bg-purple-100' : 'bg-gray-100'}`}>
                      <Workflow className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{workflow.name}</CardTitle>
                      <CardDescription>{workflow.description}</CardDescription>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant={workflow.is_active ? 'default' : 'secondary'}>
                      {workflow.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                    {workflow.approval_required && (
                      <Badge variant="outline">
                        Requer Aprovação
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-700 mb-1">Gatilho</p>
                    <p className="text-gray-600 capitalize">
                      {workflow.trigger_type === 'schedule' ? 'Agendado' :
                       workflow.trigger_type === 'event' ? 'Por Evento' :
                       workflow.trigger_type === 'manual' ? 'Manual' : 'Por Condição'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="font-medium text-gray-700 mb-1">Etapas</p>
                    <p className="text-gray-600">
                      {workflow.steps?.length || 0} etapa(s) configurada(s)
                    </p>
                  </div>
                  
                  <div>
                    <p className="font-medium text-gray-700 mb-1">Execuções</p>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">
                        {workflow.run_count} vez(es)
                      </span>
                      {workflow.last_run_at && (
                        <span className="text-xs text-gray-400">
                          • Última: {new Date(workflow.last_run_at).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {workflow.next_run_at && (
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        Próxima execução: {new Date(workflow.next_run_at).toLocaleString('pt-BR')}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline">
                      <Settings className="h-4 w-4 mr-2" />
                      Configurar
                    </Button>
                    <Button size="sm" variant="outline">
                      {workflow.is_active ? (
                        <>
                          <Pause className="h-4 w-4 mr-2" />
                          Pausar
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Ativar
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
