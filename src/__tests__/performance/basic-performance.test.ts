import { describe, expect, it } from 'vitest'
import { measurePerformance } from '@/utils/testing/testUtils'

describe('Basic Performance Tests', () => {
  it('should measure function execution time', async () => {
    const testFunction = async () => {
      // Simulate some work
      await new Promise(resolve => setTimeout(resolve, 10))
    }

    const executionTime = await measurePerformance(testFunction)
    expect(executionTime).toBeGreaterThan(5)
  })

  it('should handle synchronous functions', async () => {
    const syncFunction = () => {
      // Simple calculation
      Array.from({ length: 1000 }, (_, i) => i * i).reduce((a, b) => a + b, 0)
    }

    const executionTime = await measurePerformance(syncFunction)
    expect(executionTime).toBeGreaterThan(0)
  })
})