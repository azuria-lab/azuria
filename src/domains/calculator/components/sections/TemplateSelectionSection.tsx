/**
 * TemplateSelectionSection
 * 
 * Tela inicial de seleção de templates com cards
 * Inclui templates disponíveis e templates usados recentemente
 */

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Clock, Package, ShoppingCart, Sparkles, Store } from "lucide-react";
import { MARKETPLACE_TEMPLATES_CONFIG, type MarketplaceTemplateConfig } from "@/data/marketplaceTemplatesConfig";

interface TemplateSelectionSectionProps {
  onTemplateSelect: (template: MarketplaceTemplateConfig) => void;
}

const RECENT_TEMPLATES_KEY = "azuria_recent_templates";

const getIcon = (templateId: string) => {
  if (templateId === 'shopee') {return Package;}
  if (templateId === 'amazon' || templateId === 'magalu') {return Store;}
  return ShoppingCart;
};

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

export default function TemplateSelectionSection({ onTemplateSelect }: TemplateSelectionSectionProps) {
  const [recentTemplateIds, setRecentTemplateIds] = useState<string[]>([]);
  
  useEffect(() => {
    setRecentTemplateIds(getRecentTemplates());
  }, []);

  const templates = Object.values(MARKETPLACE_TEMPLATES_CONFIG);
  const recentTemplates = recentTemplateIds
    .map(id => MARKETPLACE_TEMPLATES_CONFIG[id])
    .filter(Boolean) as MarketplaceTemplateConfig[];

  const handleTemplateClick = (template: MarketplaceTemplateConfig) => {
    saveRecentTemplate(template.id);
    onTemplateSelect(template);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="h-6 w-6 text-[#148D8D]" />
          <h2 className="text-2xl sm:text-3xl font-semibold text-foreground">
            Selecione um Template
          </h2>
        </div>
        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
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
              const Icon = getIcon(template.id);
              return (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    className="cursor-pointer border-l-4 hover:shadow-lg transition-all border-border hover:border-[#148D8D] bg-card"
                    style={{ borderLeftColor: '#148D8D' }}
                    onClick={() => handleTemplateClick(template)}
                  >
                    <div className="p-4 sm:p-6">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-[#148D8D]/10 border border-[#148D8D]/20">
                          <Icon className="h-5 w-5 text-[#148D8D]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-foreground mb-1 line-clamp-1">
                            {template.name}
                          </h4>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {template.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-border">
                        <span className="text-xs font-medium text-[#148D8D]">
                          Selecionar
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {template.marketplaceFee}% comissão
                        </span>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Todos os Templates */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Store className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium text-foreground uppercase tracking-wide">
            Todos os Templates
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {templates.map((template, index) => {
            const Icon = getIcon(template.id);
            const isRecent = recentTemplateIds.includes(template.id);
            
            return (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (recentTemplates.length + index) * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  className={`cursor-pointer border-l-4 hover:shadow-lg transition-all border-border hover:border-[#148D8D] bg-card ${
                    isRecent ? 'opacity-60' : ''
                  }`}
                  style={{ borderLeftColor: '#148D8D' }}
                  onClick={() => handleTemplateClick(template)}
                >
                  <div className="p-4 sm:p-6">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-[#148D8D]/10 border border-[#148D8D]/20">
                        <Icon className="h-5 w-5 text-[#148D8D]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-foreground mb-1 line-clamp-1">
                          {template.name}
                        </h4>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {template.description}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Comissão</span>
                        <span className="font-medium text-foreground">
                          {template.marketplaceFee}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Taxa Pagamento</span>
                        <span className="font-medium text-foreground">
                          {template.paymentFee > 0 ? `${template.paymentFee}%` : 'Incluída'}
                        </span>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-border">
                      <span className="text-xs font-medium text-[#148D8D]">
                        Selecionar Template
                      </span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
