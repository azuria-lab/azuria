import { useCallback, useEffect, useRef } from 'react';
import { logger } from '@/services/logger';
import { useAuthContext } from '@/domains/auth';

interface HeatmapPoint {
  x: number;
  y: number;
  type: 'click' | 'hover' | 'scroll';
  timestamp: number;
  elementSelector?: string;
  elementText?: string;
  pageUrl: string;
  userId?: string;
  sessionId: string;
}

interface ScrollData {
  maxScroll: number;
  totalTime: number;
  scrollEvents: {
    position: number;
    timestamp: number;
  }[];
}

export const useHeatmap = () => {
  const { user } = useAuthContext();
  const heatmapData = useRef<HeatmapPoint[]>([]);
  const scrollData = useRef<ScrollData>({ maxScroll: 0, totalTime: 0, scrollEvents: [] });
  const sessionId = useRef<string>('');

  // Initialize session
  useEffect(() => {
    sessionId.current = sessionStorage.getItem('heatmap_session') || 
      (() => {
        const id = `heatmap_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem('heatmap_session', id);
        return id;
      })();

    // Load existing heatmap data
    const saved = localStorage.getItem('heatmap_data');
    if (saved) {
      heatmapData.current = JSON.parse(saved);
    }

    // Load scroll data
    const savedScroll = localStorage.getItem('scroll_data');
    if (savedScroll) {
      scrollData.current = JSON.parse(savedScroll);
    }
  }, []);

  // Save data periodically
  const saveData = useCallback(() => {
    localStorage.setItem('heatmap_data', JSON.stringify(heatmapData.current));
    localStorage.setItem('scroll_data', JSON.stringify(scrollData.current));
  }, []);

  // Track click events
  const trackClick = useCallback((event: MouseEvent) => {
    const target = event.target as HTMLElement;
    const point: HeatmapPoint = {
      x: event.clientX,
      y: event.clientY,
      type: 'click',
      timestamp: Date.now(),
      elementSelector: getElementSelector(target),
      elementText: target.textContent?.slice(0, 50),
      pageUrl: window.location.pathname,
      userId: user?.id,
      sessionId: sessionId.current
    };

    heatmapData.current.push(point);
    
    // Keep only last 5000 points to prevent memory issues
    if (heatmapData.current.length > 5000) {
      heatmapData.current = heatmapData.current.slice(-5000);
    }

  logger.debug('Heatmap click tracked', point);
  }, [user]);

  // Track hover events (throttled)
  const trackHover = useCallback((event: MouseEvent) => {
    const now = Date.now();
    const lastHover = heatmapData.current[heatmapData.current.length - 1];
    
    // Throttle hover events to avoid too much data
    if (lastHover && lastHover.type === 'hover' && now - lastHover.timestamp < 1000) {
      return;
    }

    const point: HeatmapPoint = {
      x: event.clientX,
      y: event.clientY,
      type: 'hover',
      timestamp: now,
      pageUrl: window.location.pathname,
      userId: user?.id,
      sessionId: sessionId.current
    };

    heatmapData.current.push(point);
  }, [user]);

  // Track scroll events
  const trackScroll = useCallback(() => {
    const scrollY = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;

    scrollData.current.maxScroll = Math.max(scrollData.current.maxScroll, scrollPercent);
    scrollData.current.scrollEvents.push({
      position: scrollPercent,
      timestamp: Date.now()
    });

    // Keep only last 100 scroll events per session
    if (scrollData.current.scrollEvents.length > 100) {
      scrollData.current.scrollEvents = scrollData.current.scrollEvents.slice(-100);
    }
  }, []);

  // Get element selector for tracking
  const getElementSelector = (element: HTMLElement): string => {
    if (element.id) {return `#${element.id}`;}
    if (element.className) {return `.${element.className.split(' ')[0]}`;}
    return element.tagName.toLowerCase();
  };

  // Initialize event listeners
  useEffect(() => {
    const throttledHover = throttle(trackHover, 500);
    const throttledScroll = throttle(trackScroll, 200);

    document.addEventListener('click', trackClick, true);
    document.addEventListener('mousemove', throttledHover);
    window.addEventListener('scroll', throttledScroll);

    // Save data every 30 seconds
    const saveInterval = setInterval(saveData, 30000);

    return () => {
      document.removeEventListener('click', trackClick, true);
      document.removeEventListener('mousemove', throttledHover);
      window.removeEventListener('scroll', throttledScroll);
      clearInterval(saveInterval);
      saveData(); // Save on unmount
    };
  }, [trackClick, trackHover, trackScroll, saveData]);

  // Get heatmap data for visualization
  const getHeatmapData = useCallback((pageUrl?: string) => {
    return heatmapData.current.filter(point => 
      !pageUrl || point.pageUrl === pageUrl
    );
  }, []);

  // Get scroll analytics
  const getScrollAnalytics = useCallback(() => {
    return {
      maxScrollReached: scrollData.current.maxScroll,
      averageScrollDepth: scrollData.current.scrollEvents.length > 0
        ? scrollData.current.scrollEvents.reduce((sum, event) => sum + event.position, 0) / scrollData.current.scrollEvents.length
        : 0,
      scrollEvents: scrollData.current.scrollEvents
    };
  }, []);

  // Clear old data
  const clearOldData = useCallback((daysOld: number = 7) => {
    const cutoff = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
    heatmapData.current = heatmapData.current.filter(point => point.timestamp > cutoff);
    saveData();
  }, [saveData]);

  return {
    getHeatmapData,
    getScrollAnalytics,
    clearOldData,
    trackClick,
    trackHover,
    trackScroll
  };
};

// Utility function for throttling
function throttle<Args extends unknown[]>(
  func: (...args: Args) => void,
  delay: number
): (...args: Args) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastExecTime = 0;
  
  return ((...args: Args) => {
    const currentTime = Date.now();
    
    if (currentTime - lastExecTime > delay) {
      func(...args);
      lastExecTime = currentTime;
    } else {
      if (timeoutId) {clearTimeout(timeoutId);}
      timeoutId = setTimeout(() => {
        func(...args);
        lastExecTime = Date.now();
      }, delay - (currentTime - lastExecTime));
    }
  });
}
