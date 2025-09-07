
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EcommerceConnection, EcommerceProduct, PriceSync } from "@/types/ecommerce";
import { useMemo, useState } from "react";
import { CheckCircle, Clock, Search, TrendingDown, TrendingUp, XCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SyncHistoryProps {
  syncHistory: PriceSync[];
  products: EcommerceProduct[];
  connections: EcommerceConnection[];
}

export default function SyncHistory({ syncHistory, products, connections }: SyncHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPlatform, setFilterPlatform] = useState<string>('all');

  const filteredHistory = useMemo(() => {
    return syncHistory.filter(sync => {
      const product = products.find(p => p.id === sync.productId);
      
      const matchesSearch = product ? 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()))
        : true;
      
      const matchesStatus = filterStatus === 'all' || sync.status === filterStatus;
      const matchesPlatform = filterPlatform === 'all' || sync.platform === filterPlatform;
      
      return matchesSearch && matchesStatus && matchesPlatform;
    });
  }, [syncHistory, products, searchTerm, filterStatus, filterPlatform]);

  const getProductName = (productId: string) => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : 'Produto não encontrado';
  };

  const getProductSku = (productId: string) => {
    const product = products.find(p => p.id === productId);
    return product?.sku;
  };

  const getPlatformName = (platformId: string) => {
    const connection = connections.find(c => c.id === platformId);
    return connection ? connection.name : platformId;
  };

  const getStatusIcon = (status: PriceSync['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: PriceSync['status']) => {
    const configs = {
      success: { color: "bg-green-100 text-green-800", label: "Sucesso" },
      error: { color: "bg-red-100 text-red-800", label: "Erro" },
      pending: { color: "bg-yellow-100 text-yellow-800", label: "Pendente" }
    };

    const config = configs[status];
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getPriceChangeIcon = (oldPrice: number, newPrice: number) => {
    if (newPrice > oldPrice) {
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    } else if (newPrice < oldPrice) {
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    }
    return null;
  };

  if (syncHistory.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma sincronização realizada</h3>
        <p className="text-gray-600">O histórico de sincronizações aparecerá aqui</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por produto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full md:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="success">Sucesso</SelectItem>
            <SelectItem value="error">Erro</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterPlatform} onValueChange={setFilterPlatform}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Plataforma" />
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
      </div>

      {/* Estatísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600">Sucessos</p>
              <p className="text-2xl font-bold text-green-800">
                {syncHistory.filter(s => s.status === 'success').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-red-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600">Erros</p>
              <p className="text-2xl font-bold text-red-800">
                {syncHistory.filter(s => s.status === 'error').length}
              </p>
            </div>
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600">Pendentes</p>
              <p className="text-2xl font-bold text-yellow-800">
                {syncHistory.filter(s => s.status === 'pending').length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600">Total</p>
              <p className="text-2xl font-bold text-blue-800">{syncHistory.length}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Tabela de histórico */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Produto</TableHead>
              <TableHead>Plataforma</TableHead>
              <TableHead>Preço Anterior</TableHead>
              <TableHead>Novo Preço</TableHead>
              <TableHead>Variação</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Erro</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredHistory.map((sync) => {
              const priceChange = sync.newPrice - sync.oldPrice;
              const priceChangePercent = ((priceChange / sync.oldPrice) * 100).toFixed(1);
              
              return (
                <TableRow key={sync.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(sync.status)}
                      {getStatusBadge(sync.status)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{getProductName(sync.productId)}</p>
                      {getProductSku(sync.productId) && (
                        <p className="text-sm text-gray-600">SKU: {getProductSku(sync.productId)}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {getPlatformName(sync.platform)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono">R$ {sync.oldPrice.toFixed(2)}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono">R$ {sync.newPrice.toFixed(2)}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {getPriceChangeIcon(sync.oldPrice, sync.newPrice)}
                      <span className={`text-sm font-medium ${
                        priceChange > 0 ? 'text-green-600' : 
                        priceChange < 0 ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {priceChange > 0 ? '+' : ''}{priceChangePercent}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {format(sync.syncedAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </span>
                  </TableCell>
                  <TableCell>
                    {sync.errorMessage && (
                      <div className="max-w-48">
                        <p className="text-sm text-red-600 truncate" title={sync.errorMessage}>
                          {sync.errorMessage}
                        </p>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {filteredHistory.length === 0 && (
        <div className="text-center py-8">
          <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
          <p className="text-gray-600">Nenhuma sincronização encontrada com os filtros aplicados</p>
        </div>
      )}
    </div>
  );
}
