# Dark / Light Mode Toggle — Design Spec

**Date:** 2026-06-01  
**Branch:** ui-enhancement  
**Approach:** CSS Variables swap via `data-theme` attribute (Option A)

---

## Summary

Add a dark/light mode toggle to ANTS Trail. Light mode uses a warm off-white palette with the aurora still animating as soft pastels. The toggle lives in the top navbar. Preference persists in `localStorage`; first-time visitors default to their OS preference (`prefers-color-scheme`).

---

## 1. Color Tokens

All theme tokens live in `frontend/src/index.css`. The existing `:root` block remains the dark theme. A new `[data-theme="light"]` block overrides every variable.

### Background tokens

| Token | Dark | Light |
|---|---|---|
| `--bg-0` | `#07070b` | `#faf7f2` |
| `--bg-1` | `#0d0d12` | `#f3efe8` |
| `--bg-2` | `#13131a` | `#ede8df` |
| `--bg-3` | `rgba(255,255,255,0.04)` | `rgba(0,0,0,0.04)` |

### Text (ink) tokens

| Token | Dark | Light |
|---|---|---|
| `--ink-100` | `rgba(255,255,255,0.95)` | `rgba(20,15,10,0.90)` |
| `--ink-70` | `rgba(255,255,255,0.65)` | `rgba(20,15,10,0.60)` |
| `--ink-50` | `rgba(255,255,255,0.48)` | `rgba(20,15,10,0.45)` |
| `--ink-30` | `rgba(255,255,255,0.22)` | `rgba(20,15,10,0.22)` |

### Glass tokens

| Token | Dark | Light |
|---|---|---|
| `--glass-fill` | `rgba(255,255,255,0.04)` | `rgba(255,255,255,0.55)` |
| `--glass-stroke` | `rgba(255,255,255,0.08)` | `rgba(0,0,0,0.10)` |
| `--glass-blur` | `18px` | `18px` (unchanged) |

### Accent tokens (darker in light mode for contrast)

| Token | Dark | Light |
|---|---|---|
| `--accent-1` | `oklch(0.72 0.13 285)` | `oklch(0.52 0.14 285)` |
| `--accent-2` | `oklch(0.74 0.10 210)` | `oklch(0.48 0.12 210)` |
| `--accent-3` | `oklch(0.80 0.18 330)` | `oklch(0.58 0.16 330)` |

### Aurora blob tokens (new variables to extract from hardcoded values)

| Token | Dark | Light |
|---|---|---|
| `--aurora-1` | `oklch(0.55 0.22 285)` | `oklch(0.82 0.10 285)` |
| `--aurora-2` | `oklch(0.58 0.18 210)` | `oklch(0.85 0.08 210)` |
| `--aurora-3` | `oklch(0.52 0.24 330)` | `oklch(0.84 0.10 330)` |

Aurora opacity: dark `0.6` → light `0.35` (atmospheric, not loud).

### Tailwind shadcn mapping

Add a block in `index.css` that maps Tailwind's semantic tokens to ANTS variables so shadcn/ui primitives switch automatically:

```css
:root, [data-theme="dark"] {
  --background: var(--bg-0);
  --foreground: var(--ink-100);
  --muted: var(--bg-2);
  --muted-foreground: var(--ink-50);
  --border: var(--glass-stroke);
  --ring: var(--accent-1);
}
```

The `[data-theme="light"]` block overrides these via the already-changed ANTS variables — no extra mapping needed.

---

## 2. Aurora Adaptation

The `.ants-aurora` blobs in `index.css` currently have OKLCH colors hardcoded inside gradient strings. These get replaced with `var(--aurora-1)`, `var(--aurora-2)`, `var(--aurora-3)`. The aurora animation CSS itself is unchanged — only the colors swap.

---

## 3. ThemeContext

**File:** `frontend/src/context/ThemeContext.tsx` (new file)

```
ThemeContext
  theme: 'dark' | 'light'
  toggleTheme: () => void

ThemeProvider
  - On mount:
      1. Read localStorage.getItem('ants-theme')
      2. If absent, check window.matchMedia('(prefers-color-scheme: dark)')
      3. Default: 'dark'
  - On theme change:
      1. Set document.documentElement.setAttribute('data-theme', theme)
      2. localStorage.setItem('ants-theme', theme)
  - Wraps children via React Context
```

`ThemeProvider` is added to `frontend/src/main.tsx` wrapping `<App />`.

---

## 4. ThemeToggle Component

**File:** `frontend/src/components/ThemeToggle.tsx` (new file)

- Icon button: sun icon when in dark mode (click → switch to light), moon icon when in light mode (click → switch to dark)
- Uses existing `.ants-icon-btn` or equivalent glass button style from `index.css`
- Calls `toggleTheme()` from `ThemeContext`
- Placed in the top navbar/header area of both `Layout.tsx` and `AdminLayout.tsx`, right-aligned near the user name/avatar

Icons: use inline SVG or a minimal import (no new icon library dependency).

---

## 5. Inline Style Overrides

Pages/components that bypass the CSS variable system and require targeted fixes:

### `LandingPage.tsx`
- Aurora blob gradients: replace hardcoded OKLCH values with `var(--aurora-1/2/3)`
- Background and text: already use `var(--bg-0)` and `var(--ink-100)` — no change needed

### `AdminDashboard.tsx`
- Dark dropdown background: replace `rgba(255,255,255,0.05)` with `var(--glass-fill)`
- Table row hover: replace hardcoded rgba with `var(--bg-3)`
- Risk badges (red/yellow/green): semantic status colors — leave as-is

### `RoadmapPage.tsx`
- Audit for remaining `rgba(255,255,255,*)` inline values → replace with `var(--glass-fill)` or `var(--bg-3)`
- Module state colors (completed green, in-progress accent) are semantic — leave as-is

### `LoginPage.tsx` / `RegisterPage.tsx`
- Audit for hardcoded `rgba(255,255,255,*)` values in card backgrounds and input borders → replace with `var(--glass-fill)` / `var(--glass-stroke)`
- Background: already uses `var(--bg-0)` via body styles — no change needed

### `ProgrammeOverview.tsx`
- Audit for hardcoded rgba inline styles → replace with CSS variable equivalents

### `ProfileSelect.tsx`
- Per-profile gradient cards use `--c1`/`--c2` custom properties set inline — these are accent-based and will adapt with the accent token changes

### `Sidebar.tsx`
- Replace Tailwind classes `slate-200`, `slate-800`, `sky-300` with CSS variable equivalents:
  - `slate-200` → `color: var(--ink-100)`
  - `slate-800` → `background: var(--bg-2)`
  - `sky-300` → `color: var(--accent-2)`

---

## 6. Files Changed

| File | Change type |
|---|---|
| `frontend/src/index.css` | Add `[data-theme="light"]` block, extract aurora vars, add shadcn mapping |
| `frontend/src/context/ThemeContext.tsx` | New — theme context + provider |
| `frontend/src/components/ThemeToggle.tsx` | New — toggle icon button |
| `frontend/src/main.tsx` | Wrap `<App>` with `<ThemeProvider>` |
| `frontend/src/components/Layout.tsx` | Add `<ThemeToggle>` to header |
| `frontend/src/components/AdminLayout.tsx` | Add `<ThemeToggle>` to header |
| `frontend/src/pages/LandingPage.tsx` | Replace hardcoded aurora colors |
| `frontend/src/pages/AdminDashboard.tsx` | Replace hardcoded glass/bg rgba values |
| `frontend/src/pages/RoadmapPage.tsx` | Audit + replace hardcoded rgba whites |
| `frontend/src/pages/LoginPage.tsx` | Audit + replace hardcoded rgba whites |
| `frontend/src/pages/RegisterPage.tsx` | Audit + replace hardcoded rgba whites |
| `frontend/src/pages/ProgrammeOverview.tsx` | Audit + replace hardcoded rgba whites |
| `frontend/src/components/Sidebar.tsx` | Replace Tailwind classes with CSS vars |

No new dependencies required.

---

## 7. Out of Scope

- Animated transition between themes (CSS `transition` on color properties) — not requested
- Per-component dark/light overrides beyond what the variable system handles
- Admin-configurable default theme per tenant
