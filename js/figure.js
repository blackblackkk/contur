/**
 * Линия-фигура — «живой» контур, который проходит через страницу:
 * обводит слово в первом экране, превращается в знаки услуг
 * и становится рамкой первого проекта.
 *
 * Фигура — это S ломаных по P точек. Любое состояние приводится
 * к одному формату, поэтому между ними можно плавно переходить.
 */
import { bracketPoints, paraPoints, RUN } from './brand.js';
import { clamp, ease } from './utils.js';

export const S = 8;
export const P = 40;
const N = S * P;

export function makeShape() {
  return {
    pts: new Float32Array(N * 2),
    w: new Float32Array(S).fill(1),
    a: new Float32Array(S).fill(1),
    z: new Float32Array(S),
  };
}

/* ------------------------------------------------------------------ */
/* Геометрические помощники                                            */
/* ------------------------------------------------------------------ */

function resample(src, count, out, offset) {
  const n = src.length;
  if (n === 1) {
    for (let i = 0; i < count; i++) {
      out[offset + i * 2] = src[0][0];
      out[offset + i * 2 + 1] = src[0][1];
    }
    return;
  }
  const len = new Float32Array(n);
  for (let i = 1; i < n; i++) len[i] = len[i - 1] + Math.hypot(src[i][0] - src[i - 1][0], src[i][1] - src[i - 1][1]);
  const total = len[n - 1] || 1;
  let j = 1;
  for (let i = 0; i < count; i++) {
    const d = (total * i) / (count - 1);
    while (j < n - 1 && len[j] < d) j++;
    const seg = len[j] - len[j - 1] || 1;
    const t = clamp((d - len[j - 1]) / seg);
    out[offset + i * 2] = src[j - 1][0] + (src[j][0] - src[j - 1][0]) * t;
    out[offset + i * 2 + 1] = src[j - 1][1] + (src[j][1] - src[j - 1][1]) * t;
  }
}

const line = (x1, y1, x2, y2) => [
  [x1, y1],
  [x2, y2],
];

function circle(cx, cy, r, n = 28) {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const a = -Math.PI / 2 + (i / n) * Math.PI * 2;
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return pts;
}

function roundRect(x0, y0, x1, y1, r) {
  const pts = [];
  const corner = (cx, cy, a0) => {
    for (let i = 0; i <= 6; i++) {
      const a = a0 + (i / 6) * (Math.PI / 2);
      pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
    }
  };
  corner(x0 + r, y0 + r, Math.PI);
  corner(x1 - r, y0 + r, -Math.PI / 2);
  corner(x1 - r, y1 - r, 0);
  corner(x0 + r, y1 - r, Math.PI / 2);
  pts.push(pts[0]);
  return pts;
}

/** Ломаная со скруглёнными изломами — для «маршрутов». */
function route(points, r = 0.07) {
  const out = [points[0]];
  for (let i = 1; i < points.length - 1; i++) {
    const a = points[i - 1];
    const v = points[i];
    const b = points[i + 1];
    const d1 = unit(a[0] - v[0], a[1] - v[1]);
    const d2 = unit(b[0] - v[0], b[1] - v[1]);
    const p1 = [v[0] + d1[0] * r, v[1] + d1[1] * r];
    const p2 = [v[0] + d2[0] * r, v[1] + d2[1] * r];
    for (let k = 0; k <= 6; k++) {
      const t = k / 6;
      const u = 1 - t;
      out.push([u * u * p1[0] + 2 * u * t * v[0] + t * t * p2[0], u * u * p1[1] + 2 * u * t * v[1] + t * t * p2[1]]);
    }
  }
  out.push(points[points.length - 1]);
  return out;
}

function unit(x, y) {
  const l = Math.hypot(x, y) || 1;
  return [x / l, y / l];
}

/* ------------------------------------------------------------------ */
/* Знаки услуг в условных координатах (−1…1, ось Y вниз)               */
/* w — толщина, a — прозрачность, z — глубина слоя для параллакса      */
/* ------------------------------------------------------------------ */

const BOLD = 1.7;
const THIN = 0.75;

const SERVICE_FIGURES = [
  // 01 · Брендинг — знак и его построение
  () => {
    const x = -0.56;
    const y = -0.5;
    const w = 1.22;
    const h = 1;
    const leftAt = (yy) => x - RUN * (yy - y);
    const rightAt = (yy) => x + w - RUN * (yy - y);
    return [
      { pts: bracketPoints({ x, y, w, h }), w: BOLD, z: 0.6 },
      { pts: paraPoints({ cx: 0.13, cy: 0.02, w: 0.6, h: 0.42 }), w: 1, a: 0.9, z: 1 },
      { pts: line(-1.55, y, 1.55, y), w: THIN, a: 0.32, z: -0.6 },
      { pts: line(-1.55, y + h, 1.55, y + h), w: THIN, a: 0.32, z: -0.6 },
      { pts: line(leftAt(-0.98), -0.98, leftAt(0.98), 0.98), w: THIN, a: 0.32, z: -1 },
      { pts: line(rightAt(-0.98), -0.98, rightAt(0.98), 0.98), w: THIN, a: 0.32, z: -1 },
      { pts: circle(x + w, y, 0.05), w: 1, z: 0.2 },
      { pts: circle(x - RUN * h, y + h, 0.05), w: 1, z: 0.2 },
    ];
  },
  // 02 · Концепции — идея расходится волнами
  () => {
    const waves = [0.34, 0.66, 0.98, 1.3, 1.62].map((h, i) => ({
      pts: bracketPoints({ x: -h * 0.52 + 0.06, y: -h / 2, w: h * 1.24, h }),
      w: i === 0 ? BOLD : 1,
      a: [1, 0.85, 0.6, 0.38, 0.2][i],
      z: 1 - i * 0.5,
    }));
    const dot = { pts: circle(0.08, 0, 0.055), w: BOLD, z: 1.2 };
    return [...waves, dot, dot, dot];
  },
  // 03 · Дизайн — композиция из слоёв
  () => [
    { pts: paraPoints({ cx: -0.3, cy: 0.16, w: 1.04, h: 0.86 }), w: THIN, a: 0.45, z: -1 },
    { pts: paraPoints({ cx: 0, cy: 0.02, w: 1.04, h: 0.86 }), w: 1, a: 0.75, z: 0 },
    { pts: paraPoints({ cx: 0.3, cy: -0.12, w: 1.04, h: 0.86 }), w: BOLD, z: 1 },
    { pts: circle(0.5, -0.24, 0.24), w: 1, z: 1.4 },
    { pts: line(-0.04, 0.08, 0.5, 0.08), w: 1, a: 0.9, z: 1.4 },
    { pts: line(-0.11, 0.19, 0.3, 0.19), w: 1, a: 0.6, z: 1.4 },
    { pts: line(-0.04, 0.08, 0.5, 0.08), w: 1, a: 0.9, z: 1.4 },
    { pts: line(-0.11, 0.19, 0.3, 0.19), w: 1, a: 0.6, z: 1.4 },
  ],
  // 04 · Сайты — экран
  () => [
    { pts: roundRect(-1.02, -0.66, 1.02, 0.66, 0.08), w: BOLD, z: 0 },
    { pts: line(-1.02, -0.44, 1.02, -0.44), w: 1, a: 0.7, z: 0 },
    { pts: paraPoints({ cx: -0.36, cy: 0.1, w: 0.62, h: 0.62 }), w: 1, z: 0.9 },
    { pts: line(0.24, -0.14, 0.8, -0.14), w: 1, a: 0.9, z: 0.5 },
    { pts: line(0.24, 0.01, 0.7, 0.01), w: 1, a: 0.6, z: 0.5 },
    { pts: line(0.24, 0.16, 0.54, 0.16), w: 1, a: 0.4, z: 0.5 },
    {
      pts: [
        [0.56, 0.3],
        [0.56, 0.6],
        [0.635, 0.525],
        [0.735, 0.525],
        [0.56, 0.3],
      ],
      w: BOLD,
      z: 1.6,
    },
    { pts: circle(-0.88, -0.55, 0.035), w: 1, z: 0 },
  ],
  // 05 · Контекст и таргет — прицел
  () => {
    const b = bracketPoints({ x: -0.46, y: -0.52, w: 0.86, h: 1.04, bottom: 0.72 });
    return [
      { pts: b, w: BOLD, z: 0.4 },
      { pts: b.map(([px, py]) => [-px, -py]), w: BOLD, z: 0.4 },
      { pts: circle(0, 0, 0.21), w: 1, a: 0.8, z: 1 },
      { pts: circle(0, 0, 0.05), w: BOLD, z: 1.6 },
      { pts: line(-1.4, 0, -0.36, 0), w: THIN, a: 0.5, z: -0.8 },
      { pts: line(0.36, 0, 1.4, 0), w: THIN, a: 0.5, z: -0.8 },
      { pts: line(RUN * 0.36, -0.36, RUN * 0.98, -0.98), w: THIN, a: 0.5, z: -0.8 },
      { pts: line(-RUN * 0.36, 0.36, -RUN * 0.98, 0.98), w: THIN, a: 0.5, z: -0.8 },
    ];
  },
  // 06 · Продвижение — охват растёт
  () => {
    const base = 0.62;
    const bars = [0.26, 0.5, 0.76, 1.02, 1.28].map((h, i) => {
      const x0 = -1.18 + i * 0.4;
      return {
        pts: paraPoints({ cx: x0 + 0.11 + (RUN * h) / 2, cy: base - h / 2, w: 0.22, h, round: 0.5 }),
        w: i === 4 ? BOLD : 1,
        a: [0.35, 0.5, 0.65, 0.82, 1][i],
        z: -1 + i * 0.5,
      };
    });
    return [
      ...bars,
      { pts: line(-1.4, base, 1.4, base), w: THIN, a: 0.45, z: -1 },
      { pts: circle(-1.18 + 1.6 + 0.11 + RUN * 1.28, base - 1.28 - 0.14, 0.055), w: BOLD, z: 1.4 },
      { pts: line(-1.4, base, 1.4, base), w: THIN, a: 0.45, z: -1 },
    ];
  },
  // 07 · Стратегии — маршрут
  () => {
    const a = [-1.2, 0.6];
    const end = [1.2, -0.6];
    return [
      {
        pts: route([a, [-0.5, 0.6], [-0.5 + RUN * 0.6, 0], [0.42, 0], [0.42 + RUN * 0.6, -0.6], end]),
        w: BOLD,
        z: 0.8,
      },
      { pts: circle(a[0], a[1], 0.06), w: BOLD, z: 0.8 },
      { pts: circle(0.14, 0, 0.06), w: 1, z: 0.8 },
      { pts: circle(end[0], end[1], 0.1), w: BOLD, z: 1.2 },
      { pts: bracketPoints({ x: 0.98, y: -0.86, w: 0.5, h: 0.52 }), w: 1, a: 0.8, z: 1.6 },
      { pts: route([a, [-1.2 + RUN * 1.2, -0.6], end]), w: THIN, a: 0.34, z: -0.8 },
      { pts: route([a, [1.2 - RUN * 1.2, 0.6], end]), w: THIN, a: 0.24, z: -1.2 },
      { pts: circle(a[0], a[1], 0.06), w: BOLD, z: 0.8 },
    ];
  },
  // 08 · Сопровождение — замкнутый цикл
  () => {
    const big = paraPoints({ cx: 0, cy: 0, w: 1.56, h: 1.12 });
    return [
      { pts: big, w: BOLD, z: 0 },
      { pts: paraPoints({ cx: 0, cy: 0, w: 1.16, h: 0.78 }), w: 1, a: 0.6, z: 0.8 },
      { pts: paraPoints({ cx: 0, cy: 0, w: 0.76, h: 0.44 }), w: 1, a: 0.34, z: 1.6 },
      { pts: circle(0.78 + (RUN * 1.12) / 2 - 0.1, -0.56, 0.06), w: BOLD, z: 0.4 },
      { pts: big, w: BOLD, z: 0 },
      { pts: big, w: BOLD, z: 0 },
      { pts: big, w: BOLD, z: 0 },
      { pts: big, w: BOLD, z: 0 },
    ];
  },
];

export const SERVICE_COUNT = SERVICE_FIGURES.length;

function fill(shape, strands, map) {
  for (let s = 0; s < S; s++) {
    const st = strands[Math.min(s, strands.length - 1)];
    const src = map ? st.pts.map(map) : st.pts;
    resample(src, P, shape.pts, s * P * 2);
    shape.w[s] = st.w ?? 1;
    shape.a[s] = st.a ?? 1;
    shape.z[s] = st.z ?? 0;
  }
  return shape;
}

const unitCache = [];
function unitShape(i) {
  if (!unitCache[i]) unitCache[i] = fill(makeShape(), SERVICE_FIGURES[i]());
  return unitCache[i];
}

/** Знак услуги, вписанный в прямоугольник box (в пикселях окна). */
export function serviceShape(shape, index, box) {
  const src = unitShape(index);
  const u = Math.min(box.width / 2.5, box.height / 2.2);
  const cx = box.left + box.width / 2;
  const cy = box.top + box.height / 2;
  for (let k = 0; k < N; k++) {
    shape.pts[k * 2] = cx + src.pts[k * 2] * u;
    shape.pts[k * 2 + 1] = cy + src.pts[k * 2 + 1] * u;
  }
  shape.w.set(src.w);
  shape.a.set(src.a);
  shape.z.set(src.z);
  return shape;
}

const tiled = new Float32Array((S * (P - 1) + 1) * 2);
let tiledReady = false;
/**
 * Контур первого знака услуг, нарезанный так же, как скобка первого экрана.
 * Благодаря этому скобка переезжает к услугам одной цельной линией, без осколков.
 */
export function serviceBracketShape(shape, box) {
  if (!tiledReady) {
    resample(bracketPoints({ x: -0.56, y: -0.5, w: 1.22, h: 1 }), S * (P - 1) + 1, tiled, 0);
    tiledReady = true;
  }
  const u = Math.min(box.width / 2.5, box.height / 2.2);
  const cx = box.left + box.width / 2;
  const cy = box.top + box.height / 2;
  for (let s = 0; s < S; s++) {
    for (let i = 0; i < P; i++) {
      const k = (s * (P - 1) + i) * 2;
      shape.pts[(s * P + i) * 2] = cx + tiled[k] * u;
      shape.pts[(s * P + i) * 2 + 1] = cy + tiled[k + 1] * u;
    }
    shape.w[s] = BOLD;
    shape.a[s] = 1;
    shape.z[s] = 0.6;
  }
  return shape;
}

const heroCache = { key: '', rel: new Float32Array((S * (P - 1) + 1) * 2) };

/**
 * Скобка вокруг слова — то же соотношение, что у контура и слова «КОНТУР» в логотипе.
 * cap — результат capBox(): границы прописных букв.
 */
export function heroShape(shape, cap, vw) {
  const key = `${Math.round(cap.left)}|${cap.width.toFixed(1)}|${cap.cap.toFixed(1)}|${vw}`;
  if (heroCache.key !== key) {
    heroCache.key = key;
    const pad = cap.cap * 0.36;
    const h = cap.cap + pad * 2;
    let x = cap.left - cap.cap * 0.12;
    const minLeft = Math.max(10, vw * 0.028);
    // на узком экране скобка не должна выходить за край
    if (x - h * RUN < minLeft) x = minLeft + h * RUN;
    const w = cap.left + cap.width * 0.56 - x;
    const endX = cap.left + cap.width * 0.2;
    const bottom = clamp((endX - (x - h * RUN)) / w, 0.3, 1.2);
    // координаты относительно верхней границы прописных — при прокрутке меняется только сдвиг
    const pts = bracketPoints({ x, y: -pad, w, h, bottom });
    resample(pts, S * (P - 1) + 1, heroCache.rel, 0);
  }
  const rel = heroCache.rel;
  // одна ломаная, нарезанная на S последовательных отрезков
  for (let s = 0; s < S; s++) {
    for (let i = 0; i < P; i++) {
      const k = (s * (P - 1) + i) * 2;
      shape.pts[(s * P + i) * 2] = rel[k];
      shape.pts[(s * P + i) * 2 + 1] = rel[k + 1] + cap.top;
    }
    shape.w[s] = BOLD;
    shape.a[s] = 1;
    shape.z[s] = 0;
  }
  return shape;
}

/** Прямоугольная рамка — в неё превращается фигура перед первым проектом. */
export function frameShape(shape, rect) {
  const pts = [
    [rect.left, rect.top],
    [rect.right, rect.top],
    [rect.right, rect.bottom],
    [rect.left, rect.bottom],
    [rect.left, rect.top],
  ];
  return fill(shape, [{ pts, w: 1.2, a: 1, z: 0 }]);
}

/** Переход между двумя состояниями; пряди стартуют с небольшой задержкой друг за другом. */
export function blend(out, A, B, t, stagger = 0.3) {
  for (let s = 0; s < S; s++) {
    const local = ease.inOutCubic(clamp(t * (1 + stagger) - (stagger * s) / (S - 1)));
    const o = s * P * 2;
    for (let i = 0; i < P * 2; i++) out.pts[o + i] = A.pts[o + i] + (B.pts[o + i] - A.pts[o + i]) * local;
    out.w[s] = A.w[s] + (B.w[s] - A.w[s]) * local;
    out.a[s] = A.a[s] + (B.a[s] - A.a[s]) * local;
    out.z[s] = A.z[s] + (B.z[s] - A.z[s]) * local;
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Отрисовка                                                           */
/* ------------------------------------------------------------------ */

export class Figure {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.dirty = true;
    this.resize();
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = window.innerWidth;
    // запас по высоте: адресная строка на телефонах меняет окно без события resize у холста
    this.h = Math.max(window.innerHeight, document.documentElement.clientHeight) + 120;
    this.dpr = dpr;
    this.canvas.width = Math.round(this.w * dpr);
    this.canvas.height = Math.round(this.h * dpr);
    this.canvas.style.height = this.h + 'px';
    this.base = clamp(this.w / 700, 1.2, 2.1);
    this.dirty = true;
  }

  clear() {
    if (!this.dirty) return;
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.dirty = false;
  }

  /**
   * @param {object} shape
   * @param {object} o
   * @param {number} o.alpha  общая прозрачность
   * @param {number} o.draw   доля прорисованной линии (0…1)
   * @param {number} o.tx     сдвиг слоёв по X для параллакса
   * @param {number} o.ty     сдвиг слоёв по Y
   * @param {boolean} o.glint светящаяся точка на конце линии
   */
  render(shape, { alpha = 1, draw = 1, tx = 0, ty = 0, glint = false, keep = false } = {}) {
    const ctx = this.ctx;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (!keep) ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.dirty = true;
    if (alpha <= 0.004 || draw <= 0) return;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#fff';
    const limit = draw >= 1 ? N : draw * (N - S) + 1;
    let hx = 0;
    let hy = 0;
    for (let s = 0; s < S; s++) {
      const a = shape.a[s] * alpha;
      const remain = limit - s * (P - 1);
      if (remain <= 0) break;
      if (a <= 0.004) continue;
      const count = draw >= 1 ? P : Math.min(P, Math.floor(remain) + 1);
      const ox = shape.z[s] * tx;
      const oy = shape.z[s] * ty;
      const o = s * P * 2;
      ctx.beginPath();
      ctx.moveTo(shape.pts[o] + ox, shape.pts[o + 1] + oy);
      for (let i = 1; i < count; i++) {
        hx = shape.pts[o + i * 2] + ox;
        hy = shape.pts[o + i * 2 + 1] + oy;
        ctx.lineTo(hx, hy);
      }
      if (draw < 1 && count < P) {
        const f = remain - Math.floor(remain);
        const i = count;
        const px = shape.pts[o + (i - 1) * 2] + ox;
        const py = shape.pts[o + (i - 1) * 2 + 1] + oy;
        hx = px + (shape.pts[o + i * 2] + ox - px) * f;
        hy = py + (shape.pts[o + i * 2 + 1] + oy - py) * f;
        ctx.lineTo(hx, hy);
      }
      ctx.globalAlpha = a;
      ctx.lineWidth = this.base * shape.w[s];
      ctx.stroke();
    }
    if (glint && draw > 0.01 && draw < 0.995) {
      ctx.globalAlpha = alpha;
      const g = ctx.createRadialGradient(hx, hy, 0, hx, hy, 26);
      g.addColorStop(0, 'rgba(255,236,214,0.95)');
      g.addColorStop(0.18, 'rgba(255,200,150,0.45)');
      g.addColorStop(1, 'rgba(255,190,140,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(hx, hy, 26, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}
