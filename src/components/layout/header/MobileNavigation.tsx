
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
              return (
                <Link key={link.path} to={link.path} className="block">
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={`w-full justify-start ${
                      isActive 
                        ? "bg-brand-100 text-brand-800 hover:bg-brand-200 dark:bg-brand-900 dark:text-brand-200" 
                        : "text-gray-700 dark:text-gray-200"
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
              <Link to="/login" className="block mt-4 pt-2 border-t border-gray-100 dark:border-gray-800">
                <Button className="w-full bg-brand-600 hover:bg-brand-700 dark:bg-brand-600 dark:hover:bg-brand-700">
                  Entrar / Cadastrar
                </Button>
              </Link>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
