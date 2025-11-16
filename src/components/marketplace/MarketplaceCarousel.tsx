import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CheckCircle, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { MarketplaceConnectionStatus } from '@/types/marketplace-api';

export interface MarketplaceCard {
  id: string;
  name: string;
  logoUrl: string;
  status: MarketplaceConnectionStatus;
  color: string; // cor de tema do marketplace
  category: 'nacional' | 'internacional';
  region: string;
}

interface MarketplaceCarouselProps {
  marketplaces: MarketplaceCard[];
  onSelectMarketplace: (marketplaceId: string) => void;
  selectedMarketplaceId?: string;
  autoPlayInterval?: number; // ms
  className?: string;
}

export default function MarketplaceCarousel({
  marketplaces,
  onSelectMarketplace,
  selectedMarketplaceId,
  autoPlayInterval = 5000,
  className
}: Readonly<MarketplaceCarouselProps>) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % marketplaces.length);
  }, [marketplaces.length]);

  const handlePrev = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + marketplaces.length) % marketplaces.length);
  }, [marketplaces.length]);

  // AutoPlay
  useEffect(() => {
    if (!isPaused && marketplaces.length > 1) {
      intervalRef.current = setInterval(() => {
        handleNext();
      }, autoPlayInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPaused, currentIndex, marketplaces.length, autoPlayInterval, handleNext]);

  const handleDotClick = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  const getStatusIcon = (status: MarketplaceConnectionStatus) => {
    if (!status.isConnected) {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
    
    switch (status.syncStatus) {
      case 'syncing':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getStatusText = (status: MarketplaceConnectionStatus) => {
    if (!status.isConnected) {
      return 'Desconectado';
    }
    
    switch (status.syncStatus) {
      case 'syncing':
        return 'Sincronizando...';
      case 'success':
        return 'Conectado';
      case 'error':
        return 'Erro na sincronização';
      default:
        return 'Conectado';
    }
  };

  const getStatusBadgeVariant = (status: MarketplaceConnectionStatus) => {
    if (!status.isConnected) {
      return 'destructive';
    }
    
    switch (status.syncStatus) {
      case 'syncing':
        return 'default';
      case 'success':
        return 'default';
      case 'error':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8,
      rotateY: direction > 0 ? 45 : -45,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
      rotateY: 0,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8,
      rotateY: direction < 0 ? 45 : -45,
    }),
  };

  const currentMarketplace = marketplaces[currentIndex];

  if (!currentMarketplace) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Nenhum marketplace conectado
      </div>
    );
  }

  return (
    <section
      className={cn('relative w-full overflow-hidden py-8', className)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Carrossel de Marketplaces"
    >
      {/* Carrossel Principal - Mais alto e centralizado */}
      <div className="relative h-[360px] flex items-center justify-center perspective-1000">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
              scale: { duration: 0.3 },
              rotateY: { duration: 0.3 },
            }}
            className="absolute w-full max-w-4xl px-6"
          >
            <Card
              className={cn(
                'relative overflow-hidden transition-all duration-300 backdrop-blur-sm',
                'hover:shadow-2xl cursor-pointer border-2',
                selectedMarketplaceId === currentMarketplace.id 
                  ? 'ring-4 ring-brand-500/50 border-brand-500' 
                  : 'border-gray-200 hover:border-gray-300'
              )}
              style={{
                background: `linear-gradient(135deg, ${currentMarketplace.color}08 0%, white 50%, ${currentMarketplace.color}08 100%)`,
              }}
            >
              <div className="p-10">
                {/* Header com Logo Maior */}
                <div className="flex items-center justify-center mb-8">
                  <div className="flex flex-col items-center gap-6">
                    <div
                      className="w-32 h-32 rounded-2xl flex items-center justify-center shadow-2xl ring-4 ring-white"
                      style={{ 
                        backgroundColor: 'white',
                        boxShadow: `0 20px 60px -10px ${currentMarketplace.color}40`
                      }}
                    >
                      {currentMarketplace.logoUrl ? (
                        <img
                          src={currentMarketplace.logoUrl}
                          alt={currentMarketplace.name}
                          className="w-24 h-24 object-contain p-2"
                        />
                      ) : (
                        <span
                          className="text-4xl font-bold"
                          style={{ color: currentMarketplace.color }}
                        >
                          {currentMarketplace.name.charAt(0)}
                        </span>
                      )}
                    </div>

                    <div className="text-center">
                      <h3 className="text-3xl font-bold mb-2">
                        {currentMarketplace.name}
                      </h3>
                      <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
                        <Badge variant="outline" className="font-normal px-3 py-1">
                          {currentMarketplace.category === 'nacional' ? '🇧🇷 Nacional' : '🌎 Internacional'}
                        </Badge>
                        <span>•</span>
                        <span className="font-medium">{currentMarketplace.region}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Centralizado */}
                <div className="flex flex-col items-center gap-3 mb-6">
                  <Badge
                    variant={getStatusBadgeVariant(currentMarketplace.status)}
                    className="flex items-center gap-2 px-4 py-2 text-sm"
                  >
                    {getStatusIcon(currentMarketplace.status)}
                    {getStatusText(currentMarketplace.status)}
                  </Badge>
                  
                  {currentMarketplace.status.lastSync && (
                    <span className="text-xs text-muted-foreground">
                      Última sincronização: {new Date(currentMarketplace.status.lastSync).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  )}
                </div>

                {/* Erro Message */}
                {currentMarketplace.status.errorMessage && (
                  <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm text-center">
                    {currentMarketplace.status.errorMessage}
                  </div>
                )}

                {/* Ação Centralizada */}
                <div className="flex justify-center">
                  <Button
                    onClick={() => onSelectMarketplace(currentMarketplace.id)}
                    disabled={!currentMarketplace.status.isConnected}
                    size="lg"
                    className="group px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                    style={{
                      background: currentMarketplace.status.isConnected 
                        ? `linear-gradient(135deg, ${currentMarketplace.color} 0%, ${currentMarketplace.color}dd 100%)`
                        : undefined
                    }}
                  >
                    Ver Dashboard Completo
                    <motion.span
                      className="ml-2"
                      animate={{ x: [0, 4, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                      →
                    </motion.span>
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Botões de Navegação */}
        {marketplaces.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-0 z-10 h-12 w-12 rounded-full bg-background/80 backdrop-blur-sm shadow-lg hover:bg-background"
              onClick={handlePrev}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 z-10 h-12 w-12 rounded-full bg-background/80 backdrop-blur-sm shadow-lg hover:bg-background"
              onClick={handleNext}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </>
        )}
      </div>

      {/* Indicadores */}
      {marketplaces.length > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {marketplaces.map((marketplace, index) => (
            <button
              key={marketplace.id}
              onClick={() => handleDotClick(index)}
              className={cn(
                'h-2 rounded-full transition-all duration-300',
                index === currentIndex ? 'w-8 bg-brand-600' : 'w-2 bg-gray-300 hover:bg-gray-400'
              )}
              aria-label={`Ir para ${marketplace.name}`}
            />
          ))}
        </div>
      )}

      {/* Mini Preview Cards - Premium Style com Tooltips */}
      <TooltipProvider>
        <div className="mt-8 flex justify-center">
          <div className="inline-flex gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-200 shadow-inner">
            {marketplaces.map((marketplace, index) => (
              <Tooltip key={marketplace.id}>
                <TooltipTrigger asChild>
                  <motion.button
                    onClick={() => handleDotClick(index)}
                    className={cn(
                      'relative p-4 rounded-xl border-2 transition-all bg-white',
                      'hover:scale-110 hover:shadow-lg active:scale-95',
                      index === currentIndex
                        ? 'border-brand-500 shadow-lg ring-4 ring-brand-500/20'
                        : 'border-gray-200 hover:border-gray-300 shadow-sm'
                    )}
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div
                        className="w-16 h-16 rounded-xl flex items-center justify-center shadow-inner relative overflow-hidden"
                        style={{ 
                          backgroundColor: 'white',
                          border: `2px solid ${marketplace.color}20`
                        }}
                      >
                        {marketplace.logoUrl ? (
                          <img
                            src={marketplace.logoUrl}
                            alt={marketplace.name}
                            className="w-12 h-12 object-contain transition-transform group-hover:scale-110"
                          />
                        ) : (
                          <span
                            className="text-lg font-bold"
                            style={{ color: marketplace.color }}
                          >
                            {marketplace.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-semibold text-center line-clamp-1 min-w-[60px]">
                        {marketplace.name}
                      </span>
                      {/* Status Indicator Dot com Animação */}
                      <motion.div 
                        className={cn(
                          "w-2 h-2 rounded-full",
                          marketplace.status.isConnected ? "bg-green-500" : "bg-red-500"
                        )}
                        animate={marketplace.status.isConnected ? {
                          scale: [1, 1.2, 1],
                          opacity: [1, 0.8, 1]
                        } : {}}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                    </div>
                  </motion.button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-gray-900 text-white px-3 py-2">
                  <div className="text-center space-y-1">
                    <p className="font-semibold">{marketplace.name}</p>
                    <p className="text-xs text-gray-300">{marketplace.region}</p>
                    <p className="text-xs">
                      {marketplace.status.isConnected ? (
                        <span className="text-green-400">✓ Conectado</span>
                      ) : (
                        <span className="text-red-400">✗ Desconectado</span>
                      )}
                    </p>
                    {marketplace.status.lastSync && (
                      <p className="text-xs text-gray-400">
                        Última sync: {new Date(marketplace.status.lastSync).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>
      </TooltipProvider>
    </section>
  );
}
