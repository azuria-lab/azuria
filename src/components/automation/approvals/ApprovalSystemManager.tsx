import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  AlertTriangle, 
  Building, 
  Calendar, 
  CheckCircle, 
  Clock, 
  Eye, 
  Filter,
  Plus,
  Settings,
  Shield,
  User,
  XCircle
} from 'lucide-react';

interface ApprovalRequest {
  id: string;
  title: string;
  description: string;
  type: 'workflow' | 'rule' | 'price_change' | 'integration' | 'policy';
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  priority: 'low' | 'medium' | 'high' | 'critical';
  requestedBy: {
    id: string;
    name: string;
    avatar?: string;
    role: string;
    department: string;
  };
  approvers: {
    id: string;
    name: string;
    avatar?: string;
    role: string;
    status: 'pending' | 'approved' | 'rejected';
    level: number;
    comment?: string;
    decidedAt?: string;
  }[];
  requestData: Record<string, unknown>;
  createdAt: string;
  expiresAt: string;
  approvalChain: ApprovalLevel[];
}

interface ApprovalLevel {
  level: number;
  name: string;
  required: number; // Quantos aprovadores são necessários neste nível
  approvers: string[]; // IDs dos usuários que podem aprovar neste nível
  conditions?: {
    amount?: number;
    percentage?: number;
    category?: string[];
  };
}

interface ApprovalPolicy {
  id: string;
  name: string;
  description: string;
  type: 'workflow' | 'rule' | 'price_change' | 'integration' | 'policy';
  isActive: boolean;
  levels: ApprovalLevel[];
  conditions: {
    amountThreshold?: number;
    percentageThreshold?: number;
    categories?: string[];
    departments?: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export function ApprovalSystemManager() {
  const [activeTab, setActiveTab] = useState('requests');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
  const [showRequestDetails, setShowRequestDetails] = useState(false);

  // Mock data
  const approvalRequests: ApprovalRequest[] = [
    {
      id: 'req_1',
      title: 'Alteração Automática de Preços - Black Friday',
      description: 'Workflow para ajustar preços automaticamente durante a Black Friday com desconto de até 40%',
      type: 'workflow',
      status: 'pending',
      priority: 'high',
      requestedBy: {
        id: 'user_1',
        name: 'João Silva',
        avatar: '',
        role: 'Analista de Pricing',
        department: 'Comercial'
      },
      approvers: [
        {
          id: 'mgr_1',
          name: 'Maria Santos',
          avatar: '',
          role: 'Gerente Comercial',
          status: 'approved',
          level: 1,
          comment: 'Aprovado para a Black Friday',
          decidedAt: '2024-03-15T10:30:00Z'
        },
        {
          id: 'dir_1',
          name: 'Carlos Lima',
          avatar: '',
          role: 'Diretor Comercial',
          status: 'pending',
          level: 2
        }
      ],
      requestData: {
        maxDiscount: 40,
        categories: ['Eletrônicos', 'Casa e Jardim'],
        duration: '7 days'
      },
      createdAt: '2024-03-15T09:00:00Z',
      expiresAt: '2024-03-20T23:59:59Z',
      approvalChain: [
        {
          level: 1,
          name: 'Gerente Imediato',
          required: 1,
          approvers: ['mgr_1']
        },
        {
          level: 2,
          name: 'Diretor',
          required: 1,
          approvers: ['dir_1'],
          conditions: { percentage: 30 }
        }
      ]
    },
    {
      id: 'req_2',
      title: 'Nova Integração ERP SAP',
      description: 'Configuração de integração automática com ERP SAP para sincronização de produtos e preços',
      type: 'integration',
      status: 'pending',
      priority: 'critical',
      requestedBy: {
        id: 'user_2',
        name: 'Ana Costa',
        avatar: '',
        role: 'Especialista em Integrações',
        department: 'TI'
      },
      approvers: [
        {
          id: 'ti_mgr_1',
          name: 'Pedro Oliveira',
          avatar: '',
          role: 'Gerente de TI',
          status: 'pending',
          level: 1
        },
        {
          id: 'cto_1',
          name: 'Luiza Fernandes',
          avatar: '',
          role: 'CTO',
          status: 'pending',
          level: 2
        }
      ],
      requestData: {
        system: 'SAP ERP',
        modules: ['Products', 'Pricing', 'Inventory'],
        estimatedCost: 'R$ 45.000'
      },
      createdAt: '2024-03-14T14:20:00Z',
      expiresAt: '2024-03-21T23:59:59Z',
      approvalChain: [
        {
          level: 1,
          name: 'Gerente de TI',
          required: 1,
          approvers: ['ti_mgr_1']
        },
        {
          level: 2,
          name: 'CTO',
          required: 1,
          approvers: ['cto_1']
        }
      ]
    },
    {
      id: 'req_3',
      title: 'Regra de Margem Mínima por Categoria',
      description: 'Implementar regra que bloqueia vendas com margem inferior a 15% em produtos eletrônicos',
      type: 'rule',
      status: 'approved',
      priority: 'medium',
      requestedBy: {
        id: 'user_3',
        name: 'Roberto Alves',
        avatar: '',
        role: 'Coordenador de Produtos',
        department: 'Produtos'
      },
      approvers: [
        {
          id: 'prod_mgr_1',
          name: 'Sandra Ribeiro',
          avatar: '',
          role: 'Gerente de Produtos',
          status: 'approved',
          level: 1,
          comment: 'Regra essencial para manter lucratividade',
          decidedAt: '2024-03-13T16:45:00Z'
        }
      ],
      requestData: {
        category: 'Eletrônicos',
        minMargin: 15,
        action: 'block_sale'
      },
      createdAt: '2024-03-13T11:00:00Z',
      expiresAt: '2024-03-18T23:59:59Z',
      approvalChain: [
        {
          level: 1,
          name: 'Gerente de Produtos',
          required: 1,
          approvers: ['prod_mgr_1']
        }
      ]
    }
  ];

  const approvalPolicies: ApprovalPolicy[] = [
    {
      id: 'policy_1',
      name: 'Política de Alteração de Preços',
      description: 'Define aprovações necessárias para alterações de preço baseadas na porcentagem de desconto',
      type: 'price_change',
      isActive: true,
      levels: [
        {
          level: 1,
          name: 'Supervisor',
          required: 1,
          approvers: ['sup_1', 'sup_2'],
          conditions: { percentage: 10 }
        },
        {
          level: 2,
          name: 'Gerente',
          required: 1,
          approvers: ['mgr_1', 'mgr_2'],
          conditions: { percentage: 25 }
        },
        {
          level: 3,
          name: 'Diretor',
          required: 1,
          approvers: ['dir_1'],
          conditions: { percentage: 40 }
        }
      ],
      conditions: {
        percentageThreshold: 10,
        categories: ['all']
      },
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: '2024-03-01T00:00:00Z'
    },
    {
      id: 'policy_2',
      name: 'Política de Integrações Críticas',
      description: 'Aprovações para integrações que afetam sistemas críticos da empresa',
      type: 'integration',
      isActive: true,
      levels: [
        {
          level: 1,
          name: 'Gerente de TI',
          required: 1,
          approvers: ['ti_mgr_1']
        },
        {
          level: 2,
          name: 'CTO',
          required: 1,
          approvers: ['cto_1']
        },
        {
          level: 3,
          name: 'CEO',
          required: 1,
          approvers: ['ceo_1'],
          conditions: { amount: 50000 }
        }
      ],
      conditions: {
        amountThreshold: 10000,
        departments: ['TI', 'Operações']
      },
      createdAt: '2024-02-01T00:00:00Z',
      updatedAt: '2024-02-15T00:00:00Z'
    }
  ];

  // Estatísticas
  const stats = {
    pendingRequests: approvalRequests.filter(r => r.status === 'pending').length,
    overdueRequests: approvalRequests.filter(r => 
      r.status === 'pending' && new Date(r.expiresAt) < new Date()
    ).length,
    approvedToday: approvalRequests.filter(r => 
      r.status === 'approved' && 
      new Date(r.approvers[0]?.decidedAt || 0).toDateString() === new Date().toDateString()
    ).length,
    activePolicies: approvalPolicies.filter(p => p.isActive).length
  };

  // Filtrar requests
  const filteredRequests = approvalRequests.filter(request => {
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || request.priority === filterPriority;
    return matchesStatus && matchesPriority;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return CheckCircle;
      case 'rejected': return XCircle;
      case 'expired': return AlertTriangle;
      default: return Clock;
    }
  };

  const getApproverStatusStyle = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-50 border-green-200';
      case 'rejected': return 'bg-red-50 border-red-200';
      case 'pending': return 'bg-blue-50 border-blue-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const handleApprovalAction = (requestId: string, action: 'approve' | 'reject', comment?: string) => {
    // Implementar lógica de aprovação/rejeição
    // TODO: Implementar API call para ação de aprovação
    if (comment) {
      // Usar comment para logging específico
    }
    // Simulação de ação de aprovação
    const _updatedRequests = approvalRequests.map(req => 
      req.id === requestId ? { ...req, status: action === 'approve' ? 'approved' : 'rejected' } : req
    );
    // Atualizar estado dos requests
  };  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{stats.pendingRequests}</div>
            <p className="text-xs text-blue-600">Aguardando aprovação</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atrasadas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">{stats.overdueRequests}</div>
            <p className="text-xs text-red-600">Prazo vencido</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprovadas Hoje</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{stats.approvedToday}</div>
            <p className="text-xs text-green-600">Processadas hoje</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Políticas Ativas</CardTitle>
            <Shield className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{stats.activePolicies}</div>
            <p className="text-xs text-purple-600">Regras configuradas</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Solicitações
          </TabsTrigger>
          <TabsTrigger value="policies" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Políticas
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-4">
          {/* Filtros */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filtrar por status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Status</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="approved">Aprovado</SelectItem>
                    <SelectItem value="rejected">Rejeitado</SelectItem>
                    <SelectItem value="expired">Expirado</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterPriority} onValueChange={setFilterPriority}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filtrar por prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as Prioridades</SelectItem>
                    <SelectItem value="critical">Crítica</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="low">Baixa</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Mais Filtros
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Solicitações */}
          <div className="space-y-4">
            {filteredRequests.map((request, index) => {
              const StatusIcon = getStatusIcon(request.status);
              const currentApprover = request.approvers.find(a => a.status === 'pending');
              const isOverdue = new Date(request.expiresAt) < new Date() && request.status === 'pending';
              
              return (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`hover:shadow-md transition-shadow ${isOverdue ? 'border-red-200 bg-red-50' : ''}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <CardTitle className="text-lg">{request.title}</CardTitle>
                            <Badge className={getPriorityColor(request.priority)}>
                              {request.priority.toUpperCase()}
                            </Badge>
                            <Badge className={getStatusColor(request.status)}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                            </Badge>
                            {isOverdue && (
                              <Badge variant="destructive">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Atrasado
                              </Badge>
                            )}
                          </div>
                          <CardDescription className="mb-3">
                            {request.description}
                          </CardDescription>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={request.requestedBy.avatar} />
                                <AvatarFallback>{request.requestedBy.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span>{request.requestedBy.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {request.requestedBy.role}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>Expira em {new Date(request.expiresAt).toLocaleDateString('pt-BR')}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <div className="space-y-4">
                        {/* Cadeia de Aprovação */}
                        <div>
                          <h4 className="font-medium mb-2">Cadeia de Aprovação</h4>
                          <div className="flex items-center gap-2 flex-wrap">
                            {request.approvers.map((approver, approverIndex) => (
                              <div key={approver.id} className="flex items-center gap-2">
                                {approverIndex > 0 && <div className="w-4 h-px bg-gray-300" />}
                                <div className={`flex items-center gap-2 p-2 rounded-lg border ${getApproverStatusStyle(approver.status)}`}>
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage src={approver.avatar} />
                                    <AvatarFallback>{approver.name.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <div className="text-sm">
                                    <p className="font-medium">{approver.name}</p>
                                    <p className="text-xs text-gray-600">{approver.role}</p>
                                  </div>
                                  <div className="ml-2">
                                    {approver.status === 'approved' && <CheckCircle className="h-4 w-4 text-green-600" />}
                                    {approver.status === 'rejected' && <XCircle className="h-4 w-4 text-red-600" />}
                                    {approver.status === 'pending' && <Clock className="h-4 w-4 text-blue-600" />}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Ações */}
                        <div className="flex items-center justify-between pt-2 border-t">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedRequest(request);
                                setShowRequestDetails(true);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Detalhes
                            </Button>
                            {request.status === 'pending' && currentApprover && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleApprovalAction(request.id, 'approve')}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Aprovar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleApprovalAction(request.id, 'reject')}
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Rejeitar
                                </Button>
                              </>
                            )}
                          </div>
                          
                          {currentApprover && request.status === 'pending' && (
                            <div className="text-sm text-gray-600">
                              Aguardando: <span className="font-medium">{currentApprover.name}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="policies" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Políticas de Aprovação</h3>
              <p className="text-gray-600">Configure regras de aprovação para diferentes tipos de solicitações</p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Política
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {approvalPolicies.map((policy) => (
              <Card key={policy.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{policy.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant={policy.isActive ? 'default' : 'secondary'}>
                        {policy.isActive ? 'Ativa' : 'Inativa'}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription>{policy.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium mb-2">Níveis de Aprovação</h4>
                      <div className="space-y-2">
                        {policy.levels.map((level) => (
                          <div key={level.level} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div>
                              <span className="font-medium">Nível {level.level}: {level.name}</span>
                              <p className="text-xs text-gray-600">
                                {level.required} aprovador(es) necessário(s)
                              </p>
                            </div>
                            <Badge variant="outline">{level.approvers.length} pessoas</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t text-xs text-gray-500">
                      Atualizada em {new Date(policy.updatedAt).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Tempo Médio de Aprovação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">2.3 dias</div>
                <p className="text-sm text-gray-600">Última semana: 1.8 dias</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Taxa de Aprovação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">87%</div>
                <p className="text-sm text-gray-600">312 de 358 solicitações</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog de Detalhes da Solicitação */}
      <Dialog open={showRequestDetails} onOpenChange={setShowRequestDetails}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Solicitação</DialogTitle>
            <DialogDescription>
              {selectedRequest?.title}
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-6">
              {/* Conteúdo dos detalhes seria implementado aqui */}
              <p>Detalhes completos da solicitação {selectedRequest.id}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}