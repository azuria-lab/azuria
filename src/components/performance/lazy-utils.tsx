/* eslint-disable react-refresh/only-export-components */
import React, { ComponentType, lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface LazyWrapperProps {
  fallback?: React.ReactNode;
  minDelay?: number;
}

export const withLazyLoading = <P extends Record<string, unknown> = Record<string, unknown>>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  options: LazyWrapperProps = {}
) => {
  const { fallback, minDelay = 200 } = options;
  const LazyComponent = (lazy(() => {
    const componentPromise = importFn();
    if (minDelay > 0) {
      return Promise.all([
        componentPromise,
        new Promise(resolve => setTimeout(resolve, minDelay))
      ]).then(([component]) => component);
    }
    return componentPromise;
  }) as unknown) as ComponentType<P>;

  const WrappedComponent: React.FC<P> = (props: P) => (
    <Suspense fallback={fallback || <DefaultSkeleton />}>
      {React.createElement(LazyComponent, props)}
    </Suspense>
  );

  WrappedComponent.displayName = `LazyWrapper(Component)`;
  return WrappedComponent;
};

export const DefaultSkeleton = () => (
  <div className="space-y-4 p-4">
    <Skeleton className="h-8 w-3/4" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-2/3" />
    <div className="grid grid-cols-2 gap-4">
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-20 w-full" />
    </div>
  </div>
);

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
