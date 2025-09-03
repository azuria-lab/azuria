
import React from "react";
import { motion } from "framer-motion";

// Componentes específicos com placeholders visuais
const ShopeeLogoPlaceholder = () => (
  <div className="w-24 h-16 bg-white rounded-lg flex items-center justify-center p-2 shadow-sm">
    <div className="w-full h-full bg-orange-500 rounded flex items-center justify-center">
      <span className="text-white font-bold text-xs">Shopee</span>
    </div>
  </div>
);

const MercadoLivrePlaceholder = () => (
  <div className="w-24 h-16 bg-white rounded-lg flex items-center justify-center p-2 shadow-sm">
    <div className="w-full h-full bg-yellow-500 rounded flex items-center justify-center">
      <span className="text-white font-bold text-xs">ML</span>
    </div>
  </div>
);

const AmazonPlaceholder = () => (
  <div className="w-24 h-16 bg-white rounded-lg flex items-center justify-center p-2 shadow-sm">
    <div className="w-full h-full bg-blue-600 rounded flex items-center justify-center">
      <span className="text-white font-bold text-xs">Amazon</span>
    </div>
  </div>
);

const marketplaces = [
  {
    name: "Shopee",
    component: ShopeeLogoPlaceholder,
    status: "integrated",
    description: "Marketplace líder no Sudeste Asiático"
  },
  {
    name: "Mercado Livre",
    component: MercadoLivrePlaceholder,
    status: "integrated", 
    description: "Maior e-commerce da América Latina"
  },
  {
    name: "Amazon",
    component: AmazonPlaceholder,
    status: "integrated",
    description: "Maior marketplace mundial"
  }
];

interface MarketplaceLogosProps {
  showDescription?: boolean;
  variant?: "grid" | "horizontal";
  className?: string;
}

export default function MarketplaceLogos({ 
  showDescription = false, 
  variant = "horizontal",
  className = ""
}: MarketplaceLogosProps) {
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (variant === "grid") {
    return (
      <motion.div 
        className={`grid grid-cols-2 md:grid-cols-3 gap-6 ${className}`}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {marketplaces.map((marketplace, index) => {
          const LogoComponent = marketplace.component;
          return (
            <motion.div
              key={marketplace.name}
              variants={itemVariants}
              className="flex flex-col items-center space-y-3 group"
            >
              <div className="transform group-hover:scale-105 transition-transform duration-200">
                <LogoComponent />
              </div>
              {showDescription && (
                <div className="text-center">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {marketplace.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {marketplace.description}
                  </p>
                  <span className="inline-block mt-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                    Integrado
                  </span>
                </div>
              )}
            </motion.div>
          );
        })}
      </motion.div>
    );
  }

  return (
    <motion.div 
      className={`flex flex-wrap items-center justify-center gap-8 ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {marketplaces.map((marketplace, index) => {
        const LogoComponent = marketplace.component;
        return (
          <motion.div
            key={marketplace.name}
            variants={itemVariants}
            className="flex flex-col items-center space-y-2 group"
          >
            <div className="transform group-hover:scale-105 transition-transform duration-200 opacity-80 hover:opacity-100">
              <LogoComponent />
            </div>
            {showDescription && (
              <span className="text-xs text-gray-600 dark:text-gray-400 text-center">
                {marketplace.name}
              </span>
            )}
          </motion.div>
        );
      })}
    </motion.div>
  );
}
