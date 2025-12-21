import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRapidCalculator } from "@/hooks/useRapidCalculator";
import { logger } from "@/services/logger";
import { useNavigate } from "react-router-dom";
import { CalculationTemplate } from "@/types/templates";
import { useTemplatesShared } from "@/hooks/useTemplatesShared";
import RapidTemplateCard from "@/components/templates/RapidTemplateCard";
import AdvancedTemplateCard from "@/components/templates/AdvancedTemplateCard";
import AppleCarousel from "@/components/templates/AppleCarousel";
import { RAPID_TEMPLATES } from "@/data/rapidTemplates";
import { ERP_INTEGRATIONS, MARKETPLACE_TEMPLATES } from "@/data/advancedTemplates";

const Templates = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setState } = useRapidCalculator();
  const { incrementDownloads } = useTemplatesShared();

  const applyRapidTemplate = useCallback(async (template: CalculationTemplate) => {
    try {
      // Aplicar valores do template na calculadora rápida
      setState({
        cost: (template.default_values as any)?.cost ?? "",
        margin: (template.default_values as any)?.margin ?? 30,
        tax: (template.default_values as any)?.tax ?? "",
        cardFee: (template.default_values as any)?.cardFee ?? "",
        otherCosts: (template.default_values as any)?.otherCosts ?? "",
        shipping: (template.default_values as any)?.shipping ?? "",
        includeShipping: (template.default_values as any)?.includeShipping ?? false,
      });

      toast({
        title: "Template aplicado!",
        description: `Template "${template.name}" foi aplicado na calculadora rápida.`,
      });

      // Redirecionar para a calculadora
      navigate("/calculadora-rapida");
    } catch (error) {
      logger.error('Erro ao aplicar template:', error);
      toast({
        title: "Erro",
        description: "Não foi possível aplicar o template.",
        variant: "destructive",
      });
    }
  }, [setState, navigate, toast]);

  const applyAdvancedTemplate = useCallback(async (templateName: string) => {
    try {
      // Para templates avançados, navegar para calculadora avançada
      navigate("/calculadora-avancada", {
        state: { templateName }
      });

      toast({
        title: "Template selecionado!",
        description: `Template "${templateName}" será aplicado na calculadora avançada.`,
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
    <div className="min-h-screen bg-white w-full">
      {/* Hero Section - Minimalista */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 max-w-7xl">
        <div className="text-center mb-16">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-semibold text-gray-900 mb-3 tracking-tight">
            Templates
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Escolha um modelo, ajuste em segundos e siga vendendo.
          </p>
        </div>

        {/* Seção 1 - Calculadora Rápida */}
        <section className="mb-20">
          <div className="mb-6">
            <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900 mb-1.5">
              Calculadora Rápida
            </h2>
            <p className="text-base text-gray-600">
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
        <div className="border-t border-gray-100 my-16" />

        {/* Seção 2 - Avançado */}
        <section className="mb-20">
          <div className="mb-6">
            <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900 mb-1.5">
              Avançado
            </h2>
            <p className="text-base text-gray-600">
              Precificação completa, integrada ao seu negócio.
            </p>
          </div>

          {/* Integrações ERP */}
          <div className="mb-10">
            <h3 className="text-xl font-semibold text-gray-900 mb-5">
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
              <div className="relative rounded-2xl border border-gray-100 bg-gray-50/50 p-6 flex items-center justify-center min-h-[180px]">
                <div className="text-center">
                  <p className="text-sm text-gray-400 font-medium">Em breve</p>
                </div>
              </div>
            </div>
          </div>

          {/* Templates Marketplace */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-5">
              Templates Marketplace
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {MARKETPLACE_TEMPLATES.map((marketplace, index) => (
                <AdvancedTemplateCard
                  key={index}
                  icon={marketplace.icon}
                  name={marketplace.name}
                  description={marketplace.description}
                  variant={marketplace.variant}
                  onClick={() => applyAdvancedTemplate(marketplace.name)}
                />
              ))}
              {/* Card "Em breve" para Magalu */}
              <div className="relative rounded-2xl border border-gray-100 bg-gray-50/50 p-6 flex items-center justify-center min-h-[180px]">
                <div className="text-center">
                  <p className="text-sm text-gray-500 font-semibold mb-1">Magalu</p>
                  <p className="text-xs text-gray-400">Em breve</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </section>
    </div>
  );
};

export default Templates;
