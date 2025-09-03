
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalculationTemplate, TEMPLATE_CATEGORIES, TemplateCategory, TemplateFilters } from '@/types/templates';
import { Download, Filter, Heart, Search, ShoppingCart, Star } from 'lucide-react';
import { formatCurrency } from '@/utils/calculator/formatCurrency';
import { getNumberField } from '@/utils/templateFields';
import { logger } from '@/services/logger';

// Dados mock temporários enquanto o Supabase não reconhece as tabelas
const mockTemplates: CalculationTemplate[] = [
  {
    id: '1',
    name: 'E-commerce Básico',
    description: 'Template otimizado para lojas online com marketplace',
    category: 'ecommerce',
    sector_specific_config: { marketplaceFee: 12, returnRate: 5, packagingCost: 2 },
    default_values: { margin: 40, tax: '7', cardFee: '3.5', shipping: '15' },
    custom_formulas: null,
    image_url: null,
    price: 0,
    is_premium: false,
    is_public: true,
    status: 'published',
    created_by: null,
    downloads_count: 150,
    rating: 4.5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Restaurante',
    description: 'Cálculo de preços para pratos e bebidas',
    category: 'restaurante',
    sector_specific_config: { foodCost: true, laborCost: 30, wastageRate: 8 },
    default_values: { margin: 300, tax: '7', cardFee: '2.5', shipping: '0' },
    custom_formulas: null,
    image_url: null,
    price: 29.90,
    is_premium: true,
    is_public: true,
    status: 'published',
    created_by: null,
    downloads_count: 89,
    rating: 4.8,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Serviços Profissionais',
    description: 'Template para consultoria e serviços',
    category: 'servicos',
    sector_specific_config: { hourlyRate: 100, overhead: 25, expertise: 'premium' },
    default_values: { margin: 60, tax: '4.5', cardFee: '2', shipping: '0' },
    custom_formulas: null,
    image_url: null,
    price: 19.90,
    is_premium: true,
    is_public: true,
    status: 'published',
    created_by: null,
    downloads_count: 234,
    rating: 4.2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export default function TemplateMarketplace() {
  const [filters, setFilters] = useState<TemplateFilters>({});
  const [activeTab, setActiveTab] = useState('marketplace');
  const [purchasedTemplates, setPurchasedTemplates] = useState<string[]>([]);
  
  // Usar dados mock por enquanto
  const templates = mockTemplates;
  const _isLoading = false; // reserved for when Supabase integration is enabled

  const handleFilterChange = <K extends keyof TemplateFilters>(key: K, value: TemplateFilters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handlePurchase = (templateId: string, price: number) => {
    setPurchasedTemplates(prev => [...prev, templateId]);
  logger.info('Template adquirido', { templateId, price });
  };

  const isPurchased = (templateId: string) => {
    return purchasedTemplates.includes(templateId);
  };

  const renderTemplateCard = (template: CalculationTemplate) => (
    <Card key={template.id} className="h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{template.name}</CardTitle>
            <CardDescription className="mt-1">{template.description}</CardDescription>
          </div>
          <Badge variant={template.category === 'ecommerce' ? 'default' : 'secondary'}>
            {TEMPLATE_CATEGORIES.find(c => c.value === template.category)?.label}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span>{template.rating?.toFixed(1) || '0.0'}</span>
            <Download className="h-4 w-4 ml-2" />
            <span>{template.downloads_count || 0} downloads</span>
          </div>
          
          {template.is_premium && (
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500">
              Premium
            </Badge>
          )}
          
          <div className="text-sm text-gray-700">
            <p><strong>Margem padrão:</strong> {getNumberField(template.default_values as Record<string, unknown>, 'margin', 0)}%</p>
            <p><strong>Taxa:</strong> {getNumberField(template.default_values as Record<string, unknown>, 'tax', 0)}%</p>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-4">
        <div className="flex w-full items-center justify-between">
          <div className="text-lg font-bold text-brand-600">
            {template.price && template.price > 0 ? formatCurrency(template.price) : 'Gratuito'}
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Heart className="h-4 w-4" />
            </Button>
            
            {isPurchased(template.id) ? (
              <Badge variant="secondary">Adquirido</Badge>
            ) : (
              <Button 
                size="sm" 
                onClick={() => handlePurchase(template.id, template.price || 0)}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {template.price && template.price > 0 ? 'Comprar' : 'Baixar'}
              </Button>
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  );

  // Filtrar templates localmente
  const filteredTemplates = templates.filter(template => {
    if (filters.category && template.category !== filters.category) {return false;}
    if (filters.search && !template.name.toLowerCase().includes(filters.search.toLowerCase()) && 
        !template.description?.toLowerCase().includes(filters.search.toLowerCase())) {return false;}
    if (filters.isPremium !== undefined && template.is_premium !== filters.isPremium) {return false;}
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Marketplace de Templates
        </h1>
        <p className="text-gray-600">
          Descubra templates otimizados para diferentes setores e acelere seus cálculos de precificação
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
          <TabsTrigger value="my-templates">Meus Templates</TabsTrigger>
          <TabsTrigger value="purchased">Adquiridos</TabsTrigger>
        </TabsList>

        <TabsContent value="marketplace" className="space-y-6">
          {/* Filtros */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar templates..."
                    className="pl-10"
                    value={filters.search || ''}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                  />
                </div>
                
                <Select 
                  value={filters.category || ''} 
                  onValueChange={(value) => handleFilterChange('category', (value ? (value as TemplateCategory) : undefined))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas</SelectItem>
                    {TEMPLATE_CATEGORIES.map(category => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select 
                  value={filters.sortBy || ''} 
                  onValueChange={(value) => handleFilterChange('sortBy', (value ? (value as 'name' | 'rating' | 'downloads' | 'price' | 'created_at') : undefined))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="downloads">Mais baixados</SelectItem>
                    <SelectItem value="rating">Melhor avaliados</SelectItem>
                    <SelectItem value="name">Nome A-Z</SelectItem>
                    <SelectItem value="price">Preço</SelectItem>
                    <SelectItem value="created_at">Mais recentes</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="flex gap-2">
                  <Button 
                    variant={filters.isPremium === false ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleFilterChange('isPremium', false)}
                  >
                    Gratuitos
                  </Button>
                  <Button 
                    variant={filters.isPremium === true ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleFilterChange('isPremium', true)}
                  >
                    Premium
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Grid de Templates */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map(renderTemplateCard)}
          </div>

          {filteredTemplates.length === 0 && (
            <Card className="p-8 text-center">
              <p className="text-gray-500">Nenhum template encontrado com os filtros selecionados.</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="my-templates">
          <Card className="p-8 text-center">
            <h3 className="text-lg font-semibold mb-2">Crie seu primeiro template</h3>
            <p className="text-gray-600 mb-4">
              Compartilhe suas configurações de precificação com a comunidade
            </p>
            <Button>Criar Template</Button>
          </Card>
        </TabsContent>

        <TabsContent value="purchased">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates
              .filter(template => isPurchased(template.id))
              .map(renderTemplateCard)}
          </div>
          
          {filteredTemplates.filter(template => isPurchased(template.id)).length === 0 && (
            <Card className="p-8 text-center">
              <p className="text-gray-500">Você ainda não adquiriu nenhum template.</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
