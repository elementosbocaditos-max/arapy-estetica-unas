// ============================================================================
// ARCHIVO AISLADO: CONFIGURACIÓN DE FIREBASE & ARAPY SOLUCIONES (MULTI-SALÓN)
// Pegá acá los datos de tu proyecto de Firebase de Arapy Soluciones:
// ============================================================================

export const firebaseConfig = {
  apiKey: "TU_API_KEY_AQUI",
  authDomain: "TU_PROJECT_ID.firebaseapp.com",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_PROJECT_ID.appspot.com",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID"
};

// ============================================================================
// CONFIGURACIÓN DE ÓRBITA ARAPY SOLUCIONES & CONSOLA MASTER
// Ajustá estos nombres si tu Consola Master usa otra colección raíz:
// ============================================================================
export const ARAPY_CONFIG = {
  appId: 'arapy-estetica-unas',
  appName: 'ARAPY Estética & Uñas',
  // Colección raíz en Firestore donde Consola Master gestiona cada salón/suscripción
  tenantsCollection: 'arapy_salones',
  // Salón por defecto cuando alguien ingresa sin ?salon= en la URL
  defaultSalonId: 'demo',
  // WhatsApp de soporte de Arapy Soluciones (para renovar suscripciones vencidas)
  supportWhatsapp: '5491123456789'
};

// ============================================================================
// UTILIDADES DE SLUG / NOMBRE EN EL LINK (MULTI-SALÓN)
// ============================================================================
const LAST_SALON_KEY = 'arapy_estetica::last_salon_id';
const LOCAL_REGISTRY_KEY = 'arapy_estetica::tenants_registry';

export function normalizeSlug(raw) {
  if (!raw || typeof raw !== 'string') return '';
  return raw
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quitar acentos (uñas -> unas)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')    // Solo letras, números, espacios y guiones
    .trim()
    .replace(/\s+/g, '-')            // Espacios -> guiones
    .replace(/-+/g, '-')             // Guiones repetidos -> uno solo
    .replace(/^-|-$/g, '')           // Sin guiones al inicio o final
    .slice(0, 40);
}

export function resolveSalonIdFromUrl() {
  try {
    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get('salon') || params.get('s') || params.get('negocio');
    if (fromQuery) {
      const clean = normalizeSlug(fromQuery);
      if (clean) {
        localStorage.setItem(LAST_SALON_KEY, clean);
        return clean;
      }
    }

    // Soporte opcional para hash (#/nombre-salon)
    if (window.location.hash && window.location.hash.startsWith('#/')) {
      const hashSlug = normalizeSlug(window.location.hash.slice(2).split(/[/?]/)[0]);
      if (hashSlug) {
        localStorage.setItem(LAST_SALON_KEY, hashSlug);
        return hashSlug;
      }
    }

    const lastSaved = normalizeSlug(localStorage.getItem(LAST_SALON_KEY) || '');
    if (lastSaved) return lastSaved;
  } catch (err) {
    console.warn('Error resolviendo salonId de URL:', err);
  }
  return ARAPY_CONFIG.defaultSalonId;
}

let activeSalonId = resolveSalonIdFromUrl();

export function getActiveSalonId() {
  return activeSalonId;
}

export function setActiveSalonId(slug, updateBrowserUrl = true) {
  const clean = normalizeSlug(slug) || ARAPY_CONFIG.defaultSalonId;
  activeSalonId = clean;
  try {
    localStorage.setItem(LAST_SALON_KEY, clean);
    if (updateBrowserUrl && window.history && window.history.replaceState) {
      const url = new URL(window.location.href);
      url.searchParams.set('salon', clean);
      window.history.replaceState({}, '', url.toString());
    }
  } catch (err) {
    console.warn('No se pudo actualizar la URL del navegador:', err);
  }
  return activeSalonId;
}

export function getSalonPublicUrl(slug = activeSalonId) {
  const clean = normalizeSlug(slug) || ARAPY_CONFIG.defaultSalonId;
  try {
    const base = `${window.location.origin}${window.location.pathname}`;
    return `${base}?salon=${encodeURIComponent(clean)}`;
  } catch {
    return `?salon=${encodeURIComponent(clean)}`;
  }
}

// ============================================================================
// INICIALIZADOR Y DRIVER DE BASE DE DATOS
// Soporta Firestore Multi-Salón en tiempo real + Fallback aislado en LocalStorage
// ============================================================================
let db = null;
let auth = null;
let storage = null;
let isFirebaseLive = false;

const hasValidConfig = () => {
  return (
    firebaseConfig.projectId &&
    firebaseConfig.projectId !== 'TU_PROJECT_ID' &&
    firebaseConfig.apiKey &&
    firebaseConfig.apiKey !== 'TU_API_KEY_AQUI'
  );
};

export function isFirebaseConnected() {
  return isFirebaseLive;
}

export async function initFirebase() {
  if (hasValidConfig()) {
    try {
      const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js');
      const { getFirestore } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
      const { getAuth } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');
      const { getStorage } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js');

      const app = initializeApp(firebaseConfig);
      db = getFirestore(app);
      auth = getAuth(app);
      storage = getStorage(app);
      isFirebaseLive = true;
      console.log(`🔥 [Firebase Arapy]: Conectado en vivo a ${firebaseConfig.projectId} (Salón: ${activeSalonId})`);
      return { db, auth, storage, isFirebaseLive: true };
    } catch (err) {
      console.warn('⚠️ [Firebase] Error inicializando SDK, usando almacenamiento local aislado:', err);
      isFirebaseLive = false;
    }
  } else {
    console.log(`ℹ️ [Firebase Arapy]: Esperando claves en firebase-config.js. Modo local multi-salón activo (Salón: ${activeSalonId}).`);
    isFirebaseLive = false;
  }
  return { db: null, auth: null, storage: null, isFirebaseLive: false };
}

// ----------------------------------------------------------------------------
// HELPERS DE PREFIJO AISLADO POR SALÓN
// En Firestore: arapy_salones/{salonId}/{collection}/{docId}
// En LocalStorage: arapy_estetica::{salonId}::{collection}_{docId}
// ----------------------------------------------------------------------------
function getLocalPrefix(salonId = activeSalonId) {
  return `arapy_estetica::${salonId}::`;
}

function getLocalRegistry() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_REGISTRY_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveLocalRegistry(reg) {
  try {
    localStorage.setItem(LOCAL_REGISTRY_KEY, JSON.stringify(reg));
  } catch (err) {
    console.warn('Error guardando registro local de salones:', err);
  }
}

// Migración transparente desde el formato antiguo (v3.8 single-salon) al salón activo
function migrateLegacyLocalStorageIfNeeded(salonId) {
  const LEGACY_PREFIX = 'beauty_studio_db::';
  const targetPrefix = getLocalPrefix(salonId);
  try {
    let hasNewData = false;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(targetPrefix)) {
        hasNewData = true;
        break;
      }
    }
    if (hasNewData) return;

    const legacyKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(LEGACY_PREFIX)) {
        legacyKeys.push(k);
      }
    }
    if (legacyKeys.length > 0 && salonId === ARAPY_CONFIG.defaultSalonId) {
      for (const k of legacyKeys) {
        const suffix = k.slice(LEGACY_PREFIX.length);
        const val = localStorage.getItem(k);
        if (val !== null) {
          localStorage.setItem(`${targetPrefix}${suffix}`, val);
        }
      }
    }
  } catch (err) {
    console.warn('Migración legacy omitida:', err);
  }
}

migrateLegacyLocalStorageIfNeeded(activeSalonId);

// ----------------------------------------------------------------------------
// ADAPTADOR UNIVERSAL MULTI-SALÓN (Firestore en vivo o LocalStorage aislado)
// ----------------------------------------------------------------------------
export const DataStore = {
  // Guardar documento dentro del salón activo
  async set(collection, id, data, salonId = activeSalonId) {
    const prefix = getLocalPrefix(salonId);
    const serialized = JSON.stringify(data);
    localStorage.setItem(`${prefix}${collection}_${id}`, serialized);
    window.dispatchEvent(new CustomEvent('datastore-change', { detail: { salonId, collection, id, data } }));

    if (isFirebaseLive && db) {
      try {
        const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
        await setDoc(doc(db, ARAPY_CONFIG.tenantsCollection, salonId, collection, id), data, { merge: true });
      } catch (err) {
        console.error(`Error guardando en Firestore (${salonId}/${collection}/${id}):`, err);
      }
    }
    return data;
  },

  // Obtener documento del salón activo (Prioriza Firestore para no perder datos tras actualizaciones)
  async get(collection, id, salonId = activeSalonId) {
    const prefix = getLocalPrefix(salonId);
    if (isFirebaseLive && db) {
      try {
        const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
        const snap = await getDoc(doc(db, ARAPY_CONFIG.tenantsCollection, salonId, collection, id));
        if (snap.exists()) {
          const data = snap.data();
          localStorage.setItem(`${prefix}${collection}_${id}`, JSON.stringify(data));
          return data;
        }
      } catch (err) {
        console.warn('Error leyendo Firestore, usando caché local:', err);
      }
    }

    const local = localStorage.getItem(`${prefix}${collection}_${id}`);
    return local ? JSON.parse(local) : null;
  },

  // Obtener lista completa de una colección del salón activo
  async getAll(collection, salonId = activeSalonId) {
    const prefix = getLocalPrefix(salonId);
    if (isFirebaseLive && db) {
      try {
        const { collection: colRef, getDocs } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
        const snap = await getDocs(colRef(db, ARAPY_CONFIG.tenantsCollection, salonId, collection));
        const list = [];
        snap.forEach((d) => {
          const item = { id: d.id, ...d.data() };
          list.push(item);
          localStorage.setItem(`${prefix}${collection}_${d.id}`, JSON.stringify(item));
        });
        return list;
      } catch (err) {
        console.warn('Error leyendo colección de Firestore, usando caché local:', err);
      }
    }

    const list = [];
    const keyPrefix = `${prefix}${collection}_`;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(keyPrefix)) {
        const id = key.replace(keyPrefix, '');
        try {
          const item = JSON.parse(localStorage.getItem(key));
          list.push({ id, ...item });
        } catch {
          // ignore corrupted item
        }
      }
    }
    return list;
  },

  // Borrar documento del salón activo
  async remove(collection, id, salonId = activeSalonId) {
    const prefix = getLocalPrefix(salonId);
    localStorage.removeItem(`${prefix}${collection}_${id}`);
    window.dispatchEvent(new CustomEvent('datastore-change', { detail: { salonId, collection, id, deleted: true } }));

    if (isFirebaseLive && db) {
      try {
        const { doc, deleteDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
        await deleteDoc(doc(db, ARAPY_CONFIG.tenantsCollection, salonId, collection, id));
      } catch (err) {
        console.error('Error eliminando en Firestore:', err);
      }
    }
    return true;
  },

  async delete(collection, id, salonId = activeSalonId) {
    return this.remove(collection, id, salonId);
  },

  // Escucha en tiempo real (Suscripción por salón)
  subscribe(collection, callback, salonId = activeSalonId) {
    let unsubscribeFirestore = null;

    if (isFirebaseLive && db) {
      import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js').then(({ collection: colRef, onSnapshot }) => {
        unsubscribeFirestore = onSnapshot(colRef(db, ARAPY_CONFIG.tenantsCollection, salonId, collection), (snap) => {
          const list = [];
          snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
          callback(list);
        });
      });
    }

    const handleLocal = () => {
      this.getAll(collection, salonId).then(callback);
    };

    window.addEventListener('datastore-change', handleLocal);
    window.addEventListener('storage', handleLocal);
    this.getAll(collection, salonId).then(callback);

    return () => {
      if (unsubscribeFirestore) unsubscribeFirestore();
      window.removeEventListener('datastore-change', handleLocal);
      window.removeEventListener('storage', handleLocal);
    };
  }
};

// ============================================================================
// GESTOR DE SALONES & PUENTE CONSOLA MASTER ARAPY SOLUCIONES
// ============================================================================
const TENANT_COLLECTIONS = [
  'salon',
  'categories',
  'services',
  'addons',
  'appointments',
  'clients',
  'finances',
  'photoBank',
  'blockedSlots',
  'inspo'
];

export const TenantManager = {
  // Sincroniza la ficha raíz del salón (arapy_salones/{salonId}) que lee la Consola Master
  async syncTenantMetadata(salonConfig, salonId = activeSalonId) {
    const nowIso = new Date().toISOString();
    const reg = getLocalRegistry();
    const existing = reg[salonId] || {};

    const meta = {
      salonId,
      slug: salonId,
      appId: ARAPY_CONFIG.appId,
      appName: ARAPY_CONFIG.appName,
      name: salonConfig?.name || 'Nuevo Salón',
      phone: salonConfig?.phone || '',
      address: salonConfig?.address || '',
      publicUrl: getSalonPublicUrl(salonId),
      status: existing.status || 'active',       // 'active' | 'trial' | 'suspended'
      plan: existing.plan || 'estandar',         // Gestionable desde Consola Master
      expiresAt: existing.expiresAt || null,     // ISO string opcional (ej. '2026-12-31T23:59:59Z')
      createdAt: existing.createdAt || nowIso,
      updatedAt: nowIso
    };

    reg[salonId] = meta;
    saveLocalRegistry(reg);

    if (isFirebaseLive && db) {
      try {
        const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
        // merge: true preserva campos que haya escrito la Consola Master (status, expiresAt, plan, notes)
        await setDoc(
          doc(db, ARAPY_CONFIG.tenantsCollection, salonId),
          {
            salonId: meta.salonId,
            slug: meta.slug,
            appId: meta.appId,
            appName: meta.appName,
            name: meta.name,
            phone: meta.phone,
            address: meta.address,
            publicUrl: meta.publicUrl,
            updatedAt: nowIso
          },
          { merge: true }
        );
      } catch (err) {
        console.warn('No se pudo sincronizar metadata del salón con Consola Master:', err);
      }
    }
    return meta;
  },

  // Consulta el estado de suscripción en Firestore (controlado por Consola Master Arapy)
  async checkSubscription(salonId = activeSalonId) {
    const reg = getLocalRegistry();
    let meta = reg[salonId] || { status: 'active', plan: 'estandar', expiresAt: null };

    if (isFirebaseLive && db) {
      try {
        const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
        const snap = await getDoc(doc(db, ARAPY_CONFIG.tenantsCollection, salonId));
        if (snap.exists()) {
          meta = { ...meta, ...snap.data() };
          reg[salonId] = meta;
          saveLocalRegistry(reg);
        }
      } catch (err) {
        console.warn('Error verificando suscripción en Firestore:', err);
      }
    }

    const status = (meta.status || 'active').toLowerCase();
    const isSuspended = status === 'suspended' || status === 'paused' || status === 'blocked' || status === 'inactivo';
    let isExpired = false;

    if (meta.expiresAt) {
      const expTime = new Date(meta.expiresAt).getTime();
      if (!Number.isNaN(expTime) && Date.now() > expTime) {
        isExpired = true;
      }
    }

    return {
      allowed: !isSuspended && !isExpired,
      status: isSuspended ? 'suspended' : isExpired ? 'expired' : status,
      plan: meta.plan || 'estandar',
      expiresAt: meta.expiresAt || null,
      reason: isSuspended
        ? 'Esta tienda se encuentra temporalmente pausada desde la Consola Master de Arapy Soluciones.'
        : isExpired
          ? 'La suscripción de este salón ha vencido. Comunicate con Arapy Soluciones para renovarla.'
          : ''
    };
  },

  // Verifica si un nombre de link (slug) está libre para usar
  async isSlugAvailable(candidateSlug) {
    const clean = normalizeSlug(candidateSlug);
    if (!clean || clean.length < 3) {
      return { ok: false, reason: 'El nombre del link debe tener al menos 3 caracteres.' };
    }
    if (clean === activeSalonId) {
      return { ok: true, same: true };
    }

    if (isFirebaseLive && db) {
      try {
        const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
        const snap = await getDoc(doc(db, ARAPY_CONFIG.tenantsCollection, clean));
        if (snap.exists()) {
          return { ok: false, reason: `El link "${clean}" ya está en uso por otro salón.` };
        }
      } catch (err) {
        console.warn('No se pudo validar disponibilidad en Firestore:', err);
      }
    } else {
      const reg = getLocalRegistry();
      if (reg[clean]) {
        return { ok: false, reason: `El link "${clean}" ya está en uso en este dispositivo.` };
      }
    }

    return { ok: true, clean };
  },

  // Migra todos los datos del salón actual a un nuevo slug sin perder nada
  async renameSalonSlug(newRawSlug, currentSalonConfig) {
    const clean = normalizeSlug(newRawSlug);
    const check = await this.isSlugAvailable(clean);
    if (!check.ok) {
      return { ok: false, error: check.reason };
    }
    if (check.same) {
      return { ok: true, slug: clean, url: getSalonPublicUrl(clean) };
    }

    const oldSalonId = activeSalonId;

    // 1. Copiar todas las colecciones al nuevo salonId
    for (const col of TENANT_COLLECTIONS) {
      if (col === 'salon') {
        const cfg = currentSalonConfig || (await DataStore.get('salon', 'config', oldSalonId));
        if (cfg) {
          await DataStore.set('salon', 'config', { ...cfg, slug: clean, isDemo: false }, clean);
        }
      } else {
        const items = await DataStore.getAll(col, oldSalonId);
        for (const item of items) {
          if (item && item.id) {
            await DataStore.set(col, item.id, item, clean);
          }
        }
      }
    }

    // 2. Activar nuevo slug y actualizar la barra de direcciones del navegador
    setActiveSalonId(clean, true);

    // 3. Registrar metadata en Consola Master bajo el nuevo slug
    await this.syncTenantMetadata({ ...(currentSalonConfig || {}), slug: clean }, clean);

    return { ok: true, slug: clean, url: getSalonPublicUrl(clean) };
  }
};
