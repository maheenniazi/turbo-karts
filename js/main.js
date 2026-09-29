import { Race, RACERS, TRACKS, CC, LAP_OPTIONS, ITEM_ICONS, MG_INFO, MG_COLORS, BUMPER_RADII, DRIFT_TIERS, CHAMP_SPEED, MG_EVERY, arenaTiles, wrapAngle } from './sim.js';
import { Renderer } from './gl.js';
import { m4 } from './math.js';
import { Input } from './input.js';
import { Sound } from './audio.js';
import { Net, serverBase } from './net.js';
import { createAssets } from './world.js';

const $ = (s) => document.querySelector(s);
const canvas = $('#game');
let R;
try { R = new Renderer(canvas); } catch (e) {
  const el = $('#error'); el.hidden = false; el.textContent = 'Sorry — this device could not start WebGL. ' + e.message;
  throw e;
}
canvas.addEventListener('webglcontextlost', (e) => e.preventDefault());
canvas.addEventListener('webglcontextrestored', () => location.reload());
const { M, worldFor, arenaFor, cloudsFor, propsFor } = createAssets(R);

const input = new Input();
const sound = new Sound();
const store = {
  get(k, d) { try { const v = localStorage.getItem('tk.' + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem('tk.' + k, JSON.stringify(v)); } catch { /* private mode */ } },
};
const settings = {
  name: store.get('name', ''), racer: store.get('racer', 0), track: Math.min(store.get('track', 0), TRACKS.length - 1),
  cc: store.get('cc', 100), laps: store.get('laps', 10), muted: store.get('muted', false),
};
if (!LAP_OPTIONS.includes(settings.laps)) settings.laps = 10;
sound.setMuted(settings.muted);
const saveSettings = () => { for (const k of Object.keys(settings)) store.set(k, settings[k]); };
const myName = () => settings.name.trim() || (online ? RACERS[settings.racer].name : 'You');
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const css = (c) => `rgb(${c.map((v) => Math.round(v * 255)).join(',')})`;
const suffix = (n) => (n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th');
const fmtTime = (s) => { const m = Math.floor(s / 60), r = s - m * 60; return `${m}:${r < 10 ? '0' : ''}${r.toFixed(2)}`; };
const tmpM = m4.create();

// Scoreboard: race wins per player name, saved on this device.
const league = {
  get() { return store.get('league', {}); },
  set(l) { store.set('league', l); },
  win(name) { const l = this.get(); l[name] = (l[name] || 0) + 1; this.set(l); },
};

// ================================================================= Particles
const parts = [];
function spawn(x, y, z, vx, vy, vz, life, col, size, grav = 0) {
  if (parts.length > 500) parts.shift();
  parts.push({ x, y, z, vx, vy, vz, life, max: life, col, size, grav });
}
function burst(x, y, z, n, cols, speed = 8, size = 0.5) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, s = speed * (0.4 + Math.random() * 0.6);
    spawn(x, y, z, Math.cos(a) * s, 3 + Math.random() * speed * 0.8, Math.sin(a) * s, 0.6 + Math.random() * 0.5, cols[i % cols.length], size, 14);
  }
}
const kartPoint = (k, yaw, lx, ly, lz) => [k.x + lx * Math.cos(yaw) + lz * Math.sin(yaw), ly, k.z - lx * Math.sin(yaw) + lz * Math.cos(yaw)];
const kartYaw = (k) => k.h - k.drift * 0.38 + (k.spin > 0 ? (1.3 - k.spin) * 14 : 0);

function emitKartParticles(k, dt, theme) {
  const yaw = kartYaw(k), fx = Math.sin(k.h), fz = Math.cos(k.h);
  const n = (rate) => { const v = rate * dt; return Math.floor(v) + (Math.random() < v % 1 ? 1 : 0); };
  if (k.drift) {
    const c = k.driftCharge, lvl = c >= DRIFT_TIERS[2] ? 3 : c >= DRIFT_TIERS[1] ? 2 : c >= DRIFT_TIERS[0] ? 1 : 0;
    const col = [[0.95, 0.95, 0.95], [0.3, 0.7, 1], [1, 0.55, 0.1], [0.85, 0.35, 1]][lvl];
    for (const sx of [-0.95, 0.95]) for (let i = n(lvl ? 45 : 20); i > 0; i--) {
      const p = kartPoint(k, yaw, sx, 0.15, -0.9);
      spawn(p[0], p[1], p[2], -fx * 4 + (Math.random() - 0.5) * 6, 2 + Math.random() * 3, -fz * 4 + (Math.random() - 0.5) * 6, 0.25, col, lvl ? 0.28 : 0.18, 18);
    }
  }
  if (k.boost > 0) for (const sx of [-0.35, 0.35]) for (let i = n(40); i > 0; i--) {
    const p = kartPoint(k, yaw, sx, 0.62, -1.7);
    spawn(p[0], p[1], p[2], -fx * 6, 0.5 + Math.random(), -fz * 6, 0.18, Math.random() < 0.5 ? [1, 0.85, 0.2] : [1, 0.4, 0.05], 0.45);
  }
  if (k.offroad && Math.abs(k.speed) > 4) for (let i = n(14); i > 0; i--) {
    const p = kartPoint(k, yaw, (Math.random() - 0.5) * 2, 0.2, -1.2);
    spawn(p[0], p[1], p[2], (Math.random() - 0.5) * 2, 2 + Math.random() * 2, (Math.random() - 0.5) * 2, 0.5, theme.offroad, 0.55, 2);
  }
  if (k.star > 0) for (let i = n(25); i > 0; i--) {
    const p = kartPoint(k, yaw, (Math.random() - 0.5) * 2.4, 0.3 + Math.random() * 1.8, (Math.random() - 0.5) * 3);
    spawn(p[0], p[1], p[2], 0, 1.5, 0, 0.4, RACERS[Math.floor(Math.random() * 8)].color, 0.25);
  }
  if (k.champ) for (let i = n(8); i > 0; i--) {
    const p = kartPoint(k, yaw, (Math.random() - 0.5) * 2, 0.4 + Math.random() * 1.6, (Math.random() - 0.5) * 2.6);
    spawn(p[0], p[1], p[2], 0, 1.2, 0, 0.5, [1, 0.85, 0.2], 0.18);
  }
  if (k.spin > 0) for (let i = n(10); i > 0; i--) {
    const a = Math.random() * 6.28;
    spawn(k.x + Math.cos(a) * 0.8, 2.3, k.z + Math.sin(a) * 0.8, Math.cos(a), 1, Math.sin(a), 0.4, [1, 0.95, 0.3], 0.22);
  }
}

// ================================================================= Game state
let mode = 'menu';            // 'menu' (also the online lobby) | 'race' | 'results'
let paused = false;
let race = null, demo = null;
let resultsTimer = -1;
let snapCam = true;
let quality = 1, slowFrames = 0;
let prevIpItem = false, prevIpReact = false;
const cam = { x: 0, y: 5, z: 0, h: 0, fov: 68, look: [0, 0, 0] };

// Online session: null when playing solo.
let online = null; // { net, pid, room, tick, reactSent, greenSeen, waiting }
const isHost = () => online && online.room && online.room.host === online.pid;
const inRoom = () => !!(online && online.room);

function newDemo() {
  demo = new Race({ trackIndex: currentSettings().track, cc: 100, laps: 3, allAI: true, seed: (Math.random() * 1e6) | 0 });
  demo.countdown = 0.01;
  snapCam = true;
}
function activeRace() { return mode === 'menu' ? demo : race; }
function currentSettings() { return inRoom() ? online.room.settings : settings; }

function beginRace(r) {
  sound.unlock(); sound.resume();
  race = r;
  mode = 'race'; paused = false; resultsTimer = -1; parts.length = 0; snapCam = true; prevIpItem = true; prevIpReact = true;
  show('#menu', false); show('#results', false); show('#pause', false);
  show('#hud', true); show('#touch', input.isTouch);
  drawMinimapBase(race);
  banner('READY?', 'small');
}
function startSolo() {
  if (inRoom()) { if (isHost()) online.net.send({ t: 'start' }); return; }
  beginRace(new Race({ trackIndex: settings.track, cc: settings.cc, laps: settings.laps, playerRacer: settings.racer, playerName: myName() }));
}
function toMenu() {
  mode = 'menu'; paused = false; sound.stopMusic(); sound.engine(false, 0, false);
  show('#hud', false); show('#touch', false); show('#results', false); show('#pause', false); show('#menu', true); show('#mg', false);
  $('#tags').innerHTML = ''; tagEls.length = 0;
  newDemo(); refreshMenu();
}
function setPaused(p) {
  if (mode !== 'race') return;
  paused = p; show('#pause', p);
  $('#restartBtn').hidden = !!online;
  $('#quitBtn').textContent = online ? 'Leave Online Race' : 'Quit to Menu';
  if (online) return; // online races keep running on the server
  if (p) { sound.engine(false, 0, false); sound.suspend(); } else sound.resume();
}

// ================================================================= Online
function setNote(text, cls = '') { const el = $('#menuNote'); el.textContent = text; el.className = cls; }
function setRoomParam(code) {
  const u = new URL(location.href);
  if (code) u.searchParams.set('room', code); else u.searchParams.delete('room');
  history.replaceState(null, '', u);
}
function inviteLink() {
  const u = new URL(location.origin + location.pathname);
  u.searchParams.set('room', online.room.code);
  const s = new URLSearchParams(location.search).get('server');
  if (s) u.searchParams.set('server', s);
  return u.toString();
}

async function goOnline(joinCode) {
  sound.unlock();
  if (online) return;
  const net = new Net();
  setNote(joinCode ? `Joining room ${joinCode}…` : 'Connecting to the game server…');
  try { await net.connect(); } catch {
    setNote(location.protocol === 'file:' || !/^https?:/.test(serverBase())
      ? 'Online play needs the Turbo Karts server. Run "npm start" and open the address it prints (see README).'
      : `Couldn't reach the game server at ${serverBase()}. Online play needs the Turbo Karts server running (see README).`, 'err');
    if (joinCode) setRoomParam(null);
    return;
  }
  online = { net, pid: 0, room: null, tick: 0, reactSent: false, greenSeen: 0 };
  net.onclose = () => {
    const wasRacing = mode !== 'menu';
    online = null;
    if (wasRacing) toMenu();
    setNote('Disconnected from the game server.', 'err');
    refreshMenu();
  };
  net.on('room', (m) => {
    const first = !online.room;
    online.room = m; online.pid = m.you;
    setRoomParam(m.code);
    const me = m.players.find((p) => p.pid === m.you);
    if (me) { settings.racer = me.racer; saveSettings(); }
    if (m.host === m.you) league.set(m.league); // the host's device keeps the group scoreboard
    if (first) setNote(m.host === m.you ? 'Room created! Send the invite link to your friends.' : 'You joined the room. Waiting for the host to start…', 'ok');
    if (mode === 'menu') { if (demo.trackIndex !== m.settings.track) newDemo(); refreshMenu(); }
    if (mode === 'results') renderResultsScoreboard(m.league);
  })
    .on('error', (m) => { setNote(m.msg, 'err'); if (!online.room) { net.close(); online = null; setRoomParam(null); refreshMenu(); } })
    .on('wait', () => setNote('A race is in progress — you\u2019ll be in the next one.', 'ok'))
    .on('start', (m) => {
      online.tick = 0; online.reactSent = false; online.greenSeen = 0;
      beginRace(new Race({ ...m.opts, mode: 'client', localPid: online.pid }));
    })
    .on('snap', (s) => { if (race && race.client && mode !== 'menu') applySnapshot(s); })
    .on('results', (m) => showResultsOnline(m));
  const profile = { name: settings.name.trim(), racer: settings.racer };
  if (joinCode) net.send({ t: 'join', room: joinCode, ...profile });
  else net.send({ t: 'create', ...profile, league: league.get(), settings: { track: settings.track, cc: settings.cc, laps: settings.laps } });
}
function leaveOnline() {
  if (!online) return;
  const net = online.net;
  online = null;
  net.onclose = null; net.send({ t: 'leave' }); net.close();
  setRoomParam(null);
  setNote('');
  toMenu();
}
async function shareInvite() {
  const url = inviteLink();
  const text = `Race me in Turbo Karts! Room ${online.room.code}`;
  if (navigator.share && input.isTouch) { try { await navigator.share({ title: 'Turbo Karts', text, url }); return; } catch { /* cancelled */ } }
  try { await navigator.clipboard.writeText(url); setNote('Invite link copied — paste it to your friends!', 'ok'); }
  catch { setNote('Copy this invite link: ' + url, 'ok'); }
}

// Apply a server snapshot to the local view of the race.
function applySnapshot(s) {
  const rc = race, me = rc.player, now = performance.now();
  rc.time = s.tm;
  if (s.s === 'minigame') {
    if (rc.state !== 'minigame') { rc.state = 'minigame'; snapCam = true; }
  } else if (s.s === 'countdown') {
    if (rc.state !== 'countdown') { rc.state = 'countdown'; rc.countdown = s.cd; snapCam = true; }
    else if (Math.abs(rc.countdown - s.cd) > 0.35) rc.countdown = s.cd;
  } else if (s.s === 'racing') {
    if (rc.state === 'countdown') rc.countdown = Math.min(rc.countdown, 0.001);
    else if (rc.state === 'minigame') rc.state = 'racing';
  }
  if (s.mg) {
    const g = s.mg;
    if (g.g && !online.greenSeen) online.greenSeen = now;
    var prevBase = rc.mg && rc.mg.base;
    rc.mg = {
      type: g.ty, phase: g.ph, t: g.t, dur: g.dur, intro: g.intro, green: !!g.g, ranked: g.rk,
      coins: g.c.map(([x, z]) => ({ x, z })), targets: g.tg.map(([x, z]) => ({ x, z })), shots: g.sh.map(([x, z, h]) => ({ x, z, h })),
      winner: g.w >= 0 ? rc.karts[g.w] : null,
      platR: g.pr, call: g.cl, rphase: g.rp, rt: g.rt, round: g.rn, bomb: g.bh >= 0 ? rc.karts[g.bh] : null, fuse: g.fu, bombs: g.bs,
      tiles: g.tl ? [...g.tl].map((c) => (c === 'x' ? -1 : +c)) : null,
    };
    if (rc.mg.tiles) rc.mg.base = rc.mg.tiles.includes(-1) && prevBase ? prevBase : rc.mg.tiles;
  } else rc.mg = null;

  s.k.forEach((a, i) => {
    const k = rc.karts[i];
    const [x, z, h, vx, vz, sp, d, dc, hop, b, star, spin, lap, idx, place, fin, items, rolls, champ, tp, mgScore, react, conn, out] = a;
    k.lap = lap; k.place = place; k.finished = fin >= 0; if (fin >= 0) k.finishTime = fin;
    k.items = items ? items.split(',') : []; k.rolls = Array.from({ length: rolls }, () => ({ t: 1 }));
    k.champ = !!champ; k.mgScore = mgScore; k.connected = !!conn; k.out = !!out;
    if (k === me) {
      if (tp !== k.tp) {
        Object.assign(k, { tp, x, z, h, vx, vz, speed: sp, idx, drift: 0, driftCharge: 0, spin: 0, boost: 0 });
        snapCam = true; online.reactSent = false; online.greenSeen = 0; k.react = null;
      }
      if (react >= 0) k.react = react;
    } else {
      Object.assign(k, { nx: x, nz: z, nh: h, vx, vz, speed: sp, drift: d, driftCharge: dc, hop, boost: b, star, spin, idx, netT: now });
      k.react = react >= 0 ? react : null;
      if (k.tp !== tp || !k.seen) { k.x = x; k.z = z; k.h = h; k.tp = tp; k.seen = true; }
    }
  });
  for (let i = 0; i < rc.boxes.length; i++) rc.boxes[i].active = s.bx[i] === '1';
  rc.bananas = s.bn.map(([x, z]) => ({ x, z }));
  rc.rockets = s.rk.map(([x, z, h]) => ({ x, z, h }));
  for (const [type, kid, x, z, n, mgType] of s.ev) {
    const k = kid >= 0 ? rc.karts[kid] : null;
    if (type === 'count' || type === 'go') continue; // countdown runs locally for a crisp start
    if (k === me && (type === 'bump' || type === 'hop' || type === 'miniturbo' || type === 'pad' || type === 'startboost')) continue;
    if (k === me) {
      if (type === 'spin') { me.spin = 0; me.star = 0; rc.spinOut(me); rc.events.pop(); }
      if (type === 'boost') me.boost = Math.max(me.boost, 1.3);
      if (type === 'star') me.star = 7;
    }
    if (type === 'mgstart') { online.reactSent = false; online.greenSeen = 0; }
    rc.events.push({ type, k, x, z, n, level: n, mgType });
  }
}
// Smoothly move other karts toward their latest networked positions.
function smoothNetKarts(dt, now) {
  const me = race.player;
  for (const k of race.karts) {
    if (k === me || k.netT == null) continue;
    const age = Math.min(0.25, (now - k.netT) / 1000);
    const tx = k.nx + k.vx * age, tz = k.nz + k.vz * age;
    if (Math.hypot(tx - k.x, tz - k.z) > 15) { k.x = tx; k.z = tz; k.h = k.nh; continue; }
    const a = Math.min(1, dt * 14);
    k.x += (tx - k.x) * a; k.z += (tz - k.z) * a;
    k.h = wrapAngle(k.h + wrapAngle(k.nh - k.h) * a);
    k.hop = Math.max(0, k.hop - dt); k.spin = Math.max(0, k.spin - dt); k.boost = Math.max(0, k.boost - dt);
  }
  for (const r of race.rockets) { r.x += Math.sin(r.h) * 52 * dt; r.z += Math.cos(r.h) * 52 * dt; }
  if (race.mg) for (const s of race.mg.shots) { s.x += Math.sin(s.h) * 70 * dt; s.z += Math.cos(s.h) * 70 * dt; }
}
function sendState() {
  const k = race.player, q = (v) => Math.round(v * 100) / 100;
  online.net.send({ t: 'st', tp: k.tp, x: q(k.x), z: q(k.z), h: Math.round(k.h * 1000) / 1000, vx: q(k.vx), vz: q(k.vz), sp: q(k.speed),
    d: k.drift, dc: q(k.driftCharge), hop: q(k.hop), b: q(k.boost) });
}

// ================================================================= Events → audio / fx
function handleEvents(rc) {
  const P = rc.player, isP = (k) => k === P && !rc.allAI;
  const near = (x, z) => Math.hypot(x - P.x, z - P.z) < 70;
  for (const e of rc.events) {
    const k = e.k;
    switch (e.type) {
      case 'count': banner(String(e.n)); sound.play('count'); break;
      case 'go': banner('GO!', 'go'); sound.play('go'); sound.startMusic(); break;
      case 'startboost': if (isP(k)) { sound.play('boost'); banner('ROCKET START!', 'small'); } break;
      case 'lap':
        if (isP(k)) {
          const fin = k.lap === rc.laps, done = k.lap - 1;
          const mgNext = done % MG_EVERY === 0 && done < rc.laps;
          if (!mgNext) { banner(fin ? 'FINAL LAP!' : `LAP ${k.lap}`, fin ? 'final' : 'small'); sound.play(fin ? 'final' : 'lap'); }
        }
        break;
      case 'finish':
        if (isP(k)) {
          banner(`FINISH! ${k.place}${suffix(k.place)}`, 'go'); sound.play('finish');
          if (!rc.client) resultsTimer = 3.5;
          show('#touch', false);
          burst(k.x, 2, k.z, 40, RACERS.map((r) => r.color), 12);
        }
        break;
      case 'box': burst(e.x, 1.3, e.z, 14, [[1, 0.4, 0.4], [0.4, 0.7, 1], [1, 0.9, 0.3], [0.5, 1, 0.5]], 7, 0.35); if (isP(k)) sound.play('box'); break;
      case 'itemready': if (isP(k)) sound.play('item'); break;
      case 'boost': case 'pad': if (isP(k)) sound.play('boost'); break;
      case 'miniturbo': if (isP(k)) { sound.play(['mini1', 'mini1', 'mini2', 'mini3'][e.level] || 'mini1'); if (e.level === 3) banner('ULTRA TURBO!', 'small'); } break;
      case 'star': if (isP(k)) sound.play('star'); break;
      case 'spin': if (k) burst(k.x, 1.5, k.z, 12, [[1, 0.95, 0.3], [1, 1, 1]], 6, 0.3); if (k && (isP(k) || near(k.x, k.z))) sound.play('hit'); break;
      case 'splat': burst(e.x, 0.5, e.z, 10, [[1, 0.86, 0.15]], 5, 0.35); break;
      case 'rocket': if (isP(k)) sound.play('rocket'); break;
      case 'explode': burst(e.x, 1, e.z, 26, [[1, 0.5, 0.1], [1, 0.85, 0.2], [0.3, 0.3, 0.3]], 10, 0.6); if (near(e.x, e.z)) sound.play('explode'); break;
      case 'bump': if (isP(k)) sound.play('bump'); break;
      case 'hop': if (isP(k)) sound.play('hop'); break;
      case 'drop': if (isP(k)) sound.play('drop'); break;
      // mini-games
      case 'mgstart': snapCam = true; parts.length = 0; sound.stopMusic(); sound.play('mgstart'); break;
      case 'mgplay': if (rc.mg && rc.mg.type !== 'reaction') { banner('GO!', 'go'); sound.play('go'); } break;
      case 'green': sound.play('green'); break;
      case 'coin': burst(e.x, 1.4, e.z, 8, [[1, 0.85, 0.15], [1, 1, 0.6]], 5, 0.3); if (isP(k)) sound.play('coin'); break;
      case 'shoot': if (isP(k)) sound.play('shoot'); break;
      case 'target': burst(e.x, 3.2, e.z, 18, [[1, 0.2, 0.2], [1, 1, 1]], 8, 0.4); if (isP(k)) sound.play('target'); break;
      case 'react': if (isP(k)) sound.play(k.react >= 9 ? 'bad' : 'react'); break;
      case 'mgwin': sound.play('mgwin'); if (k) burst(k.x, 2, k.z, 30, [[1, 0.85, 0.2], [1, 1, 1]], 10); break;
      case 'mgend': snapCam = true; parts.length = 0; banner('BACK TO THE RACE!', 'small'); break;
      case 'hazard': if (k && (isP(k) || near(k.x, k.z))) sound.play('squash'); if (isP(k)) banner(e.mgType === 'crusher' ? 'SQUASHED!' : e.mgType === 'geyser' ? 'OUCH!' : 'BONK!', 'small'); break;
      case 'out': if (k) { k.outT = 0; if (isP(k)) { sound.play(e.n ? 'fall' : 'boom'); banner(e.n ? 'YOU FELL!' : 'KABOOM!', 'final'); } else if (e.n) sound.play('fall'); } break;
      case 'shrink': sound.play('shrink'); banner('SHRINKING!', 'small'); break;
      case 'call': if (e.n >= 0) { sound.play('call'); banner(MG_COLORS[e.n].name + '!', 'small'); } break;
      case 'drop': sound.play('explode'); break;
      case 'bombstart': if (k) { sound.play('pass'); if (isP(k)) banner('YOU HAVE THE BOMB!', 'final'); } break;
      case 'pass': sound.play('pass'); if (isP(k)) banner('YOU HAVE THE BOMB!', 'final'); break;
      case 'boom': burst(e.x, 1.5, e.z, 40, [[1, 0.5, 0.1], [1, 0.85, 0.2], [0.25, 0.25, 0.25]], 14, 0.7); sound.play('boom'); break;
    }
  }
  rc.events.length = 0;
}

// ================================================================= Rendering
const V = m4.create(), PR = m4.create(), VP = m4.create();
const LIGHT = (() => { const l = [0.35, 0.85, 0.4], n = Math.hypot(...l); return l.map((v) => v / n); })();

function updateCamera(rc, k, dt, t) {
  const cinematic = mode === 'menu';
  const vel = Math.hypot(k.vx, k.vz) > 6 ? Math.atan2(k.vx, k.vz) : k.h;
  const target = (cinematic ? k.h + Math.sin(t * 0.25) * 1.2 : k.h + wrapAngle(vel - k.h) * 0.45);
  if (snapCam) cam.h = target;
  else if (k.spin <= 0 || cinematic) cam.h += wrapAngle(target - cam.h) * Math.min(1, dt * (cinematic ? 2 : 5));
  const fx = Math.sin(cam.h), fz = Math.cos(cam.h);
  const dist = cinematic ? 10 : 8, height = cinematic ? 4.5 : 3.4;
  const a = snapCam ? 1 : 1 - Math.exp(-dt * 10);
  cam.x += (k.x - fx * dist - cam.x) * a; cam.z += (k.z - fz * dist - cam.z) * a; cam.y += (height - cam.y) * a;
  const tf = 68 + (k.boost > 0 ? 9 : 0) + (Math.max(0, k.speed) / rc.cfg.max) * 5;
  cam.fov += (tf - cam.fov) * Math.min(1, dt * 4);
  cam.look = [k.x + fx * 5, 1.4, k.z + fz * 5];
  snapCam = false;
}

function hsv(h) { const f = (n) => { const k = (n + h * 6) % 6; return 1 - Math.max(0, Math.min(k, 4 - k, 1)); }; return [f(5), f(3), f(1)]; }

function render(dt, t) {
  const rc = activeRace();
  const dpr = Math.min(window.devicePixelRatio || 1, 2) * quality;
  const w = Math.max(1, Math.round(innerWidth * dpr)), h = Math.max(1, Math.round(innerHeight * dpr));
  R.resize(w, h);
  if (!rc) return;
  const focus = mode === 'menu' ? rc.sorted[0] : rc.player;
  updateCamera(rc, focus, dt, t);

  const aspect = w / h;
  let fovy = (cam.fov * Math.PI) / 180;
  if (aspect < 1.3) fovy = Math.min((100 * Math.PI) / 180, 2 * Math.atan((Math.tan(fovy / 2) * 1.3) / aspect));
  m4.perspective(PR, fovy, aspect, 1, 1100);
  m4.lookAt(V, [cam.x, cam.y, cam.z], cam.look, [0, 1, 0]);
  m4.mul(VP, PR, V);
  const th = rc.def.theme, inMg = rc.state === 'minigame' && rc.mg;
  R.begin(VP, [cam.x, cam.y, cam.z], { light: LIGHT, fog: th.sky, fogNear: 160, fogFar: 820 });
  R.draw(inMg ? arenaFor(rc) : worldFor(rc), null);
  R.draw(cloudsFor(rc), null, [1, 1, 1], 1, 0.85);

  const shadows = [];
  if (inMg) {
    const mg = rc.mg, T = rc.track;
    mg.coins.forEach((c, i) => { m4.trs(tmpM, c.x, 1.4 + Math.sin(t * 3 + i) * 0.2, c.z, t * 3 + i); R.draw(M.coin, tmpM, [1, 1, 1], 1, 0.3); shadows.push([c.x, c.z, 0.7]); });
    for (const c of mg.targets) { m4.trs(tmpM, c.x, 0, c.z, Math.atan2(T.ax - c.x, T.az - c.z) + Math.sin(t * 1.5 + c.x) * 0.6); R.draw(M.target, tmpM); shadows.push([c.x, c.z, 0.8]); }
    for (const s of mg.shots) { m4.trs(tmpM, s.x, 1, s.z, s.h, 0, 0, 0.7); R.draw(M.rocket, tmpM); }
    if (mg.type === 'bumper') {
      const ri = Math.max(0, BUMPER_RADII.indexOf(mg.platR));
      m4.trs(tmpM, T.ax, 0.05, T.az); R.draw(M.lavaRings[ri], tmpM, [1, 0.85 + Math.sin(t * 3) * 0.15, 1], 1, 1);
    }
    if (mg.type === 'colors' && mg.tiles) {
      const warnFlash = mg.rphase === 'warn' && mg.rt < 1 && Math.sin(t * 20) > 0;
      arenaTiles(T).forEach((tl, i) => {
        const c = mg.tiles[i];
        const dropped = c < 0;
        const col = dropped ? [1, 0.38 + Math.sin(t * 4 + i) * 0.06, 0.06] : MG_COLORS[c].c;
        const lit = !dropped && mg.rphase === 'warn' && c === mg.call;
        m4.trs(tmpM, tl.x, dropped ? 0.02 : 0.1, tl.z, 0, 0, 0, [7.7, 0.2, 7.7]);
        R.draw(M.tile, tmpM, warnFlash && c !== mg.call ? col.map((v) => v * 0.55) : col, 1, dropped || lit ? 1 : 0.35);
      });
    }
    if (mg.type === 'bomb' && mg.bomb && !mg.bomb.out) {
      const h = mg.bomb, pulse = 1 + Math.sin(t * (6 + Math.max(0, 10 - mg.fuse) * 2)) * 0.12;
      m4.trs(tmpM, h.x, 3.4, h.z, t * 2, 0, 0, pulse); R.draw(M.bomb, tmpM);
      spawn(h.x + 0.15, 4.9, h.z, (Math.random() - 0.5) * 2, 2, (Math.random() - 0.5) * 2, 0.25, Math.random() < 0.5 ? [1, 0.9, 0.2] : [1, 0.4, 0.1], 0.18);
    }
    if (mg.type === 'reaction') {
      const on = mg.phase === 'play' || mg.phase === 'done';
      const col = mg.green || mg.phase === 'done' ? [0.2, 1, 0.3] : on ? [1, 0.15, 0.1] : [0.25, 0.25, 0.25];
      for (let i = 0; i < 3; i++) { m4.trs(tmpM, T.ax - 2.4 + i * 2.4, 6.6, T.az + 11.7, 0, 0, 0, 1.7); R.draw(M.cube, tmpM, col, 1, on ? 1 : 0); }
    }
  } else {
    rc.boxes.forEach((b, i) => {
      if (!b.active) return;
      m4.trs(tmpM, b.x, 1.4 + Math.sin(t * 2.5 + i) * 0.2, b.z, t * 1.4 + i, 0.4, 0.3);
      R.draw(M.box, tmpM, hsv((t * 0.3 + i * 0.1) % 1).map((v) => 0.75 + v * 0.35), 1, 0.35);
      shadows.push([b.x, b.z, 0.9]);
    });
    for (const b of rc.bananas) { m4.trs(tmpM, b.x, 0, b.z, b.x); R.draw(M.banana, tmpM); shadows.push([b.x, b.z, 0.8]); }
    drawObstacles(rc, t, dt, shadows);
    drawProps(rc, t);
    for (const r of rc.rockets) {
      m4.trs(tmpM, r.x, 1, r.z, r.h); R.draw(M.rocket, tmpM); shadows.push([r.x, r.z, 0.6]);
      spawn(r.x - Math.sin(r.h) * 1.2, 1, r.z - Math.cos(r.h) * 1.2, 0, 1, 0, 0.5, [0.85, 0.85, 0.85], 0.5);
    }
  }
  for (const k of rc.karts) {
    let yaw = kartYaw(k);
    let hopY = k.hop > 0 ? Math.sin((1 - k.hop / 0.22) * Math.PI) * 0.45 : 0;
    if (k.out) {
      k.outT = (k.outT ?? 0) + dt;
      if (inMg && rc.mg.type !== 'bomb') {
        if (k.outT > 1.6) continue;
        hopY = -4.9 * k.outT * k.outT; yaw += k.outT * 6;
        if (Math.random() < 0.5) spawn(k.x, 0.3, k.z, (Math.random() - 0.5) * 4, 4, (Math.random() - 0.5) * 4, 0.5, [1, 0.5, 0.1], 0.4, 10);
      } else {
        m4.trs(tmpM, k.x, 0, k.z, yaw); R.draw(M.karts[k.racerIndex], tmpM, [0.25, 0.22, 0.2]);
        if (Math.random() < 0.3) spawn(k.x, 2, k.z, 0, 2, 0, 1, [0.3, 0.3, 0.3], 0.5);
        continue;
      }
    } else k.outT = 0;
    const bob = Math.sin(t * 30 + k.id) * 0.02 * Math.min(1, Math.abs(k.speed) / 10);
    m4.trs(tmpM, k.x, hopY + bob, k.z, yaw, 0, k.drift * 0.07);
    if (k.star > 0) R.draw(M.karts[k.racerIndex], tmpM, hsv((t * 3) % 1).map((v) => 0.6 + v * 0.8), 1, 0.4);
    else if (k.champ) R.draw(M.karts[k.racerIndex], tmpM, [1.1 + Math.sin(t * 6) * 0.1, 1.02, 0.8]);
    else R.draw(M.karts[k.racerIndex], tmpM);
    if (k.champ) { m4.trs(tmpM, k.x, 2.35 + hopY + Math.sin(t * 3) * 0.08, k.z, t * 2); R.draw(M.crown, tmpM, [1, 1, 1], 1, 0.3); }
    shadows.push([k.x, k.z, 1.7]);
    if (Math.hypot(k.x - cam.x, k.z - cam.z) < 140) emitKartParticles(k, dt, th);
  }
  for (let i = parts.length - 1; i >= 0; i--) {
    const p = parts[i];
    p.life -= dt; if (p.life <= 0) { parts.splice(i, 1); continue; }
    p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt; p.vy -= p.grav * dt;
    if (p.y < 0.05) { p.y = 0.05; p.vy *= -0.3; }
    m4.trs(tmpM, p.x, p.y, p.z, p.life * 7, p.life * 5, 0, p.size * (0.4 + 0.6 * (p.life / p.max)));
    R.draw(M.cube, tmpM, p.col, 1, 1);
  }
  for (const [x, z, s] of shadows) { m4.trs(tmpM, x, 0.09, z, 0, 0, 0, [s, 1, s * 1.2]); R.draw(M.shadow, tmpM, [1, 1, 1], 0.28, 1); }
  if (mode !== 'menu') updateNameTags(rc, focus);
}

function drawObstacles(rc, t, dt, shadows) {
  const T = rc.track;
  for (const o of rc.obstacles) {
    if (Math.hypot(o.x - cam.x, o.z - cam.z) > 260) continue;
    const s = rc.obstacleState(o, rc.time);
    const yaw = T.ang[o.idx];
    if (o.type === 'block') { m4.trs(tmpM, s.x, 0, s.z, yaw + o.idx); R.draw(M.blocks[o.kind] || M.blocks.rock, tmpM); shadows.push([s.x, s.z, 2]); }
    else if (o.type === 'mover') {
      if (o.kind === 'boulder') { m4.trs(tmpM, s.x, 2.1, s.z, yaw, 0, -s.lat * 0.5); R.draw(M.boulder, tmpM); shadows.push([s.x, s.z, 2.2]); }
      else {
        const dir = Math.cos(((rc.time + o.off) * 2 * Math.PI) / o.period) >= 0 ? -1 : 1;
        m4.trs(tmpM, s.x, Math.abs(Math.sin(t * 5)) * 0.1, s.z, yaw + dir * Math.PI / 2); R.draw(M.cow, tmpM); shadows.push([s.x, s.z, 1.8]);
      }
    } else if (o.type === 'crusher') {
      const sh = s.shake ? Math.sin(t * 70) * 0.12 : 0;
      m4.trs(tmpM, s.x + sh, s.y, s.z, yaw); R.draw(M.crusher, tmpM, o.idx % 2 ? [1, 1, 1] : [0.9, 0.95, 1.1]);
      shadows.push([s.x, s.z, 3.2 - s.y * 0.2]);
      if (s.hazard && Math.random() < 0.6) burst(s.x, 0.3, s.z, 3, [[0.7, 0.7, 0.7]], 6, 0.5);
    } else if (o.type === 'geyser') {
      const zap = o.kind === 'zap', col = zap ? [0.4, 0.95, 1] : [1, 0.45, 0.05];
      m4.trs(tmpM, s.x, 0, s.z); R.draw(M.vent, tmpM, zap ? [0.8, 1, 1.3] : [1, 1, 1]);
      if (s.warn && Math.random() < 0.5) spawn(s.x + (Math.random() - 0.5) * 2, 0.4, s.z + (Math.random() - 0.5) * 2, 0, 3, 0, 0.4, col, 0.3);
      if (s.active) {
        m4.trs(tmpM, s.x, 0, s.z, t * 3, 0, 0, [1.3 + Math.sin(t * 30) * 0.1, 9, 1.3]); R.draw(M.column, tmpM, col, 1, 1);
        spawn(s.x, 9, s.z, (Math.random() - 0.5) * 6, 3, (Math.random() - 0.5) * 6, 0.6, col, 0.5, 10);
      }
    } else if (o.type === 'ice') {
      m4.trs(tmpM, s.x, 0.05, s.z, 0, 0, 0, [o.r, 1, o.r]); R.draw(M.ice, tmpM, [1, 1, 1], 0.6, 0.6);
    }
  }
}
function drawProps(rc, t) {
  for (const p of propsFor(rc)) {
    let { x, y, z } = p, ry = p.ry || 0, rx = 0, rz = 0, sc = 1;
    if (p.anim === 'spin') rz = t * p.speed;
    else if (p.anim === 'bob') { y += Math.sin(t * 0.6 + p.phase) * 2; ry = t * 0.1 + p.phase; }
    else if (p.anim === 'orbit') { const a = t * p.speed; x += Math.cos(a) * p.r; z += Math.sin(a) * p.r; ry = -a; }
    else if (p.anim === 'float') { y += Math.sin(t * 1.3 + p.phase) * 0.8; ry = t * 0.8 + p.phase; }
    else if (p.anim === 'lavafall') sc = [p.s[0] * (1 + Math.sin(t * 5 + p.phase) * 0.08), p.s[1], p.s[2]];
    m4.trs(tmpM, x, y, z, ry, rx, rz, sc);
    R.draw(M[p.mesh], tmpM, p.tint || [1, 1, 1], 1, p.glow || 0);
  }
}

// Floating name tags above other racers.
const tagEls = [];
function updateNameTags(rc, focus) {
  const box = $('#tags');
  rc.karts.forEach((k, i) => {
    let el = tagEls[i];
    if (!el) { el = tagEls[i] = document.createElement('div'); box.appendChild(el); }
    const d = Math.hypot(k.x - cam.x, k.z - cam.z);
    const c = [VP[0] * k.x + VP[4] * 3.1 + VP[8] * k.z + VP[12], VP[1] * k.x + VP[5] * 3.1 + VP[9] * k.z + VP[13], 0, VP[3] * k.x + VP[7] * 3.1 + VP[11] * k.z + VP[15]];
    if (k === focus || c[3] <= 0.5 || d > 75) { el.hidden = true; return; }
    const sx = (c[0] / c[3] * 0.5 + 0.5) * innerWidth, sy = (1 - (c[1] / c[3] * 0.5 + 0.5)) * innerHeight;
    el.hidden = false;
    const label = (k.champ ? '👑 ' : '') + k.name;
    if (el.textContent !== label) el.textContent = label;
    el.className = 'tag' + (k.human ? ' human' : '');
    el.style.transform = `translate(${sx | 0}px, ${sy | 0}px) translate(-50%, -100%) scale(${Math.max(0.6, Math.min(1, 30 / d)).toFixed(2)})`;
    el.style.setProperty('--c', css(k.racer.color));
  });
}

// ================================================================= HUD
const hud = { root: $('#hud'), place: $('#place'), lap: $('#lap'), time: $('#time'), slots: [$('#item1 span'), $('#item2 span')],
  speed: $('#speed'), wrong: $('#wrongway'), mini: $('#minimap'), champ: $('#champ') };
const miniCtx = hud.mini.getContext('2d');
let miniBase = null, miniXf = null;

function drawMinimapBase(rc) {
  const T = rc.track, S = hud.mini.width, pad = 12;
  const { minX, maxX, minZ, maxZ } = T.bounds;
  const sc = (S - pad * 2) / Math.max(maxX - minX, maxZ - minZ);
  miniXf = (x, z) => [S / 2 - (x - T.cx) * sc, S / 2 - (z - T.cz) * sc];
  miniBase = document.createElement('canvas'); miniBase.width = miniBase.height = S;
  const c = miniBase.getContext('2d');
  c.lineJoin = 'round'; c.lineCap = 'round';
  const path = () => { c.beginPath(); for (let i = 0; i <= T.N; i += 3) { const [x, y] = miniXf(T.px[i % T.N], T.pz[i % T.N]); i ? c.lineTo(x, y) : c.moveTo(x, y); } c.closePath(); };
  path(); c.strokeStyle = 'rgba(0,0,0,0.55)'; c.lineWidth = 11; c.stroke();
  path(); c.strokeStyle = 'rgba(255,255,255,0.92)'; c.lineWidth = 6; c.stroke();
  const [sx, sy] = miniXf(T.px[0], T.pz[0]);
  c.fillStyle = '#111'; c.fillRect(sx - 4, sy - 4, 8, 8); c.fillStyle = '#fff'; c.fillRect(sx - 4, sy - 4, 4, 4); c.fillRect(sx, sy, 4, 4);
}
const setHTML = (el, html) => { if (el._h !== html) { el._h = html; el.innerHTML = html; } };

function updateHUD(now) {
  if (mode !== 'race' || !race) return;
  const p = race.player;
  const inMg = race.state === 'minigame' && race.mg;
  hud.root.classList.toggle('mgmode', !!inMg);
  updateMinigameHUD(now);
  setHTML(hud.place, `${p.place}<sup>${suffix(p.place)}</sup>`);
  hud.place.className = 'p' + Math.min(p.place, 4);
  hud.lap.textContent = `LAP ${Math.max(1, Math.min(race.laps, p.lap))}/${race.laps}`;
  hud.time.textContent = fmtTime(p.finished ? p.finishTime : race.time);
  hud.speed.textContent = `${Math.round(Math.abs(p.speed) * 3.6)} km/h`;
  const icons = Object.values(ITEM_ICONS), roll = icons[Math.floor(now / 70) % icons.length];
  hud.slots.forEach((el, i) => {
    const txt = i < p.items.length ? ITEM_ICONS[p.items[i]] : i < p.items.length + p.rolls.length ? roll : '';
    if (el.textContent !== txt) el.textContent = txt;
    el.parentElement.classList.toggle('ready', i < p.items.length);
  });
  hud.champ.hidden = !p.champ;
  hud.wrong.hidden = !(p.wrongWay > 1.2) || !!inMg;
  if (miniBase && !inMg) {
    const S = hud.mini.width;
    miniCtx.clearRect(0, 0, S, S); miniCtx.drawImage(miniBase, 0, 0);
    for (const k of [...race.karts].sort((a) => (a === p ? 1 : -1))) {
      const [x, y] = miniXf(k.x, k.z);
      miniCtx.beginPath(); miniCtx.arc(x, y, k === p ? 6 : k.human ? 5.5 : 4.5, 0, Math.PI * 2);
      miniCtx.fillStyle = css(k.racer.color); miniCtx.fill();
      miniCtx.lineWidth = k === p ? 2.5 : 1.5; miniCtx.strokeStyle = k === p ? '#fff' : k.human ? '#ffcf2e' : '#000'; miniCtx.stroke();
    }
  }
}

const MG_KEYS = Object.keys(MG_INFO);
let rouletteShown = -1;
function updateMinigameHUD() {
  const mg = race.state === 'minigame' && race.mg, el = $('#mg');
  if (!mg) { el.hidden = true; return; }
  el.hidden = false;
  const info = MG_INFO[mg.type], me = race.player;
  const card = $('#mgCard'), top = $('#mgTop'), light = $('#mgLight');
  const status = (k) => {
    if (mg.type === 'reaction') return k.react == null ? '—' : k.react >= 9 ? 'false start' : `${Math.round(k.react * 1000)} ms`;
    if (mg.type === 'bumper' || mg.type === 'colors' || mg.type === 'bomb') return k.out ? '💀 out' : mg.bomb === k ? '💣' : '✔';
    return k.mgScore;
  };
  const row = (k, i) => `<li class="${k === me ? 'me' : ''}${k.out ? ' out' : ''}"><b>${i + 1}</b><i style="background:${css(k.racer.color)}"></i><span>${esc(k.name)}</span><em>${status(k)}</em></li>`;
  const bonus = `Winner becomes 👑 <b>Champion</b>: +${Math.round((CHAMP_SPEED - 1) * 100)}% top speed and a free item until the next mini-game.`;
  if (mg.phase === 'intro') {
    card.hidden = false; top.hidden = true; light.hidden = true;
    const SPIN = 2.4;
    if (mg.t < SPIN) {
      // Mario Party-style roulette: spins through the mini-games and lands on the chosen one.
      const f = mg.t / SPIN, steps = Math.floor(22 * (1 - (1 - f) * (1 - f)));
      const idx = (MG_KEYS.indexOf(mg.type) + steps - 22 + MG_KEYS.length * 10) % MG_KEYS.length;
      if (steps !== rouletteShown) { rouletteShown = steps; sound.play('tick'); }
      setHTML(card, `<small>MINI-GAME TIME!</small><div class="roulette">${MG_KEYS.map((key, i) => `<span class="${i === idx ? 'on' : ''}">${MG_INFO[key].icon}</span>`).join('')}</div><h2>${MG_INFO[MG_KEYS[idx]].name}</h2>`);
    } else {
      rouletteShown = -1;
      setHTML(card, `<div class="mgIcon">${info.icon}</div><h2>${info.name}</h2><p>${info.help}</p><p class="mgCount">Starting in ${Math.max(1, Math.ceil(mg.intro - mg.t))}…</p><small>${bonus}</small>`);
    }
    return;
  }
  if (mg.phase === 'done') {
    top.hidden = true; light.hidden = true; card.hidden = false;
    const ranked = (mg.ranked || []).map((id) => race.karts[id]);
    const w = mg.winner;
    setHTML(card, `<div class="mgIcon">👑</div><h2>${w ? esc(w.name) + (w === me ? ' (You)' : '') : ''} wins ${info.name}!</h2>
      <ol class="mgList">${ranked.slice(0, 5).map(row).join('')}</ol><small>${w === me ? 'You are the Champion: +8% top speed and a free item until the next mini-game!' : 'Champion boost lasts until the next mini-game.'}</small>`);
    return;
  }
  card.hidden = true;
  if (mg.type === 'reaction') {
    top.hidden = true; light.hidden = false;
    const mine = me.react;
    light.className = mg.green ? 'green' : 'red';
    setHTML(light, `<div class="bulb"></div><b>${mine != null ? (mine >= 9 ? 'FALSE START! 😬' : `${Math.round(mine * 1000)} ms!`) : mg.green ? 'GO! PRESS NOW!' : 'WAIT FOR GREEN…'}</b><small>${input.usingTouch ? 'Tap ITEM or DRIFT' : 'Press Space or E'}</small>`);
    return;
  }
  light.hidden = true; top.hidden = false;
  let head = `${info.icon} ${info.name}`, sub = '', list;
  const alive = race.karts.filter((k) => !k.out).length;
  if (mg.type === 'coins' || mg.type === 'targets') {
    const ranked = [...race.karts].sort((a, b) => b.mgScore - a.mgScore), mi = ranked.indexOf(me);
    list = ranked.slice(0, 4).map(row).join('') + (mi >= 4 ? row(me, mi) : '');
    head += ` <span>${Math.max(0, Math.ceil(mg.dur - mg.t))}s</span>`;
  } else {
    const ranked = [...race.karts].sort((a, b) => (a.out - b.out) || (b.outRank - a.outRank));
    list = ranked.map(row).join('');
    head += ` <span>${alive} left</span>`;
    if (mg.type === 'colors' && mg.call >= 0) {
      const c = MG_COLORS[mg.call];
      sub = mg.rphase === 'warn' ? `<div class="call" style="--c:${css(c.c)}">Go to <b>${c.name}</b>! <em>${mg.rt.toFixed(1)}s</em></div>` : mg.rphase === 'drop' ? `<div class="call" style="--c:${css(c.c)}"><b>DROP!</b></div>` : '';
      head += ` · round ${mg.round}`;
    }
    if (mg.type === 'bomb') sub = mg.bomb === me ? '<div class="call hot"><b>💣 YOU HAVE THE BOMB — BUMP SOMEONE!</b></div>' : mg.bomb ? `<div class="call">💣 ${esc(mg.bomb.name)} has the bomb · ${mg.bombs} left</div>` : '';
    if (mg.type === 'bumper') sub = me.out ? '<div class="call">You\u2019re out — watch the rest!</div>' : `<div class="call">Stay on the platform! Edge shrinks every 9s</div>`;
    if (me.out && mg.type !== 'bumper') sub += '<div class="call">You\u2019re out — watch the rest!</div>';
  }
  setHTML(top, `<div class="mgTitle">${head}</div>${sub}<ol>${list}</ol>`);
}

let bannerTimer = 0;
function banner(text, cls = '') {
  const el = $('#banner');
  el.textContent = text; el.className = ''; void el.offsetWidth; el.className = 'show ' + cls;
  clearTimeout(bannerTimer); bannerTimer = setTimeout(() => (el.className = ''), 1300);
}
function show(sel, on) { $(sel).hidden = !on; }

// ================================================================= Results
function scoreboardHTML(l) {
  const rows = Object.entries(l).sort((a, b) => b[1] - a[1]);
  if (!rows.length) return '<li class="empty">No wins yet — win a race to score a point!</li>';
  return rows.map(([n, v], i) => `<li><b>${i + 1}</b><span>${esc(n)}</span><em>${v} ${v === 1 ? 'pt' : 'pts'}</em></li>`).join('');
}
function renderResultsScoreboard(l) { setHTML($('#resultsScores'), scoreboardHTML(l)); }

function finishResultsUI(title, info, rows, scores) {
  mode = 'results'; sound.stopMusic(); sound.engine(false, 0, false);
  show('#hud', false); show('#touch', false); show('#mg', false); show('#pause', false);
  $('#tags').innerHTML = ''; tagEls.length = 0;
  $('#resultsTitle').textContent = title;
  $('#resultsInfo').textContent = info;
  $('#resultsList').innerHTML = rows;
  renderResultsScoreboard(scores);
  show('#results', true);
}
function resultButtons() {
  const host = !online || isHost();
  $('#againBtn').hidden = !host; $('#nextBtn').hidden = !host;
  $('#menuBtn').textContent = online ? 'Lobby' : 'Menu';
  $('#resultsWait').hidden = host;
}
function showResults() {
  const res = race.results(), p = race.player;
  const key = `best.${race.trackIndex}.${race.cc}.${race.laps}`, best = store.get(key, null);
  let newBest = false;
  if (p.finished && (best == null || p.finishTime < best)) { store.set(key, p.finishTime); newBest = true; }
  if (res[0].k === p) league.win(p.name);
  const rows = res.map((r, i) => `<li class="${r.k === p ? 'me' : ''}"><b>${i + 1}</b><i style="background:${css(r.k.racer.color)}"></i>
    <span>${esc(r.k.name)}${r.k === p ? ' (You)' : ''}</span><em>${r.est ? '~' : ''}${fmtTime(r.time)}</em></li>`).join('');
  finishResultsUI(
    p.place === 1 ? '🏆 You Win! +1 point' : p.place <= 3 ? `🎉 ${p.place}${suffix(p.place)} Place!` : `${p.place}${suffix(p.place)} Place`,
    `${race.def.name} · ${CC[race.cc].label} · ${race.laps} laps` + (newBest ? ' · ⭐ New best time!' : best != null ? ` · Best ${fmtTime(Math.min(best, p.finishTime || Infinity))}` : ''),
    rows, league.get());
  resultButtons();
}
function showResultsOnline(m) {
  if (!race) return;
  const me = race.player, myPlace = m.res.findIndex((r) => r.id === me.id) + 1;
  const rows = m.res.map((r, i) => `<li class="${r.id === me.id ? 'me' : ''}"><b>${i + 1}</b><i style="background:${css(RACERS[r.racer].color)}"></i>
    <span>${esc(r.name)}${r.id === me.id ? ' (You)' : r.human ? ' 🎮' : ''}</span><em>${r.est ? '~' : ''}${fmtTime(r.time)}</em></li>`).join('');
  const title = myPlace === 1 ? '🏆 You Win! +1 point' : m.winner ? `🏆 ${m.winner} wins! (+1 point)` : `${myPlace}${suffix(myPlace)} Place`;
  finishResultsUI(title, `${race.def.name} · ${CC[race.cc].label} · ${race.laps} laps · you finished ${myPlace}${suffix(myPlace)}`, rows, m.league);
  resultButtons();
}

// ================================================================= Menu / lobby
const DIFF_ORDER = ['Easy', 'Medium', 'Hard'];
function buildMenu() {
  $('#racers').innerHTML = RACERS.map((r, i) => `<button data-i="${i}" style="--c:${css(r.color)};--a:${css(r.accent)}"><i></i>${r.name}</button>`).join('');
  $('#tracks').innerHTML = DIFF_ORDER.map((d) => `<div class="diffRow"><span class="diff ${d}">${d}</span>${TRACKS.map((t, i) => (t.diff === d
    ? `<button data-i="${i}" style="--c:${css(t.theme.ground)};--a:${css(t.theme.sky)}">${t.name}</button>` : '')).join('')}</div>`).join('');
  $('#ccs').innerHTML = Object.keys(CC).map((c) => `<button data-i="${c}">${CC[c].label}</button>`).join('');
  $('#lapsRow').innerHTML = LAP_OPTIONS.map((n) => `<button data-i="${n}">${n} laps</button>`).join('');
  const nameInput = $('#nameInput');
  nameInput.value = settings.name;
  let nameTimer = 0;
  nameInput.addEventListener('input', () => {
    settings.name = nameInput.value.slice(0, 14); saveSettings();
    clearTimeout(nameTimer);
    nameTimer = setTimeout(() => { if (inRoom()) online.net.send({ t: 'profile', name: myName() }); }, 500);
  });
  nameInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') nameInput.blur(); e.stopPropagation(); });

  const pick = (sel, key) => $(sel).addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b || b.disabled) return;
    const v = Number(b.dataset.i);
    sound.unlock(); sound.play('click');
    if (key === 'racer') {
      settings.racer = v;
      if (inRoom()) online.net.send({ t: 'profile', racer: v });
    } else {
      if (inRoom() && !isHost()) return;
      settings[key] = v;
      if (inRoom()) {
        online.room.settings = { ...online.room.settings, [key]: v }; // apply locally now so quick clicks don't overwrite each other
        online.net.send({ t: 'settings', ...online.room.settings });
      }
      if (key === 'track' && demo.trackIndex !== v) newDemo();
    }
    saveSettings(); refreshMenu();
  });
  pick('#racers', 'racer'); pick('#tracks', 'track'); pick('#ccs', 'cc'); pick('#lapsRow', 'laps');
  $('#muteBtn').addEventListener('click', () => { settings.muted = !settings.muted; sound.unlock(); sound.setMuted(settings.muted); saveSettings(); refreshMenu(); });
  $('#help').innerHTML = input.isTouch
    ? 'Put your thumb anywhere on the <b>left side</b> and slide to steer · auto-gas · hold <b>DRIFT</b> through a turn, release on blue/orange/purple sparks · <b>ITEM</b> uses items (hold up to 2)'
    : '<b>←→ / A D</b> steer · <b>↑ / W</b> gas · <b>↓ / S</b> brake · hold <b>Space</b> + steer to drift, release on blue/orange/purple sparks · <b>E / X</b> item (hold up to 2) · <b>Esc</b> pause · 🎮 controllers supported';
  refreshMenu();
}

function refreshMenu() {
  const room = inRoom() ? online.room : null, host = isHost(), s = currentSettings();
  const mine = room && room.players.find((p) => p.pid === online.pid);
  const takenBy = new Map(room ? room.players.filter((p) => p.pid !== online.pid).map((p) => [p.racer, p.name]) : []);
  document.querySelectorAll('#racers button').forEach((b) => {
    const i = +b.dataset.i;
    b.classList.toggle('on', i === (mine ? mine.racer : settings.racer));
    b.disabled = takenBy.has(i);
    b.title = takenBy.has(i) ? `Taken by ${takenBy.get(i)}` : '';
  });
  const lockSettings = room && !host;
  const mark = (sel, v) => document.querySelectorAll(sel + ' button').forEach((b) => { b.classList.toggle('on', +b.dataset.i === v); b.disabled = !!lockSettings; });
  mark('#tracks', s.track); mark('#ccs', s.cc); mark('#lapsRow', s.laps);
  const best = store.get(`best.${s.track}.${s.cc}.${s.laps}`, null);
  $('#bestTime').textContent = `${TRACKS[s.track].diff} track · mini-game every ${MG_EVERY} laps` + (best != null ? ` · Best ${fmtTime(best)}` : '');
  $('#muteBtn').textContent = settings.muted ? '🔇' : '🔊';

  $('#roomBar').hidden = !room;
  $('#onlineBtn').hidden = !!room;
  const start = $('#startBtn');
  if (!room) { start.textContent = 'RACE!'; start.disabled = false; }
  else if (room.state === 'race') { start.textContent = 'Race in progress…'; start.disabled = true; }
  else if (host) { start.textContent = `START RACE (${room.players.length} ${room.players.length === 1 ? 'player' : 'players'})`; start.disabled = false; }
  else { start.textContent = 'Waiting for host…'; start.disabled = true; }
  if (room) {
    $('#roomCode').textContent = room.code;
    $('#inviteLink').textContent = inviteLink();
    setHTML($('#players'), room.players.map((p) => `<li style="--c:${css(RACERS[p.racer].color)}"><i></i>${esc(p.name)}${p.pid === room.host ? ' 👑 host' : ''}${p.pid === online.pid ? ' (you)' : ''}</li>`).join('')
      + (room.players.length < 8 ? `<li class="cpu">+ ${8 - room.players.length} CPU racers</li>` : ''));
  }
  $('#scoresTitle').textContent = room ? 'Room scoreboard' : 'Scoreboard';
  setHTML($('#scoreboard'), scoreboardHTML(room ? room.league : league.get()));
  $('#resetScores').hidden = !!room && !host;
}

function wireButtons() {
  $('#startBtn').addEventListener('click', startSolo);
  $('#onlineBtn').addEventListener('click', () => goOnline(null));
  $('#inviteBtn').addEventListener('click', shareInvite);
  $('#leaveBtn').addEventListener('click', leaveOnline);
  $('#resetScores').addEventListener('click', () => {
    if (!confirm('Reset the scoreboard to zero?')) return;
    if (inRoom()) { if (isHost()) online.net.send({ t: 'resetLeague' }); } else { league.set({}); refreshMenu(); }
  });
  $('#pauseBtn').addEventListener('click', () => setPaused(true));
  $('#resumeBtn').addEventListener('click', () => setPaused(false));
  $('#restartBtn').addEventListener('click', startSolo);
  $('#quitBtn').addEventListener('click', () => (online ? leaveOnline() : toMenu()));
  $('#againBtn').addEventListener('click', () => (online ? online.net.send({ t: 'start' }) : startSolo()));
  $('#nextBtn').addEventListener('click', () => {
    const next = (currentSettings().track + 1) % TRACKS.length;
    settings.track = next; saveSettings();
    if (online) { online.net.send({ t: 'settings', ...online.room.settings, track: next }); online.net.send({ t: 'start' }); }
    else startSolo();
  });
  $('#menuBtn').addEventListener('click', toMenu);
  input.bindTouch($('#steerZone'), $('#stick'), $('#stickKnob'), [[$('#bDrift'), 'drift'], [$('#bItem'), 'item'], [$('#bBrake'), 'brake']]);
  document.addEventListener('pointerdown', () => sound.unlock());
  document.addEventListener('keydown', () => sound.unlock());
  document.addEventListener('gesturestart', (e) => e.preventDefault());
  document.addEventListener('touchmove', (e) => { if (mode === 'race') e.preventDefault(); }, { passive: false });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { if (mode === 'race' && resultsTimer < 0 && !online) setPaused(true); sound.suspend(); } else if (!paused) sound.resume();
  });
}

// ================================================================= Main loop
const STEP = 1 / 60;
let last = performance.now(), acc = 0, avgDt = 1 / 60;

function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.1, (now - last) / 1000); last = now;
  const t = now / 1000;
  const ip = input.read(dt);

  if (mode === 'menu') {
    if (ip.confirmPressed && document.activeElement !== $('#nameInput') && !$('#startBtn').disabled) startSolo();
    acc += dt;
    while (acc >= STEP) { demo.step(STEP); acc -= STEP; }
    demo.events.length = 0;
    if (demo.finishOrder.length >= 3) newDemo();
  } else if (mode === 'race') {
    if (ip.pausePressed && resultsTimer < 0) setPaused(!paused);
    else if (paused && ip.confirmPressed) setPaused(false);
    const me = race.player;
    const blocked = paused && online;
    if (!paused || online) {
      Object.assign(me.input, blocked ? { steer: 0, gas: false, brake: false, drift: false, item: false }
        : { steer: ip.steer, gas: ip.gas, brake: ip.brake, drift: ip.drift, item: ip.item });
      if (online) onlineInput(ip, now, blocked);
      acc += dt;
      while (acc >= STEP) {
        if (online) {
          if (window.__tkAuto) autopilot(me); // test hook: let the AI drive our kart
          race.stepClient(STEP); if (++online.tick % 2 === 0) sendState();
        }
        else race.step(STEP);
        acc -= STEP;
      }
      if (online) smoothNetKarts(dt, now);
      handleEvents(race);
      sound.engine(race.state !== 'minigame' || race.mg?.phase === 'play', Math.min(1, Math.abs(me.speed) / (race.cfg.max * 1.35)), me.boost > 0);
      if (resultsTimer > 0) { resultsTimer -= dt; if (resultsTimer <= 0) showResults(); }
    }
  } else if (mode === 'results') {
    if (ip.confirmPressed && (!online || isHost())) $('#againBtn').click();
    else if (ip.pausePressed) toMenu();
    acc += dt;
    while (acc >= STEP) { if (online) race.stepClient(STEP); else race.step(STEP); acc -= STEP; }
    if (online) smoothNetKarts(dt, now);
    race.events.length = 0;
  }
  if (!(mode === 'race' && paused && !online)) render(dt, t);
  updateHUD(now);

  // Adaptive resolution for older iPhones / iPads.
  avgDt += (dt - avgDt) * 0.05;
  if (avgDt > 1 / 40 && quality > 0.55) { if (++slowFrames > 90) { quality *= 0.85; slowFrames = 0; } } else slowFrames = 0;
}

function autopilot(me) {
  if (race.state === 'racing') race.aiDrive(me, STEP);
  else if (race.state === 'minigame' && race.mg && race.mg.phase === 'play' && race.mg.type !== 'reaction') race.aiMinigame(me, STEP);
}

// Item presses and reaction taps are sent to the server, which owns items and mini-game scoring.
function onlineInput(ip, now, blocked) {
  const me = race.player, mg = race.mg;
  const itemEdge = ip.item && !prevIpItem && !blocked; prevIpItem = ip.item;
  const react = ip.item || ip.drift, reactEdge = react && !prevIpReact && !blocked; prevIpReact = react;
  if (itemEdge) {
    if ((race.state === 'racing' && me.items.length) || (race.state === 'minigame' && mg && mg.type === 'targets' && mg.phase === 'play')) online.net.send({ t: 'item' });
  }
  if (reactEdge && race.state === 'minigame' && mg && mg.type === 'reaction' && mg.phase === 'play' && !online.reactSent) {
    const v = mg.green && online.greenSeen ? (now - online.greenSeen) / 1000 : 9;
    online.reactSent = true; me.react = v;
    online.net.send({ t: 'react', v });
    sound.play(v >= 9 ? 'bad' : 'react');
  }
}

buildMenu();
wireButtons();
newDemo();
requestAnimationFrame(frame);
const invited = new URLSearchParams(location.search).get('room');
if (invited) goOnline(invited.toUpperCase());
window.__tk = { get race() { return race; }, get mode() { return mode; }, get online() { return online; }, startSolo };
