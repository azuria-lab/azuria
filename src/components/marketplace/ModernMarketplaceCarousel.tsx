import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, ArrowRight, CheckCircle, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import type { MarketplaceConnectionStatus } from '@/types/marketplace-api';

interface MarketplaceCard {
  id: string;
  name: string;
  logoUrl: string;
  status: MarketplaceConnectionStatus;
  color: string;
  category: 'nacional' | 'internacional';
  region: string;
}

interface ModernMarketplaceCarouselProps {
  marketplaces: MarketplaceCard[];
  onSelectMarketplace: (marketplaceId: string) => void;
  selectedMarketplaceId?: string;
  className?: string;
}

export default function ModernMarketplaceCarousel({
  marketplaces,
  onSelectMarketplace,
  selectedMarketplaceId,
  className
}: Readonly<ModernMarketplaceCarouselProps>) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Mapeamento de imagens de fundo (geradas via AI)
  const getBackgroundImage = (id: string) => {
    const map: Record<string, string> = {
      'shopee': '/images/marketplaces/bg/shopee.png',
      'mercado-livre': '/images/marketplaces/bg/mercadolivre.png',
      'amazon': '/images/marketplaces/bg/amazon.png',
      'magalu': '/images/marketplaces/bg/magalu.png',
      'temu': '/images/marketplaces/bg/temu.png',
      'shein': '/images/marketplaces/bg/shein.png',
      'americanas': '/images/marketplaces/bg/americanas.png',
      'tiktok': '/images/marketplaces/bg/tiktok.png',
    };
    return map[id] || '/images/marketplaces/bg/amazon.png';
  };

  const getStatusIcon = (status: MarketplaceConnectionStatus) => {
    if (!status.isConnected) {return <AlertCircle className="h-4 w-4 text-red-400" />;}
    if (status.syncStatus === 'syncing') {return <RefreshCw className="h-4 w-4 text-blue-400 animate-spin" />;}
    return <CheckCircle className="h-4 w-4 text-green-400" />;
  };

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className={cn("relative w-full h-[600px] flex flex-col items-center justify-center bg-gradient-to-b from-background via-background/95 to-background overflow-hidden", className)}>
        
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, hsl(var(--foreground)) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
        </div>
        
        {/* Navigation Buttons */}
        <Button 
            variant="ghost" 
            size="icon" 
            className="absolute left-4 z-50 rounded-full bg-background/80 hover:bg-background border border-border/50 backdrop-blur-sm text-foreground shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
            onClick={() => handleScroll('left')}
        >
            <ChevronLeft className="h-5 w-5" />
        </Button>
        <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-4 z-50 rounded-full bg-background/80 hover:bg-background border border-border/50 backdrop-blur-sm text-foreground shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
            onClick={() => handleScroll('right')}
        >
            <ChevronRight className="h-5 w-5" />
        </Button>

        {/* Netflix-style Horizontal Carousel */}
        <div className="relative w-full h-full flex items-center px-16">
          <div
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto overflow-y-hidden px-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            {marketplaces.map((marketplace, index) => {
              const isHovered = hoveredIndex === index;
              const isSelected = selectedMarketplaceId === marketplace.id;

              return (
                <motion.div
                  key={marketplace.id}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={() => onSelectMarketplace(marketplace.id)}
                  className={cn(
                    "relative flex-shrink-0 rounded-xl overflow-hidden cursor-pointer",
                    "bg-card shadow-lg",
                    isHovered ? "z-50 shadow-2xl" : "z-10"
                  )}
                  initial={false}
                  animate={{
                    scale: isHovered ? 1.12 : 1,
                    y: isHovered ? -24 : 0,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 25,
                    mass: 0.8
                  }}
                  style={{
                    width: isHovered ? '320px' : '240px',
                    height: isHovered ? '480px' : '420px',
                  }}
                >
                  {/* Background Image */}
                  <motion.div 
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ 
                      backgroundImage: `url(${getBackgroundImage(marketplace.id)})`,
                    }}
                    animate={{
                      scale: isHovered ? 1.08 : 1,
                    }}
                    transition={{
                      duration: 0.6,
                      ease: [0.4, 0, 0.2, 1]
                    }}
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/20" />
                  
                  {/* Content */}
                  <div className="absolute inset-0 flex flex-col justify-end p-6 z-10">
                    <motion.div 
                      className="flex flex-col items-center text-center space-y-3"
                      animate={{
                        opacity: isHovered || isSelected ? 1 : 0.85,
                        y: isHovered || isSelected ? 0 : 8,
                      }}
                      transition={{
                        duration: 0.4,
                        ease: [0.4, 0, 0.2, 1]
                      }}
                    >
                      {/* Marketplace Name */}
                      <h3 className="text-xl sm:text-2xl font-semibold text-white tracking-tight drop-shadow-2xl">
                        {marketplace.name}
                      </h3>

                      {/* Status Badge */}
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-white/15 backdrop-blur-md text-white border border-white/20 shadow-lg">
                          {marketplace.region}
                        </Badge>
                        <div className={cn(
                          "flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full backdrop-blur-md shadow-lg border",
                          marketplace.status.isConnected 
                            ? "bg-green-500/20 text-green-100 border-green-400/30" 
                            : "bg-orange-500/20 text-orange-100 border-orange-400/30"
                        )}>
                          {getStatusIcon(marketplace.status)}
                          <span className="font-medium">{marketplace.status.isConnected ? 'Conectado' : 'Conectar'}</span>
                        </div>
                      </div>

                      {/* Action Button - Visible on hover */}
                      {(isHovered || isSelected) && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ 
                            delay: 0.15,
                            duration: 0.3,
                            ease: [0.4, 0, 0.2, 1]
                          }}
                        >
                          <Button 
                            size="sm"
                            className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] min-h-[44px]"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectMarketplace(marketplace.id);
                            }}
                          >
                            Acessar
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </motion.div>
                      )}
                    </motion.div>
                  </div>

                  {/* Hover Border Effect */}
                  {isHovered && (
                    <motion.div 
                      className="absolute inset-0 border-2 border-primary/50 rounded-xl pointer-events-none"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ 
                        duration: 0.3,
                        ease: [0.4, 0, 0.2, 1]
                      }}
                    />
                  )}
                  
                  {/* Hover Glow Effect */}
                  {isHovered && (
                    <motion.div 
                      className="absolute inset-0 rounded-xl pointer-events-none"
                      style={{
                        boxShadow: '0 0 40px rgba(59, 130, 246, 0.3)',
                      }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ 
                        duration: 0.4,
                        ease: [0.4, 0, 0.2, 1]
                      }}
                    />
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-2 z-10 px-4 py-2 rounded-full bg-background/80 backdrop-blur-md border border-border/50 shadow-lg">
          <span className="text-xs text-muted-foreground">Deslize para ver mais</span>
        </div>
    </div>
  );
}
