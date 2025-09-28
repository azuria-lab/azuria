import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  AlertTriangle,
  CheckCircle,
  Eye,
  FileText,
  Filter,
  Lock,
  Search,
  Shield,
  XCircle
} from 'lucide-react';

interface GovernancePolicy {
  id: string;
  name: string;
  description: string;
  category: 'security' | 'compliance' | 'business' | 'technical';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'inactive' | 'draft';
  rules: PolicyRule[];
  applicableRoles: string[];
  exceptions: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  violationCount: number;
  complianceRate: number;
}

interface PolicyRule {
  id: string;
  condition: string;
  action: 'allow' | 'deny' | 'require_approval' | 'log_only';
  parameters: Record<string, any>;
}

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  resourceId: string;
  details: string;
  risk: 'low' | 'medium' | 'high';
  ip: string;
  userAgent: string;
  outcome: 'success' | 'failure' | 'blocked';
}

interface ComplianceReport {
  id: string;
  name: string;
  standard: 'ISO27001' | 'SOX' | 'GDPR' | 'LGPD' | 'Custom';
  status: 'compliant' | 'non_compliant' | 'partial';
  score: number;
  lastAssessment: string;
  nextAssessment: string;
  findings: number;
  criticalFindings: number;
}

export function AutomationGovernance() {
  const [activeTab, setActiveTab] = useState('policies');
  const [showPolicyDialog, setShowPolicyDialog] = useState(false);

  // Mock data para políticas
  const policies: GovernancePolicy[] = [
    {
      id: 'pol_1',
      name: 'Aprovação para Integrações Críticas',
      description: 'Todas as integrações com sistemas financeiros devem passar por aprovação do CFO',
      category: 'security',
      severity: 'critical',
      status: 'active',
      rules: [
        {
          id: 'rule_1',
          condition: 'integration.category === "financial"',
          action: 'require_approval',
          parameters: { approver: 'CFO', timeout: '48h' }
        }
      ],
      applicableRoles: ['Admin', 'Integration Manager'],
      exceptions: ['emergency_override'],
      createdBy: 'admin@empresa.com',
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: '2024-03-10T14:30:00Z',
      violationCount: 2,
      complianceRate: 98.5
    },
    {
      id: 'pol_2',
      name: 'Limite de Automações por Usuário',
      description: 'Usuários padrão podem criar no máximo 10 automações ativas',
      category: 'business',
      severity: 'medium',
      status: 'active',
      rules: [
        {
          id: 'rule_2',
          condition: 'user.role === "standard" && user.automations.count > 10',
          action: 'deny',
          parameters: { message: 'Limite de automações excedido' }
        }
      ],
      applicableRoles: ['Standard User'],
      exceptions: [],
      createdBy: 'admin@empresa.com',
      createdAt: '2024-02-01T00:00:00Z',
      updatedAt: '2024-02-01T00:00:00Z',
      violationCount: 15,
      complianceRate: 92.3
    },
    {
      id: 'pol_3',
      name: 'Auditoria de Dados Sensíveis',
      description: 'Todos os acessos a dados pessoais devem ser registrados',
      category: 'compliance',
      severity: 'high',
      status: 'active',
      rules: [
        {
          id: 'rule_3',
          condition: 'data.contains("pii") || data.contains("personal")',
          action: 'log_only',
          parameters: { retention: '7y', encryption: true }
        }
      ],
      applicableRoles: ['All'],
      exceptions: [],
      createdBy: 'dpo@empresa.com',
      createdAt: '2024-01-20T00:00:00Z',
      updatedAt: '2024-03-05T10:15:00Z',
      violationCount: 0,
      complianceRate: 100
    }
  ];

  // Mock data para logs de auditoria
  const auditLogs: AuditLog[] = [
    {
      id: 'log_1',
      timestamp: '2024-03-15T16:30:00Z',
      user: 'joao.silva@empresa.com',
      action: 'CREATE_AUTOMATION',
      resource: 'automation',
      resourceId: 'auto_123',
      details: 'Criou automação para sincronização de produtos',
      risk: 'low',
      ip: '192.168.1.45',
      userAgent: 'Mozilla/5.0...',
      outcome: 'success'
    },
    {
      id: 'log_2',
      timestamp: '2024-03-15T15:45:00Z',
      user: 'maria.santos@empresa.com',
      action: 'APPROVE_INTEGRATION',
      resource: 'integration',
      resourceId: 'int_456',
      details: 'Aprovou integração com sistema SAP',
      risk: 'medium',
      ip: '192.168.1.67',
      userAgent: 'Mozilla/5.0...',
      outcome: 'success'
    },
    {
      id: 'log_3',
      timestamp: '2024-03-15T14:20:00Z',
      user: 'carlos.admin@empresa.com',
      action: 'DELETE_POLICY',
      resource: 'policy',
      resourceId: 'pol_old',
      details: 'Removeu política obsoleta de backup',
      risk: 'high',
      ip: '192.168.1.12',
      userAgent: 'Mozilla/5.0...',
      outcome: 'success'
    },
    {
      id: 'log_4',
      timestamp: '2024-03-15T13:10:00Z',
      user: 'usuario.teste@empresa.com',
      action: 'CREATE_INTEGRATION',
      resource: 'integration',
      resourceId: 'int_blocked',
      details: 'Tentou criar integração financeira sem aprovação',
      risk: 'high',
      ip: '192.168.1.89',
      userAgent: 'Mozilla/5.0...',
      outcome: 'blocked'
    }
  ];

  // Mock data para relatórios de compliance
  const complianceReports: ComplianceReport[] = [
    {
      id: 'comp_1',
      name: 'LGPD Compliance',
      standard: 'LGPD',
      status: 'compliant',
      score: 94,
      lastAssessment: '2024-03-01T00:00:00Z',
      nextAssessment: '2024-06-01T00:00:00Z',
      findings: 3,
      criticalFindings: 0
    },
    {
      id: 'comp_2',
      name: 'ISO 27001 Assessment',
      standard: 'ISO27001',
      status: 'partial',
      score: 78,
      lastAssessment: '2024-02-15T00:00:00Z',
      nextAssessment: '2024-05-15T00:00:00Z',
      findings: 12,
      criticalFindings: 2
    },
    {
      id: 'comp_3',
      name: 'SOX Controls',
      standard: 'SOX',
      status: 'compliant',
      score: 96,
      lastAssessment: '2024-03-10T00:00:00Z',
      nextAssessment: '2024-09-10T00:00:00Z',
      findings: 1,
      criticalFindings: 0
    }
  ];

  // Estatísticas
  const stats = {
    activePolicies: policies.filter(p => p.status === 'active').length,
    avgCompliance: policies.reduce((acc, p) => acc + p.complianceRate, 0) / policies.length,
    totalViolations: policies.reduce((acc, p) => acc + p.violationCount, 0),
    auditEvents: auditLogs.length,
    highRiskEvents: auditLogs.filter(log => log.risk === 'high').length
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'security': return 'bg-red-100 text-red-800';
      case 'compliance': return 'bg-blue-100 text-blue-800';
      case 'business': return 'bg-green-100 text-green-800';
      case 'technical': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getOutcomeIcon = (outcome: string) => {
    switch (outcome) {
      case 'success': return CheckCircle;
      case 'failure': return XCircle;
      case 'blocked': return Lock;
      default: return AlertTriangle;
    }
  };

  const getComplianceStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'non_compliant': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLogOutcomeBackground = (outcome: string) => {
    switch (outcome) {
      case 'success': return 'bg-green-100';
      case 'blocked': return 'bg-red-100';
      default: return 'bg-yellow-100';
    }
  };

  const getLogOutcomeIconColor = (outcome: string) => {
    switch (outcome) {
      case 'success': return 'text-green-600';
      case 'blocked': return 'text-red-600';
      default: return 'text-yellow-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Políticas Ativas</CardTitle>
            <Shield className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activePolicies}</div>
            <p className="text-xs text-muted-foreground">Em vigor</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgCompliance.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Taxa média</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Violações</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalViolations}</div>
            <p className="text-xs text-muted-foreground">Este mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Auditoria</CardTitle>
            <Eye className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.auditEvents}</div>
            <p className="text-xs text-muted-foreground">Eventos hoje</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alto Risco</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.highRiskEvents}</div>
            <p className="text-xs text-muted-foreground">Eventos críticos</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="policies" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Políticas
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Auditoria
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Compliance
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Relatórios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="policies" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Políticas de Governança</h3>
              <p className="text-gray-600">Gerencie regras e políticas de automação</p>
            </div>
            <Button onClick={() => setShowPolicyDialog(true)}>
              <Shield className="h-4 w-4 mr-2" />
              Nova Política
            </Button>
          </div>

          <div className="space-y-4">
            {policies.map((policy, index) => (
              <motion.div
                key={policy.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Shield className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{policy.name}</CardTitle>
                          <CardDescription>{policy.description}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getCategoryColor(policy.category)}>
                          {policy.category}
                        </Badge>
                        <Badge className={getSeverityColor(policy.severity)}>
                          {policy.severity}
                        </Badge>
                        <Badge className={getStatusColor(policy.status)}>
                          {policy.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-xl font-bold text-green-900">{policy.complianceRate}%</div>
                        <div className="text-xs text-green-600">Compliance</div>
                      </div>
                      <div className="text-center p-3 bg-red-50 rounded-lg">
                        <div className="text-xl font-bold text-red-900">{policy.violationCount}</div>
                        <div className="text-xs text-red-600">Violações</div>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-xl font-bold text-blue-900">{policy.rules.length}</div>
                        <div className="text-xs text-blue-600">Regras</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-xl font-bold text-purple-900">{policy.applicableRoles.length}</div>
                        <div className="text-xs text-purple-600">Perfis</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        Criado por {policy.createdBy} em {new Date(policy.createdAt).toLocaleDateString('pt-BR')}
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={policy.status === 'active'}
                          onCheckedChange={(_checked) => {
                            // Implementar toggle de política
                          }}
                        />
                        <Button variant="outline" size="sm">
                          Editar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Logs de Auditoria</h3>
              <p className="text-gray-600">Monitore todas as atividades do sistema</p>
            </div>
            <div className="flex items-center gap-2">
              <Input placeholder="Buscar logs..." className="w-64" />
              <Button variant="outline" size="icon">
                <Search className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {auditLogs.map((log, index) => {
              const OutcomeIcon = getOutcomeIcon(log.outcome);
              
              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-sm transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${getLogOutcomeBackground(log.outcome)}`}>
                            <OutcomeIcon className={`h-4 w-4 ${getLogOutcomeIconColor(log.outcome)}`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{log.action.replace('_', ' ')}</span>
                              <Badge className={getRiskColor(log.risk)} variant="outline">
                                {log.risk} risk
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">{log.details}</p>
                            <div className="text-xs text-gray-500 mt-1">
                              {log.user} • {new Date(log.timestamp).toLocaleString('pt-BR')} • {log.ip}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">{log.resource}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Relatórios de Compliance</h3>
              <p className="text-gray-600">Status de conformidade com padrões e regulamentações</p>
            </div>
            <Button>
              <FileText className="h-4 w-4 mr-2" />
              Novo Assessment
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {complianceReports.map((report, index) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{report.name}</CardTitle>
                      <Badge className={getComplianceStatusColor(report.status)}>
                        {report.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <CardDescription>{report.standard}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-brand-600">{report.score}%</div>
                        <p className="text-sm text-gray-600">Score de Compliance</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Achados</p>
                          <p className="font-semibold">{report.findings}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Críticos</p>
                          <p className="font-semibold text-red-600">{report.criticalFindings}</p>
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-500 space-y-1">
                        <div>Última avaliação: {new Date(report.lastAssessment).toLocaleDateString('pt-BR')}</div>
                        <div>Próxima avaliação: {new Date(report.nextAssessment).toLocaleDateString('pt-BR')}</div>
                      </div>
                      
                      <Button variant="outline" className="w-full">
                        Ver Relatório Completo
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Relatórios Mensais</CardTitle>
                <CardDescription>Relatórios automáticos de governança e compliance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Relatório de Políticas - Março 2024</p>
                    <p className="text-sm text-gray-600">Gerado em 15/03/2024</p>
                  </div>
                  <Button variant="outline" size="sm">Download</Button>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Auditoria de Segurança - Março 2024</p>
                    <p className="text-sm text-gray-600">Gerado em 10/03/2024</p>
                  </div>
                  <Button variant="outline" size="sm">Download</Button>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Compliance LGPD - Trimestre Q1</p>
                    <p className="text-sm text-gray-600">Gerado em 01/03/2024</p>
                  </div>
                  <Button variant="outline" size="sm">Download</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Relatórios Customizados</CardTitle>
                <CardDescription>Crie relatórios personalizados de governança</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Tipo de Relatório</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="policies">Políticas e Regras</SelectItem>
                      <SelectItem value="audit">Logs de Auditoria</SelectItem>
                      <SelectItem value="compliance">Compliance</SelectItem>
                      <SelectItem value="violations">Violações</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Período</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o período" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7d">Últimos 7 dias</SelectItem>
                      <SelectItem value="30d">Últimos 30 dias</SelectItem>
                      <SelectItem value="90d">Últimos 90 dias</SelectItem>
                      <SelectItem value="custom">Período customizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button className="w-full">
                  <FileText className="h-4 w-4 mr-2" />
                  Gerar Relatório
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog para nova política */}
      <Dialog open={showPolicyDialog} onOpenChange={setShowPolicyDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nova Política de Governança</DialogTitle>
            <DialogDescription>
              Crie uma nova política para controlar o uso das automações
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="policy-name">Nome da Política</Label>
              <Input id="policy-name" placeholder="Digite o nome da política" />
            </div>

            <div>
              <Label htmlFor="policy-description">Descrição</Label>
              <Textarea 
                id="policy-description" 
                placeholder="Descreva o objetivo e escopo da política"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="policy-category">Categoria</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="security">Segurança</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                    <SelectItem value="business">Negócio</SelectItem>
                    <SelectItem value="technical">Técnica</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="policy-severity">Severidade</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a severidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="critical">Crítica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="policy-condition">Condição</Label>
              <Textarea 
                id="policy-condition" 
                placeholder="Ex: user.role === 'admin' && resource.type === 'integration'"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="policy-action">Ação</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a ação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="allow">Permitir</SelectItem>
                  <SelectItem value="deny">Negar</SelectItem>
                  <SelectItem value="require_approval">Exigir Aprovação</SelectItem>
                  <SelectItem value="log_only">Apenas Registrar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowPolicyDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={() => setShowPolicyDialog(false)}>
                Criar Política
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}