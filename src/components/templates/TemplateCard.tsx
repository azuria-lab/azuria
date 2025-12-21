import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CalculationTemplate } from '@/types/templates';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Heart, Play, Star } from 'lucide-react';
import { formatCurrency } from '@/utils/calculator/formatCurrency';
import { cn } from '@/lib/utils';

interface TemplateCardProps {
  template: CalculationTemplate;
  onSelect?: (template: CalculationTemplate) => void;
  isPurchased?: boolean;
  calculatorType?: 'rapid' | 'advanced';
}

export default function TemplateCard({ 
  template, 
  onSelect, 
  isPurchased = false,
  calculatorType = 'rapid'
}: TemplateCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const imageUrl = template.image_url || `https://via.placeholder.com/300x450/1a1a1a/ffffff?text=${encodeURIComponent(template.name)}`;

  return (
    <motion.div
      className="relative flex-shrink-0 w-[300px] cursor-pointer"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative group">
        {/* Card Image */}
        <div className="relative w-full h-[450px] rounded-lg overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
          {template.image_url ? (
            <img
              src={imageUrl}
              alt={template.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-600/20 to-brand-800/20">
              <div className="text-center p-6">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-white font-semibold text-lg">{template.name}</h3>
              </div>
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Hover Content */}
          <motion.div
            className="absolute inset-0 p-4 flex flex-col justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            initial={false}
            animate={{ opacity: isHovered ? 1 : 0 }}
          >
            {/* Top Actions */}
            <div className="flex justify-between items-start">
              <Badge 
                variant={template.is_premium ? "default" : "secondary"}
                className={cn(
                  "text-xs",
                  template.is_premium && "bg-gradient-to-r from-amber-500 to-orange-500"
                )}
              >
                {template.is_premium ? 'Premium' : 'Gratuito'}
              </Badge>
              
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full bg-black/50 hover:bg-black/70"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFavorite(!isFavorite);
                }}
              >
                <Heart className={cn("h-4 w-4", isFavorite && "fill-red-500 text-red-500")} />
              </Button>
            </div>

            {/* Bottom Content */}
            <div className="space-y-3">
              <div>
                <h3 className="text-white font-semibold text-lg mb-1 line-clamp-2">
                  {template.name}
                </h3>
                <p className="text-gray-300 text-sm line-clamp-2">
                  {template.description || 'Template de precificação otimizado'}
                </p>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-sm text-gray-300">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{template.rating?.toFixed(1) || '0.0'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Download className="h-4 w-4" />
                  <span>{template.downloads_count || 0}</span>
                </div>
              </div>

              {/* Action Button */}
              <Button
                className="w-full bg-white text-black hover:bg-gray-200 font-semibold"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect?.(template);
                }}
              >
                <Play className="h-4 w-4 mr-2" />
                {isPurchased ? 'Usar Template' : template.price && template.price > 0 ? `Comprar ${formatCurrency(template.price)}` : 'Usar Grátis'}
              </Button>
            </div>
          </motion.div>

          {/* Price Badge (when not hovered) */}
          {!isHovered && template.price && template.price > 0 && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-black/70 text-white">
                {formatCurrency(template.price)}
              </Badge>
            </div>
          )}
        </div>

        {/* Scale on Hover */}
        <motion.div
          className="absolute inset-0 rounded-lg border-2 border-white/20 pointer-events-none"
          animate={{
            scale: isHovered ? 1.05 : 1,
            y: isHovered ? -8 : 0,
          }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </motion.div>
  );
}

