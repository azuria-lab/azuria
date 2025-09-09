import { describe, expect, it } from 'vitest'
import App from '@/App.tsx'
import { render } from '@/utils/testing/testUtils'

describe('App (smoke)', () => {
  it('renderiza sem quebrar', () => {
  // App já inclui BrowserRouter, QueryClientProvider e outros providers necessários
  const { container } = render(<App />)
    expect(container).toBeTruthy()
  })
})
