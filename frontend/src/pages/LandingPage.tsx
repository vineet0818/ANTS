import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-0)', color: 'var(--ink-100)', fontFamily: 'var(--font-sans)', overflow: 'hidden', position: 'relative' }}>

      {/* ── Aurora background ── */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: '70vw', height: '70vw', maxWidth: 900, maxHeight: 900, top: '-15%', left: '-10%', borderRadius: '50%', background: 'radial-gradient(circle, oklch(0.78 0.18 285), transparent 70%)', filter: 'blur(100px)', opacity: 0.22, animation: 'blobDrift1 28s ease-in-out infinite alternate' }} />
        <div style={{ position: 'absolute', width: '55vw', height: '55vw', maxWidth: 700, maxHeight: 700, top: '30%', right: '-10%', borderRadius: '50%', background: 'radial-gradient(circle, oklch(0.82 0.16 200), transparent 70%)', filter: 'blur(90px)', opacity: 0.18, animation: 'blobDrift2 34s ease-in-out infinite alternate' }} />
        <div style={{ position: 'absolute', width: '45vw', height: '45vw', maxWidth: 600, maxHeight: 600, bottom: '-10%', left: '35%', borderRadius: '50%', background: 'radial-gradient(circle, oklch(0.80 0.18 330), transparent 70%)', filter: 'blur(90px)', opacity: 0.15, animation: 'blobDrift3 22s ease-in-out infinite alternate' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* ── Top Navigation ── */}
        <nav style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 48px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          background: 'rgba(7,7,11,0.7)',
          position: 'sticky', top: 0, zIndex: 100,
        }}>
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg, var(--accent-1), var(--accent-2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, color: 'white', boxShadow: '0 0 20px oklch(0.78 0.18 285 / 0.4)', flexShrink: 0 }}>AT</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink-100)', letterSpacing: '-0.01em' }}>ANTS Trail</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-50)', marginTop: 1 }}>AI-Native Testing Specialists</div>
            </div>
          </div>

          {/* Nav actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* "We Test with AI" pill */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'oklch(0.78 0.20 150)', background: 'oklch(0.78 0.20 150 / 0.1)', border: '1px solid oklch(0.78 0.20 150 / 0.3)', padding: '5px 12px', borderRadius: 999, marginRight: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'oklch(0.78 0.20 150)', boxShadow: '0 0 6px oklch(0.78 0.20 150)', display: 'inline-block' }} />
              We Test with AI
            </div>

            <button
              onClick={() => navigate('/login')}
              style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--ink-80)', padding: '8px 20px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)', cursor: 'pointer', transition: 'background 0.15s, color 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'var(--ink-100)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'var(--ink-80)'; }}
            >Sign In</button>

            <button
              onClick={() => navigate('/register')}
              style={{ fontSize: 13.5, fontWeight: 600, color: 'white', padding: '8px 20px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, var(--accent-1), var(--accent-2))', cursor: 'pointer', boxShadow: '0 4px 18px oklch(0.78 0.18 285 / 0.35)', transition: 'opacity 0.15s, transform 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >Sign Up</button>
          </div>
        </nav>

        {/* ── Hero Section ── */}
        <section style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 48px 60px' }}>

          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 36, padding: '7px 16px', borderRadius: 999, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(8px)' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--accent-1)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
            </svg>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-60)' }}>
              Nous QE Practice · Launches June 2026 · 6 Months to ANTS
            </span>
          </div>

          {/* Headline */}
          <h1 style={{ fontSize: 'clamp(36px, 4vw, 52px)', fontFamily: 'var(--font-serif)', fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.02em', margin: '0 0 28px', maxWidth: 840 }}>
            From{' '}
            <span style={{ color: 'var(--ink-60)' }}>QA</span>
            {' '}to{' '}
            <span style={{ background: 'linear-gradient(135deg, var(--accent-1), var(--accent-2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>ANTS</span>
            {' '}—{' '}your<br />
            learning path to{' '}
            <span style={{ background: 'linear-gradient(135deg, oklch(0.80 0.18 330), oklch(0.82 0.15 60))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              AI-Native Testing Specialist
            </span>
            {' '}by Dec 2026.
          </h1>

          {/* Sub */}
          <p style={{ fontSize: 16, color: 'var(--ink-70)', lineHeight: 1.65, maxWidth: 560, margin: '0 0 44px' }}>
            394 engineers. 2 hours a day. Zero cost. One destination. A 3-tier programme built on 100% free curriculum, tuned to your role on day one — June through December 2026.
          </p>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 14, marginTop: 48, marginBottom: 44, flexWrap: 'wrap' }}>
            {[
              { n: '394', u: 'QE engineers in flight', color: 'var(--accent-2)' },
              { n: '2 hrs', u: 'Per day, every weekday', color: 'var(--ink-80)' },
              { n: '$0', u: 'Curriculum cost', color: 'oklch(0.80 0.18 330)' },
            ].map(stat => (
              <div key={stat.n} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 14, padding: '18px 28px', backdropFilter: 'blur(12px)', minWidth: 160 }}>
                <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', color: stat.color, lineHeight: 1.1, marginBottom: 6 }}>{stat.n}</div>
                <div style={{ fontSize: 12.5, color: 'var(--ink-50)' }}>{stat.u}</div>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/register')}
              style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 14.5, fontWeight: 600, color: 'white', padding: '13px 28px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, var(--accent-1), var(--accent-2))', cursor: 'pointer', boxShadow: '0 6px 24px oklch(0.78 0.18 285 / 0.4)', transition: 'opacity 0.15s, transform 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              Get Started
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
            </button>

            <button
              onClick={() => window.location.href = '/programme-overview'}
              style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 14.5, fontWeight: 500, color: 'var(--ink-80)', padding: '13px 28px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.14)', background: 'rgba(255,255,255,0.05)', cursor: 'pointer', transition: 'background 0.15s, color 0.15s, border-color 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; e.currentTarget.style.color = 'var(--ink-100)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'var(--ink-80)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)'; }}
            >
              View Programme Overview
            </button>
          </div>
        </section>

        {/* ── Timeline bar ── */}
        <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 48px 80px', marginTop: 80 }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '24px 32px' }}>
            {/* Labels */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-50)', marginBottom: 4 }}>June 1, 2026 · Kickoff</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color: 'var(--ink-60)' }}>QA</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-50)', marginBottom: 4 }}>Dec 31, 2026 · Destination</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, background: 'linear-gradient(135deg, var(--accent-1), var(--accent-2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>ANTS</div>
              </div>
            </div>

            {/* Progress track */}
            <div style={{ height: 8, borderRadius: 999, background: 'rgba(255,255,255,0.07)', overflow: 'hidden', position: 'relative', marginBottom: 14 }}>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, var(--accent-1), var(--accent-2), oklch(0.80 0.18 330))', borderRadius: 999 }} />
            </div>

            {/* Milestones */}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              {[
                { label: 'Jun · Kickoff' },
                { label: 'Jul–Aug · Foundations' },
                { label: 'Sep–Nov · Specialisation' },
                { label: 'Dec · 100% ANTS' },
              ].map(m => (
                <span key={m.label} style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-50)', letterSpacing: '0.06em' }}>{m.label}</span>
              ))}
            </div>
          </div>
        </section>

        {/* ── Feature cards ── */}
        <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 48px 100px', marginTop: 80 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
            {[
              {
                icon: '🎯',
                title: '3-Tier Learning Path',
                desc: 'From QA foundations through to AI-Native automation architecture. Each tier builds on the last.',
                accent: 'var(--accent-1)',
              },
              {
                icon: '🤖',
                title: 'AI-First Curriculum',
                desc: 'Every module is infused with AI tooling — Playwright agents, LLM-driven test generation, self-healing frameworks.',
                accent: 'var(--accent-2)',
              },
              {
                icon: '⚡',
                title: '100% Free Resources',
                desc: 'Zero curriculum cost. All content is sourced from free platforms. Your only investment is 2 hrs per day.',
                accent: 'oklch(0.80 0.18 330)',
              },
              {
                icon: '📈',
                title: 'Role-Tuned from Day One',
                desc: 'Junior, Mid, Senior or Lead — your roadmap is shaped to where you are today and where you\'re heading.',
                accent: 'oklch(0.82 0.15 60)',
              },
            ].map(card => (
              <div key={card.title} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: '24px', backdropFilter: 'blur(12px)', transition: 'border-color 0.18s, transform 0.18s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={{ fontSize: 26, marginBottom: 14 }}>{card.icon}</div>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: card.accent, margin: '0 0 10px', letterSpacing: '-0.01em' }}>{card.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--ink-70)', lineHeight: 1.6, margin: 0 }}>{card.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Footer ── */}
        <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '24px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-50)' }}>© 2026 ANTS Trail · Nous QE Practice</span>
          <div style={{ display: 'flex', gap: 16 }}>
            <button onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-40)', cursor: 'pointer', transition: 'color 0.15s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--ink-80)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--ink-40)'}>Sign In</button>
            <button onClick={() => navigate('/register')} style={{ background: 'none', border: 'none', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-40)', cursor: 'pointer', transition: 'color 0.15s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--ink-80)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--ink-40)'}>Sign Up</button>
            <button onClick={() => window.location.href = '/programme-overview'} style={{ background: 'none', border: 'none', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-40)', cursor: 'pointer', transition: 'color 0.15s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--ink-80)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--ink-40)'}>Programme Overview</button>
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
