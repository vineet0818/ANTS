# UI/UX Readability Overhaul — Design Spec
**Date:** 2026-06-01
**Branch:** ui-enhancement
**Scope:** All pages — desktop only
**Constraint:** Preserve dark aurora glass-morphism aesthetic
**Approach:** Readability + Hierarchy Overhaul (Option 2)

---

## 1. Typography System

### Headline Font Swap: Instrument Serif → Syne

Replace `Instrument Serif` with **Syne** (Google Fonts, free) across all headline usage.

**Rationale:** Instrument Serif reads as editorial/magazine and lacks authority on dark backgrounds. Syne is geometric, high-contrast, and wide — reads instantly at large sizes on dark surfaces. Used widely in 2025–2026 enterprise SaaS products.

**index.html change:**
```html
<!-- Remove -->
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif..." />

<!-- Add -->
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700&display=swap" />
```

**CSS variable change:**
```css
--font-serif: 'Syne', ui-sans-serif, system-ui;
```

### Type Scale

| Role | Font | Size | Weight | Letter-spacing | Line-height |
|---|---|---|---|---|---|
| Page title (h1) | Syne | 28px | 700 | -0.02em | 1.2 |
| Section heading (h2) | Syne | 20px | 600 | -0.01em | 1.3 |
| Card title (h3) | Geist | 15px | 600 | -0.01em | 1.4 |
| Body | Geist | 14px | 400 | 0 | 1.65 |
| Secondary text | Geist | 13px | 400 | 0 | 1.6 |
| Labels / badges | Geist Mono | 11px | 500 | 0.10em | 1 |
| Captions / timestamps | Geist | 12px | 400 | 0 | 1.5 |

### Hero Headline Clamp Fix
```css
/* Before */
font-size: clamp(38px, 6vw, 72px);

/* After */
font-size: clamp(36px, 4vw, 52px);
```

---

## 2. Colour & Contrast System

### Ink Scale (4 tiers, down from 5)

Remove `--ink-80`, `--ink-60`, and `--ink-40` entirely. Replace with:

```css
--ink-100: rgba(255, 255, 255, 0.95); /* Primary text, headings, active nav */
--ink-70:  rgba(255, 255, 255, 0.65); /* Secondary text, card subtitles */
--ink-50:  rgba(255, 255, 255, 0.48); /* Metadata, timestamps, captions */
--ink-30:  rgba(255, 255, 255, 0.22); /* Decorative only — dividers, disabled */
```

**Critical fix:** `--ink-40` (28% opacity) was used on readable UI labels (status text, timestamps, progress %). It is unreadable. All such usages migrate to `--ink-50` minimum.

### Accent Colour Semantic Lanes

Each accent is assigned one semantic purpose only — no more mixing all three in the same gradient on buttons AND badges AND backgrounds.

| Token | OKLCH | Semantic role | Used for |
|---|---|---|---|
| `--accent-1` | `oklch(0.78 0.18 285)` | Action / primary CTA | Buttons, active state, progress fill, active nav indicator |
| `--accent-2` | `oklch(0.82 0.16 200)` | Information / navigation | Active nav item bg tint, links, info badges |
| `--accent-3` | `oklch(0.80 0.18 330)` | Alert / risk | Risk flags, overdue badges only |

Remove gradient mixing of `accent-1 + accent-2 + accent-3` from card backgrounds and section decorations. Gradients on the primary CTA button only.

### Background Layer Enforcement

No value changes — only enforcing which surface lives on which layer:

```css
--bg-0: #07070b;   /* Page root, aurora base */
--bg-1: #0d0d12;   /* Sidebar, fixed chrome */
--bg-2: #13131a;   /* Cards, elevated surfaces */
--bg-3: rgba(255, 255, 255, 0.04); /* Hover states, nested cards */
```

Sidebar and cards must NOT both use `--bg-1` — sidebar stays `--bg-1`, cards move to `--bg-2`.

### Status Colour Fixes

| State | Before | After |
|---|---|---|
| Completed | `#4ade80` green | No change |
| In Progress | `accent-1` purple | `oklch(0.82 0.16 75)` amber |
| At Risk | `#fbbf24` amber | No change — add text label alongside colour dot |
| Overdue | `#f87171` red | No change |
| Not Started | `ink-40` | `ink-50` |

---

## 3. Visual Hierarchy & Spacing

### Hierarchy Rule: 3 Layers Always

Every page must have exactly three visual layers. Nothing reads at equal weight.

| Layer | What | How |
|---|---|---|
| Hero | The one thing the page is about | Largest, brightest, most space |
| Content | Scannable list/grid | Medium density, clear grouping |
| Metadata | Supporting detail | Smallest, dimmest, never competes |

### Roadmap Page

- Tier headings → `11px / Geist Mono / ink-50 / uppercase / 0.14em` + full-width `1px rgba(255,255,255,0.06)` rule before each tier
- Module title → `15px / Geist 600 / ink-100`
- Resource name + platform → `13px / Geist / ink-70`
- Timeline strip → `12px / Geist / ink-50` (remove Geist Mono here)
- Progress slider → move to dedicated bottom strip, separated by `1px rgba(255,255,255,0.07)` divider
- Card padding → standardise `20px 24px`
- Card gap → `16px` (from `12px`)

### Admin Dashboard

- Stats row → fixed 4-column `1fr` grid
- Stats card value → `28px / Syne 700 / ink-100`
- Stats card label → `12px / Geist 400 / ink-50`
- "Sprint Matrix" heading → `24px` top margin, `12px` bottom margin
- Table row height → `48px` (from `~60px`)
- Table header → `11px / Geist Mono / ink-50 / uppercase / 0.10em`
- Drill-down panel → add `transform: translateX(100%)` → `translateX(0)` slide-in `0.22s ease`

### Login / Register Pages

- Brand mark → `Syne 700 32px / ink-100`
- Form card padding → `40px 44px` (from `32px`)
- Input label → `12px / Geist 500 / ink-70`
- Sign In button → `width: 100%`, `height: 48px`
- Error messages → `3px left border oklch(0.72 0.18 25)` + `4px` top margin

### Landing Page

- Hero headline → `Syne 700 / clamp(36px, 4vw, 52px)`
- Hero subtext → `max-width: 560px`
- Section vertical gaps → `80px` between hero / stats / features / CTA
- Feature card grid gap → `20px` (from `12px`)
- Stats row → `48px` top margin

---

## 4. Component Patterns

### Buttons — 3 Variants, Strict Roles

| Variant | Style | Role |
|---|---|---|
| Primary | Gradient `accent-1→accent-2`, `border-radius: 10px`, `height: 40px`, `padding: 0 24px` | One per view — main action |
| Secondary | `bg: rgba(255,255,255,0.06)`, `border: 1px solid rgba(255,255,255,0.10)`, same shape | Supporting actions |
| Ghost | No bg, no border, `ink-70` text, hover → `ink-100` | Low-priority / destructive |

Remove the 4th gradient-border variant — replace with Secondary.

**Consistent sizing:**
- `font-size: 13px / Geist 500`
- `height: 40px` standard, `32px` compact
- `border-radius: 10px` everywhere (remove `12px` and `20px` variants)

### Badges — 2 Types Only

| Type | Style | Use |
|---|---|---|
| Status badge | Fill `12%` opacity + border `30%` opacity + text. `border-radius: 6px`. `11px Geist Mono 500` | Progress state |
| Count badge | `bg: rgba(255,255,255,0.10)`. `border-radius: 4px`. `11px Geist 600`. `padding: 1px 6px` | Filter pill counts |

Remove `border-radius: 20px` pill shape from status badges — reserved for filter chips only.

### Cards — 2 Surfaces

| Surface | Background | Border | Radius | Padding |
|---|---|---|---|---|
| Standard | `--bg-2` `#13131a` | `1px solid rgba(255,255,255,0.08)` | `14px` | `20px 24px` |
| Elevated (hover/active) | `--bg-2` + `rgba(255,255,255,0.03)` overlay | `1px solid rgba(255,255,255,0.13)` | `14px` | same |

Remove `border-radius: 16px` and `18px` — standardise on `14px`.
Remove `backdrop-filter` from cards that don't sit over the aurora background.

### Inputs

| Property | Value |
|---|---|
| Height | `40px` standard, `34px` compact search |
| Background | `rgba(255,255,255,0.05)` |
| Border | `1px solid rgba(255,255,255,0.09)` |
| Border (focus) | `1px solid rgba(255,255,255,0.24)` |
| Border-radius | `10px` form inputs, `20px` search only |
| Font | `14px / Geist 400 / ink-100` |
| Placeholder | `ink-50` |
| Label | `12px / Geist 500 / ink-70`, always visible above input |

Add explicit `<label>` elements to all search inputs — never placeholder-only.

### Sidebar Nav Active State

| State | Style |
|---|---|
| Active | `bg: rgba(99,102,241,0.15)` + `2px left border accent-1` + `ink-100` text |
| Inactive | No bg + `ink-70`, hover → `rgba(255,255,255,0.05)` bg + `ink-90` text |
| Nav section labels | `10px / Geist Mono / ink-50 / uppercase / 0.12em` |

---

## 5. Page-by-Page Summary

### LoginPage & RegisterPage
- Syne 700 32px brand mark
- Form card `40px 44px` padding
- Full-width `48px` Sign In button
- Visible `<label>` above every input
- Error message left border + margin
- SSO button → Secondary variant

### LandingPage
- Syne 700 hero headline with clamp
- Hero subtext `max-width: 560px`
- `80px` section gaps
- Feature card grid `gap: 20px`
- Stats row `48px` top margin

### ProfileSelect
- Standard card surface
- Profile name `Syne 600 18px`
- Description `14px / ink-70 / max-width: 400px`

### RoadmapPage
- Tier dividers demoted to `11px Geist Mono / ink-50` + rule
- Module title `15px / Geist 600 / ink-100`
- Resource `13px / ink-70`
- Timeline `12px / Geist / ink-50`
- Progress slider in bottom strip
- Card padding `20px 24px`, gap `16px`
- In Progress badge → amber

### AdminDashboard
- Stats 4-col grid, `28px / Syne 700` values
- Table header `11px / Geist Mono / ink-50`
- Row height `48px`
- Sprint Matrix section spacing
- Drill-down slide-in transition `0.22s`
- Risk badges always text + dot

### ProgrammeOverview
- Section headings `Syne 600 20px`
- Standard card surface
- Left accent border kept

### Sidebar (global)
- Active state: purple tint + left border
- Nav section labels: Geist Mono 10px

---

## Files Expected to Change

| File | Changes |
|---|---|
| `index.html` | Swap Google Fonts import |
| `src/index.css` | Ink scale tokens, font-serif variable |
| `src/pages/LoginPage.tsx` | Brand mark, form padding, button, labels, error states |
| `src/pages/RegisterPage.tsx` | Same as LoginPage |
| `src/pages/LandingPage.tsx` | Headline clamp, subtext max-width, section spacing, card gap |
| `src/pages/RoadmapPage.tsx` | Tier dividers, card layout, slider strip, badge colour, spacing |
| `src/pages/AdminDashboard.tsx` | Stats grid, table header/rows, drill-down transition, spacing |
| `src/pages/ProgrammeOverview.tsx` | Section headings, card surface |
| `src/pages/ProfileSelect.tsx` | Card surface, profile name, description |
| `src/components/Sidebar.tsx` | Active state, nav label styles |

---

## Out of Scope

- Mobile / tablet responsive changes
- WCAG formal compliance audit
- Backend / API changes
- Aurora background animation changes
- New pages or features
- Progress slider logic (locked minimum constraint preserved)
