import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ImageViewer() {
  const navigate = useNavigate();
  const location = useLocation();
  const { images, startIndex } = (location.state || { images: [], startIndex: 0 }) as {
    images: string[];
    startIndex: number;
  };

  const [current, setCurrent] = useState(startIndex || 0);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    if (!images || images.length === 0) {
      navigate(-1);
    }
  }, [images, navigate]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'Escape') navigate(-1);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [current]);

  if (!images || images.length === 0) return null;

  const goNext = () => setCurrent((p) => Math.min(p + 1, images.length - 1));
  const goPrev = () => setCurrent((p) => Math.max(p - 1, 0));

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext();
      else goPrev();
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: '#000', display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px', position: 'relative', zIndex: 10,
      }}>
        <button onClick={() => navigate(-1)} style={{
          width: 40, height: 40, borderRadius: '50%',
          background: 'rgba(255,255,255,0.15)',
          border: 'none', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
        }}>
          <ArrowLeft size={20} />
        </button>
        <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 15, fontWeight: 600 }}>
          {current + 1} / {images.length}
        </span>
        <div style={{ width: 40 }} />
      </div>

      {/* Image area */}
      <div
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden', position: 'relative',
        }}
      >
        <img
          key={current}
          src={images[current]}
          alt=""
          style={{
            maxWidth: '100%', maxHeight: '100%', objectFit: 'contain',
            animation: 'fadeIn 0.2s ease',
          }}
        />

        {/* Desktop arrows */}
        {current > 0 && (
          <button onClick={goPrev} style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            width: 44, height: 44, borderRadius: '50%',
            background: 'rgba(255,255,255,0.15)', border: 'none',
            color: '#fff', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          }}>
            <ChevronLeft size={24} />
          </button>
        )}
        {current < images.length - 1 && (
          <button onClick={goNext} style={{
            position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
            width: 44, height: 44, borderRadius: '50%',
            background: 'rgba(255,255,255,0.15)', border: 'none',
            color: '#fff', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          }}>
            <ChevronRight size={24} />
          </button>
        )}
      </div>

      {/* Dots */}
      {images.length > 1 && (
        <div style={{
          display: 'flex', justifyContent: 'center', gap: 6,
          padding: '16px 0 24px',
        }}>
          {images.map((_: string, i: number) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              style={{
                width: current === i ? 20 : 8, height: 8,
                borderRadius: 100, border: 'none',
                background: current === i ? '#fff' : 'rgba(255,255,255,0.35)',
                transition: 'all 0.3s ease',
                cursor: 'pointer', padding: 0,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
