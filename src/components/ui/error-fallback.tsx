
import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, ArrowLeft, Bug, Home, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";

interface ErrorFallbackProps {
  error?: Error;
  resetError?: () => void;
  variant?: "page" | "component" | "minimal";
}

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetError,
  variant = "page"
}) => {
  const handleReload = () => {
    window.location.reload();
  };

  if (variant === "minimal") {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800"
      >
        <AlertTriangle className="h-4 w-4 flex-shrink-0" />
        <span className="text-sm">Algo deu errado</span>
        {resetError && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetError}
            className="ml-auto h-6 px-2 text-red-600 hover:text-red-700"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        )}
      </motion.div>
    );
  }

  if (variant === "component") {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="p-6 text-center"
      >
        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="pt-6">
            <motion.div variants={itemVariants} className="flex flex-col items-center gap-4">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-red-900">Oops! Algo deu errado</h3>
                <p className="text-sm text-red-700">
                  Este componente encontrou um erro inesperado.
                </p>
              </div>
              {resetError && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetError}
                  className="border-red-200 text-red-700 hover:bg-red-50"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Tentar Novamente
                </Button>
              )}
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center p-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-lg w-full"
      >
        <Card className="border-red-200 shadow-xl">
          <CardHeader className="text-center pb-4">
            <motion.div variants={itemVariants} className="flex justify-center mb-4">
              <div className="p-4 bg-gradient-to-r from-red-100 to-red-200 rounded-full">
                <Bug className="h-12 w-12 text-red-600" />
              </div>
            </motion.div>
            <motion.div variants={itemVariants}>
              <CardTitle className="text-2xl font-bold text-red-900 mb-2">
                Oops! Algo deu errado
              </CardTitle>
              <CardDescription className="text-red-700">
                Encontramos um erro inesperado. Nossa equipe foi notificada e está trabalhando para resolver.
              </CardDescription>
            </motion.div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {error && process.env.NODE_ENV === 'development' && (
              <motion.div variants={itemVariants}>
                <details className="group">
                  <summary className="cursor-pointer text-sm text-red-600 hover:text-red-700 font-medium">
                    Detalhes técnicos (modo desenvolvimento)
                  </summary>
                  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded text-xs font-mono text-red-800 max-h-32 overflow-auto">
                    {error.message}
                  </div>
                </details>
              </motion.div>
            )}

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3">
              {resetError && (
                <Button
                  onClick={resetError}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Tentar Novamente
                </Button>
              )}
              <Button
                variant="outline"
                onClick={handleReload}
                className="flex-1 border-red-200 text-red-700 hover:bg-red-50"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Recarregar Página
              </Button>
            </motion.div>

            <motion.div variants={itemVariants} className="text-center pt-4 border-t border-red-100">
              <Link to="/">
                <Button variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                  <Home className="h-4 w-4 mr-2" />
                  Voltar ao Início
                </Button>
              </Link>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ErrorFallback;
