/**
 * Обложки демонстрационных концептов.
 *
 * Все изображения нарисованы кодом (SVG) в монохромной палитре сайта —
 * без стоковых фотографий. Когда появятся настоящие кейсы, функцию
 * конкретного проекта можно заменить на <img> с реальной обложкой.
 */

const svg = (w, h, body, label, viewBox) =>
  `<svg class="art" viewBox="${viewBox || `0 0 ${w} ${h}`}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${label}">${body}</svg>`;

const small = (x, y, text, o = {}) =>
  `<text x="${x}" y="${y}" font-size="${o.size || 19}" font-weight="500" letter-spacing="${o.ls ?? 4.5}" fill="${o.fill || '#fff'}" opacity="${o.opacity ?? 0.6}" text-anchor="${o.anchor || 'start'}">${text}</text>`;

/* --- «Тише»: слово затихает с каждым повтором ------------------------- */
function tishe() {
  const rows = [
    [236, 262, 1],
    [170, 436, 0.7],
    [120, 562, 0.48],
    [84, 652, 0.32],
    [58, 718, 0.2],
    [40, 766, 0.12],
  ]
    .map(([size, y, o]) => `<text x="52" y="${y}" font-size="${size}" letter-spacing="${-size * 0.045}" fill="#fff" opacity="${o}">Тише</text>`)
    .join('');
  return (
    `<rect width="800" height="1000" fill="#0a0a0b"/>` +
    rows +
    `<line x1="52" y1="884" x2="748" y2="884" stroke="#fff" stroke-width="2"/>` +
    small(52, 934, 'Шумоизоляция') +
    small(748, 934, '0 дБ', { anchor: 'end' })
  );
}

/* --- «Зерно»: знак из одного зерна ------------------------------------ */
const bean = (cx, cy, s, fill = '#fff', seam = '#0b0b0c') =>
  `<g transform="translate(${cx} ${cy}) rotate(33.24) scale(${s})"><ellipse rx="100" ry="146" fill="${fill}"/><line y1="-112" y2="112" stroke="${seam}" stroke-width="15" stroke-linecap="round"/></g>`;

function zerno() {
  return (
    `<defs><linearGradient id="zr-bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1a1a1c"/><stop offset="1" stop-color="#070708"/></linearGradient>` +
    `<linearGradient id="zr-bag" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#232326"/><stop offset="0.5" stop-color="#2e2e32"/><stop offset="1" stop-color="#18181a"/></linearGradient></defs>` +
    `<rect width="1600" height="1000" fill="url(#zr-bg)"/>` +
    bean(420, 500, 1.86) +
    // визитка
    `<g transform="translate(850 150)"><rect width="500" height="290" fill="#f1f1ef"/>${bean(66, 76, 0.24, '#0b0b0c', '#f1f1ef')}` +
    `<text x="40" y="236" font-size="64" letter-spacing="-2.5" fill="#0b0b0c">Зерно</text>` +
    `<text x="460" y="232" font-size="15" font-weight="500" letter-spacing="3.4" fill="#0b0b0c" opacity="0.6" text-anchor="end">Обжарочная</text></g>` +
    // пакет
    `<g transform="translate(960 500)"><path d="M0 34 L28 0 H272 L300 34 V440 H0 Z" fill="url(#zr-bag)"/><rect x="42" y="150" width="216" height="200" fill="#f1f1ef"/>` +
    `<text x="60" y="226" font-size="78" letter-spacing="-3" fill="#0b0b0c">03</text>` +
    `<text x="60" y="262" font-size="13" font-weight="500" letter-spacing="3" fill="#0b0b0c" opacity="0.65">Светлая обжарка</text>${bean(214, 312, 0.15, '#0b0b0c', '#f1f1ef')}</g>` +
    // чашка сверху
    `<g transform="translate(1410 700)"><circle r="118" fill="none" stroke="#fff" stroke-width="2.5"/><circle r="92" fill="#050505" stroke="#3a3a3e" stroke-width="1.5"/>${bean(0, 0, 0.22)}</g>` +
    small(850, 114, 'Фирменный стиль')
  );
}

/* --- «Ось»: сайт, нанизанный на одну линию ---------------------------- */
function os() {
  const tile = (x, y, w, h, n, name, left) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#os-t)"/>` +
    `<line x1="${left ? x + w : x}" y1="${y + 26}" x2="820" y2="${y + 26}" stroke="#fff" stroke-width="1.5"/>` +
    `<circle cx="820" cy="${y + 26}" r="6" fill="#0f0f10" stroke="#fff" stroke-width="1.5"/>` +
    small(left ? x : x, y + h + 30, `${n} · ${name}`, { size: 15, ls: 3.2 });
  return (
    `<defs><linearGradient id="os-t" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3a3b40"/><stop offset="1" stop-color="#19191b"/></linearGradient></defs>` +
    `<rect width="1500" height="1000" fill="#0b0b0c"/>` +
    `<rect x="84" y="76" width="1332" height="848" rx="16" fill="#0f0f10" stroke="#34353a" stroke-width="1.5"/>` +
    `<line x1="84" y1="130" x2="1416" y2="130" stroke="#34353a" stroke-width="1.5"/>` +
    `<circle cx="116" cy="103" r="6" fill="#4a4b50"/><circle cx="138" cy="103" r="6" fill="#4a4b50"/><circle cx="160" cy="103" r="6" fill="#4a4b50"/>` +
    `<rect x="560" y="90" width="380" height="26" rx="13" fill="#1b1b1d"/>` +
    `<text x="124" y="470" font-size="290" letter-spacing="-16" fill="#fff">Ось</text>` +
    small(128, 196, 'Архитектурное бюро', { size: 15, ls: 3.4 }) +
    small(128, 540, 'Проекты · Бюро · Контакты', { size: 15, ls: 3.4 }) +
    `<line x1="820" y1="130" x2="820" y2="924" stroke="#fff" stroke-width="1.5"/>` +
    tile(900, 190, 400, 210, '01', 'Дом у воды', false) +
    tile(900, 480, 300, 180, '02', 'Павильон', false) +
    tile(300, 620, 420, 220, '03', 'Школа искусств', true) +
    tile(980, 740, 340, 130, '04', 'Мост', false)
  );
}

/* --- «Соль»: упаковка с цифрами --------------------------------------- */
function sol() {
  const pack = (x, fill, ink, n, name, stroke = 'none') =>
    `<g transform="translate(${x} 230)"><ellipse cx="110" cy="548" rx="128" ry="16" fill="#000" opacity="0.14"/>` +
    `<rect width="220" height="540" fill="${fill}" stroke="${stroke}" stroke-width="2"/><rect width="220" height="58" fill="${ink}" opacity="0.14"/>` +
    `<text x="18" y="342" font-size="188" letter-spacing="-10" fill="${ink}">${n}</text>` +
    `<line x1="20" y1="388" x2="200" y2="388" stroke="${ink}" stroke-width="2"/>` +
    `<text x="20" y="424" font-size="15" font-weight="500" letter-spacing="3.2" fill="${ink}" opacity="0.8">${name}</text>` +
    `<text x="20" y="508" font-size="12" font-weight="500" letter-spacing="2.6" fill="${ink}" opacity="0.5">60 г</text></g>`;
  return (
    `<rect width="1000" height="1000" fill="#e8e8e5"/>` +
    `<text x="120" y="150" font-size="76" letter-spacing="-3.4" fill="#0b0b0c">Соль</text>` +
    small(880, 146, 'Специи по номерам', { fill: '#0b0b0c', anchor: 'end', size: 15, ls: 3.4 }) +
    pack(120, '#0b0b0c', '#fff', '01', 'Соль морская') +
    pack(390, '#fbfbfa', '#0b0b0c', '02', 'Перец чёрный', '#0b0b0c') +
    pack(660, '#77787c', '#fff', '03', 'Паприка') +
    `<line x1="120" y1="880" x2="880" y2="880" stroke="#0b0b0c" stroke-width="2"/>`
  );
}

/* --- «Маршрут»: серия экранов, связанная одной линией ----------------- */
function marshrut() {
  const phone = (x, y, n, title) =>
    `<g transform="translate(${x} ${y})"><rect width="236" height="500" rx="34" fill="#101011" stroke="#fff" stroke-width="2"/>` +
    `<rect x="84" y="16" width="68" height="18" rx="9" fill="#2a2a2d"/>` +
    `<text x="24" y="96" font-size="54" letter-spacing="-2.4" fill="#fff">${n}</text>` +
    `<text x="24" y="126" font-size="11.5" font-weight="500" letter-spacing="2.4" fill="#fff" opacity="0.6">${title}</text>` +
    `<rect x="24" y="434" width="188" height="38" rx="19" fill="none" stroke="#fff" stroke-width="1.5" opacity="0.5"/></g>`;
  return (
    `<rect width="800" height="1000" fill="#0a0a0b"/>` +
    `<text x="40" y="150" font-size="104" letter-spacing="-5" fill="#fff">Маршрут</text>` +
    small(42, 196, 'Городской гид · запуск в соцсетях', { size: 14, ls: 3 }) +
    phone(22, 392, '01', 'Набережная') +
    phone(282, 290, '02', 'Старый город') +
    phone(542, 392, '03', 'Крыши') +
    // единая линия маршрута проходит через все три экрана
    `<path d="M60 760 H150 L228 641 H330 L441 472 H560 L632 582 H740" fill="none" stroke="#fff" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"/>` +
    `<circle cx="60" cy="760" r="9" fill="#fff"/><circle cx="330" cy="641" r="9" fill="#0a0a0b" stroke="#fff" stroke-width="3"/>` +
    `<circle cx="560" cy="472" r="9" fill="#0a0a0b" stroke="#fff" stroke-width="3"/><circle cx="740" cy="582" r="13" fill="none" stroke="#fff" stroke-width="3"/><circle cx="740" cy="582" r="4.5" fill="#fff"/>`
  );
}

/* --- «Свет»: щит как источник света ----------------------------------- */
function svet() {
  return (
    `<defs><radialGradient id="sv-bg" cx="0.5" cy="0.42" r="0.75"><stop offset="0" stop-color="#232327"/><stop offset="0.55" stop-color="#0c0c0d"/><stop offset="1" stop-color="#050505"/></radialGradient>` +
    `<linearGradient id="sv-spill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0.26"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>` +
    `<filter id="sv-glow" x="-30%" y="-60%" width="160%" height="220%"><feGaussianBlur stdDeviation="46"/></filter></defs>` +
    `<rect width="1600" height="1000" fill="url(#sv-bg)"/>` +
    `<rect x="380" y="200" width="840" height="330" fill="#fff" opacity="0.55" filter="url(#sv-glow)"/>` +
    `<polygon points="380,530 1220,530 1460,880 140,880" fill="url(#sv-spill)"/>` +
    `<rect x="560" y="530" width="16" height="350" fill="#1d1d20"/><rect x="1024" y="530" width="16" height="350" fill="#1d1d20"/>` +
    `<rect x="380" y="200" width="840" height="330" fill="#fff"/>` +
    `<text x="800" y="456" font-size="262" letter-spacing="-12" fill="#050505" text-anchor="middle">Свет</text>` +
    `<line x1="0" y1="880" x2="1600" y2="880" stroke="#3a3a3e" stroke-width="2"/>` +
    // дальний щит
    `<rect x="1330" y="690" width="150" height="60" fill="#fff" opacity="0.8"/><rect x="1400" y="750" width="6" height="130" fill="#1d1d20"/>` +
    small(140, 940, 'Фестиваль света · наружная реклама', { size: 16, ls: 3.6 })
  );
}

const COVERS = {
  tishe: { w: 800, h: 1000, draw: tishe, detail: '0 150 640 480' },
  zerno: { w: 1600, h: 1000, draw: zerno, detail: '820 110 620 465' },
  os: { w: 1500, h: 1000, draw: os, detail: '560 130 840 630' },
  sol: { w: 1000, h: 1000, draw: sol, detail: '90 380 560 420' },
  marshrut: { w: 800, h: 1000, draw: marshrut, detail: '0 380 800 600' },
  svet: { w: 1600, h: 1000, draw: svet, detail: '300 150 1000 750' },
};

/** Одинаковые id градиентов не должны повторяться, если обложка выведена дважды. */
const scoped = (body, suffix) =>
  suffix ? body.replace(/id="(\w+-\w+)"/g, `id="$1-${suffix}"`).replace(/url\(#(\w+-\w+)\)/g, `url(#$1-${suffix})`) : body;

/** Обложка проекта. suffix нужен, когда та же обложка уже есть на странице. */
export function cover(slug, title, suffix = '') {
  const c = COVERS[slug];
  if (!c) return '';
  return svg(c.w, c.h, scoped(c.draw(), suffix), `Обложка демонстрационного концепта «${title}»`);
}

/** Крупный фрагмент обложки — для страницы проекта. */
export function detail(slug, title) {
  const c = COVERS[slug];
  if (!c) return '';
  return svg(c.w, c.h, scoped(c.draw(), 'd'), `Фрагмент концепта «${title}»`, c.detail);
}

/** Лист «системы»: название, палитра и модуль — второй кадр на странице проекта. */
export function system(title) {
  const swatches = ['#050505', '#2e2f33', '#a9abb0', '#ffffff']
    .map((c, i) => `<rect x="${60 + i * 150}" y="520" width="150" height="150" fill="${c}" stroke="#0b0b0c" stroke-width="1.5"/>`)
    .join('');
  const grid = Array.from({ length: 7 }, (_, i) => `<line x1="${60 + i * 130}" y1="60" x2="${60 + i * 130}" y2="740" stroke="#0b0b0c" stroke-width="1" opacity="0.12"/>`).join('');
  return svg(
    900,
    800,
    `<rect width="900" height="800" fill="#ecece9"/>${grid}` +
      `<text x="56" y="250" font-size="${title.length > 5 ? 150 : 200}" letter-spacing="-8" fill="#0b0b0c">${title}</text>` +
      `<text x="56" y="420" font-size="${title.length > 5 ? 150 : 200}" letter-spacing="-8" fill="none" stroke="#0b0b0c" stroke-width="2">${title}</text>` +
      swatches +
      small(60, 480, 'Цвет', { fill: '#0b0b0c', size: 15, ls: 3.4 }) +
      small(60, 112, 'Шрифт', { fill: '#0b0b0c', size: 15, ls: 3.4 }) +
      small(840, 730, 'Модуль 130', { fill: '#0b0b0c', size: 15, ls: 3.4, anchor: 'end' }),
    `Шрифт и палитра концепта «${title}»`
  );
}
