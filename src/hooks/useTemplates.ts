import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createEmptyTemplate,
  type PricingTemplate,
  TEMPLATE_PRESETS,
  type TemplateBulkOperation,
  type TemplateBulkResult,
  type TemplateFilters,
  type TemplateImport,
  type TemplateImportResult,
  type TemplateSearchResult,
  validateTemplate,
} from '@/types/advancedTemplates';
import { logger } from '@/services/logger';

/**
 * Hook for managing advanced pricing templates
 * Provides CRUD operations, search, sharing, and bulk actions
 */
export const useTemplates = () => {
  // State
  const [templates, setTemplates] = useState<PricingTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock user ID (substituir por auth real)
  const currentUserId = 'user-123';

  /**
   * Initialize with preset templates (simulação)
   */
  useEffect(() => {
    // Simula carregamento de templates do localStorage ou API
    const loadTemplates = () => {
      try {
        const stored = localStorage.getItem('pricing-templates');
        if (stored) {
          const parsed = JSON.parse(stored);
          setTemplates(parsed);
        } else {
          // Inicializa com presets se não houver templates salvos
          const initialTemplates = TEMPLATE_PRESETS.map(preset => {
            const fullTemplate = createEmptyTemplate(currentUserId);
            return {
              ...fullTemplate,
              ...preset,
              id: preset.id || fullTemplate.id,
            } as PricingTemplate;
          });
          setTemplates(initialTemplates);
          localStorage.setItem('pricing-templates', JSON.stringify(initialTemplates));
        }
      } catch (err) {
        setError('Erro ao carregar templates');
        logger.error('[useTemplates] Falha ao carregar templates do storage', { error: err });
      }
    };

    loadTemplates();
  }, [currentUserId]);

  /**
   * Save templates to storage
   */
  const saveTemplates = useCallback((updatedTemplates: PricingTemplate[]) => {
    try {
      localStorage.setItem('pricing-templates', JSON.stringify(updatedTemplates));
      setTemplates(updatedTemplates);
    } catch (err) {
      setError('Erro ao salvar templates');
      logger.error('[useTemplates] Falha ao salvar templates', { error: err });
    }
  }, []);

  /**
   * Create new template
   */
  const createTemplate = useCallback((baseTemplate?: Partial<PricingTemplate>): PricingTemplate => {
    const newTemplate = createEmptyTemplate(currentUserId);
    
    if (baseTemplate) {
      Object.assign(newTemplate, baseTemplate);
    }

    const updatedTemplates = [...templates, newTemplate];
    saveTemplates(updatedTemplates);

    return newTemplate;
  }, [templates, saveTemplates, currentUserId]);

  /**
   * Get template by ID
   */
  const getTemplate = useCallback((templateId: string): PricingTemplate | undefined => {
    return templates.find(t => t.id === templateId);
  }, [templates]);

  /**
   * Update existing template
   */
  const updateTemplate = useCallback((templateId: string, updates: Partial<PricingTemplate>): boolean => {
    setIsLoading(true);
    setError(null);

    try {
      const index = templates.findIndex(t => t.id === templateId);
      if (index === -1) {
        setError('Template não encontrado');
        setIsLoading(false);
        return false;
      }

      const updatedTemplate = {
        ...templates[index],
        ...updates,
        metadata: {
          ...templates[index].metadata,
          updatedAt: new Date(),
          lastModifiedBy: currentUserId,
          version: templates[index].metadata.version + 1,
        },
      };

      // Validate
      const validation = validateTemplate(updatedTemplate);
      if (!validation.valid) {
        setError(validation.errors.join(', '));
        setIsLoading(false);
        return false;
      }

      const updatedTemplates = [...templates];
      updatedTemplates[index] = updatedTemplate;
      saveTemplates(updatedTemplates);

      setIsLoading(false);
      return true;
    } catch (err) {
      setError('Erro ao atualizar template');
      logger.error('[useTemplates] Erro ao atualizar template', { error: err, templateId });
      setIsLoading(false);
      return false;
    }
  }, [templates, saveTemplates, currentUserId]);

  /**
   * Delete template
   */
  const deleteTemplate = useCallback((templateId: string): boolean => {
    setIsLoading(true);
    setError(null);

    try {
      const template = templates.find(t => t.id === templateId);
      if (!template) {
        setError('Template não encontrado');
        setIsLoading(false);
        return false;
      }

      // Check permissions
      if (!template.sharing.permissions.canDelete.includes(currentUserId)) {
        setError('Sem permissão para deletar este template');
        setIsLoading(false);
        return false;
      }

      const updatedTemplates = templates.filter(t => t.id !== templateId);
      saveTemplates(updatedTemplates);

      setIsLoading(false);
      return true;
    } catch (err) {
      setError('Erro ao deletar template');
      logger.error('[useTemplates] Erro ao deletar template', { error: err, templateId });
      setIsLoading(false);
      return false;
    }
  }, [templates, saveTemplates, currentUserId]);

  /**
   * Duplicate template
   */
  const duplicateTemplate = useCallback((templateId: string, newName?: string): PricingTemplate | null => {
    setIsLoading(true);
    setError(null);

    try {
      const original = templates.find(t => t.id === templateId);
      if (!original) {
        setError('Template não encontrado');
        setIsLoading(false);
        return null;
      }

      const duplicate: PricingTemplate = {
        ...original,
        id: `template-${Date.now()}`,
        name: newName || `${original.name} (Cópia)`,
        metadata: {
          ...original.metadata,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: currentUserId,
          lastModifiedBy: currentUserId,
          version: 1,
        },
        sharing: {
          ...original.sharing,
          visibility: 'private',
          permissions: {
            canView: [currentUserId],
            canEdit: [currentUserId],
            canDelete: [currentUserId],
            canShare: [currentUserId],
          },
          shareHistory: [],
        },
        stats: {
          timesUsed: 0,
          timesCopied: 0,
          timesShared: 0,
          uniqueUsers: 0,
        },
      };

      const updatedTemplates = [...templates, duplicate];
      saveTemplates(updatedTemplates);

      setIsLoading(false);
      return duplicate;
    } catch (err) {
      setError('Erro ao duplicar template');
      logger.error('[useTemplates] Erro ao duplicar template', { error: err, templateId });
      setIsLoading(false);
      return null;
    }
  }, [templates, saveTemplates, currentUserId]);

  /**
   * Search templates with filters
   */
  const searchTemplates = useCallback((
    filters?: TemplateFilters,
    page = 1,
    pageSize = 20
  ): TemplateSearchResult => {
    let filtered = [...templates];

    // Apply filters
    if (filters) {
      if (filters.category && filters.category.length > 0) {
        filtered = filtered.filter(t => filters.category?.includes(t.category));
      }

      if (filters.pricingStrategy && filters.pricingStrategy.length > 0) {
        filtered = filtered.filter(t => filters.pricingStrategy?.includes(t.pricing.pricingStrategy));
      }

      if (filters.tags && filters.tags.length > 0) {
        filtered = filtered.filter(t =>
          filters.tags?.some(tag => t.metadata.tags.includes(tag))
        );
      }

      if (filters.status && filters.status.length > 0) {
        filtered = filtered.filter(t => filters.status?.includes(t.metadata.status));
      }

      if (filters.visibility && filters.visibility.length > 0) {
        filtered = filtered.filter(t => filters.visibility?.includes(t.sharing.visibility));
      }

      if (filters.createdBy) {
        filtered = filtered.filter(t => t.metadata.createdBy === filters.createdBy);
      }

      if (filters.minRating !== undefined) {
        filtered = filtered.filter(t => (t.stats.rating || 0) >= (filters.minRating || 0));
      }

      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        filtered = filtered.filter(t =>
          t.name.toLowerCase().includes(term) ||
          t.description.toLowerCase().includes(term) ||
          t.metadata.tags.some(tag => tag.toLowerCase().includes(term))
        );
      }
    }

    // Sort by updated date (most recent first)
    filtered.sort((a, b) => 
      new Date(b.metadata.updatedAt).getTime() - new Date(a.metadata.updatedAt).getTime()
    );

    // Pagination
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginated = filtered.slice(start, end);

    return {
      templates: paginated,
      total: filtered.length,
      page,
      pageSize,
      hasMore: end < filtered.length,
    };
  }, [templates]);

  /**
   * Share template with user
   */
  const shareTemplate = useCallback((
    templateId: string,
    targetUserId: string,
    accessLevel: 'view' | 'edit' | 'admin',
    message?: string
  ): boolean => {
    setIsLoading(true);
    setError(null);

    try {
      const template = templates.find(t => t.id === templateId);
      if (!template) {
        setError('Template não encontrado');
        setIsLoading(false);
        return false;
      }

      // Check permissions
      if (!template.sharing.permissions.canShare.includes(currentUserId)) {
        setError('Sem permissão para compartilhar este template');
        setIsLoading(false);
        return false;
      }

      // Update permissions
      const updatedPermissions = { ...template.sharing.permissions };
      
      if (!updatedPermissions.canView.includes(targetUserId)) {
        updatedPermissions.canView.push(targetUserId);
      }

      if (accessLevel === 'edit' || accessLevel === 'admin') {
        if (!updatedPermissions.canEdit.includes(targetUserId)) {
          updatedPermissions.canEdit.push(targetUserId);
        }
      }

      if (accessLevel === 'admin') {
        if (!updatedPermissions.canDelete.includes(targetUserId)) {
          updatedPermissions.canDelete.push(targetUserId);
        }
        if (!updatedPermissions.canShare.includes(targetUserId)) {
          updatedPermissions.canShare.push(targetUserId);
        }
      }

      // Add to share history
      const shareEntry = {
        id: `share-${Date.now()}`,
        sharedBy: currentUserId,
        sharedWith: targetUserId,
        sharedAt: new Date(),
        accessLevel,
        message,
      };

      const updatedSharing = {
        ...template.sharing,
        permissions: updatedPermissions,
        shareHistory: [...template.sharing.shareHistory, shareEntry],
      };

      const updatedStats = {
        ...template.stats,
        timesShared: template.stats.timesShared + 1,
      };

      updateTemplate(templateId, {
        sharing: updatedSharing,
        stats: updatedStats,
      });

      setIsLoading(false);
      return true;
    } catch (err) {
      setError('Erro ao compartilhar template');
      logger.error('[useTemplates] Erro ao compartilhar template', { error: err, templateId, targetUserId });
      setIsLoading(false);
      return false;
    }
  }, [templates, currentUserId, updateTemplate]);

  /**
   * Toggle favorite status
   */
  const toggleFavorite = useCallback((templateId: string): boolean => {
    const template = templates.find(t => t.id === templateId);
    if (!template) {
      return false;
    }

    return updateTemplate(templateId, {
      metadata: {
        ...template.metadata,
        isFavorite: !template.metadata.isFavorite,
      },
    });
  }, [templates, updateTemplate]);

  /**
   * Bulk operations
   */
  const executeBulkOperation = useCallback((operation: TemplateBulkOperation): TemplateBulkResult => {
    setIsLoading(true);
    setError(null);

    const result: TemplateBulkResult = {
      success: 0,
      failed: 0,
      errors: [],
    };

    try {
      for (const templateId of operation.templateIds) {
        let success = false;

        switch (operation.operation) {
          case 'delete':
            success = deleteTemplate(templateId);
            break;
          case 'archive': {
            const templateToArchive = templates.find(t => t.id === templateId);
            if (templateToArchive) {
              success = updateTemplate(templateId, {
                metadata: {
                  ...templateToArchive.metadata,
                  status: 'archived',
                },
              });
            }
            break;
          }
          case 'activate': {
            const templateToActivate = templates.find(t => t.id === templateId);
            if (templateToActivate) {
              success = updateTemplate(templateId, {
                metadata: {
                  ...templateToActivate.metadata,
                  status: 'active',
                },
              });
            }
            break;
          }
          case 'duplicate':
            success = duplicateTemplate(templateId) !== null;
            break;
          default:
            success = false;
        }

        if (success) {
          result.success++;
        } else {
          result.failed++;
          result.errors.push({
            templateId,
            error: error || 'Operação falhou',
          });
        }
      }

      setIsLoading(false);
      return result;
    } catch (err) {
      setError('Erro ao executar operação em lote');
      logger.error('[useTemplates] Erro ao executar operação em lote', { error: err, operation });
      setIsLoading(false);
      return result;
    }
  }, [templates, deleteTemplate, updateTemplate, duplicateTemplate, error]);

  /**
   * Export template
   */
  const exportTemplate = useCallback((templateId: string, format: 'json' | 'csv' = 'json'): string | null => {
    const template = templates.find(t => t.id === templateId);
    if (!template) {
      setError('Template não encontrado');
      return null;
    }

    if (format === 'json') {
      return JSON.stringify(template, null, 2);
    }

    if (format === 'csv') {
      // Simplified CSV export
      const csv = [
        'Campo,Valor',
        `Nome,${template.name}`,
        `Categoria,${template.category}`,
        `Margem Alvo,${template.pricing.targetMargin}%`,
        `Margem Mínima,${template.pricing.minMargin}%`,
        `Estratégia,${template.pricing.pricingStrategy}`,
        `Custo Produto,${template.costs.productCostPercentage}%`,
        `Custo Frete,${template.costs.shippingCostPercentage}%`,
        `Impostos,${template.costs.taxPercentage}%`,
      ].join('\n');
      return csv;
    }

    return null;
  }, [templates]);

  /**
   * Import templates
   */
  const importTemplates = useCallback((importData: TemplateImport): TemplateImportResult => {
    setIsLoading(true);
    setError(null);

    const result: TemplateImportResult = {
      imported: 0,
      skipped: 0,
      errors: [],
      templates: [],
    };

    try {
      let dataStr = '';
      
      if (typeof importData.data === 'string') {
        dataStr = importData.data;
      }

      const imported: PricingTemplate[] = JSON.parse(dataStr);

      if (!Array.isArray(imported)) {
        throw new Error('Formato inválido');
      }

      for (let index = 0; index < imported.length; index++) {
        const template = imported[index];

        try {
          // Validate
          const validation = validateTemplate(template);
          if (!validation.valid) {
            result.errors.push({
              index,
              name: template.name,
              error: validation.errors.join(', '),
            });
            result.skipped++;
            continue;
          }

          // Check duplicates
          const exists = templates.find(t => t.id === template.id);
          if (exists && !importData.options.overwriteDuplicates) {
            result.skipped++;
            continue;
          }

          // Import
          if (!importData.options.preserveIds) {
            template.id = `template-${Date.now()}-${index}`;
          }

          if (!importData.options.preserveMetadata) {
            template.metadata = {
              ...template.metadata,
              createdAt: new Date(),
              updatedAt: new Date(),
              createdBy: currentUserId,
              lastModifiedBy: currentUserId,
            };
          }

          result.templates.push(template);
          result.imported++;
        } catch (err) {
          result.errors.push({
            index,
            name: template.name || 'Desconhecido',
            error: String(err),
          });
          result.skipped++;
        }
      }

      // Save imported templates
      const updatedTemplates = importData.options.mergeExisting
        ? [...templates, ...result.templates]
        : result.templates;

      saveTemplates(updatedTemplates);

      setIsLoading(false);
      return result;
    } catch (err) {
      setError('Erro ao importar templates');
      logger.error('[useTemplates] Erro ao importar templates', { error: err, importData });
      setIsLoading(false);
      return result;
    }
  }, [templates, saveTemplates, currentUserId]);

  /**
   * Get user's templates
   */
  const myTemplates = useMemo(() => {
    return templates.filter(t => t.metadata.createdBy === currentUserId);
  }, [templates, currentUserId]);

  /**
   * Get shared templates
   */
  const sharedTemplates = useMemo(() => {
    return templates.filter(t => 
      t.metadata.createdBy !== currentUserId &&
      t.sharing.permissions.canView.includes(currentUserId)
    );
  }, [templates, currentUserId]);

  /**
   * Get favorite templates
   */
  const favoriteTemplates = useMemo(() => {
    return templates.filter(t => t.metadata.isFavorite);
  }, [templates]);

  return {
    // State
    templates,
    myTemplates,
    sharedTemplates,
    favoriteTemplates,
    isLoading,
    error,

    // CRUD operations
    createTemplate,
    getTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,

    // Search & filter
    searchTemplates,

    // Sharing
    shareTemplate,

    // Actions
    toggleFavorite,
    executeBulkOperation,

    // Import/Export
    exportTemplate,
    importTemplates,
  };
};
