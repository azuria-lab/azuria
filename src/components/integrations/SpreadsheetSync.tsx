import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, ExternalLink, FileSpreadsheet, RefreshCw, Upload } from "lucide-react";

interface SpreadsheetConnection {
  id: string;
  name: string;
  type: 'google' | 'excel';
  url: string;
  lastSync: string;
}

export default function SpreadsheetSync() {
  const { toast } = useToast();
  const [spreadsheetUrl, setSpreadsheetUrl] = useState("");
  const [spreadsheetName, setSpreadsheetName] = useState("");
  const [spreadsheetType, setSpreadsheetType] = useState<'google' | 'excel'>('google');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connections, setConnections] = useState<SpreadsheetConnection[]>([]);
  const [autoSync, setAutoSync] = useState(false);

  const handleConnect = async () => {
    if (!spreadsheetUrl || !spreadsheetName) {
      toast({
        title: "Erro",
        description: "Preencha o nome e a URL da planilha",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);
    
    // Simular conexão
    setTimeout(() => {
      const newConnection: SpreadsheetConnection = {
        id: Date.now().toString(),
        name: spreadsheetName,
        type: spreadsheetType,
        url: spreadsheetUrl,
        lastSync: new Date().toLocaleString('pt-BR')
      };
      
      setConnections(prev => [...prev, newConnection]);
      
      toast({
        title: "Planilha Conectada",
        description: `${spreadsheetName} foi conectada com sucesso`,
      });
      
      setSpreadsheetUrl("");
      setSpreadsheetName("");
      setIsConnecting(false);
    }, 1500);
  };

  const handleSync = (connectionId: string) => {
    toast({
      title: "Sincronizando",
      description: "Enviando dados para a planilha...",
    });
    
    setTimeout(() => {
      setConnections(prev => prev.map(conn => 
        conn.id === connectionId 
          ? { ...conn, lastSync: new Date().toLocaleString('pt-BR') }
          : conn
      ));
      
      toast({
        title: "Sincronização Concluída",
        description: "Dados enviados para a planilha com sucesso",
      });
    }, 2000);
  };

  const handleDisconnect = (connectionId: string) => {
    setConnections(prev => prev.filter(conn => conn.id !== connectionId));
    
    toast({
      title: "Planilha Desconectada",
      description: "A conexão foi removida",
    });
  };

  const handleImportData = () => {
    toast({
      title: "Importando Dados",
      description: "Buscando produtos das planilhas conectadas...",
    });
    
    setTimeout(() => {
      toast({
        title: "Importação Concluída",
        description: "156 produtos importados com sucesso",
      });
    }, 2500);
  };

  const handleExportData = () => {
    toast({
      title: "Exportando Dados",
      description: "Enviando cálculos para todas as planilhas...",
    });
    
    setTimeout(() => {
      toast({
        title: "Exportação Concluída",
        description: "Dados enviados para todas as planilhas conectadas",
      });
    }, 2000);
  };

  const getTypeIcon = (type: 'google' | 'excel') => {
    return type === 'google' ? '📊' : '📈';
  };

  const getTypeBadge = (type: 'google' | 'excel') => {
    return type === 'google' 
      ? "bg-green-100 text-green-800" 
      : "bg-blue-100 text-blue-800";
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-gray-600 mb-4">
          Sincronize seus dados com Google Sheets ou Excel Online para manter suas planilhas sempre atualizadas.
        </p>
      </div>

      {/* Formulário de conexão */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Conectar Planilha
          </CardTitle>
          <CardDescription>
            Adicione uma nova conexão com Google Sheets ou Excel Online
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Planilha</Label>
              <Input
                id="name"
                placeholder="Ex: Controle de Preços"
                value={spreadsheetName}
                onChange={(e) => setSpreadsheetName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select value={spreadsheetType} onValueChange={(value: 'google' | 'excel') => setSpreadsheetType(value)}>
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="google">Google Sheets</SelectItem>
                  <SelectItem value="excel">Excel Online</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">URL da Planilha</Label>
            <Input
              id="url"
              placeholder="https://docs.google.com/spreadsheets/d/..."
              value={spreadsheetUrl}
              onChange={(e) => setSpreadsheetUrl(e.target.value)}
            />
            <p className="text-xs text-gray-500">
              {spreadsheetType === 'google' 
                ? "Cole o link de compartilhamento do Google Sheets"
                : "Cole o link de compartilhamento do Excel Online"
              }
            </p>
          </div>

          <Button 
            onClick={handleConnect}
            disabled={isConnecting || !spreadsheetUrl || !spreadsheetName}
            className="w-full"
          >
            {isConnecting ? "Conectando..." : "Conectar Planilha"}
          </Button>
        </CardContent>
      </Card>

      {/* Ações rápidas */}
      {connections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button onClick={handleImportData} variant="outline" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Importar Dados
              </Button>
              <Button onClick={handleExportData} variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Exportar Dados
              </Button>
              <Button 
                onClick={() => connections.forEach(conn => handleSync(conn.id))} 
                variant="outline" 
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Sincronizar Tudo
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Planilhas conectadas */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium border-b pb-2">Planilhas Conectadas</h3>
        
        {connections.length === 0 ? (
          <p className="text-sm text-gray-500 italic">Nenhuma planilha conectada</p>
        ) : (
          <div className="space-y-3">
            {connections.map(connection => (
              <Card key={connection.id}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{getTypeIcon(connection.type)}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{connection.name}</span>
                          <Badge className={getTypeBadge(connection.type)}>
                            {connection.type === 'google' ? 'Google Sheets' : 'Excel Online'}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500">
                          Última sincronização: {connection.lastSync}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => window.open(connection.url, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleSync(connection.id)}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDisconnect(connection.id)}
                      >
                        Remover
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Configurações automáticas */}
      {connections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Sincronização Automática</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="autoSyncSheets">Sincronização Automática</Label>
                <p className="text-xs text-gray-500">
                  Atualizar planilhas automaticamente após cada cálculo
                </p>
              </div>
              <Switch
                id="autoSyncSheets"
                checked={autoSync}
                onCheckedChange={setAutoSync}
              />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="border-t pt-4">
        <h4 className="text-sm font-medium mb-2">Recursos de Sincronização:</h4>
        <ul className="text-xs text-gray-600 space-y-1 list-disc pl-4">
          <li>Importação automática de produtos e custos</li>
          <li>Exportação de preços calculados</li>
          <li>Sincronização bidirecional de dados</li>
          <li>Formatação automática das planilhas</li>
          <li>Histórico de sincronizações</li>
          <li>Suporte a fórmulas personalizadas</li>
        </ul>
      </div>
    </div>
  );
}
