/**
 * QUICK REFERENCE: Integration Snippets
 * Copy-paste ready code for integrating the advanced interactive elements
 */

// ============================================
// SNIPPET 1: Update app.jsx (Main App Component)
// ============================================

/*
// OLD CODE (before):
function App() {
  const [cfg, setCfg] = React.useState(DEFAULT_CONFIG);
  const [vals, setVals] = React.useState(DEFAULT_VALUES);
  const audio = useAudio();  // ← OLD

  useReveal();
  useMagnetic();

  return (
    <>
      <Cursor />  {/* ← OLD */}
      <BlobBG showStars={false} />  {/* ← OLD */}
      <div className="grain" />
      <div className="vignette" />
      <Nav audio={audio} />
      <Hero audio={audio} />
      // ...
    </>
  );
}

// NEW CODE (after):
*/

function App() {
  const [cfg, setCfg] = React.useState(DEFAULT_CONFIG);
  const [vals, setVals] = React.useState(DEFAULT_VALUES);
  const audio = useDrumKit();  // ← NEW: DrumKit instead of useAudio

  useReveal();
  useMagnetic();

  return (
    <>
      <PremiumCursor />           {/* ← NEW: Premium thin cursor */}
      <Background3D showStars={true} />  {/* ← NEW: 3D parallax background */}
      <div className="grain" />
      <div className="vignette" />
      <Nav audio={audio} />
      <Hero audio={audio} />      {/* Now uses PreciseLetterMagnifier internally */}
      <Events audio={audio} />
      <Roster audio={audio} />
      <Booking audio={audio} />
      <Footer />
      <ColorPalette values={vals} setValues={setVals} />
      <EasterEggs audio={audio} />
    </>
  );
}

// ============================================
// SNIPPET 2: Update build.mjs (Component Order)
// ============================================

/*
// In build.mjs, update COMPONENTS array:
*/

const COMPONENTS = [
  "components/audio.jsx",
  "components/DrumKit.jsx",        // ← NEW
  "components/PremiumCursor.jsx",  // ← NEW
  "components/Background3D.jsx",   // ← NEW
  "components/Cursor.jsx",
  "components/Loader.jsx",
  "components/Nav.jsx",
  "components/Hero.jsx",
  // "components/Hero-Updated.jsx",  // ← ALTERNATIVE (replace Hero.jsx)
  "components/Events.jsx",
  "components/Roster.jsx",
  "components/Band.jsx",
  "components/Stats.jsx",
  "components/Contact.jsx",
  "components/Footer.jsx",
  "components/Tweaks.jsx",
  "components/EasterEggs.jsx",
  "components/Analytics.jsx",
];

// ============================================
// SNIPPET 3: CSS Integration (Add to styles.css)
// ============================================

/*
// Option A: Append to existing styles.css
// Option B: Link separately in index.html
// Option C: Import in app.jsx
*/

/* Include all CSS from styles-new.css:

.cursor-premium { ... }
.cursor-premium.cursor-interactive { ... }
.cursor-premium.cursor-text { ... }
.cursor-inner { ... }

.bg-3d-container { ... }
.bg-3d-webgl { ... }
.bg-3d-layers { ... }
.bg-3d-layer { ... }
.bg-3d-layer.layer-1 { ... }
.bg-3d-layer.layer-2 { ... }
.bg-3d-layer.layer-3 { ... }
.bg-3d-stars { ... }

@keyframes float-3d-1 { ... }
@keyframes float-3d-2 { ... }
@keyframes float-3d-3 { ... }
@keyframes twinkle-stars { ... }

.char { will-change: transform, color, text-shadow; }
*/

// ============================================
// SNIPPET 4: Button/Interactive Elements Audio
// ============================================

/*
// For all buttons, links, and interactive elements:
*/

function ExampleButton({ audio }) {
  return (
    <button
      onClick={() => {
        audio?.ensureContext?.();
        audio?.click?.();     // Snare + Kick combination
      }}
      onMouseEnter={() => {
        audio?.ensureContext?.();
        audio?.hover?.();     // Hi-Hat
      }}
      onMouseDown={() => {
        audio?.ensureContext?.();
        audio?.active?.();    // Cowbell (or custom drum)
      }}
    >
      Click Me
    </button>
  );
}

// ============================================
// SNIPPET 5: Custom Audio Events
// ============================================

/*
// For custom interactions:
*/

// Hover effect on any element
onMouseEnter={() => {
  audio?.ensureContext?.();
  audio?.hihat?.(0.6);  // Hi-hat with velocity 0.6
}}

// Click effect
onClick={() => {
  audio?.ensureContext?.();
  audio?.snare?.(0.8);  // Snare with velocity 0.8
  audio?.kick?.(0.6);   // Kick with velocity 0.6
}}

// Scroll trigger
onScroll={() => {
  audio?.ensureContext?.();
  audio?.tom?.(0.7, "high");  // High tom
}}

// Complex sequence
const playDrumSequence = () => {
  audio?.ensureContext?.();
  const drums = [
    () => audio?.kick(0.8),
    () => audio?.snare(0.7),
    () => audio?.hihat(0.5),
    () => audio?.cowbell(0.6),
  ];
  drums.forEach((drum, i) => {
    setTimeout(() => drum(), i * 100);  // Staggered
  });
};

// ============================================
// SNIPPET 6: Hero Component Integration
// ============================================

/*
// Option A: Use Hero-Updated.jsx directly
*/
// Just replace Hero.jsx usage with Hero-Updated.jsx
// (Copy Hero-Updated.jsx content into Hero.jsx)

/*
// Option B: Manual integration into existing Hero.jsx
*/

// Add this hook to existing Hero.jsx:
const magnifiedIdx = PreciseLetterMagnifier({ titleRef, characters: TITLE.split("") });

React.useEffect(() => {
  if (magnifiedIdx !== lastPlayedNoteRef.current) {
    lastPlayedNoteRef.current = magnifiedIdx;

    if (magnifiedIdx >= 0 && audio) {
      audio.ensureContext?.();
      const drumSequence = [
        audio.kick,
        audio.snare,
        audio.hihat,
        audio.tom,
        audio.clap,
        audio.cowbell,
      ];
      const drum = drumSequence[magnifiedIdx % drumSequence.length];
      drum?.(0.7);
    }
  }
}, [magnifiedIdx, audio]);

// Update character rendering:
<span
  className="char piano-char"
  key={i}
  style={{
    transition: "transform 0.2s cubic-bezier(0.22, 1, 0.36, 1), color 0.15s, text-shadow 0.15s",
    willChange: "transform, color, text-shadow",
  }}
>
  {ch}
</span>

// ============================================
// SNIPPET 7: Performance Monitoring
// ============================================

/*
// Add this to monitor FPS and performance:
*/

if (process.env.NODE_ENV === "development") {
  let lastTime = performance.now();
  let frameCount = 0;

  const measureFPS = () => {
    frameCount++;
    const now = performance.now();
    if (now - lastTime >= 1000) {
      console.log(`FPS: ${frameCount}`);
      frameCount = 0;
      lastTime = now;
    }
    requestAnimationFrame(measureFPS);
  };

  requestAnimationFrame(measureFPS);
}

// ============================================
// SNIPPET 8: Mobile Optimization
// ============================================

/*
// In app.jsx or component initialization:
*/

const isMobile = window.matchMedia("(pointer: coarse)").matches;

// Disable expensive features on mobile
const bgProps = isMobile ? { showStars: false } : { showStars: true };

return (
  <>
    {!isMobile && <PremiumCursor />}
    <Background3D {...bgProps} />
    {/* ... rest */}
  </>
);

// ============================================
// SNIPPET 9: Dark Mode Integration
// ============================================

/*
// CSS custom properties (already in your :root):
*/

:root {
  --accent: #7c3aed;
  --fg: #f4f1f7;
  --bg: #0a0610;
}

// Cursor automatically inherits accent color
.cursor-premium {
  background: var(--accent);
}

// Background layers inherit theme
.bg-3d-layer {
  background: radial-gradient(ellipse, var(--accent-soft), transparent);
}

// ============================================
// SNIPPET 10: Testing Audio (Console)
// ============================================

/*
// Paste into browser console to test:
*/

// Test all drums
audio.ensureContext();
audio.kick(0.8);
setTimeout(() => audio.snare(0.8), 200);
setTimeout(() => audio.hihat(0.6), 400);
setTimeout(() => audio.tom(0.7, "high"), 600);
setTimeout(() => audio.clap(0.8), 800);
setTimeout(() => audio.cowbell(0.7), 1000);

// Test with velocity sweep
for (let v = 0.1; v <= 1; v += 0.1) {
  setTimeout(() => audio.kick(v), v * 500);
}

// ============================================
// SNIPPET 11: Accessibility (prefers-reduced-motion)
// ============================================

/*
// CSS automatically handles:
*/

@media (prefers-reduced-motion: reduce) {
  .bg-3d-layer { animation: none; }
  .char { transition: none; }
  .cursor-premium { transition: none; }
}

// ============================================
// SNIPPET 12: Debugging
// ============================================

// Check if components are loaded
console.log("PremiumCursor:", typeof PremiumCursor);  // "function"
console.log("useDrumKit:", typeof useDrumKit);        // "function"
console.log("Background3D:", typeof Background3D);    // "function"

// Check audio context state
audio.ensureContext();
console.log("Audio enabled:", audio.enabled);         // true/false
console.log("Audio context state:", audio.ctx.state); // "running"/"suspended"

// Test cursor movement (should see transform updates)
const cursorEl = document.querySelector(".cursor-premium");
console.log("Cursor element:", cursorEl);
console.log("Cursor transform:", cursorEl?.style.transform);
