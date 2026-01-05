/**
 * TemplateSelectorSection
 * 
 * Seção para seleção de templates pré-configurados de marketplaces
 * Design limpo estilo Apple
 */

import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, ShoppingCart, Store } from "lucide-react";
import { MARKETPLACE_TEMPLATES_CONFIG, type MarketplaceTemplateConfig } from "@/data/marketplaceTemplatesConfig";

interface TemplateSelectorSectionProps {
  selectedTemplate: MarketplaceTemplateConfig | null;
  onTemplateSelect: (template: MarketplaceTemplateConfig) => void;
}

const getIcon = (templateId: string) => {
  if (templateId === 'shopee') {return Package;}
  if (templateId === 'amazon' || templateId === 'magalu') {return Store;}
  return ShoppingCart;
};

export default function TemplateSelectorSection({
  selectedTemplate,
  onTemplateSelect,
}: TemplateSelectorSectionProps) {
  const templates = Object.values(MARKETPLACE_TEMPLATES_CONFIG);

  const handleTemplateChange = (templateId: string) => {
    const template = MARKETPLACE_TEMPLATES_CONFIG[templateId];
    if (template) {
      onTemplateSelect(template);
    }
  };

  return (
    <Card className="border-l-4" style={{ borderLeftColor: '#148D8D' }}>
      <div className="p-4 sm:p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md border" style={{ backgroundColor: '#148D8D15', borderColor: '#148D8D30' }}>
              <ShoppingCart className="h-4 w-4" style={{ color: '#148D8D' }} />
            </div>
            <div>
              <Label className="text-sm font-medium text-foreground">
                Template / Marketplace
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Selecione um template pré-configurado ou marketplace
              </p>
            </div>
          </div>

          {/* Template Selector */}
          <Select
            value={selectedTemplate?.id || ""}
            onValueChange={handleTemplateChange}
          >
            <SelectTrigger className="h-12 min-h-[44px] text-base border-border focus:ring-2 border-l-4 focus:ring-[#148D8D]/20" style={{ borderLeftColor: '#148D8D' }}>
              <SelectValue placeholder="Selecione um template...">
                {selectedTemplate && (
                  <div className="flex items-center gap-2">
                    {(() => {
                      const Icon = getIcon(selectedTemplate.id);
                      return <Icon className="h-4 w-4" />;
                    })()}
                    <span>{selectedTemplate.name}</span>
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {templates.map((template) => {
                const Icon = getIcon(template.id);
                return (
                  <SelectItem key={template.id} value={template.id}>
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <div className="flex flex-col">
                        <span>{template.name}</span>
                        <span className="text-xs text-muted-foreground">{template.description}</span>
                      </div>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          {/* Template Info */}
          {selectedTemplate && selectedTemplate.notes && (
            <div className="p-3 rounded-lg bg-muted/50 border border-border">
              <p className="text-xs text-muted-foreground">
                {selectedTemplate.notes}
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
