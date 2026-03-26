import { useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Maximize } from 'lucide-react';

export default function VideoPlayer() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const url = params.get('url') || '';
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFullscreen = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.requestFullscreen) v.requestFullscreen();
    else if ((v as any).webkitEnterFullscreen) (v as any).webkitEnterFullscreen();
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#000',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Top bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
        display: 'flex', justifyContent: 'space-between', padding: 16,
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)',
            border: 'none', borderRadius: 12, padding: '10px 16px',
            color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          <ArrowLeft size={18} /> Orqaga
        </button>
        <button
          onClick={handleFullscreen}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)',
            border: 'none', borderRadius: 12, padding: '10px 16px',
            color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          <Maximize size={18} />
        </button>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <video
          ref={videoRef}
          src={url}
          controls
          autoPlay
          playsInline
          style={{ width: '100%', maxHeight: '100vh' }}
        />
      </div>
    </div>
  );
}
