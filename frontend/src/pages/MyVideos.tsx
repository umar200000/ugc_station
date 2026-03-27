import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Play, Clock } from 'lucide-react';
import api from '../lib/api';

interface VideoItem {
  id: string;
  videoUrl: string;
  status: string;
  createdAt: string;
  application: {
    influencer: { name: string; user?: { photoUrl: string; username: string } };
    ad: { title: string };
  };
}

export default function MyVideos() {
  const navigate = useNavigate();
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    api.get('/submissions/company/approved')
      .then(res => setVideos(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggleVideo = async (id: string) => {
    setToggling(id);
    try {
      const res = await api.patch(`/submissions/${id}/toggle`);
      setVideos(prev => prev.map(v => v.id === id ? { ...v, status: res.data.status } : v));
    } catch (err) { console.error(err); }
    finally { setToggling(null); }
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 24) return `${hours} soat oldin`;
    return new Date(date).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' });
  };

  const activeCount = videos.filter(v => v.status === 'APPROVED').length;
  const hiddenCount = videos.filter(v => v.status === 'HIDDEN').length;

  return (
    <div className="page">
      <button className="back-btn" onClick={() => navigate(-1)}>
        <ArrowLeft size={18} /> Orqaga
      </button>

      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Tasdiqlangan videolar</h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
          {activeCount} ta faol · {hiddenCount} ta yashirin
        </p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1, 2].map(i => (
            <div key={i} className="shimmer-card" style={{ height: 100 }}>
              <div className="shimmer" style={{ width: '100%', height: 60, borderRadius: 8 }} />
            </div>
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div className="empty-state" style={{ marginTop: 40 }}>
          <Play size={40} style={{ color: 'var(--text-muted)', opacity: 0.3, marginBottom: 12 }} />
          <p style={{ fontWeight: 600, fontSize: 16 }}>Videolar yo'q</p>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>Tasdiqlangan videolar bu yerda ko'rinadi</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {videos.map(v => {
            const inf = v.application?.influencer;
            const isActive = v.status === 'APPROVED';
            return (
              <div key={v.id} style={{
                background: 'var(--bg-card)', borderRadius: 14, overflow: 'hidden',
                border: '1px solid var(--border)', opacity: isActive ? 1 : 0.6,
              }}>
                <div style={{ display: 'flex', gap: 12, padding: 12, alignItems: 'center' }}>
                  {/* Video thumbnail */}
                  <div style={{ position: 'relative', width: 80, height: 80, flexShrink: 0, borderRadius: 10, overflow: 'hidden', background: '#000' }}>
                    <video src={v.videoUrl + '#t=0.1'} preload="metadata" muted playsInline
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{
                      position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Play size={20} fill="#fff" stroke="#fff" style={{ opacity: 0.8 }} />
                    </div>
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 24, height: 24, borderRadius: 6, overflow: 'hidden', flexShrink: 0,
                        background: 'var(--primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 700, color: 'var(--primary)',
                      }}>
                        {inf?.user?.photoUrl
                          ? <img src={inf.user.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : inf?.name?.[0] || '?'}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{inf?.name}</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                      {v.application?.ad?.title}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={10} /> {timeAgo(v.createdAt)}
                    </div>
                  </div>

                  {/* Toggle */}
                  <button
                    onClick={() => toggleVideo(v.id)}
                    disabled={toggling === v.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                      border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                      background: isActive ? 'var(--g-bg, rgba(16,185,129,0.08))' : 'var(--r-bg, rgba(239,68,68,0.07))',
                      color: isActive ? '#065F46' : '#991B1B',
                    }}
                  >
                    {isActive ? <><Eye size={14} /> Faol</> : <><EyeOff size={14} /> Yashirin</>}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
