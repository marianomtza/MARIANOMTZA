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
    setRev(true);
  }, []);

  React.useEffect(() => {
    const id = setInterval(() => setRoleIdx(i => (i + 1) % ROLES.length), 2600);
    return () => clearInterval(id);
  }, []);

  const TITLE = "MARIANOMTZA";

  const lastChar = React.useRef(-1);

  // Precise magnification: ONLY exact letter under cursor
  const getMagnifiedCharIndex = (e) => {
    if (!titleRef.current) return -1;
    const chars = titleRef.current.querySelectorAll(".char");
    const cursorX = e.clientX;
    const cursorY = e.clientY;
    for (let i = 0; i < chars.length; i++) {
      const rect = chars[i].getBoundingClientRect();
      if (cursorX >= rect.left && cursorX <= rect.right && cursorY >= rect.top && cursorY <= rect.bottom) {
        return i;
      }
    }
    return -1;
  };

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
      el.style.textShadow = "";
    });
  };

  const playPianoNote = (index) => {
    if (audio?.ensureContext) audio.ensureContext();
    const scale = window.PIANO_SCALE || [];
    const freq = scale[index % scale.length];
    if (audio?.note) audio.note(freq, 0.16);
  };

  const onLetterMove = (e) => {
    const i = getMagnifiedCharIndex(e);
    if (i !== lastChar.current) {
      lastChar.current = i;
      if (i >= 0) {
        applyMagnification(i);
        playPianoNote(i);
      } else {
        resetMagnification();
      }
    }
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
                  willChange: "transform, color, text-shadow",
                  cursor: "pointer",
                }}
                onMouseMove={onLetterMove}
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
                 onClick={() => { audio?.ensureContext?.(); audio?.click?.(); }}
                 onMouseEnter={() => { audio?.ensureContext?.(); audio?.hover?.(); }}>
                Booking <span className="arr">→</span>
              </a>
              <a href="#events" className="btn ghost magnetic"
                 onClick={() => { audio?.ensureContext?.(); audio?.snare?.(0.8); }}
                 onMouseEnter={() => { audio?.ensureContext?.(); audio?.hihat?.(0.6); }}>
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
