import { useState, useEffect, useRef } from 'react';
import { Search, SlidersHorizontal, X, Bell } from 'lucide-react';
import NotificationBell from '../components/NotificationBell';
import api from '../lib/api';
import AdCard from '../components/AdCard';
import BottomNav from '../components/BottomNav';
import { FeedShimmer } from '../components/Shimmer';
import PullToRefresh from '../components/PullToRefresh';
import { useAuthStore } from '../store/auth';
import { useCacheStore } from '../store/cache';
import type { Ad } from '../types';
import { INDUSTRIES } from '../types';

type FeedTab = 'all' | 'paid' | 'barter';

export default function Feed() {
  const { user } = useAuthStore();
  const cache = useCacheStore();
  const [ads, setAds] = useState<Ad[]>(cache.feedAds || []);
  const [loading, setLoading] = useState(!cache.feedAds);
  const [industry, setIndustry] = useState('');
  const [adType, setAdType] = useState('');
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<FeedTab>('all');

  const activeFilterCount = (industry ? 1 : 0);

  useEffect(() => {
    if (activeTab === 'paid') setAdType('PAID');
    else if (activeTab === 'barter') setAdType('BARTER');
    else setAdType('');
  }, [activeTab]);

  const fetchAds = async (force = false) => {
    const paramKey = `${industry}|${adType}|${search}`;
    const cacheState = useCacheStore.getState();
    if (!force && cacheState.feedAds && cacheState.feedParams === paramKey) {
      setAds(cacheState.feedAds);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const params: any = {};
      if (industry) params.industry = industry;
      if (adType) params.adType = adType;
      if (search) params.search = search;
      const res = await api.get('/ads', { params });
      setAds(res.data.ads);
      useCacheStore.getState().setFeedAds(res.data.ads, paramKey);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const cachedFeedAds = useCacheStore(s => s.feedAds);

  useEffect(() => {
    const timer = setTimeout(() => { fetchAds(); }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => { fetchAds(); }, [industry, adType]);

  const feedLoadDone = useRef(false);
  useEffect(() => {
    if (cachedFeedAds === null && feedLoadDone.current) {
      fetchAds(true);
    }
    if (cachedFeedAds !== null) feedLoadDone.current = true;
  }, [cachedFeedAds]);

  useEffect(() => {
    const handler = () => fetchAds(true);
    window.addEventListener('app-refresh', handler);
    return () => window.removeEventListener('app-refresh', handler);
  }, []);

  const handleRefresh = async () => {
    cache.invalidateFeed();
    await fetchAds(true);
  };

  const activeAds = ads.filter(a => a.status === 'ACTIVE');
  const totalSlots = ads.reduce((sum, a) => sum + (a.influencerCount || 0), 0);

  return (
    <PullToRefresh onRefresh={handleRefresh}>
    <div className="page ios-feed">
      {/* iOS-style Header */}
      <div className="ios-feed-header">
        <div className="ios-feed-header-top">
          <div>
            <p className="ios-feed-greeting">Salom, {user?.firstName}</p>
            <h1 className="ios-feed-headline">UGC Station</h1>
          </div>
          <NotificationBell />
        </div>

        {/* Big stat number */}
        <div className="ios-feed-stat-hero">
          <span className="ios-feed-stat-number">{activeAds.length}</span>
          <span className="ios-feed-stat-label">faol e'lonlar</span>
        </div>

        {/* Mini stats row */}
        <div className="ios-feed-mini-stats">
          <div className="ios-feed-mini-stat">
            <span className="ios-feed-mini-stat-value">{ads.length}</span>
            <span className="ios-feed-mini-stat-label">Jami</span>
          </div>
          <div className="ios-feed-mini-stat-divider" />
          <div className="ios-feed-mini-stat">
            <span className="ios-feed-mini-stat-value">{totalSlots}</span>
            <span className="ios-feed-mini-stat-label">Joylar</span>
          </div>
          <div className="ios-feed-mini-stat-divider" />
          <div className="ios-feed-mini-stat">
            <span className="ios-feed-mini-stat-value">{ads.filter(a => a.adType === 'PAID').length}</span>
            <span className="ios-feed-mini-stat-label">Pullik</span>
          </div>
        </div>
      </div>

      {/* iOS Segmented Control / Tabs */}
      <div className="ios-feed-tabs">
        <button
          className={`ios-feed-tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          Barchasi
        </button>
        <button
          className={`ios-feed-tab ${activeTab === 'paid' ? 'active' : ''}`}
          onClick={() => setActiveTab('paid')}
        >
          Pullik
        </button>
        <button
          className={`ios-feed-tab ${activeTab === 'barter' ? 'active' : ''}`}
          onClick={() => setActiveTab('barter')}
        >
          Barter
        </button>
      </div>

      {/* Search bar */}
      <div className="ios-feed-search">
        <div className="ios-search-wrap">
          <Search size={16} className="ios-search-icon" />
          <input
            className="ios-search-input"
            placeholder="Qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {activeFilterCount > 0 && (
          <button onClick={() => { setIndustry(''); }} className="ios-filter-clear-btn">
            <X size={14} /> Filtr
          </button>
        )}
      </div>

      {/* Industry filter chips */}
      <div className="ios-feed-chips">
        <button
          className={`ios-chip ${!industry ? 'active' : ''}`}
          onClick={() => setIndustry('')}
        >
          Barchasi
        </button>
        {INDUSTRIES.slice(0, 6).map((ind) => (
          <button
            key={ind}
            className={`ios-chip ${industry === ind ? 'active' : ''}`}
            onClick={() => setIndustry(ind)}
          >
            {ind}
          </button>
        ))}
      </div>

      {/* Ads list */}
      {loading ? (
        <FeedShimmer />
      ) : ads.length === 0 ? (
        <div className="ios-empty-state">
          <div className="ios-empty-icon">
            <Search size={32} />
          </div>
          <p className="ios-empty-title">E'lonlar topilmadi</p>
          <p className="ios-empty-desc">Filtrlarni o'zgartiring yoki keyinroq tekshiring</p>
        </div>
      ) : (
        <div className="ios-feed-list">
          {ads.map((ad, i) => (
            <AdCard key={ad.id} ad={ad} index={i} />
          ))}
        </div>
      )}

      <BottomNav />
    </div>
    </PullToRefresh>
  );
}
