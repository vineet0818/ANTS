import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type ThemeSetting = 'system' | 'light' | 'dark';
type ResolvedTheme = 'light' | 'dark';

interface ThemeContextType {
  setting: ThemeSetting;
  theme: ResolvedTheme;
  cycleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  setting: 'system',
  theme: 'dark',
  cycleTheme: () => {},
});

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [setting, setSetting] = useState<ThemeSetting>(() => {
    const stored = localStorage.getItem('ants-theme') as ThemeSetting | null;
    if (stored === 'dark' || stored === 'light') return stored;
    return 'system';
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
    if (setting === 'system') {
      localStorage.removeItem('ants-theme');
    } else {
      localStorage.setItem('ants-theme', setting);
    }
  }, [theme, setting]);

  // Cycle: system → light → dark → system
  const cycleTheme = () =>
    setSetting(s => (s === 'system' ? 'light' : s === 'light' ? 'dark' : 'system'));

  return (
    <ThemeContext.Provider value={{ setting, theme, cycleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
