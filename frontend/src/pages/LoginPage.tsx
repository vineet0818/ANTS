import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const ALLOWED_DOMAIN = 'nousinfo.com';
function isValidNousEmail(email: string) { return email.toLowerCase().endsWith(`@${ALLOWED_DOMAIN}`); }

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '11px 14px', borderRadius: 10,
  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)',
  color: 'var(--ink-100)', fontSize: 14, outline: 'none',
  transition: 'border-color 0.15s',
  fontFamily: 'var(--font-sans)',
};
const inputErrorStyle: React.CSSProperties = { ...inputStyle, borderColor: 'oklch(0.72 0.18 25)' };

export default function LoginPage() {
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading]       = useState(false);
  const [ssoLoading, setSsoLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleEmailChange = (v: string) => {
    setEmail(v);
    setEmailError(v && !isValidNousEmail(v) ? `Only @${ALLOWED_DOMAIN} addresses are allowed.` : '');
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isValidNousEmail(email)) { setEmailError(`Only @${ALLOWED_DOMAIN} addresses are allowed.`); return; }
    setLoading(true);
    try {
      const loginData = await login(email, password);
      if (loginData.role === 'admin') { navigate('/admin'); return; }
      try { await api.get('/roadmap/'); navigate('/roadmap'); } catch { navigate('/select-profile'); }
    } catch { alert('Login failed. Please check your credentials.'); }
    finally { setLoading(false); }
  };

  const handleSSO = async () => {
    setSsoLoading(true);
    try {
      const res = await api.get('/auth/sso/login');
      window.location.href = res.data.redirect_url;
    } catch { alert('SSO login unavailable. Contact your administrator.'); setSsoLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-0)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative', overflow: 'hidden' }}>
      {/* Subtle aurora behind the card */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: '60vw', height: '60vw', top: '-10%', left: '-5%', borderRadius: '50%', background: 'radial-gradient(circle, oklch(0.72 0.13 285), transparent 70%)', filter: 'blur(90px)', opacity: 0.2 }} />
        <div style={{ position: 'absolute', width: '50vw', height: '50vw', bottom: '-10%', right: '-5%', borderRadius: '50%', background: 'radial-gradient(circle, oklch(0.74 0.10 210), transparent 70%)', filter: 'blur(90px)', opacity: 0.15 }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 420 }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, var(--accent-1), var(--accent-2))', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: 'white', boxShadow: '0 0 24px oklch(0.72 0.13 285 / 0.35)', marginBottom: 16 }}>AT</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-50)', marginBottom: 6 }}>ANTS Trail</div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 32, fontWeight: 700, color: 'var(--ink-100)', margin: 0, letterSpacing: '-0.02em', lineHeight: 1.2 }}>Welcome back</h1>
          <p style={{ fontSize: 13, color: 'var(--ink-70)', marginTop: 6 }}>
            Use your <span style={{ color: 'var(--accent-2)', fontWeight: 600 }}>@{ALLOWED_DOMAIN}</span> account
          </p>
        </div>

        {/* Card */}
        <div style={{ background: 'rgba(13,13,18,0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '40px 44px', boxShadow: '0 32px 80px rgba(0,0,0,0.6)' }}>

          {/* Microsoft SSO */}
          <button type="button" onClick={handleSSO} disabled={ssoLoading}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, height: 40, borderRadius: 10, border: '1px solid rgba(255,255,255,0.10)', background: 'rgba(255,255,255,0.06)', color: 'var(--ink-70)', fontSize: 13, fontWeight: 500, cursor: ssoLoading ? 'not-allowed' : 'pointer', transition: 'background 0.15s', opacity: ssoLoading ? 0.6 : 1 }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.10)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
          >
            <svg width="18" height="18" viewBox="0 0 21 21" fill="none"><rect x="1" y="1" width="9" height="9" fill="#F25022"/><rect x="11" y="1" width="9" height="9" fill="#7FBA00"/><rect x="1" y="11" width="9" height="9" fill="#00A4EF"/><rect x="11" y="11" width="9" height="9" fill="#FFB900"/></svg>
            {ssoLoading ? 'Redirecting…' : 'Sign in with Microsoft'}
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-40)' }}>or password</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--ink-70)', marginBottom: 6 }}>Work email</label>
              <input type="email" placeholder={`you@${ALLOWED_DOMAIN}`} value={email}
                onChange={e => handleEmailChange(e.target.value)} required
                style={emailError ? inputErrorStyle : inputStyle}
                onFocus={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = emailError ? 'oklch(0.72 0.18 25)' : 'rgba(255,255,255,0.10)'; }}
              />
              {emailError && <p style={{ fontSize: 11.5, color: 'oklch(0.72 0.18 25)', marginTop: 5, paddingLeft: 10, borderLeft: '3px solid oklch(0.72 0.18 25)' }}>{emailError}</p>}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--ink-70)', marginBottom: 6 }}>Password</label>
              <input type="password" placeholder="Password" value={password}
                onChange={e => setPassword(e.target.value)} required
                style={inputStyle}
                onFocus={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)'; }}
              />
            </div>

            <button type="submit" disabled={loading || !!emailError}
              style={{ width: '100%', height: 48, borderRadius: 10, border: 'none', fontWeight: 600, fontSize: 14, color: 'white', background: 'linear-gradient(135deg, var(--accent-1), var(--accent-2))', cursor: loading || !!emailError ? 'not-allowed' : 'pointer', opacity: loading || !!emailError ? 0.5 : 1, boxShadow: '0 4px 20px oklch(0.72 0.13 285 / 0.35)', transition: 'opacity 0.15s, transform 0.15s' }}
              onMouseEnter={e => { if (!loading && !emailError) e.currentTarget.style.opacity = '0.88'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = loading || !!emailError ? '0.5' : '1'; }}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          {/* Footer link */}
          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--ink-60)', marginTop: 20, marginBottom: 0 }}>
            No account?{' '}
            <Link to="/register" style={{ color: 'var(--accent-2)', fontWeight: 600, textDecoration: 'none' }}>Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
