// Unified input: keyboard (Mac), touch controls (iPhone/iPad) and game controllers (both).
export class Input {
  constructor() {
    this.keys = new Set();
    this.touch = { steer: 0, drift: false, item: false, brake: false };
    this.kbSteer = 0;
    this.prevPause = false;
    this.prevConfirm = false;
    const force = new URLSearchParams(location.search).get('touch');
    this.isTouch = force != null ? force !== '0' : matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 1;
    this.usingTouch = this.isTouch;

    addEventListener('keydown', (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();
      this.keys.add(e.code); this.usingTouch = false;
    });
    addEventListener('keyup', (e) => this.keys.delete(e.code));
    addEventListener('blur', () => this.keys.clear());
  }

  // Floating joystick: touch anywhere in the steering zone; steering is relative to where your thumb landed.
  bindTouch(zone, base, knob, buttons) {
    const t = this.touch, RANGE = 58;
    let id = null, ox = 0, oy = 0;
    const move = (e) => {
      let dx = e.clientX - ox;
      // If the thumb drifts far past the edge, drag the joystick centre along (no "dead" feeling at full lock).
      if (Math.abs(dx) > RANGE * 1.4) { ox += dx - Math.sign(dx) * RANGE * 1.4; dx = e.clientX - ox; base.style.transform = `translate(${ox}px, ${oy}px)`; }
      let v = Math.max(-1, Math.min(1, dx / RANGE));
      v = Math.abs(v) < 0.07 ? 0 : Math.sign(v) * Math.pow((Math.abs(v) - 0.07) / 0.93, 1.25); // dead-zone + finer control near centre
      t.steer = v;
      knob.style.transform = `translateX(${Math.max(-RANGE, Math.min(RANGE, dx))}px)`;
    };
    zone.addEventListener('pointerdown', (e) => {
      if (id != null) return;
      id = e.pointerId; ox = e.clientX; oy = e.clientY;
      try { zone.setPointerCapture(id); } catch { /* ignore */ }
      base.style.transform = `translate(${ox}px, ${oy}px)`; base.classList.add('on'); zone.classList.add('used');
      this.usingTouch = true; move(e); e.preventDefault();
    });
    zone.addEventListener('pointermove', (e) => { if (e.pointerId === id) move(e); });
    const end = (e) => { if (e.pointerId !== id) return; id = null; t.steer = 0; knob.style.transform = ''; base.classList.remove('on'); };
    zone.addEventListener('pointerup', end); zone.addEventListener('pointercancel', end);

    for (const [el, key] of buttons) {
      const ids = new Set();
      const upd = () => { t[key] = ids.size > 0; el.classList.toggle('down', ids.size > 0); };
      el.addEventListener('pointerdown', (e) => { ids.add(e.pointerId); try { el.setPointerCapture(e.pointerId); } catch { /* ignore */ } this.usingTouch = true; upd(); e.preventDefault(); });
      const end = (e) => { ids.delete(e.pointerId); upd(); };
      el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end);
    }
  }

  read(dt) {
    const k = this.keys, has = (...c) => c.some((x) => k.has(x));
    const target = (has('ArrowRight', 'KeyD') ? 1 : 0) - (has('ArrowLeft', 'KeyA') ? 1 : 0);
    // Keyboard steering ramps in (so taps make small corrections) and snaps back to centre quickly.
    if (target === 0) this.kbSteer *= Math.max(0, 1 - dt * 20);
    else if (Math.sign(target) !== Math.sign(this.kbSteer)) this.kbSteer = target * 0.35;
    else this.kbSteer = Math.min(1, Math.abs(this.kbSteer) + dt * 5) * target;
    const out = {
      steer: this.kbSteer,
      gas: has('ArrowUp', 'KeyW'),
      brake: has('ArrowDown', 'KeyS'),
      drift: has('Space', 'ShiftLeft', 'ShiftRight'),
      item: has('KeyE', 'KeyX', 'KeyQ'),
      pause: has('Escape', 'KeyP'),
      confirm: has('Enter'),
    };
    // Game controller (Xbox / PlayStation / MFi — standard mapping)
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    for (const gp of pads) {
      if (!gp || !gp.connected) continue;
      const b = (i) => gp.buttons[i] && gp.buttons[i].pressed;
      let ax = gp.axes[0] || 0;
      ax = Math.abs(ax) < 0.12 ? 0 : Math.sign(ax) * Math.pow((Math.abs(ax) - 0.12) / 0.88, 1.4); // dead-zone + response curve
      if (b(14)) ax = -1; if (b(15)) ax = 1;
      if (ax) { out.steer = ax; this.usingTouch = false; }
      out.gas ||= b(0) || b(7);
      out.brake ||= b(1) || b(6);
      out.drift ||= b(4) || b(5);
      out.item ||= b(2) || b(3);
      out.pause ||= b(9);
      out.confirm ||= b(0) || b(9);
      if (b(0) || b(7)) this.usingTouch = false;
    }
    // Touch: auto-accelerate unless braking.
    if (this.usingTouch) {
      const t = this.touch;
      if (t.steer) out.steer = t.steer;
      out.brake ||= t.brake;
      out.gas ||= !t.brake;
      out.drift ||= t.drift;
      out.item ||= t.item;
    }
    out.pausePressed = out.pause && !this.prevPause; this.prevPause = out.pause;
    out.confirmPressed = out.confirm && !this.prevConfirm; this.prevConfirm = out.confirm;
    return out;
  }
}
