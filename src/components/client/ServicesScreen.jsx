import React, { useState } from 'react';
import {
  ChevronLeft,
  Search,
  SlidersHorizontal,
  Plus,
  Trash2,
  Home,
  Compass,
  Calendar,
  User
} from 'lucide-react';
import { useSaaS } from '../../context/SaaSContext';
import EditableMedia from '../common/EditableMedia';
import EditableText from '../common/EditableText';

export default function ServicesScreen({ onNavigate }) {
  const {
    tenantDb,
    updateBrandingField,
    persistTenantUpdate,
    selectServiceAndGoToBooking,
    liveEditMode,
    setActiveScreen,
    setActiveModal,
    showToast
  } = useSaaS();

  const { branding = {}, categories = [], services = [], operations = {} } = tenantDb;
  const currency = operations.currencySymbol || '$';

  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const goScreen = (scr) => {
    if (onNavigate) onNavigate(scr);
    else setActiveScreen(scr);
  };

  const filteredServices = services.filter((srv) => {
    const matchCat = categoryFilter === 'all' ? true : srv.category === categoryFilter;
    const matchQuery =
      !query.trim() ||
      srv.name.toLowerCase().includes(query.toLowerCase()) ||
      (srv.shortDesc || '').toLowerCase().includes(query.toLowerCase());
    return matchCat && matchQuery;
  });

  const updateServiceField = (srvId, field, value) => {
    persistTenantUpdate((prev) => ({
      ...prev,
      services: prev.services.map((s) => (s.id === srvId ? { ...s, [field]: value } : s))
    }));
  };

  const addNewServiceInline = () => {
    const defaultCat =
      categoryFilter !== 'all' ? categoryFilter : categories[0]?.id || 'general';
    const newSrv = {
      id: `srv-${Date.now()}`,
      name: 'Nuevo Trabajo / Servicio (Editar)',
      addonLabel: '+ detalle (Editable)',
      category: defaultCat,
      popularIcon: 'sparkles',
      isPopular: true,
      shortDesc: 'Descripción personalizada de tu servicio',
      price: 20000,
      durationMin: 60,
      image: './assets/inspo-rose-french.jpg'
    };
    persistTenantUpdate((prev) => ({
      ...prev,
      services: [newSrv, ...(prev.services || [])]
    }));
    showToast('➕ Nuevo servicio agregado y guardado.');
  };

  const deleteServiceInline = (srvId) => {
    persistTenantUpdate((prev) => ({
      ...prev,
      services: prev.services.filter((s) => s.id !== srvId)
    }));
    showToast('🗑️ Servicio eliminado del catálogo');
  };

  const addNewCategoryInline = () => {
    const newId = `cat-${Date.now()}`;
    const newCat = {
      id: newId,
      name: 'Nueva Categoría',
      shortLabel: 'Nueva Cat.',
      icon: '✨'
    };
    persistTenantUpdate((prev) => ({
      ...prev,
      categories: [...(prev.categories || []), newCat]
    }));
    setCategoryFilter(newId);
    showToast('➕ Nueva categoría creada.');
  };

  const updateCategoryLabel = (catId, newLabel) => {
    persistTenantUpdate((prev) => ({
      ...prev,
      categories: (prev.categories || []).map((c) =>
        c.id === catId ? { ...c, shortLabel: newLabel, name: newLabel } : c
      )
    }));
  };

  const deleteCategoryInline = (catId) => {
    persistTenantUpdate((prev) => ({
      ...prev,
      categories: (prev.categories || []).filter((c) => c.id !== catId)
    }));
    if (categoryFilter === catId) setCategoryFilter('all');
    showToast('🗑️ Categoría quitada');
  };

  const cycleCategoryFilter = () => {
    const order = ['all', ...categories.map((c) => c.id)];
    const next = order[(order.indexOf(categoryFilter) + 1) % order.length];
    setCategoryFilter(next);
  };

  return (
    <div className="phone-screen services-screen">
      {/* Curved Dusty Rose Header */}
      <div className="services-rose-header">
        <div className="phone-status-bar dark">
          <span className="status-time">7:41</span>
          <div className="dynamic-island" />
          <div className="status-icons">
            <span>•••</span>
            <span>WiFi</span>
            <span className="battery-pill">100</span>
          </div>
        </div>

        <div className="services-header-top-row">
          <button
            type="button"
            className="services-back-btn"
            onClick={() => goScreen('home')}
          >
            <ChevronLeft size={20} />
          </button>
          <div style={{ display: 'flex', gap: 6 }}>
            {liveEditMode && (
              <>
                <button
                  type="button"
                  className="services-add-inline-btn"
                  onClick={addNewCategoryInline}
                >
                  <Plus size={13} />
                  <span>+ Categoría</span>
                </button>
                <button
                  type="button"
                  className="services-add-inline-btn"
                  onClick={addNewServiceInline}
                >
                  <Plus size={13} />
                  <span>+ Trabajo</span>
                </button>
              </>
            )}
          </div>
        </div>

        <EditableText
          value={branding.servicesHeaderTitle}
          onSave={(val) => updateBrandingField('servicesHeaderTitle', val)}
          tag="h2"
          className="services-header-title"
        />
        <EditableText
          value={branding.servicesHeaderSubtitle}
          onSave={(val) => updateBrandingField('servicesHeaderSubtitle', val)}
          tag="p"
          className="services-header-sub"
        />

        {/* Embedded White Search Bar + Filter Button */}
        <div className="services-header-search-row">
          <div className="services-white-search">
            <Search size={16} className="search-muted-icon" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={branding.searchPlaceholder || 'Buscar servicio...'}
            />
          </div>
          <button
            type="button"
            className="services-filter-square-btn"
            onClick={cycleCategoryFilter}
            title="Alternar filtro por categoría"
          >
            <SlidersHorizontal size={17} />
          </button>
        </div>

        {/* Dynamic Unlimited Category Filter Pills inside Header */}
        <div className="services-category-tabs">
          <button
            type="button"
            className={`srv-cat-pill ${categoryFilter === 'all' ? 'active' : ''}`}
            onClick={() => setCategoryFilter('all')}
          >
            <EditableText
              value={branding.allCategoriesLabel || 'Todos'}
              onSave={(val) => updateBrandingField('allCategoriesLabel', val)}
            />
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`srv-cat-pill ${categoryFilter === cat.id ? 'active' : ''}`}
              onClick={() => setCategoryFilter(cat.id)}
            >
              <span>{cat.icon}</span>{' '}
              <EditableText
                value={cat.shortLabel || cat.name}
                onSave={(val) => updateCategoryLabel(cat.id, val)}
              />
              {liveEditMode && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteCategoryInline(cat.id);
                  }}
                  style={{ marginLeft: 5, opacity: 0.85, cursor: 'pointer' }}
                  title="Eliminar categoría"
                >
                  ✕
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* White Rounded Service List Container */}
      <div className="services-list-container">
        {filteredServices.map((srv) => (
          <div key={srv.id} className="service-row-card">
            <EditableMedia
              src={srv.image}
              alt={srv.name}
              className="service-row-thumb"
              label={`srv-${srv.id}`}
              badgePosition="bottom-left"
              onChangeUrl={(url) => updateServiceField(srv.id, 'image', url)}
            />

            <div className="service-row-info">
              <div className="service-row-title">
                <EditableText
                  value={srv.name}
                  onSave={(val) => updateServiceField(srv.id, 'name', val)}
                />
              </div>
              <div className="service-row-desc">
                <EditableText
                  value={srv.shortDesc}
                  onSave={(val) => updateServiceField(srv.id, 'shortDesc', val)}
                />
              </div>
              <div className="service-row-price-line">
                <span className="service-row-price">
                  {currency}
                  <EditableText
                    value={Number(srv.price || 0).toLocaleString('es-AR')}
                    onSave={(val) =>
                      updateServiceField(
                        srv.id,
                        'price',
                        Number(String(val).replace(/[^\d]/g, '')) || 0
                      )
                    }
                  />
                </span>
                <span className="service-row-duration">
                  •{' '}
                  <EditableText
                    value={String(srv.durationMin || 60)}
                    onSave={(val) =>
                      updateServiceField(
                        srv.id,
                        'durationMin',
                        Number(String(val).replace(/[^\d]/g, '')) || 30
                      )
                    }
                  />{' '}
                  min
                </span>
              </div>
            </div>

            <div className="service-row-actions">
              <button
                type="button"
                className="service-row-book-btn"
                onClick={() => selectServiceAndGoToBooking(srv.id, false)}
              >
                <EditableText
                  value={branding.bookButtonLabel || 'Reservar'}
                  onSave={(val) => updateBrandingField('bookButtonLabel', val)}
                />
              </button>
              {liveEditMode && (
                <button
                  type="button"
                  className="service-row-delete-btn"
                  onClick={() => deleteServiceInline(srv.id)}
                  title="Eliminar este servicio"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Navigation Bar */}
      <div className="phone-bottom-nav">
        <button type="button" className="bnav-item" onClick={() => goScreen('home')}>
          <Home size={18} />
          <span>Inicio</span>
        </button>
        <button type="button" className="bnav-item active" onClick={() => goScreen('services')}>
          <Search size={18} />
          <span>Servicios</span>
        </button>
        <button type="button" className="bnav-item" onClick={() => goScreen('inspo')}>
          <Compass size={18} />
          <span>Add Inspo</span>
        </button>
        <button type="button" className="bnav-item" onClick={() => goScreen('booking')}>
          <Calendar size={18} />
          <span>Mi Turno</span>
        </button>
        <button type="button" className="bnav-item" onClick={() => setActiveModal('owner')}>
          <User size={18} />
          <span>Panel</span>
        </button>
      </div>
    </div>
  );
}
