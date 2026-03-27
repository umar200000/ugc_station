import { useState, useEffect, useRef } from 'react';
import { Search, SlidersHorizontal, X, Sparkles, TrendingUp, Zap } from 'lucide-react';
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

export default function Feed() {
  const { user } = useAuthStore();
  const cache = useCacheStore();
  const [ads, setAds] = useState<Ad[]>(cache.feedAds || []);
  const [loading, setLoading] = useState(!cache.feedAds);
  const [industry, setIndustry] = useState('');
  const [adType, setAdType] = useState('');
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isStuck, setIsStuck] = useState(false);
  const stickyRef = useRef<HTMLDivElement>(null);

  const activeFilterCount = (industry ? 1 : 0) + (adType ? 1 : 0);

  useEffect(() => {
    const el = stickyRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsStuck(!entry.isIntersecting),
      { threshold: 1, rootMargin: '-1px 0px 0px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

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

  // Cache invalidate bo'lganda qayta fetch
  const feedLoadDone = useRef(false);
  useEffect(() => {
    if (cachedFeedAds === null && feedLoadDone.current) {
      fetchAds(true);
    }
    if (cachedFeedAds !== null) feedLoadDone.current = true;
  }, [cachedFeedAds]);

  const clearFilters = () => {
    setIndustry('');
    setAdType('');
  };

  const handleRefresh = async () => {
    cache.invalidateFeed();
    await fetchAds(true);
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
    <div className="page">
      {/* Hero Header */}
      <div className="feed-header slide-up">
        <div className="feed-header-bg" />
        <div className="feed-header-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p className="feed-greeting">Xush kelibsiz, {user?.firstName}</p>
              <h1 className="feed-title">
                <Sparkles size={22} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6, color: '#FBBF24' }} />
                UGC Marketplace
              </h1>
            </div>
            <NotificationBell />
          </div>

          {/* Quick stats */}
          <div className="feed-stats">
            <div className="feed-stat">
              <TrendingUp size={14} />
              <span>{ads.length} e'lon</span>
            </div>
            <div className="feed-stat-divider" />
            <div className="feed-stat">
              <Zap size={14} />
              <span>{ads.filter(a => a.status === 'ACTIVE').length} faol</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sentinel */}
      <div ref={stickyRef} style={{ height: 1, marginBottom: -1 }} />

      {/* Sticky search + filter */}
      <div className="feed-search-bar" style={{
        boxShadow: isStuck ? '0 4px 20px rgba(15,23,42,0.08)' : 'none',
      }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <div className="search-wrap" style={{ flex: 1 }}>
            <Search size={18} className="search-icon-svg" />
            <input
              className="form-input"
              style={{ paddingLeft: 42, borderRadius: 14 }}
              placeholder="Qidirish..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="feed-filter-btn"
            style={{
              borderColor: showFilters || activeFilterCount ? 'var(--primary-border)' : 'var(--border-strong)',
              background: showFilters || activeFilterCount ? 'var(--primary-bg)' : 'var(--bg-card)',
              color: showFilters || activeFilterCount ? 'var(--primary)' : 'var(--text-muted)',
            }}
          >
            <SlidersHorizontal size={20} />
            {activeFilterCount > 0 && (
              <span className="feed-filter-count">{activeFilterCount}</span>
            )}
          </button>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="feed-filter-panel fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <span style={{ fontSize: 15, fontWeight: 700 }}>Filtrlar</span>
              {activeFilterCount > 0 && (
                <button onClick={clearFilters} className="feed-filter-clear">
                  <X size={14} /> Tozalash
                </button>
              )}
            </div>

            <div style={{ marginBottom: 14 }}>
              <span className="feed-filter-label">To'lov turi</span>
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { value: '', label: 'Barchasi', icon: null },
                  { value: 'BARTER', label: 'Barter', icon: null },
                  { value: 'PAID', label: 'Pullik', icon: null },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setAdType(opt.value)}
                    className={`feed-type-btn ${adType === opt.value ? 'active' : ''}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="feed-filter-label">Soha</span>
              <select className="form-select" value={industry} onChange={(e) => setIndustry(e.target.value)} style={{ fontSize: 13, borderRadius: 12 }}>
                <option value="">Barcha sohalar</option>
                {INDUSTRIES.map((ind) => <option key={ind} value={ind}>{ind}</option>)}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Active filter tags */}
      {activeFilterCount > 0 && !showFilters && (
        <div className="feed-active-filters fade-in">
          {adType && (
            <span className="feed-active-tag">
              {adType === 'BARTER' ? 'Barter' : 'Pullik'}
              <X size={14} onClick={(e) => { e.stopPropagation(); setAdType(''); }} />
            </span>
          )}
          {industry && (
            <span className="feed-active-tag">
              {industry}
              <X size={14} onClick={(e) => { e.stopPropagation(); setIndustry(''); }} />
            </span>
          )}
        </div>
      )}

      {/* Ads list */}
      {loading ? (
        <FeedShimmer />
      ) : ads.length === 0 ? (
        <div className="empty-state fade-in">
          <div style={{
            width: 80, height: 80, borderRadius: 24,
            background: 'var(--primary-bg)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
          }}>
            <Search size={36} style={{ color: 'var(--primary)', opacity: 0.5 }} />
          </div>
          <p style={{ fontWeight: 600, fontSize: 16 }}>E'lonlar topilmadi</p>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>Filtrlarni o'zgartiring yoki keyinroq tekshiring</p>
        </div>
      ) : (
        <div className="feed-grid">
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
