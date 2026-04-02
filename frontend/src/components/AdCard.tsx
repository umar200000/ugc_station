import { useNavigate } from 'react-router-dom';
import { Users, Repeat2 } from 'lucide-react';
import type { Ad } from '../types';
import { useAuthStore } from '../store/auth';
import { useCacheStore } from '../store/cache';

interface Props {
  ad: Ad;
  index?: number;
}

function fmtPrice(n: number) {
  return n.toLocaleString('uz-UZ').replace(/,/g, ' ');
}

export default function AdCard({ ad, index = 0 }: Props) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const getLevelPrice = useCacheStore(s => s.getLevelPrice);
  const isClosed = ad.status === 'CLOSED';
  const hasAvatar = !!ad.company?.user?.photoUrl;

  const level = user?.influencer?.level ?? 1;
  const price = getLevelPrice(level);

  return (
    <div
      className="ios-card"
      onClick={() => navigate(`/ad/${ad.id}`)}
      style={{ opacity: isClosed ? 0.6 : 1 }}
    >
      {/* Image area */}
      <div className="ios-card-thumb">
        <div className="ios-card-avatar">
          {hasAvatar ? (
            <img src={ad.company!.user!.photoUrl} alt="" />
          ) : (
            <span>{ad.company?.name?.[0] || '?'}</span>
          )}
        </div>

        {isClosed && <div className="ios-card-closed-overlay">Yopilgan</div>}

        <div className="ios-card-people">
          <Users size={12} />
          <span>{ad.acceptedCount || 0}/{ad.influencerCount}</span>
        </div>
      </div>

      {/* Content */}
      <div className="ios-card-body">
        <p className="ios-card-title" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ad.title}</p>
        {user?.role === 'INFLUENCER' && (
          ad.adType === 'BARTER' ? (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 3,
              fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6,
              background: 'rgba(16,185,129,0.1)', color: '#10B981',
            }}>
              <Repeat2 size={11} /> Barter
            </span>
          ) : (
            <span className="ios-card-price paid">
              {fmtPrice(price)} so'm
            </span>
          )
        )}
      </div>
    </div>
  );
}
