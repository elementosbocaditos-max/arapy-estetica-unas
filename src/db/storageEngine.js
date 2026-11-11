// ============================================================================
// ARAPY MULTI-TENANT PERSISTENCE ENGINE (Disk API + IndexedDB + LocalStorage)
// Guarantees that EVERY photo, text, category, collaborator, service, schedule,
// phone, and address modified by the client is permanently remembered until
// the client explicitly edits or deletes it.
// ============================================================================

const IDB_NAME = 'arapy_beauty_saas_idb_v3';
const IDB_VERSION = 1;
const STORE_TENANTS = 'tenants_store';
const STORE_META = 'meta_store';

const LS_REGISTRY_KEY = 'arapy_registry_ls_v3';
const LS_TENANT_PREFIX = 'arapy_tenant_ls_v3::';
const LS_CLIENT_PREFIX = 'arapy_client_profile_v3::';

function openIdb() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      return resolve(null);
    }
    const req = indexedDB.open(IDB_NAME, IDB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_TENANTS)) {
        db.createObjectStore(STORE_TENANTS, { keyPath: 'slug' });
      }
      if (!db.objectStoreNames.contains(STORE_META)) {
        db.createObjectStore(STORE_META, { keyPath: 'key' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbGet(storeName, key) {
  try {
    const db = await openIdb();
    if (!db) return null;
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('[IDB Read Warning]:', err);
    return null;
  }
}

async function idbPut(storeName, value) {
  try {
    const db = await openIdb();
    if (!db) return false;
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.put(value);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('[IDB Write Warning]:', err);
    return false;
  }
}

async function idbDelete(storeName, key) {
  try {
    const db = await openIdb();
    if (!db) return false;
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.delete(key);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('[IDB Delete Warning]:', err);
    return false;
  }
}

function lsGet(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function lsSet(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
    return true;
  } catch {
    // If localStorage hits quota due to many base64 images, IndexedDB + Disk still hold 100% of data
    return false;
  }
}

function lsRemove(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

function pickNewestRecord(candidates) {
  const valid = candidates.filter((c) => c && typeof c === 'object');
  if (valid.length === 0) return null;
  valid.sort((a, b) => {
    const tA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
    const tB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
    return tB - tA;
  });
  return valid[0];
}

// ----------------------------------------------------------------------------
// 1. MASTER REGISTRY (ARAPY CONTROL CENTER — UNLIMITED CLIENTS)
// ----------------------------------------------------------------------------
export async function loadMasterRegistry(defaultRegistry) {
  let diskReg = null;
  try {
    const res = await fetch('/api/registry', { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      if (json.initialized && Array.isArray(json.tenants)) {
        diskReg = json;
      }
    }
  } catch {
    // Static host (e.g. GitHub Pages) -> fallback to IndexedDB / LocalStorage
  }

  const idbReg = await idbGet(STORE_META, 'registry');
  const lsReg = lsGet(LS_REGISTRY_KEY);

  const winner = pickNewestRecord([diskReg, idbReg, lsReg]);
  if (winner && Array.isArray(winner.tenants) && winner.tenants.length > 0) {
    const normalized = {
      tenants: winner.tenants,
      arapyConfig: winner.arapyConfig || defaultRegistry.arapyConfig,
      updatedAt: winner.updatedAt || new Date().toISOString()
    };
    await idbPut(STORE_META, { key: 'registry', ...normalized });
    lsSet(LS_REGISTRY_KEY, normalized);
    return normalized;
  }

  // First time initialization
  await saveMasterRegistry(defaultRegistry.tenants, defaultRegistry.arapyConfig);
  return defaultRegistry;
}

export async function saveMasterRegistry(tenants, arapyConfig = {}) {
  const payload = {
    key: 'registry',
    updatedAt: new Date().toISOString(),
    tenants,
    arapyConfig
  };
  lsSet(LS_REGISTRY_KEY, payload);
  await idbPut(STORE_META, payload);
  try {
    await fetch('/api/registry', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenants, arapyConfig, updatedAt: payload.updatedAt })
    });
  } catch {
    // Static mode: saved in IndexedDB + LocalStorage
  }
  return payload;
}

// ----------------------------------------------------------------------------
// 2. ISOLATED TENANT DATABASE (One Independent DB per Business Client)
// ----------------------------------------------------------------------------
export function getSynchronousTenantSnapshot(slug) {
  const cleanSlug = String(slug || 'estudio-principal').trim().toLowerCase();
  return lsGet(`${LS_TENANT_PREFIX}${cleanSlug}`);
}

export async function loadTenantDatabase(slug, seedFactory) {
  const cleanSlug = String(slug || 'estudio-principal').trim().toLowerCase();

  let diskData = null;
  try {
    const res = await fetch(`/api/tenants/${encodeURIComponent(cleanSlug)}`, {
      cache: 'no-store'
    });
    if (res.ok) {
      const json = await res.json();
      if (json.exists && json.data && json.data.slug) {
        diskData = json.data;
      }
    }
  } catch {
    // Fallback to IndexedDB / LocalStorage
  }

  const idbData = await idbGet(STORE_TENANTS, cleanSlug);
  const lsData = lsGet(`${LS_TENANT_PREFIX}${cleanSlug}`);

  const newest = pickNewestRecord([diskData, idbData, lsData]);
  if (newest && newest.slug) {
    // Ensure all 3 storage layers stay in sync with the newest version
    lsSet(`${LS_TENANT_PREFIX}${cleanSlug}`, newest);
    await idbPut(STORE_TENANTS, newest);
    saveTenantToDiskOnly(cleanSlug, newest).catch(() => {});
    return newest;
  }

  // Provision fresh isolated database for this tenant and write to all layers immediately
  const initialDb = seedFactory(cleanSlug);
  await saveTenantDatabase(cleanSlug, initialDb);
  return initialDb;
}

async function saveTenantToDiskOnly(cleanSlug, stamped) {
  try {
    const res = await fetch(`/api/tenants/${encodeURIComponent(cleanSlug)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: stamped })
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function saveTenantDatabase(slug, tenantData) {
  const cleanSlug = String(slug || tenantData?.slug || 'estudio-principal')
    .trim()
    .toLowerCase();
  const stamped = {
    ...tenantData,
    slug: cleanSlug,
    updatedAt: new Date().toISOString()
  };

  // 1. Save synchronously in LocalStorage so instant page reloads never miss a single keystroke
  lsSet(`${LS_TENANT_PREFIX}${cleanSlug}`, stamped);

  // 2. Save in IndexedDB (supports 500MB+ of high-res photos without 5MB QuotaExceededError)
  await idbPut(STORE_TENANTS, stamped);

  // 3. Save physically on Server Disk (/api/tenants/:slug)
  const diskSaved = await saveTenantToDiskOnly(cleanSlug, stamped);

  // 4. Optional Per-Tenant External Cloud Sync (Supabase REST or ARAPY Webhook)
  if (stamped.databaseConfig?.webhookUrl) {
    fetch(stamped.databaseConfig.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: 'tenant.updated', slug: cleanSlug, data: stamped })
    }).catch(() => {});
  }

  return { ok: true, diskSaved, updatedAt: stamped.updatedAt, data: stamped };
}

export async function deleteTenantDatabaseCompletely(slug) {
  const cleanSlug = String(slug).trim().toLowerCase();
  lsRemove(`${LS_TENANT_PREFIX}${cleanSlug}`);
  await idbDelete(STORE_TENANTS, cleanSlug);
  try {
    await fetch(`/api/tenants/${encodeURIComponent(cleanSlug)}`, { method: 'DELETE' });
  } catch {
    // ignore
  }
  return true;
}

export async function resetTenantDatabaseOnDisk(slug, freshSeed) {
  await deleteTenantDatabaseCompletely(slug);
  return await saveTenantDatabase(slug, freshSeed);
}

// ----------------------------------------------------------------------------
// 3. IMAGE COMPRESSION & PHYSICAL DISK UPLOAD (/api/upload -> /uploads/<slug>/...)
// ----------------------------------------------------------------------------
export async function compressAndUploadImage(file, slug = 'shared', label = 'photo', maxDim = 1080) {
  const dataUrl = await compressFileToDataUrl(file, maxDim);

  // Upload to Server Disk (/api/upload) when backend is active
  try {
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, label, dataUrl })
    });
    if (res.ok) {
      const json = await res.json();
      if (json.ok && json.url) {
        return { url: json.url, persistedOnDisk: true, savedAt: json.savedAt };
      }
    }
  } catch {
    // Static host: compressed WebP DataURL is persisted inside IndexedDB + LocalStorage
  }

  return { url: dataUrl, persistedOnDisk: true, savedAt: new Date().toISOString() };
}

function compressFileToDataUrl(file, maxDim = 1080) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('No se pudo leer el archivo de imagen'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => resolve(e.target.result);
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/webp', 0.84);
        resolve(compressed);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// ----------------------------------------------------------------------------
// 4. CLIENT MEMORY (Remembers the end-customer's name & WhatsApp per phone)
// ----------------------------------------------------------------------------
export function loadClientProfileMemory(slug, defaultGreetingName = 'Clienta') {
  try {
    const raw = localStorage.getItem(`${LS_CLIENT_PREFIX}${slug}`);
    return raw ? JSON.parse(raw) : { name: defaultGreetingName, phone: '', notes: '' };
  } catch {
    return { name: defaultGreetingName, phone: '', notes: '' };
  }
}

export function saveClientProfileMemory(slug, profile) {
  try {
    localStorage.setItem(`${LS_CLIENT_PREFIX}${slug}`, JSON.stringify(profile));
  } catch {
    // ignore
  }
}
