import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, ExternalLink, Award, TrendingUp, MessageCircle, Globe, Hash, Briefcase, Quote, Send } from 'lucide-react';
import api from '../lib/api';
import { InfluencerProfileShimmer } from '../components/Shimmer';

// SVG iconlar — lucide-react da yo'q
const InstagramIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const YouTubeIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const TikTokIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.72a8.19 8.19 0 0 0 4.76 1.52V6.79a4.83 4.83 0 0 1-1-.1z" />
  </svg>
);

const FacebookIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

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

  const getPlatformIcon = (platform: string) => {
    const p = platform.toLowerCase();
    if (p.includes('instagram')) return <InstagramIcon size={16} />;
    if (p.includes('youtube')) return <YouTubeIcon size={16} />;
    if (p.includes('telegram')) return <Send size={16} />;
    if (p.includes('tiktok')) return <TikTokIcon size={16} />;
    if (p.includes('facebook')) return <FacebookIcon size={16} />;
    if (p.includes('twitter') || p.includes('x.com')) return <Globe size={16} />;
    return <Globe size={16} />;
  };

  const getPlatformGradient = (platform: string) => {
    const p = platform.toLowerCase();
    if (p.includes('instagram')) return 'linear-gradient(135deg, #E1306C, #F77737)';
    if (p.includes('youtube')) return 'linear-gradient(135deg, #FF0000, #CC0000)';
    if (p.includes('telegram')) return 'linear-gradient(135deg, #0088CC, #00AAEE)';
    if (p.includes('tiktok')) return 'linear-gradient(135deg, #000000, #333333)';
    return 'linear-gradient(135deg, var(--primary), var(--primary-dark))';
  };

  const rating = influencer.avgRating ? Number(influencer.avgRating).toFixed(1) : null;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* Hero banner */}
      <div className="infp-hero slide-up">
        <div className="infp-hero-bg" />

        {/* Back button */}
        <button onClick={() => navigate(-1)} className="infp-back">
          <ArrowLeft size={20} />
        </button>

        <div className="infp-hero-content">
          {/* Avatar */}
          <div className="infp-avatar-wrap">
            <div className="infp-avatar">
              {influencer.user?.photoUrl
                ? <img src={influencer.user.photoUrl} alt="" />
                : <span>{influencer.name?.[0] || '?'}</span>}
            </div>
            {rating && Number(rating) >= 4.5 && (
              <div className="infp-verified"><Award size={14} /></div>
            )}
          </div>

          <h1 className="infp-name">{influencer.name}</h1>
          <div className="infp-meta">
            <span className="infp-category-badge">{influencer.category}</span>
            {influencer.user?.username && (
              <span className="infp-username">@{influencer.user.username}</span>
            )}
          </div>
        </div>
      </div>

      {/* Stats cards — overlap */}
      <div className="infp-stats-wrap slide-up">
        <div className="infp-stats">
          <div className="infp-stat">
            <div className="infp-stat-icon" style={{ background: 'rgba(245,158,11,0.12)', color: 'var(--warning)' }}>
              <Star size={18} fill="var(--warning)" stroke="var(--warning)" />
            </div>
            <div className="infp-stat-value">{rating || '—'}</div>
            <div className="infp-stat-label">Reyting</div>
          </div>
          <div className="infp-stats-divider" />
          <div className="infp-stat">
            <div className="infp-stat-icon" style={{ background: 'rgba(16,185,129,0.12)', color: 'var(--secondary)' }}>
              <TrendingUp size={18} />
            </div>
            <div className="infp-stat-value">{influencer.completedCollabs || 0}</div>
            <div className="infp-stat-label">Hamkorlik</div>
          </div>
          <div className="infp-stats-divider" />
          <div className="infp-stat">
            <div className="infp-stat-icon" style={{ background: 'var(--primary-bg)', color: 'var(--primary)' }}>
              <Briefcase size={18} />
            </div>
            <div className="infp-stat-value">{influencer.reviews?.length || 0}</div>
            <div className="infp-stat-label">Sharh</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '0 16px 40px', maxWidth: 480, margin: '0 auto' }}>

        {/* Bio */}
        {influencer.bio && (
          <div className="infp-section fade-in">
            <div className="infp-section-header">
              <Quote size={14} />
              <span>Bio</span>
            </div>
            <p style={{ fontSize: 15, lineHeight: 1.75, color: 'var(--text-secondary)' }}>{influencer.bio}</p>
          </div>
        )}

        {/* Social links */}
        {Object.keys(socialLinks).length > 0 && (
          <div className="infp-section fade-in">
            <div className="infp-section-header">
              <Globe size={14} />
              <span>Ijtimoiy tarmoqlar</span>
            </div>
            <div className="infp-socials">
              {Object.entries(socialLinks).map(([platform, link]) => (
                <a
                  key={platform}
                  href={String(link).startsWith('http') ? link : '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="infp-social-item"
                >
                  <div className="infp-social-icon" style={{ background: getPlatformGradient(platform) }}>
                    {getPlatformIcon(platform)}
                  </div>
                  <div className="infp-social-info">
                    <span className="infp-social-name">{platform}</span>
                    <span className="infp-social-link">{link}</span>
                  </div>
                  <ExternalLink size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        {influencer.reviews?.length > 0 && (
          <div className="infp-section fade-in">
            <div className="infp-section-header">
              <Star size={14} />
              <span>Sharhlar ({influencer.reviews.length})</span>
            </div>
            <div className="infp-reviews">
              {influencer.reviews.map((r: any) => (
                <div key={r.id} className="infp-review">
                  <div className="infp-review-header">
                    <div className="infp-review-company">
                      <div className="infp-review-avatar">
                        {r.company?.name?.[0] || '?'}
                      </div>
                      <span>{r.company?.name}</span>
                    </div>
                    <div className="infp-review-stars">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          fill={i < r.rating ? 'var(--warning)' : 'none'}
                          stroke={i < r.rating ? 'var(--warning)' : 'var(--border-strong)'}
                        />
                      ))}
                    </div>
                  </div>
                  {r.comment && (
                    <p className="infp-review-text">{r.comment}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
