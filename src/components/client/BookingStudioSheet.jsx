import React, { useState } from 'react';
import {
  ChevronLeft,
  Calendar,
  CheckCircle2,
  Copy,
  Check,
  Sparkles,
  Plus,
  ChevronDown,
  MapPin,
  Phone,
  Clock,
  Share2,
  Menu
} from 'lucide-react';
import { useSaaS } from '../../context/SaaSContext';
import EditableMedia from '../common/EditableMedia';
import EditableText from '../common/EditableText';

export default function BookingStudioSheet({ onNavigate }) {
  const {
    tenantDb,
    updateBrandingField,
    updateOperationsField,
    persistTenantUpdate,
    selectedService,
    selectedServiceId,
    setSelectedServiceId,
    selectedSpecialist,
    selectedSpecialistId,
    setSelectedSpecialistId,
    selectedDateLabel,
    setSelectedDateLabel,
    selectedTimeSlot,
    setSelectedTimeSlot,
    computedTimeRange,
    selectedNailShape,
    setSelectedNailShape,
    resolvedAddedInspoPhotos,
    pricingSummary,
    clientProfile,
    confirmAndSaveAppointment,
    liveEditMode,
    setActiveScreen,
    setActiveModal,
    showToast
  } = useSaaS();

  const {
    branding = {},
    services = [],
    specialists = [],
    operations = {}
  } = tenantDb;
  const currency = operations.currencySymbol || '$';
  const workOptions = operations.workOptions || [
    'Almendra',
    'Coffin',
    'Squoval',
    'Natural / Corto'
  ];
  const availableDates = operations.availableDates || ['Hoy', 'Mañana', 'Viernes', 'Sábado'];
  const timeSlots = operations.timeSlots || ['10:00', '12:00', '15:00', '17:00'];

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showServiceSwitcher, setShowServiceSwitcher] = useState(false);
  const [showSpecialistSwitcher, setShowSpecialistSwitcher] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [clientNameInput, setClientNameInput] = useState(
    clientProfile.name || branding.defaultClientGreetingName || 'Clienta'
  );
  const [clientPhoneInput, setClientPhoneInput] = useState(clientProfile.phone || '');
  const [clientNotesInput, setClientNotesInput] = useState('');
  const [copiedAlias, setCopiedAlias] = useState(false);
  const [confirmedApt, setConfirmedApt] = useState(null);

  const goScreen = (scr) => {
    if (onNavigate) onNavigate(scr);
    else setActiveScreen(scr);
  };

  const handleCopyAlias = () => {
    navigator.clipboard?.writeText(operations.paymentAlias || 'TU.ALIAS.MP');
    setCopiedAlias(true);
    showToast('📋 ¡Alias copiado al portapapeles!');
    setTimeout(() => setCopiedAlias(false), 2500);
  };

  const handleUpdateServiceText = (field, val) => {
    persistTenantUpdate((prev) => ({
      ...prev,
      services: prev.services.map((s) =>
        s.id === selectedService.id ? { ...s, [field]: val } : s
      )
    }));
  };

  const handleAddWorkOptionInline = () => {
    const label = `Nueva Opción ${workOptions.length + 1}`;
    updateOperationsField('workOptions', [...workOptions, label]);
    setSelectedNailShape(label);
    showToast('➕ Opción de trabajo agregada');
  };

  const handleUpdateWorkOptionInline = (oldVal, newVal) => {
    const clean = newVal.trim();
    if (!clean) return;
    const next = workOptions.map((o) => (o === oldVal ? clean : o));
    updateOperationsField('workOptions', next);
    if (selectedNailShape === oldVal) setSelectedNailShape(clean);
  };

  const handleDeleteWorkOptionInline = (val) => {
    const next = workOptions.filter((o) => o !== val);
    updateOperationsField('workOptions', next);
    if (selectedNailShape === val && next[0]) setSelectedNailShape(next[0]);
  };

  const handleAddDateInline = () => {
    const label = `Día ${availableDates.length + 1}`;
    updateOperationsField('availableDates', [...availableDates, label]);
    setSelectedDateLabel(label);
    showToast('➕ Fecha disponible agregada');
  };

  const handleAddSlotInline = () => {
    const label = '14:00';
    if (!timeSlots.includes(label)) {
      updateOperationsField('timeSlots', [...timeSlots, label].sort());
    }
    setSelectedTimeSlot(label);
    showToast('➕ Horario agregado');
  };

  const handleFinalConfirm = async (sendWa = true) => {
    const apt = await confirmAndSaveAppointment({
      customClientName: clientNameInput,
      customClientPhone: clientPhoneInput,
      customNotes: clientNotesInput,
      sendWhatsapp: sendWa
    });
    setConfirmedApt(apt);
    setShowCheckoutModal(false);
  };

  return (
    <div className="phone-screen booking-studio-screen">
      {/* Top Dramatic Editorial Nail/Hair Hero Photo */}
      <div className="booking-hero-top">
        <EditableMedia
          src={branding.bookingHeroImage}
          alt={branding.studioBadgeTitle}
          className="booking-hero-media"
          label="booking-hero"
          badgePosition="bottom-right"
          onChangeUrl={(url) => updateBrandingField('bookingHeroImage', url)}
        >
          <div className="booking-hero-shade" />
        </EditableMedia>

        <div className="booking-hero-nav-row">
          <button
            type="button"
            className="booking-glass-back-btn"
            onClick={() => goScreen('home')}
            title="Volver a Inicio"
          >
            <ChevronLeft size={19} />
          </button>

          <div className="booking-studio-tracked-title">
            <EditableText
              value={branding.studioBadgeTitle}
              onSave={(val) => updateBrandingField('studioBadgeTitle', val)}
            />
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              type="button"
              className="booking-glass-action-btn"
              onClick={() => setActiveModal('share')}
              title="Compartir link de la tienda"
            >
              <Share2 size={16} />
            </button>
            <button
              type="button"
              className="booking-glass-action-btn"
              onClick={() => setActiveModal('drawer')}
              title="Abrir menú"
            >
              <Menu size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Cream Bottom Sheet Card */}
      <div className="booking-cream-sheet">
        {/* Inner Service & Collaborator Summary Box */}
        <div className="booking-inner-service-card">
          <EditableMedia
            src={branding.studioInteriorImage || selectedService.image}
            alt={selectedService.name}
            className="booking-studio-thumb"
            label="studio-interior"
            badgePosition="bottom-left"
            onChangeUrl={(url) => updateBrandingField('studioInteriorImage', url)}
          />

          <div className="booking-service-details">
            <div className="booking-status-row">
              <span
                className={`booking-status-pill ${
                  confirmedApt ? 'confirmed' : 'unconfirmed'
                }`}
              >
                {confirmedApt ? (
                  `Confirmado #${confirmedApt.code}`
                ) : (
                  <EditableText
                    value={branding.bookingStatusUnconfirmed || 'Pendiente'}
                    onSave={(val) => updateBrandingField('bookingStatusUnconfirmed', val)}
                  />
                )}
              </span>

              <button
                type="button"
                className="booking-change-srv-btn"
                onClick={() => setShowServiceSwitcher((p) => !p)}
              >
                <span>Cambiar Trabajo ({services.length})</span>
                <ChevronDown size={12} />
              </button>
            </div>

            <h3 className="booking-service-main-title">
              <EditableText
                value={selectedService.name}
                onSave={(val) => handleUpdateServiceText('name', val)}
              />
            </h3>

            <div className="booking-service-addon">
              <EditableText
                value={selectedService.addonLabel || '+ detalle'}
                onSave={(val) => handleUpdateServiceText('addonLabel', val)}
              />
            </div>

            {/* Collaborator Row with Verified Avatar & Selector */}
            {specialists.length > 0 && (
              <div
                className="booking-stylist-row"
                onClick={() => setShowSpecialistSwitcher((p) => !p)}
                title="Tocá para elegir colaborador/a"
              >
                <div className="booking-stylist-avatar-wrap">
                  <img
                    src={selectedSpecialist.avatar}
                    alt={selectedSpecialist.name}
                    className="booking-stylist-avatar"
                    onError={(e) => {
                      e.currentTarget.src = './assets/stylist-main.jpg';
                    }}
                  />
                  <span className="booking-verified-dot">✓</span>
                </div>
                <div className="booking-stylist-meta">
                  <div className="booking-stylist-name">
                    <EditableText
                      value={branding.bookingStylistPrefix || 'Profesional:'}
                      onSave={(val) => updateBrandingField('bookingStylistPrefix', val)}
                    />{' '}
                    {selectedSpecialist.name} ▾
                  </div>
                  <div className="booking-stylist-studio">
                    <EditableText
                      value={selectedSpecialist.studioCode || branding.studioSubCode}
                      onSave={(val) => updateBrandingField('studioSubCode', val)}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Expandable Service Selector (Unlimited Services) */}
        {showServiceSwitcher && (
          <div className="booking-inline-selector-box">
            <div className="selector-box-label">
              Elegí el trabajo a realizar ({services.length} disponibles):
            </div>
            <div className="selector-chips-wrap">
              {services.map((srv) => (
                <button
                  key={srv.id}
                  type="button"
                  className={`selector-chip ${
                    srv.id === selectedServiceId ? 'active' : ''
                  }`}
                  onClick={() => {
                    setSelectedServiceId(srv.id);
                    setShowServiceSwitcher(false);
                  }}
                >
                  <span>{srv.name}</span>
                  <strong>
                    {currency}
                    {Number(srv.price || 0).toLocaleString('es-AR')}
                  </strong>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Expandable Collaborator Selector (Unlimited Collaborators) */}
        {showSpecialistSwitcher && specialists.length > 0 && (
          <div className="booking-inline-selector-box">
            <div className="selector-box-label">
              Elegí el/la Colaborador/a ({specialists.length}):
            </div>
            <div className="selector-chips-wrap">
              {specialists.map((spec) => (
                <button
                  key={spec.id}
                  type="button"
                  className={`selector-chip ${
                    spec.id === selectedSpecialistId ? 'active' : ''
                  }`}
                  onClick={() => {
                    setSelectedSpecialistId(spec.id);
                    setShowSpecialistSwitcher(false);
                  }}
                >
                  <span>{spec.name}</span>
                  <small>{spec.role}</small>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Unlimited Work Options / Shapes / Extras Strip */}
        <div className="booking-shape-strip">
          {workOptions.map((shape) => (
            <button
              key={shape}
              type="button"
              className={`shape-mini-pill ${
                selectedNailShape === shape ? 'active' : ''
              }`}
              onClick={() => setSelectedNailShape(shape)}
            >
              <EditableText
                value={shape}
                onSave={(val) => handleUpdateWorkOptionInline(shape, val)}
              />
              {liveEditMode && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteWorkOptionInline(shape);
                  }}
                  style={{ marginLeft: 5, cursor: 'pointer' }}
                  title="Quitar opción"
                >
                  ✕
                </span>
              )}
            </button>
          ))}
          {liveEditMode && (
            <button
              type="button"
              className="shape-mini-pill"
              onClick={handleAddWorkOptionInline}
              title="Agregar nueva opción de trabajo"
            >
              + Opción
            </button>
          )}
        </div>

        {/* Two-Column Metadata Row: "Added inspo" | "Selected date" */}
        <div className="booking-two-col-meta">
          {/* Left Column: Added inspo overlapping circles */}
          <div
            className="booking-meta-col left"
            onClick={() => goScreen('inspo')}
            title="Tocá para elegir o subir tus fotos en Add Inspo"
          >
            <div className="meta-col-label">
              <EditableText
                value={branding.bookingAddedInspoLabel || 'Added inspo'}
                onSave={(val) => updateBrandingField('bookingAddedInspoLabel', val)}
              />
            </div>
            <div className="added-inspo-avatar-stack">
              {resolvedAddedInspoPhotos.slice(0, 3).map((imgUrl, idx) => (
                <img
                  key={idx}
                  src={imgUrl}
                  alt="inspo"
                  className="stacked-inspo-circle"
                  onError={(e) => {
                    e.currentTarget.src = './assets/inspo-rose-french.jpg';
                  }}
                />
              ))}
              <span className="stacked-inspo-count-pill">
                +{Math.max(1, resolvedAddedInspoPhotos.length)}
              </span>
              <button
                type="button"
                className="stacked-inspo-add-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  goScreen('inspo');
                }}
                title="Agregar más fotos de inspiración"
              >
                <Plus size={12} />
              </button>
            </div>
          </div>

          <div className="booking-meta-divider" />

          {/* Right Column: Selected date & time range */}
          <div
            className="booking-meta-col right"
            onClick={() => setShowDatePicker((p) => !p)}
            title="Tocá para elegir día y horario"
          >
            <div className="meta-col-label">
              <Calendar size={13} />
              <EditableText
                value={branding.bookingSelectedDateLabel || 'Fecha y Hora'}
                onSave={(val) => updateBrandingField('bookingSelectedDateLabel', val)}
              />
            </div>
            <div className="selected-date-bold">{selectedDateLabel} ▾</div>
            <div className="selected-time-sub">{computedTimeRange} hs</div>
          </div>
        </div>

        {/* Expandable Interactive Date & Time Picker */}
        {showDatePicker && (
          <div className="booking-inline-date-picker">
            <div className="picker-sub-title">Elegí el Día Disponible:</div>
            <div className="picker-pills-row">
              {availableDates.map((d) => (
                <button
                  key={d}
                  type="button"
                  className={`picker-pill ${selectedDateLabel === d ? 'active' : ''}`}
                  onClick={() => setSelectedDateLabel(d)}
                >
                  {d}
                </button>
              ))}
              {liveEditMode && (
                <button
                  type="button"
                  className="picker-pill"
                  onClick={handleAddDateInline}
                >
                  + Día
                </button>
              )}
            </div>
            <div className="picker-sub-title" style={{ marginTop: 8 }}>
              Elegí el Horario Disponible:
            </div>
            <div className="picker-pills-row">
              {timeSlots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  className={`picker-pill ${selectedTimeSlot === slot ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedTimeSlot(slot);
                    setShowDatePicker(false);
                  }}
                >
                  {slot} hs
                </button>
              ))}
              {liveEditMode && (
                <button
                  type="button"
                  className="picker-pill"
                  onClick={handleAddSlotInline}
                >
                  + Hora
                </button>
              )}
            </div>
          </div>
        )}

        {/* Editable Salon Location, Hours & Phone Strip inside Booking Card */}
        <div className="booking-contact-mini-strip">
          <span>
            <MapPin size={11} />{' '}
            <EditableText
              value={operations.address || 'Dirección (Editable)'}
              onSave={(val) => updateOperationsField('address', val)}
            />
          </span>
          <span>
            <Clock size={11} />{' '}
            <EditableText
              value={operations.businessHoursText || 'Horarios (Editable)'}
              onSave={(val) => updateOperationsField('businessHoursText', val)}
            />
          </span>
          <span>
            <Phone size={11} />{' '}
            <EditableText
              value={operations.phoneDisplay || operations.whatsappNumber || 'Teléfono'}
              onSave={(val) => updateOperationsField('phoneDisplay', val)}
            />
          </span>
        </div>

        {/* Primary Lilac/Rose Pill CTA Button */}
        <button
          type="button"
          className="booking-pay-pill-btn"
          onClick={() => setShowCheckoutModal(true)}
        >
          <span>
            <EditableText
              value={branding.bookingConfirmButtonPrefix || 'Confirmar Turno • Seña'}
              onSave={(val) => updateBrandingField('bookingConfirmButtonPrefix', val)}
            />{' '}
            {pricingSummary.depositPct}% ({currency}
            {pricingSummary.depositAmount.toLocaleString('es-AR')})
          </span>
        </button>

        {/* Deposit Legal Note Underneath */}
        <EditableText
          value={branding.depositLegalNote}
          onSave={(val) => updateBrandingField('depositLegalNote', val)}
          tag="p"
          className="booking-deposit-footnote"
          multiline
        />
      </div>

      {/* Instant Deposit & WhatsApp Confirmation Drawer */}
      {showCheckoutModal && (
        <div className="checkout-drawer-backdrop" onClick={() => setShowCheckoutModal(false)}>
          <div
            className="checkout-drawer-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="checkout-drawer-header">
              <h4>Confirmar Reserva — {branding.businessName}</h4>
              <button
                type="button"
                className="drawer-close-btn"
                onClick={() => setShowCheckoutModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="checkout-summary-banner">
              <div>
                <strong>{selectedService.name}</strong> ({selectedNailShape})
                <div className="checkout-summary-sub">
                  {selectedDateLabel} • {computedTimeRange} hs • {selectedSpecialist.name}
                </div>
                <div className="checkout-summary-sub">
                  📍 {operations.address} • 📞 {operations.phoneDisplay || operations.whatsappNumber}
                </div>
              </div>
              <div className="checkout-price-box">
                <span>Total: {currency}{pricingSummary.finalTotal.toLocaleString('es-AR')}</span>
                <strong>
                  Seña ({pricingSummary.depositPct}%): {currency}
                  {pricingSummary.depositAmount.toLocaleString('es-AR')}
                </strong>
              </div>
            </div>

            {/* Alias Copy Card */}
            <div className="alias-copy-box">
              <div>
                <div className="alias-label">
                  Transferí la seña a ({operations.paymentBankName}):
                </div>
                <div className="alias-value">
                  <EditableText
                    value={operations.paymentAlias}
                    onSave={(val) => updateOperationsField('paymentAlias', val)}
                  />
                </div>
                <div className="alias-holder">
                  Titular:{' '}
                  <EditableText
                    value={operations.paymentHolder}
                    onSave={(val) => updateOperationsField('paymentHolder', val)}
                  />
                </div>
              </div>
              <button
                type="button"
                className="alias-copy-btn"
                onClick={handleCopyAlias}
              >
                {copiedAlias ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedAlias ? 'Copiado' : 'Copiar Alias'}</span>
              </button>
            </div>

            <div className="checkout-form-fields">
              <label>
                Tu Nombre
                <input
                  type="text"
                  value={clientNameInput}
                  onChange={(e) => setClientNameInput(e.target.value)}
                  placeholder="Ingresá tu nombre"
                />
              </label>
              <label>
                Tu Teléfono / WhatsApp
                <input
                  type="tel"
                  value={clientPhoneInput}
                  onChange={(e) => setClientPhoneInput(e.target.value)}
                  placeholder="Ingresá tu teléfono"
                />
              </label>
              <label>
                Observaciones para el turno (opcional)
                <input
                  type="text"
                  value={clientNotesInput}
                  onChange={(e) => setClientNotesInput(e.target.value)}
                  placeholder="Detalle adicional sobre el trabajo deseado"
                />
              </label>
            </div>

            <div className="checkout-drawer-actions">
              <button
                type="button"
                className="confirm-whatsapp-btn"
                onClick={() => handleFinalConfirm(true)}
              >
                <CheckCircle2 size={16} />
                <span>Guardar Turno y Enviar por WhatsApp</span>
              </button>
              <button
                type="button"
                className="confirm-local-only-btn"
                onClick={() => handleFinalConfirm(false)}
              >
                <Sparkles size={14} />
                <span>Solo guardar en la Agenda de la App</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
