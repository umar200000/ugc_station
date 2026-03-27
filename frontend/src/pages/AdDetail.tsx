import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, Handshake, ClipboardList, Repeat2, Banknote, Pencil, Power, PowerOff, AlertTriangle } from 'lucide-react';
import api from '../lib/api';
import { useAuthStore } from '../store/auth';
import { AdDetailShimmer } from '../components/Shimmer';
import { hapticFeedback } from '../lib/telegram';
import { useCacheStore } from '../store/cache';
import type { Ad } from '../types';

export default function AdDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [ad, setAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleImageScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollLeft = el.scrollLeft;
    const itemWidth = el.children[0]?.clientWidth || 1;
    setActiveImg(Math.round(scrollLeft / (itemWidth + 10)));
  }, []);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    api.get(`/ads/${id}`)
      .then((res) => setAd(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleApply = async () => {
    if (!ad) return;
    setApplying(true);
    hapticFeedback('medium');
    try {
      await api.post('/applications', { adId: ad.id });
      setApplied(true);
      useCacheStore.getState().invalidateFeed();
      useCacheStore.getState().setMyApplications(null as any);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Xatolik');
    } finally {
      setApplying(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!ad) return;
    setToggling(true);
    hapticFeedback('medium');
    try {
      const endpoint = ad.status === 'ACTIVE' ? `/ads/${ad.id}/close` : `/ads/${ad.id}/reactivate`;
      const res = await api.patch(endpoint);
      setAd((prev) => prev ? { ...prev, status: res.data.status } : prev);
      useCacheStore.getState().invalidateMyAds();
      useCacheStore.getState().invalidateFeed();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Xatolik');
    } finally {
      setToggling(false);
    }
  };

  const handleShare = () => {
    const text = `${ad?.title} — UGC Marketplace`;
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: ad?.title, text, url });
    } else {
      navigator.clipboard.writeText(`${text}\n${url}`);
    }
  };

  if (loading) return <AdDetailShimmer />;
  if (!ad) return <div className="page"><div className="empty-state"><p>E'lon topilmadi</p></div></div>;

  const isOwner = !!(
    user?.role === 'COMPANY' &&
    user.company?.id &&
    ad.companyId &&
    user.company.id === ad.companyId
  );
  const isClosed = ad.status === 'CLOSED';
  const progress = ad.influencerCount > 0 ? ((ad.acceptedCount || 0) / ad.influencerCount) * 100 : 0;
  const slotsLeft = ad.slotsLeft ?? (ad.influencerCount - (ad.acceptedCount || 0));
  const hasImages = ad.images && ad.images.length > 0;
  const parallaxY = Math.min(scrollY * 0.4, 120);
  const headerOpacity = Math.min(scrollY / 250, 1);
  const imageScale = 1 + Math.max(0, -scrollY * 0.001);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* Floating back + share bar */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 60,
        maxWidth: 480, margin: '0 auto',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '12px 16px',
        background: headerOpacity > 0.4 ? `rgba(241,245,249,${Math.min(headerOpacity, 0.97)})` : 'transparent',
        backdropFilter: headerOpacity > 0.4 ? 'blur(12px)' : 'none',
        WebkitBackdropFilter: headerOpacity > 0.4 ? 'blur(12px)' : 'none',
        boxShadow: headerOpacity > 0.6 ? '0 2px 12px rgba(15,23,42,0.06)' : 'none',
        transition: 'background 0.2s, box-shadow 0.2s',
      }}>
        <button onClick={() => navigate(-1)} style={{
          width: 40, height: 40, borderRadius: '50%',
          background: hasImages && headerOpacity < 0.5 ? 'rgba(0,0,0,0.45)' : 'var(--bg-card)',
          border: hasImages && headerOpacity < 0.5 ? 'none' : '1px solid var(--border)',
          color: hasImages && headerOpacity < 0.5 ? '#fff' : 'var(--text)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'all 0.3s ease',
          backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <ArrowLeft size={20} />
        </button>

        {/* Title appears on scroll */}
        <div style={{
          flex: 1, textAlign: 'center', padding: '0 12px',
          opacity: headerOpacity > 0.6 ? 1 : 0,
          transform: `translateY(${headerOpacity > 0.6 ? 0 : 8}px)`,
          transition: 'all 0.25s ease',
        }}>
          <p style={{ fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {ad.title}
          </p>
        </div>

        <button onClick={handleShare} style={{
          width: 40, height: 40, borderRadius: '50%',
          background: hasImages && headerOpacity < 0.5 ? 'rgba(0,0,0,0.45)' : 'var(--bg-card)',
          border: hasImages && headerOpacity < 0.5 ? 'none' : '1px solid var(--border)',
          color: hasImages && headerOpacity < 0.5 ? '#fff' : 'var(--text)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'all 0.3s ease',
          backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <Share2 size={18} />
        </button>
      </div>

      {/* Hero image with parallax */}
      {hasImages ? (
        <div style={{
          position: 'relative', overflow: 'hidden',
          height: 320, marginBottom: -24,
        }}>
          {ad.images!.length === 1 ? (
            <img src={ad.images![0]} alt="" style={{
              width: '100%', height: '100%', objectFit: 'cover',
              transform: `translateY(${parallaxY}px) scale(${imageScale})`,
              filter: isClosed ? 'grayscale(0.5)' : 'none',
            }} />
          ) : (
            <div
              ref={scrollRef}
              onScroll={handleImageScroll}
              className="no-scrollbar"
              style={{
                display: 'flex', height: '100%',
                overflowX: 'auto', scrollSnapType: 'x mandatory',
                scrollBehavior: 'smooth',
              }}
            >
              {ad.images!.map((img, i) => (
                <img key={i} src={img} alt="" style={{
                  width: '100%', height: '100%', objectFit: 'cover',
                  flexShrink: 0, scrollSnapAlign: 'start',
                  transform: `translateY(${parallaxY}px) scale(${imageScale})`,
                  filter: isClosed ? 'grayscale(0.5)' : 'none',
                }} />
              ))}
            </div>
          )}
          {/* Gradient overlay */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: 50,
            background: 'linear-gradient(to top, rgba(241,245,249,0.6), transparent)',
            pointerEvents: 'none',
          }} />
          {/* Dots */}
          {ad.images!.length > 1 && (
            <div style={{
              position: 'absolute', bottom: 36, left: 0, right: 0,
              display: 'flex', justifyContent: 'center', gap: 6,
            }}>
              {ad.images!.map((_, i) => (
                <div key={i} style={{
                  width: activeImg === i ? 20 : 6, height: 6,
                  borderRadius: 100,
                  background: activeImg === i ? '#fff' : 'rgba(255,255,255,0.5)',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                }} />
              ))}
            </div>
          )}
          {/* Status badge on image */}
          <div style={{ position: 'absolute', top: 64, right: 16, display: 'flex', gap: 6 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center',
              fontSize: 13, fontWeight: 700, padding: '6px 14px', borderRadius: 100,
              background: ad.adType === 'BARTER' ? 'rgba(16,185,129,0.9)' : 'rgba(245,158,11,0.9)',
              color: '#fff',
              boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
            }}>
              {ad.adType === 'BARTER' ? 'Barter' : `${ad.payment?.toLocaleString()} so'm`}
            </span>
            {isClosed && (
              <span style={{
                display: 'inline-flex', alignItems: 'center',
                fontSize: 13, fontWeight: 700, padding: '6px 14px', borderRadius: 100,
                background: 'rgba(239,68,68,0.9)', color: '#fff',
                boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
              }}>Yopilgan</span>
            )}
          </div>
        </div>
      ) : (
        <div style={{ height: 60 }} />
      )}

      {/* Content card */}
      <div style={{
        position: 'relative', zIndex: 10,
        background: 'var(--bg)',
        borderRadius: hasImages ? '24px 24px 0 0' : 0,
        padding: '24px 16px 40px',
        maxWidth: 480, margin: '0 auto',
        minHeight: 'calc(100vh - 300px)',
      }}>
        {/* Drag handle */}
        {hasImages && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <div style={{ width: 36, height: 4, borderRadius: 100, background: 'var(--border-strong)' }} />
          </div>
        )}

        {/* Closed banner */}
        {isClosed && (
          <div className="fade-in" style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '12px 16px', borderRadius: 'var(--radius-sm)',
            background: 'var(--danger-bg)', border: '1px solid rgba(239,68,68,0.15)',
            marginBottom: 16,
          }}>
            <AlertTriangle size={18} style={{ color: 'var(--danger)', flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--danger)' }}>E'lon yopilgan</p>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                Bu e'lon hozir faol emas. {isOwner ? 'Qayta ochishingiz mumkin.' : ''}
              </p>
            </div>
          </div>
        )}

        {/* Title */}
        <div className="fade-in" style={{ marginBottom: 20, opacity: isClosed ? 0.7 : 1 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.4, lineHeight: 1.3 }}>{ad.title}</h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 8 }}>
            {ad.company?.name} · {ad.industry}
          </p>
          {!hasImages && (
            <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
              <span className={`badge badge-${ad.adType.toLowerCase()}`}>
                {ad.adType === 'BARTER' ? 'Barter' : `${ad.payment?.toLocaleString()} so'm`}
              </span>
              {isClosed && <span className="badge badge-closed">Yopilgan</span>}
            </div>
          )}
        </div>

        {/* Owner actions */}
        {isOwner && (
          <div className="fade-in" style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => navigate(`/ad/${ad.id}/edit`)}>
              <Pencil size={15} /> Tahrirlash
            </button>
            <button
              className={`btn btn-sm ${isClosed ? 'btn-success' : 'btn-danger'}`}
              style={{ flex: 1 }}
              disabled={toggling}
              onClick={handleToggleStatus}
            >
              {toggling ? '...' : isClosed ? (
                <><Power size={15} /> Qayta ochish</>
              ) : (
                <><PowerOff size={15} /> Yopish</>
              )}
            </button>
          </div>
        )}

        {/* Slot bar */}
        <div className="slot-bar fade-in" style={{ opacity: isClosed ? 0.6 : 1 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span className="slot-text">{ad.acceptedCount || 0} / {ad.influencerCount} influenser</span>
              <span className="slot-text" style={{ color: slotsLeft > 0 && !isClosed ? 'var(--secondary)' : 'var(--danger)' }}>
                {isClosed ? 'Yopilgan' : slotsLeft > 0 ? `${slotsLeft} joy bor` : "To'lgan"}
              </span>
            </div>
            <div className="slot-progress">
              <div className="slot-progress-fill" style={{ width: `${Math.min(progress, 100)}%` }} />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="card fade-in">
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Tavsif</p>
          <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--text-secondary)' }}>{ad.description}</p>
        </div>

        {/* Barter */}
        {ad.adType === 'BARTER' && ad.barterItem && (
          <div className="card fade-in" style={{ background: 'var(--secondary-bg)', borderColor: 'rgba(16,185,129,0.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Repeat2 size={16} style={{ color: 'var(--secondary)' }} />
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Barter narsasi</p>
            </div>
            <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>{ad.barterItem}</p>
          </div>
        )}

        {/* Requirements */}
        <div className="card fade-in">
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>Talablar</p>
          <div className="info-row">
            <span className="info-label">Video formati</span>
            <span className="info-value">{ad.videoFormat === 'ANY' ? "Farqi yo'q" : ad.videoFormat === 'ONLINE' ? 'Online' : 'Offline'}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Yuz ko'rinishi</span>
            <span className="info-value">{ad.faceType === 'ANY' ? "Farqi yo'q" : ad.faceType === 'FACE' ? 'Face' : 'Faceless'}</span>
          </div>
          {ad.platforms?.length > 0 && (
            <div style={{ paddingTop: 12 }}>
              <span className="info-label" style={{ display: 'block', marginBottom: 8 }}>Platformalar</span>
              <div className="tag-list">
                {ad.platforms.map((p) => <span key={p} className="tag">{p}</span>)}
              </div>
            </div>
          )}
        </div>

        {/* Bottom actions */}
        <div style={{ display: 'flex', gap: 10, marginTop: 8 }} className="fade-in">
          {user?.role === 'INFLUENCER' && !isClosed && slotsLeft > 0 && (
            <button className={`btn ${applied ? 'btn-success' : 'btn-primary'}`} style={{ flex: 1 }} disabled={applying || applied} onClick={handleApply}>
              {applied ? (
                <><Handshake size={18} /> Ariza yuborildi</>
              ) : applying ? 'Yuborilmoqda...' : (
                <><Handshake size={18} /> Ariza yuborish</>
              )}
            </button>
          )}
          {isOwner && (
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => navigate(`/ad/${ad.id}/applications`)}>
              <ClipboardList size={18} /> Arizalar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
