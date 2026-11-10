/**
 * «Доводка» прокрутки на сенсорных экранах.
 *
 * Закреплённые сцены привязаны к прокрутке, поэтому палец может остановить их
 * на полпути. Когда жест закончился, а страница замерла внутри такой сцены,
 * она сама плавно доезжает до ближайшего законченного состояния —
 * вперёд, если движение шло вперёд, или назад.
 * Свободные разделы (проекты, «Почему мы», подвал) это не затрагивает.
 */
import { $, MOTION } from './utils.js';
import { docTop } from './scroll.js';

const COARSE = matchMedia('(hover: none) and (pointer: coarse)').matches;
const IDLE_MS = 190;

export function initSettle() {
  if (!MOTION || !COARSE) return { measure() {} };

  const services = $('#uslugi');
  const works = $('#proekty');
  const approach = $('#podhod');
  const contact = $('#kontakty');
  const pinOf = (s) => s.firstElementChild;
  let zones = [];

  function measure() {
    const vh = window.innerHeight;
    const range = (s) => {
      const start = docTop(s);
      return [start, start + s.offsetHeight - pinOf(s).offsetHeight];
    };
    const [s0, s1] = range(services);
    const [a0, a1] = range(approach);
    const [c0, c1] = range(contact);
    const step = (s1 - s0) / 8;
    zones = [
      // первый экран → восемь услуг → начало проектов
      window.innerWidth < 900
        ? { from: 0, to: s0 + 2, points: [0, s0 + 2] }
        : { from: 0, to: docTop(works), points: [0, ...Array.from({ length: 8 }, (_, i) => s0 + step * (i + 0.5)), docTop(works)] },
      // «Наш подход»: фраза набрана → вторая фраза целиком → белый экран следующего раздела
      { from: a0 - vh * 0.5, to: a1 + 4, points: [a0 + (a1 - a0) * 0.19, a0 + (a1 - a0) * 0.72, a1 + 4] },
      // «Контакты»: шторка и заголовок доигрываются до конца
      { from: c0 - vh * 0.75, to: c0 + (c1 - c0) * 0.92, points: [c0 - vh * 0.75, c0 + (c1 - c0) * 0.92] },
    ];
  }

  let touching = false;
  let timer = 0;
  let lastY = window.scrollY;
  let dir = 1;
  let target = null;

  function settle() {
    if (touching || document.documentElement.classList.contains('is-locked')) return;
    const y = window.scrollY;
    if (target !== null) return; // уже доезжаем
    const zone = zones.find((z) => y > z.from + 3 && y < z.to - 3);
    if (!zone) return;
    const pts = zone.points;
    if (pts.some((p) => Math.abs(p - y) < 4)) return;
    // соседние точки покоя
    let prev = pts[0];
    let next = pts[pts.length - 1];
    for (const p of pts) {
      if (p <= y) prev = p;
      if (p > y) {
        next = p;
        break;
      }
    }
    const k = (y - prev) / Math.max(1, next - prev);
    // по ходу движения достаточно пройти 12 % пути, чтобы сцена доиграла вперёд
    const go = dir > 0 ? (k > 0.18 ? next : prev) : k < 0.82 ? prev : next;
    glide(go);
  }

  // Собственная плавная докрутка: мягкий разгон и торможение,
  // длительность зависит от расстояния. Касание сразу её отменяет.
  let raf = 0;
  function glide(to) {
    const from = window.scrollY;
    const dist = to - from;
    const duration = Math.min(1100, Math.max(520, Math.abs(dist) * 1.5));
    const t0 = performance.now();
    target = to;
    cancelAnimationFrame(raf);
    const tick = (now) => {
      if (target === null) return;
      const t = Math.min(1, (now - t0) / duration);
      const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      window.scrollTo(0, from + dist * e);
      if (t < 1) raf = requestAnimationFrame(tick);
      else target = null;
    };
    raf = requestAnimationFrame(tick);
  }

  window.addEventListener(
    'scroll',
    () => {
      const y = window.scrollY;
      if (target === null && Math.abs(y - lastY) > 1) dir = y > lastY ? 1 : -1;
      lastY = y;
      if (target !== null) return;
      clearTimeout(timer);
      timer = setTimeout(settle, IDLE_MS);
    },
    { passive: true }
  );
  window.addEventListener(
    'touchstart',
    () => {
      touching = true;
      target = null;
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    },
    { passive: true }
  );
  const release = () => {
    touching = false;
    clearTimeout(timer);
    timer = setTimeout(settle, IDLE_MS);
  };
  window.addEventListener('touchend', release, { passive: true });
  window.addEventListener('touchcancel', release, { passive: true });

  return { measure };
}
