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
            onClick={handlePrev}
        >
            <ChevronLeft className="h-5 w-5" />
        </Button>
        <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-4 z-50 rounded-full bg-background/80 hover:bg-background border border-border/50 backdrop-blur-sm text-foreground shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
            onClick={handleNext}
        >
            <ChevronRight className="h-5 w-5" />
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
                                opacity: 1 - Math.abs(offset) * 0.25, // Fade out side cards
                                filter: isActive ? 'blur(0px)' : 'blur(1px)', // Subtle blur for inactive cards
                            }}
                            transition={{
                                type: "spring",
                                stiffness: 200,
                                damping: 25
                            }}
                            onClick={() => handleCardClick(index, marketplace.id)}
                            className={cn(
                                "absolute w-[300px] h-[420px] rounded-2xl overflow-hidden cursor-pointer origin-bottom",
                                isActive 
                                    ? "cursor-default shadow-2xl ring-2 ring-primary/20" 
                                    : "cursor-pointer shadow-lg hover:shadow-xl hover:ring-1 hover:ring-border/50 transition-all duration-300"
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

                            {/* Premium Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/10" />
                            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/20" />

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
                                    <h3 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight drop-shadow-2xl">
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

                                    {/* Action Button - Only visible on active card */}
                                    {isActive && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 }}
                                        >
                                            <Button 
                                                size="sm"
                                                className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] min-h-[44px]"
                                                onClick={(e) => {
                                                    e.stopPropagation(); // Prevent card click
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
                        
                            {/* Logo "Reflection" or Glass effect could go here if requested, 
                                but user wanted clean visuals. */}
                            
                            {/* Premium Active Indicator */}
                            {isActive && (
                                <motion.div 
                                    className="absolute inset-0 border-2 border-primary/30 rounded-2xl pointer-events-none"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                />
                            )}
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>

        {/* Premium Dots Indicator */}
        <div className="absolute bottom-6 flex items-center gap-2 z-10 px-4 py-2 rounded-full bg-background/80 backdrop-blur-md border border-border/50 shadow-lg">
            {marketplaces.map((_, index) => (
                <button
                    key={index}
                    onClick={() => setActiveIndex(index)}
                    className={cn(
                        "rounded-full transition-all duration-300 ease-out",
                        index === activeIndex 
                            ? "w-8 h-2 bg-primary shadow-md" 
                            : "w-2 h-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                    )}
                    aria-label={`Ir para marketplace ${index + 1}`}
                />
            ))}
        </div>
    </div>
  );
}
