function Tweaks({ values, setValues }) {
  const [editMode, setEditMode] = React.useState(false);
  const [open, setOpen] = React.useState(true);

  React.useEffect(() => {
    const onMsg = (e) => {
      if (!e.data) return;
      if (e.data.type === "__activate_edit_mode") setEditMode(true);
      else if (e.data.type === "__deactivate_edit_mode") setEditMode(false);
    };
    window.addEventListener("message", onMsg);
    window.parent.postMessage({ type: "__edit_mode_available" }, "*");
    return () => window.removeEventListener("message", onMsg);
  }, []);

  const update = (patch) => {
    const next = { ...values, ...patch };
    setValues(next);
    window.parent.postMessage({ type: "__edit_mode_set_keys", edits: patch }, "*");
  };

  if (!editMode) return null;

  const colors = [
    { name: "Violeta", v: "#9b5fd6", soft: "#6b3fa8", deep: "#3d1d6e" },
    { name: "Magenta", v: "#d65f9b", soft: "#a83f6b", deep: "#6e1d3d" },
    { name: "Cian", v: "#5fc7d6", soft: "#3f95a8", deep: "#1d516e" },
    { name: "Ámbar", v: "#d6a35f", soft: "#a8793f", deep: "#6e4a1d" },
    { name: "Lima", v: "#9bd65f", soft: "#6ba83f", deep: "#3d6e1d" },
  ];

  return (
    <div className="tweaks">
      <div className="tweaks-head">
        <span>Tweaks <span className="t">·</span> live</span>
        <button onClick={() => setOpen(!open)}>{open ? "−" : "+"}</button>
      </div>
      {open && (
        <div className="tweaks-body">
          <label>
            Paleta
            <div className="tweak-colors">
              {colors.map(c => (
                <button key={c.v} title={c.name}
                  className={values.accent === c.v ? "active" : ""}
                  style={{ background: c.v }}
                  onClick={() => update({ accent: c.v, accentSoft: c.soft, accentDeep: c.deep })} />
              ))}
            </div>
          </label>

          <div className={`tweak-toggle ${values.motion ? "on" : ""}`} onClick={() => update({ motion: !values.motion })}>
            Blobs animados <span className="sw" />
          </div>
          <div className={`tweak-toggle ${values.stars ? "on" : ""}`} onClick={() => update({ stars: !values.stars })}>
            Estrellas <span className="sw" />
          </div>
          <div className={`tweak-toggle ${values.grain ? "on" : ""}`} onClick={() => update({ grain: !values.grain })}>
            Grano cinemático <span className="sw" />
          </div>
          <div className={`tweak-toggle ${values.cursor ? "on" : ""}`} onClick={() => update({ cursor: !values.cursor })}>
            Cursor custom <span className="sw" />
          </div>
        </div>
      )}
    </div>
  );
}
Object.assign(window, { Tweaks });
