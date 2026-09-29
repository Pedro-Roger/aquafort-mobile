import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import { Theme, theme as defaultTheme } from './tokens';

interface ThemeContextValue {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  children: ReactNode;
  initialTheme?: 'dark' | 'light';
}

export function ThemeProvider({ children, initialTheme = 'dark' }: ThemeProviderProps) {
  const [isDark, setIsDark] = React.useState<boolean>(initialTheme === 'dark');

  const toggleTheme = React.useCallback(() => {
    setIsDark((prev) => !prev);
  }, []);

  const setTheme = React.useCallback((dark: boolean) => {
    setIsDark(dark);
  }, []);

  // For now, we only support dark theme but structure allows light theme extension
  const theme = useMemo(() => defaultTheme, []);

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export function useThemeColors() {
  const { theme, isDark } = useTheme();
  // Currently only dark theme, but ready for light theme
  return theme.colors;
}

export function useThemeSpacing() {
  const { theme } = useTheme();
  return theme.spacing;
}

export function useThemeTypography() {
  const { theme } = useTheme();
  return theme.typography;
}

export function useThemeBorderRadius() {
  const { theme } = useTheme();
  return theme.borderRadius;
}

export function useThemeShadows() {
  const { theme } = useTheme();
  return theme.shadows;
}