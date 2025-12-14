import { useState } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { CalculationHistory } from '@/domains/calculator/types/calculator'

// Mocks leves para todos os sub-hooks e efeitos pesados
const mockToast = vi.fn()

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast })
}))

vi.mock('@/hooks/useCalculationHistory', () => ({
  useCalculationHistory: () => ({
    history: [],
    addToHistory: vi.fn(),
    loading: false,
    error: null,
    isSupabaseConfigured: false,
  })
}))

vi.mock('@/hooks/useOfflineCalculator', () => ({
  useOfflineCalculator: () => ({
    saveCalculationOffline: vi.fn().mockResolvedValue(undefined),
  }),
}))

vi.mock('@/domains/calculator/hooks/useCalculatorInputs', () => ({
  useCalculatorInputs: () => {
    const [cost, setCost] = useState('')
    const [margin, setMargin] = useState(30)
    const [tax, setTax] = useState('')
    const [cardFee, setCardFee] = useState('')
    const [otherCosts, setOtherCosts] = useState('')
    const [shipping, setShipping] = useState('')
    const [includeShipping, setIncludeShipping] = useState(false)

    return {
      cost,
      margin,
      tax,
      cardFee,
      otherCosts,
      shipping,
      includeShipping,
      setCost: (e: any) => setCost(e.target?.value ?? ''),
      setMargin,
      setTax: (e: any) => setTax(e.target?.value ?? ''),
      setCardFee: (e: any) => setCardFee(e.target?.value ?? ''),
      setOtherCosts: (e: any) => setOtherCosts(e.target?.value ?? ''),
      setShipping: (e: any) => setShipping(e.target?.value ?? ''),
      setIncludeShipping,
      setCostValue: setCost,
      setTaxValue: setTax,
      setCardFeeValue: setCardFee,
      setOtherCostsValue: setOtherCosts,
      setShippingValue: setShipping,
    }
  }
}))

vi.mock('@/domains/calculator/hooks/useCalculatorResult', () => ({
  useCalculatorResult: (params: {
    cost: string;
    margin: number;
    tax: string;
    cardFee: string;
    otherCosts: string;
    shipping: string;
    includeShipping: boolean;
    setIsLoading: (v: boolean) => void;
    toast: (opts: { title: string; description?: string; variant?: string }) => void;
  }) => {
    const [result, setResult] = useState<any>(null)
    const [preview, setPreview] = useState<any>(null)
    const calculatePrice = (calcParams: {
      cost: string;
      marginValue: number;
      tax: string;
      cardFee: string;
      otherCosts: string;
      shipping: string;
      includeShipping: boolean;
      onCalcComplete: (historyItem: CalculationHistory) => void;
    }) => {
      params.setIsLoading(true)
      const parsed = Number(calcParams.cost) || 0
      if (parsed <= 0) {
        params.toast?.({
          title: 'Valor inválido',
          description: 'O custo do produto deve ser maior que zero.',
          variant: 'destructive',
        })
        params.setIsLoading(false)
        return
      }
      const res = { sellingPrice: parsed * (1 + calcParams.marginValue / 100), profit: parsed * calcParams.marginValue / 100, isHealthyProfit: true, breakdown: { costValue: parsed, otherCostsValue: 0, shippingValue: 0, totalCost: parsed, marginAmount: parsed * calcParams.marginValue / 100, realMarginPercent: calcParams.marginValue, taxAmount: 0, cardFeeAmount: 0 } }
      const item: CalculationHistory = {
        id: 'calc-1',
        date: new Date(),
        cost: calcParams.cost,
        margin: calcParams.marginValue,
        tax: calcParams.tax,
        cardFee: calcParams.cardFee,
        otherCosts: calcParams.otherCosts,
        shipping: calcParams.shipping,
        includeShipping: calcParams.includeShipping,
        result: res,
      }
      setResult(res)
      calcParams.onCalcComplete(item)
      params.setIsLoading(false)
    }
    return { result, setResult, preview, setPreview, calculatePrice }
  },
}))

vi.mock('@/domains/calculator/hooks/useManualPricing', () => ({
  useManualPricing: () => ({
    isManualMode: false,
    manualPrice: '',
    togglePriceMode: vi.fn(),
    handleManualPriceChange: vi.fn(),
  }),
}))

// Importa o hook sob teste após todos os mocks
import { useRapidCalculator } from '@/hooks/useRapidCalculator'

describe('useRapidCalculator', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
  // no timers to restore
  })

  it('should initialize with default values', async () => {
    const { result } = renderHook(() => useRapidCalculator())
    // Allow initial effects to settle within act to avoid warnings
    await act(async () => { await Promise.resolve() })

    expect(result.current.result).toBeNull()
    expect(result.current.isLoading).toBe(false)
  })

  it('should calculate price correctly', async () => {
    const { result } = renderHook(() => useRapidCalculator())

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
    const { result } = renderHook(() => useRapidCalculator())

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
    const { result } = renderHook(() => useRapidCalculator())

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
    const { result } = renderHook(() => useRapidCalculator())

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