import { create } from 'zustand';
import api from '../lib/api';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  link: string;
  createdAt: string;
}

interface NotifState {
  notifications: Notification[];
  unreadCount: number;
  showPanel: boolean;
  fetchNotifications: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  togglePanel: () => void;
  closePanel: () => void;
}

export const useNotifStore = create<NotifState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  showPanel: false,

  fetchNotifications: async () => {
    try {
      const res = await api.get('/notifications/my');
      set({ notifications: res.data });
    } catch {}
  },

  fetchUnreadCount: async () => {
    try {
      const res = await api.get('/notifications/unread-count');
      set({ unreadCount: res.data.count });
    } catch {}
  },

  markAsRead: async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      set(s => ({
        notifications: s.notifications.map(n => n.id === id ? { ...n, read: true } : n),
        unreadCount: Math.max(0, s.unreadCount - 1),
      }));
    } catch {}
  },

  markAllRead: async () => {
    try {
      await api.patch('/notifications/read-all');
      set(s => ({
        notifications: s.notifications.map(n => ({ ...n, read: true })),
        unreadCount: 0,
      }));
    } catch {}
  },

  togglePanel: () => set(s => {
    if (!s.showPanel) get().fetchNotifications();
    return { showPanel: !s.showPanel };
  }),

  closePanel: () => set({ showPanel: false }),
}));
