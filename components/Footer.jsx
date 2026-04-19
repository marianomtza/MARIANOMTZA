function Footer() {
  const cfg = window.SITE_CONFIG || {};
  const year = new Date().getFullYear();
  return (
    <>
      <a className="footer-big" href="#top" title="Volver al inicio">Mariano<span className="ital">·</span>Martínez</a>
      <footer className="footer">
        <div>© {year} · marianomtza.com</div>
        <div>{cfg.city || "Ciudad de México · MX"}</div>
        <div className="footer-social">
          {cfg.instagram && <a href={cfg.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>}
          {cfg.email && <a href={`mailto:${cfg.email}`}>Email</a>}
          <a href="#top">↑ Top</a>
        </div>
      </footer>
    </>
  );
}
Object.assign(window, { Footer });
