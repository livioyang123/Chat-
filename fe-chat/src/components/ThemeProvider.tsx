// fe-chat/src/context/ThemeProvider.tsx - NUOVO FILE
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Theme = 'light' | 'dark' | 'custom';

export interface CustomTheme {
  primaryColor: string;
  secondaryColor: string;
  gradient?: string;
}

interface ThemeContextValue {
  theme: Theme;
  customTheme: CustomTheme | null;
  changeTheme: (newTheme: Theme) => void;
  setCustomColors: (colors: CustomTheme) => void;
  resetTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [customTheme, setCustomTheme] = useState<CustomTheme | null>(null);

  // Carica tema salvato all'avvio
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    const savedCustom = localStorage.getItem('customTheme');
    
    if (savedTheme) {
      setTheme(savedTheme);
      applyThemeToDOM(savedTheme);
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

  const applyThemeToDOM = (newTheme: Theme) => {
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const applyCustomTheme = (custom: CustomTheme) => {
    const root = document.documentElement;
    root.style.setProperty('--custom-primary', custom.primaryColor);
    root.style.setProperty('--custom-secondary', custom.secondaryColor);
    
    const gradient = custom.gradient || 
      `linear-gradient(135deg, ${custom.primaryColor} 0%, ${custom.secondaryColor} 100%)`;
    root.style.setProperty('--custom-gradient', gradient);
  };

  const changeTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    applyThemeToDOM(newTheme);
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

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      customTheme, 
      changeTheme, 
      setCustomColors, 
      resetTheme 
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}