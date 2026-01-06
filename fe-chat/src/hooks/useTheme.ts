// fe-chat/src/hooks/useTheme.ts - NUOVO
import { useState, useEffect } from 'react';

export type Theme = 'light' | 'dark' | 'custom';

export interface CustomTheme {
  primaryColor: string;
  secondaryColor: string;
  gradient?: string;
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('light');
  const [customTheme, setCustomTheme] = useState<CustomTheme | null>(null);

  // Carica tema salvato
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    const savedCustom = localStorage.getItem('customTheme');
    
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
    
    if (savedCustom) {
      try {
        const parsed = JSON.parse(savedCustom);
        setCustomTheme(parsed);
        applyCustomTheme(parsed);
      } catch (error) {
        console.error('Error loading custom theme:', error);
      }
    }
  }, []);

  const applyCustomTheme = (custom: CustomTheme) => {
    const root = document.documentElement;
    root.style.setProperty('--custom-primary', custom.primaryColor);
    root.style.setProperty('--custom-secondary', custom.secondaryColor);
    
    if (custom.gradient) {
      root.style.setProperty('--custom-gradient', custom.gradient);
    } else {
      const gradient = `linear-gradient(135deg, ${custom.primaryColor} 0%, ${custom.secondaryColor} 100%)`;
      root.style.setProperty('--custom-gradient', gradient);
    }
  };

  const changeTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const setCustomColors = (colors: CustomTheme) => {
    setCustomTheme(colors);
    applyCustomTheme(colors);
    localStorage.setItem('customTheme', JSON.stringify(colors));
    changeTheme('custom');
  };

  const resetTheme = () => {
    changeTheme('light');
    setCustomTheme(null);
    localStorage.removeItem('customTheme');
    
    const root = document.documentElement;
    root.style.removeProperty('--custom-primary');
    root.style.removeProperty('--custom-secondary');
    root.style.removeProperty('--custom-gradient');
  };

  return {
    theme,
    customTheme,
    changeTheme,
    setCustomColors,
    resetTheme
  };
}