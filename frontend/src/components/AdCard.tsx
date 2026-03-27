import { useNavigate } from 'react-router-dom';
import { XCircle, Users, Eye, Zap, Clock, Repeat2 } from 'lucide-react';
import type { Ad } from '../types';

interface Props {
  ad: Ad;
  index?: number;
}

export default function AdCard({ ad, index = 0 }: Props) {
  const navigate = useNavigate();
  const slotsLeft = ad.slotsLeft ?? (ad.influencerCount - (ad.acceptedCount || 0));
  const progress = ad.influencerCount > 0 ? ((ad.acceptedCount || 0) / ad.influencerCount) * 100 : 0;
  const isClosed = ad.status === 'CLOSED';
  const hasImage = ad.images?.length > 0;
  const isUrgent = slotsLeft <= 2 && slotsLeft > 0 && !isClosed;

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
    <div
      className="ad-card fade-in"
      onClick={() => navigate(`/ad/${ad.id}`)}
      style={{ opacity: isClosed ? 0.65 : 1 }}
    >
      {/* Image Section */}
      {hasImage ? (
        <div className="ad-card-image-wrap">
          <img src={ad.images[0]} alt="" className="ad-card-image" style={{ filter: isClosed ? 'grayscale(0.5)' : 'none' }} />
          <div className="ad-card-image-overlay" />

          {/* Top badges on image */}
          <div className="ad-card-image-badges">
            {isClosed ? (
              <span className="ad-card-badge ad-card-badge--closed">
                <XCircle size={12} /> Yopilgan
              </span>
            ) : isUrgent ? (
              <span className="ad-card-badge ad-card-badge--urgent">
                <Zap size={12} /> {slotsLeft} joy qoldi
              </span>
            ) : null}
          </div>

          {/* Payment badge */}
          {!isClosed && (
            <div className="ad-card-payment-badge">
              {ad.adType === 'PAID' ? (
                <span className="ad-card-badge ad-card-badge--paid">
                  {ad.payment?.toLocaleString()} so'm
                </span>
              ) : (
                <span className="ad-card-badge ad-card-badge--barter">
                  <Repeat2 size={13} /> Barter
                </span>
              )}
            </div>
          )}

          {/* Image count indicator */}
          {ad.images.length > 1 && (
            <div className="ad-card-img-count">
              <Eye size={11} /> {ad.images.length}
            </div>
          )}
        </div>
      ) : (
        /* No image - colorful header */
        <div className="ad-card-no-image" style={{
          background: ad.adType === 'PAID'
            ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
            : 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
        }}>
          <div className="ad-card-no-image-icon">
            {ad.adType === 'PAID' ? <span style={{ fontSize: 28 }}>💰</span> : <Repeat2 size={28} />}
          </div>
          <span className="ad-card-no-image-label">
            {ad.adType === 'PAID' ? `${ad.payment?.toLocaleString()} so'm` : 'Barter'}
          </span>
          {isClosed && (
            <div className="ad-card-image-badges">
              <span className="ad-card-badge ad-card-badge--closed">
                <XCircle size={12} /> Yopilgan
              </span>
            </div>
          )}
        </div>
      )}

      {/* Content Section */}
      <div className="ad-card-content">
        {/* Company row */}
        <div className="ad-card-company">
          <div className="ad-card-company-avatar">
            {ad.company?.user?.photoUrl
              ? <img src={ad.company.user.photoUrl} alt="" />
              : ad.company?.name?.[0] || '?'}
          </div>
          <div className="ad-card-company-info">
            <span className="ad-card-company-name">{ad.company?.name}</span>
            <span className="ad-card-time">
              <Clock size={11} /> {timeAgo(ad.createdAt)}
            </span>
          </div>
        </div>

        {/* Title & description */}
        <h3 className="ad-card-title">{ad.title}</h3>
        <p className="ad-card-desc">
          {ad.description.length > 120 ? ad.description.slice(0, 120) + '...' : ad.description}
        </p>

        {/* Tags row */}
        <div className="ad-card-tags">
          {ad.industry && <span className="ad-card-tag ad-card-tag--industry">{ad.industry}</span>}
          {ad.platforms?.slice(0, 3).map((p) => (
            <span key={p} className="ad-card-tag">{p}</span>
          ))}
          {ad.platforms?.length > 3 && (
            <span className="ad-card-tag ad-card-tag--more">+{ad.platforms.length - 3}</span>
          )}
        </div>

        {/* Bottom: slots progress */}
        <div className="ad-card-footer">
          <div className="ad-card-slots">
            <Users size={14} />
            <div className="ad-card-slots-bar">
              <div
                className="ad-card-slots-fill"
                style={{
                  width: `${Math.min(progress, 100)}%`,
                  background: isClosed
                    ? 'var(--danger)'
                    : progress >= 80
                    ? 'var(--warning)'
                    : 'linear-gradient(90deg, var(--primary), var(--primary-light))',
                }}
              />
            </div>
            <span className="ad-card-slots-text" style={{
              color: isClosed ? 'var(--danger)' : slotsLeft > 0 ? 'var(--primary)' : 'var(--danger)',
            }}>
              {isClosed ? 'Yopilgan' : slotsLeft > 0 ? `${ad.acceptedCount || 0}/${ad.influencerCount}` : "To'lgan"}
            </span>
          </div>
          <div className="ad-card-cta">
            Ko'rish
          </div>
        </div>
      </div>
    </div>
  );
}
