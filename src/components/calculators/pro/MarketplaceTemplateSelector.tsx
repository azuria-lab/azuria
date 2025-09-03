import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Crown, Plus, Settings, Store } from 'lucide-react';
import { MARKETPLACE_TEMPLATES, type MarketplaceTemplate } from '@/types/marketplaceTemplates';

interface MarketplaceTemplateSelectorProps {
  selectedTemplate: string;
  onTemplateChange: (templateId: string) => void;
  onTemplateCustomize: (template: MarketplaceTemplate) => void;
  isPro: boolean;
  customTemplates?: MarketplaceTemplate[];
}

export default function MarketplaceTemplateSelector({
  selectedTemplate,
  onTemplateChange,
  onTemplateCustomize,
  isPro,
  customTemplates = []
}: MarketplaceTemplateSelectorProps) {
  const [showCustomDialog, setShowCustomDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MarketplaceTemplate | null>(null);

  const allTemplates = [...MARKETPLACE_TEMPLATES, ...customTemplates];
  const currentTemplate = allTemplates.find(t => t.id === selectedTemplate);

  const handleCustomizeTemplate = (template: MarketplaceTemplate) => {
    setEditingTemplate({ ...template });
    setShowCustomDialog(true);
  };

  const handleSaveTemplate = () => {
    if (editingTemplate) {
      onTemplateCustomize(editingTemplate);
      setShowCustomDialog(false);
      setEditingTemplate(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Template Selector */}
      <div className="space-y-2">
        <Label htmlFor="template-select" className="text-sm font-medium">
          Template de Marketplace
        </Label>
        <Select value={selectedTemplate} onValueChange={onTemplateChange}>
          <SelectTrigger id="template-select">
            <SelectValue placeholder="Selecione um template" />
          </SelectTrigger>
          <SelectContent>
            {MARKETPLACE_TEMPLATES.map((template) => (
              <SelectItem key={template.id} value={template.id}>
                <div className="flex items-center gap-2">
                  <Store className="h-4 w-4" />
                  {template.name}
                  {template.isPremium && <Crown className="h-3 w-3 text-amber-500" />}
                </div>
              </SelectItem>
            ))}
            {customTemplates.map((template) => (
              <SelectItem key={template.id} value={template.id}>
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  {template.name}
                  <Badge variant="outline" className="text-xs">Custom</Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Current Template Info */}
      {currentTemplate && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                <CardTitle className="text-lg">{currentTemplate.name}</CardTitle>
                {currentTemplate.isPremium && <Crown className="h-4 w-4 text-amber-500" />}
                {currentTemplate.isCustom && <Badge variant="outline">Custom</Badge>}
              </div>
              {isPro && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCustomizeTemplate(currentTemplate)}
                >
                  <Settings className="h-4 w-4 mr-1" />
                  Customizar
                </Button>
              )}
            </div>
            <CardDescription>{currentTemplate.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="text-center p-2 bg-muted rounded-lg">
                <div className="text-sm font-medium">Comissão</div>
                <div className="text-lg font-bold text-primary">
                  {currentTemplate.defaultValues.commission}%
                </div>
              </div>
              <div className="text-center p-2 bg-muted rounded-lg">
                <div className="text-sm font-medium">Pagamento</div>
                <div className="text-lg font-bold text-primary">
                  {currentTemplate.defaultValues.paymentFee}%
                </div>
              </div>
              {currentTemplate.defaultValues.advertisingFee && (
                <div className="text-center p-2 bg-muted rounded-lg">
                  <div className="text-sm font-medium">Publicidade</div>
                  <div className="text-lg font-bold text-primary">
                    {currentTemplate.defaultValues.advertisingFee}%
                  </div>
                </div>
              )}
              {currentTemplate.defaultValues.fulfillmentFee && (
                <div className="text-center p-2 bg-muted rounded-lg">
                  <div className="text-sm font-medium">Fulfillment</div>
                  <div className="text-lg font-bold text-primary">
                    {currentTemplate.defaultValues.fulfillmentFee}%
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Custom Template Dialog */}
      <Dialog open={showCustomDialog} onOpenChange={setShowCustomDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Customizar Template</DialogTitle>
            <DialogDescription>
              Ajuste as taxas e configurações do template conforme sua necessidade
            </DialogDescription>
          </DialogHeader>
          
          {editingTemplate && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome do Template</Label>
                  <Input
                    value={editingTemplate.name}
                    onChange={(e) => setEditingTemplate({
                      ...editingTemplate,
                      name: e.target.value
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Input
                    value={editingTemplate.description}
                    onChange={(e) => setEditingTemplate({
                      ...editingTemplate,
                      description: e.target.value
                    })}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Taxas Padrão</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Comissão (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={editingTemplate.defaultValues.commission}
                      onChange={(e) => setEditingTemplate({
                        ...editingTemplate,
                        defaultValues: {
                          ...editingTemplate.defaultValues,
                          commission: parseFloat(e.target.value) || 0
                        }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Taxa de Pagamento (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={editingTemplate.defaultValues.paymentFee}
                      onChange={(e) => setEditingTemplate({
                        ...editingTemplate,
                        defaultValues: {
                          ...editingTemplate.defaultValues,
                          paymentFee: parseFloat(e.target.value) || 0
                        }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Publicidade (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={editingTemplate.defaultValues.advertisingFee || 0}
                      onChange={(e) => setEditingTemplate({
                        ...editingTemplate,
                        defaultValues: {
                          ...editingTemplate.defaultValues,
                          advertisingFee: parseFloat(e.target.value) || 0
                        }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Frete (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={editingTemplate.defaultValues.shippingFee || 0}
                      onChange={(e) => setEditingTemplate({
                        ...editingTemplate,
                        defaultValues: {
                          ...editingTemplate.defaultValues,
                          shippingFee: parseFloat(e.target.value) || 0
                        }
                      })}
                    />
                  </div>
                </div>
              </div>

              {editingTemplate.customFields && editingTemplate.customFields.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-medium">Configurações Específicas</h4>
                  {editingTemplate.customFields.map((field, index) => (
                    <div key={field.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <Label className="font-medium">{field.label}</Label>
                        {field.tooltip && (
                          <p className="text-sm text-muted-foreground">{field.tooltip}</p>
                        )}
                      </div>
                      {field.type === 'boolean' ? (
                        <Switch
                          checked={field.defaultValue as boolean}
                          onCheckedChange={(checked) => {
                            const newFields = [...editingTemplate.customFields!];
                            newFields[index] = { ...field, defaultValue: checked };
                            setEditingTemplate({
                              ...editingTemplate,
                              customFields: newFields
                            });
                          }}
                        />
                      ) : (
                        <Input
                          type="number"
                          step="0.1"
                          className="w-20"
                          value={field.defaultValue as number}
                          onChange={(e) => {
                            const newFields = [...editingTemplate.customFields!];
                            newFields[index] = { ...field, defaultValue: parseFloat(e.target.value) || 0 };
                            setEditingTemplate({
                              ...editingTemplate,
                              customFields: newFields
                            });
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowCustomDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveTemplate}>
                  Salvar Template
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}