import { useState, useEffect, useRef, useMemo } from 'react';
import { Search, RefreshCw } from 'lucide-react';
import NotificationBell from '../components/NotificationBell';
import api from '../lib/api';
import AdCard from '../components/AdCard';
import BottomNav from '../components/BottomNav';
import { FeedShimmer } from '../components/Shimmer';
import PullToRefresh from '../components/PullToRefresh';
import { useAuthStore } from '../store/auth';
import { useCacheStore } from '../store/cache';
import type { Ad } from '../types';

type FeedTab = 'all' | 'paid' | 'barter';

export default function Feed() {
  const { user } = useAuthStore();
  const cache = useCacheStore();
  const [ads, setAds] = useState<Ad[]>(cache.feedAds || []);
  const [loading, setLoading] = useState(!cache.feedAds);
  const [adType, setAdType] = useState('');
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<FeedTab>('all');
  const [earnings, setEarnings] = useState<{ total: number; paid: number; barter: number } | null>(null);
  const isInfluencer = user?.role === 'INFLUENCER';
  const barHeights = useMemo(() => Array.from({ length: 28 }, () => 20 + Math.random() * 80), []);

  useEffect(() => {
    if (isInfluencer) {
      api.get('/my-earnings').then(res => setEarnings(res.data)).catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'paid') setAdType('PAID');
    else if (activeTab === 'barter') setAdType('BARTER');
    else setAdType('');
  }, [activeTab]);


  const fetchAds = async (force = false) => {
    const paramKey = `${adType}|${search}`;
    const cacheState = useCacheStore.getState();
    if (!force && cacheState.feedAds && cacheState.feedParams === paramKey) {
      setAds(cacheState.feedAds);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const params: any = {};
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

  useEffect(() => { fetchAds(); }, [adType]);

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
    if (isInfluencer) {
      api.get('/my-earnings').then(res => setEarnings(res.data)).catch(() => {});
    }
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
    <div className="page ios-feed">
      {/* iOS-style Header */}
      <div className="ios-feed-header">
        <div className="ios-feed-header-top">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {user?.role === 'INFLUENCER' && user?.influencer?.level && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  background: 'rgba(27,59,81,0.08)',
                  borderRadius: 8, padding: '3px 10px', fontSize: 11, fontWeight: 700,
                  color: '#1B3B51',
                }}>
                  Lvl {user.influencer.level}
                </span>
              )}
              <p style={{ fontSize: 14, color: '#8E8E93', margin: 0 }}>Salom, {user?.firstName}</p>
            </div>
            <h1 className="ios-feed-headline" style={{ margin: 0 }}>UGC Station</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={async () => {
                useCacheStore.getState().invalidateAll();
                await useAuthStore.getState().refreshUser();
                window.dispatchEvent(new CustomEvent('app-refresh'));
                fetchAds(true);
              }}
              style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'rgba(27,59,81,0.08)', border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#1B3B51',
              }}
            >
              <RefreshCw size={18} strokeWidth={2} />
            </button>
            <NotificationBell />
          </div>
        </div>

      </div>

      {/* Earnings — influencer only (inside header area) */}
      {isInfluencer && earnings && (
        <>
          {/* Amount + chart */}
          <div style={{ textAlign: 'center', marginBottom: 6 }}>
            <div style={{ fontSize: 36, fontWeight: 800, color: '#1B3B51', letterSpacing: -1 }}>
              {earnings.total.toLocaleString('uz-UZ').replace(/,/g, ' ')}
              <span style={{ fontSize: 15, fontWeight: 600, color: '#8E8E93', marginLeft: 4 }}>so'm</span>
            </div>
            <div style={{
              display: 'flex', alignItems: 'flex-end', gap: 2,
              height: 32, justifyContent: 'center', marginTop: 8, marginBottom: 6,
            }}>
              {barHeights.map((h, i) => (
                <div key={i} style={{
                  width: 5, borderRadius: 2,
                  height: `${h}%`, minHeight: 3,
                  background: '#1B3B51', opacity: 0.12 + (h / 100) * 0.55,
                }} />
              ))}
            </div>
          </div>

          {/* Segmented tabs */}
          <div style={{
            display: 'flex', gap: 0,
            background: 'rgba(27,59,81,0.06)', borderRadius: 10,
            padding: 3, marginBottom: 14,
          }}>
            {([
              { key: 'all', label: 'Barchasi' },
              { key: 'paid', label: 'Pullik' },
              { key: 'barter', label: 'Barter' },
            ] as { key: FeedTab; label: string }[]).map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  flex: 1, padding: '7px 0', border: 'none',
                  background: activeTab === tab.key ? '#fff' : 'transparent',
                  borderRadius: 8,
                  fontSize: 13, fontWeight: activeTab === tab.key ? 700 : 500,
                  color: activeTab === tab.key ? '#1B3B51' : '#8E8E93',
                  cursor: 'pointer', fontFamily: 'inherit',
                  boxShadow: activeTab === tab.key ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Motivatsion banner — influencer only */}
      {isInfluencer && earnings && earnings.total < 500000 && (
        <div style={{
          background: 'linear-gradient(135deg, #1B3B51, #2A5570)',
          borderRadius: 14, padding: '14px 16px', marginBottom: 14,
          display: 'flex', alignItems: 'center', gap: 12, color: '#fff',
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12, flexShrink: 0,
            background: 'rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20,
          }}>💰</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.5 }}>
              500 000 so'mgacha ishlab toping
            </div>
            <div style={{ fontSize: 11, opacity: 0.75, marginTop: 2, lineHeight: 1.4 }}>
              Balansdagi 100 000 so'm sizga beriladi
            </div>
          </div>
          <div style={{
            fontSize: 12, fontWeight: 700, opacity: 0.6, whiteSpace: 'nowrap',
          }}>
            {Math.round(earnings.total / 500000 * 100)}%
          </div>
        </div>
      )}

      {/* Search + count */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        marginBottom: 14,
      }}>
        <div className="ios-search-wrap" style={{ flex: 1 }}>
          <Search size={16} className="ios-search-icon" />
          <input
            className="ios-search-input"
            placeholder="E'lonlarni qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
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
