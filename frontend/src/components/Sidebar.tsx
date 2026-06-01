import { NavLink } from 'react-router-dom';

interface SidebarItem {
  label: string;
  to: string;
}

interface SidebarProps {
  items: SidebarItem[];
}

export function Sidebar({ items }: SidebarProps) {
  return (
    <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            borderRadius: 14,
            padding: '10px 16px',
            fontSize: 13,
            fontWeight: 500,
            textDecoration: 'none',
            color: isActive ? 'var(--accent-2)' : 'var(--ink-100)',
            background: isActive ? 'var(--bg-2)' : 'transparent',
            transition: 'background 0.15s, color 0.15s',
          })}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLAnchorElement;
            if (!el.getAttribute('aria-current')) {
              el.style.background = 'var(--bg-2)';
            }
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLAnchorElement;
            if (!el.getAttribute('aria-current')) {
              el.style.background = 'transparent';
            }
          }}
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
