
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EcommerceConnection, EcommerceProduct } from "@/types/ecommerce";
import { Filter, Package, Search, Zap } from "lucide-react";

interface ProductsSyncProps {
  products: EcommerceProduct[];
  connections: EcommerceConnection[];
  isLoading: boolean;
  onSyncPrices: (productIds: string[]) => void;
  onRefreshProducts: (connectionId: string) => void;
}

export default function ProductsSync({
  products,
  connections,
  isLoading,
  onSyncPrices,
  onRefreshProducts
}: ProductsSyncProps) {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlatform, setFilterPlatform] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesPlatform = filterPlatform === 'all' || product.platform === filterPlatform;
      const matchesStatus = filterStatus === 'all' || product.status === filterStatus;
      
      return matchesSearch && matchesPlatform && matchesStatus;
    });
  }, [products, searchTerm, filterPlatform, filterStatus]);

  const handleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(p => p.id));
    }
  };

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSyncSelected = () => {
    if (selectedProducts.length > 0) {
      onSyncPrices(selectedProducts);
      setSelectedProducts([]);
    }
  };

  const getPlatformName = (platformId: string) => {
    const connection = connections.find(c => c.id === platformId);
    return connection ? connection.name : platformId;
  };

  const getPlatformBadgeColor = (platformId: string) => {
    const connection = connections.find(c => c.id === platformId);
    if (!connection) {return "bg-gray-100 text-gray-800";}
    
    const colors = {
      shopify: "bg-green-100 text-green-800",
      woocommerce: "bg-purple-100 text-purple-800",
      mercadolivre: "bg-yellow-100 text-yellow-800"
    };
    
    return colors[connection.platform] || "bg-gray-100 text-gray-800";
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum produto encontrado</h3>
        <p className="text-gray-600 mb-6">Conecte uma plataforma e importe produtos para começar</p>
        {connections.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-gray-500">Recarregar produtos das plataformas conectadas:</p>
            <div className="flex justify-center gap-2">
              {connections.map(connection => (
                <Button
                  key={connection.id}
                  size="sm"
                  variant="outline"
                  onClick={() => onRefreshProducts(connection.id)}
                  disabled={isLoading}
                >
                  {connection.name}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros e busca */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar produtos por nome ou SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Select value={filterPlatform} onValueChange={setFilterPlatform}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Filtrar por plataforma" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as plataformas</SelectItem>
            {connections.map(connection => (
              <SelectItem key={connection.id} value={connection.id}>
                {connection.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full md:w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Ativos</SelectItem>
            <SelectItem value="inactive">Inativos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Ações em lote */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="select-all"
              checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
              onCheckedChange={handleSelectAll}
            />
            <label htmlFor="select-all" className="text-sm font-medium">
              Selecionar todos ({filteredProducts.length})
            </label>
          </div>
          
          {selectedProducts.length > 0 && (
            <Badge variant="secondary">
              {selectedProducts.length} selecionados
            </Badge>
          )}
        </div>

        <Button
          onClick={handleSyncSelected}
          disabled={selectedProducts.length === 0 || isLoading}
          className="flex items-center gap-2"
        >
          <Zap className="h-4 w-4" />
          Sincronizar Selecionados
        </Button>
      </div>

      {/* Tabela de produtos */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Produto</TableHead>
              <TableHead>Plataforma</TableHead>
              <TableHead>Preço Atual</TableHead>
              <TableHead>Custo</TableHead>
              <TableHead>Margem</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Estoque</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedProducts.includes(product.id)}
                    onCheckedChange={() => handleSelectProduct(product.id)}
                  />
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{product.name}</p>
                    {product.sku && (
                      <p className="text-sm text-gray-600">SKU: {product.sku}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getPlatformBadgeColor(product.platform)}>
                    {getPlatformName(product.platform)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="font-medium">R$ {product.price.toFixed(2)}</span>
                </TableCell>
                <TableCell>
                  {product.cost ? (
                    <span>R$ {product.cost.toFixed(2)}</span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {product.margin ? (
                    <span className={`font-medium ${product.margin > 20 ? 'text-green-600' : product.margin > 10 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {product.margin.toFixed(1)}%
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                    {product.status === 'active' ? 'Ativo' : 'Inativo'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {product.inventory !== undefined ? (
                    <span className={product.inventory > 10 ? 'text-green-600' : product.inventory > 0 ? 'text-yellow-600' : 'text-red-600'}>
                      {product.inventory}
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-8">
          <Filter className="h-8 w-8 mx-auto mb-2 text-gray-300" />
          <p className="text-gray-600">Nenhum produto encontrado com os filtros aplicados</p>
        </div>
      )}
    </div>
  );
}
