import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import type { Ad } from '../types';

interface Props {
  ad: Ad;
  index?: number;
}

export default function AdCard({ ad }: Props) {
  const navigate = useNavigate();
  const isClosed = ad.status === 'CLOSED';

  return (
    <div
      className="ad-card fade-in"
      onClick={() => navigate(`/ad/${ad.id}`)}
      style={{ opacity: isClosed ? 0.6 : 1 }}
    >
      <div style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Logo */}
        <div style={{
          width: 44, height: 44, borderRadius: 12, overflow: 'hidden', flexShrink: 0,
          background: 'var(--primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, fontWeight: 700, color: 'var(--primary)',
        }}>
          {ad.company?.user?.photoUrl
            ? <img src={ad.company.user.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : ad.company?.name?.[0] || '?'}
        </div>

        {/* Name + title */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>{ad.company?.name}</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {ad.title}
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: ad.adType === 'PAID' ? '#92400E' : '#065F46', marginTop: 4 }}>
            {ad.adType === 'PAID' ? `${ad.payment?.toLocaleString()} so'm` : 'Barter'}
          </div>
        </div>

        {/* Arrow */}
        <ChevronRight size={20} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
      </div>
    </div>
  );
}
