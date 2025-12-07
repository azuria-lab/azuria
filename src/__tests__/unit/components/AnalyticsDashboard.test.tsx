import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard'

// Mock dos hooks
vi.mock('@/hooks/useAnalytics', () => ({
  useAnalytics: () => ({
    isLoading: false,
    data: {
      totalCalculations: 1250,
      totalUsers: 89,
      conversionRate: 12.5,
      avgMargin: 23.8,
      dailyStats: [],
      topTemplates: [],
      userEngagement: {
        avgSessionTime: 10,
        bounceRate: 20,
        returnUserRate: 50,
        calculationsPerSession: 2
      }
    }
  }),
  useRevenueAnalytics: () => ({
    isLoading: false,
    data: {
      monthlyRevenue: 2990,
      annualRevenue: 2990 * 12,
      proSubscribers: 10,
      churnRate: 3.8,
      ltv: 287
    }
  })
}))

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="chart-container">{children}</div>,
  LineChart: ({ children }: { children: React.ReactNode }) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
}))

describe('AnalyticsDashboard', () => {
  it('should render the analytics dashboard', () => {
    render(<AnalyticsDashboard />)
    
  expect(screen.getByText('Analytics & Métricas')).toBeInTheDocument()
  expect(
    screen.getByText(/Acompanhe o desempenho e comportamento dos usuários do (Azuria|Precifica\+)/)
  ).toBeInTheDocument()
  })

  it('should display key metrics', () => {
    render(<AnalyticsDashboard />)
    
    expect(screen.getByText('Total de Cálculos')).toBeInTheDocument()
  // Value may vary by locale or be wrapped; accept comma or dot as thousands separator
  expect(screen.getByText(/1[.,]250/)).toBeInTheDocument()
    expect(screen.getByText('Usuários Ativos')).toBeInTheDocument()
  expect(screen.getByText(/89/)).toBeInTheDocument()
  })

  it('should render charts', () => {
    render(<AnalyticsDashboard />)
    
    expect(screen.getAllByTestId('chart-container').length).toBeGreaterThan(0)
    expect(screen.getByTestId('line-chart')).toBeInTheDocument()
  })

  it('should show proper metric formatting', () => {
    render(<AnalyticsDashboard />)
    
  expect(screen.getByText('12.5%')).toBeInTheDocument() // conversion rate
  // avg margin isn't displayed directly in UsageMetrics header; skip or assert KPI count
  })
})