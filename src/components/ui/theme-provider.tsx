/* eslint-disable react-refresh/only-export-components */

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "dark" | "light";
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
  resolvedTheme: "light",
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "precifica-theme",
  ...props
}: ThemeProviderProps) {
  // Initialize theme state with proper fallback
  const [theme, setTheme] = useState<Theme>(() => {
    // Only access localStorage if we're in the browser
    if (typeof window === 'undefined') {return defaultTheme;}
    
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored && (stored === 'dark' || stored === 'light' || stored === 'system')) {
        return stored as Theme;
      }
    } catch {
      // Ignore localStorage errors
    }
    return defaultTheme;
  });

  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">(() => {
    if (typeof window === 'undefined') {return "light";}
    
    if (theme === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return theme === "dark" ? "dark" : "light";
  });

  const [mounted, setMounted] = useState(false);

  // Mark component as mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  // Apply theme to DOM
  useEffect(() => {
    if (typeof window === 'undefined' || !mounted) {return;}

    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    let newResolvedTheme: "dark" | "light";

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";

      newResolvedTheme = systemTheme;
      root.classList.add(systemTheme);
    } else {
      newResolvedTheme = theme;
      root.classList.add(theme);
    }

    setResolvedTheme(newResolvedTheme);

    // Update meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        "content", 
        newResolvedTheme === "dark" ? "#0f172a" : "#2563eb"
      );
    }
  }, [theme, mounted]);

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === 'undefined' || !mounted || theme !== "system") {return;}

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const systemTheme = mediaQuery.matches ? "dark" : "light";
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(systemTheme);
      setResolvedTheme(systemTheme);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme, mounted]);

  const value = {
    theme,
    resolvedTheme,
    setTheme: (newTheme: Theme) => {
      if (typeof window !== 'undefined' && mounted) {
        try {
          localStorage.setItem(storageKey, newTheme);
        } catch {
          // Handle localStorage errors gracefully
        }
      }
      setTheme(newTheme);
    },
  };

  // Always render children, using a more stable initialization
  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) {
    // Return safe defaults instead of throwing
    return {
      theme: "system" as Theme,
      resolvedTheme: "light" as "dark" | "light",
      setTheme: () => {},
    };
  }

  return context;
};
