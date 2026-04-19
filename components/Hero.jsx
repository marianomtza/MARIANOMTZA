function Hero({ audio }) {
  const [rev, setRev] = React.useState(false);
  const [roleIdx, setRoleIdx] = React.useState(0);

  // Roles + tagline pairs (rotate)
  const ROLES = [
    { role: "Productor de Eventos", tag: "Muevo gente" },
    { role: "Manager",              tag: "Conecto puntos" },
    { role: "A&R",                  tag: "Documento todo" },
    { role: "Director Creativo",    tag: "Dirijo la noche" }
  ];

  React.useEffect(() => {
    const t = setTimeout(() => setRev(true), 200);
    return () => clearTimeout(t);
  }, []);

  React.useEffect(() => {
    const id = setInterval(() => setRoleIdx(i => (i + 1) % ROLES.length), 2600);
    return () => clearInterval(id);
  }, []);

  // MARIANOMTZA — 10 letters mapped to C major diatonic (window.PIANO_SCALE)
  const TITLE = "MARIANOMTZA";
  const noteFor = (i) => {
    const scale = window.PIANO_SCALE || [];
    return scale[i % scale.length];
  };

  // Track last hovered char so re-entering a different letter triggers a note,
  // but staying inside one letter doesn't spam.
  const lastChar = React.useRef(-1);
  const onLetterEnter = (i) => {
    if (lastChar.current === i) return;
    lastChar.current = i;
    if (audio?.ensureContext) audio.ensureContext();
    if (audio?.note) audio.note(noteFor(i), 0.22);
  };
  const onLetterLeave = () => { lastChar.current = -1; };

  return (
    <section className="hero" id="top">
      <div>
        <div className="hero-eyebrow">→ Ciudad de México</div>
        <h1 className={`hero-title ${rev ? "revealed" : ""}`} aria-label={TITLE}>
          <span className="word">
            {TITLE.split("").map((ch, i) => (
              <span
                className="char piano-char"
                key={i}
                style={{ transitionDelay: `${i * 50 + 400}ms` }}
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
              <span className="hero-role-label">{ROLES[roleIdx].role}</span>
              <span className="hero-role-sep">·</span>
              <span className="hero-role-tag">{ROLES[roleIdx].tag}</span>
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
        <div className="hero-scroll">Scroll · pasa el mouse por mi nombre</div>
      </div>
    </section>
  );
}
Object.assign(window, { Hero });
