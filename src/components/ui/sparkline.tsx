/**
 * Sparkline Component
 * 
 * Mini gráfico de linha para visualizar tendências
 */

import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
  showDots?: boolean;
  fillGradient?: boolean;
}

export default function Sparkline({
  data,
  width = 100,
  height = 30,
  color = '#3b82f6',
  strokeWidth = 2,
  className = '',
  showDots = false,
  fillGradient = true
}: Readonly<SparklineProps>) {
  const { path, points } = useMemo(() => {
    if (data.length === 0) {
      return { path: '', points: [] };
    }

    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    const xStep = width / (data.length - 1 || 1);
    const calculatedPoints = data.map((value, index) => ({
      x: index * xStep,
      y: height - ((value - min) / range) * height
    }));

    const pathString = calculatedPoints
      .map((point, index) => {
        if (index === 0) {
          return `M ${point.x} ${point.y}`;
        }
        return `L ${point.x} ${point.y}`;
      })
      .join(' ');

    return { path: pathString, points: calculatedPoints };
  }, [data, width, height]);

  if (data.length === 0) {
    return null;
  }

  return (
    <svg
      width={width}
      height={height}
      className={className}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
    >
      <defs>
        {fillGradient && (
          <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        )}
      </defs>

      {/* Fill area */}
      {fillGradient && (
        <motion.path
          d={`${path} L ${width} ${height} L 0 ${height} Z`}
          fill={`url(#gradient-${color})`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
      )}

      {/* Line */}
      <motion.path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1, ease: 'easeInOut' }}
      />

      {/* Dots */}
      {showDots &&
        points.map((point, index) => (
          <motion.circle
            key={`dot-${point.x}-${point.y}`}
            cx={point.x}
            cy={point.y}
            r={strokeWidth + 1}
            fill={color}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
          />
        ))}
    </svg>
  );
}
