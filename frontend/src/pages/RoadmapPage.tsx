import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Layout } from '../components/Layout';
import { useTheme } from '../context/ThemeContext';

interface ModuleItem {
  id: number;
  title: string;
  category: string;
  resource_name: string;
  resource_link: string;
  estimated_time: string;
  progress_state: string;
  percentage: number;
  sequence_order: number;
  started_at: string | null;
}

interface RoadmapData {
  profile_name: string;
  overall_percentage: number;
  total_modules: number;
  completed_modules: number;
  modules: ModuleItem[];
  profile_start_date: string | null;
  profile_target_date: string | null;
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function stateFromPct(pct: number): string {
  if (pct === 0)   return 'not_started';
  if (pct === 100) return 'completed';
  return 'in_progress';
}

function tierPrefix(category: string): string {
  const m = category.match(/^(Tier\s+\d+|L\d+)/i);
  return m ? m[1].replace(/tier\s+/i, 'Tier ') : 'Other';
}

function tierSectionName(category: string): string {
  return category.replace(/^(Tier\s+\d+|L\d+)\s*[–\-]\s*/i, '').trim();
}

const TIER_ORDER: Record<string, number> = {
  'Tier 0': 0, 'Tier 1': 1, 'L1': 2, 'L2': 3, 'L3': 4, 'L4': 5, 'Other': 99,
};

const STATE_COLOR: Record<string, string> = {
  completed:   'oklch(0.78 0.20 150)',
  in_progress: 'oklch(0.82 0.16 75)',
  not_started: 'var(--glass-stroke)',
};
const STATE_LABEL: Record<string, string> = {
  completed:   'Completed',
  in_progress: 'In progress',
  not_started: 'Not started',
};

/** Parse a date string to a Date, returns null if invalid */
function parseDate(s: string | null | undefined): Date | null {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

/** Format "Jun 1" style */
function fmtShort(d: Date): string {
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

/** Calculate planned start/end for a module based on sequence and profile dates */
function plannedDates(
  seqOrder: number,
  totalModules: number,
  startDate: Date,
  targetDate: Date,
): { start: Date; end: Date } {
  const totalMs = targetDate.getTime() - startDate.getTime();
  const msPerModule = totalMs / totalModules;
  const start = new Date(startDate.getTime() + (seqOrder - 1) * msPerModule);
  const end   = new Date(startDate.getTime() + seqOrder * msPerModule);
  return { start, end };
}

/** Derive ON TRACK / AT RISK / NOT STARTED / COMPLETED / UPCOMING */
function timelineStatus(
  state: string,
  plannedEnd: Date,
  startedAt: Date | null,
): { label: string; color: string; bg: string; border: string } {
  const today = new Date();
  if (state === 'completed')
    return { label: 'COMPLETED', color: '#4ade80', bg: 'rgba(34,197,94,.1)', border: 'rgba(34,197,94,.25)' };
  if (startedAt) {
    if (startedAt <= plannedEnd)
      return { label: 'ON TRACK', color: '#4ade80', bg: 'rgba(34,197,94,.1)', border: 'rgba(34,197,94,.25)' };
    return { label: 'LATE START', color: '#fbbf24', bg: 'rgba(234,179,8,.1)', border: 'rgba(234,179,8,.25)' };
  }
  if (today > plannedEnd)
    return { label: 'NOT STARTED', color: '#f87171', bg: 'rgba(239,68,68,.1)', border: 'rgba(239,68,68,.25)' };
  return { label: 'UPCOMING', color: 'var(--ink-50)', bg: 'var(--glass-fill)', border: 'var(--glass-stroke)' };
}

// ── Progress Slider ────────────────────────────────────────────────────────────
// Slider is visual-only until the user clicks Submit.
// Once submitted, the locked minimum prevents any decrease.
function ProgressSlider({ moduleId, initial, onSaved }: {
  moduleId: number; initial: number; onSaved: (pct: number) => void;
}) {
  const [pct, setPct]           = useState(initial);
  const [savedPct, setSavedPct] = useState(initial);          // last committed value
  const [lockedMin, setLockedMin] = useState(initial > 0 ? initial : 0); // floor — never decreases
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const state                   = stateFromPct(pct);
  const isComplete              = savedPct === 100;
  const hasUnsaved              = pct !== savedPct;

  useEffect(() => {
    setPct(initial);
    setSavedPct(initial);
    setLockedMin(initial > 0 ? initial : 0);
  }, [initial]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPct(Number(e.target.value));
  };

  const handleSubmit = useCallback(async () => {
    if (pct === savedPct || saving) return;
    setSaving(true); setSaved(false);
    try {
      await api.put('/progress/update', {
        module_id: moduleId,
        progress_state: stateFromPct(pct),
        percentage: pct,
      });
      onSaved(pct);
      setSavedPct(pct);
      if (pct > lockedMin) setLockedMin(pct);   // lock floor to new committed value
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally { setSaving(false); }
  }, [pct, savedPct, saving, moduleId, onSaved, lockedMin]);

  const trackColor = isComplete
    ? 'oklch(0.78 0.20 150)'
    : 'linear-gradient(90deg, var(--accent-1), var(--accent-2))';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

      {/* ── Status + percentage row ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{
            width: 7, height: 7, borderRadius: '50%', display: 'inline-block', flexShrink: 0,
            background: STATE_COLOR[state],
            boxShadow: state !== 'not_started' ? `0 0 8px ${STATE_COLOR[state]}` : 'none',
            transition: 'background 0.25s',
          }} />
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em',
            textTransform: 'uppercase', color: STATE_COLOR[state], transition: 'color 0.25s',
          }}>
            {STATE_LABEL[state]}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, color: 'var(--ink-80)' }}>
            {pct}%
            {saving && <span style={{ marginLeft: 6, fontSize: 9, color: 'var(--ink-50)', letterSpacing: '0.1em' }}>SAVING…</span>}
            {saved  && <span style={{ marginLeft: 6, fontSize: 9, color: 'oklch(0.78 0.20 150)', letterSpacing: '0.1em' }}>✓ SAVED</span>}
          </span>
        </div>
      </div>

      {/* ── Track ── */}
      <div style={{ position: 'relative', height: 22, display: 'flex', alignItems: 'center' }}>
        <div style={{
          position: 'absolute', left: 0, right: 0, height: 6,
          borderRadius: 999, background: 'var(--glass-fill)', overflow: 'hidden',
        }}>
          <div style={{
            width: `${pct}%`, height: '100%', background: trackColor,
            boxShadow: pct > 0 ? `0 0 10px ${isComplete ? 'oklch(0.78 0.20 150 / 0.5)' : 'oklch(0.72 0.13 285 / 0.2)'}` : 'none',
            transition: 'width 0.08s linear', borderRadius: 999,
          }} />
        </div>
        <input
          type="range" min={lockedMin} max={100} step={5} value={pct}
          onChange={handleChange}
          disabled={isComplete}
          style={{
            position: 'absolute', left: 0, width: '100%', height: 22,
            opacity: 0, cursor: isComplete ? 'default' : 'pointer',
            margin: 0, WebkitAppearance: 'none', appearance: 'none',
            zIndex: 2, pointerEvents: isComplete ? 'none' : 'auto',
          }}
        />
        <div style={{
          position: 'absolute', left: `calc(${pct}% - 9px)`, width: 18, height: 18,
          borderRadius: '50%',
          background: isComplete ? 'oklch(0.78 0.20 150)' : 'linear-gradient(135deg, var(--accent-1), var(--accent-2))',
          border: '2.5px solid var(--bg-0)',
          boxShadow: `0 0 0 2px ${isComplete ? 'oklch(0.78 0.20 150 / 0.4)' : 'oklch(0.72 0.13 285 / 0.2)'}, 0 2px 8px rgba(0,0,0,0.5)`,
          transition: 'left 0.08s linear', zIndex: 1, pointerEvents: 'none',
        }} />
      </div>

      {/* ── Tick labels ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {[0, 25, 50, 75, 100].map(t => (
          <span key={t} style={{
            fontFamily: 'var(--font-mono)', fontSize: 9,
            color: pct >= t ? 'var(--ink-50)' : 'var(--ink-30)', transition: 'color 0.2s',
          }}>{t}</span>
        ))}
      </div>

      {/* ── Submit button — hidden when fully completed ── */}
      {!isComplete && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 2 }}>
          <button
            onClick={handleSubmit}
            disabled={!hasUnsaved || saving}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '5px 14px', borderRadius: 20, fontSize: 11, fontWeight: 600,
              fontFamily: 'var(--font-mono)', letterSpacing: '0.05em',
              cursor: !hasUnsaved || saving ? 'default' : 'pointer',
              transition: 'all 0.18s',
              background: hasUnsaved && !saving
                ? 'linear-gradient(135deg, var(--accent-1), var(--accent-2))'
                : 'var(--glass-fill)',
              border: hasUnsaved && !saving
                ? '1px solid transparent'
                : '1px solid var(--glass-stroke)',
              color: hasUnsaved && !saving ? '#fff' : 'var(--ink-30)',
              boxShadow: hasUnsaved && !saving
                ? '0 2px 10px oklch(0.72 0.13 285 / 0.35)'
                : 'none',
              opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? (
              <>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
                  style={{ animation: 'spin 1s linear infinite' }}>
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                Saving…
              </>
            ) : (
              <>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Submit
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Tier Summary Cards ─────────────────────────────────────────────────────────
function TierSummaryCards({ grouped, tiers }: {
  grouped: Record<string, ModuleItem[]>; tiers: string[];
}) {
  const TIER_ACCENT: Record<string, string> = {
    'Tier 0': 'var(--accent-2)',
    'Tier 1': 'var(--accent-1)',
    'L1':     'oklch(0.80 0.18 330)',
    'L2':     'oklch(0.80 0.16 150)',
    'L3':     'oklch(0.78 0.20 285)',
    'L4':     'oklch(0.82 0.15 60)',
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(tiers.length, 4)}, 1fr)`, gap: 12, marginBottom: 28 }}>
      {tiers.map(tier => {
        const mods        = grouped[tier];
        const done        = mods.filter(m => m.progress_state === 'completed').length;
        const inProgress  = mods.filter(m => m.progress_state === 'in_progress').length;
        const pct         = mods.length ? Math.round((done / mods.length) * 100) : 0;
        const color       = TIER_ACCENT[tier] ?? 'var(--accent-1)';

        // Section subtitle: most-common category name (strip tier prefix)
        const sectionName = tierSectionName(mods[0]?.category ?? '');

        const pctColor = pct === 0
          ? (inProgress > 0 ? 'var(--accent-2)' : 'var(--glass-stroke)')
          : pct === 100 ? 'oklch(0.78 0.20 150)'
          : 'var(--accent-2)';

        return (
          <div key={tier} style={{
            background: 'var(--bg-2)', border: '1px solid var(--glass-stroke)',
            borderRadius: 14, padding: '18px 20px',
            borderTop: `3px solid ${color}`,
          }}>
            {/* Tier label */}
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color, fontWeight: 700, marginBottom: 6 }}>
              {tier} — {sectionName.split(' ').slice(0, 3).join(' ')}
            </div>

            {/* Section title */}
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink-100)', marginBottom: 12, lineHeight: 1.3, letterSpacing: '-0.01em' }}>
              {sectionName}
            </div>

            {/* Done count */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 10 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-60)' }}>
                <b style={{ color: 'var(--ink-100)' }}>{done}</b> / {mods.length} done
              </span>
              <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color: pctColor }}>
                {pct}%
              </span>
            </div>

            {/* Progress bar */}
            <div style={{ height: 4, borderRadius: 999, background: 'var(--glass-fill)', overflow: 'hidden' }}>
              <div style={{ width: `${pct}%`, height: '100%', background: pct === 100 ? 'oklch(0.78 0.20 150)' : color, borderRadius: 999, transition: 'width 0.4s ease' }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Timeline Strip ─────────────────────────────────────────────────────────────
function TimelineStrip({ mod, totalModules, startDate, targetDate }: {
  mod: ModuleItem; totalModules: number;
  startDate: Date | null; targetDate: Date | null;
}) {
  if (!startDate || !targetDate) return null;

  const { start: planStart, end: planEnd } = plannedDates(mod.sequence_order, totalModules, startDate, targetDate);
  const startedAt = parseDate(mod.started_at);
  const status    = timelineStatus(mod.progress_state, planEnd, startedAt);

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
      marginTop: 14, paddingTop: 12,
      borderTop: '1px solid var(--glass-stroke)',
      fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-50)',
    }}>
      {/* Calendar icon + planned range */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--ink-50)', flexShrink: 0 }}>
          <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
        </svg>
        <span style={{ letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--ink-50)' }}>PLANNED</span>
        <span style={{ color: 'var(--ink-70)', fontWeight: 600 }}>{fmtShort(planStart)}</span>
        <span style={{ color: 'var(--ink-30)' }}>→</span>
        <span style={{ color: 'var(--ink-70)', fontWeight: 600 }}>{fmtShort(planEnd)}</span>
      </div>

      {/* Dot separator */}
      <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--glass-stroke)', flexShrink: 0 }} />

      {/* Started */}
      {startedAt ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--ink-50)' }}>STARTED</span>
          <span style={{ color: 'var(--ink-70)', fontWeight: 600 }}>{fmtShort(startedAt)}</span>
        </div>
      ) : (
        <span style={{ color: 'var(--ink-30)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>NOT STARTED</span>
      )}

      {/* Status badge */}
      <div style={{ marginLeft: 'auto' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
          background: status.bg, border: `1px solid ${status.border}`, color: status.color,
        }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: status.color, flexShrink: 0 }} />
          {status.label}
        </span>
      </div>
    </div>
  );
}

// ── Tier Accordion Section ─────────────────────────────────────────────────────
function TierSection({ tier, modules, onModuleSaved, startDate, targetDate, totalModules }: {
  tier: string; modules: ModuleItem[];
  onModuleSaved: (moduleId: number, pct: number) => void;
  startDate: Date | null; targetDate: Date | null;
  totalModules: number;
}) {
  const [open, setOpen] = useState(true);
  const done   = modules.filter(m => m.progress_state === 'completed').length;
  const avgPct = modules.length ? Math.round(modules.reduce((s, m) => s + m.percentage, 0) / modules.length) : 0;
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const rsrcStyle = isLight
    ? { color: '#6366F1', background: 'rgba(99,102,241,0.10)', border: '1px solid rgba(99,102,241,0.28)' }
    : { color: 'oklch(0.76 0.13 285)', background: 'oklch(0.72 0.13 285 / 0.12)', border: '1px solid oklch(0.72 0.13 285 / 0.3)' };
  const rsrcHoverBg   = isLight ? 'rgba(99,102,241,0.18)' : 'oklch(0.72 0.13 285 / 0.22)';
  const rsrcHoverBdr  = isLight ? 'rgba(99,102,241,0.44)' : 'oklch(0.72 0.13 285 / 0.25)';

  return (
    <div style={{ marginBottom: 32 }}>

      {/* ── Tier label-divider ── */}
      <button onClick={() => setOpen(o => !o)} style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 10,
        padding: '6px 0', background: 'none', border: 'none',
        cursor: 'pointer', textAlign: 'left', marginBottom: open ? 14 : 0,
      }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
          style={{ flexShrink: 0, color: 'var(--ink-30)', transition: 'transform 0.2s', transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}>
          <path d="M9 18l6-6-6-6" />
        </svg>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 600, color: 'var(--ink-50)', whiteSpace: 'nowrap' }}>{tier}</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-30)', whiteSpace: 'nowrap' }}>{done}/{modules.length}</span>
        <div style={{ flex: 1, height: 2, background: 'var(--glass-stroke)', borderRadius: 999 }} />
        <div style={{ width: 72, height: 3, borderRadius: 999, background: 'var(--glass-fill)', overflow: 'hidden', flexShrink: 0 }}>
          <div style={{ width: `${avgPct}%`, height: '100%', background: avgPct === 100 ? 'oklch(0.78 0.20 150)' : 'linear-gradient(90deg, var(--accent-1), var(--accent-2))', borderRadius: 999, transition: 'width 0.4s ease' }} />
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-50)', whiteSpace: 'nowrap' }}>{avgPct}%</span>
      </button>

      {/* ── Individual module cards ── */}
      {open && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {modules.map(mod => (
            <div key={mod.id} className={`ants-module-card${mod.progress_state === 'completed' ? ' completed' : ''}`}
              style={{
                borderRadius: 12, padding: '22px 26px',
                background: 'var(--bg-2)',
                border: '2px solid var(--glass-stroke)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                transition: 'box-shadow 0.18s, border-color 0.18s',
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.6)'; e.currentTarget.style.borderColor = 'var(--hover-tint)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.4)'; e.currentTarget.style.borderColor = 'var(--glass-stroke)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, flexWrap: 'wrap' }}>
                {/* Left: module info */}
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ marginBottom: 6 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-40)', background: 'var(--glass-fill)', border: '1px solid var(--glass-stroke)', padding: '2px 7px', borderRadius: 4 }}>
                      {mod.category.replace(/^(Tier\s+\d+|L\d+)\s*[–-]\s*/i, '')}
                    </span>
                  </div>
                  <h3 style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 600, color: 'var(--ink-100)', letterSpacing: '-0.01em', lineHeight: 1.3 }}>{mod.title}</h3>
                  <p style={{ fontSize: 12, color: 'var(--ink-70)', margin: '0 0 12px' }}>{mod.resource_name}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <a href={mod.resource_link} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 500, padding: '6px 13px', borderRadius: 8, textDecoration: 'none', transition: 'background 0.15s, border-color 0.15s', ...rsrcStyle }}
                      onMouseEnter={e => { e.currentTarget.style.background = rsrcHoverBg; e.currentTarget.style.borderColor = rsrcHoverBdr; }}
                      onMouseLeave={e => { e.currentTarget.style.background = rsrcStyle.background; e.currentTarget.style.borderColor = isLight ? 'rgba(99,102,241,0.28)' : 'oklch(0.72 0.13 285 / 0.3)'; }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                      Open resource
                    </a>
                    {mod.estimated_time && (
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--ink-50)' }}>⏱ {mod.estimated_time}</span>
                    )}
                  </div>
                  <TimelineStrip mod={mod} totalModules={totalModules} startDate={startDate} targetDate={targetDate} />
                </div>
                {/* Right: slider — wider for better usability */}
                <div style={{ width: 280, flexShrink: 0 }}>
                  <ProgressSlider moduleId={mod.id} initial={mod.percentage} onSaved={(pct) => onModuleSaved(mod.id, pct)} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function RoadmapPage() {
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery]   = useState('');
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
      const updated  = prev.modules.map(m => m.id === moduleId ? { ...m, percentage: newPct, progress_state: newState } : m);
      const completed = updated.filter(m => m.progress_state === 'completed').length;
      return { ...prev, modules: updated, completed_modules: completed, overall_percentage: Math.round((completed / updated.length) * 100) };
    });
  }, []);

  if (!roadmap) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-0)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-50)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Loading roadmap…</span>
      </div>
    );
  }

  // Group by tier
  const grouped: Record<string, ModuleItem[]> = {};
  for (const mod of modules) {
    const tier = tierPrefix(mod.category);
    if (!grouped[tier]) grouped[tier] = [];
    grouped[tier].push(mod);
  }
  const tiers = Object.keys(grouped).sort((a, b) => (TIER_ORDER[a] ?? 99) - (TIER_ORDER[b] ?? 99));

  const completedCount  = modules.filter(m => m.progress_state === 'completed').length;
  const inProgressCount = modules.filter(m => m.progress_state === 'in_progress').length;
  const notStartedCount = modules.filter(m => m.progress_state === 'not_started').length;

  const startDate  = parseDate(roadmap.profile_start_date);
  const targetDate = parseDate(roadmap.profile_target_date);

  // ── Filter + search ──────────────────────────────────────────────────────────
  const filteredModules = modules.filter(mod => {
    const q = searchQuery.toLowerCase();
    if (q && !mod.title.toLowerCase().includes(q) && !mod.category.toLowerCase().includes(q) && !(mod.resource_name ?? '').toLowerCase().includes(q)) return false;
    if (activeFilter === 'all')         return true;
    if (activeFilter === 'in_progress') return mod.progress_state === 'in_progress';
    if (activeFilter === 'completed')   return mod.progress_state === 'completed';
    // tier filter
    return tierPrefix(mod.category) === activeFilter;
  });

  const isFiltered = activeFilter !== 'all' || searchQuery.trim() !== '';

  // Filter tab definitions
  const filterTabs = [
    { key: 'all',         label: 'All',         count: modules.length },
    { key: 'in_progress', label: 'In progress',  count: inProgressCount },
    { key: 'completed',   label: 'Completed',    count: completedCount },
    ...tiers.map(t => ({ key: t, label: t, count: grouped[t].length })),
  ];

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
            <span className="num">{roadmap.overall_percentage}%</span> complete
          </div>
        </div>
        <div style={{ marginTop: 16, maxWidth: 480 }}>
          <div style={{ height: 6, borderRadius: 999, background: 'var(--glass-fill)', overflow: 'hidden' }}>
            <div style={{ width: `${roadmap.overall_percentage}%`, height: '100%', background: 'linear-gradient(90deg, var(--accent-1), var(--accent-2))', boxShadow: '0 0 12px oklch(0.72 0.13 285 / 0.25)', transition: 'width 0.5s cubic-bezier(0.34,1.56,0.64,1)' }} />
          </div>
        </div>
      </div>

      {/* ── Tier summary cards ── */}
      <TierSummaryCards grouped={grouped} tiers={tiers} />

      {/* ── "Your modules" header + filter bar + search ── */}
      <div style={{ marginBottom: 16 }}>
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--ink-100)', letterSpacing: '-0.02em' }}>
            Your <em style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, background: 'linear-gradient(135deg, var(--accent-1), var(--accent-2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>modules</em>
          </h2>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-50)' }}>
            <b style={{ color: 'var(--ink-70)' }}>{modules.length} total</b> · drag slider to update progress
          </span>
        </div>

        {/* Filter tabs + search row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', flex: 1 }}>
            {filterTabs.map(tab => {
              const isActive = activeFilter === tab.key;
              return (
                <button key={tab.key} onClick={() => setActiveFilter(tab.key)} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer', transition: 'all .15s', fontFamily: 'var(--font-sans)',
                  background: isActive ? 'linear-gradient(135deg, var(--accent-1), var(--accent-2))' : 'var(--glass-fill)',
                  border: isActive ? '1px solid transparent' : '1px solid var(--glass-stroke)',
                  color: isActive ? 'white' : 'var(--ink-100)',
                  boxShadow: isActive ? '0 2px 12px oklch(0.72 0.13 285 / 0.35)' : 'none',
                }}>
                  {tab.label}
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 10,
                    background: isActive ? 'var(--hover-tint)' : 'var(--glass-fill)',
                    padding: '1px 6px', borderRadius: 10,
                    color: isActive ? 'white' : 'var(--ink-70)',
                  }}>{tab.count}</span>
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
              style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-50)', pointerEvents: 'none' }}>
              <circle cx="11" cy="11" r="6"/><path d="m20 20-4.3-4.3"/>
            </svg>
            <input
              placeholder="Search modules…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                paddingLeft: 30, paddingRight: 12, paddingTop: 7, paddingBottom: 7,
                borderRadius: 20, fontSize: 12, width: 180,
                background: 'var(--glass-fill)', border: '1px solid var(--glass-stroke)',
                color: 'var(--ink-100)', outline: 'none', fontFamily: 'var(--font-sans)',
                transition: 'border-color .15s, width .2s',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = 'oklch(0.72 0.13 285 / 0.25)'; e.currentTarget.style.width = '220px'; }}
              onBlur={e => { e.currentTarget.style.borderColor = 'var(--glass-stroke)'; e.currentTarget.style.width = '180px'; }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} style={{
                position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-50)',
                display: 'flex', alignItems: 'center', padding: 0,
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Module list ── */}
      {isFiltered ? (
        // Flat filtered list
        filteredModules.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--ink-50)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
            No modules match your filter
          </div>
        ) : (
          <div>
            {filteredModules.map(mod => (
              <FlatModuleCard
                key={mod.id}
                mod={mod}
                onModuleSaved={handleModuleSaved}
                startDate={startDate}
                targetDate={targetDate}
                totalModules={modules.length}
              />
            ))}
          </div>
        )
      ) : (
        // Default: tier accordion groups
        tiers.map(tier => (
          <TierSection
            key={tier}
            tier={tier}
            modules={grouped[tier]}
            onModuleSaved={handleModuleSaved}
            startDate={startDate}
            targetDate={targetDate}
            totalModules={modules.length}
          />
        ))
      )}

      <style>{`
        input[type=range]::-webkit-slider-thumb { opacity: 0; }
        input[type=range]::-moz-range-thumb { opacity: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </Layout>
  );
}

// ── Flat filtered module card ──────────────────────────────────────────────────
function FlatModuleCard({ mod, onModuleSaved, startDate, targetDate, totalModules }: {
  mod: ModuleItem; onModuleSaved: (id: number, pct: number) => void;
  startDate: Date | null; targetDate: Date | null; totalModules: number;
}) {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const rsrcStyle = isLight
    ? { color: '#6366F1', background: 'rgba(99,102,241,0.10)', border: '1px solid rgba(99,102,241,0.28)' }
    : { color: 'oklch(0.76 0.13 285)', background: 'oklch(0.72 0.13 285 / 0.12)', border: '1px solid oklch(0.72 0.13 285 / 0.3)' };
  const rsrcHoverBg  = isLight ? 'rgba(99,102,241,0.18)' : 'oklch(0.72 0.13 285 / 0.22)';
  const rsrcHoverBdr = isLight ? 'rgba(99,102,241,0.44)' : 'oklch(0.72 0.13 285 / 0.25)';
  const tier      = tierPrefix(mod.category);
  const section   = mod.category.replace(/^(Tier\s+\d+|L\d+)\s*[–-]\s*/i, '').trim();
  const TIER_ACCENT: Record<string, string> = {
    'Tier 0': 'var(--accent-2)', 'Tier 1': 'var(--accent-1)',
    'L1': 'oklch(0.80 0.18 330)', 'L2': 'oklch(0.80 0.16 150)',
    'L3': 'oklch(0.78 0.20 285)', 'L4': 'oklch(0.82 0.15 60)',
  };
  const color = TIER_ACCENT[tier] ?? 'var(--accent-1)';

  return (
    <div className={`ants-module-card${mod.progress_state === 'completed' ? ' completed' : ''}`}
      style={{ marginBottom: 16, borderRadius: 14, padding: '20px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
        {/* Left */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase',
              color, background: `${color}18`, border: `1px solid ${color}40`,
              padding: '3px 8px', borderRadius: 5, fontWeight: 700,
            }}>
              {tier} · {section.split(' ').slice(0, 2).join(' ')}
            </span>
          </div>

          <h3 style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 700, color: 'var(--ink-100)', letterSpacing: '-0.01em', lineHeight: 1.3 }}>
            {mod.title}
          </h3>

          <p style={{ fontSize: 12, color: 'var(--ink-70)', margin: '0 0 12px' }}>
            {mod.resource_name}{mod.resource_name ? ' · ' : ''}{mod.estimated_time ?? ''}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <a href={mod.resource_link} target="_blank" rel="noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 500, padding: '6px 13px', borderRadius: 8, textDecoration: 'none', transition: 'background 0.15s, border-color 0.15s', ...rsrcStyle }}
              onMouseEnter={e => { e.currentTarget.style.background = rsrcHoverBg; e.currentTarget.style.borderColor = rsrcHoverBdr; }}
              onMouseLeave={e => { e.currentTarget.style.background = rsrcStyle.background; e.currentTarget.style.borderColor = isLight ? 'rgba(99,102,241,0.28)' : 'oklch(0.72 0.13 285 / 0.3)'; }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              Open resource
            </a>
          </div>

          <TimelineStrip mod={mod} totalModules={totalModules} startDate={startDate} targetDate={targetDate} />
        </div>

        {/* Right: slider */}
        <div style={{ width: 210, flexShrink: 0 }}>
          <ProgressSlider moduleId={mod.id} initial={mod.percentage} onSaved={(pct) => onModuleSaved(mod.id, pct)} />
        </div>
      </div>
    </div>
  );
}
