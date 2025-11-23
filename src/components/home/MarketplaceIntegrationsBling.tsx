
import React from "react";
import { motion, useReducedMotion } from "framer-motion";

const marketplaces = [
  { name: "Mercado Livre", logo: "🛒" },
  { name: "Shopee", logo: "🛍️" },
  { name: "Amazon", logo: "📦" },
  { name: "Magalu", logo: "🛒" },
  { name: "Temu", logo: "🛒" },
  { name: "Shein", logo: "👕" },
  { name: "Americanas", logo: "🏪" }
];

const MarketplaceIntegrationsBling: React.FC = () => {
  const reduceMotion = useReducedMotion();

  return (
    <section className="py-20 md:py-32 bg-[#F8FBFF]">
      <div className="container mx-auto px-4">
        <motion.div
          initial={reduceMotion ? undefined : { opacity: 0, y: 20 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={reduceMotion ? undefined : { duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#0A1930] mb-4">
            Integrações com marketplaces
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Conecte-se com os principais marketplaces e gerencie tudo em um só lugar
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6">
            {marketplaces.map((marketplace, index) => (
              <motion.div
                key={index}
                initial={reduceMotion ? undefined : { opacity: 0, scale: 0.8 }}
                whileInView={reduceMotion ? undefined : { opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={reduceMotion ? undefined : { duration: 0.4, delay: index * 0.05 }}
                className="bg-white rounded-xl p-6 border border-gray-100 hover:border-[#005BFF] hover:shadow-lg transition-all flex flex-col items-center justify-center min-h-[120px]"
              >
                <div className="text-4xl mb-3">{marketplace.logo}</div>
                <p className="text-sm font-semibold text-[#0A1930] text-center">
                  {marketplace.name}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={reduceMotion ? undefined : { opacity: 0 }}
            whileInView={reduceMotion ? undefined : { opacity: 1 }}
            viewport={{ once: true }}
            transition={reduceMotion ? undefined : { duration: 0.6, delay: 0.4 }}
            className="text-center mt-12"
          >
            <p className="text-gray-600 text-lg">
              E muitos outros marketplaces em constante expansão
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default MarketplaceIntegrationsBling;

