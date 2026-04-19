/**
 * PremiumCursor — Premium thin cursor with easing, scaling, and refined animations
 * Features: Reduced friction easing, smooth scaling on hover, mix-blend-mode dynamics
 * Performance: 60fps maintained via RAF + transform optimization
 */
function PremiumCursor() {
  const dotRef = React.useRef(null);
  const innerRef = React.useRef(null);
  const state = React.useRef({ x: 0, y: 0, tx: 0, ty: 0, scale: 1, tScale: 1 });
  const lastHoverState = React.useRef("");

  React.useEffect(() => {
    const onMove = (e) => {
      state.current.x = e.clientX;
      state.current.y = e.clientY;
    };

    const onOver = (e) => {
      const t = e.target;
      if (!dotRef.current) return;

      const interactive = t.closest("a, button, .roster-card, .event-row, .tweak-colors button");
      const textish = t.closest("input, textarea, p, h1, h2, h3, h4, .char");

      let nextState = "default";
      if (interactive) {
        nextState = "interactive";
        state.current.tScale = 1.4;
      } else if (textish) {
        nextState = "text";
        state.current.tScale = 0.6;
      } else {
        nextState = "default";
        state.current.tScale = 1;
      }

      if (nextState !== lastHoverState.current) {
        lastHoverState.current = nextState;
        dotRef.current.className = `cursor-premium cursor-${nextState}`;
      }
    };

    let raf;
    const loop = () => {
      const s = state.current;
      // Reduced friction: 0.15 for snappier response while maintaining smoothness
      s.tx += (s.x - s.tx) * 0.15;
      s.ty += (s.y - s.ty) * 0.15;
      s.scale += (s.tScale - s.scale) * 0.18;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${s.tx}px, ${s.ty}px) translate(-50%, -50%) scale(${s.scale})`;
      }

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", onOver);
    window.addEventListener("mouseout", () => {
      lastHoverState.current = "default";
      if (dotRef.current) {
        dotRef.current.className = "cursor-premium cursor-default";
        state.current.tScale = 1;
      }
    });

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="cursor-premium cursor-default" ref={dotRef}>
      <div className="cursor-inner" ref={innerRef} />
    </div>
  );
}
Object.assign(window, { PremiumCursor });
