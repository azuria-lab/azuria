import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { renderWithProviders, screen } from '@/utils/testing/testUtils'
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
  const input = await screen.findByLabelText(label)
  await userEvent.clear(input)
  await userEvent.type(input, value)
  return input
}

describe('Calculator Flow (light smoke)', () => {
  it('computes selling price basic path', async () => {
    renderWithProviders(<SimpleCalculator />)
    await typeNumber(/custo do produto/i, '100')
    await typeNumber(/impostos/i, '10')
    await typeNumber(/taxa.*maquininha/i, '5')
    const calcBtn = await screen.findByRole('button', { name: /calcular preço/i })
    await userEvent.click(calcBtn)
    const result = await screen.findByText(/preço de venda/i, {}, { timeout: 3000 })
    expect(result).toBeInTheDocument()
  })
})
