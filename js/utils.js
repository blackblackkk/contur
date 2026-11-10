/** Общие помощники: математика, DOM, разбивка текста, твины. */

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

export const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
export const lerp = (a, b, t) => a + (b - a) * t;
/** Прогресс v внутри отрезка [a, b], зажатый в 0…1. */
export const span = (v, a, b) => clamp((v - a) / (b - a));

export const ease = {
  linear: (t) => t,
  outCubic: (t) => 1 - Math.pow(1 - t, 3),
  outQuart: (t) => 1 - Math.pow(1 - t, 4),
  outExpo: (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  inCubic: (t) => t * t * t,
  inOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  inOutQuart: (t) => (t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2),
  inOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
};

const root = document.documentElement;

/** Включён ли режим с анимацией (нет prefers-reduced-motion). */
export const MOTION = root.classList.contains('motion');
export const FINE_POINTER = matchMedia('(hover: hover) and (pointer: fine)').matches;
export const desktopMQ = matchMedia('(min-width: 900px)');
export const isDesktop = () => desktopMQ.matches;

/** Твин на requestAnimationFrame. Возвращает промис и метод finish(). */
export function tween({ duration = 600, delay = 0, easing = ease.outCubic, update, from = 0, to = 1 }) {
  let raf = 0;
  let done = false;
  let resolveFn;
  const promise = new Promise((resolve) => {
    resolveFn = resolve;
    const t0 = performance.now() + delay;
    const tick = (now) => {
      if (done) return;
      const t = clamp((now - t0) / duration);
      if (now >= t0) update(lerp(from, to, easing(t)), t);
      if (t < 1) raf = requestAnimationFrame(tick);
      else {
        done = true;
        resolve();
      }
    };
    raf = requestAnimationFrame(tick);
  });
  promise.finish = () => {
    if (done) return;
    done = true;
    cancelAnimationFrame(raf);
    update(to, 1);
    resolveFn();
  };
  return promise;
}

export const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Разбивает текст элемента на буквы. Слова остаются неразрывными,
 * для скринридеров сохраняется исходный текст.
 */
export function splitChars(el) {
  const text = el.textContent;
  el.textContent = '';
  const sr = document.createElement('span');
  sr.className = 'sr-only';
  sr.textContent = text.trim();
  el.appendChild(sr);
  const chars = [];
  const words = text.split(/(\s+)/);
  for (const w of words) {
    if (!w) continue;
    if (/^\s+$/.test(w)) {
      el.appendChild(document.createTextNode(' '));
      continue;
    }
    const word = document.createElement('span');
    word.className = 'word';
    word.setAttribute('aria-hidden', 'true');
    word.style.display = 'inline-block';
    word.style.whiteSpace = 'nowrap';
    for (const ch of w) {
      const s = document.createElement('span');
      s.className = 'char';
      s.textContent = ch;
      s.style.setProperty('--i', chars.length);
      word.appendChild(s);
      chars.push(s);
    }
    el.appendChild(word);
  }
  return chars;
}

/**
 * Разбивает текст на визуальные строки: каждая строка — маска (.line)
 * и внутренний блок (.line__in), который выезжает снизу.
 * Повторный вызов после изменения ширины пересобирает строки.
 */
export function splitLines(el) {
  if (!el.__src) el.__src = el.innerHTML;
  el.innerHTML = el.__src;
  // оборачиваем слова, сохраняя <br> и неразрывные пробелы
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode);
  const words = [];
  for (const node of textNodes) {
    const frag = document.createDocumentFragment();
    node.textContent.split(/( +)/).forEach((part) => {
      if (!part) return;
      if (/^ +$/.test(part)) frag.appendChild(document.createTextNode(' '));
      else {
        const w = document.createElement('span');
        w.style.display = 'inline-block';
        w.textContent = part;
        frag.appendChild(w);
        words.push(w);
      }
    });
    node.parentNode.replaceChild(frag, node);
  }
  // группируем по верхней границе
  const rows = [];
  let top = null;
  for (const w of words) {
    const t = Math.round(w.getBoundingClientRect().top);
    if (top === null || Math.abs(t - top) > 3) {
      rows.push([]);
      top = t;
    }
    rows[rows.length - 1].push(w.textContent);
  }
  el.innerHTML = '';
  rows.forEach((row, i) => {
    const line = document.createElement('span');
    line.className = 'line';
    const inner = document.createElement('span');
    inner.className = 'line__in';
    inner.style.setProperty('--i', i);
    inner.textContent = row.join(' ');
    line.appendChild(inner);
    el.appendChild(line);
  });
  return rows.length;
}

/** Базовая линия и высота прописных для элемента с текстом (шрифт Inter). */
const CAP_HEIGHT = 0.7275;
const fontSizes = new WeakMap();
export function capBox(el) {
  let probe = el.__probe;
  if (!probe || !probe.isConnected) {
    probe = document.createElement('span');
    probe.setAttribute('aria-hidden', 'true');
    probe.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline;';
    el.appendChild(probe);
    el.__probe = probe;
  }
  let fs = fontSizes.get(el);
  if (!fs) {
    fs = parseFloat(getComputedStyle(el).fontSize);
    fontSizes.set(el, fs);
  }
  const r = el.getBoundingClientRect();
  const base = probe.getBoundingClientRect().top;
  const cap = fs * CAP_HEIGHT;
  return { left: r.left, right: r.right, width: r.width, top: base - cap, bottom: base, cap, fs };
}
/** Сбросить кэш размеров шрифта — после ресайза. */
export function resetCapCache(el) {
  fontSizes.delete(el);
}

/**
 * Подписка на изменение размеров окна. На телефонах игнорирует
 * «дыхание» высоты из-за адресной строки — иначе сцены дёргаются.
 */
export function onResize(fn) {
  let w = window.innerWidth;
  let h = window.innerHeight;
  let raf = 0;
  const handler = () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const nw = window.innerWidth;
      const nh = window.innerHeight;
      const widthChanged = nw !== w;
      const dh = Math.abs(nh - h);
      if (!widthChanged && (dh === 0 || (!FINE_POINTER && dh < 160))) return;
      w = nw;
      h = nh;
      fn({ widthChanged });
    });
  };
  window.addEventListener('resize', handler, { passive: true });
  window.addEventListener('orientationchange', handler, { passive: true });
}

/** Ловушка фокуса для диалогов. Возвращает функцию снятия. */
export function trapFocus(container) {
  const sel = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
  const onKey = (e) => {
    if (e.key !== 'Tab') return;
    const items = $$(sel, container).filter((n) => n.offsetParent !== null || n === document.activeElement);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };
  container.addEventListener('keydown', onKey);
  return () => container.removeEventListener('keydown', onKey);
}

let lockCount = 0;
export function lockScroll(on) {
  lockCount = Math.max(0, lockCount + (on ? 1 : -1));
  root.classList.toggle('is-locked', lockCount > 0);
}

export const pad2 = (n) => String(n).padStart(2, '0');
