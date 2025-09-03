
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Cloud, 
  Database, 
  Download,
  HardDrive,
  Shield
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

interface BackupStatus {
  lastBackup: Date | null;
  nextBackup: Date | null;
  status: 'success' | 'error' | 'running' | 'scheduled';
  size: string;
  location: string;
}

const DataBackup: React.FC = () => {
  const { toast } = useToast();
  const [backupStatus, setBackupStatus] = useState<BackupStatus>({
    lastBackup: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24h atrás
    nextBackup: new Date(Date.now() + 24 * 60 * 60 * 1000), // em 24h
    status: 'success',
    size: '2.4 MB',
    location: 'Supabase Cloud Storage'
  });
  const [autoBackup, setAutoBackup] = useState(true);
  const [backupProgress, setBackupProgress] = useState(0);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupHistory, setBackupHistory] = useState([
    { id: '1', date: new Date(Date.now() - 24 * 60 * 60 * 1000), size: '2.4 MB', status: 'success' },
    { id: '2', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), size: '2.3 MB', status: 'success' },
    { id: '3', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), size: '2.2 MB', status: 'success' },
    { id: '4', date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), size: '2.1 MB', status: 'error' },
    { id: '5', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), size: '2.0 MB', status: 'success' },
  ]);

  const startManualBackup = async () => {
    setIsBackingUp(true);
    setBackupProgress(0);

    // Simular progresso do backup
    const progressInterval = setInterval(() => {
      setBackupProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setIsBackingUp(false);
          
          // Atualizar status do backup
          const newBackup = {
            lastBackup: new Date(),
            nextBackup: new Date(Date.now() + 24 * 60 * 60 * 1000),
            status: 'success' as const,
            size: `${(Math.random() * 2 + 2).toFixed(1)} MB`,
            location: 'Supabase Cloud Storage'
          };
          setBackupStatus(newBackup);

          // Adicionar ao histórico
          const newHistoryItem = {
            id: Date.now().toString(),
            date: new Date(),
            size: newBackup.size,
            status: 'success' as const
          };
          setBackupHistory(prev => [newHistoryItem, ...prev.slice(0, 9)]);

          toast({
            title: "Backup concluído",
            description: "Seus dados foram salvos com sucesso.",
          });

          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);
  };

  const downloadBackup = () => {
    // Simular download de backup
    const dummyData = JSON.stringify({
      calculations: [],
      settings: {},
      profile: {},
      timestamp: new Date().toISOString(),
      version: '1.0'
    }, null, 2);

    const blob = new Blob([dummyData], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `precifica-backup-${format(new Date(), 'yyyy-MM-dd-HHmm')}.json`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Download iniciado",
      description: "O arquivo de backup está sendo baixado.",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'running':
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      success: "bg-green-100 text-green-800",
      error: "bg-red-100 text-red-800",
      running: "bg-blue-100 text-blue-800",
      scheduled: "bg-gray-100 text-gray-800"
    };

    const labels = {
      success: "Sucesso",
      error: "Erro",
      running: "Em andamento",
      scheduled: "Agendado"
    };

    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Status atual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Backup de Dados
          </CardTitle>
          <CardDescription>
            Mantenha seus dados seguros com backups automáticos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Configurações */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Backup automático diário</Label>
                <p className="text-sm text-gray-600">
                  Fazer backup automático a cada 24 horas
                </p>
              </div>
              <Switch
                checked={autoBackup}
                onCheckedChange={setAutoBackup}
              />
            </div>

            {/* Status do último backup */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Último backup</Label>
                <div className="flex items-center gap-2">
                  {getStatusIcon(backupStatus.status)}
                  <span className="text-sm">
                    {backupStatus.lastBackup 
                      ? format(backupStatus.lastBackup, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
                      : 'Nunca'
                    }
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">Próximo backup</Label>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-600" />
                  <span className="text-sm">
                    {backupStatus.nextBackup 
                      ? format(backupStatus.nextBackup, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
                      : 'Não agendado'
                    }
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Tamanho</Label>
                <div className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-gray-600" />
                  <span className="text-sm">{backupStatus.size}</span>
                </div>
              </div>
            </div>

            {/* Progresso do backup */}
            {isBackingUp && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Backup em andamento...</Label>
                  <span className="text-sm text-gray-600">{Math.round(backupProgress)}%</span>
                </div>
                <Progress value={backupProgress} />
              </div>
            )}

            {/* Ações */}
            <div className="flex gap-2">
              <Button 
                onClick={startManualBackup}
                disabled={isBackingUp}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Database className="h-4 w-4 mr-2" />
                {isBackingUp ? 'Fazendo backup...' : 'Backup manual'}
              </Button>
              <Button variant="outline" onClick={downloadBackup}>
                <Download className="h-4 w-4 mr-2" />
                Baixar backup
              </Button>
            </div>

            {/* Localização do backup */}
            <Alert>
              <Cloud className="h-4 w-4" />
              <AlertDescription>
                Os backups são armazenados de forma segura em <strong>{backupStatus.location}</strong> 
                com criptografia de ponta a ponta.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      {/* Histórico de backups */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Histórico de Backups
          </CardTitle>
          <CardDescription>
            Últimos backups realizados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {backupHistory.map((backup) => (
              <div key={backup.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(backup.status)}
                  <div>
                    <p className="font-medium">
                      {format(backup.date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </p>
                    <p className="text-sm text-gray-600">
                      {format(backup.date, "HH:mm", { locale: ptBR })} • {backup.size}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(backup.status)}
                  {backup.status === 'success' && (
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataBackup;
