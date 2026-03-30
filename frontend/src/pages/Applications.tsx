import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, ChevronRight, ChevronDown, Check, X, Clock, CheckCircle2, XCircle, Send, Phone, Link, User, Video, ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';
import api from '../lib/api';
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

const REJECT_REASONS = [
  'Video sifati past',
  'Mahsulot to\'g\'ri ko\'rsatilmagan',
  'Ovoz yozuvi sifatsiz',
  'Video formati noto\'g\'ri',
  'Kontent mos emas',
  'Montaj sifatsiz',
  'Video juda qisqa',
  'Video juda uzun',
];

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

export default function Applications() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<Record<string, Submission[]>>({});
  const [reviewModal, setReviewModal] = useState<{ subId: string; appId: string; action: 'APPROVED' | 'REJECTED' } | null>(null);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  const loadSubmissions = async (appId: string) => {
    try {
      const res = await api.get(`/submissions/application/${appId}`);
      setSubmissions(prev => ({ ...prev, [appId]: res.data }));
    } catch (err) { console.error(err); }
  };

  const openReviewModal = (subId: string, appId: string, action: 'APPROVED' | 'REJECTED') => {
    setReviewModal({ subId, appId, action });
    setReviewComment('');
  };

  const handleSubStatus = async () => {
    if (!reviewModal) return;
    const { subId, appId, action } = reviewModal;
    setReviewLoading(true);
    hapticFeedback('medium');
    try {
      await api.patch(`/submissions/${subId}/status`, { status: action, comment: reviewComment.trim() || undefined });
      setSubmissions(prev => ({
        ...prev,
        [appId]: (prev[appId] || []).map(s => s.id === subId ? { ...s, status: action, comment: reviewComment.trim() || undefined } : s),
      }));
      setReviewModal(null);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Xatolik');
    } finally {
      setReviewLoading(false);
    }
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
    <div className="page">
      <button className="back-btn" onClick={() => navigate(-1)}>
        <ArrowLeft size={18} /> Orqaga
      </button>

      <div className="page-header">
        <h1 className="page-title">Arizalar</h1>
        <p className="page-subtitle">{applications.length} ta ariza kelgan</p>
      </div>

      {loading ? (
        <><ApplicationShimmer /><ApplicationShimmer /><ApplicationShimmer /></>
      ) : applications.length === 0 ? (
        <div className="empty-state">
          <Send size={40} style={{ color: 'var(--text-muted)', opacity: 0.4, marginBottom: 12 }} />
          <p>Hali arizalar kelmagan</p>
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
            <div key={app.id} className="card fade-in">
              {/* Header */}
              <div
                style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12, cursor: 'pointer' }}
                onClick={() => setExpandedId(isExpanded ? null : app.id)}
              >
                <div className="avatar avatar-md">
                  {inf?.user?.photoUrl ? <img src={inf.user.photoUrl} alt="" /> : inf?.name?.[0] || '?'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: 15, fontWeight: 600 }}>{inf?.name}</h3>
                    <span className={`badge badge-${app.status.toLowerCase()}`} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      {statusConfig[app.status]?.icon} {statusConfig[app.status]?.label}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                    @{inf?.user?.username}
                    {avgRating > 0 && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Star size={11} fill="var(--warning)" stroke="var(--warning)" /> {avgRating}
                      </span>
                    )}
                    <ChevronDown size={14} style={{
                      marginLeft: 'auto',
                      transition: 'transform 0.2s',
                      transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    }} />
                  </p>
                </div>
              </div>

              {/* Expanded info */}
              {isExpanded && (
                <div style={{
                  background: 'var(--bg-secondary)', borderRadius: 12, padding: 14,
                  marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 10,
                }}>
                  {/* Bio */}
                  {inf?.bio && (
                    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <User size={15} style={{ color: 'var(--text-muted)', marginTop: 2, flexShrink: 0 }} />
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{inf.bio}</p>
                    </div>
                  )}

                  {/* Yo'nalish */}
                  {inf?.category && (
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Yo'nalish:</span>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{inf.category}</span>
                    </div>
                  )}

                  {/* Phone */}
                  {inf?.user?.phone && (
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <Phone size={15} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                      <a href={`tel:${inf.user.phone}`} style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary)', textDecoration: 'none' }}>
                        {inf.user.phone}
                      </a>
                    </div>
                  )}

                  {/* Social links */}
                  {hasLinks && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Ijtimoiy tarmoqlar</span>
                      {Object.entries(socialLinks).map(([key, url]) => {
                        if (!url.trim()) return null;
                        const icon = SOCIAL_ICONS[key.toLowerCase()] || '🔗';
                        return (
                          <a key={key} href={url.startsWith('http') ? url : `https://${url}`} target="_blank" rel="noreferrer"
                            style={{
                              display: 'flex', alignItems: 'center', gap: 8,
                              fontSize: 13, color: 'var(--primary)', textDecoration: 'none',
                              padding: '6px 10px', background: 'var(--bg-card)', borderRadius: 8,
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

              <button className="btn btn-ghost btn-sm" style={{ width: 'auto', padding: '4px 0', marginBottom: 10, gap: 4 }}
                onClick={() => navigate(`/influencer/${inf?.id}`)}>
                Profilni ko'rish <ChevronRight size={14} />
              </button>

              {app.status === 'PENDING' && (
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn btn-success btn-sm" style={{ flex: 1 }} onClick={() => handleStatus(app.id, 'ACCEPTED')}>
                    <Check size={16} /> Qabul qilish
                  </button>
                  <button className="btn btn-danger btn-sm" style={{ flex: 1 }} onClick={() => handleStatus(app.id, 'REJECTED')}>
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
                    <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Video size={14} /> Yuborilgan videolar ({appSubs.length})
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {appSubs.map((sub) => (
                        <div key={sub.id} style={{
                          borderRadius: 12, overflow: 'hidden',
                          background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                        }}>
                          <video
                            src={sub.videoUrl + '#t=0.5'}
                            controls
                            playsInline
                            preload="auto"
                            style={{ width: '100%', maxHeight: 300, display: 'block', background: '#000' }}
                          />
                          <div style={{ padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                              {new Date(sub.createdAt).toLocaleDateString('uz')}
                            </p>
                            {sub.status === 'PENDING' ? (
                              <div style={{ display: 'flex', gap: 6 }}>
                                <button className="btn btn-success btn-sm" style={{ padding: '6px 14px', fontSize: 12 }}
                                  onClick={() => openReviewModal(sub.id, app.id, 'APPROVED')}>
                                  <ThumbsUp size={13} /> Yoqdi
                                </button>
                                <button className="btn btn-danger btn-sm" style={{ padding: '6px 14px', fontSize: 12 }}
                                  onClick={() => openReviewModal(sub.id, app.id, 'REJECTED')}>
                                  <ThumbsDown size={13} /> Yoqmadi
                                </button>
                              </div>
                            ) : (
                              <div style={{ textAlign: 'right' }}>
                                <span style={{
                                  fontSize: 13, fontWeight: 600,
                                  color: sub.status === 'APPROVED' ? 'var(--secondary)' : 'var(--danger)',
                                  display: 'flex', alignItems: 'center', gap: 4,
                                }}>
                                  {sub.status === 'APPROVED' ? <><CheckCircle2 size={13} /> Tasdiqlangan</> : <><XCircle size={13} /> Rad etilgan</>}
                                </span>
                                {sub.comment && (
                                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3, display: 'flex', alignItems: 'center', gap: 3 }}>
                                    <MessageSquare size={10} /> {sub.comment}
                                  </p>
                                )}
                              </div>
                            )}
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

      {/* Review modal */}
      {reviewModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        }} onClick={() => !reviewLoading && setReviewModal(null)}>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: 480,
              background: 'var(--bg-card)', borderRadius: '20px 20px 0 0',
              padding: '20px 20px 32px', maxHeight: '85vh', overflowY: 'auto',
            }}
          >
            {/* Handle */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <div style={{ width: 36, height: 4, borderRadius: 100, background: 'var(--border-strong)' }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: reviewModal.action === 'APPROVED' ? 'var(--secondary-bg)' : 'var(--danger-bg)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {reviewModal.action === 'APPROVED'
                  ? <ThumbsUp size={20} style={{ color: 'var(--secondary)' }} />
                  : <ThumbsDown size={20} style={{ color: 'var(--danger)' }} />
                }
              </div>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700 }}>
                  {reviewModal.action === 'APPROVED' ? 'Videoni tasdiqlash' : 'Videoni rad etish'}
                </h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                  {reviewModal.action === 'APPROVED' ? 'Izoh qoldiring (ixtiyoriy)' : 'Sababini ko\'rsating'}
                </p>
              </div>
            </div>

            {/* Reject reasons */}
            {reviewModal.action === 'REJECTED' && (
              <div style={{ marginBottom: 14 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>Tez tanlash:</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {REJECT_REASONS.map((reason) => {
                    const selected = reviewComment === reason;
                    return (
                      <button key={reason} onClick={() => setReviewComment(selected ? '' : reason)} style={{
                        padding: '7px 12px', borderRadius: 100, fontSize: 12.5, fontWeight: 600,
                        border: `1.5px solid ${selected ? 'var(--danger)' : 'var(--border-strong)'}`,
                        background: selected ? 'var(--danger-bg)' : 'var(--bg)',
                        color: selected ? 'var(--danger)' : 'var(--text-secondary)',
                        cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
                      }}>
                        {reason}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Comment textarea */}
            <div style={{ marginBottom: 16 }}>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder={reviewModal.action === 'APPROVED' ? 'Izoh yozing... (ixtiyoriy)' : 'Batafsil izoh yozing...'}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                style={{ resize: 'none' }}
              />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                className="btn btn-secondary"
                style={{ flex: 1 }}
                disabled={reviewLoading}
                onClick={() => setReviewModal(null)}
              >
                Bekor qilish
              </button>
              <button
                className={`btn ${reviewModal.action === 'APPROVED' ? 'btn-success' : 'btn-danger'}`}
                style={{ flex: 1 }}
                disabled={reviewLoading || (reviewModal.action === 'REJECTED' && !reviewComment.trim())}
                onClick={handleSubStatus}
              >
                {reviewLoading ? '...' : reviewModal.action === 'APPROVED' ? (
                  <><CheckCircle2 size={16} /> Tasdiqlash</>
                ) : (
                  <><XCircle size={16} /> Rad etish</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
