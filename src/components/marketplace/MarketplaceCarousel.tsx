import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, ArrowRight, CheckCircle, RefreshCw } from 'lucide-react';
import type { MarketplaceConnectionStatus } from '@/types/marketplace-api';

export interface MarketplaceCard {
  id: string;
  name: string;
  logoUrl: string;
  status: MarketplaceConnectionStatus;
  color: string;
  category: 'nacional' | 'internacional';
  region: string;
}

interface MarketplaceCarouselProps {
  marketplaces: MarketplaceCard[];
  onSelectMarketplace: (marketplaceId: string) => void;
  selectedMarketplaceId?: string;
  className?: string;
}

export default function MarketplaceCarousel({
  marketplaces,
  onSelectMarketplace,
  selectedMarketplaceId,
  className
}: Readonly<MarketplaceCarouselProps>) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

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
    return map[id] || '/images/marketplaces/bg/amazon.png'; // Fallback
  };

  // Mapeamento de logos 3D (geradas via AI)
  const get3DLogo = (id: string, fallbackUrl: string) => {
    const map: Record<string, string> = {
      'shopee': '/images/marketplaces/3d/shopee.png',
      'mercado-livre': '/images/marketplaces/3d/mercadolivre.png',
      'amazon': '/images/marketplaces/3d/amazon.png',
      'magalu': '/images/marketplaces/3d/magalu.png',
      'temu': '/images/marketplaces/3d/temu.png',
      'shein': '/images/marketplaces/3d/shein.png',
      'americanas': '/images/marketplaces/3d/americanas.png',
      'tiktok': '/images/marketplaces/3d/tiktok.png',
    };
    return map[id] || fallbackUrl;
  };

  const getStatusIcon = (status: MarketplaceConnectionStatus) => {
    if (!status.isConnected) {return <AlertCircle className="h-4 w-4 text-red-400" />;}
    if (status.syncStatus === 'syncing') {return <RefreshCw className="h-4 w-4 text-blue-400 animate-spin" />;}
    return <CheckCircle className="h-4 w-4 text-green-400" />;
  };

  return (
    <div className={cn("w-full h-[600px] flex gap-2 p-4 bg-[#F3FAFF] dark:bg-gray-900 rounded-3xl overflow-hidden transition-colors duration-300", className)}>
      {marketplaces.map((marketplace) => {
        const isHovered = hoveredId === marketplace.id;
        const isSelected = selectedMarketplaceId === marketplace.id;
        const isActive = isHovered || isSelected;

        return (
          <motion.div
            key={marketplace.id}
            layout
            onClick={() => onSelectMarketplace(marketplace.id)}
            onMouseEnter={() => setHoveredId(marketplace.id)}
            onMouseLeave={() => setHoveredId(null)}
            className={cn(
              "relative h-full rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 ease-in-out",
              "border border-white/10 hover:border-white/30",
              isActive ? "flex-[3]" : "flex-1"
            )}
            initial={false}
          >
            {/* Background Image with Parallax Effect */}
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 scale-110"
              style={{ 
                backgroundImage: `url(${getBackgroundImage(marketplace.id)})`,
                transform: isActive ? 'scale(1.0)' : 'scale(1.1)'
              }}
            />

            {/* Gradient Overlay */}
            <div className={cn(
              "absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20 transition-opacity duration-500",
              isActive ? "opacity-80" : "opacity-60 hover:opacity-70"
            )} />

            {/* Content Container */}
            <div className="absolute inset-0 flex flex-col justify-end p-6">
              {/* Logo & Title Section */}
              <div className="flex flex-col items-center text-center transition-all duration-300">
                {/* Logo container - transparent for all marketplaces (backgrounds contain logos) */}
                <motion.div 
                  layoutId={`logo-${marketplace.id}`}
                  className="relative flex items-center justify-center transition-all duration-500 bg-transparent border-none shadow-none"
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: isActive ? 'translateZ(20px)' : 'translateZ(0px)',
                    background: 'transparent',
                    boxShadow: 'none',
                    border: 'none'
                  }}
                >
                  {/* Logo rendering removed - backgrounds contain integrated logos */}
                </motion.div>

                {/* Text Content - Only visible/expanded when active */}
                <div className={cn(
                  "overflow-hidden transition-all duration-500",
                  isActive ? "max-h-[200px] opacity-100" : "max-h-0 opacity-0"
                )}>
                  <h3 className="text-3xl font-bold text-white mb-2">{marketplace.name}</h3>
                  
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Badge variant="secondary" className="bg-white/10 text-white hover:bg-white/20 border-0">
                      {marketplace.region}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm text-gray-300">
                      {getStatusIcon(marketplace.status)}
                      <span>{marketplace.status.isConnected ? 'Conectado' : 'Desconectado'}</span>
                    </div>
                  </div>

                  <Button 
                    className="w-full bg-white text-black hover:bg-gray-200 transition-colors font-bold group"
                  >
                    Acessar Dashboard
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>

                {/* Vertical Text for Inactive State */}
                <div className={cn(
                  "absolute bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap transition-all duration-500",
                  isActive ? "opacity-0 translate-y-10" : "opacity-100 translate-y-0"
                )}>
                  <span className="text-white/80 font-medium tracking-wider text-sm uppercase">
                    {marketplace.name}
                  </span>
                </div>
              </div>
            </div>

            {/* Selection Indicator */}
            {isSelected && (
              <div className="absolute top-4 right-4">
                <div className="w-3 h-3 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.8)] animate-pulse" />
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
