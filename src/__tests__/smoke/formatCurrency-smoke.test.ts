import { describe, expect, it } from 'vitest'
import { formatCurrency } from '@/utils/calculator/formatCurrency'

describe('formatCurrency (smoke)', () => {
  it('formata 1234.56 como BRL', () => {
    expect(formatCurrency(1234.56)).toBe('R$ 1.234,56')
  })
})
