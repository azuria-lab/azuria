import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAdvancedBusinessMetrics } from '@/hooks/useAdvancedBusinessMetrics';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/domains/auth';
import { useToast } from '@/hooks/use-toast';
import { Database, Save, Upload } from 'lucide-react';

interface DataEntryFormWidgetProps {
  userPlan: string;
}

interface SalesEntry {
  channel: string;
  productName: string;
  saleValue: number;
  costValue: number;
  saleDate: string;
}

const CHANNELS = [
  { value: 'mercado_livre', label: 'Mercado Livre' },
  { value: 'shopee', label: 'Shopee' },
  { value: 'amazon', label: 'Amazon' },
  { value: 'magalu', label: 'Magalu' },
  { value: 'loja_fisica', label: 'Loja Física' },
  { value: 'site_proprio', label: 'Site Próprio' }
];

export default function DataEntryFormWidget({ userPlan }: DataEntryFormWidgetProps) {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const { refetch } = useAdvancedBusinessMetrics();
  
  const [entry, setEntry] = useState<SalesEntry>({
    channel: '',
    productName: '',
    saleValue: 0,
    costValue: 0,
    saleDate: new Date().toISOString().split('T')[0]
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive"
      });
      return;
    }

    if (!entry.channel || !entry.productName || entry.saleValue <= 0) {
      toast({
        title: "Dados incompletos",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('sales_data')
        .insert({
          user_id: user.id,
          channel_name: entry.channel,
          product_name: entry.productName,
          sale_value: entry.saleValue,
          cost_value: entry.costValue,
          profit_margin: entry.costValue > 0 
            ? ((entry.saleValue - entry.costValue) / entry.saleValue) * 100 
            : 0,
          sale_date: entry.saleDate,
          commission_fee: 0,
          advertising_cost: 0,
          shipping_cost: 0,
          metadata: { source: 'manual_entry' }
        });

      if (error) {throw error;}

      toast({
        title: "Sucesso!",
        description: "Dados de venda salvos com sucesso",
      });

      // Reset form
      setEntry({
        channel: '',
        productName: '',
        saleValue: 0,
        costValue: 0,
        saleDate: new Date().toISOString().split('T')[0]
      });

      // Refresh metrics
      refetch();

    } catch (error) {
      console.error('Error saving sales data:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar dados. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const simulateApiIntegration = () => {
    toast({
      title: "Simulação de API",
      description: "Em breve: integração automática com marketplaces",
    });
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Entrada de Dados
          </CardTitle>
          <Badge variant={userPlan === 'premium' ? 'default' : 'secondary'}>
            {userPlan === 'premium' ? 'Premium' : 'PRO'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        {userPlan === 'premium' ? (
          <div className="space-y-4">
            <div className="text-center p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
              <Upload className="h-8 w-8 mx-auto mb-3 text-purple-600" />
              <h3 className="font-medium text-purple-800 mb-2">Integração Automática</h3>
              <p className="text-sm text-purple-600 mb-4">
                Seus dados serão sincronizados automaticamente com os marketplaces
              </p>
              <Button onClick={simulateApiIntegration} variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Sincronizar Agora
              </Button>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-500">
                Ou adicione dados manualmente usando o formulário abaixo
              </p>
            </div>
          </div>
        ) : (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700">
              <strong>Plano PRO:</strong> Insira seus dados de vendas manualmente para acompanhar métricas detalhadas
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="channel">Canal de Venda</Label>
              <Select value={entry.channel} onValueChange={(value) => setEntry({...entry, channel: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o canal" />
                </SelectTrigger>
                <SelectContent>
                  {CHANNELS.map((channel) => (
                    <SelectItem key={channel.value} value={channel.value}>
                      {channel.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="productName">Nome do Produto</Label>
              <Input
                id="productName"
                value={entry.productName}
                onChange={(e) => setEntry({...entry, productName: e.target.value})}
                placeholder="Digite o nome do produto"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="saleValue">Valor de Venda</Label>
              <Input
                id="saleValue"
                type="number"
                step="0.01"
                value={entry.saleValue || ''}
                onChange={(e) => setEntry({...entry, saleValue: parseFloat(e.target.value) || 0})}
                placeholder="0,00"
              />
            </div>

            <div>
              <Label htmlFor="costValue">Custo do Produto</Label>
              <Input
                id="costValue"
                type="number"
                step="0.01"
                value={entry.costValue || ''}
                onChange={(e) => setEntry({...entry, costValue: parseFloat(e.target.value) || 0})}
                placeholder="0,00"
              />
            </div>

            <div>
              <Label htmlFor="saleDate">Data da Venda</Label>
              <Input
                id="saleDate"
                type="date"
                value={entry.saleDate}
                onChange={(e) => setEntry({...entry, saleDate: e.target.value})}
              />
            </div>
          </div>

          {entry.saleValue > 0 && entry.costValue > 0 && (
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-700">
                <strong>Margem calculada:</strong> {((entry.saleValue - entry.costValue) / entry.saleValue * 100).toFixed(1)}%
              </p>
            </div>
          )}

          <Button 
            type="submit" 
            disabled={isSubmitting || !entry.channel || !entry.productName || entry.saleValue <= 0}
            className="w-full"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Salvando...' : 'Salvar Dados'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}