/**
 * Шапка, полноэкранное меню, индикатор прокрутки и переходы по якорям.
 */
import { logoMarkup, bracketPoints, pointsToPath } from './brand.js';
import { $, $$, clamp, pad2, trapFocus, lockScroll, MOTION } from './utils.js';
import { onFrame, docTop, scrollToY, scroll } from './scroll.js';

/** Особые точки приземления для закреплённых сцен: id → функция, возвращающая Y. */
const anchors = new Map();
export function setAnchor(id, fn) {
  anchors.set(id, fn);
}

export function initNav() {
  const nav = $('#nav');
  const navLogo = $('.nav__logo', nav);
  const links = $$('.nav__link', nav);
  const marker = $('.nav__marker', nav);
  const toggle = $('#menu-toggle');
  const toggleLabel = $('.nav__toggle-label', toggle);
  const menu = $('#menu');
  const menuLinks = $$('.menu__link', menu);
  const sections = $$('main > section');
  const progressNum = $('#progress-num');
  const progressFill = $('#progress-fill');

  // логотип — из единого источника геометрии
  navLogo.insertAdjacentHTML('beforeend', logoMarkup());
  $('.footer__logo').innerHTML = logoMarkup();
  $('#year').textContent = String(new Date().getFullYear());

  // контур в меню
  const contourHost = $('#menu-contour');
  contourHost.innerHTML = `<svg viewBox="0 0 560 300"><path pathLength="1" d="${pointsToPath(
    bracketPoints({ x: 200, y: 20, w: 330, h: 260 })
  )}"/></svg>`;
  menuLinks.forEach((l, i) => $('.menu__label', l).style.setProperty('--i', i));

  /* ---------------- меню ---------------- */
  let menuOpen = false;
  let releaseTrap = null;
  let closeTimer = 0;

  function setMenu(open) {
    if (open === menuOpen) return;
    menuOpen = open;
    clearTimeout(closeTimer);
    toggle.setAttribute('aria-expanded', String(open));
    toggleLabel.textContent = open ? toggleLabel.dataset.open : toggleLabel.dataset.closed;
    nav.classList.toggle('is-menu', open);
    lockScroll(open);
    if (open) {
      menu.hidden = false;
      // кадр на применение стилей, затем запуск перехода
      requestAnimationFrame(() => requestAnimationFrame(() => menu.classList.add('is-open')));
      releaseTrap = trapFocus(menu);
      setTimeout(() => menuLinks[0]?.focus({ preventScroll: true }), 420);
    } else {
      menu.classList.remove('is-open');
      releaseTrap?.();
      closeTimer = setTimeout(() => (menu.hidden = true), 900);
      toggle.focus({ preventScroll: true });
    }
  }
  toggle.addEventListener('click', () => setMenu(!menuOpen));
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuOpen) setMenu(false);
  });
  matchMedia('(min-width: 1100px)').addEventListener('change', (e) => e.matches && setMenu(false));

  /* ---------------- якоря ---------------- */
  function targetY(id) {
    if (id === 'glavnaya') return 0;
    if (MOTION && anchors.has(id)) return anchors.get(id)();
    const el = document.getElementById(id);
    return el ? docTop(el) : null;
  }

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.hasAttribute('data-open-brief')) return;
    const id = a.getAttribute('href').slice(1);
    if (!id || id.startsWith('proekt-')) return;
    const y = targetY(id);
    if (y === null) return;
    e.preventDefault();
    const go = () => {
      scrollToY(y, MOTION);
      const el = document.getElementById(id);
      if (el) {
        el.setAttribute('tabindex', '-1');
        el.focus({ preventScroll: true });
      }
    };
    if (menuOpen) {
      setMenu(false);
      setTimeout(go, 60);
    } else go();
  });

  /* ---------------- состояние при прокрутке ---------------- */
  let tops = [];
  let current = -1;
  let lastY = scroll.y;
  let hidden = false;

  function measure() {
    tops = sections.map((s) => docTop(s));
    moveMarker();
  }

  function moveMarker() {
    const id = sections[current]?.id;
    const link = links.find((l) => l.getAttribute('href') === '#' + id);
    links.forEach((l) => l.classList.toggle('is-active', l === link));
    if (link) {
      marker.style.setProperty('--x', link.offsetLeft + 'px');
      marker.style.setProperty('--w', String(link.offsetWidth));
    } else {
      marker.style.setProperty('--w', '0');
    }
    menuLinks.forEach((l) => {
      if (l.getAttribute('href') === '#' + id) l.setAttribute('aria-current', 'true');
      else l.removeAttribute('aria-current');
    });
  }

  function setCurrent(i) {
    if (i === current) return;
    const dir = i > current ? 1 : -1;
    current = i;
    moveMarker();
    const span = document.createElement('span');
    span.textContent = pad2(i + 1);
    progressNum.textContent = '';
    progressNum.appendChild(span);
    if (MOTION && span.animate) {
      span.animate([{ transform: `translateY(${dir * 100}%)` }, { transform: 'none' }], {
        duration: 520,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
      });
    }
  }

  onFrame((sc) => {
    const y = sc.y;
    // текущий раздел — тот, чья верхняя граница выше 45 % окна
    let i = 0;
    for (let k = 0; k < tops.length; k++) if (y + sc.vh * 0.45 >= tops[k]) i = k;
    setCurrent(i);
    progressFill.style.setProperty('--p', clamp(y / sc.max).toFixed(4));

    // шапка прячется при движении вниз и возвращается при движении вверх
    const dy = y - lastY;
    if (Math.abs(dy) > 4) {
      const hide = dy > 0 && y > sc.vh * 0.5 && !menuOpen;
      if (hide !== hidden) {
        hidden = hide;
        nav.classList.toggle('is-hidden', hidden);
      }
      lastY = y;
    }
  });

  return { navLogo: $('.logo', navLogo), measure, closeMenu: () => setMenu(false) };
}
