/**
 * «Контакты» — финальная сцена.
 * Чёрная плоскость с фирменным наклоном закрывает белый экран,
 * по буквам поднимается «Есть идея?», вокруг расходятся контуры-эхо.
 */
import { bracketPoints, pointsToPath, RUN } from './brand.js';
import { CONFIG } from './config.js';
import { $, $$, clamp, span, ease, splitChars, MOTION, FINE_POINTER } from './utils.js';
import { addScene, onFrame, docTop } from './scroll.js';
import { setAnchor } from './nav.js';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

/** Список каналов связи из config.js. Ничего не выдумываем: пусто — значит заглушка. */
export function channelsMarkup() {
  const c = CONFIG.contacts;
  const rows = [];
  if (c.email) rows.push(['Почта', `<a href="mailto:${esc(c.email)}">${esc(c.email)}</a>`]);
  if (c.phone) rows.push(['Телефон', `<a href="tel:${esc(c.phone.replace(/[^\d+]/g, ''))}">${esc(c.phone)}</a>`]);
  if (c.telegram) rows.push(['Telegram', `<a href="https://t.me/${esc(c.telegram)}" rel="noopener">@${esc(c.telegram)}</a>`]);
  if (c.address) rows.push(['Адрес', esc(c.address)]);
  return rows;
}

const ECHOES = 5;

export function initContact() {
  const section = $('#kontakty');
  const pin = $('.contact__pin', section);
  const title = $('#contact-title');
  const list = $('#contact-channels');

  const rows = channelsMarkup();
  list.innerHTML = rows.length
    ? rows.map(([k, v]) => `<li><span>${k}</span>${v}</li>`).join('')
    : '<li class="is-placeholder">Контакты появятся здесь</li>';

  if (!MOTION) return;

  const curtain = $('#contact-curtain');
  const echoHost = $('#contact-echo');
  const fades = [$('.contact__label', section), $('.contact__lead', section), $('.contact__cta', section), list];
  const chars = $$('.contact__word', title).flatMap((w) => splitChars(w));

  echoHost.innerHTML = `<svg>${Array.from({ length: ECHOES }, () => '<path pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1"/>').join('')}</svg>`;
  const echoSvg = $('svg', echoHost);
  const echoes = $$('path', echoHost);

  const m = { start: 0, end: 1 };
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  let visible = false;
  let lastChars = -1;

  function measure() {
    chars.forEach((c) => (c.style.transform = 'none'));
    const pr = pin.getBoundingClientRect();
    const tr = title.getBoundingClientRect();
    echoSvg.setAttribute('viewBox', `0 0 ${pr.width} ${pr.height}`);
    const x0 = tr.left - pr.left;
    const y0 = tr.top - pr.top;
    echoes.forEach((path, i) => {
      const grow = (i + 1) * Math.min(pr.width, pr.height) * 0.07;
      const h = tr.height + grow * 2;
      const x = Math.max(x0 + tr.width * 0.08 - grow * 0.4, h * RUN + 6);
      const w = tr.width * (0.5 + i * 0.07);
      path.setAttribute('d', pointsToPath(bracketPoints({ x, y: y0 - grow, w, h, bottom: 0.55 + i * 0.05 })));
      path.setAttribute('stroke-width', i === 0 ? 2 : 1.25);
      path.style.opacity = String([0.9, 0.55, 0.36, 0.22, 0.12][i]);
    });
    m.start = docTop(section);
    m.end = m.start + section.offsetHeight - pin.offsetHeight;
    lastChars = -1;
    return { start: m.start - window.innerHeight, end: m.end };
  }

  function update(p, sc) {
    const vh = sc.vh;
    visible = sc.s > m.start - vh && sc.s < m.end + vh;
    // чёрная плоскость закрывает белый экран, пока раздел входит в окно
    const cover = ease.inOutSine(span(sc.s, m.start - vh * 0.8, m.start + vh * 0.12));
    curtain.style.transform = `translateX(${((1 - cover) * 118).toFixed(2)}%) skewX(-33.24deg)`;

    // заголовок поднимается по буквам
    const q = span(sc.s, m.start, m.end);
    const t = span(q, 0.02, 0.6);
    if (t !== lastChars) {
      lastChars = t;
      const n = chars.length;
      for (let i = 0; i < n; i++) {
        const k = ease.outQuart(clamp(t * 1.8 - (0.8 * i) / n));
        chars[i].style.transform = `translate3d(0,${((1 - k) * 112).toFixed(1)}%,0)`;
      }
    }
    const fade = span(q, 0.45, 0.72).toFixed(3);
    fades.forEach((el) => (el.style.opacity = fade));

    // эхо-контуры прорисовываются один за другим
    echoes.forEach((path, i) => {
      const d = ease.inOutCubic(span(q, 0.22 + i * 0.07, 0.6 + i * 0.07));
      path.style.strokeDashoffset = (1 - d).toFixed(4);
    });
  }

  addScene({ measure, update });
  setAnchor('kontakty', () => m.start + (m.end - m.start) * 0.92);

  // контуры слегка расходятся вслед за курсором
  if (FINE_POINTER) {
    pin.addEventListener(
      'pointermove',
      (e) => {
        pointer.tx = e.clientX / window.innerWidth - 0.5;
        pointer.ty = e.clientY / window.innerHeight - 0.5;
      },
      { passive: true }
    );
  }
  onFrame((sc) => {
    if (!visible && sc.s < m.end) return;
    pointer.x += (pointer.tx - pointer.x) * 0.06;
    pointer.y += (pointer.ty - pointer.y) * 0.06;
    const breathe = Math.sin(sc.time / 1800);
    for (let i = 0; i < echoes.length; i++) {
      const k = i + 1;
      echoes[i].style.transform = `translate3d(${(pointer.x * -14 * k + breathe * k * 1.2).toFixed(2)}px,${(pointer.y * -10 * k).toFixed(2)}px,0)`;
    }
  });
}
