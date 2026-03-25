import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Clock, CheckCircle2, XCircle } from 'lucide-react';
import api from '../lib/api';
import BottomNav from '../components/BottomNav';
import { MyAdCardShimmer } from '../components/Shimmer';
import PullToRefresh from '../components/PullToRefresh';
import { useCacheStore } from '../store/cache';
import type { Application } from '../types';

export default function MyApplications() {
  const navigate = useNavigate();
  const cache = useCacheStore();
  const [applications, setApplications] = useState<Application[]>(cache.myApplications || []);
  const [loading, setLoading] = useState(!cache.myApplications);

  useEffect(() => {
    if (cache.myApplications) {
      setApplications(cache.myApplications);
      setLoading(false);
      return;
    }
    api.get('/applications/my')
      .then((res) => { setApplications(res.data); cache.setMyApplications(res.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statusConfig: Record<string, { label: string; icon: React.ReactNode }> = {
    PENDING: { label: 'Kutilmoqda', icon: <Clock size={12} /> },
    ACCEPTED: { label: 'Qabul qilindi', icon: <CheckCircle2 size={12} /> },
    REJECTED: { label: 'Rad etildi', icon: <XCircle size={12} /> },
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
        applications.map((app, i) => (
          <div key={app.id} className="card card-interactive fade-in" style={{ animationDelay: `${i * 0.05}s` }}
            onClick={() => navigate(`/ad/${app.adId}`)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
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
          </div>
        ))
      )}

      <BottomNav />
    </div>
    </PullToRefresh>
  );
}
