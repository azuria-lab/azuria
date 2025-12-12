import '@testing-library/jest-dom'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// Mock do Supabase
const mockSupabase = {
  auth: {
  getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
    getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    signInWithPassword: vi.fn().mockResolvedValue({ data: { user: { id: '1' } }, error: null }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } })
  },
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    then: vi.fn().mockResolvedValue({ data: [], error: null })
  }))
}

// Mock do cliente Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase
}))

// Mock para @/lib/supabase (usado pelos engines do Azuria AI)
vi.mock('@/lib/supabase', () => ({
  supabase: mockSupabase
}))

// Mock do hook de calculadora offline para evitar dependência de indexedDB nos testes
vi.mock('@/hooks/useOfflineCalculator', () => ({
  useOfflineCalculator: () => ({
    isOffline: false,
    isLoading: false,
    offlineCalculations: [],
    saveCalculationOffline: vi.fn(async () => undefined),
    loadOfflineCalculations: vi.fn(async () => undefined),
    clearOfflineData: vi.fn(async () => undefined),
    getOfflineStats: vi.fn(() => ({ total: 0, unsynced: 0, synced: 0 })),
  })
}))

// Mock de APIs externas
global.fetch = vi.fn()

// Mock do window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock do IntersectionObserver (somente se não existir)
if (typeof global.IntersectionObserver === 'undefined') {
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }))
}

// Mock do ResizeObserver (somente se não existir)
if (typeof global.ResizeObserver === 'undefined') {
  class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  global.ResizeObserver = ResizeObserver
}

// Cleanup após cada teste
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

// Silenciar avisos ruidosos do Recharts sobre width/height 0 em ambiente de teste (JSDOM)
const suppressedMessages = [
  'The width(0) and height(0) of chart should be greater than 0'
]

const originalWarn = console.warn
const originalError = console.error

console.warn = (...args: unknown[]) => {
  const msg = args[0]
  if (typeof msg === 'string' && suppressedMessages.some((m) => msg.includes(m))) {
    return
  }
  originalWarn(...args)
}

console.error = (...args: unknown[]) => {
  const msg = args[0]
  if (typeof msg === 'string' && suppressedMessages.some((m) => msg.includes(m))) {
    return
  }
  originalError(...args)
}
