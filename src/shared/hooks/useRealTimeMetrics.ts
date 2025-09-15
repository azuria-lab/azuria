
import { useEffect, useState } from 'react';

interface RealTimeMetrics {
  activeUsers: number;
  calculationsToday: number;
  avgMarginToday: number;
  revenueToday: number;
}

interface PriceData {
  hour: string;
  avgPrice: number;
  volume: number;
  margin: number;
}

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

interface CompetitorData {
  day: string;
  nossoPreco: number;
  concorrente1: number;
  concorrente2: number;
  concorrente3: number;
}

export const useRealTimeMetrics = () => {
  const [realTimeMetrics, setRealTimeMetrics] = useState<RealTimeMetrics>({
    activeUsers: 142,
    calculationsToday: 1247,
    avgMarginToday: 28.5,
    revenueToday: 12400
  });

  const [priceData] = useState<PriceData[]>([
    { hour: '09:00', avgPrice: 125.90, volume: 45, margin: 28.5 },
    { hour: '10:00', avgPrice: 127.20, volume: 52, margin: 29.2 },
    { hour: '11:00', avgPrice: 128.50, volume: 38, margin: 27.8 },
    { hour: '12:00', avgPrice: 126.80, volume: 61, margin: 30.1 },
    { hour: '13:00', avgPrice: 129.10, volume: 47, margin: 28.9 },
    { hour: '14:00', avgPrice: 127.90, volume: 55, margin: 29.5 }
  ]);

  const [categoryData] = useState<CategoryData[]>([
    { name: 'Eletrônicos', value: 35, color: '#0088FE' },
    { name: 'Roupas', value: 25, color: '#00C49F' },
    { name: 'Casa', value: 20, color: '#FFBB28' },
    { name: 'Livros', value: 15, color: '#FF8042' },
    { name: 'Outros', value: 5, color: '#8884D8' }
  ]);

  const [competitorData] = useState<CompetitorData[]>([
    { day: 'Seg', nossoPreco: 125, concorrente1: 130, concorrente2: 128, concorrente3: 135 },
    { day: 'Ter', nossoPreco: 127, concorrente1: 132, concorrente2: 129, concorrente3: 138 },
    { day: 'Qua', nossoPreco: 128, concorrente1: 134, concorrente2: 131, concorrente3: 140 },
    { day: 'Qui', nossoPreco: 126, concorrente1: 133, concorrente2: 130, concorrente3: 137 },
    { day: 'Sex', nossoPreco: 129, concorrente1: 135, concorrente2: 132, concorrente3: 142 }
  ]);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simular delay de refresh
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Atualizar métricas
    setRealTimeMetrics(prev => ({
      activeUsers: prev.activeUsers + Math.floor(Math.random() * 20 - 10),
      calculationsToday: prev.calculationsToday + Math.floor(Math.random() * 10),
      avgMarginToday: prev.avgMarginToday + (Math.random() - 0.5) * 1.0,
      revenueToday: prev.revenueToday + Math.floor(Math.random() * 500)
    }));
    
    setIsRefreshing(false);
  };

  useEffect(() => {
    // Simular atualizações em tempo real
    const interval = setInterval(() => {
      setRealTimeMetrics(prev => ({
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 10 - 5),
        calculationsToday: prev.calculationsToday + Math.floor(Math.random() * 5),
        avgMarginToday: prev.avgMarginToday + (Math.random() - 0.5) * 0.5,
        revenueToday: prev.revenueToday + Math.floor(Math.random() * 100)
      }));
    }, 30000); // Atualiza a cada 30 segundos

    return () => clearInterval(interval);
  }, []);

  return { 
    realTimeMetrics, 
    priceData, 
    categoryData, 
    competitorData, 
    isRefreshing, 
    handleRefresh 
  };
};
