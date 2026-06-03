import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type ThemeSetting = 'system' | 'light' | 'dark';
type ResolvedTheme = 'light' | 'dark';

interface ThemeContextType {
  setting: ThemeSetting;
  theme: ResolvedTheme;
  isExplicit: boolean;
  cycleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  setting: 'system',
  theme: 'dark',
  isExplicit: false,
  cycleTheme: () => {},
});

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [setting, setSetting] = useState<ThemeSetting>(() => {
    const stored = localStorage.getItem('ants-theme') as ThemeSetting | null;
    if (stored === 'dark' || stored === 'light' || stored === 'system') return stored;
    return 'system';
  });

  // isExplicit = user has deliberately chosen a setting (vs implicit OS default on first load)
  const [isExplicit, setIsExplicit] = useState<boolean>(() => {
    return localStorage.getItem('ants-theme') !== null;
  });

  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(getSystemTheme);

  // Track live OS theme changes
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setSystemTheme(e.matches ? 'dark' : 'light');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const theme: ResolvedTheme = setting === 'system' ? systemTheme : setting;

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (isExplicit) {
      localStorage.setItem('ants-theme', setting);
    } else {
      localStorage.removeItem('ants-theme');
    }
  }, [theme, setting, isExplicit]);

  // Cycle: system → light → dark → system
  // First click also marks the choice as explicit so the monitor icon becomes available
  const cycleTheme = () => {
    setIsExplicit(true);
    setSetting(s => s === 'system' ? 'light' : s === 'light' ? 'dark' : 'system');
  };

  return (
    <ThemeContext.Provider value={{ setting, theme, isExplicit, cycleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
