
import React, { useCallback, useRef, useState } from "react";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobilePullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  threshold?: number;
  disabled?: boolean;
}

export default function MobilePullToRefresh({
  onRefresh,
  children,
  threshold = 80,
  disabled = false
}: MobilePullToRefreshProps) {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled || isRefreshing) {return;}
    
    const container = containerRef.current;
    if (!container || container.scrollTop > 0) {return;}
    
    startY.current = e.touches[0].clientY;
    setIsPulling(true);
  }, [disabled, isRefreshing]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling || disabled || isRefreshing) {return;}
    
    const container = containerRef.current;
    if (!container || container.scrollTop > 0) {return;}
    
    const currentY = e.touches[0].clientY;
    const distance = Math.max(0, currentY - startY.current);
    
    if (distance > 0) {
      e.preventDefault();
      setPullDistance(Math.min(distance * 0.5, threshold * 1.5));
    }
  }, [isPulling, threshold, disabled, isRefreshing]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling || disabled) {return;}
    
    setIsPulling(false);
    
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      
      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
      
      try {
        await onRefresh();
      } finally {
        setTimeout(() => {
          setIsRefreshing(false);
          setPullDistance(0);
        }, 500);
      }
    } else {
      setPullDistance(0);
    }
  }, [isPulling, pullDistance, threshold, onRefresh, disabled, isRefreshing]);

  const isTriggered = pullDistance >= threshold;
  const progress = Math.min(pullDistance / threshold, 1);

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to Refresh Indicator */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 z-10 flex items-center justify-center transition-transform duration-200",
          "bg-white border-b border-gray-200"
        )}
        style={{
          height: Math.max(pullDistance, isRefreshing ? 60 : 0),
          transform: `translateY(${isRefreshing ? 0 : -60 + pullDistance}px)`
        }}
      >
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <RefreshCw 
            className={cn(
              "h-4 w-4 transition-transform duration-200",
              (isRefreshing || isTriggered) && "animate-spin"
            )}
            style={{
              transform: `rotate(${progress * 180}deg)`
            }}
          />
          <span>
            {isRefreshing 
              ? "Atualizando..." 
              : isTriggered 
                ? "Solte para atualizar" 
                : "Puxe para atualizar"
            }
          </span>
        </div>
      </div>

      {/* Content */}
      <div
        className="transition-transform duration-200"
        style={{
          transform: `translateY(${isRefreshing ? 60 : pullDistance}px)`
        }}
      >
        {children}
      </div>
    </div>
  );
}
