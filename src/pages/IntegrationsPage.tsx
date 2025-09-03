
import { useState } from "react";
import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useEcommerceIntegrations } from "@/hooks/useEcommerceIntegrations";
import IntegrationsStats from "@/components/integrations/IntegrationsStats";
import IntegrationsBenefits from "@/components/integrations/IntegrationsBenefits";
import IntegrationsNavTabs from "@/components/integrations/IntegrationsNavTabs";
import EcommerceTabContent from "@/components/integrations/tabs/EcommerceTabContent";
import MarketplacesTabContent from "@/components/integrations/tabs/MarketplacesTabContent";
import ERPTabContent from "@/components/integrations/tabs/ERPTabContent";
import SpreadsheetsTabContent from "@/components/integrations/tabs/SpreadsheetsTabContent";
import AutomationTabContent from "@/components/integrations/tabs/AutomationTabContent";
import WebhooksTabContent from "@/components/integrations/tabs/WebhooksTabContent";
import ShareTabContent from "@/components/integrations/tabs/ShareTabContent";
import { SEOHead } from "@/components/seo/SEOHead";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.3,
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

export default function IntegrationsPage() {
  const [activeTab, setActiveTab] = useState("ecommerce");
  const { connections, products, syncHistory } = useEcommerceIntegrations();

  return (
    <>
      <SEOHead 
        title="Integrações - Azuria+"
        description="Conecte com marketplaces, ERPs, planilhas e outras ferramentas. Sincronização automática de preços e produtos."
        url={typeof window !== 'undefined' ? `${window.location.origin}/integrations` : 'https://azuria.app/integrations'}
        type="website"
      />
      
      <div className="flex flex-col min-h-screen">
        <Header />
      
      <main className="flex-grow py-12 px-4">
        <motion.div 
          className="container mx-auto max-w-6xl"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <h1 className="text-3xl font-bold mb-2 text-center md:text-left">Integrações Avançadas</h1>
            <p className="text-gray-600 mb-8 text-center md:text-left">
              Conecte o Precifica+ com marketplaces, ERPs, planilhas e outras ferramentas do seu negócio
            </p>
          </motion.div>

          <IntegrationsStats 
            connections={connections}
            syncHistory={syncHistory}
            totalProducts={products.length}
          />

          <Tabs defaultValue="ecommerce" value={activeTab} onValueChange={setActiveTab} className="w-full mt-8">
            <IntegrationsNavTabs />
            
            <TabsContent value="ecommerce" className="space-y-6">
              <EcommerceTabContent />
            </TabsContent>

            <TabsContent value="marketplaces" className="space-y-6">
              <MarketplacesTabContent />
            </TabsContent>

            <TabsContent value="erp" className="space-y-6">
              <ERPTabContent />
            </TabsContent>

            <TabsContent value="spreadsheets" className="space-y-6">
              <SpreadsheetsTabContent />
            </TabsContent>

            <TabsContent value="automation" className="space-y-6">
              <AutomationTabContent />
            </TabsContent>
            
            <TabsContent value="webhooks" className="space-y-6">
              <WebhooksTabContent />
            </TabsContent>

            <TabsContent value="share" className="space-y-6">
              <ShareTabContent />
            </TabsContent>
          </Tabs>

          <IntegrationsBenefits />
        </motion.div>
      </main>
        
        <Footer />
      </div>
    </>
  );
}
