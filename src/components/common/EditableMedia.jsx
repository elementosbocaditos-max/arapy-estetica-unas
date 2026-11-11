import React, { useRef, useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { useSaaS } from '../../context/SaaSContext';

export default function EditableMedia({
  src,
  alt = '',
  className = '',
  style = {},
  onChangeUrl,
  label = 'foto',
  badgePosition = 'top-right',
  children
}) {
  const { liveEditMode, uploadAndSaveImage } = useSaaS();
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !onChangeUrl) return;
    setUploading(true);
    try {
      const uploadedUrl = await uploadAndSaveImage(file, label);
      if (uploadedUrl) {
        onChangeUrl(uploadedUrl);
      }
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className={`editable-media-wrap ${className}`} style={{ position: 'relative', ...style }}>
      <img
        src={src}
        alt={alt}
        className="editable-media-img"
        onError={(e) => {
          e.currentTarget.src = '/assets/studio-nails.jpg';
        }}
      />
      {children}
      {liveEditMode && onChangeUrl && (
        <>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <button
            type="button"
            className={`live-edit-photo-btn pos-${badgePosition}`}
            onClick={(e) => {
              e.stopPropagation();
              fileRef.current?.click();
            }}
            title="Subir tu propia foto desde el celular o PC (Se guarda en disco)"
          >
            {uploading ? <Loader2 size={13} className="spin-icon" /> : <Camera size={13} />}
            <span>{uploading ? 'Guardando...' : 'Cambiar Foto'}</span>
          </button>
        </>
      )}
    </div>
  );
}
