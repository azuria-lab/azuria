import React, { useCallback, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ResizeObserverEntryInfo, useElementSize, useResizeObserver } from '@/shared/hooks/useResizeObserver';
import { 
  Activity,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw
} from 'lucide-react';

interface ResizeData {
  width: number;
  height: number;
  timestamp: number;
  id: string;
}

/**
 * Componente para demonstrar o ResizeObserver
 */
export const ResizeObserverDemo: React.FC = () => {
  const [resizeHistory, setResizeHistory] = useState<ResizeData[]>([]);
  const [containerWidth, setContainerWidth] = useState([300]);
  const [containerHeight, setContainerHeight] = useState([200]);
  const [isObserverPaused, setIsObserverPaused] = useState(false);
  const [showDebugInfo, setShowDebugInfo] = useState(true);

  // Handler para mudanças de resize
  const handleResize = useCallback((entry: ResizeObserverEntryInfo) => {
    const newResize: ResizeData = {
      width: Math.round(entry.width),
      height: Math.round(entry.height),
      timestamp: Date.now(),
      id: Date.now().toString()
    };
    
    setResizeHistory(prev => [newResize, ...prev.slice(0, 9)]); // Mantém apenas 10 últimos
  }, []);

  // ResizeObserver customizado para container principal
  const { 
    ref: observedRef, 
    pause, 
    resume, 
    reconnect, 
    isObserving,
    cleanup 
  } = useResizeObserver<HTMLDivElement>(handleResize, {
    debounceMs: 100, // 100ms debounce
    disabled: isObserverPaused
  });

  // Hook simplificado para dimensões do card  
  const { 
    ref: cardRef, 
    dimensions: { width: cardWidth, height: cardHeight }
  } = useElementSize();

  // Controles do observer
  const toggleObserver = useCallback(() => {
    if (isObserverPaused) {
      resume();
      setIsObserverPaused(false);
    } else {
      pause();
      setIsObserverPaused(true);
    }
  }, [isObserverPaused, pause, resume]);

  const handleReconnect = useCallback(() => {
    reconnect();
    setResizeHistory([]);
  }, [reconnect]);

  const clearHistory = useCallback(() => {
    setResizeHistory([]);
  }, []);

  const resetSize = useCallback(() => {
    setContainerWidth([300]);
    setContainerHeight([200]);
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="h-6 w-6" />
            ResizeObserver Demo
          </h1>
          <p className="text-muted-foreground">
            Demonstração robusta de ResizeObserver com debouncing e cleanup
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant={isObserving ? 'default' : 'secondary'}>
            {isObserving ? 'Observing' : 'Paused'}
          </Badge>
          
          <Button
            onClick={() => setShowDebugInfo(!showDebugInfo)}
            variant="outline"
            size="sm"
          >
            {showDebugInfo ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Controles */}
      <Card>
        <CardHeader>
          <CardTitle>Observer Controls</CardTitle>
          <CardDescription>
            Controle o comportamento do ResizeObserver
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              onClick={toggleObserver}
              variant={isObserverPaused ? 'default' : 'secondary'}
            >
              {isObserverPaused ? (
                <Play className="h-4 w-4 mr-2" />
              ) : (
                <Pause className="h-4 w-4 mr-2" />
              )}
              {isObserverPaused ? 'Resume' : 'Pause'} Observer
            </Button>
            
            <Button onClick={handleReconnect} variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reconnect
            </Button>
            
            <Button onClick={clearHistory} variant="outline">
              Clear History
            </Button>
            
            <Button onClick={resetSize} variant="outline">
              <Minimize2 className="h-4 w-4 mr-2" />
              Reset Size
            </Button>
          </div>

          {/* Size Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Width: {containerWidth[0]}px
              </label>
              <Slider
                value={containerWidth}
                onValueChange={setContainerWidth}
                max={600}
                min={200}
                step={10}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Height: {containerHeight[0]}px
              </label>
              <Slider
                value={containerHeight}
                onValueChange={setContainerHeight}
                max={400}
                min={100}
                step={10}
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Container Observado */}
      <Card ref={cardRef}>
        <CardHeader>
          <CardTitle>Observed Container</CardTitle>
          <CardDescription>
            Este container está sendo observado pelo ResizeObserver
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            ref={observedRef}
            className="border-2 border-dashed border-primary/30 bg-primary/5 p-4 rounded-lg transition-all duration-200 flex items-center justify-center"
            style={{
              width: `${containerWidth[0]}px`,
              height: `${containerHeight[0]}px`
            }}
          >
            <div className="text-center">
              <Maximize2 className="h-8 w-8 mx-auto mb-2 text-primary/60" />
              <p className="text-sm font-medium">Resizable Container</p>
              <p className="text-xs text-muted-foreground mt-1">
                {containerWidth[0]}px × {containerHeight[0]}px
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Debug Info */}
      {showDebugInfo && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Resize History */}
          <Card>
            <CardHeader>
              <CardTitle>Resize History</CardTitle>
              <CardDescription>
                Últimas {Math.min(resizeHistory.length, 10)} mudanças de tamanho (debounced 100ms)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {resizeHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-8 w-8 mx-auto mb-2" />
                  <p>Nenhuma mudança de resize detectada</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {resizeHistory.map((resize, index) => (
                    <div
                      key={resize.id}
                      className="flex items-center justify-between p-2 border rounded"
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">#{index + 1}</Badge>
                        <span className="font-mono text-sm">
                          {resize.width}×{resize.height}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(resize.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Observer Status */}
          <Card>
            <CardHeader>
              <CardTitle>Observer Status</CardTitle>
              <CardDescription>
                Informações sobre o estado do ResizeObserver
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Status:</span>
                  <Badge variant={isObserving ? 'default' : 'secondary'}>
                    {isObserving ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                
                <div className="flex justify-between">
                  <span>Debounce Delay:</span>
                  <span className="font-mono">100ms</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Paused:</span>
                  <Badge variant={isObserverPaused ? 'destructive' : 'secondary'}>
                    {isObserverPaused ? 'Yes' : 'No'}
                  </Badge>
                </div>
                
                <div className="flex justify-between">
                  <span>Total Resizes:</span>
                  <span className="font-mono">{resizeHistory.length}</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Card Dimensions</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Width:</span>
                    <span className="font-mono">{Math.round(cardWidth)}px</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Height:</span>
                    <span className="font-mono">{Math.round(cardHeight)}px</span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <Button
                  onClick={cleanup}
                  variant="destructive"
                  size="sm"
                  className="w-full"
                >
                  Force Cleanup Observer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ResizeObserverDemo;