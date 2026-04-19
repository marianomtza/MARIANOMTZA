// Audio engine: ambient drone, sfx, piano notes via Web Audio API
function useAudio() {
  const ctxRef = React.useRef(null);
  const droneRef = React.useRef(null);
  const [enabled, setEnabled] = React.useState(false);
  const enabledRef = React.useRef(false);

  const init = () => {
    if (ctxRef.current) return ctxRef.current;
    const AC = window.AudioContext || window.webkitAudioContext;
    const ctx = new AC();
    ctxRef.current = ctx;
    return ctx;
  };

  const startDrone = () => {
    const ctx = init();
    if (droneRef.current) return;
    const master = ctx.createGain();
    master.gain.value = 0;
    master.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 2);
    master.connect(ctx.destination);

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 800;
    filter.Q.value = 2;
    filter.connect(master);

    const osc1 = ctx.createOscillator(); osc1.type = "sawtooth"; osc1.frequency.value = 55;
    const osc2 = ctx.createOscillator(); osc2.type = "sine"; osc2.frequency.value = 82.4;
    const osc3 = ctx.createOscillator(); osc3.type = "triangle"; osc3.frequency.value = 110;
    const g1 = ctx.createGain(); g1.gain.value = 0.3;
    const g2 = ctx.createGain(); g2.gain.value = 0.4;
    const g3 = ctx.createGain(); g3.gain.value = 0.2;
    osc1.connect(g1); g1.connect(filter);
    osc2.connect(g2); g2.connect(filter);
    osc3.connect(g3); g3.connect(filter);

    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.15;
    const lfoGain = ctx.createGain(); lfoGain.gain.value = 400;
    lfo.connect(lfoGain); lfoGain.connect(filter.frequency);

    osc1.start(); osc2.start(); osc3.start(); lfo.start();
    droneRef.current = { master, osc1, osc2, osc3, lfo };
  };

  const stopDrone = () => {
    const ctx = ctxRef.current;
    const d = droneRef.current;
    if (!ctx || !d) return;
    d.master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6);
    setTimeout(() => {
      try { d.osc1.stop(); d.osc2.stop(); d.osc3.stop(); d.lfo.stop(); } catch(e){}
      droneRef.current = null;
    }, 700);
  };

  const blip = (freq = 880, dur = 0.08, type = "sine", vol = 0.08) => {
    const ctx = ctxRef.current;
    if (!ctx || !enabledRef.current) return;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type; osc.frequency.value = freq;
    g.gain.value = 0; g.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + dur + 0.02);
  };

  // Piano note — layered sines with short attack + long decay to emulate a soft piano
  const note = (freq, vol = 0.18) => {
    const ctx = ctxRef.current;
    if (!ctx || !enabledRef.current) return;
    const now = ctx.currentTime;

    const master = ctx.createGain();
    master.gain.value = 0;
    master.gain.linearRampToValueAtTime(vol, now + 0.008);
    master.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
    master.connect(ctx.destination);

    // fundamental + 2 harmonics + slight detune
    const partials = [
      { f: freq,       t: "sine",     g: 1.0 },
      { f: freq * 2,   t: "sine",     g: 0.35 },
      { f: freq * 3,   t: "triangle", g: 0.12 },
      { f: freq * 1.002, t: "sine",   g: 0.22 }
    ];
    const oscs = partials.map(p => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = p.t; o.frequency.value = p.f;
      g.gain.value = p.g;
      o.connect(g); g.connect(master);
      o.start(now);
      o.stop(now + 1.3);
      return o;
    });

    // gentle lowpass to soften
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass"; lp.frequency.value = 4200; lp.Q.value = 0.7;
    // insert filter between master and destination
    master.disconnect();
    master.connect(lp); lp.connect(ctx.destination);
  };

  const toggle = () => {
    const next = !enabledRef.current;
    enabledRef.current = next;
    setEnabled(next);
    if (next) { init(); if (ctxRef.current.state === "suspended") ctxRef.current.resume(); startDrone(); blip(660, 0.1, "triangle", 0.1); }
    else { stopDrone(); }
  };

  // Ensure context is ready for note() triggered on hover (even if sound is "off")
  const ensureContext = () => {
    init();
    if (ctxRef.current.state === "suspended") ctxRef.current.resume();
  };

  return {
    enabled,
    toggle,
    ensureContext,
    hover: () => blip(1200 + Math.random() * 400, 0.05, "sine", 0.04),
    click: () => blip(440, 0.12, "triangle", 0.1),
    note, // freq in Hz
    whoosh: () => {
      const ctx = ctxRef.current; if (!ctx || !enabledRef.current) return;
      const noise = ctx.createBufferSource();
      const buf = ctx.createBuffer(1, ctx.sampleRate * 0.3, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
      noise.buffer = buf;
      const f = ctx.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = 1200; f.Q.value = 3;
      const g = ctx.createGain(); g.gain.value = 0.12;
      noise.connect(f); f.connect(g); g.connect(ctx.destination);
      noise.start(); noise.stop(ctx.currentTime + 0.3);
    }
  };
}

// Diatonic C major scale (C4 → E5), 10 notes — one per letter of MARIANOMTZA
window.PIANO_SCALE = [
  261.63, // C4
  293.66, // D4
  329.63, // E4
  349.23, // F4
  392.00, // G4
  440.00, // A4
  493.88, // B4
  523.25, // C5
  587.33, // D5
  659.25  // E5
];

window.useAudio = useAudio;
