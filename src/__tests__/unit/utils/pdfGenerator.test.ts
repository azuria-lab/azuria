import { describe, expect, it, vi, beforeEach } from 'vitest'

const save = vi.fn()
const text = vi.fn()
const setFont = vi.fn()
const setFontSize = vi.fn()
const setTextColor = vi.fn()
const rect = vi.fn()
const setDrawColor = vi.fn()
const setFillColor = vi.fn()
const autoTable = vi.fn().mockImplementation(() => {
  if (docInstance) {
    docInstance.lastAutoTable = { finalY: 50 }
  }
})

let docInstance: any

vi.mock('jspdf', () => ({
  default: class {
    save = save
    text = text
    setFont = setFont
    setFontSize = setFontSize
    setTextColor = setTextColor
    setDrawColor = setDrawColor
    setFillColor = setFillColor
    rect = rect
    internal = { pageSize: { width: 210, height: 297 } }
    constructor() {
      docInstance = this
    }
    autoTable(...args: any[]) {
      const res = autoTable(docInstance, ...args)
      docInstance.lastAutoTable = { finalY: 50 }
      return res
    }
  },
}))

import { generateCalculationPDF, generateBatchPDF } from '@/utils/pdf/pdfGenerator'

const result = {
  sellingPrice: 150,
  profit: 50,
  breakdown: {
    totalCost: 100,
    marginAmount: 50,
    taxAmount: 10,
    cardFeeAmount: 3,
    otherCostsValue: 1,
    shippingValue: 5,
    realMarginPercent: 33.3,
  },
}

const calcData = {
  calculation: {
    cost: '100',
    margin: 20,
    tax: '10',
    cardFee: '2',
    otherCosts: '1',
    shipping: '5',
    includeShipping: true,
  },
  result,
  companyName: 'Azuria',
  productName: 'Produto X',
}

describe('pdfGenerator', () => {
  beforeEach(() => {
    save.mockClear()
    text.mockClear()
    autoTable.mockClear()
  })

  it('gera PDF individual e salva', () => {
    generateCalculationPDF(calcData as any)
    expect(save).toHaveBeenCalledWith(expect.stringMatching(/Precificacao_Produto/))
    expect(autoTable).toHaveBeenCalled()
  })

  it('gera PDF em lote e salva', () => {
    generateBatchPDF([calcData as any, { ...calcData, productName: 'Produto Y' }])
    expect(save).toHaveBeenCalledWith(expect.stringMatching(/Gestao_Precos_Lote/))
    expect(autoTable).toHaveBeenCalled()
  })
})

