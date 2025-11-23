/**
 * Product Management Panel
 * 
 * Painel completo de gestão de produtos com CRUD e sincronização
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Check,
  ChevronDown,
  Copy,
  Download,
  Edit,
  Filter,
  Grid,
  List,
  Loader2,
  Package,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Trash2,
  Upload,
  X
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { productManagementService } from '@/services/product-management.service';
import { useToast } from '@/hooks/use-toast';
import type { Product, ProductFilter } from '@/types/product-management';

interface ProductManagementPanelProps {
  onProductSelect?: (product: Product) => void;
}

export default function ProductManagementPanel({
  onProductSelect
}: Readonly<ProductManagementPanelProps>) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [filters, setFilters] = useState<ProductFilter>({});
  const [showFilters, setShowFilters] = useState(false);
  const [showBulkSync, setShowBulkSync] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [showImport, setShowImport] = useState(false);
  const { toast } = useToast();

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const result = await productManagementService.listProducts(filters);
      setProducts(result.products);
    } catch (_error) {
      toast({
        title: "Erro ao carregar produtos",
        description: "Não foi possível carregar a lista de produtos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [filters, toast]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleSearch = (search: string) => {
    setFilters(prev => ({ ...prev, search }));
  };

  const handleFilterChange = (key: keyof ProductFilter, value: unknown) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(p => p.id));
    }
  };

  const handleBulkSync = async () => {
    if (selectedProducts.length === 0) {
      toast({
        title: "Nenhum produto selecionado",
        description: "Selecione pelo menos um produto para sincronizar",
        variant: "destructive"
      });
      return;
    }

    setShowBulkSync(true);
    setSyncProgress(0);

    try {
      const marketplaces = ['mercado-livre', 'shopee', 'amazon'];
      const operation = await productManagementService.bulkSync(
        selectedProducts,
        marketplaces,
        'update'
      );

      // Simular progresso
      const interval = setInterval(() => {
        setSyncProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 200);

      await new Promise(resolve => setTimeout(resolve, 2000));
      clearInterval(interval);
      setSyncProgress(100);

      toast({
        title: "Sincronização concluída!",
        description: `${operation.progress.completed} produtos sincronizados com sucesso`,
      });

      setShowBulkSync(false);
      setSelectedProducts([]);
      loadProducts();
    } catch (_error) {
      toast({
        title: "Erro na sincronização",
        description: "Ocorreu um erro durante a sincronização",
        variant: "destructive"
      });
    }
  };

  const handleDuplicateProduct = async (product: Product) => {
    try {
      await productManagementService.createProduct({
        ...product,
        id: undefined,
        name: `${product.name} (Cópia)`,
        sku: `${product.sku}-COPY`,
        status: 'draft'
      });

      toast({
        title: "Produto duplicado",
        description: "O produto foi duplicado com sucesso",
      });

      loadProducts();
    } catch (_error) {
      toast({
        title: "Erro ao duplicar",
        description: "Não foi possível duplicar o produto",
        variant: "destructive"
      });
    }
  };

  const statusBadgeVariants = useMemo(() => ({
    active: { variant: 'default' as const, label: 'Ativo', color: 'bg-green-100 text-green-700' },
    draft: { variant: 'secondary' as const, label: 'Rascunho', color: 'bg-gray-100 text-gray-700' },
    inactive: { variant: 'outline' as const, label: 'Inativo', color: 'bg-yellow-100 text-yellow-700' },
    archived: { variant: 'destructive' as const, label: 'Arquivado', color: 'bg-red-100 text-red-700' }
  }), []);

  const getStatusBadge = useCallback((status: Product['status']) => {
    return statusBadgeVariants[status];
  }, [statusBadgeVariants]);

  const getStockBadge = useCallback((product: Product) => {
    if (product.stock === 0) {
      return { label: 'Sem estoque', color: 'bg-red-100 text-red-700 border-red-200' };
    }
    if (product.stock <= product.lowStockThreshold) {
      return { label: 'Estoque baixo', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
    }
    return { label: 'Em estoque', color: 'bg-green-100 text-green-700 border-green-200' };
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-16">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-brand-600 mx-auto mb-4" />
            <p className="text-lg font-semibold">Carregando produtos...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Gestão de Produtos</h2>
          <p className="text-gray-600">{products.length} produtos cadastrados</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowImport(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Importar
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Button onClick={() => onProductSelect?.({} as Product)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Produto
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome, SKU ou descrição..."
                className="pl-10"
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>

            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(showFilters && "bg-brand-50 border-brand-300")}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filtros
              <ChevronDown className={cn("ml-2 h-4 w-4 transition-transform", showFilters && "rotate-180")} />
            </Button>

            <div className="flex items-center border rounded-lg">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('grid')}
                className={cn(viewMode === 'grid' && "bg-brand-50")}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('list')}
                className={cn(viewMode === 'list' && "bg-brand-50")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            <Button variant="outline" onClick={loadProducts}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          {/* Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-4 pt-4 border-t grid grid-cols-4 gap-4"
              >
                <div>
                  <Label>Categoria</Label>
                  <Select onValueChange={(value) => handleFilterChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="Eletrônicos">Eletrônicos</SelectItem>
                      <SelectItem value="Informática">Informática</SelectItem>
                      <SelectItem value="Acessórios">Acessórios</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Status</Label>
                  <Select onValueChange={(value) => handleFilterChange('status', [value])}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="draft">Rascunho</SelectItem>
                      <SelectItem value="inactive">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Estoque</Label>
                  <Select onValueChange={(value) => handleFilterChange('stockLevel', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="in_stock">Em estoque</SelectItem>
                      <SelectItem value="low_stock">Estoque baixo</SelectItem>
                      <SelectItem value="out_of_stock">Sem estoque</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Marketplace</Label>
                  <Select onValueChange={(value) => handleFilterChange('marketplace', [value])}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="mercado-livre">Mercado Livre</SelectItem>
                      <SelectItem value="shopee">Shopee</SelectItem>
                      <SelectItem value="amazon">Amazon</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedProducts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <Card className="bg-brand-50 border-brand-200">
            <CardContent className="flex items-center justify-between py-4">
              <div className="flex items-center gap-4">
                <Checkbox
                  checked={selectedProducts.length === products.length}
                  onCheckedChange={handleSelectAll}
                />
                <span className="font-semibold">
                  {selectedProducts.length} produto(s) selecionado(s)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleBulkSync}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Sincronizar
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="mr-2 h-4 w-4" />
                  Editar em Lote
                </Button>
                <Button variant="outline" size="sm" onClick={() => setSelectedProducts([])}>
                  <X className="mr-2 h-4 w-4" />
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Products Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              index={index}
              selected={selectedProducts.includes(product.id)}
              onSelect={handleSelectProduct}
              onEdit={() => onProductSelect?.(product)}
              onDuplicate={handleDuplicateProduct}
              getStatusBadge={getStatusBadge}
              getStockBadge={getStockBadge}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {products.map((product, index) => (
                <ProductListItem
                  key={product.id}
                  product={product}
                  index={index}
                  selected={selectedProducts.includes(product.id)}
                  onSelect={handleSelectProduct}
                  onEdit={() => onProductSelect?.(product)}
                  getStatusBadge={getStatusBadge}
                  getStockBadge={getStockBadge}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {products.length === 0 && !loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Package className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhum produto encontrado</h3>
            <p className="text-gray-600 mb-6">Comece criando seu primeiro produto</p>
            <Button onClick={() => onProductSelect?.({} as Product)}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Produto
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Bulk Sync Dialog */}
      <Dialog open={showBulkSync} onOpenChange={setShowBulkSync}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sincronização em Lote</DialogTitle>
            <DialogDescription>
              Sincronizando {selectedProducts.length} produtos com marketplaces...
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progresso</span>
                <span className="font-semibold">{syncProgress}%</span>
              </div>
              <Progress value={syncProgress} />
            </div>

            {syncProgress === 100 && (
              <div className="flex items-center gap-2 text-green-600 p-3 bg-green-50 rounded-lg">
                <Check className="h-5 w-5" />
                <span className="font-medium">Sincronização concluída com sucesso!</span>
              </div>
            )}
          </div>

          {syncProgress === 100 && (
            <DialogFooter>
              <Button onClick={() => setShowBulkSync(false)}>
                Fechar
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={showImport} onOpenChange={setShowImport}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Importar Produtos</DialogTitle>
            <DialogDescription>
              Faça upload de um arquivo CSV com seus produtos
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-600 mb-2">
                Arraste um arquivo CSV ou clique para selecionar
              </p>
              <Button variant="outline" size="sm">
                Selecionar Arquivo
              </Button>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              <p className="font-semibold">Formato do arquivo:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>SKU, Nome, Descrição, Categoria, Preço, Estoque</li>
                <li>Separado por vírgulas (CSV)</li>
                <li>Primeira linha deve conter os cabeçalhos</li>
              </ul>
            </div>

            <Button variant="outline" size="sm" className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Baixar Modelo CSV
            </Button>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImport(false)}>
              Cancelar
            </Button>
            <Button>
              Importar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Product Card Component
function ProductCard({
  product,
  index,
  selected,
  onSelect,
  onEdit,
  onDuplicate,
  getStatusBadge,
  getStockBadge
}: Readonly<{
  product: Product;
  index: number;
  selected: boolean;
  onSelect: (id: string) => void;
  onEdit: () => void;
  onDuplicate: (product: Product) => void;
  getStatusBadge: (status: Product['status']) => { variant: 'default' | 'secondary' | 'outline' | 'destructive'; label: string; color: string };
  getStockBadge: (product: Product) => { label: string; color: string };
}>) {
  const statusBadge = getStatusBadge(product.status);
  const stockBadge = getStockBadge(product);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className={cn(
        "relative cursor-pointer hover:shadow-lg transition-all",
        selected && "ring-2 ring-brand-500"
      )}>
        <div className="absolute top-3 left-3 z-10">
          <Checkbox
            checked={selected}
            onCheckedChange={() => onSelect(product.id)}
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        <CardContent className="p-4" onClick={onEdit}>
          <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
            {product.images[0] ? (
              <img
                src={product.images[0].url}
                alt={product.name}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <Package className="h-16 w-16 text-gray-400" />
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-sm line-clamp-2 flex-1">{product.name}</h3>
              <Badge variant={statusBadge.variant} className={cn("text-xs", statusBadge.color)}>
                {statusBadge.label}
              </Badge>
            </div>

            <p className="text-xs text-gray-600">SKU: {product.sku}</p>

            <div className="flex items-center justify-between">
              <span className="text-lg font-bold">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.basePrice)}
              </span>
              <Badge className={cn("text-xs border", stockBadge.color)}>
                {product.stock} un
              </Badge>
            </div>

            <div className="flex items-center gap-1 flex-wrap">
              {product.marketplaceListings.slice(0, 3).map(listing => (
                <Badge key={listing.marketplaceId} variant="outline" className="text-xs">
                  {listing.marketplaceName}
                </Badge>
              ))}
              {product.marketplaceListings.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{product.marketplaceListings.length - 3}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>

        <div className="border-t p-2 flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate(product);
            }}
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}

// Product List Item Component
function ProductListItem({
  product,
  index,
  selected,
  onSelect,
  onEdit,
  getStatusBadge,
  getStockBadge
}: Readonly<{
  product: Product;
  index: number;
  selected: boolean;
  onSelect: (id: string) => void;
  onEdit: () => void;
  getStatusBadge: (status: Product['status']) => { variant: 'default' | 'secondary' | 'outline' | 'destructive'; label: string; color: string };
  getStockBadge: (product: Product) => { label: string; color: string };
}>) {
  const statusBadge = getStatusBadge(product.status);
  const stockBadge = getStockBadge(product);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "flex items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer",
        selected && "bg-brand-50"
      )}
      onClick={onEdit}
    >
      <Checkbox
        checked={selected}
        onCheckedChange={() => onSelect(product.id)}
        onClick={(e) => e.stopPropagation()}
      />

      <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
        {product.images[0] ? (
          <img
            src={product.images[0].url}
            alt={product.name}
            className="w-full h-full object-cover rounded"
          />
        ) : (
          <Package className="h-8 w-8 text-gray-400" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-semibold truncate">{product.name}</h3>
        <p className="text-sm text-gray-600">SKU: {product.sku}</p>
      </div>

      <div className="text-right">
        <p className="font-bold">
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.basePrice)}
        </p>
        <p className="text-sm text-gray-600">{product.category}</p>
      </div>

      <Badge className={cn("border", stockBadge.color)}>
        {product.stock} un
      </Badge>

      <Badge variant={statusBadge.variant} className={statusBadge.color}>
        {statusBadge.label}
      </Badge>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
          <Trash2 className="h-4 w-4 text-red-600" />
        </Button>
      </div>
    </motion.div>
  );
}
