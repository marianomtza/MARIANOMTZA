# Immersive Frontend Architecture Blueprint

## 1) System architecture

```text
app/
├─ layout.tsx                       # Global metadata + typography
├─ page.tsx                         # Landing orchestrator
├─ inspiracion/page.tsx             # Standalone creative playground
├─ not-found.tsx                    # 404 mini-game experience
├─ components/
│  ├─ Hero/Eventos/...              # Domain UI sections
│  ├─ inspiracion/CreativeGallery   # Dedicated inspiration UX
│  └─ system/                       # Runtime systems
│     ├─ ThemeSwitcher.tsx
│     ├─ ParticleField.tsx
│     ├─ DraggableStats.tsx
│     └─ ExperienceController.tsx
├─ contexts/
│  ├─ ThemeContext.tsx
│  ├─ ExperienceContext.tsx
│  └─ BookingContext.tsx
├─ hooks/
│  ├─ useScrollEngine.ts
│  ├─ useAnimationLoop.ts
│  └─ useKonamiCode.ts
└─ lib/
   ├─ design-tokens.ts
   └─ audio-manager.ts
```

### Naming conventions
- Components: `PascalCase` (`DraggableStats`).
- Hooks: `useX` (`useScrollEngine`).
- Runtime services: kebab case (`audio-manager.ts`).
- Theme tokens: CSS variable names (`--accent`, `--bg-elevated`).

### Extensibility strategy
- Add new game modules in `components/system` with dedicated hook + context state.
- Keep animation engine stateless with `useAnimationLoop` for new particle or WebGL scenes.
- Extend themes by appending `ThemeName` + `themeTokens` record.

## 2) Routing & page structure
- `/`: Landing narrative + hero, events, booking, draggable stats.
- `/inspiracion`: Separate exploratory route with gallery cards and ambient particles.
- `not-found`: Lightweight keyboard mini-game (offline-capable, no external assets).

## 3) Design system tokens
- Typography:
  - Display: **Bungee** (`--font-display`)
  - Body/UI: **Bricolage Grotesque** (`--font-body`)
- Themes:
  - `light`, `dark`, `neon`, `minimal`, `experimental`
- Spacing scale in `design-tokens.ts` for consistent rhythm.

## 4) Scroll & motion engine
- `useScrollEngine` abstracts Lenis lifecycle and animation frame orchestration.
- `ParticleField` uses `requestAnimationFrame` via `useAnimationLoop`.
- Story sections rely on `whileInView` for performant scroll triggers.

## 5) Animation engine rules
- Canvas particles only redraw in one RAF loop.
- Transforms use opacity/translate/scale (GPU-friendly).
- Avoid layout thrash by updating refs rather than reflow-heavy DOM reads in loops.

## 6) Responsive strategy
- `clamp`-based type (`.fluid-title`) to keep marquee text stable.
- `.no-break-title` prevents “marianomtza” from splitting.
- Fluid grid layouts on inspiration gallery cards.

## 7) Gamification & hidden systems
- **Konami code** (`useKonamiCode`): increments secrets + confetti.
- **Delayed loader** (`ExperienceController`): unlocks Web Audio context via user click.
- **Console quest**: exposes `window.marianomtza` commands.
- **404 mini-game**: jump over obstacles with spacebar.
- **Draggable stats module**: tactile, playful data interaction.

## 8) Audio system
- `audio-manager.ts` uses Web Audio API only.
- Event-based cues (`hover`, `success`, `secret`).
- Playback is strictly user-initiated (`unlock()`).

## 9) Performance trade-offs
- Canvas particles are lightweight but should remain low-count on mobile.
- Lenis smoothing improves feel; disable through reduced motion if needed.
- Keep 404 game intentionally simple to preserve quick first paint.

## 10) Accessibility
- `aria-label` on icon-like controls.
- Reduced-motion media query for users with motion sensitivity.
- Keyboard-friendly interaction for secret/game routes.
