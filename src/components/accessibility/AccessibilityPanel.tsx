
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useAccessibility } from "@/hooks/useAccessibility";
import { Accessibility, Eye, MousePointer, Type } from "lucide-react";

export const AccessibilityPanel: React.FC = () => {
  const { settings, updateSetting } = useAccessibility();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Accessibility className="h-5 w-5" />
          Acessibilidade
        </CardTitle>
        <CardDescription>
          Configure as opções de acessibilidade conforme suas necessidades
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="reduce-motion" className="flex items-center gap-2">
                <MousePointer className="h-4 w-4" />
                Reduzir animações
              </Label>
              <p className="text-sm text-gray-500">
                Minimiza ou desativa animações e transições
              </p>
            </div>
            <Switch
              id="reduce-motion"
              checked={settings.reduceMotion}
              onCheckedChange={(checked) => updateSetting("reduceMotion", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="high-contrast" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Alto contraste
              </Label>
              <p className="text-sm text-gray-500">
                Aumenta o contraste para melhor legibilidade
              </p>
            </div>
            <Switch
              id="high-contrast"
              checked={settings.highContrast}
              onCheckedChange={(checked) => updateSetting("highContrast", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="focus-visible" className="flex items-center gap-2">
                <MousePointer className="h-4 w-4" />
                Indicador de foco
              </Label>
              <p className="text-sm text-gray-500">
                Mostra bordas visuais em elementos focados
              </p>
            </div>
            <Switch
              id="focus-visible"
              checked={settings.focusVisible}
              onCheckedChange={(checked) => updateSetting("focusVisible", checked)}
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              Tamanho da fonte
            </Label>
            <Select
              value={settings.fontSize}
              onValueChange={(value: "small" | "medium" | "large") => 
                updateSetting("fontSize", value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Pequena</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="large">Grande</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => {
              updateSetting("reduceMotion", false);
              updateSetting("highContrast", false);
              updateSetting("fontSize", "medium");
              updateSetting("focusVisible", true);
            }}
            className="w-full"
          >
            Restaurar padrões
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
