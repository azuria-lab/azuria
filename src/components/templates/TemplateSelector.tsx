
import React, { useCallback, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalculationTemplate, TEMPLATE_CATEGORIES } from '@/types/templates';
import { Download, FileText, Loader2, Star } from 'lucide-react';
import { logger } from '@/services/logger';
import { getNumberField } from '@/utils/templateFields';
import { useTemplatesShared } from '@/hooks/useTemplatesShared';
import { Link } from 'react-router-dom';

interface TemplateSelectorProps {
  onSelectTemplate: (template: CalculationTemplate) => void;
  className?: string;
}

export default function TemplateSelector({ onSelectTemplate, className }: TemplateSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const { templates, loading: isLoading, incrementDownloads } = useTemplatesShared();

  // Memoizar templates filtrados para performance
  const filteredTemplates = useMemo(() => {
    return templates?.filter(template => 
      selectedCategory === "all" || template.category === selectedCategory
    ).slice(0, 6) || [];
  }, [templates, selectedCategory]);

  // Callback estável para seleção de template
  const handleSelectTemplate = useCallback((template: CalculationTemplate) => {
    if (!template?.id) {
      logger.error("Template inválido", { template });
      return;
    }
    
    // Incrementar contador de downloads
    incrementDownloads(template.id);
    
    onSelectTemplate(template);
    setIsOpen(false);
  }, [onSelectTemplate, incrementDownloads]);

  // Callback para mudança de categoria
  const handleCategoryChange = useCallback((value: string) => {
    setSelectedCategory(value || "all");
  }, []);

  // Callback para fechar dialog
  const handleDialogChange = useCallback((open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setSelectedCategory("all");
    }
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className={className}>
          <FileText className="h-4 w-4 mr-2" />
          Usar Template
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Escolha um Template</DialogTitle>
          <DialogDescription>
            Selecione um template otimizado para seu setor e acelere seus cálculos
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Filtro por categoria */}
          <div className="flex gap-4 items-center">
            <label className="text-sm font-medium">Categoria:</label>
            <Select 
              value={selectedCategory} 
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Todas as categorias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {TEMPLATE_CATEGORIES.map(category => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Grid de templates */}
          {!isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTemplates.map(template => (
              <Card 
                key={template.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleSelectTemplate(template)}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      <CardDescription className="text-sm mt-1">
                        {template.description}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {TEMPLATE_CATEGORIES.find(c => c.value === template.category)?.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span>{template.rating?.toFixed(1) || '0.0'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Download className="h-3 w-3" />
                        <span>{template.downloads_count || 0}</span>
                      </div>
                      {template.is_premium && (
                        <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-xs">
                          Premium
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-gray-700 space-y-1">
                      <div className="flex justify-between">
                        <span>Margem:</span>
                        <span className="font-medium">{getNumberField(template.default_values as Record<string, unknown>, 'margin', 0)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Taxa:</span>
                        <span className="font-medium">{getNumberField(template.default_values as Record<string, unknown>, 'tax', 0)}%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              ))}
            </div>
          )}

          {filteredTemplates.length === 0 && !isLoading && (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum template encontrado para esta categoria.</p>
            </div>
          )}

          <div className="pt-4 border-t">
            <p className="text-sm text-gray-600 text-center">
              Quer ver mais opções?{' '}
              <Link to="/templates">
                <Button variant="link" className="p-0 h-auto text-sm" onClick={() => setIsOpen(false)}>
                  Visite o Marketplace
                </Button>
              </Link>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
