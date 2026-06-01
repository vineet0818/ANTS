# UI/UX Readability Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve readability, visual hierarchy, typography, and component consistency across all ANTS Trail pages while preserving the dark aurora glass-morphism aesthetic.

**Architecture:** Pure frontend changes — update CSS tokens in `index.css`, swap the Google Fonts import in `index.html`, then apply typography and spacing fixes page-by-page via inline style updates in TSX files and CSS class updates. No new components. No backend changes.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, Vite, inline styles (dominant pattern in this codebase), CSS custom properties in `frontend/src/index.css`

**Dev server:** Already running at http://localhost:5173 — verify each task visually after completing it.

---

## File Map

| File | What changes |
|---|---|
| `frontend/index.html` | Swap Instrument Serif → Syne in Google Fonts import |
| `frontend/src/index.css` | Ink token values + new aliases, font-serif variable, sidebar CSS classes |
| `frontend/src/pages/LoginPage.tsx` | Brand mark font, form card padding, button height, input labels, error style |
| `frontend/src/pages/RegisterPage.tsx` | Same set of changes as LoginPage |
| `frontend/src/pages/LandingPage.tsx` | Hero headline clamp + font, subtext max-width, section gaps, card gap |
| `frontend/src/pages/ProfileSelect.tsx` | Profile name font/size, description colour + max-width, card surface |
| `frontend/src/pages/RoadmapPage.tsx` | Tier divider style, module card layout, slider strip, badge colour, spacing |
| `frontend/src/pages/AdminDashboard.tsx` | Stats grid, stat value font, table header/row, drill-down transition |
| `frontend/src/pages/ProgrammeOverview.tsx` | Section headings font, card surface |

---

## Task 1: Foundation — Font Import + CSS Tokens

**Files:**
- Modify: `frontend/index.html`
- Modify: `frontend/src/index.css`

### Steps

- [ ] **Step 1.1: Swap Google Fonts import in index.html**

Open `frontend/index.html`. Replace line 10:

```html
<!-- BEFORE -->
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet" />

<!-- AFTER -->
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500&family=Syne:wght@600;700&display=swap" rel="stylesheet" />
```

- [ ] **Step 1.2: Update CSS tokens in index.css**

In `frontend/src/index.css`, replace the entire `:root` block (lines 10–44) with:

```css
:root {
  --bg-0:   #07070b;
  --bg-1:   #0d0d12;
  --bg-2:   #13131a;
  --bg-3:   rgba(255,255,255,0.04);

  /* Ink scale — 4 semantic tiers */
  --ink-100: rgba(255,255,255,0.95);  /* Primary text, headings, active nav */
  --ink-70:  rgba(255,255,255,0.65);  /* Secondary text, card subtitles */
  --ink-50:  rgba(255,255,255,0.48);  /* Metadata, timestamps, captions */
  --ink-30:  rgba(255,255,255,0.22);  /* Decorative only — dividers, disabled */

  /* Legacy aliases — keep so old var() references don't break */
  --ink-80:  rgba(255,255,255,0.65);  /* → ink-70 */
  --ink-60:  rgba(255,255,255,0.48);  /* → ink-50 */
  --ink-40:  rgba(255,255,255,0.22);  /* → ink-30 (decorative only) */
  --ink-20:  rgba(255,255,255,0.10);

  --accent-1: oklch(0.78 0.18 285);
  --accent-2: oklch(0.82 0.16 200);
  --accent-3: oklch(0.80 0.18 330);

  --glass-fill:   rgba(255,255,255,0.04);
  --glass-stroke: rgba(255,255,255,0.08);
  --glass-blur:   18px;

  --r-sm:  8px;
  --r-md:  14px;
  --r-lg:  18px;
  --r-xl:  24px;

  --font-sans:  'Geist', ui-sans-serif, system-ui, -apple-system, sans-serif;
  --font-mono:  'Geist Mono', ui-monospace, 'Cascadia Code', monospace;
  --font-serif: 'Syne', ui-sans-serif, system-ui;   /* was Instrument Serif */

  --background: #07070b;
  --foreground: rgba(255,255,255,0.95);
  --border: rgba(255,255,255,0.08);
  --radius: 1rem;
  --sans: var(--font-sans);
}
```

- [ ] **Step 1.3: Update sidebar CSS classes in index.css**

Find and replace these specific class rules in index.css (the classes exist — update only the listed properties):

**`.ants-brand-tag`** — change `color: var(--ink-40)` → `color: var(--ink-50)`

**`.ants-nav-label`** — replace the rule:
```css
.ants-nav-label {
  font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.12em;
  text-transform: uppercase; color: var(--ink-50); padding: 0 8px; margin: 0 0 6px;
}
```

**`.ants-nav-item`** — change `color: var(--ink-60)` → `color: var(--ink-70)`

**`.ants-nav-item:hover`** — change `color: var(--ink-80)` → `color: var(--ink-100)`

**`.ants-nav-item.active`** — replace the rule:
```css
.ants-nav-item.active {
  background: rgba(99,102,241,0.15);
  color: var(--ink-100);
  border-left: 2px solid var(--accent-1);
  border-top: none; border-right: none; border-bottom: none;
  padding-left: 8px;
}
```

**`.ants-user-role`** — change `color: var(--ink-40)` → `color: var(--ink-50)`

**`.ants-crumbs`** — change `color: var(--ink-40)` → `color: var(--ink-50)`

**`.ants-crumbs-dot`** — change `background: var(--ink-40)` → `background: var(--ink-50)`

**`.ants-crumbs-active`** — change `color: var(--ink-80)` → `color: var(--ink-70)`

**`.ants-hint`** — change `color: var(--ink-40)` → `color: var(--ink-50)`

**`.ants-hero-sub`** — change `color: var(--ink-60)` → `color: var(--ink-70)`

**`.ants-hello`** — change `font-family: var(--font-serif)` (now resolves to Syne ✓) + `font-size: 28px` + `font-weight: 700` + `letter-spacing: -0.02em`

**`.ants-info-card .label`** — change `color: var(--ink-40)` → `color: var(--ink-50)`

**`.ants-cohort`** — change `grid-template-columns: repeat(auto-fill, minmax(200px, 1fr))` → `grid-template-columns: repeat(4, 1fr)`

**`.ants-stat .n`** — change `font-size: 28px` stays, add `font-family: var(--font-serif)` (Syne)

**`.ants-stat .u`** — change `color: var(--ink-60)` → `color: var(--ink-50)`

**`.ants-module-card`** — update border-radius from `var(--r-lg)` → `var(--r-md)` (14px)

- [ ] **Step 1.4: Verify font loaded**

Open http://localhost:5173. The "Welcome back" heading on the login page should now render in Syne (geometric, wide letterforms) instead of Instrument Serif (editorial serif). If you see a fallback sans-serif, the font URL is wrong — re-check Step 1.1.

- [ ] **Step 1.5: Commit**

```bash
git add frontend/index.html frontend/src/index.css
git commit -m "style: swap Instrument Serif for Syne, update ink token scale"
```

---

## Task 2: LoginPage

**Files:**
- Modify: `frontend/src/pages/LoginPage.tsx`

### Steps

- [ ] **Step 2.1: Update brand mark and heading**

Find the brand section (around line 62–68). Replace the `<h1>` and the mono label above it:

```tsx
{/* Brand */}
<div style={{ textAlign: 'center', marginBottom: 32 }}>
  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, var(--accent-1), var(--accent-2))', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: 'white', boxShadow: '0 0 24px oklch(0.78 0.18 285 / 0.35)', marginBottom: 16 }}>AT</div>
  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-50)', marginBottom: 6 }}>ANTS Trail</div>
  <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 32, fontWeight: 700, color: 'var(--ink-100)', margin: 0, letterSpacing: '-0.02em', lineHeight: 1.2 }}>Welcome back</h1>
  <p style={{ fontSize: 13, color: 'var(--ink-70)', marginTop: 6 }}>
    Use your <span style={{ color: 'var(--accent-2)', fontWeight: 600 }}>@{ALLOWED_DOMAIN}</span> account
  </p>
</div>
```

- [ ] **Step 2.2: Update form card padding**

Find the card wrapper div (around line 72). Change `padding: '32px 28px'` → `padding: '40px 44px'`:

```tsx
<div style={{ background: 'rgba(13,13,18,0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '40px 44px', boxShadow: '0 32px 80px rgba(0,0,0,0.6)' }}>
```

- [ ] **Step 2.3: Add visible labels above inputs and fix input label style**

Wrap each input in a `<div>` with a `<label>`. Replace the form contents (lines 92–117):

```tsx
<form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
  <div>
    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--ink-70)', marginBottom: 6 }}>
      Work email
    </label>
    <input type="email" placeholder={`you@${ALLOWED_DOMAIN}`} value={email}
      onChange={e => handleEmailChange(e.target.value)} required
      style={emailError ? inputErrorStyle : inputStyle}
      onFocus={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; }}
      onBlur={e => { e.currentTarget.style.borderColor = emailError ? 'oklch(0.72 0.18 25)' : 'rgba(255,255,255,0.10)'; }}
    />
    {emailError && (
      <p style={{ fontSize: 11.5, color: 'oklch(0.72 0.18 25)', marginTop: 5, paddingLeft: 10, borderLeft: '3px solid oklch(0.72 0.18 25)' }}>
        {emailError}
      </p>
    )}
  </div>

  <div>
    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--ink-70)', marginBottom: 6 }}>
      Password
    </label>
    <input type="password" placeholder="Password" value={password}
      onChange={e => setPassword(e.target.value)} required
      style={inputStyle}
      onFocus={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; }}
      onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)'; }}
    />
  </div>

  <button type="submit" disabled={loading || !!emailError}
    style={{ width: '100%', height: 48, borderRadius: 10, border: 'none', fontWeight: 600, fontSize: 14, color: 'white', background: 'linear-gradient(135deg, var(--accent-1), var(--accent-2))', cursor: loading || !!emailError ? 'not-allowed' : 'pointer', opacity: loading || !!emailError ? 0.5 : 1, boxShadow: '0 4px 20px oklch(0.78 0.18 285 / 0.35)', transition: 'opacity 0.15s, transform 0.15s' }}
    onMouseEnter={e => { if (!loading && !emailError) e.currentTarget.style.opacity = '0.88'; }}
    onMouseLeave={e => { e.currentTarget.style.opacity = loading || !!emailError ? '0.5' : '1'; }}
  >
    {loading ? 'Signing in…' : 'Sign in'}
  </button>
</form>
```

- [ ] **Step 2.4: SSO button → secondary variant**

Find the SSO button (around line 75). Update its style to match the Secondary button variant:

```tsx
<button type="button" onClick={handleSSO} disabled={ssoLoading}
  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, height: 40, borderRadius: 10, border: '1px solid rgba(255,255,255,0.10)', background: 'rgba(255,255,255,0.06)', color: 'var(--ink-70)', fontSize: 13, fontWeight: 500, cursor: ssoLoading ? 'not-allowed' : 'pointer', transition: 'background 0.15s', opacity: ssoLoading ? 0.6 : 1 }}
  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.10)')}
  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
>
```

- [ ] **Step 2.5: Verify**

Open http://localhost:5173/login. Check:
- Heading "Welcome back" renders in Syne (wide, geometric)
- "ANTS Trail" mono label is readable (not near-invisible)
- "Work email" and "Password" labels appear above each input
- Sign In button spans full width at 48px height
- SSO button matches the secondary style (no gradient)

- [ ] **Step 2.6: Commit**

```bash
git add frontend/src/pages/LoginPage.tsx
git commit -m "style(login): Syne heading, form padding, input labels, button height"
```

---

## Task 3: RegisterPage

**Files:**
- Modify: `frontend/src/pages/RegisterPage.tsx`

### Steps

- [ ] **Step 3.1: Read the file first**

Read `frontend/src/pages/RegisterPage.tsx` in full. It follows the same pattern as LoginPage.

- [ ] **Step 3.2: Apply identical brand mark update**

Find the `<h1>` in the brand section. Apply the same changes as Task 2 Step 2.1:
- Mono label: `color: 'var(--ink-50)'`
- h1: `fontFamily: 'var(--font-serif)'`, `fontSize: 32`, `fontWeight: 700`, `letterSpacing: '-0.02em'`, `lineHeight: 1.2`
- Subtitle paragraph: `color: 'var(--ink-70)'`

- [ ] **Step 3.3: Update form card padding**

Find the card wrapper. Change `padding` to `'40px 44px'`.

- [ ] **Step 3.4: Add labels above all inputs**

Wrap each `<input>` in a `<div>` with a `<label>` styled as:
```tsx
<label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--ink-70)', marginBottom: 6 }}>
  {/* Field name: Full Name / Work email / Password / Confirm Password */}
</label>
```

- [ ] **Step 3.5: Update submit button**

Find the submit button. Set `height: 48` and ensure `width: '100%'`.

- [ ] **Step 3.6: Update SSO button if present**

If an SSO button exists, apply the secondary style from Task 2 Step 2.4.

- [ ] **Step 3.7: Verify**

Open http://localhost:5173/register. Headings in Syne, labels above inputs, full-width button.

- [ ] **Step 3.8: Commit**

```bash
git add frontend/src/pages/RegisterPage.tsx
git commit -m "style(register): match login page typography and form improvements"
```

---

## Task 4: LandingPage

**Files:**
- Modify: `frontend/src/pages/LandingPage.tsx`

### Steps

- [ ] **Step 4.1: Fix hero headline**

Find the `<h1>` in the hero section (around line 74). Update:

```tsx
<h1 style={{ fontSize: 'clamp(36px, 4vw, 52px)', fontFamily: 'var(--font-serif)', fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.02em', margin: '0 0 28px', maxWidth: 840 }}>
```

- [ ] **Step 4.2: Fix hero subtext max-width**

Find the hero subtext paragraph (the one describing the learning path, below the h1). Add `maxWidth: 560` to its style.

- [ ] **Step 4.3: Add section gaps**

The landing page has sections: hero → stats → features → CTA. Find each section `<section>` or wrapping `<div>` that separates these blocks. Add `marginTop: 80` to the stats section, features section, and CTA section.

- [ ] **Step 4.4: Fix feature card grid gap**

Find the features grid (look for `gridTemplateColumns` with `minmax` and multiple feature cards). Change `gap: 12` → `gap: 20`.

- [ ] **Step 4.5: Fix stats row top margin**

Find the stats row (the row of numbers — learners, modules, weeks, etc.). Add `marginTop: 48` to its container.

- [ ] **Step 4.6: Update nav subtitle colour**

Find the nav brand subtitle (`AI-Native Testing Specialists` mono text). Change `color: 'var(--ink-40)'` → `color: 'var(--ink-50)'`.

- [ ] **Step 4.7: Verify**

Open http://localhost:5173. Check:
- Hero headline is Syne, not oversized (max 52px)
- Subtext wraps at ~560px not full width
- Clear vertical breathing room between sections
- Feature cards have more space between them

- [ ] **Step 4.8: Commit**

```bash
git add frontend/src/pages/LandingPage.tsx
git commit -m "style(landing): Syne hero, clamp fix, section gaps, feature card spacing"
```

---

## Task 5: ProfileSelect

**Files:**
- Modify: `frontend/src/pages/ProfileSelect.tsx`

### Steps

- [ ] **Step 5.1: Read the file**

Read `frontend/src/pages/ProfileSelect.tsx` in full to identify where profile name, description, and card styles are.

- [ ] **Step 5.2: Update profile card surface**

Find each profile card container. Ensure:
- `background: 'var(--bg-2)'` (was likely `rgba(255,255,255,0.04)` or similar)
- `border: '1px solid rgba(255,255,255,0.08)'`
- `borderRadius: 14`
- `padding: '20px 24px'`

- [ ] **Step 5.3: Update profile name typography**

Find the profile name text in each card. Update:
```tsx
style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 600, color: 'var(--ink-100)', letterSpacing: '-0.01em', lineHeight: 1.3 }}
```

- [ ] **Step 5.4: Update profile description**

Find the description text. Update:
```tsx
style={{ fontSize: 14, color: 'var(--ink-70)', lineHeight: 1.65, maxWidth: 400 }}
```

- [ ] **Step 5.5: Verify**

Open http://localhost:5173/select-profile (log in first). Profile names in Syne, descriptions readable in ink-70.

- [ ] **Step 5.6: Commit**

```bash
git add frontend/src/pages/ProfileSelect.tsx
git commit -m "style(profile-select): Syne profile names, card surface, description contrast"
```

---

## Task 6: RoadmapPage

**Files:**
- Modify: `frontend/src/pages/RoadmapPage.tsx`

This is the most complex task. Read the full file before starting.

### Steps

- [ ] **Step 6.1: Read the full file**

Read `frontend/src/pages/RoadmapPage.tsx` in full. Identify:
1. The tier heading render (look for tier name text, e.g., "FOUNDATION", "CORE")
2. The module card outer container style
3. Module title text
4. Resource name and platform text
5. Timeline strip elements (dates, duration)
6. Progress slider container
7. Status badge render (look for "In Progress", "Completed", etc.)

- [ ] **Step 6.2: Update tier headings**

Find where tier names are rendered. Replace the tier heading style with:

```tsx
{/* Tier divider */}
<div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 32, marginBottom: 16 }}>
  <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-50)' }}>
    {tierName}
  </span>
  <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
</div>
```

- [ ] **Step 6.3: Update module card container**

Find the module card wrapper div. Update:
- `padding` → `'20px 24px'`
- `borderRadius` → `14`
- `gap` between cards → `16` (find the cards list container)

- [ ] **Step 6.4: Update module title**

Find the module title text element. Update:
```tsx
style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink-100)', letterSpacing: '-0.01em', lineHeight: 1.4, margin: '0 0 6px' }}
```

- [ ] **Step 6.5: Update resource and platform text**

Find where resource name and platform are rendered. Update both:
```tsx
style={{ fontSize: 13, color: 'var(--ink-70)', lineHeight: 1.5 }}
```

- [ ] **Step 6.6: Update timeline strip**

Find the timeline elements (dates, duration with clock/calendar icons). Update text styles to:
```tsx
style={{ fontSize: 12, fontFamily: 'var(--font-sans)', color: 'var(--ink-50)', display: 'flex', alignItems: 'center', gap: 4 }}
```
(Remove `fontFamily: 'var(--font-mono)'` from timeline — Geist sans is cleaner here.)

- [ ] **Step 6.7: Move progress slider to bottom strip**

Find the progress slider section. Wrap it in a bottom strip container:

```tsx
{/* Progress strip — bottom of card */}
<div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', marginTop: 16, paddingTop: 14 }}>
  {/* existing slider JSX here, unchanged */}
</div>
```

- [ ] **Step 6.8: Fix In Progress badge colour**

Find the status badge render. Locate the "In Progress" / `in_progress` case. Change its colour from purple/accent-1 to amber:

```tsx
// In Progress badge
background: 'rgba(234,179,8,0.12)',
border: '1px solid rgba(234,179,8,0.30)',
color: 'oklch(0.82 0.16 75)',
```

- [ ] **Step 6.9: Fix Not Started badge**

Find the `not_started` case. Change `color: 'var(--ink-40)'` → `color: 'var(--ink-50)'`.

- [ ] **Step 6.10: Verify**

Open http://localhost:5173/roadmap. Check:
- Tier dividers are demoted (thin rule + small mono text)
- Module titles are clearly the dominant element in each card
- Timeline dates are `ink-50` (dim, not competing)
- Progress slider sits in a separated bottom strip
- In Progress badges are amber, not purple

- [ ] **Step 6.11: Commit**

```bash
git add frontend/src/pages/RoadmapPage.tsx
git commit -m "style(roadmap): tier dividers, card hierarchy, slider strip, amber badge"
```

---

## Task 7: AdminDashboard

**Files:**
- Modify: `frontend/src/pages/AdminDashboard.tsx`

### Steps

- [ ] **Step 7.1: Read the full file**

Read `frontend/src/pages/AdminDashboard.tsx` in full. Identify:
1. The stats row container and stat cards
2. The stat value and label elements within each card
3. The "Sprint Matrix" section heading
4. The table header row (`<th>` elements)
5. The table body rows (`<tr>` elements) and their padding
6. The drill-down panel container

- [ ] **Step 7.2: Fix stats grid to 4 columns**

Find the stats row container. Change its grid:

```tsx
style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}
```

- [ ] **Step 7.3: Update stat card value typography**

Find the large number in each stat card. Update:
```tsx
style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 700, color: 'var(--ink-100)', letterSpacing: '-0.03em', lineHeight: 1 }}
```

- [ ] **Step 7.4: Update stat card label typography**

Find the label text below each stat value. Update:
```tsx
style={{ fontSize: 12, fontFamily: 'var(--font-sans)', color: 'var(--ink-50)', marginTop: 4 }}
```

- [ ] **Step 7.5: Fix Sprint Matrix section spacing**

Find the "Sprint Matrix" heading container. Add:
```tsx
style={{ marginTop: 24, marginBottom: 12, ... }}
```

- [ ] **Step 7.6: Update table header**

Find the `<th>` elements. Update their style:
```tsx
style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 500, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--ink-50)', padding: '10px 16px', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
```

- [ ] **Step 7.7: Reduce table row height**

Find the `<td>` elements. Change their padding from `14px 16px` → `12px 16px` (reduces row height from ~60px to ~48px).

- [ ] **Step 7.8: Add drill-down panel slide-in transition**

Find the drill-down panel container (the side panel that opens on row click). Add a transition:

```tsx
style={{
  position: 'fixed', right: 0, top: 0, height: '100vh',
  width: 420, zIndex: 100,
  background: 'rgba(13,13,18,0.96)',
  backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
  borderLeft: '1px solid rgba(255,255,255,0.08)',
  transform: drillDownOpen ? 'translateX(0)' : 'translateX(100%)',
  transition: 'transform 0.22s ease',
  /* ...other existing styles */
}}
```

Note: `drillDownOpen` is whatever boolean state variable controls the panel visibility — find its name in the file.

- [ ] **Step 7.9: Ensure risk badges have text + dot**

Find where At Risk / Overdue badges are rendered. Ensure every badge renders a coloured dot AND a text label — not colour-only:

```tsx
<span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 600, letterSpacing: '0.06em', padding: '3px 10px', borderRadius: 6, background: 'rgba(234,179,8,0.15)', border: '1px solid rgba(234,179,8,0.35)', color: '#fbbf24' }}>
  <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#fbbf24', flexShrink: 0 }} />
  At Risk
</span>
```

- [ ] **Step 7.10: Verify**

Open http://localhost:5173/admin. Check:
- Stats are in exactly 4 columns
- Stat numbers render in Syne
- Table headers are small mono uppercase
- Rows are less tall (more rows visible at once)
- Drill-down panel slides in from the right (not instant pop)

- [ ] **Step 7.11: Commit**

```bash
git add frontend/src/pages/AdminDashboard.tsx
git commit -m "style(admin): 4-col stats, Syne values, table density, slide-in panel"
```

---

## Task 8: ProgrammeOverview

**Files:**
- Modify: `frontend/src/pages/ProgrammeOverview.tsx`

### Steps

- [ ] **Step 8.1: Read the file**

Read `frontend/src/pages/ProgrammeOverview.tsx` in full.

- [ ] **Step 8.2: Update section headings**

Find all section `<h2>` or equivalent heading elements. Update:
```tsx
style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 600, color: 'var(--ink-100)', letterSpacing: '-0.01em', lineHeight: 1.3, margin: '0 0 16px' }}
```

- [ ] **Step 8.3: Update profile/tier card surface**

Find the profile tier cards. Update card wrapper:
- `background: 'var(--bg-2)'`
- `border: '1px solid rgba(255,255,255,0.08)'`
- `borderRadius: 14`
- `padding: '20px 24px'`

Keep any existing `borderLeft` accent — that's intentional per spec.

- [ ] **Step 8.4: Update any ink-40 text to ink-50**

Search within this file for `var(--ink-40)` on any text that is readable content (not a divider). Change to `var(--ink-50)`.

- [ ] **Step 8.5: Verify**

Open http://localhost:5173/programme-overview. Section headings in Syne, cards on `--bg-2`.

- [ ] **Step 8.6: Commit**

```bash
git add frontend/src/pages/ProgrammeOverview.tsx
git commit -m "style(programme-overview): Syne headings, card surface, contrast fixes"
```

---

## Task 9: Final Pass + Cleanup

**Files:**
- Review all modified files

### Steps

- [ ] **Step 9.1: Grep for remaining ink-40 text usages**

Run in terminal from the project root:
```bash
grep -rn "var(--ink-40)" frontend/src/pages/ frontend/src/components/
```

For any result where the text is readable content (not a border, divider, or truly decorative), change to `var(--ink-50)`.

- [ ] **Step 9.2: Grep for inconsistent border-radius**

```bash
grep -rn "borderRadius: 1[68]" frontend/src/pages/ frontend/src/components/
```

Change any `borderRadius: 16` or `borderRadius: 18` on card containers → `borderRadius: 14`.

- [ ] **Step 9.3: Full visual walkthrough**

Visit each route and check for regressions:

| Route | Key checks |
|---|---|
| `/` | Syne hero, section spacing, feature card gap |
| `/login` | Syne heading, labels, full-width button |
| `/register` | Same as login |
| `/select-profile` | Syne profile names, readable descriptions |
| `/roadmap` | Tier dividers, card hierarchy, amber In Progress, slider strip |
| `/admin` | 4-col stats, Syne numbers, dense table, slide-in panel |
| `/programme-overview` | Syne headings, card surface |

- [ ] **Step 9.4: Final commit**

```bash
git add -A
git commit -m "style: final pass — ink-40 contrast fixes, border-radius consistency"
```

---

## Self-Review Notes

**Spec coverage check:**
- ✅ Typography system (Tasks 1–8: font swap, type scale applied per page)
- ✅ Ink scale (Task 1: token values updated + aliased)
- ✅ Accent semantic lanes (Task 6: amber In Progress, Task 7: risk badges)
- ✅ Background layer enforcement (Task 5, 6, 8: cards on --bg-2)
- ✅ Button variants (Task 2: SSO button → secondary)
- ✅ Card surface standardisation (Tasks 5, 6, 8)
- ✅ Input labels (Tasks 2, 3)
- ✅ Sidebar active state (Task 1 CSS)
- ✅ Roadmap page hierarchy (Task 6)
- ✅ Admin dashboard (Task 7)
- ✅ Landing page (Task 4)

**Notes for implementer:**
- The `--font-serif` variable now points to Syne (a sans-serif). The variable name is legacy — the value is correct.
- The legacy ink tokens (`--ink-80`, `--ink-60`, `--ink-40`) are kept as aliases in index.css so existing inline style references in TSX files continue to work with updated values. Do NOT delete them.
- Progress slider logic is untouched — the locked minimum constraint is preserved.
- Aurora background animations are untouched.
