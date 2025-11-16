/**
 * Stat Card Component
 * 
 * Card de estatística reutilizável com animações
 */

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import AnimatedNumber from './animated-number';
import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: number;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  trend?: 'up' | 'down' | 'neutral';
  delay?: number;
  footer?: ReactNode;
  className?: string;
}

export default function StatCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  iconColor = '#3b82f6',
  iconBgColor = '#dbeafe',
  prefix = '',
  suffix = '',
  decimals = 0,
  trend = 'neutral',
  delay = 0,
  footer,
  className = ''
}: Readonly<StatCardProps>) {
  const getTrendColor = () => {
    if (trend === 'up') {
      return 'text-green-600';
    }
    if (trend === 'down') {
      return 'text-red-600';
    }
    return 'text-gray-600';
  };

  const getTrendIcon = () => {
    if (trend === 'up') {
      return '↑';
    }
    if (trend === 'down') {
      return '↓';
    }
    return '→';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className={className}
    >
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between space-y-0 mb-4">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <motion.div
              className="rounded-xl p-2.5 shadow-sm"
              style={{ backgroundColor: iconBgColor }}
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Icon className="h-5 w-5" style={{ color: iconColor }} />
            </motion.div>
          </div>

          <div className="space-y-2">
            <AnimatedNumber
              value={value}
              prefix={prefix}
              suffix={suffix}
              decimals={decimals}
              className="text-3xl font-bold text-gray-900"
              duration={1.5}
            />

            {(change !== undefined || changeLabel) && (
              <p className={`text-sm font-medium flex items-center gap-1 ${getTrendColor()}`}>
                <span>{getTrendIcon()}</span>
                {change !== undefined && (
                  <span>
                    {change > 0 ? '+' : ''}
                    {change.toFixed(1)}%
                  </span>
                )}
                {changeLabel && <span className="text-gray-600">{changeLabel}</span>}
              </p>
            )}

            {footer && (
              <div className="text-xs text-gray-500 mt-2">
                {footer}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
