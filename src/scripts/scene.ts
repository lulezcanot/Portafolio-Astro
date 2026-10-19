import {
  AmbientLight,
  BoxGeometry,
  CanvasTexture,
  Color,
  DirectionalLight,
  DoubleSide,
  EdgesGeometry,
  Group,
  HemisphereLight,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  OrthographicCamera,
  PlaneGeometry,
  RepeatWrapping,
  Scene,
  SRGBColorSpace,
  WebGLRenderer,
} from 'three';

/* ---------- Geometría del cartón (unidades relativas; el grupo raíz se escala en px) ---------- */
const W = 1;
const D = 0.8;
const H = 0.58;
const T = 0.012;
const FLAP = D / 2 - 0.004;

const INK = '#111111';
const BOARD = '#ebe9df';
const LABEL = '#fbfaf5';
const FILM = '#2f5bff';

type Pose = {
  fold: number;
  close: number;
  ry: number;
  rx: number;
  size: number;
  slip: number;
  seal: number;
  hidden: boolean;
};

let FONT_DISPLAY = '"Big Shoulders Display", "Arial Narrow", sans-serif';
let FONT_LABEL = '"B612 Mono", monospace';

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const damp = (cur: number, target: number, lambda: number, dt: number) =>
  cur + (target - cur) * (1 - Math.exp(-lambda * dt));
const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

function readPose(el: HTMLElement): Pose {
  const n = (k: string, d: number) => {
    const v = el.dataset[k];
    return v === undefined || v === '' ? d : parseFloat(v);
  };
  return {
    fold: n('fold', 1),
    close: n('close', 1),
    ry: (n('ry', -28) * Math.PI) / 180,
    rx: (n('rx', 0) * Math.PI) / 180,
    size: n('size', 0.9),
    slip: n('slip', 0),
    seal: n('seal', 0),
    hidden: el.dataset.hidden === 'true',
  };
}

/* ---------- Texturas dibujadas con canvas 2D ---------- */
function barcode(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, seed: string) {
  let hash = 2166136261;
  for (const c of seed) hash = Math.imul(hash ^ c.charCodeAt(0), 16777619);
  let cx = x;
  ctx.fillStyle = INK;
  let i = 0;
  while (cx < x + w) {
    hash = Math.imul(hash ^ (hash >>> 13), 1274126177);
    const bar = 2 + (Math.abs(hash) % 4);
    const gap = 2 + (Math.abs(hash >> 5) % 3);
    if (i % 2 === 0) ctx.fillRect(cx, y, Math.min(bar, x + w - cx), h);
    cx += i % 2 === 0 ? bar : gap;
    i++;
  }
}

function drawLabel(ctx: CanvasRenderingContext2D, W_: number, H_: number, progress: number) {
  ctx.clearRect(0, 0, W_, H_);
  const steps = 22;
  const visible = (Math.floor(progress * steps) / steps) * H_;
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, W_, visible);
  ctx.clip();

  ctx.fillStyle = LABEL;
  ctx.fillRect(0, 0, W_, H_);
  ctx.fillStyle = INK;
  ctx.fillRect(0, 0, W_, 74);
  ctx.fillStyle = LABEL;
  ctx.font = `700 34px ${FONT_LABEL}`;
  ctx.textBaseline = 'middle';
  ctx.fillText('DESPACHO  ·  TRUJILLO PE', 36, 38);

  ctx.fillStyle = INK;
  ctx.textBaseline = 'alphabetic';
  ctx.font = `400 26px ${FONT_LABEL}`;
  ctx.fillText('DESTINATARIO', 36, 128);
  let size = 140;
  ctx.font = `900 ${size}px ${FONT_DISPLAY}`;
  while (ctx.measureText('LUIS LEZCANO').width > W_ - 72 && size > 60) {
    size -= 4;
    ctx.font = `900 ${size}px ${FONT_DISPLAY}`;
  }
  ctx.fillText('LUIS LEZCANO', 32, 128 + size * 0.86);
  ctx.fillText('TIRADO', 32, 128 + size * 1.72);

  ctx.font = `400 26px ${FONT_LABEL}`;
  ctx.fillText('CONTENIDO', 36, 470);
  ctx.font = `700 36px ${FONT_LABEL}`;
  ctx.fillText('FULL STACK JR · VTEX IO + REACT', 36, 512);

  ctx.fillRect(36, 536, W_ - 72, 4);
  barcode(ctx, 36, 566, 560, 118, 'LLT-2025-0001');
  ctx.font = `400 24px ${FONT_LABEL}`;
  ctx.fillText('LLT-2025-0001', 36, 716);
  ctx.font = `700 30px ${FONT_LABEL}`;
  ctx.textAlign = 'right';
  ctx.fillText('ABIERTO A', W_ - 36, 640);
  ctx.fillText('OPORTUNIDADES', W_ - 36, 680);
  ctx.textAlign = 'left';
  ctx.restore();

  // Cabezal térmico: línea que avanza
  if (progress > 0 && progress < 1) {
    ctx.fillStyle = INK;
    ctx.fillRect(0, Math.min(visible, H_ - 3), W_, 3);
  }
}

function makeLabelTexture() {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 768;
  const ctx = c.getContext('2d')!;
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  tex.anisotropy = 4;
  return { c, ctx, tex };
}

function makeSlipTexture() {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 700;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = LABEL;
  ctx.fillRect(0, 0, 512, 700);
  ctx.fillStyle = INK;
  ctx.fillRect(0, 0, 512, 64);
  ctx.fillStyle = LABEL;
  ctx.font = `700 30px ${FONT_LABEL}`;
  ctx.textBaseline = 'middle';
  ctx.fillText('LISTA DE EMPAQUE', 28, 34);
  ctx.fillStyle = INK;
  ctx.textBaseline = 'alphabetic';
  const rows = ['1  Front End', '1  React', '1  VTEX IO', '1  Full Stack Jr', '1  Scrum', '1  Git'];
  ctx.font = `700 36px ${FONT_LABEL}`;
  rows.forEach((r, i) => {
    ctx.fillText(r, 28, 140 + i * 66);
    ctx.fillRect(28, 156 + i * 66, 456, 2);
  });
  barcode(ctx, 28, 560, 300, 90, 'LISTA-0001');
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  return tex;
}

function makeStampTexture() {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 256;
  const ctx = c.getContext('2d')!;
  ctx.strokeStyle = FILM;
  ctx.fillStyle = FILM;
  ctx.lineWidth = 10;
  ctx.strokeRect(14, 14, 484, 228);
  ctx.lineWidth = 3;
  ctx.strokeRect(30, 30, 452, 196);
  ctx.font = `900 150px ${FONT_DISPLAY}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('ENVIADO', 256, 136);
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  return tex;
}

function makeBoardTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 256, 256);
  // Acanaladura del cartón: líneas finas paralelas y algo de fibra
  for (let x = 0; x < 256; x += 4) {
    ctx.fillStyle = x % 8 === 0 ? 'rgba(90,70,40,0.07)' : 'rgba(255,255,255,0.35)';
    ctx.fillRect(x, 0, 2, 256);
  }
  for (let i = 0; i < 700; i++) {
    ctx.fillStyle = `rgba(80,60,30,${Math.random() * 0.08})`;
    ctx.fillRect(Math.random() * 256, Math.random() * 256, 1 + Math.random() * 2, 1);
  }
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  tex.wrapS = tex.wrapT = RepeatWrapping;
  tex.repeat.set(3, 3);
  tex.anisotropy = 4;
  return tex;
}

function makeHandlingTexture() {
  const c = document.createElement('canvas');
  c.width = 640;
  c.height = 480;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = INK;
  ctx.strokeStyle = INK;
  // Dos flechas "este lado arriba"
  const arrow = (x: number) => {
    ctx.beginPath();
    ctx.moveTo(x, 40);
    ctx.lineTo(x + 70, 150);
    ctx.lineTo(x + 38, 150);
    ctx.lineTo(x + 38, 250);
    ctx.lineTo(x - 38, 250);
    ctx.lineTo(x - 38, 150);
    ctx.lineTo(x - 70, 150);
    ctx.closePath();
    ctx.fill();
  };
  arrow(180);
  arrow(460);
  ctx.textAlign = 'center';
  ctx.font = `900 78px ${FONT_DISPLAY}`;
  ctx.fillText('ESTE LADO ARRIBA', 320, 340);
  ctx.lineWidth = 8;
  ctx.strokeRect(24, 24, 592, 432);
  ctx.font = `700 27px ${FONT_LABEL}`;
  ctx.fillText('FRÁGIL · MANEJAR CON CUIDADO', 320, 420);
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function makeTapeTexture() {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 80;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = FILM;
  ctx.fillRect(0, 0, 1024, 80);
  ctx.fillStyle = 'rgba(255,255,255,0.88)';
  ctx.font = `900 54px ${FONT_DISPLAY}`;
  ctx.textBaseline = 'middle';
  const unit = 'DESPACHO  /  LLT  /  ';
  let x = 14;
  while (x < 1024) {
    ctx.fillText(unit, x, 42);
    x += ctx.measureText(unit).width;
  }
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  return tex;
}

function makeShadowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(128, 128, 10, 128, 128, 126);
  g.addColorStop(0, 'rgba(17,17,17,0.55)');
  g.addColorStop(0.55, 'rgba(17,17,17,0.22)');
  g.addColorStop(1, 'rgba(17,17,17,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  return new CanvasTexture(c);
}

/* ---------- Caja ---------- */
function buildBox() {
  const boardMat = new MeshStandardMaterial({ color: new Color(BOARD), map: makeBoardTexture(), roughness: 0.92, metalness: 0, side: DoubleSide });
  const innerMat = new MeshStandardMaterial({ color: new Color('#cfccc0'), roughness: 1, metalness: 0, side: DoubleSide });
  const edgeMat = new LineBasicMaterial({ color: new Color(INK), transparent: true, opacity: 0.55 });

  const slab = (lx: number, lz: number, mat = boardMat) => {
    const geo = new BoxGeometry(lx, T, lz);
    const m = new Mesh(geo, mat);
    m.position.z = lz / 2;
    const e = new LineSegments(new EdgesGeometry(geo), edgeMat);
    m.add(e);
    return m;
  };

  const root = new Group();
  const body = new Group();
  root.add(body);

  const base = new Mesh(new BoxGeometry(W, T, D), innerMat);
  base.add(new LineSegments(new EdgesGeometry(base.geometry), edgeMat));
  body.add(base);

  type Side = { hinge: Group; fold: Group; flapHinge: Group; major: boolean };
  const sides: Side[] = [];

  const makeSide = (len: number, posX: number, posZ: number, ry: number, major: boolean) => {
    const hinge = new Group();
    hinge.position.set(posX, 0, posZ);
    hinge.rotation.y = ry;
    const fold = new Group();
    hinge.add(fold);
    fold.add(slab(len, H));
    const flapHinge = new Group();
    flapHinge.position.set(0, major ? 0.02 : 0, H);
    fold.add(flapHinge);
    const flapMesh = slab(len, FLAP);
    flapHinge.add(flapMesh);
    body.add(hinge);
    sides.push({ hinge, fold, flapHinge, major });
    return { hinge, fold, flapHinge };
  };

  const front = makeSide(W, 0, D / 2, 0, true);
  const back = makeSide(W, 0, -D / 2, Math.PI, true);
  const right = makeSide(D, W / 2, 0, Math.PI / 2, false);
  const left = makeSide(D, -W / 2, 0, -Math.PI / 2, false);

  // Etiqueta térmica pegada en la cara exterior del panel frontal
  const label = makeLabelTexture();
  const labelW = W * 0.72;
  const labelH = labelW * (768 / 1024);
  const decal = new Mesh(
    new PlaneGeometry(labelW, labelH),
    new MeshBasicMaterial({ map: label.tex, side: DoubleSide, transparent: true }),
  );
  decal.rotation.x = Math.PI / 2;
  decal.position.set(0.06, -T * 0.7, H * 0.5);
  front.fold.add(decal);

  // Marcas de manejo en la cara exterior del panel derecho
  const handling = new Mesh(
    new PlaneGeometry(D * 0.62, D * 0.62 * (480 / 640)),
    new MeshBasicMaterial({ map: makeHandlingTexture(), side: DoubleSide, transparent: true }),
  );
  handling.rotation.x = Math.PI / 2;
  handling.position.set(0, -T * 0.7, H * 0.5);
  right.fold.add(handling);

  // Cinta de embalaje y sello sobre las solapas
  const tape = new Mesh(new PlaneGeometry(W * 1.02, 0.075), new MeshBasicMaterial({ map: makeTapeTexture() }));
  tape.rotation.x = -Math.PI / 2;
  tape.position.set(0, H + 0.036, 0);
  tape.scale.x = 0.0001;
  body.add(tape);

  const stamp = new Mesh(
    new PlaneGeometry(0.46, 0.23),
    new MeshBasicMaterial({ map: makeStampTexture(), transparent: true, side: DoubleSide }),
  );
  stamp.rotation.x = -Math.PI / 2;
  stamp.rotation.z = 0.18;
  stamp.position.set(0.14, H + 0.04, 0.2);
  stamp.visible = false;
  body.add(stamp);

  // Lista de empaque que sale de la caja abierta
  const slip = new Mesh(
    new PlaneGeometry(0.46, 0.46 * (700 / 512)),
    new MeshBasicMaterial({ map: makeSlipTexture(), side: DoubleSide }),
  );
  slip.visible = false;
  body.add(slip);

  // Sombra de contacto
  const shadow = new Mesh(
    new PlaneGeometry(W * 1.7, D * 1.9),
    new MeshBasicMaterial({ map: makeShadowTexture(), transparent: true, depthWrite: false }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -T * 2;
  root.add(shadow);

  return { root, body, sides, front, back, left, right, tape, stamp, slip, shadow, label };
}

/* ---------- Escena ---------- */
export async function initScene(): Promise<boolean> {
  const host = document.getElementById('scene');
  const canvas = document.getElementById('scene-canvas') as HTMLCanvasElement | null;
  if (!host || !canvas) return false;

  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch {
    document.documentElement.classList.add('no-webgl');
    return false;
  }

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
  renderer.setClearColor(0x000000, 0);

  const rootStyle = getComputedStyle(document.documentElement);
  const bodyStyle = getComputedStyle(document.body);
  const fromVar = (name: string, fallback: string) => {
    const v = (bodyStyle.getPropertyValue(name) || rootStyle.getPropertyValue(name)).trim();
    return v || fallback;
  };
  FONT_DISPLAY = fromVar('--font-display', FONT_DISPLAY);
  FONT_LABEL = fromVar('--font-label', FONT_LABEL);
  try {
    await Promise.all([document.fonts.load(`900 120px ${FONT_DISPLAY}`), document.fonts.load(`700 36px ${FONT_LABEL}`), document.fonts.load(`400 26px ${FONT_LABEL}`)]);
  } catch {
    /* las fuentes de respaldo bastan */
  }

  const scene = new Scene();
  const camera = new OrthographicCamera(-1, 1, 1, -1, -4000, 4000);
  camera.position.set(0, 420, 1000);
  camera.lookAt(0, 0, 0);

  scene.add(new HemisphereLight(0xffffff, 0xe6d6cb, 1.6));
  scene.add(new AmbientLight(0xffffff, 0.35));
  const sun = new DirectionalLight(0xffffff, 2.6);
  sun.position.set(-420, 760, 620);
  scene.add(sun);

  const box = buildBox();
  scene.add(box.root);

  let vw = 0;
  let vh = 0;
  const resize = () => {
    vw = window.innerWidth;
    vh = window.innerHeight;
    renderer.setSize(vw, vh, false);
    camera.left = -vw / 2;
    camera.right = vw / 2;
    camera.top = vh / 2;
    camera.bottom = -vh / 2;
    camera.updateProjectionMatrix();
  };
  resize();
  window.addEventListener('resize', resize);

  const slots = Array.from(document.querySelectorAll<HTMLElement>('[data-box]'));

  // Estado animado
  const s = { x: vw * 0.7, y: vh * 0.5, size: 0, fold: 0, close: -0.3, ry: -0.5, rx: 0, slip: 0, seal: 0, tape: 0, stamp: 0 };
  let started = false;
  let startTime = 0;
  let labelProgress = reduced ? 1 : 0;
  let labelStart = -1;
  let sealed = false;
  const pointer = { x: 0, y: 0, sx: 0, sy: 0 };

  window.addEventListener(
    'pointermove',
    (e) => {
      pointer.x = (e.clientX / vw) * 2 - 1;
      pointer.y = (e.clientY / vh) * 2 - 1;
    },
    { passive: true },
  );
  window.addEventListener('despacho:seal', () => (sealed = true));
  window.addEventListener('despacho:unseal', () => (sealed = false));

  const pick = () => {
    let best: HTMLElement | null = null;
    let bestD = Infinity;
    let bestRect: DOMRect | null = null;
    for (const el of slots) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      const d = Math.abs(r.top + r.height / 2 - vh / 2);
      if (d < bestD && r.bottom > 0 && r.top < vh) {
        best = el;
        bestD = d;
        bestRect = r;
      }
    }
    return best && bestRect ? { el: best, rect: bestRect } : null;
  };

  let last = performance.now();
  let drawn = false;
  const lambdaPos = reduced ? 1000 : 5.5;
  const lambdaFold = reduced ? 1000 : 3.4;

  const frame = (now: number) => {
    requestAnimationFrame(frame);
    if (document.hidden) {
      last = now;
      return;
    }
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;

    const target = pick();
    let pose: Pose = { fold: 1, close: 1, ry: -0.5, rx: 0, size: 0.9, slip: 0, seal: 0, hidden: true };
    let tx = s.x;
    let ty = s.y;
    let tsize = 0;
    if (target) {
      pose = readPose(target.el);
      const px = Math.min(target.rect.width / 1.45, target.rect.height / 1.05);
      tsize = pose.hidden ? 0 : px * pose.size;
      tsize = Math.min(tsize, target.rect.width / 1.42, (vw - 16) / 1.45);
      const half = tsize * 0.74;
      tx = clamp(target.rect.left + target.rect.width / 2, half, vw - half);
      ty = clamp(target.rect.top + target.rect.height / 2, half, vh - half);
    }

    if (!started) {
      started = true;
      startTime = now;
      s.x = tx;
      s.y = ty;
      if (reduced) {
        s.size = tsize;
        s.fold = pose.fold;
        s.close = pose.close;
        s.ry = pose.ry;
      }
      host.classList.add('is-ready');
      document.documentElement.dataset.scene = 'ready';
    }

    // Introducción: la caja troquelada se pliega sola
    const t = (now - startTime) / 1000;
    const intro = reduced ? 1 : easeOutExpo(clamp((t - 0.25) / 1.9));
    let foldTarget = Math.min(pose.fold, intro);
    let closeTarget = pose.close;
    if (sealed) {
      foldTarget = 1;
      closeTarget = 1;
    }

    s.x = damp(s.x, tx, lambdaPos, dt);
    s.y = damp(s.y, ty, lambdaPos, dt);
    s.size = damp(s.size, tsize, lambdaPos * 0.8, dt);
    s.fold = damp(s.fold, foldTarget, lambdaFold, dt);
    s.close = damp(s.close, closeTarget, lambdaFold, dt);
    s.ry = damp(s.ry, pose.ry, lambdaFold, dt);
    s.rx = damp(s.rx, pose.rx, lambdaFold, dt);
    s.slip = damp(s.slip, sealed ? 0 : pose.slip, lambdaFold, dt);
    const sealTarget = sealed ? 1 : pose.seal;
    s.tape = damp(s.tape, sealTarget, reduced ? 1000 : 3.2, dt);
    s.stamp = damp(s.stamp, sealed ? 1 : 0, reduced ? 1000 : 7, dt);
    pointer.sx = damp(pointer.sx, reduced ? 0 : pointer.x, 4, dt);
    pointer.sy = damp(pointer.sy, reduced ? 0 : pointer.y, 4, dt);

    // Etiqueta: se imprime con paso de impresora al terminar de plegarse
    if (labelProgress < 1 && s.fold > 0.92) {
      if (labelStart < 0) labelStart = now;
      labelProgress = clamp((now - labelStart) / 1500);
      drawLabel(box.label.ctx, 1024, 768, labelProgress);
      box.label.tex.needsUpdate = true;
    } else if (!drawn && reduced) {
      drawLabel(box.label.ctx, 1024, 768, 1);
      box.label.tex.needsUpdate = true;
    }
    drawn = true;

    // Aplicar pose
    const root = box.root;
    root.scale.setScalar(Math.max(s.size, 0.0001));
    root.visible = s.size > 0.5;
    const bob = reduced ? 0 : Math.sin(t * 0.9) * 0.012 * s.size;
    root.position.set(s.x - vw / 2, -(s.y - vh / 2) + bob, 0);
    root.rotation.y = s.ry + pointer.sx * 0.22 + (reduced ? 0 : Math.sin(t * 0.5) * 0.025);
    root.rotation.x = s.rx + pointer.sy * 0.08;
    box.body.position.y = 0;

    const f = s.fold;
    const lift = 0; // el cartón se apoya sobre la base
    box.body.position.y = lift;
    const panelP = (delay: number) => smooth(delay, delay + 0.52, f);
    const flapP = (delay: number) => smooth(0.5 + delay, 0.5 + delay + 0.4, f);

    box.front.fold.rotation.x = -panelP(0.0) * (Math.PI / 2);
    box.back.fold.rotation.x = -panelP(0.06) * (Math.PI / 2);
    box.right.fold.rotation.x = -panelP(0.12) * (Math.PI / 2);
    box.left.fold.rotation.x = -panelP(0.18) * (Math.PI / 2);

    // c ∈ [-0.45 (abierto, solapas hacia afuera), 1 (cerrado)]
    const c = s.close;
    box.sides.forEach((side, i) => {
      const p = side.major ? flapP(0.1 + (i % 2) * 0.05) : flapP(0 + (i % 2) * 0.05);
      side.flapHinge.rotation.x = -p * c * (Math.PI / 2);
    });

    // Lista de empaque
    const slipOn = s.slip > 0.02;
    box.slip.visible = slipOn;
    if (slipOn) {
      box.slip.position.set(0.02, 0.1 + s.slip * 0.62, 0.05);
      box.slip.rotation.set(-0.12, -0.2 * s.slip, 0.06 * s.slip);
      box.slip.scale.setScalar(0.65 + 0.35 * s.slip);
    }

    // Cinta y sello
    const closedAmt = smooth(0.9, 1, s.fold) * smooth(0.7, 1, s.close);
    box.tape.scale.x = Math.max(0.0001, easeOutExpo(s.tape) * closedAmt);
    box.stamp.visible = s.stamp > 0.03;
    const sc = 1.6 - 0.6 * clamp(s.stamp);
    box.stamp.scale.set(sc, sc, 1);
    (box.stamp.material as MeshBasicMaterial).opacity = clamp(s.stamp * 1.4);

    // Sombra
    const sm = box.shadow.material as MeshBasicMaterial;
    sm.opacity = 0.25 + 0.55 * smooth(0, 0.8, f);
    box.shadow.scale.set(0.5 + 0.5 * smooth(0, 0.7, f), 0.5 + 0.5 * smooth(0, 0.7, f), 1);

    renderer.render(scene, camera);
  };
  requestAnimationFrame(frame);
  return true;
}
