
import React from "react";
import { Link } from "react-router-dom";
import { useAuthContext } from "@/domains/auth";
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
import { Calculator, Crown, History, LogOut, Settings } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { logger } from "@/services/logger";

const UserProfileButton: React.FC = () => {
  // Read auth context at top-level (hooks must not be conditional)
  const auth = useAuthContext();
  const userProfile = auth?.userProfile ?? null;
  const isAuthenticated = auth?.isAuthenticated ?? false;
  const isPro = auth?.isPro ?? false;
  const isLoading = auth?.isLoading ?? false;
  const logout = auth?.logout ?? (async () => false);
  
  const handleLogout = async () => {
    try {
      const success = await logout();
      if (success) {
        toast({
          title: "Sucesso",
          description: "Você saiu com sucesso!"
        });
        // Redirecionar para home após logout
        globalThis.location.href = "/";
      } else {
        toast({
          title: "Erro",
          description: "Erro ao sair. Tente novamente.",
          variant: "destructive"
        });
      }
    } catch (error) {
      logger.error("Erro ao fazer logout:", error);
      toast({
        title: "Erro",
        description: "Erro ao sair. Tente novamente.",
        variant: "destructive"
      });
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
      
      <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-gray-800 border shadow-lg z-50">
        <DropdownMenuLabel className="flex flex-col">
          <span className="font-medium">{userProfile?.name || "Usuário"}</span>
          <span className="text-xs text-gray-500 truncate">{userProfile?.email}</span>
          {isPro && (
            <span className="text-xs mt-1 flex items-center gap-1 text-yellow-600">
              <Crown className="h-3 w-3" />
              <span>Plano PRO</span>
            </span>
          )}
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <Link to="/calculadora-simples">
          <DropdownMenuItem className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
            <Calculator className="mr-2 h-4 w-4" />
            Calculadora
          </DropdownMenuItem>
        </Link>
        
        <Link to="/historico">
          <DropdownMenuItem className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
            <History className="mr-2 h-4 w-4" />
            Histórico
          </DropdownMenuItem>
        </Link>
        
        <DropdownMenuSeparator />
        
        <Link to="/configuracoes">
          <DropdownMenuItem className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
            <Settings className="mr-2 h-4 w-4" />
            Configurações
          </DropdownMenuItem>
        </Link>
        
        <DropdownMenuItem className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserProfileButton;
