import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '../components/ThemeToggle';

// ── Inline SVG icons ──────────────────────────────────────────────────────────
const UsersIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const ClockIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);
const DollarIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/>
    <line x1="12" y1="6" x2="12" y2="18"/>
  </svg>
);
const TierIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const BotIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="8" width="18" height="12" rx="3"/>
    <path d="M9 8V6a3 3 0 0 1 6 0v2"/>
    <circle cx="9" cy="14" r="1.5" fill="currentColor" stroke="none"/>
    <circle cx="15" cy="14" r="1.5" fill="currentColor" stroke="none"/>
    <path d="M7.5 19h9"/>
  </svg>
);
const ZapIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);
const TrendIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
    <polyline points="16 7 22 7 22 13"/>
  </svg>
);

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-0)', color: 'var(--ink-100)', fontFamily: 'var(--font-sans)', overflow: 'hidden', position: 'relative' }}>

      {/* ── Aurora background ── */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {/* Purple — top-left, large */}
        <div style={{ position: 'absolute', width: '85vw', height: '85vw', maxWidth: 1050, maxHeight: 1050, top: '-25%', left: '-18%', borderRadius: '50%', background: 'radial-gradient(circle, var(--aurora-1), transparent 65%)', filter: 'blur(80px)', opacity: 0.30, animation: 'blobDrift1 28s ease-in-out infinite alternate' }} />
        {/* Cyan — top-right */}
        <div style={{ position: 'absolute', width: '62vw', height: '62vw', maxWidth: 820, maxHeight: 820, top: '5%', right: '-16%', borderRadius: '50%', background: 'radial-gradient(circle, var(--aurora-2), transparent 65%)', filter: 'blur(80px)', opacity: 0.28, animation: 'blobDrift2 34s ease-in-out infinite alternate' }} />
        {/* Pink — bottom-center */}
        <div style={{ position: 'absolute', width: '48vw', height: '48vw', maxWidth: 620, maxHeight: 620, bottom: '-12%', left: '32%', borderRadius: '50%', background: 'radial-gradient(circle, var(--aurora-3), transparent 65%)', filter: 'blur(90px)', opacity: 0.18, animation: 'blobDrift3 22s ease-in-out infinite alternate' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* ── Top Navigation ── */}
        <nav style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 48px',
          borderBottom: '1px solid var(--glass-stroke)',
          backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
          background: 'color-mix(in srgb, var(--bg-0) 78%, transparent)',
          position: 'sticky', top: 0, zIndex: 100,
        }}>
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg, var(--accent-1), var(--accent-2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, color: 'white', boxShadow: '0 4px 16px oklch(0.72 0.13 285 / 0.30)', flexShrink: 0 }}>AT</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink-100)', letterSpacing: '-0.01em' }}>ANTS Trail</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-50)', marginTop: 1 }}>AI-Native Testing Specialists</div>
            </div>
          </div>

          {/* Nav actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'oklch(0.52 0.18 150)', background: 'oklch(0.78 0.20 150 / 0.10)', border: '1px solid oklch(0.78 0.20 150 / 0.28)', padding: '5px 12px', borderRadius: 999, marginRight: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'oklch(0.52 0.18 150)', boxShadow: '0 0 6px oklch(0.65 0.20 150)', display: 'inline-block' }} />
              We Test with AI
            </div>

            <ThemeToggle />

            <button
              onClick={() => navigate('/login')}
              style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--ink-80)', padding: '8px 20px', borderRadius: 10, border: '1px solid var(--glass-stroke)', background: 'var(--glass-fill)', cursor: 'pointer', transition: 'background 0.15s, color 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--hover-tint)'; e.currentTarget.style.color = 'var(--ink-100)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--glass-fill)'; e.currentTarget.style.color = 'var(--ink-80)'; }}
            >Sign In</button>

            <button
              onClick={() => navigate('/register')}
              style={{ fontSize: 13.5, fontWeight: 600, color: 'white', padding: '8px 20px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, var(--accent-1), var(--accent-2))', cursor: 'pointer', boxShadow: '0 4px 18px oklch(0.72 0.13 285 / 0.38)', transition: 'opacity 0.15s, transform 0.15s, box-shadow 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 28px oklch(0.72 0.13 285 / 0.45)'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 18px oklch(0.72 0.13 285 / 0.38)'; }}
            >Sign Up</button>
          </div>
        </nav>

        {/* ── Hero Section ── */}
        <section style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 48px 56px' }}>

          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 36, padding: '7px 16px', borderRadius: 999, border: '1px solid var(--glass-stroke)', background: 'var(--bg-2)', backdropFilter: 'blur(10px)', boxShadow: '0 2px 10px oklch(0 0 0 / 0.05)' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--accent-1)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
            </svg>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-60)' }}>
              Nous QE Practice · Launches June 2026 · 6 Months to ANTS
            </span>
          </div>

          {/* Headline */}
          <h1 style={{ fontSize: 'clamp(38px, 4.5vw, 56px)', fontFamily: 'var(--font-serif)', fontWeight: 700, lineHeight: 1.08, letterSpacing: '-0.025em', margin: '0 0 26px', maxWidth: 860 }}>
            From{' '}
            <span style={{ color: 'var(--ink-50)' }}>QA</span>
            {' '}to{' '}
            <span style={{ background: 'linear-gradient(135deg, var(--accent-1), var(--accent-2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>ANTS</span>
            {' '}— your<br />
            learning path to{' '}
            <span style={{ background: 'linear-gradient(135deg, oklch(0.72 0.22 330), oklch(0.80 0.16 40))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              AI-Native Testing Specialist
            </span>
            {' '}by Dec 2026.
          </h1>

          {/* Sub */}
          <p style={{ fontSize: 16, color: 'var(--ink-70)', lineHeight: 1.7, maxWidth: 540, margin: '0 0 44px' }}>
            394 engineers. 2 hours a day. Zero cost. One destination. A 3-tier programme built on 100% free curriculum, tuned to your role on day one — June through December 2026.
          </p>

          {/* Stats row — icon cards */}
          <div style={{ display: 'flex', gap: 14, marginBottom: 44, flexWrap: 'wrap' }}>
            {[
              { Icon: UsersIcon, n: '394',   u: 'QE engineers in flight', numColor: 'var(--accent-1)', iconColor: 'var(--accent-1)', iconBg: 'oklch(0.72 0.13 285 / 0.10)' },
              { Icon: ClockIcon, n: '2 hrs', u: 'Per day, every weekday',  numColor: 'var(--ink-100)',  iconColor: 'var(--ink-60)',   iconBg: 'var(--glass-fill)' },
              { Icon: DollarIcon,n: '$0',    u: 'Curriculum cost',          numColor: 'oklch(0.65 0.22 330)', iconColor: 'oklch(0.65 0.22 330)', iconBg: 'oklch(0.80 0.18 330 / 0.10)' },
            ].map(({ Icon, n, u, numColor, iconColor, iconBg }) => (
              <div key={n} style={{
                background: 'var(--bg-2)', border: '1px solid var(--glass-stroke)',
                borderRadius: 16, padding: '18px 22px',
                backdropFilter: 'blur(12px)',
                display: 'flex', alignItems: 'center', gap: 14,
                boxShadow: '0 2px 16px oklch(0 0 0 / 0.05)',
                minWidth: 190,
              }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                  background: iconBg, border: '1px solid var(--glass-stroke)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: iconColor,
                }}>
                  <Icon />
                </div>
                <div>
                  <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.035em', color: numColor, lineHeight: 1.1, marginBottom: 4 }}>{n}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-50)', lineHeight: 1.4 }}>{u}</div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/register')}
              style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 14.5, fontWeight: 600, color: 'white', padding: '13px 28px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, var(--accent-1), var(--accent-2))', cursor: 'pointer', boxShadow: '0 6px 28px oklch(0.72 0.13 285 / 0.32)', transition: 'opacity 0.15s, transform 0.15s, box-shadow 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.90'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 36px oklch(0.72 0.13 285 / 0.42)'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 6px 28px oklch(0.72 0.13 285 / 0.32)'; }}
            >
              Get Started
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
            </button>

            <button
              onClick={() => window.location.href = '/programme-overview'}
              style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 14.5, fontWeight: 500, color: 'var(--ink-80)', padding: '12px 28px', borderRadius: 12, border: '1px solid var(--glass-stroke)', background: 'var(--bg-2)', cursor: 'pointer', backdropFilter: 'blur(8px)', boxShadow: '0 2px 10px oklch(0 0 0 / 0.04)', transition: 'background 0.15s, color 0.15s, box-shadow 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--hover-tint)'; e.currentTarget.style.color = 'var(--ink-100)'; e.currentTarget.style.boxShadow = '0 6px 20px oklch(0 0 0 / 0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-2)'; e.currentTarget.style.color = 'var(--ink-80)'; e.currentTarget.style.boxShadow = '0 2px 10px oklch(0 0 0 / 0.04)'; }}
            >
              View Programme Overview
            </button>
          </div>
        </section>

        {/* ── Timeline bar ── */}
        <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 48px 44px', marginTop: 32 }}>
          <div style={{
            background: 'var(--bg-2)', border: '1px solid var(--glass-stroke)',
            borderRadius: 16, padding: '24px 32px',
            backdropFilter: 'blur(12px)', boxShadow: '0 4px 24px oklch(0 0 0 / 0.05)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-50)', marginBottom: 4 }}>June 1, 2026 · Kickoff</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: 'var(--ink-60)' }}>QA</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-50)', marginBottom: 4 }}>Dec 31, 2026 · Destination</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, background: 'linear-gradient(135deg, var(--accent-1), var(--accent-2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>ANTS</div>
              </div>
            </div>

            {/* Progress track with end-cap dot */}
            <div style={{ height: 8, borderRadius: 999, background: 'var(--glass-stroke)', position: 'relative', marginBottom: 14 }}>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, var(--accent-1), var(--accent-2), oklch(0.80 0.18 330))', borderRadius: 999 }} />
              <div style={{ position: 'absolute', right: 0, top: '50%', transform: 'translate(50%, -50%)', width: 14, height: 14, borderRadius: '50%', background: 'oklch(0.80 0.18 330)', boxShadow: '0 0 10px oklch(0.80 0.18 330 / 0.6)', border: '2.5px solid var(--bg-0)' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              {['Jun · Kickoff', 'Jul–Aug · Foundations', 'Sep–Nov · Specialisation', 'Dec · 100% ANTS'].map(label => (
                <span key={label} style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-50)', letterSpacing: '0.06em' }}>{label}</span>
              ))}
            </div>
          </div>
        </section>

        {/* ── Feature cards ── */}
        <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 48px 80px', marginTop: 32 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(255px, 1fr))', gap: 18 }}>
            {[
              { Icon: TierIcon,  title: '3-Tier Learning Path',   desc: 'From QA foundations through to AI-Native automation architecture. Each tier builds on the last.', accent: 'var(--accent-1)', iconBg: 'oklch(0.72 0.13 285 / 0.10)' },
              { Icon: BotIcon,   title: 'AI-First Curriculum',    desc: 'Every module is infused with AI tooling — Playwright agents, LLM-driven test generation, self-healing frameworks.', accent: 'var(--accent-2)', iconBg: 'oklch(0.74 0.10 210 / 0.10)' },
              { Icon: ZapIcon,   title: '100% Free Resources',    desc: "Zero curriculum cost. All content is sourced from free platforms. Your only investment is 2 hrs per day.", accent: 'oklch(0.62 0.22 330)', iconBg: 'oklch(0.80 0.18 330 / 0.10)' },
              { Icon: TrendIcon, title: 'Role-Tuned from Day One',desc: "Junior, Mid, Senior or Lead — your roadmap is shaped to where you are today and where you're heading.", accent: 'oklch(0.62 0.16 55)', iconBg: 'oklch(0.82 0.15 60 / 0.10)' },
            ].map(({ Icon, title, desc, accent, iconBg }) => (
              <div key={title}
                style={{ background: 'var(--bg-2)', border: '1px solid var(--glass-stroke)', borderRadius: 16, padding: '24px', backdropFilter: 'blur(8px)', boxShadow: '0 2px 12px oklch(0 0 0 / 0.04)', transition: 'transform 0.18s, box-shadow 0.18s, border-color 0.18s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 14px 36px oklch(0 0 0 / 0.09)'; e.currentTarget.style.borderColor = 'var(--glass-stroke)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px oklch(0 0 0 / 0.04)'; e.currentTarget.style.borderColor = 'var(--glass-stroke)'; }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 12, background: iconBg, border: '1px solid var(--glass-stroke)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent, marginBottom: 18 }}>
                  <Icon />
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: accent, margin: '0 0 10px', letterSpacing: '-0.01em' }}>{title}</h3>
                <p style={{ fontSize: 13, color: 'var(--ink-70)', lineHeight: 1.6, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Footer ── */}
        <footer style={{ borderTop: '1px solid var(--glass-stroke)', padding: '24px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-50)' }}>© 2026 ANTS Trail · Nous QE Practice</span>
          <div style={{ display: 'flex', gap: 16 }}>
            {[
              { label: 'Sign In', action: () => navigate('/login') },
              { label: 'Sign Up', action: () => navigate('/register') },
              { label: 'Programme Overview', action: () => window.location.href = '/programme-overview' },
            ].map(({ label, action }) => (
              <button key={label} onClick={action} style={{ background: 'none', border: 'none', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-50)', cursor: 'pointer', transition: 'color 0.15s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--ink-100)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--ink-50)'}>{label}</button>
            ))}
          </div>
        </footer>
      </div>

      <style>{`
        @keyframes blobDrift1 { from { transform: translate(0,0) scale(1); } to { transform: translate(5%,8%) scale(1.08); } }
        @keyframes blobDrift2 { from { transform: translate(0,0) scale(1); } to { transform: translate(-6%,5%) scale(1.1); } }
        @keyframes blobDrift3 { from { transform: translate(0,0) scale(1); } to { transform: translate(4%,-6%) scale(0.94); } }
        @media (max-width: 600px) {
          nav { padding: 14px 20px !important; }
          section { padding-left: 20px !important; padding-right: 20px !important; }
          footer { padding: 20px !important; }
        }
      `}</style>
    </div>
  );
}
