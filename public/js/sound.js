let audio;
let enabled = true;

export const setSoundEnabled = (on) => { enabled = on; };

const ac = () => {
  audio ??= new (window.AudioContext || window.webkitAudioContext)();
  if (audio.state === "suspended") audio.resume();
  return audio;
};

const tone = (freq, dur, type = "sine", vol = 0.18, slide) => {
  const ctx = ac();
  const t = ctx.currentTime;
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(ctx.destination);
  o.start(t); o.stop(t + dur + 0.03);
};

const noise = (dur, vol = 0.22) => {
  const ctx = ac();
  const t = ctx.currentTime;
  const b = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * dur), ctx.sampleRate);
  const d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
  const s = ctx.createBufferSource(); s.buffer = b;
  const f = ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 1100;
  const g = ctx.createGain(); g.gain.value = vol;
  s.connect(f); f.connect(g); g.connect(ctx.destination);
  s.start(t);
};

export const playSound = (type) => {
  if (!enabled) return;
  try {
    if (type === "blip")  { tone(640, 0.12, "square", 0.13, 880); return; }
    if (type === "miss")  { noise(0.26); tone(220, 0.18, "sine", 0.1, 130); return; }
    if (type === "hit")   { tone(520, 0.1, "square", 0.16, 720); setTimeout(() => tone(900, 0.16, "square", 0.16, 1150), 90); return; }
    if (type === "win")   { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => tone(f, 0.2, "triangle", 0.18), i * 130)); return; }
    if (type === "lose")  { [420, 340, 260].forEach((f, i) => setTimeout(() => tone(f, 0.24, "sine", 0.16, f * 0.8), i * 170)); return; }
    if (type === "click") { tone(420, 0.05, "square", 0.09); }
  } catch (_) {}
};
