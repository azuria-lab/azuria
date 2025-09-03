import { describe, expect, it } from 'vitest'
import { fireEvent, renderWithProviders, screen, waitFor } from '@/utils/testing/testUtils'
import userEvent from '@testing-library/user-event'
import SimpleCalculator from '@/domains/calculator/components/SimpleCalculatorModern'

describe('Calculator Integration Flow', () => {
  it('should complete full calculation flow', async () => {
    const user = userEvent.setup()
    renderWithProviders(<SimpleCalculator />)

    // Input cost
    const costInput = screen.getByLabelText(/custo do produto/i)
    await user.clear(costInput)
    await user.type(costInput, '100')

    // Adjust margin
  const marginSlider = screen.getByLabelText(/margem de lucro/i)
    fireEvent.change(marginSlider, { target: { value: '30' } })

    // Input tax
    const taxInput = screen.getByLabelText(/impostos/i)
    await user.clear(taxInput)
    await user.type(taxInput, '10')

    // Input card fee
    const cardFeeInput = screen.getByLabelText(/taxa.*maquininha/i)
    await user.clear(cardFeeInput)
    await user.type(cardFeeInput, '5')

    // Calculate
    const calculateButton = screen.getByRole('button', { name: /calcular preço/i })
    await user.click(calculateButton)

    // Wait for result
    await waitFor(() => {
      expect(screen.getByText(/preço de venda/i)).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('should handle input validation errors', async () => {
    const user = userEvent.setup()
    renderWithProviders(<SimpleCalculator />)

    // Try to calculate without cost
    const calculateButton = screen.getByRole('button', { name: /calcular preço/i })
    await user.click(calculateButton)

    // Should show error
    await waitFor(() => {
      expect(screen.getByText(/valor inválido/i)).toBeInTheDocument()
    })
  })

  it('should save calculation to history', async () => {
    const user = userEvent.setup()
    renderWithProviders(<SimpleCalculator />)

    // Complete calculation
    const costInput = screen.getByLabelText(/custo do produto/i)
    await user.clear(costInput)
    await user.type(costInput, '100')

    const calculateButton = screen.getByRole('button', { name: /calcular preço/i })
    await user.click(calculateButton)

    // Wait for calculation to complete
    await waitFor(() => {
      expect(screen.getByText(/preço de venda/i)).toBeInTheDocument()
    })

    // Check if history section is present
  expect(screen.getByText(/histórico de cálculos/i)).toBeInTheDocument()
  })

  it('should clear all fields when reset button is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<SimpleCalculator />)

    // Fill inputs
    const costInput = screen.getByLabelText(/custo do produto/i)
    await user.clear(costInput)
    await user.type(costInput, '100')

    const taxInput = screen.getByLabelText(/impostos/i)
    await user.clear(taxInput)
    await user.type(taxInput, '10')

    // Clear
    const clearButton = screen.getByRole('button', { name: /limpar/i })
    await user.click(clearButton)

    // Check if fields are cleared
    expect(costInput).toHaveValue('')
    expect(taxInput).toHaveValue('')
  })

  it('should toggle between automatic and manual pricing modes', async () => {
    const user = userEvent.setup()
    renderWithProviders(<SimpleCalculator />)

    // Look for mode toggle button
  const modeToggle = screen.getByRole('button', { name: /modo manual/i })
    await user.click(modeToggle)

    // Should show manual price input
  expect(screen.getByLabelText(/preço manual/i)).toBeInTheDocument()
  })
})