
import React from "react";
import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import MarketplaceComparator from "@/components/calculators/MarketplaceComparator";
import ProUpgradeBanner from "@/components/calculators/ProUpgradeBanner";
import { useAuth } from "@/hooks/auth";

export default function MarketplaceComparatorPage() {
  const { user: _user, isPro } = useAuth();
  
  return (
    <Layout>
      {/* Removemos o componente Helmet que estava causando problemas */}
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto py-6 px-4"
      >
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Comparador de Marketplaces
          </h1>
          <p className="text-gray-600">
            Compare diferentes marketplaces e descubra o melhor canal para vender seu produto.
          </p>
        </div>

        {isPro ? (
          <MarketplaceComparator />
        ) : (
          <div className="space-y-6">
            <div className="bg-brand-50 border border-brand-100 rounded-lg p-6">
              <h2 className="text-xl font-bold text-brand-800 mb-2">
                Prévia do Comparador de Marketplaces
              </h2>
              <p className="text-brand-700 mb-4">
                Esta é uma funcionalidade PRO que permite comparar taxas e lucros entre diferentes marketplaces.
              </p>
              
              {/* Prévia limitada para usuários gratuitos */}
              <div className="opacity-60 pointer-events-none">
                <MarketplaceComparator 
                  initialCost={100}
                  initialTargetProfit={30}
                  initialTaxPercent={5}
                />
              </div>
            </div>
            
            <ProUpgradeBanner />
          </div>
        )}
      </motion.div>
    </Layout>
  );
}
