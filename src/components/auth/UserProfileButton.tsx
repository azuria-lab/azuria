
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthContext } from "@/domains/auth";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Building2, Crown, LogOut, Moon, Settings, Sun, User, Users } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { logger } from "@/services/logger";
import { useTheme } from "@/components/ui/theme-provider";
import { useProStatus } from "@/shared/hooks/useProStatus";

const UserProfileButton: React.FC = () => {
  // Read auth context at top-level (hooks must not be conditional)
  const auth = useAuthContext();
  const userProfile = auth?.userProfile ?? null;
  const isAuthenticated = auth?.isAuthenticated ?? false;
  const { isPro } = useProStatus();
  const isLoading = auth?.isLoading ?? false;
  const logout = auth?.logout ?? (async () => false);
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  
  const handleLogout = async () => {
    try {
      // Sempre tentar fazer logout - a função agora sempre retorna true
      await logout();
      
      // Mostrar mensagem de sucesso
      toast({
        title: "Sucesso",
        description: "Você saiu com sucesso!"
      });
      
      // Pequeno delay para garantir que o toast seja exibido
      setTimeout(() => {
        // Redirecionar para home após logout
        globalThis.location.href = "/";
      }, 300);
    } catch (error) {
      // Em caso de erro inesperado, ainda assim redirecionar
      logger.error("Erro ao fazer logout:", error);
      
      // Limpar localStorage manualmente em caso de erro
      try {
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("isPro");
        localStorage.removeItem("azuria-theme");
      } catch (storageError) {
        logger.warn("Erro ao limpar localStorage:", storageError);
      }
      
      // Redirecionar mesmo com erro
      setTimeout(() => {
        globalThis.location.href = "/";
      }, 300);
    }
  };
  
  // Don't show anything if there's no profile (Header handles auth buttons)
  if (!userProfile && !isLoading) {
    return null;
  }
  
  // Show loading state
  if (!userProfile && isLoading) {
    return (
      <Button 
        variant="ghost" 
        size="sm" 
        className="relative rounded-full h-8 w-8 p-0 overflow-hidden"
        disabled
      >
        <div className="w-4 h-4 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </Button>
    );
  }
  
  // Legacy fallback - if not authenticated, don't show button
  if (!isAuthenticated && !userProfile) {
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
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="relative rounded-full h-8 w-8 p-0 overflow-hidden"
          disabled={isLoading}
        >
          <Avatar className="h-8 w-8">
            {isLoading ? (
              <AvatarFallback className="bg-gray-200 dark:bg-gray-700 animate-pulse">
                <div className="w-4 h-4 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
              </AvatarFallback>
            ) : (
              <>
                <AvatarImage 
                  src={userProfile?.avatar_url || ""} 
                  alt={userProfile?.name || "Usuário"} 
                />
                <AvatarFallback className="bg-brand-100 text-brand-800">
                  {initials}
                </AvatarFallback>
              </>
            )}
          </Avatar>
          
          {isPro && (
            <span className="absolute -top-1 -right-1 bg-yellow-400 rounded-full w-4 h-4 flex items-center justify-center">
              <Crown className="h-3 w-3 text-yellow-800" />
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-72 bg-white dark:bg-gray-800 border shadow-lg z-50">
        {/* Header com logo e informações da empresa */}
        <div className="px-4 py-3 border-b">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <img 
                src="/images/azuria-logo-official.png" 
                alt="Azuria" 
                className="h-8 w-8 object-contain"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{userProfile?.name || "Usuário"}</p>
              <p className="text-xs text-muted-foreground truncate">{userProfile?.email}</p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="py-2">
          <Link to="/perfil">
            <DropdownMenuItem className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              Meu Perfil
            </DropdownMenuItem>
          </Link>
          
          <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/dados-empresa")}>
            <Building2 className="mr-2 h-4 w-4" />
            Dados da empresa
          </DropdownMenuItem>
          
          <Link to="/times">
            <DropdownMenuItem className="cursor-pointer">
              <Users className="mr-2 h-4 w-4" />
              Times
            </DropdownMenuItem>
          </Link>
          
          <Link to="/configuracoes">
            <DropdownMenuItem className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              Todas as configurações
            </DropdownMenuItem>
          </Link>
        </div>

        <DropdownMenuSeparator />

        {/* Plano */}
        <div className="px-4 py-3 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isPro ? (
                <>
                  <Crown className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium">Plano PRO</span>
                </>
              ) : (
                <span className="text-sm font-medium">Plano Gratuito</span>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => navigate("/planos")}
            >
              Gerenciar plano
            </Button>
          </div>
        </div>

        {/* Toggle Tema Escuro */}
        <div className="px-4 py-3 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {theme === "dark" ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
              <span className="text-sm">Tema escuro</span>
            </div>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                theme === "dark" ? "bg-primary" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  theme === "dark" ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Sair */}
        <div className="p-2">
          <DropdownMenuItem 
            className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950" 
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair da conta
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserProfileButton;
