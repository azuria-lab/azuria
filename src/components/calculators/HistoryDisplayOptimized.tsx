// Performance optimized history display with virtual scrolling
import React, { memo, useCallback, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Clock, TrendingDown, TrendingUp } from "lucide-react";
import { useVirtualScroll } from "@/hooks/useVirtualScroll";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { CalculationHistory } from "@/domains/calculator/types/calculator";

interface HistoryDisplayOptimizedProps {
  isPro: boolean;
  isSupabaseConfigured: boolean;
  history: CalculationHistory[];
  historyLoading: boolean;
  historyError: string | null;
  formatCurrency: (value: number) => string;
  onItemClick?: (item: CalculationHistory) => void;
  onDeleteItem?: (id: string) => void;
}

// Memoized history item component to prevent unnecessary re-renders
const HistoryItem = memo<{
  item: CalculationHistory;
  formatCurrency: (value: number) => string;
  offsetY: number;
  onItemClick?: (item: CalculationHistory) => void;
  onDeleteItem?: (id: string) => void;
}>(({ item, formatCurrency, offsetY, onItemClick, onDeleteItem }) => {
  const handleClick = useCallback(() => {
    onItemClick?.(item);
  }, [onItemClick, item]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteItem?.(item.id);
  }, [onDeleteItem, item.id]);

  const isHealthy = item.result.isHealthyProfit;
  const formattedDate = useMemo(() => 
    formatDistanceToNow(item.date, { addSuffix: true, locale: ptBR }),
    [item.date]
  );

  return (
    <div
      className="absolute w-full px-4"
      style={{ transform: `translateY(${offsetY}px)` }}
    >
      <Card 
        className="mb-3 cursor-pointer hover:shadow-md transition-all duration-200 hover-scale"
        onClick={handleClick}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={isHealthy ? "default" : "destructive"} className="text-xs">
                  {isHealthy ? (
                    <><TrendingUp className="w-3 h-3 mr-1" /> Saudável</>
                  ) : (
                    <><TrendingDown className="w-3 h-3 mr-1" /> Baixa</>
                  )}
                </Badge>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formattedDate}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Custo:</span>
                  <span className="ml-2 font-medium">R$ {formatCurrency(parseFloat(item.cost))}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Preço:</span>
                  <span className="ml-2 font-medium text-primary">
                    R$ {formatCurrency(item.result.sellingPrice)}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Margem:</span>
                  <span className="ml-2 font-medium">{item.margin}%</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Lucro:</span>
                  <span className={`ml-2 font-medium ${isHealthy ? 'text-green-600' : 'text-red-600'}`}>
                    R$ {formatCurrency(item.result.profit)}
                  </span>
                </div>
              </div>
            </div>
            
            {onDeleteItem && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

HistoryItem.displayName = "HistoryItem";

const HistoryDisplayOptimized = memo<HistoryDisplayOptimizedProps>(({
  isPro,
  isSupabaseConfigured,
  history,
  historyLoading,
  historyError,
  formatCurrency,
  onItemClick,
  onDeleteItem
}) => {
  // Virtual scrolling for performance with large history lists
  const virtualScroll = useVirtualScroll(history, {
    itemHeight: 120, // Approximate height of each history item
    containerHeight: 400, // Max height of history container
    overscan: 3
  });

  const renderHistoryItems = useCallback(() => {
    if (historyLoading) {
      return Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="mb-3">
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-24" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ));
    }

    if (history.length === 0) {
      return (
        <div className="text-center py-8">
          <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            Nenhum cálculo realizado ainda.
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Seus cálculos aparecerão aqui automaticamente.
          </p>
        </div>
      );
    }

    return (
      <div style={virtualScroll.containerStyle} onScroll={virtualScroll.handleScroll}>
        <div style={virtualScroll.innerStyle}>
          {virtualScroll.visibleItems.map(({ item, index: _index, offsetY }) => (
            <HistoryItem
              key={item.id}
              item={item}
              formatCurrency={formatCurrency}
              offsetY={offsetY}
              onItemClick={onItemClick}
              onDeleteItem={onDeleteItem}
            />
          ))}
        </div>
      </div>
    );
  }, [historyLoading, history, virtualScroll, formatCurrency, onItemClick, onDeleteItem]);

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Histórico de Cálculos
              {history.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {history.length}
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              <CardDescription>
                {isPro 
                  ? "Histórico sincronizado na nuvem" 
                  : "Histórico local (limitado)"
                }
              </CardDescription>
              {!isSupabaseConfigured && !historyLoading && (
                <Badge variant="outline">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Offline
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {historyError && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-destructive text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Erro ao carregar histórico: {historyError}
            </p>
          </div>
        )}
        
        {renderHistoryItems()}
      </CardContent>
    </Card>
  );
});

HistoryDisplayOptimized.displayName = "HistoryDisplayOptimized";

export default HistoryDisplayOptimized;