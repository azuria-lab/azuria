import { beforeEach, describe, expect, it, vi } from 'vitest'
import { calculateBatch, calculateMarketPosition, calculateScenarios, generateRecommendations } from '@/workers/calculationWorker'

const postMessage = vi.fn()

beforeEach(() => {
  ;(globalThis as any).self = {
    postMessage,
  }
  postMessage.mockClear()
})

describe('calculationWorker helpers', () => {
  it('calculateBatch retorna preços e lucro', () => {
    const res = calculateBatch([{ cost: 100, margin: 20, tax: 10 } as any])
    expect(res[0].calculatedPrice).toBeGreaterThan(0)
    expect(res[0].profit).toBeGreaterThan(0)
    expect(postMessage).toHaveBeenCalled()
  })

  it('calculateScenarios processa múltiplos cenários', () => {
    const res = calculateScenarios({ cost: 100 } as any, [{ margin: 20, tax: 10 }, { margin: 30, tax: 5 }] as any)
    expect(res).toHaveLength(2)
    expect(res[0].price).toBeGreaterThan(0)
  })

  it('calculateMarketPosition calcula posição', () => {
    const pos = calculateMarketPosition(10, [{ price: 5 }, { price: 15 }])
    expect(['lowest', 'low', 'medium', 'high', 'highest', 'neutral', 'competitive', 'very-competitive', 'expensive', 'very-expensive', 'unknown']).toContain(pos)
  })

  it('generateRecommendations retorna sugestões', () => {
    const recs = generateRecommendations({ ourPrice: 120, averageMarketPrice: 90, margin: 10 })
    expect(Array.isArray(recs)).toBe(true)
  })
})

