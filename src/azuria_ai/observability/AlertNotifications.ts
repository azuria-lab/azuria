/**
 * ══════════════════════════════════════════════════════════════════════════════
 * ALERT NOTIFICATIONS - Sistema de Notificações Push para Alertas
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * Integra alertas do sistema cognitivo com Browser Notifications API.
 * Também suporta notificações in-app via toast.
 *
 * @module observability/AlertNotifications
 */

import { toast } from '@/hooks/use-toast';
import { logger } from '@/services/logger';
import type { AlertSeverity, TriggeredAlert } from './CognitiveAlerts';

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════

export interface NotificationConfig {
  /** Habilitar notificações do browser */
  browserNotifications: boolean;
  /** Habilitar toasts in-app */
  toastNotifications: boolean;
  /** Severidades que geram notificação */
  severityFilter: AlertSeverity[];
  /** Som de notificação */
  playSound: boolean;
  /** Duração do toast em ms */
  toastDuration: number;
}

export interface NotificationState {
  permission: NotificationPermission | 'unsupported';
  enabled: boolean;
  config: NotificationConfig;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ESTADO
// ═══════════════════════════════════════════════════════════════════════════════

const DEFAULT_CONFIG: NotificationConfig = {
  browserNotifications: true,
  toastNotifications: true,
  severityFilter: ['warning', 'critical'],
  playSound: true,
  toastDuration: 5000,
};

const state: NotificationState = {
  permission: 'default',
  enabled: false,
  config: { ...DEFAULT_CONFIG },
};

// ═══════════════════════════════════════════════════════════════════════════════
// INICIALIZAÇÃO
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Verifica se o browser suporta notificações
 */
export function isNotificationSupported(): boolean {
  return typeof globalThis.window !== 'undefined' && 'Notification' in globalThis.window;
}

/**
 * Obtém a permissão atual de notificações
 */
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) {return 'unsupported';}
  return Notification.permission;
}

/**
 * Solicita permissão para enviar notificações
 */
export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!isNotificationSupported()) {
    logger.warn('[AlertNotifications] Browser does not support notifications');
    return 'unsupported';
  }

  try {
    const permission = await Notification.requestPermission();
    state.permission = permission;
    logger.info(`[AlertNotifications] Permission: ${permission}`);
    return permission;
  } catch (error) {
    logger.error('[AlertNotifications] Error requesting permission:', error);
    return 'denied';
  }
}

/**
 * Inicializa o sistema de notificações
 */
export async function initNotifications(config?: Partial<NotificationConfig>): Promise<NotificationState> {
  // Merge config
  state.config = { ...DEFAULT_CONFIG, ...config };

  // Verificar permissão
  state.permission = getNotificationPermission();

  // Se browser notifications estão habilitadas, solicitar permissão
  if (state.config.browserNotifications && state.permission === 'default') {
    await requestNotificationPermission();
  }

  state.enabled = true;
  logger.info('[AlertNotifications] Initialized', state);

  return { ...state };
}

/**
 * Desabilita o sistema de notificações
 */
export function disableNotifications(): void {
  state.enabled = false;
  logger.info('[AlertNotifications] Disabled');
}

// ═══════════════════════════════════════════════════════════════════════════════
// NOTIFICAÇÕES
// ═══════════════════════════════════════════════════════════════════════════════

const SEVERITY_ICONS: Record<AlertSeverity, string> = {
  info: 'ℹ️',
  warning: '⚠️',
  critical: '🚨',
};

const SEVERITY_COLORS: Record<AlertSeverity, { title: string; variant: 'default' | 'destructive' }> = {
  info: { title: 'Informação', variant: 'default' },
  warning: { title: 'Aviso', variant: 'default' },
  critical: { title: 'Crítico', variant: 'destructive' },
};

/**
 * Envia uma notificação de alerta
 */
export function notifyAlert(alert: TriggeredAlert): void {
  if (!state.enabled) {return;}

  // Verificar filtro de severidade
  if (!state.config.severityFilter.includes(alert.severity)) {
    return;
  }

  const icon = SEVERITY_ICONS[alert.severity];
  const title = `${icon} ${alert.ruleName}`;
  const body = alert.message || `${alert.metricName}: ${alert.metricValue.toFixed(2)} (threshold: ${alert.threshold})`;

  // Toast notification (in-app)
  if (state.config.toastNotifications) {
    const { variant } = SEVERITY_COLORS[alert.severity];
    toast({
      title: title,
      description: body,
      variant: variant,
      duration: state.config.toastDuration,
    });
  }

  // Browser notification
  if (state.config.browserNotifications && state.permission === 'granted') {
    try {
      const notification = new Notification(title, {
        body: body,
        icon: '/favicon.ico',
        tag: alert.id, // Evita duplicatas
        requireInteraction: alert.severity === 'critical',
      });

      // Auto-close após duração
      setTimeout(() => notification.close(), state.config.toastDuration);

      // Click handler
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch (error) {
      logger.error('[AlertNotifications] Error showing browser notification:', error);
    }
  }

  // Som
  if (state.config.playSound && alert.severity === 'critical') {
    playAlertSound();
  }
}

/**
 * Envia notificação de alerta resolvido
 */
export function notifyAlertResolved(alert: TriggeredAlert): void {
  if (!state.enabled || !state.config.toastNotifications) {return;}

  toast({
    title: `✅ Resolvido: ${alert.ruleName}`,
    description: `O alerta voltou ao normal`,
    variant: 'default',
    duration: 3000,
  });
}

/**
 * Toca um som de alerta
 */
function playAlertSound(): void {
  try {
    // Usar Web Audio API para gerar um beep
    const audioContext = new (globalThis.window.AudioContext || (globalThis.window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800; // Hz
    oscillator.type = 'sine';
    gainNode.gain.value = 0.3;

    oscillator.start();
    setTimeout(() => {
      oscillator.stop();
      audioContext.close();
    }, 200);
  } catch (error) {
    logger.error('[AlertNotifications] Error playing sound:', error);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURAÇÃO
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Atualiza a configuração de notificações
 */
export function updateNotificationConfig(config: Partial<NotificationConfig>): NotificationConfig {
  state.config = { ...state.config, ...config };
  logger.info('[AlertNotifications] Config updated', state.config);
  return { ...state.config };
}

/**
 * Obtém a configuração atual
 */
export function getNotificationConfig(): NotificationConfig {
  return { ...state.config };
}

/**
 * Obtém o estado atual
 */
export function getNotificationState(): NotificationState {
  return { ...state };
}

// ═══════════════════════════════════════════════════════════════════════════════
// INTEGRAÇÃO COM COGNITIVE ALERTS
// ═══════════════════════════════════════════════════════════════════════════════

import { eventBus, type EventBusEvent } from '@/azuria_ai/events/EventBus';

let unsubscribe: (() => void) | null = null;

/**
 * Conecta notificações ao sistema de alertas
 */
export function connectToAlertSystem(): void {
  if (unsubscribe) {
    logger.warn('[AlertNotifications] Already connected');
    return;
  }

  unsubscribe = eventBus.on('system:alert:triggered', (event: EventBusEvent<TriggeredAlert>) => {
    if (event.data) {
      notifyAlert(event.data);
    }
  });

  eventBus.on('system:alert:resolved', (event: EventBusEvent<TriggeredAlert>) => {
    if (event.data) {
      notifyAlertResolved(event.data);
    }
  });

  logger.info('[AlertNotifications] Connected to alert system');
}

/**
 * Desconecta do sistema de alertas
 */
export function disconnectFromAlertSystem(): void {
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
    logger.info('[AlertNotifications] Disconnected from alert system');
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

export const AlertNotifications = {
  init: initNotifications,
  disable: disableNotifications,
  requestPermission: requestNotificationPermission,
  isSupported: isNotificationSupported,
  getPermission: getNotificationPermission,
  notify: notifyAlert,
  notifyResolved: notifyAlertResolved,
  updateConfig: updateNotificationConfig,
  getConfig: getNotificationConfig,
  getState: getNotificationState,
  connect: connectToAlertSystem,
  disconnect: disconnectFromAlertSystem,
};

export default AlertNotifications;
