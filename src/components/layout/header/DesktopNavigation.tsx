
import { Link, useLocation } from 'react-router-dom';
import { LayoutGroup, motion } from 'framer-motion';
import { useFilteredNavLinks } from './NavLinks';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";

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
        <NavigationMenu>
          <NavigationMenuList>
            {filteredLinks.map((link) => {
              const isActive = location?.pathname === link.path;
              
              // Links simples sem submenu
              return (
                <NavigationMenuItem key={link.path}>
                  <NavigationMenuLink asChild>
                    <Link
                      to={link.to}
                      className={`relative flex items-center px-3 py-2 rounded-md transition-colors ${
                        isActive 
                          ? "bg-brand-100 text-brand-800 hover:bg-brand-200 dark:bg-brand-900 dark:text-brand-200" 
                          : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
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
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              );
            })}
          </NavigationMenuList>
        </NavigationMenu>
      </LayoutGroup>
    </nav>
  );
}
