function Band({ items, reverse, label }) {
  // items can be strings OR { name, href } objects
  const normalized = items.map((it) => typeof it === "string" ? { name: it, href: null } : it);
  const list = [...normalized, ...normalized, ...normalized];
  return (
    <div className={`band ${reverse ? "reverse" : ""}`} aria-label={label || "marquee"}>
      <div className="band-track">
        {list.map((x, i) => (
          x.href ? (
            <a className="band-item band-link" key={i} href={x.href} target="_blank" rel="noopener noreferrer">
              {x.name}<span className="sep">✦</span>
            </a>
          ) : (
            <span className="band-item" key={i}>{x.name}<span className="sep">✦</span></span>
          )
        ))}
      </div>
    </div>
  );
}
Object.assign(window, { Band });
