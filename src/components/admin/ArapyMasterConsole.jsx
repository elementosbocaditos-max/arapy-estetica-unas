import React, { useState } from 'react';
import {
  X,
  Plus,
  Building2,
  Database,
  CheckCircle2,
  Ban,
  Copy,
  ExternalLink,
  ShieldCheck,
  Settings,
  Trash2
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

  if (activeModal !== 'arapy') return null;

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
      setNewBusinessName('');
      setNewOwnerName('');
      showToast(`🚀 Cliente "${createdSlug}" creado con su propia Base de Datos aislada`);
    }
  };

  const copyClientLink = (slug, isOwner = false) => {
    const base = `${window.location.origin}${window.location.pathname}`;
    const link = isOwner
      ? `${base}?salon=${slug}&panel=owner`
      : `${base}?salon=${slug}`;
    navigator.clipboard?.writeText(link);
    showToast(
      isOwner
        ? `🔐 Link de Panel de Dueño copiado para ${slug}`
        : `🔗 Link de Tienda Pública copiado para ${slug}`
    );
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
          <div className="admin-grid-2col">
            {/* Left: Provision Unlimited New Clients with Isolated DB */}
            <div className="admin-panel-box">
              <h3>➕ Dar de Alta Nuevo Cliente Comercial (Sin Límite de Clientes)</h3>
              <p>
                Cada cliente que creás acá recibe su propia base de datos independiente (
                <code>arapy_tenant_db::&lt;slug&gt;</code>), su propio espacio de fotos,
                categorías, colaboradores y sus links exclusivos:
              </p>

              <form className="admin-form-stack" onSubmit={handleCreateTenant}>
                <label>
                  Nombre Comercial del Salón / Tienda (Editable)
                  <input
                    type="text"
                    value={newBusinessName}
                    onChange={(e) => setNewBusinessName(e.target.value)}
                    placeholder="Ej: Mi Salón de Uñas & Peluquería"
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
                  <span>Crear Nuevo Cliente + Base de Datos Independiente</span>
                </button>
              </form>
            </div>

            {/* Right: List of All Registered Businesses in ARAPY */}
            <div className="admin-panel-box">
              <h3>
                🏢 Clientes / Negocios Activos en tu Red ARAPY ({registry.tenants?.length || 0})
              </h3>
              <div className="arapy-tenants-list">
                {(registry.tenants || []).map((t) => {
                  const isCurrent = t.slug === activeSlug;
                  const isSuspended = t.status === 'suspended';

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
                                minWidth: 210
                              }}
                              title="Editar nombre del negocio"
                            />
                            {isCurrent && (
                              <span className="current-active-tag">EN PANTALLA</span>
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
                        >
                          <ExternalLink size={12} />
                          <span>Abrir App</span>
                        </button>

                        <button
                          type="button"
                          className="arapy-action-chip"
                          onClick={() => copyClientLink(t.slug, false)}
                        >
                          <Copy size={12} />
                          <span>Link Clientas</span>
                        </button>

                        <button
                          type="button"
                          className="arapy-action-chip"
                          onClick={() => copyClientLink(t.slug, true)}
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
