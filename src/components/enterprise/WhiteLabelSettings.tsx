
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import BrandingTab from "./white-label/BrandingTab";
import DesignTab from "./white-label/DesignTab";
import DomainTab from "./white-label/DomainTab";
import PreviewTab from "./white-label/PreviewTab";

export default function WhiteLabelSettings() {
  const [settings, setSettings] = useState({
    brandName: "Minha Calculadora Pro",
    primaryColor: "#0066CC",
    secondaryColor: "#003D7A",
    logoUrl: "",
    customDomain: "calculadora.meudominio.com",
    customCss: "",
    footerText: "© 2024 Minha Empresa. Todos os direitos reservados.",
    hideOriginalBranding: true,
    customFavicon: "",
    metaDescription: "Calculadora de preços inteligente para sua empresa"
  });

  const updateSettings = (updates: Partial<typeof settings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">White-Label</h1>
          <p className="text-muted-foreground">
            Personalize completamente a aparência e marca da calculadora
          </p>
        </div>
        <Badge variant="outline" className="bg-brand-50 text-brand-700">
          Enterprise
        </Badge>
      </div>

      <Tabs defaultValue="branding" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="branding">Marca</TabsTrigger>
          <TabsTrigger value="design">Design</TabsTrigger>
          <TabsTrigger value="domain">Domínio</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="branding" className="space-y-6">
          <BrandingTab 
            settings={{
              brandName: settings.brandName,
              logoUrl: settings.logoUrl,
              metaDescription: settings.metaDescription,
              footerText: settings.footerText,
              hideOriginalBranding: settings.hideOriginalBranding
            }}
            onSettingsChange={updateSettings}
          />
        </TabsContent>

        <TabsContent value="design" className="space-y-6">
          <DesignTab 
            settings={{
              primaryColor: settings.primaryColor,
              secondaryColor: settings.secondaryColor,
              customFavicon: settings.customFavicon,
              customCss: settings.customCss
            }}
            onSettingsChange={updateSettings}
          />
        </TabsContent>

        <TabsContent value="domain" className="space-y-6">
          <DomainTab 
            settings={{
              customDomain: settings.customDomain
            }}
            onSettingsChange={updateSettings}
          />
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <PreviewTab 
            settings={{
              brandName: settings.brandName,
              logoUrl: settings.logoUrl,
              primaryColor: settings.primaryColor,
              footerText: settings.footerText
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
