import { beforeEach, describe, expect, it, vi } from 'vitest'
import { generateCalculationsSheet, generateChartsDataSheet, generateMetricsSheet, generateSummarySheet } from '@/utils/export/excelExportUtils'

const baseData = {
  summary: {
    periodLabel: 'Jan/2025',
    totalCalculations: 2,
    avgMargin: 12.34,
    avgSellingPrice: 123.45,
    totalRevenue: 246.9,
  },
  calculations: [
    {
      id: '1',
      date: new Date('2025-01-02T10:00:00Z'),
      cost: '100',
      margin: 20,
      tax: '10',
      cardFee: '2',
      shipping: '5',
      includeShipping: false,
      result: { sellingPrice: 150, profit: 50, breakdown: { totalCost: 100 } },
    },
    {
      id: '2',
      date: new Date('2025-01-03T10:00:00Z'),
      cost: '200',
      margin: 15,
      tax: '8',
      cardFee: '1.5',
      shipping: '0',
      includeShipping: true,
      result: { sellingPrice: 260, profit: 60, breakdown: { totalCost: 200 } },
    },
  ],
  charts: {
    trends: { labels: ['w1', 'w2'], datasets: [{ data: [10, 20] }] },
    categories: { labels: ['cat1', 'cat2'], datasets: [{ data: [5, 15] }] },
  },
}

describe('excelExportUtils', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  it('should generate summary sheet', () => {
    const res = generateSummarySheet(baseData as any)
    expect(res).toContain('Período;Jan/2025')
    expect(res).toContain('Total de Cálculos;2')
  })

  it('should handle empty summary', () => {
    const res = generateSummarySheet({ ...baseData, summary: null } as any)
    expect(res).toMatch(/Sem dados de resumo disponíveis/i)
  })

  it('should generate calculations sheet with rows', () => {
    const res = generateCalculationsSheet(baseData as any)
    expect(res.split('\n').length).toBeGreaterThan(2)
    expect(res).toContain('Custo')
  })

  it('should generate metrics sheet with averages', () => {
    const res = generateMetricsSheet(baseData as any)
    expect(res).toContain('Custo Médio')
    expect(res).toContain('Margem Média')
  })

  it('should handle empty calculations on metrics', () => {
    const res = generateMetricsSheet({ ...baseData, calculations: [] } as any)
    expect(res).toMatch(/Sem dados para métricas/i)
  })

  it('should generate charts data sheet', () => {
    const res = generateChartsDataSheet(baseData as any)
    expect(res).toContain('TENDÊNCIAS')
    expect(res).toContain('CATEGORIAS')
  })

  it('should handle missing charts data', () => {
    const res = generateChartsDataSheet({ ...baseData, charts: null } as any)
    expect(res).toMatch(/Sem dados de gráficos disponíveis/i)
  })
})

