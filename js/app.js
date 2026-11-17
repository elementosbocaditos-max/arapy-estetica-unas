// ============================================================================
// BEAUTY & NAIL STUDIO — CORE APPLICATION ENGINE (PASO 2)
// Gestión Completa: Datos del Salón + Categorías y Servicios + Fotos & Textos
// ============================================================================
import { initFirebase, DataStore } from './firebase-config.js';


// ============================================================================
// VIDRIERAS & CARTILLAS DEMO (100% EDITABLES - SE BORRAN AL CARGAR INFORMACIÓN REAL)
// ============================================================================
const DEMO_SHOWCASE = {
  salon: {
    name: 'Maison de Beauté',
    tagline: 'Uñas de Autor & Haute Coiffure',
    address: 'Av. Alvear 1850, Local 4',
    phone: '5491123456789',
    alias: 'MAISON.BEAUTE.MP',
    aliasHolder: 'Maison Studio SRL',
    depositPercent: 50,
    themeColor: 'champagne',
    splashTitle: "L'Art de la Beauté,",
    splashSubtitle: 'Uñas & Peluquería de Autor',
    splashHero: './assets/splash-hero.jpg',
    bannerBadge: 'Collection Privée',
    bannerTitle: '20% OFF en Servicios Seleccionados',
    bannerSubtitle: 'Válido agendando tu turno online',
    bannerImage: './assets/service-hair-balayage.jpg',
    isDemo: true
  },
  categories: [
    { id: 'demo_cat_1', name: 'Uñas & Manicuría', isDemo: true },
    { id: 'demo_cat_2', name: 'Peluquería & Color', isDemo: true },
    { id: 'demo_cat_3', name: 'Tratamientos Spa', isDemo: true }
  ],
  services: [
    {
      id: 'demo_srv_1',
      name: 'Kapping Gel & Esmaltado Semipermanente',
      categoryId: 'demo_cat_1',
      price: 18000,
      duration: 60,
      deposit: 9000,
      image: './assets/studio-nails.jpg',
      active: true,
      isDemo: true
    },
    {
      id: 'demo_srv_2',
      name: 'Uñas Esculpidas Soft Gel con Nail Art',
      categoryId: 'demo_cat_1',
      price: 24000,
      duration: 90,
      deposit: 12000,
      image: './assets/inspo-rose-french.jpg',
      active: true,
      isDemo: true
    },
    {
      id: 'demo_srv_3',
      name: 'Balayage Iluminación & Baño de Luz',
      categoryId: 'demo_cat_2',
      price: 55000,
      duration: 180,
      deposit: 27500,
      image: './assets/service-hair-balayage.jpg',
      active: true,
      isDemo: true
    },
    {
      id: 'demo_srv_4',
      name: 'Corte Femenino de Autor & Brushing',
      categoryId: 'demo_cat_2',
      price: 22000,
      duration: 60,
      deposit: 11000,
      image: './assets/service-hair-cut.jpg',
      active: true,
      isDemo: true
    }
  ],
  addons: [
    { id: 'demo_addon_1', name: 'Retiro de Esmaltado Anterior', price: 2000, duration: 15, active: true, isDemo: true },
    { id: 'demo_addon_2', name: 'Nail Art / Francesitas por uña', price: 2500, duration: 15, active: true, isDemo: true },
    { id: 'demo_addon_3', name: 'Nutrición Capilar Exprés / Ampolla', price: 4000, duration: 20, active: true, isDemo: true }
  ]
};

// Estado global de la aplicación en memoria (sincronizado con DataStore / Firestore)
const AppState = {
  activeScreen: 'splash',
  panelSubView: 'menu', // 'menu' | 'agenda' | 'clients' | 'services' | 'finances' | 'salon' | 'photos'
  isOwnerUnlocked: false,
  storeConfigTab: 'general', // 'general' | 'hours' | 'finance' | 'security'
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
    cuit: '',
    cashDiscount: 10,
    openTime: '09:00',
    closeTime: '20:00',
    workingDays: 'Lunes a Sábado',
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
  addons: [],
  appointments: [],
  clients: [],
  finances: [],
  photoBank: [],
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
  bookingStep: 1, // 1: Servicio, 2: Fecha & Horario, 3: Datos & Seña, 4: Confirmado
  bookingDate: '', // 'YYYY-MM-DD'
  bookingSlot: '', // '14:00'
  lastBookedAppt: null,
  isBookingSuccessModalOpen: false,
  bookingDraft: {
    serviceId: null,
    inspoId: null,
    inspoTitle: null,
    inspoImage: null,
    date: null,
    slot: null,
    clientName: '',
    clientPhone: '',
    selectedAddonIds: []
  },

  // Agenda del Salón
  agendaSelectedDate: '', // 'YYYY-MM-DD'
  isManualApptOpen: false,
  isBlockModalOpen: false,
  blockedSlots: [],
  reschedulingApptId: null,
  rescheduleDate: '',
  rescheduleSlot: '',

  // Estado temporal de edición de servicio en el Panel
  editingServiceId: null,
  viewingServiceDetailId: null,

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
  wallet: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/></svg>`,
  clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  shield: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  creditCard: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" x2="10"/></svg>`,
  settings: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
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
    <div class="screen-viewport no-bottom-bar splash-container" style="background: var(--ivory-bg);">
      <!-- Foto LUMINOSA de Luz Natural en Primer Plano con Movimiento Suave Ken-Burns -->
      <div class="splash-photo-hero" style="height: 56dvh; min-height: 370px;">
        <img
          src="${AppState.salon.splashHero || './assets/splash-hero.jpg'}?v=3.0"
          alt="Maison de Beauté"
          class="splash-hero-img-luminous"
          onerror="this.src='./assets/splash-hero.jpg'"
        />
        <div class="splash-top-bar">
          <span class="gold-badge">✦ ${AppState.salon.name || 'Maison de Beauté'}</span>
          <button type="button" class="mirrored-icon-badge" onclick="navigateTo('panel')" title="Acceso Dueño" style="width: 36px; height: 36px; border-radius: 50%;">
            ${Icons.lock}
          </button>
        </div>
        <div style="position: absolute; bottom: 0; left: 0; right: 0; height: 85px; background: linear-gradient(180deg, transparent 0%, rgba(250, 247, 242, 0.7) 50%, var(--ivory-bg) 100%); pointer-events: none;"></div>
      </div>

      <!-- Tarjeta Flotante con Tipografía de Perfumería Francesa y Líneas Doradas -->
      <div class="splash-bottom-content" style="background: var(--ivory-bg); padding: 12px 22px 28px; margin-top: -24px; position: relative; z-index: 10;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
          <span class="parfumerie-kicker">★ 4.9 • EXPÉRIENCE EXCLUSIVE</span>
          <span style="font-size: 10.5px; font-weight: 700; color: #16a34a; display: flex; align-items: center;">
            <span class="live-pulse-dot"></span> Turnos Disponibles
          </span>
        </div>

        <h1 class="parfumerie-headline" style="margin-bottom: 6px;">
          ${AppState.salon.splashTitle || "L'Art de la Beauté,"}<br />
          <span class="parfumerie-italic">${AppState.salon.splashSubtitle || 'Uñas & Peluquería de Autor'}</span>
        </h1>
        <p class="parfumerie-sub" style="margin-bottom: 18px;">
          ${AppState.salon.tagline || 'Rituels de beauté exclusifs • Soins signature & stylisme sur mesure'}
        </p>

        <!-- Botón Dorado de Alta Costura con Haz de Luz en Movimiento -->
        <button type="button" class="splash-btn-primary btn-gold-shimmer" onclick="navigateTo('services')">
          <span>Reservar Cita Online</span>
          <span class="splash-btn-circle" style="color: var(--gold-dark);">→</span>
        </button>

        <button type="button" class="splash-btn-secondary" onclick="navigateTo('home')">
          <span>Découvrir la Maison & Services</span>
          <span style="font-size: 11px;">▼</span>
        </button>

        <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin-top: 14px; padding-top: 10px; border-top: 1px dashed var(--gold-line); font-size: 10.5px; color: var(--accent-dark); font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase;">
          <span>✦ Insumos Esterilizados</span>
          <span>•</span>
          <span>✦ Puntualidad 100%</span>
          <span>•</span>
          <span>✦ Seña Segura</span>
        </div>
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
      <header class="app-header" style="border-bottom: 1px solid var(--gold-line);">
        <div class="app-header-left">
          <div class="mirrored-icon-badge" style="width: 38px; height: 38px;">
            ${Icons.sparkles}
          </div>
          <div>
            <div style="display: flex; align-items: center; gap: 6px;">
              <span class="parfumerie-kicker">MAISON DE BEAUTÉ</span>
              <span style="font-size: 9.5px; color: #16a34a; font-weight: 800; display: flex; align-items: center;">
                <span class="live-pulse-dot"></span> Abierto Hoy
              </span>
            </div>
            <h2 class="app-header-title" style="font-family: var(--font-parfumerie); font-size: 20px; font-weight: 600;">${AppState.salon.name || 'Beauty Studio'}</h2>
          </div>
        </div>
        <button type="button" class="mirrored-icon-badge" onclick="navigateTo('panel')" title="Acceso Dueño" style="width: 38px; height: 38px; cursor: pointer; border-radius: 50%;">
          ${Icons.lock}
        </button>
      </header>

      <!-- Cinta Animada de Perfumería Francesa (Recurso de Movimiento) -->
      <div class="parfumerie-marquee">
        <div class="parfumerie-marquee-track">
          <span class="parfumerie-marquee-item">✦ HAUTE COIFFURE</span>
          <span class="parfumerie-marquee-item">✦ ONGLERIE D'ART</span>
          <span class="parfumerie-marquee-item">✦ SOINS SIGNATURE</span>
          <span class="parfumerie-marquee-item">✦ NAIL ART FRANÇAIS</span>
          <span class="parfumerie-marquee-item">✦ BALAYAGE DE LUXE</span>
          <span class="parfumerie-marquee-item">✦ COLORATION EXPERTE</span>
          <span class="parfumerie-marquee-item">✦ HAUTE COIFFURE</span>
          <span class="parfumerie-marquee-item">✦ ONGLERIE D'ART</span>
          <span class="parfumerie-marquee-item">✦ SOINS SIGNATURE</span>
        </div>
      </div>

      <div class="home-content">
        <!-- Buscador Rápido con Líneas Doradas e Ícono Espejado -->
        <div class="home-search-bar gold-card" onclick="navigateTo('services')">
          <span style="color: var(--accent-dark); display: flex;">${Icons.search}</span>
          <span class="search-placeholder">Buscar uñas esculpidas, balayage, pestañas...</span>
          <div class="mirrored-icon-badge" style="width: 28px; height: 28px; border-radius: 8px;">
            ${Icons.scissors}
          </div>
        </div>

        <!-- Banner Promocional con Líneas Doradas (Estilo Alta Costura) -->
        <div class="promo-banner-card gold-card" onclick="navigateTo('services')">
          <div class="promo-banner-text">
            <span class="gold-badge" style="padding: 3px 10px; font-size: 9.5px;">${AppState.salon.bannerBadge || 'Collection Privée'}</span>
            <h3 class="promo-title" style="font-family: var(--font-parfumerie); font-size: 18px; font-weight: 600;">${AppState.salon.bannerTitle || '20% OFF en Servicios'}</h3>
            <p class="promo-subtitle">${AppState.salon.bannerSubtitle || 'Válido agendando tu turno online'}</p>
            <button type="button" class="promo-btn btn-gold-shimmer" style="margin-top: 8px;">
              <span>Agendar Ahora</span>
              <span>→</span>
            </button>
          </div>
          <div class="promo-banner-media" style="border: 1px solid var(--gold-line);">
            <img src="${AppState.salon.bannerImage || './assets/service-hair-balayage.jpg'}" alt="Promoción" class="promo-img" onerror="this.src='./assets/studio-nails.jpg'" />
          </div>
        </div>

        <!-- Próximo Turno o Estado de Reserva -->
        <div class="next-appointment-card gold-card">
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
                <div class="popular-service-pill-card gold-card" onclick="window.selectServiceAndBook('${s.id}')">
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

        <!-- Accesos directos con Íconos Espejados y Líneas Doradas -->
        <div class="quick-actions-grid">
          <div class="quick-action-tile gold-card" onclick="navigateTo('services')">
            <div class="mirrored-icon-badge">${Icons.scissors}</div>
            <strong style="font-family: var(--font-parfumerie); font-size: 14px;">Tous les Soins</strong>
            <span>${AppState.services.length} servicios en catálogo</span>
          </div>
          <div class="quick-action-tile gold-card" onclick="navigateTo('inspo')">
            <div class="mirrored-icon-badge">${Icons.sparkles}</div>
            <strong style="font-family: var(--font-parfumerie); font-size: 14px;">Galerie & Looks</strong>
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
            <div class="service-card gold-card">
              <img src="${s.image || './assets/studio-nails.jpg'}" alt="${s.name}" class="service-card-photo" style="border: 1px solid var(--gold-line);" onerror="this.src='./assets/studio-nails.jpg'" />
              <div class="service-card-body">
                <h3 style="font-family: var(--font-parfumerie); font-size: 15px;">${s.name}</h3>
                <div class="service-meta">
                  <span class="duration-badge" style="background: var(--accent-soft); color: var(--accent-dark); border: 1px solid var(--gold-line);">⏱️ ${s.duration || 60}m</span>
                  <span style="font-size: 11px; color: var(--text-muted); font-family: var(--font-parfumerie);">${cat ? cat.name : 'Soin'}</span>
                  <span class="service-price" style="color: var(--accent-dark);">${Number(s.price || 0).toLocaleString('es-AR')}</span>
                </div>
              </div>
              <button type="button" class="btn-book-service btn-gold-shimmer" onclick="window.selectServiceAndBook('${s.id}')">
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
  AppState.bookingStep = 2; // Salta directo a elegir fecha y horario como en Daniela Gimenez
  const srv = AppState.services.find((s) => s.id === serviceId);
  showToast(`💅 Trabajo: ${srv ? srv.name : ''}. Elegí fecha y horario:`);
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
  const item = (AppState.inspo || []).find((i) => i.id === inspoId);
  AppState.bookingDraft.inspoId = inspoId;
  AppState.bookingDraft.inspoTitle = title;
  AppState.bookingDraft.inspoImage = item ? item.image : null;

  showToast(`✨ Look seleccionado: ${title}. Elegí el trabajo base:`);
  navigateTo('services');
};

window.clearBookingInspo = () => {
  AppState.bookingDraft.inspoId = null;
  AppState.bookingDraft.inspoTitle = null;
  AppState.bookingDraft.inspoImage = null;
  showToast('Look de referencia removido');
  renderApp();
};

// ----------------------------------------------------------------------------
// PANTALLA 5: MI TURNO (PROCESO DE RESERVA NATIVO - PASO 3)
// ----------------------------------------------------------------------------
function renderBooking() {
  const currentStep = AppState.bookingStep || 1;
  const selectedService = AppState.services.find((s) => s.id === AppState.bookingDraft.serviceId);
  const selectedAddonsList = (AppState.addons || []).filter((a) =>
    (AppState.bookingDraft.selectedAddonIds || []).includes(a.id)
  );
  const addonsTotal = selectedAddonsList.reduce((acc, curr) => acc + Number(curr.price || 0), 0);
  const addonsDuration = selectedAddonsList.reduce((acc, curr) => acc + Number(curr.duration || 0), 0);
  const totalPrice = selectedService ? Number(selectedService.price || 0) + addonsTotal : 0;
  const totalDuration = selectedService ? Number(selectedService.duration || 60) + addonsDuration : 0;

  const depositPercent = AppState.salon.depositPercent !== undefined ? AppState.salon.depositPercent : 50;
  const depositAmount = selectedService ? Math.round((totalPrice * depositPercent) / 100) : 0;
  const balanceAtSalon = totalPrice - depositAmount;

  const upcomingDays = getUpcomingDays(10);
  if (!AppState.bookingDate && upcomingDays.length > 0) {
    AppState.bookingDate = upcomingDays[0].dateStr;
  }

  // Comprobar si hay datos previos guardados en localStorage
  let savedName = '';
  let savedPhone = '';
  try {
    savedName = localStorage.getItem('beauty_client_name') || localStorage.getItem('dg_client_name') || '';
    savedPhone = localStorage.getItem('beauty_client_phone') || localStorage.getItem('dg_client_phone') || '';
  } catch (e) {}

  // Si ya se confirmó el turno, mostrar el Paso 4
  if (currentStep === 4 && AppState.lastBookedAppt) {
    return renderBookingStep4(AppState.lastBookedAppt);
  }

  return `
    <div class="screen-viewport">
      <header class="app-header">
        <div class="app-header-left">
          <button type="button" class="header-back-btn" onclick="window.handleWizardBack()">${Icons.chevronLeft}</button>
          <div>
            <h2 class="app-header-title">Mi Turno Online</h2>
            <p style="font-size: 11px; color: var(--gold-primary); font-weight: 700;">
              Paso ${currentStep} de 3 • ${currentStep === 1 ? 'Servicio' : currentStep === 2 ? 'Fecha y Horario' : 'Confirmar'}
            </p>
          </div>
        </div>
      </header>

      <div class="booking-flow-container">
        <!-- Stepper Visual de 3 Pasos (Como en Daniela Gimenez) -->
        <div class="booking-wizard-stepper">
          <div class="stepper-step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'done' : ''}" onclick="window.setBookingStep(1)">
            <div class="step-num">${currentStep > 1 ? '✓' : '1'}</div>
            <span>Servicio</span>
          </div>
          <div class="stepper-line ${currentStep >= 2 ? 'active' : ''}"></div>
          <div class="stepper-step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'done' : ''}" onclick="window.setBookingStep(2)">
            <div class="step-num">${currentStep > 2 ? '✓' : '2'}</div>
            <span>Horario</span>
          </div>
          <div class="stepper-line ${currentStep >= 3 ? 'active' : ''}"></div>
          <div class="stepper-step ${currentStep >= 3 ? 'active' : ''}" onclick="window.setBookingStep(3)">
            <div class="step-num">3</div>
            <span>Confirmar</span>
          </div>
        </div>

        <!-- ========================================== -->
        <!-- PASO 1: SELECCIONAR SERVICIO & ADICIONALES -->
        <!-- ========================================== -->
        ${currentStep === 1 ? `
          <div class="step-box gold-card">
            <div class="step-title">
              <span>💅 1. Trabajo a Realizar</span>
            </div>
            ${selectedService ? `
              <div class="selected-service-summary" style="border: 1px solid var(--gold-line);">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <img src="${selectedService.image || './assets/studio-nails.jpg'}" alt="${selectedService.name}" style="width: 48px; height: 48px; border-radius: 10px; object-fit: cover;" onerror="this.src='./assets/studio-nails.jpg'" />
                  <div>
                    <strong style="font-size: 13px; color: var(--text-main);">${selectedService.name}</strong>
                    <p style="font-size: 11.5px; color: var(--text-muted); margin-top: 1px;">
                      ⏱️ ${selectedService.duration || 60} min • ${Number(selectedService.price).toLocaleString('es-AR')}
                    </p>
                  </div>
                </div>
                <button type="button" class="btn-secondary-action" style="padding: 6px 10px; font-size: 11px;" onclick="navigateTo('services')">
                  Cambiar
                </button>
              </div>

              ${AppState.bookingDraft.inspoTitle ? `
                <div style="display: flex; align-items: center; justify-content: space-between; background: var(--accent-soft); border: 1.5px solid var(--accent-primary); border-radius: 12px; padding: 10px 12px; margin-top: 10px;">
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <img src="${AppState.bookingDraft.inspoImage || './assets/studio-nails.jpg'}" alt="Inspo" style="width: 42px; height: 42px; border-radius: 8px; object-fit: cover;" onerror="this.src='./assets/studio-nails.jpg'" />
                    <div>
                      <span style="font-size: 10px; font-weight: 800; color: var(--accent-dark); text-transform: uppercase; letter-spacing: 0.05em;">💅 Look de Referencia Seleccionado</span>
                      <div style="font-size: 12.5px; font-weight: 700; color: var(--text-main); line-height: 1.2;">${AppState.bookingDraft.inspoTitle}</div>
                    </div>
                  </div>
                  <button type="button" style="background: none; border: none; font-size: 11px; color: var(--accent-dark); font-weight: 700; cursor: pointer; padding: 4px;" onclick="window.clearBookingInspo()">✕ Quitar</button>
                </div>
              ` : ''}

              <!-- Adicionales Opcionales -->
              <div style="margin-top: 14px; border-top: 1px dashed rgba(0,0,0,0.08); padding-top: 12px;">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                  <span style="font-size: 12px; font-weight: 700; color: var(--text-main);">✨ Sumar Adicionales al Turno:</span>
                  <span style="font-size: 11px; color: var(--gold-primary); font-weight: 600;">Opcional</span>
                </div>
                
                <div class="addons-grid">
                  ${(AppState.addons || []).filter(a => a.active !== false).map(addon => {
                    const isSelected = (AppState.bookingDraft.selectedAddonIds || []).includes(addon.id);
                    return `
                      <div class="addon-card-item ${isSelected ? 'selected' : ''}" onclick="window.toggleBookingAddon('${addon.id}')">
                        <div class="addon-info-left">
                          <div class="addon-checkbox">${isSelected ? '✓' : ''}</div>
                          <div>
                            <div class="addon-name">${addon.name}</div>
                            <div class="addon-meta">+${addon.duration || 15} min</div>
                          </div>
                        </div>
                        <div class="addon-price-tag">+${Number(addon.price).toLocaleString('es-AR')}</div>
                      </div>
                    `;
                  }).join('')}
                </div>

                <!-- Resumen Dinámico de Totales -->
                <div class="total-summary-card gold-card">
                  <div class="total-summary-row">
                    <span>${selectedService.name} (${selectedService.duration || 60} min):</span>
                    <span>${Number(selectedService.price).toLocaleString('es-AR')}</span>
                  </div>
                  ${selectedAddonsList.map(a => `
                    <div class="total-summary-row">
                      <span>+ ${a.name} (${a.duration || 15} min):</span>
                      <span>+${Number(a.price).toLocaleString('es-AR')}</span>
                    </div>
                  `).join('')}
                  <div class="total-summary-row main">
                    <span>Total Estimado (~${totalDuration} min):</span>
                    <span style="color: var(--gold-primary);">${Number(totalPrice).toLocaleString('es-AR')}</span>
                  </div>
                </div>
              </div>

              <div class="wizard-nav-strip">
                <button type="button" class="btn-next btn-gold-shimmer" onclick="window.setBookingStep(2)">
                  <span>Paso 2: Elegir Fecha y Horario</span>
                  <span>→</span>
                </button>
              </div>
            ` : `
              <div style="text-align: center; padding: 20px 0;">
                <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 12px;">Elegí el servicio que deseas realizarte:</p>
                <button type="button" class="btn-primary-action btn-gold-shimmer" onclick="navigateTo('services')" style="width: 100%;">
                  Ver Catálogo de Servicios
                </button>
              </div>
            `}
          </div>
        ` : ''}

        <!-- ============================================== -->
        <!-- PASO 2: ELEGIR FECHA Y HORARIO (MAÑANA & TARDE) -->
        <!-- ============================================== -->
        ${currentStep === 2 ? `
          <div class="step-box gold-card">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
              <div class="step-title" style="margin: 0;">
                <span>📅 2. Selecciona Fecha y Horario</span>
              </div>
              <span class="gold-badge" style="font-size: 9.5px;">~${totalDuration} min</span>
            </div>
            <p style="font-size: 11.5px; color: var(--text-muted); margin-bottom: 10px;">
              Atención con turno previo. Horarios sincronizados en tiempo real:
            </p>
            
            <!-- Selector horizontal de días -->
            <div class="dates-scroll-container">
              ${upcomingDays.map((d) => `
                <div class="calendar-day-card ${AppState.bookingDate === d.dateStr ? 'active' : ''}" onclick="window.selectBookingDate('${d.dateStr}')">
                  <span class="cal-weekday">${d.weekday}</span>
                  <span class="cal-day-num">${d.dayNum}</span>
                  <span class="cal-month">${d.month}</span>
                </div>
              `).join('')}
            </div>

            <!-- Grilla interactiva de horarios por Turno Mañana y Tarde -->
            <div style="margin-top: 14px;">
              <!-- TURNO MAÑANA -->
              <div class="slot-section-header">
                <span class="icon">🌅</span>
                <span>Turno Mañana (09:00 a 13:00)</span>
              </div>
              <div class="slots-interactive-grid">
                ${['09:00', '10:00', '11:00', '12:00', '13:00'].map((slot) => {
                  const occupied = isSlotOccupied(AppState.bookingDate, slot);
                  const isSelected = AppState.bookingSlot === slot;

                  if (occupied) {
                    return `
                      <button type="button" class="slot-btn occupied" disabled title="Horario ya reservado">
                        <span>${slot}</span>
                        <span style="font-size: 8.5px; font-weight: 800;">Ocupado</span>
                      </button>
                    `;
                  }

                  return `
                    <button type="button" class="slot-btn ${isSelected ? 'active' : ''}" onclick="window.selectBookingSlot('${slot}')">
                      <span>${slot}</span>
                      <span style="font-size: 9px; opacity: 0.85;">Disponible</span>
                    </button>
                  `;
                }).join('')}
              </div>

              <!-- TURNO TARDE -->
              <div class="slot-section-header" style="margin-top: 16px;">
                <span class="icon">🌇</span>
                <span>Turno Tarde (14:00 a 20:00)</span>
              </div>
              <div class="slots-interactive-grid">
                ${['14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'].map((slot) => {
                  const occupied = isSlotOccupied(AppState.bookingDate, slot);
                  const isSelected = AppState.bookingSlot === slot;

                  if (occupied) {
                    return `
                      <button type="button" class="slot-btn occupied" disabled title="Horario ya reservado">
                        <span>${slot}</span>
                        <span style="font-size: 8.5px; font-weight: 800;">Ocupado</span>
                      </button>
                    `;
                  }

                  return `
                    <button type="button" class="slot-btn ${isSelected ? 'active' : ''}" onclick="window.selectBookingSlot('${slot}')">
                      <span>${slot}</span>
                      <span style="font-size: 9px; opacity: 0.85;">Disponible</span>
                    </button>
                  `;
                }).join('')}
              </div>
            </div>

            <!-- Previsualización del horario elegido -->
            ${AppState.bookingSlot ? `
              <div style="margin-top: 14px; background: rgba(197, 155, 39, 0.08); border: 1px solid var(--gold-line); border-radius: 12px; padding: 10px 14px; display: flex; align-items: center; justify-content: space-between;">
                <div>
                  <span style="font-size: 10px; font-weight: 800; color: var(--gold-primary); text-transform: uppercase;">Turno Seleccionado</span>
                  <div style="font-size: 13px; font-weight: 700; color: var(--text-main);">
                    📅 ${formatDateDisplay(AppState.bookingDate)} • ⏰ ${AppState.bookingSlot} hs
                  </div>
                </div>
                <span class="gold-badge" style="font-size: 10px;">Listo</span>
              </div>
            ` : ''}

            <!-- Navegación del Paso 2 -->
            <div class="wizard-nav-strip">
              <button type="button" class="btn-back" onclick="window.setBookingStep(1)">
                <span>← Servicio</span>
              </button>
              <button type="button" class="btn-next btn-gold-shimmer" ${!AppState.bookingSlot ? 'disabled' : ''} onclick="window.handleAdvanceToStep3()">
                <span>Paso 3: Confirmar Turno</span>
                <span>→</span>
              </button>
            </div>
          </div>
        ` : ''}

        <!-- ============================================== -->
        <!-- PASO 3: CONFIRMAR DATOS, RESUMEN & SEÑA       -->
        <!-- ============================================== -->
        ${currentStep === 3 ? `
          <div class="step-box gold-card">
            <div class="step-title">
              <span>✍️ 3. Confirma tus Datos de Contacto</span>
            </div>
            <p style="font-size: 11.5px; color: var(--text-muted); margin-bottom: 12px;">
              Te enviaremos la confirmación directa a tu WhatsApp:
            </p>

            <!-- Botón de Auto-completado rápido si ya reservó antes (Como en Daniela Gimenez) -->
            ${(savedName && savedPhone) ? `
              <button type="button" class="btn-quick-autofill" onclick="window.applySavedClientData('${savedName}', '${savedPhone}')">
                <div>
                  <span>✨ Usar mis datos anteriores:</span>
                  <strong style="margin-left: 4px;">${savedName} (${savedPhone})</strong>
                </div>
                <span style="font-size: 10.5px; text-decoration: underline;">Completar</span>
              </button>
            ` : ''}

            <div class="form-group-clean">
              <label>Tu Nombre y Apellido</label>
              <input type="text" placeholder="Ej: Valentina Gómez" id="client-name-input" value="${AppState.bookingDraft.clientName || savedName || ''}" oninput="AppState.bookingDraft.clientName=this.value" required />
            </div>

            <div class="form-group-clean">
              <label>Tu Teléfono de WhatsApp</label>
              <input type="tel" placeholder="Ej: 11 2345 6789" id="client-phone-input" value="${AppState.bookingDraft.clientPhone || savedPhone || ''}" oninput="AppState.bookingDraft.clientPhone=this.value" required />
            </div>

            <div class="form-group-clean">
              <label>Notas o Preferencias (Opcional)</label>
              <textarea id="client-notes-input" rows="2" placeholder="Ej: Alergia a olores fuertes, uñas frágiles, o detalles para la profesional...">${AppState.bookingDraft.clientNotes || ''}</textarea>
            </div>

            <!-- Resumen Completo del Turno & Seña -->
            <div class="deposit-info-box gold-card" style="margin-top: 14px;">
              <span style="font-size: 10px; font-weight: 800; color: var(--gold-primary); letter-spacing: 0.08em; text-transform: uppercase;">
                Resumen de Reserva & Seña Obligatoria
              </span>
              <div style="font-size: 14px; font-weight: 800; color: var(--text-main); margin-top: 4px;">
                ${selectedService ? selectedService.name : 'Servicio'}
              </div>
              <div style="font-size: 12px; color: var(--gold-primary); font-weight: 700; margin-top: 2px;">
                📅 ${formatDateDisplay(AppState.bookingDate)} a las ${AppState.bookingSlot} hs (~${totalDuration} min)
              </div>

              <div style="display: flex; justify-content: space-between; border-top: 1px dashed rgba(0,0,0,0.08); margin-top: 10px; padding-top: 8px; font-size: 12px;">
                <span>Total del Servicio:</span>
                <strong>${Number(totalPrice).toLocaleString('es-AR')}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 12px; color: #16a34a; font-weight: 700;">
                <span>Seña Requerida (${depositPercent}%):</span>
                <span>+${Number(depositAmount).toLocaleString('es-AR')}</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 12px; color: var(--text-muted); padding-bottom: 8px; border-bottom: 1px dashed rgba(0,0,0,0.08);">
                <span>Saldo en el Salón:</span>
                <span>${Number(balanceAtSalon).toLocaleString('es-AR')}</span>
              </div>

              <p style="font-size: 11.5px; color: var(--text-muted); margin-top: 8px;">
                Congelá tu turno transfiriendo la seña al siguiente Alias:
              </p>
              <div class="alias-copy-row">
                <div class="alias-box">${AppState.salon.alias || 'MAISON.BEAUTE.MP'}</div>
                <button type="button" class="btn-copy-alias" onclick="window.copyAlias()">Copiar</button>
              </div>
              ${AppState.salon.aliasHolder ? `<p style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">Titular: <strong>${AppState.salon.aliasHolder}</strong></p>` : ''}
            </div>

            <!-- Botones de Acción del Paso 3 -->
            <div class="wizard-nav-strip">
              <button type="button" class="btn-back" onclick="window.setBookingStep(2)">
                <span>← Horario</span>
              </button>
              <button type="button" class="btn-next btn-gold-shimmer" onclick="window.confirmBookingWhatsapp()">
                <span>Confirmar y Abrir WhatsApp</span>
                <span>📲</span>
              </button>
            </div>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

// ============================================================================
// PASO 4: PANTALLA DE TURNO CONFIRMADO (ESTILO DANIELA GIMENEZ ELEVADO)
// ============================================================================
function renderBookingStep4(appt) {
  const gCalUrl = getGoogleCalendarUrl(appt);
  const salonPhone = (AppState.salon.phone || '5491123456789').replace(/\D/g, '');
  const code = appt.code || appt.id.replace('appt_', 'MB-');

  const waText = encodeURIComponent(
    `¡Hola ${AppState.salon.name || 'Maison de Beauté'}! Agendé mi turno para ${appt.serviceName} el día ${appt.date} a las ${appt.slot} hs.\n\n` +
    `🏷️ *Código de Turno:* ${code}\n` +
    `👤 *Clienta:* ${appt.clientName}\n` +
    `💰 *Total:* ${Number(appt.servicePrice).toLocaleString('es-AR')}\n` +
    `💳 *Seña requerida:* ${Number(appt.depositAmount).toLocaleString('es-AR')}\n\n` +
    `Adjunto comprobante de transferencia para congelar mi lugar. ¡Muchas gracias!`
  );
  const waUrl = `https://wa.me/${salonPhone}?text=${waText}`;

  return `
    <div class="screen-viewport">
      <header class="app-header">
        <div class="app-header-left">
          <div class="mirrored-icon-badge" style="width: 32px; height: 32px; font-size: 14px;">✨</div>
          <h2 class="app-header-title">¡Turno Confirmado!</h2>
        </div>
      </header>

      <div class="booking-flow-container">
        <div class="confirmation-card-hero gold-card">
          <div class="confirmation-badge-circle">✓</div>
          <span class="gold-badge" style="font-size: 10px; margin-bottom: 6px;">¡Turno Agendado con Éxito!</span>
          
          <h2 style="font-size: 22px; font-weight: 800; color: var(--text-main); margin-top: 6px;">
            Te esperamos, ${appt.clientName}
          </h2>
          <p style="font-size: 12.5px; color: var(--text-muted); max-width: 320px; margin: 4px auto 10px;">
            Tu turno ya fue reservado en nuestra agenda. Enviá el comprobante de la seña por WhatsApp para confirmarlo:
          </p>

          <div class="confirmation-code-box">
            Código: ${code}
          </div>

          <!-- Resumen del Servicio -->
          <div style="background: var(--card-bg); border: 1px solid rgba(0,0,0,0.06); border-radius: 14px; padding: 12px 14px; text-align: left; margin: 12px 0;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed rgba(0,0,0,0.08); padding-bottom: 8px;">
              <div>
                <strong style="font-size: 13.5px; color: var(--text-main);">${appt.serviceName}</strong>
                <div style="font-size: 11.5px; color: var(--gold-primary); font-weight: 700;">
                  📅 ${formatDateDisplay(appt.date)} • ⏰ ${appt.slot} hs (~${appt.serviceDuration || 60} min)
                </div>
              </div>
              <strong style="font-size: 15px; color: var(--text-main);">${Number(appt.servicePrice).toLocaleString('es-AR')}</strong>
            </div>

            <div style="display: flex; justify-content: space-between; font-size: 12px; margin-top: 8px; color: #16a34a; font-weight: 700;">
              <span>Seña requerida:</span>
              <span>+${Number(appt.depositAmount).toLocaleString('es-AR')}</span>
            </div>
          </div>

          <!-- Botón Principal: WhatsApp -->
          <a href="${waUrl}" target="_blank" class="btn-primary-action btn-gold-shimmer" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; background: #16a34a; text-decoration: none; padding: 14px; border-radius: 14px; font-size: 13px; font-weight: 800; color: #fff;">
            <span>${Icons.whatsapp}</span>
            <span>Enviar Comprobante por WhatsApp</span>
          </a>

          <!-- Botón Secundario: Google Calendar -->
          <a href="${gCalUrl}" target="_blank" class="btn-secondary-action" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; text-decoration: none; margin-top: 8px; padding: 12px; border-radius: 14px; font-size: 12px; font-weight: 700;">
            <span>📅</span>
            <span>Agregar a mi Google Calendar</span>
          </a>

          <!-- Botón Volver -->
          <button type="button" class="btn-secondary-action" style="width: 100%; margin-top: 8px; border: none; background: none; font-size: 11.5px; color: var(--text-muted); cursor: pointer;" onclick="window.finishBookingAndReset()">
            ← Agendar otro turno o Volver al Inicio
          </button>
        </div>
      </div>
    </div>
  `;
}

window.setBookingStep = (step) => {
  if (step === 2 && !AppState.bookingDraft.serviceId) {
    showToast('⚠️ Primero elegí un servicio');
    return;
  }
  if (step === 3 && (!AppState.bookingDate || !AppState.bookingSlot)) {
    showToast('⚠️ Primero elegí fecha y horario');
    return;
  }
  AppState.bookingStep = step;
  renderApp();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.handleWizardBack = () => {
  const step = AppState.bookingStep || 1;
  if (step === 1) {
    navigateTo('services');
  } else if (step === 2) {
    AppState.bookingStep = 1;
    renderApp();
  } else if (step === 3) {
    AppState.bookingStep = 2;
    renderApp();
  } else {
    navigateTo('home');
  }
};

window.handleAdvanceToStep3 = () => {
  if (!AppState.bookingSlot) {
    showToast('⚠️ Elegí un horario disponible para continuar');
    return;
  }
  AppState.bookingStep = 3;
  renderApp();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.applySavedClientData = (name, phone) => {
  AppState.bookingDraft.clientName = name;
  AppState.bookingDraft.clientPhone = phone;
  const nameInput = document.getElementById('client-name-input');
  const phoneInput = document.getElementById('client-phone-input');
  if (nameInput) nameInput.value = name;
  if (phoneInput) phoneInput.value = phone;
  showToast('✨ Datos completados automáticamente');
};

window.finishBookingAndReset = () => {
  AppState.bookingStep = 1;
  AppState.bookingDraft = {
    serviceId: null,
    inspoId: null,
    inspoTitle: null,
    inspoImage: null,
    date: null,
    slot: null,
    clientName: '',
    clientPhone: '',
    clientNotes: '',
    selectedAddonIds: []
  };
  AppState.bookingSlot = '';
  navigateTo('home');
};

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
          <div class="mirrored-icon-badge" style="width: 32px; height: 32px; font-size: 14px;">
            ${Icons.store}
          </div>
          <div>
            <h2 class="app-header-title">Panel de Control</h2>
            <p style="font-size: 10px; color: var(--gold-primary); font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em;">
              ${AppState.salon.name || 'Maison de Beauté'}
            </p>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 6px;">
          <button type="button" class="header-icon-action" onclick="window.openPanelSubView('salon')" title="Configuración de la Tienda">
            ${Icons.store}
            <span>Tienda</span>
          </button>
          <button type="button" class="btn-danger-action" style="padding: 6px 10px; font-size: 11px;" onclick="window.lockOwnerPanel()">
            Salir
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

        <!-- 4. Finanzas y Caja Completo -->
        <div class="owner-big-card gold-card" onclick="window.openPanelSubView('finances')">
          <div class="big-card-icon" style="background: #dcfce7; color: #16a34a;">${Icons.dollar}</div>
          <div>
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <h3>Finanzas & Caja Completo</h3>
              <span class="gold-badge" style="font-size: 9.5px; padding: 2px 6px;">Arqueo en Vivo</span>
            </div>
            <p>Arqueo de caja, efectivo vs bancos, señas y balances</p>
          </div>
        </div>

        <!-- 5. Configuración de la Tienda -->
        <div class="owner-big-card gold-card" onclick="window.openPanelSubView('salon')">
          <div class="big-card-icon" style="background: rgba(197, 155, 39, 0.15); color: var(--gold-primary);">${Icons.store}</div>
          <div>
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <h3>Configuración de la Tienda</h3>
              <span class="gold-badge" style="font-size: 9.5px; padding: 2px 6px;">Ajustes & Cuentas</span>
            </div>
            <p>Datos comerciales, horarios, cuentas bancarias y PIN</p>
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
                    ${(() => {
                      const clientObj = (AppState.clients || []).find(c => (appt.clientId && c.id === appt.clientId) || (appt.clientPhone && c.phone === appt.clientPhone));
                      const visitCount = clientObj ? (clientObj.history || []).length : 1;
                      if (visitCount >= 5) return '<span class="client-badge vip">⭐ VIP</span>';
                      if (visitCount >= 2) return '<span class="client-badge frequent">✨ Frecuente</span>';
                      return '<span class="client-badge new">🌱 Nueva</span>';
                    })()}
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
                    <strong style="color: var(--text-main);">${Number(appt.servicePrice || 0).toLocaleString('es-AR')}</strong>
                  </div>
                  ${appt.addons && appt.addons.length > 0 ? `
                    <div style="font-size: 11px; color: var(--accent-dark); font-weight: 600; margin-top: 2px;">
                      ✨ Adicionales: ${appt.addons.map((a) => a.name).join(', ')}
                    </div>
                  ` : ''}
                  ${appt.inspoTitle ? `
                    <div style="display: flex; align-items: center; gap: 8px; margin-top: 5px; padding: 4px 8px; background: rgba(0,0,0,0.03); border-radius: 8px;">
                      ${appt.inspoImage ? `<img src="${appt.inspoImage}" style="width: 26px; height: 26px; border-radius: 5px; object-fit: cover;" onerror="this.style.display='none'" />` : ''}
                      <span style="font-size: 11px; color: var(--text-main); font-weight: 600;">💅 Look: <strong>${appt.inspoTitle}</strong></span>
                    </div>
                  ` : ''}
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
                    appt.status !== 'completed' && appt.status !== 'cancelled'
                      ? `
                    <button type="button" class="btn-agenda-action" style="background: rgba(0,0,0,0.05); color: var(--text-main);" onclick="window.handleOpenRescheduleModal('${appt.id}')">
                      📅 Reprogramar
                    </button>
                  `
                      : ''
                  }
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

                ${AppState.reschedulingApptId === appt.id ? `
                  <div class="reschedule-modal-card" style="margin-top: 10px; padding: 12px; background: var(--accent-soft); border: 1.5px solid var(--accent-primary); border-radius: 14px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                      <strong style="font-size: 13px; color: var(--text-main);">📅 Reprogramar Turno de ${appt.clientName}</strong>
                      <button type="button" style="background: none; border: none; font-size: 14px; cursor: pointer; color: var(--text-muted);" onclick="window.handleCloseRescheduleModal()">✕</button>
                    </div>
                    <p style="font-size: 11px; color: var(--text-muted); margin-bottom: 8px;">Seleccioná la nueva fecha y horario:</p>
                    <div style="display: flex; gap: 8px; margin-bottom: 8px;">
                      <input type="date" min="${getTodayDateStr()}" value="${AppState.rescheduleDate || appt.date}" onchange="window.handleRescheduleDateChange(this.value)" style="flex: 1; padding: 7px 10px; border-radius: 8px; border: 1px solid rgba(0,0,0,0.12); font-size: 12px; background: var(--card-bg); color: var(--text-main);" />
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-bottom: 10px;">
                      ${SALON_SLOTS.map((slot) => {
                        const targetDate = AppState.rescheduleDate || appt.date;
                        const isOccupied = isSlotOccupied(targetDate, slot);
                        const isOriginalSlot = targetDate === appt.date && slot === appt.slot;
                        const isSelected = AppState.rescheduleSlot === slot;
                        const disabled = isOccupied && !isOriginalSlot;
                        return `
                          <button type="button" style="padding: 6px 2px; font-size: 11px; font-weight: 700; border-radius: 6px; border: 1.5px solid ${isSelected ? 'var(--accent-primary)' : 'rgba(0,0,0,0.08)'}; background: ${isSelected ? 'var(--accent-primary)' : disabled ? 'rgba(0,0,0,0.04)' : 'var(--card-bg)'}; color: ${isSelected ? '#fff' : disabled ? 'var(--text-muted)' : 'var(--text-main)'}; cursor: ${disabled ? 'not-allowed' : 'pointer'};" ${disabled ? 'disabled' : ''} onclick="window.handleRescheduleSlotSelect('${slot}')">
                            ${slot}
                          </button>
                        `;
                      }).join('')}
                    </div>
                    <div style="display: flex; gap: 6px;">
                      <button type="button" class="btn-primary-action" style="flex: 1; padding: 8px; font-size: 11px; white-space: nowrap;" onclick="window.handleConfirmReschedule('${appt.id}', true)">
                        💾 Guardar y Avisar WhatsApp
                      </button>
                      <button type="button" class="btn-secondary-action" style="padding: 8px 10px; font-size: 11px;" onclick="window.handleConfirmReschedule('${appt.id}', false)">
                        Solo Guardar
                      </button>
                    </div>
                  </div>
                ` : ''}
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
  const currentTab = AppState.storeConfigTab || 'general';

  return `
    <div class="screen-viewport">
      <header class="app-header">
        <div class="app-header-left">
          <button type="button" class="header-back-btn" onclick="window.openPanelSubView('menu')">${Icons.chevronLeft}</button>
          <div style="display: flex; align-items: center; gap: 8px;">
            <div class="mirrored-icon-badge" style="width: 30px; height: 30px; font-size: 13px;">
              ${Icons.store}
            </div>
            <div>
              <h2 class="app-header-title">Configuración de la Tienda</h2>
              <p style="font-size: 11px; color: var(--text-muted); font-weight: 600;">${salon.name || 'Maison de Beauté'} • Ajustes y Cuentas</p>
            </div>
          </div>
        </div>
      </header>

      <div class="panel-subview">
        <!-- Barra de Pestañas de la Tienda -->
        <div class="store-config-tabs">
          <button type="button" class="store-tab-btn ${currentTab === 'general' ? 'active' : ''}" onclick="window.setStoreConfigTab('general')">
            <span>🏪 Negocio</span>
          </button>
          <button type="button" class="store-tab-btn ${currentTab === 'hours' ? 'active' : ''}" onclick="window.setStoreConfigTab('hours')">
            <span>⏰ Horarios</span>
          </button>
          <button type="button" class="store-tab-btn ${currentTab === 'finance' ? 'active' : ''}" onclick="window.setStoreConfigTab('finance')">
            <span>💳 Finanzas & Cobros</span>
          </button>
          <button type="button" class="store-tab-btn ${currentTab === 'security' ? 'active' : ''}" onclick="window.setStoreConfigTab('security')">
            <span>🔒 Seguridad & PIN</span>
          </button>
        </div>

        <!-- PESTAÑA 1: DATOS DEL NEGOCIO -->
        ${currentTab === 'general' ? `
          <form class="form-card gold-card" onsubmit="window.handleSaveStoreGeneral(event)">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
              <h3>🏪 Identidad Comercial del Salón</h3>
              <span class="gold-badge" style="font-size: 10px;">Visible para Clientas</span>
            </div>
            <p class="form-card-sub">Estos datos se reflejan de inmediato en la portada y encabezados:</p>

            <div class="form-group-clean">
              <label>Nombre de la Tienda / Salón</label>
              <input type="text" id="store-name-input" value="${salon.name || ''}" placeholder="Ej: Maison de Beauté" required />
            </div>

            <div class="form-group-clean">
              <label>Eslogan o Subtítulo Editorial</label>
              <input type="text" id="store-tagline-input" value="${salon.tagline || ''}" placeholder="Ej: Uñas de Autor & Haute Coiffure" />
            </div>

            <div class="form-group-clean">
              <label>Dirección del Local</label>
              <input type="text" id="store-address-input" value="${salon.address || ''}" placeholder="Ej: Av. Alvear 1850, Local 4" />
            </div>

            <div class="form-group-clean">
              <label>Teléfono de WhatsApp Comercial (con código de país, sin + ni espacios)</label>
              <input type="tel" id="store-phone-input" value="${salon.phone || ''}" placeholder="Ej: 5491123456789" required />
              <span style="font-size: 10.5px; color: var(--text-muted); margin-top: 3px; display: block;">
                Es el número donde recibirás los comprobantes de turnos y señas de tus clientas.
              </span>
            </div>

            <button type="submit" class="btn-primary-action btn-gold-shimmer" style="width: 100%; margin-top: 8px;">
              Guardar Datos Comerciales
            </button>
          </form>
        ` : ''}

        <!-- PESTAÑA 2: HORARIOS DE ATENCIÓN -->
        ${currentTab === 'hours' ? `
          <form class="form-card gold-card" onsubmit="window.handleSaveStoreHours(event)">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
              <h3>⏰ Horarios & Días de Atención</h3>
              <span class="gold-badge" style="font-size: 10px;">Agenda Online</span>
            </div>
            <p class="form-card-sub">Configurá los días y rangos en que tus clientas pueden reservar turnos:</p>

            <div class="form-group-clean">
              <label>Días de Atención al Público</label>
              <input type="text" id="store-working-days" value="${salon.workingDays || 'Lunes a Sábado'}" placeholder="Ej: Lunes a Sábado" required />
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              <div class="form-group-clean">
                <label>Hora de Apertura</label>
                <input type="time" id="store-open-time" value="${salon.openTime || '09:00'}" required />
              </div>
              <div class="form-group-clean">
                <label>Hora de Cierre</label>
                <input type="time" id="store-close-time" value="${salon.closeTime || '20:00'}" required />
              </div>
            </div>

            <button type="submit" class="btn-primary-action btn-gold-shimmer" style="width: 100%; margin-top: 8px;">
              Guardar Horarios de Atención
            </button>
          </form>
        ` : ''}

        <!-- PESTAÑA 3: FINANZAS Y COBROS DE LA TIENDA (COMPLETO) -->
        ${currentTab === 'finance' ? `
          <form class="form-card gold-card" onsubmit="window.handleSaveStoreFinance(event)">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
              <h3>💳 Cuentas Bancarias & Señas de Turnos</h3>
              <span class="gold-badge" style="font-size: 10px;">Cobro Seguro</span>
            </div>
            <p class="form-card-sub">
              Configurá dónde te transfieren las señas y los medios de pago aceptados en tu salón:
            </p>

            <div class="form-group-clean">
              <label>Alias de Mercado Pago / CVU / CBU</label>
              <input type="text" id="store-alias-input" value="${salon.alias || ''}" placeholder="Ej: MAISON.BEAUTE.MP" required />
            </div>

            <div class="form-group-clean">
              <label>Nombre del Titular de la Cuenta</label>
              <input type="text" id="store-holder-input" value="${salon.aliasHolder || ''}" placeholder="Ej: Maison Studio SRL" required />
            </div>

            <div class="form-group-clean">
              <label>CUIT / CUIL del Titular (Opcional)</label>
              <input type="text" id="store-cuit-input" value="${salon.cuit || ''}" placeholder="Ej: 27-35123456-4" />
            </div>

            <div class="form-group-clean">
              <label>Porcentaje de Seña Requerido (%)</label>
              <input type="number" id="store-deposit-input" value="${salon.depositPercent !== undefined ? salon.depositPercent : 50}" min="0" max="100" required />
              <div class="quick-preset-btns">
                <button type="button" class="preset-chip-btn" onclick="window.setDepositPreset(0)">0% (Sin Seña)</button>
                <button type="button" class="preset-chip-btn" onclick="window.setDepositPreset(20)">20%</button>
                <button type="button" class="preset-chip-btn" onclick="window.setDepositPreset(30)">30%</button>
                <button type="button" class="preset-chip-btn" onclick="window.setDepositPreset(50)">50% (Recomendado)</button>
                <button type="button" class="preset-chip-btn" onclick="window.setDepositPreset(100)">100% Total</button>
              </div>
            </div>

            <div class="form-group-clean">
              <label>Descuento Promocional por Pago en Efectivo (%)</label>
              <input type="number" id="store-cash-discount" value="${salon.cashDiscount || 10}" min="0" max="50" placeholder="Ej: 10" />
              <span style="font-size: 10.5px; color: var(--text-muted); margin-top: 3px; display: block;">
                Incentiva a tus clientas a pagar en efectivo en el salón para tener liquidez diaria.
              </span>
            </div>

            <button type="submit" class="btn-primary-action btn-gold-shimmer" style="width: 100%; margin-top: 8px;">
              Guardar Configuración Financiera
            </button>
          </form>

          <!-- Acceso Directo a Finanzas en Vivo -->
          <div class="form-card gold-card" style="margin-top: 12px; background: linear-gradient(135deg, rgba(22, 163, 74, 0.06), rgba(197, 155, 39, 0.08));">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <div>
                <h4 style="font-size: 14px; font-weight: 800; color: #15803d; margin: 0;">💰 Caja Diaria & Balances en Vivo</h4>
                <p style="font-size: 11.5px; color: var(--text-muted); margin-top: 2px;">
                  Arqueo de efectivo en mano, transferencias MP, registro de gastos y exportación CSV.
                </p>
              </div>
            </div>
            <button type="button" class="btn-primary-action" style="width: 100%; margin-top: 10px; background: #16a34a;" onclick="window.openPanelSubView('finances')">
              Abrir Módulo de Finanzas & Caja Completo →
            </button>
          </div>
        ` : ''}

        <!-- PESTAÑA 4: SEGURIDAD Y PIN -->
        ${currentTab === 'security' ? `
          <form class="form-card gold-card" onsubmit="window.handleSaveStorePIN(event)">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
              <h3>🔒 Seguridad & PIN de Acceso</h3>
              <span class="gold-badge" style="font-size: 10px;">Panel del Dueño</span>
            </div>
            <p class="form-card-sub">Modificá el PIN de 4 dígitos para bloquear y proteger tu panel:</p>

            <div class="form-group-clean">
              <label>Nuevo PIN de 4 Dígitos</label>
              <input type="password" id="store-new-pin" maxlength="4" placeholder="••••" pattern="[0-9]{4}" required style="letter-spacing: 0.3em; font-size: 18px; text-align: center;" />
            </div>

            <div class="form-group-clean">
              <label>Confirmar Nuevo PIN</label>
              <input type="password" id="store-confirm-pin" maxlength="4" placeholder="••••" pattern="[0-9]{4}" required style="letter-spacing: 0.3em; font-size: 18px; text-align: center;" />
            </div>

            <button type="submit" class="btn-primary-action btn-gold-shimmer" style="width: 100%; margin-top: 8px;">
              Actualizar PIN de Seguridad
            </button>
          </form>
        ` : ''}
      </div>
    </div>
  `;
}

window.setStoreConfigTab = (tab) => {
  AppState.storeConfigTab = tab;
  renderApp();
};

window.setDepositPreset = (percent) => {
  const input = document.getElementById('store-deposit-input');
  if (input) input.value = percent;
};

window.handleSaveStoreGeneral = async (e) => {
  e.preventDefault();
  const name = document.getElementById('store-name-input')?.value.trim();
  const tagline = document.getElementById('store-tagline-input')?.value.trim();
  const address = document.getElementById('store-address-input')?.value.trim();
  const phone = document.getElementById('store-phone-input')?.value.trim();

  AppState.salon = {
    ...AppState.salon,
    name,
    tagline,
    address,
    phone
  };

  await DataStore.set('salon', 'config', AppState.salon);
  showToast('✅ Identidad comercial de la tienda guardada');
  renderApp();
};

window.handleSaveStoreHours = async (e) => {
  e.preventDefault();
  const workingDays = document.getElementById('store-working-days')?.value.trim();
  const openTime = document.getElementById('store-open-time')?.value;
  const closeTime = document.getElementById('store-close-time')?.value;

  AppState.salon = {
    ...AppState.salon,
    workingDays,
    openTime,
    closeTime
  };

  await DataStore.set('salon', 'config', AppState.salon);
  showToast('⏰ Horarios de atención actualizados');
  renderApp();
};

window.handleSaveStoreFinance = async (e) => {
  e.preventDefault();
  const alias = document.getElementById('store-alias-input')?.value.trim();
  const aliasHolder = document.getElementById('store-holder-input')?.value.trim();
  const cuit = document.getElementById('store-cuit-input')?.value.trim();
  const depositPercent = Number(document.getElementById('store-deposit-input')?.value) || 0;
  const cashDiscount = Number(document.getElementById('store-cash-discount')?.value) || 0;

  AppState.salon = {
    ...AppState.salon,
    alias,
    aliasHolder,
    cuit,
    depositPercent,
    cashDiscount
  };

  await DataStore.set('salon', 'config', AppState.salon);
  showToast('💳 Cuentas y señas de la tienda actualizadas');
  renderApp();
};

window.handleSaveStorePIN = async (e) => {
  e.preventDefault();
  const p1 = document.getElementById('store-new-pin')?.value.trim();
  const p2 = document.getElementById('store-confirm-pin')?.value.trim();

  if (!p1 || p1.length !== 4) {
    showToast('⚠️ El PIN debe ser de 4 números');
    return;
  }
  if (p1 !== p2) {
    showToast('⚠️ Los dos PINs ingresados no coinciden');
    return;
  }

  AppState.salon.pin = p1;
  await DataStore.set('salon', 'config', AppState.salon);
  showToast('🔒 ¡Nuevo PIN guardado con éxito!');
  renderApp();
};

window.selectThemePalette = (theme) => {
  applyTheme(theme);
  AppState.salon.themeColor = theme;
  DataStore.set('salon', 'config', AppState.salon);
  showToast(`🎨 Color actualizado: ${getPaletteName(theme)}`);
  renderApp();
};

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

            <!-- Selector Rápido desde el Banco de Fotos del Salón -->
            ${
              AppState.photoBank && AppState.photoBank.length > 0
                ? `
              <div style="margin-top: 10px;">
                <label style="font-size: 11px; font-weight: 700; color: var(--gold-primary);">📸 Elegí de tu Banco de Fotos (${AppState.photoBank.length}):</label>
                <div class="photo-bank-picker-row">
                  ${AppState.photoBank
                    .map(
                      (p) => `
                    <img src="${p.url}" alt="${p.title}" class="photo-bank-picker-thumb" onclick="window.pickServicePhoto('${p.url}')" title="${p.title}" />
                  `
                    )
                    .join('')}
                </div>
              </div>
            `
                : ''
            }
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

        <!-- SECCIÓN 4: ADICIONALES (ADD-ONS PARA AUMENTAR EL TICKET) -->
        <div class="form-card">
          <h3>✨ Adicionales en la Reserva (Upsell)</h3>
          <p class="form-card-sub">Ofrecé servicios extras rápidos (retiro, nail art, nutrición) que la clienta puede sumar a su turno:</p>

          <form onsubmit="window.handleCreateAddon(event)" style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 14px;">
            <div style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 8px;">
              <input type="text" id="addon-name-input" placeholder="Nombre (ej: Retiro Esmaltado)" style="padding: 9px 12px; border: 1px solid rgba(0,0,0,0.1); border-radius: 10px; font-size: 12.5px; background: var(--card-bg); color: var(--text-main);" required />
              <input type="number" id="addon-price-input" placeholder="Precio ($)" style="padding: 9px 12px; border: 1px solid rgba(0,0,0,0.1); border-radius: 10px; font-size: 12.5px; background: var(--card-bg); color: var(--text-main);" required />
              <input type="number" id="addon-dur-input" placeholder="Minutos" value="15" style="padding: 9px 12px; border: 1px solid rgba(0,0,0,0.1); border-radius: 10px; font-size: 12.5px; background: var(--card-bg); color: var(--text-main);" required />
            </div>
            <button type="submit" class="btn-primary-action" style="padding: 9px 12px; align-self: flex-start; font-size: 12px;">
              + Agregar Adicional
            </button>
          </form>

          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${(AppState.addons || []).length === 0 ? '<p style="font-size: 12px; color: var(--text-muted);">Sin adicionales cargados.</p>' :
              (AppState.addons || []).map(a => {
                const isActive = a.active !== false;
                return `
                  <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: var(--bg-soft); border-radius: 12px; border: 1px solid rgba(0,0,0,0.05);">
                    <div>
                      <strong style="font-size: 13px; color: var(--text-main);">${a.name}</strong>
                      <span style="font-size: 11.5px; color: var(--text-muted); margin-left: 6px;">+${Number(a.price).toLocaleString('es-AR')} • ${a.duration || 15}m</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <button type="button" class="service-toggle-btn ${isActive ? 'active' : 'inactive'}" onclick="window.handleToggleAddonActive('${a.id}')" style="padding: 4px 8px; font-size: 11px;">
                        ${isActive ? 'Activo' : 'Pausado'}
                      </button>
                      <button type="button" style="background: transparent; border: none; color: #dc2626; cursor: pointer; padding: 4px;" onclick="window.handleDeleteAddon('${a.id}', '${a.name}')" title="Eliminar adicional">
                        ${Icons.trash}
                      </button>
                    </div>
                  </div>
                `;
              }).join('')
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
    const dataUrl = await compressAndReadImage(file, 800, 0.82);
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
  // Auto-limpieza de Categorías Demo al agregar la primera categoría real
  const demoCats = (AppState.categories || []).filter((c) => c.isDemo === true);
  for (const dc of demoCats) {
    await DataStore.remove('categories', dc.id);
  }
  AppState.categories = AppState.categories.filter((c) => c.isDemo !== true);

  const id = `cat_${Date.now()}`;
  const newCat = { id, name, isDemo: false };
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

  // Auto-limpieza de Servicios Demo al agregar el primer servicio real
  if (!isEditing) {
    const demoServices = (AppState.services || []).filter((s) => s.isDemo === true);
    for (const ds of demoServices) {
      await DataStore.remove('services', ds.id);
    }
    AppState.services = (AppState.services || []).filter((s) => s.isDemo !== true);
  }

  const serviceData = {
    id,
    name,
    categoryId,
    price,
    duration,
    deposit,
    image,
    active: true,
    isDemo: false
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
function compressAndReadImage(file, maxWidth = 800, quality = 0.82) {
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
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Intenta WebP primero para máxima compresión y carga ultrarrápida (<50KB), con fallback a JPEG
        let dataUrl = canvas.toDataURL('image/webp', quality);
        if (!dataUrl || !dataUrl.startsWith('data:image/webp')) {
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }
        resolve(dataUrl);
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

        <!-- SECCIÓN 3: BANCO DE FOTOS DEL SALÓN (SIN LÍMITE DE CARGA) -->
        <div class="form-card gold-card">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <h3>🏛️ Banco de Fotos del Salón</h3>
            <span class="gold-badge" style="font-size: 10px;">${(AppState.photoBank || []).length} fotos</span>
          </div>
          <p class="form-card-sub">
            Subí todas las fotos que quieras desde tu celular. Las optimizamos automáticamente para que la app cargue en milisegundos sin límite de almacenamiento:
          </p>

          <input type="file" id="photobank-file-picker" accept="image/*" multiple style="display: none;" onchange="window.handleUploadToPhotoBank(event)" />
          <button type="button" class="btn-upload-file btn-gold-shimmer" onclick="document.getElementById('photobank-file-picker').click()">
            <span>📸</span>
            <span>Subir Fotos al Banco (+ Sin Límite)</span>
          </button>

          <div class="photobank-grid">
            ${(AppState.photoBank || []).map((p) => `
              <div class="photobank-card">
                <img src="${p.url}" alt="${p.title}" class="photobank-thumb" onerror="this.src='./assets/studio-nails.jpg'" />
                <div class="photobank-info">
                  <span class="photobank-title">${p.title}</span>
                  <div class="photobank-actions">
                    <button type="button" class="photobank-btn primary" onclick="window.setSplashPreset('${p.url}')" title="Usar como Portada">
                      ⭐ Portada
                    </button>
                    <button type="button" class="photobank-btn primary" onclick="window.setBannerPreset('${p.url}')" title="Usar en Banner">
                      🏷️ Banner
                    </button>
                    <button type="button" class="photobank-btn" onclick="window.addInspoFromBank('${p.url}', '${p.title}')" title="Publicar en Muro de Diseños">
                      💅 Muro
                    </button>
                    <button type="button" class="photobank-btn danger" onclick="window.deleteFromPhotoBank('${p.id}')" title="Eliminar del banco">
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
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

                let loyaltyBadge = '<span class="client-badge new">🌱 Nueva</span>';
                if (historyCount >= 5 || totalSpent >= 100000) {
                  loyaltyBadge = '<span class="client-badge vip">⭐ VIP</span>';
                } else if (historyCount >= 2) {
                  loyaltyBadge = '<span class="client-badge frequent">✨ Frecuente</span>';
                }

                return `
              <div class="client-card">
                <div class="client-card-top">
                  <div class="client-avatar-row">
                    <div class="client-avatar">${initials}</div>
                    <div>
                      <div class="client-name-title">
                        <span>${c.name}</span>
                        ${loyaltyBadge}
                      </div>
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
  const currentMonthPrefix = todayStr.substring(0, 7);

  // 1. Ingresos por señas recibidas en turnos
  const apptDeposits = appointments.filter((a) => a.depositPaid === true);
  const totalDepositsIncome = apptDeposits.reduce((acc, a) => acc + (Number(a.depositAmount) || 0), 0);

  // 2. Ingresos registrados en caja (directos)
  const directIncomes = finances.filter((t) => t.type === 'income');
  const directIncomeTotal = directIncomes.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

  // 3. Gastos registrados
  const expenses = finances.filter((t) => t.type === 'expense');
  const totalExpenses = expenses.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

  // 4. Totales Consolidados
  const totalAllIncome = totalDepositsIncome + directIncomeTotal;
  const netBalance = totalAllIncome - totalExpenses;

  // 5. KPIs por Período
  const todayIncome =
    finances.filter((t) => t.type === 'income' && t.date === todayStr).reduce((acc, t) => acc + Number(t.amount), 0) +
    appointments.filter((a) => a.depositPaid && a.date === todayStr).reduce((acc, a) => acc + Number(a.depositAmount), 0);

  const monthIncome =
    finances.filter((t) => t.type === 'income' && (t.date || '').startsWith(currentMonthPrefix)).reduce((acc, t) => acc + Number(t.amount), 0) +
    appointments.filter((a) => a.depositPaid && (a.date || '').startsWith(currentMonthPrefix)).reduce((acc, a) => acc + Number(a.depositAmount), 0);

  // 6. Arqueo de Caja Diario (Por Medio de Pago)
  const cashIncome = finances.filter((t) => t.type === 'income' && (!t.method || t.method.includes('Efectivo'))).reduce((acc, t) => acc + Number(t.amount), 0);
  const transferIncome = finances.filter((t) => t.type === 'income' && t.method && (t.method.includes('Transferencia') || t.method.includes('MP'))).reduce((acc, t) => acc + Number(t.amount), 0) + totalDepositsIncome;
  const cardIncome = finances.filter((t) => t.type === 'income' && t.method && t.method.includes('Tarjeta')).reduce((acc, t) => acc + Number(t.amount), 0);

  // Cobros Pendientes (Turnos confirmados sin seña pagada)
  const pendingDeposits = appointments.filter((a) => a.status !== 'cancelled' && a.depositPaid !== true);

  // Filtrado de movimientos
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
          <div style="display: flex; align-items: center; gap: 8px;">
            <div class="mirrored-icon-badge" style="width: 30px; height: 30px; font-size: 13px;">
              ${Icons.dollar}
            </div>
            <div>
              <h2 class="app-header-title">Finanzas & Caja Completo</h2>
              <p style="font-size: 11px; color: var(--text-muted); font-weight: 600;">Control integral de ingresos, señas y arqueo</p>
            </div>
          </div>
        </div>
        <div style="display: flex; gap: 6px;">
          <button type="button" class="header-icon-action" onclick="window.openStoreFinanceConfig()" title="Configurar Cuentas y Seña">
            ${Icons.store}
            <span>Cuentas</span>
          </button>
          <button type="button" class="btn-primary-action" style="padding: 7px 11px; font-size: 11px; background: #0284c7;" onclick="window.exportFinancesCSV()">
            📥 CSV
          </button>
        </div>
      </header>

      <div class="panel-subview">
        <!-- 3 KPIs Superiores -->
        <div class="kpi-metrics-grid">
          <div class="kpi-metric-card gold-card">
            <span class="kpi-lbl">Ingresos Hoy</span>
            <strong class="kpi-val" style="color: #16a34a;">${todayIncome.toLocaleString('es-AR')}</strong>
          </div>
          <div class="kpi-metric-card gold-card">
            <span class="kpi-lbl">Este Mes</span>
            <strong class="kpi-val" style="color: #0284c7;">${monthIncome.toLocaleString('es-AR')}</strong>
          </div>
          <div class="kpi-metric-card gold-card">
            <span class="kpi-lbl">Balance Neto</span>
            <strong class="kpi-val" style="color: ${netBalance >= 0 ? '#16a34a' : '#dc2626'};">${netBalance.toLocaleString('es-AR')}</strong>
          </div>
        </div>

        <!-- ARQUEO DE CAJA DIARIA POR MEDIO DE PAGO (COMPLETO) -->
        <div class="form-card gold-card" style="margin-top: 10px;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <h4 style="font-size: 12.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: var(--gold-primary); margin: 0;">
              ⚖️ Arqueo de Caja por Medio de Pago
            </h4>
            <span class="gold-badge" style="font-size: 9.5px;">Cierre en Vivo</span>
          </div>
          <div class="arqueo-grid">
            <div class="arqueo-card">
              <span class="arqueo-icon">💵</span>
              <span class="arqueo-label">Efectivo Físico</span>
              <strong class="arqueo-amount" style="color: #16a34a;">${cashIncome.toLocaleString('es-AR')}</strong>
            </div>
            <div class="arqueo-card">
              <span class="arqueo-icon">📱</span>
              <span class="arqueo-label">Mercado Pago / MP</span>
              <strong class="arqueo-amount" style="color: #0284c7;">${transferIncome.toLocaleString('es-AR')}</strong>
            </div>
            <div class="arqueo-card">
              <span class="arqueo-icon">💳</span>
              <span class="arqueo-label">Tarjetas POS</span>
              <strong class="arqueo-amount" style="color: #7c3aed;">${cardIncome.toLocaleString('es-AR')}</strong>
            </div>
          </div>
        </div>

        <!-- Botones de Acción Rápida: + Cobro / - Gasto -->
        <div class="finance-action-buttons">
          <button type="button" class="btn-record-income btn-gold-shimmer" onclick="window.handleOpenTxModal('income')">
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

        <!-- Desglose Consolidado -->
        <div class="finance-breakdown-card gold-card">
          <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: var(--gold-primary); margin-bottom: 8px;">
            Desglose Consolidado de Caja
          </div>
          <div class="breakdown-row">
            <span>Señas de Turnos Recibidas:</span>
            <strong style="color: #16a34a;">+${totalDepositsIncome.toLocaleString('es-AR')}</strong>
          </div>
          <div class="breakdown-row">
            <span>Cobros y Ventas en el Local:</span>
            <strong style="color: #16a34a;">+${directIncomeTotal.toLocaleString('es-AR')}</strong>
          </div>
          <div class="breakdown-row">
            <span>Gastos Operativos (Insumos/Alquiler):</span>
            <strong style="color: #dc2626;">-${totalExpenses.toLocaleString('es-AR')}</strong>
          </div>
          <div class="breakdown-row">
            <span>Balance de Caja Disponible:</span>
            <strong style="color: ${netBalance >= 0 ? '#16a34a' : '#dc2626'};">${netBalance.toLocaleString('es-AR')}</strong>
          </div>
        </div>

        <!-- Cobros Pendientes de Turnos -->
        ${
          pendingDeposits.length > 0
            ? `
          <div class="form-card gold-card" style="border-left: 3px solid #f59e0b;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
              <h4 style="font-size: 12.5px; font-weight: 800; color: #b45309; margin: 0;">
                ⏳ Turnos con Cobro Pendiente (${pendingDeposits.length})
              </h4>
              <span class="gold-badge" style="font-size: 9.5px; background: #fef3c7; color: #b45309;">Por Cobrar</span>
            </div>
            <p style="font-size: 11.5px; color: var(--text-muted); margin-bottom: 8px;">
              Tocá el medio de pago en el que recibiste el dinero para registrarlo al instante en caja:
            </p>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              ${pendingDeposits.map((a) => `
                <div style="background: var(--card-bg); border: 1px solid rgba(0,0,0,0.06); border-radius: 12px; padding: 10px;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                      <strong style="font-size: 13px; color: var(--text-main);">${a.clientName}</strong>
                      <div style="font-size: 11px; color: var(--text-muted);">
                        ${a.serviceName} • 📅 ${a.date} ${a.slot}
                      </div>
                    </div>
                    <span style="font-size: 13.5px; font-weight: 800; color: #b45309;">
                      ${Number(a.depositAmount || 0).toLocaleString('es-AR')}
                    </span>
                  </div>
                  <div class="pending-collect-strip">
                    <button type="button" class="btn-collect-quick cash" onclick="window.handleCollectPendingWithMethod('${a.id}', 'Efectivo')">
                      💵 Cobrar Efectivo
                    </button>
                    <button type="button" class="btn-collect-quick mp" onclick="window.handleCollectPendingWithMethod('${a.id}', 'Transferencia / MP')">
                      📱 Cobrar MP/Transf.
                    </button>
                    <button type="button" class="btn-collect-quick card" onclick="window.handleCollectPendingWithMethod('${a.id}', 'Tarjeta')">
                      💳 Tarjeta
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Historial de Movimientos con Filtros -->
        <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 14px;">
          <h3 style="font-size: 14px; font-weight: 800; color: var(--text-main); margin: 0;">
            Historial de Movimientos
          </h3>
          <div class="filter-pills-row">
            <button type="button" class="filter-pill-btn ${filter === 'today' ? 'active' : ''}" onclick="window.setFinanceFilter('today')">Hoy</button>
            <button type="button" class="filter-pill-btn ${filter === 'month' ? 'active' : ''}" onclick="window.setFinanceFilter('month')">Este Mes</button>
            <button type="button" class="filter-pill-btn ${filter === 'all' ? 'active' : ''}" onclick="window.setFinanceFilter('all')">Todos</button>
          </div>
        </div>

        ${
          filteredTxs.length === 0
            ? `
          <div style="text-align: center; padding: 30px 16px; background: var(--card-bg); border-radius: 14px; border: 1px dashed rgba(0,0,0,0.08); margin-top: 10px;">
            <p style="font-size: 12.5px; color: var(--text-muted);">Sin movimientos registrados en este período.</p>
          </div>
        `
            : `
          <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 10px;">
            ${filteredTxs.map((tx) => {
              const isIncome = tx.type === 'income';
              let methodIcon = '💵';
              if ((tx.method || '').includes('Transferencia') || (tx.method || '').includes('MP')) methodIcon = '📱';
              if ((tx.method || '').includes('Tarjeta')) methodIcon = '💳';

              return `
              <div class="tx-card-item">
                <div style="flex: 1;">
                  <div class="tx-concept-title">${isIncome ? '🟢' : '🔴'} ${tx.concept}</div>
                  <div class="tx-meta-sub">
                    📅 ${tx.date} • ${methodIcon} ${tx.method || 'Efectivo'} ${tx.category ? `• ${tx.category}` : ''}
                  </div>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span class="tx-amount-badge ${isIncome ? 'income' : 'expense'}">
                    ${isIncome ? '+' : '-'}${Number(tx.amount).toLocaleString('es-AR')}
                  </span>
                  <button type="button" style="background: none; border: none; color: #dc2626; cursor: pointer; padding: 2px 4px; font-size: 14px;" onclick="window.handleDeleteTransaction('${tx.id}')" title="Borrar movimiento">
                    ×
                  </button>
                </div>
              </div>
            `;
            }).join('')}
          </div>
        `
        }
      </div>
    </div>
  `;
}

window.openStoreFinanceConfig = () => {
  AppState.storeConfigTab = 'finance';
  window.openPanelSubView('salon');
};

window.handleCollectPendingWithMethod = async (apptId, method) => {
  const appt = (AppState.appointments || []).find((a) => a.id === apptId);
  if (!appt) return;

  appt.depositPaid = true;
  await DataStore.set('appointments', apptId, appt);

  const txId = 'tx_' + Date.now();
  const newTx = {
    id: txId,
    type: 'income',
    concept: `Seña turno: ${appt.clientName} (${appt.serviceName})`,
    amount: Number(appt.depositAmount) || 0,
    method: method,
    category: 'Seña',
    date: getTodayDateStr(),
    createdAt: new Date().toISOString()
  };

  await DataStore.set('finances', txId, newTx);
  if (!AppState.finances) AppState.finances = [];
  AppState.finances.push(newTx);

  showToast(`✅ Cobro de seña registrado (${method})`);
  renderApp();
};

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
    AppState.bookingStep = 1;
    renderApp();
    return;
  }

  if (!AppState.bookingDate || !AppState.bookingSlot) {
    showToast('⚠️ Por favor elegí una fecha y un horario disponible');
    AppState.bookingStep = 2;
    renderApp();
    return;
  }

  const nameInput = document.getElementById('client-name-input')?.value.trim();
  const phoneInput = document.getElementById('client-phone-input')?.value.trim();
  const notesInput = document.getElementById('client-notes-input')?.value.trim();
  const name = nameInput || AppState.bookingDraft.clientName;
  const phone = phoneInput || AppState.bookingDraft.clientPhone;
  const notes = notesInput || AppState.bookingDraft.clientNotes || '';

  if (!name || !phone) {
    showToast('⚠️ Por favor ingresá tu nombre y teléfono de contacto');
    return;
  }

  // Anti-solapamiento estricto en tiempo real (Como en Daniela Gimenez)
  if (isSlotOccupied(AppState.bookingDate, AppState.bookingSlot)) {
    alert(`Lo sentimos, el horario que habías elegido (${AppState.bookingSlot} hs) ya no se encuentra disponible. Por favor elige otro horario.`);
    AppState.bookingStep = 2;
    renderApp();
    return;
  }

  // Guardar en localStorage para próximas reservas (Como en Daniela Gimenez)
  try {
    localStorage.setItem('beauty_client_name', name);
    localStorage.setItem('beauty_client_phone', phone);
    localStorage.setItem('dg_client_name', name);
    localStorage.setItem('dg_client_phone', phone);
  } catch (e) {}

  const selectedAddonsList = (AppState.addons || []).filter((a) =>
    (AppState.bookingDraft.selectedAddonIds || []).includes(a.id)
  );
  const addonsTotal = selectedAddonsList.reduce((acc, curr) => acc + Number(curr.price || 0), 0);
  const addonsDuration = selectedAddonsList.reduce((acc, curr) => acc + Number(curr.duration || 0), 0);
  const totalPrice = (Number(currentService.price) || 0) + addonsTotal;
  const totalDuration = (Number(currentService.duration) || 60) + addonsDuration;

  const depositPercent = AppState.salon.depositPercent !== undefined ? AppState.salon.depositPercent : 50;
  const depositAmount = Math.round((totalPrice * depositPercent) / 100);

  // Código único de turno alfanumérico
  const uniqueCode = 'MB-' + Math.floor(1000 + Math.random() * 9000);
  const apptId = 'appt_' + Date.now();

  const newAppt = {
    id: apptId,
    code: uniqueCode,
    clientId: '',
    clientName: name,
    clientPhone: phone,
    clientNotes: notes,
    serviceId: currentService.id,
    serviceName: currentService.name,
    servicePrice: totalPrice,
    serviceDuration: totalDuration,
    basePrice: Number(currentService.price) || 0,
    addons: selectedAddonsList.map((a) => ({ id: a.id, name: a.name, price: Number(a.price) || 0 })),
    inspoTitle: AppState.bookingDraft.inspoTitle || null,
    inspoImage: AppState.bookingDraft.inspoImage || null,
    date: AppState.bookingDate,
    slot: AppState.bookingSlot,
    status: 'pending',
    depositAmount: depositAmount,
    depositPaid: false,
    createdAt: new Date().toISOString()
  };

  // Crear o actualizar automáticamente la ficha de la clienta en el CRM
  let client = (AppState.clients || []).find((c) => c.phone && c.phone === phone);
  if (!client) {
    client = {
      id: 'cli_' + Date.now(),
      name: name,
      phone: phone,
      notes: notes,
      history: [],
      totalSpent: 0,
      createdAt: new Date().toISOString()
    };
  }
  client.history = client.history || [];
  client.history.push({
    apptId: apptId,
    code: uniqueCode,
    serviceName: currentService.name,
    date: AppState.bookingDate,
    slot: AppState.bookingSlot,
    price: totalPrice
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

  AppState.lastBookedAppt = newAppt;
  AppState.bookingStep = 4; // Transición inmediata al Paso 4 de confirmación

  // Generar y abrir WhatsApp
  const salonPhone = (AppState.salon.phone || '5491123456789').replace(/\D/g, '');
  const dateFormatted = formatDateDisplay(AppState.bookingDate);
  const addonsText = selectedAddonsList.length > 0
    ? `\n➕ *Adicionales:* ${selectedAddonsList.map((a) => `${a.name} (+${Number(a.price).toLocaleString('es-AR')})`).join(', ')}`
    : '';

  const inspoText = AppState.bookingDraft.inspoTitle
    ? `\n💅 *Look de Referencia:* ${AppState.bookingDraft.inspoTitle}`
    : '';

  const notesText = notes ? `\n📝 *Notas:* ${notes}` : '';

  const msg =
    `¡Hola ${AppState.salon.name || 'Maison de Beauté'}! Agendé mi turno online:\n\n` +
    `🏷️ *Código de Turno:* ${uniqueCode}\n` +
    `👤 *Clienta:* ${name}\n` +
    `📱 *WhatsApp:* ${phone}\n` +
    `💅 *Servicio:* ${currentService.name}${addonsText}${inspoText}${notesText}\n` +
    `📅 *Fecha:* ${dateFormatted}\n` +
    `⏰ *Horario:* ${AppState.bookingSlot} hs (~${totalDuration} min)\n\n` +
    `💰 *Total estimado:* ${Number(totalPrice).toLocaleString('es-AR')}\n` +
    `💳 *Seña requerida (${depositPercent}%):* ${Number(depositAmount).toLocaleString('es-AR')}\n` +
    `🏦 *Alias:* ${AppState.salon.alias || 'MAISON.BEAUTE.MP'}\n\n` +
    `Te adjunto el comprobante de transferencia para congelar mi lugar. ¡Muchas gracias!`;

  const waUrl = `https://wa.me/${salonPhone}?text=${encodeURIComponent(msg)}`;
  window.open(waUrl, '_blank');

  renderApp();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};


// ============================================================================
// MODAL DE ÉXITO & GOOGLE CALENDAR
// ============================================================================
function getGoogleCalendarUrl(appt) {
  if (!appt || !appt.date || !appt.slot) return '#';
  const salonName = AppState.salon.name || 'Maison de Beauté';
  const title = encodeURIComponent(`Turno: ${appt.serviceName} en ${salonName}`);
  
  // Formato fecha y hora: YYYYMMDDTHHmmss
  const cleanDate = appt.date.replace(/-/g, '');
  const [hours, mins] = appt.slot.split(':');
  const duration = Number(appt.serviceDuration) || 60;
  
  const startH = hours.padStart(2, '0');
  const startM = (mins || '00').padStart(2, '0');
  
  // Calcular hora de fin
  const totalMin = parseInt(startH, 10) * 60 + parseInt(startM, 10) + duration;
  const endH = String(Math.floor(totalMin / 60)).padStart(2, '0');
  const endM = String(totalMin % 60).padStart(2, '0');
  
  const dates = `${cleanDate}T${startH}${startM}00/${cleanDate}T${endH}${endM}00`;
  const location = AppState.salon.address || '';
  const details = `Turno agendado en ${salonName}.\nServicio: ${appt.serviceName}\nDuración: ~${duration} min.\nSeña: ${Number(appt.depositAmount || 0).toLocaleString('es-AR')}\nAlias: ${AppState.salon.alias || ''}`;
  
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`;
}

function renderBookingSuccessModal() {
  const appt = AppState.lastBookedAppt;
  if (!appt) return '';

  const gCalUrl = getGoogleCalendarUrl(appt);

  return `
    <div class="booking-success-overlay">
      <div class="booking-success-modal gold-card">
        <div class="success-icon-badge">✨</div>
        <h3 style="font-size: 18px; font-weight: 800; color: var(--text-main); margin-bottom: 4px;">¡Turno Agendado con Éxito!</h3>
        <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 14px;">
          Tu solicitud fue enviada por WhatsApp a la dueña del salón para confirmar la seña.
        </p>

        <div class="success-summary-box">
          <div style="font-size: 14px; font-weight: 800; color: var(--text-main); margin-bottom: 2px;">${appt.serviceName}</div>
          <div style="font-size: 12px; color: var(--gold-primary); font-weight: 700; margin-bottom: 4px;">
            📅 ${formatDateDisplay(appt.date)} • ⏰ ${appt.slot} hs (~${appt.serviceDuration || 60}m)
          </div>
          ${appt.addons && appt.addons.length > 0 ? `
            <div style="font-size: 11px; color: var(--text-main); margin-bottom: 4px;">
              ✨ Adicionales: <strong>${appt.addons.map(a => a.name).join(', ')}</strong>
            </div>
          ` : ''}
          <div style="font-size: 11.5px; color: var(--text-muted); margin-top: 2px;">
            📍 ${AppState.salon.address || 'Local del Salón'}
          </div>
          <div style="font-size: 11.5px; color: var(--text-muted); margin-top: 4px; padding-top: 4px; border-top: 1px dashed rgba(0,0,0,0.08);">
            💳 Seña: <strong>${Number(appt.depositAmount).toLocaleString('es-AR')}</strong> (Alias: <code style="font-weight: 800; color: var(--gold-primary);">${AppState.salon.alias || 'MAISON.BEAUTE.MP'}</code>)
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 16px;">
          <a href="${gCalUrl}" target="_blank" rel="noopener noreferrer" class="btn-google-calendar">
            <span>📅</span>
            <span>Agendar en Google Calendar</span>
          </a>
          <button type="button" class="btn-primary-action btn-gold-shimmer" style="padding: 12px; font-size: 13px;" onclick="window.closeBookingSuccessModal()">
            Listo / Volver al Inicio
          </button>
        </div>
      </div>
    </div>
  `;
}

// ============================================================================
// RENDERIZADO PRINCIPAL DE LA APLICACIÓN
// ============================================================================
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
  const successModalHtml = AppState.isBookingSuccessModalOpen ? renderBookingSuccessModal() : '';

  root.innerHTML = `
    ${screenContent}
    ${bottomNavHtml}
    ${toastHtml}
    ${successModalHtml}
  `;
}
window.renderApp = renderApp;

// ============================================================================
// INICIALIZACIÓN
// ============================================================================
async function startApp() {
  try {
    await initFirebase();
  } catch(e) {
    console.warn('Firebase init fallback:', e);
  }

  try {
    const savedSalon = await DataStore.get('salon', 'config');
    if (savedSalon && !savedSalon.isDemo && savedSalon.themeColor !== 'rose') {
      AppState.salon = { ...AppState.salon, ...savedSalon };
    } else {
      AppState.salon = {
        ...AppState.salon,
        name: 'Maison de Beauté',
        tagline: 'Rituels de beauté exclusifs • Soins signature sur rendez-vous',
        splashTitle: "L'Art de la Beauté,",
        splashSubtitle: 'Uñas & Peluquería de Autor',
        themeColor: 'champagne',
        splashHero: './assets/splash-hero.jpg?v=3.0',
        isDemo: true
      };
      await DataStore.set('salon', 'config', AppState.salon);
    }

    applyTheme(AppState.salon.themeColor || 'champagne');

    AppState.categories = await DataStore.getAll('categories');
    AppState.services = await DataStore.getAll('services');
    AppState.addons = await DataStore.getAll('addons');

    if (AppState.categories.length === 0 && AppState.services.length === 0) {
      for (const c of DEMO_SHOWCASE.categories) {
        await DataStore.set('categories', c.id, c);
      }
      for (const s of DEMO_SHOWCASE.services) {
        await DataStore.set('services', s.id, s);
      }
      for (const a of DEMO_SHOWCASE.addons) {
        await DataStore.set('addons', a.id, a);
      }
      AppState.categories = [...DEMO_SHOWCASE.categories];
      AppState.services = [...DEMO_SHOWCASE.services];
      AppState.addons = [...DEMO_SHOWCASE.addons];
    }

    if (!AppState.addons || AppState.addons.length === 0) {
      const DEFAULT_ADDONS = [
        { id: 'addon_1', name: 'Retiro de Esmaltado Anterior', price: 1500, duration: 15, active: true },
        { id: 'addon_2', name: 'Nail Art / Francesitas por uña', price: 2000, duration: 15, active: true },
        { id: 'addon_3', name: 'Nutrición Capilar Exprés / Ampolla', price: 3500, duration: 20, active: true },
        { id: 'addon_4', name: 'Exfoliación & Masaje de Manos', price: 2500, duration: 15, active: true }
      ];
      for (const addon of DEFAULT_ADDONS) {
        await DataStore.set('addons', addon.id, addon);
      }
      AppState.addons = DEFAULT_ADDONS;
    }

    AppState.appointments = await DataStore.getAll('appointments');
    AppState.clients = await DataStore.getAll('clients');
    AppState.finances = await DataStore.getAll('finances');
    AppState.photoBank = await DataStore.getAll('photoBank');

    if (!AppState.photoBank || AppState.photoBank.length === 0) {
      const DEFAULT_PHOTO_BANK = [
        { id: 'pb_1', title: 'Modelo Francesa Luminous', url: './assets/splash-hero.jpg', category: 'Portada' },
        { id: 'pb_2', title: 'Uñas Studio Kapping', url: './assets/studio-nails.jpg', category: 'Uñas' },
        { id: 'pb_3', title: 'Francesitas Rose Gold', url: './assets/inspo-rose-french.jpg', category: 'Nail Art' },
        { id: 'pb_4', title: 'Black & Gold Glam', url: './assets/inspo-black-gold.jpg', category: 'Nail Art' },
        { id: 'pb_5', title: 'Balayage Caramelo & Brushing', url: './assets/service-hair-balayage.jpg', category: 'Peluquería' },
        { id: 'pb_6', title: 'Corte Femenino de Autor', url: './assets/service-hair-cut.jpg', category: 'Peluquería' },
        { id: 'pb_7', title: 'Salón Lounge Interior', url: './assets/studio-interior.jpg', category: 'Salón' }
      ];
      for (const p of DEFAULT_PHOTO_BANK) {
        await DataStore.set('photoBank', p.id, p);
      }
      AppState.photoBank = DEFAULT_PHOTO_BANK;
    }
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
  } catch (err) {
    console.error('Initialization error, fallback to demo state:', err);
  }

  // Renderizar la app inmediatamente
  renderApp();
}

window.startApp = startApp;

if (document.readyState === 'complete' || document.readyState === 'interactive') {
  startApp();
} else {
  window.addEventListener('DOMContentLoaded', startApp);
}


window.toggleBookingAddon = (addonId) => {
  if (!AppState.bookingDraft.selectedAddonIds) {
    AppState.bookingDraft.selectedAddonIds = [];
  }
  const idx = AppState.bookingDraft.selectedAddonIds.indexOf(addonId);
  if (idx >= 0) {
    AppState.bookingDraft.selectedAddonIds.splice(idx, 1);
  } else {
    AppState.bookingDraft.selectedAddonIds.push(addonId);
  }
  renderApp();
};

window.handleCreateAddon = async (e) => {
  e.preventDefault();
  const name = document.getElementById('addon-name-input')?.value.trim();
  const price = Number(document.getElementById('addon-price-input')?.value) || 0;
  const duration = Number(document.getElementById('addon-dur-input')?.value) || 15;
  if (!name) return;

  // Auto-limpieza de Adicionales Demo al agregar el primer adicional real
  const demoAddons = (AppState.addons || []).filter((a) => a.isDemo === true);
  for (const da of demoAddons) {
    await DataStore.remove('addons', da.id);
  }
  AppState.addons = AppState.addons.filter((a) => a.isDemo !== true);

  const id = 'addon_' + Date.now();
  const newAddon = { id, name, price, duration, active: true, isDemo: false };
  AppState.addons.push(newAddon);
  await DataStore.set('addons', id, newAddon);
  showToast(`✨ Adicional "${name}" agregado`);
  renderApp();
};

window.handleToggleAddonActive = async (addonId) => {
  const addon = (AppState.addons || []).find((a) => a.id === addonId);
  if (!addon) return;
  addon.active = addon.active === false ? true : false;
  await DataStore.set('addons', addonId, addon);
  showToast(`✨ Adicional ${addon.active ? 'activado' : 'pausado'}`);
  renderApp();
};

window.handleDeleteAddon = async (addonId, addonName) => {
  const confirmDel = window.confirm(`¿Seguro que deseas eliminar el adicional "${addonName}"?`);
  if (!confirmDel) return;
  AppState.addons = (AppState.addons || []).filter((a) => a.id !== addonId);
  await DataStore.remove('addons', addonId);
  showToast(`🗑️ Adicional "${addonName}" eliminado`);
  renderApp();
};

window.handleOpenRescheduleModal = (apptId) => {
  const appt = (AppState.appointments || []).find((a) => a.id === apptId);
  if (!appt) return;
  AppState.reschedulingApptId = apptId;
  AppState.rescheduleDate = appt.date;
  AppState.rescheduleSlot = appt.slot;
  renderApp();
};

window.handleCloseRescheduleModal = () => {
  AppState.reschedulingApptId = null;
  AppState.rescheduleDate = '';
  AppState.rescheduleSlot = '';
  renderApp();
};

window.handleRescheduleDateChange = (newDate) => {
  AppState.rescheduleDate = newDate;
  renderApp();
};

window.handleRescheduleSlotSelect = (slot) => {
  AppState.rescheduleSlot = slot;
  renderApp();
};

window.handleConfirmReschedule = async (apptId, notifyWa) => {
  const appt = (AppState.appointments || []).find((a) => a.id === apptId);
  if (!appt) return;

  const newDate = AppState.rescheduleDate || appt.date;
  const newSlot = AppState.rescheduleSlot || appt.slot;

  if (!newDate || !newSlot) {
    showToast('⚠️ Por favor seleccioná fecha y horario');
    return;
  }

  // Verificar si el horario nuevo está ocupado por otro turno
  const isOccupied = (AppState.appointments || []).some(
    (a) => a.id !== apptId && a.date === newDate && a.slot === newSlot && a.status !== 'cancelled'
  );
  if (isOccupied) {
    showToast('⚠️ Ese horario ya está ocupado. Elegí otro.');
    return;
  }

  const oldDate = appt.date;
  const oldSlot = appt.slot;

  appt.date = newDate;
  appt.slot = newSlot;

  await DataStore.set('appointments', apptId, appt);

  // Actualizar historial de la clienta
  if (appt.clientId) {
    const client = (AppState.clients || []).find((c) => c.id === appt.clientId);
    if (client && client.history) {
      const histItem = client.history.find((h) => h.apptId === apptId);
      if (histItem) {
        histItem.date = newDate;
        histItem.slot = newSlot;
        await DataStore.set('clients', client.id, client);
      }
    }
  }

  showToast(`✅ Turno reprogramado para el ${formatDateDisplay(newDate)} a las ${newSlot} hs`);
  AppState.reschedulingApptId = null;

  if (notifyWa && appt.clientPhone) {
    const cleanPhone = (appt.clientPhone || '').replace(/\D/g, '');
    const dateFormatted = formatDateDisplay(newDate);
    const msg =
      `¡Hola ${appt.clientName}! Te escribo de ${AppState.salon.name || 'el Salón'}:\n\n` +
      `📅 Tu turno para *${appt.serviceName}* ha sido reprogramado con éxito:\n\n` +
      `✨ *Nueva Fecha:* ${dateFormatted}\n` +
      `⏰ *Nuevo Horario:* ${newSlot} hs\n\n` +
      `¡Te esperamos! Cualquier consulta avisanos.`;

    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  }

  renderApp();
};

window.closeBookingSuccessModal = () => {
  AppState.isBookingSuccessModalOpen = false;
  AppState.lastBookedAppt = null;
  navigateTo('home');
};

// Controladores de Vidriera Demo
window.handleLoadDemoShowcase = async () => {
  showToast('⏳ Cargando vidriera y cartillas de demostración...');
  
  for (const c of DEMO_SHOWCASE.categories) {
    await DataStore.set('categories', c.id, c);
  }
  for (const s of DEMO_SHOWCASE.services) {
    await DataStore.set('services', s.id, s);
  }
  for (const a of DEMO_SHOWCASE.addons) {
    await DataStore.set('addons', a.id, a);
  }

  AppState.salon = { ...AppState.salon, ...DEMO_SHOWCASE.salon };
  await DataStore.set('salon', 'config', AppState.salon);

  AppState.categories = [...DEMO_SHOWCASE.categories];
  AppState.services = [...DEMO_SHOWCASE.services];
  AppState.addons = [...DEMO_SHOWCASE.addons];

  showToast('✨ Vidriera Demo cargada con éxito');
  renderApp();
};

window.handleClearAllDemoData = async () => {
  const confirmClear = window.confirm('¿Deseas vaciar todas las cartillas demo para dejar el salón completamente en blanco para un cliente real?');
  if (!confirmClear) return;

  showToast('⏳ Vaciando cartillas demo...');
  for (const s of AppState.services) {
    await DataStore.remove('services', s.id);
  }
  for (const c of AppState.categories) {
    await DataStore.remove('categories', c.id);
  }
  for (const a of AppState.addons) {
    await DataStore.remove('addons', a.id);
  }

  AppState.services = [];
  AppState.categories = [];
  AppState.addons = [];

  showToast('🗑️ Salón en blanco: Listo para cargar datos reales');
  renderApp();
};
