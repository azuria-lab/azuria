
import { useMemo } from 'react';
import { BadgeCheck, Building2, Home, Layers } from 'lucide-react';

// Navbar pública - apenas links institucionais
// Todas as ferramentas foram movidas para dentro do Dashboard (área logada)
export const navLinks = [
  { 
    to: "/", 
    label: "Início",
    path: "/",
    icon: <Home className="h-4 w-4" />,
    dataOnboarding: "home-button"
  },
  { 
    to: "/recursos", 
    label: "Recursos",
    path: "/recursos",
    icon: <Layers className="h-4 w-4" />,
    dataOnboarding: "resources-button"
  },
  { 
    to: "/planos", 
    label: "Planos",
    path: "/planos",
    icon: <BadgeCheck className="h-4 w-4" />,
    dataOnboarding: "pricing-button"
  },
  { 
    to: "/sobre", 
    label: "Sobre",
    path: "/sobre",
    icon: <Building2 className="h-4 w-4" />,
    dataOnboarding: "about-button"
  }
];

// Quando o usuário está autenticado, não mostra ferramentas na navbar pública
// Todas as ferramentas estão acessíveis via sidebar do Dashboard
export const useFilteredNavLinks = (isAuthenticated: boolean, _isPro: boolean) => {
  return useMemo(() => {
    // Se autenticado, mostra apenas o link para Dashboard
    if (isAuthenticated) {
      return [
        { 
          to: "/dashboard", 
          label: "Dashboard",
          path: "/dashboard",
          icon: <Home className="h-4 w-4" />,
          dataOnboarding: "dashboard-button"
        }
      ];
    }
    // Se não autenticado, mostra links públicos institucionais
    return navLinks;
  }, [isAuthenticated]);
};
