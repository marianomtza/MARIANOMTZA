function BlobBG({ showStars }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (window.matchMedia && window.matchMedia("(pointer: coarse)").matches) return;
    const onMove = (e) => {
      const el = ref.current; if (!el) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      el.querySelectorAll(".blob").forEach((b, i) => {
        const k = (i + 1) * 28;
        b.style.translate = `${x * k}px ${y * k}px`;
      });
      // Subtle parallax on geo objects
      el.querySelectorAll(".geo-obj").forEach((g, i) => {
        const k = (i + 1) * 12;
        g.style.translate = `${x * k}px ${y * k}px`;
      });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);
  return (
    <div className="blob-bg" ref={ref}>
      {showStars && <div className="stars" />}
      <div className="blob b1" />
      <div className="blob b2" />
      <div className="blob b3" />
      <div className="blob b4" />
      <div className="blob ring" />
      {/* 3D geometric objects */}
      <div className="geo-obj cube" />
      <div className="geo-obj tri" />
      <div className="geo-obj diamond" />
      <div className="geo-obj ring2" />
      <div className="geo-obj dots" />
    </div>
  );
}

// Mini color palette picker — always visible bottom-left
const PALETTE = [
  { name: "Deep Violet", v: "#7c3aed", soft: "#6d28d9", deep: "#5b21b6" },
  { name: "Lila",        v: "#a855f7", soft: "#7c3aed", deep: "#4c1d95" },
  { name: "Violeta",     v: "#9b5fd6", soft: "#6b3fa8", deep: "#3d1d6e" },
  { name: "Magenta",     v: "#d946ef", soft: "#a21caf", deep: "#701a75" },
  { name: "Cian",        v: "#22d3ee", soft: "#0891b2", deep: "#164e63" },
];

function ColorPalette({ values, setValues }) {
  const update = (c) => {
    const next = { ...values, accent: c.v, accentSoft: c.soft, accentDeep: c.deep };
    setValues(next);
    const r = document.documentElement;
    r.style.setProperty("--accent", c.v);
    r.style.setProperty("--accent-soft", c.soft);
    r.style.setProperty("--accent-deep", c.deep);
  };
  return (
    <div className="color-palette-btn" aria-label="Cambiar color">
      {PALETTE.map(c => (
        <button
          key={c.v}
          className={`cp-dot ${values.accent === c.v ? "active" : ""}`}
          style={{ background: c.v }}
          title={c.name}
          onClick={() => update(c)}
        />
      ))}
    </div>
  );
}

function useReveal() {
  React.useEffect(() => {
    const els = document.querySelectorAll(".reveal, .reveal-stagger");
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("in"); });
    }, { threshold: 0.12 });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  });
}

function useMagnetic() {
  React.useEffect(() => {
    if (window.matchMedia && window.matchMedia("(pointer: coarse)").matches) return;
    const els = document.querySelectorAll(".magnetic");
    const handlers = [];
    els.forEach(el => {
      const move = (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${x * 0.22}px, ${y * 0.22}px)`;
      };
      const leave = () => { el.style.transform = ""; };
      el.addEventListener("mousemove", move);
      el.addEventListener("mouseleave", leave);
      handlers.push([el, move, leave]);
    });
    return () => handlers.forEach(([el, m, l]) => { el.removeEventListener("mousemove", m); el.removeEventListener("mouseleave", l); });
  });
}

// Colectivos (marquee top)
const COLLECTIVES = [
  { name: "SEKS",     href: "https://www.instagram.com/seks.gratis/" },
  { name: "LUDBOY",   href: "https://www.ludboy.com/" },
  { name: "KNOCKOUT", href: "https://www.instagram.com/knockout.fm/" },
  { name: "LA FAMA",  href: "https://www.instagram.com/es.lafama/" }
];

// Brand collabs (marquee)
const BRANDS = [
  { name: "Spotify" },
  { name: "Hennessy" },
  { name: "Bacardí" },
  { name: "Zacapa" },
  { name: "Four Loko" },
  { name: "Zyn" },
  { name: "Hypnotiq" },
  { name: "Mezcal Verde" },
  { name: "Viuda de Romero" }
];

// Vercel Speed Insights wrapper component
function SpeedInsightsWrapper() {
  React.useEffect(() => {
    // Initialize Speed Insights script
    window.si = window.si || function () { (window.siq = window.siq || []).push(arguments); };
    
    // Inject the Speed Insights script
    const script = document.createElement('script');
    script.defer = true;
    script.src = '/_vercel/speed-insights/script.js';
    document.head.appendChild(script);
    
    return () => {
      // Cleanup on unmount (though this rarely unmounts)
      const existingScript = document.querySelector('script[src="/_vercel/speed-insights/script.js"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);
  
  return null;
}

function App() {
  const [values, setValues] = React.useState(window.TWEAK_DEFAULTS);
  const [loaded, setLoaded] = React.useState(false);
  const audio = useAudio();

  React.useEffect(() => {
    const r = document.documentElement;
    r.style.setProperty("--accent", values.accent);
    if (values.accentSoft) r.style.setProperty("--accent-soft", values.accentSoft);
    if (values.accentDeep) r.style.setProperty("--accent-deep", values.accentDeep);
    document.body.classList.toggle("no-motion", !values.motion);
    document.body.classList.toggle("no-grain", !values.grain);
    document.body.style.cursor = values.cursor ? "none" : "auto";
  }, [values]);

  useReveal();
  useMagnetic();

  return (
    <>
      {!loaded && <Loader onDone={() => setLoaded(true)} />}
      {values.cursor && <Cursor />}
      {values.grain && <div className="grain" />}
      <div className="vignette" />
      <BlobBG showStars={values.stars} />
      <div className="content">
        <Nav audio={audio} />
        <Hero audio={audio} />
        <Band items={COLLECTIVES} label="Colectivos" />
        <Stats />
        <Events audio={audio} />
        <Band items={BRANDS} reverse label="Colaboraciones con marcas" />
        <Roster audio={audio} />
        <Booking audio={audio} />
        <Footer />
      </div>
      <EasterEggs audio={audio} />
      <ColorPalette values={values} setValues={setValues} />
      <Tweaks values={values} setValues={setValues} />
      <SpeedInsightsWrapper />
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
