
import React, { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthContext } from "@/domains/auth";
import { AuthLoadingSpinner } from "./AuthLoadingSpinner";

interface ProtectedRouteProps {
  children: ReactNode;
  requirePro?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requirePro = false 
}) => {
  const { isAuthenticated, isPro, isLoading } = useAuthContext();
  const location = useLocation();

  // Show loading while checking authentication
  if (isLoading) {
    return <AuthLoadingSpinner message="Verificando autenticação..." />;
  }

  // Check if user is authenticated
  if (!isAuthenticated) {
    // Redirect to login, saving current path for later redirect
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Check if PRO plan is required
  if (requirePro && !isPro) {
    // Redirect to pricing page
    return <Navigate to="/planos" state={{ from: location }} replace />;
  }

  // User is authenticated (and has PRO plan if required)
  return <>{children}</>;
};

export default ProtectedRoute;
