function Footer({ audio }) {
  const cfg = window.SITE_CONFIG || {};
  const year = new Date().getFullYear();
  return (
    <>
      <div className="footer-big" onClick={() => { audio?.click?.(); window.scrollTo({ top: 0, behavior: "smooth" }); }} role="button" tabIndex="0" onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { audio?.click?.(); window.scrollTo({ top: 0, behavior: "smooth" }); } }} onMouseEnter={() => { audio?.ensureContext?.(); audio?.hover?.(); }}>Mariano<span className="ital">·</span>Martínez</div>
      <footer className="footer">
        <div>© {year} · marianomtza.com</div>
        <div>{cfg.city || "Ciudad de México · MX"}</div>
        <div className="footer-social">
          {cfg.instagram && (
            <a href={cfg.instagram} target="_blank" rel="noopener noreferrer" onMouseEnter={() => { audio?.ensureContext?.(); audio?.hover?.(); }}>Instagram</a>
          )}
          {cfg.email && (
            <a href={`mailto:${cfg.email}`} onMouseEnter={() => { audio?.ensureContext?.(); audio?.hover?.(); }}>Email</a>
          )}
          <a href="#top" onMouseEnter={() => { audio?.ensureContext?.(); audio?.hover?.(); }}>↑ Top</a>
        </div>
      </footer>
    </>
  );
}
Object.assign(window, { Footer });
