import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { renderWithProviders, screen, } from '@/utils/testing/testUtils'
import { waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('framer-motion', () => ({ motion: { div: (props: any) => <div {...props} /> } }))
vi.mock('@/domains/calculator/services/HistoryService', () => ({
  HistoryService: {
    isSupabaseAvailable: () => false,
    async saveCalculation() {},
    async getHistory() { return [] }
  }
}))
vi.mock('@/domains/auth', () => ({
  useAuthContext: () => ({
    session: null,
    user: null,
    userProfile: null,
    isLoading: false,
    error: null,
    isAuthenticated: false,
    isPro: false,
  })
}))

import SimpleCalculator from '@/domains/calculator/components/SimpleCalculatorModern'

async function typeNumber(label: RegExp, value: string) {
  const input = screen.getByLabelText(label)
  await user.clear(input)
  await user.type(input, value)
  return input
}

const user = userEvent.setup()

describe.skip('Calculator Flow (light smoke) (TEMPORARILY SKIPPED)', () => {
  it('computes selling price basic path', async () => {
    renderWithProviders(<SimpleCalculator />)
    await typeNumber(/custo do produto/i, '100')
    await typeNumber(/impostos/i, '10')
    await typeNumber(/taxa.*maquininha/i, '5')
    const calcBtn = screen.getByRole('button', { name: /calcular preço/i })
    await user.click(calcBtn)
    await waitFor(() => {
      expect(screen.getByText(/preço de venda/i)).toBeInTheDocument()
    }, { timeout: 4000 })
  })
})
