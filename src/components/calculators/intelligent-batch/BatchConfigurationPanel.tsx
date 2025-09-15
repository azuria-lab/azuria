
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Plus, Settings, Trash2 } from "lucide-react";

interface BatchItem {
  id: string;
  quantity: number;
  unitCost: number;
  discountPercent: number;
  targetMargin: number;
  aiSuggestedPrice?: number;
  competitivePrice?: number;
}

interface BatchConfigurationPanelProps {
  batches: BatchItem[];
  setBatches: (batches: BatchItem[]) => void;
  category: string;
  setCategory: (category: string) => void;
  marketCondition: 'high' | 'medium' | 'low';
  setMarketCondition: (condition: 'high' | 'medium' | 'low') => void;
  isPro: boolean;
}

export default function BatchConfigurationPanel({
  batches,
  setBatches,
  category,
  setCategory,
  marketCondition,
  setMarketCondition,
  isPro
}: BatchConfigurationPanelProps) {
  
  const addBatch = () => {
    const lastBatch = batches[batches.length - 1];
    const newBatch: BatchItem = {
      id: Date.now().toString(),
      quantity: lastBatch.quantity * 2,
      unitCost: lastBatch.unitCost,
      discountPercent: Math.min(lastBatch.discountPercent + 5, 30),
      targetMargin: lastBatch.targetMargin
    };
    setBatches([...batches, newBatch]);
  };

  const removeBatch = (id: string) => {
    if (batches.length > 1) {
      setBatches(batches.filter(batch => batch.id !== id));
    }
  };

  const updateBatch = (id: string, field: keyof BatchItem, value: number) => {
    setBatches(batches.map(batch => 
      batch.id === id ? { ...batch, [field]: value } : batch
    ));
  };

  return (
    <div className="space-y-6">
      {/* Configurações Globais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações Globais
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="category">Categoria do Produto</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="eletrônicos">Eletrônicos</SelectItem>
                <SelectItem value="roupas">Roupas e Acessórios</SelectItem>
                <SelectItem value="casa">Casa e Decoração</SelectItem>
                <SelectItem value="livros">Livros</SelectItem>
                <SelectItem value="esporte">Esporte e Lazer</SelectItem>
                <SelectItem value="beleza">Beleza e Cuidados</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="marketCondition">Condição do Mercado</Label>
            <Select value={marketCondition} onValueChange={(value: 'high' | 'medium' | 'low') => setMarketCondition(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">Alta Demanda</SelectItem>
                <SelectItem value="medium">Demanda Normal</SelectItem>
                <SelectItem value="low">Baixa Demanda</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Badge variant="outline" className="text-xs">
              {isPro ? "Análise IA Ativa" : "Modo Básico"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Configuração de Lotes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Configuração de Lotes</CardTitle>
            <Button onClick={addBatch} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Lote
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {batches.map((batch, index) => (
            <div key={batch.id} className="p-4 border rounded-lg bg-gray-50 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Lote #{index + 1}</h4>
                <div className="flex items-center gap-2">
                  {batch.aiSuggestedPrice && (
                    <Badge className="bg-purple-100 text-purple-700">
                      IA: R$ {batch.aiSuggestedPrice.toFixed(2)}
                    </Badge>
                  )}
                  <Button
                    onClick={() => removeBatch(batch.id)}
                    variant="ghost"
                    size="sm"
                    disabled={batches.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label>Quantidade</Label>
                  <Input
                    type="number"
                    value={batch.quantity}
                    onChange={(e) => updateBatch(batch.id, "quantity", Number(e.target.value))}
                  />
                </div>

                <div>
                  <Label>Custo Unitário (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={batch.unitCost}
                    onChange={(e) => updateBatch(batch.id, "unitCost", Number(e.target.value))}
                  />
                </div>

                <div>
                  <div className="flex justify-between">
                    <Label>Desconto (%)</Label>
                    <span className="text-sm font-medium">{batch.discountPercent}%</span>
                  </div>
                  <Slider
                    value={[batch.discountPercent]}
                    onValueChange={([value]) => updateBatch(batch.id, "discountPercent", value)}
                    min={0}
                    max={50}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <div className="flex justify-between">
                    <Label>Margem Alvo (%)</Label>
                    <span className="text-sm font-medium">{batch.targetMargin}%</span>
                  </div>
                  <Slider
                    value={[batch.targetMargin]}
                    onValueChange={([value]) => updateBatch(batch.id, "targetMargin", value)}
                    min={10}
                    max={80}
                    step={1}
                    className="mt-2"
                  />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
