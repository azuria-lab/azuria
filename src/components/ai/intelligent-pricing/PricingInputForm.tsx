
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ProductData {
  cost: string;
  category: string;
  targetMargin: string;
  competitorPrice: string;
  marketPosition: string;
}

interface PricingInputFormProps {
  productData: ProductData;
  onProductDataChange: (data: ProductData) => void;
}

export default function PricingInputForm({ productData, onProductDataChange }: PricingInputFormProps) {
  const updateField = (field: keyof ProductData, value: string) => {
    onProductDataChange({ ...productData, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cost">Custo do Produto (R$) *</Label>
          <Input
            id="cost"
            placeholder="Ex: 150,00"
            value={productData.cost}
            onChange={(e) => updateField('cost', e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="category">Categoria *</Label>
          <Select 
            value={productData.category} 
            onValueChange={(value) => updateField('category', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="eletronicos">Eletrônicos</SelectItem>
              <SelectItem value="roupas">Roupas</SelectItem>
              <SelectItem value="casa">Casa e Decoração</SelectItem>
              <SelectItem value="esporte">Esporte e Lazer</SelectItem>
              <SelectItem value="livros">Livros</SelectItem>
              <SelectItem value="outros">Outros</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="targetMargin">Margem Desejada (%)</Label>
          <Input
            id="targetMargin"
            placeholder="Ex: 40"
            value={productData.targetMargin}
            onChange={(e) => updateField('targetMargin', e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="competitorPrice">Preço do Concorrente (R$)</Label>
          <Input
            id="competitorPrice"
            placeholder="Ex: 299,90"
            value={productData.competitorPrice}
            onChange={(e) => updateField('competitorPrice', e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Posicionamento de Mercado</Label>
        <Select 
          value={productData.marketPosition} 
          onValueChange={(value) => updateField('marketPosition', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="economy">Econômico</SelectItem>
            <SelectItem value="medium">Intermediário</SelectItem>
            <SelectItem value="premium">Premium</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
