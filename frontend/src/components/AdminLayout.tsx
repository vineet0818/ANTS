import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Ic = ({ size = 15, sw = 1.6, children, ...rest }: { size?: number; sw?: number; children?: React.ReactNode; [k: string]: unknown }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...(rest as React.SVGProps<SVGSVGElement>)}>
    {children}
  </svg>
);

const IconDashboard = (p: { size?: number }) => <Ic {...p}><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></Ic>;
const IconSettings  = (p: { size?: number }) => <Ic {...p}><circle cx="12" cy="12" r="2.8"/><path d="M19.4 13.6a8 8 0 0 0 0-3.2l1.7-1.3-2-3.4-2 .8a8 8 0 0 0-2.8-1.6L14 2h-4l-.3 2.9A8 8 0 0 0 6.9 6.5l-2-.8-2 3.4 1.7 1.3a8 8 0 0 0 0 3.2L2.9 15l2 3.4 2-.8a8 8 0 0 0 2.8 1.6L10 22h4l.3-2.8a8 8 0 0 0 2.8-1.6l2 .8 2-3.4z"/></Ic>;
const IconSupport   = (p: { size?: number }) => <Ic {...p}><circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.9.4-1 1-1 1.7M12 16.2v.1"/></Ic>;
const IconBell      = (p: { size?: number }) => <Ic {...p}><path d="M6 8a6 6 0 1 1 12 0v4l1.5 3h-15L6 12z"/><path d="M10 19a2 2 0 0 0 4 0"/></Ic>;

const NAV_ITEMS = [
  { id: 'admin',    label: 'Dashboard',  to: '/admin',    icon: IconDashboard },
  { id: 'support',  label: 'Support',    to: '/support',  icon: IconSupport   },
  { id: 'settings', label: 'Settings',   to: '/settings', icon: IconSettings  },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const location         = useLocation();

  const handleLogout = () => { logout(); navigate('/'); };
  const initials     = (user?.full_name ?? 'A').slice(0, 1).toUpperCase();
  const firstName    = user?.full_name?.split(' ')[0] ?? 'Admin';

  return (
    <div className="ants-app">
      {/* Aurora */}
      <div className="ants-aurora">
        <div className="blob b1" /><div className="blob b2" /><div className="blob b3" /><div className="grain" />
      </div>

      {/* Sidebar */}
      <aside className="ants-sidebar">
        <div className="ants-brand">
          <div className="ants-brand-mark">AT</div>
          <div><div className="ants-brand-name">ANTS Trail</div></div>
        </div>

        <div className="ants-nav-section">
          <div className="ants-nav-label">Admin</div>
          {NAV_ITEMS.map(item => {
            const Ico      = item.icon;
            const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + '/');
            return (
              <div key={item.id} className={`ants-nav-item${isActive ? ' active' : ''}`} onClick={() => navigate(item.to)}>
                <Ico size={15} /><span>{item.label}</span>
              </div>
            );
          })}
        </div>

        <div className="ants-sidebar-spacer" />

        {/* Admin user card — no role tag */}
        <div className="ants-user-card">
          <div className="ants-user-avatar" style={{ background: 'linear-gradient(135deg, oklch(0.78 0.18 330), oklch(0.80 0.18 285))' }}>
            {initials}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div className="ants-user-name">{firstName}</div>
            <div className="ants-user-role" style={{ color: 'oklch(0.80 0.18 330)', opacity: 1 }}>Administrator</div>
          </div>
          <div className="ants-user-dot" />
        </div>
      </aside>

      {/* Main */}
      <main className="ants-main">
        <div className="ants-main-inner">
          <div className="ants-topbar">
            <div className="ants-crumbs">
              <span className="ants-crumbs-active">Admin Dashboard</span>
              <span className="ants-crumbs-dot" />
              <span className="ants-live">Live</span>
            </div>
            <div className="ants-top-actions">
              <button className="ants-icon-btn" title="Notifications">
                <IconBell size={15} /><span className="ants-dot-badge" />
              </button>
              <button className="ants-signout-btn" onClick={handleLogout}>Sign out</button>
            </div>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
