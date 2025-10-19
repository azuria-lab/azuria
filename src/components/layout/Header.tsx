
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


export default function Header() {
  const [mounted, setMounted] = React.useState(false);
  const { isPro } = useProStatus();
  useLocation();
  const authContext = useAuthContext();
  
  // Check both auth context and localStorage for authentication state
  const isAuthenticatedFromContext = authContext?.isAuthenticated || false;
  const isAuthenticatedFromStorage = typeof window !== 'undefined' && 
    localStorage.getItem('azuria_authenticated') === 'true';
  const isAuthenticated = isAuthenticatedFromContext || isAuthenticatedFromStorage;

  useEffect(() => {
    setMounted(true);
  }, []);

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
          
          {/* Notificações (apenas para usuários logados) */}
          {isAuthenticated && <SmartNotificationCenter />}
          
          {/* User Profile or Auth buttons */}
          {isAuthenticated ? (
            <UserProfileButton />
          ) : (
            <div className="hidden md:flex items-center space-x-2">
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Entrar
                </Button>
              </Link>
              <Link to="/cadastro">
                <Button size="sm" className="bg-brand-600 hover:bg-brand-700">
                  Cadastro Grátis
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
