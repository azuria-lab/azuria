
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface PreviewTabProps {
  settings: {
    brandName: string;
    logoUrl: string;
    primaryColor: string;
    footerText: string;
  };
}

export default function PreviewTab({ settings }: PreviewTabProps) {
  const handlePreview = () => {
    toast.info("Abrindo preview da sua marca personalizada...");
  };

  const handleSave = () => {
    toast.success("Configurações white-label salvas com sucesso!");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Preview da Personalização
        </CardTitle>
        <CardDescription>
          Veja como ficará sua calculadora personalizada
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg p-6 bg-muted">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-primary">{settings?.brandName || 'Sua Marca'}</h2>
            {settings?.logoUrl && (
              <img src={settings.logoUrl} alt="Logo Azuria+" className="h-8" loading="lazy" decoding="async" />
            )}
          </div>
          
          <div className="bg-card rounded border p-4 mb-4">
            <h3 className="font-medium mb-2">Calculadora de Preços</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Custo: R$ 100,00</div>
              <div>Margem: 30%</div>
            </div>
            <Button 
              className="mt-2 w-full"
            >
              Calcular Preço
            </Button>
          </div>
          
          <footer className="text-xs text-muted-foreground text-center">
            {settings?.footerText || 'Desenvolvido com Azuria'}
          </footer>
        </div>
        
        <div className="flex gap-2 mt-4">
          <Button onClick={handlePreview} variant="outline" aria-label="Abrir preview completo">
            <Eye className="h-4 w-4 mr-2" />
            Preview Completo
          </Button>
          <Button onClick={handleSave}>
            Salvar Configurações
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
