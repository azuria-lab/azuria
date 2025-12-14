
import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useAuthContext } from "@/domains/auth";
import UserProfileButton from "@/components/auth/UserProfileButton";
import SmartNotificationCenter from "@/components/notifications/SmartNotificationCenter";
import { useFilteredNavLinks } from "./header/NavLinks";
import DesktopNavigation from "./header/DesktopNavigation";
import MobileNavigation from "./header/MobileNavigation";
import { useProStatus } from "@/shared/hooks/useProStatus";
import { logger } from "@/services/logger";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import HeaderLogo from "./header/HeaderLogo";


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
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="flex-shrink-0 mr-6">
            <HeaderLogo />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="animate-pulse h-8 w-24 bg-muted rounded" />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4 sm:px-6">
        {/* Logo - Left side */}
        <div className="flex-shrink-0 mr-3 sm:mr-6">
          <HeaderLogo />
        </div>

        {/* Desktop Navigation - Centered */}
        <div data-testid="desktop-navigation" className="hidden md:flex flex-1 justify-center">
          <DesktopNavigation isAuthenticated={isAuthenticated} isPro={isPro} />
        </div>

        {/* Right side items */}
        <div className="flex items-center gap-2 sm:gap-3 ml-auto">
          
          {/* Theme Toggle - Dark Mode */}
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>
          
          {/* Notificações (apenas para usuários logados com perfil) */}
          {userProfile && <SmartNotificationCenter />}
          
          {/* User Profile Button - mostrar se tem perfil carregado */}
          {userProfile && <UserProfileButton />}
          
          {/* Loading state - mostrar spinner se está carregando e autenticado */}
          {!userProfile && isAuthenticated && isLoadingProfile && (
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          )}
          
          {/* Auth buttons - mostrar APENAS se não tem perfil E não está autenticado E não está carregando */}
          {!userProfile && !isAuthenticated && !isLoadingProfile && (
            <div className="hidden md:flex items-center space-x-3">
              <Link to="/login">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-9 px-4 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200"
                  >
                    Login
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </motion.div>
              </Link>
              <Link to="/cadastro">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    size="sm" 
                    className="h-9 px-4 text-sm font-medium bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-all duration-200"
                  >
                    Começar grátis
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </motion.div>
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
