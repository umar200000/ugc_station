import { useNavigate } from 'react-router-dom';
import { Repeat2, DollarSign, XCircle } from 'lucide-react';
import type { Ad } from '../types';

interface Props {
  ad: Ad;
}

export default function AdCard({ ad }: Props) {
  const navigate = useNavigate();
  const slotsLeft = ad.slotsLeft ?? (ad.influencerCount - (ad.acceptedCount || 0));
  const progress = ad.influencerCount > 0 ? ((ad.acceptedCount || 0) / ad.influencerCount) * 100 : 0;
  const isClosed = ad.status === 'CLOSED';

  return (
    <div className="card card-interactive fade-in" onClick={() => navigate(`/ad/${ad.id}`)}
      style={{ opacity: isClosed ? 0.6 : 1, position: 'relative' }}>

      {isClosed && (
        <div style={{
          position: 'absolute', top: 12, right: 12, zIndex: 2,
          display: 'flex', alignItems: 'center', gap: 4,
          padding: '4px 10px', borderRadius: 'var(--radius-xs)',
          background: 'var(--danger-bg)', color: 'var(--danger)',
          fontSize: 11, fontWeight: 600,
        }}>
          <XCircle size={12} /> Yopilgan
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flex: 1, minWidth: 0 }}>
          <div className="avatar avatar-sm" style={{
            background: ad.adType === 'PAID' ? 'var(--warning-bg)' : 'var(--secondary-bg)',
            color: ad.adType === 'PAID' ? 'var(--warning-text)' : 'var(--secondary)'
          }}>
            {ad.adType === 'PAID' ? <DollarSign size={18} /> : <Repeat2 size={18} />}
          </div>
          <div style={{ minWidth: 0 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ad.title}</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 1 }}>{ad.company?.name}</p>
          </div>
        </div>
        {!isClosed && (
          <span className={`badge badge-${ad.adType.toLowerCase()}`} style={{ flexShrink: 0, marginLeft: 8 }}>
            {ad.adType === 'BARTER' ? 'Barter' : `${ad.payment?.toLocaleString()} so'm`}
          </span>
        )}
      </div>

      <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 12 }}>
        {ad.description.length > 100 ? ad.description.slice(0, 100) + '...' : ad.description}
      </p>

      {ad.images?.length > 0 && (
        <div style={{ borderRadius: 'var(--radius-sm)', overflow: 'hidden', marginBottom: 12, filter: isClosed ? 'grayscale(0.5)' : 'none' }}>
          <img src={ad.images[0]} alt="" style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }} />
        </div>
      )}

      {ad.platforms?.length > 0 && (
        <div className="tag-list" style={{ marginBottom: 12 }}>
          {ad.platforms.map((p) => <span key={p} className="tag">{p}</span>)}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div className="slot-progress" style={{ flex: 1 }}>
          <div className="slot-progress-fill" style={{ width: `${Math.min(progress, 100)}%` }} />
        </div>
        <span style={{ fontSize: 12, fontWeight: 600, color: isClosed ? 'var(--danger)' : slotsLeft > 0 ? 'var(--primary)' : 'var(--danger)', whiteSpace: 'nowrap' }}>
          {isClosed ? 'Yopilgan' : slotsLeft > 0 ? `${slotsLeft} joy` : "To'lgan"}
        </span>
      </div>
    </div>
  );
}
