
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuthContext } from "@/domains/auth";
import { logger } from "@/services/logger";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calculator, Crown, History, LayoutDashboard, LogOut, Settings, Sparkles, User } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { getFirstName } from "@/utils/greetings";

const UserProfileButton: React.FC = () => {
  const [isReady, setIsReady] = useState(false);
  
  // Initialize safely
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 50);
    
    return () => clearTimeout(timer);
  }, []);

  // Read auth context at top-level (hooks must not be conditional)
  const auth = useAuthContext();
  const userProfile = auth?.userProfile ?? null;
  const isPro = auth?.isPro ?? false;
  const logout = auth?.logout ?? (async () => false);
  
  // Check both auth context and localStorage for authentication state
  const isAuthenticatedFromContext = auth?.isAuthenticated ?? false;
  const isAuthenticatedFromStorage = globalThis.window !== undefined && 
    localStorage.getItem('azuria_authenticated') === 'true';
  const isAuthenticated = isAuthenticatedFromContext || isAuthenticatedFromStorage;
  
  const handleLogout = async () => {
    try {
      logger.info("🔴 Iniciando logout...");
      const success = await logout();
      logger.info("🔴 Logout retornou:", { success });
      
      if (success) {
        // Limpar TUDO do storage (o logout() já limpou alguns itens)
        localStorage.clear();
        sessionStorage.clear();
        
        toast({
          title: "Você saiu com sucesso!",
          description: "Redirecionando...",
        });
        
        // Forçar reload da home
        setTimeout(() => {
          logger.info("Redirecionando para home após logout");
          globalThis.window.location.replace('/');
        }, 300);
      } else {
        logger.error("🔴 Logout falhou");
        toast({
          title: "Erro ao sair",
          description: "Tente novamente.",
          variant: "destructive",
        });
      }
    } catch (error) {
      logger.error("🔴 Erro no logout:", error);
      toast({
        title: "Erro ao sair",
        description: "Tente novamente.",
        variant: "destructive",
      });
    }
  };  // Show loading state until ready
  if (!isReady) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        disabled
        className="border-brand-200 text-brand-700 hover:bg-brand-50 dark:border-brand-800 dark:text-brand-300 dark:hover:bg-brand-900"
      >
        <div className="animate-pulse">Carregando...</div>
      </Button>
    );
  }
  
  // Show login button if not authenticated
  if (!isAuthenticated) {
    return (
      <Link to="/login">
        <Button 
          variant="outline" 
          size="sm" 
          className="border-brand-200 text-brand-700 hover:bg-brand-50 dark:border-brand-800 dark:text-brand-300 dark:hover:bg-brand-900"
        >
          Entrar
        </Button>
      </Link>
    );
  }
  
  // Extract initials for avatar fallback
  const initials = userProfile?.name
    ? userProfile.name
        .split(" ")
        .map(n => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";
  
  // Get first name only (no greeting)
  const firstName = getFirstName(userProfile?.name);
  const displayName = firstName || "Usuário";
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="relative flex items-center gap-2 rounded-full px-2 h-10 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <Avatar className="h-9 w-9 ring-2 ring-brand-200 dark:ring-brand-700">
            <AvatarImage 
              src={userProfile?.avatar_url || ""} 
              alt={userProfile?.name || "Usuário"} 
            />
            <AvatarFallback className="bg-gradient-to-br from-brand-500 to-brand-600 text-white font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          {/* Nome do usuário (desktop only) - SEM saudação */}
          <div className="hidden md:flex flex-col items-start">
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {displayName}
            </span>
            {isPro && (
              <span className="text-xs flex items-center gap-1 text-yellow-600 dark:text-yellow-500">
                <Crown className="h-3 w-3" />
                PRO
              </span>
            )}
          </div>
          
          {/* Badge PRO (mobile - no avatar) */}
          {isPro && (
            <span className="md:hidden absolute -top-1 -right-1 bg-yellow-400 rounded-full w-4 h-4 flex items-center justify-center">
              <Crown className="h-3 w-3 text-yellow-800" />
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-64 bg-white dark:bg-gray-800 border shadow-lg z-50">
        <DropdownMenuLabel className="flex flex-col py-3">
          <span className="font-semibold text-base">{userProfile?.name || "Usuário"}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">{userProfile?.email}</span>
          {isPro && (
            <span className="text-xs mt-2 px-2 py-1 bg-yellow-50 dark:bg-yellow-900/20 rounded-md flex items-center gap-1 text-yellow-700 dark:text-yellow-500 w-fit">
              <Crown className="h-3 w-3" />
              <span className="font-medium">Plano PRO Ativo</span>
            </span>
          )}
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <Link to="/dashboard">
          <DropdownMenuItem className="cursor-pointer hover:bg-brand-50 dark:hover:bg-brand-900/20">
            <LayoutDashboard className="mr-2 h-4 w-4 text-brand-600" />
            <span>Dashboard</span>
          </DropdownMenuItem>
        </Link>
        
        <Link to="/calculadora-simples">
          <DropdownMenuItem className="cursor-pointer hover:bg-brand-50 dark:hover:bg-brand-900/20">
            <Calculator className="mr-2 h-4 w-4 text-brand-600" />
            <span>Calculadora</span>
          </DropdownMenuItem>
        </Link>
        
        <Link to="/historico">
          <DropdownMenuItem className="cursor-pointer hover:bg-brand-50 dark:hover:bg-brand-900/20">
            <History className="mr-2 h-4 w-4 text-brand-600" />
            <span>Histórico</span>
          </DropdownMenuItem>
        </Link>
        
        <DropdownMenuSeparator />
        
        <Link to="/perfil">
          <DropdownMenuItem className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
            <User className="mr-2 h-4 w-4" />
            <span>Meu Perfil</span>
          </DropdownMenuItem>
        </Link>
        
        <Link to="/configuracoes">
          <DropdownMenuItem className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
            <Settings className="mr-2 h-4 w-4" />
            <span>Configurações</span>
          </DropdownMenuItem>
        </Link>
        
        {!isPro && (
          <>
            <DropdownMenuSeparator />
            <Link to="/planos">
              <DropdownMenuItem className="cursor-pointer bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/10 dark:to-amber-900/10 hover:from-yellow-100 hover:to-amber-100">
                <Sparkles className="mr-2 h-4 w-4 text-yellow-600" />
                <span className="font-medium text-yellow-700 dark:text-yellow-500">Upgrade para PRO</span>
              </DropdownMenuItem>
            </Link>
          </>
        )}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem className="cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserProfileButton;
