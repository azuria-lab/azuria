// Mock utilitário para HistoryService em testes que precisem isolar persistência.
// Este arquivo não é executado como teste; serve como helper opcional.
export const historyServiceMock = {
  saveCalculation: async () => ({}),
  getHistory: async () => [],
  deleteHistoryItem: async () => {},
  clearHistory: async () => {},
  isSupabaseAvailable: () => false,
}

