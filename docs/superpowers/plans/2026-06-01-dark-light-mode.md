# Dark / Light Mode Toggle — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a persistent dark/light mode toggle with a warm off-white + pastel aurora light theme, switchable via a sun/moon button in the top navbar.

**Architecture:** A `data-theme` attribute on `<html>` drives a `[data-theme="light"]` CSS variable override block in `index.css`. A `ThemeContext` holds the current theme, persists it to `localStorage`, and falls back to `prefers-color-scheme` on first visit. A `ThemeToggle` icon button in both layout headers reads and flips the context.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS 3 (class-based), CSS custom properties (OKLCH + rgba), no new dependencies.

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `frontend/src/index.css` | Modify | Add `--aurora-*`, `--hover-tint`, `--overlay-bg` vars; add `[data-theme="light"]` token block; add light-mode class overrides |
| `frontend/src/context/ThemeContext.tsx` | **Create** | Theme state, localStorage persistence, system preference fallback |
| `frontend/src/components/ThemeToggle.tsx` | **Create** | Sun/moon icon button wired to ThemeContext |
| `frontend/src/main.tsx` | Modify | Wrap `<App>` in `<ThemeProvider>` |
| `frontend/src/components/Layout.tsx` | Modify | Import + render `<ThemeToggle>` in `.ants-top-actions` |
| `frontend/src/components/AdminLayout.tsx` | Modify | Same as Layout.tsx |
| `frontend/src/pages/LandingPage.tsx` | Modify | Replace hardcoded aurora blob colors + navbar rgba + button rgba |
| `frontend/src/pages/LoginPage.tsx` | Modify | Replace hardcoded aurora blobs + `inputStyle` rgba values |
| `frontend/src/pages/RegisterPage.tsx` | Modify | Same pattern as LoginPage.tsx |
| `frontend/src/components/Sidebar.tsx` | Modify | Replace Tailwind `slate-*`/`sky-*` classes with CSS var inline styles |
| `frontend/src/pages/AdminDashboard.tsx` | Modify | Add `useTheme` + `th` style-object to replace hardcoded rgba values |
| `frontend/src/pages/ProgrammeOverview.tsx` | Modify | Replace hardcoded aurora + navbar + rgba glass values |

---

## Task 1: CSS Variables — Aurora vars, `--hover-tint`, light theme block, class overrides

**Files:**
- Modify: `frontend/src/index.css`

- [ ] **Step 1.1: Add aurora, hover-tint, and overlay-bg variables to `:root`**

In `index.css`, inside the `:root { … }` block, after the `--accent-*` lines (after line 30), insert:

```css
  --aurora-1: oklch(0.72 0.13 285);
  --aurora-2: oklch(0.74 0.10 210);
  --aurora-3: oklch(0.80 0.18 330);

  --hover-tint:  rgba(255,255,255,0.08);
  --overlay-bg:  rgba(7,7,11,0.60);
```

- [ ] **Step 1.2: Update aurora blob CSS classes to use the new variables**

Replace the three `background:` lines in `.ants-aurora .b1`, `.b2`, `.b3` (currently lines 93, 99, 103):

```css
/* .b1 */
background: radial-gradient(circle, var(--aurora-1), transparent 70%);

/* .b2 */
background: radial-gradient(circle, var(--aurora-2), transparent 70%);

/* .b3 */
background: radial-gradient(circle, var(--aurora-3), transparent 70%);
```

- [ ] **Step 1.3: Update `html` to support color-scheme switching**

Replace the `html { … }` block (currently lines 54–59):

```css
html {
  color-scheme: dark;
  font-family: var(--font-sans);
  background: var(--bg-0);
  height: 100%;
}
html[data-theme="light"] {
  color-scheme: light;
}
```

- [ ] **Step 1.4: Add `[data-theme="light"]` token override block**

After the closing `}` of the `:root` block (after line 50), add the entire light-theme variable set:

```css
/* ── LIGHT THEME TOKENS ── */
[data-theme="light"] {
  --bg-0:   #faf7f2;
  --bg-1:   #f3efe8;
  --bg-2:   #ede8df;
  --bg-3:   rgba(0,0,0,0.04);

  --ink-100: rgba(20,15,10,0.90);
  --ink-70:  rgba(20,15,10,0.60);
  --ink-50:  rgba(20,15,10,0.45);
  --ink-30:  rgba(20,15,10,0.22);

  --ink-80:  rgba(20,15,10,0.60);
  --ink-60:  rgba(20,15,10,0.45);
  --ink-40:  rgba(20,15,10,0.22);
  --ink-20:  rgba(20,15,10,0.10);

  --accent-1: oklch(0.52 0.14 285);
  --accent-2: oklch(0.48 0.12 210);
  --accent-3: oklch(0.58 0.16 330);

  --glass-fill:   rgba(255,255,255,0.55);
  --glass-stroke: rgba(0,0,0,0.10);

  --aurora-1: oklch(0.82 0.10 285);
  --aurora-2: oklch(0.85 0.08 210);
  --aurora-3: oklch(0.84 0.10 330);

  --hover-tint:  rgba(0,0,0,0.06);
  --overlay-bg:  rgba(250,247,242,0.75);

  --background: #faf7f2;
  --foreground: rgba(20,15,10,0.90);
  --border: rgba(0,0,0,0.10);
}
```

- [ ] **Step 1.5: Add light-mode class overrides for hardcoded dark values**

Append these rules at the end of `index.css` (after the final responsive `@media` block):

```css
/* ── LIGHT MODE OVERRIDES ── */

[data-theme="light"] body {
  background: var(--bg-0);
  color: var(--ink-100);
}

[data-theme="light"] .ants-aurora .blob {
  opacity: 0.20;
}

[data-theme="light"] .ants-sidebar {
  background: rgba(250,247,242,0.80);
}

[data-theme="light"] .ants-nav-item:hover {
  background: rgba(0,0,0,0.05);
  color: var(--ink-100);
}

[data-theme="light"] .ants-nav-item.active {
  background: oklch(0.52 0.14 285 / 0.12);
}

[data-theme="light"] .ants-nav-badge {
  background: oklch(0.52 0.14 285 / 0.15);
  border-color: oklch(0.52 0.14 285 / 0.25);
}

[data-theme="light"] .ants-nav-kbd,
[data-theme="light"] .ants-hint kbd {
  background: rgba(0,0,0,0.05);
  border-color: rgba(0,0,0,0.08);
}

[data-theme="light"] .ants-icon-btn:hover {
  background: var(--hover-tint);
  color: var(--ink-100);
}

[data-theme="light"] .ants-signout-btn:hover {
  background: var(--hover-tint);
  color: var(--ink-100);
}

[data-theme="light"] .ants-cta-dock {
  background: rgba(243,239,232,0.92);
  box-shadow: 0 20px 60px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.06);
}

[data-theme="light"] .ants-card:hover {
  box-shadow: 0 16px 48px rgba(0,0,0,0.10);
}

[data-theme="light"] .ants-card-status {
  background: rgba(0,0,0,0.04);
  border-color: rgba(0,0,0,0.08);
  color: var(--ink-50);
}

[data-theme="light"] .ants-chip {
  background: rgba(0,0,0,0.05);
  border-color: rgba(0,0,0,0.08);
  color: var(--ink-60);
}

[data-theme="light"] .ants-card-meta {
  border-top-color: rgba(0,0,0,0.08);
}

[data-theme="light"] .ants-module-card:hover {
  border-color: rgba(0,0,0,0.18);
}

[data-theme="light"] .ants-progress-track {
  background: rgba(0,0,0,0.07);
}

[data-theme="light"] .ants-onboard-card {
  background: radial-gradient(120% 80% at 0% 0%, oklch(0.52 0.14 285 / 0.10), transparent 60%),
    linear-gradient(180deg, rgba(255,255,255,0.70), rgba(255,255,255,0.35));
}

[data-theme="light"] ::selection {
  background: oklch(0.52 0.14 285 / 0.25);
}
```

- [ ] **Step 1.6: Verify CSS builds**

```powershell
cd frontend
npm run build
```

Expected: exits 0, no TypeScript or PostCSS errors.

- [ ] **Step 1.7: Commit**

```bash
git add frontend/src/index.css
git commit -m "style: add light theme CSS variable block and aurora vars"
```

---

## Task 2: ThemeContext — localStorage + system preference

**Files:**
- Create: `frontend/src/context/ThemeContext.tsx`

- [ ] **Step 2.1: Create ThemeContext.tsx**

```tsx
import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem('ants-theme') as Theme | null;
    if (stored === 'dark' || stored === 'light') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ants-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
```

- [ ] **Step 2.2: Verify TypeScript compiles**

```powershell
cd frontend
npm run build
```

Expected: exits 0.

- [ ] **Step 2.3: Commit**

```bash
git add frontend/src/context/ThemeContext.tsx
git commit -m "feat: add ThemeContext with localStorage and system-preference fallback"
```

---

## Task 3: ThemeToggle component — sun/moon icon button

**Files:**
- Create: `frontend/src/components/ThemeToggle.tsx`

- [ ] **Step 3.1: Create ThemeToggle.tsx**

```tsx
import { useTheme } from '../context/ThemeContext';

const SunIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4"/>
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
  </svg>
);

const MoonIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      className="ants-icon-btn"
      onClick={toggleTheme}
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
```

- [ ] **Step 3.2: Verify TypeScript compiles**

```powershell
cd frontend
npm run build
```

Expected: exits 0.

- [ ] **Step 3.3: Commit**

```bash
git add frontend/src/components/ThemeToggle.tsx
git commit -m "feat: add ThemeToggle sun/moon icon button component"
```

---

## Task 4: Wire ThemeProvider into main.tsx

**Files:**
- Modify: `frontend/src/main.tsx`

- [ ] **Step 4.1: Update main.tsx to wrap App in ThemeProvider**

Replace the entire content of `frontend/src/main.tsx`:

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { ThemeProvider } from './context/ThemeContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
)
```

- [ ] **Step 4.2: Verify TypeScript compiles**

```powershell
cd frontend
npm run build
```

Expected: exits 0.

- [ ] **Step 4.3: Commit**

```bash
git add frontend/src/main.tsx
git commit -m "feat: wrap App in ThemeProvider"
```

---

## Task 5: Add ThemeToggle to Layout.tsx (learner layout)

**Files:**
- Modify: `frontend/src/components/Layout.tsx`

- [ ] **Step 5.1: Import ThemeToggle and add to topbar**

Add the import after the existing `useAuth` import (line 3):

```tsx
import { ThemeToggle } from './ThemeToggle';
```

In the JSX, find the `.ants-top-actions` div (currently contains the bell button and sign-out button, around line 118). Add `<ThemeToggle />` as the first child:

```tsx
<div className="ants-top-actions">
  <ThemeToggle />
  <button className="ants-icon-btn" title="Notifications">
    <IconBell size={15} /><span className="ants-dot-badge" />
  </button>
  <button className="ants-signout-btn" onClick={handleLogout}>Sign out</button>
</div>
```

- [ ] **Step 5.2: Verify TypeScript compiles**

```powershell
cd frontend
npm run build
```

Expected: exits 0.

- [ ] **Step 5.3: Start dev server and manually verify toggle appears and works**

```powershell
cd frontend
npm run dev
```

Open http://localhost:5173. Log in as a learner. Confirm:
- Sun icon appears in the topbar to the left of the bell
- Clicking it switches the background to warm off-white
- Aurora blobs become soft pastels
- Clicking again returns to dark
- Refreshing the page preserves the last selected theme

- [ ] **Step 5.4: Commit**

```bash
git add frontend/src/components/Layout.tsx
git commit -m "feat: add ThemeToggle to learner layout topbar"
```

---

## Task 6: Add ThemeToggle to AdminLayout.tsx

**Files:**
- Modify: `frontend/src/components/AdminLayout.tsx`

- [ ] **Step 6.1: Import ThemeToggle and add to topbar**

Add import at the top (after line 2):

```tsx
import { ThemeToggle } from './ThemeToggle';
```

Find `.ants-top-actions` (around line 82) and add `<ThemeToggle />` as the first child:

```tsx
<div className="ants-top-actions">
  <ThemeToggle />
  <button className="ants-icon-btn" title="Notifications">
    <IconBell size={15} /><span className="ants-dot-badge" />
  </button>
  <button className="ants-signout-btn" onClick={handleLogout}>Sign out</button>
</div>
```

- [ ] **Step 6.2: Verify TypeScript compiles**

```powershell
cd frontend
npm run build
```

Expected: exits 0.

- [ ] **Step 6.3: Commit**

```bash
git add frontend/src/components/AdminLayout.tsx
git commit -m "feat: add ThemeToggle to admin layout topbar"
```

---

## Task 7: Fix LandingPage.tsx — hardcoded aurora + rgba values

**Files:**
- Modify: `frontend/src/pages/LandingPage.tsx`

LandingPage has inline aurora blobs, a hardcoded navbar background, and multiple glass-effect rgba values.

- [ ] **Step 7.1: Replace the three aurora blob backgrounds (lines 11–13)**

Find the aurora `<div>` wrapper and replace each blob's `background` prop:

```tsx
{/* Blob 1 — purple */}
background: 'radial-gradient(circle, var(--aurora-1), transparent 70%)'

{/* Blob 2 — cyan */}
background: 'radial-gradient(circle, var(--aurora-2), transparent 70%)'

{/* Blob 3 — pink */}
background: 'radial-gradient(circle, var(--aurora-3), transparent 70%)'
```

- [ ] **Step 7.2: Fix the sticky navbar background and border (around line 24–25)**

Replace:
```tsx
background: 'rgba(7,7,11,0.7)',
borderBottom: '1px solid rgba(255,255,255,0.06)',
```
With:
```tsx
background: 'color-mix(in srgb, var(--bg-0) 80%, transparent)',
borderBottom: '1px solid var(--glass-stroke)',
```

- [ ] **Step 7.3: Fix Sign In button default + hover states (around line 46–48)**

Replace the Sign In button style and handlers:

```tsx
<button
  onClick={() => navigate('/login')}
  style={{
    fontSize: 13.5, fontWeight: 500, color: 'var(--ink-80)',
    padding: '8px 20px', borderRadius: 10,
    border: '1px solid var(--glass-stroke)',
    background: 'var(--glass-fill)',
    cursor: 'pointer', transition: 'background 0.15s, color 0.15s',
  }}
  onMouseEnter={e => { e.currentTarget.style.background = 'var(--hover-tint)'; e.currentTarget.style.color = 'var(--ink-100)'; }}
  onMouseLeave={e => { e.currentTarget.style.background = 'var(--glass-fill)'; e.currentTarget.style.color = 'var(--ink-80)'; }}
>Sign In</button>
```

- [ ] **Step 7.4: Fix hero badge glass background + border (around line 64)**

Replace:
```tsx
background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(8px)'
border: '1px solid rgba(255,255,255,0.1)',
```
With:
```tsx
background: 'var(--glass-fill)', backdropFilter: 'blur(8px)'
border: '1px solid var(--glass-stroke)',
```

- [ ] **Step 7.5: Fix stats row cards (around line 99)**

Replace:
```tsx
background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
```
With:
```tsx
background: 'var(--glass-fill)', border: '1px solid var(--glass-stroke)',
```

- [ ] **Step 7.6: Fix "View Programme" button (around line 120–122)**

Replace the button style and handlers:

```tsx
<button
  onClick={() => window.location.href = '/programme-overview'}
  style={{
    display: 'flex', alignItems: 'center', gap: 9,
    fontSize: 14.5, fontWeight: 500, color: 'var(--ink-80)',
    padding: '13px 28px', borderRadius: 12,
    border: '1px solid var(--glass-stroke)',
    background: 'var(--glass-fill)',
    cursor: 'pointer', transition: 'background 0.15s, color 0.15s, border-color 0.15s',
  }}
  onMouseEnter={e => { e.currentTarget.style.background = 'var(--hover-tint)'; e.currentTarget.style.color = 'var(--ink-100)'; }}
  onMouseLeave={e => { e.currentTarget.style.background = 'var(--glass-fill)'; e.currentTarget.style.color = 'var(--ink-80)'; }}
>
  View Programme Overview
</button>
```

- [ ] **Step 7.7: Fix timeline section glass card (around line 131)**

Replace:
```tsx
background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
```
With:
```tsx
background: 'var(--glass-fill)', border: '1px solid var(--glass-stroke)',
```

Also fix the timeline progress track (around line 145):
```tsx
background: 'rgba(255,255,255,0.07)'
```
→ `background: 'var(--glass-stroke)'`

- [ ] **Step 7.8: Verify TypeScript compiles**

```powershell
cd frontend
npm run build
```

Expected: exits 0.

- [ ] **Step 7.9: Commit**

```bash
git add frontend/src/pages/LandingPage.tsx
git commit -m "style(landing): replace hardcoded aurora + rgba values with CSS variables"
```

---

## Task 8: Fix LoginPage.tsx and RegisterPage.tsx — aurora blobs + input styles

**Files:**
- Modify: `frontend/src/pages/LoginPage.tsx`
- Modify: `frontend/src/pages/RegisterPage.tsx`

Both files share the same patterns.

- [ ] **Step 8.1: Fix LoginPage.tsx — aurora blob backgrounds (lines 56–57)**

Replace the two aurora blob `background` props:

```tsx
{/* Blob 1 */}
background: 'radial-gradient(circle, var(--aurora-1), transparent 70%)'

{/* Blob 2 */}
background: 'radial-gradient(circle, var(--aurora-2), transparent 70%)'
```

- [ ] **Step 8.2: Fix LoginPage.tsx — inputStyle and inputErrorStyle (lines 9–16)**

Replace the two style objects:

```tsx
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '11px 14px', borderRadius: 10,
  background: 'var(--glass-fill)', border: '1px solid var(--glass-stroke)',
  color: 'var(--ink-100)', fontSize: 14, outline: 'none',
  transition: 'border-color 0.15s',
  fontFamily: 'var(--font-sans)',
};
const inputErrorStyle: React.CSSProperties = { ...inputStyle, borderColor: 'oklch(0.72 0.18 25)' };
```

- [ ] **Step 8.3: Fix RegisterPage.tsx — aurora blob backgrounds (lines 48–49)**

Replace the two aurora blob `background` props:

```tsx
{/* Blob 1 */}
background: 'radial-gradient(circle, var(--aurora-3), transparent 70%)'

{/* Blob 2 */}
background: 'radial-gradient(circle, var(--aurora-2), transparent 70%)'
```

- [ ] **Step 8.4: Fix RegisterPage.tsx — inputStyle and inputErrorStyle (lines 9–15)**

Same replacement as Step 8.2:

```tsx
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '11px 14px', borderRadius: 10,
  background: 'var(--glass-fill)', border: '1px solid var(--glass-stroke)',
  color: 'var(--ink-100)', fontSize: 14, outline: 'none',
  transition: 'border-color 0.15s', fontFamily: 'var(--font-sans)',
};
const inputErrorStyle: React.CSSProperties = { ...inputStyle, borderColor: 'oklch(0.72 0.18 25)' };
```

- [ ] **Step 8.5: Verify TypeScript compiles**

```powershell
cd frontend
npm run build
```

Expected: exits 0.

- [ ] **Step 8.6: Commit**

```bash
git add frontend/src/pages/LoginPage.tsx frontend/src/pages/RegisterPage.tsx
git commit -m "style(auth): replace hardcoded aurora blobs and input rgba values"
```

---

## Task 9: Fix Sidebar.tsx — replace Tailwind slate/sky classes with CSS variables

**Files:**
- Modify: `frontend/src/components/Sidebar.tsx`

- [ ] **Step 9.1: Replace Tailwind color classes with CSS variable inline styles**

Replace the entire `Sidebar.tsx` content:

```tsx
import { NavLink } from 'react-router-dom';

interface SidebarItem {
  label: string;
  to: string;
}

interface SidebarProps {
  items: SidebarItem[];
}

export function Sidebar({ items }: SidebarProps) {
  return (
    <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            borderRadius: 14,
            padding: '10px 16px',
            fontSize: 13,
            fontWeight: 500,
            textDecoration: 'none',
            color: isActive ? 'var(--accent-2)' : 'var(--ink-100)',
            background: isActive ? 'var(--bg-2)' : 'transparent',
            transition: 'background 0.15s, color 0.15s',
          })}
          onMouseEnter={(e) => {
            if (!(e.currentTarget as HTMLAnchorElement).classList.contains('active')) {
              (e.currentTarget as HTMLAnchorElement).style.background = 'var(--bg-2)';
            }
          }}
          onMouseLeave={(e) => {
            if (!(e.currentTarget as HTMLAnchorElement).classList.contains('active')) {
              (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
            }
          }}
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
```

Note: The `cn()` import is removed since it's no longer used. The `isActive` check via className is replaced by the `style` function prop which NavLink provides for inline style computation.

- [ ] **Step 9.2: Verify TypeScript compiles**

```powershell
cd frontend
npm run build
```

Expected: exits 0.

- [ ] **Step 9.3: Commit**

```bash
git add frontend/src/components/Sidebar.tsx
git commit -m "style(sidebar): replace Tailwind slate/sky classes with CSS variable inline styles"
```

---

## Task 10: Fix AdminDashboard.tsx — theme-aware style object

**Files:**
- Modify: `frontend/src/pages/AdminDashboard.tsx`

AdminDashboard uses extensive inline styles with hardcoded `rgba(255,255,255,*)` and `rgba(7,7,11,*)` values. We use `useTheme()` to create a `th` (theme styles) lookup object at the top of the component, then replace each hardcoded value with the corresponding `th.*` property.

- [ ] **Step 10.1: Add `useTheme` import to AdminDashboard.tsx**

After the existing imports at the top of the file (after the last `import` line), add:

```tsx
import { useTheme } from '../context/ThemeContext';
```

- [ ] **Step 10.2: Add the `th` style object inside the component**

Inside the `AdminDashboard` function body, after the existing `useState`/`useEffect`/`useMemo` declarations, add:

```tsx
const { theme } = useTheme();
const isLight = theme === 'light';

const th = {
  glassFill:    isLight ? 'rgba(0,0,0,0.04)'           : 'rgba(255,255,255,0.04)',
  glassFill2:   isLight ? 'rgba(0,0,0,0.05)'           : 'rgba(255,255,255,0.05)',
  glassFill3:   isLight ? 'rgba(0,0,0,0.06)'           : 'rgba(255,255,255,0.06)',
  glassStroke:  isLight ? 'rgba(0,0,0,0.10)'           : 'rgba(255,255,255,0.09)',
  glassStroke2: isLight ? 'rgba(0,0,0,0.13)'           : 'rgba(255,255,255,0.12)',
  glassStroke3: isLight ? 'rgba(0,0,0,0.15)'           : 'rgba(255,255,255,0.14)',
  hoverBg:      isLight ? 'rgba(0,0,0,0.05)'           : 'rgba(255,255,255,0.05)',
  hoverBg2:     isLight ? 'rgba(0,0,0,0.07)'           : 'rgba(255,255,255,0.08)',
  rowHover:     isLight ? 'rgba(0,0,0,0.03)'           : 'rgba(255,255,255,0.03)',
  progressTrack:isLight ? 'rgba(0,0,0,0.07)'           : 'rgba(255,255,255,0.08)',
  dropdownBg:   isLight ? '#f3efe8'                    : '#16161e',
  panelBg:      isLight ? '#ede8df'                    : '#0e0e14',
  overlayBg:    isLight ? 'rgba(250,247,242,0.70)'     : 'rgba(7,7,11,0.6)',
  selectedRow:  isLight ? 'rgba(0,0,0,0.05)'           : 'rgba(255,255,255,0.05)',
} as const;
```

- [ ] **Step 10.3: Replace hardcoded rgba values throughout AdminDashboard.tsx**

Do a search-and-replace pass. Each replacement uses the `th.*` property from the object above. Key replacements (line references are approximate — use the exact string to find them):

| Find | Replace with |
|---|---|
| `'rgba(255,255,255,.06)'` (filter bar bg) | `th.glassFill3` |
| `'rgba(255,255,255,.12)'` (filter bar border) | `th.glassStroke2` |
| `'#16161e'` (dropdown bg) | `th.dropdownBg` |
| `'rgba(255,255,255,.14)'` (dropdown border) | `th.glassStroke3` |
| `'rgba(255,255,255,.08)'` (selected item in dropdown) | `th.hoverBg2` |
| `'rgba(255,255,255,.05)'` (dropdown hover) | `th.hoverBg` |
| `'rgba(255,255,255,.08)'` (progress bar track) | `th.progressTrack` |
| `'rgba(7,7,11,.6)'` (overlay bg) | `th.overlayBg` |
| `'#0e0e14'` (drill-down panel bg) | `th.panelBg` |
| `'rgba(255,255,255,.1)'` (panel border) | `th.glassStroke2` |
| `'rgba(255,255,255,.08)'` (panel section borders) | `th.glassStroke` |
| `'rgba(255,255,255,.05)'` (pill/badge bg) | `th.glassFill2` |
| `'rgba(255,255,255,0.04)'` (not_started state bg) | `th.glassFill` |
| `'rgba(255,255,255,.03)'` (card/row bg) | `th.rowHover` |
| `'rgba(255,255,255,.07)'` (card border) | `th.glassStroke` |
| `'rgba(255,255,255,0.05)'` (nudge/export btn bg) | `th.glassFill2` |
| `'rgba(255,255,255,0.12)'` (nudge/export btn border) | `th.glassStroke2` |
| hover `'rgba(255,255,255,.1)'` | `th.hoverBg2` |
| hover reset `'rgba(255,255,255,.05)'` | `th.hoverBg` |
| `'rgba(255,255,255,.04)'` (pagination btn bg) | `th.glassFill` |
| `'rgba(255,255,255,.12)'` (pagination active border) | `th.glassStroke2` |
| row border `'rgba(255,255,255,.08)'` | `th.glassStroke` |
| row border `'rgba(255,255,255,.06)'` | `th.glassFill3` |
| row hover `'rgba(255,255,255,.03)'` | `th.rowHover` |
| module card bg `'rgba(255,255,255,.03)'` | `th.rowHover` |
| module card border `'rgba(255,255,255,.07)'` | `th.glassStroke` |
| tab badge bg `'rgba(255,255,255,.06)'` | `th.glassFill3` |

Also replace the `not_started` color tuple in the progress state map (uses `'rgba(255,255,255,.04)'` as the second element) with `th.glassFill`.

For `onMouseEnter`/`onMouseLeave` handlers that currently set `'rgba(255,255,255,.1)'` on hover and reset to a static rgba, update to:
```tsx
onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = th.hoverBg2; }}
onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = th.hoverBg; }}
```

And for row hover:
```tsx
onMouseEnter={e => (e.currentTarget.style.background = th.rowHover)}
onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
```

- [ ] **Step 10.4: Verify TypeScript compiles**

```powershell
cd frontend
npm run build
```

Expected: exits 0.

- [ ] **Step 10.5: Start dev server and verify admin dashboard in both modes**

```powershell
cd frontend
npm run dev
```

Log in as admin at http://localhost:5173/admin. Verify:
- Light mode: all cards, tables, drill-down panel, dropdown appear warm off-white (not harsh white or stuck dark)
- Dark mode: all original dark styles restored
- Risk badges (red/yellow/green) remain correct in both modes
- Drill-down panel opens correctly in both modes

- [ ] **Step 10.6: Commit**

```bash
git add frontend/src/pages/AdminDashboard.tsx
git commit -m "style(admin): replace hardcoded rgba values with theme-aware style object"
```

---

## Task 11: Fix ProgrammeOverview.tsx — hardcoded rgba + navbar

**Files:**
- Modify: `frontend/src/pages/ProgrammeOverview.tsx`

- [ ] **Step 11.1: Fix sticky navbar background and border (around lines 380–381)**

Replace:
```tsx
background: 'rgba(7,7,11,0.7)', backdropFilter: 'blur(16px)',
borderBottom: '1px solid rgba(255,255,255,0.07)',
```
With:
```tsx
background: 'color-mix(in srgb, var(--bg-0) 80%, transparent)', backdropFilter: 'blur(16px)',
borderBottom: '1px solid var(--glass-stroke)',
```

- [ ] **Step 11.2: Fix glass card backgrounds and borders throughout**

Replace the following patterns (use the exact string to locate each):

| Find | Replace |
|---|---|
| `border: '1px solid rgba(255,255,255,0.08)'` (line 59 context) | `border: '1px solid var(--glass-stroke)'` |
| `'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)'` | `'linear-gradient(135deg, var(--glass-fill) 0%, rgba(0,0,0,0) 100%)'` |
| `border: '1px solid rgba(255,255,255,0.09)'` (line 74) | `border: '1px solid var(--glass-stroke)'` |
| `background: 'rgba(255,255,255,.04)'` (neutral item) | `background: 'var(--glass-fill)'` |
| `border: '1px solid rgba(255,255,255,.09)'` (neutral item border) | `border: '1px solid var(--glass-stroke)'` |
| `borderTop: '1px solid rgba(255,255,255,.07)'` | `borderTop: '1px solid var(--glass-stroke)'` |
| `background: 'rgba(255,255,255,0.03)'` (tier card) | `background: 'var(--glass-fill)'` |
| `border: '1px solid rgba(255,255,255,0.07)'` (tier card) | `border: '1px solid var(--glass-stroke)'` |
| `background: 'rgba(255,255,255,0.05)'` (course count badge) | `background: 'var(--glass-fill)'` |
| `border: '1px solid rgba(255,255,255,0.08)'` (course count badge) | `border: '1px solid var(--glass-stroke)'` |
| `background: 'rgba(255,255,255,0.06)'` (tag chip) | `background: 'var(--glass-fill)'` |
| `border: '1px solid rgba(255,255,255,0.1)'` (tag chip) | `border: '1px solid var(--glass-stroke)'` |
| `border: 'none'` + `border: '1px solid rgba(255,255,255,0.12)'` (close btn, line 399) | keep `border: 'none'` for the none case; replace stroke with `var(--glass-stroke)` |
| `background: 'rgba(255,255,255,0.07)'` (close btn default, line 411) | `background: 'var(--glass-fill)'` |
| `border: '1px solid rgba(255,255,255,0.15)'` (close btn) | `border: '1px solid var(--glass-stroke)'` |
| hover `'rgba(255,255,255,0.12)'` (close btn, line 415) | `'var(--hover-tint)'` |
| hover reset `'rgba(255,255,255,0.07)'` (line 416) | `'var(--glass-fill)'` |

- [ ] **Step 11.3: Verify TypeScript compiles**

```powershell
cd frontend
npm run build
```

Expected: exits 0.

- [ ] **Step 11.4: Start dev server and verify Programme Overview in both modes**

```powershell
cd frontend
npm run dev
```

Navigate to http://localhost:5173/programme-overview. Verify all cards, tiers, and the sticky navbar switch cleanly between dark and light.

- [ ] **Step 11.5: Commit**

```bash
git add frontend/src/pages/ProgrammeOverview.tsx
git commit -m "style(overview): replace hardcoded rgba and aurora values with CSS variables"
```

---

## Task 12: Spot-check RoadmapPage.tsx inline rgba values

**Files:**
- Modify: `frontend/src/pages/RoadmapPage.tsx` (if hardcoded rgba found)

RoadmapPage's `.ants-module-card` class-based styles are already covered by Task 1.5 CSS overrides. This task handles any remaining inline rgba values.

- [ ] **Step 12.1: Search for hardcoded rgba in RoadmapPage.tsx**

```powershell
Select-String -Path "frontend\src\pages\RoadmapPage.tsx" -Pattern "rgba\(255,255,255|rgba\(7,7,11" | Select-Object LineNumber, Line
```

- [ ] **Step 12.2: Replace any found rgba values**

For each match, apply the same patterns used in earlier tasks:
- `rgba(255,255,255,*)` background → `var(--glass-fill)`  
- `rgba(255,255,255,*)` border → `var(--glass-stroke)`  
- `rgba(255,255,255,0.08+)` hover → `var(--hover-tint)`  
- `rgba(7,7,11,*)` background → `color-mix(in srgb, var(--bg-0) 80%, transparent)`  

If the search returns no matches, skip to Step 12.3.

- [ ] **Step 12.3: Verify TypeScript compiles**

```powershell
cd frontend
npm run build
```

Expected: exits 0.

- [ ] **Step 12.4: Commit (only if changes were made)**

```bash
git add frontend/src/pages/RoadmapPage.tsx
git commit -m "style(roadmap): replace remaining hardcoded rgba values with CSS variables"
```

---

## Final Verification

- [ ] **Run production build**

```powershell
cd frontend
npm run build
```

Expected: exits 0 with no TypeScript errors.

- [ ] **Smoke test all routes in both modes**

Start dev server (`npm run dev`). Toggle to light mode, then visit:
1. `/` — Landing page: aurora pastels visible, navbar warm, all buttons readable
2. `/login` — Card on warm background, inputs readable
3. `/register` — Same as login
4. `/select-profile` — Profile cards readable, glass sidebar visible
5. `/roadmap` — Module cards, sliders, and progress bars readable
6. `/admin` — Table, drill-down, dropdown all work; risk badges unchanged
7. `/programme-overview` — Tier cards and close button readable

Refresh on each page to confirm localStorage persistence. Open an incognito window set to light-mode OS preference to confirm system preference detection on first visit.

- [ ] **Final commit**

```bash
git add -A
git commit -m "feat: complete dark/light mode toggle with warm off-white light theme"
```
