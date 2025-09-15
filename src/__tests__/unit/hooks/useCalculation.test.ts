import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import { useSimpleCalculator } from '@/hooks/useSimpleCalculator'
import type { CalculationHistory } from '@/domains/calculator/types/calculator'

// Mock do toast
const mockToast = vi.fn()
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast })
}))

// Mock da lógica de cálculo para evitar timers nas unit tests
vi.mock('@/domains/calculator/hooks/useCalculation', async () => {
  const { calculateSellingPrice } = await import('@/domains/calculator/utils/calculateSellingPrice')
  const { parseInputValue } = await import('@/domains/calculator/utils/parseInputValue')
  return {
  useCalculation: ({ setIsLoading, toast }: { setIsLoading: (v: boolean) => void; toast: (opts: { title: string; description?: string; variant?: string }) => void }) => ({
      calculatePrice: (
        cost: string,
        margin: number,
        tax: string,
        cardFee: string,
        otherCosts: string,
        shipping: string,
        includeShipping: boolean,
        onCalcComplete: (historyItem: CalculationHistory) => void
      ) => {
        setIsLoading(true)
        const costValue = parseInputValue(cost)
        if (costValue <= 0) {
          toast?.({
            title: 'Valor inválido',
            description: 'O custo do produto deve ser maior que zero.',
            variant: 'destructive',
          })
          setIsLoading(false)
          return
        }
        const result = calculateSellingPrice({ cost, margin, tax, cardFee, otherCosts, shipping, includeShipping })
        onCalcComplete({ id: 'test', date: new Date(), cost, margin, tax, cardFee, otherCosts, shipping, includeShipping, result })
        setIsLoading(false)
      }
    })
  }
})

describe('useSimpleCalculator', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
  // no timers to restore
  })

  it('should initialize with default values', async () => {
    const { result } = renderHook(() => useSimpleCalculator())
    // Allow initial effects to settle within act to avoid warnings
    await act(async () => { await Promise.resolve() })

    expect(result.current.result).toBeNull()
    expect(result.current.isLoading).toBe(false)
  })

  it('should calculate price correctly', async () => {
    const { result } = renderHook(() => useSimpleCalculator())

    await act(async () => {
      result.current.setState({ cost: '100', margin: 30, tax: '10', cardFee: '5' })
      await Promise.resolve()
    })
    await act(async () => {
      result.current.calculatePrice()
    })

    // wait until result is set
    await waitFor(() => expect(result.current.result).not.toBeNull())
    expect(result.current.result?.sellingPrice).toBeGreaterThan(100)
    expect(result.current.result?.isHealthyProfit).toBeDefined()
  })

  it('should handle invalid inputs gracefully', async () => {
    const { result } = renderHook(() => useSimpleCalculator())

    await act(async () => {
      result.current.setState({ cost: '0', margin: -10 })
      await Promise.resolve()
    })
    await act(async () => {
      result.current.calculatePrice()
    })

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: 'destructive',
        title: expect.stringMatching(/valor inválido/i)
      })
    )
  })

  it('should set loading state during calculation', async () => {
    const { result } = renderHook(() => useSimpleCalculator())

    expect(result.current.isLoading).toBe(false)

    await act(async () => {
      result.current.setState({ cost: '100', margin: 30 })
      await Promise.resolve()
    })
    await act(async () => {
      result.current.calculatePrice()
    })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
  })

  it('should clear results', async () => {
    const { result } = renderHook(() => useSimpleCalculator())

    await act(async () => {
      result.current.setState({ cost: '100', margin: 30 })
      await Promise.resolve()
    })
    await act(async () => {
      result.current.calculatePrice()
    })

    await waitFor(() => expect(result.current.result).not.toBeNull())

    await act(async () => {
      result.current.resetCalculator()
    })

    expect(result.current.result).toBeNull()
  })
})