/**
 * «Почему мы» — список принципов с фокусом.
 * Заметен тот пункт, на который смотрят: он заливается чёрным и получает
 * скобку-контур, остальные остаются тихим контуром.
 */
import { bracketPoints, pointsToPath, RUN } from './brand.js';
import { $, $$, FINE_POINTER } from './utils.js';
import { onFrame, docTop } from './scroll.js';

export function initWhy() {
  const list = $('#why-list');
  if (!list) return { measure() {} };
  const items = $$('.principle', list);
  const ns = 'http://www.w3.org/2000/svg';

  const marks = items.map((li) => {
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('class', 'principle__mark');
    svg.setAttribute('aria-hidden', 'true');
    const path = document.createElementNS(ns, 'path');
    path.setAttribute('pathLength', '1');
    svg.appendChild(path);
    li.insertBefore(svg, li.firstChild);
    return svg;
  });

  let centers = [];
  let top = 0;
  let bottom = 0;
  let focus = -1;
  let hoverLock = false;
  let lockY = 0;

  function setFocus(i) {
    if (i === focus) return;
    focus = i;
    items.forEach((li, k) => li.classList.toggle('is-focus', k === i));
  }

  function measure() {
    marks.forEach((svg) => {
      const w = svg.clientWidth;
      const h = svg.clientHeight;
      if (!w || !h) return;
      const inset = 2;
      const bh = h - inset * 2;
      const run = bh * RUN;
      const tw = Math.max(6, w - run - inset * 2);
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
      svg.firstChild.setAttribute('d', pointsToPath(bracketPoints({ x: inset + run, y: inset, w: tw, h: bh, bottom: 0.9, hook: 0.3 })));
    });
    centers = items.map((li) => docTop(li) + li.offsetHeight / 2);
    top = docTop(list);
    bottom = top + list.offsetHeight;
  }

  onFrame((sc) => {
    const y = sc.y;
    if (y + sc.vh < top - 200 || y > bottom + 200) return;
    if (hoverLock) {
      if (Math.abs(y - lockY) < 36) return;
      hoverLock = false;
    }
    const line = y + sc.vh * 0.52;
    let best = 0;
    let bestD = Infinity;
    for (let i = 0; i < centers.length; i++) {
      const d = Math.abs(centers[i] - line);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    setFocus(best);
  });

  if (FINE_POINTER) {
    items.forEach((li, i) =>
      li.addEventListener('pointerenter', () => {
        hoverLock = true;
        lockY = window.scrollY;
        setFocus(i);
      })
    );
  }

  return { measure };
}
