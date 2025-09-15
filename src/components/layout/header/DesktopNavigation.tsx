
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LayoutGroup, motion } from 'framer-motion';
import { useFilteredNavLinks } from './NavLinks';

interface DesktopNavigationProps {
  isAuthenticated: boolean;
  isPro: boolean;
}

export default function DesktopNavigation({ isAuthenticated, isPro }: DesktopNavigationProps) {
  const location = useLocation();
  const filteredLinks = useFilteredNavLinks(isAuthenticated, isPro);

  return (
    <nav className="hidden md:flex items-center space-x-1">
      <LayoutGroup id="desktop-nav">
        {filteredLinks.map((link) => {
          const isActive = location?.pathname === link.path;
          return (
            <Link key={link.path} to={link.path}>
              <Button
                variant={isActive ? "default" : "ghost"}
                size="sm"
                className={`relative ${
                  isActive 
                    ? "bg-brand-100 text-brand-800 hover:bg-brand-200 dark:bg-brand-900 dark:text-brand-200" 
                    : "text-gray-700 dark:text-gray-200"
                }`}
              >
                {link.icon}
                <span className="ml-1 hidden lg:inline">{link.label}</span>
                {isActive && (
                  <motion.div
                    className="absolute inset-0 border-b-2 border-brand-500 dark:border-brand-400 rounded-sm"
                    layoutId="underline"
                    style={{ bottom: -1, top: "auto", height: "2px" }}
                  />
                )}
              </Button>
            </Link>
          );
        })}
      </LayoutGroup>
    </nav>
  );
}
