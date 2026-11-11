import React, { useRef, useState } from 'react';
import {
  ChevronLeft,
  MessageCircle,
  Heart,
  Check,
  Plus,
  Upload,
  Trash2,
  Sparkles,
  UserPlus,
  UserMinus
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

  const {
    branding = {},
    categories = [],
    specialists = [],
    inspoGallery = []
  } = tenantDb;
  const [filterTab, setFilterTab] = useState('all');
  const [uploadingClientPhoto, setUploadingClientPhoto] = useState(false);
  const clientFileRef = useRef(null);

  const goScreen = (scr) => {
    if (onNavigate) onNavigate(scr);
    else setActiveScreen(scr);
  };

  const filteredGallery = inspoGallery.filter((item) => {
    if (filterTab === 'favs') return likedInspoIds.includes(item.id);
    if (filterTab === 'all') return true;
    return item.category === filterTab;
  });

  const handleUpdateSpecialistField = (specId, field, value) => {
    persistTenantUpdate((prev) => ({
      ...prev,
      specialists: prev.specialists.map((s) =>
        s.id === specId ? { ...s, [field]: value } : s
      )
    }));
  };

  const handleAddCollaboratorInline = () => {
    const newId = `spec-${Date.now()}`;
    const newCollab = {
      id: newId,
      name: 'Nuevo/a Colaborador/a (Editable)',
      role: 'Especialidad (Editable)',
      studioCode: branding.studioSubCode || 'Sucursal Principal',
      avatar: './assets/stylist-main.jpg',
      rating: '5.0',
      specialties: categories.map((c) => c.id),
      verified: true
    };
    persistTenantUpdate((prev) => ({
      ...prev,
      specialists: [...(prev.specialists || []), newCollab]
    }));
    setSelectedSpecialistId(newId);
    showToast('➕ Colaborador/a agregado/a. Tocá su foto o nombre para editar.');
  };

  const handleRemoveCollaboratorInline = (specId) => {
    persistTenantUpdate((prev) => {
      const next = (prev.specialists || []).filter((s) => s.id !== specId);
      if (next.length > 0 && selectedSpecialistId === specId) {
        setSelectedSpecialistId(next[0].id);
      }
      return {
        ...prev,
        specialists: next
      };
    });
    showToast('🗑️ Colaborador/a quitado/a del equipo');
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
        const defaultCat =
          filterTab !== 'all' && filterTab !== 'favs'
            ? filterTab
            : categories[0]?.id || 'general';
        const newItem = {
          id: `inspo-${Date.now()}`,
          title: 'Diseño Personalizado (Editable)',
          category: defaultCat,
          nailShape: 'A elección',
          likes: 1,
          image: url,
          linkedServiceId: tenantDb.services?.[0]?.id || 'default'
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
    showToast(`👩‍🎨 Colaborador/a: ${nextSpec.name}`);
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
        {/* Top Back Button & Upload Photo Button */}
        <div className="inspo-top-bar">
          <button
            type="button"
            className="inspo-circle-icon-btn"
            onClick={() => goScreen('home')}
          >
            <ChevronLeft size={19} />
          </button>

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
            <EditableText
              value={
                uploadingClientPhoto
                  ? 'Subiendo...'
                  : branding.inspoUploadButtonLabel || 'Subir Foto Propia'
              }
              onSave={(val) => updateBrandingField('inspoUploadButtonLabel', val)}
            />
          </button>
        </div>

        {/* Title Row ("Add inspo" + Chat AI + Heart Icons) */}
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
              title="Abrir Asesora IA"
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

        {/* Dynamic Unlimited Category Outlined Pill Tabs */}
        <div className="inspo-outlined-tabs">
          <button
            type="button"
            className={`inspo-pill-tab ${filterTab === 'all' ? 'active' : ''}`}
            onClick={() => setFilterTab('all')}
          >
            <EditableText
              value={branding.inspoExploreTabLabel || 'Explorar Todo'}
              onSave={(val) => updateBrandingField('inspoExploreTabLabel', val)}
            />
          </button>
          <button
            type="button"
            className="inspo-pill-tab"
            onClick={() => goScreen('booking')}
          >
            <EditableText
              value={branding.inspoBookNowButtonLabel || 'Book now'}
              onSave={(val) => updateBrandingField('inspoBookNowButtonLabel', val)}
            />{' '}
            ({addedInspoIds.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`inspo-pill-tab ${filterTab === cat.id ? 'active' : ''}`}
              onClick={() => setFilterTab(cat.id)}
            >
              {cat.icon} {cat.shortLabel || cat.name}
            </button>
          ))}
        </div>

        {/* 2-Column Bento Grid (Card 1 = Collaborator Selector Card, Rest = Selectable Inspo Photos) */}
        <div className="inspo-bento-grid">
          {/* Card 1: Featured Collaborator Card in Lilac/Accent */}
          <div className="inspo-specialist-card">
            {specialists.length > 0 ? (
              <>
                <div
                  className="spec-avatar-ring"
                  onClick={cycleSpecialist}
                  title="Tocá para cambiar de colaborador/a"
                >
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
                    Cambiar colaborador/a ({specialists.length}) ↻
                  </button>
                )}

                {liveEditMode && (
                  <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
                    <button
                      type="button"
                      className="spec-switch-mini"
                      onClick={handleAddCollaboratorInline}
                      title="Agregar otro/a colaborador/a"
                    >
                      <UserPlus size={11} /> + Sumar
                    </button>
                    <button
                      type="button"
                      className="spec-switch-mini"
                      onClick={() => handleRemoveCollaboratorInline(selectedSpecialist.id)}
                      title="Quitar este/a colaborador/a"
                    >
                      <UserMinus size={11} /> Quitar
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '12px 4px' }}>
                <p style={{ fontSize: 11, marginBottom: 8 }}>Sin colaboradores asignados</p>
                <button
                  type="button"
                  className="spec-switch-mini"
                  onClick={handleAddCollaboratorInline}
                >
                  <Plus size={11} /> + Poner Colaborador/a
                </button>
              </div>
            )}

            <button
              type="button"
              className="spec-dark-book-btn"
              onClick={() => goScreen('booking')}
            >
              <EditableText
                value={branding.inspoBookNowButtonLabel || 'Book now'}
                onSave={(val) => updateBrandingField('inspoBookNowButtonLabel', val)}
              />
            </button>
          </div>

          {/* Remaining Cards: Unlimited Nail & Hair Inspo Photos */}
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
                          title="Borrar esta foto"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>

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
            ({addedInspoIds.length}){' '}
            <EditableText
              value={branding.inspoConfirmFooterLabel || 'Usar diseños elegidos en mi Turno →'}
              onSave={(val) => updateBrandingField('inspoConfirmFooterLabel', val)}
            />
          </span>
        </button>
      </div>
    </div>
  );
}
