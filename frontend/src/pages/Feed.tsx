import { useState, useEffect, useRef } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
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
    if (!force && cache.feedAds && cache.feedParams === paramKey) {
      setAds(cache.feedAds);
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
      cache.setFeedAds(res.data.ads, paramKey);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAds(); }, [industry, adType]);

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
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500 }}>Salom, {user?.firstName}</p>
          <h1 className="page-title">E'lonlar</h1>
        </div>
        <div className="avatar avatar-sm">
          {user?.photoUrl ? <img src={user.photoUrl} alt="" /> : user?.firstName?.[0] || '?'}
        </div>
      </div>

      {/* Sentinel — sticky top ga yetganini aniqlaydi */}
      <div ref={stickyRef} style={{ height: 1, marginBottom: -1 }} />

      {/* Sticky search + filter */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'var(--bg)',
        paddingTop: 8, paddingBottom: 12,
        boxShadow: isStuck ? '0 4px 20px rgba(15,23,42,0.08)' : 'none',
        transition: 'box-shadow 0.3s ease',
        marginLeft: -16, marginRight: -16, paddingLeft: 16, paddingRight: 16,
      }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <div className="search-wrap" style={{ flex: 1 }}>
            <Search size={18} className="search-icon-svg" />
            <input
              className="form-input"
              style={{ paddingLeft: 42 }}
              placeholder="Qidirish..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchAds()}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              width: 48, height: 48, borderRadius: 'var(--radius-sm)',
              border: `1.5px solid ${showFilters || activeFilterCount ? 'var(--primary-border)' : 'var(--border-strong)'}`,
              background: showFilters || activeFilterCount ? 'var(--primary-bg)' : 'var(--bg-card)',
              color: showFilters || activeFilterCount ? 'var(--primary)' : 'var(--text-muted)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative', flexShrink: 0, transition: 'all 0.2s ease',
            }}
          >
            <SlidersHorizontal size={20} />
            {activeFilterCount > 0 && (
              <span style={{
                position: 'absolute', top: -4, right: -4,
                width: 18, height: 18, borderRadius: '50%',
                background: 'var(--primary)', color: '#fff',
                fontSize: 10, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{activeFilterCount}</span>
            )}
          </button>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="fade-in" style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', padding: 16, marginTop: 10,
            boxShadow: 'var(--shadow-md)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>Filtrlar</span>
              {activeFilterCount > 0 && (
                <button onClick={clearFilters} style={{
                  background: 'none', border: 'none', color: 'var(--primary)',
                  fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', gap: 4,
                }}>
                  <X size={14} /> Tozalash
                </button>
              )}
            </div>

            <div style={{ marginBottom: 14 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>To'lov turi</span>
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { value: '', label: 'Barchasi' },
                  { value: 'BARTER', label: 'Barter' },
                  { value: 'PAID', label: 'Pullik' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setAdType(opt.value)}
                    style={{
                      flex: 1, padding: '8px 12px', borderRadius: 'var(--radius-xs)',
                      border: `1.5px solid ${adType === opt.value ? 'var(--primary-border)' : 'var(--border)'}`,
                      background: adType === opt.value ? 'var(--primary-bg)' : 'transparent',
                      color: adType === opt.value ? 'var(--primary)' : 'var(--text-secondary)',
                      fontSize: 13, fontWeight: adType === opt.value ? 600 : 500,
                      cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s ease',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>Soha</span>
              <select className="form-select" value={industry} onChange={(e) => setIndustry(e.target.value)} style={{ fontSize: 13 }}>
                <option value="">Barcha sohalar</option>
                {INDUSTRIES.map((ind) => <option key={ind} value={ind}>{ind}</option>)}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Active filter tags */}
      {activeFilterCount > 0 && !showFilters && (
        <div style={{ display: 'flex', gap: 6, marginBottom: 12, marginTop: 4, flexWrap: 'wrap' }}>
          {adType && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '5px 10px', borderRadius: 'var(--radius-xs)',
              background: 'var(--primary-bg)', color: 'var(--primary)',
              fontSize: 12, fontWeight: 600,
            }}>
              {adType === 'BARTER' ? 'Barter' : 'Pullik'}
              <X size={14} style={{ cursor: 'pointer' }} onClick={() => setAdType('')} />
            </span>
          )}
          {industry && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '5px 10px', borderRadius: 'var(--radius-xs)',
              background: 'var(--primary-bg)', color: 'var(--primary)',
              fontSize: 12, fontWeight: 600,
            }}>
              {industry}
              <X size={14} style={{ cursor: 'pointer' }} onClick={() => setIndustry('')} />
            </span>
          )}
        </div>
      )}

      {/* Ads list */}
      {loading ? (
        <FeedShimmer />
      ) : ads.length === 0 ? (
        <div className="empty-state">
          <Search size={40} style={{ color: 'var(--text-muted)', opacity: 0.4, marginBottom: 12 }} />
          <p>Hozircha e'lonlar yo'q</p>
        </div>
      ) : (
        <div>
          {ads.map((ad, i) => (
            <div key={ad.id} style={{ animationDelay: `${i * 0.05}s` }}>
              <AdCard ad={ad} />
            </div>
          ))}
        </div>
      )}

      <BottomNav />
    </div>
    </PullToRefresh>
  );
}
