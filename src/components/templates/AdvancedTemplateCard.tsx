import { motion } from 'framer-motion';
import { ArrowRight, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface AdvancedTemplateCardProps {
  icon: LucideIcon;
  name: string;
  description: string;
  badge?: string;
  onClick: () => void;
  className?: string;
  variant?: 'integration' | 'marketplace';
}

export default function AdvancedTemplateCard({
  icon: Icon,
  name,
  description,
  badge,
  onClick,
  className,
  variant = 'integration',
}: AdvancedTemplateCardProps) {
  const isIntegration = variant === 'integration';

  return (
    <motion.div
      className={cn("cursor-pointer", className)}
      whileHover={{ scale: 1.01, y: -2 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
    >
      <div className={cn(
        "relative rounded-2xl border transition-all duration-300 overflow-hidden group",
        isIntegration
          ? "bg-gradient-to-br from-gray-50 dark:from-gray-800 to-white dark:to-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-xl"
          : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 hover:shadow-lg"
      )}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className={cn(
              "p-3 rounded-xl",
              isIntegration ? "bg-gray-100 dark:bg-gray-700/80" : "bg-gray-50 dark:bg-gray-700/80"
            )}>
              <Icon className={cn(
                "h-6 w-6",
                isIntegration ? "text-gray-800 dark:text-gray-200" : "text-gray-700 dark:text-gray-200"
              )} />
            </div>
            {badge && (
              <Badge variant="secondary" className="text-xs">
                {badge}
              </Badge>
            )}
          </div>

          {/* Content */}
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-50">
              {name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              {description}
            </p>
          </div>

          {/* CTA */}
          <div className="mt-6 flex items-center text-sm text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
            <span className="font-medium">Conectar</span>
            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Hover gradient */}
        {isIntegration && (
          <div className="absolute inset-0 bg-gradient-to-br from-white/0 dark:from-gray-800/0 to-gray-50/0 dark:to-gray-800/0 group-hover:from-white/30 dark:group-hover:from-gray-800/20 group-hover:to-gray-50/20 dark:group-hover:to-gray-700/10 transition-all duration-300 pointer-events-none" />
        )}
      </div>
    </motion.div>
  );
}

