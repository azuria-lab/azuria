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

// ---- Instrumentação de timers para evitar leaks ----
const activeTimeouts = new Set<number | NodeJS.Timeout>()
const activeIntervals = new Set<number | NodeJS.Timeout>()
const _setTimeout = global.setTimeout
const _setInterval = global.setInterval
const _clearTimeout = global.clearTimeout
const _clearInterval = global.clearInterval

global.setTimeout = ((handler: TimerHandler, timeout?: number, ...args: any[]) => {
  const id = _setTimeout(handler, timeout, ...args)
  activeTimeouts.add(id)
  return id
}) as typeof setTimeout

global.setInterval = ((handler: TimerHandler, timeout?: number, ...args: any[]) => {
  const id = _setInterval(handler, timeout, ...args)
  activeIntervals.add(id)
  return id
}) as typeof setInterval

function cleanupTimers() {
  activeTimeouts.forEach(id => _clearTimeout(id as any))
  activeTimeouts.clear()
  activeIntervals.forEach(id => _clearInterval(id as any))
  activeIntervals.clear()
}

// Neutraliza componente de prefetch pesado para evitar import dinâmico em massa durante smoke
vi.mock('@/components/system/PrefetchOnIdle', () => ({ default: () => null }))

// Mock leve de requestIdleCallback para não agendar tarefas longas
if (!(window as any).requestIdleCallback) {
  ;(window as any).requestIdleCallback = (cb: (deadline: { didTimeout: boolean; timeRemaining: () => number }) => void) =>
    setTimeout(() => cb({ didTimeout: false, timeRemaining: () => 0 }), 10)
}

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

// Mock do IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock do ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Cleanup após cada teste
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  cleanupTimers()
})

// (Timers reais mantidos; se necessário, podemos testar timers específicos com vi.useFakeTimers dentro de cada spec.)

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

// ---- Mock QueryClient (react-query) para reduzir timers internos ----
try {
  vi.mock('@tanstack/react-query', async (importOriginal) => {
    const actual: any = await importOriginal()
    const { QueryClient } = actual
    const PatchedQueryClient = function (this: any, opts: any) {
      return new (QueryClient as any)({
        defaultOptions: {
          queries: {
            retry: false,
            gcTime: 1000,
            staleTime: 1000,
            refetchOnWindowFocus: false
          }
        },
        ...(opts || {})
      })
    }
    PatchedQueryClient.prototype = QueryClient.prototype
    return {
      ...actual,
      QueryClient: PatchedQueryClient
    }
  })
} catch {
  // se pacote não estiver disponível em algum contexto, ignora
}
