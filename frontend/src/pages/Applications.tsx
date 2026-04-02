import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, ChevronRight, ChevronDown, Check, X, Clock, CheckCircle2, XCircle, Send, Phone, Link, User, Video } from 'lucide-react';
import api from '../lib/api';
import { getSocialUrl } from '../lib/social';
import { ApplicationShimmer } from '../components/Shimmer';
import { hapticFeedback } from '../lib/telegram';
import type { Application } from '../types';

interface Submission {
  id: string;
  applicationId: string;
  videoUrl: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  comment?: string;
  createdAt: string;
}


const SOCIAL_ICONS: Record<string, string> = {
  instagram: '📷',
  youtube: '▶️',
  tiktok: '🎵',
  telegram: '✈️',
  facebook: '📘',
  twitter: '𝕏',
};

function parseSocialLinks(raw: string | Record<string, string>): Record<string, string> {
  if (typeof raw === 'string') {
    try { return JSON.parse(raw); } catch { return {}; }
  }
  return raw || {};
}

const statusColors: Record<string, string> = {
  PENDING: '#8E8E93',
  ACCEPTED: '#34C759',
  REJECTED: '#FF3B30',
};

export default function Applications() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<Record<string, Submission[]>>({});

  const loadSubmissions = async (appId: string) => {
    try {
      const res = await api.get(`/submissions/application/${appId}`);
      setSubmissions(prev => ({ ...prev, [appId]: res.data }));
    } catch (err) { console.error(err); }
  };


  useEffect(() => {
    api.get(`/applications/ad/${id}`)
      .then((res) => setApplications(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatus = async (appId: string, status: 'ACCEPTED' | 'REJECTED') => {
    hapticFeedback('medium');
    try {
      await api.patch(`/applications/${appId}/status`, { status });
      setApplications((prev) => prev.map((a) => (a.id === appId ? { ...a, status } : a)));
      // Feed va MyAds cache ni tozalash
      const { invalidateFeed, invalidateMyAds } = await import('../store/cache').then(m => m.useCacheStore.getState());
      invalidateFeed();
      invalidateMyAds();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Xatolik');
    }
  };

  const statusConfig: Record<string, { label: string; icon: React.ReactNode }> = {
    PENDING: { label: 'Kutilmoqda', icon: <Clock size={12} /> },
    ACCEPTED: { label: 'Qabul', icon: <CheckCircle2 size={12} /> },
    REJECTED: { label: 'Rad', icon: <XCircle size={12} /> },
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F2F2F7',
      padding: '16px',
      paddingBottom: 32,
    }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: '#fff',
          border: '1px solid #E5E5EA',
          borderRadius: 14,
          padding: '8px 16px',
          fontSize: 14,
          fontWeight: 600,
          color: '#1B3B51',
          cursor: 'pointer',
          marginBottom: 16,
        }}
      >
        <ArrowLeft size={18} /> Orqaga
      </button>

      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1B3B51', margin: 0, letterSpacing: -0.5 }}>Arizalar</h1>
        <p style={{ fontSize: 15, color: '#8E8E93', marginTop: 4 }}>{applications.length} ta ariza kelgan</p>
      </div>

      {loading ? (
        <><ApplicationShimmer /><ApplicationShimmer /><ApplicationShimmer /></>
      ) : applications.length === 0 ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 20px',
          textAlign: 'center',
        }}>
          <Send size={40} style={{ color: '#8E8E93', opacity: 0.4, marginBottom: 12 }} />
          <p style={{ fontSize: 16, color: '#8E8E93' }}>Hali arizalar kelmagan</p>
        </div>
      ) : (
        applications.map((app) => {
          const inf = app.influencer;
          const avgRating = inf?.reviews?.length
            ? Math.round((inf.reviews.reduce((s: number, r: any) => s + r.rating, 0) / inf.reviews.length) * 10) / 10
            : 0;
          const isExpanded = expandedId === app.id;
          const socialLinks = parseSocialLinks(inf?.socialLinks || '{}');
          const hasLinks = Object.values(socialLinks).some((v) => v.trim());

          return (
            <div key={app.id} style={{
              background: '#fff',
              border: '1px solid #E5E5EA',
              borderRadius: 16,
              padding: 16,
              marginBottom: 12,
            }}>
              {/* Header */}
              <div
                style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12, cursor: 'pointer' }}
                onClick={() => setExpandedId(isExpanded ? null : app.id)}
              >
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  background: '#F2F2F7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 16,
                  fontWeight: 700,
                  color: '#1B3B51',
                  overflow: 'hidden',
                  flexShrink: 0,
                }}>
                  {inf?.user?.photoUrl
                    ? <img src={inf.user.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : inf?.name?.[0] || '?'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, color: '#1B3B51', margin: 0 }}>{inf?.name}</h3>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: 12,
                      fontWeight: 600,
                      color: '#fff',
                      background: statusColors[app.status] || '#8E8E93',
                      padding: '3px 10px',
                      borderRadius: 20,
                    }}>
                      {statusConfig[app.status]?.icon} {statusConfig[app.status]?.label}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: '#8E8E93', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                    @{inf?.user?.username}
                    {avgRating > 0 && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Star size={11} fill="#FF9500" stroke="#FF9500" /> {avgRating}
                      </span>
                    )}
                    <ChevronDown size={14} style={{
                      marginLeft: 'auto',
                      transition: 'transform 0.2s',
                      transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                      color: '#8E8E93',
                    }} />
                  </p>
                </div>
              </div>

              {/* Expanded info */}
              {isExpanded && (
                <div style={{
                  background: '#F2F2F7', borderRadius: 12, padding: 14,
                  marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 10,
                }}>
                  {/* Bio */}
                  {inf?.bio && (
                    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <User size={15} style={{ color: '#8E8E93', marginTop: 2, flexShrink: 0 }} />
                      <p style={{ fontSize: 13, color: '#1B3B51', lineHeight: 1.5, margin: 0 }}>{inf.bio}</p>
                    </div>
                  )}

                  {/* Yo'nalish */}
                  {inf?.category && (
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontSize: 13, color: '#8E8E93' }}>Yo'nalish:</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#1B3B51' }}>{inf.category}</span>
                    </div>
                  )}

                  {/* Phone */}
                  {inf?.user?.phone && (
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <Phone size={15} style={{ color: '#1B3B51', flexShrink: 0 }} />
                      <a href={`tel:${inf.user.phone}`} style={{ fontSize: 13, fontWeight: 600, color: '#1B3B51', textDecoration: 'none' }}>
                        {inf.user.phone}
                      </a>
                    </div>
                  )}

                  {/* Social links */}
                  {hasLinks && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <span style={{ fontSize: 12, color: '#8E8E93', fontWeight: 600 }}>Ijtimoiy tarmoqlar</span>
                      {Object.entries(socialLinks).map(([key, url]) => {
                        if (!url.trim()) return null;
                        const icon = SOCIAL_ICONS[key.toLowerCase()] || '🔗';
                        return (
                          <a key={key} href={getSocialUrl(key, url)} target="_blank" rel="noreferrer"
                            style={{
                              display: 'flex', alignItems: 'center', gap: 8,
                              fontSize: 13, color: '#1B3B51', textDecoration: 'none',
                              padding: '6px 10px', background: '#fff', borderRadius: 8,
                            }}>
                            <span>{icon}</span>
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{url}</span>
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              <button
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  background: 'none',
                  border: 'none',
                  padding: '4px 0',
                  marginBottom: 10,
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#1B3B51',
                  cursor: 'pointer',
                }}
                onClick={() => navigate(`/influencer/${inf?.id}`)}
              >
                Profilni ko'rish <ChevronRight size={14} />
              </button>

              {app.status === 'PENDING' && (
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    style={{
                      flex: 1,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      background: '#34C759',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 14,
                      padding: '10px 16px',
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                    onClick={() => handleStatus(app.id, 'ACCEPTED')}
                  >
                    <Check size={16} /> Qabul qilish
                  </button>
                  <button
                    style={{
                      flex: 1,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      background: '#FF3B30',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 14,
                      padding: '10px 16px',
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                    onClick={() => handleStatus(app.id, 'REJECTED')}
                  >
                    <X size={16} /> Rad etish
                  </button>
                </div>
              )}

              {/* Videolar */}
              {(() => {
                const appSubs = submissions[app.id];
                const loaded = appSubs !== undefined;
                if (!loaded && app.status === 'ACCEPTED') { loadSubmissions(app.id); }
                return appSubs && appSubs.length > 0 ? (
                  <div style={{ marginTop: 10 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#8E8E93', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Video size={14} /> Yuborilgan videolar ({appSubs.length})
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {appSubs.map((sub) => (
                        <div key={sub.id} style={{
                          borderRadius: 12, overflow: 'hidden',
                          background: '#F2F2F7', border: '1px solid #E5E5EA',
                        }}>
                          <video
                            src={sub.videoUrl + '#t=0.5'}
                            controls
                            playsInline
                            preload="auto"
                            style={{ width: '100%', maxHeight: 300, display: 'block', background: '#000' }}
                          />
                          <div style={{ padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <p style={{ fontSize: 12, color: '#8E8E93', margin: 0 }}>
                              {new Date(sub.createdAt).toLocaleDateString('uz')}
                            </p>
                            <span style={{
                              fontSize: 12, fontWeight: 600,
                              color: sub.status === 'APPROVED' ? '#34C759' : sub.status === 'PENDING' ? '#FF9500' : '#FF3B30',
                              display: 'flex', alignItems: 'center', gap: 4,
                            }}>
                              {sub.status === 'PENDING' && <><Clock size={13} /> Admin tekshirmoqda</>}
                              {sub.status === 'APPROVED' && <><CheckCircle2 size={13} /> Tasdiqlangan</>}
                              {sub.status === 'REJECTED' && <><XCircle size={13} /> Rad etilgan</>}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null;
              })()}
            </div>
          );
        })
      )}


    </div>
  );
}
