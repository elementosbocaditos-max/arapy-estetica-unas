// ============================================================================
// BEAUTY & NAIL STUDIO — CORE APPLICATION ENGINE (PASO 2)
// Gestión Completa: Datos del Salón + Categorías y Servicios + Fotos & Textos
// ============================================================================
import { initFirebase, DataStore } from './firebase-config.js';

// Estado global de la aplicación en memoria (sincronizado con DataStore / Firestore)
const AppState = {
  activeScreen: 'splash',
  panelSubView: 'menu', // 'menu' | 'agenda' | 'clients' | 'services' | 'finances' | 'salon' | 'photos'
  isOwnerUnlocked: false,
  pinDraft: '',
  pinError: '',
  toastMessage: null,

  // Datos del Salón (Editables 100% por la dueña)
  salon: {
    name: 'Nombre de tu Salón',
    tagline: 'Tu espacio de belleza y cuidado personal',
    address: 'Av. Principal 1234, Local 5',
    phone: '',
    alias: 'TU.ALIAS.MP',
    aliasHolder: 'Titular del Salón',
    depositPercent: 50,
    pin: '', // Vacío por defecto: la dueña lo crea la primera vez
    splashTitle: 'Look Good,',
    splashSubtitle: 'Feel Beautiful',
    splashHero: './assets/splash-hero.jpg',
    themeColor: 'rose', // 'rose' | 'nude' | 'champagne' | 'sage' | 'noir'
    bannerBadge: 'Promoción de la Semana',
    bannerTitle: '20% OFF en Balayage & Uñas',
    bannerSubtitle: 'Válido agendando tu turno online este mes',
    bannerImage: './assets/service-hair-balayage.jpg'
  },

  // Colecciones (Inician limpias y vacías)
  categories: [],
  services: [],
  appointments: [],
  clients: [],
  finances: [],
  inspo: [
    { id: 'inspo_1', title: 'Francesitas Rose Gold', category: 'Uñas Esculpidas', image: './assets/inspo-rose-french.jpg' },
    { id: 'inspo_2', title: 'Black & Gold Glam', category: 'Nail Art', image: './assets/inspo-black-gold.jpg' },
    { id: 'inspo_3', title: 'Balayage Caramelo & Brushing', category: 'Peluquería', image: './assets/service-hair-balayage.jpg' },
    { id: 'inspo_4', title: 'Corte Femenino & Styling', category: 'Peluquería', image: './assets/service-hair-cut.jpg' }
  ],

  // Filtros de búsqueda
  serviceSearchQuery: '',
  activeCategoryFilter: 'all',

  // Reserva de Clienta en curso
  bookingDate: '', // 'YYYY-MM-DD'
  bookingSlot: '', // '14:00'
  bookingDraft: {
    serviceId: null,
    inspoId: null,
    date: null,
    slot: null,
    clientName: '',
    clientPhone: ''
  },

  // Agenda del Salón
  agendaSelectedDate: '', // 'YYYY-MM-DD'
  isManualApptOpen: false,
  isBlockModalOpen: false,
  blockedSlots: [],

  // Estado temporal de edición de servicio en el Panel
  editingServiceId: null,

  // Búsqueda y gestión de clientas (Paso 4)
  clientSearchQuery: '',
  editingClientId: null,
  isClientModalOpen: false,

  // Finanzas y Caja (Paso 4)
  financeFilter: 'month', // 'today' | 'week' | 'month' | 'all'
  isNewTxModalOpen: false,
  txModalType: 'income' // 'income' | 'expense'
};

// ----------------------------------------------------------------------------
// SVG ICONS NATIVOS
// ----------------------------------------------------------------------------
const Icons = {
  home: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  scissors: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>`,
  sparkles: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>`,
  calendar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>`,
  lock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
  chevronLeft: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="15 18 9 12 15 6"/></svg>`,
  users: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  dollar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
  store: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/></svg>`,
  camera: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>`,
  whatsapp: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>`,
  search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  trash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,
  edit: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12"/></svg>`
};

// ----------------------------------------------------------------------------
// SISTEMA DE TOAST
// ----------------------------------------------------------------------------
function showToast(message) {
  AppState.toastMessage = message;
  renderApp();
  setTimeout(() => {
    if (AppState.toastMessage === message) {
      AppState.toastMessage = null;
      renderApp();
    }
  }, 3200);
}

// ----------------------------------------------------------------------------
// GESTIÓN DE PALETA DE COLOR
// ----------------------------------------------------------------------------
function applyTheme(theme) {
  AppState.salon.themeColor = theme;
  document.body.className =
    theme === 'rose'
      ? 'theme-rose'
      : theme === 'nude'
        ? 'theme-nude'
        : theme === 'champagne'
          ? 'theme-champagne'
          : theme === 'sage'
            ? 'theme-sage'
            : theme === 'noir'
              ? 'theme-noir'
              : 'theme-rose';
}

function getPaletteName(theme) {
  switch (theme) {
    case 'rose':
      return '🌸 Blush Rose (Referencia)';
    case 'nude':
      return '🤎 Nude Bronze';
    case 'champagne':
      return '🥂 Champagne Gold';
    case 'sage':
      return '🌿 Olive Sage';
    case 'noir':
      return '🖤 Noir Minimal';
    default:
      return '🌸 Blush Rose';
  }
}

// ----------------------------------------------------------------------------
// HELPERS DE FECHAS Y HORARIOS (PASO 3)
// ----------------------------------------------------------------------------
function getTodayDateStr() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatDateDisplay(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  const dateObj = new Date(Number(y), Number(m) - 1, Number(d));
  const weekdays = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return `${weekdays[dateObj.getDay()]} ${Number(d)} de ${months[dateObj.getMonth()]}`;
}

function getUpcomingDays(count = 10) {
  const weekdays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const days = [];
  const today = new Date();

  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dayNum = String(d.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${dayNum}`;

    days.push({
      dateStr,
      dayNum: d.getDate(),
      weekday: i === 0 ? 'Hoy' : i === 1 ? 'Mañ' : weekdays[d.getDay()],
      month: months[d.getMonth()],
      isToday: i === 0
    });
  }
  return days;
}

const SALON_SLOTS = [
  '09:00', '10:00', '11:00', '12:00', '13:00', '14:00',
  '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
];

function isSlotOccupied(dateStr, slot) {
  if (!dateStr || !slot) return false;
  const isApptTaken = (AppState.appointments || []).some(
    (a) => a.date === dateStr && a.slot === slot && a.status !== 'cancelled'
  );
  if (isApptTaken) return true;

  const isBlocked = (AppState.blockedSlots || []).some(
    (b) => b.date === dateStr && (b.allDay || b.slot === slot)
  );
  return isBlocked;
}

// ----------------------------------------------------------------------------
// CONTROL DE NAVEGACIÓN REAL
// ----------------------------------------------------------------------------
function navigateTo(screenId) {
  AppState.activeScreen = screenId;
  if (screenId === 'panel' && !AppState.isOwnerUnlocked) {
    AppState.pinDraft = '';
    AppState.pinError = '';
  }
  renderApp();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.navigateTo = navigateTo;

// ----------------------------------------------------------------------------
// TECLADO PIN PARA EL PANEL DEL DUEÑO
// ----------------------------------------------------------------------------
function handlePinKey(digit) {
  if (AppState.pinDraft.length < 4) {
    AppState.pinDraft += digit;
    AppState.pinError = '';
  }

  if (AppState.pinDraft.length === 4) {
    if (!AppState.salon.pin) {
      AppState.salon.pin = AppState.pinDraft;
      DataStore.set('salon', 'config', AppState.salon);
      AppState.isOwnerUnlocked = true;
      AppState.pinDraft = '';
      showToast('🎉 ¡PIN creado exitosamente! Acceso habilitado.');
      renderApp();
      return;
    }

    if (AppState.pinDraft === AppState.salon.pin) {
      AppState.isOwnerUnlocked = true;
      AppState.pinDraft = '';
      showToast('🔓 Panel del Dueño desbloqueado');
      renderApp();
    } else {
      AppState.pinError = 'PIN incorrecto. Intentá de nuevo.';
      AppState.pinDraft = '';
      renderApp();
    }
  } else {
    renderApp();
  }
}

function handlePinDelete() {
  if (AppState.pinDraft.length > 0) {
    AppState.pinDraft = AppState.pinDraft.slice(0, -1);
    AppState.pinError = '';
    renderApp();
  }
}

window.handlePinKey = handlePinKey;
window.handlePinDelete = handlePinDelete;

// ----------------------------------------------------------------------------
// PANTALLA 1: PORTADA (SPLASH - FOTO EN PRIMER PLANO LUMINOSA ESTILO REFERENCIA)
// ----------------------------------------------------------------------------
function renderSplash() {
  return `
    <div class="screen-viewport no-bottom-bar splash-container">
      <!-- Sección Superior: Foto Nítida y Luminosa en Primer Plano (Sin filtros oscuros) -->
      <div class="splash-photo-hero">
        <img
          src="${AppState.salon.splashHero || './assets/splash-hero.jpg'}"
          alt="Salón de Belleza"
          class="splash-hero-img"
          onerror="this.src='./assets/splash-hero.jpg'"
        />
        <div class="splash-top-bar">
          <span class="splash-brand-badge">${AppState.salon.name || 'Beauty Studio'}</span>
        </div>
        <div class="splash-hero-bottom-fade"></div>
      </div>

      <!-- Sección Inferior: Textos y Botones sobre Fondo Limpio Negro Elegante -->
      <div class="splash-bottom-content">
        <h1 class="splash-title">
          ${AppState.salon.splashTitle || 'Look Good,'}<br />
          <span class="accent">${AppState.salon.splashSubtitle || 'Feel Beautiful'}</span>
        </h1>
        <p class="splash-subtitle">${AppState.salon.tagline || 'Beauty And Style, Designed Just For You'}</p>

        <button type="button" class="splash-btn-primary" onclick="navigateTo('services')">
          <span>Reservar Turno</span>
          <span class="splash-btn-circle">→</span>
        </button>

        <button type="button" class="splash-btn-secondary" onclick="navigateTo('home')">
          <span>Conocer Servicios & Salón</span>
          <span style="font-size: 11px;">▼</span>
        </button>
      </div>
    </div>
  `;
}

// ----------------------------------------------------------------------------
// PANTALLA 2: INICIO (HOME CON FOTOS INTEGRADAS ESTILO PASTED.PNG)
// ----------------------------------------------------------------------------
function renderHome() {
  const hasAppt = AppState.bookingDraft.serviceId !== null;
  const currentService = AppState.services.find((s) => s.id === AppState.bookingDraft.serviceId);
  const activeServices = AppState.services.filter((s) => s.active !== false);
  const popularServices = activeServices.slice(0, 4);

  return `
    <div class="screen-viewport">
      <header class="app-header">
        <div class="app-header-left">
          <div>
            <span style="font-size: 11px; font-weight: 700; color: var(--accent-primary); text-transform: uppercase; letter-spacing: 0.06em;">Bienvenida</span>
            <h2 class="app-header-title">${AppState.salon.name || 'Beauty Studio'}</h2>
          </div>
        </div>
        <button type="button" class="header-back-btn" onclick="navigateTo('panel')" title="Panel del Dueño">
          ${Icons.lock}
        </button>
      </header>

      <div class="home-content">
        <!-- Buscador Rápido -->
        <div class="home-search-bar" onclick="navigateTo('services')">
          <span style="color: var(--text-muted); display: flex;">${Icons.search}</span>
          <span class="search-placeholder">Buscar servicios o tratamientos...</span>
          <div class="search-btn-icon">${Icons.scissors}</div>
        </div>

        <!-- Banner Promocional con Foto y Letras Integradas (Estilo pasted.png) -->
        <div class="promo-banner-card" onclick="navigateTo('services')">
          <div class="promo-banner-text">
            <span class="promo-badge">${AppState.salon.bannerBadge || 'Promoción'}</span>
            <h3 class="promo-title">${AppState.salon.bannerTitle || '20% OFF en Servicios'}</h3>
            <p class="promo-subtitle">${AppState.salon.bannerSubtitle || 'Válido agendando tu turno online'}</p>
            <button type="button" class="promo-btn">
              <span>Agendar Ahora</span>
              <span>→</span>
            </button>
          </div>
          <div class="promo-banner-media">
            <img src="${AppState.salon.bannerImage || './assets/service-hair-balayage.jpg'}" alt="Promoción" class="promo-img" onerror="this.src='./assets/studio-nails.jpg'" />
          </div>
        </div>

        <!-- Próximo Turno o Estado de Reserva -->
        <div class="next-appointment-card">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span class="card-badge ${hasAppt ? 'confirmed' : ''}">
              ${hasAppt ? 'Turno en Proceso' : 'Tu Espacio de Belleza'}
            </span>
            <span style="font-size: 11px; color: var(--text-muted); font-weight: 600;">
              ${AppState.salon.address ? AppState.salon.address : 'Atención con Cita'}
            </span>
          </div>
          <h3 style="font-size: 15px; font-weight: 700; margin-top: 6px;">
            ${hasAppt && currentService ? currentService.name : '¿Lista para renovar tus uñas o peinado?'}
          </h3>
          <p style="font-size: 12px; color: var(--text-muted); margin-top: 3px;">
            ${hasAppt ? 'Tu servicio está preseleccionado. Elegí fecha y hora para confirmarlo.' : 'Elegí el diseño que más te guste de nuestro catálogo.'}
          </p>
          <button type="button" class="btn-book-service" style="margin-top: 12px; width: 100%;" onclick="navigateTo(hasAppt ? 'booking' : 'services')">
            ${hasAppt ? 'Continuar Mi Turno →' : 'Ver Catálogo y Agendar'}
          </button>
        </div>

        <!-- Servicios Populares (Horizontal Scroll estilo pasted.png) -->
        ${
          popularServices.length > 0
            ? `
          <div class="section-header-row">
            <h3>Servicios Populares</h3>
            <span class="see-all-link" onclick="navigateTo('services')">Ver todos (${activeServices.length})</span>
          </div>
          <div class="popular-services-row">
            ${popularServices
              .map((s) => {
                const cat = AppState.categories.find((c) => c.id === s.categoryId);
                return `
                <div class="popular-service-pill-card" onclick="window.selectServiceAndBook('${s.id}')">
                  <img src="${s.image || './assets/studio-nails.jpg'}" alt="${s.name}" class="popular-srv-img" onerror="this.src='./assets/studio-nails.jpg'" />
                  <div class="popular-srv-info">
                    <h4>${s.name}</h4>
                    <span class="cat-label">${cat ? cat.name : 'Servicio'} • ${s.duration || 60}m</span>
                    <div class="popular-srv-foot">
                      <span class="price-tag">$${Number(s.price || 0).toLocaleString('es-AR')}</span>
                      <button type="button" class="btn-pill-book">Reservar</button>
                    </div>
                  </div>
                </div>
              `;
              })
              .join('')}
          </div>
        `
            : ''
        }

        <!-- Accesos directos -->
        <div class="quick-actions-grid">
          <div class="quick-action-tile" onclick="navigateTo('services')">
            <div class="tile-icon">${Icons.scissors}</div>
            <strong>Todos los Trabajos</strong>
            <span>${AppState.services.length} servicios en catálogo</span>
          </div>
          <div class="quick-action-tile" onclick="navigateTo('inspo')">
            <div class="tile-icon">${Icons.sparkles}</div>
            <strong>Inspiración & Fotos</strong>
            <span>${AppState.inspo.length} fotos reales</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ----------------------------------------------------------------------------
// PANTALLA 3: SERVICIOS & PRECIOS (CATÁLOGO CLIENTA CON FOTOS INTEGRADAS)
// ----------------------------------------------------------------------------
function renderServices() {
  const categories = AppState.categories || [];
  const allServices = AppState.services || [];
  const activeCat = AppState.activeCategoryFilter;
  const searchQ = (AppState.serviceSearchQuery || '').toLowerCase();

  // Filtrar solo los servicios activos para la clienta
  const filteredServices = allServices.filter((s) => {
    if (s.active === false) return false;
    if (activeCat !== 'all' && s.categoryId !== activeCat) return false;
    if (searchQ && !s.name.toLowerCase().includes(searchQ)) return false;
    return true;
  });

  return `
    <div class="screen-viewport">
      <header class="app-header">
        <div class="app-header-left">
          <button type="button" class="header-back-btn" onclick="navigateTo('home')">${Icons.chevronLeft}</button>
          <div>
            <h2 class="app-header-title">Nuestros Servicios</h2>
            <p style="font-size: 11px; color: var(--text-muted);">Elegí el tratamiento perfecto para vos</p>
          </div>
        </div>
      </header>

      <!-- Buscador en tiempo real -->
      <div style="padding: 0 18px 10px;">
        <div class="home-search-bar" style="cursor: text;">
          <span style="color: var(--text-muted); display: flex;">${Icons.search}</span>
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value="${AppState.serviceSearchQuery || ''}"
            style="border: none; background: transparent; font-family: inherit; font-size: 13px; width: 100%; outline: none; color: var(--text-main);"
            oninput="window.handleSearchServices(this.value)"
          />
          ${
            AppState.serviceSearchQuery
              ? `<button type="button" onclick="window.handleSearchServices('')" style="background: none; border: none; font-size: 16px; color: var(--text-muted); cursor: pointer;">×</button>`
              : ''
          }
        </div>
      </div>

      <!-- Pestañas de Categorías -->
      <div class="categories-filter-strip">
        <button class="cat-filter-chip ${activeCat === 'all' ? 'active' : ''}" onclick="window.filterCategory('all')">
          Todos (${allServices.filter((s) => s.active !== false).length})
        </button>
        ${categories
          .map(
            (c) => `
          <button class="cat-filter-chip ${activeCat === c.id ? 'active' : ''}" onclick="window.filterCategory('${c.id}')">
            ${c.name}
          </button>
        `
          )
          .join('')}
      </div>

      <!-- Lista de Servicios con Fotos Integradas -->
      <div class="services-list">
        ${
          filteredServices.length === 0
            ? `
          <div style="text-align: center; padding: 50px 20px; color: var(--text-muted);">
            <div style="width: 52px; height: 52px; margin: 0 auto 14px; border-radius: 50%; background: var(--accent-soft); display: flex; align-items: center; justify-content: center; color: var(--accent-primary);">
              ${Icons.scissors}
            </div>
            <p style="font-size: 15px; font-weight: 700; color: var(--text-main);">Aún no hay servicios disponibles.</p>
            <p style="font-size: 12.5px; margin-top: 6px;">Podés agregar categorías y trabajos desde la pestaña <strong>Panel</strong>.</p>
          </div>
        `
            : filteredServices
                .map((s) => {
                  const cat = categories.find((c) => c.id === s.categoryId);
                  return `
            <div class="service-card">
              <img src="${s.image || './assets/studio-nails.jpg'}" alt="${s.name}" class="service-card-photo" onerror="this.src='./assets/studio-nails.jpg'" />
              <div class="service-card-body">
                <h3>${s.name}</h3>
                <div class="service-meta">
                  <span class="duration-badge">⏱️ ${s.duration || 60}m</span>
                  <span style="font-size: 11px; color: var(--text-muted);">${cat ? cat.name : 'Servicio'}</span>
                  <span class="service-price">$${Number(s.price || 0).toLocaleString('es-AR')}</span>
                </div>
              </div>
              <button type="button" class="btn-book-service" onclick="window.selectServiceAndBook('${s.id}')">
                Reservar
              </button>
            </div>
          `;
                })
                .join('')
        }
      </div>
    </div>
  `;
}

window.handleSearchServices = (val) => {
  AppState.serviceSearchQuery = val;
  renderApp();
};

window.filterCategory = (catId) => {
  AppState.activeCategoryFilter = catId;
  renderApp();
};

window.selectServiceAndBook = (serviceId) => {
  AppState.bookingDraft.serviceId = serviceId;
  const srv = AppState.services.find((s) => s.id === serviceId);
  showToast(`💅 Trabajo seleccionado: ${srv ? srv.name : ''}`);
  navigateTo('booking');
};

// ----------------------------------------------------------------------------
// PANTALLA 4: INSPO (MURO DE DISEÑOS CON LETRAS INTEGRADAS)
// ----------------------------------------------------------------------------
function renderInspo() {
  const inspoList = AppState.inspo || [];

  return `
    <div class="screen-viewport">
      <header class="app-header">
        <div class="app-header-left">
          <button type="button" class="header-back-btn" onclick="navigateTo('home')">${Icons.chevronLeft}</button>
          <h2 class="app-header-title">Galería & Diseños</h2>
        </div>
      </header>

      <div style="padding: 0 18px 12px;">
        <p style="font-size: 12.5px; color: var(--text-muted);">
          Tocá cualquier diseño para seleccionarlo al agendar tu turno:
        </p>
      </div>

      <div class="inspo-grid">
        ${
          inspoList.length === 0
            ? '<p style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 40px;">Aún no hay fotos en el muro.</p>'
            : inspoList
                .map(
                  (item) => `
            <div class="inspo-card" onclick="window.selectInspoAndBook('${item.id}', '${item.title}')">
              <img src="${item.image}" alt="${item.title}" class="inspo-card-img" onerror="this.src='./assets/studio-nails.jpg'" />
              <div class="inspo-card-gradient">
                <span class="inspo-card-title">${item.title}</span>
                <span class="inspo-card-cat">${item.category}</span>
                <span class="inspo-card-cta">+ Elegir este diseño</span>
              </div>
            </div>
          `
                )
                .join('')
        }
      </div>
    </div>
  `;
}

window.selectInspoAndBook = (inspoId, title) => {
  AppState.bookingDraft.inspoId = inspoId;
  showToast(`✨ Diseño seleccionado: ${title}`);
  navigateTo('services');
};

// ----------------------------------------------------------------------------
// PANTALLA 5: MI TURNO (PROCESO DE RESERVA NATIVO - PASO 3)
// ----------------------------------------------------------------------------
function renderBooking() {
  const selectedService = AppState.services.find((s) => s.id === AppState.bookingDraft.serviceId);
  const depositPercent = AppState.salon.depositPercent || 50;
  const depositAmount = selectedService
    ? selectedService.deposit || Math.round((selectedService.price * depositPercent) / 100)
    : 0;

  const upcomingDays = getUpcomingDays(10);
  if (!AppState.bookingDate) {
    AppState.bookingDate = upcomingDays[0].dateStr;
  }

  return `
    <div class="screen-viewport">
      <header class="app-header">
        <div class="app-header-left">
          <button type="button" class="header-back-btn" onclick="navigateTo('services')">${Icons.chevronLeft}</button>
          <div>
            <h2 class="app-header-title">Mi Turno</h2>
            <p style="font-size: 11px; color: var(--text-muted);">Completá tu reserva en simples pasos</p>
          </div>
        </div>
      </header>

      <div class="booking-flow-container">
        <!-- Paso 1: Servicio Seleccionado -->
        <div class="step-box">
          <div class="step-title">1. Trabajo a Realizar</div>
          ${
            selectedService
              ? `
            <div class="selected-service-summary">
              <div style="display: flex; align-items: center; gap: 10px;">
                <img src="${selectedService.image || './assets/studio-nails.jpg'}" alt="${selectedService.name}" style="width: 44px; height: 44px; border-radius: 10px; object-fit: cover;" onerror="this.src='./assets/studio-nails.jpg'" />
                <div>
                  <strong>${selectedService.name}</strong>
                  <p style="font-size: 11.5px; color: var(--text-muted); margin-top: 1px;">
                    ⏱️ ${selectedService.duration || 60} min • $${Number(selectedService.price).toLocaleString('es-AR')}
                  </p>
                </div>
              </div>
              <button type="button" class="btn-secondary-action" style="padding: 6px 10px; font-size: 11px;" onclick="navigateTo('services')">
                Cambiar
              </button>
            </div>
          `
              : `
            <div style="text-align: center; padding: 16px 0;">
              <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 10px;">No tenés un trabajo seleccionado todavía.</p>
              <button type="button" class="btn-book-service" onclick="navigateTo('services')">Ver Catálogo y Elegir Trabajo</button>
            </div>
          `
          }
        </div>

        <!-- Paso 2: Día y Horario -->
        <div class="step-box">
          <div class="step-title">2. Elegí Fecha y Horario Disponible</div>
          <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 8px;">Días disponibles en tiempo real con la agenda del salón:</p>
          
          <!-- Selector horizontal de días reales -->
          <div class="dates-scroll-container">
            ${upcomingDays
              .map(
                (d) => `
              <div class="calendar-day-card ${AppState.bookingDate === d.dateStr ? 'active' : ''}" onclick="window.selectBookingDate('${d.dateStr}')">
                <span class="cal-weekday">${d.weekday}</span>
                <span class="cal-day-num">${d.dayNum}</span>
                <span class="cal-month">${d.month}</span>
              </div>
            `
              )
              .join('')}
          </div>

          <div style="margin-top: 12px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
              <span style="font-size: 12px; font-weight: 700; color: var(--text-main);">Horarios para ${formatDateDisplay(AppState.bookingDate)}:</span>
              <span style="font-size: 11px; color: var(--accent-primary); font-weight: 700;">${AppState.bookingSlot ? `${AppState.bookingSlot} hs seleccionado` : 'Tocá un horario'}</span>
            </div>

            <!-- Grilla interactiva de horarios libres / ocupados -->
            <div class="slots-interactive-grid">
              ${SALON_SLOTS.map((slot) => {
                const occupied = isSlotOccupied(AppState.bookingDate, slot);
                const isSelected = AppState.bookingSlot === slot;

                if (occupied) {
                  return `
                    <button type="button" class="slot-btn occupied" disabled title="Horario ya reservado">
                      <span>${slot}</span>
                      <span style="font-size: 9px; font-weight: 800;">Ocupado</span>
                    </button>
                  `;
                }

                return `
                  <button type="button" class="slot-btn ${isSelected ? 'active' : ''}" onclick="window.selectBookingSlot('${slot}')">
                    <span>${slot}</span>
                    <span style="font-size: 9.5px; opacity: 0.85;">Disponible</span>
                  </button>
                `;
              }).join('')}
            </div>
          </div>
        </div>

        <!-- Paso 3: Datos de la Clienta -->
        <div class="step-box">
          <div class="step-title">3. Tus Datos de Contacto</div>
          <p style="font-size: 11.5px; color: var(--text-muted); margin-bottom: 10px;">Completá tus datos para que la dueña te guarde en su agenda:</p>
          <div class="form-group-clean">
            <label>Tu Nombre y Apellido</label>
            <input type="text" placeholder="Ej: Valentina Gómez" id="client-name-input" value="${AppState.bookingDraft.clientName || ''}" oninput="AppState.bookingDraft.clientName=this.value" />
          </div>
          <div class="form-group-clean">
            <label>Tu Teléfono / WhatsApp</label>
            <input type="tel" placeholder="Ej: 11 2345 6789" id="client-phone-input" value="${AppState.bookingDraft.clientPhone || ''}" oninput="AppState.bookingDraft.clientPhone=this.value" />
          </div>
        </div>

        <!-- Paso 4: Seña y WhatsApp -->
        <div class="step-box">
          <div class="step-title">4. Seña del ${depositPercent}% y Confirmación</div>
          <div class="deposit-info-box">
            <span style="font-size: 10px; font-weight: 800; color: var(--accent-dark); letter-spacing: 0.08em; text-transform: uppercase;">
              Monto de Seña para congelar tu turno
            </span>
            <div class="deposit-amount-highlight">$${Number(depositAmount).toLocaleString('es-AR')}</div>
            <p style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">
              Transferí al siguiente Alias de Mercado Pago / Banco:
            </p>
            <div class="alias-copy-row">
              <div class="alias-box">${AppState.salon.alias || 'TU.ALIAS.MP'}</div>
              <button type="button" class="btn-copy-alias" onclick="window.copyAlias()">Copiar</button>
            </div>
            ${AppState.salon.aliasHolder ? `<p style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">Titular: <strong>${AppState.salon.aliasHolder}</strong></p>` : ''}
          </div>

          <button type="button" class="btn-confirm-whatsapp" onclick="window.confirmBookingWhatsapp()">
            <span>${Icons.whatsapp}</span>
            <span>Confirmar y Enviar Turno por WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  `;
}

// ----------------------------------------------------------------------------
// PANTALLA 6: PANEL DEL DUEÑO (MINIMALISTA MODERNO - ACCESO Y SUBVISTAS)
// ----------------------------------------------------------------------------
function renderPanel() {
  // Si no está desbloqueado, mostrar pantalla de PIN
  if (!AppState.isOwnerUnlocked) {
    const isFirstTime = !AppState.salon.pin;
    return `
      <div class="screen-viewport no-bottom-bar pin-lock-screen">
        <div class="pin-shield-icon">${Icons.lock}</div>
        <h2 style="font-size: 20px; font-weight: 800; color: var(--text-main);">
          ${isFirstTime ? 'Creá tu PIN de Seguridad' : 'Acceso al Panel del Dueño'}
        </h2>
        <p style="font-size: 13px; color: var(--text-muted); margin-top: 4px;">
          ${isFirstTime ? 'Ingresá 4 dígitos numéricos para proteger la gestión de tu salón:' : 'Ingresá tu PIN de 4 dígitos para continuar:'}
        </p>

        <!-- Indicador de 4 dígitos -->
        <div class="pin-dots-row">
          <div class="pin-dot ${AppState.pinDraft.length >= 1 ? 'filled' : ''}"></div>
          <div class="pin-dot ${AppState.pinDraft.length >= 2 ? 'filled' : ''}"></div>
          <div class="pin-dot ${AppState.pinDraft.length >= 3 ? 'filled' : ''}"></div>
          <div class="pin-dot ${AppState.pinDraft.length >= 4 ? 'filled' : ''}"></div>
        </div>

        ${AppState.pinError ? `<p style="color: #dc2626; font-size: 12px; font-weight: 700; margin-bottom: 16px;">${AppState.pinError}</p>` : ''}

        <!-- Teclado Numérico Grande -->
        <div class="pin-keypad">
          <button type="button" class="pin-key" onclick="handlePinKey('1')">1</button>
          <button type="button" class="pin-key" onclick="handlePinKey('2')">2</button>
          <button type="button" class="pin-key" onclick="handlePinKey('3')">3</button>
          <button type="button" class="pin-key" onclick="handlePinKey('4')">4</button>
          <button type="button" class="pin-key" onclick="handlePinKey('5')">5</button>
          <button type="button" class="pin-key" onclick="handlePinKey('6')">6</button>
          <button type="button" class="pin-key" onclick="handlePinKey('7')">7</button>
          <button type="button" class="pin-key" onclick="handlePinKey('8')">8</button>
          <button type="button" class="pin-key" onclick="handlePinKey('9')">9</button>
          <button type="button" class="pin-key action" onclick="navigateTo('home')">Volver</button>
          <button type="button" class="pin-key" onclick="handlePinKey('0')">0</button>
          <button type="button" class="pin-key action" onclick="handlePinDelete()">Borrar</button>
        </div>
      </div>
    `;
  }

  // Rutas de subpantallas internas del panel
  if (AppState.panelSubView === 'agenda') {
    return renderPanelAgenda();
  }
  if (AppState.panelSubView === 'clients') {
    return renderPanelClients();
  }
  if (AppState.panelSubView === 'services') {
    return renderPanelServices();
  }
  if (AppState.panelSubView === 'finances') {
    return renderPanelFinances();
  }
  if (AppState.panelSubView === 'salon') {
    return renderPanelSalon();
  }
  if (AppState.panelSubView === 'photos') {
    return renderPanelPhotos();
  }

  // Menú Principal del Panel (6 Tarjetas Grandes + Barra de Color en Vivo)
  const currentTheme = AppState.salon.themeColor || 'rose';
  const todayStr = getTodayDateStr();
  const todayCount = (AppState.appointments || []).filter(
    (a) => a.date === todayStr && a.status !== 'cancelled'
  ).length;

  return `
    <div class="screen-viewport">
      <header class="app-header">
        <div class="app-header-left">
          <h2 class="app-header-title">Panel del Dueño</h2>
        </div>
        <div style="display: flex; gap: 8px;">
          <button type="button" class="btn-danger-action" onclick="window.lockOwnerPanel()">
            Cerrar Sesión
          </button>
        </div>
      </header>

      <!-- Selector Rápido de Paleta de Color Minimalista (Petición explícita del usuario) -->
      <div class="palette-switcher-card">
        <div>
          <span class="palette-title">🎨 PALETA DEL SALÓN</span>
          <div style="font-size: 11px; font-weight: 700; color: var(--text-main); margin-top: 1px;">
            ${getPaletteName(currentTheme)}
          </div>
        </div>
        <div class="palette-swatches-row">
          <button type="button" class="palette-swatch-btn ${currentTheme === 'rose' ? 'active' : ''}" style="background: #e07a82;" onclick="window.selectThemePalette('rose')" title="Blush Rose (Referencia)"></button>
          <button type="button" class="palette-swatch-btn ${currentTheme === 'nude' ? 'active' : ''}" style="background: #c2856e;" onclick="window.selectThemePalette('nude')" title="Nude Bronze"></button>
          <button type="button" class="palette-swatch-btn ${currentTheme === 'champagne' ? 'active' : ''}" style="background: #c59b27;" onclick="window.selectThemePalette('champagne')" title="Champagne Gold"></button>
          <button type="button" class="palette-swatch-btn ${currentTheme === 'sage' ? 'active' : ''}" style="background: #527560;" onclick="window.selectThemePalette('sage')" title="Olive Sage"></button>
          <button type="button" class="palette-swatch-btn ${currentTheme === 'noir' ? 'active' : ''}" style="background: #18181b;" onclick="window.selectThemePalette('noir')" title="Noir Minimal"></button>
        </div>
      </div>

      <div style="padding: 0 18px 10px;">
        <span style="font-size: 11px; font-weight: 800; color: var(--accent-dark); letter-spacing: 0.08em; text-transform: uppercase;">
          Gestión Integral • ${AppState.salon.name || 'tu Salón'}
        </span>
      </div>

      <!-- 6 Tarjetas Grandes del Panel -->
      <div class="owner-dashboard-grid">
        <!-- 1. Agenda -->
        <div class="owner-big-card" onclick="window.openPanelSubView('agenda')">
          <div class="big-card-icon" style="background: #e0f2fe; color: #0284c7;">${Icons.calendar}</div>
          <div>
            <h3>Agenda de Turnos</h3>
            <p>${todayCount} ${todayCount === 1 ? 'turno hoy' : 'turnos hoy'} • Horarios y WhatsApp</p>
          </div>
        </div>

        <!-- 2. Clientas -->
        <div class="owner-big-card" onclick="window.openPanelSubView('clients')">
          <div class="big-card-icon" style="background: #fdf2f8; color: #db2777;">${Icons.users}</div>
          <div>
            <h3>Clientas</h3>
            <p>${(AppState.clients || []).length} fichas • Historial y gustos</p>
          </div>
        </div>

        <!-- 3. Servicios y Precios -->
        <div class="owner-big-card" onclick="window.openPanelSubView('services')">
          <div class="big-card-icon" style="background: var(--accent-soft); color: var(--accent-primary);">${Icons.scissors}</div>
          <div>
            <h3>Servicios & Precios</h3>
            <p>${AppState.services.length} trabajos • Categorías y señas</p>
          </div>
        </div>

        <!-- 4. Finanzas y Caja -->
        <div class="owner-big-card" onclick="window.openPanelSubView('finances')">
          <div class="big-card-icon" style="background: #dcfce7; color: #16a34a;">${Icons.dollar}</div>
          <div>
            <h3>Finanzas & Caja</h3>
            <p>Ingresos del día • Señas y balance</p>
          </div>
        </div>

        <!-- 5. Datos del Salón -->
        <div class="owner-big-card" onclick="window.openPanelSubView('salon')">
          <div class="big-card-icon" style="background: #fef3c7; color: #d97706;">${Icons.store}</div>
          <div>
            <h3>Datos del Salón</h3>
            <p>Nombre, horarios, Alias / CBU</p>
          </div>
        </div>

        <!-- 6. Fotos y Textos -->
        <div class="owner-big-card" onclick="window.openPanelSubView('photos')">
          <div class="big-card-icon" style="background: #ede9fe; color: #7c3aed;">${Icons.camera}</div>
          <div>
            <h3>Fotos & Textos</h3>
            <p>Portada, banner promo y galería</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ----------------------------------------------------------------------------
// SUBPANTALLA: 1. AGENDA DE TURNOS EN VIVO (PASO 3)
// ----------------------------------------------------------------------------
function renderPanelAgenda() {
  if (!AppState.agendaSelectedDate) {
    AppState.agendaSelectedDate = getTodayDateStr();
  }

  const selectedDate = AppState.agendaSelectedDate;
  const dayAppointments = (AppState.appointments || [])
    .filter((a) => a.date === selectedDate)
    .sort((a, b) => (a.slot || '').localeCompare(b.slot || ''));

  const todayCount = (AppState.appointments || []).filter(
    (a) => a.date === getTodayDateStr() && a.status !== 'cancelled'
  ).length;
  const confirmedCount = dayAppointments.filter((a) => a.status === 'confirmed').length;
  const pendingCount = dayAppointments.filter((a) => a.status === 'pending').length;
  const completedCount = dayAppointments.filter((a) => a.status === 'completed').length;

  const upcomingDays = getUpcomingDays(10);

  return `
    <div class="screen-viewport">
      <header class="app-header">
        <div class="app-header-left">
          <button type="button" class="header-back-btn" onclick="window.openPanelSubView('menu')">${Icons.chevronLeft}</button>
          <div>
            <h2 class="app-header-title">Agenda de Turnos</h2>
            <p style="font-size: 11px; color: var(--text-muted);">${formatDateDisplay(selectedDate)}</p>
          </div>
        </div>
        <button type="button" class="btn-primary-action" style="padding: 7px 12px; font-size: 11px;" onclick="window.handleToggleManualApptModal(true)">
          + Turno Manual
        </button>
      </header>

      <div class="panel-subview">
        <!-- Selector rápido de fechas -->
        <div class="dates-scroll-container">
          ${upcomingDays
            .map(
              (d) => `
            <div class="calendar-day-card ${selectedDate === d.dateStr ? 'active' : ''}" onclick="window.selectAgendaDate('${d.dateStr}')">
              <span class="cal-weekday">${d.weekday}</span>
              <span class="cal-day-num">${d.dayNum}</span>
              <span class="cal-month">${d.month}</span>
            </div>
          `
            )
            .join('')}
        </div>

        <!-- Barra de métricas del día -->
        <div class="agenda-metrics-strip">
          <div class="agenda-metrics-chip">
            <span>Hoy:</span>
            <strong>${todayCount}</strong>
          </div>
          <div class="agenda-metrics-chip">
            <span style="color: #16a34a;">Confirmados:</span>
            <strong style="color: #16a34a;">${confirmedCount}</strong>
          </div>
          <div class="agenda-metrics-chip">
            <span style="color: #d97706;">Pendientes:</span>
            <strong style="color: #d97706;">${pendingCount}</strong>
          </div>
          <div class="agenda-metrics-chip">
            <span style="color: #7c3aed;">Cumplidos:</span>
            <strong style="color: #7c3aed;">${completedCount}</strong>
          </div>
        </div>

        <!-- Selector de fecha nativo y botón bloquear -->
        <div style="display: flex; gap: 8px; align-items: center;">
          <input
            type="date"
            value="${selectedDate}"
            style="flex: 1; padding: 8px 12px; border: 1px solid rgba(0,0,0,0.1); border-radius: 10px; font-size: 12.5px; background: var(--card-bg); color: var(--text-main);"
            onchange="window.selectAgendaDate(this.value)"
          />
          <button type="button" class="btn-secondary-action" style="padding: 8px 12px; font-size: 11.5px; white-space: nowrap;" onclick="window.handleToggleBlockModal(true)">
            🚫 Bloquear Horario / Día
          </button>
        </div>

        <!-- Formulario Modal: + Turno Manual -->
        ${AppState.isManualApptOpen ? renderManualApptForm() : ''}

        <!-- Formulario Modal: Bloquear Horario / Día -->
        ${AppState.isBlockModalOpen ? renderBlockSlotForm() : ''}

        <!-- Lista de Turnos del Día -->
        <div style="display: flex; flex-direction: column; gap: 12px;">
          ${
            dayAppointments.length === 0
              ? `
            <div style="text-align: center; padding: 40px 20px; background: var(--card-bg); border-radius: 18px; border: 1px solid rgba(0,0,0,0.06);">
              <div style="width: 48px; height: 48px; margin: 0 auto 12px; border-radius: 50%; background: #e0f2fe; display: flex; align-items: center; justify-content: center; color: #0284c7;">
                ${Icons.calendar}
              </div>
              <h4 style="font-size: 15px; font-weight: 700; color: var(--text-main);">Sin turnos para este día</h4>
              <p style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">
                Cargá un turno que te llegó por teléfono con el botón <strong>"+ Turno Manual"</strong> o esperá reservas online.
              </p>
            </div>
          `
              : dayAppointments
                  .map((appt) => {
                    const statusClass = `status-${appt.status || 'pending'}`;
                    const isPaid = appt.depositPaid === true;

                    let statusLabel = 'Pendiente';
                    let badgeClass = 'status-badge-pending';
                    if (appt.status === 'confirmed') {
                      statusLabel = 'Confirmado';
                      badgeClass = 'status-badge-confirmed';
                    } else if (appt.status === 'completed') {
                      statusLabel = 'Cumplido';
                      badgeClass = 'status-badge-completed';
                    } else if (appt.status === 'cancelled') {
                      statusLabel = 'Cancelado';
                      badgeClass = 'status-badge-cancelled';
                    }

                    return `
              <div class="agenda-appt-card ${statusClass}">
                <div class="agenda-appt-top">
                  <div>
                    <span class="agenda-time-pill">${appt.slot} hs</span>
                    <span style="font-size: 11px; color: var(--text-muted); margin-left: 6px;">⏱️ ${appt.serviceDuration || 60}m</span>
                  </div>
                  <span class="agenda-status-pill ${badgeClass}">${statusLabel}</span>
                </div>

                <div>
                  <div class="agenda-client-name">
                    <span>${appt.clientName}</span>
                    ${
                      appt.clientPhone
                        ? `
                      <button type="button" style="background: none; border: none; color: #25d366; cursor: pointer; padding: 0;" onclick="window.sendClientWhatsAppReminder('${appt.id}')" title="Escribir por WhatsApp">
                        ${Icons.whatsapp}
                      </button>
                    `
                        : ''
                    }
                  </div>
                  <div class="agenda-service-detail">
                    <span>${appt.serviceName}</span>
                    <span>•</span>
                    <strong style="color: var(--text-main);">$${Number(appt.servicePrice || 0).toLocaleString('es-AR')}</strong>
                  </div>
                </div>

                <div class="agenda-deposit-row">
                  <div>
                    <span style="opacity: 0.8;">Seña:</span>
                    <strong>$${Number(appt.depositAmount || 0).toLocaleString('es-AR')}</strong>
                    <span style="color: ${isPaid ? '#16a34a' : '#d97706'}; font-weight: 800; margin-left: 4px;">
                      (${isPaid ? 'Recibida ✅' : 'Pendiente ⏳'})
                    </span>
                  </div>
                  <button type="button" class="btn-toggle-deposit" onclick="window.handleToggleApptDeposit('${appt.id}')">
                    ${isPaid ? 'Marcar Pendiente' : 'Marcar Recibida'}
                  </button>
                </div>

                <div class="agenda-actions-row">
                  ${
                    appt.status !== 'confirmed' && appt.status !== 'completed' && appt.status !== 'cancelled'
                      ? `
                    <button type="button" class="btn-agenda-action success" onclick="window.handleApptStatusChange('${appt.id}', 'confirmed')">
                      ✅ Confirmar
                    </button>
                  `
                      : ''
                  }
                  ${
                    appt.status !== 'completed' && appt.status !== 'cancelled'
                      ? `
                    <button type="button" class="btn-agenda-action" onclick="window.handleApptStatusChange('${appt.id}', 'completed')">
                      🏁 Cumplido
                    </button>
                  `
                      : ''
                  }
                  <button type="button" class="btn-agenda-action wa" onclick="window.sendClientWhatsAppReminder('${appt.id}')">
                    💬 WhatsApp
                  </button>
                  ${
                    appt.status !== 'cancelled'
                      ? `
                    <button type="button" class="btn-agenda-action danger" onclick="window.handleCancelAppt('${appt.id}', '${appt.clientName}')">
                      ✕ Cancelar
                    </button>
                  `
                      : ''
                  }
                </div>
              </div>
            `;
                  })
                  .join('')
          }
        </div>
      </div>
    </div>
  `;
}

function renderManualApptForm() {
  const services = AppState.services || [];
  const selectedDate = AppState.agendaSelectedDate;

  return `
    <form class="form-card" style="border: 1.5px solid var(--accent-primary);" onsubmit="window.handleSaveManualAppt(event)">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <h3>➕ Cargar Turno Manual</h3>
        <button type="button" style="background: none; border: none; font-size: 18px; cursor: pointer;" onclick="window.handleToggleManualApptModal(false)">×</button>
      </div>
      <p class="form-card-sub">Para clientas que te reservaron por llamada o en el local:</p>

      <div class="form-group-clean">
        <label>Nombre de la Clienta</label>
        <input type="text" id="manual-client-name" placeholder="Ej: Marcela Benítez" required />
      </div>

      <div class="form-group-clean">
        <label>Teléfono / WhatsApp</label>
        <input type="tel" id="manual-client-phone" placeholder="Ej: 11 9876 5432" required />
      </div>

      <div class="form-group-clean">
        <label>Servicio</label>
        <select id="manual-service-id" required>
          ${
            services.length === 0
              ? '<option value="">(No hay servicios creados aún)</option>'
              : services.map((s) => `<option value="${s.id}">${s.name} - $${Number(s.price).toLocaleString('es-AR')}</option>`).join('')
          }
        </select>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
        <div class="form-group-clean">
          <label>Fecha</label>
          <input type="date" id="manual-appt-date" value="${selectedDate}" required />
        </div>
        <div class="form-group-clean">
          <label>Horario</label>
          <select id="manual-appt-slot" required>
            ${SALON_SLOTS.map((s) => `<option value="${s}">${s} hs</option>`).join('')}
          </select>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 8px; margin: 8px 0 14px;">
        <input type="checkbox" id="manual-deposit-paid" style="width: 18px; height: 18px;" />
        <label for="manual-deposit-paid" style="font-size: 13px; font-weight: 600; cursor: pointer;">Seña del turno ya recibida / pagada</label>
      </div>

      <div style="display: flex; gap: 8px;">
        <button type="submit" class="btn-primary-action" style="flex: 1;">
          Guardar Turno en Agenda
        </button>
        <button type="button" class="btn-secondary-action" onclick="window.handleToggleManualApptModal(false)">
          Cancelar
        </button>
      </div>
    </form>
  `;
}

function renderBlockSlotForm() {
  const selectedDate = AppState.agendaSelectedDate;
  const blocks = AppState.blockedSlots || [];

  return `
    <form class="form-card" style="border: 1.5px solid #ef4444;" onsubmit="window.handleSaveBlockSlot(event)">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <h3 style="color: #dc2626;">🚫 Bloquear Día u Horario</h3>
        <button type="button" style="background: none; border: none; font-size: 18px; cursor: pointer;" onclick="window.handleToggleBlockModal(false)">×</button>
      </div>
      <p class="form-card-sub">Para días de descanso, vacaciones, feriados o ausencias:</p>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
        <div class="form-group-clean">
          <label>Fecha a Bloquear</label>
          <input type="date" id="block-date-input" value="${selectedDate}" required />
        </div>
        <div class="form-group-clean">
          <label>Franja Horaria</label>
          <select id="block-slot-input">
            <option value="all">Día Completo (Cerrado)</option>
            ${SALON_SLOTS.map((s) => `<option value="${s}">${s} hs</option>`).join('')}
          </select>
        </div>
      </div>

      <div style="display: flex; gap: 8px; margin-top: 6px;">
        <button type="submit" class="btn-primary-action" style="flex: 1; background: #dc2626; color: #fff;">
          Bloquear Horario
        </button>
        <button type="button" class="btn-secondary-action" onclick="window.handleToggleBlockModal(false)">
          Cerrar
        </button>
      </div>

      <!-- Lista de bloqueos activos -->
      ${
        blocks.length > 0
          ? `
        <div style="margin-top: 14px; border-top: 1px solid rgba(0,0,0,0.08); padding-top: 10px;">
          <label style="font-size: 11px; font-weight: 800; text-transform: uppercase;">Bloqueos Activos:</label>
          <div style="display: flex; flex-direction: column; gap: 6px; margin-top: 6px;">
            ${blocks
              .map(
                (b) => `
              <div style="display: flex; align-items: center; justify-content: space-between; background: #fee2e2; border-radius: 8px; padding: 6px 10px; font-size: 12px; color: #991b1b;">
                <span>📅 ${b.date} • ${b.allDay ? 'Día Completo' : `${b.slot} hs`}</span>
                <button type="button" style="background: none; border: none; color: #dc2626; font-weight: 800; cursor: pointer;" onclick="window.handleDeleteBlockSlot('${b.id}')">
                  Eliminar Bloqueo
                </button>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      `
          : ''
      }
    </form>
  `;
}

// ----------------------------------------------------------------------------
// CONTROLADORES DE AGENDA Y RESERVAS (PASO 3)
// ----------------------------------------------------------------------------
window.selectBookingDate = (dateStr) => {
  AppState.bookingDate = dateStr;
  AppState.bookingSlot = '';
  renderApp();
};

window.selectBookingSlot = (slot) => {
  AppState.bookingSlot = slot;
  renderApp();
};

window.selectAgendaDate = (dateStr) => {
  AppState.agendaSelectedDate = dateStr;
  renderApp();
};

window.handleToggleManualApptModal = (isOpen) => {
  AppState.isManualApptOpen = isOpen;
  renderApp();
};

window.handleToggleBlockModal = (isOpen) => {
  AppState.isBlockModalOpen = isOpen;
  renderApp();
};

window.handleSaveManualAppt = async (e) => {
  e.preventDefault();
  const name = document.getElementById('manual-client-name')?.value.trim();
  const phone = document.getElementById('manual-client-phone')?.value.trim();
  const serviceId = document.getElementById('manual-service-id')?.value;
  const date = document.getElementById('manual-appt-date')?.value;
  const slot = document.getElementById('manual-appt-slot')?.value;
  const depositPaid = document.getElementById('manual-deposit-paid')?.checked || false;

  if (!name || !phone || !serviceId || !date || !slot) {
    showToast('⚠️ Por favor completá todos los campos requeridos');
    return;
  }

  // Verificar si el turno ya está ocupado
  if (isSlotOccupied(date, slot)) {
    showToast('⚠️ Ese horario ya está ocupado o bloqueado');
    return;
  }

  const srv = (AppState.services || []).find((s) => s.id === serviceId);
  const srvName = srv ? srv.name : 'Servicio Manual';
  const srvPrice = srv ? Number(srv.price) || 0 : 0;
  const srvDuration = srv ? Number(srv.duration) || 60 : 60;
  const depositPercent = AppState.salon.depositPercent || 50;
  const depositAmount = srv ? (srv.deposit || Math.round((srvPrice * depositPercent) / 100)) : 0;

  const apptId = 'appt_' + Date.now();
  const newAppt = {
    id: apptId,
    clientId: '',
    clientName: name,
    clientPhone: phone,
    serviceId: serviceId,
    serviceName: srvName,
    servicePrice: srvPrice,
    serviceDuration: srvDuration,
    date: date,
    slot: slot,
    status: 'confirmed',
    depositAmount: depositAmount,
    depositPaid: depositPaid,
    createdAt: new Date().toISOString()
  };

  // Crear o actualizar ficha de clienta
  let client = (AppState.clients || []).find((c) => c.phone && c.phone === phone);
  if (!client) {
    client = {
      id: 'cli_' + Date.now(),
      name: name,
      phone: phone,
      notes: '',
      history: [],
      totalSpent: 0,
      createdAt: new Date().toISOString()
    };
  }
  client.history = client.history || [];
  client.history.push({
    apptId: apptId,
    serviceName: srvName,
    date: date,
    slot: slot,
    price: srvPrice
  });
  newAppt.clientId = client.id;

  await DataStore.set('appointments', apptId, newAppt);
  await DataStore.set('clients', client.id, client);

  AppState.appointments.push(newAppt);
  const clientIdx = (AppState.clients || []).findIndex((c) => c.id === client.id);
  if (clientIdx >= 0) {
    AppState.clients[clientIdx] = client;
  } else {
    AppState.clients.push(client);
  }

  AppState.isManualApptOpen = false;
  showToast('✅ Turno manual agendado con éxito');
  renderApp();
};

window.handleSaveBlockSlot = async (e) => {
  e.preventDefault();
  const date = document.getElementById('block-date-input')?.value;
  const slotVal = document.getElementById('block-slot-input')?.value;

  if (!date) {
    showToast('⚠️ Seleccioná una fecha para bloquear');
    return;
  }

  const blockId = 'blk_' + Date.now();
  const newBlock = {
    id: blockId,
    date: date,
    slot: slotVal === 'all' ? '' : slotVal,
    allDay: slotVal === 'all',
    createdAt: new Date().toISOString()
  };

  await DataStore.set('blockedSlots', blockId, newBlock);
  if (!AppState.blockedSlots) AppState.blockedSlots = [];
  AppState.blockedSlots.push(newBlock);

  showToast('🚫 Horario bloqueado correctamente');
  renderApp();
};

window.handleDeleteBlockSlot = async (blockId) => {
  await DataStore.delete('blockedSlots', blockId);
  AppState.blockedSlots = (AppState.blockedSlots || []).filter((b) => b.id !== blockId);
  showToast('✅ Bloqueo eliminado');
  renderApp();
};

window.handleApptStatusChange = async (apptId, newStatus) => {
  const appt = (AppState.appointments || []).find((a) => a.id === apptId);
  if (!appt) return;

  appt.status = newStatus;
  await DataStore.set('appointments', apptId, appt);

  const label = newStatus === 'confirmed' ? 'Confirmado' : newStatus === 'completed' ? 'Cumplido' : newStatus;
  showToast(`✅ Turno marcado como ${label}`);
  renderApp();
};

window.handleToggleApptDeposit = async (apptId) => {
  const appt = (AppState.appointments || []).find((a) => a.id === apptId);
  if (!appt) return;

  appt.depositPaid = !appt.depositPaid;
  await DataStore.set('appointments', apptId, appt);

  showToast(appt.depositPaid ? '✅ Seña marcada como Recibida' : '⏳ Seña marcada como Pendiente');
  renderApp();
};

window.handleCancelAppt = async (apptId, clientName) => {
  if (!window.confirm(`¿Estás segura de cancelar el turno de ${clientName}?`)) return;

  const appt = (AppState.appointments || []).find((a) => a.id === apptId);
  if (!appt) return;

  appt.status = 'cancelled';
  await DataStore.set('appointments', apptId, appt);

  showToast('✕ Turno cancelado');
  renderApp();
};

window.sendClientWhatsAppReminder = (apptId) => {
  const appt = (AppState.appointments || []).find((a) => a.id === apptId);
  if (!appt || !appt.clientPhone) {
    showToast('⚠️ Este turno no tiene teléfono registrado');
    return;
  }

  const cleanPhone = appt.clientPhone.replace(/\D/g, '');
  const text = `¡Hola ${appt.clientName}! Te escribimos de ${AppState.salon.name || 'tu Salón'} para recordarte tu turno:\n\n` +
    `✨ *Servicio:* ${appt.serviceName}\n` +
    `📅 *Fecha:* ${formatDateDisplay(appt.date)}\n` +
    `⏰ *Horario:* ${appt.slot} hs\n` +
    `📍 *Dirección:* ${AppState.salon.address || ''}\n\n` +
    `¡Por favor confirmános tu asistencia respondiendo a este mensaje!`;

  const url = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}` : `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
};

// ----------------------------------------------------------------------------
// SUBPANTALLA: 5. DATOS DEL SALÓN
// ----------------------------------------------------------------------------
function renderPanelSalon() {
  const salon = AppState.salon;

  return `
    <div class="screen-viewport">
      <header class="app-header">
        <div class="app-header-left">
          <button type="button" class="header-back-btn" onclick="window.openPanelSubView('menu')">${Icons.chevronLeft}</button>
          <h2 class="app-header-title">Datos del Salón</h2>
        </div>
      </header>

      <div class="panel-subview">
        <form class="form-card" onsubmit="window.handleSaveSalonData(event)">
          <h3>Información General</h3>
          <p class="form-card-sub">Estos datos se reflejan de inmediato en la pantalla de la clienta:</p>

          <div class="form-group-clean">
            <label>Nombre del Salón</label>
            <input type="text" id="salon-name-input" value="${salon.name || ''}" placeholder="Ej: Studio Chic & Nails" required />
          </div>

          <div class="form-group-clean">
            <label>Eslogan o Subtítulo</label>
            <input type="text" id="salon-tagline-input" value="${salon.tagline || ''}" placeholder="Ej: Estética de uñas y peluquería profesional" />
          </div>

          <div class="form-group-clean">
            <label>Dirección del Local</label>
            <input type="text" id="salon-address-input" value="${salon.address || ''}" placeholder="Ej: Av. Santa Fe 1234, Local 4" />
          </div>

          <div class="form-group-clean">
            <label>Teléfono de WhatsApp (con código de país, sin + ni espacios)</label>
            <input type="tel" id="salon-phone-input" value="${salon.phone || ''}" placeholder="Ej: 5491123456789" />
          </div>

          <h3 style="margin-top: 18px;">Cobro de Seña</h3>
          <p class="form-card-sub">Datos bancarios para que la clienta congele su turno:</p>

          <div class="form-group-clean">
            <label>Alias de Mercado Pago o Banco</label>
            <input type="text" id="salon-alias-input" value="${salon.alias || ''}" placeholder="Ej: SALON.MP" />
          </div>

          <div class="form-group-clean">
            <label>Nombre del Titular de la Cuenta</label>
            <input type="text" id="salon-alias-holder-input" value="${salon.aliasHolder || ''}" placeholder="Ej: María Pérez" />
          </div>

          <div class="form-group-clean">
            <label>Porcentaje de Seña por Defecto (%)</label>
            <input type="number" id="salon-deposit-input" value="${salon.depositPercent || 50}" min="0" max="100" />
          </div>

          <button type="submit" class="btn-primary-action" style="width: 100%; margin-top: 10px;">
            Guardar Cambios del Salón
          </button>
        </form>
      </div>
    </div>
  `;
}

window.selectThemePalette = (theme) => {
  applyTheme(theme);
  AppState.salon.themeColor = theme;
  DataStore.set('salon', 'config', AppState.salon);
  showToast(`🎨 Color actualizado: ${getPaletteName(theme)}`);
  renderApp();
};

window.handleSaveSalonData = async (e) => {
  e.preventDefault();
  const name = document.getElementById('salon-name-input')?.value.trim();
  const tagline = document.getElementById('salon-tagline-input')?.value.trim();
  const address = document.getElementById('salon-address-input')?.value.trim();
  const phone = document.getElementById('salon-phone-input')?.value.trim();
  const alias = document.getElementById('salon-alias-input')?.value.trim();
  const aliasHolder = document.getElementById('salon-alias-holder-input')?.value.trim();
  const depositPercent = Number(document.getElementById('salon-deposit-input')?.value) || 50;

  AppState.salon = {
    ...AppState.salon,
    name,
    tagline,
    address,
    phone,
    alias,
    aliasHolder,
    depositPercent
  };

  await DataStore.set('salon', 'config', AppState.salon);
  showToast('✅ Datos del salón guardados exitosamente');
  window.openPanelSubView('menu');
};

// ----------------------------------------------------------------------------
// SUBPANTALLA: 3. SERVICIOS Y PRECIOS (GESTIÓN DE CATEGORÍAS Y TRABAJOS)
// ----------------------------------------------------------------------------
function renderPanelServices() {
  const categories = AppState.categories || [];
  const services = AppState.services || [];
  const editingService = services.find((s) => s.id === AppState.editingServiceId);

  return `
    <div class="screen-viewport">
      <header class="app-header">
        <div class="app-header-left">
          <button type="button" class="header-back-btn" onclick="window.openPanelSubView('menu')">${Icons.chevronLeft}</button>
          <h2 class="app-header-title">Servicios & Precios</h2>
        </div>
      </header>

      <div class="panel-subview">
        <!-- SECCIÓN 1: CATEGORÍAS -->
        <div class="form-card">
          <h3>Categorías de Trabajos</h3>
          <p class="form-card-sub">Creá las pestañas que verán tus clientas (ej: Uñas, Peluquería, Pestañas):</p>

          <div style="display: flex; gap: 8px;">
            <input type="text" id="new-category-input" placeholder="Nombre de categoría..." style="flex: 1; padding: 10px 14px; border: 1px solid rgba(0,0,0,0.1); border-radius: 10px; font-size: 13px;" />
            <button type="button" class="btn-primary-action" style="padding: 10px 14px; white-space: nowrap;" onclick="window.handleCreateCategory()">
              + Agregar
            </button>
          </div>

          <div class="category-manager-list">
            ${
              categories.length === 0
                ? '<p style="font-size: 12px; color: var(--text-muted);">Sin categorías aún. Agregá la primera arriba (ej: Uñas, Peluquería).</p>'
                : categories
                    .map(
                      (c) => `
                <div class="category-manager-pill">
                  <span>${c.name}</span>
                  <button type="button" class="category-del-btn" onclick="window.handleDeleteCategory('${c.id}', '${c.name}')" title="Eliminar categoría">
                    ×
                  </button>
                </div>
              `
                    )
                    .join('')
            }
          </div>
        </div>

        <!-- SECCIÓN 2: FORMULARIO AGREGAR / EDITAR TRABAJO -->
        <form class="form-card" onsubmit="window.handleSaveService(event)">
          <h3>${editingService ? '✏️ Editar Trabajo' : '➕ Nuevo Trabajo / Servicio'}</h3>
          <p class="form-card-sub">Completá los datos del servicio para publicarlo en la app:</p>

          <div class="form-group-clean">
            <label>Nombre del Servicio</label>
            <input type="text" id="srv-name-input" value="${editingService ? editingService.name : ''}" placeholder="Ej: Kapping Gel con Diseño" required />
          </div>

          <div class="form-group-clean">
            <label>Categoría</label>
            <select id="srv-category-input" required>
              ${
                categories.length === 0
                  ? '<option value="">(Creá primero una categoría arriba)</option>'
                  : categories
                      .map(
                        (c) => `
                    <option value="${c.id}" ${editingService && editingService.categoryId === c.id ? 'selected' : ''}>
                      ${c.name}
                    </option>
                  `
                      )
                      .join('')
              }
            </select>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div class="form-group-clean">
              <label>Precio Final ($)</label>
              <input type="number" id="srv-price-input" value="${editingService ? editingService.price : ''}" placeholder="Ej: 25000" required />
            </div>

            <div class="form-group-clean">
              <label>Duración</label>
              <select id="srv-duration-input">
                <option value="30" ${editingService && editingService.duration == 30 ? 'selected' : ''}>30 min</option>
                <option value="45" ${editingService && editingService.duration == 45 ? 'selected' : ''}>45 min</option>
                <option value="60" ${!editingService || editingService.duration == 60 ? 'selected' : ''}>60 min (1 h)</option>
                <option value="90" ${editingService && editingService.duration == 90 ? 'selected' : ''}>90 min (1:30 h)</option>
                <option value="120" ${editingService && editingService.duration == 120 ? 'selected' : ''}>120 min (2 h)</option>
              </select>
            </div>
          </div>

          <div class="form-group-clean">
            <label>Monto de Seña ($ - opcional)</label>
            <input type="number" id="srv-deposit-input" value="${editingService && editingService.deposit ? editingService.deposit : ''}" placeholder="Dejar vacío para calcular el % del salón" />
          </div>

          <div class="form-group-clean">
            <label>Foto del Trabajo</label>
            <input type="file" id="service-file-picker" accept="image/*" style="display: none;" onchange="window.handleUploadServicePhoto(event)" />
            <button type="button" class="btn-upload-file" onclick="document.getElementById('service-file-picker').click()">
              <span>📷</span>
              <span>Subir Foto del Trabajo desde Celular</span>
            </button>
            <input type="text" id="srv-image-input" value="${editingService && editingService.image ? editingService.image : './assets/studio-nails.jpg'}" style="margin-top: 6px;" />

            <!-- Chips de fotos rápidas -->
            <div class="photo-preset-chips">
              <div class="photo-preset-chip" onclick="window.pickServicePhoto('./assets/inspo-rose-french.jpg')">
                <img src="./assets/inspo-rose-french.jpg" class="photo-preset-thumb" />
                <span>Francesitas</span>
              </div>
              <div class="photo-preset-chip" onclick="window.pickServicePhoto('./assets/studio-nails.jpg')">
                <img src="./assets/studio-nails.jpg" class="photo-preset-thumb" />
                <span>Esculpidas</span>
              </div>
              <div class="photo-preset-chip" onclick="window.pickServicePhoto('./assets/service-hair-balayage.jpg')">
                <img src="./assets/service-hair-balayage.jpg" class="photo-preset-thumb" />
                <span>Balayage</span>
              </div>
              <div class="photo-preset-chip" onclick="window.pickServicePhoto('./assets/service-hair-cut.jpg')">
                <img src="./assets/service-hair-cut.jpg" class="photo-preset-thumb" />
                <span>Corte Cabello</span>
              </div>
              <div class="photo-preset-chip" onclick="window.pickServicePhoto('./assets/inspo-black-gold.jpg')">
                <img src="./assets/inspo-black-gold.jpg" class="photo-preset-thumb" />
                <span>Nail Glam</span>
              </div>
            </div>
          </div>

          <div style="display: flex; gap: 8px;">
            <button type="submit" class="btn-primary-action" style="flex: 1;">
              ${editingService ? 'Actualizar Trabajo' : 'Guardar y Publicar Trabajo'}
            </button>
            ${
              editingService
                ? `
              <button type="button" class="btn-secondary-action" onclick="window.cancelEditService()">
                Cancelar
              </button>
            `
                : ''
            }
          </div>
        </form>

        <!-- SECCIÓN 3: LISTA DE TRABAJOS CARGADOS -->
        <div class="form-card">
          <h3>Trabajos del Catálogo (${services.length})</h3>
          <p class="form-card-sub">Podés pausar un servicio para ocultarlo temporalmente, editarlo o borrarlo:</p>

          <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 6px;">
            ${
              services.length === 0
                ? '<p style="font-size: 13px; color: var(--text-muted); text-align: center; padding: 20px;">Aún no cargaste servicios. Usá el formulario arriba.</p>'
                : services
                    .map((s) => {
                      const cat = categories.find((c) => c.id === s.categoryId);
                      const isActive = s.active !== false;

                      return `
                  <div class="panel-service-item">
                    <div class="panel-service-left">
                      <img src="${s.image || './assets/studio-nails.jpg'}" alt="${s.name}" class="panel-service-photo" onerror="this.src='./assets/studio-nails.jpg'" />
                      <div class="panel-service-info">
                        <h4>${s.name}</h4>
                        <p>${cat ? cat.name : 'General'} • $${Number(s.price || 0).toLocaleString('es-AR')} • ${s.duration || 60}m</p>
                      </div>
                    </div>
                    <div class="panel-service-actions">
                      <button type="button" class="service-toggle-btn ${isActive ? 'active' : 'inactive'}" onclick="window.handleToggleServiceActive('${s.id}')">
                        ${isActive ? 'Activo' : 'Pausado'}
                      </button>
                      <button type="button" style="background: transparent; border: none; color: var(--accent-primary); cursor: pointer; padding: 4px;" onclick="window.handleStartEditService('${s.id}')">
                        ${Icons.edit}
                      </button>
                      <button type="button" style="background: transparent; border: none; color: #dc2626; cursor: pointer; padding: 4px;" onclick="window.handleDeleteService('${s.id}', '${s.name}')">
                        ${Icons.trash}
                      </button>
                    </div>
                  </div>
                `;
                    })
                    .join('')
            }
          </div>
        </div>
      </div>
    </div>
  `;
}

window.pickServicePhoto = (url) => {
  const input = document.getElementById('srv-image-input');
  if (input) input.value = url;
};

window.handleUploadServicePhoto = async (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  showToast('⏳ Optimizando foto del trabajo...');
  try {
    const dataUrl = await compressAndReadImage(file, 640, 0.85);
    const input = document.getElementById('srv-image-input');
    if (input) input.value = dataUrl;
    showToast('📸 ¡Foto cargada para el servicio!');
  } catch (err) {
    console.error(err);
    showToast('⚠️ Error al cargar foto');
  }
};

// Controladores de Categorías
window.handleCreateCategory = async () => {
  const input = document.getElementById('new-category-input');
  const name = input?.value.trim();
  if (!name) {
    showToast('Ingresá el nombre de la categoría');
    return;
  }
  const id = `cat_${Date.now()}`;
  const newCat = { id, name };
  AppState.categories.push(newCat);
  await DataStore.set('categories', id, newCat);
  input.value = '';
  showToast(`✅ Categoría "${name}" agregada`);
  renderApp();
};

window.handleDeleteCategory = async (catId, catName) => {
  const confirmDelete = window.confirm(`¿Seguro que deseas eliminar la categoría "${catName}"?`);
  if (!confirmDelete) return;

  AppState.categories = AppState.categories.filter((c) => c.id !== catId);
  await DataStore.remove('categories', catId);
  showToast(`🗑️ Categoría "${catName}" eliminada`);
  renderApp();
};

// Controladores de Servicios
window.handleSaveService = async (e) => {
  e.preventDefault();
  const name = document.getElementById('srv-name-input')?.value.trim();
  const categoryId = document.getElementById('srv-category-input')?.value;
  const price = Number(document.getElementById('srv-price-input')?.value) || 0;
  const duration = Number(document.getElementById('srv-duration-input')?.value) || 60;
  const deposit = Number(document.getElementById('srv-deposit-input')?.value) || null;
  const image = document.getElementById('srv-image-input')?.value.trim() || './assets/studio-nails.jpg';

  if (!name) {
    showToast('Ingresá el nombre del trabajo');
    return;
  }
  if (!categoryId) {
    showToast('Primero creá una categoría');
    return;
  }

  const isEditing = AppState.editingServiceId !== null;
  const id = isEditing ? AppState.editingServiceId : `srv_${Date.now()}`;

  const serviceData = {
    id,
    name,
    categoryId,
    price,
    duration,
    deposit,
    image,
    active: true
  };

  if (isEditing) {
    AppState.services = AppState.services.map((s) => (s.id === id ? { ...s, ...serviceData } : s));
    showToast(`✅ Servicio "${name}" actualizado`);
  } else {
    AppState.services.push(serviceData);
    showToast(`✅ Servicio "${name}" agregado al catálogo`);
  }

  await DataStore.set('services', id, serviceData);
  AppState.editingServiceId = null;
  renderApp();
};

window.handleStartEditService = (serviceId) => {
  AppState.editingServiceId = serviceId;
  renderApp();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.cancelEditService = () => {
  AppState.editingServiceId = null;
  renderApp();
};

window.handleToggleServiceActive = async (serviceId) => {
  const service = AppState.services.find((s) => s.id === serviceId);
  if (!service) return;
  service.active = service.active === false ? true : false;
  await DataStore.set('services', serviceId, service);
  showToast(service.active ? `👁️ Servicio activado en el catálogo` : `⏸️ Servicio pausado (oculto)`);
  renderApp();
};

window.handleDeleteService = async (serviceId, serviceName) => {
  const confirmDelete = window.confirm(`¿Seguro que deseas eliminar el servicio "${serviceName}"? Esta acción no se puede deshacer.`);
  if (!confirmDelete) return;

  AppState.services = AppState.services.filter((s) => s.id !== serviceId);
  await DataStore.remove('services', serviceId);
  showToast(`🗑️ Servicio "${serviceName}" eliminado`);
  renderApp();
};

// Helper para comprimir y convertir imágenes seleccionadas desde el celular
function compressAndReadImage(file, maxWidth = 1080, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ----------------------------------------------------------------------------
// SUBPANTALLA: 6. FOTOS Y TEXTOS (PORTADA, BANNER PROMO Y GALERÍA)
// ----------------------------------------------------------------------------
function renderPanelPhotos() {
  const salon = AppState.salon;

  return `
    <div class="screen-viewport">
      <header class="app-header">
        <div class="app-header-left">
          <button type="button" class="header-back-btn" onclick="window.openPanelSubView('menu')">${Icons.chevronLeft}</button>
          <h2 class="app-header-title">Fotos & Textos</h2>
        </div>
      </header>

      <div class="panel-subview">
        <!-- Portada Principal -->
        <form class="form-card" onsubmit="window.handleSaveSplashContent(event)">
          <h3>Foto y Textos de Portada</h3>
          <p class="form-card-sub">Es la primera imagen y bienvenida que ven tus clientas al entrar:</p>

          <div class="form-group-clean">
            <label>Vista Previa Actual</label>
            <div class="img-preview-box">
              <img src="${salon.splashHero || './assets/splash-hero.jpg'}" alt="Portada" onerror="this.src='./assets/splash-hero.jpg'" />
            </div>
          </div>

          <div class="form-group-clean">
            <label>Cambiar Foto de Portada</label>
            <input type="file" id="splash-file-picker" accept="image/*" style="display: none;" onchange="window.handleUploadSplashPhoto(event)" />
            <button type="button" class="btn-upload-file" onclick="document.getElementById('splash-file-picker').click()">
              <span>📷</span>
              <span>Subir Foto desde tu Celular / Galería</span>
            </button>
            <p style="font-size: 11px; color: var(--text-muted); margin-top: 5px;">O seleccioná una de las fotos profesionales preinstaladas:</p>
            
            <div class="photo-preset-chips">
              <div class="photo-preset-chip" onclick="window.setSplashPreset('./assets/splash-hero.jpg')">
                <img src="./assets/splash-hero.jpg" class="photo-preset-thumb" />
                <span>Modelo Studio</span>
              </div>
              <div class="photo-preset-chip" onclick="window.setSplashPreset('./assets/studio-interior.jpg')">
                <img src="./assets/studio-interior.jpg" class="photo-preset-thumb" />
                <span>Salón Lounge</span>
              </div>
              <div class="photo-preset-chip" onclick="window.setSplashPreset('./assets/studio-nails.jpg')">
                <img src="./assets/studio-nails.jpg" class="photo-preset-thumb" />
                <span>Uñas Studio</span>
              </div>
            </div>

            <div style="margin-top: 8px;">
              <label style="font-size: 10.5px;">O pegar URL directa de imagen:</label>
              <input type="text" id="splash-hero-input" value="${salon.splashHero || './assets/splash-hero.jpg'}" />
            </div>
          </div>

          <div class="form-group-clean">
            <label>Título Superior</label>
            <input type="text" id="splash-title-input" value="${salon.splashTitle || 'Look Good,'}" required />
          </div>

          <div class="form-group-clean">
            <label>Subtítulo Cursiva / Destacado</label>
            <input type="text" id="splash-sub-input" value="${salon.splashSubtitle || 'Feel Beautiful'}" required />
          </div>

          <button type="submit" class="btn-primary-action" style="width: 100%; margin-top: 6px;">
            Guardar Cambios de Portada
          </button>
        </form>

        <!-- Banner Promocional -->
        <form class="form-card" onsubmit="window.handleSaveBannerContent(event)">
          <h3>Banner Promocional de Inicio</h3>
          <p class="form-card-sub">Tarjeta destacada con foto y texto integrada en la pantalla Inicio:</p>

          <div class="form-group-clean">
            <label>Vista Previa del Banner</label>
            <div class="img-preview-box" style="height: 100px;">
              <img src="${salon.bannerImage || './assets/service-hair-balayage.jpg'}" alt="Banner" onerror="this.src='./assets/studio-nails.jpg'" />
            </div>
          </div>

          <div class="form-group-clean">
            <label>Cambiar Foto de la Promo</label>
            <input type="file" id="banner-file-picker" accept="image/*" style="display: none;" onchange="window.handleUploadBannerPhoto(event)" />
            <button type="button" class="btn-upload-file" onclick="document.getElementById('banner-file-picker').click()">
              <span>📷</span>
              <span>Subir Foto del Banner desde Celular</span>
            </button>

            <div class="photo-preset-chips">
              <div class="photo-preset-chip" onclick="window.setBannerPreset('./assets/service-hair-balayage.jpg')">
                <img src="./assets/service-hair-balayage.jpg" class="photo-preset-thumb" />
                <span>Balayage</span>
              </div>
              <div class="photo-preset-chip" onclick="window.setBannerPreset('./assets/studio-nails.jpg')">
                <img src="./assets/studio-nails.jpg" class="photo-preset-thumb" />
                <span>Uñas Estudio</span>
              </div>
              <div class="photo-preset-chip" onclick="window.setBannerPreset('./assets/service-hair-cut.jpg')">
                <img src="./assets/service-hair-cut.jpg" class="photo-preset-thumb" />
                <span>Corte Cabello</span>
              </div>
            </div>

            <div style="margin-top: 8px;">
              <label style="font-size: 10.5px;">O URL de imagen:</label>
              <input type="text" id="banner-img-input" value="${salon.bannerImage || './assets/service-hair-balayage.jpg'}" />
            </div>
          </div>

          <div class="form-group-clean">
            <label>Etiqueta / Badge</label>
            <input type="text" id="banner-badge-input" value="${salon.bannerBadge || 'Promoción de la Semana'}" />
          </div>

          <div class="form-group-clean">
            <label>Título de la Promo</label>
            <input type="text" id="banner-title-input" value="${salon.bannerTitle || '20% OFF en Balayage & Uñas'}" />
          </div>

          <div class="form-group-clean">
            <label>Subtítulo o Condiciones</label>
            <input type="text" id="banner-subtitle-input" value="${salon.bannerSubtitle || 'Válido agendando tu turno online este mes'}" />
          </div>

          <button type="submit" class="btn-primary-action" style="width: 100%; margin-top: 6px;">
            Guardar Cambios del Banner
          </button>
        </form>
      </div>
    </div>
  `;
}

window.setSplashPreset = (url) => {
  AppState.salon.splashHero = url;
  const input = document.getElementById('splash-hero-input');
  if (input) input.value = url;
  showToast('🖼️ Foto de muestra seleccionada');
  renderApp();
};

window.setBannerPreset = (url) => {
  AppState.salon.bannerImage = url;
  const input = document.getElementById('banner-img-input');
  if (input) input.value = url;
  showToast('🖼️ Foto de banner seleccionada');
  renderApp();
};

window.handleUploadSplashPhoto = async (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  showToast('⏳ Optimizando y subiendo foto...');
  try {
    const dataUrl = await compressAndReadImage(file, 1080, 0.86);
    AppState.salon.splashHero = dataUrl;
    await DataStore.set('salon', 'config', AppState.salon);
    showToast('📸 ¡Foto de portada actualizada desde tu celular!');
    renderApp();
  } catch (err) {
    console.error(err);
    showToast('⚠️ No se pudo procesar la foto');
  }
};

window.handleUploadBannerPhoto = async (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  showToast('⏳ Optimizando foto del banner...');
  try {
    const dataUrl = await compressAndReadImage(file, 800, 0.86);
    AppState.salon.bannerImage = dataUrl;
    await DataStore.set('salon', 'config', AppState.salon);
    showToast('📸 ¡Foto de banner actualizada desde tu celular!');
    renderApp();
  } catch (err) {
    console.error(err);
    showToast('⚠️ No se pudo procesar la foto');
  }
};

window.handleSaveSplashContent = async (e) => {
  e.preventDefault();
  AppState.salon.splashTitle = document.getElementById('splash-title-input')?.value.trim();
  AppState.salon.splashSubtitle = document.getElementById('splash-sub-input')?.value.trim();
  AppState.salon.splashHero = document.getElementById('splash-hero-input')?.value.trim() || AppState.salon.splashHero;
  await DataStore.set('salon', 'config', AppState.salon);
  showToast('✅ Textos y foto de portada guardados');
  renderApp();
};

window.handleSaveBannerContent = async (e) => {
  e.preventDefault();
  AppState.salon.bannerBadge = document.getElementById('banner-badge-input')?.value.trim();
  AppState.salon.bannerTitle = document.getElementById('banner-title-input')?.value.trim();
  AppState.salon.bannerSubtitle = document.getElementById('banner-subtitle-input')?.value.trim();
  AppState.salon.bannerImage = document.getElementById('banner-img-input')?.value.trim() || AppState.salon.bannerImage;
  await DataStore.set('salon', 'config', AppState.salon);
  showToast('✅ Banner promocional guardado');
  renderApp();
};

// ============================================================================
// SUBPANTALLA: 2. CLIENTAS (FICHAS, HISTORIAL Y NOTAS - PASO 4)
// ============================================================================
function renderPanelClients() {
  const clients = AppState.clients || [];
  const query = (AppState.clientSearchQuery || '').toLowerCase().trim();
  const filteredClients = clients.filter(
    (c) =>
      (c.name || '').toLowerCase().includes(query) ||
      (c.phone || '').includes(query) ||
      (c.notes || '').toLowerCase().includes(query)
  );

  const editingClient = clients.find((c) => c.id === AppState.editingClientId);

  return `
    <div class="screen-viewport">
      <header class="app-header">
        <div class="app-header-left">
          <button type="button" class="header-back-btn" onclick="window.openPanelSubView('menu')">${Icons.chevronLeft}</button>
          <div>
            <h2 class="app-header-title">Fichas de Clientas</h2>
            <p style="font-size: 11px; color: var(--text-muted);">${clients.length} ${clients.length === 1 ? 'clienta registrada' : 'clientas registradas'}</p>
          </div>
        </div>
        <button type="button" class="btn-primary-action" style="padding: 7px 12px; font-size: 11px;" onclick="window.handleOpenClientModal()">
          + Nueva Clienta
        </button>
      </header>

      <div class="panel-subview">
        <!-- Buscador en tiempo real -->
        <div class="client-search-box">
          <span class="search-icon">${Icons.search}</span>
          <input
            type="text"
            placeholder="Buscar por nombre o celular..."
            value="${AppState.clientSearchQuery || ''}"
            oninput="window.handleClientSearch(this.value)"
          />
        </div>

        <!-- Formulario Modal: Crear / Editar Ficha -->
        ${AppState.isClientModalOpen ? renderClientModalForm(editingClient) : ''}

        <!-- Listado de Clientas -->
        ${
          filteredClients.length === 0
            ? `
          <div style="text-align: center; padding: 40px 20px; background: var(--card-bg); border-radius: 18px; border: 1px solid rgba(0,0,0,0.06);">
            <div style="width: 48px; height: 48px; margin: 0 auto 12px; border-radius: 50%; background: #fdf2f8; display: flex; align-items: center; justify-content: center; color: #db2777;">
              ${Icons.users}
            </div>
            <h4 style="font-size: 15px; font-weight: 700; color: var(--text-main);">
              ${query ? 'No se encontraron clientas con esa búsqueda' : 'Sin clientas registradas aún'}
            </h4>
            <p style="font-size: 12px; color: var(--text-muted); margin-top: 4px; line-height: 1.4;">
              ${query ? 'Probá buscando con otro nombre o celular.' : 'Las fichas se crean solas cuando una clienta reserva su turno online o podés agregar una con el botón "+ Nueva Clienta".'}
            </p>
          </div>
        `
            : `
          <div style="display: flex; flex-direction: column; gap: 12px;">
            ${filteredClients
              .map((c) => {
                const initials = (c.name || 'C').trim().substring(0, 2).toUpperCase();
                const historyCount = (c.history || []).length;
                const totalSpent = Number(c.totalSpent || 0);

                return `
              <div class="client-card">
                <div class="client-card-top">
                  <div class="client-avatar-row">
                    <div class="client-avatar">${initials}</div>
                    <div>
                      <div class="client-name-title">${c.name}</div>
                      <div class="client-phone-sub">📱 ${c.phone || 'Sin celular'}</div>
                    </div>
                  </div>
                  ${
                    c.phone
                      ? `
                    <button type="button" class="btn-agenda-action wa" style="padding: 6px 10px; font-size: 11px; flex: initial;" onclick="window.openClientWhatsApp('${c.phone}', '${c.name}')">
                      💬 WhatsApp
                    </button>
                  `
                      : ''
                  }
                </div>

                <!-- Estadísticas de la Clienta -->
                <div class="client-stats-row">
                  <div class="client-stat-item">
                    <span>Visitas / Turnos</span>
                    <strong>${historyCount} ${historyCount === 1 ? 'servicio' : 'servicios'}</strong>
                  </div>
                  <div class="client-stat-item">
                    <span>Gasto Acumulado</span>
                    <strong style="color: var(--accent-primary);">$${totalSpent.toLocaleString('es-AR')}</strong>
                  </div>
                </div>

                <!-- Notas y Preferencias Personales -->
                ${
                  c.notes
                    ? `
                  <div class="client-notes-card">
                    <strong>📝 Notas:</strong> ${c.notes}
                  </div>
                `
                    : `
                  <div style="font-size: 11.5px; color: var(--text-muted); font-style: italic;">
                    Sin notas especiales cargadas (alergias, colores o gustos).
                  </div>
                `
                }

                <!-- Historial Desplegable de Turnos -->
                ${
                  historyCount > 0
                    ? `
                  <details style="font-size: 12px; color: var(--text-muted);">
                    <summary style="cursor: pointer; font-weight: 700; color: var(--text-main); margin-bottom: 6px;">
                      Ver historial de turnos (${historyCount})
                    </summary>
                    <div style="display: flex; flex-direction: column; gap: 4px; padding-left: 8px;">
                      ${c.history
                        .map(
                          (h) => `
                        <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed rgba(0,0,0,0.06); padding: 3px 0;">
                          <span>• ${h.serviceName} (${h.date || ''})</span>
                          <strong style="color: var(--text-main);">$${Number(h.price || 0).toLocaleString('es-AR')}</strong>
                        </div>
                      `
                        )
                        .join('')}
                    </div>
                  </details>
                `
                    : ''
                }

                <!-- Botones de Acción -->
                <div class="client-actions-strip">
                  <button type="button" class="btn-agenda-action" onclick="window.handleEditClient('${c.id}')">
                    ✏️ Editar / Notas
                  </button>
                  <button type="button" class="btn-agenda-action danger" onclick="window.handleDeleteClient('${c.id}', '${c.name}')">
                    🗑️ Borrar Ficha
                  </button>
                </div>
              </div>
            `;
              })
              .join('')}
          </div>
        `
        }
      </div>
    </div>
  `;
}

function renderClientModalForm(editingClient) {
  const isEdit = !!editingClient;

  return `
    <form class="form-card" style="border: 1.5px solid var(--accent-primary); margin-bottom: 14px;" onsubmit="window.handleSaveClient(event)">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <h3>${isEdit ? '✏️ Editar Ficha de Clienta' : '➕ Nueva Ficha de Clienta'}</h3>
        <button type="button" style="background: none; border: none; font-size: 18px; cursor: pointer;" onclick="window.handleCloseClientModal()">×</button>
      </div>
      <p class="form-card-sub">Guardá el contacto y anotaciones clave para su próxima visita:</p>

      <div class="form-group-clean">
        <label>Nombre y Apellido</label>
        <input type="text" id="client-modal-name" value="${editingClient?.name || ''}" placeholder="Ej: Camila Rodríguez" required />
      </div>

      <div class="form-group-clean">
        <label>Teléfono de WhatsApp</label>
        <input type="tel" id="client-modal-phone" value="${editingClient?.phone || ''}" placeholder="Ej: 11 2345 6789" required />
      </div>

      <div class="form-group-clean">
        <label>Notas del Salón (Alergias, tonos favoritos, diseño preferido, etc.)</label>
        <textarea id="client-modal-notes" rows="3" placeholder="Ej: Alérgica al monómero con olor. Prefiere tonos nude y largo almendrado. Balayage cobrizo suave.">${editingClient?.notes || ''}</textarea>
      </div>

      <div style="display: flex; gap: 8px; margin-top: 6px;">
        <button type="submit" class="btn-primary-action" style="flex: 1;">
          ${isEdit ? 'Actualizar Ficha' : 'Guardar Clienta'}
        </button>
        <button type="button" class="btn-secondary-action" onclick="window.handleCloseClientModal()">
          Cancelar
        </button>
      </div>
    </form>
  `;
}

// ============================================================================
// SUBPANTALLA: 4. FINANZAS Y CAJA (RESUMEN, SEÑAS, GASTOS Y CSV - PASO 4)
// ============================================================================
function renderPanelFinances() {
  const finances = AppState.finances || [];
  const appointments = AppState.appointments || [];
  const filter = AppState.financeFilter || 'month';
  const todayStr = getTodayDateStr();

  // Cálculo de KPIs:
  // 1. Ingresos por señas recibidas en turnos
  const apptDeposits = appointments.filter((a) => a.depositPaid === true);
  const totalDepositsIncome = apptDeposits.reduce((acc, a) => acc + (Number(a.depositAmount) || 0), 0);

  // 2. Ingresos registrados en caja (directos)
  const directIncomes = finances.filter((t) => t.type === 'income');
  const directIncomeTotal = directIncomes.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

  // 3. Gastos registrados
  const expenses = finances.filter((t) => t.type === 'expense');
  const totalExpenses = expenses.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

  // Total ingresos consolidados
  const totalAllIncome = totalDepositsIncome + directIncomeTotal;
  const netBalance = totalAllIncome - totalExpenses;

  // KPIs por período (Hoy, Semana, Mes):
  const now = new Date();
  const currentMonthPrefix = todayStr.substring(0, 7); // 'YYYY-MM'

  const todayIncome =
    finances.filter((t) => t.type === 'income' && t.date === todayStr).reduce((acc, t) => acc + Number(t.amount), 0) +
    appointments.filter((a) => a.depositPaid && a.date === todayStr).reduce((acc, a) => acc + Number(a.depositAmount), 0);

  const monthIncome =
    finances.filter((t) => t.type === 'income' && (t.date || '').startsWith(currentMonthPrefix)).reduce((acc, t) => acc + Number(t.amount), 0) +
    appointments.filter((a) => a.depositPaid && (a.date || '').startsWith(currentMonthPrefix)).reduce((acc, a) => acc + Number(a.depositAmount), 0);

  // Cobros Pendientes (Turnos confirmados con seña o saldo pendiente)
  const pendingDeposits = appointments.filter((a) => a.status !== 'cancelled' && a.depositPaid !== true);

  // Filtrado de movimientos para la lista
  const filteredTxs = finances.filter((t) => {
    if (filter === 'today') return t.date === todayStr;
    if (filter === 'month') return (t.date || '').startsWith(currentMonthPrefix);
    return true;
  }).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

  return `
    <div class="screen-viewport">
      <header class="app-header">
        <div class="app-header-left">
          <button type="button" class="header-back-btn" onclick="window.openPanelSubView('menu')">${Icons.chevronLeft}</button>
          <div>
            <h2 class="app-header-title">Finanzas & Caja</h2>
            <p style="font-size: 11px; color: var(--text-muted);">Control de ingresos, señas y egresos</p>
          </div>
        </div>
        <button type="button" class="btn-primary-action" style="padding: 7px 11px; font-size: 11px; background: #0284c7;" onclick="window.exportFinancesCSV()">
          📥 Exportar CSV
        </button>
      </header>

      <div class="panel-subview">
        <!-- 3 Tarjetas KPI Superiores -->
        <div class="kpi-metrics-grid">
          <div class="kpi-metric-card">
            <span class="kpi-lbl">Ingresos Hoy</span>
            <strong class="kpi-val" style="color: #16a34a;">$${todayIncome.toLocaleString('es-AR')}</strong>
          </div>
          <div class="kpi-metric-card">
            <span class="kpi-lbl">Este Mes</span>
            <strong class="kpi-val" style="color: #0284c7;">$${monthIncome.toLocaleString('es-AR')}</strong>
          </div>
          <div class="kpi-metric-card">
            <span class="kpi-lbl">Balance Neto</span>
            <strong class="kpi-val" style="color: ${netBalance >= 0 ? '#16a34a' : '#dc2626'};">$${netBalance.toLocaleString('es-AR')}</strong>
          </div>
        </div>

        <!-- Botones de Acción Rápida: + Cobro / - Gasto -->
        <div class="finance-action-buttons">
          <button type="button" class="btn-record-income" onclick="window.handleOpenTxModal('income')">
            <span>+</span>
            <span>Registrar Cobro</span>
          </button>
          <button type="button" class="btn-record-expense" onclick="window.handleOpenTxModal('expense')">
            <span>-</span>
            <span>Registrar Gasto</span>
          </button>
        </div>

        <!-- Formulario Modal: Registrar Movimiento -->
        ${AppState.isNewTxModalOpen ? renderTxModalForm() : ''}

        <!-- Desglose de Caja -->
        <div class="finance-breakdown-card">
          <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 8px;">
            Desglose Consolidado
          </div>
          <div class="breakdown-row">
            <span>Señas de Turnos Recibidas:</span>
            <strong style="color: #16a34a;">+$${totalDepositsIncome.toLocaleString('es-AR')}</strong>
          </div>
          <div class="breakdown-row">
            <span>Cobros Finales y Ventas:</span>
            <strong style="color: #16a34a;">+$${directIncomeTotal.toLocaleString('es-AR')}</strong>
          </div>
          <div class="breakdown-row">
            <span>Gastos Operativos (Insumos/Alquiler):</span>
            <strong style="color: #dc2626;">-$${totalExpenses.toLocaleString('es-AR')}</strong>
          </div>
          <div class="breakdown-row">
            <span>Balance de Caja Disponible:</span>
            <strong style="color: ${netBalance >= 0 ? '#16a34a' : '#dc2626'};">$${netBalance.toLocaleString('es-AR')}</strong>
          </div>
        </div>

        <!-- Cobros Pendientes de Turnos -->
        ${
          pendingDeposits.length > 0
            ? `
          <div class="form-card" style="border: 1px dashed #d97706; background: #fffbeb;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
              <h4 style="font-size: 13.5px; font-weight: 800; color: #b45309;">
                ⏳ Señas Pendientes de Cobro (${pendingDeposits.length})
              </h4>
            </div>
            <p style="font-size: 11.5px; color: #78350f; margin-bottom: 10px;">
              Turnos agendados con seña aún sin marcar como recibida:
            </p>
            <div style="display: flex; flex-direction: column; gap: 6px;">
              ${pendingDeposits
                .slice(0, 5)
                .map(
                  (p) => `
                <div style="display: flex; align-items: center; justify-content: space-between; background: #fff; border-radius: 10px; padding: 8px 12px; font-size: 12px; border: 1px solid #fde68a;">
                  <div>
                    <strong>${p.clientName}</strong>
                    <div style="font-size: 11px; color: #78350f;">${p.serviceName} • 📅 ${p.date} (${p.slot} hs)</div>
                  </div>
                  <div style="text-align: right;">
                    <div style="font-weight: 800; color: #b45309;">$${Number(p.depositAmount).toLocaleString('es-AR')}</div>
                    <button type="button" style="background: #16a34a; color: #fff; border: none; font-size: 10px; font-weight: 800; padding: 3px 8px; border-radius: 6px; cursor: pointer; margin-top: 3px;" onclick="window.handleCollectPendingDeposit('${p.id}')">
                      Recibida ✅
                    </button>
                  </div>
                </div>
              `
                )
                .join('')}
            </div>
          </div>
        `
            : ''
        }

        <!-- Filtro de Movimientos -->
        <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 6px;">
          <h3 style="font-size: 14px; font-weight: 800; color: var(--text-main);">Movimientos Registrados</h3>
          <div class="filter-pills-row">
            <button type="button" class="filter-pill-btn ${filter === 'today' ? 'active' : ''}" onclick="window.setFinanceFilter('today')">Hoy</button>
            <button type="button" class="filter-pill-btn ${filter === 'month' ? 'active' : ''}" onclick="window.setFinanceFilter('month')">Este Mes</button>
            <button type="button" class="filter-pill-btn ${filter === 'all' ? 'active' : ''}" onclick="window.setFinanceFilter('all')">Todos</button>
          </div>
        </div>

        <!-- Lista de Movimientos -->
        ${
          filteredTxs.length === 0
            ? `
          <div style="text-align: center; padding: 30px 16px; background: var(--card-bg); border-radius: 16px; border: 1px solid rgba(0,0,0,0.06);">
            <p style="font-size: 12.5px; color: var(--text-muted);">Sin movimientos registrados para este período.</p>
            <p style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">Usá los botones de arriba para registrar cobros o gastos diarios.</p>
          </div>
        `
            : `
          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${filteredTxs
              .map((tx) => {
                const isIncome = tx.type === 'income';
                return `
              <div class="tx-item-card">
                <div>
                  <div class="tx-concept-title">${isIncome ? '🟢' : '🔴'} ${tx.concept}</div>
                  <div class="tx-meta-sub">
                    📅 ${tx.date} • ${tx.method || 'Efectivo'} ${tx.category ? `• ${tx.category}` : ''}
                  </div>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span class="tx-amount-badge ${isIncome ? 'income' : 'expense'}">
                    ${isIncome ? '+' : '-'}$${Number(tx.amount).toLocaleString('es-AR')}
                  </span>
                  <button type="button" style="background: none; border: none; color: #dc2626; cursor: pointer; padding: 2px 4px; font-size: 14px;" onclick="window.handleDeleteTransaction('${tx.id}')" title="Borrar movimiento">
                    ×
                  </button>
                </div>
              </div>
            `;
              })
              .join('')}
          </div>
        `
        }
      </div>
    </div>
  `;
}

function renderTxModalForm() {
  const isIncome = AppState.txModalType === 'income';

  return `
    <form class="form-card" style="border: 1.5px solid ${isIncome ? '#16a34a' : '#dc2626'}; margin-bottom: 14px;" onsubmit="window.handleSaveTransaction(event)">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <h3 style="color: ${isIncome ? '#16a34a' : '#dc2626'};">
          ${isIncome ? '🟢 Registrar Cobro / Ingreso' : '🔴 Registrar Gasto / Egreso'}
        </h3>
        <button type="button" style="background: none; border: none; font-size: 18px; cursor: pointer;" onclick="window.handleCloseTxModal()">×</button>
      </div>
      <p class="form-card-sub">
        ${isIncome ? 'Ingresá el cobro de un servicio, seña o producto:' : 'Ingresá compras de insumos, esmaltes, alquiler o servicios:'}
      </p>

      <div class="form-group-clean">
        <label>Concepto o Motivo</label>
        <input type="text" id="tx-concept-input" placeholder="${isIncome ? 'Ej: Cobro final Balayage' : 'Ej: Esmaltes semipermanentes y limas'}" required />
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
        <div class="form-group-clean">
          <label>Monto ($)</label>
          <input type="number" id="tx-amount-input" placeholder="0" min="1" required />
        </div>
        <div class="form-group-clean">
          <label>Método de Pago</label>
          <select id="tx-method-input">
            <option value="Efectivo">Efectivo 💵</option>
            <option value="Transferencia / MP">Transferencia / MP 💳</option>
            <option value="Tarjeta">Tarjeta Débito/Crédito</option>
            <option value="Otro">Otro</option>
          </select>
        </div>
      </div>

      <div class="form-group-clean">
        <label>Fecha del Movimiento</label>
        <input type="date" id="tx-date-input" value="${getTodayDateStr()}" required />
      </div>

      <div style="display: flex; gap: 8px; margin-top: 6px;">
        <button type="submit" class="btn-primary-action" style="flex: 1; background: ${isIncome ? '#16a34a' : '#dc2626'}; color: #fff;">
          ${isIncome ? 'Guardar Cobro' : 'Guardar Gasto'}
        </button>
        <button type="button" class="btn-secondary-action" onclick="window.handleCloseTxModal()">
          Cancelar
        </button>
      </div>
    </form>
  `;
}

// ----------------------------------------------------------------------------
// CONTROLADORES DE CLIENTAS (PASO 4)
// ----------------------------------------------------------------------------
window.handleClientSearch = (val) => {
  AppState.clientSearchQuery = val;
  renderApp();
};

window.handleOpenClientModal = () => {
  AppState.editingClientId = null;
  AppState.isClientModalOpen = true;
  renderApp();
};

window.handleEditClient = (clientId) => {
  AppState.editingClientId = clientId;
  AppState.isClientModalOpen = true;
  renderApp();
};

window.handleCloseClientModal = () => {
  AppState.isClientModalOpen = false;
  AppState.editingClientId = null;
  renderApp();
};

window.handleSaveClient = async (e) => {
  e.preventDefault();
  const name = document.getElementById('client-modal-name')?.value.trim();
  const phone = document.getElementById('client-modal-phone')?.value.trim();
  const notes = document.getElementById('client-modal-notes')?.value.trim();

  if (!name || !phone) {
    showToast('⚠️ Ingresá el nombre y celular');
    return;
  }

  const isEdit = !!AppState.editingClientId;
  const clientId = isEdit ? AppState.editingClientId : 'cli_' + Date.now();

  let client = isEdit
    ? (AppState.clients || []).find((c) => c.id === clientId)
    : { id: clientId, history: [], totalSpent: 0, createdAt: new Date().toISOString() };

  if (!client) {
    client = { id: clientId, history: [], totalSpent: 0, createdAt: new Date().toISOString() };
  }

  client.name = name;
  client.phone = phone;
  client.notes = notes;

  await DataStore.set('clients', clientId, client);

  if (isEdit) {
    const idx = (AppState.clients || []).findIndex((c) => c.id === clientId);
    if (idx >= 0) AppState.clients[idx] = client;
    showToast('✅ Ficha de clienta actualizada');
  } else {
    if (!AppState.clients) AppState.clients = [];
    AppState.clients.push(client);
    showToast('🎉 Nueva clienta registrada');
  }

  AppState.isClientModalOpen = false;
  AppState.editingClientId = null;
  renderApp();
};

window.handleDeleteClient = async (clientId, name) => {
  if (!window.confirm(`¿Estás segura de eliminar la ficha de ${name}? Se borrará su historial de notas.`)) return;

  await DataStore.delete('clients', clientId);
  AppState.clients = (AppState.clients || []).filter((c) => c.id !== clientId);
  showToast('🗑️ Ficha eliminada');
  renderApp();
};

window.openClientWhatsApp = (phone, name) => {
  const cleanPhone = (phone || '').replace(/\D/g, '');
  const salonName = AppState.salon.name || 'el Salón';
  const text = `¡Hola ${name}! Te escribimos de ${salonName} 💕. ¿Cómo estás?`;
  const url = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}` : `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
};

// ----------------------------------------------------------------------------
// CONTROLADORES DE FINANZAS Y CAJA (PASO 4)
// ----------------------------------------------------------------------------
window.setFinanceFilter = (filter) => {
  AppState.financeFilter = filter;
  renderApp();
};

window.handleOpenTxModal = (type) => {
  AppState.txModalType = type;
  AppState.isNewTxModalOpen = true;
  renderApp();
};

window.handleCloseTxModal = () => {
  AppState.isNewTxModalOpen = false;
  renderApp();
};

window.handleSaveTransaction = async (e) => {
  e.preventDefault();
  const concept = document.getElementById('tx-concept-input')?.value.trim();
  const amount = Number(document.getElementById('tx-amount-input')?.value) || 0;
  const method = document.getElementById('tx-method-input')?.value || 'Efectivo';
  const date = document.getElementById('tx-date-input')?.value || getTodayDateStr();

  if (!concept || amount <= 0) {
    showToast('⚠️ Ingresá un concepto y un monto válido');
    return;
  }

  const txId = 'tx_' + Date.now();
  const newTx = {
    id: txId,
    type: AppState.txModalType,
    concept: concept,
    amount: amount,
    method: method,
    date: date,
    createdAt: new Date().toISOString()
  };

  await DataStore.set('finances', txId, newTx);
  if (!AppState.finances) AppState.finances = [];
  AppState.finances.push(newTx);

  showToast(AppState.txModalType === 'income' ? '🟢 Cobro registrado en caja' : '🔴 Gasto registrado en caja');
  AppState.isNewTxModalOpen = false;
  renderApp();
};

window.handleDeleteTransaction = async (txId) => {
  if (!window.confirm('¿Deseas eliminar este movimiento de caja?')) return;

  await DataStore.delete('finances', txId);
  AppState.finances = (AppState.finances || []).filter((t) => t.id !== txId);
  showToast('🗑️ Movimiento eliminado');
  renderApp();
};

window.handleCollectPendingDeposit = async (apptId) => {
  const appt = (AppState.appointments || []).find((a) => a.id === apptId);
  if (!appt) return;

  appt.depositPaid = true;
  await DataStore.set('appointments', apptId, appt);

  // Registrar automáticamente el cobro en finanzas
  const txId = 'tx_' + Date.now();
  const newTx = {
    id: txId,
    type: 'income',
    concept: `Seña de turno: ${appt.clientName} (${appt.serviceName})`,
    amount: Number(appt.depositAmount) || 0,
    method: 'Transferencia / MP',
    date: getTodayDateStr(),
    createdAt: new Date().toISOString()
  };

  await DataStore.set('finances', txId, newTx);
  if (!AppState.finances) AppState.finances = [];
  AppState.finances.push(newTx);

  showToast('✅ Seña cobrada y registrada en caja');
  renderApp();
};

window.exportFinancesCSV = () => {
  const finances = AppState.finances || [];
  const appointments = AppState.appointments || [];

  if (finances.length === 0 && appointments.length === 0) {
    showToast('ℹ️ No hay movimientos para exportar');
    return;
  }

  // Encabezados CSV
  let csv = 'Fecha,Tipo,Concepto,Metodo,Monto\n';

  // 1. Agregar movimientos de caja
  finances.forEach((t) => {
    const typeLabel = t.type === 'income' ? 'Ingreso' : 'Egreso/Gasto';
    const cleanConcept = (t.concept || '').replace(/"/g, '""');
    csv += `"${t.date || ''}","${typeLabel}","${cleanConcept}","${t.method || ''}","${t.amount || 0}"\n`;
  });

  // 2. Agregar señas de turnos cobradas
  appointments
    .filter((a) => a.depositPaid)
    .forEach((a) => {
      csv += `"${a.date || ''}","Ingreso Seña","${(a.clientName || '').replace(/"/g, '""')} - ${(a.serviceName || '').replace(/"/g, '""')}","Transferencia / MP","${a.depositAmount || 0}"\n`;
    });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `balance_caja_${getTodayDateStr()}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast('📥 Balance mensual exportado a CSV con éxito');
};

// ----------------------------------------------------------------------------
// CONTROLADORES GLOBALES
// ----------------------------------------------------------------------------
window.lockOwnerPanel = () => {
  AppState.isOwnerUnlocked = false;
  AppState.panelSubView = 'menu';
  AppState.pinDraft = '';
  showToast('🔒 Sesión cerrada');
  navigateTo('home');
};

window.openPanelSubView = (subView) => {
  AppState.panelSubView = subView;
  renderApp();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.copyAlias = () => {
  const alias = AppState.salon.alias || 'TU.ALIAS.MP';
  navigator.clipboard?.writeText(alias);
  showToast('📋 ¡Alias copiado al portapapeles!');
};

window.confirmBookingWhatsapp = async () => {
  const currentService = AppState.services.find((s) => s.id === AppState.bookingDraft.serviceId);
  if (!currentService) {
    showToast('⚠️ Por favor seleccioná un servicio del catálogo');
    navigateTo('services');
    return;
  }

  if (!AppState.bookingDate || !AppState.bookingSlot) {
    showToast('⚠️ Por favor elegí una fecha y un horario disponible');
    return;
  }

  const nameInput = document.getElementById('client-name-input')?.value.trim();
  const phoneInput = document.getElementById('client-phone-input')?.value.trim();
  const name = nameInput || AppState.bookingDraft.clientName;
  const phone = phoneInput || AppState.bookingDraft.clientPhone;

  if (!name || !phone) {
    showToast('⚠️ Por favor ingresá tu nombre y teléfono de contacto');
    return;
  }

  // Anti-solapamiento: verificar si el horario ya está ocupado
  if (isSlotOccupied(AppState.bookingDate, AppState.bookingSlot)) {
    showToast('⚠️ Ese horario acaba de ser ocupado. Por favor elegí otro.');
    renderApp();
    return;
  }

  const depositPercent = AppState.salon.depositPercent || 50;
  const depositAmount = currentService.deposit || Math.round((currentService.price * depositPercent) / 100);

  const apptId = 'appt_' + Date.now();
  const newAppt = {
    id: apptId,
    clientId: '',
    clientName: name,
    clientPhone: phone,
    serviceId: currentService.id,
    serviceName: currentService.name,
    servicePrice: Number(currentService.price) || 0,
    serviceDuration: Number(currentService.duration) || 60,
    date: AppState.bookingDate,
    slot: AppState.bookingSlot,
    status: 'pending',
    depositAmount: depositAmount,
    depositPaid: false,
    createdAt: new Date().toISOString()
  };

  // Crear o actualizar automáticamente la ficha de la clienta
  let client = (AppState.clients || []).find((c) => c.phone && c.phone === phone);
  if (!client) {
    client = {
      id: 'cli_' + Date.now(),
      name: name,
      phone: phone,
      notes: '',
      history: [],
      totalSpent: 0,
      createdAt: new Date().toISOString()
    };
  }
  client.history = client.history || [];
  client.history.push({
    apptId: apptId,
    serviceName: currentService.name,
    date: AppState.bookingDate,
    slot: AppState.bookingSlot,
    price: Number(currentService.price) || 0
  });
  newAppt.clientId = client.id;

  // Persistir en Firebase / LocalStorage
  await DataStore.set('appointments', apptId, newAppt);
  await DataStore.set('clients', client.id, client);

  AppState.appointments.push(newAppt);
  const clientIdx = (AppState.clients || []).findIndex((c) => c.id === client.id);
  if (clientIdx >= 0) {
    AppState.clients[clientIdx] = client;
  } else {
    AppState.clients.push(client);
  }

  // Armar mensaje para WhatsApp
  const dateFormatted = formatDateDisplay(AppState.bookingDate);
  const text =
    `¡Hola! Quiero confirmar mi turno en ${AppState.salon.name || 'el Salón'}:\n\n` +
    `✨ *Servicio:* ${currentService.name}\n` +
    `📅 *Fecha:* ${dateFormatted}\n` +
    `⏰ *Horario:* ${AppState.bookingSlot} hs\n` +
    `👤 *Clienta:* ${name}\n` +
    `📱 *Teléfono:* ${phone}\n` +
    `💵 *Total:* $${Number(currentService.price).toLocaleString('es-AR')}\n` +
    `💳 *Seña requerida:* $${Number(depositAmount).toLocaleString('es-AR')}\n` +
    `📌 *Alias de pago:* ${AppState.salon.alias || 'TU.ALIAS.MP'}\n\n` +
    `Adjunto mi comprobante de transferencia para congelar el turno. ¡Gracias!`;

  const salonPhone = (AppState.salon.phone || '').replace(/\D/g, '');
  const url = salonPhone
    ? `https://wa.me/${salonPhone}?text=${encodeURIComponent(text)}`
    : `https://wa.me/?text=${encodeURIComponent(text)}`;

  window.open(url, '_blank');
  showToast('🎉 ¡Turno agendado con éxito! Abriendo WhatsApp...');

  // Reset del slot elegido para la siguiente reserva
  AppState.bookingSlot = '';
  renderApp();
};

// ----------------------------------------------------------------------------
// RENDERIZADOR MAESTRO DE LA APLICACIÓN
// ----------------------------------------------------------------------------
function renderApp() {
  const root = document.getElementById('app-root');
  if (!root) return;

  let screenContent = '';
  switch (AppState.activeScreen) {
    case 'splash':
      screenContent = renderSplash();
      break;
    case 'home':
      screenContent = renderHome();
      break;
    case 'services':
      screenContent = renderServices();
      break;
    case 'inspo':
      screenContent = renderInspo();
      break;
    case 'booking':
      screenContent = renderBooking();
      break;
    case 'panel':
      screenContent = renderPanel();
      break;
    default:
      screenContent = renderHome();
  }

  // Barra inferior (visible en todas las pantallas excepto Portada y Teclado PIN)
  const showBottomNav =
    AppState.activeScreen !== 'splash' &&
    !(AppState.activeScreen === 'panel' && !AppState.isOwnerUnlocked);

  const bottomNavHtml = showBottomNav
    ? `
    <nav class="bottom-nav-bar">
      <button type="button" class="nav-tab-btn ${AppState.activeScreen === 'home' ? 'active' : ''}" onclick="navigateTo('home')">
        ${Icons.home}
        <span>Inicio</span>
      </button>
      <button type="button" class="nav-tab-btn ${AppState.activeScreen === 'services' ? 'active' : ''}" onclick="navigateTo('services')">
        ${Icons.scissors}
        <span>Servicios</span>
      </button>
      <button type="button" class="nav-tab-btn ${AppState.activeScreen === 'inspo' ? 'active' : ''}" onclick="navigateTo('inspo')">
        ${Icons.sparkles}
        <span>Inspo</span>
      </button>
      <button type="button" class="nav-tab-btn ${AppState.activeScreen === 'booking' ? 'active' : ''}" onclick="navigateTo('booking')">
        ${Icons.calendar}
        <span>Mi Turno</span>
      </button>
      <button type="button" class="nav-tab-btn ${AppState.activeScreen === 'panel' ? 'active' : ''}" onclick="navigateTo('panel')">
        ${Icons.lock}
        <span>Panel</span>
      </button>
    </nav>
  `
    : '';

  const toastHtml = AppState.toastMessage ? `<div class="toast-msg">${AppState.toastMessage}</div>` : '';

  root.innerHTML = `
    ${screenContent}
    ${bottomNavHtml}
    ${toastHtml}
  `;
}

// ----------------------------------------------------------------------------
// INICIALIZACIÓN
// ----------------------------------------------------------------------------
async function startApp() {
  await initFirebase();

  const savedSalon = await DataStore.get('salon', 'config');
  if (savedSalon) {
    AppState.salon = { ...AppState.salon, ...savedSalon };
  }

  // Aplicar tema configurado
  applyTheme(AppState.salon.themeColor || 'rose');

  AppState.categories = await DataStore.getAll('categories');
  AppState.services = await DataStore.getAll('services');
  AppState.appointments = await DataStore.getAll('appointments');
  AppState.clients = await DataStore.getAll('clients');
  AppState.finances = await DataStore.getAll('finances');
  AppState.blockedSlots = await DataStore.getAll('blockedSlots');

  const upcomingDays = getUpcomingDays(10);
  if (!AppState.bookingDate && upcomingDays.length > 0) {
    AppState.bookingDate = upcomingDays[0].dateStr;
  }
  if (!AppState.agendaSelectedDate) {
    AppState.agendaSelectedDate = getTodayDateStr();
  }

  const savedInspo = await DataStore.getAll('inspo');
  if (savedInspo && savedInspo.length > 0) {
    AppState.inspo = savedInspo;
  }

  renderApp();
}

window.addEventListener('DOMContentLoaded', startApp);
