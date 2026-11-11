import React, { useState } from 'react';
import {
  X,
  Plus,
  Building2,
  Database,
  CheckCircle2,
  Ban,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Settings,
  Trash2,
  Share2,
  MessageCircle,
  QrCode
} from 'lucide-react';
import { useSaaS } from '../../context/SaaSContext';

export default function ArapyMasterConsole() {
  const {
    registry,
    activeSlug,
    switchTenant,
    createNewTenantFromArapy,
    updateTenantMetaFromArapy,
    deleteTenantFromArapy,
    toggleTenantStatusFromArapy,
    activeModal,
    setActiveModal,
    showToast
  } = useSaaS();

  const [newBusinessName, setNewBusinessName] = useState('');
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newWhatsapp, setNewWhatsapp] = useState('5491100000000');
  const [newCity, setNewCity] = useState('Dirección / Ciudad');
  const [recentlyCreatedSlug, setRecentlyCreatedSlug] = useState(null);
  const [copiedSlug, setCopiedSlug] = useState(null);

  if (activeModal !== 'arapy') return null;

  const origin = window.location.origin;
  const pathname = window.location.pathname;
  const cleanBase = `${origin}${pathname}`.replace(/\/+$/, '');

  const getClientShareUrl = (slug) => `${cleanBase}?salon=${slug}`;
  const getOwnerShareUrl = (slug) => `${cleanBase}?salon=${slug}&panel=owner`;

  const handleCreateTenant = async (e) => {
    e.preventDefault();
    if (!newBusinessName.trim()) {
      showToast('Ingresá el nombre comercial del nuevo cliente');
      return;
    }
    const createdSlug = await createNewTenantFromArapy({
      businessName: newBusinessName.trim(),
      ownerName: newOwnerName.trim() || 'Titular del Negocio',
      whatsappNumber: newWhatsapp.trim(),
      city: newCity.trim(),
      plan: 'PRO IA FULL'
    });
    if (createdSlug) {
      setRecentlyCreatedSlug(createdSlug);
      setNewBusinessName('');
      setNewOwnerName('');
      showToast(`🚀 ¡Tienda "${createdSlug}" creada! Su link para compartir ya está listo.`);
    }
  };

  const copyClientLink = (slug, isOwner = false) => {
    const link = isOwner ? getOwnerShareUrl(slug) : getClientShareUrl(slug);
    navigator.clipboard?.writeText(link);
    setCopiedSlug(`${slug}-${isOwner ? 'owner' : 'client'}`);
    setTimeout(() => setCopiedSlug(null), 2500);
    showToast(
      isOwner
        ? `🔐 Link de Panel de Dueño copiado para ${slug}`
        : `🔗 ¡Link de la Tienda copiado para ${slug}!`
    );
  };

  const shareViaWhatsapp = (slug, businessName) => {
    const link = getClientShareUrl(slug);
    const text = `¡Hola! 💅 Te comparto el link de ${businessName || slug} para ver servicios y agendar turnos online: ${link}`;
    const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const activeTenantObj = (registry.tenants || []).find((t) => t.slug === activeSlug) || {
    slug: activeSlug,
    businessName: 'Salón Principal'
  };

  return (
    <div className="modal-backdrop" onClick={() => setActiveModal('none')}>
      <div
        className="admin-modal-window arapy-master-window"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="admin-modal-header arapy-header">
          <div>
            <div className="admin-badge-row">
              <span className="arapy-master-pill">
                <ShieldCheck size={13} />
                <span>CONSOLA CENTRAL ARAPY • CLIENTES ILIMITADOS</span>
              </span>
            </div>
            <h2>Panel Maestro ARAPY — Control de Clientes y Bases de Datos</h2>
          </div>

          <div className="admin-header-right">
            <a
              href="https://arapysl.web.app/#master"
              target="_blank"
              rel="noopener noreferrer"
              className="arapy-switch-btn"
              style={{
                background: 'linear-gradient(135deg, #102a1c, #163825)',
                color: '#7ee2a8',
                borderColor: '#7ee2a8',
                textDecoration: 'none'
              }}
              title="Abrir tu Consola Central ARAPY en arapysl.web.app/#master"
            >
              <ExternalLink size={14} />
              <span>Abrir arapysl.web.app/#master</span>
            </a>
            <button
              type="button"
              className="arapy-switch-btn"
              onClick={() => setActiveModal('owner')}
            >
              <Settings size={14} />
              <span>Editar Negocio Activo ({activeSlug})</span>
            </button>
            <button
              type="button"
              className="modal-close-icon-btn"
              onClick={() => setActiveModal('none')}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="admin-tab-content">
          {/* ================================================================= */}
          {/* PROMINENT TOP HERO CARD: LINK PARA COMPARTIR DE LA TIENDA ACTIVA  */}
          {/* ================================================================= */}
          <div className="master-active-share-hero">
            <div className="share-hero-top">
              <div className="share-hero-title">
                <span className="share-badge-highlight">
                  <Share2 size={13} />
                  <span>LINK PARA COMPARTIR DE LA TIENDA ACTIVA</span>
                </span>
                <h3>{activeTenantObj.businessName || activeSlug}</h3>
                <span className="share-hero-slug">ID / Ruta: <code>?salon={activeSlug}</code></span>
              </div>
              <div className="share-hero-actions">
                <button
                  type="button"
                  className="share-hero-btn wa"
                  onClick={() => shareViaWhatsapp(activeSlug, activeTenantObj.businessName)}
                >
                  <MessageCircle size={15} />
                  <span>Compartir por WhatsApp</span>
                </button>
                <button
                  type="button"
                  className="share-hero-btn qr"
                  onClick={() => setActiveModal('share')}
                >
                  <QrCode size={15} />
                  <span>Ver Código QR</span>
                </button>
                <a
                  href={getClientShareUrl(activeSlug)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="share-hero-btn open"
                >
                  <ExternalLink size={15} />
                  <span>Abrir App</span>
                </a>
              </div>
            </div>

            <div className="share-hero-link-input-row">
              <input
                type="text"
                readOnly
                value={getClientShareUrl(activeSlug)}
                className="master-link-input"
                onClick={(e) => e.target.select()}
              />
              <button
                type="button"
                className={`master-copy-link-btn ${
                  copiedSlug === `${activeSlug}-client` ? 'copied' : ''
                }`}
                onClick={() => copyClientLink(activeSlug, false)}
              >
                {copiedSlug === `${activeSlug}-client` ? <Check size={16} /> : <Copy size={16} />}
                <span>
                  {copiedSlug === `${activeSlug}-client`
                    ? '¡Link Copiado!'
                    : 'Copiar Link para Clientes'}
                </span>
              </button>
            </div>
          </div>

          {/* RECENTLY CREATED NOTIFICATION BOX WITH SHARE LINK */}
          {recentlyCreatedSlug && (
            <div className="new-tenant-share-banner">
              <div className="banner-left">
                <CheckCircle2 size={18} className="text-success" />
                <div>
                  <strong>¡Nueva Tienda Creada Exitosamente: "{recentlyCreatedSlug}"!</strong>
                  <p>Ya podés compartir este enlace público con el cliente o sus usuarias:</p>
                  <code className="new-slug-code">{getClientShareUrl(recentlyCreatedSlug)}</code>
                </div>
              </div>
              <div className="banner-right">
                <button
                  type="button"
                  className="new-tenant-copy-btn"
                  onClick={() => copyClientLink(recentlyCreatedSlug, false)}
                >
                  <Copy size={14} />
                  <span>Copiar Link de la Nueva Tienda</span>
                </button>
                <button
                  type="button"
                  className="new-tenant-open-btn"
                  onClick={() => {
                    switchTenant(recentlyCreatedSlug);
                    setActiveModal('none');
                  }}
                >
                  <ExternalLink size={14} />
                  <span>Abrir Nueva Tienda Ahora</span>
                </button>
              </div>
            </div>
          )}

          <div className="admin-grid-2col">
            {/* Left: Provision Unlimited New Clients with Isolated DB */}
            <div className="admin-panel-box">
              <h3>➕ Dar de Alta Nuevo Cliente Comercial (Sin Límite de Clientes)</h3>
              <p>
                Cada cliente que creás acá recibe su propia base de datos independiente (
                <code>arapy_tenant_db::&lt;slug&gt;</code>), su propio espacio de fotos,
                categorías, colaboradores y su link exclusivo para compartir:
              </p>

              <form className="admin-form-stack" onSubmit={handleCreateTenant}>
                <label>
                  Nombre Comercial del Salón / Tienda (Editable)
                  <input
                    type="text"
                    value={newBusinessName}
                    onChange={(e) => setNewBusinessName(e.target.value)}
                    placeholder="Ej: Salón Bella Uñas & Estilistas"
                    required
                  />
                </label>
                <label>
                  Nombre del/la Titular del Salón (Editable)
                  <input
                    type="text"
                    value={newOwnerName}
                    onChange={(e) => setNewOwnerName(e.target.value)}
                    placeholder="Ej: Titular del Negocio"
                  />
                </label>
                <div className="admin-row-2">
                  <label>
                    Teléfono / WhatsApp del Salón
                    <input
                      type="text"
                      value={newWhatsapp}
                      onChange={(e) => setNewWhatsapp(e.target.value)}
                      placeholder="54911..."
                    />
                  </label>
                  <label>
                    Dirección / Ciudad / Sucursal
                    <input
                      type="text"
                      value={newCity}
                      onChange={(e) => setNewCity(e.target.value)}
                      placeholder="Ej: Av. Principal 123"
                    />
                  </label>
                </div>

                <button type="submit" className="admin-primary-btn full-width-btn">
                  <Plus size={16} />
                  <span>Crear Nuevo Cliente + Generar Link para Compartir</span>
                </button>
              </form>
            </div>

            {/* Right: List of All Registered Businesses in ARAPY */}
            <div className="admin-panel-box">
              <h3>
                🏢 Clientes / Negocios Activos en tu Red ARAPY ({registry.tenants?.length || 0})
              </h3>
              <p className="admin-panel-subtext">
                Cada tienda tiene su link propio para compartir con clientas y su link de administración para el dueño:
              </p>

              <div className="arapy-tenants-list">
                {(registry.tenants || []).map((t) => {
                  const isCurrent = t.slug === activeSlug;
                  const isSuspended = t.status === 'suspended';
                  const clientUrl = getClientShareUrl(t.slug);

                  return (
                    <div
                      key={t.slug}
                      className={`arapy-tenant-card ${isCurrent ? 'current-tenant' : ''} ${
                        isSuspended ? 'suspended-tenant' : ''
                      }`}
                    >
                      <div className="arapy-tenant-top">
                        <div style={{ flex: 1 }}>
                          <div className="arapy-tenant-title-row">
                            <Building2 size={16} />
                            <input
                              type="text"
                              value={t.businessName || ''}
                              onChange={(e) =>
                                updateTenantMetaFromArapy(t.slug, {
                                  businessName: e.target.value
                                })
                              }
                              style={{
                                border: '1px solid #dfd7d8',
                                borderRadius: 8,
                                padding: '4px 8px',
                                fontWeight: 700,
                                fontSize: 13,
                                minWidth: 200
                              }}
                              title="Editar nombre del negocio"
                            />
                            {isCurrent && (
                              <span className="current-active-tag">ACTIVO EN PANTALLA</span>
                            )}
                          </div>
                          <div
                            className="arapy-tenant-meta"
                            style={{
                              display: 'flex',
                              gap: 8,
                              alignItems: 'center',
                              flexWrap: 'wrap',
                              marginTop: 6
                            }}
                          >
                            <span>Titular:</span>
                            <input
                              type="text"
                              value={t.ownerName || ''}
                              onChange={(e) =>
                                updateTenantMetaFromArapy(t.slug, {
                                  ownerName: e.target.value
                                })
                              }
                              style={{
                                border: '1px solid #e5dedf',
                                borderRadius: 6,
                                padding: '2px 6px',
                                fontSize: 11.5
                              }}
                              title="Editar nombre del titular"
                            />
                            <span>
                              <Database size={11} /> {t.dbNamespace}
                            </span>
                          </div>

                          {/* Explicit Share URL Display */}
                          <div className="tenant-share-preview-line">
                            <code>{clientUrl}</code>
                          </div>
                        </div>

                        <span className={`tenant-status-badge ${t.status}`}>
                          {isSuspended ? 'SUSPENDIDO' : 'ACTIVO'}
                        </span>
                      </div>

                      <div className="arapy-tenant-actions">
                        <button
                          type="button"
                          className="arapy-action-chip primary"
                          onClick={() => {
                            switchTenant(t.slug);
                            setActiveModal('none');
                          }}
                          title="Abrir esta tienda en la app"
                        >
                          <ExternalLink size={12} />
                          <span>Abrir App</span>
                        </button>

                        <button
                          type="button"
                          className={`arapy-action-chip share-chip ${
                            copiedSlug === `${t.slug}-client` ? 'copied' : ''
                          }`}
                          onClick={() => copyClientLink(t.slug, false)}
                          title="Copiar link para compartir con clientes"
                        >
                          {copiedSlug === `${t.slug}-client` ? <Check size={12} /> : <Share2 size={12} />}
                          <span>
                            {copiedSlug === `${t.slug}-client` ? '¡Copiado!' : 'Copiar Link Compartir'}
                          </span>
                        </button>

                        <button
                          type="button"
                          className="arapy-action-chip"
                          onClick={() => shareViaWhatsapp(t.slug, t.businessName)}
                          title="Compartir por WhatsApp"
                        >
                          <MessageCircle size={12} />
                          <span>WhatsApp</span>
                        </button>

                        <button
                          type="button"
                          className="arapy-action-chip"
                          onClick={() => copyClientLink(t.slug, true)}
                          title="Copiar link de panel de administración para el dueño"
                        >
                          <Copy size={12} />
                          <span>Link Dueño</span>
                        </button>

                        <button
                          type="button"
                          className={`arapy-action-chip ${
                            isSuspended ? 'activate' : 'suspend'
                          }`}
                          onClick={() =>
                            toggleTenantStatusFromArapy(
                              t.slug,
                              isSuspended ? 'active' : 'suspended'
                            )
                          }
                        >
                          {isSuspended ? <CheckCircle2 size={12} /> : <Ban size={12} />}
                          <span>{isSuspended ? 'Reactivar' : 'Suspender'}</span>
                        </button>

                        <button
                          type="button"
                          className="arapy-action-chip suspend"
                          onClick={() => deleteTenantFromArapy(t.slug)}
                          title="Eliminar este cliente y su base de datos"
                        >
                          <Trash2 size={12} />
                          <span>Eliminar</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
