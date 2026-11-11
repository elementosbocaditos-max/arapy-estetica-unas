import React from 'react';
import { SaaSProvider, useSaaS } from './context/SaaSContext';
import SplashScreen from './components/client/SplashScreen';
import HomeDashboard from './components/client/HomeDashboard';
import ServicesScreen from './components/client/ServicesScreen';
import AddInspoScreen from './components/client/AddInspoScreen';
import BookingStudioSheet from './components/client/BookingStudioSheet';
import AICognitiveAdvisor from './components/client/AICognitiveAdvisor';
import OwnerAdminPanel from './components/admin/OwnerAdminPanel';
import ArapyMasterConsole from './components/admin/ArapyMasterConsole';
import ShareStoreModal from './components/common/ShareStoreModal';
import InAppControlDrawer from './components/common/InAppControlDrawer';

function MainAppShell() {
  const {
    tenantDb,
    activeScreen,
    setActiveScreen,
    liveEditMode,
    setLiveEditMode,
    setActiveModal,
    toastMessage
  } = useSaaS();

  const isSuspended = tenantDb.status === 'suspended';

  return (
    <div className="arapy-native-app-root">
      {/* Subtle Live Edit Indicator Pill (Only visible when owner is editing in live mode) */}
      {liveEditMode && (
        <div className="inapp-live-edit-pill">
          <span>✏️ <strong>Modo Edición Activo:</strong> Tocá cualquier texto o foto para editar</span>
          <button
            type="button"
            className="inapp-live-edit-finish-btn"
            onClick={() => setLiveEditMode(false)}
          >
            Guardar & Finalizar
          </button>
        </div>
      )}

      {/* Suspended Tenant Overlay (Controlled from ARAPY Master Console) */}
      {isSuspended ? (
        <div className="suspended-screen-banner">
          <div className="suspended-card">
            <h2>🔒 Servicio Pausado Temporalmente</h2>
            <p>
              La cuenta de <strong>{tenantDb.branding?.businessName}</strong> se encuentra
              suspendida desde la Consola Central ARAPY. Sus datos y fotos siguen intactos en su
              base de datos.
            </p>
            <button
              type="button"
              className="admin-primary-btn"
              onClick={() => setActiveModal('arapy')}
            >
              Abrir Consola ARAPY para Reactivar
            </button>
          </div>
        </div>
      ) : (
        /* NATIVE FULL-SCREEN RESPONSIVE APPLICATION VIEWPORT (NO FAKE PHONE BEZEL) */
        <main className="native-app-viewport">
          {activeScreen === 'splash' && <SplashScreen onNavigate={setActiveScreen} />}
          {activeScreen === 'home' && <HomeDashboard onNavigate={setActiveScreen} />}
          {activeScreen === 'services' && <ServicesScreen onNavigate={setActiveScreen} />}
          {activeScreen === 'inspo' && <AddInspoScreen onNavigate={setActiveScreen} />}
          {activeScreen === 'booking' && <BookingStudioSheet onNavigate={setActiveScreen} />}
        </main>
      )}

      {/* Toast Notification Pill */}
      {toastMessage && <div className="arapy-toast-pill">{toastMessage}</div>}

      {/* Modals & In-App Drawer */}
      <InAppControlDrawer />
      <ShareStoreModal />
      <AICognitiveAdvisor />
      <OwnerAdminPanel />
      <ArapyMasterConsole />
    </div>
  );
}

export default function App() {
  return (
    <SaaSProvider>
      <MainAppShell />
    </SaaSProvider>
  );
}
