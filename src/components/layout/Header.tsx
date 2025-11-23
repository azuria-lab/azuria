
import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/domains/auth";
import UserProfileButton from "@/components/auth/UserProfileButton";
import SmartNotificationCenter from "@/components/notifications/SmartNotificationCenter";
import { useFilteredNavLinks } from "./header/NavLinks";
import DesktopNavigation from "./header/DesktopNavigation";
import MobileNavigation from "./header/MobileNavigation";
import { useProStatus } from "@/hooks/useProStatus";
import { logger } from "@/services/logger";
import { ThemeToggle } from "@/components/theme/ThemeToggle";


export default function Header() {
  const [mounted, setMounted] = React.useState(false);
  const { isPro } = useProStatus();
  useLocation();
  const authContext = useAuthContext();
  
  // Extrair valores de forma reativa
  const isAuthenticated = authContext?.isAuthenticated || false;
  const userProfile = authContext?.userProfile;
  const isLoadingProfile = authContext?.isLoading || false;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Log de debug apenas quando necessário
  useEffect(() => {
    logger.info('🔍 Header - Auth State:', {
      isAuthenticated,
      hasProfile: !!userProfile,
      profileName: userProfile?.name,
      isLoadingProfile,
    });
  }, [isAuthenticated, userProfile, isLoadingProfile]);

  useFilteredNavLinks(isAuthenticated, isPro);

  if (!mounted) {
    return (
      <header className="sticky top-0 z-40 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container flex h-16 items-center justify-center">
          <div className="animate-pulse h-8 w-24 bg-gray-200 rounded" />
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center justify-center">
        {/* Desktop Navigation - Centralizado */}
        <div data-testid="desktop-navigation" className="flex-1 flex justify-center">
          <DesktopNavigation isAuthenticated={isAuthenticated} isPro={isPro} />
        </div>

        {/* Right side items */}
        <div className="flex items-center space-x-3">
          
          {/* Theme Toggle - Dark Mode */}
          <ThemeToggle />
          
          {/* Notificações (apenas para usuários logados com perfil) */}
          {userProfile && <SmartNotificationCenter />}
          
          {/* User Profile Button - mostrar se tem perfil carregado */}
          {userProfile && <UserProfileButton />}
          
          {/* Loading state - mostrar spinner se está carregando e autenticado */}
          {!userProfile && isAuthenticated && isLoadingProfile && (
            <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
          )}
          
          {/* Auth buttons - mostrar APENAS se não tem perfil E não está autenticado E não está carregando */}
          {!userProfile && !isAuthenticated && !isLoadingProfile && (
            <div className="hidden md:flex items-center space-x-3">
              <Link to="/login">
                <Button variant="ghost" size="sm" className="text-[#0A1930] hover:text-[#005BFF]">
                  Login
                </Button>
              </Link>
              <Link to="/cadastro">
                <Button size="sm" className="bg-[#005BFF] hover:bg-[#0048CC] text-white">
                  Começar grátis
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Navigation */}
          <div data-testid="mobile-navigation">
            <MobileNavigation isAuthenticated={isAuthenticated} isPro={isPro} />
          </div>
        </div>
      </div>
      {/* Mobile Navigation now handled by component above */}
    </header>
  );
}
