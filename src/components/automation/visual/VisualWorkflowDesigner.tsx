import React, { useCallback, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { 
  // AlertTriangle, 
  // ArrowRight, 
  // Calculator, 
  Clock, 
  GitBranch, 
  // Mail, 
  Play, 
  Plus, 
  Save, 
  Settings, 
  Trash2, 
  Users, 
  // Webhook, 
  Zap 
} from 'lucide-react';

// Tipos para os nós do workflow
interface WorkflowNode {
  id: string;
  type: 'trigger' | 'condition' | 'action' | 'approval' | 'delay';
  title: string;
  description?: string;
  config: Record<string, any>;
  position: { x: number; y: number };
  connections: string[];
}

interface WorkflowDesign {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export function VisualWorkflowDesigner() {
  const [workflows, setWorkflows] = useState<WorkflowDesign[]>([]);
  const [currentWorkflow, setCurrentWorkflow] = useState<WorkflowDesign | null>(null);
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [showNodeConfig, setShowNodeConfig] = useState(false);
  const [draggedNodeType, setDraggedNodeType] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Template de nós disponíveis
  const nodeTemplates = {
    trigger: {
      icon: Play,
      color: 'bg-green-500',
      title: 'Gatilho',
      description: 'Inicia o workflow',
      types: [
        { value: 'schedule', label: 'Agendado', description: 'Executa em horários específicos' },
        { value: 'event', label: 'Por Evento', description: 'Dispara quando algo acontece' },
        { value: 'webhook', label: 'Webhook', description: 'Ativado por chamada HTTP' },
        { value: 'manual', label: 'Manual', description: 'Executado manualmente' }
      ]
    },
    condition: {
      icon: GitBranch,
      color: 'bg-blue-500',
      title: 'Condição',
      description: 'Avalia uma condição',
      types: [
        { value: 'price_check', label: 'Verificar Preço', description: 'Compara preços ou margens' },
        { value: 'data_check', label: 'Verificar Dados', description: 'Valida informações específicas' },
        { value: 'time_check', label: 'Verificar Horário', description: 'Executa em períodos específicos' }
      ]
    },
    action: {
      icon: Zap,
      color: 'bg-purple-500',
      title: 'Ação',
      description: 'Executa uma ação',
      types: [
        { value: 'price_update', label: 'Atualizar Preço', description: 'Modifica preços automaticamente' },
        { value: 'notification', label: 'Notificação', description: 'Envia alertas ou mensagens' },
        { value: 'api_call', label: 'Chamada API', description: 'Integra com sistemas externos' },
        { value: 'calculation', label: 'Calcular', description: 'Executa cálculos específicos' }
      ]
    },
    approval: {
      icon: Users,
      color: 'bg-orange-500',
      title: 'Aprovação',
      description: 'Requer aprovação humana',
      types: [
        { value: 'manager_approval', label: 'Aprovação Gerente', description: 'Requer aprovação do gerente' },
        { value: 'team_approval', label: 'Aprovação Equipe', description: 'Aprovação de qualquer membro da equipe' },
        { value: 'multi_approval', label: 'Múltiplas Aprovações', description: 'Requer várias aprovações' }
      ]
    },
    delay: {
      icon: Clock,
      color: 'bg-gray-500',
      title: 'Aguardar',
      description: 'Pausa a execução',
      types: [
        { value: 'fixed_delay', label: 'Tempo Fixo', description: 'Aguarda um período específico' },
        { value: 'until_time', label: 'Até Horário', description: 'Aguarda até um horário específico' },
        { value: 'until_condition', label: 'Até Condição', description: 'Aguarda até uma condição ser atendida' }
      ]
    }
  };

  // Criar novo workflow
  const createNewWorkflow = () => {
    const newWorkflow: WorkflowDesign = {
      id: `workflow_${Date.now()}`,
      name: 'Novo Workflow',
      description: 'Descreva seu workflow aqui',
      nodes: [],
      isActive: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setCurrentWorkflow(newWorkflow);
  };

  // Adicionar nó ao workflow
  const addNodeToWorkflow = useCallback((nodeType: string, position: { x: number; y: number }) => {
    if (!currentWorkflow) {return;}

    const template = nodeTemplates[nodeType as keyof typeof nodeTemplates];
    const newNode: WorkflowNode = {
      id: `node_${Date.now()}`,
      type: nodeType as WorkflowNode['type'],
      title: template.title,
      description: template.description,
      config: {},
      position,
      connections: []
    };

    setCurrentWorkflow({
      ...currentWorkflow,
      nodes: [...currentWorkflow.nodes, newNode],
      updatedAt: new Date().toISOString()
    });
  }, [currentWorkflow]);

  // Arrastar e soltar nós
  const handleDragStart = (nodeType: string) => {
    setDraggedNodeType(nodeType);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedNodeType || !canvasRef.current) {return;}

    const rect = canvasRef.current.getBoundingClientRect();
    const position = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    addNodeToWorkflow(draggedNodeType, position);
    setDraggedNodeType(null);
  };

  // Conectar nós
  const connectNodes = (fromNodeId: string, toNodeId: string) => {
    if (!currentWorkflow) {return;}

    const updatedNodes = currentWorkflow.nodes.map(node => {
      if (node.id === fromNodeId) {
        return {
          ...node,
          connections: [...node.connections, toNodeId]
        };
      }
      return node;
    });

    setCurrentWorkflow({
      ...currentWorkflow,
      nodes: updatedNodes,
      updatedAt: new Date().toISOString()
    });
  };

  // Salvar workflow
  const saveWorkflow = () => {
    if (!currentWorkflow) {return;}

    const existingIndex = workflows.findIndex(w => w.id === currentWorkflow.id);
    if (existingIndex >= 0) {
      const updatedWorkflows = [...workflows];
      updatedWorkflows[existingIndex] = currentWorkflow;
      setWorkflows(updatedWorkflows);
    } else {
      setWorkflows([...workflows, currentWorkflow]);
    }
  };

  // Configurar nó
  const configureNode = (node: WorkflowNode) => {
    setSelectedNode(node);
    setShowNodeConfig(true);
  };

  // Remover nó
  const removeNode = (nodeId: string) => {
    if (!currentWorkflow) {return;}

    const updatedNodes = currentWorkflow.nodes.filter(node => node.id !== nodeId);
    // Remover conexões para este nó
    const cleanedNodes = updatedNodes.map(node => ({
      ...node,
      connections: node.connections.filter(connId => connId !== nodeId)
    }));

    setCurrentWorkflow({
      ...currentWorkflow,
      nodes: cleanedNodes,
      updatedAt: new Date().toISOString()
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Designer Visual de Workflows</h2>
          <p className="text-gray-600">Crie workflows arrastrando e conectando componentes</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setCurrentWorkflow(null)}>
            Listar Workflows
          </Button>
          <Button onClick={createNewWorkflow}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Workflow
          </Button>
        </div>
      </div>

      {currentWorkflow ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[80vh]">
          {/* Palette de Componentes */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Componentes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(nodeTemplates).map(([type, template]) => {
                const Icon = template.icon;
                return (
                  <div
                    key={type}
                    draggable
                    onDragStart={() => handleDragStart(type)}
                    className="p-3 border rounded-lg cursor-grab hover:border-brand-300 hover:bg-brand-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${template.color} text-white`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">{template.title}</p>
                        <p className="text-xs text-gray-600">{template.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Canvas de Design */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <GitBranch className="h-5 w-5" />
                  {currentWorkflow.name}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant={currentWorkflow.isActive ? 'default' : 'secondary'}>
                    {currentWorkflow.isActive ? 'Ativo' : 'Inativo'}
                  </Badge>
                  <Button size="sm" variant="outline" onClick={saveWorkflow}>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div
                ref={canvasRef}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="relative w-full h-96 bg-gray-50 border-2 border-dashed border-gray-300 overflow-auto"
                style={{ minHeight: '500px' }}
              >
                {currentWorkflow.nodes.length === 0 ? (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <GitBranch className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium mb-2">Canvas Vazio</p>
                      <p>Arraste componentes da paleta para começar</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Renderizar nós */}
                    {currentWorkflow.nodes.map((node) => {
                      const template = nodeTemplates[node.type];
                      const Icon = template.icon;
                      return (
                        <motion.div
                          key={node.id}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute"
                          style={{
                            left: node.position.x,
                            top: node.position.y,
                            transform: 'translate(-50%, -50%)'
                          }}
                        >
                          <div className="bg-white border-2 border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow min-w-32">
                            <div className="flex items-center gap-2 mb-2">
                              <div className={`p-1 rounded ${template.color} text-white`}>
                                <Icon className="h-3 w-3" />
                              </div>
                              <span className="text-sm font-medium">{node.title}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0"
                                onClick={() => configureNode(node)}
                              >
                                <Settings className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                                onClick={() => removeNode(node.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}

                    {/* Renderizar conexões */}
                    <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: -1 }}>
                      {currentWorkflow.nodes.map((node) =>
                        node.connections.map((targetId) => {
                          const targetNode = currentWorkflow.nodes.find(n => n.id === targetId);
                          if (!targetNode) {return null;}

                          return (
                            <line
                              key={`${node.id}-${targetId}`}
                              x1={node.position.x}
                              y1={node.position.y}
                              x2={targetNode.position.x}
                              y2={targetNode.position.y}
                              stroke="#6366f1"
                              strokeWidth="2"
                              markerEnd="url(#arrowhead)"
                            />
                          );
                        })
                      )}
                      <defs>
                        <marker
                          id="arrowhead"
                          markerWidth="10"
                          markerHeight="7"
                          refX="9"
                          refY="3.5"
                          orient="auto"
                        >
                          <polygon
                            points="0 0, 10 3.5, 0 7"
                            fill="#6366f1"
                          />
                        </marker>
                      </defs>
                    </svg>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Propriedades */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Propriedades do Workflow</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="workflow-name">Nome</Label>
                <Input
                  id="workflow-name"
                  value={currentWorkflow.name}
                  onChange={(e) => setCurrentWorkflow({
                    ...currentWorkflow,
                    name: e.target.value
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="workflow-description">Descrição</Label>
                <Textarea
                  id="workflow-description"
                  value={currentWorkflow.description}
                  onChange={(e) => setCurrentWorkflow({
                    ...currentWorkflow,
                    description: e.target.value
                  })}
                  rows={3}
                />
              </div>
              <Separator />
              <div className="space-y-2">
                <h4 className="font-medium">Estatísticas</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Nós: {currentWorkflow.nodes.length}</p>
                  <p>Conexões: {currentWorkflow.nodes.reduce((acc, node) => acc + node.connections.length, 0)}</p>
                  <p>Criado: {new Date(currentWorkflow.createdAt).toLocaleDateString('pt-BR')}</p>
                  <p>Atualizado: {new Date(currentWorkflow.updatedAt).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        // Lista de Workflows
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workflows.map((workflow) => (
              <Card key={workflow.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{workflow.name}</CardTitle>
                    <Badge variant={workflow.isActive ? 'default' : 'secondary'}>
                      {workflow.isActive ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{workflow.description}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>{workflow.nodes.length} nós</span>
                    <span>{new Date(workflow.updatedAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => setCurrentWorkflow(workflow)}
                      className="flex-1"
                    >
                      Editar
                    </Button>
                    <Button size="sm" variant="outline">
                      <Play className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {/* Card para criar novo workflow */}
            <Card 
              className="border-dashed border-2 hover:border-brand-300 hover:bg-brand-50 transition-colors cursor-pointer"
              onClick={createNewWorkflow}
            >
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Plus className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">Criar Novo Workflow</h3>
                <p className="text-gray-600 text-center">
                  Use o designer visual para criar automações personalizadas
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Dialog de Configuração de Nó */}
      <Dialog open={showNodeConfig} onOpenChange={setShowNodeConfig}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Configurar {selectedNode?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedNode && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Tipo de {selectedNode.title}</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {nodeTemplates[selectedNode.type]?.types.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div>
                          <p className="font-medium">{type.label}</p>
                          <p className="text-xs text-gray-600">{type.description}</p>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowNodeConfig(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => setShowNodeConfig(false)}>
                  Salvar Configuração
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}