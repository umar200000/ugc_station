import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users, Star, ChevronRight, SlidersHorizontal, X } from 'lucide-react';
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
    if (!force && cache.influencers && cache.influencerParams === paramKey) {
      setInfluencers(cache.influencers);
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
      cache.setInfluencers(res.data.influencers, paramKey);
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
      <div className="page-header">
        <h1 className="page-title">Influenserlar</h1>
        <p className="page-subtitle">Eng yaxshi kontentmakerlarni toping</p>
      </div>

      {/* Sentinel */}
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
            <input className="form-input" style={{ paddingLeft: 42 }} placeholder="Qidirish..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchInfluencers()} />
          </div>
          <button
            onClick={() => setShowFilter(!showFilter)}
            style={{
              width: 48, height: 48, borderRadius: 'var(--radius-sm)',
              border: `1.5px solid ${showFilter || category ? 'var(--primary-border)' : 'var(--border-strong)'}`,
              background: showFilter || category ? 'var(--primary-bg)' : 'var(--bg-card)',
              color: showFilter || category ? 'var(--primary)' : 'var(--text-muted)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative', flexShrink: 0, transition: 'all 0.2s ease',
            }}
          >
            <SlidersHorizontal size={20} />
            {category && (
              <span style={{
                position: 'absolute', top: -4, right: -4, width: 18, height: 18, borderRadius: '50%',
                background: 'var(--primary)', color: '#fff', fontSize: 10, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>1</span>
            )}
          </button>
        </div>

        {/* Filter panel */}
        {showFilter && (
          <div className="fade-in" style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', padding: 16, marginTop: 10,
            boxShadow: 'var(--shadow-md)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>Yo'nalish</span>
              {category && (
                <button onClick={() => setCategory('')} style={{
                  background: 'none', border: 'none', color: 'var(--primary)',
                  fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', gap: 4,
                }}>
                  <X size={14} /> Tozalash
                </button>
              )}
            </div>
            <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)} style={{ fontSize: 13 }}>
              <option value="">Barcha yo'nalishlar</option>
              {INDUSTRIES.map((ind) => <option key={ind} value={ind}>{ind}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* Active filter tag */}
      {category && !showFilter && (
        <div style={{ marginBottom: 12, marginTop: 4 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '5px 10px', borderRadius: 'var(--radius-xs)',
            background: 'var(--primary-bg)', color: 'var(--primary)',
            fontSize: 12, fontWeight: 600,
          }}>
            {category}
            <X size={14} style={{ cursor: 'pointer' }} onClick={() => setCategory('')} />
          </span>
        </div>
      )}

      {/* List */}
      {loading ? (
        <><InfluencerCardShimmer /><InfluencerCardShimmer /><InfluencerCardShimmer /><InfluencerCardShimmer /></>
      ) : influencers.length === 0 ? (
        <div className="empty-state">
          <Users size={40} style={{ color: 'var(--text-muted)', opacity: 0.4, marginBottom: 12 }} />
          <p>Influenserlar topilmadi</p>
        </div>
      ) : (
        influencers.map((inf, i) => (
          <div key={inf.id} className="card card-interactive fade-in" style={{ animationDelay: `${i * 0.05}s` }}
            onClick={() => navigate(`/influencer/${inf.id}`)}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <div className="avatar avatar-md">
                {inf.user?.photoUrl ? <img src={inf.user.photoUrl} alt="" /> : inf.name?.[0] || '?'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600 }}>{inf.name}</h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{inf.category}</p>
                <div style={{ display: 'flex', gap: 16, marginTop: 6 }}>
                  {inf.avgRating > 0 && (
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--warning-text)', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Star size={12} fill="var(--warning)" stroke="var(--warning)" /> {inf.avgRating}
                    </span>
                  )}
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{inf.completedCollabs} hamkorlik</span>
                </div>
              </div>
              <ChevronRight size={18} style={{ color: 'var(--text-muted)' }} />
            </div>
          </div>
        ))
      )}

      <BottomNav />
    </div>
    </PullToRefresh>
  );
}
