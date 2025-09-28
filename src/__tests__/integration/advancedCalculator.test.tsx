import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
// Import via alias @/* should resolve; if Jest/Vitest path mapping differs ensure tsconfig paths is respected.
import AdvancedCalculator from '../../components/calculators/AdvancedCalculator';

// NOTE: We assume useAdvancedCalculator hook has internal mocks / or deterministic calc logic.
// If it performs async work, we await for result cards to appear.

describe('AdvancedCalculator integration', () => {
  it('performs a basic calculation flow and shows summary', async () => {
    render(<AdvancedCalculator />);

    // Initially in Tributos tab
    const costInput = await screen.findByLabelText(/Custo \(R\$\)/i);
    fireEvent.change(costInput, { target: { value: '100' } });

    const shippingInput = screen.getByLabelText(/Frete \(R\$\)/i);
    fireEvent.change(shippingInput, { target: { value: '10' } });

    const otherCostInput = screen.getByLabelText(/Outros custos \(R\$\)/i);
    fireEvent.change(otherCostInput, { target: { value: '5' } });

    const marginInput = screen.getByLabelText(/Margem alvo/);
    fireEvent.change(marginInput, { target: { value: '25' } });

    // Go to marketplace tab
    const user = userEvent.setup();
    const marketplaceTab = screen.getByRole('tab', { name: /Marketplace/i });
    await user.click(marketplaceTab);
    const marketplaceFeeInput = await screen.findByLabelText(/Taxa do marketplace/);
    fireEvent.change(marketplaceFeeInput, { target: { value: '12' } });

    // Enable payment fee toggle (should be default on) and adjust
    const paymentFeeInput = screen.getByLabelText(/Pagamento \(%\)/i);
    fireEvent.change(paymentFeeInput, { target: { value: '3.5' } });

    // Trigger calculation from marketplace tab
    const calcBtn = screen.getAllByRole('button', { name: /Calcular/i })[0];
    fireEvent.click(calcBtn);

    // Expect to navigate to resumo tab and show cards
    await waitFor(() => {
      expect(screen.getByText(/Preço de venda/i)).toBeInTheDocument();
      expect(screen.getByText(/Lucro líquido/i)).toBeInTheDocument();
    });

    // Basic sanity: selling price and net profit numeric formatting
    const sellingPrice = screen.getByText(/Preço de venda/i).closest('div');
    expect(sellingPrice).toBeTruthy();
  });
});
