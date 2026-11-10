/**
 * Курсор и «магнитные» кнопки — только для мыши.
 * Следящая рамка курсора повторяет параллелограмм логотипа.
 */
import { $, $$, MOTION, FINE_POINTER } from './utils.js';
import { onFrame } from './scroll.js';

export function initCursor() {
  if (!MOTION || !FINE_POINTER) return;
  const cursor = $('#cursor');
  const dot = $('.cursor__dot', cursor);
  const ring = $('.cursor__ring', cursor);
  const pos = { x: -100, y: -100, rx: -100, ry: -100 };
  let seen = false;

  window.addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType === 'touch') return;
      pos.x = e.clientX;
      pos.y = e.clientY;
      if (!seen) {
        seen = true;
        pos.rx = pos.x;
        pos.ry = pos.y;
        document.documentElement.classList.add('has-cursor');
      }
      dot.style.transform = `translate3d(${pos.x}px,${pos.y}px,0)`;
    },
    { passive: true }
  );

  document.addEventListener('pointerover', (e) => {
    const view = e.target.closest('[data-cursor="view"]');
    const link = !view && e.target.closest('a, button, .service, label, [role="button"]');
    const text = e.target.closest('input, textarea');
    cursor.classList.toggle('is-view', !!view);
    cursor.classList.toggle('is-link', !!link);
    cursor.classList.toggle('is-hidden', !!text);
  });
  document.addEventListener('pointerdown', () => cursor.classList.add('is-down'));
  document.addEventListener('pointerup', () => cursor.classList.remove('is-down'));
  document.documentElement.addEventListener('pointerleave', () => cursor.classList.add('is-hidden'));
  document.documentElement.addEventListener('pointerenter', () => cursor.classList.remove('is-hidden'));

  onFrame(() => {
    if (!seen) return;
    pos.rx += (pos.x - pos.rx) * 0.2;
    pos.ry += (pos.y - pos.ry) * 0.2;
    ring.style.transform = `translate3d(${pos.rx.toFixed(1)}px,${pos.ry.toFixed(1)}px,0)`;
  });

  // магнитные кнопки: тянутся к курсору и мягко возвращаются
  $$('[data-magnetic]').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.28;
      const y = (e.clientY - r.top - r.height / 2) * 0.36;
      el.style.transition = 'transform 0.2s ease-out';
      el.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`;
    });
    el.addEventListener('pointerleave', () => {
      el.style.transition = 'transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)';
      el.style.transform = '';
    });
  });
}
