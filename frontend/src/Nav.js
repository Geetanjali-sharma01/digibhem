import React, { useState, useEffect } from 'react';
import { useApp } from './AppContext';
import { Avatar } from './components';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000');

export default function Nav({ page, setPage }) {
  const { user, logout, theme, toggleTheme } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const isDoctor = user?.role === 'doctor';
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (!user) return;
    fetchUnreadCount();

    const handleNotificationsUpdated = () => fetchUnreadCount();
    window.addEventListener('notifications-updated', handleNotificationsUpdated);

    return () => {
      window.removeEventListener('notifications-updated', handleNotificationsUpdated);
    };
  }, [user?.id]);

  const fetchUnreadCount = async () => {
    try {
      const userId = user.role === 'doctor' ? user.doctorId : user.id;
      const resp = await fetch(`${BACKEND_URL}/api/notifications/${userId}`);
      if (resp.ok) {
        const notifications = await resp.json();
        const unread = notifications.filter(n => !n.is_read).length;
        setUnreadCount(unread);
      }
    } catch (err) {
      console.error('Failed to fetch notification count:', err);
    }
  };

  const patientLinks = [
    { id: 'home',         icon: '🏠', label: 'Dashboard' },
    { id: 'booking',      icon: '📅', label: 'Book Appointment' },
    { id: 'appointments', icon: '📋', label: 'My Appointments' },
    { id: 'notifications',icon: '🔔', label: 'Notifications' },
    { id: 'profile',      icon: '👤', label: 'Profile' },
  ];

  const doctorLinks = [
    { id: 'doctor-home',     icon: '🏠', label: 'Dashboard' },
    { id: 'doctor-schedule', icon: '📅', label: 'Schedule' },
    { id: 'doctor-requests', icon: '📬', label: 'Requests' },
    { id: 'doctor-notifications', icon: '🔔', label: 'Notifications' },
    { id: 'doctor-profile',  icon: '👤', label: 'My Profile' },
  ];

  const adminLinks = [
    { id: 'admin', icon: '📊', label: 'Admin Dashboard' },
  ];

  const links = isAdmin ? adminLinks : isDoctor ? doctorLinks : patientLinks;

  const SideContent = () => (
    <>
      <div className="navbar__brand">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="navbar__logo">🩺</div>
          <div>
            <div className="navbar__title">MediBook</div>
            <div className="navbar__subtitle">{isDoctor ? 'Doctor Portal' : isAdmin ? 'Admin Portal' : 'Patient Portal'}</div>
          </div>
        </div>
      </div>
      <nav className="navbar__links">
        {links.map(({ id, icon, label }) => {
          const isNotifications = id === 'notifications' || id === 'doctor-notifications';
          const showBadge = isNotifications && unreadCount > 0;

          return (
            <button
              key={id}
              onClick={() => { setPage(id); setMobileOpen(false); }}
              className={`nav-link ${page === id ? 'nav-link--active' : ''}`}
            >
              <span style={{ fontSize: 16 }}>{icon}</span>
              <span style={{ flex: 1, textAlign: 'left' }}>{label}</span>
              {showBadge && (
                <span className="badge badge--danger badge--count">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>
      <div className="navbar__footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', marginBottom: 8 }}>
          <Avatar name={user?.name} size={34} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
            <div className="text-sm text-muted" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{isDoctor ? 'Doctor' : isAdmin ? 'Admin' : 'Patient'}</div>
          </div>
        </div>
        <div className="theme-toggle">
          <span className="theme-toggle__label">Theme</span>
          <label className="theme-switch">
            <input type="checkbox" checked={theme === 'dark'} onChange={toggleTheme} />
            <span className="theme-switch__track" />
            <span className="theme-switch__thumb" />
          </label>
        </div>
        <button onClick={logout} className="navbar__logout">
          🚪 Sign Out
        </button>
      </div>
    </>
  );

  return (
    <>
      <aside className="navbar desk-nav">
        <SideContent />
      </aside>
      <header className="mobile-header mob-nav">
        <span className="text-serif" style={{ fontSize: 20 }}>🩺 MediBook</span>
        <button onClick={() => setMobileOpen(o => !o)} className="mobile-header__menu-btn">
          {mobileOpen ? '✕' : '☰'}
        </button>
      </header>
      {mobileOpen && (
        <div className="mobile-overlay" onClick={() => setMobileOpen(false)}>
          <div className="mobile-drawer" onClick={e => e.stopPropagation()}>
            <SideContent />
          </div>
        </div>
      )}
    </>
  );
}
