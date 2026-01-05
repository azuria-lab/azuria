import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3, DollarSign, Edit, Filter, Image as ImageIcon, MapPin, MoreVertical, Package, Plus, RefreshCw, Search, ShoppingBag, ShoppingCart, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";

interface Product {
  id: string;
  image?: string;
  description: string;
  code: string;
  unit: string;
  location?: string;
  price: number;
  stock: number;
}

// Mock data - será substituído por dados reais depois
const mockProducts: Product[] = [
  {
    id: "1",
    description: "BOTÃO PLACA MEDIO 2 TERMINAIS",
    code: "66442",
    unit: "UN",
    price: 2.0,
    stock: 0.0,
  },
  {
    id: "2",
    description: "CAPACITOR ELETROLÍTICO 470uF 25V",
    code: "47025",
    unit: "UN",
    price: 5.0,
    stock: 0.0,
  },
  {
    id: "3",
    description: "CAPACITOR ELETROLÍTICO 330uF 25V",
    code: "33025",
    unit: "UN",
    price: 10.0,
    stock: 0.0,
  },
  {
    id: "4",
    description: "CAPACITOR ELETROLÍTICO 1000uF 25V",
    code: "100025",
    unit: "UN",
    price: 15.0,
    stock: 0.0,
  },
  {
    id: "5",
    description: "CAPACITOR ELETROLÍTICO 4,7uF 400V",
    code: "47400",
    unit: "UN",
    price: 8.0,
    stock: 0.0,
  },
  {
    id: "6",
    description: "CAPACITOR ELETROLÍTICO 220uF 25V",
    code: "22025",
    unit: "UN",
    price: 6.0,
    stock: 0.0,
  },
  {
    id: "7",
    description: "CAPACITOR ELETROLÍTICO 1500uF 16V",
    code: "150016",
    unit: "UN",
    price: 12.0,
    stock: 0.0,
  },
  {
    id: "8",
    description: "CAPACITOR ELETROLÍTICO 330uF 16V",
    code: "33016",
    unit: "UN",
    price: 7.0,
    stock: 0.0,
  },
  {
    id: "9",
    description: "BOTÃO PLACA GRANDE 4 TERMINAIS",
    code: "66443",
    unit: "UN",
    price: 3.0,
    stock: 0.0,
  },
  {
    id: "10",
    description: "BOTÃO PLACA MEDIO 4 TERMINAIS",
    code: "66444",
    unit: "UN",
    price: 2.5,
    stock: 0.0,
  },
];

export default function MeuNegocioPage() {
  const navigate = useNavigate();
  const [products, _setProducts] = useState<Product[]>(mockProducts);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStore, setSelectedStore] = useState("all");
  const [_situationFilter, _setSituationFilter] = useState("ultimos-incluidos");
  const [filterOpen, setFilterOpen] = useState(false);
  
  // Filter states
  const [filterSituation, setFilterSituation] = useState("ultimos-incluidos");
  const [filterStock, setFilterStock] = useState("");
  const [filterTags, setFilterTags] = useState("todas");
  const [filterCategory, setFilterCategory] = useState("todas");
  const [filterNom, setFilterNom] = useState("");
  const [filterClassification, setFilterClassification] = useState("");
  const [filterType, setFilterType] = useState("todas");
  const [filterTargetStores, setFilterTargetStores] = useState("todas");
  const [filterBrand, setFilterBrand] = useState("");
  const [filterSupplier, setFilterSupplier] = useState("");
  const [filterSupplierCode, setFilterSupplierCode] = useState("");
  const [filterCustomFields, setFilterCustomFields] = useState("");

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(new Set(products.map((p) => p.id)));
    } else {
      setSelectedProducts(new Set());
    }
  };

  const handleSelectProduct = (productId: string, checked: boolean) => {
    const newSelected = new Set(selectedProducts);
    if (checked) {
      newSelected.add(productId);
    } else {
      newSelected.delete(productId);
    }
    setSelectedProducts(newSelected);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const formatStock = (stock: number) => {
    return new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(stock);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Section */}
        <div className="border-b border-border bg-card px-6 py-4">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <span>...</span>
            <span>/</span>
            <span className="text-foreground font-medium">Produtos</span>
          </div>

          {/* Filters Row */}
          <div className="flex items-center gap-4 mb-4">
            <Select value={selectedStore} onValueChange={setSelectedStore}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Todas as lojas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as lojas</SelectItem>
                <SelectItem value="store1">Loja 1</SelectItem>
                <SelectItem value="store2">Loja 2</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex-1 flex items-center gap-2">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar por código, descrição ou GTIN"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setFilterOpen(true)}
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Situation Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Situação:</span>
            <Badge variant="secondary" className="gap-2">
              Últimos Incluídos
              <button
                onClick={() => _setSituationFilter("")}
                className="hover:bg-muted rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
            <Button variant="ghost" size="sm" className="h-7">
              Limpar
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Products Table */}
        <div className="flex-1 overflow-auto">
          <div className="px-6 py-4">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="w-12 px-4 py-3 text-left">
                    <Checkbox
                      checked={selectedProducts.size === products.length && products.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </th>
                  <th className="w-20 px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Imagem
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Descrição
                  </th>
                  <th className="w-32 px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Código
                  </th>
                  <th className="w-24 px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Unidade
                  </th>
                  <th className="w-32 px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Localização
                  </th>
                  <th className="w-32 px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Preço
                  </th>
                  <th className="w-32 px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Estoque
                  </th>
                  <th className="w-24 px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-border hover:bg-muted/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Checkbox
                        checked={selectedProducts.has(product.id)}
                        onCheckedChange={(checked) =>
                          handleSelectProduct(product.id, checked as boolean)
                        }
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.description}
                            className="w-full h-full object-cover rounded"
                          />
                        ) : (
                          <ImageIcon className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{product.description}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {product.code}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {product.unit}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {product.location || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">R$ {formatPrice(product.price)}</span>
                        <button className="text-green-600 hover:text-green-700">
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {formatStock(product.stock)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button className="p-1 hover:bg-muted rounded text-red-600">
                          <ShoppingCart className="h-4 w-4" />
                        </button>
                        <button className="p-1 hover:bg-muted rounded text-green-600">
                          <ShoppingBag className="h-4 w-4" />
                        </button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-1 hover:bg-muted rounded">
                              <MoreVertical className="h-4 w-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Editar</DropdownMenuItem>
                            <DropdownMenuItem>Duplicar</DropdownMenuItem>
                            <DropdownMenuItem>Excluir</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Actions Panel */}
      <div className="w-64 border-l border-border bg-card flex flex-col">
        {/* Primary Action Button */}
        <div className="p-4 border-b border-border">
          <Button 
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            onClick={() => navigate("/produtos/novo")}
          >
            <Plus className="mr-2 h-4 w-4" />
            Incluir cadastro
          </Button>
        </div>

        {/* Quick Action Icons */}
        <div className="p-4 border-b border-border flex items-center justify-around">
          <button className="p-2 hover:bg-muted rounded">
            <ShoppingBag className="h-5 w-5 text-muted-foreground" />
          </button>
          <button className="p-2 hover:bg-muted rounded">
            <Package className="h-5 w-5 text-muted-foreground" />
          </button>
          <button className="p-2 hover:bg-muted rounded">
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
          </button>
          <button className="p-2 hover:bg-muted rounded">
            <MapPin className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* View Options */}
        <div className="p-4 border-b flex items-center justify-around">
          <button className="p-2 hover:bg-muted rounded bg-muted">
            <BarChart3 className="h-5 w-5" />
          </button>
          <button className="p-2 hover:bg-muted rounded">
            <Package className="h-5 w-5 text-muted-foreground" />
          </button>
          <button className="p-2 hover:bg-muted rounded">
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Actions List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          <button className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded flex items-center gap-2">
            <span className="text-green-600">↑</span>
            Exportar produtos multiloja
          </button>
          <button className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            Sincronizar estoque do sistema na loja virtual
          </button>
          <button className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            Sincronizar preços do sistema na loja virtual
          </button>
          <button className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            Incluir categorias para selecionados
          </button>
          <button className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            Imprimir etiquetas selecionadas
          </button>

          <Separator className="my-2" />

          <div className="space-y-1">
            <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground">
              <Plus className="h-4 w-4 text-green-600" />
              Mais ações
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded">
                  Planilhas
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Exportar dados para planilha</DropdownMenuItem>
                <DropdownMenuItem>Exportar dados de estrutura para planilha</DropdownMenuItem>
                <DropdownMenuItem>
                  Exportar planilha de produtos selecionados para vínculo multiloja
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded">
                  Edição
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Incluir tags para selecionados</DropdownMenuItem>
                <DropdownMenuItem>Reajuste e sincronização de preços</DropdownMenuItem>
                <DropdownMenuItem>Transferir estoque dos produtos selecionados</DropdownMenuItem>
                <DropdownMenuItem>Mudar situação de produtos selecionados</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded">
                  Multilojas
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Importar produtos multiloja</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Filter Panel Sheet */}
      <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
        <SheetContent side="right" className="w-[400px] sm:w-[500px] p-0">
          <SheetHeader className="px-6 py-4 border-b border-border">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-lg font-semibold">Filtrar</SheetTitle>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setFilterOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </SheetHeader>
          
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {/* Situação */}
            <div className="space-y-2">
              <Label htmlFor="situacao" className="text-sm font-medium">
                Situação
              </Label>
              <Select value={filterSituation} onValueChange={setFilterSituation}>
                <SelectTrigger id="situacao">
                  <SelectValue placeholder="Selecione uma opção" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ultimos-incluidos">Últimos Incluídos</SelectItem>
                  <SelectItem value="ativos">Ativos</SelectItem>
                  <SelectItem value="inativos">Inativos</SelectItem>
                  <SelectItem value="todos">Todos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Estoque */}
            <div className="space-y-2">
              <Label htmlFor="estoque" className="text-sm font-medium">
                Estoque
              </Label>
              <Select value={filterStock} onValueChange={setFilterStock}>
                <SelectTrigger id="estoque">
                  <SelectValue placeholder="Selecione uma opção" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="com-estoque">Com Estoque</SelectItem>
                  <SelectItem value="sem-estoque">Sem Estoque</SelectItem>
                  <SelectItem value="estoque-baixo">Estoque Baixo</SelectItem>
                  <SelectItem value="todos">Todos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags" className="text-sm font-medium">
                Tags
              </Label>
              <Select value={filterTags} onValueChange={setFilterTags}>
                <SelectTrigger id="tags">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="tag1">Tag 1</SelectItem>
                  <SelectItem value="tag2">Tag 2</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Categoria */}
            <div className="space-y-2">
              <Label htmlFor="categoria" className="text-sm font-medium">
                Categoria
              </Label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger id="categoria">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="cat1">Categoria 1</SelectItem>
                  <SelectItem value="cat2">Categoria 2</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* NOM */}
            <div className="space-y-2">
              <Label htmlFor="nom" className="text-sm font-medium">
                NOM
              </Label>
              <Input
                id="nom"
                value={filterNom}
                onChange={(e) => setFilterNom(e.target.value)}
                placeholder=""
              />
            </div>

            {/* Classificação */}
            <div className="space-y-2">
              <Label htmlFor="classificacao" className="text-sm font-medium">
                Classificação
              </Label>
              <Select value={filterClassification} onValueChange={setFilterClassification}>
                <SelectTrigger id="classificacao">
                  <SelectValue placeholder="Selecione o filtro" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="class1">Classificação 1</SelectItem>
                  <SelectItem value="class2">Classificação 2</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tipo */}
            <div className="space-y-2">
              <Label htmlFor="tipo" className="text-sm font-medium">
                Tipo
              </Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger id="tipo">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="tipo1">Tipo 1</SelectItem>
                  <SelectItem value="tipo2">Tipo 2</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Lojas Visadas */}
            <div className="space-y-2">
              <Label htmlFor="lojas-visadas" className="text-sm font-medium">
                Lojas Visadas
              </Label>
              <Select value={filterTargetStores} onValueChange={setFilterTargetStores}>
                <SelectTrigger id="lojas-visadas">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="loja1">Loja 1</SelectItem>
                  <SelectItem value="loja2">Loja 2</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Marca */}
            <div className="space-y-2">
              <Label htmlFor="marca" className="text-sm font-medium">
                Marca
              </Label>
              <Input
                id="marca"
                value={filterBrand}
                onChange={(e) => setFilterBrand(e.target.value)}
                placeholder=""
              />
            </div>

            {/* Fornecedor */}
            <div className="space-y-2">
              <Label htmlFor="fornecedor" className="text-sm font-medium">
                Fornecedor
              </Label>
              <Input
                id="fornecedor"
                value={filterSupplier}
                onChange={(e) => setFilterSupplier(e.target.value)}
                placeholder=""
              />
            </div>

            {/* Cód Fornecedor */}
            <div className="space-y-2">
              <Label htmlFor="cod-fornecedor" className="text-sm font-medium">
                Cód fornecedor
              </Label>
              <Input
                id="cod-fornecedor"
                value={filterSupplierCode}
                onChange={(e) => setFilterSupplierCode(e.target.value)}
                placeholder=""
              />
            </div>

            {/* Campos Customizados */}
            <div className="space-y-2">
              <Label htmlFor="campos-customizados" className="text-sm font-medium">
                Campos customizados
              </Label>
              <Select value={filterCustomFields} onValueChange={setFilterCustomFields}>
                <SelectTrigger id="campos-customizados">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cat1">Categoria 1</SelectItem>
                  <SelectItem value="cat2">Categoria 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Filter Button */}
          <div className="border-t border-border px-6 py-4">
            <Button 
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              onClick={() => {
                // Aqui você pode aplicar os filtros
                setFilterOpen(false);
              }}
            >
              Filtrar
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

