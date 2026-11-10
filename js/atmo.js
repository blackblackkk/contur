/**
 * Атмосфера: большие графитовые плоскости с тёплой световой кромкой —
 * та же пластика, что на фирменном фоне логотипа. Плоскости лежат под
 * всем содержимым и чуть смещаются при прокрутке и движении мыши.
 */
import { RUN } from './brand.js';
import { $, MOTION, FINE_POINTER } from './utils.js';
import { onFrame } from './scroll.js';

const TILT = Math.tan((16 * Math.PI) / 180);

function sheet({ id, x0, y0, len, depth, dir, strength, vw, vh }) {
  // кромка идёт от (x0, y0) вправо-вверх; плоскость уходит от кромки вверх (dir = -1) или вниз (dir = 1)
  const x1 = x0 + len;
  const y1 = y0 - len * TILT;
  const dx = RUN * depth * -dir;
  const dy = depth * dir;
  const poly = [
    [x0, y0],
    [x1, y1],
    [x1 + dx, y1 + dy],
    [x0 + dx, y0 + dy],
  ]
    .map((p) => p.map((n) => n.toFixed(1)).join(','))
    .join(' ');
  // градиент перпендикулярен кромке и уходит вглубь плоскости
  const nl = Math.hypot(TILT, 1);
  const gx0 = (x0 + x1) / 2;
  const gy0 = (y0 + y1) / 2;
  const gl = depth * 0.9;
  const gx1 = gx0 + ((dir * TILT) / nl) * gl;
  const gy1 = gy0 + (dir / nl) * gl;
  return `
<svg width="${vw}" height="${vh}" viewBox="0 0 ${vw} ${vh}" aria-hidden="true">
  <defs>
    <linearGradient id="${id}-f" gradientUnits="userSpaceOnUse" x1="${gx0}" y1="${gy0}" x2="${gx1}" y2="${gy1}">
      <stop offset="0" stop-color="#fff" stop-opacity="${0.15 * strength}"/>
      <stop offset="0.12" stop-color="#fff" stop-opacity="${0.07 * strength}"/>
      <stop offset="0.5" stop-color="#fff" stop-opacity="${0.02 * strength}"/>
      <stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="${id}-e" gradientUnits="userSpaceOnUse" x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}">
      <stop offset="0" stop-color="#ffd7b5" stop-opacity="0"/>
      <stop offset="0.22" stop-color="#ffc9a0" stop-opacity="${0.55 * strength}"/>
      <stop offset="0.5" stop-color="#fff" stop-opacity="${0.8 * strength}"/>
      <stop offset="0.8" stop-color="#fff" stop-opacity="${0.25 * strength}"/>
      <stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
    <filter id="${id}-b" x="-20%" y="-200%" width="140%" height="500%"><feGaussianBlur stdDeviation="7"/></filter>
  </defs>
  <polygon points="${poly}" fill="url(#${id}-f)"/>
  <line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}" stroke="url(#${id}-e)" stroke-width="5" filter="url(#${id}-b)" opacity="0.7"/>
  <line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}" stroke="url(#${id}-e)" stroke-width="1.1"/>
</svg>`;
}

export function initAtmo() {
  const root = $('#atmo');
  if (!root) return { resize() {} };
  let planes = [];
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };

  function build() {
    const vw = window.innerWidth;
    const vh = Math.max(window.innerHeight, document.documentElement.clientHeight);
    const wide = vw >= 900;
    const defs = [
      // верхняя плоскость — справа сверху
      { id: 'pl-a', x0: vw * (wide ? 0.4 : 0.16), y0: vh * (wide ? 0.31 : 0.24), len: vw * 1.1, depth: vh * 0.62, dir: -1, strength: 1, k: 0.05 },
      // нижняя — справа снизу
      { id: 'pl-b', x0: vw * (wide ? 0.5 : 0.3), y0: vh * (wide ? 0.97 : 0.9), len: vw * 1.1, depth: vh * 0.7, dir: 1, strength: 0.8, k: -0.07 },
      // дальняя, едва заметная — слева
      { id: 'pl-c', x0: -vw * 0.3, y0: vh * (wide ? 0.78 : 0.66), len: vw * 0.82, depth: vh * 0.8, dir: 1, strength: 0.4, k: 0.03 },
    ];
    root.innerHTML = '';
    planes = defs.map((d) => {
      const el = document.createElement('div');
      el.className = 'atmo__plane';
      el.innerHTML = sheet({ ...d, vw, vh });
      root.appendChild(el);
      return { el, k: d.k, phase: Math.random() * 6 };
    });
  }

  build();

  if (MOTION) {
    if (FINE_POINTER) {
      window.addEventListener(
        'pointermove',
        (e) => {
          pointer.tx = e.clientX / window.innerWidth - 0.5;
          pointer.ty = e.clientY / window.innerHeight - 0.5;
        },
        { passive: true }
      );
    }
    let lastS = -1;
    onFrame((sc) => {
      pointer.x += (pointer.tx - pointer.x) * 0.06;
      pointer.y += (pointer.ty - pointer.y) * 0.06;
      const moved = Math.abs(pointer.tx - pointer.x) > 0.0005 || Math.abs(pointer.ty - pointer.y) > 0.0005;
      if (sc.s === lastS && !moved) return;
      lastS = sc.s;
      for (let i = 0; i < planes.length; i++) {
        const p = planes[i];
        const wave = Math.sin(sc.s / 1900 + i * 2.1);
        const x = wave * sc.vw * 0.035 - pointer.x * 26 * (i + 1) * 0.5;
        const y = Math.cos(sc.s / 2300 + i * 1.3) * sc.vh * p.k * 2.2 - pointer.y * 18 * (i + 1) * 0.5;
        p.el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      }
    });
  }

  return { resize: build };
}
