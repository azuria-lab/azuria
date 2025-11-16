/**
 * Area Chart Component
 * 
 * Gráfico de área para visualizar dados ao longo do tempo
 */

import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface DataPoint {
  label: string;
  value: number;
  date?: Date;
}

interface AreaChartProps {
  data: DataPoint[];
  width?: number;
  height?: number;
  color?: string;
  showGrid?: boolean;
  showLabels?: boolean;
  showTooltip?: boolean;
  className?: string;
}

export default function AreaChart({
  data,
  width = 600,
  height = 300,
  color = '#3b82f6',
  showGrid = true,
  showLabels = true,
  className = ''
}: Readonly<AreaChartProps>) {
  const { path, points, max, min } = useMemo(() => {
    if (data.length === 0) {
      return { path: '', points: [], max: 0, min: 0 };
    }

    const values = data.map(d => d.value);
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    const range = maxValue - minValue || 1;

    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const xStep = chartWidth / (data.length - 1 || 1);
    const calculatedPoints = data.map((point, index) => ({
      x: padding + index * xStep,
      y: padding + chartHeight - ((point.value - minValue) / range) * chartHeight,
      value: point.value,
      label: point.label
    }));

    const pathString = calculatedPoints
      .map((point, index) => {
        if (index === 0) {
          return `M ${point.x} ${point.y}`;
        }
        // Curva suave (bezier)
        const prevPoint = calculatedPoints[index - 1];
        const cpX1 = prevPoint.x + (point.x - prevPoint.x) / 3;
        const cpY1 = prevPoint.y;
        const cpX2 = prevPoint.x + (2 * (point.x - prevPoint.x)) / 3;
        const cpY2 = point.y;
        return `C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${point.x} ${point.y}`;
      })
      .join(' ');

    return { 
      path: pathString, 
      points: calculatedPoints, 
      max: maxValue, 
      min: minValue 
    };
  }, [data, width, height]);

  if (data.length === 0) {
    return (
      <div className={cn("flex items-center justify-center text-gray-400", className)} style={{ width, height }}>
        Sem dados disponíveis
      </div>
    );
  }

  return (
    <svg
      width={width}
      height={height}
      className={className}
      viewBox={`0 0 ${width} ${height}`}
    >
      <defs>
        <linearGradient id={`area-gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.05" />
        </linearGradient>
      </defs>

      {/* Grid */}
      {showGrid && (
        <g className="grid" opacity="0.1">
          {[0, 1, 2, 3, 4].map((i) => {
            const y = 40 + (i * (height - 80)) / 4;
            return (
              <line
                key={`grid-${i}`}
                x1="40"
                y1={y}
                x2={width - 40}
                y2={y}
                stroke="currentColor"
                strokeWidth="1"
              />
            );
          })}
        </g>
      )}

      {/* Área preenchida */}
      <motion.path
        d={`${path} L ${width - 40} ${height - 40} L 40 ${height - 40} Z`}
        fill={`url(#area-gradient-${color})`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      />

      {/* Linha principal */}
      <motion.path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, ease: 'easeInOut' }}
      />

      {/* Pontos */}
      {points.map((point, index) => (
        <g key={`point-${point.x}-${point.y}-${point.value}`}>
          <motion.circle
            cx={point.x}
            cy={point.y}
            r="5"
            fill="white"
            stroke={color}
            strokeWidth="2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            className="cursor-pointer hover:r-6"
          />
          
          {/* Labels */}
          {showLabels && index % Math.ceil(data.length / 6) === 0 && (
            <text
              x={point.x}
              y={height - 15}
              textAnchor="middle"
              fontSize="10"
              fill="currentColor"
              opacity="0.6"
            >
              {point.label}
            </text>
          )}
        </g>
      ))}

      {/* Valor máximo e mínimo */}
      {showLabels && (
        <>
          <text x="5" y="45" fontSize="10" fill="currentColor" opacity="0.6">
            {new Intl.NumberFormat('pt-BR', { notation: 'compact' }).format(max)}
          </text>
          <text x="5" y={height - 35} fontSize="10" fill="currentColor" opacity="0.6">
            {new Intl.NumberFormat('pt-BR', { notation: 'compact' }).format(min)}
          </text>
        </>
      )}
    </svg>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
