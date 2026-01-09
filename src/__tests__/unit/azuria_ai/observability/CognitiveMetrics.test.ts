/**
 * ══════════════════════════════════════════════════════════════════════════════
 * COGNITIVE METRICS TESTS - Testes do Sistema de Métricas
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * Testes unitários para:
 * - Contadores, gauges e histogramas
 * - Exportação JSON e Prometheus
 * - Métricas pré-definidas
 *
 * @module tests/unit/azuria_ai/observability/CognitiveMetrics.test
 */

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  CognitiveMetrics,
  exportJSON,
  exportPrometheus,
  getCounter,
  getGauge,
  getPercentile,
  getSnapshot,
  incrementCounter,
  initMetrics,
  NucleusMetrics,
  recordHistogram,
  recordTiming,
  resetMetrics,
  setGauge,
  shutdownMetrics,
  startTimer,
} from '@/azuria_ai/observability/CognitiveMetrics';

describe('CognitiveMetrics', () => {
  beforeEach(() => {
    // Inicializar com config de teste
    initMetrics({ enabled: true, debug: false, flushIntervalMs: 0 });
    resetMetrics();
  });

  afterEach(() => {
    shutdownMetrics();
  });

  describe('Counters', () => {
    it('should increment counter', () => {
      incrementCounter('test.counter');
      expect(getCounter('test.counter')).toBe(1);

      incrementCounter('test.counter', 5);
      expect(getCounter('test.counter')).toBe(6);
    });

    it('should handle counter with tags', () => {
      incrementCounter('test.tagged', 1, { engine: 'insight' });
      incrementCounter('test.tagged', 2, { engine: 'suggestion' });
      incrementCounter('test.tagged', 1, { engine: 'insight' });

      expect(getCounter('test.tagged', { engine: 'insight' })).toBe(2);
      expect(getCounter('test.tagged', { engine: 'suggestion' })).toBe(2);
    });

    it('should return 0 for non-existent counter', () => {
      expect(getCounter('nonexistent')).toBe(0);
    });
  });

  describe('Gauges', () => {
    it('should set gauge value', () => {
      setGauge('test.gauge', 42);
      expect(getGauge('test.gauge')).toBe(42);

      setGauge('test.gauge', 100);
      expect(getGauge('test.gauge')).toBe(100);
    });

    it('should handle gauge with tags', () => {
      setGauge('cpu.usage', 75, { host: 'server1' });
      setGauge('cpu.usage', 50, { host: 'server2' });

      expect(getGauge('cpu.usage', { host: 'server1' })).toBe(75);
      expect(getGauge('cpu.usage', { host: 'server2' })).toBe(50);
    });
  });

  describe('Histograms', () => {
    it('should record histogram values', () => {
      recordHistogram('test.histogram', 10);
      recordHistogram('test.histogram', 20);
      recordHistogram('test.histogram', 30);

      const snapshot = getSnapshot();
      const values = snapshot.histograms['test.histogram'];
      expect(values).toBeDefined();
      expect(values).toHaveLength(3);
      expect(values).toContain(10);
      expect(values).toContain(20);
      expect(values).toContain(30);
    });

    it('should calculate percentiles', () => {
      for (let i = 1; i <= 100; i++) {
        recordHistogram('percentile.test', i);
      }

      expect(getPercentile('percentile.test', 50)).toBe(50);
      expect(getPercentile('percentile.test', 90)).toBe(90);
      expect(getPercentile('percentile.test', 99)).toBe(99);
    });

    it('should return 0 for empty histogram percentile', () => {
      expect(getPercentile('empty.histogram', 50)).toBe(0);
    });
  });

  describe('Timing', () => {
    it('should record timing values', () => {
      recordTiming('test.timing', 150);
      recordTiming('test.timing', 250);

      const snapshot = getSnapshot();
      const values = snapshot.histograms['test.timing{unit:ms}'];
      expect(values).toBeDefined();
      expect(values).toContain(150);
      expect(values).toContain(250);
    });

    it('should use startTimer helper', async () => {
      const stopTimer = startTimer('timed.operation');

      // Simular operação
      await new Promise((r) => setTimeout(r, 50));

      stopTimer();

      const snapshot = getSnapshot();
      const metrics = Object.values(snapshot.metrics);
      const timedMetric = metrics.find((m) => m.name === 'timed.operation');
      expect(timedMetric).toBeDefined();
      expect(timedMetric?.last).toBeGreaterThanOrEqual(40); // Pelo menos 40ms
    });
  });

  describe('Snapshot', () => {
    it('should return complete snapshot', () => {
      incrementCounter('snapshot.counter', 5);
      setGauge('snapshot.gauge', 42);
      recordHistogram('snapshot.histogram', 100);

      const snapshot = getSnapshot();

      expect(snapshot.timestamp).toBeDefined();
      expect(snapshot.uptimeMs).toBeGreaterThanOrEqual(0);
      expect(snapshot.counters['snapshot.counter']).toBe(5);
      expect(snapshot.gauges['snapshot.gauge']).toBe(42);
      expect(snapshot.histograms['snapshot.histogram']).toContain(100);
    });
  });

  describe('Export', () => {
    it('should export to JSON', () => {
      incrementCounter('export.counter', 10);

      const json = exportJSON();
      const parsed = JSON.parse(json);

      expect(parsed.counters).toBeDefined();
      expect(parsed.counters['export.counter']).toBe(10);
    });

    it('should export to Prometheus format', () => {
      incrementCounter('export.test', 5);
      setGauge('gauge.test', 42);

      const prometheus = exportPrometheus();

      expect(prometheus).toContain('export.test');
      expect(prometheus).toContain('5');
      expect(prometheus).toContain('gauge.test');
      expect(prometheus).toContain('42');
      expect(prometheus).toContain('# TYPE');
    });
  });

  describe('Reset', () => {
    it('should clear all metrics', () => {
      incrementCounter('reset.test', 100);
      setGauge('reset.gauge', 50);

      resetMetrics();

      expect(getCounter('reset.test')).toBe(0);
      expect(getGauge('reset.gauge')).toBe(0);
    });
  });

  describe('Disabled mode', () => {
    it('should not record when disabled', () => {
      shutdownMetrics();
      initMetrics({ enabled: false });

      incrementCounter('disabled.counter', 10);
      setGauge('disabled.gauge', 50);

      expect(getCounter('disabled.counter')).toBe(0);
      expect(getGauge('disabled.gauge')).toBe(0);
    });
  });

  describe('Pre-defined metrics', () => {
    it('should record nucleus metrics', () => {
      NucleusMetrics.actionProcessed('success', 'insight-engine');
      NucleusMetrics.error('timeout');

      expect(getCounter('nucleus.action.processed', { result: 'success', engine: 'insight-engine' })).toBe(1);
      expect(getCounter('nucleus.error', { type: 'timeout' })).toBe(1);
    });
  });

  describe('CognitiveMetrics object', () => {
    it('should expose all functions', () => {
      expect(CognitiveMetrics.init).toBeDefined();
      expect(CognitiveMetrics.shutdown).toBeDefined();
      expect(CognitiveMetrics.incrementCounter).toBeDefined();
      expect(CognitiveMetrics.setGauge).toBeDefined();
      expect(CognitiveMetrics.recordHistogram).toBeDefined();
      expect(CognitiveMetrics.recordTiming).toBeDefined();
      expect(CognitiveMetrics.startTimer).toBeDefined();
      expect(CognitiveMetrics.getSnapshot).toBeDefined();
      expect(CognitiveMetrics.exportJSON).toBeDefined();
      expect(CognitiveMetrics.exportPrometheus).toBeDefined();
      expect(CognitiveMetrics.reset).toBeDefined();
    });
  });
});
