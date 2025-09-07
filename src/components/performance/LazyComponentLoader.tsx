
import React, { lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { UnifiedErrorBoundary as ErrorBoundary } from "@/shared/components/ErrorBoundary";

type AnyProps = Record<string, unknown>;

interface LazyComponentLoaderProps extends AnyProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  importFunc: () => Promise<{ default: React.ComponentType<any> }>;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
  children?: React.ReactNode;
}

const DefaultFallback = () => (
  <Card className="w-full">
    <CardContent className="p-6">
      <div className="space-y-4">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="grid grid-cols-2 gap-4 mt-6">
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const DefaultErrorFallback = () => (
  <Card className="w-full">
    <CardContent className="p-6">
      <div className="space-y-2">
        <div className="h-6 w-1/2 bg-muted rounded" />
        <p className="text-sm text-muted-foreground">Não foi possível carregar este módulo agora. Tente novamente.</p>
      </div>
    </CardContent>
  </Card>
);

export const LazyComponentLoader: React.FC<LazyComponentLoaderProps> = ({
  importFunc,
  fallback = <DefaultFallback />,
  errorFallback = <DefaultErrorFallback />,
  children,
  ...props
}) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const LazyComponent = lazy(importFunc) as unknown as React.ComponentType<any>;

  return (
    <ErrorBoundary fallback={errorFallback}>
      <Suspense fallback={fallback}>
  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
  <LazyComponent {...(props as any)}>
          {children}
        </LazyComponent>
      </Suspense>
    </ErrorBoundary>
  );
};

// Specific lazy loaders for heavy components
export const LazyProCalculator = () => (
  <LazyComponentLoader
    importFunc={() => import("@/components/calculators/ProCalculator")}
  />
);

export const LazyAdvancedProCalculator = () => (
  <LazyComponentLoader
    importFunc={() => import("@/components/calculators/AdvancedProCalculator")}
  />
);

export const LazyAnalyticsDashboard = () => (
  <LazyComponentLoader
    importFunc={() => import("@/components/analytics/AnalyticsDashboard")}
  />
);

export const LazyCompetitionAnalysis = () => (
  <LazyComponentLoader
    importFunc={() => import("@/components/analysis/CompetitionAnalysis")}
  />
);

export const LazyBatchCalculator = () => (
  <LazyComponentLoader
    importFunc={() => import("@/components/calculators/BatchCalculator")}
  />
);

export const LazyAdvancedAnalyticsDashboard = () => (
  <LazyComponentLoader
    importFunc={() => import("@/components/analytics/advanced/AdvancedAnalyticsDashboard")}
  />
);
