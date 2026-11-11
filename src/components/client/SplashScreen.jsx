import React from 'react';
import {
  ChevronRight,
  ChevronDown,
  Sparkles,
  MapPin,
  Phone,
  Clock,
  Share2,
  Menu
} from 'lucide-react';
import { useSaaS } from '../../context/SaaSContext';
import EditableMedia from '../common/EditableMedia';
import EditableText from '../common/EditableText';

export default function SplashScreen({ onNavigate }) {
  const {
    tenantDb,
    updateBrandingField,
    updateOperationsField,
    setActiveScreen,
    setActiveModal
  } = useSaaS();
  const { branding = {}, operations = {} } = tenantDb;

  const goNext = (target) => {
    if (onNavigate) onNavigate(target);
    else setActiveScreen(target);
  };

  return (
    <div className="phone-screen splash-screen">
      {/* Hero Portrait Image (100% Editable by Salon Owner) */}
      <div className="splash-hero-container">
        <EditableMedia
          src={branding.splashHeroImage}
          alt={branding.businessName}
          className="splash-hero-media"
          label="portada-splash"
          badgePosition="top-left"
          onChangeUrl={(url) => updateBrandingField('splashHeroImage', url)}
        >
          <div className="splash-gradient-overlay" />
        </EditableMedia>

        {/* Top Native App Bar: Salon Brand Pill + Share + Menu + AI */}
        <div className="splash-top-brand-row">
          <div className="splash-brand-pill">
            {branding.logoUrl ? (
              <img src={branding.logoUrl} alt="logo" className="splash-mini-logo" />
            ) : (
              <span className="splash-Initials">
                <EditableText
                  value={branding.logoText || 'TS'}
                  onSave={(val) => updateBrandingField('logoText', val)}
                />
              </span>
            )}
            <EditableText
              value={branding.businessName}
              onSave={(val) => updateBrandingField('businessName', val)}
              className="splash-brand-name"
            />
          </div>

          <div className="splash-top-actions">
            <button
              type="button"
              className="splash-action-icon-btn"
              onClick={() => setActiveModal('share')}
              title="Compartir link de la tienda"
            >
              <Share2 size={15} />
            </button>
            <button
              type="button"
              className="splash-ai-pill-btn"
              onClick={() => setActiveModal('ai')}
              title="Consultar a la Asesora IA"
            >
              <Sparkles size={13} />
              <EditableText
                value={branding.aiButtonLabel || 'Asesora IA'}
                onSave={(val) => updateBrandingField('aiButtonLabel', val)}
              />
            </button>
            <button
              type="button"
              className="splash-action-icon-btn menu"
              onClick={() => setActiveModal('drawer')}
              title="Abrir menú de administración"
            >
              <Menu size={16} />
            </button>
          </div>
        </div>

        {/* Bottom Editorial Copy, Editable Business Info & Dusty Rose CTA */}
        <div className="splash-bottom-content">
          <h1 className="splash-headline">
            <EditableText
              value={branding.splashTitleLine1}
              onSave={(val) => updateBrandingField('splashTitleLine1', val)}
              tag="span"
              className="splash-line-1"
            />
            <br />
            <EditableText
              value={branding.splashTitleLine2Prefix}
              onSave={(val) => updateBrandingField('splashTitleLine2Prefix', val)}
              tag="span"
            />
            <EditableText
              value={branding.splashTitleHighlight}
              onSave={(val) => updateBrandingField('splashTitleHighlight', val)}
              tag="span"
              className="splash-highlight-rose"
            />
          </h1>

          <EditableText
            value={branding.splashSubtitle}
            onSave={(val) => updateBrandingField('splashSubtitle', val)}
            tag="p"
            className="splash-subtitle"
            multiline
          />

          {/* Editable Business Location, Hours & Phone Strip */}
          <div className="splash-info-strip">
            <div className="splash-info-item">
              <MapPin size={11} />
              <EditableText
                value={operations.address || 'Dirección (Editable)'}
                onSave={(val) => updateOperationsField('address', val)}
              />
            </div>
            <div className="splash-info-item">
              <Clock size={11} />
              <EditableText
                value={operations.businessHoursText || 'Horarios (Editable)'}
                onSave={(val) => updateOperationsField('businessHoursText', val)}
              />
            </div>
            <div className="splash-info-item">
              <Phone size={11} />
              <EditableText
                value={operations.phoneDisplay || operations.whatsappNumber || 'Teléfono (Editable)'}
                onSave={(val) => updateOperationsField('phoneDisplay', val)}
              />
            </div>
          </div>

          {/* Full-width Dusty Rose Pill Button with Circular Right Arrow */}
          <button
            type="button"
            className="splash-book-cta-btn"
            onClick={() => goNext('booking')}
          >
            <span className="splash-cta-label">
              <EditableText
                value={branding.splashPrimaryButton}
                onSave={(val) => updateBrandingField('splashPrimaryButton', val)}
              />
            </span>
            <span className="splash-cta-arrow-circle">
              <ChevronRight size={18} strokeWidth={2.5} />
            </span>
          </button>

          {/* Explore Services Secondary Action */}
          <button
            type="button"
            className="splash-explore-link"
            onClick={() => goNext('home')}
          >
            <EditableText
              value={branding.splashSecondaryButton}
              onSave={(val) => updateBrandingField('splashSecondaryButton', val)}
            />
            <ChevronDown size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
