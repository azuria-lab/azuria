
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/domains/auth";
import Layout from "@/components/layout/Layout";
import DevControls from "@/components/dev/DevControls";
import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail, User } from "lucide-react";
import { logger } from "@/services/logger";

// Componente de ícone do Google
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
    <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
      <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
      <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
      <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
      <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
    </g>
  </svg>
);

const REMEMBER_ME_KEY = 'azuria_remember_credentials';

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { login, register, loginWithGoogle, isAuthenticated } = useAuthContext();

  // Carregar email e senha salvos ao montar o componente
  useEffect(() => {
    const savedData = localStorage.getItem(REMEMBER_ME_KEY);
    if (savedData) {
      try {
        // Tentar parsear como JSON (novo formato)
        const credentials = JSON.parse(savedData);
        if (credentials.email) {
          setEmail(credentials.email);
          if (credentials.password) {
            setPassword(credentials.password);
          }
          setRememberMe(true);
        }
      } catch {
        // Se falhar, pode ser o formato antigo (apenas email como string)
        // Manter compatibilidade com versões antigas
        const savedEmail = savedData;
        if (savedEmail && !savedEmail.startsWith('{')) {
          setEmail(savedEmail);
          setRememberMe(true);
        }
      }
    }
  }, []);

  // Redirecionar se já estiver autenticado
  useEffect(() => {
    logger.info("🔍 Login - useEffect de redirecionamento disparado", {
      isAuthenticated,
      locationState: location.state,
      locationPathname: location.pathname,
      timestamp: new Date().toISOString()
    });
    
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || "/dashboard";
      logger.info("🚀 isAuthenticated é TRUE! Redirecionando para:", from);
      
      // Redirecionar imediatamente
      navigate(from, { replace: true });
    } else {
      logger.info("⏸️ isAuthenticated é FALSE, não redirecionando");
    }
  }, [isAuthenticated, navigate, location]);

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
        logger.info("✅ Login realizado com sucesso", { 
          sessionId: session.user.id,
          email: session.user.email 
        });
        
        // Salvar ou remover email e senha baseado no checkbox "Lembrar conta"
        if (rememberMe) {
          const credentials = {
            email: email,
            password: password
          };
          localStorage.setItem(REMEMBER_ME_KEY, JSON.stringify(credentials));
        } else {
          localStorage.removeItem(REMEMBER_ME_KEY);
        }
        
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo de volta ao Azuria",
        });
        
        // Aguardar um pequeno delay para garantir que o estado seja propagado
        // antes de navegar, evitando que o ProtectedRoute bloqueie o acesso
        const from = location.state?.from?.pathname || "/dashboard";
        logger.info("🚀 Redirecionando para:", from);
        
        setTimeout(() => {
          setIsLoading(false);
          // Usar window.location para forçar navegação completa
          globalThis.location.href = from;
        }, 100);
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
      
      // Desligar loading em caso de erro
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
        logger.info("✅ Conta criada com sucesso", {
          userId: result.user?.id,
          email: result.user?.email
        });
        toast({
          title: "Conta criada com sucesso!",
          description: "Você já pode usar o Azuria. Bem-vindo!",
        });
        
        // Aguardar um pequeno delay para garantir que o estado seja propagado
        const from = location.state?.from?.pathname || "/dashboard";
        logger.info("🚀 Redirecionando para:", from);
        
        setTimeout(() => {
          setIsLoading(false);
          // Usar window.location para forçar navegação completa
          globalThis.location.href = from;
        }, 100);
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
      
      // Desligar loading em caso de erro
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      logger.info("🔐 Tentando login com Google...");
      
      const result = await loginWithGoogle();
      
      if (result) {
        // Se retornou uma URL, o redirecionamento será feito automaticamente
        // Não precisamos fazer nada aqui, o navegador será redirecionado
        logger.info("✅ Redirecionamento para Google iniciado - usuário será redirecionado");
        // Não definir setIsLoading(false) aqui pois a página será redirecionada
      } else {
        // Se não retornou resultado, pode ter havido um erro
        logger.warn("⚠️ loginWithGoogle retornou null/undefined");
        setIsLoading(false);
        toast({
          title: "Erro no login com Google",
          description: "Não foi possível iniciar o login com Google. Verifique as configurações e tente novamente.",
          variant: "destructive",
        });
      }
    } catch (error) {
      logger.error("❌ Erro no login com Google:", { error });
      
      setIsLoading(false);
      toast({
        title: "Erro no login com Google",
        description: "Não foi possível conectar com o Google. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-brand-50 via-background to-blue-50 dark:from-gray-900 dark:via-background dark:to-blue-900 flex items-center justify-center py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Controles de desenvolvimento */}
          {isAuthenticated && <DevControls />}
          
          <Card className="border-0 shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl">
            <CardHeader className="text-center pb-4">
              <div className="w-auto h-24 mx-auto mb-4 flex items-center justify-center">
                <img 
                  src="/images/azuria-logo-official.png" 
                  alt="Azuria Logo" 
                  className="h-full w-auto object-contain"
                />
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
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remember-me"
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(checked === true)}
                        disabled={isLoading}
                      />
                      <Label
                        htmlFor="remember-me"
                        className="text-sm font-normal text-gray-700 dark:text-gray-300 cursor-pointer"
                      >
                        Lembrar conta
                      </Label>
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

                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-300 dark:border-gray-600" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white dark:bg-gray-800 px-2 text-gray-500">
                          Ou continue com
                        </span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-12 border-2 hover:bg-gray-50 dark:hover:bg-gray-700"
                      onClick={handleGoogleLogin}
                      disabled={isLoading}
                    >
                      <GoogleIcon />
                      <span className="ml-2">Entrar com Google</span>
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

                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-300 dark:border-gray-600" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white dark:bg-gray-800 px-2 text-gray-500">
                          Ou continue com
                        </span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-12 border-2 hover:bg-gray-50 dark:hover:bg-gray-700"
                      onClick={handleGoogleLogin}
                      disabled={isLoading}
                    >
                      <GoogleIcon />
                      <span className="ml-2">Cadastrar com Google</span>
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
              
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Ao criar uma conta, você concorda com nossos{" "}
                  <Link to="/terms" className="text-brand-600 hover:text-brand-700">
                    Termos de Uso
                  </Link>{" "}
                  e{" "}
                  <Link to="/privacy" className="text-brand-600 hover:text-brand-700">
                    Política de Privacidade
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
}
