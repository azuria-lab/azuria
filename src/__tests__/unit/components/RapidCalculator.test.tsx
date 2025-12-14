import { describe, expect, it, vi } from 'vitest'
import { fireEvent, renderWithProviders, screen } from '@/utils/testing/testUtils'
// Importa o componente (framer-motion já mockado em setup)
import RapidCalculator from '@/domains/calculator/components/RapidCalculator'

// Mock do hook
const mockCalculatorHook = {
  cost: '',
  margin: 30,
  tax: '',
  cardFee: '',
  otherCosts: '',
  shipping: '',
  includeShipping: false,
  result: null,
  preview: null,
  history: [],
  historyLoading: false,
  historyError: null,
  isSupabaseConfigured: true,
  isPro: false,
  isLoading: false,
  setCost: vi.fn(),
  setMargin: vi.fn(),
  setTax: vi.fn(),
  setCardFee: vi.fn(),
  setOtherCosts: vi.fn(),
  setShipping: vi.fn(),
  setIncludeShipping: vi.fn(),
  setCostValue: vi.fn(),
  setTaxValue: vi.fn(),
  setCardFeeValue: vi.fn(),
  setOtherCostsValue: vi.fn(),
  setShippingValue: vi.fn(),
  calculatePrice: vi.fn(),
  resetCalculator: vi.fn(),
  formatCurrency: vi.fn((value) => `R$ ${value.toFixed(2)}`),
  parseInputValue: vi.fn((value) => Number.parseFloat(value) || 0),
  manualPrice: '',
  isManualMode: false,
  handleManualPriceChange: vi.fn(),
  togglePriceMode: vi.fn(),
  setState: vi.fn()
}

vi.mock('@/hooks/useRapidCalculator', () => ({
  useRapidCalculator: () => mockCalculatorHook
}))

describe('RapidCalculator', () => {
  it('should render calculator fields', () => {
    renderWithProviders(<RapidCalculator />)

    expect(screen.getByLabelText(/custo do produto/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/margem de lucro/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /calcular preço/i })).toBeInTheDocument()
  })

  it('should call setCost when cost input changes', async () => {
    renderWithProviders(<RapidCalculator />)

    const costInput = screen.getByLabelText(/custo do produto/i)
    fireEvent.change(costInput, { target: { value: '100' } })

    expect(mockCalculatorHook.setCost).toHaveBeenCalled()
  })

  it('should call calculatePrice when calculate button is clicked', async () => {
    renderWithProviders(<RapidCalculator />)

    const calculateButton = screen.getByRole('button', { name: /calcular preço/i })
    fireEvent.click(calculateButton)

    expect(mockCalculatorHook.calculatePrice).toHaveBeenCalled()
  })

  it('should display result when calculation is complete', async () => {
    const hookWithResult = {
      ...mockCalculatorHook,
      result: {
        sellingPrice: 150,
        profit: 50,
        isHealthyProfit: true,
        breakdown: {
          costValue: 100,
          otherCostsValue: 0,
          shippingValue: 0,
          totalCost: 100,
          marginAmount: 50,
          realMarginPercent: 33.33,
          taxAmount: 0,
          cardFeeAmount: 0
        }
      }
    }

  vi.resetModules()
  vi.doMock('@/hooks/useRapidCalculator', () => ({ useRapidCalculator: () => hookWithResult }))
  const { default: RapidCalculatorLocal } = await import('@/domains/calculator/components/RapidCalculator')
  renderWithProviders(<RapidCalculatorLocal />)

  expect(screen.getByText(/preço de venda/i)).toBeInTheDocument()
  // The main selling price is rendered in a 5xl heading; assert at least one match exists
  const matches = screen.getAllByText(/r\$\s*150/i)
  expect(matches.length).toBeGreaterThan(0)
  })

  it('should show loading state when calculating', async () => {
    const hookWithLoading = {
      ...mockCalculatorHook,
      isLoading: true
    }

    vi.resetModules()
    vi.doMock('@/hooks/useRapidCalculator', () => ({ useRapidCalculator: () => hookWithLoading }))
    const { default: RapidCalculatorLocal } = await import('@/domains/calculator/components/RapidCalculator')
    renderWithProviders(<RapidCalculatorLocal />)

  // Button becomes disabled and shows "Calculando..."; assert that text is present
  expect(screen.getByText(/Calculando\.{3}/i)).toBeInTheDocument()
  })

  it('should call resetCalculator when clear button is clicked', () => {
    renderWithProviders(<RapidCalculator />)

    const clearButton = screen.getByRole('button', { name: /limpar/i })
    fireEvent.click(clearButton)

    expect(mockCalculatorHook.resetCalculator).toHaveBeenCalled()
  })

  it('should handle margin slider changes', () => {
    renderWithProviders(<RapidCalculator />)

  const marginSlider = screen.getByLabelText(/margem de lucro/i)
    fireEvent.change(marginSlider, { target: { value: '40' } })

    expect(mockCalculatorHook.setMargin).toHaveBeenCalledWith(40)
  })
})