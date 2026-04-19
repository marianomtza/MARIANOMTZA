function Roster({ audio }) {
  const ROSTER = [
    { name: "MARIANOMTZA", real: "Mariano Martinez", genre: "Productor", locked: false, photo: null },
    { name: "REX", real: "Regina Xochitl", genre: "DJ/Productora", locked: false, photo: null },
    { name: "SOL", real: "Solange Vega", genre: "Vocalist", locked: false, photo: null },
    { name: "KX", real: "Kai X", genre: "Productor", locked: false, photo: null },
    { name: "MIRA", real: "Mira Olvido", genre: "Diseñadora", locked: false, photo: null },
    { name: "GHOST", real: "???", genre: "Secreto", locked: true, photo: null }
  ];

  const [ghostUnlocks, setGhostUnlocks] = React.useState(0);
  const ghostIndex = ROSTER.findIndex(a => a.name === "GHOST");

  const [active, setActive] = React.useState(null);

  const onCardClick = (i) => {
    if (i === ghostIndex) {
      setGhostUnlocks(u => {
        const next = u + 1;
        if (next >= 3) {
          ROSTER[ghostIndex].locked = false;
          ROSTER[ghostIndex].real = "GHOST PROTOCOL";
        }
        return next;
      });
    }
    audio?.click();
    setActive(i);
  };

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
          {ROSTER.map((a, i) => {
            const initials = a.name.split(/(?=[A-Z])/)[0].slice(0, 2).toUpperCase();
            const colors = ["#7C3AED", "#EC4899", "#3B82F6", "#14B8A6", "#F59E0B", "#8B5CF6"];
            const bgColor = colors[i % colors.length];
            return (
              <button
                type="button"
                className={`roster-card ${a.locked ? "locked" : ""}`}
                key={a.name}
                onClick={() => onCardClick(i)}
                aria-label={`Ver ${a.name}`}
              >
                <div className="roster-avatar" style={{ background: bgColor }}>
                  {a.photo ? <img src={a.photo} alt={a.name} /> : <span>{initials}</span>}
                </div>
                <div className="roster-card-info">
                  <div className="roster-name">{a.name}</div>
                  <div className="roster-real">{a.real}</div>
                  <div className="roster-genre">{a.genre}</div>
                </div>
                <div className="roster-cta">Book →</div>
              </button>
            );
          })}
        </div>
      </div>

      {active !== null && (
        <ArtistModal
          artist={ROSTER[active]}
          index={active}
          onClose={() => setActive(null)}
          audio={audio}
        />
      )}
    </section>
  );
}

function ArtistModal({ artist, index, onClose, audio }) {
  const a = artist;
  const initials = a.name.split(/(?=[A-Z])/)[0].slice(0, 2).toUpperCase();
  const colors = ["#7C3AED", "#EC4899", "#3B82F6", "#14B8A6", "#F59E0B", "#8B5CF6"];
  const bgColor = colors[index % colors.length];

  return (
    <div className="artist-modal" onClick={onClose} role="dialog" aria-modal="true">
      <div className="artist-modal-panel" onClick={(e) => e.stopPropagation()}>
        <button className="artist-modal-close" onClick={onClose} aria-label="Cerrar">×</button>

        <div className="artist-modal-photo" style={{ background: bgColor }}>
          {a.photo ? (
            <img src={a.photo} alt={a.name} />
          ) : (
            <div className="artist-photo-placeholder">{initials}</div>
          )}
        </div>

        <div className="artist-modal-info">
          <h3 className="artist-modal-name">{a.name}</h3>
          <p className="artist-modal-real">{a.real}</p>
          <p className="artist-modal-genre">{a.genre}</p>

          <a
            href="#booking"
            className="btn primary big"
            onClick={() => {
              audio?.click();
              onClose();
              setTimeout(() => {
                const sel = document.querySelector("select[name='artist']");
                if (sel) {
                  sel.value = a.name;
                  sel.dispatchEvent(new Event("change", { bubbles: true }));
                }
              }, 400);
            }}
          >
            Book {a.name} <span className="arr">→</span>
          </a>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Roster, ArtistModal });
