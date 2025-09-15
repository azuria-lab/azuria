import React, { ComponentType, lazy, Suspense } from 'react';

interface LazyWrapperProps {
  fallback?: React.ReactNode;
  minDelay?: number;
}

export const withLazyLoading = <P extends Record<string, unknown> = Record<string, unknown>>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  options: LazyWrapperProps = {}
) => {
  const { fallback, minDelay = 200 } = options;
  const LazyComponent = lazy(async () => {
    const componentPromise = importFn();
    if (minDelay > 0) {
      const [component] = await Promise.all([
        componentPromise,
        new Promise(resolve => setTimeout(resolve, minDelay))
      ]);
      return component;
    }
    return componentPromise;
  }) as React.LazyExoticComponent<ComponentType<P>>;

  const WrappedComponent: React.FC<P> = (props: P) =>
    React.createElement(
      Suspense,
      { fallback: fallback ?? null },
      React.createElement(LazyComponent as unknown as ComponentType<P>, props)
    );

  WrappedComponent.displayName = `LazyWrapper(Component)`;
  return WrappedComponent;
};

export const useLazyLoading = (threshold = 0.1) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
};
