import React from "react";
import DashboardLayout from "./DashboardLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

interface DashboardRouteProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  requirePro?: boolean;
}

/**
 * Wrapper component that combines ProtectedRoute and DashboardLayout
 * Use this for all routes that should be inside the dashboard
 */
export default function DashboardRoute({
  children,
  title,
  description,
  requirePro = false,
}: DashboardRouteProps) {
  return (
    <ProtectedRoute requirePro={requirePro}>
      <DashboardLayout title={title} description={description}>
        {children}
      </DashboardLayout>
    </ProtectedRoute>
  );
}

