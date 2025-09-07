
import { useCallback, useEffect, useState } from "react";
import { PersonalizedRecommendation } from "@/types/ai";
import { logger } from "@/services/logger";

interface UserContext {
  calculationsCount: number;
  avgMargin: number;
  preferredCategories: string[];
  recentActivity: string[];
  businessSize: 'small' | 'medium' | 'large';
}

export const usePersonalizedRecommendations = (userContext: UserContext) => {
  const [recommendations, setRecommendations] = useState<PersonalizedRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const generateRecommendations = useCallback(async () => {
    setIsLoading(true);
    
    // Simular análise de IA para recomendações personalizadas
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const allRecommendations: PersonalizedRecommendation[] = [
      {
        id: '1',
        title: 'Otimize sua margem de lucro',
        description: 'Baseado no seu histórico, você pode aumentar sua margem em 5-8% sem impactar significativamente as vendas.',
        category: 'optimization',
        priority: 'high',
        impact: 85,
        implementation: 'Ajuste gradual de preços em produtos com baixa elasticidade',
        dataPoints: [`Margem atual: ${userContext.avgMargin}%`, 'Análise de 1.2k produtos similares', 'Elasticidade calculada: 0.8']
      },
      {
        id: '2',
        title: 'Análise de concorrência automática',
        description: 'Configure alertas para monitorar preços da concorrência em tempo real.',
        category: 'market',
        priority: 'medium',
        impact: 70,
        implementation: 'Ative notificações para mudanças de preço > 5%',
        dataPoints: ['3 concorrentes principais identificados', 'Variação média: 12%/mês']
      },
      {
        id: '3',
        title: 'Estratégia sazonal',
        description: 'Seus produtos mostram padrão sazonal forte. Ajuste preços antecipadamente.',
        category: 'strategy',
        priority: 'high',
        impact: 92,
        implementation: 'Aumente preços 15% antes do pico sazonal',
        dataPoints: ['Sazonalidade detectada: +45% Nov-Dez', 'Padrão consistente 3 anos']
      },
      {
        id: '4',
        title: 'Diversificação de categorias',
        description: 'Explore categorias com maior margem baseado no seu perfil.',
        category: 'strategy',
        priority: 'medium',
        impact: 65,
        implementation: 'Teste produtos em categoria "Casa e Jardim"',
        dataPoints: ['Margem média categoria: 45%', 'Baixa concorrência local']
      },
      {
        id: '5',
        title: 'Precificação dinâmica',
        description: 'Implemente ajustes automáticos baseados em demanda e estoque.',
        category: 'pricing',
        priority: 'high',
        impact: 88,
        implementation: 'Configure regras automáticas de precificação',
        dataPoints: ['Potencial aumento receita: 15-25%', 'ROI esperado: 300%']
      }
    ];

    // Filtrar recomendações baseadas no contexto do usuário
    let filteredRecommendations = allRecommendations;

    if (userContext.calculationsCount < 10) {
      filteredRecommendations = filteredRecommendations.filter(r => 
        r.category !== 'optimization' || r.priority === 'high'
      );
    }

    if (userContext.businessSize === 'small') {
      filteredRecommendations = filteredRecommendations.map(r => ({
        ...r,
        implementation: r.implementation.replace('Configure', 'Considere configurar')
      }));
    }

    // Ordenar por impacto e prioridade
    filteredRecommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return (priorityOrder[b.priority] * b.impact) - (priorityOrder[a.priority] * a.impact);
    });

    setRecommendations(filteredRecommendations.slice(0, 4));
    setIsLoading(false);
  }, [userContext]);

  const dismissRecommendation = useCallback((id: string) => {
    setRecommendations(prev => prev.filter(r => r.id !== id));
  }, []);

  const markAsImplemented = useCallback((id: string) => {
    // Em produção, salvaria no backend
    logger.info(`Recommendation ${id} marked as implemented`);
    dismissRecommendation(id);
  }, [dismissRecommendation]);

  useEffect(() => {
    generateRecommendations();
  }, [generateRecommendations]);

  return {
    recommendations,
    isLoading,
    generateRecommendations,
    dismissRecommendation,
    markAsImplemented
  };
};
