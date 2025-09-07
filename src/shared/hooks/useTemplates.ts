
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { CalculationTemplate, TemplateFilters } from '@/types/templates';

export const useTemplates = (filters?: TemplateFilters) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Temporariamente usar dados mock até que o Supabase reconheça as novas tabelas
  const mockTemplates: CalculationTemplate[] = [
    {
      id: '1',
      name: 'E-commerce Básico',
      description: 'Template otimizado para lojas online',
      category: 'ecommerce',
      sector_specific_config: {},
      default_values: { margin: 40, tax: '7', cardFee: '3.5' },
      custom_formulas: null,
      image_url: null,
      price: 0,
      is_premium: false,
      is_public: true,
      status: 'published',
      created_by: null,
      downloads_count: 150,
      rating: 4.5,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Restaurante',
      description: 'Para pratos e bebidas',
      category: 'restaurante',
      sector_specific_config: {},
      default_values: { margin: 300, tax: '7', cardFee: '2.5' },
      custom_formulas: null,
      image_url: null,
      price: 29.90,
      is_premium: true,
      is_public: true,
      status: 'published',
      created_by: null,
      downloads_count: 89,
      rating: 4.8,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  const { data: templates, isLoading, error } = useQuery({
    queryKey: ['templates', filters],
    queryFn: async () => {
      // Por enquanto retornar dados mock
      return mockTemplates.filter(template => {
        if (filters?.category && template.category !== filters.category) {return false;}
        if (filters?.search && !template.name.toLowerCase().includes(filters.search.toLowerCase()) && 
            !template.description?.toLowerCase().includes(filters.search.toLowerCase())) {return false;}
        if (filters?.isPremium !== undefined && template.is_premium !== filters.isPremium) {return false;}
        return true;
      });
    }
  });

  const createTemplateMutation = useMutation({
    mutationFn: async (template: Partial<CalculationTemplate>) => {
      // Implementação mock por enquanto
  // noop in mock
      return { id: 'new-template-id', ...template };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast({ title: "Template criado com sucesso!" });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: "Erro ao criar template",
        description: message,
        variant: "destructive"
      });
    }
  });

  return {
    templates,
    isLoading,
    error,
    createTemplate: createTemplateMutation.mutate,
    isCreating: createTemplateMutation.isPending
  };
};

export const useTemplatePurchases = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: purchases, isLoading } = useQuery({
    queryKey: ['template-purchases'],
    queryFn: async () => {
      // Mock por enquanto
      return [];
    }
  });

  const purchaseTemplateMutation = useMutation({
    mutationFn: async ({ templateId, price }: { templateId: string; price: number }) => {
      // Mock por enquanto
  // noop in mock
      return { id: 'purchase-id', templateId, price };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['template-purchases'] });
      toast({ title: "Template adquirido com sucesso!" });
    },
    onError: (error) => {
      toast({
        title: "Erro ao adquirir template",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  return {
    purchases,
    isLoading,
    purchaseTemplate: purchaseTemplateMutation.mutate,
    isPurchasing: purchaseTemplateMutation.isPending
  };
};

export const useTemplateReviews = (templateId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: reviews, isLoading } = useQuery({
    queryKey: ['template-reviews', templateId],
    queryFn: async () => {
      if (!templateId) {return [];}
      // Mock por enquanto
      return [];
    },
    enabled: !!templateId
  });

  const createReviewMutation = useMutation({
    mutationFn: async (review: { template_id: string; rating: number; comment?: string }) => {
      // Mock por enquanto
  // noop in mock
      return { id: 'review-id', ...review };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['template-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast({ title: "Avaliação enviada com sucesso!" });
    }
  });

  return {
    reviews,
    isLoading,
    createReview: createReviewMutation.mutate,
    isCreatingReview: createReviewMutation.isPending
  };
};
