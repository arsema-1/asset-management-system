'use client';

import { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'default' | 'dark' | 'protanopia' | 'deuteranopia' | 'tritanopia';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'default',
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('default');

  // Persist + apply on mount
  useEffect(() => {
    const saved = localStorage.getItem('assetflow-theme') as Theme | null;
    if (saved) apply(saved);
  }, []);

  function apply(t: Theme) {
    document.documentElement.setAttribute('data-theme', t);
    // Also toggle Tailwind dark class
    if (t === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    setThemeState(t);
    localStorage.setItem('assetflow-theme', t);
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme: apply }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
