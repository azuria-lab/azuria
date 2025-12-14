
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight, Menu, X } from 'lucide-react';
import { useFilteredNavLinks } from './NavLinks';

interface MobileNavigationProps {
  isAuthenticated: boolean;
  isPro: boolean;
}

export default function MobileNavigation({ isAuthenticated, isPro }: MobileNavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const filteredLinks = useFilteredNavLinks(isAuthenticated, isPro);

  // Fecha o menu mobile quando mudar de página
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location?.pathname]);

  return (
    <div className="md:hidden">
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label={mobileMenuOpen ? "Fechar menu" : "Abrir menu"}
        className="h-9 w-9 hover:bg-accent transition-all duration-200"
      >
        {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="fixed top-16 left-0 right-0 bottom-0 border-t border-border bg-background z-50 overflow-y-auto"
        >
          <div className="container py-4 px-4 space-y-1">
            {filteredLinks.map((link) => {
              const isActive = location?.pathname === link.path;
              const isAnchor = link.path.startsWith('#');
              
              if (isAnchor) {
                return (
                  <a
                    key={link.path}
                    href={link.path}
                    onClick={(e) => {
                      e.preventDefault();
                      setMobileMenuOpen(false);
                      const element = document.querySelector(link.path);
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }}
                    className="block"
                  >
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className={`w-full justify-start h-12 min-h-[44px] text-base font-medium transition-all duration-200 ${
                        isActive 
                          ? "bg-accent text-foreground" 
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      }`}
                    >
                      {link.icon}
                      <span className="ml-3">{link.label}</span>
                    </Button>
                  </a>
                );
              }
              
              return (
                <Link key={link.path} to={link.path} className="block">
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={`w-full justify-start h-12 min-h-[44px] text-base font-medium transition-all duration-200 ${
                      isActive 
                        ? "bg-accent text-foreground" 
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}
                  >
                    {link.icon}
                    <span className="ml-3">{link.label}</span>
                  </Button>
                </Link>
              );
            })}
            
            {/* Botão de Login para Mobile */}
            {!isAuthenticated && (
              <div className="mt-6 pt-6 border-t border-border space-y-3">
                <Link to="/login" className="block" onClick={() => setMobileMenuOpen(false)}>
                  <Button 
                    variant="outline" 
                    className="w-full h-12 min-h-[44px] text-base font-medium border-2 border-primary/20 text-primary hover:bg-accent hover:border-primary/30 transition-all duration-200"
                  >
                    Login
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/cadastro" className="block" onClick={() => setMobileMenuOpen(false)}>
                  <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                    <Button 
                      className="w-full h-12 min-h-[44px] text-base font-medium bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-all duration-200"
                    >
                      Começar grátis
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </motion.div>
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
