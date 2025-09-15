// Unified error boundary with hierarchical fallbacks
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Bug, Home, RefreshCw } from 'lucide-react';
import { logger } from '@/services/logger';

interface Props {
  children: ReactNode;
  variant?: 'page' | 'component' | 'critical';
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  retryCount: number;
}

export class UnifiedErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;
  private timeoutId?: NodeJS.Timeout;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { variant = 'component', onError } = this.props;
    
  // Log error with context
  logger.error(`[ErrorBoundary:${variant}]`, {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      retryCount: this.state.retryCount
    });

    this.setState({
      error,
      errorInfo
    });

    // Call custom error handler
    onError?.(error, errorInfo);

    // Auto-retry for non-critical errors
    if (variant !== 'critical' && this.state.retryCount < this.maxRetries) {
      this.timeoutId = setTimeout(() => {
        this.handleRetry();
      }, 2000 * (this.state.retryCount + 1)); // Exponential backoff
    }
  }

  componentWillUnmount() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      retryCount: prevState.retryCount + 1
    }));
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      retryCount: 0
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  renderErrorUI() {
    const { variant = 'component', showDetails = false } = this.props;
    const { error, errorInfo, retryCount } = this.state;

    // Custom fallback if provided
    if (this.props.fallback) {
      return this.props.fallback;
    }

    const canRetry = retryCount < this.maxRetries;
    const errorMessage = error?.message || 'Ocorreu um erro inesperado';

    switch (variant) {
      case 'critical':
        return (
          <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
                <CardTitle className="text-destructive">Erro Crítico</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  A aplicação encontrou um erro crítico e precisa ser recarregada.
                </p>
                {showDetails && error && (
                  <details className="text-xs">
                    <summary className="cursor-pointer font-medium">Detalhes técnicos</summary>
                    <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                      {error.message}
                      {error.stack && `\n\n${error.stack}`}
                    </pre>
                  </details>
                )}
                <div className="space-y-2">
                  <Button onClick={this.handleReload} className="w-full" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Recarregar Aplicação
                  </Button>
                  <Button onClick={this.handleGoHome} variant="outline" className="w-full" size="sm">
                    <Home className="h-4 w-4 mr-2" />
                    Ir para Início
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'page':
        return (
          <div className="container mx-auto px-4 py-8">
            <Card className="max-w-lg mx-auto">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
                  <Bug className="h-5 w-5 text-destructive" />
                </div>
                <CardTitle>Erro na Página</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  {errorMessage}
                </p>
                {showDetails && errorInfo && (
                  <details className="text-xs">
                    <summary className="cursor-pointer font-medium">Detalhes do erro</summary>
                    <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto max-h-32">
                      {errorInfo.componentStack}
                    </pre>
                  </details>
                )}
                <div className="flex gap-2">
                  {canRetry && (
                    <Button onClick={this.handleRetry} className="flex-1" size="sm">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Tentar Novamente
                    </Button>
                  )}
                  <Button onClick={this.handleGoHome} variant="outline" className="flex-1" size="sm">
                    <Home className="h-4 w-4 mr-2" />
                    Início
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'component':
      default:
        return (
          <Card className="border-destructive/20 bg-destructive/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                  <Bug className="h-4 w-4 text-destructive" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-destructive">
                    Componente com erro
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {errorMessage}
                  </p>
                </div>
                {canRetry && (
                  <Button onClick={this.handleRetry} size="sm" variant="outline">
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                )}
              </div>
              {showDetails && error?.stack && (
                <details className="mt-3">
                  <summary className="text-xs cursor-pointer">Stack trace</summary>
                  <pre className="text-xs mt-1 p-2 bg-muted rounded overflow-auto max-h-24">
                    {error.stack}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        );
    }
  }

  render() {
    if (this.state.hasError) {
      return this.renderErrorUI();
    }

    return this.props.children;
  }
}

// Convenience exports for different variants
export const PageErrorBoundary = (props: Omit<Props, 'variant'>) => (
  <UnifiedErrorBoundary {...props} variant="page" />
);

export const ComponentErrorBoundary = (props: Omit<Props, 'variant'>) => (
  <UnifiedErrorBoundary {...props} variant="component" />
);

export const CriticalErrorBoundary = (props: Omit<Props, 'variant'>) => (
  <UnifiedErrorBoundary {...props} variant="critical" />
);

export default UnifiedErrorBoundary;