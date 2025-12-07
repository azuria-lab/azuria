import { describe, expect, it, vi, beforeEach } from 'vitest'

const hoisted = vi.hoisted(() => ({
  mockLoadWebVitals: vi.fn(),
  mockSubscribe: vi.fn(),
  mockCreateReport: vi.fn((metrics, session) => ({ metrics, session })),
  mockSendReport: vi.fn(),
  mockSendBatch: vi.fn(),
  mockScore: vi.fn(() => 99),
  mockIsCritical: vi.fn(() => false),
  mockEmoji: vi.fn(() => '👍'),
}))

vi.mock('@/utils/webvitals/collect.ts', () => ({
  loadWebVitals: hoisted.mockLoadWebVitals,
  subscribeToVitals: hoisted.mockSubscribe,
}))

vi.mock('@/utils/webvitals/analyze.ts', () => ({
  getRatingEmoji: hoisted.mockEmoji,
  isCritical: hoisted.mockIsCritical,
  score: hoisted.mockScore,
}))

vi.mock('@/utils/webvitals/report.ts', () => ({
  createReport: hoisted.mockCreateReport,
  sendReport: hoisted.mockSendReport,
  sendReportsBatch: hoisted.mockSendBatch,
}))

vi.mock('@/utils/secureRandom', () => ({
  generateSecureSessionId: () => 'session-123',
}))

// Importa após mocks para evitar hoisting issues
import { initWebVitals, getReporter } from '@/utils/webvitals'

describe('webvitals reporter', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    hoisted.mockLoadWebVitals.mockReset()
    hoisted.mockSubscribe.mockReset()
    hoisted.mockCreateReport.mockReset()
    hoisted.mockSendReport.mockReset()
    hoisted.mockSendBatch.mockReset()
    hoisted.mockScore.mockReset().mockReturnValue(99)
    hoisted.mockIsCritical.mockReset().mockReturnValue(false)
    hoisted.mockEmoji.mockReset().mockReturnValue('👍')
    localStorage.clear()
  })

  it('não inicia em ambiente não-prod sem flag', async () => {
    ;(import.meta as any).env = { PROD: false, DEV: true }
    await initWebVitals()
    expect(hoisted.mockLoadWebVitals).not.toHaveBeenCalled()
  })

  it('inicia quando habilitado via localStorage', async () => {
    localStorage.setItem('azuria-enable-vitals-reporting', 'true')
    hoisted.mockLoadWebVitals.mockResolvedValue({ dummy: true } as any)
    ;(import.meta as any).env = { PROD: false, DEV: false }
    await initWebVitals()
    expect(hoisted.mockLoadWebVitals).toHaveBeenCalled()
    expect(hoisted.mockSubscribe).toHaveBeenCalled()
    const reporter = getReporter()
    expect(reporter?.getScore()).toBe(99)
  })
})

