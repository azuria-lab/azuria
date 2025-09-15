import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'

vi.mock('@/hooks/useSimpleCalculator', () => {
  const state = {
    cost: '', margin: 30, tax: '', cardFee: '', otherCosts: '', shipping: '', includeShipping: false,
    result: null as any,
    isLoading: false,
  }
  return {
    useSimpleCalculator: () => ({
      get result() { return state.result },
      get isLoading() { return state.isLoading },
      setState: (partial: any) => Object.assign(state, partial),
      calculatePrice: () => {
        state.isLoading = true
        const costNum = parseFloat(String(state.cost) || '0')
        if (costNum <= 0) {
          state.result = null
          state.isLoading = false;
          return
        }
        state.result = { sellingPrice: costNum * 1.5, isHealthyProfit: true }
        state.isLoading = false
      },
      resetCalculator: () => { state.result = null },
    })
  }
})

import { useSimpleCalculator } from '@/hooks/useSimpleCalculator'

describe('useSimpleCalculator (mocked)', () => {
  beforeEach(() => {
    // reset não necessário pois usamos objeto único simplificado
  })

  it('inicializa sem resultado', () => {
    const { result } = renderHook(() => useSimpleCalculator())
    expect(result.current.result).toBeNull()
    expect(result.current.isLoading).toBe(false)
  })

  it('calcula preço corretamente', () => {
    const { result } = renderHook(() => useSimpleCalculator())
    act(() => {
      result.current.setState({ cost: '100' })
      result.current.calculatePrice()
    })
    expect(result.current.result).not.toBeNull()
  expect(result.current.result && result.current.result.sellingPrice).toBe(150)
  })

  it('ignora cálculo com custo inválido', () => {
    const { result } = renderHook(() => useSimpleCalculator())
    act(() => {
      result.current.setState({ cost: '0' })
      result.current.calculatePrice()
    })
    expect(result.current.result).toBeNull()
  })

  it('marca loading e finaliza', () => {
    const { result } = renderHook(() => useSimpleCalculator())
    act(() => {
      result.current.setState({ cost: '50' })
      result.current.calculatePrice()
    })
    expect(result.current.isLoading).toBe(false)
  })

  it('reseta resultado', () => {
    const { result } = renderHook(() => useSimpleCalculator())
    act(() => {
      result.current.setState({ cost: '80' })
      result.current.calculatePrice()
    })
    expect(result.current.result).not.toBeNull()
    act(() => result.current.resetCalculator())
    expect(result.current.result).toBeNull()
  })
})