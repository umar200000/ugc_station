import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function VideoPlayer() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const url = params.get('url') || '';

  return (
    <div style={{
      minHeight: '100vh', background: '#000',
      display: 'flex', flexDirection: 'column',
    }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          position: 'absolute', top: 16, left: 16, zIndex: 10,
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)',
          border: 'none', borderRadius: 12, padding: '10px 16px',
          color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        <ArrowLeft size={18} /> Orqaga
      </button>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <video
          src={url}
          controls
          playsInline
          webkit-playsinline="true"
          style={{ width: '100%', maxHeight: '100vh' }}
        />
      </div>
    </div>
  );
}
