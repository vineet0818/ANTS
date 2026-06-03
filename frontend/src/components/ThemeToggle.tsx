import { useTheme } from '../context/ThemeContext';

const SunIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4"/>
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
  </svg>
);

const MoonIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

const MonitorIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2"/>
    <path d="M8 21h8M12 17v4"/>
  </svg>
);

const ICONS = {
  system: <MonitorIcon />,
  light:  <SunIcon />,
  dark:   <MoonIcon />,
};

const LABELS = {
  system: 'Auto (system) — click for light',
  light:  'Light — click for dark',
  dark:   'Dark — click for auto',
};

export function ThemeToggle() {
  const { setting, cycleTheme } = useTheme();
  return (
    <button
      className="ants-icon-btn"
      onClick={cycleTheme}
      title={LABELS[setting]}
      aria-label={LABELS[setting]}
    >
      {ICONS[setting]}
    </button>
  );
}
