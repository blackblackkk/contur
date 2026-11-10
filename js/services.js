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
  const total = items.length;

  const ticks = items.map(() => {
    const t = document.createElement('span');
    t.className = 'services__tick';
    t.appendChild(document.createElement('i'));
    ticksHost.appendChild(t);
    return t.firstChild;
  });

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
  addScene({
    measure: () => {
      start = docTop(section);
      end = start + section.offsetHeight - pin.offsetHeight;
      return { start, end };
    },
    update: (p) => {
      if (stage) stage.state.services = p;
      const f = clamp(p, 0, 0.9999) * total;
      setActive(Math.floor(f));
      for (let i = 0; i < total; i++) ticks[i].style.setProperty('--t', clamp(f - i).toFixed(3));
    },
  });
  setActive(0);

  // на десктопе список кликабелен: услуга открывается прокруткой к своему шагу
  if (FINE_POINTER) {
    items.forEach((el, i) =>
      el.addEventListener('click', () => {
        if (isDesktop()) scrollToY(start + ((i + 0.3) / total) * (end - start));
      })
    );
  }

  setAnchor('uslugi', () => start + 2);
}
