
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useHeatmap } from '@/hooks/useHeatmap';
import { Eye, Mouse, Scroll, Thermometer } from 'lucide-react';

type ViewMode = 'clicks' | 'hovers' | 'scroll';

export const HeatmapVisualization: React.FC = () => {
  const { getHeatmapData, getScrollAnalytics } = useHeatmap();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('clicks');
  const [pageFilter, setPageFilter] = useState<string>('all');
  
  const heatmapData = getHeatmapData(pageFilter === 'all' ? undefined : pageFilter);
  const scrollData = getScrollAnalytics();

  // Get unique pages for filter
  const uniquePages = useMemo(
    () => Array.from(new Set(getHeatmapData().map(point => point.pageUrl))),
    [getHeatmapData]
  );

  const drawHeatmap = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) {return;}

    const ctx = canvas.getContext('2d');
    if (!ctx) {return;}

    // Set canvas size to match viewport
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Filter data based on view mode
    const filteredData = heatmapData.filter(point => {
      if (viewMode === 'clicks') {return point.type === 'click';}
      if (viewMode === 'hovers') {return point.type === 'hover';}
      return true;
    });

    if (filteredData.length === 0) {return;}

    // Create heatmap
    filteredData.forEach(point => {
      const intensity = viewMode === 'clicks' ? 0.8 : 0.3;
      const radius = viewMode === 'clicks' ? 25 : 15;
      
      // Create radial gradient
      const gradient = ctx.createRadialGradient(
        point.x, point.y, 0,
        point.x, point.y, radius
      );
      
      if (viewMode === 'clicks') {
        gradient.addColorStop(0, `rgba(255, 0, 0, ${intensity})`);
        gradient.addColorStop(0.5, `rgba(255, 100, 0, ${intensity * 0.5})`);
        gradient.addColorStop(1, 'rgba(255, 255, 0, 0)');
      } else {
        gradient.addColorStop(0, `rgba(0, 100, 255, ${intensity})`);
        gradient.addColorStop(0.5, `rgba(0, 200, 255, ${intensity * 0.5})`);
        gradient.addColorStop(1, 'rgba(100, 255, 255, 0)');
      }

      ctx.fillStyle = gradient;
      ctx.globalCompositeOperation = 'multiply';
      ctx.beginPath();
      ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
      ctx.fill();
    });
  }, [heatmapData, viewMode]);

  useEffect(() => {
    drawHeatmap();
  }, [drawHeatmap]);

  const exportHeatmapData = () => {
    const data = {
      heatmapData: getHeatmapData(),
      scrollData: getScrollAnalytics(),
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `heatmap-data-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Thermometer className="h-5 w-5" />
            Heatmap de Interações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4 flex-wrap">
            <Select value={viewMode} onValueChange={(value: ViewMode) => setViewMode(value)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Tipo de visualização" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="clicks">
                  <div className="flex items-center gap-2">
                    <Mouse className="h-4 w-4" />
                    Cliques
                  </div>
                </SelectItem>
                <SelectItem value="hovers">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Hover
                  </div>
                </SelectItem>
                <SelectItem value="scroll">
                  <div className="flex items-center gap-2">
                    <Scroll className="h-4 w-4" />
                    Scroll
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            <Select value={pageFilter} onValueChange={setPageFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por página" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as páginas</SelectItem>
                {uniquePages.map(page => (
                  <SelectItem key={page} value={page}>
                    {page === '/' ? 'Home' : page}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={exportHeatmapData} variant="outline">
              Exportar Dados
            </Button>
          </div>

          <div className="relative">
            <canvas
              ref={canvasRef}
              className="border rounded-lg max-w-full h-96 bg-gray-50"
              style={{ 
                width: '100%', 
                height: '400px',
                objectFit: 'contain' 
              }}
            />
            
            {heatmapData.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg">
                <p className="text-gray-500">Nenhum dado de heatmap disponível</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Scroll Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scroll className="h-5 w-5" />
            Análise de Scroll
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800">Scroll Máximo</h4>
              <p className="text-2xl font-bold text-blue-600">
                {scrollData.maxScrollReached.toFixed(1)}%
              </p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-800">Scroll Médio</h4>
              <p className="text-2xl font-bold text-green-600">
                {scrollData.averageScrollDepth.toFixed(1)}%
              </p>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-semibold text-purple-800">Eventos de Scroll</h4>
              <p className="text-2xl font-bold text-purple-600">
                {scrollData.scrollEvents.length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Estatísticas de Interação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {heatmapData.filter(p => p.type === 'click').length}
              </p>
              <p className="text-sm text-gray-600">Total de Cliques</p>
            </div>
            
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {heatmapData.filter(p => p.type === 'hover').length}
              </p>
              <p className="text-sm text-gray-600">Eventos de Hover</p>
            </div>
            
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {uniquePages.length}
              </p>
              <p className="text-sm text-gray-600">Páginas Rastreadas</p>
            </div>
            
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {Array.from(new Set(heatmapData.map(p => p.sessionId))).length}
              </p>
              <p className="text-sm text-gray-600">Sessões Únicas</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
