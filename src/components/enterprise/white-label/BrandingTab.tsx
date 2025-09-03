
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { FileText } from "lucide-react";

interface BrandingTabProps {
  settings: {
    brandName: string;
    logoUrl: string;
    metaDescription: string;
    footerText: string;
    hideOriginalBranding: boolean;
  };
  onSettingsChange: (updates: Partial<BrandingTabProps['settings']>) => void;
}

export default function BrandingTab({ settings, onSettingsChange }: BrandingTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Identidade da Marca
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="brandName">Nome da Marca</Label>
            <Input
              id="brandName"
              value={settings.brandName}
              onChange={(e) => onSettingsChange({ brandName: e.target.value })}
              placeholder="Minha Calculadora Pro"
            />
          </div>
          
          <div>
            <Label htmlFor="logoUrl">URL do Logo</Label>
            <Input
              id="logoUrl"
              value={settings.logoUrl}
              onChange={(e) => onSettingsChange({ logoUrl: e.target.value })}
              placeholder="https://meusite.com/logo.png"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="metaDescription">Meta Descrição</Label>
          <Textarea
            id="metaDescription"
            value={settings.metaDescription}
            onChange={(e) => onSettingsChange({ metaDescription: e.target.value })}
            placeholder="Descrição que aparecerá nos resultados de busca"
          />
        </div>

        <div>
          <Label htmlFor="footerText">Texto do Rodapé</Label>
          <Input
            id="footerText"
            value={settings.footerText}
            onChange={(e) => onSettingsChange({ footerText: e.target.value })}
            placeholder="© 2024 Minha Empresa"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="hideBranding"
            checked={settings.hideOriginalBranding}
            onCheckedChange={(checked) => 
              onSettingsChange({ hideOriginalBranding: checked })
            }
          />
          <Label htmlFor="hideBranding">Ocultar marca original "Azuria"</Label>
        </div>
      </CardContent>
    </Card>
  );
}
