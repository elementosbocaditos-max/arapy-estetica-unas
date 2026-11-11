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
  Users,
  Layers
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

  const [tab, setTab] = useState('branding'); // 'branding' | 'categories_services' | 'collaborators_inspo' | 'schedule' | 'agenda' | 'database'
  const [newSlotInput, setNewSlotInput] = useState('');
  const [newDateInput, setNewDateInput] = useState('');
  const [newWorkOptionInput, setNewWorkOptionInput] = useState('');
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('✨');

  if (activeModal !== 'owner') return null;

  const {
    branding = {},
    operations = {},
    categories = [],
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

  // ---------------------------------------------------------------------------
  // 1. UNLIMITED CATEGORIES CRUD
  // ---------------------------------------------------------------------------
  const handleAddCategory = () => {
    const cleanName = newCatName.trim() || `Categoría ${categories.length + 1}`;
    const newId = `cat-${Date.now()}`;
    const newCat = {
      id: newId,
      name: cleanName,
      shortLabel: cleanName,
      icon: newCatIcon.trim() || '✨'
    };
    persistTenantUpdate(
      (prev) => ({
        ...prev,
        categories: [...(prev.categories || []), newCat]
      }),
      `Categoría "${cleanName}" agregada`
    );
    setNewCatName('');
    showToast(`➕ Categoría "${cleanName}" guardada`);
  };

  const handleCategoryChange = (catId, field, value) => {
    persistTenantUpdate((prev) => ({
      ...prev,
      categories: (prev.categories || []).map((c) =>
        c.id === catId
          ? {
              ...c,
              [field]: value,
              ...(field === 'name' ? { shortLabel: value } : {})
            }
          : c
      )
    }));
  };

  const handleDeleteCategory = (catId) => {
    persistTenantUpdate(
      (prev) => ({
        ...prev,
        categories: (prev.categories || []).filter((c) => c.id !== catId)
      }),
      'Categoría eliminada'
    );
    showToast('🗑️ Categoría eliminada');
  };

  // ---------------------------------------------------------------------------
  // 2. UNLIMITED SERVICES / WORK ITEMS CRUD
  // ---------------------------------------------------------------------------
  const handleServiceChange = (srvId, field, value) => {
    persistTenantUpdate((prev) => ({
      ...prev,
      services: (prev.services || []).map((s) =>
        s.id === srvId ? { ...s, [field]: value } : s
      )
    }));
  };

  const handleAddService = () => {
    const defaultCatId = categories[0]?.id || 'general';
    const newSrv = {
      id: `srv-${Date.now()}`,
      name: 'Nuevo Trabajo / Servicio (Editable)',
      addonLabel: '+ detalle (Editable)',
      category: defaultCatId,
      popularIcon: 'sparkles',
      isPopular: true,
      shortDesc: 'Descripción del servicio o trabajo',
      price: 20000,
      durationMin: 60,
      image: './assets/inspo-rose-french.jpg'
    };
    persistTenantUpdate(
      (prev) => ({
        ...prev,
        services: [newSrv, ...(prev.services || [])]
      }),
      'Nuevo servicio agregado'
    );
    showToast('➕ Nuevo trabajo agregado al catálogo');
  };

  const handleDeleteService = (srvId) => {
    persistTenantUpdate(
      (prev) => ({
        ...prev,
        services: (prev.services || []).filter((s) => s.id !== srvId)
      }),
      'Servicio eliminado'
    );
    showToast('🗑️ Trabajo eliminado del catálogo');
  };

  // ---------------------------------------------------------------------------
  // 3. UNLIMITED COLLABORATORS / SPECIALISTS CRUD (Put or Remove freely)
  // ---------------------------------------------------------------------------
  const handleSpecialistChange = (specId, field, value) => {
    persistTenantUpdate((prev) => ({
      ...prev,
      specialists: (prev.specialists || []).map((s) =>
        s.id === specId ? { ...s, [field]: value } : s
      )
    }));
  };

  const handleAddSpecialist = () => {
    const newSpec = {
      id: `spec-${Date.now()}`,
      name: `Colaborador/a ${(specialists?.length || 0) + 1} (Editable)`,
      role: 'Especialidad / Rol (Editable)',
      studioCode: branding.studioSubCode || 'Box / Sillón',
      avatar: './assets/stylist-main.jpg',
      rating: '5.0',
      specialties: categories.map((c) => c.id),
      verified: true
    };
    persistTenantUpdate(
      (prev) => ({
        ...prev,
        specialists: [...(prev.specialists || []), newSpec]
      }),
      'Colaborador/a agregado/a'
    );
    showToast('➕ Colaborador/a agregado/a al equipo');
  };

  const handleDeleteSpecialist = (specId) => {
    persistTenantUpdate(
      (prev) => ({
        ...prev,
        specialists: (prev.specialists || []).filter((s) => s.id !== specId)
      }),
      'Colaborador/a quitado/a'
    );
    showToast('🗑️ Colaborador/a quitado/a del equipo');
  };

  // ---------------------------------------------------------------------------
  // 4. UNLIMITED INSPO GALLERY CRUD
  // ---------------------------------------------------------------------------
  const handleInspoChange = (id, field, value) => {
    persistTenantUpdate((prev) => ({
      ...prev,
      inspoGallery: (prev.inspoGallery || []).map((i) =>
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
        title: 'Nuevo Trabajo / Foto (Editable)',
        category: categories[0]?.id || 'general',
        nailShape: operations.workOptions?.[0] || 'A elección',
        likes: 10,
        image: url,
        linkedServiceId: services[0]?.id || 'default'
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
      inspoGallery: (prev.inspoGallery || []).filter((i) => i.id !== id)
    }));
    showToast('🗑️ Foto eliminada de la galería');
  };

  // ---------------------------------------------------------------------------
  // 5. UNLIMITED WORK OPTIONS, DATES & TIME SLOTS CRUD
  // ---------------------------------------------------------------------------
  const handleAddWorkOption = () => {
    const clean = newWorkOptionInput.trim();
    if (!clean) return;
    const current = operations.workOptions || [];
    if (!current.includes(clean)) {
      updateOperationsField('workOptions', [...current, clean]);
    }
    setNewWorkOptionInput('');
  };

  const handleRemoveWorkOption = (opt) => {
    const current = operations.workOptions || [];
    updateOperationsField(
      'workOptions',
      current.filter((o) => o !== opt)
    );
  };

  const handleAddDateOption = () => {
    const clean = newDateInput.trim();
    if (!clean) return;
    const current = operations.availableDates || [];
    if (!current.includes(clean)) {
      updateOperationsField('availableDates', [...current, clean]);
    }
    setNewDateInput('');
  };

  const handleRemoveDateOption = (d) => {
    const current = operations.availableDates || [];
    updateOperationsField(
      'availableDates',
      current.filter((item) => item !== d)
    );
  };

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

  // ---------------------------------------------------------------------------
  // 6. APPOINTMENTS AGENDA & DATABASE EXPORT/IMPORT
  // ---------------------------------------------------------------------------
  const handleAppointmentStatus = (aptId, nextStatus) => {
    persistTenantUpdate((prev) => ({
      ...prev,
      appointments: (prev.appointments || []).map((a) =>
        a.id === aptId ? { ...a, status: nextStatus } : a
      )
    }));
  };

  const handleDeleteAppointment = (aptId) => {
    persistTenantUpdate((prev) => ({
      ...prev,
      appointments: (prev.appointments || []).filter((a) => a.id !== aptId)
    }));
  };

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
        if (parsed && parsed.branding) {
          persistTenantUpdate({ ...parsed, slug: activeSlug });
          showToast('✅ Base de datos importada y guardada permanentemente');
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
        {/* Header with Real-Time Persistence Indicator */}
        <div className="admin-modal-header">
          <div>
            <div className="admin-badge-row">
              <span className="tenant-db-pill">
                BD AISLADA: <strong>{tenantDb.dbNamespace}</strong>
              </span>
              <span className="disk-sync-pill">
                <CheckCircle2 size={13} />
                {saveStatus.saving
                  ? 'Guardando cambios...'
                  : 'Todo guardado en Base de Datos (Se recuerda siempre)'}
              </span>
            </div>
            <h2>Panel de Configuración Total — {branding.businessName}</h2>
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
            <span>1. Nombre, Fotos, Dirección y Teléfono</span>
          </button>
          <button
            type="button"
            className={`admin-tab-btn ${tab === 'categories_services' ? 'active' : ''}`}
            onClick={() => setTab('categories_services')}
          >
            <Layers size={15} />
            <span>
              2. Categorías ({categories.length}) y Trabajos ({services.length})
            </span>
          </button>
          <button
            type="button"
            className={`admin-tab-btn ${tab === 'collaborators_inspo' ? 'active' : ''}`}
            onClick={() => setTab('collaborators_inspo')}
          >
            <Users size={15} />
            <span>
              3. Colaboradores ({specialists.length}) y Galería ({inspoGallery.length})
            </span>
          </button>
          <button
            type="button"
            className={`admin-tab-btn ${tab === 'schedule' ? 'active' : ''}`}
            onClick={() => setTab('schedule')}
          >
            <Clock size={15} />
            <span>4. Horarios, Opciones y Seña</span>
          </button>
          <button
            type="button"
            className={`admin-tab-btn ${tab === 'agenda' ? 'active' : ''}`}
            onClick={() => setTab('agenda')}
          >
            <Calendar size={15} />
            <span>5. Agenda ({appointments.length})</span>
          </button>
          <button
            type="button"
            className={`admin-tab-btn ${tab === 'database' ? 'active' : ''}`}
            onClick={() => setTab('database')}
          >
            <Database size={15} />
            <span>6. Base de Datos</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="admin-tab-content">
          {/* TAB 1: BRANDING, CONTACT INFO, PHOTOS & COLORS */}
          {tab === 'branding' && (
            <div className="admin-grid-2col">
              <div className="admin-panel-box">
                <h3>Datos del Negocio, Dirección, Teléfono y Textos (100% Editables)</h3>
                <div className="admin-form-stack">
                  <label>
                    Nombre del Salón / Tienda (Editable)
                    <input
                      type="text"
                      value={branding.businessName || ''}
                      onChange={(e) => updateBrandingField('businessName', e.target.value)}
                      placeholder="Ingresá el nombre de tu negocio"
                    />
                  </label>

                  <div className="admin-row-2">
                    <label>
                      Dirección del Local / Estudio
                      <input
                        type="text"
                        value={operations.address || ''}
                        onChange={(e) => updateOperationsField('address', e.target.value)}
                        placeholder="Ej: Av. Principal 123, Local 1"
                      />
                    </label>
                    <label>
                      Horarios de Atención (Texto visible)
                      <input
                        type="text"
                        value={operations.businessHoursText || ''}
                        onChange={(e) =>
                          updateOperationsField('businessHoursText', e.target.value)
                        }
                        placeholder="Ej: Lun a Sáb 09:00 a 20:00 hs"
                      />
                    </label>
                  </div>

                  <div className="admin-row-2">
                    <label>
                      Teléfono Visible en Pantallas
                      <input
                        type="text"
                        value={operations.phoneDisplay || ''}
                        onChange={(e) =>
                          updateOperationsField('phoneDisplay', e.target.value)
                        }
                        placeholder="Ej: +54 9 11 0000-0000"
                      />
                    </label>
                    <label>
                      Número de WhatsApp para recibir Turnos (solo números)
                      <input
                        type="text"
                        value={operations.whatsappNumber || ''}
                        onChange={(e) =>
                          updateOperationsField('whatsappNumber', e.target.value)
                        }
                        placeholder="Ej: 5491100000000"
                      />
                    </label>
                  </div>

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
                      Nombre de Sucursal / Gabinete
                      <input
                        type="text"
                        value={branding.studioSubCode || ''}
                        onChange={(e) => updateBrandingField('studioSubCode', e.target.value)}
                      />
                    </label>
                  </div>

                  <label>
                    Título Superior en Tarjeta de Reserva (Ej: B E A U T Y   S T U D I O)
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
                      Etiqueta Descuento Promo (Ej: 20% OFF)
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
                    Color Acento Tarjeta Reserva / Colaborador
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
                      current: branding.logoUrl || './assets/stylist-main.jpg'
                    },
                    {
                      key: 'splashHeroImage',
                      title: 'Foto Pantalla 1 (Portada)',
                      current: branding.splashHeroImage
                    },
                    {
                      key: 'offerBannerImage',
                      title: 'Foto Banner Promoción',
                      current: branding.offerBannerImage
                    },
                    {
                      key: 'bookingHeroImage',
                      title: 'Foto Cabecera Reserva',
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
                          e.currentTarget.src = './assets/studio-nails.jpg';
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

          {/* TAB 2: UNLIMITED CATEGORIES & UNLIMITED SERVICES / WORK ITEMS */}
          {tab === 'categories_services' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Top Section: Unlimited Categories */}
              <div className="admin-panel-box">
                <div className="admin-box-top-bar">
                  <div>
                    <h3>Categorías de Trabajo Ilimitadas ({categories.length})</h3>
                    <p>
                      Agregá, editá o quitá todas las categorías que necesites (Ej: Uñas,
                      Peluquería, Pestañas, Cejas, Maquillaje, Depilación, Spa, Podología, etc.).
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <input
                      type="text"
                      value={newCatIcon}
                      onChange={(e) => setNewCatIcon(e.target.value)}
                      placeholder="Ícono (Ej: 💅)"
                      style={{
                        width: 64,
                        padding: '8px 10px',
                        borderRadius: 10,
                        border: '1px solid #d6cfd0',
                        textAlign: 'center'
                      }}
                    />
                    <input
                      type="text"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      placeholder="Nombre de nueva categoría..."
                      style={{
                        padding: '8px 12px',
                        borderRadius: 10,
                        border: '1px solid #d6cfd0',
                        minWidth: 210
                      }}
                    />
                    <button
                      type="button"
                      className="admin-primary-btn"
                      onClick={handleAddCategory}
                    >
                      <Plus size={15} />
                      <span>Agregar Categoría</span>
                    </button>
                  </div>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                    gap: 10,
                    marginTop: 12
                  }}
                >
                  {categories.map((cat) => (
                    <div
                      key={cat.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        background: '#f8f4f4',
                        padding: '8px 10px',
                        borderRadius: 12,
                        border: '1px solid #eadfe0'
                      }}
                    >
                      <input
                        type="text"
                        value={cat.icon || ''}
                        onChange={(e) => handleCategoryChange(cat.id, 'icon', e.target.value)}
                        style={{
                          width: 42,
                          padding: '6px',
                          borderRadius: 8,
                          border: '1px solid #d8cecf',
                          textAlign: 'center'
                        }}
                        title="Ícono o Emoji"
                      />
                      <input
                        type="text"
                        value={cat.name || ''}
                        onChange={(e) => handleCategoryChange(cat.id, 'name', e.target.value)}
                        style={{
                          flex: 1,
                          padding: '6px 10px',
                          borderRadius: 8,
                          border: '1px solid #d8cecf',
                          fontWeight: 600
                        }}
                        placeholder="Nombre de categoría"
                      />
                      <button
                        type="button"
                        className="admin-delete-icon-btn"
                        onClick={() => handleDeleteCategory(cat.id)}
                        title="Eliminar categoría"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Section: Unlimited Services / Work Catalog */}
              <div className="admin-panel-box">
                <div className="admin-box-top-bar">
                  <div>
                    <h3>Catálogo Ilimitado de Trabajos y Servicios ({services.length})</h3>
                    <p>
                      Sin límite de cantidad: cargá todos tus trabajos, cambiá sus fotos,
                      precios, duración y categoría, o eliminá los ejemplos cuando quieras.
                    </p>
                  </div>
                  <button type="button" className="admin-primary-btn" onClick={handleAddService}>
                    <Plus size={15} />
                    <span>Agregar Nuevo Trabajo / Servicio</span>
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
                            e.currentTarget.src = './assets/studio-nails.jpg';
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
                          Nombre del Trabajo / Servicio
                          <input
                            type="text"
                            value={srv.name}
                            onChange={(e) => handleServiceChange(srv.id, 'name', e.target.value)}
                          />
                        </label>
                        <label>
                          Subtítulo / Adicional (Ej: + detalle)
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
                            {categories.map((cat) => (
                              <option key={cat.id} value={cat.id}>
                                {cat.icon} {cat.name}
                              </option>
                            ))}
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
                        title="Eliminar trabajo"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: UNLIMITED COLLABORATORS & INSPO GALLERY */}
          {tab === 'collaborators_inspo' && (
            <div className="admin-grid-2col">
              {/* Left: Unlimited Collaborators / Staff */}
              <div className="admin-panel-box">
                <div className="admin-box-top-bar">
                  <div>
                    <h3>Colaboradores / Profesionales ({specialists.length})</h3>
                    <p>Podés poner o quitar colaboradores libremente sin límite.</p>
                  </div>
                  <button
                    type="button"
                    className="admin-primary-btn"
                    onClick={handleAddSpecialist}
                  >
                    <Plus size={14} />
                    <span>+ Poner Colaborador/a</span>
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
                            e.currentTarget.src = './assets/stylist-main.jpg';
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
                          placeholder="Nombre del/la colaborador/a"
                        />
                        <input
                          type="text"
                          value={spec.role}
                          onChange={(e) =>
                            handleSpecialistChange(spec.id, 'role', e.target.value)
                          }
                          placeholder="Especialidad / Rol"
                        />
                        <input
                          type="text"
                          value={spec.studioCode || ''}
                          onChange={(e) =>
                            handleSpecialistChange(spec.id, 'studioCode', e.target.value)
                          }
                          placeholder="Sillón / Gabinete / Sucursal"
                        />
                      </div>

                      <button
                        type="button"
                        className="admin-delete-icon-btn"
                        onClick={() => handleDeleteSpecialist(spec.id)}
                        title="Quitar colaborador/a"
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
                  <div>
                    <h3>Galería de Trabajos "Add Inspo" ({inspoGallery.length})</h3>
                    <p>Subí todas las fotos de muestra que quieras o borrá los ejemplos.</p>
                  </div>
                  <label className="admin-primary-btn" style={{ cursor: 'pointer' }}>
                    <Upload size={14} />
                    <span>Subir Nueva Foto</span>
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
                            e.currentTarget.src = './assets/studio-nails.jpg';
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
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.icon} {cat.shortLabel || cat.name}
                            </option>
                          ))}
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

          {/* TAB 4: SCHEDULE, WORK OPTIONS, DEPOSIT & WHATSAPP */}
          {tab === 'schedule' && (
            <div className="admin-grid-2col">
              <div className="admin-panel-box">
                <h3>Cobro de Señas, Alias Bancario, Teléfono y Dirección</h3>
                <div className="admin-form-stack">
                  <div className="admin-row-2">
                    <label>
                      Porcentaje de Seña (%)
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
                    Alias Bancario / MercadoPago (Editable)
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
                    Titular de la Cuenta (Editable)
                    <input
                      type="text"
                      value={operations.paymentHolder || ''}
                      onChange={(e) =>
                        updateOperationsField('paymentHolder', e.target.value)
                      }
                    />
                  </label>
                  <label>
                    Entidad / Banco
                    <input
                      type="text"
                      value={operations.paymentBankName || ''}
                      onChange={(e) =>
                        updateOperationsField('paymentBankName', e.target.value)
                      }
                    />
                  </label>
                  <label>
                    WhatsApp de Recepción de Turnos (con código de país, ej: 54911...)
                    <input
                      type="text"
                      value={operations.whatsappNumber || ''}
                      onChange={(e) =>
                        updateOperationsField('whatsappNumber', e.target.value)
                      }
                    />
                  </label>
                  <label>
                    Teléfono Visible en Pantallas
                    <input
                      type="text"
                      value={operations.phoneDisplay || ''}
                      onChange={(e) =>
                        updateOperationsField('phoneDisplay', e.target.value)
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
                  <label>
                    Horarios de Atención (Texto visible)
                    <input
                      type="text"
                      value={operations.businessHoursText || ''}
                      onChange={(e) =>
                        updateOperationsField('businessHoursText', e.target.value)
                      }
                    />
                  </label>
                </div>
              </div>

              <div className="admin-panel-box">
                <h3>Opciones de Trabajo, Días y Horarios Disponibles (Sin Límite)</h3>

                {/* Work Options */}
                <p style={{ marginTop: 6 }}>
                  <strong>Opciones de Trabajo / Formas / Variantes:</strong> (Ej: Almendra,
                  Coffin, Con Retiro, Pelo Largo, etc.)
                </p>
                <div className="slots-editor-chips">
                  {(operations.workOptions || []).map((opt) => (
                    <span key={opt} className="slot-admin-chip">
                      <strong>{opt}</strong>
                      <button
                        type="button"
                        onClick={() => handleRemoveWorkOption(opt)}
                        title="Quitar opción"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
                <div className="add-slot-row" style={{ marginBottom: 18 }}>
                  <input
                    type="text"
                    value={newWorkOptionInput}
                    onChange={(e) => setNewWorkOptionInput(e.target.value)}
                    placeholder="Ej: Con Retiro Previo (+20 min)"
                  />
                  <button
                    type="button"
                    className="admin-primary-btn"
                    onClick={handleAddWorkOption}
                  >
                    <Plus size={14} />
                    <span>Agregar Opción</span>
                  </button>
                </div>

                {/* Available Dates / Days */}
                <p>
                  <strong>Días / Fechas Disponibles para Turnos:</strong>
                </p>
                <div className="slots-editor-chips">
                  {(operations.availableDates || []).map((d) => (
                    <span key={d} className="slot-admin-chip">
                      <strong>{d}</strong>
                      <button
                        type="button"
                        onClick={() => handleRemoveDateOption(d)}
                        title="Quitar día"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
                <div className="add-slot-row" style={{ marginBottom: 18 }}>
                  <input
                    type="text"
                    value={newDateInput}
                    onChange={(e) => setNewDateInput(e.target.value)}
                    placeholder="Ej: Sábado 22"
                  />
                  <button
                    type="button"
                    className="admin-primary-btn"
                    onClick={handleAddDateOption}
                  >
                    <Plus size={14} />
                    <span>Agregar Día</span>
                  </button>
                </div>

                {/* Time Slots */}
                <p>
                  <strong>Horarios de Turnos Disponibles:</strong>
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

          {/* TAB 5: APPOINTMENTS AGENDA */}
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
                          {apt.specialistName} • 💎 Opción: {apt.nailShape}
                        </p>
                        {apt.notes && <p className="apt-note-line">📝 "{apt.notes}"</p>}
                      </div>
                    </div>

                    <div className="admin-apt-inspo-thumbs">
                      <span>Added Inspo:</span>
                      <div className="apt-thumbs-row">
                        {(apt.inspoImages || []).map((img, i) => (
                          <img
                            key={i}
                            src={img}
                            alt="inspo"
                            onError={(e) => {
                              e.currentTarget.src = './assets/studio-nails.jpg';
                            }}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="admin-apt-right">
                      <div className="apt-money-info">
                        <span>Total: ${Number(apt.totalPrice || 0).toLocaleString('es-AR')}</span>
                        <strong>
                          Seña: ${Number(apt.depositAmount || 0).toLocaleString('es-AR')}
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
                  Todos los datos, categorías, colaboradores, servicios y fotos de{' '}
                  <strong>{branding.businessName}</strong> quedan guardados permanentemente en
                  la base de datos aislada <code>{tenantDb.dbNamespace}</code> hasta que el
                  cliente decida cambiarlos o eliminarlos.
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
                    <span>Restaurar Plantilla Base</span>
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
                      placeholder="https://tu-proyecto.supabase.co"
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
