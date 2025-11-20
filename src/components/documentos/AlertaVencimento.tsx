import { AlertCircle, Clock, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDocumentos } from '@/hooks/useDocumentos';
import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function AlertaVencimento() {
  const { documentosProximosVencimento, documentosVencidos } = useDocumentos();
  const [dismissed, setDismissed] = useState(false);

  const totalAlertas =
    (documentosProximosVencimento?.length || 0) +
    (documentosVencidos?.length || 0);

  if (totalAlertas === 0 || dismissed) {
    return null;
  }

  return (
    <Alert
      variant={documentosVencidos && documentosVencidos.length > 0 ? 'destructive' : 'default'}
      className="relative"
    >
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-2 right-2 h-6 w-6 p-0"
        onClick={() => setDismissed(true)}
      >
        <X className="h-4 w-4" />
      </Button>

      {documentosVencidos && documentosVencidos.length > 0 ? (
        <AlertCircle className="h-4 w-4" />
      ) : (
        <Clock className="h-4 w-4" />
      )}

      <AlertTitle className="flex items-center gap-2">
        {documentosVencidos && documentosVencidos.length > 0
          ? 'Documentos Vencidos!'
          : 'Documentos Próximos do Vencimento'}
        <Badge variant="secondary">{totalAlertas}</Badge>
      </AlertTitle>

      <AlertDescription>
        <div className="mt-3 space-y-2">
          {documentosVencidos && documentosVencidos.length > 0 && (
            <div className="space-y-2">
              <p className="font-medium text-sm">Vencidos:</p>
              {documentosVencidos.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between bg-white/10 p-2 rounded text-sm"
                >
                  <span className="font-medium">{doc.nome}</span>
                  <span className="text-xs">
                    {format(new Date(doc.data_validade), 'dd/MM/yyyy', {
                      locale: ptBR,
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}

          {documentosProximosVencimento &&
            documentosProximosVencimento.length > 0 && (
              <div className="space-y-2">
                {documentosVencidos && documentosVencidos.length > 0 && (
                  <p className="font-medium text-sm mt-3">
                    Próximos do vencimento:
                  </p>
                )}
                {documentosProximosVencimento
                  .filter((d) => d.status !== 'vencido')
                  .map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between bg-white/10 p-2 rounded text-sm"
                    >
                      <span className="font-medium">{doc.nome}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs">
                          {doc.dias_para_vencer} dia
                          {doc.dias_para_vencer !== 1 ? 's' : ''}
                        </span>
                        <span className="text-xs">
                          {format(new Date(doc.data_validade), 'dd/MM/yyyy', {
                            locale: ptBR,
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            )}

          <p className="text-xs mt-3 opacity-80">
            Mantenha seus documentos atualizados para participar de licitações.
          </p>
        </div>
      </AlertDescription>
    </Alert>
  );
}

