// Turbo Karts — pure game simulation (no DOM). Shared by the browser (solo + online client) and the Node game server.

export const RACERS = [
  { name: 'Blaze',  color: [0.90, 0.20, 0.18], accent: [1.00, 0.84, 0.20] },
  { name: 'Aqua',   color: [0.16, 0.48, 0.92], accent: [0.95, 0.95, 0.95] },
  { name: 'Leafy',  color: [0.22, 0.68, 0.26], accent: [0.98, 0.90, 0.30] },
  { name: 'Sunny',  color: [0.98, 0.82, 0.12], accent: [0.85, 0.25, 0.20] },
  { name: 'Violet', color: [0.56, 0.24, 0.72], accent: [0.30, 0.90, 0.80] },
  { name: 'Tango',  color: [0.98, 0.52, 0.08], accent: [0.20, 0.20, 0.25] },
  { name: 'Rosa',   color: [0.93, 0.36, 0.58], accent: [1.00, 1.00, 1.00] },
  { name: 'Frost',  color: [0.10, 0.74, 0.82], accent: [0.15, 0.25, 0.55] },
];

export const CC = {
  50:  { label: '50cc',  max: 24, accel: 15, ai: [0.84, 0.93] },
  100: { label: '100cc', max: 30, accel: 18, ai: [0.89, 0.98] },
  150: { label: '150cc', max: 36, accel: 21, ai: [0.94, 1.02] },
};
export const LAP_OPTIONS = [3, 6, 10];
export const MG_EVERY = 3;
export const CHAMP_SPEED = 1.08;

export const ITEM_ICONS = { boost: '⚡', banana: '🍌', rocket: '🚀', star: '⭐' };
export const MG_INFO = {
  coins:    { name: 'Coin Rush',     icon: '🪙', help: 'Drive into coins — grab the most in 20 seconds!' },
  targets:  { name: 'Target Smash',  icon: '🎯', help: 'Press ITEM to fire — hit the most targets!' },
  reaction: { name: 'Quick Draw',    icon: '🚦', help: 'Press ITEM or DRIFT the instant the light turns GREEN! Too early = false start.' },
  bumper:   { name: 'Bumper Karts',  icon: '💥', help: 'Ram rivals off the platform into the lava! It shrinks — last kart standing wins.' },
  colors:   { name: 'Color Chaos',   icon: '🎨', help: 'Park on the called colour before every other tile drops into the lava!' },
  bomb:     { name: 'Hot Bomb',      icon: '💣', help: 'Bump someone to pass the bomb. Don\u2019t be holding it when it blows!' },
};
export const MG_COLORS = [
  { name: 'RED', c: [0.95, 0.22, 0.2] }, { name: 'BLUE', c: [0.22, 0.48, 1] },
  { name: 'YELLOW', c: [1, 0.85, 0.15] }, { name: 'GREEN', c: [0.25, 0.85, 0.32] },
];
export const BUMPER_RADII = [26, 21, 17, 13];
export const TILE = 8;
export const DRIFT_TIERS = [0.85, 1.8, 3.0]; // blue, orange, purple mini-turbos
const OBSTACLES = {
  block: { r: 1.8 }, mover: { r: 2.0 }, crusher: { r: 2.7, period: 4.5 }, geyser: { r: 2.2, period: 5 }, ice: { r: 7 },
};
export const ARENA = { r: 40, off: 3000 };

// Track points: [x, z, widthMultiplier?]. Width multipliers < 1 make narrow squeeze sections.
export const TRACKS = [
  {
    name: 'Meadow Loop', diff: 'Easy', width: 26, gap: 5, scale: 1.55,
    points: [[0, 40], [0, 150], [30, 200], [110, 210], [160, 170], [170, 60], [150, -20], [90, -50], [30, -40], [0, 0]],
    boxes: [0.22, 0.5, 0.78], pads: [{ at: 0.06, lat: 0 }, { at: 0.45, lat: 0 }],
    obstacles: [{ type: 'mover', kind: 'cow', at: 0.33, amp: 0.6, period: 14 }, { type: 'mover', kind: 'cow', at: 0.66, amp: 0.6, period: 16 },
      { type: 'block', kind: 'hay', at: 0.14, lat: -0.55 }, { type: 'block', kind: 'hay', at: 0.58, lat: 0.55 }, { type: 'block', kind: 'hay', at: 0.87, lat: -0.55 }],
    decor: { arches: [0.28, 0.55, 0.82], extras: ['windmill', 'balloon'] },
    theme: {
      ground: [0.42, 0.74, 0.32], offroad: [0.50, 0.64, 0.30], road: [0.35, 0.36, 0.40], road2: [0.38, 0.39, 0.43],
      curbA: [1.00, 0.80, 0.10], curbB: [0.96, 0.96, 0.96], wallA: [0.96, 0.96, 0.96], wallB: [0.95, 0.55, 0.10],
      sky: [0.60, 0.84, 1.00], mountain: [0.45, 0.62, 0.58], scenery: 'trees', cap: [0.97, 0.98, 1],
    },
  },
  {
    name: 'Sunny Circuit', diff: 'Easy', width: 22, scale: 1.55,
    points: [[0, 45], [0, 120], [30, 190], [100, 210], [160, 170], [170, 100], [230, 60], [250, -30], [200, -100], [120, -110], [60, -60], [0, 0]],
    boxes: [0.2, 0.52, 0.8], pads: [{ at: 0.07, lat: 0 }, { at: 0.62, lat: -3 }, { at: 0.9, lat: 3 }],
    obstacles: [{ type: 'block', kind: 'tires', at: 0.13, lat: 0.5 }, { type: 'block', kind: 'cones', at: 0.36, lat: -0.5 },
      { type: 'block', kind: 'tires', at: 0.45, lat: 0.45 }, { type: 'block', kind: 'cones', at: 0.72, lat: -0.5 }],
    decor: { arches: [0.3, 0.68], extras: ['blimp', 'balloon', 'windmill'] },
    theme: {
      ground: [0.36, 0.68, 0.30], offroad: [0.60, 0.50, 0.32], road: [0.33, 0.34, 0.38], road2: [0.36, 0.37, 0.41],
      curbA: [0.90, 0.15, 0.15], curbB: [0.96, 0.96, 0.96], wallA: [0.96, 0.96, 0.96], wallB: [0.20, 0.40, 0.90],
      sky: [0.56, 0.80, 1.00], mountain: [0.42, 0.58, 0.72], scenery: 'trees', cap: [0.97, 0.98, 1],
    },
  },
  {
    name: 'Frosty Speedway', diff: 'Medium', width: 20, scale: 1.7,
    points: [[0, 70], [0, 160], [40, 220], [120, 220], [160, 160], [160, 0, 0.8], [120, -60], [40, -60], [0, 0]],
    boxes: [0.15, 0.45, 0.72], pads: [{ at: 0.05, lat: -3 }, { at: 0.55, lat: 3 }],
    obstacles: [{ type: 'ice', at: 0.28, lat: 0 }, { type: 'ice', at: 0.62, lat: 0.2 }, { type: 'ice', at: 0.86, lat: -0.2 },
      { type: 'block', kind: 'snowman', at: 0.1, lat: 0.5 }, { type: 'block', kind: 'snowman', at: 0.35, lat: -0.55 },
      { type: 'block', kind: 'snowman', at: 0.5, lat: 0.5 }, { type: 'block', kind: 'snowman', at: 0.79, lat: -0.5 }],
    decor: { arches: [0.22, 0.6], extras: ['blimp', 'penguins'] },
    theme: {
      ground: [0.90, 0.94, 1.00], offroad: [0.78, 0.85, 0.94], road: [0.30, 0.32, 0.38], road2: [0.33, 0.35, 0.41],
      curbA: [0.20, 0.50, 0.95], curbB: [1, 1, 1], wallA: [0.30, 0.60, 1.00], wallB: [1, 1, 1],
      sky: [0.74, 0.84, 0.95], mountain: [0.82, 0.88, 0.97], scenery: 'snow', cap: [0.97, 0.98, 1],
    },
  },
  {
    name: 'Canyon Twist', diff: 'Medium', width: 18, scale: 1.55,
    points: [[0, 45], [0, 90], [-40, 150], [-110, 160], [-150, 110], [-120, 50, 0.8], [-60, 30], [-50, -30], [-100, -80], [-60, -150], [20, -160], [80, -110], [70, -40, 0.8], [30, -20], [0, 0]],
    boxes: [0.18, 0.47, 0.76], pads: [{ at: 0.04, lat: 0 }, { at: 0.36, lat: 0 }, { at: 0.66, lat: 0 }],
    obstacles: [{ type: 'mover', kind: 'boulder', at: 0.27, amp: 0.85, period: 6, spin: true }, { type: 'mover', kind: 'boulder', at: 0.57, amp: 0.85, period: 7, spin: true },
      { type: 'mover', kind: 'boulder', at: 0.87, amp: 0.85, period: 6.5, spin: true },
      { type: 'block', kind: 'rock', at: 0.12, lat: -0.55 }, { type: 'block', kind: 'rock', at: 0.42, lat: 0.5 }, { type: 'block', kind: 'rock', at: 0.7, lat: -0.5 }],
    decor: { arches: [0.2, 0.52, 0.8], extras: ['balloon'] },
    theme: {
      ground: [0.86, 0.62, 0.38], offroad: [0.74, 0.48, 0.30], road: [0.40, 0.34, 0.32], road2: [0.43, 0.37, 0.34],
      curbA: [0.96, 0.80, 0.20], curbB: [0.20, 0.20, 0.20], wallA: [0.62, 0.35, 0.20], wallB: [0.92, 0.72, 0.30],
      sky: [0.98, 0.78, 0.58], mountain: [0.74, 0.44, 0.30], scenery: 'desert', cap: null,
    },
  },
  {
    name: 'Lava Peak', diff: 'Hard', width: 16, gap: 8, offroad: 0.35, scale: 1.55,
    points: [[0, 40], [0, 140], [15, 178], [50, 188], [72, 160], [72, 110, 0.65], [72, 60], [88, 22], [122, 16], [142, 45], [142, 150],
      [170, 200], [230, 205], [255, 155], [240, 70], [212, 30, 0.7], [232, -15], [200, -70], [120, -90], [60, -82], [22, -42], [0, 0]],
    boxes: [0.16, 0.42, 0.62, 0.84], pads: [{ at: 0.3, lat: 0 }, { at: 0.55, lat: 0 }],
    obstacles: [{ type: 'crusher', at: 0.09, lat: -0.45 }, { type: 'crusher', at: 0.09, lat: 0.45, off: 2.25 }, { type: 'crusher', at: 0.78, lat: 0 },
      { type: 'geyser', at: 0.36, lat: -0.4 }, { type: 'geyser', at: 0.48, lat: 0.4, off: 2.5 }, { type: 'geyser', at: 0.72, lat: 0 }, { type: 'geyser', at: 0.92, lat: -0.4, off: 1.2 }],
    decor: { arches: [0.25, 0.66], extras: ['embers'] },
    theme: {
      ground: [0.24, 0.19, 0.19], offroad: [0.36, 0.21, 0.16], road: [0.28, 0.26, 0.28], road2: [0.31, 0.29, 0.31],
      curbA: [1.00, 0.45, 0.05], curbB: [0.15, 0.15, 0.15], wallA: [0.90, 0.30, 0.10], wallB: [0.20, 0.20, 0.20],
      sky: [0.62, 0.36, 0.32], mountain: [0.36, 0.22, 0.20], scenery: 'volcano', cap: [1, 0.42, 0.06],
    },
  },
  {
    name: 'Crystal Cliffs', diff: 'Hard', width: 15, gap: 9, offroad: 0.35, scale: 1.55,
    points: [[0, 40], [0, 110], [-28, 150], [8, 195], [-22, 240], [15, 285], [80, 300], [120, 260], [95, 210, 0.65], [128, 160], [104, 108], [145, 62],
      [160, 0], [125, -55], [75, -70, 0.7], [40, -40], [0, 0]],
    boxes: [0.14, 0.4, 0.62, 0.86], pads: [{ at: 0.03, lat: 0 }, { at: 0.48, lat: 0 }, { at: 0.74, lat: 0 }],
    obstacles: [{ type: 'crusher', at: 0.2, lat: 0 }, { type: 'crusher', at: 0.55, lat: -0.4, off: 1.5 },
      { type: 'block', kind: 'crystal', at: 0.08, lat: 0.5 }, { type: 'block', kind: 'crystal', at: 0.3, lat: -0.5 },
      { type: 'block', kind: 'crystal', at: 0.68, lat: 0.5 }, { type: 'block', kind: 'crystal', at: 0.93, lat: -0.45 },
      { type: 'geyser', kind: 'zap', at: 0.44, lat: 0.4 }, { type: 'geyser', kind: 'zap', at: 0.8, lat: -0.4, off: 2 }],
    decor: { arches: [0.26, 0.58], extras: ['crystals'] },
    theme: {
      ground: [0.30, 0.27, 0.46], offroad: [0.42, 0.36, 0.58], road: [0.25, 0.24, 0.32], road2: [0.28, 0.27, 0.35],
      curbA: [0.20, 0.90, 0.90], curbB: [0.95, 0.40, 0.90], wallA: [0.60, 0.30, 0.90], wallB: [0.20, 0.90, 0.90],
      sky: [0.34, 0.33, 0.58], mountain: [0.44, 0.38, 0.64], scenery: 'crystal', cap: [0.8, 0.95, 1],
    },
  },
];

export function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
export function wrapAngle(a) {
  while (a > Math.PI) a -= 2 * Math.PI;
  while (a < -Math.PI) a += 2 * Math.PI;
  return a;
}
const cr = (p0, p1, p2, p3, t) => {
  const t2 = t * t, t3 = t2 * t;
  return 0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
};
const r2 = (v) => Math.round(v * 100) / 100;
const r3 = (v) => Math.round(v * 1000) / 1000;

// ---------------------------------------------------------------- Track
export class Track {
  constructor(def) {
    this.def = def;
    this.half = def.width / 2;
    this.gap = def.gap ?? 4.5;
    this.offroadMul = def.offroad ?? 0.45;
    const s = def.scale || 1;
    const pts = def.points.map((p) => [p[0] * s, p[1] * s, p[2] ?? 1]);
    const n = pts.length, SUB = 48, dense = [];
    for (let i = 0; i < n; i++) {
      const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
      for (let j = 0; j < SUB; j++) {
        const t = j / SUB, st = t * t * (3 - 2 * t);
        dense.push([cr(p0[0], p1[0], p2[0], p3[0], t), cr(p0[1], p1[1], p2[1], p3[1], t), p1[2] + (p2[2] - p1[2]) * st]);
      }
    }
    const L = dense.length, cum = new Float64Array(L + 1);
    for (let i = 1; i <= L; i++) {
      const a = dense[i - 1], b = dense[i % L];
      cum[i] = cum[i - 1] + Math.hypot(b[0] - a[0], b[1] - a[1]);
    }
    this.length = cum[L];
    const N = (this.N = Math.round(this.length / 1.5));
    this.ds = this.length / N;
    const px = (this.px = new Float32Array(N)), pz = (this.pz = new Float32Array(N));
    this.hw = new Float32Array(N);
    let j = 0;
    for (let k = 0; k < N; k++) {
      const d = k * this.ds;
      while (cum[j + 1] < d) j++;
      const t = (d - cum[j]) / (cum[j + 1] - cum[j] || 1);
      const a = dense[j], b = dense[(j + 1) % L];
      px[k] = a[0] + (b[0] - a[0]) * t;
      pz[k] = a[1] + (b[1] - a[1]) * t;
      this.hw[k] = this.half * (a[2] + (b[2] - a[2]) * t);
    }
    this.tx = new Float32Array(N); this.tz = new Float32Array(N);
    this.nx = new Float32Array(N); this.nz = new Float32Array(N);
    this.ang = new Float32Array(N);
    let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity, maxHw = 0;
    for (let k = 0; k < N; k++) {
      const a = (k - 1 + N) % N, b = (k + 1) % N;
      let dx = px[b] - px[a], dz = pz[b] - pz[a];
      const l = Math.hypot(dx, dz) || 1; dx /= l; dz /= l;
      this.tx[k] = dx; this.tz[k] = dz;
      this.nx[k] = dz; this.nz[k] = -dx;
      this.ang[k] = Math.atan2(dx, dz);
      minX = Math.min(minX, px[k]); maxX = Math.max(maxX, px[k]);
      minZ = Math.min(minZ, pz[k]); maxZ = Math.max(maxZ, pz[k]);
      maxHw = Math.max(maxHw, this.hw[k]);
    }
    this.wallMax = maxHw + this.gap;
    this.bounds = { minX, maxX, minZ, maxZ };
    this.cx = (minX + maxX) / 2; this.cz = (minZ + maxZ) / 2;
    this.radius = Math.max(maxX - minX, maxZ - minZ) / 2;
    this.ax = this.cx; this.az = this.cz + ARENA.off; // mini-game arena centre
  }
  wall(i) { return this.hw[i] + this.gap; }
  wrap(i) { const N = this.N; return ((Math.round(i) % N) + N) % N; }
  idiff(a, b) { const N = this.N; let d = a - b; if (d > N / 2) d -= N; if (d < -N / 2) d += N; return d; }
  nearest(x, z, hint, win = 40) {
    let best = hint, bd = Infinity;
    for (let o = -win; o <= win; o++) {
      const i = this.wrap(hint + o), dx = x - this.px[i], dz = z - this.pz[i], d = dx * dx + dz * dz;
      if (d < bd) { bd = d; best = i; }
    }
    return best;
  }
  distToTrack(x, z) {
    let bd = Infinity;
    for (let i = 0; i < this.N; i += 2) {
      const dx = x - this.px[i], dz = z - this.pz[i], d = dx * dx + dz * dz;
      if (d < bd) bd = d;
    }
    return Math.sqrt(bd);
  }
  lateral(i, x, z) { return (x - this.px[i]) * this.nx[i] + (z - this.pz[i]) * this.nz[i]; }
  point(i, lat = 0) { i = this.wrap(i); return [this.px[i] + this.nx[i] * lat, this.pz[i] + this.nz[i] * lat]; }
  bend(i, dist) { const j = this.wrap(i + dist / this.ds); return wrapAngle(this.ang[j] - this.ang[this.wrap(i)]); }
}

// Colour tiles for Color Chaos: a grid inside the round arena (same on every device).
export function arenaTiles(T) {
  if (T._tiles) return T._tiles;
  const out = [], map = new Map(), n = Math.ceil(ARENA.r / TILE);
  for (let gx = -n; gx < n; gx++) for (let gz = -n; gz < n; gz++) {
    const cx = (gx + 0.5) * TILE, cz = (gz + 0.5) * TILE;
    if (Math.hypot(cx, cz) > ARENA.r - 3) continue;
    map.set(gx * 100 + gz, out.length);
    out.push({ gx, gz, x: T.ax + cx, z: T.az + cz });
  }
  T._tileMap = map;
  return (T._tiles = out);
}
export function tileAt(T, x, z) {
  arenaTiles(T);
  const i = T._tileMap.get(Math.floor((x - T.ax) / TILE) * 100 + Math.floor((z - T.az) / TILE));
  return i == null ? -1 : i;
}

// ---------------------------------------------------------------- Kart
const NO_INPUT = { steer: 0, gas: false, brake: false, drift: false, item: false };

class Kart {
  constructor(id, racerIndex) {
    this.id = id; this.racerIndex = racerIndex; this.racer = RACERS[racerIndex]; this.name = this.racer.name;
    this.human = false; this.pid = 0; this.ctrl = 'ai'; this.connected = true;
    this.x = 0; this.z = 0; this.vx = 0; this.vz = 0; this.h = 0; this.speed = 0; this.lat = 0;
    this.idx = 0; this.lap = 0; this.finished = false; this.finishTime = 0; this.place = id + 1;
    this.items = []; this.rolls = []; this.itemQueued = false;
    this.drift = 0; this.driftCharge = 0; this.boost = 0; this.star = 0; this.spin = 0; this.hop = 0;
    this.offroad = false; this.skill = 1; this.rubber = 1; this.wrongWay = 0;
    this.champ = false; this.tp = 0; this.mgScore = 0; this.react = null; this.shotCd = 0; this.prevMg = false; this.stAge = 9;
    this.out = false; this.outRank = 0; this.bombTime = 0; this.onIce = false;
    this.prevDrift = false; this.prevItem = false; this.prevGas = false; this.gasStartT = -1;
    this.input = { steer: 0, gas: false, brake: false, drift: false, item: false };
    this.ai = { lane: 0, laneTarget: 0, laneTimer: 0, itemDelay: 0, driftHold: 0, stuck: 0, reverse: 0,
      driftDecided: false, wantDrift: false, driftSkill: 0.7, startT: 0, react: 0.3, aim: 0, avoid: null, avoidT: 0, tile: -1, decideAt: 0 };
  }
  get rolling() { return this.rolls.length > 0; }
}

// ---------------------------------------------------------------- Race
// mode: 'solo' (humans driven locally), 'server' (humans send their state), 'client' (online view), 'demo' (all AI)
export class Race {
  constructor(opts = {}) {
    const { trackIndex = 0, cc = 100, laps = 10, seed = (Date.now() & 0xffffff), localPid = 0 } = opts;
    this.mode = opts.allAI ? 'demo' : opts.mode || 'solo';
    this.client = this.mode === 'client';
    this.allAI = this.mode === 'demo';
    this.rand = mulberry32(seed);
    this.trackIndex = trackIndex;
    this.def = TRACKS[trackIndex];
    this.track = new Track(this.def);
    this.cc = cc; this.cfg = CC[cc]; this.laps = laps; this.mgEvery = opts.mgEvery ?? MG_EVERY;
    this.time = 0; this.countdown = 4; this.state = 'countdown';
    this.events = []; this.finishOrder = [];
    this.bananas = []; this.rockets = [];
    this.mg = null; this.mgDone = new Set(); this.mgPending = false; this.lastMg = null;

    const T = this.track, r = this.rand;
    const humans = this.allAI ? [] : (opts.humans && opts.humans.length ? opts.humans : [{ name: opts.playerName || 'You', racer: opts.playerRacer ?? 0, pid: 0 }]).slice(0, 8);
    const used = new Set(humans.map((h) => h.racer));
    const others = RACERS.map((_, i) => i).filter((i) => !used.has(i));
    for (let i = others.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [others[i], others[j]] = [others[j], others[i]]; }
    const HUMAN_SLOTS = [5, 6, 7, 4, 3, 2, 1, 0], humanAt = new Map();
    humans.forEach((h, i) => humanAt.set(HUMAN_SLOTS[i], h));
    this.karts = [];
    let o = 0;
    for (let slot = 0; slot < 8; slot++) {
      const h = humanAt.get(slot);
      const k = new Kart(slot, h ? h.racer : others[o++ % others.length]);
      if (h) {
        k.human = true; k.pid = h.pid; k.name = h.name || k.racer.name;
        k.ctrl = this.mode === 'server' ? 'remote' : this.client ? (h.pid === localPid ? 'local' : 'net') : 'local';
      } else k.ctrl = this.client ? 'net' : 'ai';
      const row = Math.floor(slot / 2), col = slot % 2;
      const idx = T.wrap(T.N - (6 + row * 5.5) / T.ds);
      const lat = (col ? -1 : 1) * T.hw[idx] * 0.45;
      [k.x, k.z] = T.point(idx, lat);
      k.idx = idx; k.h = T.ang[idx]; k.lap = 0;
      if (!h) {
        const [lo, hi] = this.cfg.ai;
        k.skill = lo + (hi - lo) * (1 - slot / 8) * 0.7 + (hi - lo) * 0.3 * r();
        k.ai.driftSkill = 0.4 + 0.6 * r();
        k.ai.startT = 0.2 + r() * 1.8;
        k.ai.lane = lat; k.ai.laneTarget = lat;
      }
      this.karts.push(k);
    }
    this.player = this.client ? this.karts.find((k) => k.ctrl === 'local') : this.karts.find((k) => k.human) || this.karts[5];

    this.boxes = [];
    for (const f of this.def.boxes) {
      const idx = T.wrap(f * T.N);
      for (const l of [-0.6, -0.2, 0.2, 0.6]) {
        const [x, z] = T.point(idx, l * T.hw[idx]);
        this.boxes.push({ x, z, active: true, timer: 0 });
      }
    }
    this.pads = this.def.pads.map((p) => ({ idx: T.wrap(p.at * T.N), lat: p.lat, len: Math.round(3 / T.ds) }));
    this.obstacles = (this.def.obstacles || []).map((o, i) => {
      const idx = T.wrap(o.at * T.N), ob = { ...OBSTACLES[o.type], ...o, idx, off: o.off ?? i * 1.37 };
      [ob.x, ob.z] = T.point(idx, (o.lat ?? 0) * T.hw[idx]);
      return ob;
    });
    this.rank();
  }

  ev(type, k, extra) { this.events.push({ type, k, ...extra }); }
  progress(k) { return k.lap * this.track.N + k.idx; }
  kartByPid(pid) { return this.karts.find((k) => k.human && k.pid === pid); }

  step(dt) {
    if (this.state === 'countdown') { this.stepCountdown(dt, (k) => k.ctrl === 'ai' || k.ctrl === 'local'); return; }
    if (this.state === 'minigame') { this.stepMinigame(dt); return; }
    this.time += dt;
    for (const k of this.karts) if (k.ctrl === 'ai' || (k.ctrl === 'local' && k.finished)) this.aiDrive(k, dt);
    for (const k of this.karts) {
      if (k.ctrl === 'remote') this.remoteUpdate(k, dt);
      else this.physics(k, dt);
      this.hazards(k);
    }
    this.collideKarts();
    this.updateItems(dt);
    this.rank();
    if (this.mgPending) { this.mgPending = false; this.startMinigame(); }
  }

  stepCountdown(dt, drives) {
    const prev = this.countdown;
    this.countdown -= dt;
    for (const k of this.karts) {
      if (!drives(k)) continue;
      if (k.ctrl === 'ai') this.aiDrive(k, dt);
      if (k.input.gas && !k.prevGas) k.gasStartT = this.countdown;
      if (!k.input.gas) k.gasStartT = -1;
      k.prevGas = k.input.gas;
      k.prevItem = k.input.item; k.prevDrift = k.input.drift;
    }
    const c = Math.ceil(this.countdown);
    if (c !== Math.ceil(prev) && c > 0 && c <= 3) this.ev('count', null, { n: c });
    if (this.countdown <= 0) {
      this.state = 'racing';
      this.ev('go');
      for (const k of this.karts) {
        // Rocket start: press gas during the "1" of the countdown.
        if (drives(k) && k.input.gas && k.gasStartT > 0 && k.gasStartT <= 1.0) { k.boost = 1.0; this.ev('startboost', k); }
      }
    }
  }

  // Online client: only simulate our own kart; everything else comes from server snapshots.
  stepClient(dt) {
    const me = this.player;
    if (!me) return;
    if (this.state === 'countdown') { this.stepCountdown(dt, (k) => k === me); return; }
    if (this.state === 'racing') {
      if (me.finished) this.aiDrive(me, dt);
      this.time += dt;
      this.physics(me, dt);
      this.collideLocal(me);
    } else if (this.state === 'minigame' && this.mg && this.mg.phase === 'play' && this.mg.type !== 'reaction' && !me.out) {
      this.physics(me, dt);
      this.collideLocal(me);
    }
  }

  physics(k, dt) {
    const T = this.track, cfg = this.cfg;
    const inp = k.spin > 0 ? NO_INPUT : k.input;
    let fx = Math.sin(k.h), fz = Math.cos(k.h);
    let fwd = k.vx * fx + k.vz * fz;
    let lat = k.vx * fz - k.vz * fx;

    k.boost = Math.max(0, k.boost - dt);
    k.star = Math.max(0, k.star - dt);
    k.hop = Math.max(0, k.hop - dt);

    let max = cfg.max * k.skill * k.rubber;
    if (k.offroad && k.boost <= 0 && k.star <= 0) max *= T.offroadMul;
    if (k.star > 0) max *= 1.15;
    if (k.champ) max *= CHAMP_SPEED;
    if (this.mg && this.mg.bomb === k) max *= 1.12; // bomb holder gets a burst to chase
    if (k.boost > 0) max *= 1.35;

    if (k.spin > 0) {
      k.spin -= dt;
      fwd *= Math.exp(-2.5 * dt);
    } else if (k.boost > 0) {
      fwd += (max - fwd) * Math.min(1, 6 * dt);
    } else if (inp.gas) {
      if (fwd < max) fwd = Math.min(max, fwd + cfg.accel * dt * (fwd < 0 ? 2 : 1) * (1 - 0.5 * Math.max(0, fwd) / max));
    } else if (inp.brake) {
      fwd = fwd > 0 ? Math.max(0, fwd - 38 * dt) : Math.max(-9, fwd - 12 * dt);
    } else {
      fwd *= Math.exp(-0.6 * dt);
    }
    if (fwd > max && k.boost <= 0) fwd -= (fwd - max) * 2.5 * dt;

    // Drifting & mini-turbos
    const pressedDrift = inp.drift && !k.prevDrift;
    k.prevDrift = inp.drift;
    if (pressedDrift && k.spin <= 0) { k.hop = 0.22; this.ev('hop', k); }
    if (k.drift === 0) {
      if (inp.drift && Math.abs(inp.steer) > 0.22 && fwd > 10 && k.spin <= 0) { k.drift = Math.sign(inp.steer); k.driftCharge = 0; }
    } else if (!inp.drift || fwd < 8 || k.spin > 0) {
      if (k.spin <= 0) {
        const c = k.driftCharge;
        if (c >= DRIFT_TIERS[2]) { k.boost = Math.max(k.boost, 1.6); this.ev('miniturbo', k, { level: 3 }); }
        else if (c >= DRIFT_TIERS[1]) { k.boost = Math.max(k.boost, 1.1); this.ev('miniturbo', k, { level: 2 }); }
        else if (c >= DRIFT_TIERS[0]) { k.boost = Math.max(k.boost, 0.6); this.ev('miniturbo', k, { level: 1 }); }
      }
      k.drift = 0; k.driftCharge = 0;
    } else {
      k.driftCharge += dt * (1.0 + 0.9 * Math.max(0, inp.steer * k.drift)) * (k.offroad ? 0.5 : k.onIce ? 1.3 : 1);
    }

    // Steering (steer > 0 = right = decreasing heading)
    const sf = clamp(Math.abs(fwd) / 10, 0, 1) * (fwd < 0 ? -1 : 1);
    // Drift: steer into the turn to tighten, away to widen. Normal steering softens at high speed.
    const s = k.drift ? k.drift * (0.95 + 0.55 * inp.steer * k.drift) : inp.steer;
    const rate = k.drift ? 1.75 : 2.35 - 0.75 * clamp(fwd / cfg.max, 0, 1);
    k.h = wrapAngle(k.h - s * rate * sf * dt);
    fx = Math.sin(k.h); fz = Math.cos(k.h);
    const latTarget = k.drift ? k.drift * fwd * 0.18 : 0;
    lat += (latTarget - lat) * (1 - Math.exp(-(k.drift ? 3 : k.onIce ? 1.3 : 10) * dt));
    k.vx = fx * fwd + fz * lat;
    k.vz = fz * fwd - fx * lat;
    k.x += k.vx * dt; k.z += k.vz * dt;
    k.speed = fwd;

    if (this.state === 'minigame') { this.arenaConstrain(k); return; }

    // Track constraints
    const oldIdx = k.idx;
    const i = (k.idx = T.nearest(k.x, k.z, k.idx));
    const l = (k.lat = T.lateral(i, k.x, k.z));
    k.offroad = Math.abs(l) > T.hw[i] + 1.2;
    const lim = T.wall(i) - 1.0;
    if (Math.abs(l) > lim) {
      const sg = Math.sign(l), over = l - sg * lim;
      k.x -= T.nx[i] * over; k.z -= T.nz[i] * over;
      const vn = k.vx * T.nx[i] + k.vz * T.nz[i];
      if (vn * sg > 0) {
        k.vx -= T.nx[i] * vn * 1.15; k.vz -= T.nz[i] * vn * 1.15;
        k.vx *= 0.97; k.vz *= 0.97;
        if (Math.abs(vn) > 6) this.ev('bump', k);
      }
    }
    this.obstacleCollide(k);
    this.lapCheck(k, oldIdx);
    const along = fx * T.tx[i] + fz * T.tz[i];
    k.wrongWay = along < -0.3 && fwd > 3 ? k.wrongWay + dt : 0;

    for (const p of this.pads) {
      if (Math.abs(T.idiff(k.idx, p.idx)) <= p.len && Math.abs(l - p.lat) < 2.6) {
        if (k.boost < 0.5) this.ev('pad', k);
        k.boost = Math.max(k.boost, 0.9);
      }
    }
  }

  arenaConstrain(k) {
    const T = this.track, dx = k.x - T.ax, dz = k.z - T.az, d = Math.hypot(dx, dz), lim = ARENA.r - 1.2;
    k.offroad = false; k.onIce = false;
    if (this.mg && this.mg.type === 'bumper') return;
    if (d > lim) {
      const nx = dx / d, nz = dz / d;
      k.x = T.ax + nx * lim; k.z = T.az + nz * lim;
      const vn = k.vx * nx + k.vz * nz;
      if (vn > 0) { k.vx -= nx * vn * 1.4; k.vz -= nz * vn * 1.4; if (vn > 6) this.ev('bump', k); }
    }
  }

  lapCheck(k, oldIdx) {
    if (this.client) return;
    const N = this.track.N;
    if (oldIdx > N * 0.75 && k.idx < N * 0.25) {
      k.lap++;
      if (k.lap > this.laps && !k.finished) {
        k.finished = true; k.finishTime = this.time; this.finishOrder.push(k); this.ev('finish', k);
      } else if (k.lap > 1 && !k.finished) {
        this.ev('lap', k);
        const done = k.lap - 1;
        if (done % this.mgEvery === 0 && done < this.laps && !this.mgDone.has(done)) { this.mgDone.add(done); this.mgPending = true; }
      }
    } else if (oldIdx < N * 0.25 && k.idx > N * 0.75) k.lap--;
  }

  // Server side: humans report their own kart state; we dead-reckon between updates.
  setRemoteState(k, st) {
    if (!k || k.ctrl !== 'remote' || st.tp !== k.tp || k.out) return;
    const f = (v) => typeof v === 'number' && isFinite(v);
    if (![st.x, st.z, st.h, st.vx, st.vz].every(f)) return;
    k.x = st.x; k.z = st.z; k.h = st.h; k.vx = st.vx; k.vz = st.vz;
    if (f(st.sp)) k.speed = st.sp;
    k.drift = Math.sign(st.d || 0); k.driftCharge = f(st.dc) ? st.dc : 0;
    k.hop = f(st.hop) ? st.hop : 0; k.boost = f(st.b) ? st.b : 0;
    k.stAge = 0;
  }
  remoteUpdate(k, dt) {
    k.spin = Math.max(0, k.spin - dt); k.star = Math.max(0, k.star - dt); k.hop = Math.max(0, k.hop - dt); k.boost = Math.max(0, k.boost - dt);
    k.stAge += dt;
    if (k.stAge < 0.3) { k.x += k.vx * dt; k.z += k.vz * dt; }
    if (this.state === 'minigame') { this.arenaConstrain(k); return; }
    const T = this.track, oldIdx = k.idx;
    k.idx = T.nearest(k.x, k.z, k.idx);
    k.lat = T.lateral(k.idx, k.x, k.z);
    k.offroad = Math.abs(k.lat) > T.hw[k.idx] + 1.2;
    this.lapCheck(k, oldIdx);
  }
  setReact(k, v) {
    const mg = this.mg;
    if (!mg || mg.type !== 'reaction' || mg.phase !== 'play' || !k || k.react != null) return;
    k.react = typeof v === 'number' && isFinite(v) ? clamp(v, 0.05, 9) : 9;
    this.ev('react', k);
  }

  // ---------------------------------------------------------------- Obstacles
  // All obstacle motion is a pure function of race time, so every device sees the same thing.
  obstacleState(o, t) {
    const T = this.track;
    switch (o.type) {
      case 'mover': {
        const lat = Math.sin(((t + o.off) * 2 * Math.PI) / o.period) * o.amp * T.hw[o.idx];
        const [x, z] = T.point(o.idx, lat);
        return { x, z, y: 0, solid: true, hazard: !!o.spin, lat };
      }
      case 'crusher': {
        const p = (((t + o.off) % o.period) + o.period) % o.period;
        let y;
        if (p < 2) y = 6; else if (p < 2.3) { const f = (p - 2) / 0.3; y = 6 * (1 - f * f); } else if (p < 3.3) y = 0; else y = (6 * (p - 3.3)) / 1.2;
        return { x: o.x, z: o.z, y, solid: y < 1.8, hazard: p >= 2.2 && p < 2.42, shake: p > 1.4 && p < 2 };
      }
      case 'geyser': {
        const p = (((t + o.off) % o.period) + o.period) % o.period;
        return { x: o.x, z: o.z, y: 0, solid: false, hazard: p > 3.4 && p < 4.8, warn: p > 2.5 && p <= 3.4, active: p > 3.4 && p < 4.8 };
      }
      default: return { x: o.x, z: o.z, y: 0, solid: o.type === 'block', hazard: false };
    }
  }
  obstacleCollide(k) {
    const T = this.track;
    k.onIce = false;
    for (const o of this.obstacles) {
      if (Math.abs(T.idiff(o.idx, k.idx)) * T.ds > 30) continue;
      const s = this.obstacleState(o, this.time);
      const dx = k.x - s.x, dz = k.z - s.z, d2 = dx * dx + dz * dz;
      if (o.type === 'ice') { if (d2 < o.r * o.r) k.onIce = true; continue; }
      const R = o.r + 1.1;
      if (!s.solid || d2 >= R * R || d2 < 1e-6) continue;
      const d = Math.sqrt(d2), nx = dx / d, nz = dz / d;
      k.x = s.x + nx * R; k.z = s.z + nz * R;
      const vn = k.vx * nx + k.vz * nz;
      if (vn < 0) { k.vx -= nx * vn * 1.5; k.vz -= nz * vn * 1.5; k.vx *= 0.85; k.vz *= 0.85; if (vn < -5) this.ev('bump', k); }
    }
  }
  hazards(k) {
    if (k.spin > 0 || k.star > 0 || !this.obstacles.length) return;
    const T = this.track;
    for (const o of this.obstacles) {
      if (Math.abs(T.idiff(o.idx, k.idx)) * T.ds > 12) continue;
      const s = this.obstacleState(o, this.time);
      if (!s.hazard || Math.hypot(k.x - s.x, k.z - s.z) > o.r + 1.2) continue;
      if (this.spinOut(k)) this.ev('hazard', k, { x: s.x, z: s.z, mgType: o.type });
      return;
    }
  }
  aiAvoid(k, spd, dt) {
    const T = this.track, a = k.ai, look = 16 + spd * 0.9;
    a.avoidT -= dt;
    let best = null, bd = Infinity;
    for (const o of this.obstacles) {
      if (o.type === 'ice') continue;
      const di = T.idiff(o.idx, k.idx) * T.ds;
      if (di < 1 || di > look || di >= bd) continue;
      best = o; bd = di;
    }
    if (!best) { if (a.avoidT <= 0) a.avoid = null; return; }
    const s = this.obstacleState(best, this.time + bd / Math.max(spd, 8));
    const olat = T.lateral(best.idx, s.x, s.z), need = best.r + 2.8, cur = a.avoid ?? a.lane, lim = T.hw[best.idx] * 0.8;
    if (Math.abs(cur - olat) >= need && a.avoid == null) return;
    let side = Math.sign(cur - olat) || (this.rand() < 0.5 ? -1 : 1);
    let tgt = olat + side * need;
    if (Math.abs(tgt) > lim) tgt = olat - side * need;
    a.avoid = clamp(tgt, -lim, lim); a.avoidT = 0.6;
  }
  bounceMul() { return this.state === 'minigame' && this.mg && this.mg.type === 'bumper' ? 2.3 : 1; }

  spinOut(k) {
    if (k.star > 0 || k.spin > 0) return false;
    k.spin = 1.3; k.drift = 0; k.driftCharge = 0; k.boost = 0;
    k.vx *= 0.35; k.vz *= 0.35;
    this.ev('spin', k);
    return true;
  }

  collideKarts() {
    const ks = this.karts, R = 2.3;
    for (let i = 0; i < ks.length; i++) for (let j = i + 1; j < ks.length; j++) {
      const a = ks[i], b = ks[j];
      if (a.out || b.out) continue;
      const dx = b.x - a.x, dz = b.z - a.z, d2 = dx * dx + dz * dz;
      if (d2 >= R * R || d2 < 1e-6) continue;
      if (a.star > 0 && b.star <= 0) this.spinOut(b);
      else if (b.star > 0 && a.star <= 0) this.spinOut(a);
      const ar = a.ctrl === 'remote', br = b.ctrl === 'remote';
      if (ar && br) continue; // each online player resolves their own bumps
      const wa = ar ? 0 : br ? 1 : 0.5, wb = 1 - wa;
      const d = Math.sqrt(d2), nx = dx / d, nz = dz / d, ov = R - d;
      a.x -= nx * ov * wa; a.z -= nz * ov * wa; b.x += nx * ov * wb; b.z += nz * ov * wb;
      const rv = (b.vx - a.vx) * nx + (b.vz - a.vz) * nz, bounce = this.bounceMul();
      if (rv < 0) {
        a.vx += nx * rv * wa * bounce; a.vz += nz * rv * wa * bounce; b.vx -= nx * rv * wb * bounce; b.vz -= nz * rv * wb * bounce;
        if (rv < -4) this.ev('bump', a.ctrl === 'local' ? a : b);
      }
    }
  }
  collideLocal(me) {
    const R = 2.3;
    for (const o of this.karts) {
      if (o === me || o.out) continue;
      const dx = o.x - me.x, dz = o.z - me.z, d2 = dx * dx + dz * dz;
      if (d2 >= R * R || d2 < 1e-6) continue;
      const d = Math.sqrt(d2), nx = dx / d, nz = dz / d, ov = R - d;
      me.x -= nx * ov; me.z -= nz * ov;
      const rv = (o.vx - me.vx) * nx + (o.vz - me.vz) * nz;
      if (rv < 0) { const bm = 0.6 * this.bounceMul(); me.vx += nx * rv * bm; me.vz += nz * rv * bm; if (rv < -4) this.ev('bump', me); }
    }
  }

  rollItem(k) {
    const p = (k.place - 1) / (this.karts.length - 1);
    const w = { banana: 1.5 - p * 1.2, boost: 0.6 + p, rocket: 0.4 + p * 0.8, star: p > 0.4 ? (p - 0.4) * 1.5 : 0 };
    let total = 0; for (const key in w) total += w[key];
    let x = this.rand() * total;
    for (const key in w) { x -= w[key]; if (x <= 0) return key; }
    return 'banana';
  }
  giveItem(k) {
    if (k.items.length + k.rolls.length >= 2) return false;
    k.rolls.push({ t: k.rolls.length ? k.rolls[k.rolls.length - 1].t + 0.6 : 1.1, item: this.rollItem(k) });
    return true;
  }

  useItem(k) {
    const it = k.items.shift();
    const fx = Math.sin(k.h), fz = Math.cos(k.h);
    if (it === 'boost') { k.boost = Math.max(k.boost, 1.3); this.ev('boost', k); }
    else if (it === 'banana') {
      this.bananas.push({ x: k.x - fx * 2.8, z: k.z - fz * 2.8, owner: k, age: 0 });
      if (this.bananas.length > 30) this.bananas.shift();
      this.ev('drop', k);
    } else if (it === 'rocket') {
      const target = this.karts.find((o) => o.place === k.place - 1) || null;
      this.rockets.push({ x: k.x + fx * 2.5, z: k.z + fz * 2.5, h: k.h, idx: k.idx, target, owner: k, age: 0 });
      this.ev('rocket', k);
    } else if (it === 'star') { k.star = 7; this.ev('star', k); }
  }

  updateItems(dt) {
    const T = this.track;
    for (const b of this.boxes) {
      if (!b.active) { b.timer -= dt; if (b.timer <= 0) b.active = true; continue; }
      for (const k of this.karts) {
        const dx = k.x - b.x, dz = k.z - b.z;
        if (dx * dx + dz * dz < 2.4 * 2.4) {
          b.active = false; b.timer = 3;
          this.ev('box', k, { x: b.x, z: b.z });
          if (!k.finished) this.giveItem(k);
          break;
        }
      }
    }
    for (const k of this.karts) {
      for (const r of k.rolls) r.t -= dt;
      while (k.rolls.length && k.rolls[0].t <= 0) {
        k.items.push(k.rolls.shift().item);
        k.ai.itemDelay = 0.8 + this.rand() * 3;
        this.ev('itemready', k);
      }
      const pressed = (k.input.item && !k.prevItem) || k.itemQueued;
      k.prevItem = k.input.item; k.itemQueued = false;
      if (pressed && k.items.length && k.spin <= 0) this.useItem(k);
    }
    for (let i = this.bananas.length - 1; i >= 0; i--) {
      const b = this.bananas[i]; b.age += dt;
      for (const k of this.karts) {
        if (k === b.owner && b.age < 0.6) continue;
        const dx = k.x - b.x, dz = k.z - b.z;
        if (dx * dx + dz * dz < 1.9 * 1.9) {
          this.bananas.splice(i, 1);
          this.spinOut(k);
          this.ev('splat', k, { x: b.x, z: b.z });
          break;
        }
      }
    }
    for (let i = this.rockets.length - 1; i >= 0; i--) {
      const r = this.rockets[i]; r.age += dt;
      let tx, tz;
      const t = r.target;
      if (t && !t.finished && Math.hypot(t.x - r.x, t.z - r.z) < 45) { tx = t.x; tz = t.z; }
      else [tx, tz] = T.point(r.idx + 14 / T.ds, 0);
      const dA = wrapAngle(Math.atan2(tx - r.x, tz - r.z) - r.h);
      r.h = wrapAngle(r.h + clamp(dA, -5 * dt, 5 * dt));
      r.x += Math.sin(r.h) * 52 * dt; r.z += Math.cos(r.h) * 52 * dt;
      r.idx = T.nearest(r.x, r.z, r.idx);
      const l = T.lateral(r.idx, r.x, r.z), lim = T.wall(r.idx) - 0.5;
      if (Math.abs(l) > lim) { const over = l - Math.sign(l) * lim; r.x -= T.nx[r.idx] * over; r.z -= T.nz[r.idx] * over; }
      let hit = false;
      for (const k of this.karts) {
        if (k === r.owner && r.age < 0.5) continue;
        const dx = k.x - r.x, dz = k.z - r.z;
        if (dx * dx + dz * dz < 2.2 * 2.2) { this.spinOut(k); hit = true; break; }
      }
      if (hit || r.age > 6) { this.rockets.splice(i, 1); this.ev('explode', r.owner, { x: r.x, z: r.z }); }
    }
  }

  rank() {
    const sorted = [...this.karts].sort((a, b) => {
      if (a.finished && b.finished) return a.finishTime - b.finishTime;
      if (a.finished) return -1;
      if (b.finished) return 1;
      return this.progress(b) - this.progress(a);
    });
    sorted.forEach((k, i) => (k.place = i + 1));
    this.sorted = sorted;
    // Rubber-banding keeps the AI pack close to the best-placed human still racing.
    const lead = sorted.find((k) => k.human && k.connected && !k.finished);
    for (const k of this.karts) {
      if (k.human || !lead || this.allAI) { k.rubber = 1; continue; }
      const gap = (this.progress(lead) - this.progress(k)) * this.track.ds;
      k.rubber = 1 + clamp(gap / 1200, -0.06, 0.12);
    }
  }

  aiDrive(k, dt) {
    const T = this.track, a = k.ai, inp = k.input, r = this.rand;
    if (this.state === 'countdown') {
      inp.gas = this.countdown < a.startT; inp.steer = 0; inp.brake = false; inp.drift = false; inp.item = false;
      return;
    }
    a.laneTimer -= dt;
    if (a.laneTimer <= 0) { a.laneTimer = 1.5 + r() * 3; a.laneTarget = (r() * 2 - 1) * T.half * 0.5; }
    a.lane += (a.laneTarget - a.lane) * Math.min(1, dt * 0.7);
    const spd = Math.max(0, k.speed);
    const li = T.wrap(k.idx + (7 + spd * 0.42) / T.ds), lw = T.hw[li] * 0.6;
    this.aiAvoid(k, spd, dt);
    const lane = a.avoid != null ? clamp(a.avoid, -T.hw[li] * 0.8, T.hw[li] * 0.8) : clamp(a.lane, -lw, lw);
    const [tx, tz] = T.point(li, lane);
    const diff = wrapAngle(Math.atan2(tx - k.x, tz - k.z) - k.h);
    const bend = T.bend(k.idx, 12 + spd * 0.9);
    inp.steer = clamp(-diff * 2.8, -1, 1);
    inp.gas = true; inp.brake = false;
    if (Math.abs(bend) > 1.3 && spd > this.cfg.max * 0.75 && !k.drift) inp.gas = false;
    if (Math.abs(bend) > 2.2 && spd > this.cfg.max * 0.62) { inp.gas = false; inp.brake = true; }

    const driftCond = Math.abs(bend) > 0.36 && Math.abs(diff) > 0.1 && spd > 16;
    if (Math.abs(bend) < 0.3) a.driftDecided = false;
    else if (!a.driftDecided) { a.driftDecided = true; a.wantDrift = r() < a.driftSkill; }
    if (k.drift) {
      a.driftHold += dt;
      inp.drift = !(a.driftHold > 2.0 + a.driftSkill * 1.3 || -diff * k.drift < -0.4 || (Math.abs(bend) < 0.12 && a.driftHold > 0.9));
    } else {
      a.driftHold = 0;
      inp.drift = a.wantDrift && driftCond;
    }

    this.aiUnstick(k, dt);
    inp.item = false;
    if (k.items.length) {
      a.itemDelay -= dt;
      if (a.itemDelay <= 0) {
        const it = k.items[0];
        let use = true;
        if (it === 'boost') use = Math.abs(bend) < 0.35;
        else if (it === 'rocket') use = k.place > 1;
        inp.item = use && !k.prevItem;
      }
    }
  }
  aiUnstick(k, dt) {
    const a = k.ai, inp = k.input;
    if (Math.abs(k.speed) < 2 && k.spin <= 0) a.stuck += dt; else a.stuck = 0;
    if (a.stuck > 1.2) { a.reverse = 0.9; a.stuck = 0; }
    if (a.reverse > 0) { a.reverse -= dt; inp.gas = false; inp.brake = true; inp.steer = -inp.steer; inp.drift = false; }
  }

  // ---------------------------------------------------------------- Mini-games (Mario Party style)
  startMinigame() {
    const T = this.track, r = this.rand;
    const recent = (this.mgHistory ||= []).slice(-2);
    const types = Object.keys(MG_INFO).filter((t) => !recent.includes(t));
    const type = this.forceMg || types[Math.floor(r() * types.length)];
    this.mgHistory.push(type); this.lastMg = type;
    const save = this.karts.map((k) => ({ x: k.x, z: k.z, h: k.h, idx: k.idx, lap: k.lap }));
    this.rockets.length = 0;
    const ring = { bumper: 15, colors: 22, bomb: 26 }[type] || 28;
    this.karts.forEach((k, i) => {
      k.champ = false; k.drift = 0; k.driftCharge = 0; k.boost = 0; k.spin = 0; k.star = 0; k.hop = 0;
      k.vx = k.vz = k.speed = 0; k.tp++; k.mgScore = 0; k.react = null; k.shotCd = 0; k.offroad = false; k.onIce = false; k.rubber = 1;
      k.stAge = 9; k.prevMg = true; k.ai.stuck = 0; k.ai.reverse = 0; k.ai.tile = -1;
      k.out = false; k.outRank = 0; k.bombTime = 0;
      if (type === 'reaction') { k.x = T.ax + (i - 3.5) * 4.2; k.z = T.az - 12; k.h = 0; }
      else {
        const a = (i / 8) * Math.PI * 2;
        k.x = T.ax + Math.cos(a) * ring; k.z = T.az + Math.sin(a) * ring;
        k.h = Math.atan2(T.ax - k.x, T.az - k.z);
      }
    });
    const mg = (this.mg = {
      type, phase: 'intro', t: 0, intro: 6, dur: { coins: 20, targets: 20, reaction: 0, bumper: 40, colors: 75, bomb: 70 }[type],
      coins: [], targets: [], shots: [], green: false, greenAt: 1.8 + r() * 2.7, winner: null, save, outCount: 0,
      platR: BUMPER_RADII[0], tiles: null, base: null, call: -1, round: 0, rphase: 'rest', rt: 0.5, bomb: null, fuse: 0, bombs: 3, passCd: 0,
    });
    const spot = (minR = 4) => { const a = r() * Math.PI * 2, d = minR + Math.sqrt(r()) * (ARENA.r - 4 - minR); return { x: T.ax + Math.cos(a) * d, z: T.az + Math.sin(a) * d }; };
    this.spot = spot;
    if (type === 'coins') for (let i = 0; i < 18; i++) mg.coins.push(spot());
    if (type === 'targets') for (let i = 0; i < 6; i++) mg.targets.push(spot(8));
    if (type === 'colors') { const n = arenaTiles(T).length; mg.base = new Array(n).fill(0); this.recolor(); mg.tiles = mg.base.slice(); }
    this.state = 'minigame';
    this.ev('mgstart', null, { mgType: type });
  }

  recolor() {
    const mg = this.mg, r = this.rand;
    for (let i = 0; i < mg.base.length; i++) mg.base[i] = Math.floor(r() * MG_COLORS.length);
  }
  alive() { return this.karts.filter((k) => !k.out); }
  knockOut(k, how) {
    if (k.out) return;
    k.out = true; k.outRank = ++this.mg.outCount; k.vx = k.vz = k.speed = 0; k.drift = 0; k.boost = 0;
    this.ev('out', k, { n: how === 'fall' ? 1 : 0 });
  }

  stepMinigame(dt) {
    const mg = this.mg, T = this.track;
    mg.t += dt;
    if (mg.phase === 'intro') {
      for (const k of this.karts) k.prevMg = k.input.item || k.input.drift;
      if (mg.t >= mg.intro) {
        mg.phase = 'play'; mg.t = 0;
        for (const k of this.karts) k.ai.react = 0.24 + this.rand() * 0.36;
        this.ev('mgplay');
      }
      return;
    }
    if (mg.phase === 'done') {
      if (mg.t >= 4.5) this.endMinigame();
      return;
    }
    if (mg.type === 'reaction') {
      if (!mg.green && mg.t >= mg.greenAt) { mg.green = true; this.ev('green'); }
      for (const k of this.karts) {
        const btn = k.input.item || k.input.drift, pressed = btn && !k.prevMg;
        k.prevMg = btn;
        if (k.react != null) continue;
        if (k.ctrl === 'ai') { if (mg.green && mg.t - mg.greenAt >= k.ai.react) { k.react = mg.t - mg.greenAt; this.ev('react', k); } }
        else if (k.ctrl === 'local' && pressed) { k.react = mg.green ? mg.t - mg.greenAt : 9; this.ev('react', k); }
      }
      if ((mg.green && this.karts.every((k) => k.react != null)) || mg.t > mg.greenAt + 3) {
        for (const k of this.karts) if (k.react == null) k.react = 9;
        this.finishMinigame();
      }
      return;
    }

    // Driving mini-games
    for (const k of this.karts) if (k.ctrl === 'ai' && !k.out) this.aiMinigame(k, dt);
    for (const k of this.karts) {
      if (k.out) continue;
      k.shotCd = Math.max(0, k.shotCd - dt);
      if (k.ctrl === 'remote') this.remoteUpdate(k, dt); else this.physics(k, dt);
    }
    this.collideKarts();

    if (mg.type === 'coins') {
      for (const c of mg.coins) for (const k of this.karts) {
        const dx = k.x - c.x, dz = k.z - c.z;
        if (dx * dx + dz * dz < 2.3 * 2.3) { k.mgScore++; this.ev('coin', k, { x: c.x, z: c.z }); Object.assign(c, this.spot()); break; }
      }
    } else if (mg.type === 'targets') {
      for (const k of this.karts) {
        const pressed = (k.input.item && !k.prevItem) || k.itemQueued;
        k.prevItem = k.input.item; k.itemQueued = false;
        if (pressed && k.shotCd <= 0) {
          k.shotCd = 0.45;
          mg.shots.push({ x: k.x + Math.sin(k.h) * 2.4, z: k.z + Math.cos(k.h) * 2.4, h: k.h, owner: k, age: 0 });
          this.ev('shoot', k);
        }
      }
      for (let i = mg.shots.length - 1; i >= 0; i--) {
        const s = mg.shots[i];
        s.age += dt; s.x += Math.sin(s.h) * 70 * dt; s.z += Math.cos(s.h) * 70 * dt;
        let gone = s.age > 1.2 || Math.hypot(s.x - T.ax, s.z - T.az) > ARENA.r;
        for (const tg of mg.targets) {
          if (gone) break;
          if (Math.hypot(s.x - tg.x, s.z - tg.z) < 2.6) {
            s.owner.mgScore++; this.ev('target', s.owner, { x: tg.x, z: tg.z }); Object.assign(tg, this.spot(8)); gone = true;
          }
        }
        if (gone) mg.shots.splice(i, 1);
      }
    } else if (mg.type === 'bumper') {
      // "Bumper Balls": the platform shrinks in steps; anyone past the edge falls in the lava.
      const R = BUMPER_RADII[Math.min(BUMPER_RADII.length - 1, Math.floor(mg.t / 9))];
      if (R !== mg.platR) { mg.platR = R; this.ev('shrink'); }
      for (const k of this.karts) if (!k.out && Math.hypot(k.x - T.ax, k.z - T.az) > mg.platR + 0.4) this.knockOut(k, 'fall');
      for (const k of this.karts) if (!k.out) k.mgScore = Math.floor(mg.t);
      if (this.alive().length <= 1 || mg.t >= mg.dur) this.finishMinigame();
    } else if (mg.type === 'colors') {
      // "Hexagon Heat": a colour is called, then every other tile drops.
      mg.rt -= dt;
      if (mg.rphase === 'rest' && mg.rt <= 0) {
        mg.round++;
        let tries = 0;
        do { this.recolor(); mg.call = Math.floor(this.rand() * MG_COLORS.length); } while (mg.base.filter((c) => c === mg.call).length < 6 && ++tries < 20);
        mg.tiles = mg.base.slice();
        mg.rphase = 'warn'; mg.rt = Math.max(1.5, 4.2 - (mg.round - 1) * 0.5);
        for (const k of this.karts) k.ai.decideAt = mg.t + 0.25 + (1 - k.ai.driftSkill) * 1.1 + this.rand() * 0.4;
        this.ev('call', null, { n: mg.call });
      } else if (mg.rphase === 'warn' && mg.rt <= 0) {
        mg.tiles = mg.base.map((c) => (c === mg.call ? c : -1));
        mg.rphase = 'drop'; mg.rt = 1.4;
        this.ev('drop');
      } else if (mg.rphase === 'drop') {
        for (const k of this.karts) {
          if (k.out) continue;
          const ti = tileAt(T, k.x, k.z);
          if (ti < 0 || mg.tiles[ti] < 0) this.knockOut(k, 'fall');
        }
        if (mg.rt <= 0) {
          mg.tiles = mg.base.slice(); mg.rphase = 'rest'; mg.rt = 0.9;
          for (const k of this.karts) if (!k.out) k.mgScore = mg.round;
          if (this.alive().length <= 1 || mg.round >= 8) this.finishMinigame();
        }
      }
      if (mg.phase === 'play' && mg.t >= mg.dur) this.finishMinigame();
    } else if (mg.type === 'bomb') {
      // "Hot Bob-omb": bump someone to pass it on.
      const alive = this.alive();
      if (!mg.bomb) {
        mg.bomb = alive[Math.floor(this.rand() * alive.length)];
        mg.fuse = 7 + this.rand() * 4; mg.passCd = 1;
        this.ev('bombstart', mg.bomb);
      }
      mg.passCd -= dt; mg.fuse -= dt; mg.bomb.bombTime += dt;
      if (mg.passCd <= 0) for (const k of alive) {
        if (k === mg.bomb || Math.hypot(k.x - mg.bomb.x, k.z - mg.bomb.z) > 2.9) continue;
        mg.bomb = k; mg.passCd = 0.9; this.ev('pass', k);
        break;
      }
      if (mg.fuse <= 0) {
        const h = mg.bomb;
        this.ev('boom', h, { x: h.x, z: h.z });
        this.knockOut(h, 'boom'); h.spin = 1.3;
        mg.bomb = null; mg.bombs--;
        if (mg.bombs <= 0 || this.alive().length <= 1) this.finishMinigame();
      }
      if (mg.phase === 'play' && mg.t >= mg.dur) this.finishMinigame();
    }
    if (mg.phase === 'play' && (mg.type === 'coins' || mg.type === 'targets') && mg.t >= mg.dur) this.finishMinigame();
  }

  aiMinigame(k, dt) {
    const mg = this.mg, inp = k.input, T = this.track;
    inp.gas = true; inp.brake = false; inp.drift = false; inp.item = false;
    let tx = T.ax, tz = T.az;
    const steerTo = (x, z) => {
      const diff = wrapAngle(Math.atan2(x - k.x, z - k.z) - k.h) + k.ai.aim * 0.3;
      inp.steer = clamp(-diff * 2.5, -1, 1);
      return diff;
    };
    k.ai.aim += (this.rand() - 0.5) * dt * 2; k.ai.aim *= 0.97;
    const fromC = Math.hypot(k.x - T.ax, k.z - T.az);
    if (mg.type === 'coins' || mg.type === 'targets') {
      const list = mg.type === 'coins' ? mg.coins : mg.targets;
      let best = null, bd = Infinity;
      for (const c of list) {
        const d = Math.hypot(c.x - k.x, c.z - k.z) + Math.abs(wrapAngle(Math.atan2(c.x - k.x, c.z - k.z) - k.h)) * 8;
        if (d < bd) { bd = d; best = c; }
      }
      if (!best) return;
      const dist = Math.hypot(best.x - k.x, best.z - k.z), diff = steerTo(best.x, best.z);
      if (mg.type === 'targets') {
        if (dist < 14) { inp.gas = false; inp.brake = k.speed > 6; }
        if (Math.abs(diff) < 0.08 && dist < 40 && k.shotCd <= 0 && this.rand() < dt * 3) k.itemQueued = true;
      } else if (dist < 10 && Math.abs(diff) > 1) inp.gas = false;
    } else if (mg.type === 'bumper') {
      let best = null, bd = Infinity;
      for (const o of this.karts) { if (o === k || o.out) continue; const d = Math.hypot(o.x - k.x, o.z - k.z); if (d < bd) { bd = d; best = o; } }
      if (fromC > mg.platR - 5 || !best) { tx = T.ax; tz = T.az; } else { tx = best.x + best.vx * 0.3; tz = best.z + best.vz * 0.3; }
      steerTo(tx, tz);
      if (fromC > mg.platR - 3 && k.speed > 10) inp.gas = false;
    } else if (mg.type === 'colors') {
      if (mg.rphase === 'warn' && mg.t >= k.ai.decideAt) {
        const tiles = arenaTiles(T);
        if (k.ai.tile < 0 || mg.base[k.ai.tile] !== mg.call) {
          let bd = Infinity;
          tiles.forEach((tl, i) => { if (mg.base[i] !== mg.call) return; const d = Math.hypot(tl.x - k.x, tl.z - k.z); if (d < bd) { bd = d; k.ai.tile = i; } });
        }
      } else if (mg.rphase === 'rest') k.ai.tile = -1;
      if (k.ai.tile >= 0 && mg.rphase !== 'rest') {
        const tl = arenaTiles(T)[k.ai.tile], d = Math.hypot(tl.x - k.x, tl.z - k.z);
        steerTo(tl.x, tl.z);
        inp.gas = d > 3; inp.brake = d < 6 && k.speed > 3;
        if (d < 3) { inp.gas = false; inp.brake = k.speed > 0.5; return; } // parked: don't let the unstick logic reverse us off the tile
      } else { inp.gas = false; inp.brake = k.speed > 0.5; inp.steer = 0; return; }
    } else if (mg.type === 'bomb') {
      const h = mg.bomb;
      if (!h) { inp.gas = false; return; }
      if (h === k) {
        let best = null, bd = Infinity;
        for (const o of this.karts) { if (o === k || o.out) continue; const d = Math.hypot(o.x - k.x, o.z - k.z); if (d < bd) { bd = d; best = o; } }
        if (best) steerTo(best.x + best.vx * 0.25, best.z + best.vz * 0.25);
      } else {
        let fx = k.x - h.x, fz = k.z - h.z; const fl = Math.hypot(fx, fz) || 1;
        tx = k.x + (fx / fl) * 14; tz = k.z + (fz / fl) * 14;
        const cd = Math.hypot(tx - T.ax, tz - T.az);
        if (cd > 28) { const a = Math.atan2(tz - T.az, tx - T.ax) + 0.9 * Math.sign(fx * (tz - T.az) - fz * (tx - T.ax) || 1); tx = T.ax + Math.cos(a) * 24; tz = T.az + Math.sin(a) * 24; }
        steerTo(tx, tz);
        if (fl > 22) inp.gas = this.rand() < 0.5;
      }
    }
    this.aiUnstick(k, dt);
  }

  finishMinigame() {
    const mg = this.mg, T = this.track;
    const key = (k) => {
      switch (mg.type) {
        case 'reaction': return -k.react;
        case 'bumper': return k.out ? k.outRank : 100 - Math.hypot(k.x - T.ax, k.z - T.az) / 100;
        case 'colors': return k.out ? k.outRank : 100;
        case 'bomb': return k.out ? k.outRank : 100 - k.bombTime / 100;
        default: return k.mgScore;
      }
    };
    // Ties go to whoever is further behind in the race.
    const ranked = [...this.karts].sort((a, b) => key(b) - key(a) || b.place - a.place);
    mg.winner = ranked[0]; mg.ranked = ranked.map((k) => k.id);
    mg.phase = 'done'; mg.t = 0; mg.shots.length = 0; mg.bomb = null;
    mg.winner.champ = true;
    this.giveItem(mg.winner);
    this.ev('mgwin', mg.winner);
  }

  endMinigame() {
    const mg = this.mg;
    this.karts.forEach((k, i) => {
      const s = mg.save[i];
      k.x = s.x; k.z = s.z; k.h = s.h; k.idx = s.idx; k.lap = s.lap;
      k.vx = k.vz = k.speed = 0; k.tp++; k.stAge = 9; k.react = null; k.gasStartT = -1;
      k.out = false; k.outRank = 0; k.bombTime = 0; k.spin = 0;
    });
    this.mg = null;
    this.state = 'countdown'; this.countdown = 3.5;
    this.ev('mgend');
  }

  results() {
    const est = this.cfg.max * 0.85;
    return this.sorted.map((k) => {
      if (k.finished) return { k, time: k.finishTime, est: false };
      const remaining = ((this.laps + 1) * this.track.N - this.progress(k)) * this.track.ds;
      return { k, time: this.time + remaining / est, est: true };
    });
  }

  // ---------------------------------------------------------------- Network snapshot (server → clients)
  snapshot(events) {
    const mg = this.mg;
    return {
      t: 'snap', s: this.state, cd: r2(this.countdown), tm: r2(this.time),
      k: this.karts.map((k) => [r2(k.x), r2(k.z), r3(k.h), r2(k.vx), r2(k.vz), r2(k.speed), k.drift, r2(k.driftCharge), r2(k.hop), r2(k.boost),
        r2(k.star), r2(k.spin), k.lap, k.idx, k.place, k.finished ? r2(k.finishTime) : -1, k.items.join(','), k.rolls.length, k.champ ? 1 : 0,
        k.tp, k.mgScore, k.react == null ? -1 : r3(k.react), k.connected ? 1 : 0, k.out ? 1 : 0]),
      bx: this.boxes.map((b) => (b.active ? 1 : 0)).join(''),
      bn: this.bananas.map((b) => [r2(b.x), r2(b.z)]),
      rk: this.rockets.map((r) => [r2(r.x), r2(r.z), r3(r.h)]),
      ev: events.map((e) => [e.type, e.k ? e.k.id : -1, e.x != null ? r2(e.x) : 0, e.z != null ? r2(e.z) : 0, e.n ?? e.level ?? 0, e.mgType || '']),
      mg: mg && {
        ty: mg.type, ph: mg.phase, t: r2(mg.t), dur: mg.dur, intro: mg.intro, g: mg.green ? 1 : 0,
        c: mg.coins.map((c) => [r2(c.x), r2(c.z)]), tg: mg.targets.map((c) => [r2(c.x), r2(c.z)]),
        sh: mg.shots.map((s) => [r2(s.x), r2(s.z), r3(s.h)]), w: mg.winner ? mg.winner.id : -1, rk: mg.ranked || null,
        pr: mg.platR, tl: mg.tiles ? mg.tiles.map((c) => (c < 0 ? 'x' : c)).join('') : '', cl: mg.call, rp: mg.rphase, rt: r2(mg.rt), rn: mg.round,
        bh: mg.bomb ? mg.bomb.id : -1, fu: r2(mg.fuse), bs: mg.bombs,
      },
    };
  }
}
