/**
 * «Наш подход» — типографическая сцена.
 *
 *   1. Шум: строки «РЕКЛАМА РЕКЛАМА…» едут в разные стороны.
 *      Поверх по буквам набирается «Не просто делаем рекламу».
 *   2. Шум расступается, фраза уходит наверх.
 *   3. Из-под масок выезжает «Создаём повод заметить», контур обводит главное слово.
 *   4. Точка в конце фразы растёт и заливает экран белым — это фон следующего раздела.
 */
import { bracketPoints, pointsToPath, RUN } from './brand.js';
import { $, $$, clamp, lerp, span, ease, splitChars, capBox, resetCapCache, MOTION } from './utils.js';
import { addScene, docTop } from './scroll.js';
import { setAnchor } from './nav.js';

const ROWS = 5;

export function initApproach() {
  if (!MOTION) return;
  const section = $('#podhod');
  const pin = $('.approach__pin', section);
  const noise = $('#approach-noise');
  const phraseA = $('#approach-a');
  const words = $$('.approach__w', section);
  const key = $('#approach-key');
  const dot = $('#approach-dot');
  const text = $('#approach-text');
  const frameHost = $('#approach-frame');

  // шумовые строки
  const rows = [];
  for (let i = 0; i < ROWS; i++) {
    const row = document.createElement('div');
    row.className = 'approach__noise-row';
    row.textContent = Array(9).fill('реклама').join(' ');
    noise.appendChild(row);
    rows.push(row);
  }

  const chars = splitChars(phraseA);
  frameHost.innerHTML = '<svg><path pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1"/></svg>';
  const frameSvg = $('svg', frameHost);
  const framePath = $('path', frameHost);

  const m = { start: 0, end: 1, aHalf: 0, aDy: 0, aScale: 0.4, dotScale: 60, vw: 0, vh: 0 };
  let lastType = -1;

  function measure() {
    // замеры делаем в «спокойном» состоянии, без трансформаций
    words.forEach((w) => (w.style.transform = 'none'));
    phraseA.style.transform = 'none';
    resetCapCache(key);
    m.vw = window.innerWidth;
    m.vh = window.innerHeight;
    const pinRect = pin.getBoundingClientRect();
    const wide = m.vw >= 900;

    m.aHalf = phraseA.offsetHeight / 2;
    m.aScale = wide ? 0.33 : 0.5;
    const navH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 72;
    m.aDy = navH + m.vh * (wide ? 0.045 : 0.06) - phraseA.offsetTop;

    m.dotScale = (3 * Math.hypot(m.vw, pin.offsetHeight)) / Math.max(8, dot.offsetWidth);

    // контур вокруг главного слова
    const cap = capBox(key);
    const pad = cap.cap * 0.3;
    const h = cap.cap + pad * 2;
    let x = cap.left - pinRect.left - cap.cap * 0.1;
    if (x - h * RUN < 8) x = 8 + h * RUN;
    const w = cap.left - pinRect.left + cap.width * 0.62 - x;
    frameSvg.setAttribute('viewBox', `0 0 ${pinRect.width} ${pinRect.height}`);
    framePath.setAttribute('d', pointsToPath(bracketPoints({ x, y: cap.top - pinRect.top - pad, w, h, bottom: 0.5 })));

    m.start = docTop(section);
    m.end = m.start + section.offsetHeight - pin.offsetHeight;
    lastType = -1;
    return { start: m.start, end: m.end };
  }

  function update(p) {
    // 1. набор первой фразы по буквам
    const type = span(p, 0.02, 0.17);
    if (type !== lastType) {
      lastType = type;
      const n = chars.length;
      for (let i = 0; i < n; i++) {
        const t = ease.outCubic(clamp(type * 1.7 - (0.7 * i) / n));
        chars[i].style.opacity = t.toFixed(3);
        chars[i].style.transform = `translate3d(0,${((1 - t) * 46).toFixed(1)}%,0)`;
      }
    }

    // шум: едет вбок, затем расступается по вертикали и гаснет
    const part = ease.inOutCubic(span(p, 0.2, 0.42));
    for (let i = 0; i < ROWS; i++) {
      const dir = i % 2 ? 1 : -1;
      const x = dir * p * m.vw * 1.5 - (dir > 0 ? m.vw * 1.6 : m.vw * 0.2) - i * m.vw * 0.11;
      const y = (i - (ROWS - 1) / 2) * part * m.vh * 0.42;
      rows[i].style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`;
      rows[i].style.opacity = (1 - part).toFixed(3);
    }

    // 2. первая фраза уходит наверх и уменьшается
    const move = ease.inOutCubic(span(p, 0.24, 0.44));
    phraseA.style.transform = `translate3d(0,${lerp(-m.aHalf, m.aDy, move).toFixed(1)}px,0) scale(${lerp(1, m.aScale, move).toFixed(4)})`;
    phraseA.style.opacity = lerp(1, 0.55, move).toFixed(3);

    // 3. вторая фраза выезжает из-под масок
    for (let i = 0; i < words.length; i++) {
      const t = ease.outQuart(span(p, 0.36 + i * 0.065, 0.56 + i * 0.065));
      words[i].style.transform = `translate3d(0,${((1 - t) * 140).toFixed(1)}%,0)`;
    }
    framePath.style.strokeDashoffset = (1 - ease.inOutCubic(span(p, 0.6, 0.76))).toFixed(4);
    text.style.opacity = span(p, 0.64, 0.74).toFixed(3);

    // 4. точка: появляется вместе со словом и разрастается до белого экрана
    const born = ease.outCubic(span(p, 0.56, 0.64));
    const grow = Math.pow(span(p, 0.79, 0.985), 2.4);
    const scale = born * (1 + (m.dotScale - 1) * grow);
    // в покое точка квадратная; разрастаясь, получает наклон логотипа
    dot.style.transform = `skewX(${(-33.24 * Math.min(1, grow * 40)).toFixed(2)}deg) scale(${scale.toFixed(3)})`;
    section.classList.toggle('is-inverted', grow > 0.3);
  }

  addScene({ measure, update });
  setAnchor('podhod', () => m.start + (m.end - m.start) * 0.19);
}
