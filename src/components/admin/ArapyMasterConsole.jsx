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
  Settings
} from 'lucide-react';
import { useSaaS } from '../../context/SaaSContext';

export default function ArapyMasterConsole() {
  const {
    registry,
    activeSlug,
    switchTenant,
    createNewTenantFromArapy,
    toggleTenantStatusFromArapy,
    activeModal,
    setActiveModal,
    showToast
  } = useSaaS();

  const [newBusinessName, setNewBusinessName] = useState('');
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newWhatsapp, setNewWhatsapp] = useState('5491123456789');
  const [newCity, setNewCity] = useState('Argentina');

  if (activeModal !== 'arapy') return null;

  const handleCreateTenant = async (e) => {
    e.preventDefault();
    if (!newBusinessName.trim()) {
      showToast('Ingresá el nombre del nuevo negocio / cliente');
      return;
    }
    const createdSlug = await createNewTenantFromArapy({
      businessName: newBusinessName.trim(),
      ownerName: newOwnerName.trim() || 'Dueña del Salón',
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
        ? `🔐 Link de Dueño copiado para ${slug}`
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
                <span>CONSOLA CENTRAL ARAPY • MULTI-NEGOCIOS</span>
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
            {/* Left: Provision New Client with Isolated DB */}
            <div className="admin-panel-box">
              <h3>➕ Dar de Alta Nuevo Cliente Comercial (Crea su propia Base de Datos)</h3>
              <p>
                Cada cliente que creás acá recibe su propia base de datos aislada en disco (
                <code>server_data/tenants/&lt;slug&gt;.json</code>), su propio espacio de fotos y
                sus links listos para venderle el servicio:
              </p>

              <form className="admin-form-stack" onSubmit={handleCreateTenant}>
                <label>
                  Nombre Comercial del Salón / Centro de Estética
                  <input
                    type="text"
                    value={newBusinessName}
                    onChange={(e) => setNewBusinessName(e.target.value)}
                    placeholder="Ej: Estética Sofía Nails & Hair"
                    required
                  />
                </label>
                <label>
                  Nombre de tu Cliente (Dueña/o del Salón)
                  <input
                    type="text"
                    value={newOwnerName}
                    onChange={(e) => setNewOwnerName(e.target.value)}
                    placeholder="Ej: Sofía López"
                  />
                </label>
                <div className="admin-row-2">
                  <label>
                    WhatsApp del Salón
                    <input
                      type="text"
                      value={newWhatsapp}
                      onChange={(e) => setNewWhatsapp(e.target.value)}
                      placeholder="54911..."
                    />
                  </label>
                  <label>
                    Ciudad / Sucursal
                    <input
                      type="text"
                      value={newCity}
                      onChange={(e) => setNewCity(e.target.value)}
                      placeholder="Ej: Posadas / CABA"
                    />
                  </label>
                </div>

                <button type="submit" className="admin-primary-btn full-width-btn">
                  <Plus size={16} />
                  <span>Crear Nuevo Negocio + Aprovisionar Base de Datos Propia</span>
                </button>
              </form>
            </div>

            {/* Right: List of All Registered Businesses in ARAPY */}
            <div className="admin-panel-box">
              <h3>
                🏢 Negocios Adheridos a tu Red ARAPY ({registry.tenants?.length || 0})
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
                        <div>
                          <div className="arapy-tenant-title-row">
                            <Building2 size={16} />
                            <strong>{t.businessName}</strong>
                            {isCurrent && (
                              <span className="current-active-tag">EN PANTALLA</span>
                            )}
                          </div>
                          <div className="arapy-tenant-meta">
                            <span>Dueña/o: {t.ownerName}</span> •{' '}
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
                          <span>Abrir App de este Cliente</span>
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
