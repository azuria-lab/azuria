import { describe, expect, it, vi } from 'vitest'

const save = vi.fn()
const text = vi.fn()
const setFont = vi.fn()
const setFontSize = vi.fn()
const setTextColor = vi.fn()
const setDrawColor = vi.fn()
const line = vi.fn()
const autoTable = vi.fn().mockImplementation(() => {
  ;(globalThis as any).__lastAutoTable = { finalY: 50 }
})

vi.mock('jspdf', () => ({
  jsPDF: class {
    save = save
    text = text
    setFont = setFont
    setFontSize = setFontSize
    setTextColor = setTextColor
    setDrawColor = setDrawColor
    line = line
    autoTable = (...args: any[]) => {
      const res = autoTable(...args)
      ;(this as any).lastAutoTable = (globalThis as any).__lastAutoTable || { finalY: 50 }
      return res
    }
    internal = { pageSize: { height: 300, width: 200 } }
    getNumberOfPages = () => 1
    setPage = vi.fn()
  },
}))

import { generatePDF } from '@/utils/pdf/generatePDF'

const calc = {
  id: '1',
  date: new Date('2025-01-02T10:00:00Z'),
  cost: '100',
  margin: 20,
  tax: '10',
  cardFee: '2',
  shipping: '5',
  includeShipping: true,
  otherCosts: '1',
  result: {
    sellingPrice: 150,
    profit: 50,
    breakdown: {
      costValue: 100,
      otherCostsValue: 1,
      shippingValue: 5,
      taxAmount: 10,
      cardFeeAmount: 3,
      marginAmount: 50,
      totalCost: 119,
      realMarginPercent: 33.3,
    },
  },
}

describe('generatePDF', () => {
  it('gera PDF com autoTable e salva arquivo', async () => {
    await generatePDF(calc as any, (v: number) => v.toFixed(2))
    expect(autoTable).toHaveBeenCalled()
    expect(save).toHaveBeenCalledWith(expect.stringMatching(/Precifica_Calculo_/))
    expect(text).toHaveBeenCalled()
  })
})

