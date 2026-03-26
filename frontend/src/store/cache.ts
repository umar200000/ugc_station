import { create } from 'zustand';

interface CacheState {
  feedAds: any[] | null;
  feedParams: string;
  influencers: any[] | null;
  influencerParams: string;
  myAds: any[] | null;
  myApplications: any[] | null;

  setFeedAds: (ads: any[], params: string) => void;
  setInfluencers: (list: any[], params: string) => void;
  setMyAds: (ads: any[]) => void;
  setMyApplications: (apps: any[]) => void;
  invalidateMyAds: () => void;
  invalidateFeed: () => void;
  invalidateAll: () => void;
}

export const useCacheStore = create<CacheState>((set) => ({
  feedAds: null,
  feedParams: '',
  influencers: null,
  influencerParams: '',
  myAds: null,
  myApplications: null,

  setFeedAds: (ads, params) => set({ feedAds: ads, feedParams: params }),
  setInfluencers: (list, params) => set({ influencers: list, influencerParams: params }),
  setMyAds: (ads) => set({ myAds: ads }),
  setMyApplications: (apps) => set({ myApplications: apps }),
  invalidateMyAds: () => set({ myAds: null }),
  invalidateFeed: () => set({ feedAds: null, feedParams: '' }),
  invalidateAll: () => set({ feedAds: null, feedParams: '', influencers: null, influencerParams: '', myAds: null, myApplications: null }),
}));
