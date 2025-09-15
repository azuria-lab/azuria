import React, { useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { BackgroundSyncService, getBackgroundSyncService } from '@/services/backgroundSyncService';

interface BackgroundSyncManagerProps {
  children: React.ReactNode;
}

export const BackgroundSyncManager: React.FC<BackgroundSyncManagerProps> = ({ children }) => {
  const { toast } = useToast();
  const serviceRef = useRef<BackgroundSyncService>();

  useEffect(() => {
    // Inicializar serviço
    serviceRef.current = getBackgroundSyncService();

    // Mostrar status de sync
    const handleOnline = () => {
      const pendingCount = serviceRef.current?.getPendingCount() || 0;
      if (pendingCount > 0) {
        toast({
          title: "🌐 Conectado",
          description: `Sincronizando ${pendingCount} item(s) pendente(s)...`,
          duration: 3000,
        });
      }
    };

    const handleOffline = () => {
      toast({
        title: "📴 Sem conexão",
        description: "Os dados serão sincronizados quando voltar online",
        duration: 3000,
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      serviceRef.current?.destroy();
    };
  }, [toast]);

  return <>{children}</>;
};
