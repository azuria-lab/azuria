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
  from: vi.fn(() => {
    const chainable = {
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      upsert: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    };
    return Object.assign(Promise.resolve({ data: [], error: null }), chainable);
  })
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
globalThis.fetch = vi.fn()

// Mock do window.matchMedia
Object.defineProperty(globalThis, 'matchMedia', {
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
globalThis.IntersectionObserver ??= vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock do ResizeObserver (somente se não existir)
if (globalThis.ResizeObserver === undefined) {
  class ResizeObserver {
    observe() { /* noop */ }
    unobserve() { /* noop */ }
    disconnect() { /* noop */ }
  }
  globalThis.ResizeObserver = ResizeObserver
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
  // In test environment, completely suppress error logs that might contain sensitive data
  // This prevents any sensitive information from being logged during tests
  // Only log if it's not suppressed and doesn't contain potential sensitive patterns
  
  // Check all arguments for sensitive data (not just first)
  // IMPORTANTE: Não fazer JSON.stringify de todos os argumentos pois pode expor dados sensíveis
  // Em vez disso, converter para string de forma segura
  const allArgs = args.map(arg => {
    if (typeof arg === 'string') {
      return arg;
    }
    if (typeof arg === 'object' && arg !== null) {
      // Para objetos, apenas usar toString() ou evitar logging
      try {
        return String(arg);
      } catch {
        return '[Object]';
      }
    }
    return String(arg);
  }).join(' ');
  
  // Improved pattern to catch more sensitive data patterns (API keys, tokens, passwords, etc.)
  // Use word boundaries and bounded quantifiers to avoid ReDoS
  const sensitivePatterns = [
    /\b(api[_-]?key|apikey)\s*[:=]\s*[a-zA-Z0-9\-._~+/]{10,100}/i,
    /\b(token|access[_-]?token|refresh[_-]?token)\s*[:=]\s*[a-zA-Z0-9\-._~+/]{10,100}/i,
    /\b(password|passwd|pwd|senha)\s*[:=]\s*[^\s]{4,100}/i,
    /\b(secret|secret[_-]?key)\s*[:=]\s*[a-zA-Z0-9\-._~+/]{10,100}/i,
    /\b(auth|authorization|bearer)\s*[:=]\s*[a-zA-Z0-9\-._~+/]{10,100}/i,
    /\beyJ[a-zA-Z0-9\-._~+/]{20,500}/i, // JWT tokens (base64url encoded JSON)
    /\b(sk|pk)_[a-zA-Z0-9]{32,100}/i, // Stripe-like keys
    /\bgh[oprs]_[a-zA-Z0-9]{36,100}/i, // GitHub tokens
  ];
  
  // Test patterns but limit execution time to prevent ReDoS
  let hasSensitiveData = false;
  try {
    hasSensitiveData = sensitivePatterns.some(pattern => {
      // Use bounded matching with timeout-like check
      const testStr = allArgs.substring(0, 10000); // Limit string length
      return pattern.test(testStr);
    });
  } catch {
    // Se houver erro (possível ReDoS), assumir que há dados sensíveis por segurança
    hasSensitiveData = true;
  }
  
  // Only log if no sensitive data detected
  if (!hasSensitiveData) {
    originalError(...args);
  }
  // Silently suppress logs that might contain sensitive data in tests
  // Silently suppress logs that might contain sensitive data in tests
}
