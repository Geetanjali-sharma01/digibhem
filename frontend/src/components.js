import React, { useState } from 'react';

const BTN_VARIANTS = {
  primary: 'btn--primary',
  outline: 'btn--outline',
  danger: 'btn--danger',
  success: 'btn--success',
  ghost: 'btn--ghost',
  gold: 'btn--gold',
};

export function Btn({ children, variant = 'primary', onClick, disabled, className = '', style, type = 'button', small, tiny }) {
  const sizeClass = tiny ? 'btn--xs' : small ? 'btn--sm' : '';
  const variantClass = BTN_VARIANTS[variant] || BTN_VARIANTS.primary;
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn ${variantClass} ${sizeClass} ${className}`.trim()}
      style={style}
    >
      {children}
    </button>
  );
}

export function Input({ label, error, textarea, className = '', ...props }) {
  const fieldClass = `input-field ${error ? 'input-field--error' : ''} ${className}`.trim();
  return (
    <div className="input-group">
      {label && <label className="text-label">{label}</label>}
      {textarea
        ? <textarea {...props} rows={3} className={fieldClass} style={{ resize: 'vertical', ...props.style }} />
        : <input {...props} className={fieldClass} />
      }
      {error && <p className="input-error">{error}</p>}
    </div>
  );
}

export function Card({ children, className = '', onClick, surface, danger, style }) {
  const classes = [
    'card',
    onClick && 'card--clickable',
    surface && 'card--surface',
    danger && 'card--danger',
    className,
  ].filter(Boolean).join(' ');
  return (
    <div onClick={onClick} className={classes} style={style}>{children}</div>
  );
}

const AVATAR_COLORS = ['primary', 'warning', 'danger', 'accent', 'success', 'accent', 'primary'];

export function Avatar({ name, size = 44, photo }) {
  const initials = name?.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';
  const colorKey = AVATAR_COLORS[(name?.charCodeAt(0) || 0) % AVATAR_COLORS.length];
  const style = { width: size, height: size, fontSize: size * 0.34, border: `3px solid var(--color-${colorKey})` };

  if (photo) {
    return (
      <div className={`avatar avatar--${colorKey}`} style={{ ...style, overflow: 'hidden' }}>
        <img
          src={photo}
          alt={name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => {
            e.target.style.display = 'none';
            const fallback = document.createElement('div');
            fallback.className = `avatar avatar--${colorKey}`;
            fallback.style.cssText = `width:${size}px;height:${size}px;font-size:${size * 0.34}px`;
            fallback.textContent = initials;
            e.target.parentElement.replaceChildren(fallback);
          }}
        />
      </div>
    );
  }

  return (
    <div className={`avatar avatar--${colorKey}`} style={style}>{initials}</div>
  );
}

const STATUS_BADGE_MAP = {
  pending:   { class: 'badge--pending',   label: '⏳ Pending' },
  accepted:  { class: 'badge--accepted',  label: '✓ Accepted' },
  confirmed: { class: 'badge--confirmed', label: '✓ Confirmed' },
  rejected:  { class: 'badge--rejected',  label: '✕ Rejected' },
  completed: { class: 'badge--completed', label: '✔ Completed' },
  cancelled: { class: 'badge--cancelled', label: '— Cancelled' },
};

export function StatusBadge({ status }) {
  const s = STATUS_BADGE_MAP[status] || STATUS_BADGE_MAP.pending;
  return <span className={`badge ${s.class}`}>{s.label}</span>;
}

export function Modal({ isOpen, onClose, title, children, wide }) {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal ${wide ? 'modal--wide' : ''}`} onClick={e => e.stopPropagation()}>
        <div className="modal__header">
          <h3 className="modal__title">{title}</h3>
          <button onClick={onClose} className="modal__close" aria-label="Close">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Toast({ message, type, onClose }) {
  React.useEffect(() => { const t = setTimeout(onClose, 3200); return () => clearTimeout(t); }, [onClose]);
  const icons = { success: '✓', error: '✕', info: 'ℹ' };
  return (
    <div className={`toast toast--${type || 'info'}`}>
      <span style={{ fontSize: 18 }}>{icons[type] || icons.info}</span>
      {message}
    </div>
  );
}

export function StarRating({ value, onChange, size = 26 }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map(n => (
        <span
          key={n}
          onClick={() => onChange && onChange(n)}
          onMouseEnter={() => onChange && setHover(n)}
          onMouseLeave={() => onChange && setHover(0)}
          className={`star-rating__star ${onChange ? 'star-rating__star--interactive' : ''} ${n <= (hover || value) ? 'star-rating__star--filled' : 'star-rating__star--empty'}`}
          style={{ fontSize: size }}
        >★</span>
      ))}
    </div>
  );
}

export function Divider({ label }) {
  return (
    <div className="divider">
      <div className="divider__line" />
      {label && <span className="text-sm text-muted">{label}</span>}
      <div className="divider__line" />
    </div>
  );
}

export function EmptyState({ icon, title, sub, action }) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">{icon}</div>
      <h3 className="empty-state__title">{title}</h3>
      {sub && <p className="empty-state__sub">{sub}</p>}
      {action}
    </div>
  );
}

export function LoadingSpinner({ size = 40, text = 'Loading...' }) {
  return (
    <div className="spinner-wrap">
      <div className="spinner" style={{ width: size, height: size }} />
      {text && <p className="text-md text-muted">{text}</p>}
    </div>
  );
}
