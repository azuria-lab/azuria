
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Share, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";

interface SwipeableHistoryItemProps {
  calculation: {
    id: string;
    productName: string;
    cost: number;
    sellingPrice: number;
    profit: number;
    margin: number;
    date: string;
  };
  onDelete: (id: string) => void;
  onShare?: (calculation: any) => void;
}

export default function SwipeableHistoryItem({
  calculation,
  onDelete,
  onShare
}: SwipeableHistoryItemProps) {
  const [isSwipedLeft, setIsSwipedLeft] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setCurrentX(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    const diffX = startX - currentX;
    
    if (diffX > 100) {
      setIsSwipedLeft(true);
    } else if (diffX < -50) {
      setIsSwipedLeft(false);
    }
    
    setStartX(0);
    setCurrentX(0);
  };

  const handleCopy = () => {
    const text = `${calculation.productName}: Custo R$ ${calculation.cost.toFixed(2)}, Venda R$ ${calculation.sellingPrice.toFixed(2)}, Lucro ${calculation.margin.toFixed(1)}%`;
    navigator.clipboard.writeText(text);
    toast.success("Cálculo copiado!");
  };

  const handleShare = () => {
  if (typeof navigator.share === 'function' && onShare) {
      onShare(calculation);
    } else {
      handleCopy();
    }
  };

  const handleDelete = () => {
    if (navigator.vibrate) {
      navigator.vibrate(100);
    }
    onDelete(calculation.id);
    toast.success("Cálculo removido!");
  };

  return (
    <div className="relative overflow-hidden">
      {/* Actions Background */}
      <div className={cn(
        "absolute right-0 top-0 h-full flex items-center gap-2 px-4 transition-transform duration-200",
        isSwipedLeft ? "translate-x-0" : "translate-x-full"
      )}>
        <Button
          size="sm"
          variant="outline"
          onClick={handleShare}
          className="h-12 w-12 p-0 bg-blue-100 border-blue-200 hover:bg-blue-200"
        >
          <Share className="h-4 w-4 text-blue-600" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleCopy}
          className="h-12 w-12 p-0 bg-green-100 border-green-200 hover:bg-green-200"
        >
          <Copy className="h-4 w-4 text-green-600" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleDelete}
          className="h-12 w-12 p-0 bg-red-100 border-red-200 hover:bg-red-200"
        >
          <Trash2 className="h-4 w-4 text-red-600" />
        </Button>
      </div>

      {/* Main Content */}
      <Card 
        className={cn(
          "transition-transform duration-200 touch-manipulation",
          isSwipedLeft ? "-translate-x-36" : "translate-x-0"
        )}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 mb-1">
                {calculation.productName}
              </h4>
              <p className="text-sm text-gray-500 mb-2">
                {new Date(calculation.date).toLocaleDateString()}
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Custo:</span>
                  <span className="ml-1 font-medium">R$ {calculation.cost.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-gray-500">Venda:</span>
                  <span className="ml-1 font-medium">R$ {calculation.sellingPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-green-600">
                {calculation.margin.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-500">
                R$ {calculation.profit.toFixed(2)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
