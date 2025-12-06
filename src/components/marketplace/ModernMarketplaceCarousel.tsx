import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
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
  // Find index of selected marketplace or default to middle
  const initialIndex = selectedMarketplaceId 
    ? marketplaces.findIndex(m => m.id === selectedMarketplaceId)
    : Math.floor(marketplaces.length / 2);

  const [activeIndex, setActiveIndex] = useState(Math.max(0, initialIndex));

  // Sync active index if prop changes
  useEffect(() => {
    if (selectedMarketplaceId) {
      const index = marketplaces.findIndex(m => m.id === selectedMarketplaceId);
      if (index >= 0) {setActiveIndex(index);}
    }
  }, [selectedMarketplaceId, marketplaces]);

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % marketplaces.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + marketplaces.length) % marketplaces.length);
  };

  const handleCardClick = (index: number, id: string) => {
    if (index === activeIndex) {
        // If clicking the active card, trigger selection
        onSelectMarketplace(id);
    } else {
        // If clicking a side card, center it
        setActiveIndex(index);
    }
  };

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

  return (
    <div className={cn("relative w-full h-[600px] flex flex-col items-center justify-center bg-[#F3FAFF] dark:bg-gray-900 overflow-hidden perspective-1000", className)}>
        
        {/* Navigation Buttons */}
        <Button 
            variant="ghost" 
            size="icon" 
            className="absolute left-4 z-50 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-slate-800 dark:text-white"
            onClick={handlePrev}
        >
            <ChevronLeft className="h-8 w-8" />
        </Button>
        <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-4 z-50 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-slate-800 dark:text-white"
            onClick={handleNext}
        >
            <ChevronRight className="h-8 w-8" />
        </Button>

        {/* 3D Carousel Container */}
        <div className="relative w-full max-w-5xl h-[450px] flex items-center justify-center">
            <AnimatePresence>
                {marketplaces.map((marketplace, index) => {
                    // Calculate relative position to active index
                    // We want circular behavior for smooth flow
                    let offset = index - activeIndex;
                    
                    // Logic to handle wrapping for infinite-like feel visualization
                    // If offset is too large, wrap it around
                    if (offset > marketplaces.length / 2) {offset -= marketplaces.length;}
                    if (offset < -marketplaces.length / 2) {offset += marketplaces.length;}

                    const isActive = index === activeIndex;
                    
                    // Only render cards that are visible (e.g., active + 2 on each side)
                    // But for this specific effect we might want to render all but style them
                    // Let's render visible range to save performance if list is huge, 
                    // but for 8 items, rendering all is fine.
                    const isVisible = Math.abs(offset) <= 2; 

                    if (!isVisible) {return null;}

                    return (
                        <motion.div
                            key={marketplace.id}
                            layout
                            initial={false}
                            animate={{
                                x: offset * 220, // Horizontal spacing
                                y: Math.abs(offset) * 10, // Slight curve downwards for side items if desired, or 0
                                scale: 1 - Math.abs(offset) * 0.15, // Scale down side cards
                                zIndex: 50 - Math.abs(offset), // Depth sorting
                                rotateY: offset * -25, // Rotate inwards
                                opacity: 1 - Math.abs(offset) * 0.3, // Fade out side cards
                                filter: isActive ? 'blur(0px)' : 'blur(2px)', // Blur inactive
                            }}
                            transition={{
                                type: "spring",
                                stiffness: 200,
                                damping: 25
                            }}
                            onClick={() => handleCardClick(index, marketplace.id)}
                            className={cn(
                                "absolute w-[300px] h-[420px] rounded-3xl overflow-hidden cursor-pointer shadow-2xl origin-bottom",
                                isActive ? "cursor-default" : "cursor-pointer hover:brightness-110"
                            )}
                            style={{
                                transformStyle: 'preserve-3d',
                            }}
                        >
                            {/* Card Content - Reusing the clean design */}
                            
                            {/* Background Image */}
                            <div 
                                className="absolute inset-0 bg-cover bg-center"
                                style={{ 
                                    backgroundImage: `url(${getBackgroundImage(marketplace.id)})`,
                                    transform: 'scale(1.05)' // Slight zoom to avoid edges
                                }}
                            />

                            {/* Gradient Overlay for Text Readability */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80" />

                            {/* Content */}
                            <div className="absolute inset-0 flex flex-col justify-end p-6 z-10">
                                <motion.div 
                                    className="flex flex-col items-center text-center space-y-3"
                                    animate={{
                                        opacity: isActive ? 1 : 0,
                                        y: isActive ? 0 : 20
                                    }}
                                >
                                    {/* Marketplace Name */}
                                    <h3 className="text-2xl font-bold text-white shadow-black/50 drop-shadow-lg">
                                        {marketplace.name}
                                    </h3>

                                    {/* Status Badge */}
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary" className="bg-white/10 backdrop-blur-md text-white border-0">
                                            {marketplace.region}
                                        </Badge>
                                        <div className="flex items-center gap-1 text-xs text-gray-200 bg-black/40 px-2 py-1 rounded-full backdrop-blur-sm">
                                            {getStatusIcon(marketplace.status)}
                                            <span>{marketplace.status.isConnected ? 'Conectado' : 'Conectar'}</span>
                                        </div>
                                    </div>

                                    {/* Action Button - Only visible on active card */}
                                    {isActive && (
                                        <Button 
                                            size="sm"
                                            className="w-full mt-4 bg-white text-black hover:bg-gray-100 font-bold transition-transform shadow-lg hover:scale-105"
                                            onClick={(e) => {
                                                e.stopPropagation(); // Prevent card click
                                                onSelectMarketplace(marketplace.id);
                                            }}
                                        >
                                            Acessar
                                            <ArrowRight className="w-3 h-3 ml-2" />
                                        </Button>
                                    )}
                                </motion.div>
                            </div>
                        
                            {/* Logo "Reflection" or Glass effect could go here if requested, 
                                but user wanted clean visuals. */}
                            
                            {/* Hover Highlight (Outer Glow) */}
                            {isActive && (
                                <div className="absolute inset-0 border-2 border-white/20 rounded-3xl pointer-events-none" />
                            )}
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>

        {/* Dots Indicator */}
        <div className="absolute bottom-8 flex gap-2 z-10">
            {marketplaces.map((_, index) => (
                <button
                    key={index}
                    onClick={() => setActiveIndex(index)}
                    className={cn(
                        "w-2 h-2 rounded-full transition-all duration-300",
                        index === activeIndex 
                            ? "w-8 bg-blue-500" 
                            : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400"
                    )}
                />
            ))}
        </div>
    </div>
  );
}
