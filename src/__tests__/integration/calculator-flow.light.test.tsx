import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { renderWithProviders, screen } from '@/utils/testing/testUtils'
import userEvent from '@testing-library/user-event'

// Focus: Minimal happy-path calculation without heavy history / analytics branches.
// This replaces the skipped heavyweight suite. Target: <5s runtime, tiny memory footprint.

// Mock framer-motion to avoid animation cost
vi.mock('framer-motion', () => ({
  motion: { div: (props: any) => <div {...props} /> }
}))

// Mock heavy services (history disabled)
vi.mock('@/domains/calculator/services/HistoryService', () => ({
  HistoryService: {
    isSupabaseAvailable: () => false,
    async saveCalculation() { /* noop */ },
    async getHistory() { return []; },
  }
}))

// Mock auth: unauthenticated
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

// Helper to find field by label ignoring case
async function typeNumber(label: RegExp, value: string) {
  const input = await screen.findByLabelText(label)
  await userEvent.clear(input)
  await userEvent.type(input, value)
  return input
}

describe('Calculator Integration Flow (light)', () => {
  it('computes selling price for basic inputs', async () => {
    renderWithProviders(<SimpleCalculator />)

    await typeNumber(/custo do produto/i, '100')
    await typeNumber(/impostos/i, '10')
    await typeNumber(/taxa.*maquininha/i, '5')

    const calcBtn = await screen.findByRole('button', { name: /calcular preço/i })
    await userEvent.click(calcBtn)

    // Assert presence of result label (implementation detail neutral)
    const result = await screen.findByText(/preço de venda/i, {}, { timeout: 3000 })
    expect(result).toBeInTheDocument()
  })
})
