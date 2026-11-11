import React, { useState } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  DollarSign,
  Settings,
  Pencil,
  Sparkles,
  ShieldCheck,
  Building2,
  ExternalLink,
  MessageCircle,
  QrCode,
  CheckCircle2,
  Plus,
  Home,
  Scissors,
  Compass,
  Calendar
} from 'lucide-react';
import { useSaaS } from '../../context/SaaSContext';

export default function InAppControlDrawer() {
  const {
    registry,
    activeSlug,
    switchTenant,
    tenantDb,
    saveStatus,
    activeScreen,
    setActiveScreen,
    liveEditMode,
    setLiveEditMode,
    activeModal,
    setActiveModal,
    showToast
  } = useSaaS();

  const [copiedLink, setCopiedLink] = useState(false);

  if (activeModal !== 'drawer') return null;

  const { branding = {}, finances = {} } = tenantDb;
  const businessName = branding.businessName || 'Tu Salón';

  // Base URL calculation
  const origin = window.location.origin;
  const pathname = window.location.pathname;
  const cleanBase = `${origin}${pathname}`.replace(/\/+$/, '');
  const clientShareUrl = `${cleanBase}?salon=${activeSlug}`;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(clientShareUrl);
    setCopiedLink(true);
    showToast('📋 ¡Link de tu tienda copiado al portapapeles!');
    setTimeout(() => setCopiedLink(false), 2400);
  };

  const handleShareWhatsapp = () => {
    const text = `¡Hola! 💅 Te invito a ver nuestro catálogo y agendar tu turno online en ${businessName}: ${clientShareUrl}`;
    const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const goToScreen = (scr) => {
    setActiveScreen(scr);
    setActiveModal('none');
  };

  return (
    <div className="inapp-drawer-backdrop" onClick={() => setActiveModal('none')}>
      <div
        className="inapp-control-drawer"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="inapp-drawer-header">
          <div className="drawer-header-brand">
            <span className="drawer-brand-badge">
              <ShieldCheck size={13} />
              <span>ARAPY BEAUTY APP</span>
            </span>
            <h3>{businessName}</h3>
            <span className="drawer-slug-label">Salón ID: {activeSlug}</span>
          </div>

          <button
            type="button"
            className="drawer-close-btn"
            onClick={() => setActiveModal('none')}
          >
            <X size={20} />
          </button>
        </div>

        <div className="inapp-drawer-body">
          {/* 1. HIGHLIGHTED: SHARE STORE LINK */}
          <div className="drawer-section share-highlight-box">
            <div className="drawer-section-title-row">
              <div className="section-title-left">
                <Share2 size={16} className="text-rose" />
                <h4>Link para Compartir de esta Tienda</h4>
              </div>
              <span className="live-badge">PÚBLICO</span>
            </div>
            <p className="drawer-subtext">
              Enviá este enlace a tus clientes para que reserven turnos en esta tienda:
            </p>

            <div className="drawer-url-input-wrap">
              <input
                type="text"
                readOnly
                value={clientShareUrl}
                className="drawer-url-input"
                onClick={(e) => e.target.select()}
              />
              <button
                type="button"
                className={`drawer-copy-btn ${copiedLink ? 'copied' : ''}`}
                onClick={handleCopyLink}
                title="Copiar link"
              >
                {copiedLink ? <Check size={15} /> : <Copy size={15} />}
                <span>{copiedLink ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>

            <div className="drawer-share-actions">
              <button
                type="button"
                className="drawer-btn whatsapp"
                onClick={handleShareWhatsapp}
              >
                <MessageCircle size={15} />
                <span>Enviar por WhatsApp</span>
              </button>
              <button
                type="button"
                className="drawer-btn qr"
                onClick={() => setActiveModal('share')}
              >
                <QrCode size={15} />
                <span>Ver QR & Opciones</span>
              </button>
            </div>
          </div>

          {/* 2. TENANT SWITCHER & MULTI-STORE MANAGER */}
          <div className="drawer-section">
            <div className="drawer-section-title-row">
              <div className="section-title-left">
                <Building2 size={16} />
                <h4>Cambiar de Salón / Tienda</h4>
              </div>
              <button
                type="button"
                className="drawer-mini-link-btn"
                onClick={() => setActiveModal('arapy')}
              >
                <Plus size={13} />
                <span>Nueva Tienda</span>
              </button>
            </div>

            <div className="drawer-select-wrapper">
              <select
                value={activeSlug}
                onChange={(e) => {
                  switchTenant(e.target.value);
                  showToast(`Cambiado a: ${e.target.value}`);
                }}
                className="drawer-select"
              >
                {(registry.tenants || []).map((t) => (
                  <option key={t.slug} value={t.slug}>
                    {t.businessName || t.slug} ({t.slug})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 3. BUSINESS CONTROLS & MODULES */}
          <div className="drawer-section">
            <h4>Administración del Negocio</h4>
            <div className="drawer-action-grid">
              {/* Finances */}
              <button
                type="button"
                className="drawer-tile finance"
                onClick={() => setActiveModal('owner')}
              >
                <DollarSign size={20} />
                <div>
                  <strong>Finanzas & Caja</strong>
                  <span>Arqueo, señas y gastos</span>
                </div>
              </button>

              {/* Owner Panel */}
              <button
                type="button"
                className="drawer-tile owner"
                onClick={() => setActiveModal('owner')}
              >
                <Settings size={20} />
                <div>
                  <strong>Panel del Dueño</strong>
                  <span>Servicios, precios y fotos</span>
                </div>
              </button>

              {/* Live Edit Switch */}
              <button
                type="button"
                className={`drawer-tile live-edit ${liveEditMode ? 'active' : ''}`}
                onClick={() => {
                  setLiveEditMode((p) => !p);
                  showToast(
                    !liveEditMode
                      ? '✏️ Modo Edición ACTIVADO: Tocá cualquier texto o foto para cambiarlo'
                      : 'Modo Edición desactivado'
                  );
                }}
              >
                <Pencil size={20} />
                <div>
                  <strong>Modo Edición en Vivo</strong>
                  <span>{liveEditMode ? 'ACTIVADO (Tocá la pantalla)' : 'Tocar para activar'}</span>
                </div>
              </button>

              {/* AI Advisor */}
              <button
                type="button"
                className="drawer-tile ai"
                onClick={() => setActiveModal('ai')}
              >
                <Sparkles size={20} />
                <div>
                  <strong>Asesora IA</strong>
                  <span>Asistente inteligente 24/7</span>
                </div>
              </button>
            </div>
          </div>

          {/* 4. MASTER CONSOLE LINK */}
          <div className="drawer-section master-section">
            <div className="master-console-banner">
              <div className="master-text">
                <strong>Consola Master Central ARAPY</strong>
                <span>Control multi-aplicaciones genéricas</span>
              </div>
              <div className="master-actions">
                <a
                  href="https://arapysl.web.app/#master"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="drawer-master-link"
                >
                  <ExternalLink size={14} />
                  <span>arapysl.web.app/#master</span>
                </a>
                <button
                  type="button"
                  className="drawer-master-btn"
                  onClick={() => setActiveModal('arapy')}
                >
                  <ShieldCheck size={14} />
                  <span>Control Local</span>
                </button>
              </div>
            </div>
          </div>

          {/* 5. QUICK APP SCREEN NAVIGATION */}
          <div className="drawer-section screens-section">
            <h4>Pantallas de la App</h4>
            <div className="drawer-screens-row">
              <button
                type="button"
                className={`drawer-screen-pill ${activeScreen === 'splash' ? 'active' : ''}`}
                onClick={() => goToScreen('splash')}
              >
                <span>Portada</span>
              </button>
              <button
                type="button"
                className={`drawer-screen-pill ${activeScreen === 'home' ? 'active' : ''}`}
                onClick={() => goToScreen('home')}
              >
                <Home size={13} />
                <span>Inicio</span>
              </button>
              <button
                type="button"
                className={`drawer-screen-pill ${activeScreen === 'services' ? 'active' : ''}`}
                onClick={() => goToScreen('services')}
              >
                <Scissors size={13} />
                <span>Servicios</span>
              </button>
              <button
                type="button"
                className={`drawer-screen-pill ${activeScreen === 'inspo' ? 'active' : ''}`}
                onClick={() => goToScreen('inspo')}
              >
                <Compass size={13} />
                <span>Inspo</span>
              </button>
              <button
                type="button"
                className={`drawer-screen-pill ${activeScreen === 'booking' ? 'active' : ''}`}
                onClick={() => goToScreen('booking')}
              >
                <Calendar size={13} />
                <span>Turno</span>
              </button>
            </div>
          </div>

          {/* Footer Save Status */}
          <div className="drawer-footer-status">
            <CheckCircle2 size={14} className="text-success" />
            <span>{saveStatus.saving ? 'Guardando cambios...' : 'Todos los cambios se guardan automáticamente'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
