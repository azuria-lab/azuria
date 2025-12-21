import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
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
      <div className="relative h-[200px] rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
        {/* Content */}
        <div className="absolute inset-0 p-6 flex flex-col justify-between">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-gray-50 group-hover:bg-gray-100 transition-colors">
              <Icon className="h-6 w-6 text-gray-700" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
                {name}
              </h3>
              <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                {description}
              </p>
            </div>
          </div>
          
          {/* Subtle CTA */}
          <div className="flex items-center justify-end pt-2">
            <span className="text-xs text-gray-400 group-hover:text-gray-600 transition-colors">
              Selecionar →
            </span>
          </div>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-gray-50/0 group-hover:from-white/50 group-hover:to-gray-50/30 transition-all duration-300" />
      </div>
    </motion.div>
  );
}

