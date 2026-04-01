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
  const hasImage = ad.images?.length > 0;

  return (
    <div
      className="ios-card"
      onClick={() => navigate(`/ad/${ad.id}`)}
      style={{ opacity: isClosed ? 0.6 : 1 }}
    >
      {/* Image */}
      <div className="ios-card-thumb">
        {hasImage ? (
          <img src={ad.images[0]} alt="" className="ios-card-img" />
        ) : (
          <div className="ios-card-no-img">
            {ad.adType === 'PAID' ? '💰' : <Repeat2 size={24} color="#fff" />}
          </div>
        )}
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
