
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage?: number;
  navigationTiming?: PerformanceNavigationTiming;
}

export const PerformanceDebugger: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const startTime = performance.now();
    
    // Measure initial render time
    const measureRender = () => {
      const renderTime = performance.now() - startTime;
      
      // Get navigation timing
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const loadTime = navigation ? navigation.loadEventEnd - navigation.loadEventStart : 0;
      
      // Get memory usage if available
      const memory = (performance as any).memory;
      const memoryUsage = memory ? memory.usedJSHeapSize / 1048576 : undefined; // MB
      
      setMetrics({
        loadTime,
        renderTime,
        memoryUsage,
        navigationTiming: navigation
      });
    };

    // Measure after component mount
    setTimeout(measureRender, 100);
    
    // Show debugger only in development or with URL param
    const showDebugger = process.env.NODE_ENV === 'development' || 
                         new URLSearchParams(window.location.search).has('debug');
    setIsVisible(showDebugger);
  }, []);

  if (!isVisible) {return null;}

  const getPerformanceColor = (time: number, threshold: number) => {
    if (time < threshold) {return 'bg-green-100 text-green-800';}
    if (time < threshold * 2) {return 'bg-yellow-100 text-yellow-800';}
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card className="bg-white/95 backdrop-blur shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            🚀 Performance Debug
            <button 
              onClick={() => setIsVisible(false)}
              className="ml-auto text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <span>Render Time:</span>
            <Badge className={getPerformanceColor(metrics.renderTime, 100)}>
              {metrics.renderTime.toFixed(2)}ms
            </Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <span>Load Time:</span>
            <Badge className={getPerformanceColor(metrics.loadTime, 3000)}>
              {metrics.loadTime.toFixed(2)}ms
            </Badge>
          </div>
          
          {metrics.memoryUsage && (
            <div className="flex justify-between items-center">
              <span>Memory:</span>
              <Badge className={getPerformanceColor(metrics.memoryUsage, 50)}>
                {metrics.memoryUsage.toFixed(1)}MB
              </Badge>
            </div>
          )}
          
          {metrics.navigationTiming && (
            <div className="text-gray-500 text-xs pt-2 border-t">
              <div>DNS: {(metrics.navigationTiming.domainLookupEnd - metrics.navigationTiming.domainLookupStart).toFixed(0)}ms</div>
              <div>Connect: {(metrics.navigationTiming.connectEnd - metrics.navigationTiming.connectStart).toFixed(0)}ms</div>
              <div>DOM Ready: {(metrics.navigationTiming.domContentLoadedEventEnd - metrics.navigationTiming.fetchStart).toFixed(0)}ms</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
