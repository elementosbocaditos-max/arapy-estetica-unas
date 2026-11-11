import React, { useState } from 'react';
import {
  X,
  Upload,
  Plus,
  Trash2,
  CheckCircle2,
  Database,
  Palette,
  Calendar,
  Scissors,
  Clock,
  Image as ImageIcon,
  Download,
  RotateCcw,
  ExternalLink
} from 'lucide-react';
import { useSaaS } from '../../context/SaaSContext';
import { THEME_PRESETS } from '../../data/seedTemplates';

export default function OwnerAdminPanel() {
  const {
    activeSlug,
    tenantDb,
    saveStatus,
    activeModal,
    setActiveModal,
    updateBrandingField,
    updateOperationsField,
    applyThemePreset,
    updateCustomColor,
    persistTenantUpdate,
    uploadAndSaveImage,
    resetCurrentTenantToDefaults,
    liveEditMode,
    setLiveEditMode,
    showToast
  } = useSaaS();

  const [tab, setTab] = useState('branding'); // 'branding' | 'services' | 'inspo' | 'schedule' | 'agenda' | 'database'
  const [newSlotInput, setNewSlotInput] = useState('');

  if (activeModal !== 'owner') return null;

  const {
    branding = {},
    operations = {},
    services = [],
    specialists = [],
    inspoGallery = [],
    appointments = [],
    databaseConfig = {}
  } = tenantDb;

  const handlePhotoUploadFor = async (e, callback, label = 'foto') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadAndSaveImage(file, label);
    if (url) callback(url);
    e.target.value = '';
  };

  // Services CRUD
  const handleServiceChange = (srvId, field, value) => {
    persistTenantUpdate((prev) => ({
      ...prev,
      services: prev.services.map((s) => (s.id === srvId ? { ...s, [field]: value } : s))
    }));
  };

  const handleAddService = () => {
    const newSrv = {
      id: `srv-${Date.now()}`,
      name: 'Nuevo Servicio del Salón',
      addonLabel: '+ detalle',
      category: 'unas',
      popularIcon: 'sparkles',
      isPopular: true,
      shortDesc: 'Descripción del servicio',
      price: 22000,
      durationMin: 60,
      image: '/assets/inspo-rose-french.jpg'
    };
    persistTenantUpdate((prev) => ({
      ...prev,
      services: [newSrv, ...(prev.services || [])]
    }));
  };

  const handleDeleteService = (srvId) => {
    if (services.length <= 1) {
      showToast('Debe existir al menos un servicio activo.');
      return;
    }
    persistTenantUpdate((prev) => ({
      ...prev,
      services: prev.services.filter((s) => s.id !== srvId)
    }));
  };

  // Specialists CRUD
  const handleSpecialistChange = (specId, field, value) => {
    persistTenantUpdate((prev) => ({
      ...prev,
      specialists: prev.specialists.map((s) =>
        s.id === specId ? { ...s, [field]: value } : s
      )
    }));
  };

  const handleAddSpecialist = () => {
    const newSpec = {
      id: `spec-${Date.now()}`,
      name: 'Nueva Profesional',
      role: 'Especialista Uñas & Pelo',
      studioCode: branding.studioSubCode || 'Studio',
      avatar: '/assets/stylist-main.jpg',
      rating: '5.0',
      specialties: ['unas', 'pelo'],
      verified: true
    };
    persistTenantUpdate((prev) => ({
      ...prev,
      specialists: [...(prev.specialists || []), newSpec]
    }));
  };

  const handleDeleteSpecialist = (specId) => {
    if (specialists.length <= 1) {
      showToast('Debe quedar al menos 1 profesional en el equipo.');
      return;
    }
    persistTenantUpdate((prev) => ({
      ...prev,
      specialists: prev.specialists.filter((s) => s.id !== specId)
    }));
  };

  // Inspo Gallery CRUD
  const handleInspoChange = (id, field, value) => {
    persistTenantUpdate((prev) => ({
      ...prev,
      inspoGallery: prev.inspoGallery.map((i) =>
        i.id === id ? { ...i, [field]: value } : i
      )
    }));
  };

  const handleAddInspoWithPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadAndSaveImage(file, 'inspo-gallery');
    if (url) {
      const newItem = {
        id: `inspo-${Date.now()}`,
        title: 'Nuevo Trabajo del Salón',
        category: 'unas',
        nailShape: 'Almendra',
        likes: 10,
        image: url,
        linkedServiceId: services[0]?.id || 'srv-manicure-3d'
      };
      persistTenantUpdate((prev) => ({
        ...prev,
        inspoGallery: [newItem, ...(prev.inspoGallery || [])]
      }));
    }
    e.target.value = '';
  };

  const handleDeleteInspo = (id) => {
    persistTenantUpdate((prev) => ({
      ...prev,
      inspoGallery: prev.inspoGallery.filter((i) => i.id !== id)
    }));
  };

  // Schedule Slots CRUD
  const handleAddTimeSlot = () => {
    const clean = newSlotInput.trim();
    if (!clean) return;
    const current = operations.timeSlots || [];
    if (!current.includes(clean)) {
      updateOperationsField('timeSlots', [...current, clean].sort());
    }
    setNewSlotInput('');
  };

  const handleRemoveTimeSlot = (slot) => {
    const current = operations.timeSlots || [];
    updateOperationsField(
      'timeSlots',
      current.filter((s) => s !== slot)
    );
  };

  // Appointments Status Change
  const handleAppointmentStatus = (aptId, nextStatus) => {
    persistTenantUpdate((prev) => ({
      ...prev,
      appointments: prev.appointments.map((a) =>
        a.id === aptId ? { ...a, status: nextStatus } : a
      )
    }));
  };

  const handleDeleteAppointment = (aptId) => {
    persistTenantUpdate((prev) => ({
      ...prev,
      appointments: prev.appointments.filter((a) => a.id !== aptId)
    }));
  };

  // Export JSON DB
  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(tenantDb, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `base_datos_${activeSlug}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (parsed && parsed.branding && parsed.services) {
          persistTenantUpdate({ ...parsed, slug: activeSlug });
          showToast('✅ Base de datos importada y guardada en disco');
        }
      } catch {
        showToast('❌ Archivo JSON inválido');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="modal-backdrop" onClick={() => setActiveModal('none')}>
      <div className="admin-modal-window" onClick={(e) => e.stopPropagation()}>
        {/* Header with Real-Time Disk Persistence Indicator */}
        <div className="admin-modal-header">
          <div>
            <div className="admin-badge-row">
              <span className="tenant-db-pill">
                BD AISLADA: <strong>{tenantDb.dbNamespace}</strong>
              </span>
              <span className="disk-sync-pill">
                <CheckCircle2 size={13} />
                {saveStatus.saving
                  ? 'Guardando en disco...'
                  : 'Persistido en Disco Real + IndexedDB'}
              </span>
            </div>
            <h2>Panel de Autogestión del Negocio — {branding.businessName}</h2>
          </div>

          <div className="admin-header-right">
            <button
              type="button"
              className={`live-edit-toggle-btn ${liveEditMode ? 'active' : ''}`}
              onClick={() => {
                setLiveEditMode((p) => !p);
                setActiveModal('none');
              }}
            >
              ✏️ {liveEditMode ? 'Desactivar Edición en Vivo' : 'Editar Directo en Pantalla'}
            </button>
            <button
              type="button"
              className="arapy-switch-btn"
              onClick={() => setActiveModal('arapy')}
            >
              🌐 Ir a Consola ARAPY
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

        {/* Navigation Tabs */}
        <div className="admin-tabs-bar">
          <button
            type="button"
            className={`admin-tab-btn ${tab === 'branding' ? 'active' : ''}`}
            onClick={() => setTab('branding')}
          >
            <Palette size={15} />
            <span>1. Marca, Logo y Fotos</span>
          </button>
          <button
            type="button"
            className={`admin-tab-btn ${tab === 'services' ? 'active' : ''}`}
            onClick={() => setTab('services')}
          >
            <Scissors size={15} />
            <span>2. Servicios ({services.length})</span>
          </button>
          <button
            type="button"
            className={`admin-tab-btn ${tab === 'inspo' ? 'active' : ''}`}
            onClick={() => setTab('inspo')}
          >
            <ImageIcon size={15} />
            <span>3. Fotos Inspo & Equipo</span>
          </button>
          <button
            type="button"
            className={`admin-tab-btn ${tab === 'schedule' ? 'active' : ''}`}
            onClick={() => setTab('schedule')}
          >
            <Clock size={15} />
            <span>4. Horarios, Seña y WhatsApp</span>
          </button>
          <button
            type="button"
            className={`admin-tab-btn ${tab === 'agenda' ? 'active' : ''}`}
            onClick={() => setTab('agenda')}
          >
            <Calendar size={15} />
            <span>5. Agenda de Turnos ({appointments.length})</span>
          </button>
          <button
            type="button"
            className={`admin-tab-btn ${tab === 'database' ? 'active' : ''}`}
            onClick={() => setTab('database')}
          >
            <Database size={15} />
            <span>6. Base de Datos Propia</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="admin-tab-content">
          {/* TAB 1: BRANDING, LOGO, HERO PHOTOS & COLORS */}
          {tab === 'branding' && (
            <div className="admin-grid-2col">
              <div className="admin-panel-box">
                <h3>Identidad del Salón y Textos de Pantallas</h3>
                <div className="admin-form-stack">
                  <label>
                    Nombre del Salón / Negocio (Reemplaza "Daniela Giménez")
                    <input
                      type="text"
                      value={branding.businessName || ''}
                      onChange={(e) => updateBrandingField('businessName', e.target.value)}
                    />
                  </label>
                  <div className="admin-row-2">
                    <label>
                      Iniciales / Sello Logo
                      <input
                        type="text"
                        value={branding.logoText || ''}
                        onChange={(e) => updateBrandingField('logoText', e.target.value)}
                      />
                    </label>
                    <label>
                      Nombre Corto del Estudio (Ej: DG Studio)
                      <input
                        type="text"
                        value={branding.studioSubCode || ''}
                        onChange={(e) => updateBrandingField('studioSubCode', e.target.value)}
                      />
                    </label>
                  </div>
                  <label>
                    Título Espaciado en Tarjeta de Reserva (Ej: B E A U T Y   S T U D I O)
                    <input
                      type="text"
                      value={branding.studioBadgeTitle || ''}
                      onChange={(e) => updateBrandingField('studioBadgeTitle', e.target.value)}
                    />
                  </label>
                  <div className="admin-row-3">
                    <label>
                      Portada Línea 1
                      <input
                        type="text"
                        value={branding.splashTitleLine1 || ''}
                        onChange={(e) => updateBrandingField('splashTitleLine1', e.target.value)}
                      />
                    </label>
                    <label>
                      Portada Línea 2
                      <input
                        type="text"
                        value={branding.splashTitleLine2Prefix || ''}
                        onChange={(e) =>
                          updateBrandingField('splashTitleLine2Prefix', e.target.value)
                        }
                      />
                    </label>
                    <label>
                      Palabra Destacada (Color)
                      <input
                        type="text"
                        value={branding.splashTitleHighlight || ''}
                        onChange={(e) =>
                          updateBrandingField('splashTitleHighlight', e.target.value)
                        }
                      />
                    </label>
                  </div>
                  <label>
                    Subtítulo de Portada
                    <input
                      type="text"
                      value={branding.splashSubtitle || ''}
                      onChange={(e) => updateBrandingField('splashSubtitle', e.target.value)}
                    />
                  </label>
                  <div className="admin-row-2">
                    <label>
                      Promo Descuento (Ej: 20% OFF)
                      <input
                        type="text"
                        value={branding.offerDiscountBadge || ''}
                        onChange={(e) =>
                          updateBrandingField('offerDiscountBadge', e.target.value)
                        }
                      />
                    </label>
                    <label>
                      Título Promo Banner
                      <input
                        type="text"
                        value={branding.offerTitle || ''}
                        onChange={(e) => updateBrandingField('offerTitle', e.target.value)}
                      />
                    </label>
                  </div>
                </div>

                <h3 style={{ marginTop: 20 }}>Paleta de Colores del Negocio</h3>
                <div className="theme-preset-grid">
                  {THEME_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      className={`theme-preset-card ${
                        branding.themeId === preset.id ? 'active' : ''
                      }`}
                      onClick={() => applyThemePreset(preset.id)}
                    >
                      <span
                        className="color-dot"
                        style={{ background: preset.primaryRose }}
                      />
                      <span
                        className="color-dot"
                        style={{ background: preset.lilacAccent }}
                      />
                      <span
                        className="color-dot"
                        style={{ background: preset.studioDark }}
                      />
                      <strong>{preset.name}</strong>
                    </button>
                  ))}
                </div>
                <div className="custom-color-pickers">
                  <label>
                    Color Principal (Header / Botones)
                    <input
                      type="color"
                      value={branding.colors?.primaryRose || '#D67479'}
                      onChange={(e) => updateCustomColor('primaryRose', e.target.value)}
                    />
                  </label>
                  <label>
                    Color Acento Tarjeta Reserva / Especialista
                    <input
                      type="color"
                      value={branding.colors?.lilacAccent || '#CFA8F5'}
                      onChange={(e) => updateCustomColor('lilacAccent', e.target.value)}
                    />
                  </label>
                </div>
              </div>

              {/* Right Column: All Main Photos Replaceable by Upload */}
              <div className="admin-panel-box">
                <h3>Fotos Principales (Subí tus propias fotos y reemplazá los ejemplos)</h3>
                <div className="photo-upload-cards-grid">
                  {[
                    {
                      key: 'logoUrl',
                      title: 'Logo del Salón (Opcional)',
                      current: branding.logoUrl || '/assets/stylist-main.jpg'
                    },
                    {
                      key: 'splashHeroImage',
                      title: 'Foto Pantalla 1 (Portada Splash)',
                      current: branding.splashHeroImage
                    },
                    {
                      key: 'offerBannerImage',
                      title: 'Foto Banner Oferta 20% OFF',
                      current: branding.offerBannerImage
                    },
                    {
                      key: 'bookingHeroImage',
                      title: 'Foto Cabecera "BEAUTY STUDIO"',
                      current: branding.bookingHeroImage
                    },
                    {
                      key: 'studioInteriorImage',
                      title: 'Foto Miniatura del Local/Gabinete',
                      current: branding.studioInteriorImage
                    }
                  ].map((item) => (
                    <div key={item.key} className="photo-replace-card">
                      <img
                        src={item.current}
                        alt={item.title}
                        className="photo-replace-preview"
                        onError={(e) => {
                          e.currentTarget.src = '/assets/studio-nails.jpg';
                        }}
                      />
                      <div className="photo-replace-meta">
                        <strong>{item.title}</strong>
                        <label className="upload-file-label-btn">
                          <Upload size={13} />
                          <span>Subir foto propia</span>
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={(e) =>
                              handlePhotoUploadFor(
                                e,
                                (url) => updateBrandingField(item.key, url),
                                item.key
                              )
                            }
                          />
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SERVICES CATALOG (NAILS, HAIR, COMBOS) */}
          {tab === 'services' && (
            <div className="admin-panel-box">
              <div className="admin-box-top-bar">
                <div>
                  <h3>Catálogo de Servicios (Uñas, Peluquería Femenina y Combos)</h3>
                  <p>
                    Podés cambiar la foto, nombre, precio y duración de cada servicio de
                    ejemplo o crear nuevos.
                  </p>
                </div>
                <button type="button" className="admin-primary-btn" onClick={handleAddService}>
                  <Plus size={15} />
                  <span>Nuevo Servicio</span>
                </button>
              </div>

              <div className="admin-items-list">
                {services.map((srv) => (
                  <div key={srv.id} className="admin-editable-item-row">
                    <div className="admin-item-thumb-box">
                      <img
                        src={srv.image}
                        alt={srv.name}
                        onError={(e) => {
                          e.currentTarget.src = '/assets/studio-nails.jpg';
                        }}
                      />
                      <label className="mini-upload-overlay">
                        <Upload size={12} />
                        <span>Cambiar</span>
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={(e) =>
                            handlePhotoUploadFor(
                              e,
                              (url) => handleServiceChange(srv.id, 'image', url),
                              `srv-${srv.id}`
                            )
                          }
                        />
                      </label>
                    </div>

                    <div className="admin-item-fields-grid">
                      <label>
                        Nombre del Servicio
                        <input
                          type="text"
                          value={srv.name}
                          onChange={(e) => handleServiceChange(srv.id, 'name', e.target.value)}
                        />
                      </label>
                      <label>
                        Subtítulo / Adicional (Ej: + mini patterns)
                        <input
                          type="text"
                          value={srv.addonLabel || ''}
                          onChange={(e) =>
                            handleServiceChange(srv.id, 'addonLabel', e.target.value)
                          }
                        />
                      </label>
                      <label>
                        Categoría
                        <select
                          value={srv.category}
                          onChange={(e) =>
                            handleServiceChange(srv.id, 'category', e.target.value)
                          }
                        >
                          <option value="unas">💅 Estética de Uñas</option>
                          <option value="pelo">✂️ Peluquería Femenina</option>
                          <option value="combos">✨ Combo Integral</option>
                        </select>
                      </label>
                      <label>
                        Precio ({operations.currencySymbol || '$'})
                        <input
                          type="number"
                          value={srv.price}
                          onChange={(e) =>
                            handleServiceChange(srv.id, 'price', Number(e.target.value) || 0)
                          }
                        />
                      </label>
                      <label>
                        Duración (min)
                        <input
                          type="number"
                          value={srv.durationMin}
                          onChange={(e) =>
                            handleServiceChange(
                              srv.id,
                              'durationMin',
                              Number(e.target.value) || 30
                            )
                          }
                        />
                      </label>
                      <label className="full-span">
                        Descripción corta para la clienta
                        <input
                          type="text"
                          value={srv.shortDesc || ''}
                          onChange={(e) =>
                            handleServiceChange(srv.id, 'shortDesc', e.target.value)
                          }
                        />
                      </label>
                    </div>

                    <button
                      type="button"
                      className="admin-delete-icon-btn"
                      onClick={() => handleDeleteService(srv.id)}
                      title="Eliminar servicio"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: ADD INSPO GALLERY & STAFF */}
          {tab === 'inspo' && (
            <div className="admin-grid-2col">
              {/* Left: Specialists / Staff */}
              <div className="admin-panel-box">
                <div className="admin-box-top-bar">
                  <h3>Equipo de Profesionales</h3>
                  <button
                    type="button"
                    className="admin-primary-btn"
                    onClick={handleAddSpecialist}
                  >
                    <Plus size={14} />
                    <span>Agregar Profesional</span>
                  </button>
                </div>

                <div className="admin-items-list">
                  {specialists.map((spec) => (
                    <div key={spec.id} className="admin-editable-item-row compact">
                      <div className="admin-item-thumb-box circle">
                        <img
                          src={spec.avatar}
                          alt={spec.name}
                          onError={(e) => {
                            e.currentTarget.src = '/assets/stylist-main.jpg';
                          }}
                        />
                        <label className="mini-upload-overlay">
                          <Upload size={11} />
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={(e) =>
                              handlePhotoUploadFor(
                                e,
                                (url) => handleSpecialistChange(spec.id, 'avatar', url),
                                `spec-${spec.id}`
                              )
                            }
                          />
                        </label>
                      </div>

                      <div className="admin-spec-fields">
                        <input
                          type="text"
                          value={spec.name}
                          onChange={(e) =>
                            handleSpecialistChange(spec.id, 'name', e.target.value)
                          }
                          placeholder="Nombre de la profesional"
                        />
                        <input
                          type="text"
                          value={spec.role}
                          onChange={(e) =>
                            handleSpecialistChange(spec.id, 'role', e.target.value)
                          }
                          placeholder="Especialidad"
                        />
                      </div>

                      <button
                        type="button"
                        className="admin-delete-icon-btn"
                        onClick={() => handleDeleteSpecialist(spec.id)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Add Inspo Photos */}
              <div className="admin-panel-box">
                <div className="admin-box-top-bar">
                  <h3>Galería de Fotos "Add Inspo" ({inspoGallery.length})</h3>
                  <label className="admin-primary-btn" style={{ cursor: 'pointer' }}>
                    <Upload size={14} />
                    <span>Subir Nueva Foto Inspo</span>
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleAddInspoWithPhoto}
                    />
                  </label>
                </div>

                <div className="admin-inspo-grid">
                  {inspoGallery.map((item) => (
                    <div key={item.id} className="admin-inspo-card">
                      <div className="admin-inspo-img-wrap">
                        <img
                          src={item.image}
                          alt={item.title}
                          onError={(e) => {
                            e.currentTarget.src = '/assets/studio-nails.jpg';
                          }}
                        />
                        <label className="mini-upload-overlay">
                          <Upload size={12} />
                          <span>Reemplazar foto</span>
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={(e) =>
                              handlePhotoUploadFor(
                                e,
                                (url) => handleInspoChange(item.id, 'image', url),
                                `inspo-${item.id}`
                              )
                            }
                          />
                        </label>
                      </div>
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => handleInspoChange(item.id, 'title', e.target.value)}
                      />
                      <div className="admin-inspo-bottom">
                        <select
                          value={item.category}
                          onChange={(e) =>
                            handleInspoChange(item.id, 'category', e.target.value)
                          }
                        >
                          <option value="unas">💅 Uñas</option>
                          <option value="pelo">✂️ Pelo</option>
                          <option value="combos">✨ Combo</option>
                        </select>
                        <button
                          type="button"
                          className="admin-delete-icon-btn"
                          onClick={() => handleDeleteInspo(item.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SCHEDULE, DEPOSIT 50%, ALIAS & WHATSAPP */}
          {tab === 'schedule' && (
            <div className="admin-grid-2col">
              <div className="admin-panel-box">
                <h3>Cobro de Señas, Alias Bancario y WhatsApp del Salón</h3>
                <div className="admin-form-stack">
                  <div className="admin-row-2">
                    <label>
                      Porcentaje de Seña Obligatoria (%)
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={operations.depositPercentage ?? 50}
                        onChange={(e) =>
                          updateOperationsField(
                            'depositPercentage',
                            Number(e.target.value) || 0
                          )
                        }
                      />
                    </label>
                    <label>
                      Símbolo de Moneda
                      <input
                        type="text"
                        value={operations.currencySymbol || '$'}
                        onChange={(e) =>
                          updateOperationsField('currencySymbol', e.target.value)
                        }
                      />
                    </label>
                  </div>
                  <label>
                    Alias de MercadoPago / Banco (donde tus clientas transfieren la seña)
                    <input
                      type="text"
                      value={operations.paymentAlias || ''}
                      onChange={(e) => updateOperationsField('paymentAlias', e.target.value)}
                    />
                  </label>
                  <label>
                    CVU / CBU
                    <input
                      type="text"
                      value={operations.paymentCvu || ''}
                      onChange={(e) => updateOperationsField('paymentCvu', e.target.value)}
                    />
                  </label>
                  <label>
                    Nombre del Titular de la Cuenta
                    <input
                      type="text"
                      value={operations.paymentHolder || ''}
                      onChange={(e) =>
                        updateOperationsField('paymentHolder', e.target.value)
                      }
                    />
                  </label>
                  <label>
                    Número de WhatsApp donde recibís los turnos (con código de país, ej: 54911...)
                    <input
                      type="text"
                      value={operations.whatsappNumber || ''}
                      onChange={(e) =>
                        updateOperationsField('whatsappNumber', e.target.value)
                      }
                    />
                  </label>
                  <label>
                    Dirección del Salón / Estudio
                    <input
                      type="text"
                      value={operations.address || ''}
                      onChange={(e) => updateOperationsField('address', e.target.value)}
                    />
                  </label>
                </div>
              </div>

              <div className="admin-panel-box">
                <h3>Horarios de Turnos Disponibles</h3>
                <p>
                  Configurá los bloques horarios que verán tus clientas al elegir fecha y hora:
                </p>
                <div className="slots-editor-chips">
                  {(operations.timeSlots || []).map((slot) => (
                    <span key={slot} className="slot-admin-chip">
                      <strong>{slot} hs</strong>
                      <button
                        type="button"
                        onClick={() => handleRemoveTimeSlot(slot)}
                        title="Quitar horario"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
                <div className="add-slot-row">
                  <input
                    type="text"
                    value={newSlotInput}
                    onChange={(e) => setNewSlotInput(e.target.value)}
                    placeholder="Ej: 14:30"
                  />
                  <button
                    type="button"
                    className="admin-primary-btn"
                    onClick={handleAddTimeSlot}
                  >
                    <Plus size={14} />
                    <span>Agregar Horario</span>
                  </button>
                </div>

                <h3 style={{ marginTop: 22 }}>Mensaje de Bienvenida de tu Asesora IA</h3>
                <textarea
                  rows={3}
                  className="admin-textarea"
                  value={operations.aiGreeting || ''}
                  onChange={(e) => updateOperationsField('aiGreeting', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* TAB 5: APPOINTMENTS AGENDA & ADDED INSPO VIEWER */}
          {tab === 'agenda' && (
            <div className="admin-panel-box">
              <h3>Agenda de Turnos y Fotos "Added Inspo" de cada Clienta</h3>
              <div className="admin-appointments-list">
                {appointments.map((apt) => (
                  <div key={apt.id} className="admin-apt-card">
                    <div className="admin-apt-left">
                      <span className="apt-code-badge">#{apt.code}</span>
                      <div>
                        <h4>
                          {apt.clientName} — <span>{apt.serviceName}</span>
                        </h4>
                        <p>
                          📅 <strong>{apt.dateLabel}</strong> ({apt.timeRange}) • 👩‍🎨{' '}
                          {apt.specialistName} • 💎 Estilo: {apt.nailShape}
                        </p>
                        {apt.notes && <p className="apt-note-line">📝 "{apt.notes}"</p>}
                      </div>
                    </div>

                    {/* Visual Added Inspo Thumbnails Attached by the Client */}
                    <div className="admin-apt-inspo-thumbs">
                      <span>Added Inspo:</span>
                      <div className="apt-thumbs-row">
                        {(apt.inspoImages || []).map((img, i) => (
                          <img
                            key={i}
                            src={img}
                            alt="inspo"
                            onError={(e) => {
                              e.currentTarget.src = '/assets/studio-nails.jpg';
                            }}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="admin-apt-right">
                      <div className="apt-money-info">
                        <span>Total: ${Number(apt.totalPrice).toLocaleString('es-AR')}</span>
                        <strong>
                          Seña: ${Number(apt.depositAmount).toLocaleString('es-AR')}
                        </strong>
                      </div>
                      <select
                        value={apt.status}
                        onChange={(e) => handleAppointmentStatus(apt.id, e.target.value)}
                        className={`apt-status-select ${apt.status}`}
                      >
                        <option value="unconfirmed">⏳ Pendiente de Seña</option>
                        <option value="confirmed">✅ Seña Pagada / Confirmado</option>
                        <option value="completed">✨ Atendida</option>
                        <option value="cancelled">❌ Cancelado</option>
                      </select>
                      <button
                        type="button"
                        className="admin-delete-icon-btn"
                        onClick={() => handleDeleteAppointment(apt.id)}
                        title="Eliminar turno"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: PER-TENANT ISOLATED DATABASE & CLOUD SYNC */}
          {tab === 'database' && (
            <div className="admin-grid-2col">
              <div className="admin-panel-box">
                <h3>Base de Datos Independiente de este Cliente</h3>
                <p>
                  Todos los datos y fotos de <strong>{branding.businessName}</strong> se
                  guardan de forma aislada en <code>server_data/tenants/{activeSlug}.json</code>{' '}
                  y en <code>/public/uploads/{activeSlug}/</code>.
                </p>

                <div className="db-actions-row">
                  <button
                    type="button"
                    className="admin-primary-btn"
                    onClick={handleExportJson}
                  >
                    <Download size={15} />
                    <span>Descargar Copia de Seguridad (.JSON)</span>
                  </button>

                  <label className="admin-secondary-btn" style={{ cursor: 'pointer' }}>
                    <Upload size={15} />
                    <span>Importar Base de Datos (.JSON)</span>
                    <input
                      type="file"
                      accept=".json"
                      style={{ display: 'none' }}
                      onChange={handleImportJson}
                    />
                  </label>

                  <button
                    type="button"
                    className="admin-danger-btn"
                    onClick={resetCurrentTenantToDefaults}
                  >
                    <RotateCcw size={15} />
                    <span>Restaurar Ejemplos de Fábrica</span>
                  </button>
                </div>
              </div>

              <div className="admin-panel-box">
                <h3>Conector Base de Datos Cloud Propia (Opcional por Cliente)</h3>
                <div className="admin-form-stack">
                  <label>
                    URL de Proyecto Supabase / PostgreSQL REST del Cliente
                    <input
                      type="text"
                      value={databaseConfig.supabaseUrl || ''}
                      onChange={(e) =>
                        persistTenantUpdate((prev) => ({
                          ...prev,
                          databaseConfig: {
                            ...prev.databaseConfig,
                            supabaseUrl: e.target.value
                          }
                        }))
                      }
                      placeholder="https://xyzcompany.supabase.co"
                    />
                  </label>
                  <label>
                    Supabase Anon / API Key del Cliente
                    <input
                      type="password"
                      value={databaseConfig.supabaseAnonKey || ''}
                      onChange={(e) =>
                        persistTenantUpdate((prev) => ({
                          ...prev,
                          databaseConfig: {
                            ...prev.databaseConfig,
                            supabaseAnonKey: e.target.value
                          }
                        }))
                      }
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5..."
                    />
                  </label>
                  <label>
                    Webhook de Sincronización con Panel Central ARAPY
                    <input
                      type="text"
                      value={databaseConfig.webhookUrl || ''}
                      onChange={(e) =>
                        persistTenantUpdate((prev) => ({
                          ...prev,
                          databaseConfig: {
                            ...prev.databaseConfig,
                            webhookUrl: e.target.value
                          }
                        }))
                      }
                      placeholder="https://api.arapy.app/webhooks/tenant-sync"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
