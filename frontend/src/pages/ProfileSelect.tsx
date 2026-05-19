import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Layout } from '../components/Layout';
import { useAuth } from '../context/AuthContext';

interface ApiProfile {
  id: number;
  name: string;
  profile_key: string;
  description: string;
  min_weeks: number;
  max_weeks: number;
}

interface ProfileMeta {
  key: string;
  level: string;
  track: string;
  skills: string[];
  c1: string;
  c2: string;
  icon: React.FC<{ size?: number; color?: string }>;
}

// ── Icon components ──
const SproutIcon: React.FC<{ size?: number; color?: string }> = ({ size = 20, color = 'white' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20v-7"/>
    <path d="M12 13c0-3 2-5 5-5 0 3-2 5-5 5z"/>
    <path d="M12 13c0-3-2-5-5-5 0 3 2 5 5 5z"/>
    <path d="M6 20h12"/>
  </svg>
);

const RobotIcon: React.FC<{ size?: number; color?: string }> = ({ size = 20, color = 'white' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="8" width="16" height="11" rx="2.5"/>
    <path d="M12 5v3"/><circle cx="12" cy="4" r="1.3"/>
    <circle cx="9" cy="13" r="1.1" fill={color} stroke="none"/>
    <circle cx="15" cy="13" r="1.1" fill={color} stroke="none"/>
    <path d="M9.5 16.5h5"/><path d="M2 13v2M22 13v2"/>
  </svg>
);

const RocketIcon: React.FC<{ size?: number; color?: string }> = ({ size = 20, color = 'white' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 4c4 0 6 2 6 6-2 0-3 1-4 2l-5 5-3-3 5-5c1-1 2-2 2-4-1 0-2 0-3 .5"/>
    <path d="M7 14l-3 3 3 3 3-3"/><path d="M9 12l-3 3"/>
  </svg>
);

const CrownIcon: React.FC<{ size?: number; color?: string }> = ({ size = 20, color = 'white' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 8 6 17h12l3-9-5 3-4-6-4 6z" strokeLinejoin="round"/>
    <path d="M6 20h12"/>
    <circle cx="3" cy="8" r="1.2" fill={color}/>
    <circle cx="21" cy="8" r="1.2" fill={color}/>
    <circle cx="12" cy="5" r="1.2" fill={color}/>
  </svg>
);

const CheckIcon: React.FC<{ size?: number }> = ({ size = 11 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <path d="m5 12 5 5L20 7"/>
  </svg>
);

const ArrowIcon: React.FC<{ size?: number }> = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M13 5l7 7-7 7"/>
  </svg>
);

// ── Profile metadata (design overlay on top of API data) ──
const PROFILE_META: Record<string, ProfileMeta> = {
  junior_qa: {
    key: 'junior_qa',
    level: 'Level 01 · Foundation',
    track: 'Foundation',
    skills: ['Playwright', 'Reflect', 'AI prompts'],
    c1: 'oklch(0.82 0.16 200)',
    c2: 'oklch(0.78 0.18 285)',
    icon: SproutIcon,
  },
  mid_level: {
    key: 'mid_level',
    level: 'Level 02 · Build',
    track: 'Build',
    skills: ['API tests', 'CI/CD', 'Codegen'],
    c1: 'oklch(0.80 0.16 150)',
    c2: 'oklch(0.82 0.16 200)',
    icon: RobotIcon,
  },
  senior_sdet: {
    key: 'senior_sdet',
    level: 'Level 03 · Architect',
    track: 'Architect',
    skills: ['Agents', 'MCP', 'Healer'],
    c1: 'oklch(0.78 0.18 285)',
    c2: 'oklch(0.80 0.18 330)',
    icon: RocketIcon,
  },
  test_lead: {
    key: 'test_lead',
    level: 'Level 04 · Strategy',
    track: 'Strategy',
    skills: ['Strategy', 'Org design', 'Vendor'],
    c1: 'oklch(0.80 0.18 330)',
    c2: 'oklch(0.82 0.15 60)',
    icon: CrownIcon,
  },
};

// Fallback for unknown profile keys
function getMetaForProfile(profile: ApiProfile): ProfileMeta {
  return PROFILE_META[profile.profile_key] ?? {
    key: profile.profile_key,
    level: 'Level · Custom',
    track: 'Custom',
    skills: [],
    c1: 'oklch(0.78 0.18 285)',
    c2: 'oklch(0.82 0.16 200)',
    icon: SproutIcon,
  };
}

// ── Individual card with mouse-tracking shimmer ──
function ProfileCard({
  profile,
  meta,
  selected,
  onSelect,
}: {
  profile: ApiProfile;
  meta: ProfileMeta;
  selected: boolean;
  onSelect: (id: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const Icon = meta.icon;

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
    el.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
  }, []);

  return (
    <div
      ref={ref}
      className={`ants-card${selected ? ' selected' : ''}`}
      style={{ '--c1': meta.c1, '--c2': meta.c2 } as React.CSSProperties}
      onClick={() => onSelect(profile.id)}
      onMouseMove={onMouseMove}
    >
      <div className="ants-card-glow" />

      <div className="ants-card-status">
        {selected ? (
          <><CheckIcon size={11} /> Selected</>
        ) : 'Profile'}
      </div>

      <div className="ants-card-emblem"
        style={{
          background: `linear-gradient(135deg, color-mix(in oklch, ${meta.c1} 20%, transparent), color-mix(in oklch, ${meta.c2} 15%, transparent))`,
          borderColor: `color-mix(in oklch, ${meta.c1} 35%, transparent)`,
        }}>
        <Icon size={20} color="white" />
      </div>

      <div className="ants-card-level">{meta.level}</div>
      <h3>{profile.name}</h3>
      <p className="ants-card-desc">{profile.description}</p>

      <div className="ants-card-skills">
        {meta.skills.map(s => <span key={s} className="ants-chip">{s}</span>)}
      </div>

      <div className="ants-card-meta">
        <div className="ants-meta-block">
          <span className="k">Duration</span>
          <span className="v">{profile.min_weeks}–{profile.max_weeks} weeks</span>
        </div>
        <div className="ants-meta-block" style={{ alignItems: 'flex-end', textAlign: 'right' }}>
          <span className="k">Track</span>
          <span className="v" style={{ color: meta.c1 }}>{meta.track}</span>
        </div>
      </div>
    </div>
  );
}

// ── Main page ──
export default function ProfileSelect() {
  const [profiles, setProfiles] = useState<ApiProfile[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const firstName = user?.full_name?.split(' ')[0] ?? 'Learner';

  useEffect(() => {
    api.get('/profile/list').then((res) => setProfiles(res.data));
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!profiles.length) return;
      const idx = profiles.findIndex(p => p.id === selected);
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        const next = profiles[(idx + 1) % profiles.length];
        setSelected(next.id);
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        const prev = profiles[(idx - 1 + profiles.length) % profiles.length];
        setSelected(prev.id);
      } else if (e.key === 'Enter' && selected) {
        handleSubmit();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [profiles, selected]);

  const handleSubmit = async () => {
    if (!selected || loading) return;
    setLoading(true);
    try {
      await api.post('/profile/select', { profile_id: selected });
      navigate('/roadmap');
    } finally {
      setLoading(false);
    }
  };

  const selectedProfile = profiles.find(p => p.id === selected);

  return (
    <Layout>
      {/* Hero */}
      <div className="ants-hero">
        <div className="ants-hero-top">
          <div>
            <div className="ants-welcome">Welcome back</div>
            <div className="ants-hello">
              Hey, {firstName} <span style={{ display: 'inline-block', animation: 'wave 1.8s ease-in-out infinite' }}>👋</span>
            </div>
          </div>
          <div className="ants-step-pill">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <circle cx="5" cy="5" r="3" fill="currentColor" />
            </svg>
            Step <span className="num">1</span> / 4
          </div>
        </div>
        <p className="ants-hero-sub">
          Where Trailblazers are built — pick the profile that matches your goals
          and we'll shape a roadmap, modules, and projects around it.
        </p>
      </div>

      {/* Section head */}
      <div className="ants-section-head">
        <div>
          <h2>Select your <em>learning path</em></h2>
        </div>
        <div className="ants-hint">
          Use <kbd>↑</kbd> <kbd>↓</kbd> to browse · <kbd>Enter</kbd> to confirm
        </div>
      </div>

      {/* Cards */}
      {profiles.length === 0 ? (
        <div style={{ display: 'flex', gap: 16 }}>
          {[1,2,3,4].map(i => (
            <div key={i} className="ants-card" style={{ flex: 1, minHeight: 280, opacity: 0.4 }}>
              <div style={{ height: '100%', background: 'rgba(255,255,255,0.03)', borderRadius: 12 }} />
            </div>
          ))}
        </div>
      ) : (
        <div className="ants-cards">
          {profiles.map(profile => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              meta={getMetaForProfile(profile)}
              selected={selected === profile.id}
              onSelect={setSelected}
            />
          ))}
        </div>
      )}

      {/* Cohort stats row */}
      <div className="ants-cohort">
        <div className="ants-info-card">
          <div className="label">Active cohort</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="ants-avatar-stack">
              {[
                { init: 'AR', ac1: 'oklch(0.78 0.16 285)', ac2: 'oklch(0.78 0.16 200)' },
                { init: 'MK', ac1: 'oklch(0.80 0.16 30)',  ac2: 'oklch(0.78 0.16 350)' },
                { init: 'SP', ac1: 'oklch(0.80 0.16 150)', ac2: 'oklch(0.78 0.16 200)' },
                { init: 'RV', ac1: 'oklch(0.80 0.18 330)', ac2: 'oklch(0.78 0.16 285)' },
              ].map(a => (
                <div key={a.init} className="ants-av" style={{ '--ac1': a.ac1, '--ac2': a.ac2 } as React.CSSProperties}>{a.init}</div>
              ))}
              <div className="ants-av" style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--ink-80)' }}>+18</div>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-60)', textAlign: 'right' }}>
              22 learners<br />
              <span style={{ color: 'oklch(0.88 0.16 150)' }}>● 7 online now</span>
            </div>
          </div>
        </div>

        <div className="ants-info-card">
          <div className="label">Avg. completion</div>
          <div className="ants-stat">
            <span className="n">11.4</span><span className="u">weeks</span>
            <span className="delta">↓ 14%</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink-60)', marginTop: 6 }}>vs. previous cohort</div>
        </div>

        <div className="ants-info-card">
          <div className="label">AI augmentation</div>
          <div className="ants-stat">
            <span className="n">82</span><span className="u">% modules</span>
            <span className="delta">+12%</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink-60)', marginTop: 6 }}>across the catalogue</div>
        </div>
      </div>

      {/* Floating CTA dock */}
      <div className="ants-cta-dock">
        <div className="ants-cta-status">
          {selectedProfile
            ? <>Path · <b>{selectedProfile.name}</b></>
            : <>No profile selected yet</>}
        </div>
        <button
          className="ants-cta-btn"
          disabled={!selected || loading}
          onClick={handleSubmit}
        >
          {loading ? 'Loading…' : 'Continue to roadmap'}
          {!loading && <ArrowIcon size={15} />}
        </button>
      </div>

      <style>{`
        @keyframes wave {
          0%, 100% { transform: rotate(0deg); }
          20% { transform: rotate(-10deg); }
          40% { transform: rotate(14deg); }
          60% { transform: rotate(-6deg); }
          80% { transform: rotate(10deg); }
        }
      `}</style>
    </Layout>
  );
}
