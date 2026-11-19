// ============================================================================
// ARCHIVO AISLADO: CONFIGURACIÓN OFICIAL DE FIREBASE — ARAPY SOLUCIONES
// Conectado al ecosistema oficial de Arapy Soluciones + Consola Master
// ============================================================================

export const firebaseConfig = {
  apiKey: "AIzaSyDMJqy2Zdvih-Unk15WHZwBbOhL6unuOFE",
  authDomain: "arapy-soluciones.firebaseapp.com",
  projectId: "arapy-soluciones",
  storageBucket: "arapy-soluciones.firebasestorage.app",
  messagingSenderId: "655722100063",
  appId: "1:655722100063:web:001a30c069855340d4f2ea"
};

// ============================================================================
// CONFIGURACIÓN DE ÓRBITA ARAPY SOLUCIONES & CONSOLA MASTER
// ============================================================================
export const ARAPY_CONFIG = {
  appId: 'arapy-estetica-unas',
  appName: 'ARAPY Estética & Uñas',
  rubro: 'estetica-unas',
  // Colección raíz que escucha en tiempo real ArapyMasterConsole (https://arapysl.web.app/#master)
  registryCollection: 'tiendas_registradas',
  // Colección aislada para los datos operativos de cada salón (turnos, clientas, servicios, fotos, caja)
  tenantsCollection: 'arapy_salones',
  defaultSalonId: 'demo',
  defaultTrialDays: 30,
  // WhatsApp oficial de Arapy Soluciones
  supportWhatsapp: '5493751541211'
};

// ============================================================================
// UTILIDADES DE SLUG / NOMBRE EN EL LINK (MULTI-SALÓN)
// ============================================================================
const LAST_SALON_KEY = 'arapy_estetica::last_salon_id';
const LOCAL_REGISTRY_KEY = 'arapy_estetica::tenants_registry';
const DAY_MS = 24 * 60 * 60 * 1000;

export function normalizeSlug(raw) {
  if (!raw || typeof raw !== 'string') return '';
  return raw
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
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
// MOTOR DE SUSCRIPCIÓN COMPATIBLE 100% CON CONSOLA MASTER ARAPY
// (Espejo exacto de genericos/src/master/persistence/suscripcion.ts)
// ============================================================================
export function crearSuscripcionInicial(diasPrueba = ARAPY_CONFIG.defaultTrialDays) {
  const inicio = new Date();
  const fin = new Date(inicio.getTime() + diasPrueba * DAY_MS);
  return {
    estado: 'trial',
    trialInicio: inicio.toISOString(),
    trialFin: fin.toISOString(),
    activoHasta: fin.toISOString(),
    planId: 'trial',
    precioAbonadoARS: 0
  };
}

export function evaluarSuscripcion(s, now = new Date()) {
  if (!s) {
    return { allowed: true, status: 'trial', plan: 'trial', diasRestantes: ARAPY_CONFIG.defaultTrialDays, reason: '' };
  }

  const estado = (s.estado || 'activa').toLowerCase();
  if (estado === 'suspendida' || estado === 'suspended' || estado === 'paused') {
    return {
      allowed: false,
      status: 'suspended',
      plan: s.planId || 'trial',
      diasRestantes: 0,
      reason: 'Esta tienda se encuentra temporalmente pausada desde la Consola Master de Arapy Soluciones.'
    };
  }
  if (estado === 'cancelada') {
    return {
      allowed: false,
      status: 'suspended',
      plan: s.planId || 'trial',
      diasRestantes: 0,
      reason: 'La suscripción de este salón fue cancelada. Contactá a Arapy Soluciones para reactivarla.'
    };
  }

  if (estado === 'trial') {
    const hasta = s.trialFin ? new Date(s.trialFin) : null;
    if (!hasta || Number.isNaN(hasta.getTime()) || now.getTime() <= hasta.getTime()) {
      const dias = hasta ? Math.max(1, Math.ceil((hasta.getTime() - now.getTime()) / DAY_MS)) : ARAPY_CONFIG.defaultTrialDays;
      return { allowed: true, status: 'trial', plan: s.planId || 'trial', diasRestantes: dias, reason: '' };
    }
    return {
      allowed: false,
      status: 'expired',
      plan: s.planId || 'trial',
      diasRestantes: 0,
      reason: 'Finalizó el período de prueba de 30 días. Comunicate con Arapy Soluciones para activar tu plan.'
    };
  }

  // estado === 'activa'
  const hasta = s.activoHasta ? new Date(s.activoHasta) : null;
  if (!hasta || Number.isNaN(hasta.getTime()) || now.getTime() <= hasta.getTime()) {
    const dias = hasta ? Math.max(1, Math.ceil((hasta.getTime() - now.getTime()) / DAY_MS)) : 30;
    return { allowed: true, status: 'active', plan: s.planId || 'mensual', diasRestantes: dias, reason: '' };
  }
  return {
    allowed: false,
    status: 'expired',
    plan: s.planId || 'mensual',
    diasRestantes: 0,
    reason: 'Tu suscripción mensual/anual ha vencido. Comunicate con Arapy Soluciones para renovarla.'
  };
}

// ============================================================================
// INICIALIZADOR Y DRIVER DE BASE DE DATOS (FIRESTORE + CACHÉ LOCAL RÁPIDA)
// ============================================================================
let db = null;
let auth = null;
let storage = null;
let firestoreMod = null;
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
  if (isFirebaseLive && db) {
    return { db, auth, storage, isFirebaseLive: true };
  }
  if (hasValidConfig()) {
    try {
      const [appMod, fsMod, authMod, stMod] = await Promise.all([
        import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js'),
        import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js'),
        import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js'),
        import('https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js')
      ]);

      firestoreMod = fsMod;
      const app = appMod.getApps().length > 0 ? appMod.getApp() : appMod.initializeApp(firebaseConfig);
      try {
        db = fsMod.initializeFirestore(app, { ignoreUndefinedProperties: true });
      } catch {
        db = fsMod.getFirestore(app);
      }
      auth = authMod.getAuth(app);
      storage = stMod.getStorage(app);
      isFirebaseLive = true;
      console.log(`🔥 [Firebase Arapy]: Conectado en vivo a ${firebaseConfig.projectId} (Salón: ${activeSalonId})`);
      return { db, auth, storage, isFirebaseLive: true };
    } catch (err) {
      console.warn('⚠️ [Firebase] Error inicializando SDK, usando caché local aislada:', err);
      isFirebaseLive = false;
    }
  }
  return { db: null, auth: null, storage: null, isFirebaseLive: false };
}

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
    console.warn('Error guardando registro local:', err);
  }
}

// Migración transparente desde formato v3.8 single-salon al salón activo
function migrateLegacyLocalStorageIfNeeded(salonId) {
  const LEGACY_PREFIX = 'beauty_studio_db::';
  const targetPrefix = getLocalPrefix(salonId);
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(targetPrefix)) return;
    }
    if (salonId !== ARAPY_CONFIG.defaultSalonId) return;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(LEGACY_PREFIX)) {
        const val = localStorage.getItem(k);
        if (val !== null) localStorage.setItem(`${targetPrefix}${k.slice(LEGACY_PREFIX.length)}`, val);
      }
    }
  } catch {
    // ignore
  }
}

migrateLegacyLocalStorageIfNeeded(activeSalonId);

// ----------------------------------------------------------------------------
// ADAPTADOR UNIVERSAL MULTI-SALÓN (Firestore en vivo + Caché Local instantánea)
// ----------------------------------------------------------------------------
export const DataStore = {
  // Lectura síncrona instantánea desde caché local (para arranque ultrarrápido <50ms)
  getLocal(collection, id, salonId = activeSalonId) {
    try {
      const raw = localStorage.getItem(`${getLocalPrefix(salonId)}${collection}_${id}`);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  getAllLocal(collection, salonId = activeSalonId) {
    const list = [];
    const keyPrefix = `${getLocalPrefix(salonId)}${collection}_`;
    try {
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
    } catch {
      // ignore
    }
    return list;
  },

  // Guardar documento dentro del salón activo
  async set(collection, id, data, salonId = activeSalonId) {
    const prefix = getLocalPrefix(salonId);
    try {
      localStorage.setItem(`${prefix}${collection}_${id}`, JSON.stringify(data));
    } catch (e) {
      console.warn('LocalStorage lleno (los datos igual se guardan en Firebase):', e);
    }
    window.dispatchEvent(new CustomEvent('datastore-change', { detail: { salonId, collection, id, data } }));

    if (isFirebaseLive && db && firestoreMod) {
      try {
        await firestoreMod.setDoc(
          firestoreMod.doc(db, ARAPY_CONFIG.tenantsCollection, salonId, collection, id),
          data,
          { merge: true }
        );
      } catch (err) {
        console.error(`Error guardando en Firestore (${salonId}/${collection}/${id}):`, err);
      }
    }
    return data;
  },

  // Obtener documento del salón activo (Prioriza Firestore)
  async get(collection, id, salonId = activeSalonId) {
    const prefix = getLocalPrefix(salonId);
    if (isFirebaseLive && db && firestoreMod) {
      try {
        const snap = await firestoreMod.getDoc(
          firestoreMod.doc(db, ARAPY_CONFIG.tenantsCollection, salonId, collection, id)
        );
        if (snap.exists()) {
          const data = snap.data();
          try {
            localStorage.setItem(`${prefix}${collection}_${id}`, JSON.stringify(data));
          } catch { /* ignore quota */ }
          return data;
        }
      } catch (err) {
        console.warn('Error leyendo Firestore, usando caché local:', err);
      }
    }
    return this.getLocal(collection, id, salonId);
  },

  // Obtener lista completa de una colección del salón activo
  async getAll(collection, salonId = activeSalonId) {
    const prefix = getLocalPrefix(salonId);
    if (isFirebaseLive && db && firestoreMod) {
      try {
        const snap = await firestoreMod.getDocs(
          firestoreMod.collection(db, ARAPY_CONFIG.tenantsCollection, salonId, collection)
        );
        const list = [];
        const remoteIds = new Set();
        snap.forEach((d) => {
          const item = { id: d.id, ...d.data() };
          list.push(item);
          remoteIds.add(d.id);
          try {
            localStorage.setItem(`${prefix}${collection}_${d.id}`, JSON.stringify(item));
          } catch { /* ignore quota */ }
        });

        // Limpiar ítems locales que fueron borrados en Firestore
        const keyPrefix = `${prefix}${collection}_`;
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith(keyPrefix)) {
            const localId = k.replace(keyPrefix, '');
            if (!remoteIds.has(localId)) keysToRemove.push(k);
          }
        }
        if (snap.size > 0) {
          keysToRemove.forEach((k) => localStorage.removeItem(k));
        }

        if (list.length > 0) return list;
      } catch (err) {
        console.warn('Error leyendo colección de Firestore, usando caché local:', err);
      }
    }

    return this.getAllLocal(collection, salonId);
  },

  // Borrar documento del salón activo
  async remove(collection, id, salonId = activeSalonId) {
    const prefix = getLocalPrefix(salonId);
    localStorage.removeItem(`${prefix}${collection}_${id}`);
    window.dispatchEvent(new CustomEvent('datastore-change', { detail: { salonId, collection, id, deleted: true } }));

    if (isFirebaseLive && db && firestoreMod) {
      try {
        await firestoreMod.deleteDoc(
          firestoreMod.doc(db, ARAPY_CONFIG.tenantsCollection, salonId, collection, id)
        );
      } catch (err) {
        console.error('Error eliminando en Firestore:', err);
      }
    }
    return true;
  },

  async delete(collection, id, salonId = activeSalonId) {
    return this.remove(collection, id, salonId);
  },

  subscribe(collection, callback, salonId = activeSalonId) {
    let unsubscribeFirestore = null;

    if (isFirebaseLive && db && firestoreMod) {
      unsubscribeFirestore = firestoreMod.onSnapshot(
        firestoreMod.collection(db, ARAPY_CONFIG.tenantsCollection, salonId, collection),
        (snap) => {
          const list = [];
          snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
          callback(list);
        }
      );
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
// GESTOR DE SALONES & PUENTE CONSOLA MASTER ARAPY (tiendas_registradas)
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
  // Sincroniza la ficha del salón en tiendas_registradas/{salonId} para Consola Master
  async syncTenantMetadata(salonConfig, salonId = activeSalonId) {
    if (!salonId || salonId === ARAPY_CONFIG.defaultSalonId) return null;
    const nowIso = new Date().toISOString();
    const reg = getLocalRegistry();
    const existing = reg[salonId] || {};

    // Campos estrictamente permitidos por isValidStoreRegistration en firestore.rules de arapy-soluciones
    const firestoreCreatePayload = {
      slug: salonId,
      nombre: salonConfig?.name || existing.nombre || salonId,
      name: salonConfig?.name || existing.name || salonId,
      rubro: ARAPY_CONFIG.rubro,
      telefono: salonConfig?.phone || existing.telefono || '',
      phone: salonConfig?.phone || existing.phone || '',
      email: salonConfig?.email || existing.email || '',
      active: true,
      createdAt: existing.createdAt || nowIso,
      suscripcion: existing.suscripcion || crearSuscripcionInicial(ARAPY_CONFIG.defaultTrialDays)
    };

    reg[salonId] = {
      ...firestoreCreatePayload,
      publicUrl: getSalonPublicUrl(salonId),
      updatedAt: nowIso
    };
    saveLocalRegistry(reg);

    if (isFirebaseLive && db && firestoreMod) {
      try {
        const ref = firestoreMod.doc(db, ARAPY_CONFIG.registryCollection, salonId);
        const snap = await firestoreMod.getDoc(ref);
        if (!snap.exists()) {
          // Registro inicial nuevo: cumple 100% con isValidStoreRegistration()
          await firestoreMod.setDoc(ref, firestoreCreatePayload);
        } else {
          // Actualización comercial: NUNCA sobreescribe suscripcion ni createdAt gestionados por Consola Master
          await firestoreMod.setDoc(
            ref,
            {
              nombre: firestoreCreatePayload.nombre,
              name: firestoreCreatePayload.name,
              rubro: firestoreCreatePayload.rubro,
              telefono: firestoreCreatePayload.telefono,
              phone: firestoreCreatePayload.phone
            },
            { merge: true }
          );
        }
        return { ok: true, slug: salonId, syncedToCloud: true, record: reg[salonId] };
      } catch (err) {
        console.warn('Aviso sincronizando con tiendas_registradas (Consola Master):', err);
        return { ok: false, slug: salonId, syncedToCloud: false, error: err?.message || String(err) };
      }
    }
    return { ok: true, slug: salonId, syncedToCloud: false, record: reg[salonId] };
  },

  // Evalúa la suscripción en tiempo real desde tiendas_registradas/{salonId}
  async checkSubscription(salonId = activeSalonId) {
    if (!salonId || salonId === ARAPY_CONFIG.defaultSalonId) {
      return { allowed: true, status: 'trial', plan: 'demo', diasRestantes: 30, reason: '' };
    }

    const reg = getLocalRegistry();
    let suscripcion = reg[salonId]?.suscripcion || null;

    if (isFirebaseLive && db && firestoreMod) {
      try {
        const snap = await firestoreMod.getDoc(
          firestoreMod.doc(db, ARAPY_CONFIG.registryCollection, salonId)
        );
        if (snap.exists()) {
          const data = snap.data();
          if (data && data.suscripcion) {
            suscripcion = data.suscripcion;
            reg[salonId] = { ...(reg[salonId] || {}), ...data };
            saveLocalRegistry(reg);
          }
        }
      } catch (err) {
        console.warn('Error consultando suscripción en tiendas_registradas:', err);
      }
    }

    return evaluarSuscripcion(suscripcion);
  },

  // Verifica si el nombre del link (slug) está libre en tiendas_registradas
  async isSlugAvailable(candidateSlug) {
    const clean = normalizeSlug(candidateSlug);
    if (!clean || clean.length < 3) {
      return { ok: false, reason: 'El nombre del link debe tener al menos 3 caracteres.' };
    }
    if (clean === activeSalonId) {
      return { ok: true, same: true };
    }

    if (isFirebaseLive && db && firestoreMod) {
      try {
        const snap = await firestoreMod.getDoc(
          firestoreMod.doc(db, ARAPY_CONFIG.registryCollection, clean)
        );
        if (snap.exists()) {
          return { ok: false, reason: `El link "${clean}" ya está registrado por otro comercio en Arapy.` };
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

    await Promise.all(
      TENANT_COLLECTIONS.map(async (col) => {
        if (col === 'salon') {
          const cfg = currentSalonConfig || (await DataStore.get('salon', 'config', oldSalonId));
          if (cfg) {
            await DataStore.set('salon', 'config', { ...cfg, slug: clean, isDemo: false }, clean);
          }
        } else {
          const items = await DataStore.getAll(col, oldSalonId);
          await Promise.all(
            items
              .filter((item) => item && item.id)
              .map((item) => DataStore.set(col, item.id, item, clean))
          );
        }
      })
    );

    setActiveSalonId(clean, true);
    await this.syncTenantMetadata({ ...(currentSalonConfig || {}), slug: clean }, clean);

    return { ok: true, slug: clean, url: getSalonPublicUrl(clean) };
  }
};
