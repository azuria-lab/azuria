
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Palette } from "lucide-react";

interface DesignTabProps {
  settings: {
    primaryColor: string;
    secondaryColor: string;
    customFavicon: string;
    customCss: string;
  };
  onSettingsChange: (updates: Partial<DesignTabProps['settings']>) => void;
}

export default function DesignTab({ settings, onSettingsChange }: DesignTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Personalização Visual
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="primaryColor">Cor Primária</Label>
            <div className="flex gap-2">
              <Input
                id="primaryColor"
                type="color"
                value={settings.primaryColor}
                onChange={(e) => onSettingsChange({ primaryColor: e.target.value })}
                className="w-16 h-10"
              />
              <Input
                value={settings.primaryColor}
                onChange={(e) => onSettingsChange({ primaryColor: e.target.value })}
                placeholder="#0066CC"
                className="flex-1"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="secondaryColor">Cor Secundária</Label>
            <div className="flex gap-2">
              <Input
                id="secondaryColor"
                type="color"
                value={settings.secondaryColor}
                onChange={(e) => onSettingsChange({ secondaryColor: e.target.value })}
                className="w-16 h-10"
              />
              <Input
                value={settings.secondaryColor}
                onChange={(e) => onSettingsChange({ secondaryColor: e.target.value })}
                placeholder="#003D7A"
                className="flex-1"
              />
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="customFavicon">URL do Favicon</Label>
          <Input
            id="customFavicon"
            value={settings.customFavicon}
            onChange={(e) => onSettingsChange({ customFavicon: e.target.value })}
            placeholder="https://meusite.com/favicon.ico"
          />
        </div>

        <div>
          <Label htmlFor="customCss">CSS Personalizado</Label>
          <Textarea
            id="customCss"
            value={settings.customCss}
            onChange={(e) => onSettingsChange({ customCss: e.target.value })}
            placeholder="/* Personalize com as cores da Azuria como base */"
            rows={6}
          />
        </div>
      </CardContent>
    </Card>
  );
}
