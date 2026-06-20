import React, { useState, useEffect } from 'react';
import { useApp } from './AppContext';
import { Btn, EmptyState, Toast } from './components';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000');

export default function NotificationsPage() {
  const { user } = useApp();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!user) return;
    fetchNotifications();
  }, [user?.id]);

  const fetchNotifications = async () => {
    if (!user) return;

    const userId = user.role === 'doctor' ? user.doctorId : user.id;

    try {
      const resp = await fetch(`${BACKEND_URL}/api/notifications/${userId}`);
      const data = await resp.json();

      if (resp.ok) {
        setNotifications(data);
      } else {
        setToast({ message: 'Failed to load notifications', type: 'error' });
      }
    } catch (err) {
      setToast({ message: 'Network error: ' + err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return '';
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const markAsRead = async (notificationId) => {
    try {
      const resp = await fetch(`${BACKEND_URL}/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
      });

      if (resp.ok) {
        setNotifications(prev =>
          prev.map(n => n.id === notificationId ? { ...n, is_read: 1 } : n)
        );
        window.dispatchEvent(new CustomEvent('notifications-updated'));
      }
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter(n => !n.is_read);

    for (const notification of unread) {
      await markAsRead(notification.id);
    }

    setToast({ message: 'All notifications marked as read', type: 'success' });
    window.dispatchEvent(new CustomEvent('notifications-updated'));
  };

  const deleteNotification = async (notificationId) => {
    try {
      const resp = await fetch(`${BACKEND_URL}/api/notifications/${notificationId}`, {
        method: 'DELETE',
      });

      if (resp.ok) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        setToast({ message: 'Notification deleted', type: 'success' });
      }
    } catch (err) {
      setToast({ message: 'Failed to delete', type: 'error' });
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) {
    return (
      <div className="page">
        <div className="empty-state" style={{ padding: 40 }}>
          Loading notifications...
        </div>
      </div>
    );
  }

  return (
    <div className="page page--narrow">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ marginBottom: 4 }}>
            🔔 Notifications
            {unreadCount > 0 && (
              <span className="badge badge--danger" style={{ marginLeft: 12, fontSize: 14, padding: '4px 12px' }}>
                {unreadCount} new
              </span>
            )}
          </h1>
          <p className="text-muted text-md">Stay updated with important messages</p>
        </div>

        {unreadCount > 0 && (
          <Btn variant="outline" onClick={markAllAsRead} small>
            ✓ Mark All Read
          </Btn>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon="🔔"
          title="No notifications yet"
          sub="You'll see important updates and messages here"
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification-card ${!notification.is_read ? 'notification-card--unread' : ''}`}
            >
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div className="notification-card__icon">🔔</div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6, gap: 12, flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, fontFamily: 'var(--font-sans)' }}>
                      {notification.title}
                    </h3>
                    <span className="text-sm text-muted" style={{ whiteSpace: 'nowrap' }}>
                      {formatTimeAgo(notification.created_at)}
                    </span>
                  </div>

                  <p className="text-md" style={{ lineHeight: 1.6, margin: '12px 0', color: 'var(--color-text-muted)' }}>
                    {notification.message}
                  </p>

                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    {!notification.is_read && (
                      <Btn tiny variant="success" onClick={() => markAsRead(notification.id)}>
                        ✓ Mark Read
                      </Btn>
                    )}
                    <Btn tiny variant="ghost" onClick={() => deleteNotification(notification.id)}>
                      🗑 Delete
                    </Btn>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {notifications.length > 0 && (
        <div className="stats-row">
          <div className="stats-row__grid">
            <div>
              <div className="stats-row__value text-primary-color">{notifications.length}</div>
              <div className="stats-row__label">Total</div>
            </div>
            <div>
              <div className="stats-row__value" style={{ color: 'var(--color-warning)' }}>{unreadCount}</div>
              <div className="stats-row__label">Unread</div>
            </div>
            <div>
              <div className="stats-row__value" style={{ color: 'var(--color-success)' }}>{notifications.length - unreadCount}</div>
              <div className="stats-row__label">Read</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
