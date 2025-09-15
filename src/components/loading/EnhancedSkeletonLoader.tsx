
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface SkeletonLoaderProps {
  variant?: 'calculator' | 'dashboard' | 'list' | 'form' | 'chart';
  count?: number;
  className?: string;
}

export const EnhancedSkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant = 'calculator',
  count = 1,
  className = ''
}) => {
  const renderCalculatorSkeleton = () => (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Input fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
        
        {/* Slider */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-full" />
        </div>
        
        {/* Action buttons */}
        <div className="flex gap-2">
          <Skeleton className="h-12 flex-1" />
          <Skeleton className="h-12 w-20" />
        </div>
        
        {/* Result area */}
        <div className="mt-6 space-y-3">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-20 w-full" />
        </div>
      </CardContent>
    </Card>
  );

  const renderDashboardSkeleton = () => (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
      </div>
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Chart area */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    </div>
  );

  const renderListSkeleton = () => (
    <div className={`space-y-3 ${className}`}>
      {[...Array(count)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderFormSkeleton = () => (
    <Card className={className}>
      <CardHeader>
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-4 w-2/3" />
      </CardHeader>
      <CardContent className="space-y-4">
        {[...Array(count || 5)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
        <div className="flex gap-2 pt-4">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-24" />
        </div>
      </CardContent>
    </Card>
  );

  const renderChartSkeleton = () => (
    <Card className={className}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-8 w-24" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Legend */}
          <div className="flex gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="h-3 w-3 rounded-full" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
          
          {/* Chart */}
          <Skeleton className="h-64 w-full" />
        </div>
      </CardContent>
    </Card>
  );

  const skeletonMap = {
    calculator: renderCalculatorSkeleton,
    dashboard: renderDashboardSkeleton,
    list: renderListSkeleton,
    form: renderFormSkeleton,
    chart: renderChartSkeleton
  };

  return skeletonMap[variant]();
};

// Componentes específicos para facilitar o uso
export const CalculatorSkeleton = () => (
  <EnhancedSkeletonLoader variant="calculator" />
);

export const DashboardSkeleton = () => (
  <EnhancedSkeletonLoader variant="dashboard" />
);

export const ListSkeleton = ({ count = 5 }: { count?: number }) => (
  <EnhancedSkeletonLoader variant="list" count={count} />
);

export const FormSkeleton = ({ fields = 5 }: { fields?: number }) => (
  <EnhancedSkeletonLoader variant="form" count={fields} />
);

export const ChartSkeleton = () => (
  <EnhancedSkeletonLoader variant="chart" />
);
