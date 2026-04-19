function Cursor() {
  const dotRef = React.useRef(null);
  const trailRef = React.useRef(null);
  const state = React.useRef({ x: 0, y: 0, tx: 0, ty: 0 });

  React.useEffect(() => {
    const onMove = (e) => {
      state.current.x = e.clientX;
      state.current.y = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
      }
    };
    const onOver = (e) => {
      const t = e.target;
      if (!dotRef.current) return;
      const interactive = t.closest("a, button, .roster-card, .event-row, .tweak-colors button");
      const textish = t.closest("input, textarea, p, h1, h2, h3, h4");
      dotRef.current.classList.toggle("hovering", !!interactive);
      dotRef.current.classList.toggle("text", !interactive && !!textish);
    };
    let raf;
    const loop = () => {
      const s = state.current;
      s.tx += (s.x - s.tx) * 0.12;
      s.ty += (s.y - s.ty) * 0.12;
      if (trailRef.current) trailRef.current.style.transform = `translate(${s.tx}px, ${s.ty}px) translate(-50%, -50%)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", onOver);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div className="cursor-trail" ref={trailRef} />
      <div className="cursor" ref={dotRef} />
    </>
  );
}
Object.assign(window, { Cursor });
