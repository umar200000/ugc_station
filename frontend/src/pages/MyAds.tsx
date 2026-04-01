import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ClipboardList, Eye, Users, Clock, CheckCircle2, XCircle, TrendingUp, Repeat2, Banknote, ChevronRight, BarChart3 } from 'lucide-react';
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

  useEffect(() => {
    const handler = () => { cache.invalidateMyAds(); };
    window.addEventListener('app-refresh', handler);
    return () => window.removeEventListener('app-refresh', handler);
  }, []);

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
    <div style={{ background: '#F2F2F7', minHeight: '100vh', paddingBottom: 80 }}>
      {/* iOS-style clean white header */}
      <div style={{
        background: '#fff', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: '1px solid #E5E5EA',
      }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1B3B51', margin: 0 }}>E'lonlarim</h1>
          <p style={{ fontSize: 13, color: '#8E8E93', margin: '4px 0 0 0' }}>{ads.length} ta e'lon</p>
        </div>
        <button
          onClick={() => navigate('/create-ad')}
          style={{
            background: '#1B3B51', color: '#fff', border: 'none', borderRadius: 12,
            padding: '8px 16px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit',
          }}
        >
          <Plus size={16} /> Yangi
        </button>
      </div>

      <div style={{ padding: '16px 16px 0' }}>
        {loading ? (
          <><MyAdCardShimmer /><MyAdCardShimmer /><MyAdCardShimmer /></>
        ) : ads.length === 0 ? (
          <div style={{
            background: '#fff', border: '1px solid #E5E5EA', borderRadius: 16,
            padding: '40px 20px', textAlign: 'center',
          }}>
            <ClipboardList size={40} style={{ color: '#8E8E93', opacity: 0.4, marginBottom: 12 }} />
            <p style={{ color: '#1B3B51', fontWeight: 500 }}>Hali e'lon joylamagansiz</p>
            <p style={{ fontSize: 13, color: '#8E8E93', marginTop: 4 }}>Birinchi e'loningizni yarating va influenserlarni toping</p>
            <button
              onClick={() => navigate('/create-ad')}
              style={{
                marginTop: 20, maxWidth: 220, background: '#1B3B51', color: '#fff',
                border: 'none', borderRadius: 12, padding: '10px 20px', fontSize: 14,
                fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center',
                gap: 6, fontFamily: 'inherit',
              }}
            >
              <Plus size={16} /> E'lon yaratish
            </button>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
              <div style={{
                background: '#fff', border: '1px solid #E5E5EA', borderRadius: 16,
                textAlign: 'center', padding: '14px 8px',
              }}>
                <BarChart3 size={18} style={{ color: '#1B3B51', marginBottom: 6 }} />
                <div style={{ fontSize: 20, fontWeight: 700, color: '#1B3B51' }}>{ads.length}</div>
                <div style={{ fontSize: 11, color: '#8E8E93', fontWeight: 500, marginTop: 2 }}>Jami</div>
              </div>
              <div style={{
                background: '#fff', border: '1px solid #E5E5EA', borderRadius: 16,
                textAlign: 'center', padding: '14px 8px',
              }}>
                <CheckCircle2 size={18} style={{ color: '#1B3B51', marginBottom: 6 }} />
                <div style={{ fontSize: 20, fontWeight: 700, color: '#1B3B51' }}>{activeCount}</div>
                <div style={{ fontSize: 11, color: '#8E8E93', fontWeight: 500, marginTop: 2 }}>Faol</div>
              </div>
              <div style={{
                background: '#fff', border: '1px solid #E5E5EA', borderRadius: 16,
                textAlign: 'center', padding: '14px 8px',
              }}>
                <Users size={18} style={{ color: '#1B3B51', marginBottom: 6 }} />
                <div style={{ fontSize: 20, fontWeight: 700, color: '#1B3B51' }}>{totalApps}</div>
                <div style={{ fontSize: 11, color: '#8E8E93', fontWeight: 500, marginTop: 2 }}>Arizalar</div>
              </div>
            </div>

            {/* Filter tabs - iOS segmented control */}
            <div style={{
              display: 'flex', gap: 4, marginBottom: 16, background: '#E5E5EA',
              borderRadius: 10, padding: 2,
            }}>
              {([
                { value: 'ALL', label: 'Barchasi', count: ads.length },
                { value: 'ACTIVE', label: 'Faol', count: activeCount },
                { value: 'CLOSED', label: 'Yopilgan', count: closedCount },
              ] as const).map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setFilter(tab.value)}
                  style={{
                    flex: 1, padding: '8px 10px', borderRadius: 8,
                    border: 'none',
                    background: filter === tab.value ? '#fff' : 'transparent',
                    boxShadow: filter === tab.value ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                    color: filter === tab.value ? '#1B3B51' : '#8E8E93',
                    fontSize: 13, fontWeight: filter === tab.value ? 600 : 500,
                    cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s ease',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}
                >
                  {tab.label}
                  <span style={{
                    fontSize: 11, fontWeight: 700,
                    background: filter === tab.value ? '#1B3B51' : '#C7C7CC',
                    color: '#fff',
                    padding: '1px 7px', borderRadius: 100,
                  }}>{tab.count}</span>
                </button>
              ))}
            </div>

            {/* Ad cards */}
            {filteredAds.length === 0 ? (
              <div style={{
                background: '#fff', border: '1px solid #E5E5EA', borderRadius: 16,
                padding: '32px 20px', textAlign: 'center',
              }}>
                <p style={{ fontSize: 14, color: '#8E8E93' }}>Bu kategoriyada e'lon yo'q</p>
              </div>
            ) : (
              filteredAds.map((ad, i) => {
                const appCount = ad._count?.applications || 0;
                const progress = ad.influencerCount > 0 ? (appCount / ad.influencerCount) * 100 : 0;
                const images = typeof ad.images === 'string' ? JSON.parse(ad.images || '[]') : ad.images || [];
                const platforms = typeof ad.platforms === 'string' ? JSON.parse(ad.platforms || '[]') : ad.platforms || [];

                return (
                  <div key={ad.id} style={{
                    background: '#fff', border: '1px solid #E5E5EA', borderRadius: 16,
                    overflow: 'hidden', marginBottom: 12, cursor: 'pointer',
                  }}
                    onClick={() => navigate(`/ad/${ad.id}`)}>

                    {/* Image banner */}
                    {images.length > 0 && (
                      <div style={{ height: 120, overflow: 'hidden', position: 'relative' }}>
                        <img src={images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{
                          position: 'absolute', top: 10, right: 10,
                        }}>
                          <span style={{
                            backdropFilter: 'blur(8px)',
                            background: ad.status === 'ACTIVE' ? 'rgba(52,199,89,0.15)' : 'rgba(255,59,48,0.15)',
                            color: ad.status === 'ACTIVE' ? '#34C759' : '#FF3B30',
                            fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 100,
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
                          <h3 style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.3, color: '#1B3B51', margin: 0 }}>{ad.title}</h3>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#8E8E93' }}>
                              {ad.adType === 'BARTER' ? <Repeat2 size={13} /> : <Banknote size={13} />}
                              {ad.adType === 'BARTER' ? 'Barter' : `${ad.payment?.toLocaleString()} so'm`}
                            </span>
                            <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#C7C7CC' }} />
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#8E8E93' }}>
                              <Clock size={13} />
                              {new Date(ad.createdAt).toLocaleDateString('uz')}
                            </span>
                          </div>
                        </div>
                        {images.length === 0 && (
                          <span style={{
                            background: ad.status === 'ACTIVE' ? 'rgba(52,199,89,0.12)' : 'rgba(255,59,48,0.12)',
                            color: ad.status === 'ACTIVE' ? '#34C759' : '#FF3B30',
                            fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 100,
                          }}>
                            {ad.status === 'ACTIVE' ? 'Faol' : 'Yopilgan'}
                          </span>
                        )}
                      </div>

                      {/* Platforms */}
                      {platforms.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                          {platforms.map((p: string) => (
                            <span key={p} style={{
                              background: '#F2F2F7', color: '#1B3B51', fontSize: 12, fontWeight: 500,
                              padding: '4px 10px', borderRadius: 8, border: '1px solid #E5E5EA',
                            }}>{p}</span>
                          ))}
                        </div>
                      )}

                      {/* Progress */}
                      <div style={{ marginBottom: 14 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                          <span style={{ fontSize: 12, color: '#8E8E93', fontWeight: 500 }}>Influenser slotlari</span>
                          <span style={{ fontSize: 12, fontWeight: 600, color: '#1B3B51' }}>
                            {appCount} / {ad.influencerCount}
                          </span>
                        </div>
                        <div style={{
                          height: 6, background: '#E5E5EA', borderRadius: 3, overflow: 'hidden',
                        }}>
                          <div style={{
                            width: `${Math.min(progress, 100)}%`, height: '100%',
                            background: '#1B3B51', borderRadius: 3, transition: 'width 0.3s ease',
                          }} />
                        </div>
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button style={{
                          flex: 1, background: '#F2F2F7', color: '#1B3B51', border: '1px solid #E5E5EA',
                          borderRadius: 12, padding: '8px 12px', fontSize: 14, fontWeight: 600,
                          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          gap: 6, fontFamily: 'inherit',
                        }}
                          onClick={(e) => { e.stopPropagation(); navigate(`/ad/${ad.id}`); }}>
                          <Eye size={15} /> Ko'rish
                        </button>
                        <button style={{
                          flex: 1, background: '#1B3B51', color: '#fff', border: 'none',
                          borderRadius: 12, padding: '8px 12px', fontSize: 14, fontWeight: 600,
                          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          gap: 6, fontFamily: 'inherit',
                        }}
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
      </div>

      <BottomNav />
    </div>
    </PullToRefresh>
  );
}
