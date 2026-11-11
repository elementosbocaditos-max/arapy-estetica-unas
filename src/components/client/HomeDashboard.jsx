import React, { useState } from 'react';
import {
  Menu,
  Bell,
  Search,
  Scissors,
  Sparkles,
  Flower2,
  Home,
  Compass,
  User,
  Calendar,
  Wand2
} from 'lucide-react';
import { useSaaS } from '../../context/SaaSContext';
import EditableMedia from '../common/EditableMedia';
import EditableText from '../common/EditableText';
import { saveClientProfileMemory } from '../../db/storageEngine';

export default function HomeDashboard({ onNavigate }) {
  const {
    activeSlug,
    tenantDb,
    updateBrandingField,
    persistTenantUpdate,
    clientProfile,
    setClientProfile,
    selectServiceAndGoToBooking,
    setActiveScreen,
    setActiveModal
  } = useSaaS();

  const { branding, services = [], appointments = [], operations = {} } = tenantDb;
  const currency = operations.currencySymbol || '$';
  const [searchQuery, setSearchQuery] = useState('');
  const [quickCat, setQuickCat] = useState('all'); // 'all' | 'unas' | 'pelo'
  const [editingClientName, setEditingClientName] = useState(false);

  const goScreen = (scr) => {
    if (onNavigate) onNavigate(scr);
    else setActiveScreen(scr);
  };

  // Filter popular services by search and quick category (Uñas vs Pelo)
  const filteredPopular = services.filter((srv) => {
    const matchesCat = quickCat === 'all' ? true : srv.category === quickCat;
    const matchesQuery =
      !searchQuery.trim() ||
      srv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (srv.shortDesc || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const latestAppointment = appointments[0] || null;

  const renderServiceIcon = (iconName, category) => {
    if (iconName === 'scissors' || category === 'pelo') return <Scissors size={16} />;
    if (iconName === 'flower') return <Flower2 size={16} />;
    return <Sparkles size={16} />;
  };

  const handleServicePriceEdit = (srvId, newPriceRaw) => {
    const cleanNum = Number(String(newPriceRaw).replace(/[^\d]/g, '')) || 0;
    persistTenantUpdate((prev) => ({
      ...prev,
      services: prev.services.map((s) => (s.id === srvId ? { ...s, price: cleanNum } : s))
    }));
  };

  const handleServiceNameEdit = (srvId, newName) => {
    persistTenantUpdate((prev) => ({
      ...prev,
      services: prev.services.map((s) => (s.id === srvId ? { ...s, name: newName } : s))
    }));
  };

  return (
    <div className="phone-screen home-dashboard-screen">
      {/* Status Bar */}
      <div className="phone-status-bar light">
        <span className="status-time">7:41</span>
        <div className="dynamic-island" />
        <div className="status-icons">
          <span>•••</span>
          <span>WiFi</span>
          <span className="battery-pill dark">100</span>
        </div>
      </div>

      <div className="home-scroll-body">
        {/* Top Utility Row */}
        <div className="home-top-nav">
          <button
            type="button"
            className="home-icon-btn"
            onClick={() => setActiveModal('owner')}
            title="Abrir Panel de Configuración del Negocio"
          >
            <Menu size={20} />
          </button>

          <button
            type="button"
            className="home-ai-assistant-chip"
            onClick={() => setActiveModal('ai')}
          >
            <Wand2 size={13} />
            <span>Asesora IA Uñas & Pelo</span>
          </button>

          <button
            type="button"
            className="home-icon-btn notification-bell"
            onClick={() => goScreen('booking')}
            title="Ver tu próximo turno"
          >
            <Bell size={20} />
            <span className="bell-red-dot" />
          </button>
        </div>

        {/* Greeting Header ("Hi, Mahi — Welcome Back!") */}
        <div className="home-greeting-block">
          <h2 className="home-greeting-title">
            <EditableText
              value={branding.homeWelcomePrefix}
              onSave={(val) => updateBrandingField('homeWelcomePrefix', val)}
            />{' '}
            {editingClientName ? (
              <input
                type="text"
                className="client-name-inline-input"
                value={clientProfile.name}
                onChange={(e) => {
                  const next = { ...clientProfile, name: e.target.value };
                  setClientProfile(next);
                  saveClientProfileMemory(activeSlug, next);
                }}
                onBlur={() => setEditingClientName(false)}
                onKeyDown={(e) => e.key === 'Enter' && setEditingClientName(false)}
                autoFocus
              />
            ) : (
              <span
                className="client-name-editable"
                onClick={() => setEditingClientName(true)}
                title="Toca para poner tu nombre"
              >
                {clientProfile.name || 'Mahi'}
              </span>
            )}
          </h2>
          <EditableText
            value={branding.homeWelcomeSubtitle}
            onSave={(val) => updateBrandingField('homeWelcomeSubtitle', val)}
            tag="p"
            className="home-greeting-sub"
          />
        </div>

        {/* Intuitive Quick Need Selector: ¿Uñas o Pelo? */}
        <div className="quick-intent-pills">
          <button
            type="button"
            className={`intent-pill ${quickCat === 'all' ? 'active' : ''}`}
            onClick={() => setQuickCat('all')}
          >
            ✨ Todo
          </button>
          <button
            type="button"
            className={`intent-pill ${quickCat === 'unas' ? 'active' : ''}`}
            onClick={() => setQuickCat('unas')}
          >
            💅 Pintar / Uñas
          </button>
          <button
            type="button"
            className={`intent-pill ${quickCat === 'pelo' ? 'active' : ''}`}
            onClick={() => setQuickCat('pelo')}
          >
            ✂️ Cortar / Pelo
          </button>
          <button
            type="button"
            className="intent-pill inspo-jump"
            onClick={() => goScreen('inspo')}
          >
            🖤 Add Inspo
          </button>
        </div>

        {/* Search Input with Dusty Rose Square Button */}
        <div className="home-search-bar">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={branding.searchPlaceholder || 'Buscar uñas, corte, color...'}
            className="home-search-input"
          />
          <button
            type="button"
            className="home-search-submit"
            onClick={() => goScreen('services')}
            title="Buscar en todos los servicios"
          >
            <Search size={17} />
          </button>
        </div>

        {/* Popular Services Section */}
        <div className="home-section-header">
          <EditableText
            value={branding.popularSectionTitle}
            onSave={(val) => updateBrandingField('popularSectionTitle', val)}
            tag="h3"
            className="home-section-title"
          />
          <button
            type="button"
            className="home-see-all-link"
            onClick={() => goScreen('services')}
          >
            Ver todos
          </button>
        </div>

        <div className="popular-cards-row">
          {filteredPopular.slice(0, 4).map((srv) => (
            <div key={srv.id} className="popular-mini-card">
              <div className="popular-card-top">
                <span className="popular-icon-badge">
                  {renderServiceIcon(srv.popularIcon, srv.category)}
                </span>
                <span className="popular-dots">⋮</span>
              </div>
              <div className="popular-card-title">
                <EditableText
                  value={srv.name}
                  onSave={(val) => handleServiceNameEdit(srv.id, val)}
                />
              </div>
              <div className="popular-card-sub">
                {srv.category === 'unas'
                  ? 'Estética de Uñas'
                  : srv.category === 'pelo'
                  ? 'Peluquería'
                  : 'Combo Integral'}
              </div>
              <div className="popular-card-footer">
                <span className="popular-price">
                  {currency}
                  <EditableText
                    value={srv.price.toLocaleString('es-AR')}
                    onSave={(val) => handleServicePriceEdit(srv.id, val)}
                  />
                </span>
                <button
                  type="button"
                  className="popular-book-mini-btn"
                  onClick={() => selectServiceAndGoToBooking(srv.id, false)}
                >
                  Reservar
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Special Offers Section (20% OFF Dusty Rose Banner) */}
        <div className="home-section-header">
          <EditableText
            value={branding.offersSectionTitle}
            onSave={(val) => updateBrandingField('offersSectionTitle', val)}
            tag="h3"
            className="home-section-title"
          />
          <button
            type="button"
            className="home-see-all-link"
            onClick={() => goScreen('services')}
          >
            Ver combos
          </button>
        </div>

        <div className="special-offer-banner">
          <div className="offer-left-copy">
            <EditableText
              value={branding.offerDiscountBadge}
              onSave={(val) => updateBrandingField('offerDiscountBadge', val)}
              tag="div"
              className="offer-discount-big"
            />
            <EditableText
              value={branding.offerTitle}
              onSave={(val) => updateBrandingField('offerTitle', val)}
              tag="div"
              className="offer-title-text"
            />
            <EditableText
              value={branding.offerSubtitle}
              onSave={(val) => updateBrandingField('offerSubtitle', val)}
              tag="div"
              className="offer-sub-text"
            />
            <button
              type="button"
              className="offer-book-white-btn"
              onClick={() =>
                selectServiceAndGoToBooking(
                  branding.offerLinkedServiceId || services[0]?.id,
                  true
                )
              }
            >
              <EditableText
                value={branding.offerButtonText}
                onSave={(val) => updateBrandingField('offerButtonText', val)}
              />
            </button>
          </div>
          <div className="offer-right-image-wrap">
            <EditableMedia
              src={branding.offerBannerImage}
              alt={branding.offerTitle}
              className="offer-banner-photo"
              label="promo-banner"
              badgePosition="bottom-right"
              onChangeUrl={(url) => updateBrandingField('offerBannerImage', url)}
            />
          </div>
        </div>

        {/* Upcoming Appointment Section */}
        <div className="home-section-header">
          <EditableText
            value={branding.upcomingSectionTitle}
            onSave={(val) => updateBrandingField('upcomingSectionTitle', val)}
            tag="h3"
            className="home-section-title"
          />
        </div>

        {latestAppointment ? (
          <div
            className="upcoming-appointment-card"
            onClick={() => goScreen('booking')}
            title="Toca para ver los detalles de tu turno"
          >
            <img
              src={latestAppointment.inspoImages?.[0] || '/assets/hair-cut.jpg'}
              alt={latestAppointment.serviceName}
              className="upcoming-thumb"
              onError={(e) => {
                e.currentTarget.src = '/assets/studio-nails.jpg';
              }}
            />
            <div className="upcoming-info">
              <div className="upcoming-service-name">{latestAppointment.serviceName}</div>
              <div className="upcoming-stylist">Por {latestAppointment.specialistName}</div>
            </div>
            <div className="upcoming-datetime">
              <div className="upcoming-date">{latestAppointment.dateLabel}</div>
              <div className="upcoming-time">{latestAppointment.timeSlot} hs</div>
            </div>
          </div>
        ) : (
          <div className="upcoming-appointment-card empty" onClick={() => goScreen('services')}>
            <div className="upcoming-info">
              <div className="upcoming-service-name">Aún no tenés turnos activos</div>
              <div className="upcoming-stylist">Tocá aquí para elegir Uñas o Peluquería</div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Tab Navigation */}
      <div className="phone-bottom-nav">
        <button type="button" className="bnav-item active" onClick={() => goScreen('home')}>
          <Home size={18} />
          <span>Inicio</span>
        </button>
        <button type="button" className="bnav-item" onClick={() => goScreen('services')}>
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
