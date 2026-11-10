/**
 * «Чем мы занимаемся» — закреплённая сцена.
 * Прокрутка по очереди выделяет восемь услуг; в центре линия-фигура
 * превращается в знак каждой из них.
 */
import { $, $$, clamp, pad2, MOTION, FINE_POINTER, isDesktop } from './utils.js';
import { addScene, docTop, scrollToY } from './scroll.js';
import { setAnchor } from './nav.js';

export function initServices({ stage }) {
  if (!MOTION) return;
  const section = $('#uslugi');
  const pin = $('.services__pin', section);
  const items = $$('.service', section);
  const count = $('#services-count');
  const ticksHost = $('#services-ticks');
  const stageEl = $('#services-stage');
  const total = items.length;

  let active = -1;
  function setActive(i) {
    if (i === active) return;
    const dir = i > active ? 1 : -1;
    active = i;
    items.forEach((el, k) => el.classList.toggle('is-active', k === i));
    const span = document.createElement('span');
    span.style.display = 'inline-block';
    span.textContent = pad2(i + 1);
    count.textContent = '';
    count.appendChild(span);
    span.animate?.(
      [
        { transform: `translateY(${dir * 30}%)`, opacity: 0 },
        { transform: 'none', opacity: 1 },
      ],
      { duration: 600, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }
    );
  }

  let start = 0;
  let end = 1;
  let manual = !isDesktop();
  let inView = false;
  let lastTouch = 0;

  function show(i) {
    setActive(i);
    if (stage) stage.state.services = (i + 0.5) / total;
  }
  addScene({
    measure: () => {
      start = docTop(section);
      end = start + section.offsetHeight - pin.offsetHeight;
      manual = !isDesktop();
      return { start, end };
    },
    update: (p) => {
      inView = p > 0 && p < 1;
      // на узком экране услуги листаются жестом и сами, а не прокруткой страницы
      if (manual) return show(active < 0 ? 0 : active);
      show(Math.floor(clamp(p, 0, 0.9999) * total));
    },
  });
  setActive(0);

  function goTo(i) {
    if (manual) {
      lastTouch = performance.now();
      return show(((i % total) + total) % total);
    }
    if (i < 0) return;
    if (i >= total) return scrollToY(end + window.innerHeight * 0.6);
    scrollToY(start + ((i + 0.5) / total) * (end - start));
  }

  // без подсказок на экране: услуги сменяются сами, пока раздел в окне;
  // после жеста пользователя автосмена берёт паузу
  setInterval(() => {
    if (!manual || !inView || document.hidden) return;
    if (performance.now() - lastTouch < 7000) return;
    show((active + 1) % total);
  }, 3400);

  // список кликабелен: услуга открывается прокруткой к своему шагу
  items.forEach((el, i) =>
    el.addEventListener('click', () => {
      if (isDesktop()) goTo(i);
    })
  );

  // свайп влево/вправо листает услуги; вертикальный жест остаётся обычной прокруткой
  let touch = null;
  pin.addEventListener(
    'touchstart',
    (e) => {
      const t = e.touches[0];
      touch = e.touches.length === 1 ? { x: t.clientX, y: t.clientY, time: e.timeStamp } : null;
    },
    { passive: true }
  );
  pin.addEventListener(
    'touchend',
    (e) => {
      if (!touch) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - touch.x;
      const dy = t.clientY - touch.y;
      const quick = e.timeStamp - touch.time < 350;
      const isTap = Math.abs(dx) < 10 && Math.abs(dy) < 10 && quick;
      const target = e.target;
      touch = null;
      if (Math.abs(dx) > 44 && Math.abs(dx) > Math.abs(dy) * 1.4) return goTo(active + (dx < 0 ? 1 : -1));
      // нажатие на поле со знаком: правая часть — вперёд, левая — назад
      if (isTap && target.closest('.services__stage')) goTo(active + (t.clientX > window.innerWidth * 0.35 ? 1 : -1));
    },
    { passive: true }
  );
  if (FINE_POINTER) {
    stageEl.addEventListener('click', (e) => goTo(active + (e.clientX > stageEl.getBoundingClientRect().left + stageEl.offsetWidth * 0.35 ? 1 : -1)));
  }

  setAnchor('uslugi', () => start + 2);
}
