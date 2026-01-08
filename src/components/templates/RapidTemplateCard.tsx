import { motion } from 'framer-motion';
import { ArrowRight, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RapidTemplateCardProps {
  icon: LucideIcon;
  name: string;
  description: string;
  onClick: () => void;
  className?: string;
}

export default function RapidTemplateCard({
  icon: Icon,
  name,
  description,
  onClick,
  className,
}: RapidTemplateCardProps) {
  return (
    <motion.div
      className={cn("flex-shrink-0 w-[320px] cursor-pointer", className)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      <div className="relative h-[200px] rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
        {/* Content */}
        <div className="absolute inset-0 p-6 flex flex-col justify-between">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/80 group-hover:bg-gray-100 dark:group-hover:bg-gray-700 transition-colors">
              <Icon className="h-6 w-6 text-gray-700 dark:text-gray-200" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-1 line-clamp-1">
                {name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
                {description}
              </p>
            </div>
          </div>
          
          {/* CTA */}
          <div className="flex items-center justify-end pt-2 text-sm text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
            <span className="font-medium">Selecionar</span>
            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-gray-50/0 group-hover:from-white/50 dark:group-hover:from-gray-800/30 group-hover:to-gray-50/30 dark:group-hover:to-gray-700/20 transition-all duration-300" />
      </div>
    </motion.div>
  );
}

