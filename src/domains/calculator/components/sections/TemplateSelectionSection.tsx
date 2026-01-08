/**
 * TemplateSelectionSection
 * 
 * Tela inicial de seleção de templates com cards
 * Inclui templates disponíveis e templates usados recentemente
 * Organizados por categorias: Templates por Setor, Integrações ERP, Marketplaces
 */

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Briefcase, Clock, Database, Package, ShoppingCart, Store, Zap } from "lucide-react";
import { MARKETPLACE_TEMPLATES_CONFIG, type MarketplaceTemplateConfig } from "@/data/marketplaceTemplatesConfig";
import { RAPID_TEMPLATES } from "@/data/rapidTemplates";
import { ERP_INTEGRATIONS } from "@/data/advancedTemplates";
import { CalculationTemplate } from "@/types/templates";

interface TemplateSelectionSectionProps {
  onTemplateSelect: (template: MarketplaceTemplateConfig | { type: 'rapid'; template: CalculationTemplate }) => void;
}

const RECENT_TEMPLATES_KEY = "azuria_recent_templates";

// Função para salvar template usado recentemente
const saveRecentTemplate = (templateId: string) => {
  try {
    const recent = JSON.parse(localStorage.getItem(RECENT_TEMPLATES_KEY) || '[]') as string[];
    const updated = [templateId, ...recent.filter(id => id !== templateId)].slice(0, 4); // Máximo 4
    localStorage.setItem(RECENT_TEMPLATES_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Erro ao salvar template recente:', error);
  }
};

// Função para obter templates usados recentemente
const getRecentTemplates = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(RECENT_TEMPLATES_KEY) || '[]') as string[];
  } catch (error) {
    console.error('Erro ao obter templates recentes:', error);
    return [];
  }
};

// Função para obter ícone do template
const getTemplateIcon = (templateId: string, icon?: typeof Zap) => {
  if (icon) {return icon;}
  if (templateId === 'shopee') {return Package;}
  if (templateId === 'amazon' || templateId === 'magalu') {return Store;}
  return ShoppingCart;
};

export default function TemplateSelectionSection({ onTemplateSelect }: TemplateSelectionSectionProps) {
  const [recentTemplateIds, setRecentTemplateIds] = useState<string[]>([]);
  
  useEffect(() => {
    setRecentTemplateIds(getRecentTemplates());
  }, []);

  // Preparar templates recentes (todos os tipos)
  const recentTemplates: Array<{
    id: string;
    name: string;
    description: string;
    icon: typeof Zap;
    type: 'marketplace' | 'rapid' | 'erp';
    data: MarketplaceTemplateConfig | CalculationTemplate | { badge?: string; onClick: () => void };
  }> = [];

  recentTemplateIds.forEach(id => {
    // Marketplace templates
    const marketplaceTemplate = MARKETPLACE_TEMPLATES_CONFIG[id];
    if (marketplaceTemplate) {
      recentTemplates.push({
        id: marketplaceTemplate.id,
        name: marketplaceTemplate.name,
        description: marketplaceTemplate.description,
        icon: getTemplateIcon(marketplaceTemplate.id),
        type: 'marketplace',
        data: marketplaceTemplate,
      });
      return;
    }

    // Rapid templates
    const rapidTemplate = RAPID_TEMPLATES.find(rt => rt.template.id === id);
    if (rapidTemplate) {
      recentTemplates.push({
        id: rapidTemplate.template.id,
        name: rapidTemplate.name,
        description: rapidTemplate.description,
        icon: rapidTemplate.icon,
        type: 'rapid',
        data: rapidTemplate.template,
      });
      return;
    }
  });

  const handleMarketplaceTemplateClick = (template: MarketplaceTemplateConfig) => {
    saveRecentTemplate(template.id);
    onTemplateSelect(template);
  };

  const handleRapidTemplateClick = (template: CalculationTemplate) => {
    saveRecentTemplate(template.id);
    onTemplateSelect({ type: 'rapid', template });
  };

  const handleERPTemplateClick = (integration: typeof ERP_INTEGRATIONS[0]) => {
    if (integration.badge === 'Em breve') {
      return; // Não fazer nada se estiver "Em breve"
    }
    integration.onClick();
  };

  // Renderizar card de template
  const renderTemplateCard = (
    id: string,
    name: string,
    description: string,
    Icon: typeof Zap,
    onClick: () => void,
    index: number,
    isRecent = false,
    badge?: string,
    metadata?: { label: string; value: string }[]
  ) => {
    return (
      <motion.div
        key={id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Card
          className={`cursor-pointer border-l-4 hover:shadow-lg transition-all border-border hover:border-[#148D8D] bg-card ${
            badge === 'Em breve' ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          style={{ borderLeftColor: '#148D8D' }}
          onClick={onClick}
        >
          <div className="p-4 sm:p-6">
            <div className="flex items-start gap-3 mb-3">
              <div className="p-2 rounded-lg bg-[#148D8D]/10 border border-[#148D8D]/20">
                <Icon className="h-5 w-5 text-[#148D8D]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="text-sm font-semibold text-foreground line-clamp-1">
                    {name}
                  </h4>
                  {badge && (
                    <Badge variant="secondary" className="text-xs">
                      {badge}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {description}
                </p>
              </div>
            </div>
            {metadata && metadata.length > 0 && (
              <div className="space-y-2 mb-3">
                {metadata.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-medium text-foreground">{item.value}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="pt-3 border-t border-border">
              <span className="text-xs font-medium text-[#148D8D]">
                {badge === 'Em breve' ? 'Em breve' : 'Selecionar Template'}
              </span>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="space-y-3">
        <h2 className="text-2xl sm:text-3xl font-semibold text-foreground">
          Selecione um Template
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Escolha um template pré-configurado para iniciar seu cálculo de precificação
        </p>
      </div>

      {/* Templates Recentes */}
      {recentTemplates.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-medium text-foreground uppercase tracking-wide">
              Usados Recentemente
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentTemplates.map((template, index) => {
              if (template.type === 'marketplace') {
                const marketplaceTemplate = template.data as MarketplaceTemplateConfig;
                return renderTemplateCard(
                  template.id,
                  template.name,
                  template.description,
                  template.icon,
                  () => handleMarketplaceTemplateClick(marketplaceTemplate),
                  index,
                  true,
                  undefined,
                  [
                    { label: 'Comissão', value: `${marketplaceTemplate.marketplaceFee}%` },
                    { label: 'Taxa Pagamento', value: marketplaceTemplate.paymentFee > 0 ? `${marketplaceTemplate.paymentFee}%` : 'Incluída' },
                  ]
                );
              } else if (template.type === 'rapid') {
                const rapidTemplate = template.data as CalculationTemplate;
                const defaults = rapidTemplate.default_values as Record<string, unknown> | undefined;
                const margin = typeof defaults?.margin === 'number' ? defaults.margin : 0;
                return renderTemplateCard(
                  template.id,
                  template.name,
                  template.description,
                  template.icon,
                  () => handleRapidTemplateClick(rapidTemplate),
                  index,
                  true,
                  undefined,
                  [
                    { label: 'Margem', value: `${margin}%` },
                    { label: 'Tipo', value: 'Rápido' },
                  ]
                );
              }
              return null;
            })}
          </div>
        </div>
      )}

      {/* Categoria: Templates por Setor */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-foreground">
            Templates por Setor
          </h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Templates pré-configurados para diferentes setores e tipos de negócio.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {RAPID_TEMPLATES.map((rapidTemplate, index) => {
            const isRecent = recentTemplateIds.includes(rapidTemplate.template.id);
            const defaults = rapidTemplate.template.default_values as Record<string, unknown> | undefined;
            const margin = typeof defaults?.margin === 'number' ? defaults.margin : 0;
            return renderTemplateCard(
              rapidTemplate.template.id,
              rapidTemplate.name,
              rapidTemplate.description,
              rapidTemplate.icon,
              () => handleRapidTemplateClick(rapidTemplate.template),
              index,
              isRecent,
              undefined,
              [
                { label: 'Margem', value: `${margin}%` },
                { label: 'Tipo', value: 'Rápido' },
              ]
            );
          })}
        </div>
      </div>

      {/* Categoria: Integrações ERP */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-foreground">
            Integrações ERP
          </h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Precificação completa, integrada ao seu negócio.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ERP_INTEGRATIONS.map((integration, index) => {
            return renderTemplateCard(
              `erp-${index}`,
              integration.name,
              integration.description,
              integration.icon,
              () => handleERPTemplateClick(integration),
              index,
              false,
              integration.badge
            );
          })}
        </div>
      </div>

      {/* Categoria: Marketplaces */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Store className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-foreground">
            Marketplaces
          </h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Templates pré-configurados para os principais marketplaces.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.values(MARKETPLACE_TEMPLATES_CONFIG).map((template, index) => {
            const isRecent = recentTemplateIds.includes(template.id);
            const Icon = getTemplateIcon(template.id);
            return renderTemplateCard(
              template.id,
              template.name,
              template.description,
              Icon,
              () => handleMarketplaceTemplateClick(template),
              index,
              isRecent,
              undefined,
              [
                { label: 'Comissão', value: `${template.marketplaceFee}%` },
                { label: 'Taxa Pagamento', value: template.paymentFee > 0 ? `${template.paymentFee}%` : 'Incluída' },
              ]
            );
          })}
        </div>
      </div>
    </div>
  );
}
