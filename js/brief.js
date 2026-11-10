/**
 * Заявка «Обсудить проект».
 *
 * Работает без сервера: собирает текст заявки и
 *   — отправляет его на formEndpoint, если он задан в config.js;
 *   — иначе открывает почтовую программу, если указан email;
 *   — иначе копирует текст в буфер обмена.
 * Ни в одном из сценариев сайт не сообщает об отправке, которой не было.
 */
import { CONFIG, hasContacts } from './config.js';
import { SERVICES } from './content.js';
import { channelsMarkup } from './contact.js';
import { $, $$, trapFocus, lockScroll } from './utils.js';

export function initBrief({ onOpen } = {}) {
  const dialog = $('#brief');
  const form = $('#brief-form');
  const chips = $('#brief-chips');
  const submit = $('#brief-submit .btn__label');
  const status = $('#brief-status');
  const error = $('#brief-error');
  const channels = $('#brief-channels');
  const contactInput = form.elements.contact;

  chips.innerHTML = SERVICES.map(
    (s) => `<label class="chip"><input type="checkbox" name="service" value="${s.title}"><span>${s.title}</span></label>`
  ).join('');

  const mode = CONFIG.formEndpoint ? 'endpoint' : CONFIG.contacts.email ? 'mail' : 'copy';
  submit.textContent = { endpoint: 'Отправить заявку', mail: 'Написать на почту', copy: 'Скопировать заявку' }[mode];

  const rows = channelsMarkup();
  channels.innerHTML = hasContacts()
    ? `<dl>${rows.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>`
    : '<p>Контакты агентства появятся здесь. Пока заявку можно скопировать и отправить привычным способом.</p>';

  let isOpen = false;
  let release = null;
  let lastFocus = null;
  let timer = 0;

  function open() {
    if (isOpen) return;
    isOpen = true;
    onOpen?.();
    clearTimeout(timer);
    lastFocus = document.activeElement;
    dialog.hidden = false;
    lockScroll(true);
    requestAnimationFrame(() => requestAnimationFrame(() => dialog.classList.add('is-open')));
    release = trapFocus(dialog);
    setTimeout(() => form.elements.name.focus({ preventScroll: true }), 450);
  }
  function close() {
    if (!isOpen) return;
    isOpen = false;
    dialog.classList.remove('is-open');
    release?.();
    lockScroll(false);
    timer = setTimeout(() => (dialog.hidden = true), 800);
    lastFocus?.focus?.({ preventScroll: true });
  }

  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-open-brief]')) {
      e.preventDefault();
      open();
    } else if (e.target.closest('[data-close-brief]')) close();
  });
  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      close();
    }
  });

  function compose() {
    const data = new FormData(form);
    const services = data.getAll('service');
    return [
      'Заявка с сайта «Контур Главное»',
      '',
      `Имя: ${data.get('name') || '—'}`,
      `Контакт: ${data.get('contact')}`,
      `Интересует: ${services.length ? services.join(', ') : '—'}`,
      '',
      `Задача: ${data.get('task') || '—'}`,
    ].join('\n');
  }

  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      // буфер недоступен — показываем текст, чтобы его можно было скопировать вручную
      let area = $('.brief__copytext', form);
      if (!area) {
        area = document.createElement('textarea');
        area.className = 'brief__copytext';
        area.readOnly = true;
        area.rows = 7;
        area.setAttribute('aria-label', 'Текст заявки');
        channels.before(area);
      }
      area.value = text;
      area.focus();
      area.select();
      return false;
    }
  }

  contactInput.addEventListener('input', () => {
    contactInput.removeAttribute('aria-invalid');
    error.hidden = true;
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.textContent = '';
    if (!contactInput.value.trim()) {
      contactInput.setAttribute('aria-invalid', 'true');
      error.hidden = false;
      contactInput.focus();
      return;
    }
    const text = compose();

    if (mode === 'endpoint') {
      try {
        const res = await fetch(CONFIG.formEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.elements.name.value,
            contact: contactInput.value,
            task: form.elements.task.value,
            services: new FormData(form).getAll('service'),
          }),
        });
        if (!res.ok) throw new Error(String(res.status));
        status.textContent = 'Заявка отправлена. Мы свяжемся с вами.';
        form.reset();
      } catch (err) {
        const ok = await copy(text);
        status.textContent = ok
          ? 'Не удалось отправить заявку. Её текст скопирован — пришлите его нам любым удобным способом.'
          : 'Не удалось отправить заявку. Скопируйте её текст ниже и пришлите нам.';
      }
      return;
    }

    const ok = await copy(text);
    if (mode === 'mail') {
      location.href = `mailto:${CONFIG.contacts.email}?subject=${encodeURIComponent('Заявка с сайта')}&body=${encodeURIComponent(text)}`;
      status.textContent = ok
        ? 'Открываем почтовую программу. Если письмо не появилось, текст заявки уже скопирован.'
        : 'Открываем почтовую программу. Если письмо не появилось, скопируйте текст заявки ниже.';
    } else {
      status.textContent = ok ? 'Текст заявки скопирован в буфер обмена.' : 'Скопируйте текст заявки ниже.';
    }
  });

  return { open, close };
}
