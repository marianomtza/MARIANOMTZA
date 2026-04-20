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
      <div className="geo-obj cube" />
      <div className="geo-obj tri" />
      <div className="geo-obj diamond" />
      <div className="geo-obj ring2" />
      <div className="geo-obj dots" />
    </div>
  );
}

function App() {
  const [loaded, setLoaded] = React.useState(false);
  
  return (
    <>
      {!loaded && <Loader onDone={() => setLoaded(true)} />}
      {loaded && (
        <>
          <Nav audio={null} />
          <Hero audio={null} />
          <Band items={[
            { name: "SEKS", href: "https://www.instagram.com/seks.gratis/" },
            { name: "LUDBOY", href: "https://www.ludboy.com/" },
            { name: "KNOCKOUT", href: "https://www.instagram.com/knockout.fm/" },
            { name: "LA FAMA", href: "https://www.instagram.com/es.lafama/" }
          ]} label="Colectivos" />
          <Stats />
          <Band items={[
            { name: "Spotify" },
            { name: "Hennessy" },
            { name: "Bacardí" },
            { name: "Zacapa" }
          ]} reverse label="Marcas" />
          <Footer audio={null} />
        </>
      )}
      <div className="grain" />
      <div className="vignette" />
      <BlobBG showStars={true} />
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
