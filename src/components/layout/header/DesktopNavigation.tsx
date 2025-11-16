
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LayoutGroup, motion } from 'framer-motion';
import { useFilteredNavLinks } from './NavLinks';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
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
              
              // Se o link tem submenu, renderiza com dropdown
              if (link.subLinks && link.subLinks.length > 0) {
                return (
                  <NavigationMenuItem key={link.path}>
                    <NavigationMenuTrigger
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
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[400px] gap-3 p-4">
                        {link.subLinks.map((subLink) => (
                          <li key={subLink.to}>
                            <NavigationMenuLink asChild>
                              <Link
                                to={subLink.to}
                                className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                              >
                                <div className="text-sm font-medium leading-none">{subLink.label}</div>
                                <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                  {subLink.description}
                                </p>
                              </Link>
                            </NavigationMenuLink>
                          </li>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                );
              }
              
              // Renderiza link normal sem submenu
              return (
                <NavigationMenuItem key={link.path}>
                  <Link to={link.path}>
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
                </NavigationMenuItem>
              );
            })}
          </NavigationMenuList>
        </NavigationMenu>
      </LayoutGroup>
    </nav>
  );
}
