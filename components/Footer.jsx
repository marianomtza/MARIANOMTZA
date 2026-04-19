function Footer() {
  const cfg = window.SITE_CONFIG || {};
  const year = new Date().getFullYear();
  return (
    <>
      <div className="footer-big">Mariano<span className="ital">·</span>Martínez</div>
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
