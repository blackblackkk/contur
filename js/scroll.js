/**
 * Движок прокрутки.
 *
 * Страница прокручивается нативно — без перехвата колеса и тача.
 * Плавность дают сами сцены: они читают сглаженное значение прокрутки
 * и двигают только transform / opacity.
 */
import { clamp } from './utils.js';

export const scroll = {
  /** Реальная позиция прокрутки. */
  y: window.scrollY,
  /** Сглаженная позиция — по ней считаются сцены. */
  s: window.scrollY,
  /** Скорость, px/кадр (сглаженная). */
  v: 0,
  vw: window.innerWidth,
  vh: window.innerHeight,
  /** Высота документа минус окно. */
  max: 1,
  time: 0,
};

const scenes = [];
const frames = [];
let started = false;
let last = 0;
let fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

/**
 * Сцена: measure() возвращает { start, end } в координатах документа,
 * update(p, raw) получает прогресс 0…1 по сглаженной прокрутке.
 */
export function addScene({ measure, update }) {
  const scene = { measure, update, start: 0, end: 1, p: -1 };
  scenes.push(scene);
  return scene;
}

/** Подписка на каждый кадр (курсор, линия-фигура, фоновые плоскости). */
export function onFrame(fn) {
  frames.push(fn);
}

/** Верх элемента в координатах документа. */
export function docTop(el) {
  return el.getBoundingClientRect().top + window.scrollY;
}

/** Пересчитать границы сцен — после загрузки шрифтов и при ресайзе. */
export function measure() {
  scroll.vw = window.innerWidth;
  scroll.vh = window.innerHeight;
  scroll.max = Math.max(1, document.documentElement.scrollHeight - scroll.vh);
  for (const sc of scenes) {
    const m = sc.measure();
    sc.start = m.start;
    sc.end = Math.max(m.start + 1, m.end);
    sc.p = -1;
  }
}

function tick(now) {
  const dt = Math.min(64, now - last || 16.7);
  last = now;
  scroll.time = now;
  scroll.y = window.scrollY;
  // на таче инерция уже нативная — сглаживаем слабее, чтобы не было «резины»
  const k = 1 - Math.pow(1 - (fine ? 0.085 : 0.2), dt / 16.7);
  const prev = scroll.s;
  scroll.s += (scroll.y - scroll.s) * k;
  if (Math.abs(scroll.y - scroll.s) < 0.05) scroll.s = scroll.y;
  scroll.v += (scroll.s - prev - scroll.v) * 0.2;


  for (const sc of scenes) {
    const p = clamp((scroll.s - sc.start) / (sc.end - sc.start));
    if (p !== sc.p) {
      sc.p = p;
      sc.update(p, scroll);
    }
  }
  for (const fn of frames) fn(scroll, dt);
  requestAnimationFrame(tick);
}

export function start() {
  if (started) return;
  started = true;
  scroll.y = scroll.s = window.scrollY;
  measure();
  requestAnimationFrame(tick);
}

/** Плавный переход к позиции документа. */
export function scrollToY(y, smooth = true) {
  window.scrollTo({ top: Math.max(0, y), behavior: smooth ? 'smooth' : 'auto' });
}
