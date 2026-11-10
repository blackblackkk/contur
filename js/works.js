/**
 * «Избранные проекты».
 *
 * Широкий экран: горизонтальная галерея, которой управляет вертикальная прокрутка.
 * Телефон и планшет: лента с нативным свайпом и привязкой к карточкам —
 * горизонтальный жест не мешает вертикальной прокрутке страницы.
 *
 * Плюс страница проекта — полноэкранный слой с адресом вида #proekt-…
 */
import { PROJECTS } from './content.js';
import { cover, detail, system } from './artwork.js';
import { $, $$, clamp, pad2, trapFocus, lockScroll, MOTION, isDesktop } from './utils.js';
import { addScene, docTop, scrollToY } from './scroll.js';
import { setAnchor } from './nav.js';

export function initWorks() {
  const section = $('#proekty');
  const pin = $('.works__pin', section);
  const track = $('#works-track');
  const rail = $('#works-rail');
  const cards = $$('.work', rail);
  const num = $('#works-num');
  const fill = $('#works-fill');
  const bySlug = Object.fromEntries(PROJECTS.map((p) => [p.slug, p]));

  /* ---------- обложки: подгружаются, когда лента рядом с окном ---------- */
  const mount = (card) => {
    const host = $('.work__art', card);
    if (host.firstChild) return;
    const p = bySlug[card.dataset.slug];
    host.innerHTML = cover(p.slug, p.title);
  };
  if ('IntersectionObserver' in window) {
    const lazy = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          cards.forEach(mount);
          lazy.disconnect();
        }
      },
      { rootMargin: '150% 0px 150% 0px' }
    );
    lazy.observe(section);

    const reveal = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('is-in');
            reveal.unobserve(e.target);
          }
        }
      },
      { threshold: 0.18 }
    );
    cards.forEach((c) => reveal.observe(c));
  } else {
    cards.forEach((c) => {
      mount(c);
      c.classList.add('is-in');
    });
  }

  /* ---------- рамка-контур поверх обложки ---------- */
  function buildFrames() {
    cards.forEach((card) => {
      const media = $('.work__media', card);
      const w = media.clientWidth;
      const h = media.clientHeight;
      if (!w || !h) return;
      let svgEl = $('.work__frame', media);
      if (!svgEl) {
        svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svgEl.setAttribute('class', 'work__frame');
        svgEl.setAttribute('aria-hidden', 'true');
        svgEl.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'path'));
        media.appendChild(svgEl);
      }
      // линия обходит обложку по краю и замыкается в рамку
      const i = 1;
      svgEl.setAttribute('viewBox', `0 0 ${w} ${h}`);
      const path = svgEl.firstChild;
      path.setAttribute('pathLength', '1');
      path.setAttribute('d', `M${w - i} ${h * 0.2}V${i}H${i}V${h - i}H${w - i}V${h * 0.2}`);
    });
  }

  /* ---------- текущая карточка и индикатор ---------- */
  let current = -1;
  function setCurrent(i, progress) {
    fill.style.setProperty('--p', clamp(progress).toFixed(4));
    if (i === current) return;
    current = i;
    cards.forEach((c, k) => c.classList.toggle('is-current', k === i));
    num.textContent = pad2(i + 1);
  }

  /* ---------- режим 1: закреплённая горизонтальная галерея ---------- */
  let pinned = false;
  let maxX = 0;
  let start = 0;
  let centers = [];
  const arts = cards.map((c) => $('.work__art', c));

  addScene({
    measure: () => {
      pinned = MOTION && isDesktop();
      if (!pinned) {
        section.style.height = '';
        track.style.transform = '';
        arts.forEach((a) => (a.style.transform = ''));
        start = docTop(section);
        return { start, end: start + 1 };
      }
      track.style.transform = 'none';
      maxX = Math.max(0, track.scrollWidth - window.innerWidth);
      section.style.height = pin.offsetHeight + maxX + 'px';
      const tl = track.getBoundingClientRect().left;
      centers = cards.map((c) => {
        const r = $('.work__media', c).getBoundingClientRect();
        return r.left - tl + r.width / 2;
      });
      start = docTop(section);
      return { start, end: start + maxX };
    },
    update: (p) => {
      if (!pinned) return;
      const x = -p * maxX;
      track.style.transform = `translate3d(${x.toFixed(1)}px,0,0)`;
      const vw = window.innerWidth;
      let best = 0;
      let bestD = Infinity;
      for (let i = 0; i < cards.length; i++) {
        const cx = centers[i] + x;
        const d = Math.abs(cx - vw * 0.5);
        if (d < bestD) {
          bestD = d;
          best = i;
        }
        // лёгкий параллакс обложки внутри маски
        const off = clamp((cx - vw / 2) / vw, -1, 1);
        arts[i].style.transform = `translate3d(${(off * -5).toFixed(2)}%,0,0)`;
      }
      setCurrent(best, p);
    },
  });

  // фокус с клавиатуры: подвозим карточку в окно
  rail.addEventListener('focusin', (e) => {
    if (!pinned) return;
    const card = e.target.closest('.work');
    if (!card) return;
    const i = cards.indexOf(card);
    const x = clamp(centers[i] - window.innerWidth / 2, 0, maxX);
    scrollToY(start + x, false);
  });

  /* ---------- режим 2: свайп-лента ---------- */
  let ticking = false;
  function railState() {
    ticking = false;
    if (pinned) return;
    const max = rail.scrollWidth - rail.clientWidth;
    const p = max > 0 ? rail.scrollLeft / max : 0;
    const mid = rail.scrollLeft + rail.clientWidth * 0.5;
    let best = 0;
    let bestD = Infinity;
    cards.forEach((c, i) => {
      const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    });
    setCurrent(best, p);
  }
  rail.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(railState);
      }
    },
    { passive: true }
  );

  setAnchor('proekty', () => start + 2);

  /* ---------- страница проекта ---------- */
  const overlay = $('#project');
  const inner = $('#project-inner');
  const scroller = $('#project-scroll');
  const closeBtn = $('#project-close');
  let openSlug = null;
  let lastFocus = null;
  let releaseTrap = null;
  let hideTimer = 0;
  let savedY = 0;
  let restoreY = false;

  function render(p) {
    const next = PROJECTS[(PROJECTS.indexOf(p) + 1) % PROJECTS.length];
    inner.innerHTML = `
      <p class="label project__cat"><span class="label__n">Концепт</span>${p.category}</p>
      <h2 class="project__title" id="project-title">${p.title}</h2>
      <p class="project__summary">${p.summary}</p>
      <div class="project__cover">${cover(p.slug, p.title, 'p')}</div>
      <div class="project__facts">
        <section class="project__fact"><h3>Задача</h3><p>${p.task}</p></section>
        <section class="project__fact"><h3>Идея</h3><p>${p.idea}</p></section>
        <section class="project__fact"><h3>Решение</h3><p>${p.result}</p></section>
      </div>
      <div class="project__frames">${detail(p.slug, p.title)}${system(p.title)}</div>
      <p class="project__note">Это демонстрационный концепт: бренд и задача условные, работа не выполнялась для реального клиента.</p>
      <a class="project__next" href="#proekt-${next.slug}">
        <span class="project__next-label">Следующий концепт</span>
        <span class="project__next-title">${next.title}</span>
      </a>`;
    // обложка на странице проекта показывается целиком, без обрезки
    $$('.art', inner).forEach((a) => a.setAttribute('preserveAspectRatio', 'xMidYMid meet'));
  }

  function open(slug) {
    const p = bySlug[slug];
    if (!p) return;
    const wasOpen = openSlug !== null;
    openSlug = slug;
    clearTimeout(hideTimer);
    render(p);
    scroller.scrollTop = 0;
    if (wasOpen) return;
    savedY = window.scrollY;
    lastFocus = document.activeElement;
    overlay.hidden = false;
    lockScroll(true);
    requestAnimationFrame(() => requestAnimationFrame(() => overlay.classList.add('is-open')));
    releaseTrap = trapFocus(overlay);
    setTimeout(() => closeBtn.focus({ preventScroll: true }), 300);
  }

  function close() {
    if (openSlug === null) return;
    openSlug = null;
    overlay.classList.remove('is-open');
    releaseTrap?.();
    lockScroll(false);
    hideTimer = setTimeout(() => {
      overlay.hidden = true;
      inner.innerHTML = '';
    }, 850);
    lastFocus?.focus?.({ preventScroll: true });
    if (restoreY) {
      // смена адреса прокручивает страницу к разделу — возвращаем её на прежнее место
      restoreY = false;
      const y = savedY;
      window.scrollTo(0, y);
      requestAnimationFrame(() => window.scrollTo(0, y));
    }
  }

  const slugFromHash = () => {
    const m = /^#proekt-([a-z0-9-]+)$/.exec(location.hash);
    return m ? m[1] : null;
  };

  function sync() {
    const slug = slugFromHash();
    if (slug && bySlug[slug]) open(slug);
    else close();
  }
  window.addEventListener('hashchange', sync);

  function requestClose() {
    if (slugFromHash()) {
      // убираем адрес проекта; закрытие произойдёт по событию hashchange
      restoreY = true;
      location.hash = 'proekty';
    } else close();
  }
  closeBtn.addEventListener('click', requestClose);
  overlay.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      requestClose();
    }
  });

  return {
    measure() {
      buildFrames();
      railState();
    },
    /** Открыть проект, если страница загружена с его адресом. */
    openFromHash: sync,
  };
}
