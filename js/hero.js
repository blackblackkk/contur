/**
 * Первый экран: заголовок повторяет устройство логотипа —
 * скобка-контур обводит главное слово, третья строка стоит правее и ниже,
 * как подпись в знаке.
 */
import { $, $$, splitChars, MOTION } from './utils.js';
import { addScene } from './scroll.js';

export function initHero({ stage }) {
  const hero = $('.hero');
  const focus = $('#hero-focus');
  const [line1, , line3] = $$('.hero__line', hero);
  const fading = [$('.hero__lead', hero), $('.hero__scroll', hero)];

  if (MOTION) {
    splitChars(focus);

    // уход первого экрана: строки расходятся в стороны, подпись гаснет
    addScene({
      measure: () => ({ start: 0, end: hero.offsetHeight }),
      update: (p) => {
        const vw = window.innerWidth;
        line1.style.transform = `translate3d(${(-p * vw * 0.07).toFixed(1)}px,0,0)`;
        line3.style.transform = `translate3d(${(p * vw * 0.09).toFixed(1)}px,0,0)`;
        const o = String(Math.max(0, 1 - p * 3.2));
        fading[0].style.opacity = o;
        fading[1].style.opacity = o;
      },
    });
  }

  return {
    /** Показать первый экран (вызывается из вступления). */
    reveal({ instant } = {}) {
      hero.classList.add('is-in');
      if (instant) hero.classList.add('is-instant');
      return stage ? stage.drawHero(instant) : Promise.resolve();
    },
  };
}
