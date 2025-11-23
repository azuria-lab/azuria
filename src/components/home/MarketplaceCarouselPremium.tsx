
import React, { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

// Logos dos marketplaces com URLs oficiais e confiáveis
const marketplaces = [
  {
    name: "Shopee",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/f/fe/Shopee.svg",
    fallback: "Shopee",
    color: "#EE4D2D",
  },
  {
    name: "Mercado Livre",
    logoUrl: "https://http2.mlstatic.com/frontend-assets/ml-web-navigation/ui-navigation/6.6.1/mercadolibre/logo__large_plus@2x.png",
    fallback: "Mercado Livre",
    color: "#FFE600",
  },
  {
    name: "Amazon",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
    fallback: "Amazon",
    color: "#000000",
  },
  {
    name: "Magalu",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Magazine_Luiza_logo.svg",
    fallback: "Magalu",
    color: "#FF6B00",
  },
  {
    name: "Temu",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Temu_logo.svg/2560px-Temu_logo.svg.png",
    fallback: "Temu",
    color: "#FF6B00",
  },
  {
    name: "Shein",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/8/81/Shein_Logo.svg",
    fallback: "SHEIN",
    color: "#000000",
  },
  {
    name: "Americanas",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/8/8a/Americanas_logo.svg",
    fallback: "Americanas",
    color: "#FF0000",
  },
  {
    name: "AliExpress",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/AliExpress_logo.svg/2560px-AliExpress_logo.svg.png",
    fallback: "AliExpress",
    color: "#FF6B00",
  },
  {
    name: "Wish",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/7/7a/Wish_logo.svg",
    fallback: "Wish",
    color: "#000000",
  },
];

// Componente para cada card de marketplace com fallback e lazy loading otimizado
const MarketplaceLogoCard: React.FC<{ marketplace: typeof marketplaces[0] }> = ({ marketplace }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [isInView, setIsInView] = useState(false);
  const cardRef = React.useRef<HTMLDivElement>(null);

  // IntersectionObserver otimizado para lazy loading
  React.useEffect(() => {
    if (!cardRef.current) {return;}

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { 
        rootMargin: '50px',
        threshold: 0.01
      }
    );

    observer.observe(cardRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={cardRef}
      className="flex-shrink-0 w-[calc(50%-12px)] md:w-[calc(33.333%-20px)] lg:w-[calc(25%-24px)] px-3 md:px-5"
    >
      <div className="bg-white rounded-xl p-6 md:p-8 border border-black/8 shadow-sm hover:shadow-md transition-shadow duration-200 h-[140px] flex items-center justify-center">
        <div className="w-full h-full flex items-center justify-center relative">
          {!imageError && isInView ? (
            <>
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-4 bg-gray-200 rounded animate-pulse" />
                </div>
              )}
              <img
                src={marketplace.logoUrl}
                alt={`Logo ${marketplace.name}`}
                className={`max-w-full max-h-16 w-auto h-auto object-contain transition-opacity duration-200 ${
                  imageLoading ? 'opacity-0' : 'opacity-100'
                }`}
                onError={() => {
                  setImageError(true);
                  setImageLoading(false);
                }}
                onLoad={() => setImageLoading(false)}
                loading="lazy"
                decoding="async"
                fetchPriority="low"
              />
            </>
          ) : imageError ? (
            <div className="flex items-center justify-center">
              <span 
                className="text-xl md:text-2xl font-bold" 
                style={{ color: marketplace.color }}
              >
                {marketplace.fallback}
              </span>
            </div>
          ) : (
            <div className="w-16 h-4 bg-gray-200 rounded animate-pulse" />
          )}
        </div>
      </div>
    </div>
  );
};

const MarketplaceCarouselPremium: React.FC = () => {
  const reduceMotion = useReducedMotion();

  // Duplicar items várias vezes para criar loop infinito perfeito
  // A chave é ter múltiplas cópias idênticas para que quando a animação reinicia,
  // a posição visual seja exatamente a mesma, criando um loop perfeito sem salto
  // Usamos 3 cópias para garantir que sempre haja conteúdo visível durante a transição
  const duplicatedMarketplaces = [
    ...marketplaces, 
    ...marketplaces, 
    ...marketplaces
  ];

  return (
    <section className="py-20 md:py-32 bg-[#F8FBFF] w-full">
      <div className="container mx-auto px-4 w-full">
        <motion.div
          initial={reduceMotion ? undefined : { opacity: 0, y: 20 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={reduceMotion ? undefined : { duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#0A1930] mb-4">
            Integre com os principais marketplaces do Brasil
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Gerencie preços de forma inteligente com sincronização automática e centralizada.
          </p>
        </motion.div>

        <div className="max-w-7xl mx-auto">
          {/* Carrossel Container com movimento contínuo infinito */}
          <div className="relative overflow-hidden">
            <div
              className="flex"
              style={{
                animation: reduceMotion 
                  ? 'none' 
                  : 'scroll-marketplaces-infinite 50s linear infinite',
                willChange: reduceMotion ? 'auto' : 'transform',
              }}
            >
              {duplicatedMarketplaces.map((marketplace, index) => (
                <MarketplaceLogoCard
                  key={`${marketplace.name}-${index}`}
                  marketplace={marketplace}
                />
              ))}
            </div>
          </div>

          {/* Texto de apoio */}
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

      {/* CSS para animação contínua infinita - loop perfeito sem salto */}
      <style>{`
        @keyframes scroll-marketplaces-infinite {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            /* Move exatamente 1/3 do conteúdo total (uma cópia completa dos marketplaces) */
            /* Como temos 3 cópias idênticas, quando a animação reinicia em 0%,
               a posição visual é exatamente a mesma, criando um loop perfeito */
            transform: translate3d(-33.333%, 0, 0);
          }
        }
      `}</style>
    </section>
  );
};

export default MarketplaceCarouselPremium;
