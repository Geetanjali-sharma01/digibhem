import React, { useState } from 'react';

export function Btn({ children, variant = 'primary', onClick, disabled, style, type = 'button', small, tiny }) {
  const styles = {
    primary: { background: 'var(--gradient-primary)', color: '#ffffff', fontWeight: 600, boxShadow: '0 4px 12px rgba(14,165,233,0.3)' },
    outline:  { background: 'transparent', color: 'var(--teal)', border: '2px solid var(--teal)', fontWeight: 500 },
    danger:   { background: 'var(--danger)', color: '#fff', fontWeight: 600 },
    success:  { background: 'var(--gradient-success)', color: '#fff', fontWeight: 600, boxShadow: '0 4px 12px rgba(16,185,129,0.3)' },
    ghost:    { background: 'rgba(255,255,255,0.07)', color: 'var(--white)', fontWeight: 500 },
    gold:     { background: 'var(--gradient-gold)', color: 'var(--navy)', fontWeight: 600, boxShadow: '0 4px 12px rgba(251,191,36,0.3)' },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{
      padding: tiny ? '4px 8px' : small ? '6px 14px' : '10px 20px',
      borderRadius: tiny ? 6 : 10, fontSize: tiny ? 11 : small ? 12 : 14, border: 'none',
      opacity: disabled ? 0.45 : 1, cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'all 0.2s ease', display: 'inline-flex', alignItems: 'center', gap: 6,
      ...styles[variant], ...style,
    }}
      onMouseEnter={e => { if (!disabled) { e.currentTarget.style.transform = tiny ? 'none' : 'translateY(-1px)'; e.currentTarget.style.filter = 'brightness(1.1)'; } }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.filter = 'none'; }}
    >{children}</button>
  );
}

export function Input({ label, error, textarea, ...props }) {
  const base = {
    width: '100%', padding: '10px 13px',
    background: 'var(--surface)',
    border: `1.5px solid ${error ? 'var(--danger)' : 'var(--surface-border)'}`,
    borderRadius: 9, color: 'var(--white)', fontSize: 14,
  };
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label style={{ display: 'block', fontSize: 12, color: 'var(--text-light)', marginBottom: 5, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</label>}
      {textarea
        ? <textarea {...props} rows={3} style={{ ...base, resize: 'vertical', ...props.style }}
            onFocus={e => e.target.style.borderColor = 'var(--teal)'}
            onBlur={e => e.target.style.borderColor = error ? 'var(--danger)' : 'var(--surface-border)'} />
        : <input {...props} style={{ ...base, ...props.style }}
            onFocus={e => e.target.style.borderColor = 'var(--teal)'}
            onBlur={e => e.target.style.borderColor = error ? 'var(--danger)' : 'var(--surface-border)'} />
      }
      {error && <p style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4 }}>{error}</p>}
    </div>
  );
}

export function Card({ children, style, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: 'var(--card-bg)', borderRadius: 'var(--radius)',
      border: '1px solid var(--border)', padding: 22,
      cursor: onClick ? 'pointer' : 'default',
      boxShadow: 'var(--shadow-sm)',
      backdropFilter: 'blur(10px)',
      ...style,
    }}>{children}</div>
  );
}

export function Avatar({ name, size = 44, photo }) {
  const initials = name?.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';
  const palette = ['#0ea5e9','#fbbf24','#ef4444','#8b5cf6','#10b981','#f97316','#06b6d4'];
  const color = palette[(name?.charCodeAt(0) || 0) % palette.length];
  
  if (photo) {
    return (
      <div style={{ width: size, height: size, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: `3px solid ${color}`, boxShadow: `0 4px 12px ${color}40`, transition: 'all 0.2s ease' }}>
        <img 
          src={photo} 
          alt={name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentElement.innerHTML = `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color}22;border:3px solid ${color};display:flex;align-items:center;justify-content:center;font-size:${size * 0.34}px;font-weight:700;color:${color}">${initials}</div>`;
          }}
        />
      </div>
    );
  }
  
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: `${color}22`, border: `3px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.34, fontWeight: 700, color, flexShrink: 0, boxShadow: `0 4px 12px ${color}30` }}>{initials}</div>
  );
}

export function StatusBadge({ status }) {
  const map = {
    pending:   { bg: 'rgba(245,197,66,0.15)',  color: '#f5c542',        label: '⏳ Pending' },
    accepted:  { bg: 'rgba(46,184,126,0.15)',  color: 'var(--success)', label: '✓ Accepted' },
    rejected:  { bg: 'rgba(224,92,92,0.15)',   color: 'var(--danger)',  label: '✕ Rejected' },
    completed: { bg: 'rgba(76,179,244,0.15)',  color: '#4ab3f4',        label: '✔ Completed' },
    cancelled: { bg: 'rgba(150,150,150,0.15)', color: '#888',           label: '— Cancelled' },
  };
  const s = map[status] || map.pending;
  return <span style={{ padding: '4px 11px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: s.bg, color: s.color, whiteSpace: 'nowrap' }}>{s.label}</span>;
}

export function Modal({ isOpen, onClose, title, children, wide }) {
  if (!isOpen) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
      <div style={{ 
        background: 'var(--card-bg-solid)', 
        borderRadius: 18, 
        border: '1px solid var(--border)', 
        padding: 30, 
        width: '100%', 
        maxWidth: wide ? 620 : 460, 
        boxShadow: 'var(--shadow)', 
        animation: 'fadeIn 0.2s ease', 
        maxHeight: '90vh', 
        overflowY: 'auto',
        color: 'var(--text-primary)'
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <h3 style={{ fontSize: 19, color: 'var(--text-primary)' }}>{title}</h3>
          <button onClick={onClose} style={{ 
            background: 'var(--surface)', 
            border: '1px solid var(--surface-border)', 
            color: 'var(--text-light)', 
            fontSize: 18, 
            borderRadius: 6, 
            width: 30, 
            height: 30, 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            transition: 'all 0.2s'
          }}
          onMouseEnter={e => { e.target.style.background = 'var(--danger)'; e.target.style.color = '#fff'; }}
          onMouseLeave={e => { e.target.style.background = 'var(--surface)'; e.target.style.color = 'var(--text-light)'; }}
          >✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Toast({ message, type, onClose }) {
  React.useEffect(() => { const t = setTimeout(onClose, 3200); return () => clearTimeout(t); }, [onClose]);
  const icons = { success: '✓', error: '✕', info: 'ℹ' };
  const colors = { success: 'var(--success)', error: 'var(--danger)', info: 'var(--teal)' };
  return (
    <div style={{ position: 'fixed', bottom: 28, right: 28, zIndex: 9999, background: colors[type] || colors.info, color: '#ffffff', borderRadius: 11, padding: '13px 20px', boxShadow: 'var(--shadow)', fontWeight: 600, fontSize: 14, animation: 'fadeIn 0.3s ease', display: 'flex', alignItems: 'center', gap: 9, maxWidth: 340 }}>
      <span style={{ fontSize: 18 }}>{icons[type]}</span>{message}
    </div>
  );
}

export function StarRating({ value, onChange, size = 26 }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {[1,2,3,4,5].map(n => (
        <span key={n} onClick={() => onChange && onChange(n)} onMouseEnter={() => onChange && setHover(n)} onMouseLeave={() => onChange && setHover(0)}
          style={{ fontSize: size, cursor: onChange ? 'pointer' : 'default', color: n <= (hover || value) ? 'var(--gold)' : 'rgba(148,163,184,0.3)', transition: 'color 0.15s' }}>★</span>
      ))}
    </div>
  );
}

export function Divider({ label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '18px 0' }}>
      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      {label && <span style={{ fontSize: 12, color: 'var(--text-light)', whiteSpace: 'nowrap' }}>{label}</span>}
      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
    </div>
  );
}

export function EmptyState({ icon, title, sub, action }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-light)' }}>
      <div style={{ fontSize: 52, marginBottom: 14 }}>{icon}</div>
      <h3 style={{ fontSize: 18, color: 'var(--text-primary)', marginBottom: 8 }}>{title}</h3>
      {sub && <p style={{ fontSize: 14, marginBottom: 20 }}>{sub}</p>}
      {action}
    </div>
  );
}

export function LoadingSpinner({ size = 40, text = 'Loading...' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, gap: 16 }}>
      <div style={{
        width: size,
        height: size,
        border: '3px solid var(--border)',
        borderTop: `3px solid var(--teal)`,
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }} />
      {text && <p style={{ fontSize: 14, color: 'var(--text-light)' }}>{text}</p>}
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

