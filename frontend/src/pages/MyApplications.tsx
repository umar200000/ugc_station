import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Clock, CheckCircle2, XCircle, Phone, Video, Upload, Play, Check, X, Loader2, RotateCcw } from 'lucide-react';
import api from '../lib/api';
import BottomNav from '../components/BottomNav';
import { MyAdCardShimmer } from '../components/Shimmer';
import PullToRefresh from '../components/PullToRefresh';
import { useCacheStore } from '../store/cache';
import type { Application } from '../types';

interface Submission {
  id: string;
  applicationId: string;
  videoUrl: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  comment?: string;
  createdAt: string;
}

export default function MyApplications() {
  const navigate = useNavigate();
  const cache = useCacheStore();
  const [applications, setApplications] = useState<Application[]>(cache.myApplications || []);
  const [loading, setLoading] = useState(!cache.myApplications);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<Record<string, Submission[]>>({});
  const [uploading, setUploading] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadAppId, setUploadAppId] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const cachedMyApps = useCacheStore(s => s.myApplications);

  const fetchMyApps = () => {
    setLoading(true);
    api.get('/applications/my')
      .then((res) => { setApplications(res.data); useCacheStore.getState().setMyApplications(res.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const cached = useCacheStore.getState().myApplications;
    if (cached) {
      setApplications(cached);
      setLoading(false);
      return;
    }
    fetchMyApps();
  }, []);

  // Cache invalidate bo'lganda qayta fetch
  const appsLoadDone = useRef(false);
  useEffect(() => {
    if (cachedMyApps === null && appsLoadDone.current) {
      fetchMyApps();
    }
    if (cachedMyApps !== null) appsLoadDone.current = true;
  }, [cachedMyApps]);

  const loadSubmissions = async (appId: string) => {
    try {
      const res = await api.get(`/submissions/application/${appId}`);
      setSubmissions(prev => ({ ...prev, [appId]: res.data }));
    } catch (err) { console.error(err); }
  };

  // ACCEPTED arizalar uchun submissions ni avtomatik yuklash
  useEffect(() => {
    const accepted = applications.filter(a => a.status === 'ACCEPTED');
    accepted.forEach(a => {
      if (!submissions[a.id]) loadSubmissions(a.id);
    });
  }, [applications]);

  const handleExpand = (appId: string) => {
    if (expandedId === appId) {
      setExpandedId(null);
    } else {
      setExpandedId(appId);
      if (!submissions[appId]) loadSubmissions(appId);
    }
  };

  const handleVideoSelect = (appId: string) => {
    setUploadAppId(appId);
    fileRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadAppId) return;
    e.target.value = '';
    setPreviewFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleCancelPreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewFile(null);
    setPreviewUrl(null);
    setUploadAppId(null);
  };

  const handleReselect = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewFile(null);
    setPreviewUrl(null);
    fileRef.current?.click();
  };

  const handleConfirmUpload = async () => {
    if (!previewFile || !uploadAppId) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPreviewFile(null);

    setUploading(uploadAppId);
    setUploadProgress(0);
    const appId = uploadAppId;
    try {
      const formData = new FormData();
      formData.append('video', previewFile);
      formData.append('applicationId', appId);
      const res = await api.post('/submissions', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (e.total) setUploadProgress(Math.round((e.loaded / e.total) * 100));
        },
      });
      setSubmissions(prev => ({
        ...prev,
        [appId]: [res.data, ...(prev[appId] || [])],
      }));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Video yuklashda xatolik');
    } finally {
      setUploading(null);
      setUploadAppId(null);
    }
  };

  const statusConfig: Record<string, { label: string; icon: React.ReactNode }> = {
    PENDING: { label: 'Kutilmoqda', icon: <Clock size={12} /> },
    ACCEPTED: { label: 'Qabul qilindi', icon: <CheckCircle2 size={12} /> },
    REJECTED: { label: 'Rad etildi', icon: <XCircle size={12} /> },
  };

  const subStatusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    PENDING: { label: 'Tekshirilmoqda', color: 'var(--warning-text)', icon: <Clock size={12} /> },
    APPROVED: { label: 'Tasdiqlandi', color: 'var(--secondary)', icon: <Check size={12} /> },
    REJECTED: { label: 'Rad etildi', color: 'var(--danger)', icon: <X size={12} /> },
  };

  const handleRefresh = async () => {
    cache.setMyApplications(null as any);
    setLoading(true);
    try {
      const res = await api.get('/applications/my');
      setApplications(res.data);
      cache.setMyApplications(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
    <div className="page">
      <input ref={fileRef} type="file" accept="video/*" style={{ display: 'none' }} onChange={handleFileChange} />

      {/* Video preview modal */}
      {previewUrl && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.95)',
          display: 'flex', flexDirection: 'column',
        }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
            <button onClick={handleCancelPreview} style={{
              width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.15)',
              border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}>
              <X size={20} />
            </button>
            <span style={{ color: '#fff', fontSize: 16, fontWeight: 600 }}>Videoni tekshiring</span>
            <div style={{ width: 40 }} />
          </div>

          {/* Video */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px', overflow: 'hidden' }}>
            <video
              src={previewUrl}
              controls
              autoPlay
              playsInline
              style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: 12, background: '#000' }}
            />
          </div>

          {/* Bottom actions */}
          <div style={{ padding: '16px 20px 32px', display: 'flex', gap: 10 }}>
            <button onClick={handleReselect} style={{
              flex: 1, padding: '14px 0', borderRadius: 14,
              background: 'rgba(255,255,255,0.12)', border: 'none',
              color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              fontFamily: 'inherit',
            }}>
              <RotateCcw size={18} /> Boshqa tanlash
            </button>
            <button onClick={handleConfirmUpload} style={{
              flex: 1, padding: '14px 0', borderRadius: 14,
              background: 'var(--primary)', border: 'none',
              color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              fontFamily: 'inherit',
            }}>
              <Upload size={18} /> Yuklash
            </button>
          </div>
        </div>
      )}

      <div className="page-header">
        <h1 className="page-title">Arizalarim</h1>
        <p className="page-subtitle">Yuborgan arizalaringiz holati</p>
      </div>

      {loading ? (
        <><MyAdCardShimmer /><MyAdCardShimmer /><MyAdCardShimmer /></>
      ) : applications.length === 0 ? (
        <div className="empty-state">
          <Send size={40} style={{ color: 'var(--text-muted)', opacity: 0.4, marginBottom: 12 }} />
          <p>Hali ariza bermadingiz</p>
          <button className="btn btn-primary" style={{ marginTop: 20, maxWidth: 220 }} onClick={() => navigate('/')}>
            E'lonlarni ko'rish
          </button>
        </div>
      ) : (
        applications.map((app) => {
          const companyPhone = (app.ad?.company as any)?.user?.phone;
          const isExpanded = expandedId === app.id;
          const appSubs = submissions[app.id] || [];
          const isUploading = uploading === app.id;

          return (
            <div key={app.id} className="card fade-in" style={{ cursor: 'default' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6, cursor: 'pointer' }}
                onClick={() => navigate(`/ad/${app.adId}`)}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {app.ad?.title}
                  </h3>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                    {app.ad?.company?.name} · {new Date(app.createdAt).toLocaleDateString('uz')}
                  </p>
                </div>
                <span className={`badge badge-${app.status.toLowerCase()}`} style={{ flexShrink: 0, marginLeft: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                  {statusConfig[app.status]?.icon} {statusConfig[app.status]?.label}
                </span>
              </div>

              {/* Qabul qilingan — telefon va video tugmalari */}
              {app.status === 'ACCEPTED' && (
                <div onClick={(e) => e.stopPropagation()} style={{ marginTop: 8 }}>
                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    {companyPhone && (
                      <a href={`tel:${companyPhone}`} className="btn btn-success btn-sm" style={{ flex: 1, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                        <Phone size={15} /> Qo'ng'iroq
                      </a>
                    )}
                    <button
                      className="btn btn-primary btn-sm"
                      style={{ flex: 1 }}
                      disabled={isUploading}
                      onClick={() => handleVideoSelect(app.id)}
                    >
                      {isUploading ? <><Loader2 size={15} className="spin" /> {uploadProgress}%</> : <><Video size={15} /> Video joylash {appSubs.length > 0 ? `(${appSubs.length})` : ''}</>}
                    </button>
                  </div>

                  {/* Upload progress bar */}
                  {isUploading && (
                    <div style={{ height: 4, borderRadius: 100, background: 'var(--border)', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: 100, transition: 'width 0.3s',
                        background: 'linear-gradient(90deg, var(--primary), var(--primary-light))',
                        width: `${uploadProgress}%`,
                      }} />
                    </div>
                  )}

                  {/* Videos toggle */}
                  {(appSubs.length > 0 || isExpanded) && (
                    <button
                      onClick={() => handleExpand(app.id)}
                      style={{
                        background: 'none', border: 'none', padding: '4px 0', cursor: 'pointer',
                        fontSize: 13, fontWeight: 600, color: 'var(--primary)', fontFamily: 'inherit',
                        display: 'flex', alignItems: 'center', gap: 4,
                      }}
                    >
                      <Play size={13} /> {appSubs.length > 0 ? `${appSubs.length} ta video` : 'Videolarni ko\'rish'}
                    </button>
                  )}

                  {/* Videos list */}
                  {isExpanded && appSubs.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                      {appSubs.map((sub) => {
                        const st = subStatusConfig[sub.status];
                        return (
                          <div key={sub.id} style={{
                            borderRadius: 12, overflow: 'hidden',
                            background: 'var(--bg-secondary)',
                            border: `1px solid ${sub.status === 'REJECTED' ? 'rgba(239,68,68,0.2)' : sub.status === 'APPROVED' ? 'rgba(16,185,129,0.2)' : 'var(--border)'}`,
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px' }}>
                              <video
                                src={sub.videoUrl + '#t=0.5'}
                                preload="auto"
                                style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover', background: '#000', flexShrink: 0 }}
                              />
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                  {new Date(sub.createdAt).toLocaleDateString('uz')}
                                </p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4, fontSize: 13, fontWeight: 600, color: st.color }}>
                                  {st.icon} {st.label}
                                </div>
                              </div>
                            </div>
                            {sub.comment && sub.status === 'REJECTED' && (
                              <div style={{
                                margin: '0 10px 10px', padding: '10px 12px', borderRadius: 10,
                                background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.12)',
                              }}>
                                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--danger)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.3 }}>
                                  Rad etish sababi
                                </p>
                                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                  {sub.comment}
                                </p>
                              </div>
                            )}
                            {sub.comment && sub.status === 'APPROVED' && (
                              <div style={{
                                margin: '0 10px 10px', padding: '10px 12px', borderRadius: 10,
                                background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.12)',
                              }}>
                                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--secondary)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.3 }}>
                                  Kompaniya izohi
                                </p>
                                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                  {sub.comment}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}

      <BottomNav />
    </div>
    </PullToRefresh>
  );
}
