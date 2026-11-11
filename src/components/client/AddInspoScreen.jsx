import React, { useRef, useState } from 'react';
import {
  ChevronLeft,
  MessageCircle,
  Heart,
  Check,
  Plus,
  Upload,
  Trash2,
  Sparkles
} from 'lucide-react';
import { useSaaS } from '../../context/SaaSContext';
import EditableMedia from '../common/EditableMedia';
import EditableText from '../common/EditableText';

export default function AddInspoScreen({ onNavigate }) {
  const {
    tenantDb,
    updateBrandingField,
    persistTenantUpdate,
    selectedSpecialist,
    selectedSpecialistId,
    setSelectedSpecialistId,
    addedInspoIds,
    toggleInspoSelection,
    likedInspoIds,
    toggleInspoLike,
    uploadAndSaveImage,
    setClientUploadedInspo,
    liveEditMode,
    setActiveScreen,
    setActiveModal,
    showToast
  } = useSaaS();

  const { branding, specialists = [], inspoGallery = [] } = tenantDb;
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'unas' | 'pelo' | 'favs'
  const [uploadingClientPhoto, setUploadingClientPhoto] = useState(false);
  const clientFileRef = useRef(null);

  const goScreen = (scr) => {
    if (onNavigate) onNavigate(scr);
    else setActiveScreen(scr);
  };

  const filteredGallery = inspoGallery.filter((item) => {
    if (filterTab === 'favs') return likedInspoIds.includes(item.id);
    if (filterTab === 'unas' || filterTab === 'pelo') return item.category === filterTab;
    return true;
  });

  const handleUpdateSpecialistField = (specId, field, value) => {
    persistTenantUpdate((prev) => ({
      ...prev,
      specialists: prev.specialists.map((s) =>
        s.id === specId ? { ...s, [field]: value } : s
      )
    }));
  };

  const handleUpdateInspoField = (inspoId, field, value) => {
    persistTenantUpdate((prev) => ({
      ...prev,
      inspoGallery: prev.inspoGallery.map((item) =>
        item.id === inspoId ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleDeleteInspoItem = (inspoId) => {
    persistTenantUpdate((prev) => ({
      ...prev,
      inspoGallery: prev.inspoGallery.filter((item) => item.id !== inspoId)
    }));
    showToast('🗑️ Foto eliminada de la galería Add Inspo');
  };

  const handleUploadNewInspoPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingClientPhoto(true);
    try {
      const url = await uploadAndSaveImage(file, 'inspo');
      if (url) {
        const newItem = {
          id: `inspo-${Date.now()}`,
          title: 'Diseño Personalizado',
          category: filterTab === 'pelo' ? 'pelo' : 'unas',
          nailShape: 'A elección',
          likes: 1,
          image: url,
          linkedServiceId: tenantDb.services?.[0]?.id || 'srv-manicure-3d'
        };
        await persistTenantUpdate((prev) => ({
          ...prev,
          inspoGallery: [newItem, ...(prev.inspoGallery || [])]
        }));
        setClientUploadedInspo((prev) => [url, ...prev]);
        toggleInspoSelection(newItem.id);
      }
    } finally {
      setUploadingClientPhoto(false);
      if (clientFileRef.current) clientFileRef.current.value = '';
    }
  };

  const cycleSpecialist = () => {
    if (specialists.length <= 1) return;
    const idx = specialists.findIndex((s) => s.id === selectedSpecialistId);
    const nextSpec = specialists[(idx + 1) % specialists.length];
    setSelectedSpecialistId(nextSpec.id);
    showToast(`👩‍🎨 Profesional seleccionada: ${nextSpec.name}`);
  };

  return (
    <div className="phone-screen add-inspo-screen">
      {/* Dark Status Bar */}
      <div className="phone-status-bar dark">
        <span className="status-time">9:41</span>
        <div className="dynamic-island" />
        <div className="status-icons">
          <span>•••</span>
          <span>WiFi</span>
          <span className="battery-pill">99</span>
        </div>
      </div>

      <div className="inspo-scroll-body">
        {/* Top Back Button */}
        <div className="inspo-top-bar">
          <button
            type="button"
            className="inspo-circle-icon-btn"
            onClick={() => goScreen('home')}
          >
            <ChevronLeft size={19} />
          </button>

          {/* Upload Own Photo Button (For both Client & Owner) */}
          <input
            ref={clientFileRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleUploadNewInspoPhoto}
          />
          <button
            type="button"
            className="inspo-upload-pill-btn"
            onClick={() => clientFileRef.current?.click()}
          >
            <Upload size={13} />
            <span>{uploadingClientPhoto ? 'Subiendo...' : 'Subir Foto Propia'}</span>
          </button>
        </div>

        {/* Title Row ("Add inspo" + Chat AI + Heart Icons — Exact match to Reference 1 Right) */}
        <div className="inspo-title-row">
          <div>
            <EditableText
              value={branding.inspoHeaderTitle}
              onSave={(val) => updateBrandingField('inspoHeaderTitle', val)}
              tag="h2"
              className="inspo-main-title"
            />
            <EditableText
              value={branding.inspoHeaderSubtitle}
              onSave={(val) => updateBrandingField('inspoHeaderSubtitle', val)}
              tag="p"
              className="inspo-main-subtitle"
            />
          </div>

          <div className="inspo-top-actions">
            <button
              type="button"
              className="inspo-circle-icon-btn"
              onClick={() => setActiveModal('ai')}
              title="Abrir Asesora IA de Uñas y Pelo"
            >
              <MessageCircle size={17} />
            </button>
            <button
              type="button"
              className={`inspo-circle-icon-btn ${filterTab === 'favs' ? 'active-heart' : ''}`}
              onClick={() => setFilterTab((prev) => (prev === 'favs' ? 'all' : 'favs'))}
              title="Ver mis diseños favoritos"
            >
              <Heart size={17} />
            </button>
          </div>
        </div>

        {/* Outlined Pill Tabs ("Services | book now | Explore") */}
        <div className="inspo-outlined-tabs">
          <button
            type="button"
            className={`inspo-pill-tab ${filterTab === 'all' ? 'active' : ''}`}
            onClick={() => setFilterTab('all')}
          >
            Explorar Todo
          </button>
          <button
            type="button"
            className="inspo-pill-tab"
            onClick={() => goScreen('booking')}
          >
            Book now ({addedInspoIds.length})
          </button>
          <button
            type="button"
            className={`inspo-pill-tab ${filterTab === 'unas' ? 'active' : ''}`}
            onClick={() => setFilterTab('unas')}
          >
            💅 Uñas
          </button>
          <button
            type="button"
            className={`inspo-pill-tab ${filterTab === 'pelo' ? 'active' : ''}`}
            onClick={() => setFilterTab('pelo')}
          >
            ✂️ Pelo
          </button>
          <button
            type="button"
            className="inspo-pill-tab"
            onClick={() => goScreen('services')}
          >
            Servicios
          </button>
        </div>

        {/* 2-Column Bento Grid (First Card = Specialist Lilac Card, Rest = Selectable Inspo Photos) */}
        <div className="inspo-bento-grid">
          {/* Card 1: Featured Specialist Card in Lilac/Accent */}
          <div className="inspo-specialist-card">
            <div className="spec-avatar-ring" onClick={cycleSpecialist} title="Tocá para cambiar de profesional">
              <EditableMedia
                src={selectedSpecialist.avatar}
                alt={selectedSpecialist.name}
                className="spec-circle-avatar"
                label={`spec-${selectedSpecialist.id}`}
                badgePosition="bottom-right"
                onChangeUrl={(url) =>
                  handleUpdateSpecialistField(selectedSpecialist.id, 'avatar', url)
                }
              />
            </div>

            <div className="spec-card-name">
              <EditableText
                value={selectedSpecialist.name}
                onSave={(val) =>
                  handleUpdateSpecialistField(selectedSpecialist.id, 'name', val)
                }
              />
            </div>

            {specialists.length > 1 && (
              <button
                type="button"
                className="spec-switch-mini"
                onClick={cycleSpecialist}
              >
                Cambiar profesional ↻
              </button>
            )}

            <button
              type="button"
              className="spec-dark-book-btn"
              onClick={() => goScreen('booking')}
            >
              Book now
            </button>
          </div>

          {/* Remaining Cards: Nail & Hair Inspo Photos */}
          {filteredGallery.map((item) => {
            const isSelected = addedInspoIds.includes(item.id);
            const isLiked = likedInspoIds.includes(item.id);

            return (
              <div
                key={item.id}
                className={`inspo-photo-card ${isSelected ? 'selected-inspo' : ''}`}
                onClick={() => toggleInspoSelection(item.id)}
              >
                <EditableMedia
                  src={item.image}
                  alt={item.title}
                  className="inspo-grid-media"
                  label={`inspo-${item.id}`}
                  badgePosition="top-left"
                  onChangeUrl={(url) => handleUpdateInspoField(item.id, 'image', url)}
                >
                  <div className="inspo-card-overlay">
                    {/* Top Right Like & Delete Controls */}
                    <div className="inspo-card-top-controls">
                      <button
                        type="button"
                        className={`inspo-like-chip ${isLiked ? 'liked' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleInspoLike(item.id);
                        }}
                      >
                        <Heart size={12} fill={isLiked ? 'currentColor' : 'none'} />
                        <span>{item.likes || 0}</span>
                      </button>

                      {liveEditMode && (
                        <button
                          type="button"
                          className="inspo-delete-chip"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteInspoItem(item.id);
                          }}
                          title="Borrar esta foto de ejemplo"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>

                    {/* Bottom Label & "+ Added Inspo" Toggle */}
                    <div className="inspo-card-bottom-bar">
                      <span className="inspo-card-caption">
                        <EditableText
                          value={item.title}
                          onSave={(val) => handleUpdateInspoField(item.id, 'title', val)}
                        />
                      </span>
                      <span className={`inspo-select-badge ${isSelected ? 'active' : ''}`}>
                        {isSelected ? <Check size={12} /> : <Plus size={12} />}
                      </span>
                    </div>
                  </div>
                </EditableMedia>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Bottom Bar to Proceed to Booking Sheet with Selected Inspo */}
      <div className="inspo-floating-footer">
        <button
          type="button"
          className="inspo-confirm-selection-btn"
          onClick={() => goScreen('booking')}
        >
          <Sparkles size={15} />
          <span>
            Usar {addedInspoIds.length} diseño(s) en mi Turno →
          </span>
        </button>
      </div>
    </div>
  );
}
