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

  const { branding, services = [], operations = {} } = tenantDb;
  const currency = operations.currencySymbol || '$';

  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all'); // 'all' | 'unas' | 'pelo' | 'combos'

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
    const newSrv = {
      id: `srv-${Date.now()}`,
      name: 'Nuevo Servicio (Editar)',
      addonLabel: '+ detalle',
      category: categoryFilter === 'all' ? 'unas' : categoryFilter,
      popularIcon: 'sparkles',
      isPopular: true,
      shortDesc: 'Descripción personalizada de tu servicio',
      price: 20000,
      durationMin: 60,
      image: '/assets/inspo-rose-french.jpg'
    };
    persistTenantUpdate((prev) => ({
      ...prev,
      services: [newSrv, ...(prev.services || [])]
    }));
    showToast('➕ Nuevo servicio creado. Podés cambiar su foto y texto.');
  };

  const deleteServiceInline = (srvId) => {
    if (services.length <= 1) {
      showToast('Debe quedar al menos 1 servicio en el catálogo.');
      return;
    }
    persistTenantUpdate((prev) => ({
      ...prev,
      services: prev.services.filter((s) => s.id !== srvId)
    }));
    showToast('🗑️ Servicio eliminado del catálogo');
  };

  return (
    <div className="phone-screen services-screen">
      {/* Curved Dusty Rose Header (Exact match to Reference 2 Right Screen) */}
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
          {liveEditMode && (
            <button
              type="button"
              className="services-add-inline-btn"
              onClick={addNewServiceInline}
            >
              <Plus size={14} />
              <span>Agregar Servicio</span>
            </button>
          )}
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
              placeholder="Buscar servicio..."
            />
          </div>
          <button
            type="button"
            className="services-filter-square-btn"
            onClick={() => {
              const order = ['all', 'unas', 'pelo', 'combos'];
              const next = order[(order.indexOf(categoryFilter) + 1) % order.length];
              setCategoryFilter(next);
            }}
            title="Alternar filtro: Todos / Uñas / Pelo / Combos"
          >
            <SlidersHorizontal size={17} />
          </button>
        </div>

        {/* Category Filter Pills inside Header */}
        <div className="services-category-tabs">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'unas', label: '💅 Uñas' },
            { id: 'pelo', label: '✂️ Peluquería' },
            { id: 'combos', label: '✨ Combos' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`srv-cat-pill ${categoryFilter === tab.id ? 'active' : ''}`}
              onClick={() => setCategoryFilter(tab.id)}
            >
              {tab.label}
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
                    value={Number(srv.price).toLocaleString('es-AR')}
                    onSave={(val) =>
                      updateServiceField(
                        srv.id,
                        'price',
                        Number(String(val).replace(/[^\d]/g, '')) || 0
                      )
                    }
                  />
                </span>
                <span className="service-row-duration">• {srv.durationMin} min</span>
              </div>
            </div>

            <div className="service-row-actions">
              <button
                type="button"
                className="service-row-book-btn"
                onClick={() => selectServiceAndGoToBooking(srv.id, false)}
              >
                Reservar
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
