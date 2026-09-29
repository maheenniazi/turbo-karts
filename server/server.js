// Turbo Karts game server — zero dependencies (Node 18+).
// Serves the game files AND hosts online rooms over WebSocket (/ws). The server runs the real race
// (AI, items, laps, mini-games, scoring); each player drives their own kart and streams its state.
import http from 'node:http';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Race, TRACKS, RACERS, CC, LAP_OPTIONS, MG_INFO } from '../js/sim.js';
const MG_TYPES = Object.keys(MG_INFO);

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = +process.env.PORT || 8000;
const STEP = 1 / 60, SNAP_EVERY = 3; // 60 Hz simulation, 20 Hz snapshots
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.png': 'image/png', '.webmanifest': 'application/manifest+json', '.json': 'application/json', '.svg': 'image/svg+xml',
};

// ------------------------------------------------------------------ static files
const server = http.createServer((req, res) => {
  let p;
  try { p = decodeURIComponent(new URL(req.url, 'http://x').pathname); } catch { res.writeHead(400).end(); return; }
  if (p === '/healthz') { res.writeHead(200, { 'Content-Type': 'text/plain' }).end('ok'); return; }
  if (p.endsWith('/')) p += 'index.html';
  const file = path.normalize(path.join(ROOT, p));
  const rel = path.relative(ROOT, file);
  const blocked = rel.startsWith('..') || path.isAbsolute(rel) || rel.split(path.sep).some((s) => s.startsWith('.')) ||
    rel.startsWith('server') || rel === 'package.json';
  if (blocked || !TYPES[path.extname(file)]) { res.writeHead(404).end('Not found'); return; }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404).end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)], 'Cache-Control': 'no-cache' });
    res.end(data);
  });
});

// ------------------------------------------------------------------ minimal WebSocket (RFC 6455)
class Conn {
  constructor(socket) {
    this.s = socket; this.buf = Buffer.alloc(0); this.frag = []; this.alive = true; this.open = true; this.closed = false;
    socket.on('data', (d) => this.onData(d));
    socket.on('close', () => this.onClose());
    socket.on('error', () => socket.destroy());
  }
  onData(d) {
    this.buf = Buffer.concat([this.buf, d]);
    if (this.buf.length > 1 << 20) { this.close(); return; }
    for (;;) {
      if (this.buf.length < 2) return;
      const b0 = this.buf[0], b1 = this.buf[1], fin = b0 & 0x80, op = b0 & 0x0f, masked = b1 & 0x80;
      let len = b1 & 0x7f, off = 2;
      if (len === 126) { if (this.buf.length < 4) return; len = this.buf.readUInt16BE(2); off = 4; }
      else if (len === 127) { if (this.buf.length < 10) return; len = Number(this.buf.readBigUInt64BE(2)); off = 10; }
      if (len > 1 << 20) { this.close(); return; }
      const maskOff = off; if (masked) off += 4;
      if (this.buf.length < off + len) return;
      let payload = Buffer.from(this.buf.subarray(off, off + len));
      if (masked) { const m = this.buf.subarray(maskOff, maskOff + 4); for (let i = 0; i < payload.length; i++) payload[i] ^= m[i & 3]; }
      this.buf = this.buf.subarray(off + len);
      if (op === 0x8) { this.close(); return; }
      if (op === 0x9) { this.frame(0xa, payload); continue; }
      if (op === 0xa) { this.alive = true; continue; }
      this.frag.push(payload);
      if (fin) { const msg = Buffer.concat(this.frag).toString('utf8'); this.frag = []; this.alive = true; this.onmessage?.(msg); }
    }
  }
  frame(op, data) {
    if (!this.open) return;
    const len = data.length; let h;
    if (len < 126) h = Buffer.from([0x80 | op, len]);
    else if (len < 65536) { h = Buffer.alloc(4); h[0] = 0x80 | op; h[1] = 126; h.writeUInt16BE(len, 2); }
    else { h = Buffer.alloc(10); h[0] = 0x80 | op; h[1] = 127; h.writeBigUInt64BE(BigInt(len), 2); }
    this.s.write(Buffer.concat([h, data]));
  }
  send(obj) { this.frame(0x1, Buffer.from(typeof obj === 'string' ? obj : JSON.stringify(obj))); }
  get congested() { return this.s.writableLength > 256 * 1024; }
  close() {
    if (!this.open) return;
    try { this.frame(0x8, Buffer.alloc(0)); } catch { /* ignore */ }
    this.open = false; this.s.end(); setTimeout(() => this.s.destroy(), 1000);
    this.onClose();
  }
  onClose() { if (this.closed) return; this.closed = true; this.open = false; this.onclose?.(); }
}

const conns = new Set();
server.on('upgrade', (req, socket) => {
  const key = req.headers['sec-websocket-key'];
  let pathname = '';
  try { pathname = new URL(req.url, 'http://x').pathname; } catch { /* ignore */ }
  if (pathname !== '/ws' || !key || (req.headers.upgrade || '').toLowerCase() !== 'websocket') { socket.destroy(); return; }
  const accept = crypto.createHash('sha1').update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
  socket.write(`HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ${accept}\r\n\r\n`);
  socket.setNoDelay(true);
  const c = new Conn(socket);
  conns.add(c);
  onConnect(c);
});
// Heartbeat keeps connections alive through proxies and drops dead ones.
setInterval(() => {
  for (const c of conns) {
    if (c.closed) { conns.delete(c); continue; }
    if (!c.alive) { c.close(); continue; }
    c.alive = false; c.frame(0x9, Buffer.alloc(0));
  }
}, 20000);

// ------------------------------------------------------------------ rooms
const rooms = new Map();
let nextPid = 1;
const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
function newCode() {
  let c;
  do { c = Array.from({ length: 4 }, () => CODE_CHARS[crypto.randomInt(CODE_CHARS.length)]).join(''); } while (rooms.has(c));
  return c;
}
const cleanName = (n) => String(n || '').replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, 14) || 'Racer';
function cleanLeague(l) {
  const out = {};
  if (l && typeof l === 'object') for (const [k, v] of Object.entries(l).slice(0, 50)) if (Number.isInteger(v) && v >= 0) out[cleanName(k)] = Math.min(v, 99999);
  return out;
}
function freeRacer(room, want, self) {
  const taken = new Set(room.players.filter((p) => p !== self).map((p) => p.racer));
  want = Number.isInteger(want) && want >= 0 && want < RACERS.length ? want : 0;
  for (let i = 0; i < RACERS.length; i++) { const r = (want + i) % RACERS.length; if (!taken.has(r)) return r; }
  return want;
}
function uniqueName(room, name, self) {
  const names = new Set(room.players.filter((p) => p !== self).map((p) => p.name.toLowerCase()));
  if (!names.has(name.toLowerCase())) return name;
  for (let i = 2; ; i++) { const n = `${name.slice(0, 12)} ${i}`; if (!names.has(n.toLowerCase())) return n; }
}
const roomInfo = (room) => ({
  t: 'room', code: room.code, host: room.host, state: room.race ? 'race' : 'lobby', settings: room.settings, league: room.league,
  players: room.players.map((p) => ({ pid: p.pid, name: p.name, racer: p.racer })),
});
function broadcast(room, msg) { const s = JSON.stringify(msg); for (const p of room.players) p.conn.send(s); }
function sendRoom(room) { for (const p of room.players) p.conn.send({ ...roomInfo(room), you: p.pid }); }

function onConnect(conn) {
  conn.pid = nextPid++;
  conn.room = null;
  conn.onmessage = (raw) => {
    let m; try { m = JSON.parse(raw); } catch { return; }
    if (!m || typeof m.t !== 'string') return;
    try { handle(conn, m); } catch (e) { console.error('message error', e); }
  };
  conn.onclose = () => { conns.delete(conn); leave(conn); };
}

function handle(conn, m) {
  const room = conn.room, me = room && room.players.find((p) => p.conn === conn), isHost = room && room.host === conn.pid;
  switch (m.t) {
    case 'create': {
      if (room) leave(conn);
      const r = { code: newCode(), players: [], host: conn.pid, settings: { track: 0, cc: 100, laps: 10 }, league: cleanLeague(m.league), race: null };
      rooms.set(r.code, r);
      applySettings(r, m.settings);
      join(r, conn, m);
      console.log(`room ${r.code} created (${rooms.size} rooms)`);
      break;
    }
    case 'join': {
      const r = rooms.get(String(m.room || '').toUpperCase());
      if (!r) { conn.send({ t: 'error', msg: 'That room doesn\u2019t exist any more. Ask for a new invite link.' }); return; }
      if (r.players.length >= 8) { conn.send({ t: 'error', msg: 'That room is full (8 racers max).' }); return; }
      if (room) leave(conn);
      join(r, conn, m);
      break;
    }
    case 'leave': leave(conn); break;
    case 'profile':
      if (!me) return;
      if (m.name != null) me.name = uniqueName(room, cleanName(m.name), me);
      if (m.racer != null && !room.race) me.racer = freeRacer(room, m.racer, me);
      sendRoom(room);
      break;
    case 'settings': if (isHost && !room.race) { applySettings(room, m); sendRoom(room); } break;
    case 'start': if (isHost && !room.race) startRace(room); break;
    case 'resetLeague': if (isHost) { room.league = {}; sendRoom(room); } break;
    case 'st': if (room?.race) room.race.setRemoteState(room.race.kartByPid(conn.pid), m); break;
    case 'item': if (room?.race) { const k = room.race.kartByPid(conn.pid); if (k) k.itemQueued = true; } break;
    case 'react': if (room?.race) room.race.setReact(room.race.kartByPid(conn.pid), +m.v); break;
    case 'ping': conn.send({ t: 'pong', ts: m.ts }); break;
    case 'debug': // testing only: jump a kart to just before the finish line on a given lap
      if (process.env.TK_DEBUG && room?.race) {
        const k = room.race.kartByPid(conn.pid), T = room.race.track, i = T.wrap(T.N - 25);
        if (!k) return;
        [k.x, k.z] = T.point(i, 0); k.idx = i; k.h = T.ang[i]; k.lap = +m.lap || 3; k.tp++; if (MG_TYPES.includes(m.mg)) room.race.forceMg = m.mg;
      }
      break;
  }
}
function applySettings(room, s) {
  if (!s) return;
  if (Number.isInteger(s.track) && s.track >= 0 && s.track < TRACKS.length) room.settings.track = s.track;
  if (CC[s.cc]) room.settings.cc = +s.cc;
  if (LAP_OPTIONS.includes(s.laps)) room.settings.laps = s.laps;
}
function join(room, conn, m) {
  const p = { pid: conn.pid, conn, name: '', racer: 0 };
  room.players.push(p);
  p.racer = freeRacer(room, m.racer, p);
  p.name = uniqueName(room, String(m.name || '').trim() ? cleanName(m.name) : RACERS[p.racer].name, p);
  conn.room = room;
  sendRoom(room);
  if (room.race) conn.send({ t: 'wait' }); // race in progress: join the next one
}
function leave(conn) {
  const room = conn.room;
  if (!room) return;
  conn.room = null;
  room.players = room.players.filter((p) => p.conn !== conn);
  if (room.race) { const k = room.race.kartByPid(conn.pid); if (k) { k.ctrl = 'ai'; k.connected = false; k.stAge = 9; } }
  if (!room.players.length) { rooms.delete(room.code); console.log(`room ${room.code} closed (${rooms.size} rooms)`); return; }
  if (room.host === conn.pid) room.host = room.players[0].pid;
  sendRoom(room);
}

// ------------------------------------------------------------------ races
function startRace(room) {
  const { track, cc, laps } = room.settings;
  const opts = { trackIndex: track, cc, laps, seed: crypto.randomInt(1 << 24), humans: room.players.map((p) => ({ pid: p.pid, name: p.name, racer: p.racer })) };
  room.race = new Race({ ...opts, mode: 'server' });
  room.inRace = new Set(room.players.map((p) => p.pid));
  room.acc = 0; room.ticks = 0; room.evbuf = []; room.endAt = 0; room.firstFinish = 0; room.last = performance.now();
  broadcast(room, { t: 'start', opts });
  sendRoom(room);
}
function endRace(room) {
  const race = room.race;
  const res = race.results().map((r) => ({ id: r.k.id, name: r.k.name, racer: r.k.racerIndex, human: r.k.human, time: Math.round(r.time * 100) / 100, est: r.est }));
  const win = res[0];
  if (win && win.human) room.league[win.name] = (room.league[win.name] || 0) + 1;
  room.race = null;
  broadcast(room, { t: 'results', res, league: room.league, winner: win && win.human ? win.name : null });
  sendRoom(room);
}

setInterval(() => {
  const now = performance.now();
  for (const room of rooms.values()) {
    const race = room.race;
    if (!race) continue;
    room.acc = Math.min(room.acc + (now - room.last) / 1000, STEP * 10);
    room.last = now;
    while (room.acc >= STEP) {
      race.step(STEP);
      room.acc -= STEP;
      if (race.events.length) { room.evbuf.push(...race.events); race.events.length = 0; }
      if (++room.ticks % SNAP_EVERY === 0) {
        const s = JSON.stringify(race.snapshot(room.evbuf));
        room.evbuf = [];
        for (const p of room.players) if (room.inRace.has(p.pid) && !p.conn.congested) p.conn.send(s);
      }
    }
    // End once every connected human finished (or 45s after the first human finished).
    const humans = race.karts.filter((k) => k.human && k.connected);
    if (!humans.length) { room.race = null; sendRoom(room); continue; }
    if (!room.firstFinish && humans.some((k) => k.finished)) room.firstFinish = now;
    if (!room.endAt && (humans.every((k) => k.finished) || (room.firstFinish && now - room.firstFinish > 45000))) room.endAt = now + 3500;
    if (room.endAt && now >= room.endAt) endRace(room);
  }
}, 5);

server.listen(PORT, () => console.log(`Turbo Karts server on http://localhost:${PORT}  (share this address; invite links are made in-game)`));
