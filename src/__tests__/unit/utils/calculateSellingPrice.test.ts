import { describe, expect, it } from 'vitest'
import { calculateSellingPrice } from '@/utils/calculator/calculateSellingPrice'

describe('calculateSellingPrice', () => {
  it('should calculate selling price correctly with basic inputs', () => {
    const result = calculateSellingPrice({
      cost: '100',
      margin: 30,
      tax: '10',
      cardFee: '5',
      otherCosts: '0',
      shipping: '0',
      includeShipping: false
    })

    expect(result).toMatchObject({
      sellingPrice: expect.any(Number),
      profit: expect.any(Number),
      isHealthyProfit: expect.any(Boolean),
      breakdown: {
        costValue: 100,
        marginAmount: expect.any(Number),
        taxAmount: expect.any(Number),
        cardFeeAmount: expect.any(Number)
      }
    })
  })

  it('should handle zero margin correctly', () => {
    const result = calculateSellingPrice({
      cost: '100',
      margin: 0,
      tax: '0',
      cardFee: '0',
      otherCosts: '0',
      shipping: '0',
      includeShipping: false
    })

    expect(result.sellingPrice).toBe(100)
    expect(result.profit).toBe(0)
    expect(result.isHealthyProfit).toBe(false)
  })

  it('should include shipping in cost when includeShipping is true', () => {
    const resultWithShipping = calculateSellingPrice({
      cost: '100',
      margin: 20,
      tax: '0',
      cardFee: '0',
      otherCosts: '0',
      shipping: '10',
      includeShipping: true
    })

    const resultWithoutShipping = calculateSellingPrice({
      cost: '100',
      margin: 20,
      tax: '0',
      cardFee: '0',
      otherCosts: '0',
      shipping: '10',
      includeShipping: false
    })

    expect(resultWithShipping.breakdown.totalCost).toBe(110)
    expect(resultWithoutShipping.breakdown.totalCost).toBe(100)
  })

  it('should calculate healthy profit correctly', () => {
    const healthyResult = calculateSellingPrice({
      cost: '100',
      margin: 25,
      tax: '0',
      cardFee: '0',
      otherCosts: '0',
      shipping: '0',
      includeShipping: false
    })

    const unhealthyResult = calculateSellingPrice({
      cost: '100',
      margin: 5,
      tax: '0',
      cardFee: '0',
      otherCosts: '0',
      shipping: '0',
      includeShipping: false
    })

    expect(healthyResult.isHealthyProfit).toBe(true)
    expect(unhealthyResult.isHealthyProfit).toBe(false)
  })

  it('should handle high taxes and fees', () => {
    const result = calculateSellingPrice({
      cost: '100',
      margin: 30,
      tax: '20',
      cardFee: '10',
      otherCosts: '15',
      shipping: '5',
      includeShipping: true
    })

    expect(result.breakdown.taxAmount).toBeGreaterThan(0)
    expect(result.breakdown.cardFeeAmount).toBeGreaterThan(0)
    expect(result.breakdown.otherCostsValue).toBe(15)
    expect(result.breakdown.totalCost).toBe(120) // 100 + 15 + 5
  })
})