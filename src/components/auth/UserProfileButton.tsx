
import React, { useEffect, useState } from "react";
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
import { Calculator, Crown, History, LogOut, Settings, UserCircle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const UserProfileButton: React.FC = () => {
  const [isReady, setIsReady] = useState(false);
  
  // Initialize safely
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 200);
    
    return () => clearTimeout(timer);
  }, []);

  // Safe auth context access
  const getAuthData = () => {
    if (!isReady) {
      return {
        userProfile: null,
        isAuthenticated: false,
        isPro: false,
        logout: async () => false
      };
    }
    
    try {
      return useAuthContext();
    } catch (error) {
      console.log("Auth context not ready yet");
      return {
        userProfile: null,
        isAuthenticated: false,
        isPro: false,
        logout: async () => false
      };
    }
  };

  const { userProfile, isAuthenticated, isPro, logout } = getAuthData();
  
  const handleLogout = async () => {
    try {
      const success = await logout();
      if (success) {
        toast.success("Você saiu com sucesso!");
      } else {
        toast.error("Erro ao sair. Tente novamente.");
      }
    } catch (error) {
      console.error("Error during logout:", error);
      toast.error("Erro ao sair. Tente novamente.");
    }
  };
  
  // Show loading state until ready
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
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="relative rounded-full h-8 w-8 p-0 overflow-hidden"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage 
              src={userProfile?.avatar_url || ""} 
              alt={userProfile?.name || "Usuário"} 
            />
            <AvatarFallback className="bg-brand-100 text-brand-800">
              {initials}
            </AvatarFallback>
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
