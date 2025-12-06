/**
 * Azuria AI Provider
 * 
 * Provider component that wraps the app and provides the God Mode UI.
 * Includes the floating bubble, mini dashboard, and toast notifications.
 */

import React, { useState, useEffect } from 'react';
import { AzuriaBubble } from './AzuriaBubble';
import { MiniDashboard } from './MiniDashboard';
import { InsightToastContainer } from './InsightToast';
import * as proactiveEngine from '../core/proactiveEngine';

export interface AzuriaAIProviderProps {
  children: React.ReactNode;
  userId?: string;
  enabled?: boolean;
}

export const AzuriaAIProvider: React.FC<AzuriaAIProviderProps> = ({
  children,
  userId,
  enabled = true,
}) => {
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);

  // Inicializar e limpar proactive engine
  useEffect(() => {
    if (enabled) {
      // Iniciar motor proativo
      proactiveEngine.start();

      return () => {
        // Parar motor proativo ao desmontar
        proactiveEngine.stop();
      };
    }
  }, [enabled]);

  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      
      {/* Floating Bubble */}
      <AzuriaBubble
        onOpen={() => setIsDashboardOpen(true)}
        status="online"
      />

      {/* Mini Dashboard */}
      <MiniDashboard
        isOpen={isDashboardOpen}
        onClose={() => setIsDashboardOpen(false)}
        userId={userId}
      />

      {/* Toast Notifications */}
      <InsightToastContainer />
    </>
  );
};

export default AzuriaAIProvider;
