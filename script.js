/* script.js — Vanilla JS, все взаимодействия
   Отформатировано блочно, с русскими комментариями.
   Логика сохранена 1:1 — только улучшена читабельность.
*/

/* ============================
   ========== CONFIG ==========
   ============================ */

/* Список треков (конфиг).
   Файлы ожидаются в assets/tracks/ и обложки в assets/img/ */
const TRACKS = [
  { id: 1, title: "u+me", artist: "9mice", src: "assets/tracks/u-plus-me.mp3", cover: "assets/img/u-plus-me.jpg" },
  { id: 2, title: "Heroinya", artist: "9mice", src: "assets/tracks/heroinya.mp3", cover: "assets/img/heroinya.jpg" },
  { id: 3, title: "lalala", artist: "LILDRUGHILL, 9mice", src: "assets/tracks/lalala.mp3", cover: "assets/img/lalala.jpg" },
  { id: 4, title: "LIPSTICK", artist: "Viperr", src: "assets/tracks/lipstick.mp3", cover: "assets/img/heavy-metal.jpg" },
  { id: 5, title: "Ice + Alabaster", artist: "Viperr", src: "assets/tracks/ice-plus-alabaster.mp3", cover: "assets/img/heavy-metal-2.jpg" },
  { id: 6, title: "Anora", artist: "9mice", src: "assets/tracks/anora.mp3", cover: "assets/img/anora.jpg" },
  { id: 7, title: "Homecoming", artist: "Viperr", src: "assets/tracks/homecoming.mp3", cover: "assets/img/heavy-metal-2.jpg" },
  { id: 8, title: "Ринопластика (Surgery)", artist: "Viperr", src: "assets/tracks/surgery.mp3", cover: "assets/img/heavy-metal-2.jpg" },
  { id: 9, title: "Москва - Владивосток", artist: "9mice", src: "assets/tracks/moscow.mp3", cover: "assets/img/moscow.jpg" }
];

/* ============================
   ========== HELPERS =========
   ============================ */

/* Быстрые селекторы */
const $  = selector => document.querySelector(selector);
const $$ = selector => Array.from(document.querySelectorAll(selector));

/* Простая валидация e-mail (локальная, демо) */
function isEmailValid(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(String(email).trim());
}

/* ============================
   ==== NAVBAR / SCROLL / UI ===
   ============================ */

/* Элементы навигации и прогресс-бар */
const nav = $('#nav');
const burger = $('#burger');
const mobileMenu = $('#mobileMenu');
const progress = $('#progress');
const toTop = $('#toTop');

/* Бургер — открытие/закрытие мобильного меню */
if (burger) {
  burger.addEventListener('click', () => {
    const open = burger.classList.toggle('open');             // переключаем класс
    mobileMenu.classList.toggle('open', open);                // показываем/скрываем меню
    burger.setAttribute('aria-expanded', open);               // доступность
    mobileMenu.setAttribute('aria-hidden', !open);            // доступность
  });
}

/* Закрытие мобильного меню при клике на ссылку с data-scroll */
$$('[data-scroll]').forEach(a => {
  a.addEventListener('click', () => {
    if (burger) burger.classList.remove('open');
    if (mobileMenu) {
      mobileMenu.classList.remove('open');
      mobileMenu.setAttribute('aria-hidden', 'true');
    }
  });
});

/* Плавный скролл с учётом высоты навбара */
const OFFSET = 64;
$$('[data-scroll]').forEach(el => {
  el.addEventListener('click', (e) => {
    const href = el.getAttribute('href');
    if (!href || !href.startsWith('#')) return;
    e.preventDefault();

    const target = document.querySelector(href);
    if (!target) return;

    const top = target.getBoundingClientRect().top + window.scrollY - OFFSET + 6;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* Обработка прокрутки: фон навбара, прогресс-бар, кнопка "вверх" */
function onScroll() {
  const y = window.scrollY;

  // фон у навбара после прокрутки
  if (y > 30) nav.classList.add('scrolled'); else nav.classList.remove('scrolled');

  // прогресс-бар чтения страницы
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? (y / docHeight) * 100 : 0;
  if (progress) progress.style.width = Math.min(100, pct) + '%';

  // показать/скрыть кнопку "наверх"
  if (toTop) {
    if (y > 200) toTop.classList.add('visible'); else toTop.classList.remove('visible');
  }
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll(); // инициализация

/* Плавный клик "вверх" */
if (toTop) {
  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* Параллакс-эффект для фонового видео (легкий масштаб при скролле) */
const bgVideo = $('#bgVideo');
window.addEventListener('scroll', () => {
  const s = window.scrollY;
  const scale = 1 + Math.min(0.06, s / 3000);
  if (bgVideo) bgVideo.style.transform = `scale(${scale})`;
});

/* ============================
   ===== MODALS: Регистрация ===
   ============================ */

/* Модалки */
const modalBackdrop   = $('#modalBackdrop');    // модалка регистрации
const successBackdrop = $('#successBackdrop');  // модалка "успех"

/* Кнопки/поля в модалке регистрации */
const openReg        = $('#openReg');
const openRegMobile  = $('#openRegMobile');
const orderButton    = $('#placeOrder');     // отмечено: в проекте кнопка заказа иногда открывает регу
const regCancel      = $('#regCancel');
const regSubmit      = $('#regSubmit');
const regEmail       = $('#regEmail');
const regPassword    = $('#regPassword');
const regMsg         = $('#regMsg');
const togglePassword = $('#togglePassword');
const okSuccess      = $('#okSuccess');

/* --- Функции управления модалками --- */

/* Открыть модалку регистрации */
function openModal() {
  if (!modalBackdrop) return;
  modalBackdrop.classList.add('open');
  modalBackdrop.setAttribute('aria-hidden', 'false');
}

/* Закрыть модалку регистрации */
function closeModal() {
  if (!modalBackdrop) return;
  modalBackdrop.classList.remove('open');
  modalBackdrop.setAttribute('aria-hidden', 'true');
  if (regMsg) regMsg.textContent = '';
}

/* Открыть модалку успеха (и запустить прогресс если есть) */
function openSuccess() {
  if (!successBackdrop) return;
  successBackdrop.classList.add('open');
  successBackdrop.setAttribute('aria-hidden', 'false');
  startSuccessProgress(); // запустить прогресс-бар внутри модалки (если элемент есть)
}

/* Закрыть модалку успеха */
function closeSuccess() {
  if (!successBackdrop) return;
  successBackdrop.classList.remove('open');
  successBackdrop.setAttribute('aria-hidden', 'true');
}

/* Алиас для обратной совместимости (в коде может вызываться showSuccess) */
function showSuccess() {
  openSuccess();
}

/* --- Привязка событий открытия --- */
if (openReg) openReg.addEventListener('click', openModal);
if (openRegMobile) openRegMobile.addEventListener('click', openModal);
/* В проекте есть поведение: нажатие на orderButton тоже открывает форму регистрации (если нужно) */
if (orderButton) orderButton.addEventListener('click', openModal);

/* --- Закрытие / переключение видимости пароля / подтверждение --- */
if (regCancel) regCancel.addEventListener('click', closeModal);
if (okSuccess) okSuccess.addEventListener('click', closeSuccess);

/* Показ/скрытие пароля (кнопка "глаз") */
if (togglePassword && regPassword) {
  togglePassword.addEventListener('click', () => {
    regPassword.type = regPassword.type === 'password' ? 'text' : 'password';
  });
}

/* Локальная имитация регистрации (валидация + открытие success) */
if (regSubmit) {
  regSubmit.addEventListener('click', () => {
    const email = regEmail ? regEmail.value.trim() : '';
    const pass  = regPassword ? regPassword.value.trim() : '';

    if (!email || !pass) {
      if (regMsg) { regMsg.textContent = 'Введите почту и пароль!'; regMsg.style.color = '#ff5555'; }
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      if (regMsg) { regMsg.textContent = 'Некорректный email!'; regMsg.style.color = '#ff5555'; }
      return;
    }

    /* Успешная "регистрация" (демо) */
    if (regMsg) { regMsg.textContent = 'Регистрация успешна'; regMsg.style.color = '#00ff88'; }

    setTimeout(() => {
      closeModal();
      openSuccess();
      if (regEmail) regEmail.value = '';
      if (regPassword) regPassword.value = '';
    }, 500);
  });
}

/* Закрытие модалок при клике вне области (backdrop click) */
[modalBackdrop, successBackdrop].forEach(backdrop => {
  if (!backdrop) return;
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) {
      backdrop.classList.remove('open');
      backdrop.setAttribute('aria-hidden', 'true');
    }
  });
});

/* ============================
   ===== SUCCESS: прогресс =====
   ============================ */

/* Прогресс внутри модалки успеха — ищет элемент #successProgress и анимирует его.
   Если элемента нет — функция просто ничего не делает (защита). */
function startSuccessProgress() {
  const progressEl = document.getElementById('successProgress');
  if (!progressEl) return;

  progressEl.style.width = '0%';
  let value = 0;

  const duration = 3500; // общая длительность в миллисекундах
  const interval = 100;  // шаг обновления
  const step = 100 / (duration / interval);

  const timer = setInterval(() => {
    value += step;
    progressEl.style.width = value + '%';
    if (value >= 100) {
      clearInterval(timer);
      closeSuccess();
    }
  }, interval);
}

/* ============================
   ======= MERCH CARDS ========
   ============================ */

/* Стэггерный вход карточек мерча + простое превью (alert в демо).
   Запускается после полной загрузки страницы. */
window.addEventListener('load', () => {
  const merch = $$('.merch-card');
  merch.forEach((m, i) => {
    // постепенный (staggered) вход с помощью Web Animations API
    try {
      m.animate(
        [
          { opacity: 0, transform: 'translateY(18px)' },
          { opacity: 1, transform: 'none' }
        ],
        { duration: 520, delay: i * 70, easing: 'cubic-bezier(.2,.9,.25,1)' }
      );
    } catch (err) {
      // если Web Animations не поддерживается — игнорируем
    }

    // клик по карточке — демонстрация превью
    m.addEventListener('click', () => alert('Preview: ' + (m.dataset.title || 'Item')));
  });
});

/* Поддержка touch: при touchstart ставим класс .hovered, чтобы имитировать hover на мобилках */
(function enableMerchTouchHover() {
  const merchCards = document.querySelectorAll('.merch-card');
  if (!merchCards.length) return;

  // небольшая корректировка z-index при наведении мышью (desktop)
  merchCards.forEach(card => {
    card.addEventListener('mouseenter', () => card.style.zIndex = 60);
    card.addEventListener('mouseleave',  () => card.style.zIndex = '');
  });

  // поведение для touch-устройств
  if ('ontouchstart' in window) {
    merchCards.forEach(card => {
      card.addEventListener('touchstart', (e) => {
        merchCards.forEach(c => { if (c !== card) c.classList.remove('hovered'); });
        card.classList.add('hovered');
        // не блокируем дальнейшие события — пользователь всё ещё может нажать
      }, { passive: true });
    });

    // тап вне карточки — убрать подсветки
    document.addEventListener('touchstart', (e) => {
      if (!e.target.closest('.merch-card')) {
        merchCards.forEach(c => c.classList.remove('hovered'));
      }
    }, { passive: true });
  }
})();

/* ============================
   ===== TRACKS CAROUSEL ======
   ============================ */

/* Корневой контейнер плейлистов */
const tracksList = $('#tracksList');

/* Создаём карточку трека (DOM) */
function createTrackCard(track) {
  const card = document.createElement('div');
  card.className = 'track-card';
  card.dataset.id = track.id;
  card.innerHTML = `
    <div class="track-art"><img src="${track.cover}" alt="${track.title}"></div>
    <div class="track-meta">
      <div class="track-title">${track.title}</div>
      <div class="track-artist muted">${track.artist}</div>
    </div>
    <div class="play-btn" title="Play/Pause" aria-label="play button">
      <svg viewBox="0 0 24 24" width="18" height="18"><path d="M8 5v14l11-7z" fill="currentColor"></path></svg>
    </div>`;
  return card;
}

/* Добавляем все треки в список */
if (tracksList) {
  TRACKS.forEach(t => tracksList.appendChild(createTrackCard(t)));
}

/* Навигация карусели треков */
const tracksPrev = $('#tracksPrev');
const tracksNext = $('#tracksNext');

if (tracksPrev) tracksPrev.addEventListener('click', () => tracksList.scrollBy({ left: -260, behavior: 'smooth' }));
if (tracksNext) tracksNext.addEventListener('click', () => tracksList.scrollBy({ left: 260, behavior: 'smooth' }));

/* ======= Audio player: один трек играет одновременно ======= */

/* Текущее состояние плеера */
let current = { audio: null, btn: null, card: null, id: null };

/* Обработчик клика по плей-кнопке внутри tracksList */
if (tracksList) {
  tracksList.addEventListener('click', (e) => {
    const btn = e.target.closest('.play-btn');
    if (!btn) return;

    const card = btn.closest('.track-card');
    if (!card) return;

    const id = Number(card.dataset.id);
    const track = TRACKS.find(t => t.id === id);
    if (!track) return;

    // Если нажали на уже играющий трек — переключаем play/pause
    if (current.id === id) {
      if (current.audio.paused) {
        current.audio.play();
        btn.classList.add('playing');
        card.classList.add('active');
      } else {
        current.audio.pause();
        btn.classList.remove('playing');
        card.classList.remove('active');
      }
      return;
    }

    // Останавливаем предыдущий трек (если был)
    if (current.audio) {
      current.audio.pause();
      if (current.btn) current.btn.classList.remove('playing');
      if (current.card) current.card.classList.remove('active');
    }

    // Создаём и запускаем новый аудио-объект
    const audio = new Audio(track.src);
    audio.preload = 'auto';
    audio.play().catch(() => { /* ошибки автоплей запретов игнорируем */ });

    // визуальные эффекты «играет»
    btn.classList.add('playing');
    card.classList.add('active');

    // обновляем состояние current
    current = { audio, btn, card, id };

    // при окончании трека — очищаем state и визуал
    audio.addEventListener('ended', () => {
      btn.classList.remove('playing');
      card.classList.remove('active');
      current = { audio: null, btn: null, card: null, id: null };
    });
  });
}

/* При сворачивании вкладки — ставим на паузу */
document.addEventListener('visibilitychange', () => {
  if (document.hidden && current.audio) {
    current.audio.pause();
    if (current.btn) current.btn.classList.remove('playing');
    current = { audio: null, btn: null, card: null, id: null };
  }
});

/* ============================
   ===== CLIPS (видео) ========
   ============================ */

/* Анимация входа для видео-элементов (css slideInLeft) */
$$('.clip').forEach((c, i) => {
  c.style.animation = `slideInLeft 600ms ease ${i * 60}ms both`;
});

/* Модальное окно для видео (если есть) */
const videoCards = document.querySelectorAll('.video-card');
const videoModal  = document.getElementById('videoModal');
const videoFrame  = document.getElementById('videoFrame');

if (videoCards && videoModal && videoFrame) {
  videoCards.forEach(card => {
    card.addEventListener('click', () => {
      const videoUrl = card.getAttribute('data-video');
      if (!videoUrl) return;
      videoFrame.src = videoUrl + "?autoplay=1";
      videoModal.classList.add('active');
    });
  });

  videoModal.addEventListener('click', (e) => {
    if (e.target === videoModal) {
      videoModal.classList.remove('active');
      videoFrame.src = "";
    }
  });
}

/* ============================
   ====== ORDER (оформление) ===
   ============================ */

/* Обработка кнопки оформления заказа (локальная валидация e-mail).
   В текущем проекте при успешной валидации вызывается showSuccess() (демо). */

const placeOrderBtn = $('#placeOrder');
const orderEmailInput = $('#orderEmail');

if (placeOrderBtn && orderEmailInput) {
  placeOrderBtn.addEventListener('click', () => {
    const email = orderEmailInput.value.trim();
    if (!isEmailValid(email)) {
      // простая обратная связь — alert (можно заменить на inline-ошибку)
      alert('Введите корректный e-mail');
      return;
    }

    // Демонстрация успешного оформления (в реале отправка запроса)
    showSuccess();
    orderEmailInput.value = '';
  });
}

/* ============================
   ====== ACCESSIBILITY =======
   ============================ */

/* Клавиша Escape — закрыть открытые модалки */
document.addEventListener('keyup', (e) => {
  if (e.key === 'Escape') {
    closeModal();
    if (successBackdrop) successBackdrop.classList.remove('open');
  }
});

/* ============================
   === Order button polish ====
   ============================ */

/* Небольшая анимация / пульс кнопки placeOrder (визуальная полировка) */
(function orderButtonPulse() {
  const placeBtn = document.getElementById('placeOrder');
  if (!placeBtn) return;

  // запускаем пульс чуть позже после загрузки
  setTimeout(() => placeBtn.classList.add('pulse'), 400);

  // при клике делаем эффект "released" и временно отключаем пульс
  placeBtn.addEventListener('click', () => {
    placeBtn.classList.remove('pulse');
    placeBtn.classList.add('released');

    setTimeout(() => placeBtn.classList.remove('released'), 600); // плавный возврат
    setTimeout(() => placeBtn.classList.add('pulse'), 1000);     // восстановить пульс
  });
})();

/* ============================
   ====== END of script.js =====
   ============================ */