import { describe, expect, it } from 'vitest'
import { measurePerformance } from '@/utils/testing/testUtils'

describe('measurePerformance (smoke)', () => {
  it('mede tempo > 0', async () => {
    const time = await measurePerformance(async () => {
      await new Promise(r => setTimeout(r, 5))
    })
    expect(time).toBeGreaterThan(0)
  })
})
