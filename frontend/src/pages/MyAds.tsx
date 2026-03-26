import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ClipboardList, Eye, Users, Clock, CheckCircle2, XCircle, TrendingUp, Repeat2, DollarSign, ChevronRight, BarChart3 } from 'lucide-react';
import api from '../lib/api';
import BottomNav from '../components/BottomNav';
import { MyAdCardShimmer } from '../components/Shimmer';
import PullToRefresh from '../components/PullToRefresh';
import { useCacheStore } from '../store/cache';

export default function MyAds() {
  const navigate = useNavigate();
  const cache = useCacheStore();
  const [ads, setAds] = useState<any[]>(cache.myAds || []);
  const [loading, setLoading] = useState(!cache.myAds);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'CLOSED'>('ALL');

  const cachedMyAds = useCacheStore(s => s.myAds);

  const fetchMyAds = () => {
    setLoading(true);
    api.get('/ads/my/list')
      .then((res) => { setAds(res.data); useCacheStore.getState().setMyAds(res.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const cached = useCacheStore.getState().myAds;
    if (cached) {
      setAds(cached);
      setLoading(false);
      return;
    }
    fetchMyAds();
  }, []);

  // Cache invalidate bo'lganda qayta fetch
  const initialLoadDone = useRef(false);
  useEffect(() => {
    if (cachedMyAds === null && initialLoadDone.current) {
      fetchMyAds();
    }
    if (cachedMyAds !== null) initialLoadDone.current = true;
  }, [cachedMyAds]);

  const filteredAds = filter === 'ALL' ? ads : ads.filter((ad) => ad.status === filter);
  const activeCount = ads.filter((a) => a.status === 'ACTIVE').length;
  const closedCount = ads.filter((a) => a.status === 'CLOSED').length;
  const totalApps = ads.reduce((sum, a) => sum + (a._count?.applications || 0), 0);

  const handleRefresh = async () => {
    cache.invalidateMyAds();
    setLoading(true);
    try {
      const res = await api.get('/ads/my/list');
      setAds(res.data);
      cache.setMyAds(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
    <div className="page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">E'lonlarim</h1>
          <p className="page-subtitle">{ads.length} ta e'lon</p>
        </div>
        <button className="btn btn-primary btn-sm" style={{ width: 'auto' }} onClick={() => navigate('/create-ad')}>
          <Plus size={16} /> Yangi
        </button>
      </div>

      {loading ? (
        <><MyAdCardShimmer /><MyAdCardShimmer /><MyAdCardShimmer /></>
      ) : ads.length === 0 ? (
        <div className="empty-state">
          <ClipboardList size={40} style={{ color: 'var(--text-muted)', opacity: 0.4, marginBottom: 12 }} />
          <p>Hali e'lon joylamagansiz</p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Birinchi e'loningizni yarating va influenserlarni toping</p>
          <button className="btn btn-primary" style={{ marginTop: 20, maxWidth: 220 }} onClick={() => navigate('/create-ad')}>
            <Plus size={16} /> E'lon yaratish
          </button>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
            <div className="card" style={{ textAlign: 'center', padding: '14px 8px', marginBottom: 0 }}>
              <BarChart3 size={18} style={{ color: 'var(--primary)', marginBottom: 6 }} />
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>{ads.length}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, marginTop: 2 }}>Jami</div>
            </div>
            <div className="card" style={{ textAlign: 'center', padding: '14px 8px', marginBottom: 0 }}>
              <CheckCircle2 size={18} style={{ color: 'var(--secondary)', marginBottom: 6 }} />
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>{activeCount}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, marginTop: 2 }}>Faol</div>
            </div>
            <div className="card" style={{ textAlign: 'center', padding: '14px 8px', marginBottom: 0 }}>
              <Users size={18} style={{ color: 'var(--warning-text)', marginBottom: 6 }} />
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>{totalApps}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, marginTop: 2 }}>Arizalar</div>
            </div>
          </div>

          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
            {([
              { value: 'ALL', label: 'Barchasi', count: ads.length },
              { value: 'ACTIVE', label: 'Faol', count: activeCount },
              { value: 'CLOSED', label: 'Yopilgan', count: closedCount },
            ] as const).map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFilter(tab.value)}
                style={{
                  flex: 1, padding: '8px 10px', borderRadius: 'var(--radius-xs)',
                  border: `1.5px solid ${filter === tab.value ? 'var(--primary-border)' : 'var(--border)'}`,
                  background: filter === tab.value ? 'var(--primary-bg)' : 'transparent',
                  color: filter === tab.value ? 'var(--primary)' : 'var(--text-muted)',
                  fontSize: 13, fontWeight: filter === tab.value ? 600 : 500,
                  cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s ease',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                {tab.label}
                <span style={{
                  fontSize: 11, fontWeight: 700,
                  background: filter === tab.value ? 'var(--primary)' : 'var(--border)',
                  color: filter === tab.value ? '#fff' : 'var(--text-muted)',
                  padding: '1px 7px', borderRadius: 100,
                }}>{tab.count}</span>
              </button>
            ))}
          </div>

          {/* Ad cards */}
          {filteredAds.length === 0 ? (
            <div className="empty-state" style={{ padding: '32px 20px' }}>
              <p style={{ fontSize: 14 }}>Bu kategoriyada e'lon yo'q</p>
            </div>
          ) : (
            filteredAds.map((ad, i) => {
              const appCount = ad._count?.applications || 0;
              const progress = ad.influencerCount > 0 ? (appCount / ad.influencerCount) * 100 : 0;
              const images = typeof ad.images === 'string' ? JSON.parse(ad.images || '[]') : ad.images || [];
              const platforms = typeof ad.platforms === 'string' ? JSON.parse(ad.platforms || '[]') : ad.platforms || [];

              return (
                <div key={ad.id} className="card card-interactive fade-in" style={{ padding: 0, overflow: 'hidden' }}
                  onClick={() => navigate(`/ad/${ad.id}`)}>

                  {/* Image banner */}
                  {images.length > 0 && (
                    <div style={{ height: 120, overflow: 'hidden', position: 'relative' }}>
                      <img src={images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{
                        position: 'absolute', top: 10, right: 10,
                      }}>
                        <span className={`badge badge-${ad.status.toLowerCase()}`} style={{
                          backdropFilter: 'blur(8px)', background: ad.status === 'ACTIVE' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                        }}>
                          {ad.status === 'ACTIVE' ? 'Faol' : 'Yopilgan'}
                        </span>
                      </div>
                    </div>
                  )}

                  <div style={{ padding: 16 }}>
                    {/* Title row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.3 }}>{ad.title}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}>
                            {ad.adType === 'BARTER' ? <Repeat2 size={13} /> : <DollarSign size={13} />}
                            {ad.adType === 'BARTER' ? 'Barter' : `${ad.payment?.toLocaleString()} so'm`}
                          </span>
                          <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--border-strong)' }} />
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}>
                            <Clock size={13} />
                            {new Date(ad.createdAt).toLocaleDateString('uz')}
                          </span>
                        </div>
                      </div>
                      {images.length === 0 && (
                        <span className={`badge badge-${ad.status.toLowerCase()}`}>
                          {ad.status === 'ACTIVE' ? 'Faol' : 'Yopilgan'}
                        </span>
                      )}
                    </div>

                    {/* Platforms */}
                    {platforms.length > 0 && (
                      <div className="tag-list" style={{ marginBottom: 12 }}>
                        {platforms.map((p: string) => <span key={p} className="tag">{p}</span>)}
                      </div>
                    )}

                    {/* Progress */}
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Influenser slotlari</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)' }}>
                          {appCount} / {ad.influencerCount}
                        </span>
                      </div>
                      <div className="slot-progress">
                        <div className="slot-progress-fill" style={{ width: `${Math.min(progress, 100)}%` }} />
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-secondary btn-sm" style={{ flex: 1 }}
                        onClick={(e) => { e.stopPropagation(); navigate(`/ad/${ad.id}`); }}>
                        <Eye size={15} /> Ko'rish
                      </button>
                      <button className="btn btn-primary btn-sm" style={{ flex: 1 }}
                        onClick={(e) => { e.stopPropagation(); navigate(`/ad/${ad.id}/applications`); }}>
                        <Users size={15} /> Arizalar
                        {appCount > 0 && (
                          <span style={{
                            background: 'rgba(255,255,255,0.25)', padding: '1px 7px',
                            borderRadius: 100, fontSize: 11, fontWeight: 700,
                          }}>{appCount}</span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </>
      )}

      <BottomNav />
    </div>
    </PullToRefresh>
  );
}
