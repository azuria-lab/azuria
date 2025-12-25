 
export function emitNimResponse(eventBus: { emit: (event: string, payload: unknown) => void }, payload: unknown) {
  eventBus.emit('ai:nim-response', payload);
}

