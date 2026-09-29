// WebSocket client for online rooms. The game server serves the page, so by default we connect back to the same host.
// Override with ?server=https://your-server.example (e.g. when the game files are hosted somewhere else).
export function serverBase() {
  const q = new URLSearchParams(location.search).get('server');
  return (q || location.origin).replace(/\/+$/, '');
}

export class Net {
  constructor() { this.ws = null; this.handlers = {}; this.onclose = null; }
  on(type, fn) { this.handlers[type] = fn; return this; }
  connect() {
    return new Promise((resolve, reject) => {
      let settled = false;
      const url = serverBase().replace(/^http/, 'ws') + '/ws';
      let ws;
      try { ws = this.ws = new WebSocket(url); } catch (e) { reject(e); return; }
      const timer = setTimeout(() => { if (!settled) { settled = true; ws.close(); reject(new Error('timeout')); } }, 7000);
      ws.onopen = () => { settled = true; clearTimeout(timer); resolve(); };
      ws.onerror = () => { if (!settled) { settled = true; clearTimeout(timer); reject(new Error('connect failed')); } };
      ws.onclose = () => { if (settled && this.ws === ws) { this.ws = null; this.onclose?.(); } };
      ws.onmessage = (e) => {
        let m; try { m = JSON.parse(e.data); } catch { return; }
        this.handlers[m.t]?.(m);
      };
    });
  }
  get open() { return this.ws && this.ws.readyState === 1; }
  send(obj) { if (this.open) this.ws.send(JSON.stringify(obj)); }
  close() { const ws = this.ws; this.ws = null; if (ws) ws.close(); }
}
