/**
 * Skeleton Loaders - Performance optimized loading states
 * Used in Suspense boundaries to provide instant visual feedback
 */

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

// Base skeleton card
export function SkeletonCard() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-4 w-3/4 mt-2" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/5" />
      </CardContent>
    </Card>
  );
}

// Calculator skeleton
export function SkeletonCalculator() {
  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>

      <div className="space-y-3">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-32 w-full" />
      </div>

      <Skeleton className="h-12 w-full" />
    </div>
  );
}

// Dashboard skeleton with multiple cards
export function SkeletonDashboard() {
  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-5 w-3/4" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6 space-y-3">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-3 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonChart />
        <SkeletonChart />
      </div>
    </div>
  );
}

// Chart skeleton
export function SkeletonChart() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-4 w-1/2 mt-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Skeleton className="h-64 w-full" />
          <div className="flex gap-4 justify-center">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Table skeleton
export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-1/4" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex gap-4 pb-2 border-b">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/4" />
          </div>
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Analytics page skeleton
export function SkeletonAnalytics() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-10 w-1/2" />
              <div className="flex items-center gap-2 pt-2">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-3 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonChart />
        <SkeletonTable rows={8} />
      </div>
    </div>
  );
}

// Settings page skeleton
export function SkeletonSettings() {
  return (
    <div className="space-y-6 p-6">
      <Skeleton className="h-8 w-1/3" />
      
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-2 pb-4 border-b">
            <Skeleton className="h-5 w-1/4" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Page skeleton (generic fallback)
export function SkeletonPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand-600 mx-auto"></div>
        <div className="space-y-2">
          <Skeleton className="h-5 w-48 mx-auto" />
          <Skeleton className="h-4 w-64 mx-auto" />
        </div>
      </div>
    </div>
  );
}
