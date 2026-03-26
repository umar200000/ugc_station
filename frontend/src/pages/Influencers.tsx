import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users, Star, ChevronRight, SlidersHorizontal, X, Award, TrendingUp, Sparkles } from 'lucide-react';
import api from '../lib/api';
import BottomNav from '../components/BottomNav';
import { InfluencerCardShimmer } from '../components/Shimmer';
import PullToRefresh from '../components/PullToRefresh';
import { useCacheStore } from '../store/cache';
import { INDUSTRIES } from '../types';

export default function Influencers() {
  const navigate = useNavigate();
  const cache = useCacheStore();
  const [influencers, setInfluencers] = useState<any[]>(cache.influencers || []);
  const [loading, setLoading] = useState(!cache.influencers);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [isStuck, setIsStuck] = useState(false);
  const stickyRef = useRef<HTMLDivElement>(null);

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

  const fetchInfluencers = async (force = false) => {
    const paramKey = `${category}|${search}`;
    const cacheState = useCacheStore.getState();
    if (!force && cacheState.influencers && cacheState.influencerParams === paramKey) {
      setInfluencers(cacheState.influencers);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const params: any = {};
      if (category) params.category = category;
      if (search) params.search = search;
      const res = await api.get('/users/influencers', { params });
      setInfluencers(res.data.influencers);
      useCacheStore.getState().setInfluencers(res.data.influencers, paramKey);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInfluencers(); }, [category]);

  const handleRefresh = async () => {
    cache.setInfluencers([], '');
    await fetchInfluencers(true);
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
    <div className="page">
      {/* Hero Header */}
      <div className="inf-header slide-up">
        <div className="inf-header-bg" />
        <div className="inf-header-content">
          <div className="inf-header-icon">
            <Users size={24} />
          </div>
          <h1 className="inf-header-title">Influenserlar</h1>
          <p className="inf-header-sub">Eng yaxshi kontentmakerlarni toping va hamkorlik qiling</p>
          <div className="inf-header-stats">
            <div className="inf-header-stat">
              <Sparkles size={14} />
              <span>{influencers.length} influenser</span>
            </div>
            <div className="inf-header-stat-divider" />
            <div className="inf-header-stat">
              <Award size={14} />
              <span>{influencers.filter((i: any) => i.avgRating >= 4).length} top reyting</span>
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
            <input className="form-input" style={{ paddingLeft: 42, borderRadius: 14 }}
              placeholder="Ism yoki yo'nalish bo'yicha qidiring..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchInfluencers()} />
          </div>
          <button
            onClick={() => setShowFilter(!showFilter)}
            className="feed-filter-btn"
            style={{
              borderColor: showFilter || category ? 'var(--primary-border)' : 'var(--border-strong)',
              background: showFilter || category ? 'var(--primary-bg)' : 'var(--bg-card)',
              color: showFilter || category ? 'var(--primary)' : 'var(--text-muted)',
            }}
          >
            <SlidersHorizontal size={20} />
            {category && <span className="feed-filter-count">1</span>}
          </button>
        </div>

        {/* Filter panel */}
        {showFilter && (
          <div className="feed-filter-panel fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 15, fontWeight: 700 }}>Yo'nalish</span>
              {category && (
                <button onClick={() => setCategory('')} className="feed-filter-clear">
                  <X size={14} /> Tozalash
                </button>
              )}
            </div>
            <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)} style={{ fontSize: 13, borderRadius: 12 }}>
              <option value="">Barcha yo'nalishlar</option>
              {INDUSTRIES.map((ind) => <option key={ind} value={ind}>{ind}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* Active filter tag */}
      {category && !showFilter && (
        <div className="feed-active-filters fade-in" style={{ marginTop: 4 }}>
          <span className="feed-active-tag">
            {category}
            <X size={14} onClick={() => setCategory('')} />
          </span>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="inf-grid">
          <InfluencerCardShimmer /><InfluencerCardShimmer /><InfluencerCardShimmer /><InfluencerCardShimmer />
        </div>
      ) : influencers.length === 0 ? (
        <div className="empty-state fade-in">
          <div style={{
            width: 80, height: 80, borderRadius: 24,
            background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(139,92,246,0.2))',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
          }}>
            <Users size={36} style={{ color: '#8B5CF6', opacity: 0.6 }} />
          </div>
          <p style={{ fontWeight: 600, fontSize: 16 }}>Influenserlar topilmadi</p>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>Filtrlarni o'zgartiring</p>
        </div>
      ) : (
        <div className="inf-grid">
          {influencers.map((inf, i) => (
            <div key={inf.id} className="inf-card fade-in"
              onClick={() => navigate(`/influencer/${inf.id}`)}>

              <div className="inf-card-body">
                {/* Top row: avatar + info + arrow */}
                <div className="inf-card-top">
                  <div className="inf-card-avatar-wrap">
                    <div className="inf-card-avatar">
                      {inf.user?.photoUrl
                        ? <img src={inf.user.photoUrl} alt="" />
                        : <span>{inf.name?.[0] || '?'}</span>}
                    </div>
                    {inf.avgRating >= 4.5 && (
                      <div className="inf-card-verified">
                        <Award size={10} />
                      </div>
                    )}
                  </div>

                  <div className="inf-card-info">
                    <h3 className="inf-card-name">{inf.name}</h3>
                    <span className="inf-card-category">{inf.category}</span>
                  </div>

                  <div className="inf-card-arrow">
                    <ChevronRight size={18} />
                  </div>
                </div>

                {/* Bottom row: stats */}
                <div className="inf-card-stats">
                  <div className={`inf-card-stat ${inf.avgRating > 0 ? 'inf-card-stat--rating' : ''}`}>
                    <Star size={13} fill={inf.avgRating > 0 ? 'var(--warning)' : 'none'} stroke={inf.avgRating > 0 ? 'var(--warning)' : 'currentColor'} />
                    <span>{inf.avgRating > 0 ? Number(inf.avgRating).toFixed(1) : 'Yangi'}</span>
                  </div>
                  <div className="inf-card-stat">
                    <TrendingUp size={13} />
                    <span>{inf.completedCollabs || 0} hamkorlik</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <BottomNav />
    </div>
    </PullToRefresh>
  );
}
