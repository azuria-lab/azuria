export function emitNimResponse(eventBus: any, payload: any) {
  eventBus.emit('ai:nim-response', payload);
}

