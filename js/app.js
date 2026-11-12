// ============================================================================
// BEAUTY & NAIL STUDIO — CORE APPLICATION ENGINE (PASO 1)
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

  // Datos del Salón
  salon: {
    name: 'Nombre de tu Salón',
    address: 'Dirección de tu salón',
    phone: '',
    alias: '',
    depositPercent: 50,
    pin: '', // Vacío por defecto: la dueña lo crea la primera vez
    splashTitle: 'Tu espacio de belleza',
    splashSubtitle: 'Uñas & Peluquería profesional',
    splashHero: './assets/splash-hero.jpg'
  },

  // Colecciones (Inician limpias y vacías)
  categories: [],
  services: [],
  appointments: [],
  clients: [],
  finances: [],
  inspo: [],

  // Reserva en curso
  bookingDraft: {
    serviceId: null,
    inspoId: null,
    date: null,
    slot: null,
    clientName: '',
    clientPhone: ''
  }
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
  whatsapp: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>`
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
  }, 3000);
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

  // Si ya ingresó los 4 dígitos
  if (AppState.pinDraft.length === 4) {
    // Si la dueña aún no creó su PIN, este primer PIN ingresado se guarda como su PIN
    if (!AppState.salon.pin) {
      AppState.salon.pin = AppState.pinDraft;
      DataStore.set('salon', 'config', AppState.salon);
      AppState.isOwnerUnlocked = true;
      AppState.pinDraft = '';
      showToast('🎉 ¡PIN creado exitosamente! Acceso habilitado.');
      renderApp();
      return;
    }

    // Si ya existe un PIN, validarlo
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
// RENDERIZADO DE PANTALLAS
// ----------------------------------------------------------------------------

// 1. Portada
function renderSplash() {
  return `
    <div class="screen-viewport no-bottom-bar splash-container">
      <img src="${AppState.salon.splashHero || './assets/splash-hero.jpg'}" alt="Salón" class="splash-bg-media" onerror="this.style.display='none'" />
      <div class="splash-overlay"></div>

      <div class="splash-top">
        <span class="splash-brand-badge">${AppState.salon.name || 'Beauty Studio'}</span>
      </div>

      <div class="splash-bottom">
        <h1 class="splash-title">
          ${AppState.salon.splashTitle || 'Tu espacio de belleza'}<br />
          <span class="rose">${AppState.salon.splashSubtitle || 'Uñas & Peluquería'}</span>
        </h1>
        <p class="splash-subtitle">Elegí tu trabajo, agendá tu horario y asegurá tu turno online en simples pasos.</p>

        <button type="button" class="splash-btn-primary" onclick="navigateTo('services')">
          <span>Reservar Turno</span>
          <span style="font-size: 18px;">→</span>
        </button>

        <button type="button" class="splash-btn-secondary" onclick="navigateTo('home')">
          Conocer el Salón & Servicios
        </button>
      </div>
    </div>
  `;
}

// 2. Inicio
function renderHome() {
  const hasAppt = AppState.bookingDraft.serviceId !== null;
  return `
    <div class="screen-viewport">
      <header class="app-header">
        <div class="app-header-left">
          <h2 class="app-header-title">${AppState.salon.name || 'Beauty Studio'}</h2>
        </div>
      </header>

      <div class="home-content">
        <div class="salon-welcome-box">
          <h2>Hola, Bienvenida ✨</h2>
          <p>${AppState.salon.address || 'Tu centro de estética y cuidado personal'}</p>
        </div>

        <!-- Tarjeta de Próximo Turno -->
        <div class="next-appointment-card">
          <span class="card-badge ${hasAppt ? 'confirmed' : ''}">
            ${hasAppt ? 'Turno Confirmado' : 'Sin Turnos Pendientes'}
          </span>
          <h3 style="font-size: 15px; font-weight: 700; margin-top: 4px;">
            ${hasAppt ? 'Tenés una cita agendada' : 'Aún no tenés turnos agendados'}
          </h3>
          <p style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">
            ${hasAppt ? 'Te esperamos puntual para brindarte la mejor atención.' : 'Elegí tu diseño favorito y reservá en 1 minuto.'}
          </p>
          <button type="button" class="btn-book-service" style="margin-top: 12px; width: 100%;" onclick="navigateTo('services')">
            ${hasAppt ? 'Ver Servicios o Reprogramar' : 'Agendar Nuevo Turno'}
          </button>
        </div>

        <!-- Accesos directos -->
        <div class="quick-actions-grid">
          <div class="quick-action-tile" onclick="navigateTo('services')">
            <div class="tile-icon">${Icons.scissors}</div>
            <strong>Servicios y Precios</strong>
            <span>Catálogo completo del salón</span>
          </div>

          <div class="quick-action-tile" onclick="navigateTo('inspo')">
            <div class="tile-icon">${Icons.sparkles}</div>
            <strong>Galería de Diseños</strong>
            <span>Inspirate con trabajos reales</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

// 3. Servicios
function renderServices() {
  const categories = AppState.categories || [];
  const services = AppState.services || [];

  return `
    <div class="screen-viewport">
      <header class="app-header">
        <div class="app-header-left">
          <button type="button" class="header-back-btn" onclick="navigateTo('home')">${Icons.chevronLeft}</button>
          <h2 class="app-header-title">Servicios</h2>
        </div>
      </header>

      <!-- Categorías -->
      <div class="categories-filter-strip">
        <button class="cat-filter-chip active">Todos</button>
        ${categories.map((c) => `<button class="cat-filter-chip">${c.name}</button>`).join('')}
      </div>

      <!-- Lista de Servicios -->
      <div class="services-list">
        ${
          services.length === 0
            ? `
          <div style="text-align: center; padding: 40px 20px; color: var(--text-muted);">
            <p style="font-size: 14px; font-weight: 600;">Aún no hay servicios cargados en el salón.</p>
            <p style="font-size: 12px; margin-top: 6px;">La dueña puede agregarlos desde la pestaña <strong>Panel</strong>.</p>
          </div>
        `
            : services
                .map(
                  (s) => `
          <div class="service-card">
            <div class="service-info">
              <h3>${s.name}</h3>
              <div class="service-meta">
                <span>⏱️ ${s.duration || 60} min</span>
                <span class="service-price">$${Number(s.price || 0).toLocaleString('es-AR')}</span>
              </div>
            </div>
            <button type="button" class="btn-book-service" onclick="window.selectServiceAndBook('${s.id}')">
              Reservar
            </button>
          </div>
        `
                )
                .join('')
        }
      </div>
    </div>
  `;
}

// 4. Inspo
function renderInspo() {
  const inspoList = AppState.inspo || [];

  return `
    <div class="screen-viewport">
      <header class="app-header">
        <div class="app-header-left">
          <button type="button" class="header-back-btn" onclick="navigateTo('home')">${Icons.chevronLeft}</button>
          <h2 class="app-header-title">Muro de Diseños</h2>
        </div>
      </header>

      <div class="inspo-grid">
        ${
          inspoList.length === 0
            ? `
          <div style="grid-column: span 2; text-align: center; padding: 50px 20px; color: var(--text-muted);">
            <p style="font-size: 14px; font-weight: 600;">Galería de inspiración vacía.</p>
            <p style="font-size: 12px; margin-top: 6px;">La dueña puede subir fotos de sus trabajos desde la pestaña <strong>Panel</strong>.</p>
          </div>
        `
            : inspoList
                .map(
                  (item) => `
          <div class="inspo-item-card">
            <div class="inspo-thumb-wrap">
              <img src="${item.url}" alt="${item.title || 'Diseño'}" />
            </div>
            <div class="inspo-item-footer">
              <h4>${item.title || 'Diseño de Uñas'}</h4>
              <button type="button" class="btn-choose-inspo" onclick="window.selectInspo('${item.id}')">
                Elegir este diseño
              </button>
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

// 5. Mi Turno (Reserva)
function renderBooking() {
  return `
    <div class="screen-viewport">
      <header class="app-header">
        <div class="app-header-left">
          <button type="button" class="header-back-btn" onclick="navigateTo('services')">${Icons.chevronLeft}</button>
          <h2 class="app-header-title">Mi Turno</h2>
        </div>
      </header>

      <div class="booking-steps-container">
        <!-- Paso 1: Trabajo Elegido -->
        <div class="step-box">
          <div class="step-title">1. Trabajo a Realizar</div>
          <p style="font-size: 13px; color: var(--text-muted);">
            ${AppState.bookingDraft.serviceId ? 'Trabajo seleccionado' : 'Tocá abajo para elegir qué servicio deseas:'}
          </p>
          <button type="button" class="btn-book-service" style="margin-top: 8px; width: 100%;" onclick="navigateTo('services')">
            ${AppState.bookingDraft.serviceId ? 'Cambiar Trabajo' : 'Elegir Servicio del Catálogo'}
          </button>
        </div>

        <!-- Paso 2: Día y Horario -->
        <div class="step-box">
          <div class="step-title">2. Elegí Fecha y Hora Libre</div>
          <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 8px;">Horarios en tiempo real sincronizados con la agenda:</p>
          <div class="dates-row">
            <div class="date-pill active">Hoy</div>
            <div class="date-pill">Mañana</div>
            <div class="date-pill">Viernes</div>
            <div class="date-pill">Sábado</div>
          </div>
          <div class="slots-row" style="margin-top: 10px;">
            <div class="slot-pill active">10:00</div>
            <div class="slot-pill">12:00</div>
            <div class="slot-pill">15:00</div>
            <div class="slot-pill occupied">17:00 (Ocupado)</div>
          </div>
        </div>

        <!-- Paso 3: Datos de la Clienta -->
        <div class="step-box">
          <div class="step-title">3. Tus Datos de Contacto</div>
          <div class="form-group-clean">
            <label>Tu Nombre y Apellido</label>
            <input type="text" placeholder="Ej: Sofía Martínez" id="client-name-input" value="${AppState.bookingDraft.clientName || ''}" />
            <label>Tu Teléfono / WhatsApp</label>
            <input type="tel" placeholder="Ej: 11 2345 6789" id="client-phone-input" value="${AppState.bookingDraft.clientPhone || ''}" />
          </div>
        </div>

        <!-- Paso 4: Seña y WhatsApp -->
        <div class="step-box">
          <div class="step-title">4. Seña del 50% y Confirmación</div>
          <div class="deposit-info-box">
            <span style="font-size: 11px; font-weight: 800; color: var(--rose-dark); letter-spacing: 0.05em; text-transform: uppercase;">
              Seña para congelar tu turno
            </span>
            <div class="deposit-amount-highlight">$10.000</div>
            <p style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">
              Transferí el 50% al siguiente Alias de Mercado Pago / Banco:
            </p>
            <div class="alias-copy-row">
              <div class="alias-box">${AppState.salon.alias || 'TU.ALIAS.MP'}</div>
              <button type="button" class="btn-copy-alias" onclick="window.copyAlias()">Copiar</button>
            </div>
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

// 6. Panel del Dueño (Pantalla Completa)
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

  // Si está desbloqueado, mostrar las 6 Tarjetas Grandes del Panel
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

      <div style="padding: 0 18px 12px;">
        <span style="font-size: 11px; font-weight: 800; color: var(--rose-dark); letter-spacing: 0.08em; text-transform: uppercase;">
          Administración de ${AppState.salon.name || 'tu Salón'}
        </span>
      </div>

      <!-- 6 Tarjetas Grandes del Panel -->
      <div class="owner-dashboard-grid">
        <!-- 1. Agenda -->
        <div class="owner-big-card" onclick="window.openPanelSubView('agenda')">
          <div class="big-card-icon" style="background: #e0f2fe; color: #0284c7;">${Icons.calendar}</div>
          <div>
            <h3>Agenda de Turnos</h3>
            <p>Horarios, estados y WhatsApp</p>
          </div>
        </div>

        <!-- 2. Clientas -->
        <div class="owner-big-card" onclick="window.openPanelSubView('clients')">
          <div class="big-card-icon" style="background: #fdf2f8; color: #db2777;">${Icons.users}</div>
          <div>
            <h3>Clientas</h3>
            <p>Historial y fichas automáticas</p>
          </div>
        </div>

        <!-- 3. Servicios y Precios -->
        <div class="owner-big-card" onclick="window.openPanelSubView('services')">
          <div class="big-card-icon" style="background: var(--rose-soft); color: var(--rose-primary);">${Icons.scissors}</div>
          <div>
            <h3>Servicios & Precios</h3>
            <p>Categorías, trabajos y señas</p>
          </div>
        </div>

        <!-- 4. Finanzas y Caja -->
        <div class="owner-big-card" onclick="window.openPanelSubView('finances')">
          <div class="big-card-icon" style="background: #dcfce7; color: #16a34a;">${Icons.dollar}</div>
          <div>
            <h3>Finanzas & Caja</h3>
            <p>Ingresos, señas y cobros</p>
          </div>
        </div>

        <!-- 5. Datos del Salón -->
        <div class="owner-big-card" onclick="window.openPanelSubView('salon')">
          <div class="big-card-icon" style="background: #fef3c7; color: #d97706;">${Icons.store}</div>
          <div>
            <h3>Datos del Salón</h3>
            <p>Nombre, horarios y alias CBU</p>
          </div>
        </div>

        <!-- 6. Fotos y Textos -->
        <div class="owner-big-card" onclick="window.openPanelSubView('photos')">
          <div class="big-card-icon" style="background: #ede9fe; color: #7c3aed;">${Icons.camera}</div>
          <div>
            <h3>Fotos & Textos</h3>
            <p>Portada y galería de trabajos</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ----------------------------------------------------------------------------
// CONTROLADORES DE ACCIONES RÁPIDAS
// ----------------------------------------------------------------------------
window.lockOwnerPanel = () => {
  AppState.isOwnerUnlocked = false;
  AppState.pinDraft = '';
  showToast('🔒 Sesión cerrada');
  navigateTo('home');
};

window.copyAlias = () => {
  const alias = AppState.salon.alias || 'TU.ALIAS.MP';
  navigator.clipboard?.writeText(alias);
  showToast('📋 ¡Alias copiado al portapapeles!');
};

window.confirmBookingWhatsapp = () => {
  const name = document.getElementById('client-name-input')?.value.trim() || 'Clienta';
  const phone = document.getElementById('client-phone-input')?.value.trim() || '';
  const salonPhone = AppState.salon.phone || '5491100000000';

  const text = `¡Hola! Quiero confirmar mi turno en ${AppState.salon.name || 'el salón'}:\n• Nombre: ${name}\n• Teléfono: ${phone}\n• Seña: 50% enviada.`;
  const url = `https://wa.me/${salonPhone}?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
  showToast('✅ ¡Turno agendado y enviado por WhatsApp!');
};

window.openPanelSubView = (subView) => {
  showToast(`Ingresando a: ${subView}`);
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
  const showBottomNav = AppState.activeScreen !== 'splash' && !(AppState.activeScreen === 'panel' && !AppState.isOwnerUnlocked);

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
  // Inicializar Firebase o DataStore
  await initFirebase();

  // Cargar datos del salón
  const savedSalon = await DataStore.get('salon', 'config');
  if (savedSalon) {
    AppState.salon = { ...AppState.salon, ...savedSalon };
  }

  // Cargar categorías, servicios e inspo
  AppState.categories = await DataStore.getAll('categories');
  AppState.services = await DataStore.getAll('services');
  AppState.inspo = await DataStore.getAll('inspo');
  AppState.appointments = await DataStore.getAll('appointments');
  AppState.clients = await DataStore.getAll('clients');
  AppState.finances = await DataStore.getAll('finances');

  // Render inicial
  renderApp();
}

window.addEventListener('DOMContentLoaded', startApp);
