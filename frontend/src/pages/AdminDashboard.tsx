import { useState, useEffect, useMemo, useRef } from 'react';
import api from '../api';
import { AdminLayout } from '../components/AdminLayout';
import { useTheme } from '../context/ThemeContext';

// ─── Types ────────────────────────────────────────────────────────────────────
interface LearnerRow {
  user_id: number;
  name: string;
  email: string;
  profile_name: string;
  profile_key: string;
  completion_pct: number;
  completed_modules: number;
  in_progress_modules: number;
  total_modules: number;
  target_date: string;
  start_date: string;
  roadmap_state: string;
  risk_flag: 'completed' | 'on_track' | 'at_risk' | 'overdue';
  last_activity: string | null;
}

interface ModuleDetail {
  module_id: number;
  title: string;
  category: string;
  resource_name: string;
  resource_link: string;
  estimated_time: string;
  progress_state: string;
  percentage: number;
  updated_at: string | null;
}

interface EventLog {
  event_id: number;
  module_title: string;
  event_type: string;
  old_state: string;
  new_state: string;
  percentage: number;
  created_at: string;
}

interface NudgeEntry {
  created_at: string;
  details: Record<string, string>;
}

interface LearnerDetail {
  user_id: number;
  name: string;
  email: string;
  profile_name: string;
  completion_pct: number;
  total_modules: number;
  target_date: string | null;
  start_date: string | null;
  risk_flag: string;
  modules: ModuleDetail[];
  event_log: EventLog[];
  nudge_history: NudgeEntry[];
}

// ─── Inline SVG icons ─────────────────────────────────────────────────────────
const Ic = ({ size = 15, sw = 1.6, children, ...rest }: { size?: number; sw?: number; children?: React.ReactNode; [k: string]: unknown }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...(rest as React.SVGProps<SVGSVGElement>)}>
    {children}
  </svg>
);
const IcSearch   = (p: {size?:number}) => <Ic {...p}><circle cx="11" cy="11" r="6"/><path d="m20 20-4.3-4.3"/></Ic>;
const IcClose    = (p: {size?:number}) => <Ic {...p}><path d="M18 6 6 18M6 6l12 12"/></Ic>;
const IcChevronD = (p: {size?:number; open?: boolean}) => (
  <Ic size={p.size ?? 12} style={{ transition:'transform .15s', transform: p.open ? 'rotate(180deg)':'none' } as React.CSSProperties}>
    <path d="m6 9 6 6 6-6"/>
  </Ic>
);
const IcChevronR = (p: {size?:number}) => <Ic {...p}><path d="M9 18l6-6-6-6"/></Ic>;
const IcBolt     = (p: {size?:number}) => <Ic {...p}><path d="M13 3 4 14h7l-1 7 9-11h-7z"/></Ic>;
const IcUsers    = (p: {size?:number}) => <Ic {...p}><circle cx="9" cy="9" r="3"/><circle cx="17" cy="10" r="2.2"/><path d="M3 18a6 6 0 0 1 12 0M14 18a4.5 4.5 0 0 1 7 0"/></Ic>;
const IcAlert    = (p: {size?:number}) => <Ic {...p}><path d="M12 9v4M12 17h.01"/><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></Ic>;
const IcCheck    = (p: {size?:number}) => <Ic {...p}><path d="m5 12 5 5L20 7"/></Ic>;
const IcClock    = (p: {size?:number}) => <Ic {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></Ic>;
const IcLink     = (p: {size?:number}) => <Ic {...p}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></Ic>;

// ─── Custom dark dropdown ─────────────────────────────────────────────────────
interface DropdownOption { value: string; label: string }

function Dropdown({ value, onChange, options, placeholder }: {
  value: string;
  onChange: (v: string) => void;
  options: DropdownOption[];
  placeholder: string;
}) {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const th = {
    glassFill3:   isLight ? 'rgba(255,255,255,0.85)'  : 'rgba(255,255,255,.06)',
    glassStroke2: isLight ? 'rgba(15,23,42,0.10)'     : 'rgba(255,255,255,.12)',
    glassStroke3: isLight ? 'rgba(15,23,42,0.12)'     : 'rgba(255,255,255,.14)',
    hoverBg:      isLight ? 'rgba(99,102,241,0.06)'   : 'rgba(255,255,255,.05)',
    hoverBg2:     isLight ? 'rgba(99,102,241,0.08)'   : 'rgba(255,255,255,.08)',
    dropdownBg:   isLight ? 'rgba(255,255,255,0.95)'  : '#16161e',
  } as const;

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = options.find(o => o.value === value);

  return (
    <div ref={ref} style={{ position: 'relative', minWidth: 150 }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
          padding: '8px 12px', borderRadius: 8, fontSize: 13, cursor: 'pointer',
          background: th.glassFill3, border: `1px solid ${th.glassStroke2}`,
          color: selected ? 'var(--ink-100)' : 'var(--ink-50)',
          fontFamily: 'var(--font-sans)', whiteSpace: 'nowrap',
        }}
      >
        {selected ? selected.label : placeholder}
        <IcChevronD size={12} open={open} />
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, minWidth: '100%',
          background: th.dropdownBg, border: `1px solid ${th.glassStroke3}`,
          borderRadius: 10, padding: '4px', zIndex: 9999,
          boxShadow: '0 8px 32px rgba(0,0,0,.6)',
        }}>
          {[{ value: '', label: placeholder }, ...options].map(opt => (
            <div
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              style={{
                padding: '8px 12px', borderRadius: 7, fontSize: 13, cursor: 'pointer',
                color: opt.value === value ? 'var(--ink-100)' : 'var(--ink-70)',
                background: opt.value === value ? th.hoverBg2 : 'transparent',
                fontWeight: opt.value === value ? 600 : 400,
                transition: 'background .1s',
              }}
              onMouseEnter={e => { if (opt.value !== value) (e.currentTarget as HTMLDivElement).style.background = th.hoverBg; }}
              onMouseLeave={e => { if (opt.value !== value) (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Risk badge ───────────────────────────────────────────────────────────────
const RISK_CONFIG = {
  overdue:   { bg: 'rgba(239,68,68,.15)',   border: 'rgba(239,68,68,.35)',   text: '#f87171', label: 'Overdue'   },
  at_risk:   { bg: 'rgba(234,179,8,.15)',   border: 'rgba(234,179,8,.35)',   text: '#fbbf24', label: 'At Risk'   },
  on_track:  { bg: 'rgba(34,197,94,.12)',   border: 'rgba(34,197,94,.3)',    text: '#4ade80', label: 'On Track'  },
  completed: { bg: 'rgba(99,102,241,.15)',  border: 'rgba(99,102,241,.35)',  text: '#a5b4fc', label: 'Completed' },
};

function RiskBadge({ flag }: { flag: string }) {
  const cfg = RISK_CONFIG[flag as keyof typeof RISK_CONFIG] ?? RISK_CONFIG.on_track;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
      letterSpacing: '.03em', background: cfg.bg, border: `1px solid ${cfg.border}`,
      color: cfg.text, whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.text, flexShrink: 0 }} />
      {cfg.label}
    </span>
  );
}

// ─── Mini progress bar ────────────────────────────────────────────────────────
function MiniBar({ pct, flag }: { pct: number; flag: string }) {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const color = flag === 'overdue' ? '#f87171' : flag === 'at_risk' ? '#fbbf24' : flag === 'completed' ? '#a5b4fc' : 'oklch(0.80 0.16 200)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 120 }}>
      <div style={{ flex: 1, height: 4, background: isLight ? 'rgba(15,23,42,0.07)' : 'rgba(255,255,255,.08)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 99, transition: 'width .3s' }} />
      </div>
      <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--ink-80)', width: 32, textAlign: 'right' }}>{pct}%</span>
    </div>
  );
}

function relTime(ts: string | null): string {
  if (!ts) return '—';
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 2) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(ts).toLocaleDateString();
}

function StateBadge({ state }: { state: string }) {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const glassFill = isLight ? 'rgba(15,23,42,0.05)' : 'rgba(255,255,255,.04)';
  const map: Record<string, [string, string]> = {
    completed:   ['oklch(0.80 0.16 200)', 'rgba(99,102,241,.15)'],
    in_progress: ['#fbbf24', 'rgba(234,179,8,.1)'],
    not_started: ['var(--ink-50)', glassFill],
  };
  const [color, bg] = map[state] ?? map.not_started;
  return (
    <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: bg, color, fontWeight: 600 }}>
      {state.replace(/_/g, ' ')}
    </span>
  );
}

// ─── Drill-down panel ─────────────────────────────────────────────────────────
function DrillDownPanel({ userId, onClose }: { userId: number; onClose: () => void }) {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const th = {
    glassFill:    isLight ? 'rgba(255,255,255,0.72)'  : 'rgba(255,255,255,.04)',
    glassFill2:   isLight ? 'rgba(255,255,255,0.80)'  : 'rgba(255,255,255,.05)',
    glassFill3:   isLight ? 'rgba(255,255,255,0.85)'  : 'rgba(255,255,255,.06)',
    glassStroke:  isLight ? 'rgba(15,23,42,0.08)'     : 'rgba(255,255,255,.09)',
    glassStroke2: isLight ? 'rgba(15,23,42,0.10)'     : 'rgba(255,255,255,.12)',
    panelBg:      isLight ? 'rgba(255,255,255,0.92)'  : '#0e0e14',
    overlayBg:    isLight ? 'rgba(248,250,252,0.92)'  : 'rgba(7,7,11,.6)',
  } as const;

  const [detail, setDetail] = useState<LearnerDetail | null>(null);
  const [tab, setTab] = useState<'modules' | 'events' | 'nudges'>('modules');
  const [nudging, setNudging] = useState(false);
  const [nudgeDone, setNudgeDone] = useState(false);

  useEffect(() => {
    setDetail(null);
    api.get(`/admin/learner/${userId}`).then(r => setDetail(r.data));
    setNudgeDone(false);
    setTab('modules');
  }, [userId]);

  const handleNudge = async () => {
    if (nudging) return;
    setNudging(true);
    try {
      await api.post(`/admin/nudge/${userId}`);
      setNudgeDone(true);
      const r = await api.get(`/admin/learner/${userId}`);
      setDetail(r.data);
    } finally {
      setNudging(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', justifyContent: 'flex-end' }} onClick={onClose}>
      <div style={{ position: 'absolute', inset: 0, background: th.overlayBg, backdropFilter: 'blur(4px)' }} />
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'relative', width: 520, height: '100%',
          background: th.panelBg, borderLeft: `1px solid ${th.glassStroke}`,
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          animation: 'slideInRight .22s ease',
        }}
      >
        {detail ? (
          <>
            <div style={{ padding: '20px 24px 16px', borderBottom: `1px solid ${th.glassStroke2}`, flexShrink: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink-100)', lineHeight: 1.2 }}>{detail.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-70)', marginTop: 2 }}>{detail.email}</div>
                </div>
                <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-60)', padding: 4, borderRadius: 6, display: 'flex', alignItems: 'center' }}>
                  <IcClose size={16} />
                </button>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <RiskBadge flag={detail.risk_flag} />
                <span style={{ fontSize: 12, color: 'var(--ink-60)', background: th.glassFill2, padding: '3px 10px', borderRadius: 20, border: `1px solid ${th.glassStroke}` }}>
                  {detail.profile_name}
                </span>
                <MiniBar pct={detail.completion_pct} flag={detail.risk_flag} />
              </div>
              {detail.target_date && (
                <div style={{ marginTop: 10, fontSize: 12, color: 'var(--ink-50)', display: 'flex', gap: 16 }}>
                  <span>Started: <b style={{ color: 'var(--ink-70)' }}>{detail.start_date}</b></span>
                  <span>Target: <b style={{ color: 'var(--ink-70)' }}>{detail.target_date}</b></span>
                </div>
              )}
              <button
                onClick={handleNudge}
                disabled={nudging}
                style={{
                  marginTop: 14, display: 'flex', alignItems: 'center', gap: 7,
                  padding: '8px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: nudging ? 'not-allowed' : 'pointer',
                  background: nudgeDone ? 'rgba(34,197,94,.12)' : 'rgba(251,191,36,.1)',
                  border: nudgeDone ? '1px solid rgba(34,197,94,.3)' : '1px solid rgba(251,191,36,.3)',
                  color: nudgeDone ? '#4ade80' : '#fbbf24', transition: 'all .2s',
                }}
              >
                {nudgeDone ? <IcCheck size={14} /> : <IcBolt size={14} />}
                {nudging ? 'Sending…' : nudgeDone ? 'Nudge sent!' : 'Nudge learner'}
              </button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 2, padding: '12px 24px 0', borderBottom: `1px solid ${th.glassStroke2}`, flexShrink: 0 }}>
              {(['modules', 'events', 'nudges'] as const).map(t => (
                <button key={t} onClick={() => setTab(t)} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: '8px 14px 10px', fontSize: 13, fontWeight: tab === t ? 600 : 400,
                  color: tab === t ? 'var(--ink-100)' : 'var(--ink-50)',
                  borderBottom: tab === t ? '2px solid oklch(0.80 0.16 200)' : '2px solid transparent',
                  marginBottom: -1, transition: 'color .15s',
                }}>
                  {t === 'modules' ? `Modules (${detail.total_modules})` : t === 'events' ? `Activity (${detail.event_log.length})` : `Nudges (${detail.nudge_history.length})`}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
              {tab === 'modules' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {detail.modules.length === 0
                    ? <div style={{ color: 'var(--ink-50)', fontSize: 13, textAlign: 'center', marginTop: 40 }}>No modules assigned yet</div>
                    : detail.modules.map(m => (
                    <div key={m.module_id} style={{
                      background: th.glassFill, border: `1px solid ${th.glassFill3}`,
                      borderRadius: 10, padding: '12px 14px',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-100)', lineHeight: 1.3, marginBottom: 4 }}>{m.title}</div>
                          <div style={{ fontSize: 11, color: 'var(--ink-50)', marginBottom: 6 }}>{m.category}</div>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <StateBadge state={m.progress_state} />
                            {m.percentage > 0 && <span style={{ fontSize: 11, color: 'var(--ink-50)', fontFamily: 'var(--font-mono)' }}>{m.percentage}%</span>}
                            {m.updated_at && <span style={{ fontSize: 11, color: 'var(--ink-30)' }}>{relTime(m.updated_at)}</span>}
                          </div>
                        </div>
                        {m.resource_link && (
                          <a href={m.resource_link} target="_blank" rel="noreferrer" style={{ color: 'var(--ink-40)', display: 'flex', alignItems: 'center', marginTop: 2 }}>
                            <IcLink size={13} />
                          </a>
                        )}
                      </div>
                      {m.progress_state !== 'not_started' && (
                        <div style={{ marginTop: 8 }}>
                          <MiniBar pct={m.percentage} flag={m.progress_state === 'completed' ? 'completed' : 'on_track'} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {tab === 'events' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {detail.event_log.length === 0
                    ? <div style={{ color: 'var(--ink-50)', fontSize: 13, textAlign: 'center', marginTop: 40 }}>No activity yet</div>
                    : detail.event_log.map(ev => (
                    <div key={ev.event_id} style={{
                      display: 'flex', gap: 12, alignItems: 'flex-start',
                      padding: '10px 12px', background: th.glassFill,
                      border: `1px solid ${th.glassFill3}`, borderRadius: 8,
                    }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                        background: th.glassFill3, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--ink-60)',
                      }}>
                        <IcClock size={12} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-80)', marginBottom: 2 }}>{ev.module_title}</div>
                        <div style={{ fontSize: 11, color: 'var(--ink-50)' }}>
                          <span style={{ color: 'var(--ink-50)' }}>{ev.old_state}</span>
                          {' → '}
                          <span style={{ color: 'oklch(0.80 0.16 200)' }}>{ev.new_state}</span>
                          {ev.percentage > 0 && <span style={{ color: 'var(--ink-50)' }}> · {ev.percentage}%</span>}
                        </div>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--ink-30)', whiteSpace: 'nowrap', marginTop: 2 }}>{relTime(ev.created_at)}</div>
                    </div>
                  ))}
                </div>
              )}

              {tab === 'nudges' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {detail.nudge_history.length === 0
                    ? <div style={{ color: 'var(--ink-50)', fontSize: 13, textAlign: 'center', marginTop: 40 }}>No nudges sent yet</div>
                    : detail.nudge_history.map((n, i) => (
                    <div key={i} style={{
                      padding: '10px 14px', background: 'rgba(251,191,36,.05)',
                      border: '1px solid rgba(251,191,36,.2)', borderRadius: 8,
                    }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#fbbf24', marginBottom: 4, display: 'flex', gap: 6, alignItems: 'center' }}>
                        <IcBolt size={12} /> Nudge sent
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--ink-50)' }}>By {n.details?.nudged_by ?? '—'} · {relTime(n.created_at)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
            <div style={{ color: 'var(--ink-50)', fontSize: 13 }}>Loading…</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color, icon }: { label: string; value: number; sub?: string; color: string; icon: React.ReactNode }) {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const glassStroke = isLight ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,.09)';
  return (
    <div style={{
      background: 'var(--bg-2)', border: `1px solid ${glassStroke}`,
      borderRadius: 14, padding: '18px 20px', flex: 1, minWidth: 140,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: 'var(--ink-50)', fontWeight: 500 }}>{label}</div>
        <div style={{ color, opacity: .7 }}>{icon}</div>
      </div>
      <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--ink-100)', fontFamily: 'var(--font-serif)', lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--ink-50)', marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [learners, setLearners] = useState<LearnerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [nudgingId, setNudgingId] = useState<number | null>(null);
  const [nudgedIds, setNudgedIds] = useState<Set<number>>(new Set());

  // Filters
  const [search, setSearch] = useState('');
  const [profileFilter, setProfileFilter] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(r => setLearners(r.data))
      .finally(() => setLoading(false));
  }, []);

  const profileOptions = useMemo(() =>
    [...new Set(learners.map(l => l.profile_name).filter(p => p && p !== 'No profile'))]
      .map(p => ({ value: p, label: p })),
    [learners]
  );

  const riskOptions: { value: string; label: string }[] = [
    { value: 'overdue',   label: '🔴 Overdue'   },
    { value: 'at_risk',   label: '🟡 At Risk'   },
    { value: 'on_track',  label: '🟢 On Track'  },
    { value: 'completed', label: '✦ Completed'  },
  ];

  const filtered = useMemo(() => learners.filter(l => {
    const q = search.toLowerCase();
    if (q && !l.name.toLowerCase().includes(q) && !l.email.toLowerCase().includes(q)) return false;
    if (profileFilter && l.profile_name !== profileFilter) return false;
    if (riskFilter && l.risk_flag !== riskFilter) return false;
    return true;
  }), [learners, search, profileFilter, riskFilter]);

  // Reset page when filters change
  useEffect(() => setCurrentPage(1), [search, profileFilter, riskFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated  = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const stats = useMemo(() => ({
    total:     learners.length,
    overdue:   learners.filter(l => l.risk_flag === 'overdue').length,
    at_risk:   learners.filter(l => l.risk_flag === 'at_risk').length,
    completed: learners.filter(l => l.risk_flag === 'completed').length,
  }), [learners]);

  const handleNudge = async (e: React.MouseEvent, userId: number) => {
    e.stopPropagation();
    if (nudgingId) return;
    setNudgingId(userId);
    try {
      await api.post(`/admin/nudge/${userId}`);
      setNudgedIds(prev => new Set(prev).add(userId));
    } finally {
      setNudgingId(null);
    }
  };

  const hasFilters = search || profileFilter || riskFilter;

  const { theme } = useTheme();
  const isLight = theme === 'light';

  const th = {
    glassFill:    isLight ? 'rgba(255,255,255,0.72)'     : 'rgba(255,255,255,.04)',
    glassFill2:   isLight ? 'rgba(255,255,255,0.80)'     : 'rgba(255,255,255,.05)',
    glassFill3:   isLight ? 'rgba(255,255,255,0.85)'     : 'rgba(255,255,255,.06)',
    glassStroke:  isLight ? 'rgba(15,23,42,0.08)'        : 'rgba(255,255,255,.09)',
    glassStroke2: isLight ? 'rgba(15,23,42,0.10)'        : 'rgba(255,255,255,.12)',
    glassStroke3: isLight ? 'rgba(15,23,42,0.12)'        : 'rgba(255,255,255,.14)',
    hoverBg:      isLight ? 'rgba(99,102,241,0.06)'      : 'rgba(255,255,255,.05)',
    hoverBg2:     isLight ? 'rgba(99,102,241,0.08)'      : 'rgba(255,255,255,.08)',
    rowHover:     isLight ? 'rgba(99,102,241,0.04)'      : 'rgba(255,255,255,.03)',
    progressTrack:isLight ? 'rgba(15,23,42,0.07)'        : 'rgba(255,255,255,.08)',
    dropdownBg:   isLight ? 'rgba(255,255,255,0.95)'     : '#16161e',
    panelBg:      isLight ? 'rgba(255,255,255,0.92)'     : '#0e0e14',
    overlayBg:    isLight ? 'rgba(248,250,252,0.92)'     : 'rgba(7,7,11,.6)',
  } as const;

  const inputStyle: React.CSSProperties = {
    background: th.glassFill3, border: `1px solid ${th.glassStroke2}`,
    borderRadius: 8, padding: '8px 12px', color: 'var(--ink-100)', fontSize: 13,
    outline: 'none', fontFamily: 'var(--font-sans)', boxSizing: 'border-box' as const,
  };

  return (
    <AdminLayout>
      {/* Hero */}
      <div className="ants-hero" style={{ paddingBottom: 16 }}>
        <div className="ants-hero-top">
          <div>
            <div className="ants-welcome">Platform Management</div>
            <div className="ants-hello" style={{ fontSize: 22 }}>Admin Dashboard</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="ants-step-pill">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><circle cx="5" cy="5" r="3" fill="currentColor"/></svg>
              {learners.length} learners
            </div>
            <button
              onClick={() => {
                const headers = ['Name','Email','Profile','Completion %','Completed Modules','Total Modules','Status','Last Activity','Start Date','Target Date'];
                const rows = learners.map(l => [
                  l.name, l.email, l.profile_name, l.completion_pct,
                  l.completed_modules, l.total_modules, l.risk_flag,
                  l.last_activity ?? '', l.start_date ?? '', l.target_date ?? '',
                ]);
                const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
                const blob = new Blob([csv], { type: 'text/csv' });
                const url  = URL.createObjectURL(blob);
                const a    = document.createElement('a');
                a.href = url; a.download = 'ants_learners.csv'; a.click();
                URL.revokeObjectURL(url);
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 14px', borderRadius: 10, fontSize: 12, fontWeight: 600,
                background: th.glassFill2, border: `1px solid ${th.glassStroke2}`,
                color: 'var(--ink-70)', cursor: 'pointer', fontFamily: 'var(--font-sans)',
                transition: 'all .18s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = th.hoverBg2; (e.currentTarget as HTMLButtonElement).style.color = 'var(--ink-100)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = th.glassFill2; (e.currentTarget as HTMLButtonElement).style.color = 'var(--ink-70)'; }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Export CSV
            </button>
          </div>
        </div>
        <p className="ants-hero-sub" style={{ marginBottom: 0 }}>
          Monitor progress, spot risks early, and keep your team on track to December 2026.
        </p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        <StatCard label="Total Learners" value={stats.total}     sub="active on platform"    color="oklch(0.80 0.16 200)" icon={<IcUsers size={16}/>} />
        <StatCard label="Overdue"        value={stats.overdue}   sub="past target date"      color="#f87171"              icon={<IcAlert size={16}/>} />
        <StatCard label="At Risk"        value={stats.at_risk}   sub=">20% behind schedule"  color="#fbbf24"              icon={<IcAlert size={16}/>} />
        <StatCard label="Completed"      value={stats.completed} sub="finished all modules"  color="#a5b4fc"              icon={<IcCheck size={16}/>} />
      </div>

      {/* Filters */}
      <div style={{
        background: th.glassFill, border: `1px solid ${th.glassStroke}`,
        borderRadius: 14, padding: '12px 16px', marginBottom: 18,
        display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center',
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 180 }}>
          <div style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-50)', pointerEvents: 'none' }}>
            <IcSearch size={13} />
          </div>
          <input
            placeholder="Search name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ ...inputStyle, paddingLeft: 30, width: '100%' }}
          />
        </div>

        {/* Profile dropdown */}
        <Dropdown
          value={profileFilter}
          onChange={setProfileFilter}
          options={profileOptions}
          placeholder="All profiles"
        />

        {/* Risk dropdown */}
        <Dropdown
          value={riskFilter}
          onChange={setRiskFilter}
          options={riskOptions}
          placeholder="All statuses"
        />

        {/* Clear filters */}
        {hasFilters && (
          <button
            onClick={() => { setSearch(''); setProfileFilter(''); setRiskFilter(''); }}
            style={{
              background: th.glassFill2, border: `1px solid ${th.glassStroke2}`,
              borderRadius: 8, padding: '8px 12px', color: 'var(--ink-60)', fontSize: 13, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-sans)',
            }}
          >
            <IcClose size={12} /> Clear
          </button>
        )}

        <div style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--ink-50)', alignSelf: 'center', whiteSpace: 'nowrap' }}>
          {filtered.length} of {learners.length}
        </div>
      </div>

      {/* Table */}
      <div style={{
        background: th.rowHover, border: `1px solid ${th.glassStroke}`,
        borderRadius: 14, overflow: 'hidden',
      }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--ink-50)', fontSize: 13 }}>Loading learners…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--ink-50)', fontSize: 13 }}>
            {learners.length === 0 ? 'No learners on the platform yet' : 'No learners match your filters'}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${th.progressTrack}` }}>
                {['Learner', 'Profile', 'Progress', 'Last Active', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{
                    padding: '11px 16px', textAlign: 'left', fontSize: 11,
                    fontWeight: 600, color: 'var(--ink-50)', letterSpacing: '.06em',
                    textTransform: 'uppercase', whiteSpace: 'nowrap',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map((row, i) => {
                const isNudged  = nudgedIds.has(row.user_id);
                const isNudging = nudgingId === row.user_id;
                return (
                  <tr
                    key={row.user_id}
                    onClick={() => setSelectedId(row.user_id)}
                    style={{
                      borderBottom: i < paginated.length - 1 ? `1px solid ${th.glassFill3}` : 'none',
                      cursor: 'pointer', transition: 'background .12s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = th.rowHover)}
                    onMouseLeave={e => (e.currentTarget.style.background = '')}
                  >
                    {/* Learner */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                          background: 'linear-gradient(135deg, oklch(0.72 0.13 285), oklch(0.80 0.16 200))',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 13, fontWeight: 700, color: 'white',
                        }}>
                          {row.name?.charAt(0)?.toUpperCase() ?? '?'}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-100)' }}>{row.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--ink-50)' }}>{row.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Profile */}
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontSize: 12, color: row.profile_name === 'No profile' ? 'var(--ink-30)' : 'var(--ink-60)', fontStyle: row.profile_name === 'No profile' ? 'italic' : 'normal' }}>
                        {row.profile_name}
                      </span>
                    </td>

                    {/* Progress */}
                    <td style={{ padding: '14px 16px' }}>
                      <MiniBar pct={row.completion_pct} flag={row.risk_flag} />
                      <div style={{ fontSize: 11, color: 'var(--ink-50)', fontFamily: 'var(--font-mono)', marginTop: 4 }}>
                        {row.total_modules > 0 ? `${row.completed_modules}/${row.total_modules} modules` : 'No modules'}
                      </div>
                    </td>

                    {/* Last Active */}
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontSize: 12, color: 'var(--ink-50)' }}>{relTime(row.last_activity)}</span>
                    </td>

                    {/* Status */}
                    <td style={{ padding: '14px 16px' }}>
                      <RiskBadge flag={row.risk_flag} />
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '14px 16px' }} onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          onClick={e => handleNudge(e, row.user_id)}
                          disabled={isNudging || isNudged}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 5,
                            padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                            cursor: isNudging || isNudged ? 'default' : 'pointer',
                            background: isNudged ? 'rgba(34,197,94,.1)' : 'rgba(251,191,36,.08)',
                            border: isNudged ? '1px solid rgba(34,197,94,.25)' : '1px solid rgba(251,191,36,.25)',
                            color: isNudged ? '#4ade80' : '#fbbf24',
                            transition: 'all .2s', whiteSpace: 'nowrap', fontFamily: 'var(--font-sans)',
                          }}
                        >
                          {isNudged ? <IcCheck size={11} /> : <IcBolt size={11} />}
                          {isNudging ? '…' : isNudged ? 'Sent' : 'Nudge'}
                        </button>

                        <button
                          onClick={e => { e.stopPropagation(); setSelectedId(row.user_id); }}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 5,
                            padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                            cursor: 'pointer', background: th.glassFill2,
                            border: `1px solid ${th.glassStroke2}`, color: 'var(--ink-60)',
                            transition: 'all .2s', whiteSpace: 'nowrap', fontFamily: 'var(--font-sans)',
                          }}
                        >
                          <IcChevronR size={11} /> View
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 8, marginTop: 20, padding: '14px 0',
        }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              style={{
                width: 36, height: 36, borderRadius: '50%',
                border: page === currentPage
                  ? '2px solid oklch(0.78 0.20 150)'
                  : `1px solid ${th.glassStroke2}`,
                background: page === currentPage
                  ? 'rgba(34,197,94,.08)'
                  : th.glassFill,
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                color: page === currentPage ? 'oklch(0.78 0.20 150)' : 'var(--ink-50)',
                fontSize: 13, fontWeight: page === currentPage ? 700 : 400,
                cursor: 'pointer', transition: 'all .18s',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-mono)',
                boxShadow: page === currentPage ? '0 0 12px oklch(0.78 0.20 150 / 0.35)' : 'none',
              }}
              onMouseEnter={e => { if (page !== currentPage) { (e.currentTarget as HTMLButtonElement).style.background = th.hoverBg2; (e.currentTarget as HTMLButtonElement).style.color = 'var(--ink-80)'; } }}
              onMouseLeave={e => { if (page !== currentPage) { (e.currentTarget as HTMLButtonElement).style.background = th.glassFill; (e.currentTarget as HTMLButtonElement).style.color = 'var(--ink-50)'; } }}
            >
              {page}
            </button>
          ))}
        </div>
      )}

      {selectedId !== null && (
        <DrillDownPanel userId={selectedId} onClose={() => setSelectedId(null)} />
      )}

      <style>{`
        @keyframes slideInRight { from { transform: translateX(40px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      `}</style>
    </AdminLayout>
  );
}
