import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, ChevronRight, Check, X, Clock, CheckCircle2, XCircle, Send } from 'lucide-react';
import api from '../lib/api';
import { ApplicationShimmer } from '../components/Shimmer';
import { hapticFeedback } from '../lib/telegram';
import type { Application } from '../types';

export default function Applications() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

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
        applications.map((app, i) => {
          const inf = app.influencer;
          const avgRating = inf?.reviews?.length
            ? Math.round((inf.reviews.reduce((s, r) => s + r.rating, 0) / inf.reviews.length) * 10) / 10
            : 0;

          return (
            <div key={app.id} className="card fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
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
                  </p>
                </div>
              </div>

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
            </div>
          );
        })
      )}

    </div>
  );
}
