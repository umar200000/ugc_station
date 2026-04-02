import { create } from 'zustand';
import api from '../lib/api';

interface LevelPrices {
  level1: number;
  level2: number;
  level3: number;
}

interface CacheState {
  feedAds: any[] | null;
  feedParams: string;
  influencers: any[] | null;
  influencerParams: string;
  myAds: any[] | null;
  myApplications: any[] | null;
  levelPrices: LevelPrices | null;

  setFeedAds: (ads: any[], params: string) => void;
  setInfluencers: (list: any[], params: string) => void;
  setMyAds: (ads: any[]) => void;
  setMyApplications: (apps: any[]) => void;
  invalidateMyAds: () => void;
  invalidateFeed: () => void;
  invalidateAll: () => void;
  fetchLevelPrices: () => Promise<void>;
  getLevelPrice: (level: number) => number;
}

export const useCacheStore = create<CacheState>((set, get) => ({
  feedAds: null,
  feedParams: '',
  influencers: null,
  influencerParams: '',
  myAds: null,
  myApplications: null,
  levelPrices: null,

  setFeedAds: (ads, params) => set({ feedAds: ads, feedParams: params }),
  setInfluencers: (list, params) => set({ influencers: list, influencerParams: params }),
  setMyAds: (ads) => set({ myAds: ads }),
  setMyApplications: (apps) => set({ myApplications: apps }),
  invalidateMyAds: () => set({ myAds: null }),
  invalidateFeed: () => set({ feedAds: null, feedParams: '' }),
  invalidateAll: () => set({ feedAds: null, feedParams: '', influencers: null, influencerParams: '', myAds: null, myApplications: null }),

  fetchLevelPrices: async () => {
    if (get().levelPrices) return;
    try {
      const res = await api.get('/level-prices');
      set({ levelPrices: res.data });
    } catch {}
  },

  getLevelPrice: (level: number) => {
    const p = get().levelPrices;
    if (!p) return 50000;
    if (level === 1) return p.level1;
    if (level === 2) return p.level2;
    if (level === 3) return p.level3;
    return p.level1;
  },
}));
