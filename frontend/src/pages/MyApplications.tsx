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
  reviewedBy?: string;
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
      setSubmissions({});
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
    PENDING: { label: 'Admin tekshirmoqda', color: '#8E8E93', icon: <Clock size={12} /> },
    APPROVED: { label: 'Tasdiqlandi', color: '#34C759', icon: <Check size={12} /> },
    REJECTED: { label: 'Rad etildi', color: '#FF3B30', icon: <X size={12} /> },
  };

  const badgeStyle: Record<string, React.CSSProperties> = {
    pending: {
      background: '#8E8E93', color: '#fff',
      fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 20,
      display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0, marginLeft: 8,
    },
    accepted: {
      background: '#34C759', color: '#fff',
      fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 20,
      display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0, marginLeft: 8,
    },
    rejected: {
      background: '#FF3B30', color: '#fff',
      fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 20,
      display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0, marginLeft: 8,
    },
  };

  useEffect(() => {
    const handler = () => { cache.setMyApplications(null as any); setSubmissions({}); };
    window.addEventListener('app-refresh', handler);
    return () => window.removeEventListener('app-refresh', handler);
  }, []);

  const handleRefresh = async () => {
    cache.setMyApplications(null as any);
    setSubmissions({});
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
    <div style={{ background: '#F2F2F7', minHeight: '100vh', paddingBottom: 100 }}>
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
              background: '#1B3B51', border: 'none',
              color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              fontFamily: 'inherit',
            }}>
              <Upload size={18} /> Yuklash
            </button>
          </div>
        </div>
      )}

      {/* Page header */}
      <div style={{
        background: '#fff', padding: '20px 20px 16px', borderBottom: '1px solid #E5E5EA',
      }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1B3B51', margin: 0 }}>Arizalarim</h1>
        <p style={{ fontSize: 14, color: '#8E8E93', margin: '4px 0 0' }}>Yuborgan arizalaringiz holati</p>
      </div>

      <div style={{ padding: '16px 16px 0' }}>
        {loading ? (
          <><MyAdCardShimmer /><MyAdCardShimmer /><MyAdCardShimmer /></>
        ) : applications.length === 0 ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '60px 20px', textAlign: 'center',
          }}>
            <Send size={40} style={{ color: '#8E8E93', opacity: 0.4, marginBottom: 12 }} />
            <p style={{ color: '#8E8E93', fontSize: 15 }}>Hali ariza bermadingiz</p>
            <button style={{
              marginTop: 20, maxWidth: 220, width: '100%', padding: '14px 24px', borderRadius: 14,
              background: '#1B3B51', color: '#fff', border: 'none', fontSize: 15, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit',
            }} onClick={() => navigate('/')}>
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
              <div key={app.id} style={{
                background: '#fff', border: '1px solid #E5E5EA', borderRadius: 16,
                padding: 16, marginBottom: 12, cursor: 'default',
              }} className="fade-in">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6, cursor: 'pointer' }}
                  onClick={() => navigate(`/ad/${app.adId}`)}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, color: '#1B3B51', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>
                      {app.ad?.title}
                    </h3>
                    <p style={{ fontSize: 13, color: '#8E8E93', marginTop: 2, margin: '2px 0 0' }}>
                      {app.ad?.company?.name} · {new Date(app.createdAt).toLocaleDateString('uz')}
                    </p>
                  </div>
                  <span style={badgeStyle[app.status.toLowerCase()]}>
                    {statusConfig[app.status]?.icon} {statusConfig[app.status]?.label}
                  </span>
                </div>

                {/* Qabul qilingan — telefon va video tugmalari */}
                {app.status === 'ACCEPTED' && (
                  <div onClick={(e) => e.stopPropagation()} style={{ marginTop: 8 }}>
                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                      {companyPhone && (
                        <a href={`tel:${companyPhone}`} style={{
                          flex: 1, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                          padding: '10px 16px', borderRadius: 12, background: '#34C759', color: '#fff',
                          fontSize: 14, fontWeight: 600, border: 'none', fontFamily: 'inherit',
                        }}>
                          <Phone size={15} /> Qo'ng'iroq
                        </a>
                      )}
                      <button
                        style={{
                          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                          padding: '10px 16px', borderRadius: 12, background: '#1B3B51', color: '#fff',
                          fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                          opacity: isUploading ? 0.7 : 1,
                        }}
                        disabled={isUploading}
                        onClick={() => handleVideoSelect(app.id)}
                      >
                        {isUploading ? <><Loader2 size={15} className="spin" /> {uploadProgress}%</> : <><Video size={15} /> Video joylash {appSubs.length > 0 ? `(${appSubs.length})` : ''}</>}
                      </button>
                    </div>

                    {/* Upload progress bar */}
                    {isUploading && (
                      <div style={{ height: 4, borderRadius: 100, background: '#E5E5EA', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', borderRadius: 100, transition: 'width 0.3s',
                          background: '#1B3B51',
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
                          fontSize: 13, fontWeight: 600, color: '#1B3B51', fontFamily: 'inherit',
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
                              background: '#F2F2F7',
                              border: `1px solid ${sub.status === 'REJECTED' ? 'rgba(255,59,48,0.2)' : sub.status === 'APPROVED' ? 'rgba(52,199,89,0.2)' : '#E5E5EA'}`,
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px' }}>
                                <video
                                  src={sub.videoUrl + '#t=0.5'}
                                  preload="auto"
                                  style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover', background: '#000', flexShrink: 0 }}
                                />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <p style={{ fontSize: 12, color: '#8E8E93', margin: 0 }}>
                                    {new Date(sub.createdAt).toLocaleDateString('uz')}
                                  </p>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4, fontSize: 13, fontWeight: 600, color: st.color }}>
                                    {st.icon} {st.label}
                                  </div>
                                </div>
                              </div>
                              {sub.status === 'REJECTED' && (
                                <div style={{
                                  margin: '0 10px 10px', padding: '10px 12px', borderRadius: 10,
                                  background: 'rgba(255,59,48,0.06)', border: '1px solid rgba(255,59,48,0.12)',
                                }}>
                                  <p style={{ fontSize: 11, fontWeight: 700, color: '#FF3B30', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.3, margin: '0 0 4px' }}>
                                    {sub.reviewedBy === 'ADMIN' ? '❌ Admin tomonidan rad etildi' : 'Rad etish sababi'}
                                  </p>
                                  {sub.comment && (
                                    <p style={{ fontSize: 13, color: '#1B3B51', lineHeight: 1.5, margin: 0 }}>
                                      {sub.comment}
                                    </p>
                                  )}
                                </div>
                              )}
                              {sub.comment && sub.status === 'APPROVED' && (
                                <div style={{
                                  margin: '0 10px 10px', padding: '10px 12px', borderRadius: 10,
                                  background: 'rgba(52,199,89,0.06)', border: '1px solid rgba(52,199,89,0.12)',
                                }}>
                                  <p style={{ fontSize: 11, fontWeight: 700, color: '#34C759', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.3, margin: '0 0 4px' }}>
                                    {sub.reviewedBy === 'ADMIN' ? '✅ Admin tasdiqladi' : 'Izoh'}
                                  </p>
                                  <p style={{ fontSize: 13, color: '#1B3B51', lineHeight: 1.5, margin: 0 }}>
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
      </div>

      <BottomNav />
    </div>
    </PullToRefresh>
  );
}
