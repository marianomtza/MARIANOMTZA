function Events({ audio }) {
  // Noches Memorables — hits con link externo
  const LIST = [
    {
      idx: "01",
      name: "Cercle Odyssey CDMX",
      meta: "CDMX · 2025",
      href: "https://www.youtube.com/watch?v=UzPRso975PM"
    },
    {
      idx: "02",
      name: "Knockout: Lago Algo w/ Vegyn",
      meta: "Lago Algo · 2025",
      href: "https://www.instagram.com/p/DNMhSKwx-uP/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA=="
    },
    {
      idx: "03",
      name: "MUTEK MX x Club Furia x Lapi",
      meta: "MUTEK · 2024",
      href: "https://mexico.mutek.org/es/eventos/2024/colaboracion-especial-con-club-furia-x-lapi"
    },
    {
      idx: "04",
      name: "Keep Hush CDMX",
      meta: "Keep Hush · 2024",
      href: "https://www.youtube.com/playlist?list=PLhON8BygM1nIeGSsda4c5IvGvAbHyMysv"
    },
    {
      idx: "05",
      name: "Algo Bien Pride 2024",
      meta: "Pride · 2024",
      href: "https://www.youtube.com/watch?v=8GasfuDe4Dg&t=2588s"
    }
  ];

  return (
    <section className="section events-section" id="events">
      <div className="wrap">
        <div className="section-intro reveal-stagger">
          <div className="side">05 — Noches Memorables</div>
          <h2 className="section-h">
            Noches <span className="ital">memorables</span>
          </h2>
        </div>

        <div className="events-list reveal-stagger">
          {LIST.map((e, i) => (
            <a
              className="event-row"
              href={e.href}
              target="_blank"
              rel="noopener noreferrer"
              key={i}
              onMouseEnter={() => audio?.hover()}
              onClick={() => audio?.click()}
            >
              <span className="idx">— {e.idx}</span>
              <span className="name">{e.name}</span>
              <span className="meta">{e.meta}</span>
              <span className="meta">Ver</span>
              <span className="arr">
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M1 13L13 1M13 1H4M13 1v9" stroke="currentColor" strokeWidth="1.2"/></svg>
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
Object.assign(window, { Events });
