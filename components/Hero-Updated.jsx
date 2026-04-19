/**
 * Precise Letter Magnifier — Exact hit detection, no neighbor distortion
 * Uses character bounding boxes for accurate cursor-to-letter mapping
 * Performance: Minimal reflows via will-change + transform GPU acceleration
 */
function PreciseLetterMagnifier({ titleRef, characters }) {
  const [magnifiedIdx, setMagnifiedIdx] = React.useState(-1);
  const charRefsRef = React.useRef([]);

  const getMagnifiedCharIndex = React.useCallback((e) => {
    if (!titleRef.current) return -1;

    const chars = titleRef.current.querySelectorAll(".char");
    const cursorX = e.clientX;
    const cursorY = e.clientY;

    for (let i = 0; i < chars.length; i++) {
      const rect = chars[i].getBoundingClientRect();
      // Precise hit detection: only magnify if cursor is within character bounds
      if (
        cursorX >= rect.left &&
        cursorX <= rect.right &&
        cursorY >= rect.top &&
        cursorY <= rect.bottom
      ) {
        return i;
      }
    }

    return -1;
  }, [titleRef]);

  React.useEffect(() => {
    const onMove = (e) => {
      const idx = getMagnifiedCharIndex(e);
      if (idx !== magnifiedIdx) {
        setMagnifiedIdx(idx);
      }
    };

    const onLeave = () => setMagnifiedIdx(-1);

    const titleEl = titleRef.current;
    if (!titleEl) return;

    titleEl.addEventListener("mousemove", onMove);
    titleEl.addEventListener("mouseleave", onLeave);

    return () => {
      titleEl.removeEventListener("mousemove", onMove);
      titleEl.removeEventListener("mouseleave", onLeave);
    };
  }, [magnifiedIdx, getMagnifiedCharIndex, titleRef]);

  // Apply styles to character
  React.useEffect(() => {
    const chars = titleRef.current?.querySelectorAll(".char");
    if (!chars) return;

    chars.forEach((el, i) => {
      if (i === magnifiedIdx) {
        // ONLY this exact letter is magnified
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
  }, [magnifiedIdx, titleRef]);

  return magnifiedIdx;
}

function Hero({ audio }) {
  const [rev, setRev] = React.useState(false);
  const [roleIdx, setRoleIdx] = React.useState(0);
  const titleRef = React.useRef(null);
  const lastPlayedNoteRef = React.useRef(-1);

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
  
  // Track magnified index and trigger drum sounds
  const magnifiedIdx = PreciseLetterMagnifier({ titleRef, characters: TITLE.split("") });

  React.useEffect(() => {
    if (magnifiedIdx !== lastPlayedNoteRef.current) {
      lastPlayedNoteRef.current = magnifiedIdx;

      if (magnifiedIdx >= 0 && audio) {
        audio.ensureContext?.();
        // Trigger different drums per letter for interactive feedback
        const drumSequence = [
          audio.kick,
          audio.snare,
          audio.hihat,
          audio.tom,
          audio.clap,
          audio.cowbell,
          audio.kick,
          audio.snare,
          audio.hihat,
          audio.tom,
          audio.clap,
        ];
        const drum = drumSequence[magnifiedIdx % drumSequence.length];
        drum?.(0.7);
      }
    }
  }, [magnifiedIdx, audio]);

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
                  transition:
                    "transform 0.2s cubic-bezier(0.22, 1, 0.36, 1), color 0.15s, text-shadow 0.15s",
                  display: "inline-block",
                  position: "relative",
                  transformOrigin: "center center",
                  willChange: "transform, color, text-shadow",
                  cursor: "pointer",
                }}
              >
                {ch}
              </span>
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
              <a
                href="#booking"
                className="btn primary magnetic"
                onClick={() => {
                  audio?.ensureContext?.();
                  audio?.click?.();
                }}
                onMouseEnter={() => {
                  audio?.ensureContext?.();
                  audio?.hover?.();
                }}
              >
                Booking <span className="arr">→</span>
              </a>
              <a
                href="#events"
                className="btn ghost magnetic"
                onClick={() => {
                  audio?.ensureContext?.();
                  audio?.snare?.(0.8);
                }}
                onMouseEnter={() => {
                  audio?.ensureContext?.();
                  audio?.hihat?.(0.6);
                }}
              >
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
