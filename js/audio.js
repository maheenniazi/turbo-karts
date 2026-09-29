// Procedural Web Audio: engine hum, sound effects and a little chiptune loop. No audio files needed.
const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

export class Sound {
  constructor() { this.ctx = null; this.muted = false; this.musicTimer = null; }

  // Must be called from a user gesture (required by iOS Safari).
  unlock() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    if (!this.ctx) {
      const ctx = (this.ctx = new AC());
      this.master = ctx.createGain(); this.master.gain.value = this.muted ? 0 : 0.7; this.master.connect(ctx.destination);
      this.sfx = ctx.createGain(); this.sfx.gain.value = 0.9; this.sfx.connect(this.master);
      this.music = ctx.createGain(); this.music.gain.value = 0.22; this.music.connect(this.master);
      // Engine: two detuned oscillators through a low-pass filter.
      this.eng = ctx.createGain(); this.eng.gain.value = 0;
      const f = (this.engFilter = ctx.createBiquadFilter()); f.type = 'lowpass'; f.frequency.value = 700;
      this.o1 = ctx.createOscillator(); this.o1.type = 'sawtooth';
      this.o2 = ctx.createOscillator(); this.o2.type = 'square';
      this.o1.connect(f); this.o2.connect(f); f.connect(this.eng); this.eng.connect(this.master);
      this.o1.start(); this.o2.start();
      const nb = (this.noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate));
      const ch = nb.getChannelData(0); for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1;
      // Silent blip fully unlocks audio on older iOS.
      const s = ctx.createBufferSource(); s.buffer = ctx.createBuffer(1, 1, 22050); s.connect(ctx.destination); s.start(0);
    }
    if (this.ctx.state !== 'running') this.ctx.resume();
  }
  suspend() { if (this.ctx && this.ctx.state === 'running') this.ctx.suspend(); }
  resume() { if (this.ctx && this.ctx.state !== 'running') this.ctx.resume(); }
  setMuted(m) { this.muted = m; if (this.master) this.master.gain.value = m ? 0 : 0.7; }

  engine(on, frac, boosting) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime, f = 50 + frac * 120 + (boosting ? 30 : 0);
    this.o1.frequency.setTargetAtTime(f, t, 0.05);
    this.o2.frequency.setTargetAtTime(f * 1.505, t, 0.05);
    this.engFilter.frequency.setTargetAtTime(500 + frac * 1200, t, 0.1);
    this.eng.gain.setTargetAtTime(on ? 0.05 + frac * 0.05 : 0, t, 0.1);
  }

  tone(freq, dur, type = 'square', vol = 0.15, slideTo = 0, delay = 0, dest) {
    if (!this.ctx) return;
    const ctx = this.ctx, t = ctx.currentTime + delay, o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(dest || this.sfx); o.start(t); o.stop(t + dur + 0.02);
  }
  noise(dur, vol = 0.2, freq = 1200, delay = 0) {
    if (!this.ctx) return;
    const ctx = this.ctx, t = ctx.currentTime + delay, s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = this.noiseBuf; f.type = 'lowpass'; f.frequency.value = freq;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(this.sfx); s.start(t); s.stop(t + dur + 0.02);
  }

  play(name) {
    switch (name) {
      case 'count': this.tone(440, 0.25, 'square', 0.18); break;
      case 'go': this.tone(880, 0.6, 'square', 0.18); break;
      case 'box': [660, 880, 1100].forEach((f, i) => this.tone(f, 0.08, 'triangle', 0.15, 0, i * 0.05)); break;
      case 'item': this.tone(1320, 0.12, 'square', 0.08); break;
      case 'boost': this.noise(0.5, 0.25, 2500); this.tone(200, 0.5, 'sawtooth', 0.08, 600); break;
      case 'mini1': this.tone(500, 0.25, 'sawtooth', 0.08, 900); this.noise(0.25, 0.12, 3000); break;
      case 'mini2': this.tone(600, 0.4, 'sawtooth', 0.1, 1200); this.noise(0.4, 0.18, 3000); break;
      case 'hit': this.noise(0.5, 0.3, 900); this.tone(600, 0.6, 'square', 0.1, 120); break;
      case 'rocket': this.noise(0.6, 0.2, 1800); break;
      case 'explode': this.noise(0.7, 0.35, 500); break;
      case 'lap': [523, 659, 784].forEach((f, i) => this.tone(f, 0.15, 'square', 0.12, 0, i * 0.1)); break;
      case 'final': [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.18, 'square', 0.13, 0, i * 0.1)); break;
      case 'finish': [523, 659, 784, 1047, 784, 1047].forEach((f, i) => this.tone(f, 0.25, 'square', 0.13, 0, i * 0.13)); break;
      case 'bump': this.tone(110, 0.12, 'sine', 0.25, 60); break;
      case 'hop': this.tone(300, 0.08, 'sine', 0.1, 500); break;
      case 'drop': this.tone(220, 0.12, 'triangle', 0.15, 110); break;
      case 'star': [784, 988, 1175, 1568].forEach((f, i) => this.tone(f, 0.1, 'square', 0.1, 0, i * 0.06)); break;
      case 'click': this.tone(900, 0.04, 'square', 0.08); break;
      case 'coin': this.tone(988, 0.07, 'square', 0.1); this.tone(1319, 0.18, 'square', 0.1, 0, 0.07); break;
      case 'shoot': this.tone(700, 0.12, 'sawtooth', 0.07, 250); this.noise(0.12, 0.1, 3000); break;
      case 'target': [880, 1175, 1568].forEach((f, i) => this.tone(f, 0.09, 'triangle', 0.14, 0, i * 0.04)); break;
      case 'mgstart': [392, 523, 659, 784].forEach((f, i) => this.tone(f, 0.14, 'square', 0.12, 0, i * 0.09)); break;
      case 'mgwin': [659, 784, 988, 1319, 988, 1319].forEach((f, i) => this.tone(f, 0.2, 'square', 0.12, 0, i * 0.11)); break;
      case 'green': this.tone(1047, 0.35, 'square', 0.2); break;
      case 'react': this.tone(660, 0.08, 'triangle', 0.15); break;
      case 'bad': this.tone(200, 0.35, 'sawtooth', 0.12, 90); break;
      case 'mini3': this.tone(700, 0.55, 'sawtooth', 0.12, 1600); this.noise(0.55, 0.22, 3500); break;
      case 'squash': this.tone(90, 0.3, 'square', 0.25, 40); this.noise(0.4, 0.3, 600); break;
      case 'fall': this.tone(700, 0.8, 'triangle', 0.14, 90); break;
      case 'pass': this.tone(1200, 0.08, 'square', 0.12); this.tone(800, 0.1, 'square', 0.1, 0, 0.08); break;
      case 'boom': this.noise(1, 0.45, 400); this.tone(80, 0.8, 'sawtooth', 0.2, 30); break;
      case 'call': [784, 784, 1047].forEach((f, i) => this.tone(f, 0.12, 'square', 0.13, 0, i * 0.12)); break;
      case 'shrink': this.tone(300, 0.6, 'sawtooth', 0.1, 120); break;
      case 'tick': this.tone(1500, 0.03, 'square', 0.06); break;
    }
  }

  startMusic() {
    if (!this.ctx || this.musicTimer) return;
    const chords = [[48, 52, 55], [45, 48, 52], [41, 45, 48], [43, 47, 50]];
    const lead = [0, 1, 2, 1, 2, -1, 1, 2, 0, 2, 1, -1, 2, 1, 0, 1];
    const stepDur = 60 / 150 / 4;
    let step = 0, next = this.ctx.currentTime + 0.1;
    this.musicTimer = setInterval(() => {
      while (next < this.ctx.currentTime + 0.15) {
        const c = chords[Math.floor(step / 16) % 4], s = step % 16;
        const delay = next - this.ctx.currentTime;
        if (s % 2 === 0) this.tone(mtof(c[(s / 2) % 2 ? 2 : 0] - 12), stepDur * 1.8, 'triangle', 0.5, 0, delay, this.music);
        if (lead[s] >= 0) this.tone(mtof(c[lead[s]] + 12 + (Math.floor(step / 64) % 2 ? 12 : 0)), stepDur * 0.9, 'square', 0.12, 0, delay, this.music);
        if (s % 4 === 0) this.noise(0.04, 0.05, 6000, delay);
        step++; next += stepDur;
      }
    }, 25);
  }
  stopMusic() { clearInterval(this.musicTimer); this.musicTimer = null; }
}
