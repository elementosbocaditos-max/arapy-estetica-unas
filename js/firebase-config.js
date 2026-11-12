// ============================================================================
// ARCHIVO AISLADO: CONFIGURACIÓN DE FIREBASE
// Pegá acá los datos de tu nuevo proyecto de Firebase:
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
// INICIALIZADOR Y DRIVER DE BASE DE DATOS
// Soporta Firestore en tiempo real + Fallback en LocalStorage si aún no se cargaron claves
// ============================================================================
let db = null;
let auth = null;
let storage = null;
let isFirebaseLive = false;

// Comprobar si se ingresó un Project ID real
const hasValidConfig = () => {
  return (
    firebaseConfig.projectId &&
    firebaseConfig.projectId !== 'TU_PROJECT_ID' &&
    firebaseConfig.apiKey &&
    firebaseConfig.apiKey !== 'TU_API_KEY_AQUI'
  );
};

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
      console.log('🔥 [Firebase]: Conectado exitosamente en tiempo real a', firebaseConfig.projectId);
      return { db, auth, storage, isFirebaseLive: true };
    } catch (err) {
      console.warn('⚠️ [Firebase] Error inicializando SDK, usando almacenamiento local:', err);
      isFirebaseLive = false;
    }
  } else {
    console.log('ℹ️ [Firebase]: Esperando claves de Firebase en firebase-config.js. Usando LocalStorage activo.');
    isFirebaseLive = false;
  }
  return { db: null, auth: null, storage: null, isFirebaseLive: false };
}

// ----------------------------------------------------------------------------
// ADAPTADOR UNIVERSAL (Firestore en vivo o LocalStorage unificado)
// ----------------------------------------------------------------------------
const LOCAL_PREFIX = 'beauty_studio_db::';

export const DataStore = {
  // Guardar documento
  async set(collection, id, data) {
    const serialized = JSON.stringify(data);
    localStorage.setItem(`${LOCAL_PREFIX}${collection}_${id}`, serialized);
    window.dispatchEvent(new CustomEvent('datastore-change', { detail: { collection, id, data } }));

    if (isFirebaseLive && db) {
      try {
        const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
        await setDoc(doc(db, collection, id), data, { merge: true });
      } catch (err) {
        console.error('Error guardando en Firestore:', err);
      }
    }
    return data;
  },

  // Obtener documento
  async get(collection, id) {
    if (isFirebaseLive && db) {
      try {
        const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
        const snap = await getDoc(doc(db, collection, id));
        if (snap.exists()) {
          const data = snap.data();
          localStorage.setItem(`${LOCAL_PREFIX}${collection}_${id}`, JSON.stringify(data));
          return data;
        }
      } catch (err) {
        console.warn('Error leyendo Firestore, usando fallback local:', err);
      }
    }

    const local = localStorage.getItem(`${LOCAL_PREFIX}${collection}_${id}`);
    return local ? JSON.parse(local) : null;
  },

  // Obtener lista completa de una colección
  async getAll(collection) {
    if (isFirebaseLive && db) {
      try {
        const { collection: colRef, getDocs } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
        const snap = await getDocs(colRef(db, collection));
        const list = [];
        snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
        return list;
      } catch (err) {
        console.warn('Error leyendo colección de Firestore, usando local:', err);
      }
    }

    // Fallback LocalStorage
    const list = [];
    const keyPrefix = `${LOCAL_PREFIX}${collection}_`;
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

  // Borrar documento
  async remove(collection, id) {
    localStorage.removeItem(`${LOCAL_PREFIX}${collection}_${id}`);
    window.dispatchEvent(new CustomEvent('datastore-change', { detail: { collection, id, deleted: true } }));

    if (isFirebaseLive && db) {
      try {
        const { doc, deleteDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
        await deleteDoc(doc(db, collection, id));
      } catch (err) {
        console.error('Error eliminando en Firestore:', err);
      }
    }
    return true;
  },

  // Escucha en tiempo real (Suscripción)
  subscribe(collection, callback) {
    let unsubscribeFirestore = null;

    if (isFirebaseLive && db) {
      import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js').then(({ collection: colRef, onSnapshot }) => {
        unsubscribeFirestore = onSnapshot(colRef(db, collection), (snap) => {
          const list = [];
          snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
          callback(list);
        });
      });
    }

    // Escucha de eventos locales y entre pestañas
    const handleLocal = () => {
      this.getAll(collection).then(callback);
    };

    window.addEventListener('datastore-change', handleLocal);
    window.addEventListener('storage', handleLocal);

    // Ejecutar de inmediato
    this.getAll(collection).then(callback);

    return () => {
      if (unsubscribeFirestore) unsubscribeFirestore();
      window.removeEventListener('datastore-change', handleLocal);
      window.removeEventListener('storage', handleLocal);
    };
  }
};
