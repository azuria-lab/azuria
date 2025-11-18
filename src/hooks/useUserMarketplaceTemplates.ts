import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/auth';
import { toast } from '@/components/ui/use-toast';
import type { Database } from '@/types/supabase';

export interface UserMarketplaceTemplate {
  id: string;
  user_id: string;
  marketplace_id: string;
  template_name: string;
  shipping: number;
  packaging: number;
  marketing: number;
  other_costs: number;
  payment_method: string;
  payment_fee: number;
  include_payment_fee: boolean;
  target_margin: number;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateTemplateParams {
  marketplace_id: string;
  template_name: string;
  shipping: number;
  packaging: number;
  marketing: number;
  other_costs: number;
  payment_method: string;
  payment_fee: number;
  include_payment_fee: boolean;
  target_margin: number;
  is_default: boolean;
}

export const useUserMarketplaceTemplates = () => {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<UserMarketplaceTemplate[]>([]);
  const [loading, setLoading] = useState(false);

  // Load user templates
  const loadTemplates = async () => {
    if (!user) {
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_marketplace_templates')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setTemplates(data || []);
    } catch (_error) {
      // Error handled
      toast({
        title: '❌ Erro ao Carregar Templates',
        description: 'Não foi possível carregar seus templates personalizados.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Load templates on mount
  useEffect(() => {
    if (user) {
      loadTemplates();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Get default template for a specific marketplace
  const getDefaultTemplate = (marketplaceId: string): UserMarketplaceTemplate | null => {
    return templates.find(
      t => t.marketplace_id === marketplaceId && t.is_default
    ) || null;
  };

  // Get all templates for a specific marketplace
  const getTemplatesForMarketplace = (marketplaceId: string): UserMarketplaceTemplate[] => {
    return templates.filter(t => t.marketplace_id === marketplaceId);
  };

  // Save new template
  const saveTemplate = async (params: CreateTemplateParams): Promise<UserMarketplaceTemplate | null> => {
    if (!user) {
      toast({
        title: '⚠️ Autenticação Necessária',
        description: 'Faça login para salvar templates personalizados.',
        variant: 'destructive',
      });
      return null;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_marketplace_templates')
        .insert({
          user_id: user.id,
          ...params,
        } as Database['public']['Tables']['user_marketplace_templates']['Insert'])
        .select()
        .single();

      if (error) {
        throw error;
      }

      setTemplates(prev => [data, ...prev]);

      toast({
        title: '✅ Template Salvo',
        description: `Template "${params.template_name}" salvo com sucesso!`,
      });

      return data;
    } catch (_error) {
      // Error handled
      toast({
        title: '❌ Erro ao Salvar Template',
        description: 'Não foi possível salvar o template.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update existing template
  const updateTemplate = async (
    templateId: string,
    updates: Partial<CreateTemplateParams>
  ): Promise<boolean> => {
    if (!user) {
      return false;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_marketplace_templates')
        .update(updates as Database['public']['Tables']['user_marketplace_templates']['Update'])
        .eq('id', templateId)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      setTemplates(prev =>
        prev.map(t => (t.id === templateId ? { ...t, ...updates } : t))
      );

      toast({
        title: '✅ Template Atualizado',
        description: 'Template atualizado com sucesso!',
      });

      return true;
    } catch (_error) {
      // Error handled
      toast({
        title: '❌ Erro ao Atualizar Template',
        description: 'Não foi possível atualizar o template.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Delete template
  const deleteTemplate = async (templateId: string): Promise<boolean> => {
    if (!user) {
      return false;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_marketplace_templates')
        .delete()
        .eq('id', templateId)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      setTemplates(prev => prev.filter(t => t.id !== templateId));

      toast({
        title: '🗑️ Template Removido',
        description: 'Template removido com sucesso!',
      });

      return true;
    } catch (_error) {
      // Error handled
      toast({
        title: '❌ Erro ao Remover Template',
        description: 'Não foi possível remover o template.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Set template as default
  const setAsDefault = async (templateId: string): Promise<boolean> => {
    return updateTemplate(templateId, { is_default: true });
  };

  return {
    templates,
    loading,
    loadTemplates,
    getDefaultTemplate,
    getTemplatesForMarketplace,
    saveTemplate,
    updateTemplate,
    deleteTemplate,
    setAsDefault,
  };
};
