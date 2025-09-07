
import React, { useEffect, useState } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface ContextualTooltipProps {
  title: string;
  content: string;
  children: React.ReactNode;
  showAfterDelay?: number;
  position?: 'top' | 'bottom' | 'left' | 'right';
  persistent?: boolean;
}

export default function ContextualTooltip({
  title,
  content,
  children,
  showAfterDelay = 3000,
  position = 'top',
  persistent = false
}: ContextualTooltipProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasInteracted && !persistent) {
        setShowTooltip(true);
      }
    }, showAfterDelay);

    return () => clearTimeout(timer);
  }, [showAfterDelay, hasInteracted, persistent]);

  const handleInteraction = () => {
    setHasInteracted(true);
    setShowTooltip(false);
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
    if (persistent) {
      setShowTooltip(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    if (persistent && !showTooltip) {
      setShowTooltip(false);
    }
  };

  return (
    <TooltipProvider>
      <div 
        className="relative"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleInteraction}
      >
        <Tooltip open={showTooltip || isHovering}>
          <TooltipTrigger asChild>
            <div className="relative">
              {children}
              
              {/* Indicador visual para tooltips contextuais */}
              <AnimatePresence>
                {showTooltip && !hasInteracted && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute -top-1 -right-1"
                  >
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </TooltipTrigger>
          
          <TooltipContent side={position} className="max-w-xs p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">{title}</h4>
                {persistent && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowTooltip(false)}
                    className="h-4 w-4 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{content}</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
