function EasterEggs({ audio }) {
  React.useEffect(() => {
    // Console ASCII art — reward curious devs
    console.log(
      "%c\n" +
      "  ███╗   ███╗ █████╗ ██████╗ ██╗ █████╗ ███╗   ██╗ ██████╗ \n" +
      "  ████╗ ████║██╔══██╗██╔══██╗██║██╔══██╗████╗  ██║██╔═══██╗\n" +
      "  ██╔████╔██║███████║██████╔╝██║███████║██╔██╗ ██║██║   ██║\n" +
      "  ██║╚██╔╝██║██╔══██║██╔══██╗██║██╔══██║██║╚██╗██║██║   ██║\n" +
      "  ██║ ╚═╝ ██║██║  ██║██║  ██║██║██║  ██║██║ ╚████║╚██████╔╝\n" +
      "  ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝ ╚═════╝\n\n" +
      "  hola, curioso 👁  — hola@marianomtza.com\n" +
      "  try: ↑↑↓↓←→←→ba\n",
      "color: #7c3aed; font-family: monospace; font-size: 10px;"
    );

    const KONAMI = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
    const LAFAMA_TARGET = "LAFAMA";
    let konamiSeq = [];
    let typedBuf  = "";

    const triggerRave = () => {
      const COLORS = ["#7c3aed","#d946ef","#22d3ee","#f59e0b","#ef4444","#10b981","#6366f1","#ec4899"];
      const root   = document.documentElement;
      const orig   = getComputedStyle(root).getPropertyValue("--accent").trim() || "#7c3aed";

      // Show rave overlay
      const overlay = document.createElement("div");
      overlay.className = "rave-overlay";
      document.body.appendChild(overlay);

      let idx = 0;
      const interval = setInterval(() => {
        const c = COLORS[idx % COLORS.length];
        root.style.setProperty("--accent", c);
        overlay.style.background = `radial-gradient(ellipse at center, ${c}44 0%, transparent 70%)`;
        idx++;
      }, 220);

      setTimeout(() => {
        clearInterval(interval);
        root.style.setProperty("--accent", orig);
        overlay.remove();
      }, 8000);

      audio?.click?.();
    };

    const showToast = (text) => {
      const existing = document.querySelector(".easter-toast");
      if (existing) existing.remove();
      const toast = document.createElement("div");
      toast.className = "easter-toast";
      toast.textContent = text;
      document.body.appendChild(toast);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => toast.classList.add("in"));
      });
      setTimeout(() => {
        toast.classList.remove("in");
        setTimeout(() => toast.remove(), 500);
      }, 3200);
      audio?.click?.();
    };

    const onKey = (e) => {
      // Konami
      konamiSeq.push(e.key);
      if (konamiSeq.length > KONAMI.length) konamiSeq.shift();
      if (konamiSeq.join(",") === KONAMI.join(",")) {
        triggerRave();
        konamiSeq = [];
      }

      // LAFAMA — typed while NOT in an input
      const tag = document.activeElement?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") return;
      if (e.key.length === 1) {
        typedBuf += e.key.toUpperCase();
        if (typedBuf.length > LAFAMA_TARGET.length) {
          typedBuf = typedBuf.slice(typedBuf.length - LAFAMA_TARGET.length);
        }
        if (typedBuf === LAFAMA_TARGET) {
          showToast("👁  LA FAMA TE VE");
          typedBuf = "";
        }
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return null;
}
Object.assign(window, { EasterEggs });
