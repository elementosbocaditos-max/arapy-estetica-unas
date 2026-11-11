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
  Wand2,
  MapPin,
  Phone,
  Clock,
  Plus,
  Share2
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
    updateOperationsField,
    persistTenantUpdate,
    clientProfile,
    setClientProfile,
    selectServiceAndGoToBooking,
    liveEditMode,
    setActiveScreen,
    setActiveModal,
    showToast
  } = useSaaS();

  const {
    branding = {},
    categories = [],
    services = [],
    appointments = [],
    operations = {}
  } = tenantDb;
  const currency = operations.currencySymbol || '$';
  const [searchQuery, setSearchQuery] = useState('');
  const [quickCat, setQuickCat] = useState('all');
  const [editingClientName, setEditingClientName] = useState(false);

  const goScreen = (scr) => {
    if (onNavigate) onNavigate(scr);
    else setActiveScreen(scr);
  };

  // Filter services by search and dynamic category (no artificial limit on count)
  const filteredPopular = services.filter((srv) => {
    const matchesCat = quickCat === 'all' ? true : srv.category === quickCat;
    const matchesQuery =
      !searchQuery.trim() ||
      srv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (srv.shortDesc || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const latestAppointment = appointments[0] || null;

  const getCategoryMeta = (catId) => {
    return (
      categories.find((c) => c.id === catId) || {
        id: catId,
        name: catId || 'General',
        shortLabel: catId || 'General',
        icon: '✨'
      }
    );
  };

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

  const handleAddCategoryInline = () => {
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
    setQuickCat(newId);
    showToast('➕ Nueva categoría agregada. Podés editar su nombre.');
  };

  const handleUpdateCategoryLabel = (catId, newLabel) => {
    persistTenantUpdate((prev) => ({
      ...prev,
      categories: (prev.categories || []).map((c) =>
        c.id === catId ? { ...c, shortLabel: newLabel, name: newLabel } : c
      )
    }));
  };

  return (
    <div className="phone-screen home-dashboard-screen">
      <div className="home-scroll-body">
        {/* Top Native In-App Navigation Bar */}
        <div className="home-top-nav">
          <button
            type="button"
            className="home-icon-btn menu-toggle-btn"
            onClick={() => setActiveModal('drawer')}
            title="Abrir Menú y Panel de Administración"
          >
            <Menu size={20} />
          </button>

          <button
            type="button"
            className="home-ai-assistant-chip"
            onClick={() => setActiveModal('ai')}
            title="Consultar Asesora IA"
          >
            <Wand2 size={13} />
            <EditableText
              value={branding.aiButtonLabel || 'Asesora IA'}
              onSave={(val) => updateBrandingField('aiButtonLabel', val)}
            />
          </button>

          <div className="home-top-right-group">
            <button
              type="button"
              className="home-icon-btn share-store-top-btn"
              onClick={() => setActiveModal('share')}
              title="Compartir link de la tienda"
            >
              <Share2 size={18} />
            </button>

            <button
              type="button"
              className="home-icon-btn notification-bell"
              onClick={() => goScreen('booking')}
              title="Ver tu próximo turno"
            >
              <Bell size={19} />
              <span className="bell-red-dot" />
            </button>
          </div>
        </div>

        {/* Greeting Header (100% Editable, zero hardcoded proper names) */}
        <div className="home-greeting-block">
          <div className="home-salon-mini-tag">
            <EditableText
              value={branding.businessName}
              onSave={(val) => updateBrandingField('businessName', val)}
            />
          </div>
          <h2 className="home-greeting-title">
            <EditableText
              value={branding.homeWelcomePrefix || 'Hola,'}
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
                  updateBrandingField('defaultClientGreetingName', e.target.value);
                }}
                onBlur={() => setEditingClientName(false)}
                onKeyDown={(e) => e.key === 'Enter' && setEditingClientName(false)}
                autoFocus
              />
            ) : (
              <span
                className="client-name-editable"
                onClick={() => setEditingClientName(true)}
                title="Tocá para cambiar el nombre"
              >
                {clientProfile.name || branding.defaultClientGreetingName || 'Clienta'}
              </span>
            )}
          </h2>
          <EditableText
            value={branding.homeWelcomeSubtitle}
            onSave={(val) => updateBrandingField('homeWelcomeSubtitle', val)}
            tag="p"
            className="home-greeting-sub"
          />

          {/* Editable Address, Hours & Phone Pill Bar */}
          <div className="home-business-info-bar">
            <span className="home-info-chip">
              <MapPin size={11} />
              <EditableText
                value={operations.address || 'Dirección (Editable)'}
                onSave={(val) => updateOperationsField('address', val)}
              />
            </span>
            <span className="home-info-chip">
              <Clock size={11} />
              <EditableText
                value={operations.businessHoursText || 'Horarios (Editable)'}
                onSave={(val) => updateOperationsField('businessHoursText', val)}
              />
            </span>
            <span className="home-info-chip">
              <Phone size={11} />
              <EditableText
                value={operations.phoneDisplay || operations.whatsappNumber || 'Teléfono'}
                onSave={(val) => updateOperationsField('phoneDisplay', val)}
              />
            </span>
          </div>
        </div>

        {/* Dynamic Unlimited Categories Selector */}
        <div className="quick-intent-pills">
          <button
            type="button"
            className={`intent-pill ${quickCat === 'all' ? 'active' : ''}`}
            onClick={() => setQuickCat('all')}
          >
            <EditableText
              value={branding.allCategoriesLabel || '✨ Todo'}
              onSave={(val) => updateBrandingField('allCategoriesLabel', val)}
            />
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`intent-pill ${quickCat === cat.id ? 'active' : ''}`}
              onClick={() => setQuickCat(cat.id)}
            >
              <span>{cat.icon}</span>{' '}
              <EditableText
                value={cat.shortLabel || cat.name}
                onSave={(val) => handleUpdateCategoryLabel(cat.id, val)}
              />
            </button>
          ))}

          {liveEditMode && (
            <button
              type="button"
              className="intent-pill add-cat-pill"
              onClick={handleAddCategoryInline}
              title="Agregar nueva categoría"
            >
              <Plus size={12} />
              <span>Categoría</span>
            </button>
          )}

          <button
            type="button"
            className="intent-pill inspo-jump"
            onClick={() => goScreen('inspo')}
          >
            <EditableText
              value={branding.inspoShortcutLabel || '🖤 Add Inspo'}
              onSave={(val) => updateBrandingField('inspoShortcutLabel', val)}
            />
          </button>
        </div>

        {/* Search Input with Dusty Rose Square Button */}
        <div className="home-search-bar">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={branding.searchPlaceholder || 'Buscar servicio...'}
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

        {/* Popular Services Section (Unlimited items displayed) */}
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
            <EditableText
              value={branding.seeAllLabel || 'Ver todos'}
              onSave={(val) => updateBrandingField('seeAllLabel', val)}
            />
          </button>
        </div>

        <div className="popular-cards-row">
          {filteredPopular.map((srv) => {
            const catMeta = getCategoryMeta(srv.category);
            return (
              <div key={srv.id} className="popular-mini-card">
                <div className="popular-card-top">
                  <span className="popular-icon-badge">
                    {renderServiceIcon(srv.popularIcon, srv.category)}
                  </span>
                  <span className="popular-dots">{catMeta.icon}</span>
                </div>
                <div className="popular-card-title">
                  <EditableText
                    value={srv.name}
                    onSave={(val) => handleServiceNameEdit(srv.id, val)}
                  />
                </div>
                <div className="popular-card-sub">{catMeta.name}</div>
                <div className="popular-card-footer">
                  <span className="popular-price">
                    {currency}
                    <EditableText
                      value={Number(srv.price || 0).toLocaleString('es-AR')}
                      onSave={(val) => handleServicePriceEdit(srv.id, val)}
                    />
                  </span>
                  <button
                    type="button"
                    className="popular-book-mini-btn"
                    onClick={() => selectServiceAndGoToBooking(srv.id, false)}
                  >
                    <EditableText
                      value={branding.bookButtonLabel || 'Reservar'}
                      onSave={(val) => updateBrandingField('bookButtonLabel', val)}
                    />
                  </button>
                </div>
              </div>
            );
          })}
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
            <EditableText
              value={branding.seeCombosLabel || 'Ver más'}
              onSave={(val) => updateBrandingField('seeCombosLabel', val)}
            />
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
            title="Tocá para ver los detalles de tu turno"
          >
            <img
              src={latestAppointment.inspoImages?.[0] || './assets/hair-cut.jpg'}
              alt={latestAppointment.serviceName}
              className="upcoming-thumb"
              onError={(e) => {
                e.currentTarget.src = './assets/studio-nails.jpg';
              }}
            />
            <div className="upcoming-info">
              <div className="upcoming-service-name">{latestAppointment.serviceName}</div>
              <div className="upcoming-stylist">{latestAppointment.specialistName}</div>
            </div>
            <div className="upcoming-datetime">
              <div className="upcoming-date">{latestAppointment.dateLabel}</div>
              <div className="upcoming-time">{latestAppointment.timeSlot} hs</div>
            </div>
          </div>
        ) : (
          <div className="upcoming-appointment-card empty" onClick={() => goScreen('services')}>
            <div className="upcoming-info">
              <div className="upcoming-service-name">
                <EditableText
                  value={branding.emptyAppointmentTitle || 'Aún no tenés turnos agendados'}
                  onSave={(val) => updateBrandingField('emptyAppointmentTitle', val)}
                />
              </div>
              <div className="upcoming-stylist">
                <EditableText
                  value={
                    branding.emptyAppointmentSub ||
                    'Tocá aquí para elegir tu servicio y horario'
                  }
                  onSave={(val) => updateBrandingField('emptyAppointmentSub', val)}
                />
              </div>
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
        <button
          type="button"
          className="bnav-item"
          onClick={() => setActiveModal('drawer')}
          title="Menú, Finanzas y Administración"
        >
          <User size={18} />
          <span>Menú</span>
        </button>
      </div>
    </div>
  );
}
