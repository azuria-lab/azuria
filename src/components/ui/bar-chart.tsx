/**
 * Bar Chart Component
 * 
 * Gráfico de barras para comparação de dados
 */

import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface DataPoint {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: DataPoint[];
  width?: number;
  height?: number;
  defaultColor?: string;
  showValues?: boolean;
  showLabels?: boolean;
  horizontal?: boolean;
  className?: string;
}

export default function BarChart({
  data,
  width = 400,
  height = 300,
  defaultColor = '#3b82f6',
  showValues = true,
  showLabels = true,
  horizontal: _horizontal = false,
  className = ''
}: Readonly<BarChartProps>) {
  const { bars, maxValue } = useMemo(() => {
    if (data.length === 0) {
      return { bars: [], maxValue: 0 };
    }

    const values = data.map(d => d.value);
    const max = Math.max(...values);

    const padding = 60;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const barGap = 8;
    const barWidth = (chartWidth - (data.length - 1) * barGap) / data.length;

    const calculatedBars = data.map((point, index) => {
      const barHeight = (point.value / max) * chartHeight;
      const x = padding + index * (barWidth + barGap);
      const y = height - padding - barHeight;

      return {
        x,
        y,
        width: barWidth,
        height: barHeight,
        value: point.value,
        label: point.label,
        color: point.color || defaultColor
      };
    });

    return { bars: calculatedBars, maxValue: max };
  }, [data, width, height, defaultColor]);

  if (data.length === 0) {
    return (
      <div className={`flex items-center justify-center text-gray-400 ${className}`} style={{ width, height }}>
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
      {/* Grid horizontal */}
      <g className="grid" opacity="0.1">
        {[0, 1, 2, 3, 4].map((i) => {
          const y = 60 + (i * (height - 120)) / 4;
          return (
            <line
              key={`grid-h-${i}`}
              x1="60"
              y1={y}
              x2={width - 60}
              y2={y}
              stroke="currentColor"
              strokeWidth="1"
            />
          );
        })}
      </g>

      {/* Barras */}
      {bars.map((bar, index) => (
        <g key={`bar-${bar.label}-${bar.value}`}>
          {/* Barra de fundo */}
          <rect
            x={bar.x}
            y={60}
            width={bar.width}
            height={height - 120}
            fill={bar.color}
            opacity="0.05"
            rx="4"
          />

          {/* Barra animada */}
          <motion.rect
            x={bar.x}
            y={bar.y}
            width={bar.width}
            height={bar.height}
            fill={bar.color}
            rx="4"
            initial={{ height: 0, y: height - 60 }}
            animate={{ height: bar.height, y: bar.y }}
            transition={{ 
              delay: index * 0.1, 
              duration: 0.6,
              ease: "easeOut"
            }}
            className="cursor-pointer hover:opacity-80"
          />

          {/* Valor acima da barra */}
          {showValues && (
            <motion.text
              x={bar.x + bar.width / 2}
              y={bar.y - 8}
              textAnchor="middle"
              fontSize="12"
              fontWeight="600"
              fill={bar.color}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.3 }}
            >
              {new Intl.NumberFormat('pt-BR', { notation: 'compact' }).format(bar.value)}
            </motion.text>
          )}

          {/* Label abaixo da barra */}
          {showLabels && (
            <text
              x={bar.x + bar.width / 2}
              y={height - 35}
              textAnchor="middle"
              fontSize="11"
              fill="currentColor"
              opacity="0.7"
            >
              {bar.label.length > 10 ? `${bar.label.slice(0, 10)}...` : bar.label}
            </text>
          )}
        </g>
      ))}

      {/* Escala do eixo Y */}
      {showLabels && (
        <>
          <text x="50" y="60" textAnchor="end" fontSize="10" fill="currentColor" opacity="0.6">
            {new Intl.NumberFormat('pt-BR', { notation: 'compact' }).format(maxValue)}
          </text>
          <text x="50" y={height - 60} textAnchor="end" fontSize="10" fill="currentColor" opacity="0.6">
            0
          </text>
        </>
      )}
    </svg>
  );
}
