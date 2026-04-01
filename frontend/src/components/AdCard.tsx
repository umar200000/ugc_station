import { useNavigate } from 'react-router-dom';
import { Users, Repeat2 } from 'lucide-react';
import type { Ad } from '../types';

interface Props {
  ad: Ad;
  index?: number;
}

export default function AdCard({ ad, index = 0 }: Props) {
  const navigate = useNavigate();
  const isClosed = ad.status === 'CLOSED';
  const hasAvatar = !!ad.company?.user?.photoUrl;

  return (
    <div
      className="ios-card"
      onClick={() => navigate(`/ad/${ad.id}`)}
      style={{ opacity: isClosed ? 0.6 : 1 }}
    >
      {/* Image area */}
      <div className="ios-card-thumb">
        {/* Company avatar top-left */}
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
        <p className="ios-card-title">{ad.title}</p>
        <span className={`ios-card-price ${ad.adType === 'PAID' ? 'paid' : 'barter'}`}>
          {ad.adType === 'PAID'
            ? `${ad.payment?.toLocaleString()} so'm`
            : 'Barter'}
        </span>
      </div>
    </div>
  );
}
