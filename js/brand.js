/**
 * Фирменная геометрия «Контур Главное».
 *
 * Логотип переведён в вектор с официального растрового файла: контур,
 * слово «КОНТУР» и подпись «ГЛАВНОЕ» сохраняют исходные пропорции,
 * межбуквенные расстояния и взаимное расположение.
 * Если появится исходный векторный файл логотипа — достаточно заменить
 * пути в объекте LOGO, остальной сайт подстроится сам.
 */

export const LOGO = {
  width: 509.1,
  height: 154.04,
  /** Толщина линии контура в единицах логотипа. */
  stroke: 9.1,
  /** Толщина штриха подписи «ГЛАВНОЕ». */
  tagStroke: 2.15,
  /** Осевая линия контура — по ней идёт анимация прорисовки. */
  center:
    'M277.66 36.12L287.23 21.52A10.96 10.96 0 0 0 278.06 4.55L107.58 4.55A42.41 42.41 0 0 0 72.11 23.71L7.41 122.44A17.47 17.47 0 0 0 22.02 149.49L191.31 149.49',
  /** Точный силуэт контура со срезами на концах. */
  outline:
    'M286.93 30.27L291.03 24.01A15.51 15.51 0 0 0 278.06 0L107.58 0A46.96 46.96 0 0 0 68.3 21.22L3.6 119.94A22.02 22.02 0 0 0 22.02 154.04L181.33 154.04L187.29 144.94L22.02 144.94A12.92 12.92 0 0 1 11.21 124.93L75.91 26.21A37.86 37.86 0 0 1 107.58 9.1L278.06 9.1A6.41 6.41 0 0 1 283.42 19.02L276.05 30.27Z',
  /** Буквы слова «КОНТУР». */
  word: [
    'M144.36 97.07L120.89 75.52L113.23 81.27L113.23 97.07L101.22 97.07L101.22 47.16L113.24 47.16L113.24 69.07L141.2 47.16L158.4 47.16L129.67 69.03L160.77 97.07Z',
    'M197.42 46.57C205.87 46.57 214.58 48.4 221.29 53.81C226.86 58.29 230.17 64.85 230.17 72.02C230.17 79.19 226.86 85.75 221.29 90.23C214.58 95.63 205.87 97.46 197.42 97.46C188.98 97.46 180.27 95.63 173.56 90.23C167.99 85.75 164.68 79.19 164.68 72.02C164.68 64.85 167.99 58.29 173.56 53.81C180.27 48.4 188.98 46.57 197.42 46.57ZM197.42 56.25C192.29 56.25 186.93 57.43 182.73 60.51C178.96 63.27 176.89 67.34 176.89 72.02C176.89 76.69 178.96 80.76 182.73 83.52C186.93 86.6 192.29 87.78 197.42 87.78C202.56 87.78 207.92 86.6 212.12 83.52C215.89 80.76 217.96 76.69 217.96 72.02C217.96 67.34 215.89 63.27 212.12 60.51C207.92 57.43 202.56 56.25 197.42 56.25Z',
    'M289.22 97.07L289.22 77.09L256.13 77.09L256.13 97.07L243.93 97.07L243.93 47.16L256.16 47.16L256.16 66.92L289.22 66.92L289.22 47.16L301.61 47.16L301.61 97.07Z',
    'M337.15 97.07L337.15 57.37L315.14 57.37L315.14 47.16L371.69 47.16L371.69 57.37L349.4 57.37L349.4 97.07Z',
    'M382.69 97.47L385.27 87.71L392.41 88.39C398.7 88.99 401.78 86.54 405.16 81.61L379.19 47.16L393.74 47.16L412.18 72.04L428.21 47.16L442.2 47.16L421.51 78.28C409.4 96.48 406.05 101.61 382.69 97.47Z',
    'M453.41 97.07L453.41 47.16L489.27 47.16C501.3 47.16 508.74 54.68 508.74 64.5C508.74 74.32 501.3 81.84 489.27 81.84L465.8 81.84L465.8 97.07ZM465.8 57.17L465.8 71.87L488.53 71.87C493.48 71.87 496.6 68.64 496.6 64.52C496.6 60.4 493.48 57.17 488.53 57.17Z',
  ],
  /** Буквы подписи «ГЛАВНОЕ»: штрихи (s) либо заливка (f). */
  tag: [
    { s: 'M226.58 141.37V124.6H237.31' },
    { s: 'M280.28 141.37V124.6H270.23V135.23A5 5 0 0 1 265.23 140.23H265.08' },
    { f: 'M311.31 141.37L318.8 123.53H321.3L328.79 141.37H326.49L324.54 136.65H315.56L313.61 141.37ZM320.05 126.03L316.41 134.65H323.69Z' },
    { s: 'M359.99 132.37H367.55A3.965 3.965 0 0 1 367.55 140.3H359.99V124.6H366.87A3.885 3.885 0 0 1 366.87 132.37H360.38' },
    { s: 'M404.6 123.53V141.37M416.87 123.53V141.37M404.6 132.37H416.87' },
    { s: 'M449.63 132.55A7.95 7.95 0 1 0 465.53 132.55A7.95 7.95 0 1 0 449.63 132.55Z' },
    { s: 'M509.06 124.6H498.29V140.3H509.03M498.29 132.37H508.23' },
  ],
};

/** Угол наклона контура к горизонтали — основа всей графики сайта. */
export const SLANT_DEG = 56.76;
export const SLANT = (SLANT_DEG * Math.PI) / 180;
/** Горизонтальный сдвиг наклонной линии на единицу высоты. */
export const RUN = 1 / Math.tan(SLANT);

let uid = 0;

/**
 * SVG-разметка официального логотипа.
 * Контур рисуется штрихом по осевой линии и обрезается точным силуэтом,
 * поэтому одна и та же разметка служит и статичным знаком, и анимацией.
 */
export function logoMarkup({ className = '', title = 'Контур Главное' } = {}) {
  const id = `logo-clip-${++uid}`;
  const word = LOGO.word.map((d) => `<path class="logo__ch" d="${d}"/>`).join('');
  const tag = LOGO.tag
    .map((t) =>
      t.f
        ? `<path class="logo__tch" d="${t.f}" fill="currentColor" stroke="none" fill-rule="evenodd"/>`
        : `<path class="logo__tch" d="${t.s}"/>`
    )
    .join('');
  return `
<svg class="logo ${className}" viewBox="0 0 ${LOGO.width} ${LOGO.height}" role="img" aria-label="${title}" focusable="false">
  <defs><clipPath id="${id}"><path d="${LOGO.outline}"/></clipPath></defs>
  <g clip-path="url(#${id})"><path class="logo__line" d="${LOGO.center}" pathLength="1" fill="none" stroke="currentColor" stroke-width="${LOGO.stroke}"/></g>
  <g class="logo__word" fill="currentColor" fill-rule="evenodd">${word}</g>
  <g class="logo__tag" fill="none" stroke="currentColor" stroke-width="${LOGO.tagStroke}">${tag}</g>
</svg>`;
}

/* ------------------------------------------------------------------ */
/* Производная графика: скобка-контур и параллелограмм                 */
/* ------------------------------------------------------------------ */

const arcPoints = (cx, cy, r, a0, a1, n) => {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const a = a0 + ((a1 - a0) * i) / n;
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return pts;
};

/** Скругление вершины v между направлениями на точки a и b. */
function roundCorner(a, v, b, r, n = 10) {
  const d1 = norm([a[0] - v[0], a[1] - v[1]]);
  const d2 = norm([b[0] - v[0], b[1] - v[1]]);
  const ang = Math.acos(Math.max(-1, Math.min(1, d1[0] * d2[0] + d1[1] * d2[1])));
  const t = r / Math.tan(ang / 2);
  const bis = norm([d1[0] + d2[0], d1[1] + d2[1]]);
  const c = [v[0] + (bis[0] * r) / Math.sin(ang / 2), v[1] + (bis[1] * r) / Math.sin(ang / 2)];
  const p1 = [v[0] + d1[0] * t, v[1] + d1[1] * t];
  const p2 = [v[0] + d2[0] * t, v[1] + d2[1] * t];
  let a0 = Math.atan2(p1[1] - c[1], p1[0] - c[0]);
  let a1 = Math.atan2(p2[1] - c[1], p2[0] - c[0]);
  let da = a1 - a0;
  while (da > Math.PI) da -= 2 * Math.PI;
  while (da < -Math.PI) da += 2 * Math.PI;
  return arcPoints(c[0], c[1], r, a0, a0 + da, n);
}

function norm(v) {
  const l = Math.hypot(v[0], v[1]) || 1;
  return [v[0] / l, v[1] / l];
}

/**
 * Открытая скобка-контур — та же фигура, что в логотипе:
 * короткий крюк справа сверху, верхняя линия, наклонная слева, нижняя линия.
 *
 * @param {object} b
 * @param {number} b.x       левая граница верхней линии (вершина до скругления)
 * @param {number} b.y       верх
 * @param {number} b.w       длина верхней линии
 * @param {number} b.h       высота
 * @param {number} [b.bottom] длина нижней линии (доля от w), по умолчанию как в логотипе
 * @param {number} [b.hook]   высота крюка (доля от h)
 * @returns {number[][]} ломаная из точек
 */
export function bracketPoints({ x, y, w, h, bottom = 0.91, hook = 0.178 }) {
  const run = h * RUN;
  const TR = [x + w, y];
  const TL = [x, y];
  const BL = [x - run, y + h];
  const hookEnd = [TR[0] - hook * h * RUN, y + hook * h];
  const end = [BL[0] + w * bottom, y + h];
  const r1 = Math.min(h * 0.0756, w * 0.2);
  const r2 = Math.min(h * 0.2926, w * 0.45);
  const r3 = Math.min(h * 0.1205, w * 0.3);
  return [
    hookEnd,
    ...roundCorner(hookEnd, TR, TL, r1, 8),
    ...roundCorner(TR, TL, BL, r2, 14),
    ...roundCorner(TL, BL, end, r3, 10),
    end,
  ];
}

/**
 * Замкнутый параллелограмм с фирменными скруглениями.
 * cx, cy — центр; w — длина горизонтальной стороны; h — высота.
 */
export function paraPoints({ cx, cy, w, h, round = 1 }) {
  const run = h * RUN;
  const TL = [cx - w / 2 + run / 2, cy - h / 2];
  const TR = [cx + w / 2 + run / 2, cy - h / 2];
  const BR = [cx + w / 2 - run / 2, cy + h / 2];
  const BL = [cx - w / 2 - run / 2, cy + h / 2];
  const acute = Math.min(h * 0.1, w * 0.2) * round;
  const obtuse = Math.min(h * 0.26, w * 0.4) * round;
  if (round === 0) return [TL, TR, BR, BL, TL];
  const pts = [
    ...roundCorner(BL, TL, TR, obtuse, 12),
    ...roundCorner(TL, TR, BR, acute, 8),
    ...roundCorner(TR, BR, BL, obtuse, 12),
    ...roundCorner(BR, BL, TL, acute, 8),
  ];
  pts.push(pts[0]);
  return pts;
}

/** Ломаная → атрибут d для SVG. */
export function pointsToPath(pts, close = false) {
  let d = '';
  for (let i = 0; i < pts.length; i++) {
    d += (i ? 'L' : 'M') + pts[i][0].toFixed(2) + ' ' + pts[i][1].toFixed(2);
  }
  return close ? d + 'Z' : d;
}
