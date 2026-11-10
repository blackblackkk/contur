/**
 * Режиссёр линии-фигуры: решает, что линия показывает в каждый момент прокрутки.
 *
 *   первый экран   — скобка вокруг слова «ГЛАВНОЕ»
 *   → услуги       — восемь знаков, по одному на услугу
 *   → проекты      — рамка, которая становится обложкой первого проекта
 */
import { Figure, makeShape, serviceShape, heroShape, frameShape, blend, SERVICE_COUNT } from './figure.js';
import { $, clamp, span, capBox, resetCapCache, ease, tween, MOTION, FINE_POINTER, isDesktop } from './utils.js';
import { onFrame, docTop, scroll } from './scroll.js';

export function initStage() {
  const canvas = $('#figure');
  const heroWord = $('#hero-focus');
  const services = $('#uslugi');
  const servicesPin = $('.services__pin');
  const stageEl = $('#services-stage');
  const works = $('#proekty');
  const firstMedia = $('.work__media');
  if (!canvas || !heroWord) return null;

  const figure = new Figure(canvas);
  const hero = makeShape();
  const frame = makeShape();
  const a = makeShape();
  const b = makeShape();
  const out = makeShape();

  const state = {
    /** прогресс прорисовки скобки на первом экране */
    draw: MOTION ? 0 : 1,
    /** прогресс закреплённой сцены услуг, 0…1 (ставит services.js) */
    services: 0,
  };
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  const m = { servicesStart: 0, servicesEnd: 1, handoffEnd: 2 };

  function measure() {
    figure.resize();
    resetCapCache(heroWord);
    m.servicesStart = docTop(services);
    m.servicesEnd = m.servicesStart + services.offsetHeight - servicesPin.offsetHeight;
    // точка, где рамка совпадает с первой обложкой
    m.handoffEnd = isDesktop() ? docTop(works) : docTop(firstMedia) - window.innerHeight * 0.3;
    if (m.handoffEnd <= m.servicesEnd + 40) m.handoffEnd = m.servicesEnd + window.innerHeight * 0.8;
  }

  if (FINE_POINTER && MOTION) {
    window.addEventListener(
      'pointermove',
      (e) => {
        pointer.tx = e.clientX / window.innerWidth - 0.5;
        pointer.ty = e.clientY / window.innerHeight - 0.5;
      },
      { passive: true }
    );
  }

  function serviceAt(shape, f, box) {
    // f — дробный номер услуги: целая часть — знак, дробная — переход к следующему
    // в начале шага знак перетекает из предыдущего, дальше стоит неподвижно
    const i = clamp(Math.floor(f), 0, SERVICE_COUNT - 1);
    const local = span(f - i, 0, 0.44);
    serviceShape(b, i, box);
    if (local >= 1 || i === 0) return copy(shape, b);
    serviceShape(a, i - 1, box);
    return blend(shape, a, b, local, 0.35);
  }

  function copy(dst, src) {
    dst.pts.set(src.pts);
    dst.w.set(src.w);
    dst.a.set(src.a);
    dst.z.set(src.z);
    return dst;
  }

  function staticFrame() {
    // без анимации: только скобка на первом экране
    const cap = capBox(heroWord);
    if (cap.bottom < -50 || cap.top > window.innerHeight + 50) return figure.clear();
    heroShape(hero, cap, window.innerWidth);
    figure.render(hero, { draw: 1 });
  }

  function frameTick(sc) {
    if (!MOTION) return staticFrame();

    pointer.x += (pointer.tx - pointer.x) * 0.07;
    pointer.y += (pointer.ty - pointer.y) * 0.07;
    const wobble = Math.sin(sc.time / 1900);
    const tx = pointer.x * 30 + wobble * 3;
    const ty = pointer.y * 22 + Math.cos(sc.time / 2300) * 2;
    const s = sc.s;

    // 1. первый экран и переход к услугам
    if (s < m.servicesStart) {
      const t = span(s, m.servicesStart - sc.vh * 0.9, m.servicesStart);
      const cap = capBox(heroWord);
      heroShape(hero, cap, sc.vw);
      if (t <= 0) {
        if (cap.bottom < -80) return figure.clear();
        return figure.render(hero, { draw: state.draw, glint: state.draw < 1 });
      }
      serviceShape(a, 0, stageEl.getBoundingClientRect());
      blend(out, hero, a, t, 0.4);
      return figure.render(out, { draw: state.draw, tx: tx * t, ty: ty * t });
    }

    // 2. услуги
    if (s <= m.servicesEnd) {
      const f = clamp(state.services, 0, 0.9999) * SERVICE_COUNT;
      serviceAt(out, f, stageEl.getBoundingClientRect());
      return figure.render(out, { tx, ty });
    }

    // 3. рамка летит к первому проекту
    if (s < m.handoffEnd + sc.vh * 0.2) {
      const t = span(s, m.servicesEnd, m.handoffEnd);
      serviceShape(a, SERVICE_COUNT - 1, stageEl.getBoundingClientRect());
      frameShape(frame, firstMedia.getBoundingClientRect());
      blend(out, a, frame, ease.inOutSine(t), 0.25);
      // на телефоне до обложки далеко — линия растворяется по пути
      const alpha = isDesktop() ? 1 - span(t, 0.8, 1) : 1 - span(t, 0.12, 0.5);
      return figure.render(out, { alpha, tx: tx * (1 - t), ty: ty * (1 - t) });
    }

    figure.clear();
  }

  onFrame(frameTick);

  return {
    state,
    measure,
    /** прорисовать скобку первого экрана */
    drawHero(instant) {
      if (instant || !MOTION) {
        state.draw = 1;
        return Promise.resolve();
      }
      return tween({ duration: 1900, delay: 250, easing: ease.inOutCubic, update: (v) => (state.draw = v) });
    },
    /** позиция прокрутки для конкретной услуги */
    serviceY(i) {
      return m.servicesStart + ((i + 0.3) / SERVICE_COUNT) * (m.servicesEnd - m.servicesStart);
    },
    get range() {
      return m;
    },
  };
}
