import { useState, useEffect } from 'react';
import { Play, Eye, Clock, User } from 'lucide-react';
import api from '../lib/api';
import BottomNav from '../components/BottomNav';
import PullToRefresh from '../components/PullToRefresh';

interface VideoItem {
  id: string;
  videoUrl: string;
  status: string;
  createdAt: string;
  application: {
    influencer: {
      name: string;
      category: string;
      user?: { photoUrl: string; username: string };
    };
    ad: {
      title: string;
      company: { name: string };
    };
  };
}

function VideoCard({ video }: { video: VideoItem }) {
  const [playing, setPlaying] = useState(false);
  const [thumbLoaded, setThumbLoaded] = useState(false);
  const inf = video.application?.influencer;
  const ad = video.application?.ad;

  if (!inf || !ad) return null;

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Hozirgina';
    if (mins < 60) return `${mins} daqiqa oldin`;
    const hours = Math.floor(diff / 3600000);
    if (hours < 24) return `${hours} soat oldin`;
    return new Date(date).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div style={{
      background: 'var(--bg-card)', borderRadius: 16, overflow: 'hidden',
      border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)',
      marginBottom: 16,
    }}>
      {/* Influencer info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px' }}>
        <div style={{
          width: 38, height: 38, borderRadius: 12, overflow: 'hidden',
          background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, fontSize: 16, fontWeight: 700, color: '#fff',
        }}>
          {inf.user?.photoUrl
            ? <img src={inf.user.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : inf.name?.[0] || '?'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{inf.name}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Clock size={11} /> {timeAgo(video.createdAt)}
          </div>
        </div>
      </div>

      {/* Video */}
      <div style={{ position: 'relative', background: '#000', aspectRatio: '9/12', overflow: 'hidden' }}>
        {!playing ? (
          <div
            onClick={() => setPlaying(true)}
            style={{ position: 'relative', cursor: 'pointer', height: '100%' }}
          >
            {!thumbLoaded && (
              <div className="shimmer" style={{ position: 'absolute', inset: 0, borderRadius: 0 }} />
            )}
            <video
              src={video.videoUrl + '#t=0.5'}
              preload="metadata"
              muted
              playsInline
              onLoadedData={() => setThumbLoaded(true)}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: thumbLoaded ? 1 : 0, transition: 'opacity 0.3s' }}
            />
            {/* Bottom gradient overlay */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%',
              background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)',
              pointerEvents: 'none',
            }} />
            {/* Top gradient overlay */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '30%',
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), transparent)',
              pointerEvents: 'none',
            }} />
            {/* Play button */}
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
                border: '2px solid rgba(255,255,255,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'transform 0.2s',
              }}>
                <Play size={28} fill="#fff" stroke="#fff" style={{ marginLeft: 3 }} />
              </div>
            </div>
            {/* Bottom info overlay */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              padding: '14px 14px', display: 'flex', flexDirection: 'column', gap: 6,
            }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>
                {ad.title}
              </p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)' }}>
                {ad.company.name} · {inf.category?.split(',')[0]?.trim()}
              </p>
            </div>
          </div>
        ) : (
          <video
            src={video.videoUrl}
            controls
            autoPlay
            playsInline
            style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
          />
        )}
      </div>
    </div>
  );
}

export default function Videos() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVideos = async () => {
    try {
      const res = await api.get('/submissions/feed');
      setVideos(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVideos(); }, []);

  const handleRefresh = async () => {
    setLoading(true);
    await fetchVideos();
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="page">
        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.3 }}>Videolar</h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>
            Influenserlar tomonidan yaratilgan videolar
          </p>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="shimmer-card" style={{ height: 300, borderRadius: 16 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
                  <div className="shimmer" style={{ width: 38, height: 38, borderRadius: 12 }} />
                  <div style={{ flex: 1 }}>
                    <div className="shimmer shimmer-line w-60" />
                    <div className="shimmer shimmer-line w-40" style={{ marginBottom: 0 }} />
                  </div>
                </div>
                <div className="shimmer" style={{ width: '100%', height: 200, borderRadius: 8 }} />
              </div>
            ))}
          </div>
        ) : videos.length === 0 ? (
          <div className="empty-state">
            <div style={{
              width: 80, height: 80, borderRadius: 24,
              background: 'var(--primary-bg)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
            }}>
              <Play size={36} style={{ color: 'var(--primary)', opacity: 0.5 }} />
            </div>
            <p style={{ fontWeight: 600, fontSize: 16 }}>Hali videolar yo'q</p>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>
              Influenserlar video joylashi bilan bu yerda ko'rinadi
            </p>
          </div>
        ) : (
          videos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))
        )}

        <BottomNav />
      </div>
    </PullToRefresh>
  );
}
