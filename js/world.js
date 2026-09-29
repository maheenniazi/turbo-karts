// 3D assets: karts, items, track worlds, mini-game arena. Built procedurally once and cached.
import { RACERS, ARENA, BUMPER_RADII, mulberry32 } from './sim.js';
import { MeshBuilder } from './gl.js';
import { m4 } from './math.js';

const DARK = [0.12, 0.12, 0.14];
const shade = (c, f) => [c[0] * f, c[1] * f, c[2] * f];

export function createAssets(R) {
  const simple = (fn) => { const b = new MeshBuilder(); fn(b); return R.mesh(b); };

  function kartMesh(r) {
    const b = new MeshBuilder(), c = r.color, a = r.accent;
    b.box(0, 0.45, 0.1, 1.5, 0.35, 2.4, c);
    b.box(0, 0.58, 1.2, 1.1, 0.32, 0.7, c);
    b.box(0, 0.4, 1.62, 1.7, 0.18, 0.25, a);
    b.box(0, 0.4, -1.3, 1.5, 0.2, 0.25, DARK);
    b.box(0, 0.7, 0.15, 0.95, 0.12, 1.0, [0.22, 0.22, 0.25]);
    b.box(0, 0.95, -0.5, 0.95, 0.6, 0.25, DARK);
    b.box(0, 1.08, -0.1, 0.72, 0.62, 0.52, a);
    b.sphere(0, 1.66, -0.05, 0.44, c, 10);
    b.box(0, 1.66, 0.28, 0.58, 0.2, 0.14, [0.08, 0.1, 0.18]);
    b.box(0, 1.05, 0.55, 0.52, 0.09, 0.09, DARK);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      const big = sz < 0 ? 1.1 : 1;
      b.cyl(sx * 0.92, 0.42 * big, sz * 0.88 + 0.05, 0.42 * big, 0.42, 10, DARK, 'x');
      b.box(sx * 1.14, 0.42 * big, sz * 0.88 + 0.05, 0.04, 0.3, 0.3, a);
    }
    b.box(0, 1.2, -1.2, 1.6, 0.1, 0.4, a);
    for (const sx of [-0.55, 0.55]) b.box(sx, 0.92, -1.15, 0.08, 0.45, 0.12, DARK);
    for (const sx of [-0.35, 0.35]) b.cyl(sx, 0.62, -1.4, 0.13, 0.45, 8, [0.65, 0.65, 0.7], 'z');
    return R.mesh(b);
  }
  function itemBoxMesh() {
    const b = new MeshBuilder();
    b.box(0, 0, 0, 1.6, 1.6, 1.6, null, [[1, 0.35, 0.35], [0.35, 0.6, 1], [1, 0.9, 0.3], [0.45, 0.95, 0.45], [0.95, 0.45, 1], [1, 0.65, 0.25]]);
    for (let f = 0; f < 4; f++) {
      b.m = m4.trs(m4.create(), 0, 0, 0, (f * Math.PI) / 2);
      b.box(0, 0.35, 0.81, 0.5, 0.14, 0.02, [1, 1, 1]); b.box(0.2, 0.2, 0.81, 0.14, 0.3, 0.02, [1, 1, 1]);
      b.box(0.02, 0.02, 0.81, 0.36, 0.14, 0.02, [1, 1, 1]); b.box(-0.05, -0.15, 0.81, 0.14, 0.22, 0.02, [1, 1, 1]);
      b.box(-0.05, -0.45, 0.81, 0.14, 0.14, 0.02, [1, 1, 1]);
    }
    return R.mesh(b);
  }
  const banana = simple((b) => {
    for (let i = 0; i < 7; i++) {
      const a = -0.9 + (i / 6) * 1.8;
      b.m = m4.trs(m4.create(), Math.sin(a) * 0.75, 0.6 - Math.cos(a) * 0.4, 0, 0, 0, a);
      b.box(0, 0, 0, 0.32, 0.34, 0.36, i === 0 || i === 6 ? [0.35, 0.25, 0.1] : [1, 0.86, 0.15]);
    }
  });
  const rocket = simple((b) => {
    b.cyl(0, 0, 0, 0.32, 1.6, 8, [0.9, 0.15, 0.15], 'z');
    b.m = m4.trs(m4.create(), 0, 0, 0.8, 0, Math.PI / 2, 0);
    b.cone(0, 0, 0, 0.32, 0.7, 8, [0.95, 0.95, 0.95]);
    b.m = null;
    b.box(0, 0, -0.7, 1.1, 0.08, 0.35, [0.95, 0.8, 0.2]); b.box(0, 0, -0.7, 0.08, 1.1, 0.35, [0.95, 0.8, 0.2]);
    b.sphere(0, 0.33, 0.35, 0.14, [0.6, 0.85, 1], 6);
  });
  const coin = simple((b) => {
    b.cyl(0, 0, 0, 0.9, 0.22, 14, [1, 0.8, 0.12], 'z');
    b.box(0, 0, 0.12, 0.22, 0.9, 0.04, [1, 0.95, 0.5]); b.box(0, 0, -0.12, 0.22, 0.9, 0.04, [1, 0.95, 0.5]);
  });
  const target = simple((b) => {
    b.cyl(0, 1.3, 0, 0.18, 2.6, 6, [0.5, 0.5, 0.55]);
    b.cyl(0, 3.2, 0, 1.9, 0.2, 18, [0.9, 0.12, 0.12], 'z');
    b.cyl(0, 3.2, 0.06, 1.35, 0.2, 18, [1, 1, 1], 'z');
    b.cyl(0, 3.2, 0.12, 0.8, 0.2, 18, [0.9, 0.12, 0.12], 'z');
    b.cyl(0, 3.2, 0.18, 0.3, 0.2, 12, [1, 1, 1], 'z');
  });
  const crown = simple((b) => {
    const g = [1, 0.82, 0.1];
    b.cyl(0, 0, 0, 0.42, 0.26, 10, g);
    for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2; b.cone(Math.cos(a) * 0.34, 0.13, Math.sin(a) * 0.34, 0.12, 0.34, 5, g); }
    b.sphere(0, 0.1, 0.42, 0.08, [0.9, 0.1, 0.2], 6);
  });

  // ---- obstacles
  const W = [1, 1, 1];
  const blocks = {
    hay: simple((b) => { const c = [0.92, 0.78, 0.36]; b.cyl(0, 0.9, -0.5, 0.9, 1.9, 10, c, 'x'); b.cyl(0, 0.9, 0.55, 0.9, 1.9, 10, shade(c, 0.9), 'x'); b.cyl(0, 2.3, 0, 0.8, 1.7, 10, c, 'x'); }),
    tires: simple((b) => { for (const [x, z] of [[-0.8, 0], [0.8, 0], [0, 0.9]]) for (let i = 0; i < 3; i++) { b.cyl(x, 0.3 + i * 0.6, z, 0.75, 0.55, 10, [0.13, 0.13, 0.15]); b.cyl(x, 0.3 + i * 0.6, z, 0.77, 0.12, 10, i % 2 ? [0.9, 0.15, 0.15] : W); } }),
    cones: simple((b) => { for (const [x, z] of [[-1, -0.6], [1, -0.4], [0, 0.8], [0.2, -1.2]]) { b.box(x, 0.06, z, 1, 0.12, 1, [0.15, 0.15, 0.15]); b.cone(x, 0.1, z, 0.45, 1.4, 8, [1, 0.45, 0.05]); b.cyl(x, 0.75, z, 0.3, 0.2, 8, W); } }),
    snowman: simple((b) => { b.sphere(0, 1, 0, 1.3, [0.98, 0.98, 1], 9); b.sphere(0, 2.6, 0, 0.9, [0.98, 0.98, 1], 9); b.sphere(0, 3.8, 0, 0.6, [0.98, 0.98, 1], 8);
      b.box(0, 3.8, 0.62, 0.14, 0.14, 0.5, [1, 0.5, 0.1]); b.box(0, 4.4, 0, 0.9, 0.12, 0.9, DARK); b.box(0, 4.75, 0, 0.55, 0.6, 0.55, DARK); b.box(0, 3.1, 0, 1.3, 0.2, 1.3, [0.85, 0.15, 0.15]); }),
    rock: simple((b) => { b.sphere(0, 0.9, 0, 1.9, [0.55, 0.38, 0.26], 6, 0.75); b.sphere(0.9, 1.7, 0.3, 1, [0.62, 0.43, 0.3], 6); }),
    crystal: simple((b) => { for (const [x, z, h, c] of [[0, 0, 5, [0.3, 0.95, 1]], [0.9, 0.4, 3.2, [0.95, 0.45, 1]], [-0.8, 0.5, 3.8, [0.6, 0.5, 1]], [0.2, -0.9, 2.6, [0.3, 0.95, 1]]]) b.cone(x, 0, z, 0.8, h, 5, c); }),
  };
  const cow = simple((b) => {
    const wh = [0.97, 0.97, 0.95], bk = [0.12, 0.12, 0.12];
    b.box(0, 1.5, 0, 1.4, 1.1, 2.6, wh); b.box(0.4, 1.8, 0.3, 0.7, 0.6, 0.9, bk); b.box(-0.45, 1.4, -0.6, 0.6, 0.6, 0.7, bk);
    b.box(0, 1.9, 1.6, 0.9, 0.9, 0.9, wh); b.box(0, 1.65, 2.1, 0.8, 0.45, 0.2, [0.95, 0.65, 0.65]);
    b.box(0.45, 2.45, 1.5, 0.12, 0.3, 0.12, [0.9, 0.85, 0.7]); b.box(-0.45, 2.45, 1.5, 0.12, 0.3, 0.12, [0.9, 0.85, 0.7]);
    for (const [x, z] of [[-0.5, -1], [0.5, -1], [-0.5, 1], [0.5, 1]]) b.box(x, 0.5, z, 0.35, 1, 0.35, wh);
  });
  const boulder = simple((b) => { b.sphere(0, 0, 0, 2.1, [0.5, 0.36, 0.26], 7); b.box(0.9, 0.9, 0.9, 0.9, 0.9, 0.9, [0.44, 0.31, 0.22]); b.box(-1, -0.6, 0.8, 0.8, 0.8, 0.8, [0.44, 0.31, 0.22]); });
  const crusher = simple((b) => {
    const st = [0.45, 0.48, 0.58];
    b.box(0, 2.6, 0, 5, 5, 5, st); b.box(0, 5.3, 0, 4, 0.4, 4, shade(st, 1.15));
    for (const f of [0, 1, 2, 3]) {
      b.m = m4.trs(m4.create(), 0, 0, 0, (f * Math.PI) / 2);
      b.box(-1, 3.4, 2.52, 1, 0.9, 0.08, W); b.box(1, 3.4, 2.52, 1, 0.9, 0.08, W);
      b.box(-0.9, 3.3, 2.58, 0.45, 0.5, 0.08, DARK); b.box(0.9, 3.3, 2.58, 0.45, 0.5, 0.08, DARK);
      b.box(-1, 4.1, 2.54, 1.3, 0.25, 0.1, DARK); b.box(1, 4.1, 2.54, 1.3, 0.25, 0.1, DARK);
      b.box(0, 1.6, 2.52, 2.6, 0.5, 0.08, DARK);
      for (let i = 0; i < 4; i++) b.box(-0.9 + i * 0.6, 1.6, 2.58, 0.3, 0.35, 0.08, W);
    }
    b.m = null;
    for (const [x, z] of [[-1.7, -1.7], [1.7, -1.7], [-1.7, 1.7], [1.7, 1.7]]) b.cone(x, 5.4, z, 0.5, 1.1, 5, shade(st, 0.85));
  });
  const vent = simple((b) => { b.cyl(0, 0.15, 0, 2.2, 0.3, 12, [0.22, 0.2, 0.2]); b.disc(0, 0.32, 0, 1.6, 12, [0.1, 0.08, 0.08]); b.cyl(0, 0.2, 0, 2.4, 0.12, 12, [1, 0.8, 0.1]); });
  const column = simple((b) => b.cyl(0, 0.5, 0, 1, 1, 10, W, 'y', 0.6));
  const ice = simple((b) => b.disc(0, 0, 0, 1, 20, [0.8, 0.95, 1]));

  // ---- animated props
  const blades = simple((b) => { const c = [0.95, 0.93, 0.88]; b.box(0, 0, 0, 0.7, 0.7, 0.6, [0.6, 0.3, 0.2]); for (let i = 0; i < 4; i++) { b.m = m4.trs(m4.create(), 0, 0, 0, 0, 0, (i * Math.PI) / 2); b.box(0, 3.6, 0.3, 1.1, 6.5, 0.12, c); b.m = null; } });
  const balloon = simple((b) => { b.sphere(0, 7, 0, 4, [1, 1, 1], 10, 1.15); b.box(0, 1, 0, 1.6, 1.3, 1.6, [0.55, 0.36, 0.2]); for (const [x, z] of [[-0.7, -0.7], [0.7, -0.7], [-0.7, 0.7], [0.7, 0.7]]) b.box(x, 2.6, z, 0.08, 2.6, 0.08, DARK); });
  const blimp = simple((b) => { b.m = m4.trs(m4.create(), 0, 0, 0, 0, 0, 0, [1, 1, 2.6]); b.sphere(0, 0, 0, 4, [0.95, 0.95, 0.98], 12); b.m = null;
    b.box(0, -4.2, 1, 2, 1.2, 4, [0.3, 0.3, 0.35]); b.box(0, 0, -10, 0.3, 5, 2.5, [0.9, 0.2, 0.2]); b.box(0, 0, -10, 5, 0.3, 2.5, [0.9, 0.2, 0.2]);
    for (let i = 0; i < 6; i++) b.box(4.05, 0.3, -6 + i * 2.4, 0.1, 2, 2, RACERS[i].color); for (let i = 0; i < 6; i++) b.box(-4.05, 0.3, -6 + i * 2.4, 0.1, 2, 2, RACERS[i + 2].color); });
  const floatCrystal = simple((b) => { b.cone(0, 0, 0, 1.3, 3.5, 5, W); b.m = m4.trs(m4.create(), 0, 0, 0, 0, Math.PI, 0); b.cone(0, 0, 0, 1.3, 2.2, 5, W); b.m = null; });

  // ---- mini-game arena extras
  const lavaRings = BUMPER_RADII.map((r) => simple((b) => {
    const SEG = 48;
    for (let i = 0; i < SEG; i++) {
      const a0 = (i / SEG) * Math.PI * 2, a1 = ((i + 1) / SEG) * Math.PI * 2, R2 = 70;
      b.quad([Math.cos(a0) * r, 0, Math.sin(a0) * r], [Math.cos(a0) * R2, 0, Math.sin(a0) * R2], [Math.cos(a1) * R2, 0, Math.sin(a1) * R2], [Math.cos(a1) * r, 0, Math.sin(a1) * r], [1, 0.38, 0.06]);
      b.quad([Math.cos(a0) * r, 0.02, Math.sin(a0) * r], [Math.cos(a0) * (r + 0.8), 0.02, Math.sin(a0) * (r + 0.8)], [Math.cos(a1) * (r + 0.8), 0.02, Math.sin(a1) * (r + 0.8)], [Math.cos(a1) * r, 0.02, Math.sin(a1) * r], i % 2 ? [1, 0.85, 0.1] : [0.12, 0.12, 0.12]);
    }
  }));
  const tile = simple((b) => b.box(0, 0, 0, 1, 1, 1, W));
  const bomb = simple((b) => { b.sphere(0, 0, 0, 0.9, [0.1, 0.1, 0.12], 10); b.cyl(0, 0.95, 0, 0.35, 0.3, 8, [0.6, 0.6, 0.65]); b.cyl(0.15, 1.35, 0, 0.07, 0.6, 5, [0.8, 0.7, 0.4]); b.sphere(-0.35, 0.35, 0.6, 0.18, W, 6); });

  const M = {
    blocks, cow, boulder, crusher, vent, column, ice, blades, balloon, blimp, floatCrystal, lavaRings, tile, bomb,
    karts: RACERS.map(kartMesh), box: itemBoxMesh(), banana, rocket, coin, target, crown,
    cube: simple((b) => b.box(0, 0, 0, 1, 1, 1, [1, 1, 1])),
    shadow: simple((b) => b.disc(0, 0, 0, 1, 16, [0, 0, 0])),
  };

  const cache = { world: {}, clouds: {}, arena: {} };
  const worldFor = (race) => (cache.world[race.trackIndex] ||= R.mesh(buildWorld(race)));
  const arenaFor = (race) => (cache.arena[race.trackIndex] ||= R.mesh(buildArena(race)));
  const cloudsFor = (race) => {
    if (cache.clouds[race.trackIndex]) return cache.clouds[race.trackIndex];
    const T = race.track, b = new MeshBuilder(), rnd = mulberry32(race.trackIndex * 31 + 7);
    for (const [cx, cz] of [[T.cx, T.cz], [T.ax, T.az]]) for (let i = 0; i < 18; i++) {
      const a = rnd() * Math.PI * 2, rr = rnd() * (T.radius + 250), y = 80 + rnd() * 40;
      const x = cx + Math.cos(a) * rr, z = cz + Math.sin(a) * rr;
      for (let k = 0; k < 4; k++) b.sphere(x + (k - 1.5) * 9, y + rnd() * 3, z + (rnd() - 0.5) * 8, 7 + rnd() * 5, [1, 1, 1], 6, 0.55);
    }
    return (cache.clouds[race.trackIndex] = R.mesh(b));
  };
  const propsFor = (race) => (cache.props ||= {})[race.trackIndex] ||= buildProps(race);
  return { M, worldFor, arenaFor, cloudsFor, propsFor };
}

function buildWorld(race) {
  const T = race.track, th = race.def.theme, N = T.N, b = new MeshBuilder();
  const rnd = mulberry32(race.trackIndex * 977 + 13);
  const P = (i, l, y, along = 0) => {
    const j = T.wrap(i), [x, z] = T.point(j, l);
    return [x + T.tx[j] * along, y, z + T.tz[j] * along];
  };
  // strip between two lateral offsets that may vary per sample (lateral functions of i)
  const strip = (l0, l1, y, colFn, step = 1) => {
    for (let i = 0; i < N; i += step) {
      const c = colFn(i); if (!c) continue;
      const j = i + step;
      b.quad(P(i, l0(i), y), P(i, l1(i), y), P(j, l1(T.wrap(j)), y), P(j, l0(T.wrap(j)), y), c);
    }
  };
  const hw = (i) => T.hw[T.wrap(i)], wl = (i) => T.wall(T.wrap(i));
  const cx = T.cx, cz = T.cz, G = 1600;

  b.quad([cx - G, -0.12, cz - G], [cx + G, -0.12, cz - G], [cx + G, -0.12, cz + G], [cx - G, -0.12, cz + G], th.ground);
  for (let i = 0; i < 120; i++) {
    const x = cx + (rnd() - 0.5) * T.radius * 3.2, z = cz + (rnd() - 0.5) * T.radius * 3.2;
    if (T.distToTrack(x, z) < T.wallMax + 12) continue;
    b.disc(x, -0.1, z, 8 + rnd() * 18, 7, shade(th.ground, 0.92 + rnd() * 0.12));
  }
  strip((i) => -wl(i) - 1.5, (i) => wl(i) + 1.5, -0.06, () => th.offroad, 2);
  strip((i) => -hw(i), hw, 0, (i) => (Math.floor(i / 6) % 2 ? th.road : th.road2));
  const curb = (i) => (Math.floor(i / 2) % 2 ? th.curbA : th.curbB);
  strip(hw, (i) => hw(i) + 1.2, 0, curb);
  strip((i) => -hw(i) - 1.2, (i) => -hw(i), 0, curb);
  strip(() => -0.18, () => 0.18, 0.03, (i) => (Math.floor(i / 3) % 2 ? [0.95, 0.95, 0.9] : null));

  for (const sg of [-1, 1]) {
    for (let i = 0; i < N; i += 2) {
      const col = Math.floor(i / 4) % 2 ? th.wallA : th.wallB, W0 = sg * wl(i), W1 = sg * wl(i + 2);
      b.quad(P(i, W0, 0), P(i + 2, W1, 0), P(i + 2, W1, 1.2), P(i, W0, 1.2), col, P(i, 0, 0.6));
      b.quad(P(i, W0, 1.2), P(i + 2, W1, 1.2), P(i + 2, W1 + sg * 0.6, 1.2), P(i, W0 + sg * 0.6, 1.2), shade(col, 0.9));
    }
  }

  const w0 = hw(0);
  for (let r = 0; r < 2; r++) for (let c = 0; c < 10; c++) {
    const l0 = -w0 + (c / 10) * w0 * 2, l1 = -w0 + ((c + 1) / 10) * w0 * 2;
    const col = (r + c) % 2 ? [0.05, 0.05, 0.05] : [0.97, 0.97, 0.97];
    b.quad(P(0, l0, 0.04, r * 1.2), P(0, l1, 0.04, r * 1.2), P(0, l1, 0.04, r * 1.2 + 1.2), P(0, l0, 0.04, r * 1.2 + 1.2), col);
  }
  const g = w0 + 2.4;
  for (const sg of [-1, 1]) { const p = P(0, sg * g, 0); b.box(p[0], 4, p[2], 0.9, 8, 0.9, [0.85, 0.85, 0.9]); }
  const p0 = P(0, 0, 0);
  b.m = m4.trs(m4.create(), p0[0], 7.4, p0[2], T.ang[0]);
  const bw = g * 2 + 0.9, cells = 16, cw = bw / cells;
  for (let c = 0; c < cells; c++) for (let r = 0; r < 2; r++) {
    b.box(-bw / 2 + cw * (c + 0.5), -0.35 + r * 0.7, 0, cw, 0.7, 0.5, (c + r) % 2 ? [0.05, 0.05, 0.05] : [0.97, 0.97, 0.97]);
  }
  b.box(0, 1.1, 0, bw, 0.5, 0.55, th.curbA);
  b.m = null;

  for (const pad of race.pads) {
    for (let s = -pad.len; s < pad.len; s++) {
      const i = pad.idx + s;
      b.quad(P(i, pad.lat - 2.2, 0.04), P(i, pad.lat + 2.2, 0.04), P(i + 1, pad.lat + 2.2, 0.04), P(i + 1, pad.lat - 2.2, 0.04), [1, 0.45, 0.05]);
    }
    const along = -pad.len * T.ds;
    for (let c = 0; c < 3; c++) {
      const o = along + 0.8 + c * 1.7;
      b.tri(P(pad.idx, pad.lat - 1.7, 0.07, o), P(pad.idx, pad.lat, 0.07, o + 1.2), P(pad.idx, pad.lat + 1.7, 0.07, o), [1, 0.95, 0.3]);
    }
  }

  {
    const i0 = T.wrap(-12 / T.ds), p = P(i0, -(wl(i0) + 9), 0);
    b.m = m4.trs(m4.create(), p[0], 0, p[2], T.ang[i0]);
    for (let s = 0; s < 4; s++) {
      b.box(-s * 1.6, 0.6 + s * 1.2, 0, 1.6, 1.2 + s * 2.4, 34, [0.55, 0.57, 0.62]);
      for (let k = 0; k < 20; k++) {
        const hue = RACERS[Math.floor(rnd() * RACERS.length)].color;
        b.box(-s * 1.6 + (rnd() - 0.5) * 0.6, 1.5 + s * 2.4, -16 + k * 1.65 + rnd() * 0.4, 0.6, 0.7, 0.6, hue);
      }
    }
    b.box(-3, 12, 0, 8, 0.4, 36, th.curbA);
    b.m = null;
  }

  trackDecor(b, race, rnd, P, wl);

  const { minX, maxX, minZ, maxZ } = T.bounds, MARGIN = 150;
  let placed = 0;
  for (let tries = 0; placed < 420 && tries < 6000; tries++) {
    const x = minX - MARGIN + rnd() * (maxX - minX + MARGIN * 2), z = minZ - MARGIN + rnd() * (maxZ - minZ + MARGIN * 2);
    if (T.distToTrack(x, z) < T.wallMax + 4) continue;
    placed++;
    b.m = m4.trs(m4.create(), x, 0, z, rnd() * 6.28, 0, 0, 0.8 + rnd() * 0.8);
    decor(b, th.scenery, rnd);
  }
  b.m = null;
  mountains(b, th, rnd, cx, cz, T.radius + 330);
  return b;
}

function mountains(b, th, rnd, cx, cz, R0) {
  for (let i = 0; i < 40; i++) {
    const a = (i / 40) * Math.PI * 2 + rnd() * 0.1, rr = R0 + rnd() * 140;
    const h = 70 + rnd() * 130, r = 60 + rnd() * 60, x = cx + Math.cos(a) * rr, z = cz + Math.sin(a) * rr;
    b.cone(x, -1, z, r, h, 7, shade(th.mountain, 0.85 + rnd() * 0.25));
    if (th.cap) b.cone(x, h * 0.62 - 1, z, r * 0.39, h * 0.38 + 0.5, 7, th.cap);
  }
}

function buildArena(race) {
  const T = race.track, th = race.def.theme, b = new MeshBuilder(), rnd = mulberry32(race.trackIndex * 71 + 3);
  const ax = T.ax, az = T.az, R = ARENA.r, SEG = 64;
  b.disc(ax, -0.12, az, 700, 24, th.ground);
  const ring = (r0, r1, y, col) => {
    for (let i = 0; i < SEG; i++) {
      const a0 = (i / SEG) * Math.PI * 2, a1 = ((i + 1) / SEG) * Math.PI * 2;
      const c = typeof col === 'function' ? col(i) : col;
      b.quad([ax + Math.cos(a0) * r0, y, az + Math.sin(a0) * r0], [ax + Math.cos(a0) * r1, y, az + Math.sin(a0) * r1],
        [ax + Math.cos(a1) * r1, y, az + Math.sin(a1) * r1], [ax + Math.cos(a1) * r0, y, az + Math.sin(a1) * r0], c);
    }
  };
  b.disc(ax, 0, az, 6, 16, th.curbA);
  for (let r = 6; r < R; r += 6) ring(r, Math.min(R, r + 6), 0, (r / 6) % 2 ? th.road : th.road2);
  ring(R, R + 1.5, 0.01, (i) => (i % 2 ? th.curbA : th.curbB));
  for (let i = 0; i < SEG; i++) {
    const a0 = (i / SEG) * Math.PI * 2, a1 = ((i + 1) / SEG) * Math.PI * 2, W = R + 1.5;
    const p = (a, y) => [ax + Math.cos(a) * W, y, az + Math.sin(a) * W];
    b.quad(p(a0, 0), p(a1, 0), p(a1, 1.4), p(a0, 1.4), i % 2 ? th.wallA : th.wallB, [ax, 0.7, az]);
  }
  // stands & flags around the arena
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 + 0.13, x = ax + Math.cos(a) * (R + 8), z = az + Math.sin(a) * (R + 8);
    b.m = m4.trs(m4.create(), x, 0, z, Math.atan2(ax - x, az - z));
    b.box(0, 1, 0, 9, 2, 3, [0.55, 0.57, 0.62]); b.box(0, 2.6, -1.4, 9, 1.4, 1.5, [0.5, 0.52, 0.58]);
    for (let k = 0; k < 7; k++) b.box(-3.6 + k * 1.2, 2.3 + (k % 2) * 1.2, (k % 2) * -1.4, 0.6, 0.7, 0.6, RACERS[(i + k) % 8].color);
    b.box(5, 4, 0, 0.2, 8, 0.2, [0.85, 0.85, 0.9]); b.box(5.9, 7.2, 0, 1.6, 1, 0.06, RACERS[i % 8].color);
  }
  b.m = null;
  // traffic light gantry for Reaction Duel (lights are drawn live)
  b.box(ax - 12, 4, az + 12, 0.6, 8, 0.6, [0.3, 0.3, 0.35]); b.box(ax + 12, 4, az + 12, 0.6, 8, 0.6, [0.3, 0.3, 0.35]);
  b.box(ax, 8.2, az + 12, 24.6, 1, 0.8, [0.25, 0.25, 0.3]);
  b.box(ax, 6.6, az + 12.1, 7.5, 2.6, 0.6, [0.12, 0.12, 0.14]);
  for (let tries = 0, n = 0; n < 160 && tries < 2000; tries++) {
    const a = rnd() * Math.PI * 2, d = R + 20 + rnd() * 220;
    b.m = m4.trs(m4.create(), ax + Math.cos(a) * d, 0, az + Math.sin(a) * d, rnd() * 6.28, 0, 0, 0.8 + rnd() * 0.8);
    decor(b, th.scenery, rnd); n++;
  }
  b.m = null;
  mountains(b, th, rnd, ax, az, 360);
  return b;
}

function decor(b, type, rnd) {
  const r = rnd();
  const green = [0.18 + rnd() * 0.1, 0.5 + rnd() * 0.15, 0.2];
  const trunk = [0.45, 0.3, 0.18];
  if (type === 'trees') {
    if (r < 0.45) { b.cyl(0, 1.2, 0, 0.35, 2.4, 6, trunk); b.sphere(0, 3.6, 0, 1.9, green, 7); }
    else if (r < 0.85) { b.cyl(0, 1, 0, 0.3, 2, 6, trunk); b.cone(0, 1.5, 0, 2, 4.5, 7, shade(green, 0.8)); b.cone(0, 3.8, 0, 1.4, 3, 7, shade(green, 0.85)); }
    else if (r < 0.95) b.sphere(0, 0.5, 0, 1.2, green, 6, 0.7);
    else { for (let i = 0; i < 5; i++) b.box((rnd() - 0.5) * 3, 0.3, (rnd() - 0.5) * 3, 0.35, 0.6, 0.35, [1, 0.4 + rnd() * 0.6, rnd()]); }
  } else if (type === 'snow') {
    if (r < 0.75) {
      const pine = [0.12, 0.35 + rnd() * 0.1, 0.25];
      b.cyl(0, 0.8, 0, 0.3, 1.6, 6, trunk); b.cone(0, 1.2, 0, 2, 4.5, 7, pine); b.cone(0, 3.4, 0, 1.4, 3.2, 7, pine);
      b.cone(0, 5.1, 0, 0.7, 1.6, 7, [0.97, 0.98, 1]);
    } else if (r < 0.88) {
      b.sphere(0, 0.9, 0, 0.9, [0.98, 0.98, 1], 8); b.sphere(0, 2.2, 0, 0.6, [0.98, 0.98, 1], 8);
      b.box(0, 2.25, 0.62, 0.12, 0.12, 0.4, [1, 0.5, 0.1]); b.box(0, 2.95, 0, 0.8, 0.12, 0.8, DARK); b.box(0, 3.3, 0, 0.5, 0.6, 0.5, DARK);
    } else b.box(0, 0.6, 0, 2 + rnd() * 2, 1.2 + rnd(), 2 + rnd() * 2, [0.6, 0.64, 0.7]);
  } else if (type === 'volcano') {
    if (r < 0.45) b.box(0, 0.8, 0, 2 + rnd() * 3, 1.6 + rnd() * 2.5, 2 + rnd() * 3, [0.2 + rnd() * 0.08, 0.16, 0.16]);
    else if (r < 0.7) b.disc(0, -0.05, 0, 2.5 + rnd() * 3, 9, [1, 0.42 + rnd() * 0.2, 0.05]);
    else if (r < 0.92) {
      const d = [0.25, 0.2, 0.18];
      b.cyl(0, 1.6, 0, 0.25, 3.2, 5, d); b.box(0.6, 2.6, 0, 1.2, 0.18, 0.18, d); b.box(-0.5, 2, 0, 1, 0.16, 0.16, d);
    } else { b.cone(0, 0, 0, 7, 9, 8, [0.3, 0.2, 0.18]); b.disc(0, 9.02, 0, 1.6, 8, [1, 0.5, 0.05]); }
  } else if (type === 'crystal') {
    if (r < 0.6) {
      const cols = [[0.3, 0.95, 1], [0.95, 0.45, 1], [0.6, 0.5, 1]];
      for (let i = 0; i < 3 + Math.floor(rnd() * 3); i++) {
        const c = cols[Math.floor(rnd() * 3)], h = 2 + rnd() * 5;
        b.cone((rnd() - 0.5) * 2.5, 0, (rnd() - 0.5) * 2.5, 0.5 + rnd() * 0.6, h, 5, c);
      }
    } else if (r < 0.9) b.box(0, 0.9, 0, 2 + rnd() * 3, 1.8 + rnd() * 3, 2 + rnd() * 3, [0.32, 0.28, 0.44]);
    else { b.cyl(0, 3, 0, 1.2, 6, 6, [0.4, 0.35, 0.55]); b.cone(0, 6, 0, 1.5, 3, 6, [0.3, 0.95, 1]); }
  } else {
    if (r < 0.5) {
      const cg = [0.3, 0.55, 0.28];
      b.cyl(0, 2, 0, 0.45, 4, 7, cg);
      b.box(0.7, 1.8, 0, 1, 0.4, 0.4, cg); b.cyl(1.05, 2.5, 0, 0.3, 1.5, 6, cg);
      if (rnd() < 0.6) { b.box(-0.7, 2.4, 0, 1, 0.4, 0.4, cg); b.cyl(-1.05, 3, 0, 0.3, 1.3, 6, cg); }
    } else if (r < 0.9) {
      b.box(0, 0.7, 0, 2 + rnd() * 3, 1.4 + rnd() * 2, 2 + rnd() * 3, [0.6 + rnd() * 0.15, 0.36, 0.22]);
    } else {
      const w = 10 + rnd() * 14, h = 12 + rnd() * 20;
      b.box(0, h / 2, 0, w, h, w * 0.8, [0.7, 0.4, 0.25]); b.box(0, h + 0.5, 0, w * 1.1, 1, w * 0.9, [0.78, 0.48, 0.3]);
    }
  }
}

// ------------------------------------------------------------------ trackside decoration
function trackDecor(b, race, rnd, P, wl) {
  const T = race.track, th = race.def.theme, N = T.N, deco = race.def.decor || {};
  const W = [1, 1, 1];
  // Arches over the road
  for (const f of deco.arches || []) {
    const i = T.wrap(f * N), w = wl(i) + 1.2, p = P(i, 0, 0);
    b.m = m4.trs(m4.create(), p[0], 0, p[2], T.ang[i]);
    for (const sg of [-1, 1]) { b.box(sg * w, 4.5, 0, 1.2, 9, 1.2, th.wallB); b.box(sg * w, 0.4, 0, 1.8, 0.8, 1.8, shade(th.wallB, 0.8)); }
    b.box(0, 9.2, 0, w * 2 + 1.2, 1.6, 1.3, th.wallA);
    const n = 8;
    for (let c = 0; c < n; c++) b.box(-w + ((c + 0.5) / n) * w * 2, 9.2, 0.7, (w * 2) / n - 0.3, 1.1, 0.08, RACERS[c % 8].color);
    b.box(0, 10.4, 0, 6, 1.4, 0.6, th.curbA); b.box(0, 10.4, 0.32, 5, 0.8, 0.05, W);
    b.m = null;
  }
  // Flag poles along both barriers
  for (let i = 3; i < N; i += 13) {
    const sg = (i / 13) % 2 < 1 ? 1 : -1, l = sg * (wl(i) + 1.4), p = P(i, l, 0), col = RACERS[Math.floor(i / 13) % 8].color;
    b.m = m4.trs(m4.create(), p[0], 0, p[2], T.ang[i]);
    b.cyl(0, 2.5, 0, 0.1, 5, 5, [0.85, 0.85, 0.9]);
    b.tri([0, 4.9, 0], [0, 3.7, 0], [0, 4.3, 1.8], col); b.tri([0, 4.9, 0.02], [0, 3.7, 0.02], [0, 4.3, 1.82], col);
    b.m = null;
  }
  // Themed clusters just outside the barriers
  const cluster = { trees: 'hay', snow: 'snowpile', desert: 'crates', volcano: 'lavarock', crystal: 'crystal' }[th.scenery];
  for (let i = 20; i < N; i += 47) {
    const sg = rnd() < 0.5 ? -1 : 1, l = sg * (wl(i) + 3 + rnd() * 3), p = P(i, l, 0);
    b.m = m4.trs(m4.create(), p[0], 0, p[2], rnd() * 6.28);
    if (cluster === 'hay') { for (let k = 0; k < 3; k++) b.cyl(k * 1.9 - 1.9, 0.8, 0, 0.8, 1.6, 9, [0.92, 0.78, 0.36], 'x'); b.cyl(-0.95, 2.2, 0, 0.8, 1.6, 9, [0.88, 0.74, 0.32], 'x'); }
    else if (cluster === 'snowpile') { b.sphere(0, 0, 0, 2.2, [0.97, 0.98, 1], 7, 0.6); b.sphere(1.8, 0, 0.8, 1.4, [0.97, 0.98, 1], 7, 0.6); for (let k = 0; k < 3; k++) { b.box(-1.8 + k * 0.8, 0.5, 2, 0.5, 1, 0.4, [0.1, 0.1, 0.12]); b.box(-1.8 + k * 0.8, 0.5, 2.21, 0.35, 0.7, 0.05, W); b.box(-1.8 + k * 0.8, 1.05, 2.12, 0.12, 0.08, 0.3, [1, 0.6, 0.1]); } }
    else if (cluster === 'crates') { b.box(0, 0.8, 0, 1.6, 1.6, 1.6, [0.72, 0.5, 0.28]); b.box(1.7, 0.8, 0.2, 1.6, 1.6, 1.6, [0.66, 0.45, 0.25]); b.box(0.8, 2.4, 0.1, 1.6, 1.6, 1.6, [0.72, 0.5, 0.28]); b.cyl(-1.8, 0.9, 0, 0.7, 1.8, 9, [0.5, 0.3, 0.18]); }
    else if (cluster === 'lavarock') { b.box(0, 0.9, 0, 2.6, 1.8, 2.2, [0.22, 0.17, 0.16]); b.disc(2.4, 0.05, 0.6, 1.6, 9, [1, 0.5, 0.05]); b.box(-1.6, 0.6, 1, 1.2, 1.2, 1.2, [0.28, 0.2, 0.18]); }
    else { for (let k = 0; k < 4; k++) b.cone(k * 1.1 - 1.6, 0, rnd() * 1.4, 0.6, 2 + rnd() * 3, 5, [[0.3, 0.95, 1], [0.95, 0.45, 1], [0.6, 0.5, 1]][k % 3]); }
    b.m = null;
  }
  // Billboards facing the road
  for (let n = 0; n < 5; n++) {
    const i = T.wrap(((n + 0.35) / 5) * N), sg = n % 2 ? 1 : -1, p = P(i, sg * (wl(i) + 11), 0);
    b.m = m4.trs(m4.create(), p[0], 0, p[2], T.ang[i] + (sg > 0 ? -Math.PI / 2 : Math.PI / 2));
    for (const x of [-4, 4]) b.box(x, 3, 0, 0.5, 6, 0.5, [0.4, 0.4, 0.45]);
    b.box(0, 7.5, 0, 12, 5, 0.5, [0.12, 0.12, 0.16]);
    b.box(0, 7.5, 0.3, 11.2, 4.2, 0.1, th.curbA);
    for (let c = 0; c < 4; c++) b.box(-3.9 + c * 2.6, 7.2, 0.4, 2, 2, 0.1, RACERS[(n * 2 + c) % 8].color);
    b.box(0, 9, 0.4, 9, 0.6, 0.1, W);
    b.m = null;
  }
  // Static parts of the themed extras (towers, penguins)
  const extras = deco.extras || [];
  if (extras.includes('windmill')) for (const w of windmillSpots(race)) {
    b.m = m4.trs(m4.create(), w.x, 0, w.z, w.ry);
    b.cyl(0, 6, 0, 2.6, 12, 8, [0.93, 0.9, 0.84], 'y', 1.6); b.cone(0, 12, 0, 2.2, 3, 8, [0.75, 0.25, 0.2]); b.box(0, 1.2, 1.9, 1.2, 2.4, 0.3, [0.45, 0.28, 0.16]);
    b.m = null;
  }
  if (extras.includes('penguins')) for (let n = 0; n < 8; n++) {
    const i = T.wrap(rnd() * N), sg = rnd() < 0.5 ? -1 : 1, p = P(i, sg * (wl(i) + 2.5), 0);
    b.m = m4.trs(m4.create(), p[0], 0, p[2], T.ang[i] + (sg > 0 ? -1.5 : 1.5));
    for (let k = 0; k < 3; k++) {
      const x = k * 1.2 - 1.2;
      b.sphere(x, 0.8, 0, 0.55, [0.1, 0.1, 0.14], 7, 1.4); b.sphere(x, 0.75, 0.3, 0.38, W, 6, 1.3); b.sphere(x, 1.6, 0, 0.36, [0.1, 0.1, 0.14], 7);
      b.box(x, 1.55, 0.36, 0.2, 0.1, 0.25, [1, 0.6, 0.1]);
    }
    b.m = null;
  }
}

function windmillSpots(race) {
  const T = race.track, rnd = mulberry32(race.trackIndex * 5 + 1), out = [];
  for (let tries = 0; out.length < 3 && tries < 400; tries++) {
    const x = T.cx + (rnd() - 0.5) * T.radius * 2.6, z = T.cz + (rnd() - 0.5) * T.radius * 2.6;
    const d = T.distToTrack(x, z);
    if (d < T.wallMax + 18 || d > T.wallMax + 60) continue;
    out.push({ x, z, ry: Math.atan2(T.cx - x, T.cz - z) });
  }
  return out;
}

// Animated props: drawn every frame by the renderer.
function buildProps(race) {
  const T = race.track, extras = (race.def.decor || {}).extras || [], rnd = mulberry32(race.trackIndex * 11 + 9), list = [];
  if (extras.includes('windmill')) for (const w of windmillSpots(race)) {
    list.push({ mesh: 'blades', x: w.x + Math.sin(w.ry) * 2.2, y: 11, z: w.z + Math.cos(w.ry) * 2.2, ry: w.ry, anim: 'spin', speed: 0.8 + rnd() * 0.6 });
  }
  if (extras.includes('balloon')) for (let n = 0; n < 5; n++) {
    const a = rnd() * Math.PI * 2, d = T.radius * (0.5 + rnd() * 0.9);
    list.push({ mesh: 'balloon', x: T.cx + Math.cos(a) * d, y: 35 + rnd() * 30, z: T.cz + Math.sin(a) * d, anim: 'bob', phase: rnd() * 6, tint: RACERS[n % 8].color });
  }
  if (extras.includes('blimp')) list.push({ mesh: 'blimp', x: T.cx, y: 70, z: T.cz, anim: 'orbit', r: T.radius * 0.7, speed: 0.05 });
  if (extras.includes('crystals')) for (let n = 0; n < 14; n++) {
    const i = T.wrap(rnd() * T.N), sg = rnd() < 0.5 ? -1 : 1, [x, z] = T.point(i, sg * (T.wall(i) + 6 + rnd() * 10));
    list.push({ mesh: 'floatCrystal', x, y: 6 + rnd() * 5, z, anim: 'float', phase: rnd() * 6, tint: [[0.3, 0.95, 1], [0.95, 0.45, 1], [0.6, 0.5, 1]][n % 3], glow: 0.5 });
  }
  if (extras.includes('embers')) for (let n = 0; n < 10; n++) {
    const i = T.wrap(rnd() * T.N), sg = rnd() < 0.5 ? -1 : 1, [x, z] = T.point(i, sg * (T.wall(i) + 5 + rnd() * 8));
    list.push({ mesh: 'column', x, y: 0, z, anim: 'lavafall', phase: rnd() * 6, tint: [1, 0.45, 0.05], glow: 1, s: [1.4, 12 + rnd() * 10, 1.4] });
  }
  return list;
}
