function Hero({ audio }) {
  const [rev, setRev] = React.useState(false);
  const [roleIdx, setRoleIdx] = React.useState(0);
  const titleRef = React.useRef(null);

  const ROLES = [
    "Productor de Eventos",
    "Muevo Gente",
    "Manager",
    "Conecto Puntos",
    "A&R",
    "Documento Todo",
    "Director Creativo"
  ];

  React.useEffect(() => {
    const t = setTimeout(() => setRev(true), 200);
    return () => clearTimeout(t);
  }, []);

  React.useEffect(() => {
    const id = setInterval(() => setRoleIdx(i => (i + 1) % ROLES.length), 2600);
    return () => clearInterval(id);
  }, []);

  // MARIANOMTZA — 10 letters mapped to C major diatonic
  const TITLE = "MARIANOMTZA";
  const noteFor = (i) => {
    const scale = window.PIANO_SCALE || [];
    return scale[i % scale.length];
  };

  const lastChar = React.useRef(-1);

  // Magnification: scale up hovered letter and neighbours
  const applyMagnification = (idx) => {
    if (!titleRef.current) return;
    const chars = titleRef.current.querySelectorAll(".char");
    chars.forEach((el, i) => {
      const dist = Math.abs(i - idx);
      if (dist === 0)      { el.style.transform = "translateY(-12px) scale(1.55)"; el.style.color = "var(--accent)"; el.style.zIndex = "10"; }
      else if (dist === 1) { el.style.transform = "translateY(-6px) scale(1.25)"; el.style.color = ""; el.style.zIndex = "5"; }
      else if (dist === 2) { el.style.transform = "translateY(-2px) scale(1.08)"; el.style.color = ""; el.style.zIndex = "2"; }
      else                 { el.style.transform = "translateY(0) scale(1)"; el.style.color = ""; el.style.zIndex = ""; }
    });
  };

  const resetMagnification = () => {
    if (!titleRef.current) return;
    const chars = titleRef.current.querySelectorAll(".char");
    chars.forEach(el => {
      el.style.transform = "";
      el.style.color = "";
      el.style.zIndex = "";
    });
  };

  const onLetterEnter = (i) => {
    if (lastChar.current === i) return;
    lastChar.current = i;
    applyMagnification(i);
    if (audio?.ensureContext) audio.ensureContext();
    if (audio?.note) audio.note(noteFor(i), 0.22);
  };

  const onLetterLeave = () => {
    lastChar.current = -1;
    resetMagnification();
  };

  return (
    <section className="hero" id="top">
      <div>
        <div className="hero-eyebrow">→ Ciudad de México</div>
        <h1
          className={`hero-title ${rev ? "revealed" : ""}`}
          aria-label={TITLE}
          ref={titleRef}
          style={{ overflow: "visible" }}
        >
          <span className="word" style={{ overflow: "visible" }}>
            {TITLE.split("").map((ch, i) => (
              <span
                className="char piano-char"
                key={i}
                style={{
                  transitionDelay: `${i * 50 + 400}ms`,
                  transition: "transform 0.22s cubic-bezier(0.22, 1, 0.36, 1), color 0.18s, transform 0.22s cubic-bezier(0.22,1,0.36,1)",
                  display: "inline-block",
                  position: "relative",
                  transformOrigin: "bottom center",
                }}
                onMouseEnter={() => onLetterEnter(i)}
                onMouseLeave={onLetterLeave}
                data-note={i}
              >{ch}</span>
            ))}
          </span>
        </h1>
      </div>

      <div>
        <div className="hero-bottom">
          <div>
            <div className="hero-role" aria-live="polite">
              <span className="hero-role-label">{ROLES[roleIdx]}</span>
            </div>
            <div className="hero-ctas">
              <a href="#booking" className="btn primary magnetic"
                 onClick={() => audio?.click()}
                 onMouseEnter={() => audio?.whoosh()}>
                Booking <span className="arr">→</span>
              </a>
              <a href="#events" className="btn ghost magnetic"
                 onClick={() => audio?.click()}
                 onMouseEnter={() => audio?.hover()}>
                Eventos
              </a>
            </div>
          </div>
          <div>
            <p className="hero-desc">
              Produzco noches de <strong>más de 4000 asistentes</strong>. Booking, logística, dirección y producción creativa para cultura joven y vida nocturna.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
Object.assign(window, { Hero });
