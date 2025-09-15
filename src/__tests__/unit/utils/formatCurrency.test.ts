import { describe, expect, it } from 'vitest'
import { formatCurrency } from '@/utils/calculator/formatCurrency'

describe('formatCurrency', () => {
  it('should format Brazilian currency correctly', () => {
    expect(formatCurrency(100)).toBe('R$ 100,00')
    expect(formatCurrency(1000)).toBe('R$ 1.000,00')
    expect(formatCurrency(1234.56)).toBe('R$ 1.234,56')
  })

  it('should handle zero values', () => {
    expect(formatCurrency(0)).toBe('R$ 0,00')
  })

  it('should handle negative values', () => {
    expect(formatCurrency(-100)).toBe('-R$ 100,00')
  })

  it('should handle decimal values correctly', () => {
    expect(formatCurrency(99.99)).toBe('R$ 99,99')
    expect(formatCurrency(0.50)).toBe('R$ 0,50')
    expect(formatCurrency(0.01)).toBe('R$ 0,01')
  })

  it('should handle large numbers', () => {
    expect(formatCurrency(1000000)).toBe('R$ 1.000.000,00')
    expect(formatCurrency(1234567.89)).toBe('R$ 1.234.567,89')
  })
})