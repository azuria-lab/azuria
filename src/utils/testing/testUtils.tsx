/* eslint-disable react-refresh/only-export-components */
import React, { ReactElement, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import { fireEvent, screen, waitFor } from '@testing-library/dom';
import { Toaster } from '@/components/ui/toaster';
export * from './testHelpers';

// Re-export testing utilities
export { render, screen, fireEvent, waitFor };

// Non-component helpers moved to testHelpers.ts to satisfy react-refresh rule

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
