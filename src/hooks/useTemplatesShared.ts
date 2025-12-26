import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CalculationTemplate } from '@/types/templates';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/services/logger';
import { useAuthContext } from '@/domains/auth';
import type { Database } from '@/types/supabase';

interface TemplateDefaults {
  cost?: string | number;
  margin?: number;
  tax?: string | number;
  cardFee?: string | number;
  otherCosts?: string | number;
  shipping?: string | number;
  includeShipping?: boolean;
}

interface TemplateSectorConfig {
  [key: string]: unknown;
}

interface Template {
  id: string;
  name: string;
  description: string | null;
  category: string;
  default_values: TemplateDefaults | null;
  sector_specific_config: TemplateSectorConfig | null;
  rating: number | null;
  downloads_count: number | null;
  is_premium: boolean | null;
  image_url?: string | null;
  price?: number | null;
  is_public?: boolean | null;
  status?: string | null;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
}

type DBTemplate = Omit<Template, 'default_values' | 'sector_specific_config'> & {
  default_values: unknown;
  sector_specific_config: unknown;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

// Converter Template para CalculationTemplate
function convertToCalculationTemplate(template: Template): CalculationTemplate {
  return {
    id: template.id,
    name: template.name,
    description: template.description,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    category: template.category as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sector_specific_config: (template.sector_specific_config || {}) as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    default_values: (template.default_values || {}) as any,
    custom_formulas: null,
    image_url: template.image_url,
    price: template.price || 0,
    is_premium: template.is_premium || false,
    is_public: template.is_public || true,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    status: (template.status as any) || 'published',
    created_by: template.created_by,
    downloads_count: template.downloads_count || 0,
    rating: template.rating || 0,
    created_at: template.created_at || new Date().toISOString(),
    updated_at: template.updated_at || new Date().toISOString(),
  };
}

export function useTemplatesShared() {
  const [templates, setTemplates] = useState<CalculationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuthContext();

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar templates públicos e templates do usuário
      const queries = [
        supabase
          .from('calculation_templates')
          .select('*')
          .eq('is_public', true)
          .eq('status', 'published')
          .order('downloads_count', { ascending: false }),
      ];

      // Se o usuário estiver logado, buscar também seus templates privados
      if (user?.id) {
        queries.push(
          supabase
            .from('calculation_templates')
            .select('*')
            .eq('created_by', user.id)
            .order('created_at', { ascending: false })
        );
      }

      const results = await Promise.all(queries);
      const allTemplates: Template[] = [];

      for (const result of results) {
        if (result.error) {
          logger.warn('Erro ao buscar templates:', result.error);
          continue;
        }

        const safe = (result.data as unknown as DBTemplate[] | null) ?? [];
        const mapped: Template[] = safe.map((row) => ({
          ...row,
          default_values: isObject(row.default_values) 
            ? (row.default_values as TemplateDefaults) 
            : null,
          sector_specific_config: isObject(row.sector_specific_config) 
            ? (row.sector_specific_config as TemplateSectorConfig) 
            : null,
        }));

        allTemplates.push(...mapped);
      }

      // Remover duplicatas e converter
      const uniqueTemplates = Array.from(
        new Map(allTemplates.map(t => [t.id, t])).values()
      );

      const converted = uniqueTemplates.map(convertToCalculationTemplate);
      setTemplates(converted);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      logger.error('Erro ao carregar templates:', err);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os templates.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id, toast]);

  const createTemplate = useCallback(async (
    templateData: Omit<CalculationTemplate, 'id' | 'created_at' | 'updated_at' | 'downloads_count' | 'rating'>
  ): Promise<CalculationTemplate | null> => {
    try {
      if (!user?.id) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para criar templates.",
          variant: "destructive",
        });
        return null;
      }

      // Payload sem tipagem explícita para evitar erros de incompatibilidade de tipos
      const payload = {
        name: templateData.name,
        description: templateData.description,
        category: templateData.category,
        sector_specific_config: templateData.sector_specific_config,
        default_values: templateData.default_values,
        custom_formulas: templateData.custom_formulas,
        image_url: templateData.image_url,
        price: templateData.price || 0,
        is_premium: templateData.is_premium || false,
        is_public: templateData.is_public || false,
        status: 'published',
        created_by: user.id,
        downloads_count: 0,
        rating: 0,
      };

       
      const { data, error } = await supabase
        .from('calculation_templates')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .insert(payload as any)
        .select()
        .single();

      if (error) {throw error;}

      const newTemplate = convertToCalculationTemplate({
        ...data,
        default_values: isObject(data.default_values) 
          ? (data.default_values as TemplateDefaults) 
          : null,
        sector_specific_config: isObject(data.sector_specific_config) 
          ? (data.sector_specific_config as TemplateSectorConfig) 
          : null,
      } as Template);

      // Atualizar lista local
      setTemplates(prev => [newTemplate, ...prev]);

      toast({
        title: "Template criado!",
        description: `Template "${templateData.name}" foi criado com sucesso.`,
      });

      return newTemplate;
    } catch (err) {
      logger.error('Erro ao criar template:', err);
      toast({
        title: "Erro",
        description: "Não foi possível criar o template.",
        variant: "destructive",
      });
      return null;
    }
  }, [user?.id, toast]);

  const incrementDownloads = useCallback(async (templateId: string) => {
    try {
      const template = templates.find(t => t.id === templateId);
      if (!template) {return;}

      const { error } = await supabase
        .from('calculation_templates')
        .update({ 
          downloads_count: (template.downloads_count || 0) + 1 
        } satisfies Database['public']['Tables']['calculation_templates']['Update'])
        .eq('id', templateId);

      if (error) {throw error;}

      // Atualizar localmente
      setTemplates(prev => prev.map(t => 
        t.id === templateId 
          ? { ...t, downloads_count: (t.downloads_count || 0) + 1 }
          : t
      ));
    } catch (err) {
      logger.error('Erro ao incrementar downloads:', err);
    }
  }, [templates]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  return {
    templates,
    loading,
    error,
    fetchTemplates,
    createTemplate,
    incrementDownloads,
  };
}

