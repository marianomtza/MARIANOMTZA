function Hero({ audio }) {
  const [rev, setRev] = React.useState(false);
  const [roleIdx, setRoleIdx] = React.useState(0);
  const titleRef = React.useRef(null);
  const pianoCtxRef = React.useRef(null);

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

  const TITLE = "MARIANOMTZA";

  const lastChar = React.useRef(-1);
  const lastPlayedDrumRef = React.useRef(-1);

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

  const playPianoNote = (freq) => {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!pianoCtxRef.current) {
        pianoCtxRef.current = new AC();
      }
      const ctx = pianoCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();

      const now = ctx.currentTime;
      const master = ctx.createGain();
      master.gain.value = 0;
      master.gain.linearRampToValueAtTime(0.12, now + 0.008);
      master.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
      master.connect(ctx.destination);

      const partials = [
        { f: freq, t: "sine", g: 1.0 },
        { f: freq * 2, t: "sine", g: 0.35 },
        { f: freq * 3, t: "triangle", g: 0.12 }
      ];
      partials.forEach(p => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = p.t; o.frequency.value = p.f;
        g.gain.value = p.g;
        o.connect(g); g.connect(master);
        o.start(now);
        o.stop(now + 0.8);
      });
    } catch (e) { }
  };

  const applyMagnification = (idx) => {
    if (!titleRef.current) return;
    const chars = titleRef.current.querySelectorAll(".char");
    chars.forEach((el, i) => {
      if (i === idx) {
        el.style.transform = "scale(1.8) translateY(-8px)";
        el.style.color = "var(--accent)";
        el.style.zIndex = "10";
        el.style.textShadow = "0 0 20px var(--accent)";
      } else {
        el.style.transform = "scale(1)";
        el.style.color = "";
        el.style.zIndex = "";
        el.style.textShadow = "";
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

  const onLetterMove = (e) => {
    const i = getMagnifiedCharIndex(e);
    if (i !== lastChar.current) {
      lastChar.current = i;
      if (i >= 0) {
        applyMagnification(i);
        if (lastPlayedDrumRef.current !== i) {
          lastPlayedDrumRef.current = i;
          const freq = window.PIANO_SCALE?.[i % window.PIANO_SCALE.length];
          if (freq) playPianoNote(freq);
        }
      } else {
        resetMagnification();
      }
    }
  };

  const onLetterLeave = () => {
    lastChar.current = -1;
    lastPlayedDrumRef.current = -1;
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
                  transition: "transform 0.2s cubic-bezier(0.22, 1, 0.36, 1), color 0.15s, text-shadow 0.15s",
                  display: "inline-block",
                  position: "relative",
                  transformOrigin: "center center",
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
