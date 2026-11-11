import React, { useState } from 'react';
import {
  ChevronLeft,
  Calendar,
  CheckCircle2,
  Copy,
  Check,
  Sparkles,
  Plus,
  ChevronDown
} from 'lucide-react';
import { useSaaS } from '../../context/SaaSContext';
import EditableMedia from '../common/EditableMedia';
import EditableText from '../common/EditableText';

const QUICK_DATE_OPTIONS = [
  'Hoy 11 Nov',
  'Mañana 12 Nov',
  'Jue 13 Nov',
  'Vie 14 Nov',
  'Sáb 15 Nov',
  'Lun 17 Nov'
];

const QUICK_STYLE_SHAPES = [
  'Almendra',
  'Coffin',
  'Squoval',
  'Natural / Corto',
  'Pelo Largo',
  'Pelo Medio'
];

export default function BookingStudioSheet({ onNavigate }) {
  const {
    tenantDb,
    updateBrandingField,
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
    setActiveScreen,
    showToast
  } = useSaaS();

  const { branding, services = [], specialists = [], operations = {} } = tenantDb;
  const currency = operations.currencySymbol || '$';

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showServiceSwitcher, setShowServiceSwitcher] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [clientNameInput, setClientNameInput] = useState(clientProfile.name || 'Mahi');
  const [clientPhoneInput, setClientPhoneInput] = useState(clientProfile.phone || '');
  const [clientNotesInput, setClientNotesInput] = useState('');
  const [copiedAlias, setCopiedAlias] = useState(false);
  const [confirmedApt, setConfirmedApt] = useState(null);

  const goScreen = (scr) => {
    if (onNavigate) onNavigate(scr);
    else setActiveScreen(scr);
  };

  const handleCopyAlias = () => {
    navigator.clipboard?.writeText(operations.paymentAlias || 'DANIELA.STUDIO.MP');
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

  const cycleSpecialist = () => {
    if (specialists.length <= 1) return;
    const idx = specialists.findIndex((s) => s.id === selectedSpecialistId);
    const nextSpec = specialists[(idx + 1) % specialists.length];
    setSelectedSpecialistId(nextSpec.id);
    showToast(`👩‍🎨 Especialista: ${nextSpec.name}`);
  };

  return (
    <div className="phone-screen booking-studio-screen">
      {/* Top Dramatic Editorial Nail/Hair Hero Photo (Exact match to Reference 1 Left) */}
      <div className="booking-hero-top">
        <div className="phone-status-bar dark">
          <span className="status-time">9:41</span>
          <div className="dynamic-island" />
          <div className="status-icons">
            <span>•••</span>
            <span>WiFi</span>
            <span className="battery-pill">99</span>
          </div>
        </div>

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

        <button
          type="button"
          className="booking-glass-back-btn"
          onClick={() => goScreen('home')}
        >
          <ChevronLeft size={19} />
        </button>

        <div className="booking-studio-tracked-title">
          <EditableText
            value={branding.studioBadgeTitle}
            onSave={(val) => updateBrandingField('studioBadgeTitle', val)}
          />
        </div>
      </div>

      {/* Cream Bottom Sheet Card (border-radius: 36px — Exact match to Reference 1 Left) */}
      <div className="booking-cream-sheet">
        {/* Inner Service & Stylist Summary Box */}
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
                {confirmedApt ? `Confirmado #${confirmedApt.code}` : 'Unconfirmed'}
              </span>

              <button
                type="button"
                className="booking-change-srv-btn"
                onClick={() => setShowServiceSwitcher((p) => !p)}
              >
                <span>Cambiar</span>
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
                value={selectedService.addonLabel || '+ mini patterns'}
                onSave={(val) => handleUpdateServiceText('addonLabel', val)}
              />
            </div>

            {/* Stylist Row with Verified Avatar */}
            <div
              className="booking-stylist-row"
              onClick={cycleSpecialist}
              title="Toca para cambiar de especialista"
            >
              <div className="booking-stylist-avatar-wrap">
                <img
                  src={selectedSpecialist.avatar}
                  alt={selectedSpecialist.name}
                  className="booking-stylist-avatar"
                  onError={(e) => {
                    e.currentTarget.src = '/assets/stylist-main.jpg';
                  }}
                />
                <span className="booking-verified-dot">✓</span>
              </div>
              <div className="booking-stylist-meta">
                <div className="booking-stylist-name">
                  Stylist: {selectedSpecialist.name}
                </div>
                <div className="booking-stylist-studio">
                  {selectedSpecialist.studioCode || branding.studioSubCode}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Optional Quick Service Switcher Dropdown (for Uñas or Peluquería) */}
        {showServiceSwitcher && (
          <div className="booking-inline-selector-box">
            <div className="selector-box-label">Elegí Uñas, Peluquería o Combo:</div>
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
                    {Number(srv.price).toLocaleString('es-AR')}
                  </strong>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quick Style / Shape Selector Pill Bar */}
        <div className="booking-shape-strip">
          {QUICK_STYLE_SHAPES.map((shape) => (
            <button
              key={shape}
              type="button"
              className={`shape-mini-pill ${
                selectedNailShape === shape ? 'active' : ''
              }`}
              onClick={() => setSelectedNailShape(shape)}
            >
              {shape}
            </button>
          ))}
        </div>

        {/* Two-Column Metadata Row: "Added inspo" | "Selected date" */}
        <div className="booking-two-col-meta">
          {/* Left Column: Added inspo overlapping circles */}
          <div
            className="booking-meta-col left"
            onClick={() => goScreen('inspo')}
            title="Toca para elegir o subir tus fotos en Add Inspo"
          >
            <div className="meta-col-label">Added inspo</div>
            <div className="added-inspo-avatar-stack">
              {resolvedAddedInspoPhotos.slice(0, 3).map((imgUrl, idx) => (
                <img
                  key={idx}
                  src={imgUrl}
                  alt="inspo"
                  className="stacked-inspo-circle"
                  onError={(e) => {
                    e.currentTarget.src = '/assets/inspo-rose-french.jpg';
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
            title="Toca para elegir día y horario"
          >
            <div className="meta-col-label">
              <Calendar size={13} />
              <span>Selected date</span>
            </div>
            <div className="selected-date-bold">{selectedDateLabel}</div>
            <div className="selected-time-sub">{computedTimeRange}</div>
          </div>
        </div>

        {/* Expandable Interactive Date & Time Picker */}
        {showDatePicker && (
          <div className="booking-inline-date-picker">
            <div className="picker-sub-title">Elegí el Día:</div>
            <div className="picker-pills-row">
              {QUICK_DATE_OPTIONS.map((d) => (
                <button
                  key={d}
                  type="button"
                  className={`picker-pill ${selectedDateLabel === d ? 'active' : ''}`}
                  onClick={() => setSelectedDateLabel(d)}
                >
                  {d}
                </button>
              ))}
            </div>
            <div className="picker-sub-title" style={{ marginTop: 8 }}>
              Elegí el Horario Disponible:
            </div>
            <div className="picker-pills-row">
              {(operations.timeSlots || ['10:00', '12:00', '15:00', '17:00']).map(
                (slot) => (
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
                )
              )}
            </div>
          </div>
        )}

        {/* Primary Lilac/Rose Pill CTA Button ("Pay 48.99$" / Seña 50%) */}
        <button
          type="button"
          className="booking-pay-pill-btn"
          onClick={() => setShowCheckoutModal(true)}
        >
          <span>
            Confirmar • Seña {pricingSummary.depositPct}% ({currency}
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
              <h4>Confirmar tu Turno</h4>
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
                  {selectedDateLabel} • {computedTimeRange} con {selectedSpecialist.name}
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
                <div className="alias-value">{operations.paymentAlias}</div>
                <div className="alias-holder">Titular: {operations.paymentHolder}</div>
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
                  placeholder="Ej: Sofía"
                />
              </label>
              <label>
                Tu WhatsApp
                <input
                  type="tel"
                  value={clientPhoneInput}
                  onChange={(e) => setClientPhoneInput(e.target.value)}
                  placeholder="Ej: 11 5555 1234"
                />
              </label>
              <label>
                Comentario opcional (color, largo, detalle)
                <input
                  type="text"
                  value={clientNotesInput}
                  onChange={(e) => setClientNotesInput(e.target.value)}
                  placeholder="Ej: Quiero tono milky con deco en 2 uñas"
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
