import { AlertCircle, Calendar, CheckCircle2, Clock, Download, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Documento, useDocumentos } from '@/hooks/useDocumentos';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DocumentCardProps {
  documento: Documento;
}

const TIPOS_LABELS: Record<string, string> = {
  cnd_federal: 'CND Federal',
  cnd_estadual: 'CND Estadual',
  cnd_municipal: 'CND Municipal',
  cndt: 'CNDT',
  fgts: 'CRF - FGTS',
  cnpj: 'Cartão CNPJ',
  contrato_social: 'Contrato Social',
  balanco_patrimonial: 'Balanço Patrimonial',
  alvara: 'Alvará',
  licenca_ambiental: 'Licença Ambiental',
  atestado_capacidade: 'Atestado Técnico',
  outro: 'Outro',
};

export function DocumentCard({ documento }: DocumentCardProps) {
  const { deleteDocumento, downloadFile } = useDocumentos();

  const getStatusConfig = (status: Documento['status']) => {
    switch (status) {
      case 'valido':
        return {
          label: 'Válido',
          icon: CheckCircle2,
          variant: 'default' as const,
          color: 'text-green-600',
          bgColor: 'bg-green-50 border-green-200',
        };
      case 'proximo_vencimento':
        return {
          label: 'Próx. Vencimento',
          icon: Clock,
          variant: 'secondary' as const,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50 border-yellow-200',
        };
      case 'vencido':
        return {
          label: 'Vencido',
          icon: AlertCircle,
          variant: 'destructive' as const,
          color: 'text-red-600',
          bgColor: 'bg-red-50 border-red-200',
        };
    }
  };

  const statusConfig = getStatusConfig(documento.status);
  const StatusIcon = statusConfig.icon;

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  const getDiasText = (dias: number) => {
    if (dias < 0) {
      return `Vencido há ${Math.abs(dias)} dia${Math.abs(dias) !== 1 ? 's' : ''}`;
    } else if (dias === 0) {
      return 'Vence hoje';
    } else if (dias === 1) {
      return 'Vence amanhã';
    } else {
      return `Vence em ${dias} dia${dias !== 1 ? 's' : ''}`;
    }
  };

  const handleDownload = () => {
    if (documento.arquivo_url) {
      const fileName = documento.nome + (documento.arquivo_url.split('.').pop() ? `.${documento.arquivo_url.split('.').pop()}` : '');
      downloadFile(documento.arquivo_url, fileName);
    }
  };

  const handleDelete = async () => {
    await deleteDocumento.mutateAsync(documento.id);
  };

  return (
    <Card className={`transition-all hover:shadow-md ${statusConfig.bgColor}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-lg">{documento.nome}</CardTitle>
              <Badge variant={statusConfig.variant} className="gap-1">
                <StatusIcon className="h-3 w-3" />
                {statusConfig.label}
              </Badge>
            </div>
            <CardDescription className="flex flex-col gap-1">
              <span className="font-medium">{TIPOS_LABELS[documento.tipo] || documento.tipo}</span>
              {documento.numero && <span className="text-xs">Nº {documento.numero}</span>}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Informações de Data */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Validade: {formatDate(documento.data_validade)}</span>
          </div>
        </div>

        {/* Dias para Vencer */}
        <div className={`text-sm font-medium ${statusConfig.color}`}>
          {getDiasText(documento.dias_para_vencer)}
        </div>

        {/* Observações */}
        {documento.observacoes && (
          <div className="text-sm text-muted-foreground bg-white/50 p-3 rounded-lg border">
            <p className="font-medium mb-1">Observações:</p>
            <p>{documento.observacoes}</p>
          </div>
        )}

        {/* Ações */}
        <div className="flex gap-2 pt-2">
          {documento.arquivo_url && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-2"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4" />
              Baixar
            </Button>
          )}

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" className="gap-2">
                <Trash2 className="h-4 w-4" />
                Excluir
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita. O documento "{documento.nome}" será
                  permanentemente excluído.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}

