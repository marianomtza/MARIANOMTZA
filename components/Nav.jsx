function Nav({ audio }) {
  const [revealed, setRevealed] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => { setTimeout(() => setRevealed(true), 600); }, []);

  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <nav className={`nav ${revealed ? "revealed" : ""}`}>
        <div className="nav-inner">
          <a href="#top" className="nav-logo" onClick={() => audio?.click()}>
            <span>Mariano</span> <span className="dim">Martínez</span>
          </a>
          <div className="nav-links">
            <a href="#events">Eventos</a>
            <a href="#roster">Roster</a>
            <a href="#booking">Contacto</a>
            <a href="#booking">Booking</a>
          </div>
          <div className="nav-right">
            <button
              className={`sound-toggle ${audio?.enabled ? "" : "off"}`}
              onClick={() => audio?.toggle()}
              aria-label="Toggle sound"
            >
              <span className="sound-bars"><span/><span/><span/><span/></span>
              <span className="sound-label">{audio?.enabled ? "On" : "Off"}</span>
            </button>
            <a href="#booking" className="nav-btn" onClick={() => audio?.click()}>Booking</a>
            <button
              className={`nav-burger ${open ? "on" : ""}`}
              onClick={() => setOpen(v => !v)}
              aria-label="Menu"
              aria-expanded={open}
            >
              <span></span><span></span><span></span>
            </button>
          </div>
        </div>
      </nav>

      <div className={`nav-drawer ${open ? "open" : ""}`} onClick={close}>
        <div className="nav-drawer-inner" onClick={(e) => e.stopPropagation()}>
          <a href="#events" onClick={close}>Eventos</a>
          <a href="#roster" onClick={close}>Roster</a>
          <a href="#booking" onClick={close}>Contacto</a>
          <a href="#booking" onClick={close}>Booking</a>
        </div>
      </div>
    </>
  );
}
Object.assign(window, { Nav });
