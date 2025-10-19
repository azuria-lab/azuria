import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "@/components/layout/Layout";
import { useAuthContext } from "@/domains/auth";
import { logger } from "@/services/logger";

export default function EmailConfirmado() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthContext();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Confirmando seu email...");

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        // Verificar se há um token de confirmação na URL
        const token = searchParams.get("token");
        const type = searchParams.get("type");
        const error = searchParams.get("error");
        const errorDescription = searchParams.get("error_description");

        logger.info("📧 Processando confirmação de email", { 
          token: token ? "presente" : "ausente", 
          type,
          error,
          errorDescription
        });

        // Se houver erro nos parâmetros
        if (error) {
          setStatus("error");
          setMessage(errorDescription || "Erro ao confirmar email. O link pode ter expirado.");
          return;
        }

        // Se for uma confirmação de email bem-sucedida
        if (type === "signup" || type === "email_confirmation") {
          setStatus("success");
          setMessage("Email confirmado com sucesso!");
          
          // Redirecionar após 3 segundos
          setTimeout(() => {
            if (isAuthenticated) {
              navigate("/dashboard");
            } else {
              navigate("/entrar");
            }
          }, 3000);
        } else {
          // Caso padrão: considerar sucesso
          setStatus("success");
          setMessage("Email confirmado com sucesso!");
          
          setTimeout(() => {
            navigate(isAuthenticated ? "/dashboard" : "/entrar");
          }, 3000);
        }
      } catch (error) {
        logger.error("❌ Erro ao processar confirmação de email:", error);
        setStatus("error");
        setMessage("Ocorreu um erro ao confirmar seu email. Por favor, tente novamente.");
      }
    };

    confirmEmail();
  }, [searchParams, navigate, isAuthenticated]);

  const handleContinue = () => {
    navigate(isAuthenticated ? "/dashboard" : "/entrar");
  };

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="w-full max-w-md shadow-lg">
            <CardContent className="pt-12 pb-8 px-8">
              <div className="flex flex-col items-center text-center space-y-6">
                {/* Ícone de Status */}
                {status === "loading" && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Loader2 className="h-16 w-16 text-brand-500" />
                  </motion.div>
                )}

                {status === "success" && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 260, 
                      damping: 20,
                      delay: 0.1 
                    }}
                  >
                    <CheckCircle2 className="h-16 w-16 text-green-500" />
                  </motion.div>
                )}

                {status === "error" && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 260, 
                      damping: 20 
                    }}
                  >
                    <XCircle className="h-16 w-16 text-red-500" />
                  </motion.div>
                )}

                {/* Título e Mensagem */}
                <div className="space-y-2">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {status === "loading" && "Confirmando Email"}
                    {status === "success" && "Email Confirmado!"}
                    {status === "error" && "Erro na Confirmação"}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300">
                    {message}
                  </p>
                </div>

                {/* Informações Adicionais */}
                {status === "success" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="w-full space-y-4"
                  >
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                      <p className="text-sm text-green-800 dark:text-green-300">
                        ✅ Sua conta foi ativada com sucesso!
                        <br />
                        🚀 Você já pode usar todos os recursos da Azuria.
                      </p>
                    </div>

                    <Button
                      onClick={handleContinue}
                      className="w-full h-12 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-medium group"
                    >
                      {isAuthenticated ? "Ir para Dashboard" : "Fazer Login"}
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </motion.div>
                )}

                {status === "error" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="w-full space-y-4"
                  >
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                      <p className="text-sm text-red-800 dark:text-red-300">
                        Se o problema persistir, entre em contato com o suporte.
                      </p>
                    </div>

                    <Button
                      onClick={handleContinue}
                      variant="outline"
                      className="w-full h-12"
                    >
                      Voltar para o Login
                    </Button>
                  </motion.div>
                )}

                {status === "loading" && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Por favor, aguarde alguns instantes...
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
}
