
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Info } from "lucide-react";

interface ProductInfo {
  name: string;
  sku: string;
  category: string;
  description: string;
}

interface ProductInfoFormProps {
  onSubmit: (data: ProductInfo) => void;
  initialData?: Partial<ProductInfo>;
}

export default function ProductInfoForm({ 
  onSubmit,
  initialData = {}
}: ProductInfoFormProps) {
  const [productInfo, setProductInfo] = useState<ProductInfo>({
    name: initialData.name || "",
    sku: initialData.sku || "",
    category: initialData.category || "",
    description: initialData.description || ""
  });
  
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  
  const handleChange = (field: keyof ProductInfo, value: string) => {
    setProductInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(productInfo);
  };
  
  return (
    <div className="border rounded-lg overflow-hidden mt-4">
      <div 
        className="p-3 bg-brand-50 border-b flex justify-between items-center cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h4 className="font-medium flex items-center gap-2">
          <Info className="h-4 w-4" />
          Informações do Produto
        </h4>
        <Button variant="ghost" size="sm" onClick={(e) => {
          e.stopPropagation();
          setIsExpanded(!isExpanded);
        }}>
          {isExpanded ? "Esconder" : "Mostrar"}
        </Button>
      </div>
      
      {isExpanded && (
        <div className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="productName">Nome do Produto</Label>
                <Input
                  id="productName"
                  value={productInfo.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Nome do produto"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="productSku">SKU / Código</Label>
                <Input
                  id="productSku"
                  value={productInfo.sku}
                  onChange={(e) => handleChange("sku", e.target.value)}
                  placeholder="SKU ou código interno"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="productCategory">Categoria</Label>
              <Input
                id="productCategory"
                value={productInfo.category}
                onChange={(e) => handleChange("category", e.target.value)}
                placeholder="Categoria do produto"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="productDescription">Descrição (opcional)</Label>
              <Textarea
                id="productDescription"
                value={productInfo.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Descreva seu produto brevemente"
                rows={3}
              />
            </div>
            
            <Button type="submit">Salvar Informações</Button>
          </form>
        </div>
      )}
    </div>
  );
}
