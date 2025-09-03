import React, { ReactElement, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import { fireEvent, screen, waitFor } from '@testing-library/dom';
import { Toaster } from '@/components/ui/toaster';

// Re-export testing utilities
export { render, screen, fireEvent, waitFor };

import { vi } from 'vitest';
// Use Vitest's vi.fn for mocks to ensure compatibility
const mockFn = (implementation?: (...args: any[]) => any) => {
  return implementation ? vi.fn(implementation) : vi.fn();
};

// Mock do Supabase para testes
export const mockSupabase = {
  auth: {
    getUser: mockFn().mockResolvedValue({ data: { user: null }, error: null }),
    signInWithPassword: mockFn().mockResolvedValue({ data: { user: { id: '1' } }, error: null }),
    signOut: mockFn().mockResolvedValue({ error: null }),
    onAuthStateChange: mockFn().mockReturnValue({ data: { subscription: { unsubscribe: mockFn() } } })
  },
  from: mockFn(() => ({
    select: mockFn().mockReturnThis(),
    insert: mockFn().mockReturnThis(),
    update: mockFn().mockReturnThis(),
    delete: mockFn().mockReturnThis(),
    eq: mockFn().mockReturnThis(),
    order: mockFn().mockReturnThis(),
    limit: mockFn().mockReturnThis(),
    single: mockFn().mockResolvedValue({ data: null, error: null }),
    then: mockFn().mockResolvedValue({ data: [], error: null })
  }))
};

// Provider de teste para componentes
interface TestProviderProps {
  children: ReactNode;
}

export const TestProvider: React.FC<TestProviderProps> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
  {children}
  {/* Render toaster so toast messages are present in DOM during tests */}
  <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

// Wrapper customizado para renderização de testes
export const renderWithProviders = (ui: ReactElement) => {
  return render(
    <TestProvider>
      {ui}
    </TestProvider>
  );
};


// Dados mock para testes
export const mockCalculationResult = {
  sellingPrice: 100,
  profit: 30,
  isHealthyProfit: true,
  breakdown: {
    costValue: 50,
    otherCostsValue: 5,
    shippingValue: 5,
    totalCost: 60,
    marginAmount: 30,
    realMarginPercent: 30,
    taxAmount: 7,
    cardFeeAmount: 3
  }
};

export const mockCalculationHistory = [
  {
    id: '1',
    date: new Date('2024-01-01'),
    cost: '50',
    margin: 30,
    tax: '7',
    cardFee: '3',
    otherCosts: '5',
    shipping: '5',
    includeShipping: true,
    result: mockCalculationResult
  }
];

// Utilitários de teste para performance
export const measurePerformance = async (fn: () => Promise<void> | void) => {
  const start = performance.now();
  await fn();
  const end = performance.now();
  return end - start;
};

// Mock de eventos para testes
export const createMockEvent = (value: string): React.ChangeEvent<HTMLInputElement> => ({
  target: { value },
  currentTarget: { value },
  preventDefault: mockFn(),
  stopPropagation: mockFn()
} as any);

// Gerador de dados aleatórios para testes
export const generateTestData = {
  calculation: () => ({
    cost: (Math.random() * 100).toFixed(2),
    margin: Math.floor(Math.random() * 50) + 10,
    tax: (Math.random() * 20).toFixed(1),
    cardFee: (Math.random() * 10).toFixed(1),
    otherCosts: (Math.random() * 20).toFixed(2),
    shipping: (Math.random() * 15).toFixed(2),
    includeShipping: Math.random() > 0.5
  }),
  
  user: () => ({
    id: Math.random().toString(36),
    email: `test${Math.random().toString(36)}@example.com`,
    name: `Test User ${Math.floor(Math.random() * 1000)}`,
    is_pro: Math.random() > 0.5
  })
};

// Helpers para simular delays
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Matcher customizado para valores monetários
export const expectCurrency = (value: number, expected: number, tolerance: number = 0.01) => {
  const difference = Math.abs(value - expected);
  if (difference > tolerance) {
    throw new Error(`Expected ${value} to be within ${tolerance} of ${expected}, but difference was ${difference}`);
  }
  return true;
};
