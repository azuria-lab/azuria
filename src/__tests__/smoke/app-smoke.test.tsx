import { describe, expect, it } from 'vitest'
import App from '@/App.tsx'
import { render } from '@/utils/testing/testUtils'
import { act } from 'react'

describe('App (smoke)', () => {
  it('renderiza sem quebrar', async () => {
    let container: HTMLElement | null = null
    await act(async () => {
      const result = render(<App />)
      container = result.container
    })
    expect(container).toBeTruthy()
  })
})
