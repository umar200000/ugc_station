import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, ExternalLink, Award, TrendingUp, MessageCircle, Globe, Hash, Briefcase, Quote, Send } from 'lucide-react';
import api from '../lib/api';
import { getSocialUrl } from '../lib/social';
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
  if (!influencer) return <div style={{ minHeight: '100vh', background: '#F2F2F7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ textAlign: 'center', color: '#8E8E93', fontSize: 15 }}><p>Influenser topilmadi</p></div></div>;

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
    return 'linear-gradient(135deg, #1B3B51, #2A5570)';
  };

  const rating = influencer.avgRating ? Number(influencer.avgRating).toFixed(1) : null;

  return (
    <div style={{ minHeight: '100vh', background: '#F2F2F7' }}>

      {/* Hero banner */}
      <div style={{
        position: 'relative',
        padding: '56px 20px 40px',
        background: '#fff',
        textAlign: 'center' as const,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}>

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          style={{
            position: 'absolute',
            top: 16,
            left: 16,
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: '#fff',
            border: '1px solid #E5E5EA',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
            color: '#1B3B51',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          }}
        >
          <ArrowLeft size={20} />
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          {/* Avatar */}
          <div style={{ position: 'relative', marginBottom: 4 }}>
            <div style={{
              width: 88,
              height: 88,
              borderRadius: '50%',
              border: '3px solid #E5E5EA',
              overflow: 'hidden',
              background: '#F2F2F7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 32,
              fontWeight: 700,
              color: '#1B3B51',
            }}>
              {influencer.user?.photoUrl
                ? <img src={influencer.user.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span>{influencer.name?.[0] || '?'}</span>}
            </div>
            {rating && Number(rating) >= 4.5 && (
              <div style={{
                position: 'absolute',
                bottom: 0,
                right: -2,
                width: 26,
                height: 26,
                borderRadius: '50%',
                background: '#fff',
                border: '2px solid #E5E5EA',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#1B3B51',
              }}>
                <Award size={14} />
              </div>
            )}
          </div>

          <h1 style={{
            fontSize: 22,
            fontWeight: 700,
            color: '#1B3B51',
            margin: 0,
            letterSpacing: -0.3,
          }}>{influencer.name}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            <span style={{
              display: 'inline-block',
              padding: '4px 12px',
              borderRadius: 20,
              background: 'rgba(27,59,81,0.08)',
              color: '#1B3B51',
              fontSize: 13,
              fontWeight: 600,
            }}>{influencer.category}</span>
            {influencer.user?.username && (
              <span style={{ fontSize: 14, color: '#8E8E93' }}>@{influencer.user.username}</span>
            )}
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div style={{ padding: '0 16px', maxWidth: 480, margin: '-20px auto 0' }}>
        <div style={{
          display: 'flex',
          background: '#fff',
          border: '1px solid #E5E5EA',
          borderRadius: 16,
          padding: '16px 0',
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        }}>
          <div style={{ flex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'rgba(245,158,11,0.12)',
              color: '#F59E0B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Star size={18} fill="#F59E0B" stroke="#F59E0B" />
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#1B3B51' }}>{rating || '—'}</div>
            <div style={{ fontSize: 12, color: '#8E8E93', fontWeight: 500 }}>Reyting</div>
          </div>
          <div style={{ width: 1, background: '#E5E5EA', margin: '8px 0' }} />
          <div style={{ flex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'rgba(16,185,129,0.12)',
              color: '#10B981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <TrendingUp size={18} />
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#1B3B51' }}>{influencer.completedCollabs || 0}</div>
            <div style={{ fontSize: 12, color: '#8E8E93', fontWeight: 500 }}>Hamkorlik</div>
          </div>
          <div style={{ width: 1, background: '#E5E5EA', margin: '8px 0' }} />
          <div style={{ flex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'rgba(27,59,81,0.08)',
              color: '#1B3B51',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Briefcase size={18} />
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#1B3B51' }}>{influencer.reviews?.length || 0}</div>
            <div style={{ fontSize: 12, color: '#8E8E93', fontWeight: 500 }}>Sharh</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '20px 16px 40px', maxWidth: 480, margin: '0 auto' }}>

        {/* Bio */}
        {influencer.bio && (
          <div style={{ marginBottom: 20 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 12,
              fontSize: 14,
              fontWeight: 600,
              color: '#1B3B51',
            }}>
              <div style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: 'rgba(27,59,81,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#1B3B51',
              }}>
                <Quote size={14} />
              </div>
              <span>Bio</span>
            </div>
            <p style={{ fontSize: 15, lineHeight: 1.75, color: '#8E8E93', margin: 0 }}>{influencer.bio}</p>
          </div>
        )}

        {/* Social links */}
        {Object.keys(socialLinks).length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 12,
              fontSize: 14,
              fontWeight: 600,
              color: '#1B3B51',
            }}>
              <div style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: 'rgba(27,59,81,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#1B3B51',
              }}>
                <Globe size={14} />
              </div>
              <span>Ijtimoiy tarmoqlar</span>
            </div>
            <div style={{
              background: '#fff',
              borderRadius: 12,
              border: '1px solid #E5E5EA',
              overflow: 'hidden',
            }}>
              {Object.entries(socialLinks).map(([platform, link], idx) => (
                <a
                  key={platform}
                  href={getSocialUrl(platform, link)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 14px',
                    textDecoration: 'none',
                    color: 'inherit',
                    borderBottom: idx < Object.entries(socialLinks).length - 1 ? '1px solid #E5E5EA' : 'none',
                  }}
                >
                  <div style={{
                    width: 34,
                    height: 34,
                    borderRadius: 8,
                    background: getPlatformGradient(platform),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    flexShrink: 0,
                  }}>
                    {getPlatformIcon(platform)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#1B3B51' }}>{platform}</div>
                    <div style={{ fontSize: 13, color: '#8E8E93', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{link}</div>
                  </div>
                  <ExternalLink size={15} style={{ color: '#8E8E93', flexShrink: 0 }} />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        {influencer.reviews?.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 12,
              fontSize: 14,
              fontWeight: 600,
              color: '#1B3B51',
            }}>
              <div style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: 'rgba(27,59,81,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#1B3B51',
              }}>
                <Star size={14} />
              </div>
              <span>Sharhlar ({influencer.reviews.length})</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {influencer.reviews.map((r: any) => (
                <div key={r.id} style={{
                  background: '#fff',
                  borderRadius: 12,
                  border: '1px solid #E5E5EA',
                  padding: 14,
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: r.comment ? 10 : 0,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: 'rgba(27,59,81,0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 13,
                        fontWeight: 700,
                        color: '#1B3B51',
                      }}>
                        {r.company?.name?.[0] || '?'}
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#1B3B51' }}>{r.company?.name}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 2 }}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          fill={i < r.rating ? '#F59E0B' : 'none'}
                          stroke={i < r.rating ? '#F59E0B' : '#E5E5EA'}
                        />
                      ))}
                    </div>
                  </div>
                  {r.comment && (
                    <p style={{ fontSize: 14, lineHeight: 1.6, color: '#8E8E93', margin: 0 }}>{r.comment}</p>
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
