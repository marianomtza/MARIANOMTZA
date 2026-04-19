function Roster({ audio }) {
  // lafama flag: all except 3DELINCUENTES (index 0)
  const ROSTER = [
    { n: "01", name: "3DELINCUENTES", lafama: false, spotify: null, apple: null, ig: null, photo: null },
    { n: "02", name: "RUZZO DOBLEZZ", lafama: true,  spotify: null, apple: null, ig: null, photo: null },
    { n: "03", name: "8.AM",          lafama: true,  spotify: null, apple: null, ig: null, photo: null },
    { n: "04", name: "MORROW",        lafama: true,  spotify: null, apple: null, ig: null, photo: null },
    { n: "05", name: "BBBARTEX",      lafama: true,  spotify: null, apple: null, ig: null, photo: null },
    { n: "06", name: "LEGORRETA",     lafama: true,  spotify: null, apple: null, ig: null, photo: null },
    { n: "07", name: "TBX",           lafama: true,  spotify: null, apple: null, ig: null, photo: null },
    { n: "08", name: "NZO",           lafama: true,  spotify: null, apple: null, ig: null, photo: null },
    { n: "09", name: "ELAKKKA",       lafama: true,  spotify: null, apple: null, ig: null, photo: null },
    { n: "10", name: "MOODJAAS",      lafama: true,  spotify: null, apple: null, ig: null, photo: null }
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
          <h2 className="section-h">ARTISTAS</h2>
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
              <div className="roster-card-bottom">
                <div className="name">{a.name}</div>
                {a.lafama && <div className="lafama-tag">LAFAMA</div>}
              </div>
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

          {/* Auto-fill booking form with artist name on click */}
          <a
            href="#booking"
            className="btn primary big"
            onClick={() => {
              audio?.click();
              onClose();
              // Auto-fill: set mode to artista and prefill artist select
              setTimeout(() => {
                const sel = document.querySelector("select[name='artist']");
                if (sel) {
                  sel.value = a.name;
                  sel.dispatchEvent(new Event("change", { bubbles: true }));
                }
                // Switch to artista mode
                const artistBtn = document.querySelector(".mode-btn:last-of-type");
                if (artistBtn && !artistBtn.classList.contains("active")) artistBtn.click();
              }, 400);
            }}
          >
            Bookear a {a.name} <span className="arr">→</span>
          </a>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Roster, ArtistModal });
