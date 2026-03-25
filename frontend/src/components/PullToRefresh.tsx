import { useState, useRef, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';

interface Props {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

export default function PullToRefresh({ onRefresh, children }: Props) {
  const [pulling, setPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const isDragging = useRef(false);

  const THRESHOLD = 70;

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (window.scrollY > 5) return;
    startY.current = e.touches[0].clientY;
    isDragging.current = true;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current || refreshing) return;
    if (window.scrollY > 5) {
      isDragging.current = false;
      setPulling(false);
      setPullDistance(0);
      return;
    }

    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;

    if (diff > 0) {
      const distance = Math.min(diff * 0.5, 120);
      setPullDistance(distance);
      setPulling(true);
    }
  }, [refreshing]);

  const handleTouchEnd = useCallback(async () => {
    if (!isDragging.current) return;
    isDragging.current = false;

    if (pullDistance >= THRESHOLD && !refreshing) {
      setRefreshing(true);
      setPullDistance(THRESHOLD);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
        setPulling(false);
        setPullDistance(0);
      }
    } else {
      setPulling(false);
      setPullDistance(0);
    }
  }, [pullDistance, refreshing, onRefresh]);

  const progress = Math.min(pullDistance / THRESHOLD, 1);
  const rotation = pulling ? pullDistance * 3 : 0;

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Indicator */}
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        height: pulling || refreshing ? pullDistance : 0,
        overflow: 'hidden',
        transition: !pulling && !refreshing ? 'height 0.3s ease' : 'none',
      }}>
        <div style={{
          opacity: progress,
          transform: `rotate(${refreshing ? 0 : rotation}deg) scale(${0.5 + progress * 0.5})`,
          transition: refreshing ? 'none' : 'transform 0.1s ease',
          animation: refreshing ? 'spin 0.7s linear infinite' : 'none',
        }}>
          <RefreshCw
            size={22}
            style={{ color: pullDistance >= THRESHOLD ? 'var(--primary)' : 'var(--text-muted)' }}
          />
        </div>
      </div>

      {children}
    </div>
  );
}
