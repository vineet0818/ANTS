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
  transition: 'border-color 0.15s', fontFamily: 'var(--font-sans)',
};
const inputErrorStyle: React.CSSProperties = { ...inputStyle, borderColor: 'oklch(0.72 0.18 25)' };

export default function RegisterPage() {
  const [name, setName]             = useState('');
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading]       = useState(false);
  const { register } = useAuth();
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
      await register(name, email, password);
      try { await api.get('/roadmap/'); navigate('/roadmap'); } catch { navigate('/select-profile'); }
    } catch (err) {
      console.error('Registration failed', err);
      alert('Registration failed. The email may already be in use.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-0)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative', overflow: 'hidden' }}>
      {/* Aurora */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: '60vw', height: '60vw', top: '-10%', right: '-5%', borderRadius: '50%', background: 'radial-gradient(circle, oklch(0.80 0.18 330), transparent 70%)', filter: 'blur(90px)', opacity: 0.18 }} />
        <div style={{ position: 'absolute', width: '50vw', height: '50vw', bottom: '-10%', left: '-5%', borderRadius: '50%', background: 'radial-gradient(circle, oklch(0.82 0.16 200), transparent 70%)', filter: 'blur(90px)', opacity: 0.15 }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 420 }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, var(--accent-1), var(--accent-2))', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: 'white', boxShadow: '0 0 24px oklch(0.78 0.18 285 / 0.35)', marginBottom: 16 }}>AT</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-40)', marginBottom: 6 }}>ANTS Trail</div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 30, fontWeight: 400, color: 'var(--ink-100)', margin: 0, letterSpacing: '-0.02em' }}>Join the platform</h1>
          <p style={{ fontSize: 13, color: 'var(--ink-60)', marginTop: 6 }}>
            Requires a <span style={{ color: 'var(--accent-2)', fontWeight: 600 }}>@{ALLOWED_DOMAIN}</span> address
          </p>
        </div>

        {/* Card */}
        <div style={{ background: 'rgba(13,13,18,0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '32px 28px', boxShadow: '0 32px 80px rgba(0,0,0,0.6)' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <input type="text" placeholder="Full name" value={name}
              onChange={e => setName(e.target.value)} required
              style={inputStyle}
              onFocus={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)'; }}
            />

            <div>
              <input type="email" placeholder={`you@${ALLOWED_DOMAIN}`} value={email}
                onChange={e => handleEmailChange(e.target.value)} required
                style={emailError ? inputErrorStyle : inputStyle}
                onFocus={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = emailError ? 'oklch(0.72 0.18 25)' : 'rgba(255,255,255,0.10)'; }}
              />
              {emailError && <p style={{ fontSize: 11.5, color: 'oklch(0.72 0.18 25)', marginTop: 5, paddingLeft: 2 }}>{emailError}</p>}
            </div>

            <input type="password" placeholder="Password (min 8 characters)" value={password}
              onChange={e => setPassword(e.target.value)} required minLength={8}
              style={inputStyle}
              onFocus={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)'; }}
            />

            <button type="submit" disabled={loading || !!emailError}
              style={{ width: '100%', padding: '12px 0', borderRadius: 10, border: 'none', fontWeight: 600, fontSize: 14, color: 'white', background: 'linear-gradient(135deg, var(--accent-1), var(--accent-2))', cursor: loading || !!emailError ? 'not-allowed' : 'pointer', opacity: loading || !!emailError ? 0.5 : 1, boxShadow: '0 4px 20px oklch(0.78 0.18 285 / 0.35)', transition: 'opacity 0.15s' }}
              onMouseEnter={e => { if (!loading && !emailError) e.currentTarget.style.opacity = '0.88'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = loading || !!emailError ? '0.5' : '1'; }}
            >
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--ink-60)', marginTop: 20, marginBottom: 0 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--accent-2)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
