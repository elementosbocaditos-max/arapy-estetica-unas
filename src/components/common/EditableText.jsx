import React, { useState } from 'react';
import { Pencil, Check, X } from 'lucide-react';
import { useSaaS } from '../../context/SaaSContext';

export default function EditableText({
  value,
  onSave,
  tag: Tag = 'span',
  className = '',
  style = {},
  multiline = false
}) {
  const { liveEditMode } = useSaaS();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || '');

  if (!liveEditMode || !onSave) {
    return (
      <Tag className={className} style={style}>
        {value}
      </Tag>
    );
  }

  if (editing) {
    return (
      <span
        className="live-edit-inline-box"
        onClick={(e) => e.stopPropagation()}
      >
        {multiline ? (
          <textarea
            className="live-edit-input"
            value={draft}
            rows={2}
            onChange={(e) => setDraft(e.target.value)}
            autoFocus
          />
        ) : (
          <input
            type="text"
            className="live-edit-input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            autoFocus
          />
        )}
        <button
          type="button"
          className="live-edit-action save"
          onClick={(e) => {
            e.stopPropagation();
            onSave(draft);
            setEditing(false);
          }}
          title="Guardar en Base de Datos"
        >
          <Check size={13} />
        </button>
        <button
          type="button"
          className="live-edit-action cancel"
          onClick={(e) => {
            e.stopPropagation();
            setDraft(value || '');
            setEditing(false);
          }}
          title="Cancelar"
        >
          <X size={13} />
        </button>
      </span>
    );
  }

  return (
    <Tag
      className={`${className} live-editable-text`}
      style={style}
      onClick={(e) => {
        e.stopPropagation();
        setDraft(value || '');
        setEditing(true);
      }}
      title="Clic para editar este texto"
    >
      {value}
      <span className="live-edit-pencil-pill">
        <Pencil size={11} />
      </span>
    </Tag>
  );
}
