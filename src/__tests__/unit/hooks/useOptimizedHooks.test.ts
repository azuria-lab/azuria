import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { 
  useCalculationCache, 
  useOptimizedInput, 
  usePerformanceTracker,
  useRetryOperation 
} from '@/hooks/useOptimizedHooks'

describe('useOptimizedInput', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should initialize with default value', () => {
    const { result } = renderHook(() => useOptimizedInput('initial'))
    
    expect(result.current.value).toBe('initial')
    expect(result.current.debouncedValue).toBe('initial')
  })

  it('should update value immediately but debounce the debounced value', () => {
    const { result } = renderHook(() => useOptimizedInput('', 300))
    
    act(() => {
      result.current.handleChange({ target: { value: 'test' } } as React.ChangeEvent<HTMLInputElement>)
    })
    
    expect(result.current.value).toBe('test')
    expect(result.current.debouncedValue).toBe('')
    
    act(() => {
      vi.advanceTimersByTime(300)
    })
    
    expect(result.current.debouncedValue).toBe('test')
  })

  it('should setValue programmatically', () => {
    const { result } = renderHook(() => useOptimizedInput(''))
    
    act(() => {
      result.current.setValue('programmatic')
    })
    
    expect(result.current.value).toBe('programmatic')
  })
})

describe('useCalculationCache', () => {
  it('should cache and retrieve values', () => {
    const { result } = renderHook(() => useCalculationCache())
    
    const params = { cost: 100, margin: 30 }
    const calculationResult = { sellingPrice: 143, profit: 43 }
    
    act(() => {
      result.current.setInCache(params, calculationResult)
    })
    
    const cached = result.current.getFromCache(params)
    expect(cached).toEqual(calculationResult)
  })

  it('should return null for non-existing cache entries', () => {
    const { result } = renderHook(() => useCalculationCache())
    
    const cached = result.current.getFromCache({ cost: 999, margin: 99 })
    expect(cached).toBeNull()
  })

  it('should clear cache', () => {
    const { result } = renderHook(() => useCalculationCache())
    
    act(() => {
      result.current.setInCache({ cost: 100 }, { result: 'test' })
      result.current.clearCache()
    })
    
    const cached = result.current.getFromCache({ cost: 100 })
    expect(cached).toBeNull()
  })

  it('should provide cache statistics', () => {
    const { result } = renderHook(() => useCalculationCache())
    
    act(() => {
      result.current.setInCache({ cost: 100 }, { result: 'test' })
      result.current.getFromCache({ cost: 100 }) // hit
      result.current.getFromCache({ cost: 200 }) // miss
    })
    
    const stats = result.current.getCacheStats()
    expect(stats.size).toBe(1)
    expect(stats.maxSize).toBe(100)
    expect(stats.hitRate).toBe(0.5) // 1 hit out of 2 requests
  })
})

describe('useRetryOperation', () => {
  it('should execute operation successfully on first try', async () => {
    const { result } = renderHook(() => useRetryOperation())
    const mockOperation = vi.fn().mockResolvedValue('success')
    const onSuccess = vi.fn()
    
    await act(async () => {
      await result.current.executeWithRetry(mockOperation, onSuccess)
    })
    
    expect(mockOperation).toHaveBeenCalledTimes(1)
    expect(onSuccess).toHaveBeenCalledWith('success')
  })

  it('should retry on failure', async () => {
    const { result } = renderHook(() => useRetryOperation())
    const mockOperation = vi.fn()
      .mockRejectedValueOnce(new Error('first fail'))
      .mockRejectedValueOnce(new Error('second fail'))
      .mockResolvedValue('success')
    
    const onSuccess = vi.fn()
    
    await act(async () => {
      await result.current.executeWithRetry(mockOperation, onSuccess)
    })
    
    expect(mockOperation).toHaveBeenCalledTimes(3)
    expect(onSuccess).toHaveBeenCalledWith('success')
  })

  it('should call onError after max retries', async () => {
    const { result } = renderHook(() => useRetryOperation())
    const mockOperation = vi.fn().mockRejectedValue(new Error('always fail'))
    const onError = vi.fn()
    
    await act(async () => {
      await result.current.executeWithRetry(mockOperation, undefined, onError)
    })
    
    expect(mockOperation).toHaveBeenCalledTimes(3) // initial + 2 retries
    expect(onError).toHaveBeenCalledWith(expect.any(Error))
  })
})

describe('usePerformanceTracker', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(performance, 'now').mockReturnValue(0)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should track render performance', () => {
    const { result } = renderHook(() => usePerformanceTracker('TestComponent'))
    
    act(() => {
      result.current.startTracking()
    })
    
    vi.spyOn(performance, 'now').mockReturnValue(20)
    
    act(() => {
      result.current.endTracking()
    })
    
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('TestComponent render took 20ms')
    )
  })

  it('should not warn for fast renders', () => {
    const { result } = renderHook(() => usePerformanceTracker('FastComponent'))
    
    act(() => {
      result.current.startTracking()
    })
    
    vi.spyOn(performance, 'now').mockReturnValue(10)
    
    act(() => {
      result.current.endTracking()
    })
    
    expect(console.warn).not.toHaveBeenCalled()
  })

  it('should reset tracking data', () => {
    const { result } = renderHook(() => usePerformanceTracker('TestComponent'))
    
    act(() => {
      result.current.startTracking()
      result.current.resetTracking()
    })
    
    // Should not track after reset
    vi.spyOn(performance, 'now').mockReturnValue(100)
    
    act(() => {
      result.current.endTracking()
    })
    
    expect(console.warn).not.toHaveBeenCalled()
  })
})