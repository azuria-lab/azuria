import '@testing-library/jest-dom'
import React from 'react'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// Mock framer-motion global para evitar dependência de matchMedia/addListener em jsdom
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...rest }: { children: React.ReactNode }) => React.createElement('div', rest, children),
  },
}))

// Polyfill ResizeObserver para ambiente jsdom
if (typeof global.ResizeObserver === 'undefined') {
  class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  // @ts-expect-error - Polyfill para ambiente de teste
  global.ResizeObserver = ResizeObserver
}

// Polyfill matchMedia para evitar erros em componentes que usam media queries
if (typeof window !== 'undefined' && typeof window.matchMedia === 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

// Polyfill IntersectionObserver (alguns componentes observam visibilidade)
if (typeof global.IntersectionObserver === 'undefined') {
  // @ts-expect-error - Polyfill para ambiente de teste
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }))
}

// Mock fetch global para evitar chamadas reais
if (typeof global.fetch === 'undefined') {
  // @ts-expect-error - Polyfill para ambiente de teste
  global.fetch = vi.fn()
}

// Mock leve do Supabase para evitar múltiplas instâncias de GoTrue em jsdom
const mockSubscription = {
  unsubscribe: vi.fn(),
}

const mockSupabaseAuth = {
  getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
  getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
  signInWithPassword: vi.fn().mockResolvedValue({ data: { user: { id: '1' } }, error: null }),
  signOut: vi.fn().mockResolvedValue({ error: null }),
  onAuthStateChange: vi.fn((callback) => {
    // Chamar callback imediatamente com session null
    if (callback) {
      callback('SIGNED_OUT', null)
    }
    return { 
      data: { 
        subscription: mockSubscription 
      } 
    }
  }),
}

const mockSupabaseFrom = () => ({
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  single: vi.fn().mockResolvedValue({ data: null, error: null }),
  then: vi.fn().mockResolvedValue({ data: [], error: null }),
})

const mockSupabaseChannel = () => ({
  on: vi.fn().mockReturnThis(),
  subscribe: vi.fn(() => ({
    status: 'SUBSCRIBED',
    unsubscribe: vi.fn(),
  })),
})

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: mockSupabaseAuth,
    from: mockSupabaseFrom,
    channel: mockSupabaseChannel,
    removeChannel: vi.fn(),
  },
  supabaseAuth: {
    auth: mockSupabaseAuth,
  },
  supabaseData: {
    from: mockSupabaseFrom,
  },
}))

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  vi.clearAllTimers()
})

