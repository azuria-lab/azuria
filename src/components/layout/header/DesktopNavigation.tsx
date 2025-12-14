
import { Link, useLocation } from 'react-router-dom';
import { LayoutGroup, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useFilteredNavLinks } from './NavLinks';

interface DesktopNavigationProps {
  readonly isAuthenticated: boolean;
  readonly isPro: boolean;
}

export default function DesktopNavigation({ isAuthenticated, isPro }: DesktopNavigationProps) {
  const location = useLocation();
  const filteredLinks = useFilteredNavLinks(isAuthenticated, isPro);

  return (
    <nav className="hidden md:flex items-center space-x-1">
      <LayoutGroup id="desktop-nav">
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
                  const element = document.querySelector(link.path);
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
              >
                <Button
                  variant="ghost"
                  className="h-9 px-3 text-sm font-medium relative"
                >
                  {link.icon}
                  <span className="ml-1 hidden lg:inline">{link.label}</span>
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 border-b-2 border-primary rounded-sm"
                      layoutId="underline"
                      style={{ bottom: -1, top: "auto", height: "2px" }}
                    />
                  )}
                </Button>
              </a>
            );
          }
          
          return (
            <Link key={link.path} to={link.to}>
              <Button
                variant="ghost"
                className="h-9 px-3 text-sm font-medium relative"
              >
                {link.icon}
                <span className="ml-1 hidden lg:inline">{link.label}</span>
                {isActive && (
                  <motion.div
                    className="absolute inset-0 border-b-2 border-primary rounded-sm"
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
