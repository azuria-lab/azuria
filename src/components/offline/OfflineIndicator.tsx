import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Database, HardDrive, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { useOfflineCalculator } from '@/hooks/useOfflineCalculator';
import { AnimatePresence, motion } from 'framer-motion';

interface OfflineIndicatorProps {
  showDetails?: boolean;
  className?: string;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ 
  showDetails = false, 
  className = "" 
}) => {
  const { 
    isOffline, 
    isLoading, 
    clearOfflineData, 
    getOfflineStats 
  } = useOfflineCalculator();
  
  const stats = getOfflineStats();

  if (!showDetails && !isOffline) {return null;}

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <Card className={`border-2 ${
        isOffline 
          ? 'border-amber-200 bg-amber-50' 
          : 'border-green-200 bg-green-50'
      }`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isOffline ? (
                <WifiOff className="h-5 w-5 text-amber-600" />
              ) : (
                <Wifi className="h-5 w-5 text-green-600" />
              )}
              
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">
                    {isOffline ? 'Modo Offline' : 'Online'}
                  </span>
                  <Badge variant={isOffline ? 'secondary' : 'default'} className="text-xs">
                    {isOffline ? 'Sem conexão' : 'Conectado'}
                  </Badge>
                </div>
                
                <p className="text-xs text-muted-foreground mt-1">
                  {isOffline 
                    ? 'Seus cálculos estão sendo salvos localmente'
                    : 'Dados sincronizados com a nuvem'
                  }
                </p>
              </div>
            </div>

            {showDetails && (
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="flex items-center gap-1 text-xs">
                    <Database className="h-3 w-3" />
                    <span>{stats.total} cálculos</span>
                  </div>
                  {stats.unsynced > 0 && (
                    <div className="flex items-center gap-1 text-xs text-amber-600">
                      <HardDrive className="h-3 w-3" />
                      <span>{stats.unsynced} não sincronizados</span>
                    </div>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearOfflineData}
                  disabled={isLoading}
                  className="h-8"
                >
                  {isLoading ? (
                    <RefreshCw className="h-3 w-3 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3 w-3" />
                  )}
                </Button>
              </div>
            )}
          </div>

          <AnimatePresence>
            {showDetails && stats.unsynced > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 pt-3 border-t border-amber-200"
              >
                <div className="flex items-center justify-between">
                  <div className="text-xs text-amber-700">
                    <strong>{stats.unsynced}</strong> cálculos serão sincronizados quando a conexão for restaurada
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default OfflineIndicator;