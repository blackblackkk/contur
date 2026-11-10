/**
 * Точка входа: собирает модули и запускает страницу.
 */
import { $$, splitLines, onResize, wait, MOTION } from './utils.js';
import { start, measure as measureScenes } from './scroll.js';
import { initNav } from './nav.js';
import { initAtmo } from './atmo.js';
import { initStage } from './stage.js';
import { initHero } from './hero.js';
import { initServices } from './services.js';
import { initWorks } from './works.js';
import { initApproach } from './approach.js';
import { initWhy } from './why.js';
import { initContact } from './contact.js';
import { initBrief } from './brief.js';
import { initCursor } from './cursor.js';
import { runIntro } from './intro.js';
import { initSettle } from './settle.js';

const nav = initNav();
const atmo = initAtmo();
const stage = initStage();
const hero = initHero({ stage });
initServices({ stage });
const works = initWorks();
initApproach();
const why = initWhy();
initContact();
initBrief({ onOpen: nav.closeMenu });
initCursor();
const settle = initSettle();

/* Появление заголовков по строкам и спокойное проявление подписей */
const lineBlocks = MOTION ? $$('[data-lines]') : [];
function splitAll() {
  lineBlocks.forEach((el) => splitLines(el));
}
if (MOTION && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      }
    },
    { threshold: 0.2, rootMargin: '0px 0px -8% 0px' }
  );
  $$('[data-lines], [data-fade]').forEach((el) => io.observe(el));
} else {
  $$('[data-lines], [data-fade]').forEach((el) => el.classList.add('is-in'));
}

function measureAll() {
  measureScenes();
  stage?.measure();
  nav.measure();
  works.measure();
  why.measure();
  settle.measure();
}

splitAll();
start();
measureAll();

const fontsReady = document.fonts ? Promise.race([document.fonts.ready, wait(2500)]) : Promise.resolve();
fontsReady.then(() => {
  splitAll();
  measureAll();
});
window.addEventListener('load', measureAll);
onResize(({ widthChanged }) => {
  if (widthChanged) splitAll();
  atmo.resize();
  measureAll();
});

runIntro({ navLogo: nav.navLogo, onReveal: (o) => hero.reveal(o) });
works.openFromHash();
