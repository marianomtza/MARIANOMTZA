function Hero({ audio }) {
  const [rev, setRev] = React.useState(false);
  const [roleIdx, setRoleIdx] = React.useState(0);
  const titleRef = React.useRef(null);

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

  // MARIANOMTZA — 10 letters mapped to C major diatonic
  const TITLE = "MARIANOMTZA";
  const noteFor = (i) => {
    const scale = window.PIANO_SCALE || [];
    return scale[i % scale.length];
  };

  const lastChar = React.useRef(-1);

  // Magnification: scale up hovered letter and neighbours (Mac Dock style)
  const applyMagnification = (idx) => {
    if (!titleRef.current) return;
    const chars = titleRef.current.querySelectorAll(".char");
    chars.forEach((el, i) => {
      const dist = Math.abs(i - idx);
      if (dist === 0)      { 
        el.style.transform = "translateY(-18px) scale(1.85)"; 
        el.style.color = "var(--accent)"; 
        el.style.textShadow = "0 0 20px var(--accent), 0 0 40px rgba(168, 85, 247, 0.4)";
        el.style.zIndex = "10"; 
      }
      else if (dist === 1) { 
        el.style.transform = "translateY(-10px) scale(1.45)"; 
        el.style.textShadow = "0 0 12px rgba(168, 85, 247, 0.3)";
        el.style.color = ""; 
        el.style.zIndex = "5"; 
      }
      else if (dist === 2) { 
        el.style.transform = "translateY(-4px) scale(1.18)"; 
        el.style.textShadow = "0 0 6px rgba(168, 85, 247, 0.15)";
        el.style.color = ""; 
        el.style.zIndex = "2"; 
      }
      else if (dist === 3) { 
        el.style.transform = "translateY(-1px) scale(1.06)";
        el.style.textShadow = "";
        el.style.color = ""; 
        el.style.zIndex = ""; 
      }
      else                 { 
        el.style.transform = "translateY(0) scale(1)"; 
        el.style.textShadow = "";
        el.style.color = ""; 
        el.style.zIndex = ""; 
      }
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
                  transition: "transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.18s, text-shadow 0.18s",
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
      </div>
    </section>
  );
}
Object.assign(window, { Hero });
