import { create } from 'zustand';
import api from '../lib/api';
import { getInitData, getTelegramUser, expandApp } from '../lib/telegram';

function getTokenKey() {
  const urlParams = new URLSearchParams(window.location.search);
  const userFromUrl = urlParams.get('user');
  if (userFromUrl) {
    sessionStorage.setItem('dev_user_key', userFromUrl);
  }
  const userId = userFromUrl || sessionStorage.getItem('dev_user_key') || 'default';
  return `token_${userId}`;
}

interface User {
  id: string;
  telegramId: string;
  firstName: string;
  lastName: string;
  username: string;
  photoUrl: string;
  role: 'COMPANY' | 'INFLUENCER' | 'ADMIN' | null;
  onboarded: boolean;
  createdAt?: string;
  company?: any;
  influencer?: any;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: () => Promise<void>;
  selectRole: (role: 'COMPANY' | 'INFLUENCER') => Promise<void>;
  onboardCompany: (data: { name: string; industry: string }) => Promise<void>;
  onboardInfluencer: (data: { name: string; bio: string; category: string; socialLinks: any }) => Promise<void>;
  refreshUser: () => Promise<void>;
  goBackToRoleSelect: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem(getTokenKey()),
  isLoading: true,

  login: async () => {
    try {
      expandApp();
      const tokenKey = getTokenKey();

      // Agar token mavjud bo'lsa — userni olish
      const existingToken = localStorage.getItem(tokenKey);
      if (existingToken) {
        try {
          const res = await api.get('/auth/me');
          set({ user: res.data.user, isLoading: false });
          return;
        } catch {
          localStorage.removeItem(tokenKey);
        }
      }

      // Telegram orqali login
      const initData = getInitData();
      const devUser = getTelegramUser();

      // Dev mode: URL da ?user=1,2,3... orqali boshqa account tanlash
      const urlParams = new URLSearchParams(window.location.search);
      const userFromUrl = urlParams.get('user');
      if (userFromUrl) sessionStorage.setItem('dev_user_key', userFromUrl);
      const devAccId = userFromUrl || sessionStorage.getItem('dev_user_key');
      const devAccounts: Record<string, any> = {
        '1': { id: 10001, first_name: 'Kompaniya', username: 'company_user' },
        '2': { id: 10002, first_name: 'Influenser', username: 'influencer_user' },
        '3': { id: 10003, first_name: 'Kompaniya2', username: 'company2_user' },
        '5': { id: 10005, first_name: 'Umar', username: 'umar_user' },
        '6': { id: 10006, first_name: 'Johon', username: 'tester_user' },
        'admin': { id: 99900, first_name: 'Admin', username: 'admin_user' },
      };
      const selectedDev = devAccId ? devAccounts[devAccId] : null;

      const res = await api.post('/auth/telegram', {
        initData,
        devUser: !initData ? selectedDev || devUser || { id: 10001, first_name: 'Kompaniya', username: 'company_user' } : undefined,
      });

      localStorage.setItem(tokenKey, res.data.token);
      set({ user: res.data.user, token: res.data.token, isLoading: false });
    } catch (err) {
      console.error('Login error:', err);
      set({ isLoading: false });
    }
  },

  selectRole: async (role) => {
    const res = await api.post('/auth/select-role', { role });
    localStorage.setItem(getTokenKey(), res.data.token);
    set({ user: res.data.user, token: res.data.token });
  },

  onboardCompany: async (data) => {
    await api.post('/auth/onboarding/company', data);
    await get().refreshUser();
  },

  onboardInfluencer: async (data) => {
    await api.post('/auth/onboarding/influencer', data);
    await get().refreshUser();
  },

  refreshUser: async () => {
    const res = await api.get('/auth/me');
    set({ user: res.data.user });
  },

  goBackToRoleSelect: () => {
    set((state) => ({
      user: state.user ? { ...state.user, role: null, onboarded: false } : null,
    }));
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {}
    localStorage.removeItem(getTokenKey());
    set({ user: null, token: null });
  },
}));
