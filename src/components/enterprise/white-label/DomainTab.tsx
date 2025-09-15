
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Globe } from "lucide-react";

interface DomainTabProps {
  settings: {
    customDomain: string;
  };
  onSettingsChange: (updates: Partial<DomainTabProps['settings']>) => void;
}

export default function DomainTab({ settings, onSettingsChange }: DomainTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Domínio Personalizado
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="customDomain">Seu Domínio</Label>
          <Input
            id="customDomain"
            value={settings.customDomain}
            onChange={(e) => onSettingsChange({ customDomain: e.target.value })}
            placeholder="calculadora.meudominio.com"
          />
          <p className="text-sm text-gray-500 mt-1">
            Configure um CNAME apontando para: white-label.precifica.app
          </p>
        </div>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <h4 className="font-medium mb-2">Instruções DNS:</h4>
            <ol className="text-sm space-y-1 text-gray-600">
              <li>1. Acesse o painel DNS do seu provedor</li>
              <li>2. Crie um registro CNAME</li>
              <li>3. Nome: calculadora (ou subdomínio desejado)</li>
              <li>4. Valor: white-label.precifica.app</li>
              <li>5. Aguarde a propagação (até 24h)</li>
            </ol>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}
