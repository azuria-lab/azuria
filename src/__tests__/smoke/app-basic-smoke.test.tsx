import { describe, expect, it } from 'vitest'
import { render } from '@/utils/testing/testUtils'
import App from '@/App'

// Basic smoke that only asserts root mount without deep user flows.
describe('App basic smoke', () => {
  it('mounts root without crashing', () => {
    const { container } = render(<App />)
    expect(container.firstChild).toBeTruthy()
  })
})
