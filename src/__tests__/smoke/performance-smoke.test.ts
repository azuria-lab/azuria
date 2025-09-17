import { describe, expect, it } from 'vitest'
import { measurePerformance } from '@/utils/testing/testUtils'

describe.skip('measurePerformance (smoke) (TEMPORARILY SKIPPED)', () => {
  it('mede tempo > 0', async () => {
    const time = await measurePerformance(() => {
      // Pequena carga síncrona para garantir tempo > 0
      let s = 0
      for (let i = 0; i < 10000; i++) {
        s += i
      }
      // uso de s para evitar otimização
      if (s === -1) {
        // unreachable branch only para evitar DCE
        console.log('never')
      }
    })
    expect(time).toBeGreaterThan(0)
  })
})
