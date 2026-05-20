import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Icon = ({
  size = 15, sw = 1.6, children, ...rest
}: { size?: number; sw?: number; children?: React.ReactNode; [k: string]: unknown }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...(rest as React.SVGProps<SVGSVGElement>)}>
    {children}
  </svg>
);

const IconRoadmap    = (p: {size?:number}) => <Icon {...p}><path d="M9 6H5a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h14a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-4"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/></Icon>;
const IconProfile    = (p: {size?:number}) => <Icon {...p}><circle cx="12" cy="8" r="3.5"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0"/></Icon>;
const IconSpark      = (p: {size?:number}) => <Icon {...p}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/></Icon>;
const IconCert       = (p: {size?:number}) => <Icon {...p}><circle cx="12" cy="9" r="5"/><path d="M9 13.5 7.5 21l4.5-2.5L16.5 21 15 13.5"/><path d="M9.5 9 11 10.5 14.5 7" strokeWidth={1.8}/></Icon>;
const IconCommunity  = (p: {size?:number}) => <Icon {...p}><circle cx="9" cy="9" r="3"/><circle cx="17" cy="10" r="2.2"/><path d="M3 18a6 6 0 0 1 12 0M14 18a4.5 4.5 0 0 1 7 0"/></Icon>;
const IconSupport    = (p: {size?:number}) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.9.4-1 1-1 1.7M12 16.2v.1"/></Icon>;
const IconSettings   = (p: {size?:number}) => <Icon {...p}><circle cx="12" cy="12" r="2.8"/><path d="M19.4 13.6a8 8 0 0 0 0-3.2l1.7-1.3-2-3.4-2 .8a8 8 0 0 0-2.8-1.6L14 2h-4l-.3 2.9A8 8 0 0 0 6.9 6.5l-2-.8-2 3.4 1.7 1.3a8 8 0 0 0 0 3.2L2.9 15l2 3.4 2-.8a8 8 0 0 0 2.8 1.6L10 22h4l.3-2.8a8 8 0 0 0 2.8-1.6l2 .8 2-3.4z"/></Icon>;
const IconBell       = (p: {size?:number}) => <Icon {...p}><path d="M6 8a6 6 0 1 1 12 0v4l1.5 3h-15L6 12z"/><path d="M10 19a2 2 0 0 0 4 0"/></Icon>;
const IconBookOpen   = (p: {size?:number}) => <Icon {...p}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></Icon>;

interface NavItem { id: string; label: string; to: string; badge?: string; kbd?: string; icon: React.FC<{size?: number}>; }

const NAV_ITEMS: NavItem[] = [
  { id: 'roadmap',           label: 'Roadmap',            to: '/roadmap',            icon: IconRoadmap,   kbd: '⌘1' },
  { id: 'select-profile',    label: 'Profile',            to: '/select-profile',     icon: IconProfile,   kbd: '⌘2' },
  { id: 'programme-overview',label: 'Programme Overview', to: '/programme-overview', icon: IconBookOpen },
  { id: 'news',              label: 'AI News',             to: '/news',               icon: IconSpark,     badge: 'R2' },
  { id: 'certifications',    label: 'Certifications',     to: '/certifications',     icon: IconCert,      badge: 'R2' },
  { id: 'community',         label: 'Community',           to: '/community',          icon: IconCommunity, badge: 'R2' },
];

const UTIL_ITEMS: NavItem[] = [
  { id: 'support',  label: 'Support',  to: '/support',  icon: IconSupport },
  { id: 'settings', label: 'Settings', to: '/settings', icon: IconSettings },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const location         = useLocation();
  const [_m, _setM]      = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };
  const firstName    = user?.full_name?.split(' ')[0] ?? 'Learner';
  const initials     = (user?.full_name ?? 'L').slice(0, 1).toUpperCase();
  const currentNav   = NAV_ITEMS.find(n => location.pathname.startsWith(n.to));

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
          <div className="ants-nav-label">Navigation</div>
          {NAV_ITEMS.map(item => {
            const Ic      = item.icon;
            const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + '/');
            return (
              <div key={item.id} className={`ants-nav-item${isActive ? ' active' : ''}`} onClick={() => navigate(item.to)}>
                <Ic size={15} />
                <span>{item.label}</span>
                {item.badge
                  ? <span className="ants-nav-badge">{item.badge}</span>
                  : item.kbd
                    ? <span className="ants-nav-kbd">{item.kbd}</span>
                    : null}
              </div>
            );
          })}
        </div>

        <div className="ants-nav-section">
          <div className="ants-nav-label">Account</div>
          {UTIL_ITEMS.map(item => {
            const Ic = item.icon;
            return (
              <div key={item.id} className={`ants-nav-item${location.pathname === item.to ? ' active' : ''}`} onClick={() => navigate(item.to)}>
                <Ic size={15} /><span>{item.label}</span>
              </div>
            );
          })}
        </div>

        <div className="ants-sidebar-spacer" />

        {/* User card */}
        <div className="ants-user-card">
          <div className="ants-user-avatar">{initials}</div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div className="ants-user-name">{firstName}</div>
            <div className="ants-user-role">Learner · L1</div>
          </div>
          <div className="ants-user-dot" />
        </div>
      </aside>

      {/* Main */}
      <main className="ants-main">
        <div className="ants-main-inner">
          <div className="ants-topbar">
            <div className="ants-crumbs">
              <span className="ants-crumbs-active">{currentNav?.label ?? 'Dashboard'}</span>
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
