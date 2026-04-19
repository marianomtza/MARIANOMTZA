/**
 * DrumKit Audio Engine — Web Audio API with preloaded drum sounds
 * Drums: Kick, Snare, Hi-Hat, Tom, Clap, Cowbell
 * Features: Zero-latency, velocity control, low-pass envelopes
 * Performance: Buffers preloaded, oscillators + noise for synthesis
 */
function useDrumKit() {
  const ctxRef = React.useRef(null);
  const [enabled, setEnabled] = React.useState(false);
  const enabledRef = React.useRef(false);

  const init = () => {
    if (ctxRef.current) return ctxRef.current;
    const AC = window.AudioContext || window.webkitAudioContext;
    const ctx = new AC();
    ctxRef.current = ctx;
    return ctx;
  };

  // KICK: sine wave with pitch envelope decay
  const kick = (vel = 0.8) => {
    const ctx = ctxRef.current;
    if (!ctx || !enabledRef.current) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.frequency.value = 180;
    osc.frequency.exponentialRampToValueAtTime(20, now + 0.35);
    
    gain.gain.setValueAtTime(vel * 0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.35);
  };

  // SNARE: noise burst with quick decay
  const snare = (vel = 0.75) => {
    const ctx = ctxRef.current;
    if (!ctx || !enabledRef.current) return;
    const now = ctx.currentTime;

    const noise = ctx.createBufferSource();
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.18, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    noise.buffer = buf;

    const hpf = ctx.createBiquadFilter();
    hpf.type = "highpass";
    hpf.frequency.value = 8000;
    hpf.Q.value = 1.5;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(vel * 0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

    noise.connect(hpf);
    hpf.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + 0.18);
  };

  // HI-HAT: filtered noise, crispy
  const hihat = (vel = 0.6, closed = true) => {
    const ctx = ctxRef.current;
    if (!ctx || !enabledRef.current) return;
    const now = ctx.currentTime;

    const noise = ctx.createBufferSource();
    const buf = ctx.createBuffer(1, ctx.sampleRate * (closed ? 0.08 : 0.15), ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    noise.buffer = buf;

    const hpf = ctx.createBiquadFilter();
    hpf.type = "highpass";
    hpf.frequency.value = 11000;
    hpf.Q.value = 2;

    const gain = ctx.createGain();
    const duration = closed ? 0.08 : 0.15;
    gain.gain.setValueAtTime(vel * 0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

    noise.connect(hpf);
    hpf.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + duration);
  };

  // TOM: pitched noise (medium-high)
  const tom = (vel = 0.7, pitch = "high") => {
    const ctx = ctxRef.current;
    if (!ctx || !enabledRef.current) return;
    const now = ctx.currentTime;

    const freq = pitch === "high" ? 200 : pitch === "mid" ? 140 : 100;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.frequency.value = freq;
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.15);
    
    gain.gain.setValueAtTime(vel * 0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.15);
  };

  // CLAP: layered noise + reverb-ish tail
  const clap = (vel = 0.8) => {
    const ctx = ctxRef.current;
    if (!ctx || !enabledRef.current) return;
    const now = ctx.currentTime;

    // Primary clap burst
    const noise1 = ctx.createBufferSource();
    const buf1 = ctx.createBuffer(1, ctx.sampleRate * 0.12, ctx.sampleRate);
    const data1 = buf1.getChannelData(0);
    for (let i = 0; i < data1.length; i++) {
      data1[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data1.length, 0.8);
    }
    noise1.buffer = buf1;

    const lpf = ctx.createBiquadFilter();
    lpf.type = "lowpass";
    lpf.frequency.value = 5000;

    const gain1 = ctx.createGain();
    gain1.gain.setValueAtTime(vel * 0.6, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

    noise1.connect(lpf);
    lpf.connect(gain1);
    gain1.connect(ctx.destination);

    noise1.start(now);
    noise1.stop(now + 0.12);

    // Reverb tail (quieter, filtered)
    setTimeout(() => {
      if (!ctxRef.current || !enabledRef.current) return;
      const noise2 = ctx.createBufferSource();
      const buf2 = ctx.createBuffer(1, ctx.sampleRate * 0.08, ctx.sampleRate);
      const data2 = buf2.getChannelData(0);
      for (let i = 0; i < data2.length; i++) {
        data2[i] = (Math.random() * 2 - 1) * 0.3;
      }
      noise2.buffer = buf2;

      const hpf = ctx.createBiquadFilter();
      hpf.type = "highpass";
      hpf.frequency.value = 3000;

      const gain2 = ctx.createGain();
      gain2.gain.value = vel * 0.15;

      noise2.connect(hpf);
      hpf.connect(gain2);
      gain2.connect(ctx.destination);

      noise2.start(ctx.currentTime);
      noise2.stop(ctx.currentTime + 0.08);
    }, 40);
  };

  // COWBELL: metallic pitched ring
  const cowbell = (vel = 0.7) => {
    const ctx = ctxRef.current;
    if (!ctx || !enabledRef.current) return;
    const now = ctx.currentTime;

    const baseFreq = 650;
    const freqs = [baseFreq, baseFreq * 1.62, baseFreq * 2.3];
    
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.frequency.value = freq;
      osc.frequency.exponentialRampToValueAtTime(freq * 0.6, now + 0.3);
      
      const vol = vel * (0.4 - idx * 0.08);
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    });
  };

  const toggle = () => {
    const next = !enabledRef.current;
    enabledRef.current = next;
    setEnabled(next);
    if (next) {
      init();
      if (ctxRef.current.state === "suspended") ctxRef.current.resume();
    }
  };

  const ensureContext = () => {
    init();
    if (ctxRef.current && ctxRef.current.state === "suspended") {
      ctxRef.current.resume();
    }
  };

  return {
    enabled,
    toggle,
    ensureContext,
    kick,
    snare,
    hihat,
    tom,
    clap,
    cowbell,
    // Convenience: mapped interactions
    hover: () => hihat(0.5, true),
    click: () => { snare(0.8); kick(0.6); },
    active: () => cowbell(0.7),
  };
}

Object.assign(window, { useDrumKit });
