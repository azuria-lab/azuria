
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
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
      >
        {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="absolute top-full left-0 right-0 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 z-50"
        >
          <div className="container py-4 space-y-1">
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
                      className={`w-full justify-start ${
                        isActive 
                          ? "bg-[#EAF6FF] text-[#005BFF]" 
                          : "text-[#0A1930] hover:text-[#005BFF]"
                      }`}
                    >
                      {link.icon}
                      <span className="ml-2">{link.label}</span>
                    </Button>
                  </a>
                );
              }
              
              return (
                <Link key={link.path} to={link.path} className="block">
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={`w-full justify-start ${
                      isActive 
                        ? "bg-[#EAF6FF] text-[#005BFF]" 
                        : "text-[#0A1930] hover:text-[#005BFF]"
                    }`}
                  >
                    {link.icon}
                    <span className="ml-2">{link.label}</span>
                  </Button>
                </Link>
              );
            })}
            
            {/* Botão de Login para Mobile */}
            {!isAuthenticated && (
              <div className="mt-4 pt-2 border-t border-gray-100 space-y-2">
                <Link to="/login" className="block">
                  <Button variant="outline" className="w-full border-[#005BFF] text-[#005BFF] hover:bg-[#EAF6FF]">
                    Login
                  </Button>
                </Link>
                <Link to="/cadastro" className="block">
                  <Button className="w-full bg-[#005BFF] hover:bg-[#0048CC] text-white">
                    Começar grátis
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
