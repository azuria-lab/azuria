
import { useCallback, useEffect, useRef, useState } from 'react';

interface UseLazyLoadOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export const useLazyLoad = (options: UseLazyLoadOptions = {}) => {
  const { threshold = 0.1, rootMargin = '50px', triggerOnce = true } = options;
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) {return;}

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold, rootMargin, triggerOnce]);

  const markAsLoaded = useCallback(() => {
    setIsLoaded(true);
  }, []);

  return {
    ref: elementRef,
    isVisible,
    isLoaded,
    markAsLoaded
  };
};

// Hook para lazy loading de imagens
export const useLazyImage = (src: string, options?: UseLazyLoadOptions) => {
  const { ref, isVisible, isLoaded, markAsLoaded } = useLazyLoad(options);
  const [imageSrc, setImageSrc] = useState<string>('');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (isVisible && src && !isLoaded) {
      const img = new Image();
      img.onload = () => {
        setImageSrc(src);
        markAsLoaded();
      };
      img.onerror = () => {
        setError(true);
        markAsLoaded();
      };
      img.src = src;
    }
  }, [isVisible, src, isLoaded, markAsLoaded]);

  return {
    ref,
    src: imageSrc,
    isLoaded,
    error
  };
};

// Hook para lazy loading de componentes
export const useLazyComponent = <T = any>(
  importFn: () => Promise<{ default: React.ComponentType<T> }>,
  options?: UseLazyLoadOptions
) => {
  const { ref, isVisible } = useLazyLoad(options);
  const [Component, setComponent] = useState<React.ComponentType<T> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (isVisible && !Component && !loading) {
      setLoading(true);
      importFn()
        .then((module) => {
          setComponent(() => module.default);
        })
        .catch((err) => {
          setError(err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isVisible, Component, loading, importFn]);

  return {
    ref,
    Component,
    loading,
    error
  };
};

// Hook para controle de scroll performance
export const useScrollPerformance = () => {
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolling(true);
      
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 150);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return { isScrolling };
};

export default {
  useLazyLoad,
  useLazyImage,
  useLazyComponent,
  useScrollPerformance
};
