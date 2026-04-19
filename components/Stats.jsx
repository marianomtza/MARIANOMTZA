function Stats() {
  // Stats section kept but "La máquina en cifras" title removed as requested
  const ITEMS = [
    { n: "7+",    label: "años produciendo eventos" },
    { n: "55+",   label: "eventos producidos el último año", sub: "festivales · clubes · conciertos" },
    { n: "2000",  label: "cap. promedio por noche" },
    { n: "10+",   label: "artistas trabajando juntos" }
  ];
  return (
    <section className="section stats-section">
      <div className="wrap">
        <div className="stats-grid reveal-stagger">
          {ITEMS.map((it, i) => (
            <div className="stat-card" key={i}>
              <div className="stat-n">{it.n}</div>
              <div className="stat-label">{it.label}</div>
              {it.sub && <div className="stat-sub">{it.sub}</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
Object.assign(window, { Stats });
