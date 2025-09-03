
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, FileSpreadsheet, FileText, Mail, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ExportOptionsPanelProps {
  batches: any[];
  aiInsights: any;
  isPro: boolean;
}

export default function ExportOptionsPanel({ batches, aiInsights, isPro }: ExportOptionsPanelProps) {
  const { toast } = useToast();
  const [selectedSections, setSelectedSections] = useState({
    batchResults: true,
    aiInsights: true,
    competitiveAnalysis: false,
    scenarios: false,
    recommendations: true
  });

  const exportFormats = [
    {
      id: "excel",
      name: "Excel Avançado",
      description: "Planilha com fórmulas, gráficos e análises interativas",
      icon: FileSpreadsheet,
      premium: true
    },
    {
      id: "pdf",
      name: "Relatório PDF",
      description: "Documento profissional com insights e recomendações",
      icon: FileText,
      premium: true
    },
    {
      id: "csv",
      name: "CSV Simples",
      description: "Dados básicos em formato CSV",
      icon: Download,
      premium: false
    }
  ];

  const shareOptions = [
    {
      id: "email",
      name: "Enviar por Email",
      description: "Compartilhar relatório via email",
      icon: Mail
    },
    {
      id: "link",
      name: "Link Compartilhável",
      description: "Gerar link seguro para visualização",
      icon: Share2
    }
  ];

  const handleExport = async (format: string) => {
    if (format !== 'csv' && !isPro) {
      toast({
        title: "Recurso PRO",
        description: "Exportação avançada disponível apenas para usuários PRO.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Exportando...",
      description: `Gerando arquivo ${format.toUpperCase()}...`,
    });

    // Simular processo de exportação
    await new Promise(resolve => setTimeout(resolve, 2000));

    toast({
      title: "Exportação Concluída",
      description: `Arquivo ${format.toUpperCase()} foi gerado com sucesso!`,
    });
  };

  const handleShare = async (method: string) => {
    if (!isPro) {
      toast({
        title: "Recurso PRO",
        description: "Compartilhamento disponível apenas para usuários PRO.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Compartilhando...",
      description: `Preparando para compartilhamento...`,
    });

    await new Promise(resolve => setTimeout(resolve, 1500));

    if (method === 'link') {
      toast({
        title: "Link Gerado",
        description: "Link copiado para a área de transferência!",
      });
    } else {
      toast({
        title: "Email Enviado",
        description: "Relatório enviado por email com sucesso!",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-indigo-600" />
            Exportação e Compartilhamento PRO
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Exporte análises completas, compartilhe insights e gere relatórios profissionais 
            para apresentações e tomada de decisões estratégicas.
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="export" className="space-y-4">
        <TabsList>
          <TabsTrigger value="export">Exportar Dados</TabsTrigger>
          <TabsTrigger value="share">Compartilhar</TabsTrigger>
          <TabsTrigger value="template">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="export" className="space-y-4">
          {/* Seleção de Seções */}
          <Card>
            <CardHeader>
              <CardTitle>Seções do Relatório</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(selectedSections).map(([key, checked]) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={key}
                    checked={checked}
                    onCheckedChange={(value) => 
                      setSelectedSections(prev => ({ ...prev, [key]: value as boolean }))
                    }
                  />
                  <label htmlFor={key} className="text-sm font-medium capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </label>
                  {(key === 'aiInsights' || key === 'competitiveAnalysis') && (
                    <Badge className="bg-purple-100 text-purple-700 text-xs">PRO</Badge>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Formatos de Exportação */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {exportFormats.map(format => (
              <Card key={format.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <format.icon className="h-8 w-8 text-indigo-600" />
                    <div>
                      <h3 className="font-medium">{format.name}</h3>
                      {format.premium && (
                        <Badge className="bg-purple-600 text-xs">PRO</Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{format.description}</p>
                  <Button
                    onClick={() => handleExport(format.id)}
                    className="w-full"
                    variant={format.premium && !isPro ? "outline" : "default"}
                    disabled={format.premium && !isPro}
                  >
                    {format.premium && !isPro ? "Upgrade PRO" : "Exportar"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="share" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {shareOptions.map(option => (
              <Card key={option.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <option.icon className="h-8 w-8 text-blue-600" />
                    <div>
                      <h3 className="font-medium">{option.name}</h3>
                      <Badge className="bg-blue-100 text-blue-700 text-xs">PRO</Badge>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{option.description}</p>
                  <Button
                    onClick={() => handleShare(option.id)}
                    className="w-full"
                    variant={!isPro ? "outline" : "default"}
                    disabled={!isPro}
                  >
                    {!isPro ? "Upgrade PRO" : "Compartilhar"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Configurações de Compartilhamento */}
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Compartilhamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Validade do Link:</label>
                  <select className="w-full p-2 border rounded" disabled={!isPro}>
                    <option>24 horas</option>
                    <option>7 dias</option>
                    <option>30 dias</option>
                    <option>Sem expiração</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Permissões:</label>
                  <select className="w-full p-2 border rounded" disabled={!isPro}>
                    <option>Apenas visualização</option>
                    <option>Baixar permitido</option>
                    <option>Comentários permitidos</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="template" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Templates Profissionais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Relatório Executivo</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Template para apresentação à diretoria com insights estratégicos
                  </p>
                  <Badge className="bg-purple-100 text-purple-700 text-xs">PRO</Badge>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Análise Técnica</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Relatório detalhado com metodologia e dados técnicos
                  </p>
                  <Badge className="bg-purple-100 text-purple-700 text-xs">PRO</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
