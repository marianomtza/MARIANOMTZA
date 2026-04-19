function Loader({ onDone }) {
  const [p, setP] = React.useState(0);
  const [gone, setGone] = React.useState(false);

  React.useEffect(() => {
    let cur = 0;
    const id = setInterval(() => {
      cur = Math.min(100, cur + Math.random() * 18 + 4);
      setP(Math.floor(cur));
      if (cur >= 100) {
        clearInterval(id);
        setTimeout(() => { setGone(true); setTimeout(onDone, 1000); }, 400);
      }
    }, 140);
    return () => clearInterval(id);
  }, [onDone]);

  return (
    <div className={`loader ${gone ? "done" : ""}`} style={{ "--p": p / 100 }}>
      <div className="loader-top">
        <span>Mariano Martínez</span>
        <span>CDMX · MX</span>
      </div>
      <div className="loader-center">
        <span className="loader-count">{String(p).padStart(3, "0")}<span className="pct">%</span></span>
      </div>
      <div className="loader-bottom">
        <span>Cargando</span>
        <div className="loader-bar" />
        <span>Noche en construcción</span>
      </div>
    </div>
  );
}
Object.assign(window, { Loader });
