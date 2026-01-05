import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/services/logger";
import { useNavigate } from "react-router-dom";
import { CalculationTemplate } from "@/types/templates";
import { useTemplatesShared } from "@/hooks/useTemplatesShared";
import RapidTemplateCard from "@/components/templates/RapidTemplateCard";
import AdvancedTemplateCard from "@/components/templates/AdvancedTemplateCard";
import AppleCarousel from "@/components/templates/AppleCarousel";
import { RAPID_TEMPLATES } from "@/data/rapidTemplates";
import { ERP_INTEGRATIONS } from "@/data/advancedTemplates";
import { MARKETPLACE_TEMPLATES_CONFIG, marketplaceConfigToTemplateData } from "@/data/marketplaceTemplatesConfig";
import { Package, ShoppingCart, Store } from "lucide-react";

const Templates = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { incrementDownloads: _incrementDownloads } = useTemplatesShared();

  const applyRapidTemplate = useCallback(async (template: CalculationTemplate) => {
    try {
      // Converter template rápido para formato da calculadora avançada
      const defaults = template.default_values as Record<string, unknown> | undefined;
      const getString = (key: string): string => {
        const value = defaults?.[key];
        return typeof value === 'string' ? value : '';
      };
      const getNumber = (key: string, fallback: number): number => {
        const value = defaults?.[key];
        return typeof value === 'number' ? value : fallback;
      };
      const getBoolean = (key: string, fallback: boolean): boolean => {
        const value = defaults?.[key];
        return typeof value === 'boolean' ? value : fallback;
      };

      // Converter para formato esperado pela calculadora avançada
      const templateData = {
        name: template.name,
        description: template.description || '',
        category: template.category || 'ecommerce',
        default_values: {
          cost: getString('cost') || '0',
          targetMargin: getNumber('margin', 30).toString(),
          marketplaceFee: getString('cardFee') || '0',
          paymentFee: '0',
          includePaymentFee: false,
          shipping: getString('shipping') || '0',
          packaging: '0',
          marketing: '0',
          otherCosts: getString('otherCosts') || '0',
        },
        sector_specific_config: {},
      };

      // Navegar para calculadora avançada com os dados do template
      navigate("/calculadora-avancada", {
        state: { 
          template: templateData,
          templateId: template.id || null,
          templateName: template.name
        }
      });

      toast({
        title: "Template selecionado!",
        description: `Template "${template.name}" será aplicado na calculadora avançada.`,
      });
    } catch (error) {
      logger.error('Erro ao aplicar template:', error);
      toast({
        title: "Erro",
        description: "Não foi possível aplicar o template.",
        variant: "destructive",
      });
    }
  }, [navigate, toast]);

  const applyAdvancedTemplate = useCallback((templateId: string) => {
    try {
      const templateConfig = MARKETPLACE_TEMPLATES_CONFIG[templateId];
      
      if (!templateConfig) {
        toast({
          title: "Erro",
          description: "Template não encontrado.",
          variant: "destructive",
        });
        return;
      }

      // Converter config para formato de template e navegar com os dados
      const templateData = marketplaceConfigToTemplateData(templateConfig);
      
      // Navegar para calculadora avançada com os dados do template
      navigate("/calculadora-avancada", {
        state: { 
          template: templateData,
          templateId: templateId,
          templateName: templateConfig.name
        }
      });

      toast({
        title: "Template selecionado!",
        description: `Template "${templateConfig.name}" será aplicado na calculadora avançada.`,
      });
    } catch (error) {
      logger.error('Erro ao aplicar template:', error);
      toast({
        title: "Erro",
        description: "Não foi possível aplicar o template.",
        variant: "destructive",
      });
    }
  }, [navigate, toast]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 w-full">
      {/* Hero Section - Minimalista */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 max-w-7xl">
          <div className="mb-16">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-3">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-semibold text-gray-900 dark:text-white tracking-tight">
              Templates
            </h1>
          </div>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300">
            Escolha um modelo, ajuste em segundos e siga vendendo. Os templates são usados na calculadora avançada para precificação inteligente.
          </p>
        </div>

        {/* Seção 1 - Calculadora Rápida */}
        <section className="mb-20">
          <div className="mb-6">
            <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900 dark:text-white mb-1.5">
              Calculadora Rápida
            </h2>
            <p className="text-base text-gray-600 dark:text-gray-300">
              Modelos prontos para decisões rápidas.
            </p>
          </div>

          <AppleCarousel>
            {RAPID_TEMPLATES.map((rapidTemplate) => (
              <RapidTemplateCard
                key={rapidTemplate.template.id}
                icon={rapidTemplate.icon}
                name={rapidTemplate.name}
                description={rapidTemplate.description}
                onClick={() => applyRapidTemplate(rapidTemplate.template)}
              />
            ))}
          </AppleCarousel>
        </section>

        {/* Divider */}
        <div className="border-t border-gray-100 dark:border-gray-800 my-16" />

        {/* Seção 2 - Avançado */}
        <section className="mb-20">
          <div className="mb-6">
            <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900 dark:text-white mb-1.5">
              Avançado
            </h2>
            <p className="text-base text-gray-600 dark:text-gray-300">
              Precificação completa, integrada ao seu negócio.
            </p>
          </div>

          {/* Integrações ERP */}
          <div className="mb-10">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-5">
              Integrações ERP
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ERP_INTEGRATIONS.map((integration, index) => (
                <AdvancedTemplateCard
                  key={index}
                  icon={integration.icon}
                  name={integration.name}
                  description={integration.description}
                  badge={integration.badge}
                  variant={integration.variant}
                  onClick={integration.onClick}
                />
              ))}
              {/* Card "Em breve" para futuras integrações */}
              <div className="relative rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 p-6 flex items-center justify-center min-h-[180px]">
                <div className="text-center">
                  <p className="text-sm text-gray-400 dark:text-gray-400 font-medium">Em breve</p>
                </div>
              </div>
            </div>
          </div>

          {/* Templates Marketplace */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-5">
              Templates Marketplace
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.values(MARKETPLACE_TEMPLATES_CONFIG).map((template) => (
                <AdvancedTemplateCard
                  key={template.id}
                  icon={ERP_INTEGRATIONS[0].icon} // Usar ícone de shopping cart temporariamente
                  name={template.name}
                  description={template.description}
                  variant="marketplace"
                  onClick={() => applyAdvancedTemplate(template.id)}
                />
              ))}
            </div>
          </div>
        </section>
      </section>
    </div>
  );
};

export default Templates;
