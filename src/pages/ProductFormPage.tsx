import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  AlertCircle, 
  Calendar, 
  Camera, 
  CheckCircle2,
  ChevronDown,
  Edit,
  FileText,
  FolderTree,
  Image as ImageIcon,
  Info,
  Link as LinkIcon,
  Lock,
  Package,
  Plus,
  Save,
  Star,
  Tag,
  Trash2,
  Video,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";

interface Supplier {
  id: string;
  name: string;
  description: string;
  code: string;
  costPrice: string;
  isDefault: boolean;
}

export default function ProductFormPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("caracteristicas");
  const [suppliers, setSuppliers] = useState<Supplier[]>([
    {
      id: "1",
      name: "MAC FRIO DISTRIBUIDORA LTDA",
      description: "PRESSOSTATO BRAST 3 NIVEIS BWL11A W10171528",
      code: "21941",
      costPrice: "53,0000",
      isDefault: true,
    },
  ]);
  const [showSupplierDialog, setShowSupplierDialog] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [supplierForm, setSupplierForm] = useState({
    name: "",
    description: "",
    code: "",
    costPrice: "",
    isDefault: false,
  });
  
  // Form states
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    price: "",
    format: "simples",
    type: "produto",
    unit: "",
    condition: "nao-especificado",
    status: true,
    brand: "",
    netWeight: "",
    grossWeight: "",
    width: "",
    depth: "",
    volumes: "",
    height: "",
    itemsPerBox: "",
    gtin: "SEM GTIN",
    gtinTax: "SEM GTIN",
    production: "propria",
    measureUnit: "centimetros",
    expiryDate: "",
    freeShipping: false,
    shortDescription: "",
    complementaryDescription: "",
    externalLink: "",
    video: "",
    observations: "",
    category: "sem-categoria",
    // Tributação
    origem: "0",
    itemType: "",
    taxPercent: "",
    ncm: "",
    cest: "",
    productGroup: "",
    icmsBaseValue: "",
    icmsStValue: "",
    icmsSubstituteValue: "",
    ipiExceptionCode: "",
    pisFixedValue: "",
    cofinsFixedValue: "",
    additionalTaxInfo: "",
    // Estoque
    stockMin: "1,00",
    stockMax: "300,00",
    crossdocking: "0",
    stockLocation: "",
    batchControl: false,
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSupplierFormChange = (field: string, value: string | boolean) => {
    setSupplierForm(prev => ({ ...prev, [field]: value }));
  };

  const handleAddSupplier = () => {
    setEditingSupplier(null);
    setSupplierForm({
      name: "",
      description: "",
      code: "",
      costPrice: "",
      isDefault: false,
    });
    setShowSupplierDialog(true);
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setSupplierForm({
      name: supplier.name,
      description: supplier.description,
      code: supplier.code,
      costPrice: supplier.costPrice,
      isDefault: supplier.isDefault,
    });
    setShowSupplierDialog(true);
  };

  const handleDeleteSupplier = (id: string) => {
    setSuppliers(prev => prev.filter(s => s.id !== id));
    toast({
      title: "Fornecedor removido",
      description: "Fornecedor removido com sucesso.",
    });
  };

  const handleSetDefaultSupplier = (id: string) => {
    setSuppliers(prev => prev.map(s => ({
      ...s,
      isDefault: s.id === id,
    })));
    toast({
      title: "Fornecedor padrão",
      description: "Fornecedor definido como padrão.",
    });
  };

  const handleSaveSupplier = () => {
    if (!supplierForm.name.trim() || !supplierForm.code.trim()) {
      toast({
        title: "Erro",
        description: "Nome e código do fornecedor são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    if (supplierForm.isDefault) {
      setSuppliers(prev => prev.map(s => ({ ...s, isDefault: false })));
    }

    if (editingSupplier) {
      setSuppliers(prev => prev.map(s => 
        s.id === editingSupplier.id 
          ? { ...s, ...supplierForm }
          : { ...s, isDefault: supplierForm.isDefault ? false : s.isDefault }
      ));
      toast({
        title: "Fornecedor atualizado",
        description: "Fornecedor atualizado com sucesso.",
      });
    } else {
      const newSupplier: Supplier = {
        id: Date.now().toString(),
        ...supplierForm,
      };
      setSuppliers(prev => [...prev, newSupplier]);
      toast({
        title: "Fornecedor adicionado",
        description: "Fornecedor adicionado com sucesso.",
      });
    }
    
    setShowSupplierDialog(false);
    setSupplierForm({
      name: "",
      description: "",
      code: "",
      costPrice: "",
      isDefault: false,
    });
    setEditingSupplier(null);
  };

  const handleSave = () => {
    // Validação básica
    if (!formData.name.trim()) {
      toast({
        title: "Erro",
        description: "O nome do produto é obrigatório",
        variant: "destructive",
      });
      return;
    }

    // Aqui você salvaria o produto
    toast({
      title: "Sucesso",
      description: "Produto salvo com sucesso!",
    });
    
    // Redirecionar para lista de produtos
    navigate("/produtos");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Main Content */}
          <div className="flex-1">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Produtos</span>
                <span>/</span>
                <span className="text-foreground font-medium">Novo Produto</span>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/produtos")}
                >
                  Cancelar
                </Button>
                <Button 
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={handleSave}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Salvar produto
                </Button>
              </div>
            </div>

            {/* Product Form */}
            <Card>
              <CardContent className="p-6 space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="Nome do produto"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Imagem</Label>
                    <div className="w-full h-32 border-2 border-dashed border-border rounded-lg flex items-center justify-center bg-muted/50 cursor-pointer hover:bg-muted transition-colors">
                      <div className="text-center">
                        <Camera className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Adicionar imagem</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sku">Código (SKU)</Label>
                    <Input
                      id="sku"
                      value={formData.sku}
                      onChange={(e) => handleInputChange("sku", e.target.value)}
                      placeholder="Código do produto"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Preço venda</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => handleInputChange("price", e.target.value)}
                      placeholder="0,00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="format">Formato</Label>
                    <Select value={formData.format} onValueChange={(value) => handleInputChange("format", value)}>
                      <SelectTrigger id="format">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="simples">Simples</SelectItem>
                        <SelectItem value="variacao">Variação</SelectItem>
                        <SelectItem value="kit">Kit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo</Label>
                    <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                      <SelectTrigger id="type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="produto">Produto</SelectItem>
                        <SelectItem value="servico">Serviço</SelectItem>
                        <SelectItem value="digital">Digital</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="unit">Unidade</Label>
                    <Select value={formData.unit} onValueChange={(value) => handleInputChange("unit", value)}>
                      <SelectTrigger id="unit">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="un">UN</SelectItem>
                        <SelectItem value="kg">KG</SelectItem>
                        <SelectItem value="m">M</SelectItem>
                        <SelectItem value="l">L</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="condition">Condição</Label>
                    <Select value={formData.condition} onValueChange={(value) => handleInputChange("condition", value)}>
                      <SelectTrigger id="condition">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nao-especificado">Não Especificado</SelectItem>
                        <SelectItem value="novo">Novo</SelectItem>
                        <SelectItem value="usado">Usado</SelectItem>
                        <SelectItem value="recondicionado">Recondicionado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Situação</Label>
                    <div className="flex items-center gap-2">
                      <Switch
                        id="status"
                        checked={formData.status}
                        onCheckedChange={(checked) => handleInputChange("status", checked)}
                      />
                      <span className={formData.status ? "text-green-600 font-medium" : "text-muted-foreground"}>
                        {formData.status ? "Ativado" : "Desativado"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-6">
                    <TabsTrigger value="caracteristicas">Características</TabsTrigger>
                    <TabsTrigger value="imagens">Imagens</TabsTrigger>
                    <TabsTrigger value="novo">Novo</TabsTrigger>
                    <TabsTrigger value="estoque">Estoque</TabsTrigger>
                    <TabsTrigger value="fornecedores">Fornecedores</TabsTrigger>
                    <TabsTrigger value="tributacao">Tributação</TabsTrigger>
                  </TabsList>

                  <TabsContent value="caracteristicas" className="space-y-6 mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="brand">Marca</Label>
                        <Input
                          id="brand"
                          value={formData.brand}
                          onChange={(e) => handleInputChange("brand", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="netWeight">Peso Líquido</Label>
                        <Input
                          id="netWeight"
                          value={formData.netWeight}
                          onChange={(e) => handleInputChange("netWeight", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="grossWeight">Peso Bruto</Label>
                        <Input
                          id="grossWeight"
                          value={formData.grossWeight}
                          onChange={(e) => handleInputChange("grossWeight", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="width">Largura</Label>
                        <Input
                          id="width"
                          value={formData.width}
                          onChange={(e) => handleInputChange("width", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="depth">Profundidade</Label>
                        <Input
                          id="depth"
                          value={formData.depth}
                          onChange={(e) => handleInputChange("depth", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="volumes">Volumes</Label>
                        <Input
                          id="volumes"
                          value={formData.volumes}
                          onChange={(e) => handleInputChange("volumes", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="height">Altura</Label>
                        <Input
                          id="height"
                          value={formData.height}
                          onChange={(e) => handleInputChange("height", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="itemsPerBox">Itens p/ caixa</Label>
                        <Input
                          id="itemsPerBox"
                          value={formData.itemsPerBox}
                          onChange={(e) => handleInputChange("itemsPerBox", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="gtin">GTIN/EAN</Label>
                        <Input
                          id="gtin"
                          value={formData.gtin}
                          onChange={(e) => handleInputChange("gtin", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="gtinTax">GTIN/EAN tributário</Label>
                        <Input
                          id="gtinTax"
                          value={formData.gtinTax}
                          onChange={(e) => handleInputChange("gtinTax", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="production">Produção</Label>
                        <Select value={formData.production} onValueChange={(value) => handleInputChange("production", value)}>
                          <SelectTrigger id="production">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="propria">Própria</SelectItem>
                            <SelectItem value="terceiros">Terceiros</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="measureUnit">Unidade de medida</Label>
                        <Select value={formData.measureUnit} onValueChange={(value) => handleInputChange("measureUnit", value)}>
                          <SelectTrigger id="measureUnit">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="centimetros">Centímetros</SelectItem>
                            <SelectItem value="metros">Metros</SelectItem>
                            <SelectItem value="polegadas">Polegadas</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="expiryDate">Data de validade</Label>
                        <div className="relative">
                          <Input
                            id="expiryDate"
                            type="date"
                            value={formData.expiryDate}
                            onChange={(e) => handleInputChange("expiryDate", e.target.value)}
                          />
                          <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="freeShipping">Frete Grátis</Label>
                        <div className="flex items-center gap-2">
                          <Switch
                            id="freeShipping"
                            checked={formData.freeShipping}
                            onCheckedChange={(checked) => handleInputChange("freeShipping", checked)}
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="imagens" className="mt-6">
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">Adicione imagens do produto</p>
                      <div className="grid grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="w-full h-32 border-2 border-dashed border-border rounded-lg flex items-center justify-center bg-muted/50 cursor-pointer hover:bg-muted transition-colors">
                            <ImageIcon className="h-8 w-8 text-muted-foreground" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="novo" className="mt-6">
                    <p className="text-sm text-muted-foreground">Configurações adicionais</p>
                  </TabsContent>

                  <TabsContent value="estoque" className="mt-6 space-y-6">
                    {/* Stock Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="stockMin">Mínimo</Label>
                          <AlertCircle className="h-3 w-3 text-muted-foreground" />
                        </div>
                        <Input
                          id="stockMin"
                          type="number"
                          step="0.01"
                          value={formData.stockMin}
                          onChange={(e) => handleInputChange("stockMin", e.target.value)}
                          placeholder="0,00"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="stockMax">Máximo</Label>
                          <AlertCircle className="h-3 w-3 text-muted-foreground" />
                        </div>
                        <Input
                          id="stockMax"
                          type="number"
                          step="0.01"
                          value={formData.stockMax}
                          onChange={(e) => handleInputChange("stockMax", e.target.value)}
                          placeholder="0,00"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="crossdocking">Crossdocking</Label>
                          <AlertCircle className="h-3 w-3 text-muted-foreground" />
                        </div>
                        <Input
                          id="crossdocking"
                          type="number"
                          value={formData.crossdocking}
                          onChange={(e) => handleInputChange("crossdocking", e.target.value)}
                          placeholder="0"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="stockLocation">Localização</Label>
                          <AlertCircle className="h-3 w-3 text-muted-foreground" />
                        </div>
                        <Input
                          id="stockLocation"
                          value={formData.stockLocation}
                          onChange={(e) => handleInputChange("stockLocation", e.target.value)}
                          placeholder="Localização do produto no estoque"
                        />
                      </div>
                    </div>

                    {/* Informational Message */}
                    <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm text-blue-900 dark:text-blue-100">
                          Para gerenciar o estoque acesse o módulo de Controle de Estoques
                        </p>
                      </div>
                    </div>

                    {/* Batch Control Section */}
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border">
                      <div className="flex items-center gap-3">
                        <Lock className="h-5 w-5 text-muted-foreground" />
                        <div className="flex items-center gap-2">
                          <Switch
                            id="batchControl"
                            checked={formData.batchControl}
                            onCheckedChange={(checked) => handleInputChange("batchControl", checked)}
                          />
                          <Label htmlFor="batchControl" className="cursor-pointer font-medium">
                            Controle de lote {formData.batchControl ? "ativado" : "desativado"}
                          </Label>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          Novo
                        </Badge>
                        <Button variant="link" className="p-0 h-auto text-sm">
                          Saiba mais
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="fornecedores" className="mt-6 space-y-4">
                    {/* Suppliers Table */}
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-12">#</TableHead>
                            <TableHead>Fornecedor</TableHead>
                            <TableHead>Descrição no fornecedor</TableHead>
                            <TableHead>Código no fornecedor</TableHead>
                            <TableHead>Preço de custo</TableHead>
                            <TableHead className="w-32">Padrão</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {suppliers.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                Nenhum fornecedor cadastrado
                              </TableCell>
                            </TableRow>
                          ) : (
                            suppliers.map((supplier, index) => (
                              <TableRow key={supplier.id}>
                                <TableCell className="font-medium">{index + 1}</TableCell>
                                <TableCell>{supplier.name}</TableCell>
                                <TableCell className="text-muted-foreground">{supplier.description}</TableCell>
                                <TableCell className="text-muted-foreground">{supplier.code}</TableCell>
                                <TableCell className="font-medium">R$ {supplier.costPrice}</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => handleSetDefaultSupplier(supplier.id)}
                                      className="flex-shrink-0"
                                      title={supplier.isDefault ? "Fornecedor padrão" : "Definir como padrão"}
                                    >
                                      {supplier.isDefault ? (
                                        <CheckCircle2 className="h-4 w-4 text-green-600 fill-green-600" />
                                      ) : (
                                        <div className="h-4 w-4 rounded-full border-2 border-muted-foreground hover:border-green-600 transition-colors" />
                                      )}
                                    </button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 flex-shrink-0"
                                      onClick={() => handleEditSupplier(supplier)}
                                      title="Editar fornecedor"
                                    >
                                      <Edit className="h-4 w-4 text-blue-600" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 flex-shrink-0"
                                      onClick={() => handleDeleteSupplier(supplier.id)}
                                      title="Excluir fornecedor"
                                    >
                                      <Trash2 className="h-4 w-4 text-red-600" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Add Supplier Button */}
                    <Button
                      variant="outline"
                      className="w-full border-dashed border-2"
                      onClick={handleAddSupplier}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Adicionar fornecedor
                    </Button>
                  </TabsContent>

                  <TabsContent value="tributacao" className="mt-6 space-y-6">
                    {/* Informational Banner */}
                    <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm text-blue-900 dark:text-blue-100">
                          Dados da nota fiscal. Preencha somente se for emitir nota fiscal.
                        </p>
                      </div>
                    </div>

                    {/* Main Tax Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="origem">Origem</Label>
                          <AlertCircle className="h-3 w-3 text-muted-foreground" />
                        </div>
                        <Select value={formData.origem} onValueChange={(value) => handleInputChange("origem", value)}>
                          <SelectTrigger id="origem">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">0 - Nacional, exceto as indicadas nos códigos 3, 4, 5 e 8</SelectItem>
                            <SelectItem value="1">1 - Estrangeira - Importação direta</SelectItem>
                            <SelectItem value="2">2 - Estrangeira - Adquirida no mercado interno</SelectItem>
                            <SelectItem value="3">3 - Nacional, mercadoria ou bem com Conteúdo de Importação superior a 40%</SelectItem>
                            <SelectItem value="4">4 - Nacional, cuja produção tenha sido feita em conformidade com os processos produtivos básicos</SelectItem>
                            <SelectItem value="5">5 - Nacional, mercadoria ou bem com Conteúdo de Importação inferior ou igual a 40%</SelectItem>
                            <SelectItem value="6">6 - Estrangeira - Importação direta, sem similar nacional</SelectItem>
                            <SelectItem value="7">7 - Estrangeira - Adquirida no mercado interno, sem similar nacional</SelectItem>
                            <SelectItem value="8">8 - Nacional, mercadoria ou bem com Conteúdo de Importação superior a 70%</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="itemType">Tipo do item</Label>
                          <AlertCircle className="h-3 w-3 text-muted-foreground" />
                        </div>
                        <Select value={formData.itemType} onValueChange={(value) => handleInputChange("itemType", value)}>
                          <SelectTrigger id="itemType">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="produto">Produto</SelectItem>
                            <SelectItem value="servico">Serviço</SelectItem>
                            <SelectItem value="outros">Outros</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="taxPercent">% Tributos</Label>
                          <AlertCircle className="h-3 w-3 text-muted-foreground" />
                        </div>
                        <Input
                          id="taxPercent"
                          type="number"
                          value={formData.taxPercent}
                          onChange={(e) => handleInputChange("taxPercent", e.target.value)}
                          placeholder="0,00"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="ncm">NCM</Label>
                          <AlertCircle className="h-3 w-3 text-muted-foreground" />
                        </div>
                        <Input
                          id="ncm"
                          value={formData.ncm}
                          onChange={(e) => handleInputChange("ncm", e.target.value)}
                          placeholder="Código NCM"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="cest">CEST</Label>
                          <AlertCircle className="h-3 w-3 text-muted-foreground" />
                        </div>
                        <div className="flex gap-2">
                          <Input
                            id="cest"
                            value={formData.cest}
                            onChange={(e) => handleInputChange("cest", e.target.value)}
                            placeholder="Código CEST"
                          />
                          <Button variant="outline" type="button">
                            Consultar
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="productGroup">Grupo de Produtos</Label>
                          <AlertCircle className="h-3 w-3 text-muted-foreground" />
                        </div>
                        <div className="flex gap-2">
                          <Input
                            id="productGroup"
                            value={formData.productGroup}
                            onChange={(e) => handleInputChange("productGroup", e.target.value)}
                            placeholder="Grupo de produtos"
                          />
                          <Button variant="outline" type="button">
                            Gerenciar grupos
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Collapsible Tax Sections */}
                    <div className="space-y-4">
                      {/* ICMS Section */}
                      <Collapsible defaultOpen>
                        <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                          <span className="font-medium flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ICMS
                          </span>
                          <ChevronDown className="h-4 w-4" />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="p-4 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Label htmlFor="icmsBaseValue">Valor base ICMS ST - retenção</Label>
                                <AlertCircle className="h-3 w-3 text-muted-foreground" />
                              </div>
                              <Input
                                id="icmsBaseValue"
                                type="number"
                                value={formData.icmsBaseValue}
                                onChange={(e) => handleInputChange("icmsBaseValue", e.target.value)}
                                placeholder="0,00"
                              />
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Label htmlFor="icmsStValue">Valor ICMS ST para retenção</Label>
                                <AlertCircle className="h-3 w-3 text-muted-foreground" />
                              </div>
                              <Input
                                id="icmsStValue"
                                type="number"
                                value={formData.icmsStValue}
                                onChange={(e) => handleInputChange("icmsStValue", e.target.value)}
                                placeholder="0,00"
                              />
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Label htmlFor="icmsSubstituteValue">Valor ICMS próprio do substituto</Label>
                                <AlertCircle className="h-3 w-3 text-muted-foreground" />
                              </div>
                              <Input
                                id="icmsSubstituteValue"
                                type="number"
                                value={formData.icmsSubstituteValue}
                                onChange={(e) => handleInputChange("icmsSubstituteValue", e.target.value)}
                                placeholder="0,00"
                              />
                            </div>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>

                      {/* IPI Section */}
                      <Collapsible defaultOpen>
                        <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                          <span className="font-medium flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            IPI
                          </span>
                          <ChevronDown className="h-4 w-4" />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="p-4 space-y-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Label htmlFor="ipiExceptionCode">Código exceção da TIPI</Label>
                              <AlertCircle className="h-3 w-3 text-muted-foreground" />
                            </div>
                            <Input
                              id="ipiExceptionCode"
                              value={formData.ipiExceptionCode}
                              onChange={(e) => handleInputChange("ipiExceptionCode", e.target.value)}
                              placeholder="Código de exceção"
                            />
                          </div>
                        </CollapsibleContent>
                      </Collapsible>

                      {/* PIS / COFINS Section */}
                      <Collapsible defaultOpen>
                        <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                          <span className="font-medium flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            PIS / COFINS
                          </span>
                          <ChevronDown className="h-4 w-4" />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="p-4 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Label htmlFor="pisFixedValue">Valor PIS fixo</Label>
                                <AlertCircle className="h-3 w-3 text-muted-foreground" />
                              </div>
                              <Input
                                id="pisFixedValue"
                                type="number"
                                value={formData.pisFixedValue}
                                onChange={(e) => handleInputChange("pisFixedValue", e.target.value)}
                                placeholder="0,00"
                              />
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Label htmlFor="cofinsFixedValue">Valor COFINS fixo</Label>
                                <AlertCircle className="h-3 w-3 text-muted-foreground" />
                              </div>
                              <Input
                                id="cofinsFixedValue"
                                type="number"
                                value={formData.cofinsFixedValue}
                                onChange={(e) => handleInputChange("cofinsFixedValue", e.target.value)}
                                placeholder="0,00"
                              />
                            </div>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>

                      {/* Dados Adicionais Section */}
                      <Collapsible defaultOpen>
                        <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                          <span className="font-medium flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            Dados adicionais
                          </span>
                          <ChevronDown className="h-4 w-4" />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="p-4 space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="additionalTaxInfo">Informações Adicionais</Label>
                            <Textarea
                              id="additionalTaxInfo"
                              value={formData.additionalTaxInfo}
                              onChange={(e) => handleInputChange("additionalTaxInfo", e.target.value)}
                              rows={6}
                              placeholder="Informações adicionais sobre tributação..."
                            />
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Collapsible Sections */}
                <div className="space-y-4">
                  <Collapsible defaultOpen>
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                      <span className="font-medium">Listas de preço</span>
                      <ChevronDown className="h-4 w-4" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="p-4 space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Configure listas de preço personalizadas para diferentes canais de venda.
                      </p>
                      <Button variant="outline">
                        <Plus className="mr-2 h-4 w-4" />
                        Incluir uma lista de preços
                      </Button>
                    </CollapsibleContent>
                  </Collapsible>

                  <Collapsible defaultOpen>
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                      <span className="font-medium">Descrição curta</span>
                      <ChevronDown className="h-4 w-4" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="p-4 space-y-4">
                      <Label>Descrição Curta (Descrição Principal)</Label>
                      <Textarea
                        value={formData.shortDescription}
                        onChange={(e) => handleInputChange("shortDescription", e.target.value)}
                        rows={6}
                        placeholder="Digite a descrição do produto..."
                      />
                      <p className="text-xs text-muted-foreground">
                        {formData.shortDescription.length} caracteres / {formData.shortDescription.length} caracteres com formatação
                      </p>
                    </CollapsibleContent>
                  </Collapsible>

                  <Collapsible defaultOpen>
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                      <span className="font-medium">Descrição complementar</span>
                      <ChevronDown className="h-4 w-4" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="p-4 space-y-4">
                      <Textarea
                        value={formData.complementaryDescription}
                        onChange={(e) => handleInputChange("complementaryDescription", e.target.value)}
                        rows={6}
                        placeholder="Digite a descrição complementar..."
                      />
                      <p className="text-xs text-muted-foreground">
                        {formData.complementaryDescription.length} caracteres / {formData.complementaryDescription.length} caracteres com formatação
                      </p>
                    </CollapsibleContent>
                  </Collapsible>

                  <Collapsible defaultOpen>
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                      <span className="font-medium flex items-center gap-2">
                        <LinkIcon className="h-4 w-4" />
                        Link Externo
                      </span>
                      <ChevronDown className="h-4 w-4" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="p-4">
                      <Input
                        value={formData.externalLink}
                        onChange={(e) => handleInputChange("externalLink", e.target.value)}
                        placeholder="https://..."
                      />
                    </CollapsibleContent>
                  </Collapsible>

                  <Collapsible defaultOpen>
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                      <span className="font-medium flex items-center gap-2">
                        <Video className="h-4 w-4" />
                        Video
                      </span>
                      <ChevronDown className="h-4 w-4" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="p-4">
                      <Input
                        value={formData.video}
                        onChange={(e) => handleInputChange("video", e.target.value)}
                        placeholder="URL do vídeo"
                      />
                    </CollapsibleContent>
                  </Collapsible>

                  <Collapsible defaultOpen>
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                      <span className="font-medium flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Observações
                      </span>
                      <ChevronDown className="h-4 w-4" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="p-4">
                      <Textarea
                        value={formData.observations}
                        onChange={(e) => handleInputChange("observations", e.target.value)}
                        rows={4}
                        placeholder="Observações internas..."
                      />
                    </CollapsibleContent>
                  </Collapsible>

                  <Collapsible defaultOpen>
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                      <span className="font-medium flex items-center gap-2">
                        <Tag className="h-4 w-4" />
                        Tags
                      </span>
                      <ChevronDown className="h-4 w-4" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="p-4">
                      <p className="text-sm text-muted-foreground mb-4">
                        Classifique seu produto com tags para facilitar a busca e organização.
                      </p>
                      <Button variant="link" className="p-0 h-auto">
                        Editar tags
                      </Button>
                    </CollapsibleContent>
                  </Collapsible>

                  <Collapsible defaultOpen>
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                      <span className="font-medium flex items-center gap-2">
                        <FolderTree className="h-4 w-4" />
                        Categoria
                      </span>
                      <ChevronDown className="h-4 w-4" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="p-4">
                      <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sem-categoria">Sem categoria</SelectItem>
                          <SelectItem value="eletronicos">Eletrônicos</SelectItem>
                          <SelectItem value="moda">Moda</SelectItem>
                          <SelectItem value="casa">Casa e Decoração</SelectItem>
                        </SelectContent>
                      </Select>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="w-80 space-y-4">
            {/* Product Validation */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Validação do produto</CardTitle>
                <CardDescription>
                  Cadastro no Bling ajuda você a vender mais e ter controle total do seu negócio.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Package className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">REFRITEC REFRIGERA...</p>
                      <p className="text-xs text-muted-foreground">Cadastro no Bling</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                    Pendente
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Channel Compatibility */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Compatibilidade com os canais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                    <Plus className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Nenhum canal configurado
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">
                    Configure plataformas e marketplaces para sincronizar seus produtos automaticamente.
                  </p>
                  <Button variant="link" className="text-sm">
                    Integrações E-commerce
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Supplier Dialog */}
        <Dialog open={showSupplierDialog} onOpenChange={setShowSupplierDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingSupplier ? "Editar Fornecedor" : "Adicionar Fornecedor"}
              </DialogTitle>
              <DialogDescription>
                {editingSupplier 
                  ? "Edite as informações do fornecedor" 
                  : "Adicione um novo fornecedor para este produto"}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="supplierName">Fornecedor *</Label>
                <Input
                  id="supplierName"
                  value={supplierForm.name}
                  onChange={(e) => handleSupplierFormChange("name", e.target.value)}
                  placeholder="Nome do fornecedor"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplierDescription">Descrição no fornecedor</Label>
                <Input
                  id="supplierDescription"
                  value={supplierForm.description}
                  onChange={(e) => handleSupplierFormChange("description", e.target.value)}
                  placeholder="Descrição do produto no fornecedor"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="supplierCode">Código no fornecedor *</Label>
                  <Input
                    id="supplierCode"
                    value={supplierForm.code}
                    onChange={(e) => handleSupplierFormChange("code", e.target.value)}
                    placeholder="Código do produto"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supplierCostPrice">Preço de custo</Label>
                  <Input
                    id="supplierCostPrice"
                    type="number"
                    step="0.01"
                    value={supplierForm.costPrice}
                    onChange={(e) => handleSupplierFormChange("costPrice", e.target.value)}
                    placeholder="0,00"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="supplierDefault"
                  checked={supplierForm.isDefault}
                  onCheckedChange={(checked) => handleSupplierFormChange("isDefault", checked)}
                />
                <Label htmlFor="supplierDefault" className="cursor-pointer">
                  Definir como fornecedor padrão
                </Label>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowSupplierDialog(false);
                  setEditingSupplier(null);
                  setSupplierForm({
                    name: "",
                    description: "",
                    code: "",
                    costPrice: "",
                    isDefault: false,
                  });
                }}
              >
                Cancelar
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={handleSaveSupplier}
              >
                {editingSupplier ? "Salvar alterações" : "Adicionar fornecedor"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
