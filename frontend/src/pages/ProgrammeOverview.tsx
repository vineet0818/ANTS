import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useAuth } from '../context/AuthContext';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function daysUntil(target: string): number {
  const diff = new Date(target).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}
function todayStr(): string {
  return new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }).toUpperCase();
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const PROFILES = [
  {
    key: 'Junior QA / Manual Tester', level: 'L1 · Foundation', modules: 44,
    duration: '8–12 weeks', tiers: ['Tier 0', 'Tier 1', 'L1'],
    c1: 'oklch(0.82 0.16 200)', c2: 'oklch(0.78 0.18 285)',
    desc: 'Write & run Playwright E2E tests, use AI to generate test cases, work within Reflect for no-code scenarios.',
  },
  {
    key: 'Mid-level Automation Engineer', level: 'L2 · Build', modules: 55,
    duration: '10–14 weeks', tiers: ['Tier 0', 'Tier 1', 'L1', 'L2'],
    c1: 'oklch(0.80 0.16 150)', c2: 'oklch(0.82 0.16 200)',
    desc: 'Build full Playwright framework with API layer, AI-assisted code generation, CI/CD integrated suite.',
  },
  {
    key: 'Senior SDET', level: 'L3 · Architect', modules: 58,
    duration: '12–16 weeks', tiers: ['Tier 0', 'Tier 1', 'L1', 'L2', 'L3'],
    c1: 'oklch(0.78 0.18 285)', c2: 'oklch(0.80 0.18 330)',
    desc: 'Design AI-augmented Playwright frameworks with Planner/Generator/Healer agents and agentic MCP workflows.',
  },
  {
    key: 'Test Lead / Architect', level: 'L4 · Strategy', modules: 64,
    duration: '14–20 weeks', tiers: ['Tier 0', 'Tier 1', 'L1', 'L2', 'L3', 'L4'],
    c1: 'oklch(0.80 0.18 330)', c2: 'oklch(0.82 0.15 60)',
    desc: 'Define org-wide AI QA strategy, architect agentic pipelines, position SmartBear + Playwright stack for clients.',
  },
];

const TIERS = [
  { id: 'Tier 0', name: 'AI Foundations',           color: 'var(--accent-1)',          weeks: 'Weeks 1–3',   courses: 16, desc: 'AI fluency, prompt engineering, LLM fundamentals and AI tooling orientation for QE engineers.' },
  { id: 'Tier 1', name: 'Playwright + AI Baseline',  color: 'var(--accent-2)',          weeks: 'Weeks 4–8',   courses: 16, desc: 'Core Playwright automation with AI-assisted test generation, Reflect no-code testing, and CI basics.' },
  { id: 'L1–L4', name: 'Role Specialisation',        color: 'oklch(0.80 0.18 330)',     weeks: 'Weeks 9–20',  courses: 78, desc: 'Deep-dive tracks tuned per role — performance, security, chaos engineering, agentic frameworks, org strategy.' },
];

const SPRINT_PHASES = [
  { label: 'Jun · Kickoff',           period: 'June 2026',        detail: 'Onboarding, profile selection, Tier 0 AI foundations begin.' },
  { label: 'Jul–Aug · Foundations',   period: 'July–August 2026', detail: 'Tier 1 Playwright baseline + AI tooling for all profiles.' },
  { label: 'Sep–Nov · Specialisation',period: 'Sept–Nov 2026',    detail: 'Role-specific L1–L4 modules: performance, security, agents.' },
  { label: 'Dec · 100% ANTS',         period: 'December 2026',    detail: 'Final projects, certifications, and ANTS designation.' },
];

// ─── Shared card helpers ──────────────────────────────────────────────────────
const card = (children: React.ReactNode, style?: React.CSSProperties) => (
  <div style={{
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 18, padding: 24, backdropFilter: 'blur(12px)', ...style,
  }}>{children}</div>
);
const mono = (text: string, color = 'var(--ink-40)') => (
  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color }}>{text}</span>
);

// ─── The actual page content (shared between both layouts) ────────────────────
function OverviewContent({ daysToKickoff, daysToDec }: { daysToKickoff: number; daysToDec: number }) {
  return (
    <>
      {/* Leadership Snapshot Hero */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
        border: '1px solid rgba(255,255,255,0.09)', borderRadius: 22, padding: '36px 40px',
        marginBottom: 24, position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, oklch(0.78 0.18 285 / 0.2), transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent-2)', boxShadow: '0 0 8px var(--accent-2)', display: 'inline-block' }} />
            {mono('Leadership Snapshot', 'var(--accent-2)')}
          </div>
          <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--ink-40)', display: 'inline-block' }} />
          {mono(todayStr())}
          <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--ink-40)', display: 'inline-block' }} />
          {mono('Pre-Launch')}
        </div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(28px, 4vw, 46px)', fontWeight: 400, color: 'var(--ink-100)', margin: '0 0 16px', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
          ANTS programme <em style={{ background: 'linear-gradient(135deg, var(--accent-1), var(--accent-2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>at a glance.</em>
        </h1>
        <p style={{ fontSize: 15, color: 'var(--ink-60)', lineHeight: 1.65, maxWidth: 680, margin: 0 }}>
          A 6-month, role-tuned upskilling sprint to convert <b style={{ color: 'var(--ink-80)' }}>394 QE engineers</b> into AI-Native Testing Specialists between <b style={{ color: 'var(--ink-80)' }}>June 1</b> and <b style={{ color: 'var(--ink-80)' }}>December 31, 2026</b> — at zero curriculum cost.
        </p>
      </div>

      {/* Key Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14, marginBottom: 24 }}>
        {[
          { n: '394',                  unit: '',        label: 'Engineers in cohort',  sub: '100% of the QE practice', color: 'var(--accent-2)' },
          { n: String(daysToKickoff),  unit: '',        label: 'Days to kickoff',       sub: 'June 1, 2026 launch',     color: 'oklch(0.80 0.18 330)' },
          { n: '6',                    unit: ' months', label: 'Programme window',      sub: 'Jun → Dec 2026',          color: 'var(--accent-1)' },
          { n: String(daysToDec),      unit: '',        label: 'Days to Dec 31, 2026',  sub: 'Timeline locked',         color: 'oklch(0.78 0.20 150)' },
          { n: '110',                  unit: '',        label: 'Total modules',          sub: 'Across all profiles',     color: 'var(--ink-80)' },
          { n: '$0',                   unit: '',        label: 'Curriculum cost',        sub: '100% free resources',     color: 'oklch(0.82 0.15 60)' },
        ].map(s => card(
          <>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-40)', marginBottom: 12 }}>{s.label}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
              <span style={{ fontSize: 34, fontWeight: 800, color: s.color, letterSpacing: '-0.04em', lineHeight: 1 }}>{s.n}</span>
              {s.unit && <span style={{ fontSize: 14, color: 'var(--ink-60)' }}>{s.unit}</span>}
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink-60)' }}>{s.sub}</div>
          </>,
          { key: s.label } as React.CSSProperties
        ))}
      </div>

      {/* 6-Month Sprint Matrix */}
      <div style={{ marginBottom: 24 }}>
        {card(<>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
            <div>
              {mono('The 6-Month Sprint')}
              <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: 18, fontWeight: 700, color: 'var(--ink-100)', margin: '8px 0 0', letterSpacing: '-0.01em' }}>Each level’s journey, side by side.</h2>
            </div>
          </div>
          <p style={{ fontSize: 12, color: 'var(--ink-50)', marginBottom: 20, lineHeight: 1.55 }}>
            All 394 engineers start together on June 1. Tier 0 + Tier 1 are universal; Tier 2 forks by level. Certifications graduate in staggered waves so every engineer finishes a Specialist by Dec 31.
          </p>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, minWidth: 700 }}>
              <thead>
                {/* Phase row */}
                <tr>
                  <th style={{ width: 110, padding: '0 12px 0 0', verticalAlign: 'bottom', paddingBottom: 8 }} />
                  {[
                    { label: 'PHASE 1 · JUN–JUL', color: '#2dd4bf', title: 'Foundations for all 394', sub: 'Tier 0 (AI) + Tier 1 (Playwright + AI) — universal' },
                    { label: 'PHASE 2 · AUG–SEP', color: '#818cf8', title: 'First wave certifies',   sub: 'L1 → Mid Automation Engineer' },
                    { label: 'PHASE 3 · OCT–NOV', color: '#a78bfa', title: 'Mid wave certifies',     sub: 'L2 → Senior SDET · L3 → Test Lead' },
                    { label: 'PHASE 4 · DEC',         color: '#34d399', title: '100% Specialist',         sub: 'L4 → Principal AI Quality Architect' },
                  ].map((ph, i) => (
                    <th key={i} style={{ padding: '0 8px 14px', textAlign: 'left', verticalAlign: 'bottom', minWidth: 165 }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: ph.color, marginBottom: 5 }}>{ph.label}</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink-90)', marginBottom: 4 }}>{ph.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--ink-50)', lineHeight: 1.4 }}>{ph.sub}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    level: 'L1', sub: 'Junior → Mid',
                    cells: [
                      { type: 'universal',  title: 'Tier 0 + Tier 1',    desc: '77 hrs · all 394 together' },
                      { type: 'cert',       title: 'Mid Automation',      desc: 'Tier 2 (23 hrs) → certified', star: true },
                      { type: 'neutral',    title: 'In production',       desc: 'Applying AI-driven testing' },
                      { type: 'done',       title: 'Specialist · Mid',     desc: '100 hrs complete' },
                    ],
                  },
                  {
                    level: 'L2', sub: 'Mid → Senior',
                    cells: [
                      { type: 'universal',  title: 'Tier 0 + Tier 1',      desc: '77 hrs' },
                      { type: 'role',       title: 'Tier 2 begins',         desc: 'perf · chaos · contracts · 25 of 45 hrs' },
                      { type: 'cert',       title: 'Senior SDET',           desc: 'Tier 2 complete · certified', star: true },
                      { type: 'done',       title: 'Specialist · Senior',    desc: '122 hrs complete' },
                    ],
                  },
                  {
                    level: 'L3', sub: 'Senior → Lead',
                    cells: [
                      { type: 'universal',  title: 'Tier 0 + Tier 1',        desc: '77 hrs' },
                      { type: 'role',       title: 'Tier 2 — agents · SRE', desc: 'Playwright Agents · k6 · 45 of 90 hrs' },
                      { type: 'cert',       title: 'Test Lead / Architect',   desc: 'Tier 2 complete · certified', star: true },
                      { type: 'done',       title: 'Specialist · Lead',       desc: '167 hrs complete' },
                    ],
                  },
                  {
                    level: 'L4', sub: 'Lead → Principal',
                    cells: [
                      { type: 'universal',  title: 'Tier 0 + Tier 1',         desc: '77 hrs' },
                      { type: 'role',       title: 'Tier 2 — governance',      desc: 'DORA · OTel · SRE org · 40 of 85 hrs' },
                      { type: 'cert',       title: 'Tier 2 — multi-agent COE', desc: '12-Factor Agents · LangGraph · 45 of 85 hrs', star: true },
                      { type: 'done',       title: 'Principal · 100% ANTS',    desc: '162 hrs · certified' },
                    ],
                  },
                ].map((row, ri) => {
                  const cellStyles: Record<string, React.CSSProperties> = {
                    universal: { background: 'rgba(45,212,191,.08)',  border: '1px solid rgba(45,212,191,.22)',  borderRadius: 10 },
                    role:      { background: 'rgba(99,102,241,.10)',  border: '1px solid rgba(99,102,241,.25)',  borderRadius: 10, borderStyle: 'dashed' },
                    cert:      { background: 'rgba(251,146,60,.10)',  border: '1px solid rgba(251,146,60,.28)',  borderRadius: 10 },
                    neutral:   { background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.09)', borderRadius: 10, borderStyle: 'dashed' },
                    done:      { background: 'rgba(52,211,153,.08)',  border: '1px solid rgba(52,211,153,.22)',  borderRadius: 10 },
                  };
                  const titleColors: Record<string, string> = {
                    universal: '#2dd4bf', role: '#818cf8', cert: '#fb923c', neutral: 'var(--ink-70)', done: '#34d399',
                  };
                  return (
                    <tr key={ri}>
                      <td style={{ padding: '8px 12px 8px 0', verticalAlign: 'top' }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 700, color: 'var(--ink-100)' }}>{row.level}</div>
                        <div style={{ fontSize: 12, color: 'var(--ink-40)', marginTop: 3 }}>{row.sub}</div>
                      </td>
                      {row.cells.map((cell, ci) => (
                        <td key={ci} style={{ padding: '0 6px 10px', verticalAlign: 'top' }}>
                          <div style={cellStyles[cell.type]}>
                            <div style={{ padding: '10px 12px' }}>
                              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 4, marginBottom: 4 }}>
                                <div style={{ fontSize: 13, fontWeight: 700, color: titleColors[cell.type], lineHeight: 1.3 }}>{cell.title}</div>
                                {cell.type === 'cert' && (
                                  <span style={{ fontSize: 13, color: '#fb923c', flexShrink: 0, marginTop: -1 }}>&#9733;</span>
                                )}
                                {cell.type === 'done' && (
                                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="9" opacity="0.4"/><path d="m9 12 2 2 4-4"/></svg>
                                )}
                              </div>
                              <div style={{ fontSize: 12, color: 'var(--ink-50)', lineHeight: 1.5 }}>{cell.desc}</div>
                            </div>
                          </div>
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,.07)' }}>
            {[
              { color: '#2dd4bf', label: 'Universal foundations (Tier 0 + Tier 1)' },
              { color: '#818cf8', borderDash: true, label: 'Role-specific Tier 2 in flight' },
              { color: '#fb923c', label: '★ Certification milestone — new title earned' },
              { color: '#34d399', label: 'AI-Native Testing Specialist achieved' },
            ].map((leg, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <div style={{
                  width: 12, height: 12, borderRadius: 3, flexShrink: 0,
                  background: `${leg.color}22`,
                  border: `${leg.borderDash ? '1.5px dashed' : '1.5px solid'} ${leg.color}88`,
                }} />
                <span style={{ fontSize: 12, color: 'var(--ink-50)' }}>{leg.label}</span>
              </div>
            ))}
          </div>
        </>)}
      </div>

      {/* Curriculum Tiers */}
      <div style={{ marginBottom: 24 }}>
        {card(<>
          <div style={{ marginBottom: 20 }}>
            {mono('Curriculum Architecture')}
            <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: 18, fontWeight: 700, color: 'var(--ink-100)', margin: '8px 0 0', letterSpacing: '-0.01em' }}>3-tier learning structure</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
            {TIERS.map(tier => (
              <div key={tier.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 20, borderLeft: `3px solid ${tier.color}` }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: tier.color, fontWeight: 700 }}>{tier.id}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-40)', background: 'rgba(255,255,255,0.05)', padding: '2px 7px', borderRadius: 4, border: '1px solid rgba(255,255,255,0.08)' }}>{tier.courses} courses</span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-100)', marginBottom: 6, letterSpacing: '-0.01em' }}>{tier.name}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', color: 'var(--ink-40)', marginBottom: 10, textTransform: 'uppercase' }}>{tier.weeks}</div>
                <div style={{ fontSize: 12.5, color: 'var(--ink-60)', lineHeight: 1.55 }}>{tier.desc}</div>
              </div>
            ))}
          </div>
        </>)}
      </div>

      {/* Role Profiles */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ marginBottom: 16 }}>
          {mono('Learning Profiles')}
          <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: 18, fontWeight: 700, color: 'var(--ink-100)', margin: '8px 0 0', letterSpacing: '-0.01em' }}>Pick your path — tuned from day one</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
          {PROFILES.map(profile => (
            <div key={profile.key} style={{
              background: 'rgba(255,255,255,0.04)', border: `1px solid ${profile.c1}33`,
              borderRadius: 18, padding: 22, position: 'relative', overflow: 'hidden', transition: 'border-color 0.2s, transform 0.18s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = profile.c1 + '80'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = profile.c1 + '33'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{ position: 'absolute', top: -40, right: -40, width: 120, height: 120, borderRadius: '50%', background: `radial-gradient(circle, ${profile.c1}25, transparent 70%)`, pointerEvents: 'none' }} />
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: profile.c1, fontWeight: 700 }}>{profile.level}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-40)', background: 'rgba(255,255,255,0.05)', padding: '2px 7px', borderRadius: 4, border: '1px solid rgba(255,255,255,0.08)' }}>{profile.modules} modules</span>
              </div>
              <h3 style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--ink-100)', margin: '0 0 8px', letterSpacing: '-0.01em', lineHeight: 1.3 }}>{profile.key}</h3>
              <p style={{ fontSize: 12.5, color: 'var(--ink-60)', lineHeight: 1.55, margin: '0 0 16px' }}>{profile.desc}</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                  {profile.tiers.map(t => (
                    <span key={t} style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-60)', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: 4 }}>{t}</span>
                  ))}
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-40)' }}>{profile.duration}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Banner */}
      <div style={{
        background: 'linear-gradient(135deg, oklch(0.78 0.18 285 / 0.15), oklch(0.82 0.16 200 / 0.10))',
        border: '1px solid oklch(0.78 0.18 285 / 0.25)',
        borderRadius: 18, padding: '28px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20,
      }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent-1)', marginBottom: 8 }}>Ready to begin?</div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, fontWeight: 400, color: 'var(--ink-100)', margin: 0, letterSpacing: '-0.02em' }}>
            Select your profile and start your roadmap today.
          </h2>
        </div>
        <a href="/register" style={{
          display: 'inline-flex', alignItems: 'center', gap: 9,
          fontSize: 14, fontWeight: 600, color: 'white',
          background: 'linear-gradient(135deg, var(--accent-1), var(--accent-2))',
          padding: '12px 24px', borderRadius: 12, textDecoration: 'none',
          boxShadow: '0 4px 20px oklch(0.78 0.18 285 / 0.4)',
          transition: 'opacity 0.15s, transform 0.15s', whiteSpace: 'nowrap',
        }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          Get started →
        </a>
      </div>
    </>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function ProgrammeOverview() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [daysToKickoff, setDaysToKickoff] = useState(0);
  const [daysToDec, setDaysToDec]         = useState(0);

  useEffect(() => {
    setDaysToKickoff(daysUntil('2026-06-01'));
    setDaysToDec(daysUntil('2026-12-31'));
  }, []);

  // ── Authenticated: show inside app Layout (sidebar + topbar) ──────────────
  if (user) {
    return (
      <Layout>
        <OverviewContent daysToKickoff={daysToKickoff} daysToDec={daysToDec} />
      </Layout>
    );
  }

  // ── Public: standalone page — no sidebar, no user card, no sign out ────────
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-0, #07070b)', color: 'var(--ink-100)', position: 'relative', overflow: 'hidden' }}>
      {/* Aurora blobs */}
      <div className="ants-aurora" style={{ position: 'fixed' }}>
        <div className="blob b1" /><div className="blob b2" /><div className="blob b3" /><div className="grain" />
      </div>

      {/* Top nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 40px', height: 60,
        background: 'rgba(7,7,11,0.7)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: 'linear-gradient(135deg, oklch(0.78 0.18 285), oklch(0.80 0.16 200))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 800, color: 'white', letterSpacing: '-0.02em',
          }}>AT</div>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink-90)', letterSpacing: '-0.01em' }}>ANTS Trail</span>
        </div>

        {/* Nav actions */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'none', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 8, padding: '7px 16px', color: 'var(--ink-70)', fontSize: 13,
              cursor: 'pointer', fontFamily: 'var(--font-sans)', transition: 'color .15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--ink-100)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--ink-70)')}
          >
            ← Back to home
          </button>
          <button
            onClick={() => navigate('/login')}
            style={{
              background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 8, padding: '7px 16px', color: 'var(--ink-90)', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'var(--font-sans)', transition: 'background .15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
          >
            Sign in
          </button>
        </div>
      </nav>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto', padding: '40px 40px 80px' }}>
        <OverviewContent daysToKickoff={daysToKickoff} daysToDec={daysToDec} />
      </div>
    </div>
  );
}
