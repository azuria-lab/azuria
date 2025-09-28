import React, { useCallback, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3,
  Calendar,
  ChevronDown,
  ChevronRight,
  Copy,
  Database,
  Download,
  Eye,
  Filter,
  GripVertical,
  Layers,
  LayoutGrid,
  Mail,
  Palette,
  Play,
  Plus,
  Save,
  Settings,
  Table,
  Target,
  Trash2,
  Type,
  Upload
} from 'lucide-react';

interface AdvancedReportBuilderProps {
  period: string;
}

interface ReportElementTemplate {
  id: string;
  type: 'chart' | 'table' | 'metric' | 'text' | 'filter' | 'spacer';
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  defaultConfig: {
    dataSource?: string;
    chartType?: 'bar' | 'line' | 'pie' | 'area';
    columns?: string[];
    filters?: ReportFilter[];
    style: {
      width: number;
      height: number;
      backgroundColor?: string;
      textColor?: string;
      fontSize?: number;
    };
    content?: string;
    metricType?: 'currency' | 'percentage' | 'number';
    aggregation?: 'sum' | 'avg' | 'count' | 'max' | 'min';
  };
}

interface ReportElement {
  id: string;
  type: 'chart' | 'table' | 'metric' | 'text' | 'filter' | 'spacer';
  title: string;
  config: {
    dataSource?: string;
    chartType?: 'bar' | 'line' | 'pie' | 'area';
    columns?: string[];
    filters?: ReportFilter[];
    style?: {
      width?: number;
      height?: number;
      backgroundColor?: string;
      textColor?: string;
      fontSize?: number;
    };
    content?: string;
    metricType?: 'currency' | 'percentage' | 'number';
    aggregation?: 'sum' | 'avg' | 'count' | 'max' | 'min';
  };
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface ReportFilter {
  field: string;
  operator: 'equals' | 'contains' | 'greater' | 'less' | 'between';
  value: string | number;
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: 'executive' | 'operational' | 'financial' | 'marketing' | 'custom';
  elements: ReportElement[];
  settings: {
    pageSize: 'A4' | 'A3' | 'Letter';
    orientation: 'portrait' | 'landscape';
    theme: 'light' | 'dark' | 'corporate';
    margin: number;
  };
  schedule?: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string;
    recipients: string[];
    format: 'pdf' | 'excel' | 'powerpoint';
  };
}

export function AdvancedReportBuilder({ period }: AdvancedReportBuilderProps) {
  const [selectedTab, setSelectedTab] = useState('builder');
  const [currentTemplate, setCurrentTemplate] = useState<ReportTemplate | null>(null);
  const [draggedElement, setDraggedElement] = useState<ReportElementTemplate | null>(null);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Elementos disponíveis para arrastar
  const availableElements = [
    {
      type: 'chart',
      title: 'Gráfico',
      icon: BarChart3,
      description: 'Gráficos de barras, linhas, pizza ou área',
      defaultConfig: {
        chartType: 'bar',
        dataSource: 'sales_data',
        style: { width: 6, height: 4 }
      }
    },
    {
      type: 'table',
      title: 'Tabela',
      icon: Table,
      description: 'Tabela de dados com filtros e ordenação',
      defaultConfig: {
        dataSource: 'orders_data',
        columns: ['date', 'customer', 'amount'],
        style: { width: 8, height: 6 }
      }
    },
    {
      type: 'metric',
      title: 'Métrica',
      icon: Target,
      description: 'KPI ou métrica única em destaque',
      defaultConfig: {
        metricType: 'currency',
        dataSource: 'revenue_data',
        aggregation: 'sum',
        style: { width: 3, height: 2 }
      }
    },
    {
      type: 'text',
      title: 'Texto',
      icon: Type,
      description: 'Texto livre, títulos ou descrições',
      defaultConfig: {
        content: 'Texto do relatório',
        style: { width: 6, height: 1, fontSize: 14 }
      }
    },
    {
      type: 'filter',
      title: 'Filtro',
      icon: Filter,
      description: 'Controles de filtro interativos',
      defaultConfig: {
        filters: [],
        style: { width: 4, height: 1 }
      }
    }
  ];

  // Templates predefinidos
  const templates: ReportTemplate[] = [
    {
      id: 'executive_dashboard',
      name: 'Dashboard Executivo',
      description: 'Visão geral dos principais KPIs e métricas do negócio',
      category: 'executive',
      elements: [
        {
          id: '1',
          type: 'text',
          title: 'Título Principal',
          config: {
            content: 'Relatório Executivo - Dashboard Gerencial',
            style: { width: 12, height: 1, fontSize: 24, textColor: '#1f2937' }
          },
          position: { x: 0, y: 0, width: 12, height: 1 }
        },
        {
          id: '2',
          type: 'metric',
          title: 'Receita Total',
          config: {
            metricType: 'currency',
            dataSource: 'revenue',
            aggregation: 'sum',
            style: { width: 3, height: 2, backgroundColor: '#f3f4f6' }
          },
          position: { x: 0, y: 1, width: 3, height: 2 }
        },
        {
          id: '3',
          type: 'metric',
          title: 'Pedidos',
          config: {
            metricType: 'number',
            dataSource: 'orders',
            aggregation: 'count',
            style: { width: 3, height: 2, backgroundColor: '#f3f4f6' }
          },
          position: { x: 3, y: 1, width: 3, height: 2 }
        },
        {
          id: '4',
          type: 'chart',
          title: 'Receita por Mês',
          config: {
            chartType: 'line',
            dataSource: 'monthly_revenue',
            style: { width: 6, height: 4 }
          },
          position: { x: 6, y: 1, width: 6, height: 4 }
        }
      ],
      settings: {
        pageSize: 'A4',
        orientation: 'landscape',
        theme: 'light',
        margin: 20
      }
    },
    {
      id: 'operational_report',
      name: 'Relatório Operacional',
      description: 'Métricas operacionais detalhadas e análise de performance',
      category: 'operational',
      elements: [
        {
          id: '1',
          type: 'text',
          title: 'Título',
          config: {
            content: 'Relatório Operacional Detalhado',
            style: { width: 12, height: 1, fontSize: 20 }
          },
          position: { x: 0, y: 0, width: 12, height: 1 }
        },
        {
          id: '2',
          type: 'table',
          title: 'Dados Operacionais',
          config: {
            dataSource: 'operations_data',
            columns: ['processo', 'status', 'eficiencia', 'tempo_medio'],
            style: { width: 8, height: 6 }
          },
          position: { x: 0, y: 1, width: 8, height: 6 }
        },
        {
          id: '3',
          type: 'chart',
          title: 'Eficiência por Processo',
          config: {
            chartType: 'bar',
            dataSource: 'efficiency_data',
            style: { width: 4, height: 3 }
          },
          position: { x: 8, y: 1, width: 4, height: 3 }
        }
      ],
      settings: {
        pageSize: 'A4',
        orientation: 'portrait',
        theme: 'corporate',
        margin: 15
      }
    }
  ];

  const dataSources = [
    { id: 'sales_data', name: 'Dados de Vendas', description: 'Vendas por produto, canal e período' },
    { id: 'orders_data', name: 'Pedidos', description: 'Histórico de pedidos e status' },
    { id: 'revenue_data', name: 'Receita', description: 'Receita total e por categoria' },
    { id: 'customer_data', name: 'Clientes', description: 'Dados de clientes e segmentação' },
    { id: 'automation_data', name: 'Automações', description: 'Performance das automações' },
    { id: 'inventory_data', name: 'Estoque', description: 'Níveis de estoque e movimentação' }
  ];

  // Funções de drag and drop
  const handleDragStart = useCallback((element: any) => {
    setDraggedElement(element);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedElement || !currentTemplate) {return;}

    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / 50); // Grid de 50px
    const y = Math.floor((e.clientY - rect.top) / 50);

    const newElement: ReportElement = {
      id: Date.now().toString(),
      type: draggedElement.type,
      title: draggedElement.title,
      config: draggedElement.defaultConfig,
      position: {
        x,
        y,
        width: draggedElement.defaultConfig.style.width,
        height: draggedElement.defaultConfig.style.height
      }
    };

    setCurrentTemplate({
      ...currentTemplate,
      elements: [...currentTemplate.elements, newElement]
    });

    setDraggedElement(null);
  }, [draggedElement, currentTemplate]);

  const handleElementSelect = (elementId: string) => {
    setSelectedElement(elementId);
  };

  const handleElementUpdate = (elementId: string, updates: Partial<ReportElement>) => {
    if (!currentTemplate) {return;}

    setCurrentTemplate({
      ...currentTemplate,
      elements: currentTemplate.elements.map(el =>
        el.id === elementId ? { ...el, ...updates } : el
      )
    });
  };

  const handleElementDelete = (elementId: string) => {
    if (!currentTemplate) {return;}

    setCurrentTemplate({
      ...currentTemplate,
      elements: currentTemplate.elements.filter(el => el.id !== elementId)
    });
    setSelectedElement(null);
  };

  const handleTemplateLoad = (template: ReportTemplate) => {
    setCurrentTemplate({ ...template, id: Date.now().toString() });
    setSelectedElement(null);
  };

  const handleSaveTemplate = () => {
    if (!currentTemplate) {return;}
    // Aqui salvaria o template
    console.log('Salvando template:', currentTemplate);
  };

  const handleGenerateReport = async () => {
    if (!currentTemplate) {return;}

    setIsGenerating(true);
    // Simular geração do relatório
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsGenerating(false);
    
    // Download simulado
    const blob = new Blob(['Relatório gerado'], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentTemplate.name}.pdf`;
    a.click();
  };

  const selectedElementData = selectedElement 
    ? currentTemplate?.elements.find(el => el.id === selectedElement)
    : null;

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b bg-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Constructor de Relatórios Avançado</h2>
            <p className="text-gray-600">Crie relatórios personalizados com interface drag-and-drop</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setShowPreview(!showPreview)}>
              <Eye className="h-4 w-4 mr-2" />
              {showPreview ? 'Ocultar' : 'Visualizar'}
            </Button>
            
            <Button variant="outline" onClick={handleSaveTemplate} disabled={!currentTemplate}>
              <Save className="h-4 w-4 mr-2" />
              Salvar
            </Button>
            
            <Button onClick={handleGenerateReport} disabled={!currentTemplate || isGenerating}>
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Gerando...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Gerar Relatório
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Sidebar Esquerda - Elementos e Templates */}
        <div className="w-80 border-r bg-gray-50 overflow-y-auto">
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="h-full">
            <TabsList className="grid w-full grid-cols-2 m-2">
              <TabsTrigger value="elements">Elementos</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
            </TabsList>

            <TabsContent value="elements" className="p-4 space-y-4">
              <div>
                <h3 className="font-medium mb-3">Arrastar Elementos</h3>
                <div className="space-y-2">
                  {availableElements.map((element) => {
                    const Icon = element.icon;
                    return (
                      <Card
                        key={element.type}
                        className="cursor-grab active:cursor-grabbing hover:bg-gray-50 transition-colors"
                        draggable
                        onDragStart={() => handleDragStart(element)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center gap-3">
                            <Icon className="h-5 w-5 text-gray-600" />
                            <div>
                              <div className="font-medium text-sm">{element.title}</div>
                              <div className="text-xs text-gray-500">{element.description}</div>
                            </div>
                            <GripVertical className="h-4 w-4 text-gray-400 ml-auto" />
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-3">Fontes de Dados</h3>
                <div className="space-y-2">
                  {dataSources.map((source) => (
                    <Card key={source.id} className="cursor-pointer hover:bg-gray-50">
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                          <Database className="h-4 w-4 text-gray-600" />
                          <div>
                            <div className="font-medium text-sm">{source.name}</div>
                            <div className="text-xs text-gray-500">{source.description}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="templates" className="p-4 space-y-4">
              <div>
                <h3 className="font-medium mb-3">Templates Predefinidos</h3>
                <div className="space-y-2">
                  {templates.map((template) => (
                    <Card
                      key={template.id}
                      className="cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => handleTemplateLoad(template)}
                    >
                      <CardContent className="p-3">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="font-medium text-sm">{template.name}</div>
                            <Badge variant="outline" className="text-xs">
                              {template.category}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-500">{template.description}</div>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Layers className="h-3 w-3" />
                            {template.elements.length} elementos
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <Button className="w-full" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Novo Template
              </Button>
            </TabsContent>
          </Tabs>
        </div>

        {/* Área Central - Canvas do Relatório */}
        <div className="flex-1 flex flex-col">
          <div className="border-b p-3 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">
                  {currentTemplate ? currentTemplate.name : 'Novo Relatório'}
                </span>
                {currentTemplate && (
                  <Badge variant="outline">{currentTemplate.category}</Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <span className="text-sm text-gray-500">Grid: 50px</span>
              </div>
            </div>
          </div>

          <div className="flex-1 bg-gray-100 p-8 overflow-auto">
            {currentTemplate ? (
              <div
                className="bg-white shadow-lg mx-auto relative"
                style={{
                  width: currentTemplate.settings.pageSize === 'A4' ? '794px' : '1123px',
                  minHeight: currentTemplate.settings.orientation === 'portrait' ? '1123px' : '794px',
                  padding: `${currentTemplate.settings.margin}px`
                }}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                {/* Grid background */}
                <div 
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage: 'radial-gradient(circle, #666 1px, transparent 1px)',
                    backgroundSize: '50px 50px'
                  }}
                />

                {/* Elementos do relatório */}
                <AnimatePresence>
                  {currentTemplate.elements.map((element) => (
                    <motion.div
                      key={element.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className={`absolute border-2 cursor-pointer transition-colors ${
                        selectedElement === element.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-transparent hover:border-gray-300'
                      }`}
                      style={{
                        left: element.position.x * 50,
                        top: element.position.y * 50,
                        width: element.position.width * 50,
                        height: element.position.height * 50,
                        backgroundColor: element.config.style?.backgroundColor || 'transparent'
                      }}
                      onClick={() => handleElementSelect(element.id)}
                    >
                      <div className="w-full h-full p-2 flex items-center justify-center">
                        {element.type === 'text' && (
                          <div 
                            className="text-center"
                            style={{ 
                              fontSize: element.config.style?.fontSize || 14,
                              color: element.config.style?.textColor || '#000'
                            }}
                          >
                            {element.config.content}
                          </div>
                        )}
                        {element.type === 'chart' && (
                          <div className="text-center text-gray-500">
                            <BarChart3 className="h-8 w-8 mx-auto mb-2" />
                            <div className="text-xs">{element.title}</div>
                            <div className="text-xs opacity-75">{element.config.chartType}</div>
                          </div>
                        )}
                        {element.type === 'table' && (
                          <div className="text-center text-gray-500">
                            <Table className="h-8 w-8 mx-auto mb-2" />
                            <div className="text-xs">{element.title}</div>
                          </div>
                        )}
                        {element.type === 'metric' && (
                          <div className="text-center">
                            <Target className="h-8 w-8 mx-auto mb-2 text-gray-500" />
                            <div className="text-xs text-gray-500">{element.title}</div>
                          </div>
                        )}
                        {element.type === 'filter' && (
                          <div className="text-center text-gray-500">
                            <Filter className="h-8 w-8 mx-auto mb-2" />
                            <div className="text-xs">Filtros</div>
                          </div>
                        )}
                      </div>

                      {/* Botão de deletar quando selecionado */}
                      {selectedElement === element.id && (
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleElementDelete(element.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Indicador de drop zone quando arrastando */}
                {draggedElement && (
                  <div className="absolute inset-0 border-2 border-dashed border-blue-400 bg-blue-50 bg-opacity-50 flex items-center justify-center">
                    <div className="text-blue-600 text-center">
                      <Upload className="h-12 w-12 mx-auto mb-2" />
                      <div>Solte o elemento aqui</div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <LayoutGrid className="h-24 w-24 mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-medium mb-2">Comece criando seu relatório</h3>
                  <p>Selecione um template ou arraste elementos da barra lateral</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Direita - Propriedades */}
        <div className="w-80 border-l bg-white overflow-y-auto">
          <div className="p-4">
            {selectedElementData ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Propriedades do Elemento</h3>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => setSelectedElement(null)}
                  >
                    ×
                  </Button>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label>Título</Label>
                    <Input
                      value={selectedElementData.title}
                      onChange={(e) =>
                        handleElementUpdate(selectedElementData.id, { title: e.target.value })
                      }
                    />
                  </div>

                  {selectedElementData.type === 'text' && (
                    <>
                      <div>
                        <Label>Conteúdo</Label>
                        <Textarea
                          value={selectedElementData.config.content || ''}
                          onChange={(e) =>
                            handleElementUpdate(selectedElementData.id, {
                              config: { ...selectedElementData.config, content: e.target.value }
                            })
                          }
                          rows={3}
                        />
                      </div>
                      
                      <div>
                        <Label>Tamanho da Fonte</Label>
                        <Select
                          value={selectedElementData.config.style?.fontSize?.toString() || '14'}
                          onValueChange={(value) =>
                            handleElementUpdate(selectedElementData.id, {
                              config: {
                                ...selectedElementData.config,
                                style: {
                                  ...selectedElementData.config.style,
                                  fontSize: parseInt(value)
                                }
                              }
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="12">12px</SelectItem>
                            <SelectItem value="14">14px</SelectItem>
                            <SelectItem value="16">16px</SelectItem>
                            <SelectItem value="18">18px</SelectItem>
                            <SelectItem value="20">20px</SelectItem>
                            <SelectItem value="24">24px</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}

                  {selectedElementData.type === 'chart' && (
                    <>
                      <div>
                        <Label>Tipo de Gráfico</Label>
                        <Select
                          value={selectedElementData.config.chartType || 'bar'}
                          onValueChange={(value: 'bar' | 'line' | 'pie' | 'area') =>
                            handleElementUpdate(selectedElementData.id, {
                              config: { ...selectedElementData.config, chartType: value }
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bar">Barras</SelectItem>
                            <SelectItem value="line">Linhas</SelectItem>
                            <SelectItem value="pie">Pizza</SelectItem>
                            <SelectItem value="area">Área</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Fonte de Dados</Label>
                        <Select
                          value={selectedElementData.config.dataSource || ''}
                          onValueChange={(value) =>
                            handleElementUpdate(selectedElementData.id, {
                              config: { ...selectedElementData.config, dataSource: value }
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecionar fonte" />
                          </SelectTrigger>
                          <SelectContent>
                            {dataSources.map(source => (
                              <SelectItem key={source.id} value={source.id}>
                                {source.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}

                  {selectedElementData.type === 'metric' && (
                    <>
                      <div>
                        <Label>Tipo da Métrica</Label>
                        <Select
                          value={selectedElementData.config.metricType || 'number'}
                          onValueChange={(value: 'number' | 'currency' | 'percentage') =>
                            handleElementUpdate(selectedElementData.id, {
                              config: { ...selectedElementData.config, metricType: value }
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="number">Número</SelectItem>
                            <SelectItem value="currency">Moeda</SelectItem>
                            <SelectItem value="percentage">Percentual</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Agregação</Label>
                        <Select
                          value={selectedElementData.config.aggregation || 'sum'}
                          onValueChange={(value: 'sum' | 'avg' | 'count' | 'max' | 'min') =>
                            handleElementUpdate(selectedElementData.id, {
                              config: { ...selectedElementData.config, aggregation: value }
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sum">Soma</SelectItem>
                            <SelectItem value="avg">Média</SelectItem>
                            <SelectItem value="count">Contagem</SelectItem>
                            <SelectItem value="max">Máximo</SelectItem>
                            <SelectItem value="min">Mínimo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}

                  <div>
                    <Label>Posição e Tamanho</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div>
                        <Label className="text-xs">Largura</Label>
                        <Input
                          type="number"
                          value={selectedElementData.position.width}
                          onChange={(e) =>
                            handleElementUpdate(selectedElementData.id, {
                              position: {
                                ...selectedElementData.position,
                                width: parseInt(e.target.value) || 1
                              }
                            })
                          }
                          min={1}
                          max={12}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Altura</Label>
                        <Input
                          type="number"
                          value={selectedElementData.position.height}
                          onChange={(e) =>
                            handleElementUpdate(selectedElementData.id, {
                              position: {
                                ...selectedElementData.position,
                                height: parseInt(e.target.value) || 1
                              }
                            })
                          }
                          min={1}
                          max={20}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>Estilo</Label>
                    <div className="space-y-2 mt-2">
                      <div>
                        <Label className="text-xs">Cor de Fundo</Label>
                        <Input
                          type="color"
                          value={selectedElementData.config.style?.backgroundColor || '#ffffff'}
                          onChange={(e) =>
                            handleElementUpdate(selectedElementData.id, {
                              config: {
                                ...selectedElementData.config,
                                style: {
                                  ...selectedElementData.config.style,
                                  backgroundColor: e.target.value
                                }
                              }
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      const newElement = {
                        ...selectedElementData,
                        id: Date.now().toString(),
                        position: {
                          ...selectedElementData.position,
                          x: selectedElementData.position.x + 1,
                          y: selectedElementData.position.y + 1
                        }
                      };
                      if (currentTemplate) {
                        setCurrentTemplate({
                          ...currentTemplate,
                          elements: [...currentTemplate.elements, newElement]
                        });
                      }
                    }}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicar
                  </Button>
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full"
                    onClick={() => handleElementDelete(selectedElementData.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </Button>
                </div>
              </div>
            ) : currentTemplate ? (
              <div className="space-y-4">
                <h3 className="font-medium">Configurações do Relatório</h3>
                
                <div className="space-y-3">
                  <div>
                    <Label>Nome do Relatório</Label>
                    <Input
                      value={currentTemplate.name}
                      onChange={(e) =>
                        setCurrentTemplate({ ...currentTemplate, name: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <Label>Descrição</Label>
                    <Textarea
                      value={currentTemplate.description}
                      onChange={(e) =>
                        setCurrentTemplate({ ...currentTemplate, description: e.target.value })
                      }
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label>Tamanho da Página</Label>
                    <Select
                      value={currentTemplate.settings.pageSize}
                      onValueChange={(value: 'A4' | 'A3' | 'Letter') =>
                        setCurrentTemplate({
                          ...currentTemplate,
                          settings: { ...currentTemplate.settings, pageSize: value }
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A4">A4</SelectItem>
                        <SelectItem value="A3">A3</SelectItem>
                        <SelectItem value="Letter">Letter</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Orientação</Label>
                    <Select
                      value={currentTemplate.settings.orientation}
                      onValueChange={(value: 'portrait' | 'landscape') =>
                        setCurrentTemplate({
                          ...currentTemplate,
                          settings: { ...currentTemplate.settings, orientation: value }
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="portrait">Retrato</SelectItem>
                        <SelectItem value="landscape">Paisagem</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Tema</Label>
                    <Select
                      value={currentTemplate.settings.theme}
                      onValueChange={(value: 'light' | 'dark' | 'corporate') =>
                        setCurrentTemplate({
                          ...currentTemplate,
                          settings: { ...currentTemplate.settings, theme: value }
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Claro</SelectItem>
                        <SelectItem value="dark">Escuro</SelectItem>
                        <SelectItem value="corporate">Corporativo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-3">Agendamento</h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Ativar Agendamento</Label>
                      <Switch
                        checked={currentTemplate.schedule?.enabled || false}
                        onCheckedChange={(checked) =>
                          setCurrentTemplate({
                            ...currentTemplate,
                            schedule: {
                              ...currentTemplate.schedule,
                              enabled: checked,
                              frequency: 'daily',
                              time: '09:00',
                              recipients: [],
                              format: 'pdf'
                            }
                          })
                        }
                      />
                    </div>

                    {currentTemplate.schedule?.enabled && (
                      <>
                        <div>
                          <Label>Frequência</Label>
                          <Select
                            value={currentTemplate.schedule.frequency}
                            onValueChange={(value: 'daily' | 'weekly' | 'monthly') =>
                              setCurrentTemplate({
                                ...currentTemplate,
                                schedule: { ...currentTemplate.schedule!, frequency: value }
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="daily">Diário</SelectItem>
                              <SelectItem value="weekly">Semanal</SelectItem>
                              <SelectItem value="monthly">Mensal</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Horário</Label>
                          <Input
                            type="time"
                            value={currentTemplate.schedule.time}
                            onChange={(e) =>
                              setCurrentTemplate({
                                ...currentTemplate,
                                schedule: { ...currentTemplate.schedule!, time: e.target.value }
                              })
                            }
                          />
                        </div>

                        <div>
                          <Label>Formato de Exportação</Label>
                          <Select
                            value={currentTemplate.schedule.format}
                            onValueChange={(value: 'pdf' | 'excel' | 'powerpoint') =>
                              setCurrentTemplate({
                                ...currentTemplate,
                                schedule: { ...currentTemplate.schedule!, format: value }
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pdf">PDF</SelectItem>
                              <SelectItem value="excel">Excel</SelectItem>
                              <SelectItem value="powerpoint">PowerPoint</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <Settings className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Selecione um elemento ou template para ver as propriedades</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}