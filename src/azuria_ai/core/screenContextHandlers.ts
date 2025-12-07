/**
 * Screen Context Handlers
 *
 * Handlers para eventos de contexto de tela.
 * Integram com o contextStore para manter estado atualizado.
 */

import type { AzuriaEvent } from './eventBus';
import { setCurrentScreen, updateContext, getCurrentScreen } from './contextStore';
import { extractContextForScreen } from '../context/contextExtractors';

/**
 * Processa evento de mudança de tela
 */
export async function handleScreenChangedEvent(
  event: AzuriaEvent
): Promise<void> {
  const { screen, path, metadata } = event.payload;

  // Atualizar tela atual no context store
  setCurrentScreen(screen);

  // Tentar extrair contexto da nova tela
  const extractedContext = extractContextForScreen(screen);
  if (extractedContext) {
    updateContext(screen, extractedContext.data);
  }

  // Log interno
  console.log('Screen changed:', {
    screen,
    path,
    timestamp: event.timestamp,
  });

  // TODO: Implementar análise contextual baseada na tela
  // TODO: Gerar insights específicos do módulo
}

/**
 * Processa evento de atualização de dados da tela
 */
export async function handleScreenDataUpdatedEvent(
  event: AzuriaEvent
): Promise<void> {
  const { data, metadata } = event.payload;

  const activeScreen = metadata?.screen || getCurrentScreen();
  if (activeScreen && data) {
    updateContext(activeScreen, data);
  }

  console.log('Screen data updated:', {
    screen: activeScreen,
    dataKeys: Object.keys(data || {}),
    timestamp: event.timestamp,
  });
}
