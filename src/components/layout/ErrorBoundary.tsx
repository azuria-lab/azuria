
import React, { Component, ErrorInfo, ReactNode } from "react";
import { ErrorFallback } from "@/components/ui/error-fallback";

interface Props {
  children: ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
  variant?: "page" | "component" | "minimal";
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { 
      hasError: true, 
      error,
      errorInfo: null
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    
    // Log error to monitoring service
    if (typeof window !== 'undefined' && (window as any).__AZURIA_ERROR_HANDLER__) {
      (window as any).__AZURIA_ERROR_HANDLER__(error, errorInfo);
    }

    this.setState({
      error,
      errorInfo
    });
  }

  private resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  public render() {
    if (this.state.hasError && this.state.error) {
      // Custom fallback component
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
      }

      // Default fallback
      return (
        <ErrorFallback
          error={this.state.error}
          resetError={this.resetError}
          variant={this.props.variant || "page"}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
