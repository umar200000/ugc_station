import { useNavigate } from 'react-router-dom';
import { Repeat2, DollarSign, Clock, Users, ChevronRight } from 'lucide-react';
import type { Ad } from '../types';

interface Props {
  ad: Ad;
  index?: number;
}

export default function AdCard({ ad }: Props) {
  const navigate = useNavigate();
  const isClosed = ad.status === 'CLOSED';
  const slotsLeft = ad.slotsLeft ?? (ad.influencerCount - (ad.acceptedCount || 0));

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return 'Hozirgina';
    if (hours < 24) return `${hours}s oldin`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}k oldin`;
    return `${Math.floor(days / 7)}h oldin`;
  };

  return (
    <div
      className="ad-card fade-in"
      onClick={() => navigate(`/ad/${ad.id}`)}
      style={{ opacity: isClosed ? 0.6 : 1 }}
    >
      <div className="ad-card-content" style={{ padding: 16 }}>
        {/* Top: Company avatar + name + time */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12, overflow: 'hidden', flexShrink: 0,
            background: 'var(--primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 700, color: 'var(--primary)',
          }}>
            {ad.company?.user?.photoUrl
              ? <img src={ad.company.user.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : ad.company?.name?.[0] || '?'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{ad.company?.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={11} /> {timeAgo(ad.createdAt)}
              {ad.industry && <><span style={{ margin: '0 4px' }}>·</span>{ad.industry}</>}
            </div>
          </div>
          {/* Payment badge */}
          <div style={{
            padding: '5px 10px', borderRadius: 100, fontSize: 12, fontWeight: 700,
            background: ad.adType === 'PAID' ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)',
            color: ad.adType === 'PAID' ? '#92400E' : '#065F46',
            display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0,
          }}>
            {ad.adType === 'PAID' ? <><DollarSign size={13} />{ad.payment?.toLocaleString()}</> : <><Repeat2 size={13} />Barter</>}
          </div>
        </div>

        {/* Title */}
        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 6, lineHeight: 1.3 }}>
          {ad.title}
        </h3>

        {/* Description */}
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 12 }}>
          {ad.description.length > 100 ? ad.description.slice(0, 100) + '...' : ad.description}
        </p>

        {/* Bottom: slots + arrow */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)' }}>
            <Users size={14} />
            <span>
              {isClosed ? (
                <span style={{ color: 'var(--danger)', fontWeight: 600 }}>Yopilgan</span>
              ) : (
                <><span style={{ fontWeight: 600, color: 'var(--primary)' }}>{ad.acceptedCount || 0}/{ad.influencerCount}</span> influenser</>
              )}
            </span>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            fontSize: 13, fontWeight: 600, color: 'var(--primary)',
          }}>
            Batafsil <ChevronRight size={16} />
          </div>
        </div>
      </div>
    </div>
  );
}
