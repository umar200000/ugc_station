import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, ExternalLink } from 'lucide-react';
import api from '../lib/api';
import { InfluencerProfileShimmer } from '../components/Shimmer';

export default function InfluencerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [influencer, setInfluencer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/users/influencer/${id}`)
      .then((res) => setInfluencer(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <InfluencerProfileShimmer />;
  if (!influencer) return <div className="page"><div className="empty-state"><p>Influenser topilmadi</p></div></div>;

  let socialLinks: Record<string, string> = {};
  try {
    socialLinks = typeof influencer.socialLinks === 'string' ? JSON.parse(influencer.socialLinks) : influencer.socialLinks || {};
  } catch { socialLinks = {}; }

  return (
    <div className="page">
      <button className="back-btn" onClick={() => navigate(-1)}>
        <ArrowLeft size={18} /> Orqaga
      </button>

      <div className="fade-in" style={{ textAlign: 'center', marginBottom: 24 }}>
        <div className="avatar avatar-lg" style={{ margin: '0 auto 14px' }}>
          {influencer.user?.photoUrl ? <img src={influencer.user.photoUrl} alt="" /> : influencer.name?.[0] || '?'}
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.3 }}>{influencer.name}</h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>{influencer.category}</p>
        {influencer.user?.username && (
          <p style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 500, marginTop: 2 }}>@{influencer.user.username}</p>
        )}

        <div className="stat-row" style={{ marginTop: 20 }}>
          {influencer.avgRating > 0 && (
            <div className="stat-item">
              <div className="stat-value" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                <Star size={16} fill="var(--warning)" stroke="var(--warning)" /> {influencer.avgRating}
              </div>
              <div className="stat-label">Reyting</div>
            </div>
          )}
          <div className="stat-item">
            <div className="stat-value">{influencer.completedCollabs || 0}</div>
            <div className="stat-label">Hamkorlik</div>
          </div>
        </div>
      </div>

      {influencer.bio && (
        <div className="card fade-in">
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Bio</p>
          <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--text-secondary)' }}>{influencer.bio}</p>
        </div>
      )}

      {Object.keys(socialLinks).length > 0 && (
        <div className="card fade-in">
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>Ijtimoiy tarmoqlar</p>
          {Object.entries(socialLinks).map(([platform, link]) => (
            <div className="info-row" key={platform}>
              <span className="info-label">{platform}</span>
              <a href={link as string} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 14, fontWeight: 600, color: 'var(--primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                Ochish <ExternalLink size={14} />
              </a>
            </div>
          ))}
        </div>
      )}

      {influencer.reviews?.length > 0 && (
        <div className="card fade-in">
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>Reytinglar</p>
          {influencer.reviews.map((r: any) => (
            <div key={r.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{r.company?.name}</span>
                <span style={{ display: 'flex', gap: 2 }}>
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <Star key={i} size={14} fill="var(--warning)" stroke="var(--warning)" />
                  ))}
                </span>
              </div>
              {r.comment && <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{r.comment}</p>}
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
