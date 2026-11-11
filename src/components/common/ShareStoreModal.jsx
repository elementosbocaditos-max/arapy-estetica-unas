import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Share2,
  ExternalLink,
  QrCode,
  MessageCircle,
  Building2,
  ShieldCheck,
  Download
} from 'lucide-react';
import { useSaaS } from '../../context/SaaSContext';

export default function ShareStoreModal() {
  const {
    activeSlug,
    tenantDb,
    activeModal,
    setActiveModal,
    showToast
  } = useSaaS();

  const [copiedClient, setCopiedClient] = useState(false);
  const [copiedOwner, setCopiedOwner] = useState(false);
  const [showQr, setShowQr] = useState(false);

  if (activeModal !== 'share') return null;

  const { branding = {} } = tenantDb;
  const businessName = branding.businessName || 'Tu Salón de Belleza';

  // Base URL calculation (production GitHub Pages or local)
  const origin = window.location.origin;
  const pathname = window.location.pathname;
  const cleanBase = `${origin}${pathname}`.replace(/\/+$/, '');
  
  // Public client link with active salon slug
  const clientShareUrl = `${cleanBase}?salon=${activeSlug}`;
  // Owner administrative direct link
  const ownerDirectUrl = `${cleanBase}?salon=${activeSlug}&panel=owner`;

  const handleCopyClientLink = () => {
    navigator.clipboard?.writeText(clientShareUrl);
    setCopiedClient(true);
    showToast('📋 ¡Link para clientas copiado al portapapeles!');
    setTimeout(() => setCopiedClient(false), 2400);
  };

  const handleCopyOwnerLink = () => {
    navigator.clipboard?.writeText(ownerDirectUrl);
    setCopiedOwner(true);
    showToast('🔐 ¡Link de administración copiado al portapapeles!');
    setTimeout(() => setCopiedOwner(false), 2400);
  };

  const handleShareWhatsapp = () => {
    const text = `¡Hola! 💅 Te invito a ver nuestro catálogo de uñas y servicios, elegir tus diseños y agendar tu turno online en ${businessName}: ${clientShareUrl}`;
    const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  // QR Code URL using QRServer API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&margin=10&data=${encodeURIComponent(
    clientShareUrl
  )}`;

  return (
    <div className="modal-backdrop" onClick={() => setActiveModal('none')}>
      <div
        className="admin-modal-window share-store-modal-window"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="admin-modal-header share-modal-header">
          <div className="share-header-title-box">
            <span className="share-pill-badge">
              <Share2 size={13} />
              <span>LINK PÚBLICO PARA CLIENTAS</span>
            </span>
            <h2>Compartir Tienda: {businessName}</h2>
            <p className="share-modal-sub">
              Enviá este link a tus clientas por WhatsApp, Instagram o poné el código QR en el
              mostrador de tu local para que agenden turnos directamente.
            </p>
          </div>
          <button
            type="button"
            className="modal-close-icon-btn"
            onClick={() => setActiveModal('none')}
          >
            <X size={20} />
          </button>
        </div>

        <div className="admin-tab-content share-modal-body">
          {/* Main Card: Client Share Link */}
          <div className="share-primary-card">
            <div className="share-card-header">
              <div className="share-card-icon-box">
                <Building2 size={20} />
              </div>
              <div>
                <span className="share-card-tag">LINK PÚBLICO OFICIAL</span>
                <h3>{businessName}</h3>
                <span className="share-slug-tag">ID: {activeSlug}</span>
              </div>
            </div>

            <div className="share-url-input-group">
              <input
                type="text"
                readOnly
                value={clientShareUrl}
                className="share-url-field"
                onClick={(e) => e.target.select()}
              />
              <button
                type="button"
                className={`share-copy-btn ${copiedClient ? 'copied' : ''}`}
                onClick={handleCopyClientLink}
              >
                {copiedClient ? <Check size={16} /> : <Copy size={16} />}
                <span>{copiedClient ? '¡Copiado!' : 'Copiar Link'}</span>
              </button>
            </div>

            <div className="share-quick-actions-row">
              <button
                type="button"
                className="share-whatsapp-btn"
                onClick={handleShareWhatsapp}
              >
                <MessageCircle size={17} />
                <span>Enviar por WhatsApp a Clientas</span>
              </button>

              <button
                type="button"
                className={`share-qr-toggle-btn ${showQr ? 'active' : ''}`}
                onClick={() => setShowQr((p) => !p)}
              >
                <QrCode size={16} />
                <span>{showQr ? 'Ocultar Código QR' : 'Ver Código QR para Local'}</span>
              </button>

              <a
                href={clientShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="share-open-btn"
              >
                <ExternalLink size={15} />
                <span>Abrir Tienda</span>
              </a>
            </div>

            {/* QR Code Section for Printing in Store */}
            {showQr && (
              <div className="share-qr-container">
                <div className="qr-image-wrapper">
                  <img
                    src={qrCodeUrl}
                    alt={`Código QR para ${businessName}`}
                    className="share-qr-img"
                  />
                </div>
                <div className="qr-explanation">
                  <h4>📱 Código QR para Imprimir</h4>
                  <p>
                    Guardá o imprimí este código QR para colocarlo en la recepción, mostrador o
                    vidriera de tu salón. Tus clientas lo escanean con su celular y entran directo a
                    tu app.
                  </p>
                  <a
                    href={qrCodeUrl}
                    download={`QR-${activeSlug}.png`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="qr-download-btn"
                  >
                    <Download size={15} />
                    <span>Descargar Imagen QR</span>
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Secondary Card: Owner Direct Access Link */}
          <div className="share-secondary-card">
            <div className="owner-access-top">
              <ShieldCheck size={18} />
              <div>
                <h4>🔐 Link de Acceso Directo al Panel del Dueño</h4>
                <p>
                  Guardate este link en favoritos de tu celular o computadora para entrar directo al
                  panel de administración de esta tienda sin pasar por la vista de clienta.
                </p>
              </div>
            </div>

            <div className="share-url-input-group small">
              <input
                type="text"
                readOnly
                value={ownerDirectUrl}
                className="share-url-field"
                onClick={(e) => e.target.select()}
              />
              <button
                type="button"
                className={`share-copy-btn ${copiedOwner ? 'copied' : ''}`}
                onClick={handleCopyOwnerLink}
              >
                {copiedOwner ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedOwner ? '¡Copiado!' : 'Copiar Acceso'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
