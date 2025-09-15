
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
import { OptimizedImage } from "@/components/performance/OptimizedImage";


export default function Header() {
  const [mounted, setMounted] = React.useState(false);
  const { isPro } = useProStatus();
  useLocation();
  const authContext = useAuthContext();
  const isAuthenticated = authContext?.isAuthenticated || false;

  useEffect(() => {
    setMounted(true);
  }, []);

  useFilteredNavLinks(isAuthenticated, isPro);


  if (!mounted) {
    return (
      <header className="sticky top-0 z-40 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2">
            <OptimizedImage 
              src="/lovable-uploads/f326ff5a-6129-4295-99bd-d185851a20a3.png" 
              alt="Logo Azuria+" 
              className="h-6 w-auto md:h-8" 
              width={112} 
              height={32} 
              lazy={false} 
            />
            </Link>
          </div>
          <div className="animate-pulse h-8 w-24 bg-gray-200 rounded" />
        </div>
      </header>
    );
  }

  // const isActivePath = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/" className="flex items-center space-x-2">
            <OptimizedImage 
              src="/lovable-uploads/f326ff5a-6129-4295-99bd-d185851a20a3.png" 
              alt="Logo Azuria+" 
              className="h-6 w-auto md:h-8" 
              width={112} 
              height={32} 
              lazy={false} 
            />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div data-testid="desktop-navigation">
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
