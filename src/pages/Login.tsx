
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/domains/auth";
import Layout from "@/components/layout/Layout";
import DevControls from "@/components/dev/DevControls";
import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail, User } from "lucide-react";
import { logger } from "@/services/logger";

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { login, register, isAuthenticated } = useAuthContext();

  // Redirecionar se já estiver autenticado
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location.state]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha email e senha.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      logger.info("🔐 Tentando fazer login...", { email });
      const session = await login(email, password);
      
      if (session) {
        logger.info("✅ Login realizado com sucesso");
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo de volta ao Azuria",
        });
        
        // Aguardar um pouco para garantir que o estado foi atualizado
        setTimeout(() => {
          const from = location.state?.from?.pathname || "/dashboard";
          navigate(from, { replace: true });
        }, 500);
      } else {
        throw new Error("Falha no login - sessão não criada");
      }
    } catch (error) {
      logger.error("❌ Erro no login:", { error });
      
      // Mensagens de erro mais amigáveis
      let errorMessage = "Verifique suas credenciais e tente novamente.";
      const msg = (error as Error)?.message ?? "";
      if (msg.includes("Invalid login credentials")) {
        errorMessage = "Email ou senha incorretos. Verifique suas credenciais.";
      } else if (msg.includes("Email not confirmed")) {
        errorMessage = "Por favor, confirme seu email antes de fazer login.";
      } else if (msg.includes("Too many requests")) {
        errorMessage = "Muitas tentativas de login. Tente novamente em alguns minutos.";
      }
      
      toast({
        title: "Erro no login",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !name) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      logger.info("🔐 Tentando criar conta...", { email });
      const result = await register(email, password, name);
      
      if (result) {
        logger.info("✅ Conta criada com sucesso");
        toast({
          title: "Conta criada com sucesso!",
          description: "Você já pode usar o Azuria. Bem-vindo!",
        });
        
        // Aguardar um pouco para garantir que o estado foi atualizado
        setTimeout(() => {
          const from = location.state?.from?.pathname || "/dashboard";
          navigate(from, { replace: true });
        }, 500);
      } else {
        throw new Error("Falha no cadastro");
      }
  } catch (error) {
    logger.error("❌ Erro no cadastro:", { error });
      
      // Mensagens de erro mais amigáveis
  let errorMessage = (error as Error)?.message || "Erro ao criar conta. Tente novamente.";
    const msg = (error as Error)?.message ?? "";
    if (msg.includes("User already registered")) {
        errorMessage = "Este email já está cadastrado. Tente fazer login.";
    } else if (msg.includes("Password should be at least 6 characters")) {
        errorMessage = "A senha deve ter pelo menos 6 caracteres.";
    } else if (msg.includes("Invalid email")) {
        errorMessage = "Por favor, insira um email válido.";
    } else if (msg.toLowerCase().includes("redirect") || msg.toLowerCase().includes("verified url")) {
        errorMessage = "URL de redirecionamento não autorizada no Supabase. Adicione http://localhost:8081 em Authentication → URL Configuration (Site URL e Redirect URLs).";
      }
      
      toast({
        title: "Erro no cadastro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 flex items-center justify-center py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Controles de desenvolvimento */}
          {isAuthenticated && <DevControls />}
          
          <Card className="border-0 shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-brand-500 to-brand-600 rounded-2xl flex items-center justify-center">
                <div className="text-2xl font-bold text-white">A</div>
              </div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-brand-600 to-brand-700 bg-clip-text text-transparent">
                Entrar no Azuria
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                Acesse sua conta ou crie uma nova para começar a maximizar seus lucros
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue={location.pathname === '/cadastro' ? 'register' : 'login'} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100 dark:bg-gray-700">
                  <TabsTrigger value="login" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600">
                    Entrar
                  </TabsTrigger>
                  <TabsTrigger value="register" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600">
                    Cadastrar
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">
                        Email
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="seu@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          disabled={isLoading}
                          className="pl-10 h-12"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">
                        Senha
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          disabled={isLoading}
                          minLength={6}
                          className="pl-10 pr-10 h-12"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                          disabled={isLoading}
                          aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full h-12 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-medium group"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Entrando...
                        </>
                      ) : (
                        <>
                          Entrar
                          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="register">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">
                        Nome
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="name"
                          type="text"
                          placeholder="Seu nome"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          disabled={isLoading}
                          minLength={2}
                          className="pl-10 h-12"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email-register" className="text-gray-700 dark:text-gray-300">
                        Email
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="email-register"
                          type="email"
                          placeholder="seu@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          disabled={isLoading}
                          className="pl-10 h-12"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password-register" className="text-gray-700 dark:text-gray-300">
                        Senha
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="password-register"
                          type={showPassword ? "text" : "password"}
                          placeholder="Mínimo 6 caracteres"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          disabled={isLoading}
                          minLength={6}
                          className="pl-10 pr-10 h-12"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                          disabled={isLoading}
                          aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full h-12 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-medium group"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Criando conta...
                        </>
                      ) : (
                        <>
                          Criar conta
                          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
              
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Ao criar uma conta, você concorda com nossos{" "}
                  <a href="#" className="text-brand-600 hover:text-brand-700">
                    Termos de Uso
                  </a>{" "}
                  e{" "}
                  <a href="#" className="text-brand-600 hover:text-brand-700">
                    Política de Privacidade
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
}
