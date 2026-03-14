import React, { createContext, useContext, useState, useEffect } from 'react';

type ThemeColor = 'indigo' | 'emerald' | 'rose' | 'amber' | 'slate';

interface ThemeContextType {
  themeColor: ThemeColor;
  setThemeColor: (color: ThemeColor) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeColor, setThemeColor] = useState<ThemeColor>(() => {
    return (localStorage.getItem('pixelon-theme') as ThemeColor) || 'indigo';
  });

  useEffect(() => {
    localStorage.setItem('pixelon-theme', themeColor);
    // Apply theme class to body or a root div
    document.documentElement.setAttribute('data-theme', themeColor);
  }, [themeColor]);

  return (
    <ThemeContext.Provider value={{ themeColor, setThemeColor }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
