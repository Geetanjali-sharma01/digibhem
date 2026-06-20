import React, { useState, useEffect } from 'react';
import { useApp } from './AppContext';
import { Card, Btn, EmptyState, Toast } from './components';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000');

export default function NotificationsPage() {
  const { user } = useApp();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Debug: Show component is mounted
  console.log('[NotificationsPage] Component mounted, user:', user);
  
  // Temporary: Show alert to confirm component renders
  useEffect(() => {
    if (user) {
      console.log('🔔🔔🔔 NotificationsPage USE EFFECT TRIGGERED for user:', user.id, user.email);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user) return;
    
    console.log('[NotificationsPage] User ID:', user.id, 'Role:', user.role);
    fetchNotifications();
  }, [user?.id]);

  const fetchNotifications = async () => {
    if (!user) {
      console.warn('[NotificationsPage] No user, skipping fetch');
      return;
    }
    
    // For doctors, use doctorId (e.g., 'd6'), for patients use id (e.g., 8)
    const userId = user.role === 'doctor' ? user.doctorId : user.id;
    
    // Visual confirmation that fetch is happening
    console.log('%c🔔 [NotificationsPage] FETCH STARTING', 'background: #00b4a6; color: white; padding: 4px 8px; font-size: 16px; font-weight: bold;');
    console.log('[NotificationsPage] User:', { id: user.id, doctorId: user.doctorId, role: user.role, email: user.email });
    console.log('[NotificationsPage] Using userId for API call:', userId);
    console.log('[NotificationsPage] URL:', `${BACKEND_URL}/api/notifications/${userId}`);
    
    try {
      const url = `${BACKEND_URL}/api/notifications/${userId}`;
      
      const resp = await fetch(url);
      console.log('[NotificationsPage] Response:', resp.status, resp.ok);
      
      const data = await resp.json();
      console.log('[NotificationsPage] Data received:', data.length, 'notifications');
      
      if (resp.ok) {
        setNotifications(data);
        console.log('%c✅ [NotificationsPage] STATE UPDATED with ' + data.length + ' notifications', 'background: #4caf50; color: white; padding: 4px 8px; font-size: 14px; font-weight: bold;');
        
        if (data.length > 0) {
          console.log('%c🎉 SUCCESS! Notifications will now render!', 'background: #ff9800; color: white; padding: 4px 8px; font-size: 14px; font-weight: bold;');
          console.log('First notification:', data[0]);
        } else {
          console.warn('%c⚠️ API returned 0 notifications for userId:', userId, 'background: #f44336; color: white; padding: 4px 8px; font-size: 14px;');
        }
      } else {
        console.error('[NotificationsPage] API Error:', data);
        setToast({ message: 'Failed to load notifications', type: 'error' });
      }
    } catch (err) {
      console.error('%c❌ [NotificationsPage] Network Error:', 'background: #f44336; color: white; padding: 4px 8px; font-size: 14px;', err);
      setToast({ message: 'Network error: ' + err.message, type: 'error' });
    } finally {
      setLoading(false);
      console.log('%c🏁 [NotificationsPage] FETCH COMPLETE', 'background: #2196f3; color: white; padding: 4px 8px; font-size: 14px;');
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
        // Refresh nav badge
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
    // Refresh nav badge
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
      console.error('Failed to delete notification:', err);
      setToast({ message: 'Failed to delete', type: 'error' });
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const userId = user.role === 'doctor' ? user.doctorId : user.id;

  // Debug render
  console.log('%c🎨 [NotificationsPage] RENDERING', 'background: #9c27b0; color: white; padding: 4px 8px;', {
    notificationsLength: notifications.length,
    loading,
    userId,
    firstNotification: notifications[0]?.title
  });

  if (loading) {
    return (
      <div style={{ padding: '28px 32px', animation: 'fadeIn 0.35s ease' }}>
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-light)' }}>
          Loading notifications...
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '28px 32px', animation: 'fadeIn 0.35s ease', maxWidth: 900 }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Debug Banner */}
      <div style={{ 
        background: 'rgba(0,180,166,0.1)', 
        border: '2px solid var(--teal)', 
        borderRadius: 8, 
        padding: 12, 
        marginBottom: 16,
        fontSize: 13,
      }}>
        <strong>🔍 DEBUG:</strong> NotificationsPage is rendering | 
        User ID: <strong>{user?.id}</strong> | 
        Doctor ID: <strong>{user?.doctorId || 'N/A'}</strong> | 
        Using userId: <strong>{userId}</strong> |
        Role: <strong>{user?.role}</strong> | 
        Email: <strong>{user?.email}</strong> |
        Notifications loaded: <strong>{notifications.length}</strong>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 27, marginBottom: 4 }}>
            🔔 Notifications
            {unreadCount > 0 && (
              <span style={{ 
                marginLeft: 12, 
                background: 'var(--danger)', 
                color: '#fff', 
                fontSize: 14, 
                fontWeight: 700,
                padding: '4px 12px',
                borderRadius: 20,
              }}>
                {unreadCount} new
              </span>
            )}
          </h1>
          <p style={{ color: 'var(--text-light)', fontSize: 14 }}>Stay updated with important messages from admins</p>
        </div>
        
        {unreadCount > 0 && (
          <Btn variant="outline" onClick={markAllAsRead} small>
            ✓ Mark All Read
          </Btn>
        )}
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div>
          <div style={{ padding: 20, background: '#f44336', color: 'white', marginBottom: 16, borderRadius: 8 }}>
            <strong>⚠️ DEBUG:</strong> notifications.length is 0 - showing EmptyState
          </div>
          <EmptyState 
            icon="🔔" 
            title="No notifications yet" 
            sub="You'll see important updates and messages here" 
          />
        </div>
      ) : (
        <div>
          <div style={{ padding: 10, background: '#4caf50', color: 'white', marginBottom: 12, borderRadius: 8, fontSize: 13 }}>
            <strong>✅ DEBUG:</strong> Rendering {notifications.length} notification(s)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Test render - should be super visible */}
            <div style={{ background: 'yellow', border: '3px solid red', padding: 20, fontSize: 18, fontWeight: 'bold' }}>
              🔴🟡 TEST: This should be VISIBLE! notifications.length = {notifications.length}
            </div>
            
            {notifications.map((notification, index) => {
              console.log(`%c📧 Rendering notification ${index}:`, 'background: #ff9800; color: white; padding: 2px 6px;', notification.title);
              return (
            <div
              key={notification.id}
              style={{
                border: '3px solid #ff0000',
                background: '#ffffcc',
                borderRadius: 12,
                padding: 20,
                marginBottom: 12,
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              }}
            >
              {/* Debug info */}
              <div style={{ background: '#ff00ff', color: 'white', padding: 8, marginBottom: 12, fontSize: 12, fontWeight: 'bold' }}>
                📧 NOTIFICATION #{index + 1}: {notification.title}
              </div>
              
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                {/* Icon */}
                <div style={{ 
                  width: 44, 
                  height: 44, 
                  borderRadius: 12, 
                  background: '#00b4a6',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: 22,
                  flexShrink: 0,
                }}>
                  🔔
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#000' }}>
                      {notification.title}
                    </h3>
                    <span style={{ fontSize: 12, color: '#666', whiteSpace: 'nowrap', marginLeft: 12 }}>
                      {notification.created_at}
                    </span>
                  </div>
                  
                  <p style={{ fontSize: 15, color: '#333', lineHeight: 1.6, margin: '12px 0', background: '#fff', padding: 12, borderRadius: 6, border: '1px solid #ddd' }}>
                    {notification.message}
                  </p>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {!notification.is_read && (
                      <Btn 
                        tiny 
                        variant="success" 
                        onClick={() => markAsRead(notification.id)}
                      >
                        ✓ Mark Read
                      </Btn>
                    )}
                    <Btn 
                      tiny 
                      variant="ghost" 
                      onClick={() => deleteNotification(notification.id)}
                    >
                      🗑 Delete
                    </Btn>
                  </div>
                </div>
              </div>
            </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Stats Footer */}
      {notifications.length > 0 && (
        <div style={{ marginTop: 24, padding: '16px 20px', background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--teal)' }}>{notifications.length}</div>
              <div style={{ fontSize: 12, color: 'var(--text-light)' }}>Total</div>
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--gold)' }}>{unreadCount}</div>
              <div style={{ fontSize: 12, color: 'var(--text-light)' }}>Unread</div>
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--success)' }}>{notifications.length - unreadCount}</div>
              <div style={{ fontSize: 12, color: 'var(--text-light)' }}>Read</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
