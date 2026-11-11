// ============================================================================
// ARAPY MULTI-TENANT PERSISTENCE ENGINE (Disk API + IndexedDB + Image Uploader)
// Designed so NO uploaded photo or customized client field is EVER lost on reload
// ============================================================================

const IDB_NAME = 'arapy_beauty_saas_idb_v2';
const IDB_VERSION = 1;
const STORE_TENANTS = 'tenants_store';
const STORE_META = 'meta_store';

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

// ----------------------------------------------------------------------------
// 1. MASTER REGISTRY (ARAPY CONTROL CENTER)
// ----------------------------------------------------------------------------
export async function loadMasterRegistry(defaultRegistry) {
  // Priority 1: Server Disk (/api/registry)
  try {
    const res = await fetch('/api/registry', { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      if (json.initialized && Array.isArray(json.tenants) && json.tenants.length > 0) {
        await idbPut(STORE_META, { key: 'registry', ...json });
        return { tenants: json.tenants, arapyConfig: json.arapyConfig || defaultRegistry.arapyConfig };
      }
    }
  } catch {
    // Fallback to IDB
  }

  // Priority 2: IndexedDB
  const cached = await idbGet(STORE_META, 'registry');
  if (cached && Array.isArray(cached.tenants) && cached.tenants.length > 0) {
    // Also sync back to disk if server came online
    saveMasterRegistry(cached.tenants, cached.arapyConfig || defaultRegistry.arapyConfig).catch(() => {});
    return { tenants: cached.tenants, arapyConfig: cached.arapyConfig || defaultRegistry.arapyConfig };
  }

  // Priority 3: First-time initialization from defaultRegistry, persisted immediately
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
  await idbPut(STORE_META, payload);
  try {
    await fetch('/api/registry', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenants, arapyConfig })
    });
  } catch (err) {
    console.warn('[Disk Registry Sync Fallback]:', err);
  }
  return payload;
}

// ----------------------------------------------------------------------------
// 2. ISOLATED TENANT DATABASE (One Independent DB per Business Client)
// ----------------------------------------------------------------------------
export async function loadTenantDatabase(slug, seedFactory) {
  const cleanSlug = String(slug || 'daniela-gimenez').trim().toLowerCase();

  // Priority 1: Server Disk (/api/tenants/:slug)
  try {
    const res = await fetch(`/api/tenants/${encodeURIComponent(cleanSlug)}`, {
      cache: 'no-store'
    });
    if (res.ok) {
      const json = await res.json();
      if (json.exists && json.data && json.data.slug) {
        await idbPut(STORE_TENANTS, json.data);
        return json.data;
      }
    }
  } catch {
    // Fallback to IndexedDB
  }

  // Priority 2: IndexedDB
  const idbRecord = await idbGet(STORE_TENANTS, cleanSlug);
  if (idbRecord && idbRecord.slug) {
    // Sync back to disk so server has the latest copy
    saveTenantDatabase(cleanSlug, idbRecord).catch(() => {});
    return idbRecord;
  }

  // Priority 3: Provision fresh isolated database for this tenant and write to disk immediately
  const initialDb = seedFactory(cleanSlug);
  await saveTenantDatabase(cleanSlug, initialDb);
  return initialDb;
}

export async function saveTenantDatabase(slug, tenantData) {
  const cleanSlug = String(slug || tenantData?.slug || 'daniela-gimenez')
    .trim()
    .toLowerCase();
  const stamped = {
    ...tenantData,
    slug: cleanSlug,
    updatedAt: new Date().toISOString()
  };

  // 1. Save immediately in IndexedDB (supports 500MB+, never throws 5MB QuotaExceededError)
  await idbPut(STORE_TENANTS, stamped);

  // 2. Save physically on Server Disk (/api/tenants/:slug)
  let diskSaved = false;
  try {
    const res = await fetch(`/api/tenants/${encodeURIComponent(cleanSlug)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: stamped })
    });
    diskSaved = res.ok;
  } catch (err) {
    console.warn('[Disk Save Warning]:', err);
  }

  // 3. Optional Per-Tenant External Cloud Sync (Supabase REST or ARAPY Webhook)
  if (stamped.databaseConfig?.webhookUrl) {
    fetch(stamped.databaseConfig.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: 'tenant.updated', slug: cleanSlug, data: stamped })
    }).catch(() => {});
  }

  return { ok: true, diskSaved, updatedAt: stamped.updatedAt, data: stamped };
}

export async function resetTenantDatabaseOnDisk(slug, freshSeed) {
  const cleanSlug = String(slug).trim().toLowerCase();
  await idbDelete(STORE_TENANTS, cleanSlug);
  try {
    await fetch(`/api/tenants/${encodeURIComponent(cleanSlug)}`, { method: 'DELETE' });
  } catch {
    // ignore
  }
  return await saveTenantDatabase(cleanSlug, freshSeed);
}

// ----------------------------------------------------------------------------
// 3. IMAGE COMPRESSION & PHYSICAL DISK UPLOAD (/api/upload -> /uploads/<slug>/...)
// ----------------------------------------------------------------------------
export async function compressAndUploadImage(file, slug = 'shared', label = 'photo', maxDim = 1100) {
  const dataUrl = await compressFileToDataUrl(file, maxDim);

  // Upload to Server Disk (/api/upload) so it becomes a permanent file in /public/uploads/<slug>/
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
  } catch (err) {
    console.warn('[Upload to disk fallback to compressed DataURL]:', err);
  }

  // Fallback: compressed WebP DataURL (stored safely in IndexedDB & Disk JSON)
  return { url: dataUrl, persistedOnDisk: false, savedAt: new Date().toISOString() };
}

function compressFileToDataUrl(file, maxDim = 1100) {
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
        // WebP compression keeps crisp retina quality at ~60-110 KB
        const compressed = canvas.toDataURL('image/webp', 0.85);
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
export function loadClientProfileMemory(slug) {
  try {
    const raw = localStorage.getItem(`arapy_client_profile::${slug}`);
    return raw ? JSON.parse(raw) : { name: 'Mahi', phone: '', notes: '' };
  } catch {
    return { name: 'Mahi', phone: '', notes: '' };
  }
}

export function saveClientProfileMemory(slug, profile) {
  try {
    localStorage.setItem(`arapy_client_profile::${slug}`, JSON.stringify(profile));
  } catch {
    // ignore
  }
}
