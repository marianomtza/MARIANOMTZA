function Roster({ audio }) {
  // 10 artistas — placeholders en social hasta que pases links reales
  // Para activar un link: cambia `null` por la URL.
  const ROSTER = [
    { n: "01", name: "3DELINCUENTES", spotify: null, apple: null, ig: null, photo: null },
    { n: "02", name: "RUZZO DOBLEZZ", spotify: null, apple: null, ig: null, photo: null },
    { n: "03", name: "8.AM",          spotify: null, apple: null, ig: null, photo: null },
    { n: "04", name: "MORROW",        spotify: null, apple: null, ig: null, photo: null },
    { n: "05", name: "BBBARTEX",      spotify: null, apple: null, ig: null, photo: null },
    { n: "06", name: "LEGORRETA",     spotify: null, apple: null, ig: null, photo: null },
    { n: "07", name: "TBX",           spotify: null, apple: null, ig: null, photo: null },
    { n: "08", name: "NZO",           spotify: null, apple: null, ig: null, photo: null },
    { n: "09", name: "ELAKKKA",       spotify: null, apple: null, ig: null, photo: null },
    { n: "10", name: "MOODJAAS",      spotify: null, apple: null, ig: null, photo: null }
  ];

  const [active, setActive] = React.useState(null);

  const onMove = (e) => {
    const card = e.currentTarget;
    const r = card.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    const rx = ((y / r.height) - 0.5) * -8;
    const ry = ((x / r.width) - 0.5) * 8;
    card.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
    card.style.setProperty("--mx", `${(x / r.width) * 100}%`);
    card.style.setProperty("--my", `${(y / r.height) * 100}%`);
  };
  const onLeave = (e) => { e.currentTarget.style.transform = ""; };

  React.useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") setActive(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  React.useEffect(() => {
    document.body.style.overflow = active !== null ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [active]);

  const initials = (name) => {
    const parts = name.replace(/[^A-Za-z0-9 ]/g, "").trim().split(/\s+/);
    return ((parts[0]?.[0] || "") + (parts[1]?.[0] || parts[0]?.[1] || "")).toUpperCase();
  };

  return (
    <section className="section" id="roster">
      <div className="wrap">
        <div className="section-intro reveal-stagger">
          <div className="side">06 — Roster</div>
          <h2 className="section-h">Artistas que <span className="ital">trabajo</span>.</h2>
        </div>
        <div className="roster-grid reveal-stagger">
          {ROSTER.map((a, i) => (
            <button
              type="button"
              className="roster-card"
              key={a.n}
              onMouseMove={onMove}
              onMouseLeave={onLeave}
              onClick={() => { audio?.click(); setActive(i); }}
              aria-label={`Ver ${a.name}`}
            >
              <div className="idx">{a.n}</div>
              <div className="circle">
                <svg width="10" height="10" viewBox="0 0 14 14" fill="none"><path d="M1 13L13 1M13 1H4M13 1v9" stroke="currentColor" strokeWidth="1.2"/></svg>
              </div>
              <div className="name">{a.name}</div>
            </button>
          ))}
        </div>
      </div>

      {active !== null && (
        <ArtistModal
          artist={ROSTER[active]}
          initials={initials(ROSTER[active].name)}
          onClose={() => setActive(null)}
          audio={audio}
        />
      )}
    </section>
  );
}

function ArtistModal({ artist, initials, onClose, audio }) {
  const a = artist;
  const has = (v) => v && typeof v === "string";

  return (
    <div className="artist-modal" onClick={onClose} role="dialog" aria-modal="true">
      <div className="artist-modal-panel" onClick={(e) => e.stopPropagation()}>
        <button className="artist-modal-close" onClick={onClose} aria-label="Cerrar">×</button>

        <div className="artist-modal-photo">
          {has(a.photo) ? (
            <img src={a.photo} alt={a.name} />
          ) : (
            <div className="artist-photo-placeholder">{initials}</div>
          )}
        </div>

        <div className="artist-modal-info">
          <div className="artist-modal-eyebrow">{a.n} · Roster</div>
          <h3 className="artist-modal-name">{a.name}</h3>

          <div className="artist-modal-actions">
            <a
              className={`btn small ${has(a.apple) ? "" : "disabled"}`}
              href={has(a.apple) ? a.apple : "#"}
              onClick={(e) => { if (!has(a.apple)) e.preventDefault(); audio?.click(); }}
              target="_blank" rel="noopener noreferrer"
            >Apple Music</a>
            <a
              className={`btn small ${has(a.spotify) ? "" : "disabled"}`}
              href={has(a.spotify) ? a.spotify : "#"}
              onClick={(e) => { if (!has(a.spotify)) e.preventDefault(); audio?.click(); }}
              target="_blank" rel="noopener noreferrer"
            >Spotify</a>
            <a
              className={`btn small ${has(a.ig) ? "" : "disabled"}`}
              href={has(a.ig) ? a.ig : "#"}
              onClick={(e) => { if (!has(a.ig)) e.preventDefault(); audio?.click(); }}
              target="_blank" rel="noopener noreferrer"
            >Instagram</a>
          </div>

          <a
            href="#booking"
            className="btn primary big"
            onClick={() => { audio?.click(); onClose(); }}
          >
            Bookear a {a.name} <span className="arr">→</span>
          </a>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Roster, ArtistModal });
