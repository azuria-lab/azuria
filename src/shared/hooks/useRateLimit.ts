
import { useCallback, useRef, useState } from 'react';

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  identifier?: string;
}

interface RateLimitState {
  count: number;
  resetTime: number;
}

export const useRateLimit = (config: RateLimitConfig) => {
  const { maxRequests, windowMs, identifier = 'default' } = config;
  const [isLimited, setIsLimited] = useState(false);
  const stateRef = useRef<Map<string, RateLimitState>>(new Map());

  const checkRateLimit = useCallback((customId?: string): boolean => {
    const id = customId || identifier;
    const now = Date.now();
    const state = stateRef.current.get(id);

    // Reset if window has expired
    if (!state || now >= state.resetTime) {
      stateRef.current.set(id, {
        count: 1,
        resetTime: now + windowMs
      });
      setIsLimited(false);
      return false;
    }

    // Check if limit exceeded
    if (state.count >= maxRequests) {
      setIsLimited(true);
      return true;
    }

    // Increment count
    state.count++;
    stateRef.current.set(id, state);
    setIsLimited(false);
    return false;
  }, [maxRequests, windowMs, identifier]);

  const getRemainingRequests = useCallback((customId?: string): number => {
    const id = customId || identifier;
    const state = stateRef.current.get(id);
    
    if (!state || Date.now() >= state.resetTime) {
      return maxRequests;
    }

    return Math.max(0, maxRequests - state.count);
  }, [maxRequests, identifier]);

  const getResetTime = useCallback((customId?: string): number => {
    const id = customId || identifier;
    const state = stateRef.current.get(id);
    
    if (!state || Date.now() >= state.resetTime) {
      return 0;
    }

    return state.resetTime;
  }, [identifier]);

  const reset = useCallback((customId?: string) => {
    const id = customId || identifier;
    stateRef.current.delete(id);
    setIsLimited(false);
  }, [identifier]);

  return {
    checkRateLimit,
    isLimited,
    getRemainingRequests,
    getResetTime,
    reset
  };
};
