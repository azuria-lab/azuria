/**
 * ══════════════════════════════════════════════════════════════════════════════
 * COGNITIVE ALERTS TESTS - Testes do Sistema de Alertas
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * Testes unitários para:
 * - Criação e gerenciamento de regras
 * - Disparo de alertas baseados em thresholds
 * - Acknowledge e histórico
 *
 * @module tests/unit/azuria_ai/observability/CognitiveAlerts.test
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock do CognitiveMetrics
vi.mock('@/azuria_ai/observability/CognitiveMetrics', () => ({
  getCounter: vi.fn().mockReturnValue(0),
  getGauge: vi.fn().mockReturnValue(0),
  getPercentile: vi.fn().mockReturnValue(0),
  getSnapshot: vi.fn().mockReturnValue({
    timestamp: Date.now(),
    uptimeMs: 1000,
    counters: {},
    gauges: {},
    histograms: {},
    metrics: {},
  }),
}));

import { getCounter, getGauge } from '@/azuria_ai/observability/CognitiveMetrics';
import {
  acknowledgeAlert,
  acknowledgeAllAlerts,
  addAlertRule,
  type AlertRule,
  checkAlertsNow,
  clearActiveAlerts,
  clearAlertHistory,
  getActiveAlerts,
  getAlertHistory,
  getAlertRules,
  getAlertStats,
  initAlerts,
  loadDefaultRules,
  removeAlertRule,
  shutdownAlerts,
  toggleAlertRule,
} from '@/azuria_ai/observability/CognitiveAlerts';

describe('CognitiveAlerts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    initAlerts({ enabled: true, checkIntervalMs: 0 });
    clearActiveAlerts();
    clearAlertHistory();
    
    // Remover todas as regras
    for (const rule of getAlertRules()) {
      removeAlertRule(rule.id);
    }
  });

  afterEach(() => {
    shutdownAlerts();
  });

  describe('Rules Management', () => {
    it('should add alert rule', () => {
      const rule: AlertRule = {
        id: 'test-rule',
        name: 'Test Rule',
        description: 'Test description',
        enabled: true,
        metric: 'test.metric',
        metricType: 'counter',
        operator: 'gt',
        threshold: 10,
        severity: 'warning',
        cooldownMs: 1000,
      };

      addAlertRule(rule);
      const rules = getAlertRules();

      expect(rules).toHaveLength(1);
      expect(rules[0].id).toBe('test-rule');
    });

    it('should remove alert rule', () => {
      const rule: AlertRule = {
        id: 'to-remove',
        name: 'Rule to Remove',
        description: '',
        enabled: true,
        metric: 'test',
        metricType: 'counter',
        operator: 'gt',
        threshold: 5,
        severity: 'info',
        cooldownMs: 1000,
      };

      addAlertRule(rule);
      expect(getAlertRules()).toHaveLength(1);

      const removed = removeAlertRule('to-remove');
      expect(removed).toBe(true);
      expect(getAlertRules()).toHaveLength(0);
    });

    it('should toggle rule enabled state', () => {
      addAlertRule({
        id: 'toggle-test',
        name: 'Toggle Test',
        description: '',
        enabled: true,
        metric: 'test',
        metricType: 'counter',
        operator: 'gt',
        threshold: 5,
        severity: 'info',
        cooldownMs: 1000,
      });

      toggleAlertRule('toggle-test', false);
      const rules = getAlertRules();
      expect(rules[0].enabled).toBe(false);
    });

    it('should load default rules', () => {
      loadDefaultRules();
      const rules = getAlertRules();

      expect(rules.length).toBeGreaterThan(0);
      expect(rules.some((r) => r.id === 'nucleus-errors-high')).toBe(true);
    });
  });

  describe('Alert Triggering', () => {
    it('should trigger alert when threshold exceeded', () => {
      vi.mocked(getCounter).mockReturnValue(15);

      addAlertRule({
        id: 'threshold-test',
        name: 'Threshold Test',
        description: '',
        enabled: true,
        metric: 'errors',
        metricType: 'counter',
        operator: 'gt',
        threshold: 10,
        severity: 'error',
        cooldownMs: 0,
      });

      checkAlertsNow();
      const activeAlerts = getActiveAlerts();

      expect(activeAlerts).toHaveLength(1);
      expect(activeAlerts[0].ruleName).toBe('Threshold Test');
      expect(activeAlerts[0].severity).toBe('error');
    });

    it('should not trigger when below threshold', () => {
      vi.mocked(getCounter).mockReturnValue(5);

      addAlertRule({
        id: 'below-threshold',
        name: 'Below Threshold',
        description: '',
        enabled: true,
        metric: 'errors',
        metricType: 'counter',
        operator: 'gt',
        threshold: 10,
        severity: 'warning',
        cooldownMs: 0,
      });

      checkAlertsNow();
      expect(getActiveAlerts()).toHaveLength(0);
    });

    it('should use different operators correctly', () => {
      vi.mocked(getGauge).mockReturnValue(50);

      // Less than operator
      addAlertRule({
        id: 'lt-test',
        name: 'Less Than Test',
        description: '',
        enabled: true,
        metric: 'health',
        metricType: 'gauge',
        operator: 'lt',
        threshold: 80,
        severity: 'warning',
        cooldownMs: 0,
      });

      checkAlertsNow();
      expect(getActiveAlerts()).toHaveLength(1);
    });

    it('should resolve alert when condition no longer met', () => {
      vi.mocked(getCounter).mockReturnValue(15);

      addAlertRule({
        id: 'resolve-test',
        name: 'Resolve Test',
        description: '',
        enabled: true,
        metric: 'errors',
        metricType: 'counter',
        operator: 'gt',
        threshold: 10,
        severity: 'error',
        cooldownMs: 0,
      });

      checkAlertsNow();
      expect(getActiveAlerts()).toHaveLength(1);

      // Simular correção do problema
      vi.mocked(getCounter).mockReturnValue(5);
      checkAlertsNow();

      expect(getActiveAlerts()).toHaveLength(0);
    });
  });

  describe('Alert Management', () => {
    it('should acknowledge alert', () => {
      vi.mocked(getCounter).mockReturnValue(100);

      addAlertRule({
        id: 'ack-test',
        name: 'Ack Test',
        description: '',
        enabled: true,
        metric: 'errors',
        metricType: 'counter',
        operator: 'gt',
        threshold: 10,
        severity: 'error',
        cooldownMs: 0,
      });

      checkAlertsNow();
      const alerts = getActiveAlerts();
      expect(alerts[0].acknowledged).toBe(false);

      acknowledgeAlert(alerts[0].id);
      const updatedAlerts = getActiveAlerts();
      expect(updatedAlerts[0].acknowledged).toBe(true);
    });

    it('should acknowledge all alerts', () => {
      vi.mocked(getCounter).mockReturnValue(100);
      vi.mocked(getGauge).mockReturnValue(5);

      addAlertRule({
        id: 'ack-all-1',
        name: 'Ack All 1',
        description: '',
        enabled: true,
        metric: 'errors',
        metricType: 'counter',
        operator: 'gt',
        threshold: 10,
        severity: 'error',
        cooldownMs: 0,
      });

      addAlertRule({
        id: 'ack-all-2',
        name: 'Ack All 2',
        description: '',
        enabled: true,
        metric: 'health',
        metricType: 'gauge',
        operator: 'lt',
        threshold: 50,
        severity: 'warning',
        cooldownMs: 0,
      });

      checkAlertsNow();
      acknowledgeAllAlerts();

      const alerts = getActiveAlerts();
      expect(alerts.every((a) => a.acknowledged)).toBe(true);
    });

    it('should maintain alert history', () => {
      vi.mocked(getCounter).mockReturnValue(100);

      addAlertRule({
        id: 'history-test',
        name: 'History Test',
        description: '',
        enabled: true,
        metric: 'errors',
        metricType: 'counter',
        operator: 'gt',
        threshold: 10,
        severity: 'error',
        cooldownMs: 0,
      });

      checkAlertsNow();
      const history = getAlertHistory();

      expect(history).toHaveLength(1);
      expect(history[0].ruleName).toBe('History Test');
    });
  });

  describe('Statistics', () => {
    it('should return correct stats', () => {
      vi.mocked(getCounter).mockReturnValue(100);

      addAlertRule({
        id: 'stats-1',
        name: 'Stats 1',
        description: '',
        enabled: true,
        metric: 'errors',
        metricType: 'counter',
        operator: 'gt',
        threshold: 10,
        severity: 'error',
        cooldownMs: 0,
      });

      addAlertRule({
        id: 'stats-2',
        name: 'Stats 2',
        description: '',
        enabled: false,
        metric: 'other',
        metricType: 'counter',
        operator: 'gt',
        threshold: 10,
        severity: 'warning',
        cooldownMs: 0,
      });

      checkAlertsNow();
      const stats = getAlertStats();

      expect(stats.totalRules).toBe(2);
      expect(stats.enabledRules).toBe(1);
      expect(stats.activeAlerts).toBe(1);
      expect(stats.bySeverity.error).toBe(1);
    });
  });

  describe('Disabled rules', () => {
    it('should not check disabled rules', () => {
      vi.mocked(getCounter).mockReturnValue(100);

      addAlertRule({
        id: 'disabled-rule',
        name: 'Disabled Rule',
        description: '',
        enabled: false,
        metric: 'errors',
        metricType: 'counter',
        operator: 'gt',
        threshold: 10,
        severity: 'error',
        cooldownMs: 0,
      });

      checkAlertsNow();
      expect(getActiveAlerts()).toHaveLength(0);
    });
  });
});
