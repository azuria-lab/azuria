import { describe, expect, it } from 'vitest'
import { parseInputValue } from '@/utils/calculator/parseInputValue'

describe('parseInputValue', () => {
  it('should parse numeric strings correctly', () => {
    expect(parseInputValue('100')).toBe(100)
    expect(parseInputValue('99.99')).toBe(99.99)
    expect(parseInputValue('0')).toBe(0)
  })

  it('should handle empty and invalid inputs', () => {
    expect(parseInputValue('')).toBe(0)
    expect(parseInputValue('abc')).toBe(0)
    expect(parseInputValue(null as any)).toBe(0)
    expect(parseInputValue(undefined as any)).toBe(0)
  })

  it('should handle Brazilian number format', () => {
    expect(parseInputValue('100,50')).toBe(100.5)
    expect(parseInputValue('1.000,00')).toBe(1000)
    expect(parseInputValue('1.234,56')).toBe(1234.56)
  })

  it('should handle currency symbols', () => {
    expect(parseInputValue('R$ 100,00')).toBe(100)
    expect(parseInputValue('$ 100.50')).toBe(100.5)
  })

  it('should handle negative values', () => {
    expect(parseInputValue('-100')).toBe(-100)
    expect(parseInputValue('-99,99')).toBe(-99.99)
  })

  it('should handle whitespace', () => {
    expect(parseInputValue(' 100 ')).toBe(100)
    expect(parseInputValue('  99,99  ')).toBe(99.99)
  })
})