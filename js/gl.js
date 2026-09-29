// Tiny WebGL1 renderer: flat-shaded, vertex-coloured low-poly meshes with fog.
import { m4 } from './math.js';

const VS = `
attribute vec3 aPos; attribute vec3 aNor; attribute vec3 aCol;
uniform mat4 uVP; uniform mat4 uM;
varying vec3 vCol; varying vec3 vN; varying vec3 vW;
void main() {
  vec4 w = uM * vec4(aPos, 1.0);
  vW = w.xyz; vN = (uM * vec4(aNor, 0.0)).xyz; vCol = aCol;
  gl_Position = uVP * w;
}`;
const FS = `
precision mediump float;
varying vec3 vCol; varying vec3 vN; varying vec3 vW;
uniform vec3 uLight; uniform vec3 uFog; uniform vec3 uCam; uniform vec3 uTint;
uniform float uFogNear; uniform float uFogFar; uniform float uAlpha; uniform float uUnlit;
void main() {
  vec3 n = normalize(vN);
  float d = max(dot(n, uLight), 0.0);
  vec3 c = vCol * uTint;
  vec3 lit = c * (0.5 + 0.62 * d);
  lit = mix(lit, c, uUnlit);
  float f = clamp((length(vW - uCam) - uFogNear) / (uFogFar - uFogNear), 0.0, 1.0);
  gl_FragColor = vec4(mix(lit, uFog, f * f * (3.0 - 2.0 * f)), uAlpha);
}`;

// ------------------------------------------------------------------ Mesh builder
export class MeshBuilder {
  constructor() { this.d = []; this.m = null; }
  tf(p) { return this.m ? m4.apply(this.m, p) : p; }
  tri(a, b, c, col, center) {
    a = this.tf(a); b = this.tf(b); c = this.tf(c);
    const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2];
    const vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
    let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    const l = Math.hypot(nx, ny, nz) || 1; nx /= l; ny /= l; nz /= l;
    if (center) {
      const cc = this.tf(center);
      const gx = (a[0] + b[0] + c[0]) / 3 - cc[0], gy = (a[1] + b[1] + c[1]) / 3 - cc[1], gz = (a[2] + b[2] + c[2]) / 3 - cc[2];
      if (nx * gx + ny * gy + nz * gz < 0) { nx = -nx; ny = -ny; nz = -nz; }
    } else if (ny < 0) { nx = -nx; ny = -ny; nz = -nz; }
    const d = this.d;
    for (const p of [a, b, c]) d.push(p[0], p[1], p[2], nx, ny, nz, col[0], col[1], col[2]);
  }
  quad(a, b, c, d, col, center) { this.tri(a, b, c, col, center); this.tri(a, c, d, col, center); }
  box(x, y, z, sx, sy, sz, col, faceCols) {
    const hx = sx / 2, hy = sy / 2, hz = sz / 2, C = [x, y, z];
    const P = (i, j, k) => [x + i * hx, y + j * hy, z + k * hz];
    const faces = [
      [P(1, -1, -1), P(1, 1, -1), P(1, 1, 1), P(1, -1, 1)],
      [P(-1, -1, -1), P(-1, 1, -1), P(-1, 1, 1), P(-1, -1, 1)],
      [P(-1, 1, -1), P(1, 1, -1), P(1, 1, 1), P(-1, 1, 1)],
      [P(-1, -1, -1), P(1, -1, -1), P(1, -1, 1), P(-1, -1, 1)],
      [P(-1, -1, 1), P(1, -1, 1), P(1, 1, 1), P(-1, 1, 1)],
      [P(-1, -1, -1), P(1, -1, -1), P(1, 1, -1), P(-1, 1, -1)],
    ];
    faces.forEach((f, i) => this.quad(f[0], f[1], f[2], f[3], faceCols ? faceCols[i] : col, C));
  }
  // axis: 'y' (upright), 'x' (wheels) or 'z' (pipes)
  cyl(x, y, z, r, h, seg, col, axis = 'y', r2 = r) {
    const P = (a, t, rr) => {
      const u = Math.cos(a) * rr, v = Math.sin(a) * rr, w = (t - 0.5) * h;
      if (axis === 'x') return [x + w, y + u, z + v];
      if (axis === 'z') return [x + u, y + v, z + w];
      return [x + u, y + w, z + v];
    };
    const C = [x, y, z];
    for (let i = 0; i < seg; i++) {
      const a0 = (i / seg) * Math.PI * 2, a1 = ((i + 1) / seg) * Math.PI * 2;
      this.quad(P(a0, 0, r), P(a1, 0, r), P(a1, 1, r2), P(a0, 1, r2), col, C);
      this.tri(P(a0, 0, r), P(a1, 0, r), P(0, 0, 0), col, C);
      if (r2 > 0) this.tri(P(a0, 1, r2), P(a1, 1, r2), P(0, 1, 0), col, C);
    }
  }
  cone(x, y, z, r, h, seg, col) { this.cyl(x, y + h / 2, z, r, h, seg, col, 'y', 0.001); }
  sphere(x, y, z, r, col, seg = 8, sy = 1) {
    const rings = Math.max(3, seg >> 1), C = [x, y, z];
    const P = (i, j) => {
      const th = (j / rings) * Math.PI, ph = (i / seg) * Math.PI * 2;
      return [x + Math.sin(th) * Math.cos(ph) * r, y + Math.cos(th) * r * sy, z + Math.sin(th) * Math.sin(ph) * r];
    };
    for (let j = 0; j < rings; j++) for (let i = 0; i < seg; i++) {
      this.quad(P(i, j), P(i + 1, j), P(i + 1, j + 1), P(i, j + 1), col, C);
    }
  }
  disc(x, y, z, r, seg, col) {
    for (let i = 0; i < seg; i++) {
      const a0 = (i / seg) * Math.PI * 2, a1 = ((i + 1) / seg) * Math.PI * 2;
      this.tri([x, y, z], [x + Math.cos(a0) * r, y, z + Math.sin(a0) * r], [x + Math.cos(a1) * r, y, z + Math.sin(a1) * r], col);
    }
  }
}

// ------------------------------------------------------------------ Renderer
export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    const opts = { antialias: true, alpha: false, powerPreference: 'high-performance' };
    const gl = (this.gl = canvas.getContext('webgl', opts) || canvas.getContext('experimental-webgl', opts));
    if (!gl) throw new Error('WebGL is not available on this device.');
    const sh = (type, src) => {
      const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
      return s;
    };
    const p = (this.prog = gl.createProgram());
    gl.attachShader(p, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    this.a = { pos: gl.getAttribLocation(p, 'aPos'), nor: gl.getAttribLocation(p, 'aNor'), col: gl.getAttribLocation(p, 'aCol') };
    this.u = {};
    for (const n of ['uVP', 'uM', 'uLight', 'uFog', 'uCam', 'uTint', 'uFogNear', 'uFogFar', 'uAlpha', 'uUnlit']) this.u[n] = gl.getUniformLocation(p, n);
    gl.enable(gl.DEPTH_TEST);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    this.ident = m4.create();
    this.bound = null;
  }
  mesh(builder) {
    const gl = this.gl, data = new Float32Array(builder.d), buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    return { buf, count: data.length / 9 };
  }
  free(mesh) { if (mesh) this.gl.deleteBuffer(mesh.buf); }
  resize(w, h) {
    if (this.canvas.width !== w || this.canvas.height !== h) { this.canvas.width = w; this.canvas.height = h; }
    this.gl.viewport(0, 0, w, h);
  }
  begin(vp, cam, env) {
    const gl = this.gl, u = this.u;
    gl.clearColor(env.fog[0], env.fog[1], env.fog[2], 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(this.prog);
    gl.uniformMatrix4fv(u.uVP, false, vp);
    gl.uniform3fv(u.uCam, cam);
    gl.uniform3fv(u.uLight, env.light);
    gl.uniform3fv(u.uFog, env.fog);
    gl.uniform1f(u.uFogNear, env.fogNear);
    gl.uniform1f(u.uFogFar, env.fogFar);
    this.bound = null;
  }
  draw(mesh, model, tint = [1, 1, 1], alpha = 1, unlit = 0) {
    const gl = this.gl, u = this.u, a = this.a;
    if (this.bound !== mesh.buf) {
      gl.bindBuffer(gl.ARRAY_BUFFER, mesh.buf);
      gl.enableVertexAttribArray(a.pos); gl.vertexAttribPointer(a.pos, 3, gl.FLOAT, false, 36, 0);
      gl.enableVertexAttribArray(a.nor); gl.vertexAttribPointer(a.nor, 3, gl.FLOAT, false, 36, 12);
      gl.enableVertexAttribArray(a.col); gl.vertexAttribPointer(a.col, 3, gl.FLOAT, false, 36, 24);
      this.bound = mesh.buf;
    }
    gl.uniformMatrix4fv(u.uM, false, model || this.ident);
    gl.uniform3fv(u.uTint, tint);
    gl.uniform1f(u.uAlpha, alpha);
    gl.uniform1f(u.uUnlit, unlit);
    if (alpha < 1) { gl.enable(gl.BLEND); gl.depthMask(false); }
    gl.drawArrays(gl.TRIANGLES, 0, mesh.count);
    if (alpha < 1) { gl.disable(gl.BLEND); gl.depthMask(true); }
  }
}
