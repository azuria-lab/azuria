
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SearchFormProps {
  onSearch: (searchData: SearchData) => void;
}

interface SearchData {
  productName: string;
  brand: string;
  model: string;
  productCode: string;
  gtin: string;
}

export default function SearchForm({ onSearch }: SearchFormProps) {
  const [formData, setFormData] = useState<SearchData>({
    productName: "",
    brand: "",
    model: "",
    productCode: "",
    gtin: ""
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(formData);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="productName" className="text-sm font-medium">
            Nome do Produto*
          </label>
          <Input
            id="productName"
            name="productName"
            placeholder="Ex: Resistência para Chuveiro Eletrônico"
            value={formData.productName}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="brand" className="text-sm font-medium">
            Marca
          </label>
          <Input
            id="brand"
            name="brand"
            placeholder="Ex: Whirlpool, EOS, Hulter"
            value={formData.brand}
            onChange={handleChange}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label htmlFor="model" className="text-sm font-medium">
            Modelo
          </label>
          <Input
            id="model"
            name="model"
            placeholder="Ex: BRD36, CRC36"
            value={formData.model}
            onChange={handleChange}
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="productCode" className="text-sm font-medium">
            Código do Produto
          </label>
          <Input
            id="productCode"
            name="productCode"
            placeholder="Ex: TSV2004-01"
            value={formData.productCode}
            onChange={handleChange}
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="gtin" className="text-sm font-medium">
            GTIN/EAN (recomendado)
          </label>
          <Input
            id="gtin"
            name="gtin"
            placeholder="Ex: 7891234567890"
            value={formData.gtin}
            onChange={handleChange}
          />
        </div>
      </div>
      
      <Button type="submit" className="w-full sm:w-auto">
        <Search className="mr-2" />
        Analisar Concorrentes
      </Button>
    </form>
  );
}
