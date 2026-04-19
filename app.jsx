function BlobBG({ showStars }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (window.matchMedia && window.matchMedia("(pointer: coarse)").matches) return;
    const onMove = (e) => {
      const el = ref.current; if (!el) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      el.querySelectorAll(".blob").forEach((b, i) => {
        const k = (i + 1) * 30;
        b.style.translate = `${x * k}px ${y * k}px`;
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
      <div className="blob ring" />
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

// Brand collabs (marquee que reemplaza manifesto)
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
      <Tweaks values={values} setValues={setValues} />
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
