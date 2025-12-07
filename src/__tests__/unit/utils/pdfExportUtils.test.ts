import { describe, expect, it, vi } from 'vitest'

const mockValues = vi.hoisted(() => ({
  save: vi.fn(),
  text: vi.fn(),
  setFontSize: vi.fn(),
  setTextColor: vi.fn(),
  addPage: vi.fn(),
  getNumberOfPages: vi.fn(() => 1),
  setPage: vi.fn(),
  line: vi.fn(),
  rect: vi.fn(),
  autoTable: vi.fn((doc, opts) => {
    ;(doc as any).lastAutoTable = { finalY: 50 }
    return opts
  }),
}))

vi.mock('jspdf', () => ({
  default: class {
    save = mockValues.save
    text = mockValues.text
    setFontSize = mockValues.setFontSize
    setTextColor = mockValues.setTextColor
    addPage = mockValues.addPage
    getNumberOfPages = mockValues.getNumberOfPages
    setPage = mockValues.setPage
    line = mockValues.line
    rect = mockValues.rect
    internal = { pageSize: { getWidth: () => 200, getHeight: () => 300 } }
  },
}))

vi.mock('jspdf-autotable', () => ({ default: mockValues.autoTable }))

import { generatePDFReport } from '@/utils/export/pdfExportUtils'

const baseData = {
  summary: {
    periodLabel: 'Jan/2025',
    totalCalculations: 2,
    avgMargin: 12.3,
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
  ],
  charts: {
    trends: { labels: ['w1'], datasets: [{ data: [10] }] },
    categories: { labels: ['cat1'], datasets: [{ data: [5] }] },
  },
}

describe('pdfExportUtils', () => {
  it('gera PDF e chama save com nome', async () => {
    await generatePDFReport(baseData as any, 'relatorio-teste')
    expect(mockValues.save).toHaveBeenCalledWith('relatorio-teste.pdf')
    expect(mockValues.autoTable).toHaveBeenCalled()
    expect(mockValues.text).toHaveBeenCalled()
  })

  it('lida com dados vazios de charts e summary', async () => {
    mockValues.autoTable.mockClear()
    await generatePDFReport({ ...baseData, summary: null, charts: null, calculations: [] } as any, 'relatorio-vazio')
    expect(mockValues.save).toHaveBeenCalledWith('relatorio-vazio.pdf')
  })
})

