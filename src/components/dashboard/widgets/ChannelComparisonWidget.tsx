import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Globe, 
  ShoppingBag, 
  ShoppingCart, 
  Store,
  TrendingDown,
  TrendingUp
} from 'lucide-react';
import { ChannelComparison } from '@/types/businessMetrics';

interface ChannelComparisonWidgetProps {
  data: ChannelComparison[];
  isPremium?: boolean;
}

export default function ChannelComparisonWidget({ data, isPremium = false }: ChannelComparisonWidgetProps) {
  const maxRevenue = Math.max(...data.map(channel => channel.revenue));
  
  const getChannelIcon = (channelName: string) => {
    const iconMap = {
      'Mercado Livre': ShoppingCart,
      'Shopee': ShoppingBag,
      'Amazon': Globe,
      'Magalu': Store,
      'Loja Física': Store,
      'Site Próprio': Globe
    };
    
    return iconMap[channelName as keyof typeof iconMap] || ShoppingCart;
  };

  const getChannelColor = (index: number) => {
    const colors = [
      'bg-blue-500',
      'bg-emerald-500', 
      'bg-purple-500',
      'bg-orange-500',
      'bg-pink-500',
      'bg-indigo-500'
    ];
    return colors[index % colors.length];
  };

  const getGrowthBadge = (growth: number) => {
    if (growth > 5) {
      return <Badge variant="default" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
        <TrendingUp className="h-3 w-3 mr-1" />
        +{growth.toFixed(1)}%
      </Badge>;
    } else if (growth < -5) {
      return <Badge variant="destructive" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
        <TrendingDown className="h-3 w-3 mr-1" />
        {growth.toFixed(1)}%
      </Badge>;
    }
    return <Badge variant="secondary">
      {growth > 0 ? '+' : ''}{growth.toFixed(1)}%
    </Badge>;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-sm font-medium">Comparativo de Canais</CardTitle>
        <CardDescription>Performance por canal de vendas</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.slice(0, isPremium ? data.length : 3).map((channel, index) => {
            const Icon = getChannelIcon(channel.channel);
            const progressValue = (channel.revenue / maxRevenue) * 100;
            
            return (
              <div key={index} className="space-y-3 p-3 rounded-lg border border-border/50 hover:border-border transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`p-2 rounded-md ${getChannelColor(index)} bg-opacity-10`}>
                      <Icon className={`h-4 w-4 text-${getChannelColor(index).replace('bg-', '').replace('-500', '-600')}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{channel.channel}</p>
                      <p className="text-xs text-muted-foreground">{channel.sales} vendas</p>
                    </div>
                  </div>
                  {getGrowthBadge(channel.growth)}
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Receita</span>
                    <span className="font-medium">{formatCurrency(channel.revenue)}</span>
                  </div>
                  <Progress value={progressValue} className="h-2" />
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Lucro:</span>
                      <span className="font-medium text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(channel.profit)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Comissão:</span>
                      <span className="font-medium text-red-600 dark:text-red-400">
                        {formatCurrency(channel.commission)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {data.length > 3 && !isPremium && (
          <div className="mt-4 p-3 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border border-primary/20">
            <p className="text-xs text-center text-muted-foreground">
              Upgrade para Premium para ver todos os {data.length} canais
            </p>
          </div>
        )}

        <CardDescription className="mt-3 text-xs">
          Dados dos últimos 30 dias • Ordenado por receita
        </CardDescription>
      </CardContent>
    </Card>
  );
}