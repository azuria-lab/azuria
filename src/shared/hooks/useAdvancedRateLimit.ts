
import { useCallback, useEffect, useRef, useState } from 'react';

interface AdvancedRateLimitConfig {
  maxRequests: number;
  windowMs: number;
  burstCapacity?: number;
  algorithm?: 'sliding-window' | 'token-bucket' | 'fixed-window';
  adaptiveThrottling?: boolean;
  userTier?: 'free' | 'pro' | 'enterprise';
}

interface RateLimitMetrics {
  requestsInWindow: number;
  burstTokens: number;
  throttleLevel: number;
  predictedNextReset: number;
  adaptiveLimit: number;
}

interface RateLimitResponse {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
  metrics: RateLimitMetrics;
}

export const useAdvancedRateLimit = (config: AdvancedRateLimitConfig) => {
  const [metrics, setMetrics] = useState<RateLimitMetrics>({
    requestsInWindow: 0,
    burstTokens: config.burstCapacity || Math.floor(config.maxRequests * 0.2),
    throttleLevel: 0,
    predictedNextReset: Date.now() + config.windowMs,
    adaptiveLimit: config.maxRequests
  });

  const requestHistory = useRef<number[]>([]);
  const behaviorPattern = useRef<{ timestamp: number; success: boolean }[]>([]);

  // Algoritmo de Sliding Window
  const checkSlidingWindow = useCallback((): RateLimitResponse => {
    const now = Date.now();
    const windowStart = now - config.windowMs;
    
    // Remove requests antigas
    requestHistory.current = requestHistory.current.filter(time => time > windowStart);
    
    const requestsInWindow = requestHistory.current.length;
    const allowed = requestsInWindow < metrics.adaptiveLimit;

    if (allowed) {
      requestHistory.current.push(now);
    }

    return {
      allowed,
      remaining: Math.max(0, metrics.adaptiveLimit - requestsInWindow - 1),
      resetTime: windowStart + config.windowMs,
      metrics: {
        ...metrics,
        requestsInWindow: requestsInWindow + (allowed ? 1 : 0)
      }
    };
  }, [config.windowMs, metrics]);

  // Algoritmo de Token Bucket
  const checkTokenBucket = useCallback((): RateLimitResponse => {
    const now = Date.now();
    const timePassed = now - (metrics.predictedNextReset - config.windowMs);
    const tokensToAdd = Math.floor((timePassed / config.windowMs) * config.maxRequests);
    
    const newTokens = Math.min(
      config.maxRequests + (config.burstCapacity || 0),
      metrics.burstTokens + tokensToAdd
    );

    const allowed = newTokens > 0;
    const finalTokens = allowed ? newTokens - 1 : newTokens;

    setMetrics(prev => ({
      ...prev,
      burstTokens: finalTokens,
      predictedNextReset: now + config.windowMs
    }));

    return {
      allowed,
      remaining: finalTokens,
      resetTime: now + config.windowMs,
      retryAfter: allowed ? undefined : Math.ceil(config.windowMs / config.maxRequests),
      metrics: { ...metrics, burstTokens: finalTokens }
    };
  }, [config, metrics]);

  // Rate Limiting Adaptativo
  const updateAdaptiveLimit = useCallback(() => {
    if (!config.adaptiveThrottling) {return;}

    const recentBehavior = behaviorPattern.current.slice(-100);
    const successRate = recentBehavior.length > 0 
      ? recentBehavior.filter(b => b.success).length / recentBehavior.length 
      : 1;

    const avgRequestInterval = recentBehavior.length > 1
      ? (Date.now() - recentBehavior[0].timestamp) / recentBehavior.length
      : config.windowMs / config.maxRequests;

    let adaptiveMultiplier = 1;

    // Usuário bem comportado - aumenta limite
    if (successRate > 0.95 && avgRequestInterval > (config.windowMs / config.maxRequests) * 2) {
      adaptiveMultiplier = 1.2;
    }
    // Usuário com comportamento suspeito - reduz limite
    else if (successRate < 0.8 || avgRequestInterval < (config.windowMs / config.maxRequests) * 0.5) {
      adaptiveMultiplier = 0.7;
    }

    setMetrics(prev => ({
      ...prev,
      adaptiveLimit: Math.floor(config.maxRequests * adaptiveMultiplier),
      throttleLevel: (1 - adaptiveMultiplier) * 100
    }));
  }, [config]);

  // Função principal de verificação
  const checkRateLimit = useCallback((_requestId?: string): RateLimitResponse => {
    let result: RateLimitResponse;

    switch (config.algorithm) {
      case 'token-bucket':
        result = checkTokenBucket();
        break;
      case 'sliding-window':
        result = checkSlidingWindow();
        break;
      default:
        result = checkSlidingWindow();
    }

    // Registra comportamento para análise adaptativa
    behaviorPattern.current.push({
      timestamp: Date.now(),
      success: result.allowed
    });

    // Mantém apenas os últimos 500 registros
    if (behaviorPattern.current.length > 500) {
      behaviorPattern.current = behaviorPattern.current.slice(-500);
    }

    return result;
  }, [config.algorithm, checkTokenBucket, checkSlidingWindow]);

  // Análise preditiva de uso
  const predictUsage = useCallback(() => {
    const recent = behaviorPattern.current.slice(-50);
    if (recent.length < 10) {return { trend: 'stable', prediction: config.maxRequests };}

    const intervals = recent.slice(1).map((req, i) => 
      req.timestamp - recent[i].timestamp
    );

    const avgInterval = intervals.reduce((sum, int) => sum + int, 0) / intervals.length;
    const requestsPerWindow = config.windowMs / avgInterval;

    return {
      trend: requestsPerWindow > config.maxRequests * 0.8 ? 'increasing' : 'stable',
      prediction: Math.ceil(requestsPerWindow),
      recommendedLimit: Math.max(config.maxRequests, Math.ceil(requestsPerWindow * 1.2))
    };
  }, [config]);

  // Atualiza limite adaptativo periodicamente
  useEffect(() => {
    const interval = setInterval(updateAdaptiveLimit, 30000); // A cada 30 segundos
    return () => clearInterval(interval);
  }, [updateAdaptiveLimit]);

  const reset = useCallback(() => {
    requestHistory.current = [];
    behaviorPattern.current = [];
    setMetrics({
      requestsInWindow: 0,
      burstTokens: config.burstCapacity || Math.floor(config.maxRequests * 0.2),
      throttleLevel: 0,
      predictedNextReset: Date.now() + config.windowMs,
      adaptiveLimit: config.maxRequests
    });
  }, [config]);

  return {
    checkRateLimit,
    metrics,
    reset,
    predictUsage,
    updateAdaptiveLimit
  };
};
