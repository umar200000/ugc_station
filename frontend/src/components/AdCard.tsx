import { useNavigate } from 'react-router-dom';
import { Repeat2 } from 'lucide-react';
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
      {/* Thumbnail */}
      <div className="ios-card-thumb">
        {hasImage ? (
          <img src={ad.images[0]} alt="" className="ios-card-img" />
        ) : (
          <div className="ios-card-no-img">
            {ad.adType === 'PAID' ? '💰' : <Repeat2 size={22} color="#fff" />}
          </div>
        )}
        {isClosed && <div className="ios-card-closed-overlay">Yopilgan</div>}
      </div>

      {/* Content */}
      <div className="ios-card-body">
        <div className="ios-card-brand">
          {ad.company?.user?.photoUrl ? (
            <img src={ad.company.user.photoUrl} alt="" className="ios-card-brand-avatar" />
          ) : (
            <div className="ios-card-brand-letter">{ad.company?.name?.[0] || '?'}</div>
          )}
          <span className="ios-card-brand-name">{ad.company?.name}</span>
        </div>
        <h3 className="ios-card-title">{ad.title}</h3>
        <div className="ios-card-bottom">
          <span className={`ios-card-price ${ad.adType === 'PAID' ? 'paid' : 'barter'}`}>
            {ad.adType === 'PAID'
              ? `${ad.payment?.toLocaleString()} so'm`
              : 'Barter'}
          </span>
          <span className="ios-card-slots">
            {ad.acceptedCount || 0}/{ad.influencerCount}
          </span>
        </div>
      </div>
    </div>
  );
}
