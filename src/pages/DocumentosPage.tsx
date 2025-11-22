import MainLayout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle2, FileText, XCircle } from "lucide-react";
import { DocumentUploader } from "@/components/documentos/DocumentUploader";
import { DocumentList } from "@/components/documentos/DocumentList";
import { AlertaVencimento } from "@/components/documentos/AlertaVencimento";
import { useDocumentos } from "@/hooks/useDocumentos";

const DocumentosPage = () => {
  const { documentos, documentosVencidos, documentosProximosVencimento } = useDocumentos();

  const totalDocumentos = documentos?.length || 0;
  const totalVencidos = documentosVencidos?.length || 0;
  const totalProximosVencimento = documentosProximosVencimento?.filter(
    (d) => d.status !== 'vencido'
  ).length || 0;
  const totalValidos = totalDocumentos - totalVencidos - totalProximosVencimento;

  return (
    <MainLayout>
      <div className="container mx-auto py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <FileText className="h-8 w-8 text-primary" />
              Documentos de Licitação
            </h1>
            <p className="text-muted-foreground mt-2">
              Gerencie e acompanhe os documentos necessários para participar de licitações
            </p>
          </div>
          <DocumentUploader />
        </div>

        {/* Alerta de Vencimento */}
        <AlertaVencimento />

        {/* Cards de Estatísticas */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Documentos Válidos
              </CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalValidos}</div>
              <p className="text-xs text-muted-foreground">
                Em dia e prontos para uso
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Próx. Vencimento
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProximosVencimento}</div>
              <p className="text-xs text-muted-foreground">
                Vencem nos próximos 30 dias
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Vencidos
              </CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalVencidos}</div>
              <p className="text-xs text-muted-foreground">
                Necessitam renovação urgente
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Documentos */}
        <DocumentList />
      </div>
    </MainLayout>
  );
};

export default DocumentosPage;
