import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useNotifStore } from '../store/notifications';

export default function NotificationBell() {
  const { unreadCount, fetchUnreadCount } = useNotifStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <button onClick={() => navigate('/notifications')} style={{
      position: 'relative', border: 'none', cursor: 'pointer',
      width: 40, height: 40, borderRadius: 12,
      background: 'transparent',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'all 0.3s ease',
    }}>
      <Bell
        size={22}
        fill="#F97316"
        style={{
          color: '#F97316',
          transition: 'all 0.3s ease',
          animation: unreadCount > 0 ? 'bellShake 2s ease-in-out infinite' : 'none',
        }}
      />
      {unreadCount > 0 && (
        <span style={{
          position: 'absolute', top: 0, right: 0,
          width: 10, height: 10, borderRadius: '50%',
          background: '#EF4444',
          border: '2px solid var(--bg, #F8FAFC)',
          boxShadow: '0 0 6px rgba(239,68,68,0.5)',
          animation: 'bellPulse 2s ease-in-out infinite',
        }} />
      )}
    </button>
  );
}
