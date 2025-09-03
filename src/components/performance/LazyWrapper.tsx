import React, { ComponentType, lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface LazyWrapperProps {
  fallback?: React.ReactNode;
  minDelay?: number;
}

// HOC para lazy loading com loading state melhorado
export const withLazyLoading = <P = {}>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  options: LazyWrapperProps = {}
) => {
  const { fallback, minDelay = 200 } = options;
  
  const LazyComponent = lazy(() => {
    // Adicionar delay mínimo para evitar flash
    const componentPromise = importFn();
    
    if (minDelay > 0) {
      return Promise.all([
        componentPromise,
        new Promise(resolve => setTimeout(resolve, minDelay))
      ]).then(([component]) => component);
    }
    
    return componentPromise;
  });

  const WrappedComponent = (props: P) => (
    <Suspense fallback={fallback || <DefaultSkeleton />}>
      <LazyComponent {...(props as any)} />
    </Suspense>
  );

  // Preservar nome do componente para debugging
  WrappedComponent.displayName = `LazyWrapper(Component)`;

  return WrappedComponent;
};

// Skeleton padrão para loading
const DefaultSkeleton = () => (
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

// Skeletons específicos para diferentes tipos de componente
export const CalculatorSkeleton = () => (
  <div className="space-y-6 p-6">
    <Skeleton className="h-10 w-1/2" />
    <div className="grid gap-4">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
    <Skeleton className="h-16 w-full" />
    <div className="flex gap-4">
      <Skeleton className="h-10 w-32" />
      <Skeleton className="h-10 w-32" />
    </div>
  </div>
);

export const DashboardSkeleton = () => (
  <div className="space-y-6 p-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
    <Skeleton className="h-48 w-full" />
  </div>
);

export const TableSkeleton = ({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) => (
  <div className="space-y-3">
    {/* Header */}
    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} className="h-6 w-full" />
      ))}
    </div>
    
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array.from({ length: cols }).map((_, colIndex) => (
          <Skeleton key={colIndex} className="h-8 w-full" />
        ))}
      </div>
    ))}
  </div>
);

// Hook para controlar lazy loading
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

// Lazy loading baseado em interseção
export const LazyOnView: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
  threshold?: number;
  className?: string;
}> = ({ children, fallback = <DefaultSkeleton />, threshold = 0.1, className }) => {
  const { ref, isVisible } = useLazyLoading(threshold);

  return (
    <div ref={ref} className={className}>
      {isVisible ? children : fallback}
    </div>
  );
};