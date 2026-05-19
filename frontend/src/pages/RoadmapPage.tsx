import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Layout } from '../components/Layout';

interface ModuleItem {
  id: number;
  title: string;
  category: string;
  resource_name: string;
  resource_link: string;
  estimated_time: string;
  progress_state: string;
  percentage: number;
}

interface RoadmapData {
  profile_name: string;
  overall_percentage: number;
  modules: ModuleItem[];
}

// ── Helpers ──────────────────────────────────────────────
function stateFromPct(pct: number): string {
  if (pct === 0)   return 'not_started';
  if (pct === 100) return 'completed';
  return 'in_progress';
}

/** Extract tier prefix from category string, e.g. "Tier 0 – AI Foundations" → "Tier 0" */
function tierPrefix(category: string): string {
  const m = category.match(/^(Tier\s+\d+|L\d+)/i);
  return m ? m[1].replace(/tier\s+/i, 'Tier ') : 'Other';
}

/** Canonical sort order for tiers */
const TIER_ORDER: Record<string, number> = {
  'Tier 0': 0, 'Tier 1': 1,
  'L1': 2, 'L2': 3, 'L3': 4, 'L4': 5, 'Other': 99,
};

const STATE_COLOR: Record<string, string> = {
  completed:   'oklch(0.78 0.20 150)',
  in_progress: 'var(--accent-2)',
  not_started: 'rgba(255,255,255,0.25)',
};
const STATE_LABEL: Record<string, string> = {
  completed:   'Completed',
  in_progress: 'In progress',
  not_started: 'Not started',
};

// ── Progress Slider ───────────────────────────────────────
function ProgressSlider({
  moduleId,
  initial,
  onSaved,
}: {
  moduleId: number;
  initial: number;
  onSaved: (pct: number) => void;
}) {
  const [pct, setPct]       = useState(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);
  // Lock: minimum is the current committed value (can't slide backwards once started)
  const [minPct, setMinPct] = useState(initial > 0 ? initial : 0);
  const timerRef            = useRef<ReturnType<typeof setTimeout> | null>(null);
  const state               = stateFromPct(pct);

  useEffect(() => {
    setPct(initial);
    if (initial > 0) setMinPct(initial);
  }, [initial]);

  const save = useCallback(async (value: number) => {
    setSaving(true); setSaved(false);
    try {
      await api.put('/progress/update', {
        module_id: moduleId,
        progress_state: stateFromPct(value),
        percentage: value,
      });
      onSaved(value);
      // Lock new minimum
      if (value > 0) setMinPct(value);
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    } finally {
      setSaving(false);
    }
  }, [moduleId, onSaved]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    setPct(v);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => save(v), 600);
  };

  const handlePointerUp = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    save(pct);
  };

  const isComplete = state === 'completed';
  const trackColor = isComplete ? 'oklch(0.78 0.20 150)' : 'linear-gradient(90deg, var(--accent-1), var(--accent-2))';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Status + percentage */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{
            width: 7, height: 7, borderRadius: '50%', display: 'inline-block', flexShrink: 0,
            background: STATE_COLOR[state],
            boxShadow: state !== 'not_started' ? `0 0 8px ${STATE_COLOR[state]}` : 'none',
            transition: 'background 0.25s, box-shadow 0.25s',
          }} />
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em',
            textTransform: 'uppercase', color: STATE_COLOR[state], transition: 'color 0.25s',
          }}>
            {STATE_LABEL[state]}
          </span>
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, color: 'var(--ink-80)' }}>
          {pct}%
          {saving && <span style={{ marginLeft: 6, fontSize: 9, color: 'var(--ink-40)', letterSpacing: '0.1em' }}>SAVING…</span>}
          {saved  && <span style={{ marginLeft: 6, fontSize: 9, color: 'oklch(0.78 0.20 150)', letterSpacing: '0.1em' }}>✓ SAVED</span>}
        </span>
      </div>

      {/* Slider track */}
      <div style={{ position: 'relative', height: 22, display: 'flex', alignItems: 'center' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, height: 6, borderRadius: 999, background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
          <div style={{
            width: `${pct}%`, height: '100%',
            background: trackColor,
            boxShadow: pct > 0 ? `0 0 10px ${isComplete ? 'oklch(0.78 0.20 150 / 0.5)' : 'oklch(0.78 0.18 285 / 0.4)'}` : 'none',
            transition: 'width 0.08s linear, background 0.25s',
            borderRadius: 999,
          }} />
        </div>

        {/* Invisible native input */}
        <input
          type="range"
          min={minPct}
          max={100}
          step={5}
          value={pct}
          onChange={handleChange}
          onPointerUp={handlePointerUp}
          style={{
            position: 'absolute', left: 0, width: '100%', height: 22,
            opacity: 0, cursor: pct === 100 ? 'default' : 'pointer',
            margin: 0, WebkitAppearance: 'none', appearance: 'none', zIndex: 2,
            pointerEvents: pct === 100 ? 'none' : 'auto',
          }}
        />

        {/* Custom thumb */}
        <div style={{
          position: 'absolute',
          left: `calc(${pct}% - 9px)`,
          width: 18, height: 18, borderRadius: '50%',
          background: isComplete ? 'oklch(0.78 0.20 150)' : 'linear-gradient(135deg, var(--accent-1), var(--accent-2))',
          border: '2.5px solid var(--bg-0)',
          boxShadow: `0 0 0 2px ${isComplete ? 'oklch(0.78 0.20 150 / 0.4)' : 'oklch(0.78 0.18 285 / 0.4)'}, 0 2px 8px rgba(0,0,0,0.5)`,
          transition: 'left 0.08s linear, background 0.25s',
          zIndex: 1, pointerEvents: 'none',
        }} />
      </div>

      {/* Tick marks */}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {[0, 25, 50, 75, 100].map(t => (
          <span key={t} style={{
            fontFamily: 'var(--font-mono)', fontSize: 9,
            color: pct >= t ? 'var(--ink-40)' : 'var(--ink-20)',
            transition: 'color 0.2s',
          }}>{t}</span>
        ))}
      </div>
    </div>
  );
}

// ── Tier accordion section ────────────────────────────────
function TierSection({
  tier,
  modules,
  onModuleSaved,
}: {
  tier: string;
  modules: ModuleItem[];
  onModuleSaved: (moduleId: number, pct: number) => void;
}) {
  const [open, setOpen] = useState(true);

  const completedCount = modules.filter(m => m.progress_state === 'completed').length;
  const avgPct = modules.length
    ? Math.round(modules.reduce((s, m) => s + m.percentage, 0) / modules.length)
    : 0;

  return (
    <div style={{ marginBottom: 12 }}>
      {/* Tier header — clickable */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 12,
          padding: '14px 20px', borderRadius: open ? '16px 16px 0 0' : 16,
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)',
          borderBottom: open ? '1px solid rgba(255,255,255,0.04)' : undefined,
          cursor: 'pointer', transition: 'background 0.15s',
          textAlign: 'left',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
      >
        {/* Chevron */}
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="var(--ink-60)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
          style={{ flexShrink: 0, transition: 'transform 0.2s', transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}
        >
          <path d="M9 18l6-6-6-6" />
        </svg>

        {/* Tier label */}
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.12em',
          textTransform: 'uppercase', fontWeight: 600,
          background: 'linear-gradient(135deg, var(--accent-1), var(--accent-2))',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>{tier}</span>

        {/* Module count */}
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-40)' }}>
          {completedCount}/{modules.length} modules
        </span>

        {/* Mini progress bar */}
        <div style={{ flex: 1, maxWidth: 140, height: 4, borderRadius: 999, background: 'rgba(255,255,255,0.07)', overflow: 'hidden', marginLeft: 'auto' }}>
          <div style={{
            width: `${avgPct}%`, height: '100%',
            background: avgPct === 100 ? 'oklch(0.78 0.20 150)' : 'linear-gradient(90deg, var(--accent-1), var(--accent-2))',
            transition: 'width 0.4s ease', borderRadius: 999,
          }} />
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-60)', width: 32, textAlign: 'right' }}>
          {avgPct}%
        </span>
      </button>

      {/* Module list */}
      {open && (
        <div style={{
          border: '1px solid rgba(255,255,255,0.09)', borderTop: 'none',
          borderRadius: '0 0 16px 16px', overflow: 'hidden',
        }}>
          {modules.map((mod, idx) => (
            <div
              key={mod.id}
              className={`ants-module-card${mod.progress_state === 'completed' ? ' completed' : ''}`}
              style={{
                borderRadius: 0,
                border: 'none',
                borderTop: idx > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                padding: '20px 24px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
                {/* Left: module info */}
                <div style={{ flex: 1, minWidth: 200 }}>
                  {/* Subcategory tag */}
                  <div style={{ marginBottom: 6 }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase',
                      color: 'var(--ink-40)', background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.07)',
                      padding: '2px 7px', borderRadius: 4,
                    }}>
                      {mod.category.replace(/^(Tier\s+\d+|L\d+)\s*[–-]\s*/i, '')}
                    </span>
                  </div>

                  <h3 style={{ margin: '0 0 6px', fontSize: 14.5, fontWeight: 600, color: 'var(--ink-100)', letterSpacing: '-0.01em', lineHeight: 1.3 }}>
                    {mod.title}
                  </h3>
                  <p style={{ fontSize: 12, color: 'var(--ink-60)', margin: '0 0 12px' }}>{mod.resource_name}</p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    {/* Subtle glass resource button */}
                    <a
                      href={mod.resource_link}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        fontSize: 12, fontWeight: 500, color: 'var(--ink-80)',
                        background: 'rgba(255,255,255,0.07)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        padding: '6px 13px', borderRadius: 8, textDecoration: 'none',
                        transition: 'background 0.15s, color 0.15s, border-color 0.15s',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.11)';
                        e.currentTarget.style.color = 'var(--ink-100)';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
                        e.currentTarget.style.color = 'var(--ink-80)';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                        <polyline points="15 3 21 3 21 9"/>
                        <line x1="10" y1="14" x2="21" y2="3"/>
                      </svg>
                      Open resource
                    </a>
                    {mod.estimated_time && (
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--ink-40)' }}>
                        ⏱ {mod.estimated_time}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right: slider */}
                <div style={{ width: 210, flexShrink: 0 }}>
                  <ProgressSlider
                    moduleId={mod.id}
                    initial={mod.percentage}
                    onSaved={(pct) => onModuleSaved(mod.id, pct)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────
export default function RoadmapPage() {
  const [roadmap,  setRoadmap]  = useState<RoadmapData | null>(null);
  const [modules,  setModules]  = useState<ModuleItem[]>([]);
  const navigate = useNavigate();

  useEffect(() => { fetchRoadmap(); }, []);

  const fetchRoadmap = async () => {
    try {
      const res = await api.get('/roadmap/');
      setRoadmap(res.data);
      setModules(res.data.modules ?? []);
    } catch {
      navigate('/select-profile');
    }
  };

  const handleModuleSaved = useCallback((moduleId: number, newPct: number) => {
    const newState = stateFromPct(newPct);
    setModules(prev => prev.map(m => m.id === moduleId ? { ...m, percentage: newPct, progress_state: newState } : m));
    setRoadmap(prev => {
      if (!prev) return prev;
      const updated = prev.modules.map(m => m.id === moduleId ? { ...m, percentage: newPct, progress_state: newState } : m);
      const completed = updated.filter(m => m.progress_state === 'completed').length;
      return { ...prev, modules: updated, overall_percentage: Math.round((completed / updated.length) * 100) };
    });
  }, []);

  if (!roadmap) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-0)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-40)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          Loading roadmap…
        </span>
      </div>
    );
  }

  // Group modules by tier prefix
  const grouped: Record<string, ModuleItem[]> = {};
  for (const mod of modules) {
    const tier = tierPrefix(mod.category);
    if (!grouped[tier]) grouped[tier] = [];
    grouped[tier].push(mod);
  }
  const tiers = Object.keys(grouped).sort((a, b) => (TIER_ORDER[a] ?? 99) - (TIER_ORDER[b] ?? 99));

  const completedCount = modules.filter(m => m.progress_state === 'completed').length;

  return (
    <Layout>
      {/* Hero */}
      <div className="ants-hero">
        <div className="ants-hero-top">
          <div>
            <div className="ants-welcome">Active Roadmap</div>
            <div className="ants-hello" style={{ fontSize: 30 }}>{roadmap.profile_name}</div>
          </div>
          <div className="ants-step-pill">
            <svg width="10" height="10" viewBox="0 0 10 10"><circle cx="5" cy="5" r="3" fill="currentColor"/></svg>
            <span className="num">{roadmap.overall_percentage}%</span> complete
          </div>
        </div>

        {/* Overall progress */}
        <div style={{ marginTop: 16, maxWidth: 480 }}>
          <div style={{ height: 6, borderRadius: 999, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
            <div style={{
              width: `${roadmap.overall_percentage}%`, height: '100%',
              background: 'linear-gradient(90deg, var(--accent-1), var(--accent-2))',
              boxShadow: '0 0 12px oklch(0.78 0.18 285 / 0.5)',
              transition: 'width 0.5s cubic-bezier(0.34,1.56,0.64,1)',
            }} />
          </div>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-40)', marginTop: 8 }}>
            {completedCount} of {modules.length} modules completed
          </p>
        </div>
      </div>

      {/* Section head */}
      <div className="ants-section-head" style={{ marginBottom: 16 }}>
        <h2>Learning <em>modules</em></h2>
        <div className="ants-hint">{tiers.length} tiers · drag slider to update progress</div>
      </div>

      {/* Tier accordion groups */}
      {tiers.map(tier => (
        <TierSection
          key={tier}
          tier={tier}
          modules={grouped[tier]}
          onModuleSaved={handleModuleSaved}
        />
      ))}

      <style>{`
        input[type=range]::-webkit-slider-thumb { opacity: 0; }
        input[type=range]::-moz-range-thumb { opacity: 0; }
      `}</style>
    </Layout>
  );
}
