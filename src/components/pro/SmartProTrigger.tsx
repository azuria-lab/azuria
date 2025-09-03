
import React, { useEffect, useState } from 'react';
import ContextualProBanner from './ContextualProBanner';

interface SmartProTriggerProps {
  children: React.ReactNode;
  trigger: 'calculator' | 'export' | 'history' | 'analytics' | 'general';
  feature?: string;
  showBannerAfter?: number; // milliseconds
  isPro?: boolean;
}

export default function SmartProTrigger({ 
  children, 
  trigger, 
  feature,
  showBannerAfter = 3000,
  isPro = false
}: SmartProTriggerProps) {
  const [showBanner, setShowBanner] = useState(false);
  const [interactionCount, setInteractionCount] = useState(0);

  useEffect(() => {
    // Não mostrar para usuários PRO
    if (isPro) {return;}

    // Recuperar contagem de interações do localStorage
    const storageKey = `pro-trigger-${trigger}`;
    const savedCount = parseInt(localStorage.getItem(storageKey) || '0');
    setInteractionCount(savedCount);

    // Mostrar banner após interações ou tempo
    if (savedCount >= 2) {
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, showBannerAfter);

      return () => clearTimeout(timer);
    }
  }, [trigger, showBannerAfter, isPro]);

  const handleInteraction = () => {
    if (isPro) {return;}

    const newCount = interactionCount + 1;
    setInteractionCount(newCount);
    
    const storageKey = `pro-trigger-${trigger}`;
    localStorage.setItem(storageKey, newCount.toString());

    // Mostrar banner após 3 interações
    if (newCount >= 3) {
      setTimeout(() => {
        setShowBanner(true);
      }, 1000);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    // Aguardar mais interações antes de mostrar novamente
    const storageKey = `pro-trigger-${trigger}`;
    localStorage.setItem(storageKey, '0');
    setInteractionCount(0);
  };

  return (
    <div>
      <div onClick={handleInteraction}>
        {children}
      </div>
      
      {showBanner && !isPro && (
        <div className="mt-4">
          <ContextualProBanner
            trigger={trigger}
            feature={feature}
            onDismiss={handleDismiss}
            compact
          />
        </div>
      )}
    </div>
  );
}
