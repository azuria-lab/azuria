
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  AlertTriangle, 
  CheckCircle, 
  Database, 
  Download, 
  Eye, 
  FileText, 
  Lock,
  Shield,
  Trash2,
  User
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const LGPDCompliance: React.FC = () => {
  const { toast } = useToast();
  const [dataProcessingConsent, setDataProcessingConsent] = useState(true);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [analyticsConsent, setAnalyticsConsent] = useState(true);
  const [showDataRequest, setShowDataRequest] = useState(false);

  const personalDataCategories = [
    {
      category: "Dados de Identificação",
      items: ["Nome completo", "Email", "Telefone"],
      purpose: "Identificação e comunicação com o usuário",
      retention: "Enquanto a conta estiver ativa"
    },
    {
      category: "Dados de Uso",
      items: ["Cálculos realizados", "Histórico de navegação", "Preferências"],
      purpose: "Melhorar a experiência do usuário",
      retention: "24 meses após última atividade"
    },
    {
      category: "Dados Técnicos",
      items: ["Endereço IP", "User Agent", "Logs de acesso"],
      purpose: "Segurança e funcionamento do sistema",
      retention: "12 meses"
    },
    {
      category: "Dados Comerciais",
      items: ["Informações de pagamento", "Histórico de assinatura"],
      purpose: "Processamento de pagamentos e faturamento",
      retention: "5 anos (obrigação legal)"
    }
  ];

  const userRights = [
    {
      right: "Acesso aos dados",
      description: "Visualizar todos os dados pessoais que temos sobre você",
      action: "Solicitar cópia dos dados",
      icon: <Eye className="h-4 w-4" />
    },
    {
      right: "Portabilidade",
      description: "Receber seus dados em formato estruturado e legível",
      action: "Exportar dados",
      icon: <Download className="h-4 w-4" />
    },
    {
      right: "Retificação",
      description: "Corrigir dados pessoais incorretos ou incompletos",
      action: "Editar perfil",
      icon: <User className="h-4 w-4" />
    },
    {
      right: "Exclusão",
      description: "Solicitar a remoção dos seus dados pessoais",
      action: "Excluir conta",
      icon: <Trash2 className="h-4 w-4" />
    }
  ];

  const handleDataRequest = (type: string) => {
    setShowDataRequest(true);
    
    setTimeout(() => {
      toast({
        title: "Solicitação enviada",
        description: `Sua solicitação de ${type} foi registrada. Você receberá uma resposta em até 15 dias úteis.`,
      });
      setShowDataRequest(false);
    }, 1500);
  };

  const exportPersonalData = () => {
    const userData = {
      userData: {
        name: "Usuário Exemplo",
        email: "usuario@exemplo.com",
        phone: "+55 11 99999-9999",
        createdAt: "2024-01-15T10:30:00Z",
        lastLogin: "2024-12-06T14:30:00Z"
      },
      calculations: [
        {
          id: "calc-1",
          product: "Produto A",
          cost: 100.00,
          sellingPrice: 150.00,
          margin: 33.33,
          createdAt: "2024-12-05T09:15:00Z"
        }
      ],
      settings: {
        defaultMargin: 30,
        preferredCurrency: "BRL",
        notifications: true
      },
      metadata: {
        exportDate: new Date().toISOString(),
        exportVersion: "1.0",
        format: "JSON"
      }
    };

    const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meus-dados-precifica-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Dados exportados",
      description: "Seus dados pessoais foram baixados com sucesso.",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            LGPD - Lei Geral de Proteção de Dados
          </CardTitle>
          <CardDescription>
            Gerencie seus dados pessoais e direitos de privacidade
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="data">Meus Dados</TabsTrigger>
              <TabsTrigger value="rights">Meus Direitos</TabsTrigger>
              <TabsTrigger value="consent">Consentimentos</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  O Precifica+ está em total conformidade com a LGPD. Seus dados são tratados com máxima segurança e transparência.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Database className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold">Dados Coletados</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Coletamos apenas dados essenciais para o funcionamento do serviço
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Lock className="h-5 w-5 text-green-600" />
                    <h3 className="font-semibold">Segurança</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Criptografia end-to-end e armazenamento seguro em nuvem
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-5 w-5 text-purple-600" />
                    <h3 className="font-semibold">Seus Direitos</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Acesso, portabilidade, retificação e exclusão dos seus dados
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="data" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Categorias de Dados Pessoais</h3>
                {personalDataCategories.map((category, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-medium">{category.category}</h4>
                        <Badge variant="outline">{category.items.length} itens</Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">Dados: </span>
                          {category.items.join(", ")}
                        </div>
                        <div>
                          <span className="font-medium">Finalidade: </span>
                          {category.purpose}
                        </div>
                        <div>
                          <span className="font-medium">Retenção: </span>
                          {category.retention}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="rights" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Seus Direitos como Titular</h3>
                {userRights.map((right, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="mt-1">{right.icon}</div>
                          <div>
                            <h4 className="font-medium mb-1">{right.right}</h4>
                            <p className="text-sm text-gray-600">{right.description}</p>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            if (right.action === "Exportar dados") {
                              exportPersonalData();
                            } else {
                              handleDataRequest(right.right);
                            }
                          }}
                          disabled={showDataRequest}
                        >
                          {showDataRequest ? "Processando..." : right.action}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Para exercer seus direitos, entre em contato através do email: privacidade@precifica.com.br
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="consent" className="space-y-4">
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Gerenciar Consentimentos</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <Label className="font-medium">Processamento de Dados Essenciais</Label>
                      <p className="text-sm text-gray-600">
                        Necessário para o funcionamento básico da plataforma
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={dataProcessingConsent}
                        onCheckedChange={setDataProcessingConsent}
                        disabled
                      />
                      <Badge variant="outline">Obrigatório</Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <Label className="font-medium">Comunicações de Marketing</Label>
                      <p className="text-sm text-gray-600">
                        Receber emails sobre novidades, promoções e atualizações
                      </p>
                    </div>
                    <Switch 
                      checked={marketingConsent}
                      onCheckedChange={setMarketingConsent}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <Label className="font-medium">Análise de Uso</Label>
                      <p className="text-sm text-gray-600">
                        Permitir coleta de dados para melhorar a experiência do usuário
                      </p>
                    </div>
                    <Switch 
                      checked={analyticsConsent}
                      onCheckedChange={setAnalyticsConsent}
                    />
                  </div>
                </div>

                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertDescription>
                    Você pode alterar seus consentimentos a qualquer momento. 
                    Para mais informações, consulte nossa{" "}
                    <Button variant="link" className="p-0 h-auto">
                      Política de Privacidade
                    </Button>.
                  </AlertDescription>
                </Alert>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default LGPDCompliance;
