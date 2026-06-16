import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getNotificationsApi, createNotificationApi, markNotificationReadApi, getUsersApi } from '../lib/api';
import { useAuth } from './AuthContext';
import { generateId } from '../lib/utils';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = useCallback(async () => {
    if (!user) { setNotifications([]); setUnreadCount(0); return; }
    try {
      const all = await getNotificationsApi();
      const sorted = all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setNotifications(sorted);
      setUnreadCount(sorted.filter(n => !n.isRead).length);
    } catch (e) {
      console.error('Failed to load notifications:', e);
    }
  }, [user]);

  useEffect(() => { loadNotifications(); }, [loadNotifications]);

  const markAsRead = async (id) => {
    const notif = notifications.find(n => n.id === id);
    if (notif && !notif.isRead) {
      await markNotificationReadApi(id);
      await loadNotifications();
    }
  };

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.isRead);
    for (const n of unread) {
      await markNotificationReadApi(n.id);
    }
    await loadNotifications();
  };

  const createNotification = async (userId, data) => {
    const notif = {
      id: generateId('notif'),
      userId,
      type: data.type || 'new_notice',
      title: data.title,
      message: data.message,
      relatedNoticeId: data.relatedNoticeId || null,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    await createNotificationApi(notif);
    if (userId === user?.id) await loadNotifications();
    return notif;
  };

  const notifyAllUsers = async (data) => {
    const allUsers = await getUsersApi();
    for (const u of allUsers) {
      if (u.id !== user?.id) {
        await createNotification(u.id, data);
      }
    }
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllRead, createNotification, notifyAllUsers, loadNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
