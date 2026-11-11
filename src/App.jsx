import React from 'react';
import {
  Sparkles,
  Settings,
  ShieldCheck,
  Pencil,
  Smartphone,
  LayoutGrid,
  CheckCircle2,
  Building2,
  DollarSign
} from 'lucide-react';
import { SaaSProvider, useSaaS } from './context/SaaSContext';
import SplashScreen from './components/client/SplashScreen';
import HomeDashboard from './components/client/HomeDashboard';
import ServicesScreen from './components/client/ServicesScreen';
import AddInspoScreen from './components/client/AddInspoScreen';
import BookingStudioSheet from './components/client/BookingStudioSheet';
import AICognitiveAdvisor from './components/client/AICognitiveAdvisor';
import OwnerAdminPanel from './components/admin/OwnerAdminPanel';
import ArapyMasterConsole from './components/admin/ArapyMasterConsole';

function MainWorkspace() {
  const {
    registry,
    activeSlug,
    switchTenant,
    tenantDb,
    saveStatus,
    activeScreen,
    setActiveScreen,
    viewMode,
    setViewMode,
    liveEditMode,
    setLiveEditMode,
    setActiveModal,
    toastMessage
  } = useSaaS();

  const isSuspended = tenantDb.status === 'suspended';

  return (
    <div className="arapy-app-shell">
      {/* Top SaaS & Live Editing Control Bar */}
      <header className="saas-top-control-bar">
        <div className="control-bar-left">
          <button
            type="button"
            className="arapy-brand-chip"
            onClick={() => setActiveModal('arapy')}
            title="Abrir Consola Maestra Multi-Negocios ARAPY"
          >
            <ShieldCheck size={15} />
            <span>ARAPY CONTROL</span>
          </button>

          {/* Active Tenant / Business Selector */}
          <div className="tenant-switcher-pill">
            <Building2 size={14} />
            <select
              value={activeSlug}
              onChange={(e) => switchTenant(e.target.value)}
              title="Cambiar de Cliente / Base de Datos"
            >
              {(registry.tenants || []).map((t) => (
                <option key={t.slug} value={t.slug}>
                  {t.businessName} ({t.slug})
                </option>
              ))}
            </select>
          </div>

          <span className="disk-persistence-indicator" title={saveStatus.lastSavedAt}>
            <CheckCircle2 size={13} />
            <span>{saveStatus.saving ? 'Guardando...' : saveStatus.message}</span>
          </span>
        </div>

        {/* Center Screen Navigation Pills */}
        <div className="control-bar-center">
          {[
            { id: 'splash', label: '1. Portada' },
            { id: 'home', label: '2. Inicio' },
            { id: 'services', label: '3. Servicios' },
            { id: 'inspo', label: '4. Add Inspo' },
            { id: 'booking', label: '5. Turno & Seña' }
          ].map((s) => (
            <button
              key={s.id}
              type="button"
              className={`screen-jump-pill ${
                activeScreen === s.id && viewMode === 'single' ? 'active' : ''
              }`}
              onClick={() => {
                setActiveScreen(s.id);
                setViewMode('single');
              }}
            >
              {s.label}
            </button>
          ))}

          <button
            type="button"
            className={`view-mode-toggle-btn ${viewMode === 'showcase' ? 'active' : ''}`}
            onClick={() =>
              setViewMode((prev) => (prev === 'showcase' ? 'single' : 'showcase'))
            }
            title="Alternar entre Vista Múltiple (todas las pantallas) y Vista Celular Individual"
          >
            {viewMode === 'showcase' ? (
              <>
                <Smartphone size={14} />
                <span>Ver 1 Pantalla</span>
              </>
            ) : (
              <>
                <LayoutGrid size={14} />
                <span>Ver Todas las Pantallas</span>
              </>
            )}
          </button>
        </div>

        {/* Right Action Buttons: Live Edit on Screen, AI Advisor, Owner Panel */}
        <div className="control-bar-right">
          <button
            type="button"
            className={`top-action-btn edit-live ${liveEditMode ? 'active' : ''}`}
            onClick={() => setLiveEditMode((p) => !p)}
            title="Activalo para tocar cualquier foto o texto de ejemplo en la pantalla y cambiarlo por el tuyo"
          >
            <Pencil size={14} />
            <span>{liveEditMode ? 'Edición en Vivo: ACTIVA' : 'Editar Fotos/Textos'}</span>
          </button>

          <button
            type="button"
            className="top-action-btn ai-btn"
            onClick={() => setActiveModal('ai')}
          >
            <Sparkles size={14} />
            <span>Asesora IA</span>
          </button>

          <button
            type="button"
            className="top-action-btn owner-btn"
            style={{ background: 'linear-gradient(135deg, #102a1c, #163825)', borderColor: '#7ee2a8', color: '#7ee2a8' }}
            onClick={() => setActiveModal('owner')}
            title="Abrir Sector de Finanzas, Caja, Señas y Comisiones"
          >
            <DollarSign size={14} />
            <span>Finanzas & Caja</span>
          </button>

          <button
            type="button"
            className="top-action-btn owner-btn"
            onClick={() => setActiveModal('owner')}
          >
            <Settings size={14} />
            <span>Panel del Dueño</span>
          </button>
        </div>
      </header>

      {/* Helper Banner when Live Edit Mode is Active */}
      {liveEditMode && (
        <div className="live-edit-helper-banner">
          <span>
            ✏️ <strong>MODO EDICIÓN EN VIVO ACTIVO:</strong> Hacé clic sobre cualquier{' '}
            <strong>texto</strong> o botón <strong>"Cambiar Foto"</strong> en las pantallas de
            abajo para poner tus propias imágenes, logo, precios y datos. Todo queda guardado
            automáticamente en el disco del servidor.
          </span>
          <button type="button" onClick={() => setActiveModal('owner')}>
            Abrir Panel Completo →
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
      ) : viewMode === 'single' ? (
        /* SINGLE MOBILE SCREEN VIEW */
        <main className="single-phone-stage">
          {activeScreen === 'splash' && <SplashScreen />}
          {activeScreen === 'home' && <HomeDashboard />}
          {activeScreen === 'services' && <ServicesScreen />}
          {activeScreen === 'inspo' && <AddInspoScreen />}
          {activeScreen === 'booking' && <BookingStudioSheet />}
        </main>
      ) : (
        /* SHOWCASE VIEW: ALL 5 INTERACTIVE SCREENS SIDE BY SIDE (MATCHING USER REFERENCES) */
        <main className="showcase-all-screens-stage">
          <section className="showcase-group">
            <div className="showcase-group-header">
              <span className="group-tag">FLUJO PRINCIPAL DE LA CLIENTA (UÑAS & PELO)</span>
              <h3>
                Portada Editorial • Inicio Inteligente • Catálogo "Nuestros Servicios" (100%
                Interactivos y Editables)
              </h3>
            </div>
            <div className="phones-row-trio">
              <div className="phone-frame-wrapper">
                <SplashScreen
                  onNavigate={(scr) => {
                    setActiveScreen(scr);
                    setViewMode('single');
                  }}
                />
              </div>
              <div className="phone-frame-wrapper">
                <HomeDashboard
                  onNavigate={(scr) => {
                    setActiveScreen(scr);
                    setViewMode('single');
                  }}
                />
              </div>
              <div className="phone-frame-wrapper">
                <ServicesScreen
                  onNavigate={(scr) => {
                    setActiveScreen(scr);
                    setViewMode('single');
                  }}
                />
              </div>
            </div>
          </section>

          <section className="showcase-group">
            <div className="showcase-group-header">
              <span className="group-tag">
                RESERVA CON "ADDED INSPO", SEÑA DEL 50% Y MURO OSCURO DE DISEÑOS
              </span>
              <h3>
                Tarjeta "BEAUTY STUDIO" (Manicure 3D + Seña + WhatsApp) • Muro Oscuro "Add
                Inspo"
              </h3>
            </div>
            <div className="phones-row-duo">
              <div className="phone-frame-wrapper">
                <BookingStudioSheet
                  onNavigate={(scr) => {
                    setActiveScreen(scr);
                    setViewMode('single');
                  }}
                />
              </div>
              <div className="phone-frame-wrapper">
                <AddInspoScreen
                  onNavigate={(scr) => {
                    setActiveScreen(scr);
                    setViewMode('single');
                  }}
                />
              </div>
            </div>
          </section>
        </main>
      )}

      {/* Toast Notification */}
      {toastMessage && <div className="arapy-toast-pill">{toastMessage}</div>}

      {/* Modals: AI Advisor, Owner Admin Panel, ARAPY Master Console */}
      <AICognitiveAdvisor />
      <OwnerAdminPanel />
      <ArapyMasterConsole />
    </div>
  );
}

export default function App() {
  return (
    <SaaSProvider>
      <MainWorkspace />
    </SaaSProvider>
  );
}
