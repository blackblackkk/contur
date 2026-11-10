/**
 * Вступление: на чёрном экране тонкая линия прорисовывает контур логотипа,
 * появляется слово «КОНТУР», по буквам — «ГЛАВНОЕ», после чего знак
 * уезжает на своё место в шапке и открывает первый экран.
 */
import { LOGO, logoMarkup } from './brand.js';
import { CONFIG } from './config.js';
import { $, $$, ease, tween, wait, lockScroll, MOTION } from './utils.js';

const SEEN_KEY = 'kg-intro';

function seenBefore() {
  try {
    return sessionStorage.getItem(SEEN_KEY) === '1';
  } catch (e) {
    return false;
  }
}
function markSeen() {
  try {
    sessionStorage.setItem(SEEN_KEY, '1');
  } catch (e) {
    /* хранилище недоступно — вступление просто покажется снова */
  }
}

/**
 * @param {object} o
 * @param {Element} o.navLogo  логотип в шапке, куда «садится» знак
 * @param {Function} o.onReveal вызывается, когда открывается первый экран
 */
export async function runIntro({ navLogo, onReveal }) {
  const intro = $('#intro');
  const stage = $('#intro-stage');
  const nav = $('#nav');

  if (!MOTION || !intro) {
    intro?.classList.add('is-done');
    onReveal({ instant: true });
    return;
  }

  const short = seenBefore() && !CONFIG.introEveryVisit;
  const k = short ? 0.5 : 1; // коэффициент длительности для повторного захода
  markSeen();

  nav.classList.add('is-intro');
  lockScroll(true);
  stage.innerHTML = logoMarkup({ className: 'logo--intro' });

  const svg = $('svg', stage);
  const line = $('.logo__line', svg);
  const letters = $$('.logo__ch', svg);
  const tagLetters = $$('.logo__tch', svg);

  // маска для слова «КОНТУР»: буквы выезжают из-под линии
  const ns = 'http://www.w3.org/2000/svg';
  const clip = document.createElementNS(ns, 'clipPath');
  clip.id = 'intro-word-clip';
  const rect = document.createElementNS(ns, 'rect');
  rect.setAttribute('x', '96');
  rect.setAttribute('y', '42');
  rect.setAttribute('width', '418');
  rect.setAttribute('height', '62');
  clip.appendChild(rect);
  $('defs', svg).appendChild(clip);
  $('.logo__word', svg).setAttribute('clip-path', 'url(#intro-word-clip)');

  // светящаяся точка на конце линии
  const glint = document.createElementNS(ns, 'circle');
  glint.setAttribute('r', '3.2');
  glint.setAttribute('class', 'intro__glint');
  glint.style.opacity = '0';
  svg.appendChild(glint);

  // исходное состояние
  const THIN = 2.2;
  const total = line.getTotalLength();
  line.style.strokeDasharray = '1 1';
  line.style.strokeDashoffset = '1';
  line.setAttribute('stroke-width', THIN);
  letters.forEach((l) => {
    l.style.transform = 'translateY(64px)';
  });
  tagLetters.forEach((l) => {
    l.style.opacity = '0';
    if (l.getAttribute('fill') !== 'currentColor') {
      l.setAttribute('pathLength', '1');
      l.style.strokeDasharray = '1 1';
      l.style.strokeDashoffset = '1';
    }
  });

  const running = new Set();
  const run = (opts) => {
    const t = tween(opts);
    running.add(t);
    t.then(() => running.delete(t));
    return t;
  };

  let skipped = false;
  let skipResolve;
  const skipSignal = new Promise((r) => (skipResolve = r));
  const skip = () => {
    if (skipped) return;
    skipped = true;
    running.forEach((t) => t.finish());
    skipResolve();
  };
  const onKey = (e) => {
    if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') skip();
  };
  $('#intro-skip').addEventListener('click', skip);
  window.addEventListener('keydown', onKey);
  window.addEventListener('wheel', skip, { passive: true, once: true });
  window.addEventListener('touchmove', skip, { passive: true, once: true });

  const step = (p) => Promise.race([p, skipSignal]);
  const pause = (ms) => (skipped ? Promise.resolve() : step(wait(ms)));

  await step(document.fonts ? Promise.race([document.fonts.ready, wait(1200)]) : wait(0));
  await pause(260 * k);

  // 1. линия рисует контур
  glint.style.opacity = '1';
  await step(
    run({
      duration: 1500 * k,
      easing: ease.inOutCubic,
      update: (v) => {
        line.style.strokeDashoffset = String(1 - v);
        const pt = line.getPointAtLength(total * v);
        glint.setAttribute('cx', pt.x);
        glint.setAttribute('cy', pt.y);
      },
    })
  );
  run({ duration: 400, update: (v) => (glint.style.opacity = String(1 - v)) });

  // 2. линия набирает толщину логотипа, выезжает «КОНТУР»
  run({
    duration: 700 * k,
    easing: ease.inOutCubic,
    update: (v) => line.setAttribute('stroke-width', THIN + (LOGO.stroke - THIN) * v),
  });
  letters.forEach((l, i) => {
    run({
      duration: 820 * k,
      delay: i * 62 * k,
      easing: ease.outQuart,
      update: (v) => (l.style.transform = `translateY(${(64 * (1 - v)).toFixed(2)}px)`),
    });
  });
  await pause(520 * k);

  // 3. «ГЛАВНОЕ» — по буквам
  const tagRuns = tagLetters.map((l, i) =>
    run({
      duration: 520 * k,
      delay: i * 85 * k,
      easing: ease.outCubic,
      update: (v) => {
        l.style.opacity = String(Math.min(1, v * 2.5));
        if (l.hasAttribute('pathLength')) l.style.strokeDashoffset = String(1 - v);
      },
    })
  );
  await step(Promise.all(tagRuns));
  await pause(420 * k);

  // при пропуске доводим всё до финального вида
  line.style.strokeDashoffset = '0';
  line.setAttribute('stroke-width', LOGO.stroke);
  letters.forEach((l) => (l.style.transform = 'none'));
  tagLetters.forEach((l) => {
    l.style.opacity = '1';
    l.style.strokeDashoffset = '0';
  });
  glint.style.opacity = '0';

  // 4. знак садится в шапку, открывается первый экран
  window.removeEventListener('keydown', onKey);
  intro.classList.add('is-leaving');
  const from = stage.getBoundingClientRect();
  const to = navLogo.getBoundingClientRect();
  const scale = to.width / from.width;
  const dx = to.left - from.left;
  const dy = to.top - from.top;
  lockScroll(false);
  onReveal({ instant: false });
  await tween({
    duration: skipped ? 650 : 1050,
    easing: ease.inOutQuart,
    update: (v) => {
      stage.style.transform = `translate(${(dx * v).toFixed(2)}px, ${(dy * v).toFixed(2)}px) scale(${(1 + (scale - 1) * v).toFixed(4)})`;
      intro.style.setProperty('--veil', String(1 - ease.outCubic(Math.min(1, v * 1.5))));
    },
  });
  nav.classList.remove('is-intro');
  intro.classList.add('is-done');
}
