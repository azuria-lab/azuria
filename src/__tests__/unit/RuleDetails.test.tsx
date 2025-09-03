import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { RuleDetails } from '@/components/automation/RuleDetails';

vi.mock('@/shared/hooks', () => ({
  useAutomationRule: (_id: string) => ({ data: null, isLoading: false }),
  useAlertsByRule: (_id: string) => ({ data: [], isLoading: false }),
  useExecutionsByRule: (_id: string) => ({ data: [] }),
}));

vi.mock('@/hooks/useAdvancedAutomation', () => ({
  useAdvancedAutomation: () => ({ updateRule: vi.fn(), executeRule: vi.fn((id: string) => id) }),
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}>
    <MemoryRouter>{children}</MemoryRouter>
  </QueryClientProvider>
);

describe('RuleDetails', () => {
  it('shows not found when rule is null', () => {
    render(<RuleDetails ruleId="r1" />, { wrapper });
    expect(screen.getByText(/Regra não encontrada/i)).toBeInTheDocument();
  });

  it('renders loading state', async () => {
    vi.resetModules();
    vi.doMock('@/shared/hooks', () => ({
      useAutomationRule: (_id: string) => ({ data: null, isLoading: true }),
      useAlertsByRule: (_id: string) => ({ data: [], isLoading: false }),
      useExecutionsByRule: (_id: string) => ({ data: [] }),
    }));
    const { RuleDetails: RD } = await import('@/components/automation/RuleDetails');
    render(<RD ruleId="r1" />, { wrapper });
    expect(screen.getByText(/Carregando detalhes/i)).toBeInTheDocument();
  });
});
