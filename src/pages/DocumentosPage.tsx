import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, FileText } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const DocumentosPage = () => {
  return (
    <MainLayout>
      <div className="container mx-auto py-8 space-y-6">
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
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Módulo em desenvolvimento. Em breve você poderá fazer upload e gerenciar seus documentos de licitação.
          </AlertDescription>
        </Alert>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Certidões Negativas</CardTitle>
              <CardDescription>
                CNDs fiscais e trabalhistas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Configure os alertas de vencimento das suas certidões negativas.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Documentos da Empresa</CardTitle>
              <CardDescription>
                Contrato social, certidões, etc.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Mantenha seus documentos empresariais organizados e atualizados.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Habilitação Técnica</CardTitle>
              <CardDescription>
                Atestados e qualificações
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Gerencie seus atestados de capacidade técnica e experiência.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default DocumentosPage;

