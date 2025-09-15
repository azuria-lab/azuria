
import { useEffect, useState } from "react";

interface AccessibilitySettings {
  reduceMotion: boolean;
  highContrast: boolean;
  fontSize: "small" | "medium" | "large";
  focusVisible: boolean;
}

export const useAccessibility = () => {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    reduceMotion: false,
    highContrast: false,
    fontSize: "medium",
    focusVisible: true,
  });

  useEffect(() => {
    // Check for system preferences
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const prefersHighContrast = window.matchMedia("(prefers-contrast: high)").matches;
    
    // Load saved settings
    const savedSettings = localStorage.getItem("precifica-accessibility");
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setSettings({
        ...parsed,
        reduceMotion: parsed.reduceMotion || prefersReducedMotion,
        highContrast: parsed.highContrast || prefersHighContrast,
      });
    } else {
      setSettings(prev => ({
        ...prev,
        reduceMotion: prefersReducedMotion,
        highContrast: prefersHighContrast,
      }));
    }
  }, []);

  useEffect(() => {
    // Apply accessibility settings to the document
    const root = document.documentElement;
    
    // Reduce motion
    if (settings.reduceMotion) {
      root.style.setProperty("--animation-duration", "0s");
      root.style.setProperty("--transition-duration", "0s");
    } else {
      root.style.removeProperty("--animation-duration");
      root.style.removeProperty("--transition-duration");
    }

    // High contrast
    if (settings.highContrast) {
      root.classList.add("high-contrast");
    } else {
      root.classList.remove("high-contrast");
    }

    // Font size
    root.classList.remove("font-small", "font-medium", "font-large");
    root.classList.add(`font-${settings.fontSize}`);

    // Focus visible
    if (settings.focusVisible) {
      root.classList.add("focus-visible");
    } else {
      root.classList.remove("focus-visible");
    }

    // Save settings
    localStorage.setItem("precifica-accessibility", JSON.stringify(settings));
  }, [settings]);

  const updateSetting = <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return {
    settings,
    updateSetting,
  };
};
