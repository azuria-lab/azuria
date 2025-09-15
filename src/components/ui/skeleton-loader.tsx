
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const PlanCardSkeleton: React.FC = () => (
  <div className="border rounded-lg p-6 space-y-4 bg-white shadow-lg">
    <div className="flex flex-col items-center space-y-2">
      <Skeleton className="h-12 w-12 rounded-full" />
      <Skeleton className="h-6 w-20" />
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-8 w-24" />
    </div>
    <div className="space-y-2">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex items-center space-x-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 flex-1" />
        </div>
      ))}
    </div>
    <Skeleton className="h-10 w-full rounded" />
  </div>
);

export const CalculatorSkeleton: React.FC = () => (
  <div className="space-y-6 p-6 bg-white rounded-lg shadow-lg">
    <div className="space-y-2">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-full max-w-md" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
    <div className="flex gap-2">
      <Skeleton className="h-10 flex-1" />
      <Skeleton className="h-10 w-32" />
    </div>
  </div>
);

export const DashboardSkeleton: React.FC = () => (
  <div className="space-y-6 p-6">
    <div className="space-y-2">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-96" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="p-4 border rounded-lg space-y-2">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-6 w-6 rounded" />
            <Skeleton className="h-5 w-20" />
          </div>
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-full" />
        </div>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-64 w-full rounded" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-2 border rounded">
              <div className="flex items-center space-x-2">
                <Skeleton className="h-8 w-8 rounded" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export const FeatureGridSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="p-6 border rounded-lg space-y-4 bg-white">
        <div className="flex items-center space-x-3">
          <Skeleton className="h-10 w-10 rounded" />
          <div className="space-y-1">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    ))}
  </div>
);

export default {
  PlanCardSkeleton,
  CalculatorSkeleton,
  DashboardSkeleton,
  FeatureGridSkeleton
};
